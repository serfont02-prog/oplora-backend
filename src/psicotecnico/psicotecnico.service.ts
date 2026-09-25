import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { PsicotecnicoConfigOposicion } from './psicotecnico-config-oposicion.entity';
import { PreguntaPsicotecnica } from './pregunta-psicotecnica.entity';
import { ResultadoPsicotecnico } from './resultado-psicotecnico.entity';
import { UsuarioOposicion } from '../usuario/usuario-oposicion.entity';
import {
  PsicotecnicoTipo,
  PsicotecnicoDificultad,
  PSICOTECNICO_TIPO_META,
  SUBTIPOS_SUGERIDOS,
  DIFICULTADES_DEFECTO,
} from './psicotecnico-tipo.enum';

@Injectable()
export class PsicotecnicoService {
  constructor(
    @InjectRepository(PsicotecnicoConfigOposicion)
    private readonly configRepo: Repository<PsicotecnicoConfigOposicion>,
    @InjectRepository(PreguntaPsicotecnica)
    private readonly preguntaRepo: Repository<PreguntaPsicotecnica>,
    @InjectRepository(ResultadoPsicotecnico)
    private readonly resultadoRepo: Repository<ResultadoPsicotecnico>,
    @InjectRepository(UsuarioOposicion)
    private readonly usuarioOposicionRepo: Repository<UsuarioOposicion>,
  ) {}

  /* =========================================================
     CATÁLOGO
  ========================================================= */

  getCatalogo() {
    return Object.values(PsicotecnicoTipo).map((tipo) => ({
      tipo,
      ...PSICOTECNICO_TIPO_META[tipo],
      subtiposSugeridos: SUBTIPOS_SUGERIDOS[tipo],
    }));
  }

  /* =========================================================
     CONFIGURACIÓN — resolución oposición vs convocatoria
  ========================================================= */

  // Config efectiva: se parte de la config "por defecto" de la oposición
  // (convocatoria = null) y, tipo por tipo, se sustituye por la fila propia
  // de esa convocatoria si existe. NO es un reemplazo total: activar/desactivar
  // un tipo a nivel de convocatoria no debe tapar los demás tipos que sigan
  // viniendo del nivel oposición.
  private async getConfigEfectiva(oposicionId: string, convocatoriaId?: string | null) {
    const porDefecto = await this.configRepo.find({
      where: { oposicion: { id: oposicionId } as any, convocatoria: IsNull() },
    });

    if (!convocatoriaId) return porDefecto;

    const propias = await this.configRepo.find({
      where: { oposicion: { id: oposicionId } as any, convocatoria: { id: convocatoriaId } as any },
    });

    const mapa = new Map(porDefecto.map((c) => [c.tipo, c]));
    for (const propia of propias) mapa.set(propia.tipo, propia); // override solo de ese tipo
    return Array.from(mapa.values());
  }

  // Resuelve la convocatoria a usar cuando el caller no la pasa explícitamente:
  // la convocatoria activa del usuario en esa oposición.
  private async resolverConvocatoria(usuarioId: string, oposicionId: string, convocatoriaId?: string | null) {
    if (convocatoriaId) return convocatoriaId;
    const uo = await this.usuarioOposicionRepo.findOne({
      where: { usuario: { id: usuarioId } as any, oposicion: { id: oposicionId } as any },
      relations: ['convocatoriaActiva'],
    });
    return uo?.convocatoriaActiva?.id;
  }

  async getConfigParaUsuario(usuarioId: string, oposicionId: string, convocatoriaId?: string) {
    const convocatoriaResuelta = await this.resolverConvocatoria(usuarioId, oposicionId, convocatoriaId);

    const config = (await this.getConfigEfectiva(oposicionId, convocatoriaResuelta)).filter((c) => c.habilitado);

    if (config.length === 0) return [];

    const stats = await this.getEstadisticasPorTipo(usuarioId, oposicionId);

    return config.map((c) => ({
      tipo: c.tipo,
      ...PSICOTECNICO_TIPO_META[c.tipo],
      oficial: c.oficial,
      subtiposHabilitados: c.subtiposHabilitados,
      dificultadesDisponibles: c.dificultadesDisponibles,
      estadisticas: stats[c.tipo] ?? { realizadas: 0, aciertos: 0, porcentajeMedio: 0, mejorPorcentaje: 0 },
    }));
  }

  // Config administrable de una oposición: todas las filas (habilitadas o no),
  // agrupadas por convocatoria (null = config por defecto de la oposición).
  async getConfigAdmin(oposicionId: string) {
    const filas = await this.configRepo.find({
      where: { oposicion: { id: oposicionId } as any },
      relations: ['convocatoria'],
      order: { tipo: 'ASC' },
    });
    return filas;
  }

  async upsertConfig(datos: {
    oposicionId: string;
    convocatoriaId?: string | null;
    tipo: PsicotecnicoTipo;
    habilitado: boolean;
    oficial?: boolean;
    subtiposHabilitados?: string[] | null;
    dificultadesDisponibles?: PsicotecnicoDificultad[];
  }) {
    const { oposicionId, convocatoriaId, tipo } = datos;

    const existente = await this.configRepo.findOne({
      where: {
        oposicion: { id: oposicionId } as any,
        convocatoria: convocatoriaId ? ({ id: convocatoriaId } as any) : IsNull(),
        tipo,
      },
    });

    const payload = {
      habilitado: datos.habilitado,
      oficial: datos.oficial ?? existente?.oficial ?? false,
      subtiposHabilitados: datos.subtiposHabilitados ?? existente?.subtiposHabilitados ?? null,
      dificultadesDisponibles: datos.dificultadesDisponibles ?? existente?.dificultadesDisponibles ?? DIFICULTADES_DEFECTO,
    };

    if (existente) {
      await this.configRepo.update(existente.id, payload);
      return this.configRepo.findOne({ where: { id: existente.id } });
    }

    return this.configRepo.save(
      this.configRepo.create({
        tipo,
        oposicion: { id: oposicionId } as any,
        convocatoria: convocatoriaId ? ({ id: convocatoriaId } as any) : null,
        ...payload,
      }),
    );
  }

  async eliminarConfig(id: string) {
    await this.configRepo.delete(id);
    return { ok: true };
  }

  /* =========================================================
     GENERAR PREGUNTAS
  ========================================================= */

  async generarPreguntas(datos: {
    usuarioId: string;
    oposicionId: string;
    convocatoriaId?: string;
    tipo: PsicotecnicoTipo;
    subtipo?: string;
    dificultad?: PsicotecnicoDificultad;
    numPreguntas?: number;
  }) {
    const numPreguntas = Math.min(Math.max(datos.numPreguntas ?? 10, 1), 50);
    const convocatoriaResuelta = await this.resolverConvocatoria(datos.usuarioId, datos.oposicionId, datos.convocatoriaId);

    const qb = this.preguntaRepo
      .createQueryBuilder('p')
      .where('p.activa = true')
      .andWhere('(p.oposicionId IS NULL OR p.oposicionId = :oposicionId)', { oposicionId: datos.oposicionId })
      // Sin convocatorias vinculadas = aplica a todas las de la oposición.
      // Si tiene, solo cuenta si es precisamente la convocatoria del usuario.
      // (EXISTS/NOT EXISTS en vez de JOIN para no duplicar filas por pregunta.)
      .andWhere(
        convocatoriaResuelta
          ? `(
              NOT EXISTS (SELECT 1 FROM preguntas_psicotecnicas_convocatorias ppc WHERE ppc."preguntaId" = p.id)
              OR EXISTS (SELECT 1 FROM preguntas_psicotecnicas_convocatorias ppc2 WHERE ppc2."preguntaId" = p.id AND ppc2."convocatoriaId" = :convocatoriaId)
            )`
          : `NOT EXISTS (SELECT 1 FROM preguntas_psicotecnicas_convocatorias ppc WHERE ppc."preguntaId" = p.id)`,
        convocatoriaResuelta ? { convocatoriaId: convocatoriaResuelta } : {},
      );

    // "Mixto" no es un banco propio: mezcla preguntas de todos los tipos que
    // estén ACTIVADOS ahora mismo para esta oposición/convocatoria (no de todos
    // los tipos del catálogo). Si el propio "mixto" tuviera preguntas propias
    // subidas directamente, también entrarían.
    if (datos.tipo === PsicotecnicoTipo.MIXTO) {
      const configEfectiva = await this.getConfigEfectiva(datos.oposicionId, convocatoriaResuelta);
      const tiposHabilitados = configEfectiva
        .filter((c) => c.habilitado && c.tipo !== PsicotecnicoTipo.MIXTO)
        .map((c) => c.tipo);

      if (tiposHabilitados.length === 0) {
        throw new BadRequestException('Activa al menos una modalidad para poder generar un mixto.');
      }
      qb.andWhere('p.tipo IN (:...tiposHabilitados)', { tiposHabilitados });
    } else {
      qb.andWhere('p.tipo = :tipo', { tipo: datos.tipo });
    }

    if (datos.subtipo) qb.andWhere('p.subtipo = :subtipo', { subtipo: datos.subtipo });
    if (datos.dificultad) qb.andWhere('p.dificultad = :dificultad', { dificultad: datos.dificultad });

    const preguntas = await qb.orderBy('RANDOM()').take(numPreguntas).getMany();

    if (preguntas.length === 0) {
      throw new BadRequestException('No hay preguntas disponibles para esta modalidad todavía.');
    }

    // No se envía `correcta` al cliente: se corrige en el servidor al guardar el resultado.
    return preguntas.map(({ correcta, ...resto }) => resto);
  }

  /* =========================================================
     CORREGIR Y GUARDAR RESULTADO
  ========================================================= */

  async guardarResultado(datos: {
    usuarioId: string;
    oposicionId?: string;
    tipo: PsicotecnicoTipo;
    subtipo?: string;
    dificultad?: PsicotecnicoDificultad;
    respuestas: { preguntaId: string; respuesta: number | null; tiempoMs?: number }[];
    tiempoSegundos?: number;
  }) {
    const ids = datos.respuestas.map((r) => r.preguntaId);
    const preguntas = await this.preguntaRepo.find({ where: { id: In(ids) } });
    const mapaPreguntas = new Map(preguntas.map((p) => [p.id, p]));

    let correctas = 0;
    const detallePreguntas = datos.respuestas.map((r) => {
      const pregunta = mapaPreguntas.get(r.preguntaId);
      const esCorrecta = !!pregunta && r.respuesta !== null && r.respuesta === pregunta.correcta;
      if (esCorrecta) correctas++;

      if (pregunta) {
        this.preguntaRepo.increment({ id: pregunta.id }, esCorrecta ? 'aciertos' : 'fallos', 1);
        this.preguntaRepo.increment({ id: pregunta.id }, 'vecesUsada', 1);
      }

      return { preguntaId: r.preguntaId, correcta: esCorrecta, tiempoMs: r.tiempoMs };
    });

    const totalPreguntas = datos.respuestas.length;
    const porcentaje = totalPreguntas > 0 ? Math.round((correctas / totalPreguntas) * 100) : 0;

    const resultado = await this.resultadoRepo.save(
      this.resultadoRepo.create({
        tipo: datos.tipo,
        subtipo: datos.subtipo,
        dificultad: datos.dificultad,
        totalPreguntas,
        correctas,
        porcentaje,
        tiempoSegundos: datos.tiempoSegundos ?? 0,
        detallePreguntas,
        usuario: { id: datos.usuarioId } as any,
        oposicion: datos.oposicionId ? ({ id: datos.oposicionId } as any) : null,
      }),
    );

    const mejorAnterior = await this.resultadoRepo.findOne({
      where: { usuario: { id: datos.usuarioId } as any, tipo: datos.tipo },
      order: { porcentaje: 'DESC' },
    });
    const esMejorMarca = !mejorAnterior || porcentaje >= mejorAnterior.porcentaje;

    return { resultado, correctas, totalPreguntas, porcentaje, esMejorMarca };
  }

  /* =========================================================
     ESTADÍSTICAS
  ========================================================= */

  async getEstadisticasPorTipo(usuarioId: string, oposicionId?: string) {
    const qb = this.resultadoRepo
      .createQueryBuilder('r')
      .select('r.tipo', 'tipo')
      .addSelect('COUNT(*)', 'realizadas')
      .addSelect('SUM(r.correctas)', 'aciertos')
      .addSelect('SUM(r.totalPreguntas)', 'totalPreguntas')
      .addSelect('MAX(r.porcentaje)', 'mejorPorcentaje')
      .addSelect('AVG(r.porcentaje)', 'porcentajeMedio')
      .where('r.usuarioId = :usuarioId', { usuarioId })
      .groupBy('r.tipo');

    if (oposicionId) qb.andWhere('r.oposicionId = :oposicionId', { oposicionId });

    const filas = await qb.getRawMany();

    const resultado: Record<string, any> = {};
    for (const f of filas) {
      resultado[f.tipo] = {
        realizadas: Number(f.realizadas),
        aciertos: Number(f.aciertos),
        totalPreguntas: Number(f.totalPreguntas),
        mejorPorcentaje: Math.round(Number(f.mejorPorcentaje)),
        porcentajeMedio: Math.round(Number(f.porcentajeMedio)),
      };
    }
    return resultado;
  }

  /* =========================================================
     PROGRESO POR PERIODO (para el widget "Mi progreso")
  ========================================================= */

  async getProgresoPorPeriodo(usuarioId: string, oposicionId?: string) {
    const ahora = new Date();
    const inicioHoy = new Date(ahora); inicioHoy.setHours(0, 0, 0, 0);
    const inicioSemana = new Date(ahora); inicioSemana.setDate(ahora.getDate() - 7);
    const inicioMes = new Date(ahora); inicioMes.setDate(ahora.getDate() - 30);

    const qb = this.resultadoRepo.createQueryBuilder('r').where('r.usuarioId = :usuarioId', { usuarioId });
    if (oposicionId) qb.andWhere('r.oposicionId = :oposicionId', { oposicionId });
    const resultados = await qb.getMany();

    const calcular = (desde: Date | null) => {
      const filtrados = desde ? resultados.filter((r) => r.creadoEn >= desde) : resultados;
      const totalPreguntas = filtrados.reduce((acc, r) => acc + r.totalPreguntas, 0);
      const totalCorrectas = filtrados.reduce((acc, r) => acc + r.correctas, 0);
      const precision = totalPreguntas > 0 ? Math.round((totalCorrectas / totalPreguntas) * 100) : 0;
      return { totalPreguntas, precision };
    };

    return {
      dia: calcular(inicioHoy),
      semana: calcular(inicioSemana),
      mes: calcular(inicioMes),
      total: calcular(null),
    };
  }

  /* =========================================================
     ADMIN — banco de preguntas global (catálogo, sin scope de oposición)
  ========================================================= */

  async listarPreguntasAdmin(filtros: {
    tipo?: PsicotecnicoTipo;
    subtipo?: string;
    dificultad?: PsicotecnicoDificultad;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(filtros.page ?? 1, 1);
    const limit = Math.min(Math.max(filtros.limit ?? 20, 1), 100);

    const qb = this.preguntaRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.oposicion', 'oposicion')
      .orderBy('p.creadoEn', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filtros.tipo) qb.andWhere('p.tipo = :tipo', { tipo: filtros.tipo });
    if (filtros.subtipo) qb.andWhere('p.subtipo = :subtipo', { subtipo: filtros.subtipo });
    if (filtros.dificultad) qb.andWhere('p.dificultad = :dificultad', { dificultad: filtros.dificultad });

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async crearPreguntaAdmin(datos: {
    tipo: PsicotecnicoTipo;
    subtipo?: string;
    dificultad?: PsicotecnicoDificultad;
    enunciado: string;
    imagenUrl?: string;
    opciones: string[];
    correcta: number;
    explicacion?: string;
    tiempoRecomendadoSegundos?: number;
    etiquetas?: string[];
    oposicionId?: string | null;
  }) {
    if (!Object.values(PsicotecnicoTipo).includes(datos.tipo)) {
      throw new BadRequestException(`Tipo "${datos.tipo}" no reconocido`);
    }
    if (!datos.enunciado || !Array.isArray(datos.opciones) || typeof datos.correcta !== 'number') {
      throw new BadRequestException('Faltan campos obligatorios (enunciado/opciones/correcta)');
    }

    return this.preguntaRepo.save(
      this.preguntaRepo.create({
        tipo: datos.tipo,
        subtipo: datos.subtipo,
        dificultad: datos.dificultad ?? PsicotecnicoDificultad.MEDIO,
        enunciado: datos.enunciado,
        imagenUrl: datos.imagenUrl,
        opciones: datos.opciones,
        correcta: datos.correcta,
        explicacion: datos.explicacion,
        tiempoRecomendadoSegundos: datos.tiempoRecomendadoSegundos,
        etiquetas: datos.etiquetas,
        origen: 'oplora',
        oposicion: datos.oposicionId ? ({ id: datos.oposicionId } as any) : null,
      }),
    );
  }

  async actualizarPreguntaAdmin(id: string, datos: Partial<{
    tipo: PsicotecnicoTipo;
    subtipo: string;
    dificultad: PsicotecnicoDificultad;
    enunciado: string;
    imagenUrl: string;
    opciones: string[];
    correcta: number;
    explicacion: string;
    tiempoRecomendadoSegundos: number;
    etiquetas: string[];
    activa: boolean;
    oposicionId: string | null;
  }>) {
    const existente = await this.preguntaRepo.findOne({ where: { id } });
    if (!existente) throw new BadRequestException('Pregunta no encontrada');

    const { oposicionId, ...resto } = datos;
    await this.preguntaRepo.update(id, {
      ...resto,
      ...(oposicionId !== undefined ? { oposicion: oposicionId ? ({ id: oposicionId } as any) : null } : {}),
    });
    return this.preguntaRepo.findOne({ where: { id }, relations: ['oposicion'] });
  }

  async eliminarPreguntaAdmin(id: string) {
    await this.preguntaRepo.delete(id);
    return { ok: true };
  }

  async getSubtiposAdmin(tipo: PsicotecnicoTipo) {
    if (!Object.values(PsicotecnicoTipo).includes(tipo)) {
      throw new BadRequestException(`Tipo "${tipo}" no reconocido`);
    }

    const filas = await this.preguntaRepo
      .createQueryBuilder('p')
      .select('DISTINCT p.subtipo', 'subtipo')
      .where('p.tipo = :tipo', { tipo })
      .andWhere('p.subtipo IS NOT NULL')
      .getRawMany();

    const existentes = filas.map((f) => f.subtipo).filter(Boolean) as string[];
    const sugeridos = SUBTIPOS_SUGERIDOS[tipo] ?? [];
    const combinados = Array.from(new Set([...sugeridos, ...existentes])).sort();
    return combinados;
  }

  /* =========================================================
     IMPORTAR PREGUNTAS (admin)
  ========================================================= */

  // `convocatoriaId`: si se pasa, las preguntas nacen vinculadas SOLO a esa
  // convocatoria (no salen en otras de la misma oposición); si se omite,
  // quedan como preguntas "globales" de la oposición, como hasta ahora.
  async importarPreguntas(oposicionId: string | undefined, preguntas: any[], convocatoriaId?: string) {
    const resultado = { importadas: 0, errores: [] as string[] };

    for (const [i, p] of preguntas.entries()) {
      try {
        if (!Object.values(PsicotecnicoTipo).includes(p.tipo)) {
          resultado.errores.push(`Fila ${i + 1}: tipo "${p.tipo}" no reconocido`);
          continue;
        }
        if (!p.enunciado || !Array.isArray(p.opciones) || typeof p.correcta !== 'number') {
          resultado.errores.push(`Fila ${i + 1}: faltan campos obligatorios (enunciado/opciones/correcta)`);
          continue;
        }

        const nueva = await this.preguntaRepo.save(
          this.preguntaRepo.create({
            tipo: p.tipo,
            subtipo: p.subtipo,
            dificultad: p.dificultad ?? PsicotecnicoDificultad.MEDIO,
            enunciado: p.enunciado,
            imagenUrl: p.imagenUrl,
            opciones: p.opciones,
            correcta: p.correcta,
            explicacion: p.explicacion,
            tiempoRecomendadoSegundos: p.tiempoRecomendadoSegundos,
            etiquetas: p.etiquetas,
            origen: p.origen ?? 'oplora',
            oposicion: oposicionId ? ({ id: oposicionId } as any) : null,
          }),
        );

        if (convocatoriaId) {
          await this.preguntaRepo
            .createQueryBuilder()
            .relation(PreguntaPsicotecnica, 'convocatorias')
            .of(nueva.id)
            .add(convocatoriaId);
        }

        resultado.importadas++;
      } catch (e: any) {
        resultado.errores.push(`Fila ${i + 1}: ${e.message}`);
      }
    }

    return resultado;
  }
}
