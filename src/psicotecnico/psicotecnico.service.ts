import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { PsicotecnicoConfigOposicion } from './psicotecnico-config-oposicion.entity';
import { PreguntaPsicotecnica } from './pregunta-psicotecnica.entity';
import { ResultadoPsicotecnico } from './resultado-psicotecnico.entity';
import { UsuarioOposicion } from '../usuario/usuario-oposicion.entity';
import { Convocatoria } from '../convocatoria/convocatoria.entity';
import { RetoPsicotecnico, EstadoRetoPsicotecnico } from './reto-psicotecnico.entity';
import { ResultadoRetoPsicotecnico } from './resultado-reto-psicotecnico.entity';
import { Usuario } from '../usuario/usuario.entity';
import { NotificacionService } from '../notificacion/notificacion.service';
import { TipoNotificacion, PrioridadNotificacion } from '../notificacion/notificacion.entity';
import {
  PsicotecnicoTipo,
  PsicotecnicoDificultad,
  PSICOTECNICO_TIPO_META,
  SUBTIPOS_SUGERIDOS,
  DIFICULTADES_DEFECTO,
} from './psicotecnico-tipo.enum';

/**
 * Recorta el pool de opciones de una PreguntaPsicotecnica al número de
 * opciones que use la convocatoria activa del usuario (numOpcionesPsicotecnico
 * en Convocatoria). Espejo exacto de recortarOpcionesArticulo() en
 * test.service.ts: no muta la fila guardada, opera sobre una copia y
 * devuelve un nuevo índice "correcta" recalculado tras el recorte +
 * reordenado aleatorio. Si numOpciones es null/undefined, >= opciones.length
 * o < 2, devuelve tal cual.
 */
function recortarOpcionesPsicotecnico(
  opciones: string[],
  correcta: number,
  numOpciones?: number | null,
): { opciones: string[]; correcta: number } {
  if (!numOpciones || numOpciones >= opciones.length || numOpciones < 2) {
    return { opciones, correcta };
  }

  const correctaTexto = opciones[correcta];
  const distractores = opciones.filter((_, i) => i !== correcta);

  for (let i = distractores.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [distractores[i], distractores[j]] = [distractores[j], distractores[i]];
  }
  const seleccion = [correctaTexto, ...distractores.slice(0, numOpciones - 1)];

  for (let i = seleccion.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [seleccion[i], seleccion[j]] = [seleccion[j], seleccion[i]];
  }

  return { opciones: seleccion, correcta: seleccion.indexOf(correctaTexto) };
}

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
    @InjectRepository(Convocatoria)
    private readonly convocatoriaRepo: Repository<Convocatoria>,
    @InjectRepository(RetoPsicotecnico)
    private readonly retoPsicotecnicoRepo: Repository<RetoPsicotecnico>,
    @InjectRepository(ResultadoRetoPsicotecnico)
    private readonly resultadoRetoRepo: Repository<ResultadoRetoPsicotecnico>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    private readonly notificacionService: NotificacionService,
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

    // Interruptor maestro: si la convocatoria tiene tienePsicotecnicos = false
    // explícitamente, se ocultan por completo, sin mirar la config por tipo.
    if (convocatoriaResuelta) {
      const convocatoria = await this.convocatoriaRepo.findOne({ where: { id: convocatoriaResuelta } });
      if (convocatoria && convocatoria.tienePsicotecnicos === false) return [];
    }

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

    // Nº de opciones de la convocatoria activa, para recortar el pool de
    // opciones de cada pregunta (igual que numOpcionesTest en test.service.ts).
    let numOpcionesPsicotecnicoActiva: number | null | undefined;
    if (convocatoriaResuelta) {
      const convocatoria = await this.convocatoriaRepo.findOne({ where: { id: convocatoriaResuelta } });
      numOpcionesPsicotecnicoActiva = convocatoria?.numOpcionesPsicotecnico;
    }

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

    // Recortar opciones (si procede) ANTES de despojar `correcta`, ya que el
    // recorte necesita recalcular en qué posición queda la opción correcta.
    // No se envía `correcta` al cliente: se corrige en el servidor al guardar el resultado.
    return preguntas.map((p) => {
      const { opciones } = recortarOpcionesPsicotecnico(p.opciones, p.correcta, numOpcionesPsicotecnicoActiva);
      const { correcta, ...resto } = p;
      return { ...resto, opciones };
    });
  }

  /* =========================================================
     REVELAR RESPUESTA CORRECTA (solo tras contestar esa pregunta)
  ========================================================= */

  // Se llama SOLO cuando el cliente ya ha respondido esa pregunta concreta
  // (mostrarCorreccion pasa a true), nunca antes. Devuelve el TEXTO de la
  // opción correcta (no el índice), consistente con la corrección por texto
  // de guardarResultado(): el índice original no es válido contra el array
  // de opciones recortado/reordenado que vio el cliente.
  // Guardia mínima: solo preguntas activas, para no exponer preguntas
  // retiradas/deshabilitadas del banco. No se comprueba pertenencia a
  // oposición/convocatoria concreta (ver tradeoff en el informe de la tarea).
  async getRespuestaCorrecta(preguntaId: string) {
    const pregunta = await this.preguntaRepo.findOne({ where: { id: preguntaId, activa: true } });
    if (!pregunta) {
      throw new BadRequestException('Pregunta no encontrada');
    }
    const correctaTexto = pregunta.opciones?.[pregunta.correcta] ?? null;
    return { correctaTexto };
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
    respuestas: {
      preguntaId: string;
      respuesta: number | null;
      respuestaTexto?: string | null;
      tiempoMs?: number;
    }[];
    tiempoSegundos?: number;
  }) {
    const ids = datos.respuestas.map((r) => r.preguntaId);
    const preguntas = await this.preguntaRepo.find({ where: { id: In(ids) } });
    const mapaPreguntas = new Map(preguntas.map((p) => [p.id, p]));

    let correctas = 0;
    const detallePreguntas = datos.respuestas.map((r) => {
      const pregunta = mapaPreguntas.get(r.preguntaId);

      // Corrección PRIMARIA por texto: `pregunta.correcta` (índice leído fresco
      // de la fila SIN tocar) referencia siempre el array `opciones` ORIGINAL
      // de la BD, pero el cliente respondió sobre una copia recortada/reordenada
      // (ver recortarOpcionesPsicotecnico en generarPreguntas). Comparar índices
      // entre ambos arrays es incorrecto en cuanto hay recorte/reorden: el mismo
      // índice puede significar una opción distinta en cada array. Comparamos en
      // su lugar el TEXTO de la opción elegida contra el texto de la opción
      // correcta en la fila original, que no cambia al recortar/reordenar (la
      // opción correcta siempre se conserva en el recorte).
      // Fallback LEGACY por índice: solo para clientes antiguos que no envíen
      // `respuestaTexto` (no debería ocurrir tras este fix, pero evita romper
      // compatibilidad si queda algún caller desactualizado).
      let esCorrecta = false;
      if (pregunta) {
        const textoCorrecta = pregunta.opciones?.[pregunta.correcta];
        if (r.respuestaTexto != null && typeof textoCorrecta === 'string') {
          esCorrecta = r.respuestaTexto.trim() === textoCorrecta.trim();
        } else if (r.respuestaTexto == null) {
          esCorrecta = r.respuesta !== null && r.respuesta === pregunta.correcta;
        }
      }
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

  /* =========================================================
     DUELOS PSICOTÉCNICOS 1 vs 1 (espejo de flashcard.service.ts:
     crearDueloFC / completarRetoFC / cerrarDuelo / getMisRetosFC)
  ========================================================= */

  async crearDueloPsicotecnico(
    retadorId: string,
    retadoNickOEmail: string,
    oposicionId: string,
    tipo: PsicotecnicoTipo,
    numPreguntas = 10,
    convocatoriaId?: string,
  ): Promise<RetoPsicotecnico> {
    const retador = await this.usuarioRepo.findOne({ where: { id: retadorId } });
    if (!retador) throw new NotFoundException('Retador no encontrado');

    const busqueda = retadoNickOEmail.toLowerCase().trim();
    let retado = await this.usuarioRepo.findOne({ where: { nick: busqueda } });
    if (!retado) retado = await this.usuarioRepo.findOne({ where: { email: busqueda } });
    if (!retado) throw new NotFoundException('Usuario no encontrado con ese nick o email');
    if (retado.id === retadorId) throw new BadRequestException('No puedes retarte a ti mismo');

    // Mismo bloque de validación "vinculado a la oposición + misma convocatoria
    // activa" que crearDueloFC (flashcard.service.ts).
    const retadorOposicion = await this.usuarioOposicionRepo.findOne({
      where: { usuario: { id: retadorId } as any, oposicion: { id: oposicionId } as any },
      relations: ['convocatoriaActiva'],
    });
    if (!retadorOposicion) throw new BadRequestException('No estás vinculado a esta oposición');

    const retadoOposicion = await this.usuarioOposicionRepo.findOne({
      where: { usuario: { id: retado.id } as any, oposicion: { id: oposicionId } as any },
      relations: ['convocatoriaActiva'],
    });
    if (!retadoOposicion) {
      throw new BadRequestException(`${retado.nick ?? retado.nombre} no está preparando esta oposición`);
    }

    const convocatoriaRetador = (retadorOposicion as any).convocatoriaActiva?.id;
    const convocatoriaRetado = (retadoOposicion as any).convocatoriaActiva?.id;
    if (convocatoriaRetador !== convocatoriaRetado) {
      throw new BadRequestException(`${retado.nick ?? retado.nombre} está en una convocatoria distinta a la tuya`);
    }

    const convocatoriaResuelta = convocatoriaId ?? convocatoriaRetador;

    // Nº de opciones de la convocatoria (igual que generarPreguntas), para
    // aplicar el mismo recorte a las preguntas congeladas del duelo.
    let numOpcionesActiva: number | null | undefined;
    if (convocatoriaResuelta) {
      const convocatoria = await this.convocatoriaRepo.findOne({ where: { id: convocatoriaResuelta } });
      numOpcionesActiva = convocatoria?.numOpcionesPsicotecnico;
    }

    // Selección del pool: mismo criterio de scope oposición/convocatoria que
    // generarPreguntas (general o de esta oposición; sin convocatorias
    // vinculadas o vinculada precisamente a la convocatoria del duelo).
    const qb = this.preguntaRepo
      .createQueryBuilder('p')
      .where('p.activa = true')
      .andWhere('p.tipo = :tipo', { tipo })
      .andWhere('(p.oposicionId IS NULL OR p.oposicionId = :oposicionId)', { oposicionId })
      .andWhere(
        convocatoriaResuelta
          ? `(
              NOT EXISTS (SELECT 1 FROM preguntas_psicotecnicas_convocatorias ppc WHERE ppc."preguntaId" = p.id)
              OR EXISTS (SELECT 1 FROM preguntas_psicotecnicas_convocatorias ppc2 WHERE ppc2."preguntaId" = p.id AND ppc2."convocatoriaId" = :convocatoriaId)
            )`
          : `NOT EXISTS (SELECT 1 FROM preguntas_psicotecnicas_convocatorias ppc WHERE ppc."preguntaId" = p.id)`,
        convocatoriaResuelta ? { convocatoriaId: convocatoriaResuelta } : {},
      );

    const preguntasBD = await qb.orderBy('RANDOM()').take(numPreguntas).getMany();
    if (preguntasBD.length === 0) {
      throw new BadRequestException('No hay preguntas psicotécnicas disponibles para este duelo');
    }

    // ⭐ Congelar el recorte/reordenado de opciones AQUÍ, una sola vez, para
    // que retador y retado vean exactamente el mismo tablero (ver el
    // comentario extenso en reto-psicotecnico.entity.ts sobre por qué esto
    // difiere del flujo individual de práctica, que recorta "al servir").
    const preguntasCongeladas = preguntasBD.map((p) => {
      const { opciones } = recortarOpcionesPsicotecnico(p.opciones, p.correcta, numOpcionesActiva);
      return { id: p.id, enunciado: p.enunciado, imagenUrl: p.imagenUrl ?? null, opciones };
    });

    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + 2);

    const reto = await this.retoPsicotecnicoRepo.save(
      this.retoPsicotecnicoRepo.create({
        tipo,
        preguntas: preguntasCongeladas,
        fechaFin,
        retador: { id: retadorId } as any,
        retado: { id: retado.id } as any,
        oposicion: { id: oposicionId } as any,
      }),
    );

    await this.notificacionService.crear({
      usuarioId: retado.id,
      tipo: TipoNotificacion.RETO_RECIBIDO,
      titulo: '🧠 ¡Nuevo duelo psicotécnico!',
      mensaje: `${retador.nick ?? retador.nombre} te ha retado a un duelo psicotécnico`,
      prioridad: PrioridadNotificacion.MEDIA,
      urlAccion: `/app/psicotecnicos/duelo/${reto.id}`,
    });

    return reto;
  }

  async completarRetoPsicotecnico(
    retoId: string,
    usuarioId: string,
    respuestas: { preguntaId: string; respuestaTexto: string; tiempoRespuesta: number }[],
  ): Promise<ResultadoRetoPsicotecnico> {
    const reto = await this.retoPsicotecnicoRepo.findOne({
      where: { id: retoId },
      relations: ['resultados', 'resultados.usuario', 'retador', 'retado'],
    });
    if (!reto) throw new NotFoundException('Reto psicotécnico no encontrado');

    const retadorId = (reto.retador as any)?.id;
    const retadoId = (reto.retado as any)?.id;
    const esParticipante = usuarioId === retadorId || usuarioId === retadoId;
    if (!esParticipante) {
      throw new ForbiddenException('No eres participante de este reto');
    }

    const idsValidos = new Set((reto.preguntas ?? []).map((p) => p.id));
    const idsInvalidos = respuestas
      .map((r) => r.preguntaId)
      .filter((id) => !idsValidos.has(id));
    if (idsInvalidos.length > 0) {
      throw new BadRequestException(
        `Las siguientes preguntas no pertenecen a este reto: ${idsInvalidos.join(', ')}`,
      );
    }

    const yaCompletado = reto.resultados?.some(
      (r) => (r.usuario as any).id === usuarioId && r.completado,
    );
    if (yaCompletado) throw new BadRequestException('Ya completaste este reto');

    // Corrección: se lee `correcta` de la fila ORIGINAL de PreguntaPsicotecnica
    // (nunca del snapshot congelado, que solo tiene el array de opciones ya
    // recortado/reordenado y NO guarda ningún índice/valor "correcta" —
    // justo para evitar la tentación de comparar contra un índice que ya no
    // significa lo mismo tras el recorte). Se compara por TEXTO, igual que
    // guardarResultado() en el flujo individual: `pregunta.opciones[pregunta.correcta]`
    // es estable frente a cualquier recorte/reordenado que haya visto el cliente.
    const idsPreguntas = respuestas.map((r) => r.preguntaId);
    const preguntasOriginales = await this.preguntaRepo.find({ where: { id: In(idsPreguntas) } });
    const mapaOriginales = new Map(preguntasOriginales.map((p) => [p.id, p]));

    const respuestasCorregidas: { preguntaId: string; correcta: boolean; tiempoRespuesta: number }[] = [];
    for (const r of respuestas) {
      const original = mapaOriginales.get(r.preguntaId);
      const textoCorrecta = original?.opciones?.[original.correcta];
      const correcta = !!(
        original &&
        typeof textoCorrecta === 'string' &&
        r.respuestaTexto != null &&
        r.respuestaTexto.trim() === textoCorrecta.trim()
      );
      respuestasCorregidas.push({ preguntaId: r.preguntaId, correcta, tiempoRespuesta: r.tiempoRespuesta });
    }

    const aciertos = respuestasCorregidas.filter((r) => r.correcta).length;
    const tiempoTotal = respuestasCorregidas.reduce((acc, r) => acc + r.tiempoRespuesta, 0);

    // Transacción: guarda el resultado y, de paso, las estadísticas de uso del
    // banco (aciertos/fallos/vecesUsada), igual que completarRetoFC envuelve
    // registrarRespuesta + guardado del resultado en una sola transacción.
    const resultado = await this.resultadoRetoRepo.manager.transaction(async (manager) => {
      for (const r of respuestasCorregidas) {
        await manager.increment(PreguntaPsicotecnica, { id: r.preguntaId }, r.correcta ? 'aciertos' : 'fallos', 1);
        await manager.increment(PreguntaPsicotecnica, { id: r.preguntaId }, 'vecesUsada', 1);
      }

      return manager.save(
        manager.create(ResultadoRetoPsicotecnico, {
          retoPsicotecnico: { id: retoId } as any,
          usuario: { id: usuarioId } as any,
          completado: true,
          aciertos,
          fallos: respuestasCorregidas.length - aciertos,
          tiempoTotal,
          respuestas: respuestasCorregidas,
        }),
      );
    });

    const todosCompletos = await this.resultadoRetoRepo.count({
      where: { retoPsicotecnico: { id: retoId }, completado: true },
    });
    if (todosCompletos >= 2) {
      await this.cerrarDueloPsicotecnico(reto);
    }

    return resultado;
  }

  private async cerrarDueloPsicotecnico(reto: RetoPsicotecnico): Promise<void> {
    const resultados = await this.resultadoRetoRepo.find({
      where: { retoPsicotecnico: { id: reto.id }, completado: true },
      relations: ['usuario'],
      order: { aciertos: 'DESC', tiempoTotal: 'ASC' },
    });

    for (let i = 0; i < resultados.length; i++) {
      await this.resultadoRetoRepo.update(resultados[i].id, { posicion: i + 1 });
    }

    await this.retoPsicotecnicoRepo.update(reto.id, { estado: EstadoRetoPsicotecnico.COMPLETADO });

    if (resultados.length >= 2) {
      const ganador = resultados[0].usuario as any;
      const perdedor = resultados[1].usuario as any;

      await this.notificacionService.crear({
        usuarioId: ganador.id,
        tipo: TipoNotificacion.RETO_RESULTADO,
        titulo: '¡Has ganado el duelo psicotécnico! 🧠',
        mensaje: `Has ganado a ${perdedor.nick ?? perdedor.nombre} con ${resultados[0].aciertos} aciertos`,
        prioridad: PrioridadNotificacion.MEDIA,
      });

      await this.notificacionService.crear({
        usuarioId: perdedor.id,
        tipo: TipoNotificacion.RETO_RESULTADO,
        titulo: 'Duelo psicotécnico finalizado',
        mensaje: `${ganador.nick ?? ganador.nombre} ha ganado el duelo con ${resultados[0].aciertos} aciertos`,
        prioridad: PrioridadNotificacion.MEDIA,
      });
    }
  }

  async getMisRetosPsicotecnico(usuarioId: string): Promise<RetoPsicotecnico[]> {
    const retos = await this.retoPsicotecnicoRepo
      .createQueryBuilder('reto')
      .leftJoinAndSelect('reto.retador', 'retador')
      .leftJoinAndSelect('reto.retado', 'retado')
      .leftJoinAndSelect('reto.oposicion', 'oposicion')
      .leftJoinAndSelect('reto.resultados', 'resultados')
      .leftJoinAndSelect('resultados.usuario', 'resultadoUsuario')
      .where('retador.id = :usuarioId', { usuarioId })
      .orWhere('retado.id = :usuarioId', { usuarioId })
      .orderBy('reto.creadoEn', 'DESC')
      .getMany();

    // ⭐ Expiración "al vuelo": ningún cron marcaba como EXPIRADO los retos
    // psicotécnicos cuyo plazo ya pasó, así que se quedaban en "en curso".
    const ahora = new Date();
    const vencidos = retos.filter(
      (r) =>
        (r.estado === EstadoRetoPsicotecnico.ACTIVO || r.estado === EstadoRetoPsicotecnico.PENDIENTE) &&
        r.fechaFin &&
        new Date(r.fechaFin) < ahora,
    );
    if (vencidos.length > 0) {
      await this.retoPsicotecnicoRepo.update(vencidos.map((r) => r.id), { estado: EstadoRetoPsicotecnico.EXPIRADO });
      for (const r of vencidos) r.estado = EstadoRetoPsicotecnico.EXPIRADO;
    }

    return retos;
  }

  // Espejo de test.service.ts#contarPreguntasDisponibles: cuenta cuántas
  // preguntas hay disponibles para una combinación tipo/dificultad, sin
  // generar nada, para poder avisar en la pantalla de selección.
  async contarPreguntasDisponibles(
    oposicionId: string,
    tipo: PsicotecnicoTipo,
    dificultad?: PsicotecnicoDificultad,
  ): Promise<{ total: number }> {
    const qb = this.preguntaRepo
      .createQueryBuilder('p')
      .where('p.activa = true')
      .andWhere('(p.oposicionId IS NULL OR p.oposicionId = :oposicionId)', { oposicionId })
      .andWhere('p.tipo = :tipo', { tipo });

    if (dificultad) qb.andWhere('p.dificultad = :dificultad', { dificultad });

    const total = await qb.getCount();
    return { total };
  }
}
