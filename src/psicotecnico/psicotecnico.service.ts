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

  // Config efectiva: si hay filas para la convocatoria dada, esas ganan;
  // si no hay ninguna, se cae a las filas "por defecto" de la oposición.
  private async getConfigEfectiva(oposicionId: string, convocatoriaId?: string | null) {
    if (convocatoriaId) {
      const deConvocatoria = await this.configRepo.find({
        where: { oposicion: { id: oposicionId } as any, convocatoria: { id: convocatoriaId } as any },
      });
      if (deConvocatoria.length > 0) return deConvocatoria;
    }
    return this.configRepo.find({
      where: { oposicion: { id: oposicionId } as any, convocatoria: IsNull() },
    });
  }

  async getConfigParaUsuario(usuarioId: string, oposicionId: string, convocatoriaId?: string) {
    let convocatoriaResuelta = convocatoriaId;
    if (!convocatoriaResuelta) {
      const uo = await this.usuarioOposicionRepo.findOne({
        where: { usuario: { id: usuarioId } as any, oposicion: { id: oposicionId } as any },
        relations: ['convocatoriaActiva'],
      });
      convocatoriaResuelta = uo?.convocatoriaActiva?.id;
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
    oposicionId: string;
    tipo: PsicotecnicoTipo;
    subtipo?: string;
    dificultad?: PsicotecnicoDificultad;
    numPreguntas?: number;
  }) {
    const numPreguntas = Math.min(Math.max(datos.numPreguntas ?? 10, 1), 50);

    const qb = this.preguntaRepo
      .createQueryBuilder('p')
      .where('p.activa = true')
      .andWhere('p.tipo = :tipo', { tipo: datos.tipo })
      .andWhere('(p.oposicionId IS NULL OR p.oposicionId = :oposicionId)', { oposicionId: datos.oposicionId });

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
     IMPORTAR PREGUNTAS (admin)
  ========================================================= */

  async importarPreguntas(oposicionId: string | undefined, preguntas: any[]) {
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

        await this.preguntaRepo.save(
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
        resultado.importadas++;
      } catch (e: any) {
        resultado.errores.push(`Fila ${i + 1}: ${e.message}`);
      }
    }

    return resultado;
  }
}
