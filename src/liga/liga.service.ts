import { registrarDiaDeEstudio } from '../common/helpers/consumo.helper';
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Brackets, LessThanOrEqual, MoreThan, Not, IsNull } from 'typeorm';
import { Liga } from './liga.entity';
import { DivisionLiga } from './division-liga.entity';
import { MiembroLiga } from './miembro-liga.entity';
import { JornadaLiga, PreguntaJornada } from './jornada-liga.entity';
import { ResultadoJornada } from './resultado-jornada.entity';
import { CierreMesLiga } from './cierre-mes-liga.entity';
import { CopaLiga } from './copa-liga.entity';
import { Convocatoria } from '../convocatoria/convocatoria.entity';
import { Tema } from '../tema/tema.entity';
import { PreguntaTest } from '../test/pregunta-test.entity';
import { PreguntaPsicotecnica } from '../psicotecnico/pregunta-psicotecnica.entity';
import { UsuarioOposicion } from '../usuario/usuario-oposicion.entity';
import { NotificacionService } from '../notificacion/notificacion.service';
import { TipoNotificacion, PrioridadNotificacion } from '../notificacion/notificacion.entity';
import { recortarOpcionesArticulo } from '../test/test.service';
import {
  EstadoLiga,
  EstadoJornada,
  ModoDivision,
  TipoJornada,
  TipoCopa,
  NOMBRE_DIVISION,
  COEFICIENTE_DIVISION,
  COLOR_COPA,
  DIVISIONES_POR_DEFECTO,
  LIGA_POR_DEFECTO,
  MARGEN_ENVIO_MS,
} from './liga.constants';
import {
  partesMadrid,
  fechaMadrid,
  finDeSemanaDe,
  mesDe,
  parsearFecha,
  diaSemanaDe,
  sumarDias,
} from './liga-fechas.util';

const URL_LIGA = '/app/liga';

const TEXTO_COPA: Record<number, string> = { 1: 'de oro', 2: 'de plata', 3: 'de bronce', 4: 'azul', 5: 'verde' };
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
/** "2026-10" → "octubre" */
function nombreMesTexto(mes: string): string {
  const m = Number(mes?.split('-')[1]);
  return MESES[m - 1] ?? mes;
}
const REGEX_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

interface Temario {
  temas: Tema[]; // activos, ordenados por número
  bloques: { nombre: string; temas: Tema[] }[];
}

interface PlanJornada {
  tipo: TipoJornada;
  temaIds: string[];
  bloque: string | null;
  descripcion: string;
}

function barajar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function parseFraccion(fraccion: string | null | undefined): number {
  if (!fraccion) return 0;
  const partes = String(fraccion).split('/');
  if (partes.length !== 2) return Number(fraccion) || 0;
  const num = parseFloat(partes[0]);
  const den = parseFloat(partes[1]);
  return den ? num / den : 0;
}

function redondear(valor: number, decimales: number): number {
  const f = 10 ** decimales;
  return Math.round(valor * f) / f;
}

function describirTemas(temas: Tema[]): string {
  const nums = temas.map((t) => t.numero).sort((a, b) => a - b);
  if (nums.length === 0) return 'Sin temas';
  if (nums.length === 1) return `Tema ${nums[0]}`;
  const consecutivos = nums.every((n, i) => i === 0 || n === nums[i - 1] + 1);
  if (consecutivos && nums.length > 2) return `Temas ${nums[0]} a ${nums[nums.length - 1]}`;
  return `Temas ${nums.slice(0, -1).join(', ')} y ${nums[nums.length - 1]}`;
}

export interface FilaMensual {
  usuarioId: string;
  puntos: number;
  jornadasJugadas: number;
  jornadasGanadas: number;
  mejorNota: number;
  posicion?: number;
}

/**
 * ⭐ Orden de la clasificación mensual: puntos; después más jornadas jugadas;
 * después más jornadas ganadas; después mejor nota. Empate total = misma posición.
 */
export function ordenarMensual(filas: FilaMensual[]): FilaMensual[] {
  const clave = (f: FilaMensual) => [f.puntos, f.jornadasJugadas, f.jornadasGanadas, f.mejorNota];
  const orden = [...filas].sort((a, b) => {
    const ka = clave(a);
    const kb = clave(b);
    for (let i = 0; i < ka.length; i++) if (kb[i] !== ka[i]) return kb[i] - ka[i];
    return 0;
  });
  orden.forEach((f, i) => {
    const ant = orden[i - 1];
    const empata = ant && clave(ant).every((v, k) => v === clave(f)[k]);
    f.posicion = empata ? ant.posicion : i + 1;
  });
  return orden;
}

/** Nº de plazas de ascenso: el % de los activos, redondeado hacia arriba (mínimo 1). */
export function cupoAscenso(activos: number, porcentaje: number): number {
  if (activos <= 0) return 0;
  return Math.max(1, Math.ceil((activos * porcentaje) / 100 - 1e-9));
}

@Injectable()
export class LigaService {
  private readonly logger = new Logger('LigaService');

  constructor(
    @InjectRepository(Liga) private readonly ligaRepo: Repository<Liga>,
    @InjectRepository(DivisionLiga) private readonly divisionRepo: Repository<DivisionLiga>,
    @InjectRepository(MiembroLiga) private readonly miembroRepo: Repository<MiembroLiga>,
    @InjectRepository(JornadaLiga) private readonly jornadaRepo: Repository<JornadaLiga>,
    @InjectRepository(ResultadoJornada) private readonly resultadoRepo: Repository<ResultadoJornada>,
    @InjectRepository(CierreMesLiga) private readonly cierreRepo: Repository<CierreMesLiga>,
    @InjectRepository(CopaLiga) private readonly copaRepo: Repository<CopaLiga>,
    @InjectRepository(Convocatoria) private readonly convocatoriaRepo: Repository<Convocatoria>,
    @InjectRepository(Tema) private readonly temaRepo: Repository<Tema>,
    @InjectRepository(PreguntaTest) private readonly preguntaRepo: Repository<PreguntaTest>,
    @InjectRepository(PreguntaPsicotecnica) private readonly psicoRepo: Repository<PreguntaPsicotecnica>,
    @InjectRepository(UsuarioOposicion) private readonly usuarioOposicionRepo: Repository<UsuarioOposicion>,
    private readonly notificacionService: NotificacionService,
  ) {}

  /* =========================================================
     TAREA PERIÓDICA (la lanza LigaCronService cada 5 minutos)
     Cada paso es idempotente: si se ejecuta dos veces no duplica nada.
  ========================================================= */

  async tick(ahora = new Date()): Promise<void> {
    const ligas = await this.ligaRepo.find({
      where: { estado: Not(EstadoLiga.CERRADA) },
      relations: ['convocatoria', 'convocatoria.oposicion'],
    });
    for (const liga of ligas) {
      try {
        await this.procesarLiga(liga, ahora);
      } catch (e: any) {
        this.logger.error(`Liga ${liga.id}: ${e?.message ?? e}`);
      }
    }
  }

  async procesarLiga(liga: Liga, ahora = new Date()): Promise<void> {
    // Cerrar siempre lo que toque, aunque la liga esté pausada
    await this.cerrarJornadasVencidas(liga, ahora);
    await this.cerrarMesesPendientes(liga, ahora);
    if (liga.estado !== EstadoLiga.ACTIVA) return;
    await this.sincronizarMiembros(liga);
    await this.publicarSemana(liga, ahora);
    await this.abrirJornadas(liga, ahora);
    await this.enviarUltimaLlamada(liga, ahora);
  }

  /** Alta automática: todo usuario con esta convocatoria activa entra en Quinta. */
  async sincronizarMiembros(liga: Liga): Promise<void> {
    await this.ligaRepo.query(
      `INSERT INTO miembros_liga ("ligaId", "usuarioId")
       SELECT $1, uo.usuario_id
       FROM usuario_oposiciones uo
       WHERE uo."convocatoriaActivaId" = $2 AND uo.activa = true
       ON CONFLICT ("ligaId", "usuarioId") DO NOTHING`,
      [liga.id, liga.convocatoria.id],
    );
  }

  private fechasSemana(liga: Liga, ahora: Date) {
    const finde = finDeSemanaDe(ahora);
    return {
      finde,
      mes: mesDe(finde.sabado),
      aviso: fechaMadrid(finde.lunes.y, finde.lunes.m, finde.lunes.d, liga.horaAviso),
      apertura: fechaMadrid(finde.viernes.y, finde.viernes.m, finde.viernes.d, liga.horaApertura),
      ultimaLlamada: fechaMadrid(finde.domingo.y, finde.domingo.m, finde.domingo.d, liga.horaUltimaLlamada),
      cierre: fechaMadrid(finde.domingo.y, finde.domingo.m, finde.domingo.d, liga.horaCierre),
    };
  }

  /** Lunes: crea la jornada del fin de semana de cada división y avisa. */
  async publicarSemana(liga: Liga, ahora: Date): Promise<void> {
    const s = this.fechasSemana(liga, ahora);
    if (ahora < s.aviso || ahora >= s.apertura) return;
    const fechaExamen = liga.convocatoria.fechaExamen ? new Date(liga.convocatoria.fechaExamen) : null;
    if (fechaExamen && s.apertura > fechaExamen) return;

    const divisiones = await this.divisionRepo.find({ where: { liga: { id: liga.id } }, order: { division: 'DESC' } });
    let temario: Temario | null = null;

    for (const div of divisiones) {
      let jornada = await this.jornadaRepo.findOne({
        where: { liga: { id: liga.id }, division: div.division, fechaApertura: s.apertura },
      });

      if (!jornada) {
        temario = temario ?? (await this.temarioDe(liga.convocatoria.id));
        const yaHayEnMes = await this.jornadaRepo.count({
          where: { liga: { id: liga.id }, division: div.division, mes: s.mes, estado: Not(EstadoJornada.CANCELADA) },
        });
        const plan = this.planSiguienteJornada(div, temario, yaHayEnMes > 0);
        if (!plan) {
          this.logger.warn(`Liga ${liga.id}: sin temas para la división ${div.division}`);
          continue;
        }
        try {
          jornada = await this.jornadaRepo.save(
            this.jornadaRepo.create({
              liga: { id: liga.id } as any,
              division: div.division,
              mes: s.mes,
              tipo: plan.tipo,
              temaIds: plan.temaIds,
              bloque: plan.bloque,
              descripcion: plan.descripcion,
              numPreguntas: div.numPreguntas,
              segundosPorPregunta: div.segundosPorPregunta,
              fechaApertura: s.apertura,
              fechaUltimaLlamada: s.ultimaLlamada,
              fechaCierre: s.cierre,
            }),
          );
          await this.divisionRepo.update(div.id, { cursorTema: div.cursorTema, cursorBloque: div.cursorBloque });
        } catch (e: any) {
          // Otra ejecución la creó a la vez (restricción única): seguimos con la existente
          jornada = await this.jornadaRepo.findOne({
            where: { liga: { id: liga.id }, division: div.division, fechaApertura: s.apertura },
          });
          if (!jornada) throw e;
        }
      }

      if (!jornada.avisoLunesEnviado && jornada.estado !== EstadoJornada.CANCELADA) {
        const marcado = await this.jornadaRepo.update(
          { id: jornada.id, avisoLunesEnviado: false },
          { avisoLunesEnviado: true },
        );
        if (marcado.affected) {
          await this.avisarDivision(liga, jornada.division, 'avisoLunes', {
            titulo: `Próxima jornada de la Liga: ${jornada.descripcion}`,
            mensaje: `${NOMBRE_DIVISION[jornada.division]} división. Abre el viernes a las ${liga.horaApertura} y cierra el domingo a las ${liga.horaCierre}. ¡Prepárala esta semana!`,
          });
        }
      }
    }
  }

  /**
   * Siguiente paso del calendario de una división. Modifica los cursores de
   * `div` en memoria (quien llama los guarda si la jornada se crea).
   */
  planSiguienteJornada(div: DivisionLiga, temario: Temario, yaHayEnMes: boolean): PlanJornada | null {
    const temas = temario.temas;
    if (temas.length === 0) return null;

    const porBloque = (): PlanJornada | null => {
      if (temario.bloques.length === 0) return null;
      const b = temario.bloques[div.cursorBloque % temario.bloques.length];
      div.cursorBloque += 1;
      return { tipo: TipoJornada.BLOQUE, temaIds: b.temas.map((t) => t.id), bloque: b.nombre, descripcion: `Bloque ${b.nombre}` };
    };
    const todo = (): PlanJornada => ({
      tipo: TipoJornada.TEMARIO,
      temaIds: temas.map((t) => t.id),
      bloque: null,
      descripcion: 'Todo el temario',
    });

    if (div.modo === ModoDivision.TEMAS) {
      const n = Math.min(Math.max(div.temasPorJornada || 1, 1), temas.length);
      const inicio = div.cursorTema >= 0 && div.cursorTema < temas.length ? div.cursorTema : 0;
      // Al llegar al final, la última jornada lleva los temas que queden y la siguiente vuelve al tema 1
      const elegidos = temas.slice(inicio, inicio + n);
      div.cursorTema = inicio + n >= temas.length ? 0 : inicio + n;
      return { tipo: TipoJornada.TEMAS, temaIds: elegidos.map((t) => t.id), bloque: null, descripcion: describirTemas(elegidos) };
    }
    if (div.modo === ModoDivision.BLOQUE) {
      return porBloque() ?? todo();
    }
    // TEMARIO: la primera jornada del mes puede ser de un bloque
    if (div.bloqueMensual && !yaHayEnMes) {
      return porBloque() ?? todo();
    }
    return todo();
  }

  async temarioDe(convocatoriaId: string): Promise<Temario> {
    const [conv, temas] = await Promise.all([
      this.convocatoriaRepo.findOne({ where: { id: convocatoriaId } }),
      this.temaRepo.find({ where: { convocatoria: { id: convocatoriaId }, activo: true }, order: { numero: 'ASC' } }),
    ]);
    const nombres: string[] = [];
    for (const b of conv?.bloquesTemario ?? []) if (b?.nombre && !nombres.includes(b.nombre)) nombres.push(b.nombre);
    for (const t of temas) if (t.bloque && !nombres.includes(t.bloque)) nombres.push(t.bloque);
    const bloques = nombres
      .map((nombre) => ({ nombre, temas: temas.filter((t) => t.bloque === nombre) }))
      .filter((b) => b.temas.length > 0);
    return { temas, bloques };
  }

  /** Viernes: elige las preguntas de cada jornada (una sola vez) y la abre. */
  async abrirJornadas(liga: Liga, ahora: Date): Promise<void> {
    // Las que se quedaron sin abrir y ya pasaron, se cancelan
    const perdidas = await this.jornadaRepo.find({
      where: { liga: { id: liga.id }, estado: EstadoJornada.PROGRAMADA, fechaCierre: LessThanOrEqual(ahora) },
    });
    for (const j of perdidas) {
      await this.jornadaRepo.update(
        { id: j.id, estado: EstadoJornada.PROGRAMADA },
        { estado: EstadoJornada.CANCELADA, motivoCancelacion: 'No se abrió a tiempo' },
      );
    }

    const pendientes = await this.jornadaRepo.find({
      where: {
        liga: { id: liga.id },
        estado: EstadoJornada.PROGRAMADA,
        fechaApertura: LessThanOrEqual(ahora),
        fechaCierre: MoreThan(ahora),
      },
    });
    for (const j of pendientes) await this.abrirJornada(liga, j);
  }

  private async abrirJornada(liga: Liga, jornada: JornadaLiga): Promise<void> {
    const preguntas = await this.seleccionarPreguntas(jornada, liga.convocatoria);
    if (preguntas.length === 0) {
      await this.jornadaRepo.update(
        { id: jornada.id, estado: EstadoJornada.PROGRAMADA },
        { estado: EstadoJornada.CANCELADA, motivoCancelacion: 'No hay preguntas para estos temas' },
      );
      this.logger.warn(`Jornada ${jornada.id} cancelada: sin preguntas`);
      return;
    }
    const marcado = await this.jornadaRepo
      .createQueryBuilder()
      .update(JornadaLiga)
      .set({ preguntas: preguntas as any, numPreguntas: preguntas.length, estado: EstadoJornada.ABIERTA })
      .where('id = :id AND estado = :programada', { id: jornada.id, programada: EstadoJornada.PROGRAMADA })
      .execute();
    if (!marcado.affected) return;

    const avisado = await this.jornadaRepo.update(
      { id: jornada.id, avisoAperturaEnviado: false },
      { avisoAperturaEnviado: true },
    );
    if (avisado.affected) {
      await this.avisarDivision(liga, jornada.division, 'avisoViernes', {
        titulo: 'La jornada de la Liga ya está abierta',
        mensaje: `${jornada.descripcion} · ${preguntas.length} preguntas. Tienes hasta el domingo a las ${liga.horaCierre}.`,
      });
    }
  }

  /** IDs de preguntas activas de un tema: vinculadas al tema o a sus artículos. */
  private async idsPreguntasDeTema(temaId: string): Promise<string[]> {
    const filas = await this.preguntaRepo
      .createQueryBuilder('p')
      .leftJoin('p.temas', 't')
      .leftJoin('p.articulos', 'a')
      .where('p.activa = true')
      .andWhere("p.estado = 'vigente'")
      .andWhere(
        new Brackets((qb) => {
          qb.where('t.id = :temaId', { temaId }).orWhere(
            'a.id IN (SELECT tn."articuloId" FROM temas_normativa tn WHERE tn."temaId" = :temaId)',
            { temaId },
          );
        }),
      )
      .select('p.id', 'id')
      .distinct(true)
      .getRawMany();
    return filas.map((f: any) => f.id);
  }

  async seleccionarPreguntas(jornada: JornadaLiga, convocatoria: Convocatoria): Promise<PreguntaJornada[]> {
    const n = Math.max(1, jornada.numPreguntas);

    if (jornada.tipo === TipoJornada.PSICOTECNICO) {
      const filas = await this.psicoRepo
        .createQueryBuilder('p')
        .leftJoin('p.oposicion', 'o')
        .leftJoin('p.convocatorias', 'c')
        .where('p.activa = true')
        .andWhere('(o.id IS NULL OR o.id = :opId)', { opId: (convocatoria as any).oposicion?.id ?? null })
        .andWhere('(c.id IS NULL OR c.id = :convId)', { convId: convocatoria.id })
        .select('p.id', 'id')
        .distinct(true)
        .getRawMany();
      const ids = barajar(filas.map((f: any) => f.id)).slice(0, n);
      const preguntas = ids.length ? await this.psicoRepo.find({ where: { id: In(ids) } }) : [];
      const porId = new Map(preguntas.map((p) => [p.id, p]));
      return ids
        .map((id) => porId.get(id))
        .filter((p): p is PreguntaPsicotecnica => !!p)
        .map((p) => ({
          id: p.id,
          origen: 'psicotecnico' as const,
          enunciado: p.enunciado,
          opciones: p.opciones,
          correcta: p.correcta,
          explicacion: p.explicacion ?? null,
          imagenUrl: p.imagenUrl ?? null,
          temaId: null,
        }));
    }

    // Temas / bloque / temario
    const temaIds = jornada.temaIds ?? [];
    const pools = new Map<string, string[]>();
    for (const temaId of temaIds) pools.set(temaId, barajar(await this.idsPreguntasDeTema(temaId)));

    const elegidas: { id: string; temaId: string | null }[] = [];
    const usadas = new Set<string>();
    const tomar = (temaId: string | null, ids: string[], cuantas: number) => {
      for (const id of ids) {
        if (cuantas <= 0) break;
        if (usadas.has(id)) continue;
        usadas.add(id);
        elegidas.push({ id, temaId });
        cuantas--;
      }
    };

    if (temaIds.length > 0 && temaIds.length <= n) {
      // Reparto equilibrado: mismo número de preguntas por tema
      const base = Math.floor(n / temaIds.length);
      const resto = n % temaIds.length;
      temaIds.forEach((temaId, i) => tomar(temaId, pools.get(temaId) ?? [], base + (i < resto ? 1 : 0)));
    }
    // Completar (o, si hay más temas que preguntas, elegir) del conjunto de temas de la jornada
    if (elegidas.length < n) {
      const union = barajar(temaIds.flatMap((t) => (pools.get(t) ?? []).map((id) => ({ id, temaId: t }))));
      for (const item of union) {
        if (elegidas.length >= n) break;
        tomar(item.temaId, [item.id], 1);
      }
    }
    // Si aún faltan, completar con temas anteriores del temario (o cualquiera de la convocatoria)
    if (elegidas.length < n) {
      const temario = await this.temarioDe(convocatoria.id);
      const temasJornada = temario.temas.filter((t) => temaIds.includes(t.id));
      const primerNumero = temasJornada.length ? Math.min(...temasJornada.map((t) => t.numero)) : Infinity;
      const candidatos = [
        ...temario.temas.filter((t) => !temaIds.includes(t.id) && t.numero < primerNumero).reverse(),
        ...temario.temas.filter((t) => !temaIds.includes(t.id) && t.numero >= primerNumero),
      ];
      for (const t of candidatos) {
        if (elegidas.length >= n) break;
        tomar(t.id, barajar(await this.idsPreguntasDeTema(t.id)), n - elegidas.length);
      }
    }

    if (elegidas.length === 0) return [];
    const orden = barajar(elegidas);
    const preguntas = await this.preguntaRepo.find({
      where: { id: In(orden.map((e) => e.id)) },
      relations: ['articulos'],
    });
    const porId = new Map(preguntas.map((p) => [p.id, p]));
    const numOpciones = convocatoria.numOpcionesTest;

    return orden
      .map((e): PreguntaJornada | null => {
        const p = porId.get(e.id);
        if (!p) return null;
        const esArticulo = !!p.articulos?.length;
        const { opciones, correcta } = esArticulo
          ? recortarOpcionesArticulo(p.opciones, p.correcta, numOpciones)
          : { opciones: p.opciones, correcta: p.correcta };
        return {
          id: p.id,
          origen: 'test',
          enunciado: p.enunciado,
          opciones,
          correcta,
          explicacion: p.explicacion ?? null,
          imagenUrl: null,
          temaId: e.temaId,
        };
      })
      .filter((p): p is PreguntaJornada => !!p);
  }

  /** Domingo: última llamada a quien aún no ha jugado. */
  async enviarUltimaLlamada(liga: Liga, ahora: Date): Promise<void> {
    const jornadas = await this.jornadaRepo.find({
      where: {
        liga: { id: liga.id },
        estado: EstadoJornada.ABIERTA,
        avisoUltimaLlamadaEnviado: false,
        fechaUltimaLlamada: LessThanOrEqual(ahora),
        fechaCierre: MoreThan(ahora),
      },
    });
    for (const j of jornadas) {
      const marcado = await this.jornadaRepo.update(
        { id: j.id, avisoUltimaLlamadaEnviado: false },
        { avisoUltimaLlamadaEnviado: true },
      );
      if (!marcado.affected) continue;
      const restanteH = Math.max(1, Math.round((new Date(j.fechaCierre).getTime() - ahora.getTime()) / 3_600_000));
      await this.avisarDivision(
        liga,
        j.division,
        'avisoDomingo',
        {
          titulo: 'Última llamada: la jornada cierra pronto',
          mensaje: `Quedan unas ${restanteH} h para cerrar la jornada (${j.descripcion}). ¡No te quedes sin puntos!`,
        },
        j.id,
      );
    }
  }

  /** Domingo a la hora de cierre: posiciones y puntos definitivos. */
  async cerrarJornadasVencidas(liga: Liga, ahora: Date): Promise<void> {
    const jornadas = await this.jornadaRepo.find({
      where: { liga: { id: liga.id }, estado: EstadoJornada.ABIERTA, fechaCierre: LessThanOrEqual(ahora) },
    });
    for (const j of jornadas) await this.cerrarJornada(liga, j);
  }

  private async cerrarJornada(liga: Liga, jornada: JornadaLiga): Promise<void> {
    await this.jornadaRepo.manager.transaction(async (manager) => {
      const marcado = await manager
        .createQueryBuilder()
        .update(JornadaLiga)
        .set({ estado: EstadoJornada.CERRADA })
        .where('id = :id AND estado = :abierta', { id: jornada.id, abierta: EstadoJornada.ABIERTA })
        .execute();
      if (!marcado.affected) return;

      const resultados = await manager.find(ResultadoJornada, { where: { jornada: { id: jornada.id } } });
      const limiteMs = this.limiteMs(jornada);

      // Quien empezó y no envió: se corrige lo que guardó, con el tiempo máximo
      for (const r of resultados) {
        if (r.enviadoEn) continue;
        Object.assign(r, this.corregir(jornada, liga.convocatoria, r.respuestas));
        r.enviadoEn = new Date(jornada.fechaCierre);
        r.tiempoMs = limiteMs;
      }

      this.asignarPosicionesYPuntos(resultados, liga.bonusParticipacion);
      if (resultados.length) await manager.save(ResultadoJornada, resultados);
    });
  }

  /** Posición por nota (desc) y tiempo (asc); empate total comparte posición. */
  asignarPosicionesYPuntos(resultados: ResultadoJornada[], bonus: number): void {
    const orden = [...resultados].sort(
      (a, b) => Number(b.nota ?? 0) - Number(a.nota ?? 0) || (a.tiempoMs ?? 0) - (b.tiempoMs ?? 0),
    );
    const n = orden.length;
    orden.forEach((r, i) => {
      const anterior = orden[i - 1];
      const empata =
        anterior && Number(anterior.nota ?? 0) === Number(r.nota ?? 0) && (anterior.tiempoMs ?? 0) === (r.tiempoMs ?? 0);
      r.posicion = empata ? anterior.posicion : i + 1;
      const base = n <= 1 ? 100 : (100 * (n - (r.posicion as number))) / (n - 1);
      r.puntos = redondear(base + (bonus ?? 0), 1);
    });
  }

  private limiteMs(jornada: JornadaLiga): number {
    return jornada.numPreguntas * jornada.segundosPorPregunta * 1000;
  }

  /** Corrección en servidor con la penalización de la convocatoria. */
  corregir(
    jornada: JornadaLiga,
    convocatoria: Convocatoria,
    respuestas: (number | null)[] | undefined,
  ): Pick<ResultadoJornada, 'respuestas' | 'aciertos' | 'fallos' | 'blancos' | 'nota'> {
    const preguntas = jornada.preguntas ?? [];
    const limpias = this.limpiarRespuestas(jornada, respuestas);
    let aciertos = 0;
    let fallos = 0;
    let blancos = 0;
    preguntas.forEach((p, i) => {
      const r = limpias[i];
      if (r === null) blancos++;
      else if (r === p.correcta) aciertos++;
      else fallos++;
    });
    const frac = parseFraccion(convocatoria.fraccionPenalizacion);
    const fracBlanco = convocatoria.permiteBlancos === false ? parseFraccion(convocatoria.fraccionPenalizacionBlanco) : 0;
    const total = preguntas.length;
    const nota = total > 0 ? redondear(((aciertos - fallos * frac - blancos * fracBlanco) / total) * 10, 3) : 0;
    return { respuestas: limpias, aciertos, fallos, blancos, nota };
  }

  private limpiarRespuestas(jornada: JornadaLiga, respuestas: (number | null)[] | undefined): (number | null)[] {
    const preguntas = jornada.preguntas ?? [];
    const lista = Array.isArray(respuestas) ? respuestas : [];
    return preguntas.map((p, i) => {
      const r = lista[i];
      return typeof r === 'number' && Number.isInteger(r) && r >= 0 && r < p.opciones.length ? r : null;
    });
  }

  private async avisarDivision(
    liga: Liga,
    division: number,
    campo: 'avisoLunes' | 'avisoViernes' | 'avisoDomingo',
    texto: { titulo: string; mensaje: string },
    soloSinJugarJornadaId?: string,
  ): Promise<void> {
    const miembros = await this.miembroRepo
      .createQueryBuilder('m')
      .leftJoin('m.usuario', 'u')
      .select('u.id', 'usuarioId')
      .where('m."ligaId" = :ligaId', { ligaId: liga.id })
      .andWhere('m.division = :division', { division })
      .andWhere(`m."${campo}" = true`)
      .getRawMany();
    let ids: string[] = miembros.map((m: any) => m.usuarioId);
    if (soloSinJugarJornadaId && ids.length) {
      const jugados = await this.resultadoRepo
        .createQueryBuilder('r')
        .select('r."usuarioId"', 'usuarioId')
        .where('r."jornadaId" = :j', { j: soloSinJugarJornadaId })
        .andWhere('r."enviadoEn" IS NOT NULL')
        .getRawMany();
      const ya = new Set(jugados.map((x: any) => x.usuarioId));
      ids = ids.filter((id) => !ya.has(id));
    }
    await this.notificacionService.crearVarios(ids, {
      tipo: TipoNotificacion.LIGA,
      titulo: texto.titulo,
      mensaje: texto.mensaje,
      prioridad: PrioridadNotificacion.MEDIA,
      urlAccion: URL_LIGA,
    });
  }

  /* =========================================================
     USUARIO
  ========================================================= */

  private async ligaDelUsuario(usuarioId: string): Promise<{ liga: Liga | null; miembro: MiembroLiga | null; motivo?: string }> {
    const uo = await this.usuarioOposicionRepo.findOne({
      where: { usuario: { id: usuarioId } as any, activa: true },
      relations: ['convocatoriaActiva'],
    });
    const convId = uo?.convocatoriaActiva?.id;
    if (!convId) return { liga: null, miembro: null, motivo: 'sin_convocatoria' };

    const liga = await this.ligaRepo.findOne({
      where: { convocatoria: { id: convId } },
      relations: ['convocatoria', 'convocatoria.oposicion'],
    });
    if (!liga) return { liga: null, miembro: null, motivo: 'sin_liga' };

    let miembro = await this.miembroRepo.findOne({ where: { liga: { id: liga.id }, usuario: { id: usuarioId } } });
    if (!miembro && liga.estado !== EstadoLiga.CERRADA) {
      try {
        miembro = await this.miembroRepo.save(
          this.miembroRepo.create({ liga: { id: liga.id } as any, usuario: { id: usuarioId } as any }),
        );
      } catch {
        miembro = await this.miembroRepo.findOne({ where: { liga: { id: liga.id }, usuario: { id: usuarioId } } });
      }
    }
    return { liga, miembro };
  }

  private jornadaPublica(j: JornadaLiga) {
    return {
      id: j.id,
      division: j.division,
      nombreDivision: NOMBRE_DIVISION[j.division],
      mes: j.mes,
      tipo: j.tipo,
      descripcion: j.descripcion,
      numPreguntas: j.numPreguntas,
      tiempoLimiteSeg: j.numPreguntas * j.segundosPorPregunta,
      fechaApertura: j.fechaApertura,
      fechaUltimaLlamada: j.fechaUltimaLlamada,
      fechaCierre: j.fechaCierre,
      estado: j.estado,
      motivoCancelacion: j.motivoCancelacion,
    };
  }

  private resultadoPublico(r: ResultadoJornada | null) {
    if (!r) return null;
    return {
      iniciado: true,
      enviado: !!r.enviadoEn,
      nota: r.nota != null ? Number(r.nota) : null,
      aciertos: r.aciertos,
      fallos: r.fallos,
      blancos: r.blancos,
      tiempoMs: r.tiempoMs,
      posicion: r.posicion,
      puntos: r.puntos != null ? Number(r.puntos) : null,
    };
  }

  /** Resumen para la pantalla de la liga (alta automática si hace falta). */
  async miLiga(usuarioId: string) {
    const { liga, miembro, motivo } = await this.ligaDelUsuario(usuarioId);
    if (!liga || !miembro) return { liga: null, motivo: motivo ?? 'sin_liga' };

    const ahora = new Date();
    const recientes = await this.jornadaRepo.find({
      where: { liga: { id: liga.id }, division: miembro.division },
      order: { fechaApertura: 'DESC' },
      take: 3,
    });
    const actual =
      recientes.find((j) => j.estado === EstadoJornada.ABIERTA) ??
      recientes
        .filter((j) => j.estado === EstadoJornada.PROGRAMADA && new Date(j.fechaApertura) > ahora)
        .sort((a, b) => +new Date(a.fechaApertura) - +new Date(b.fechaApertura))[0] ??
      recientes[0] ??
      null;

    let miResultado: ResultadoJornada | null = null;
    let participantes = 0;
    if (actual) {
      miResultado = await this.resultadoRepo.findOne({ where: { jornada: { id: actual.id }, usuario: { id: usuarioId } } });
      participantes = await this.resultadoRepo.count({
        where: { jornada: { id: actual.id }, enviadoEn: Not(IsNull()) },
      });
    }

    return {
      liga: {
        id: liga.id,
        estado: liga.estado,
        horaApertura: liga.horaApertura,
        horaCierre: liga.horaCierre,
        porcentajeAscenso: liga.porcentajeAscenso,
      },
      convocatoria: { id: liga.convocatoria.id, anyo: liga.convocatoria.anyo },
      division: miembro.division,
      nombreDivision: NOMBRE_DIVISION[miembro.division],
      avisos: { lunes: miembro.avisoLunes, viernes: miembro.avisoViernes, domingo: miembro.avisoDomingo },
      jornada: actual ? this.jornadaPublica(actual) : null,
      miResultado: this.resultadoPublico(miResultado),
      participantes,
      copas: (await this.palmares(usuarioId)).resumen,
    };
  }

  private async jornadaParaJugar(usuarioId: string, jornadaId: string) {
    const jornada = await this.jornadaRepo.findOne({
      where: { id: jornadaId },
      relations: ['liga', 'liga.convocatoria'],
    });
    if (!jornada) throw new NotFoundException('Jornada no encontrada');
    const miembro = await this.miembroRepo.findOne({
      where: { liga: { id: jornada.liga.id }, usuario: { id: usuarioId } },
    });
    if (!miembro) throw new ForbiddenException('No participas en esta liga');
    return { jornada, miembro };
  }

  /** Empieza (o retoma) la jornada: el reloj lo lleva el servidor. */
  async empezar(usuarioId: string, jornadaId: string) {
    const { jornada, miembro } = await this.jornadaParaJugar(usuarioId, jornadaId);
    const ahora = new Date();
    if (jornada.estado !== EstadoJornada.ABIERTA || ahora >= new Date(jornada.fechaCierre)) {
      throw new BadRequestException('Esta jornada no está abierta');
    }
    if (miembro.division !== jornada.division) {
      throw new ForbiddenException('Esta jornada es de otra división');
    }

    let resultado = await this.resultadoRepo.findOne({ where: { jornada: { id: jornada.id }, usuario: { id: usuarioId } } });
    if (!resultado) {
      try {
        resultado = await this.resultadoRepo.save(
          this.resultadoRepo.create({
            jornada: { id: jornada.id } as any,
            usuario: { id: usuarioId } as any,
            division: jornada.division,
            respuestas: [],
            iniciadoEn: ahora,
          }),
        );
      } catch {
        resultado = await this.resultadoRepo.findOne({ where: { jornada: { id: jornada.id }, usuario: { id: usuarioId } } });
      }
    }
    if (!resultado) throw new BadRequestException('No se pudo empezar la jornada');
    if (resultado.enviadoEn) throw new BadRequestException('Ya has jugado esta jornada');

    const fin = this.finPartida(jornada, resultado);
    const restanteMs = fin - ahora.getTime();
    if (restanteMs <= 0) {
      // Se le acabó el tiempo fuera de la pantalla: se corrige lo guardado
      return { terminado: true, resultado: await this.finalizar(jornada, resultado, resultado.respuestas, true) };
    }

    return {
      terminado: false,
      jornada: this.jornadaPublica(jornada),
      preguntas: (jornada.preguntas ?? []).map((p) => ({
        id: p.id,
        enunciado: p.enunciado,
        opciones: p.opciones,
        imagenUrl: p.imagenUrl ?? null,
      })),
      respuestas: this.limpiarRespuestas(jornada, resultado.respuestas),
      iniciadoEn: resultado.iniciadoEn,
      segundosRestantes: Math.ceil(restanteMs / 1000),
    };
  }

  /** Instante (ms) en que se acaba la partida: tiempo límite o cierre de la jornada. */
  private finPartida(jornada: JornadaLiga, resultado: ResultadoJornada): number {
    return Math.min(
      new Date(resultado.iniciadoEn).getTime() + this.limiteMs(jornada),
      new Date(jornada.fechaCierre).getTime(),
    );
  }

  /** Guarda las respuestas sobre la marcha (para retomar si se cierra la app). */
  async guardarProgreso(usuarioId: string, jornadaId: string, respuestas: (number | null)[]) {
    const { jornada } = await this.jornadaParaJugar(usuarioId, jornadaId);
    const resultado = await this.resultadoRepo.findOne({ where: { jornada: { id: jornada.id }, usuario: { id: usuarioId } } });
    if (!resultado || resultado.enviadoEn) throw new BadRequestException('No hay partida en curso');
    if (Date.now() > this.finPartida(jornada, resultado) + MARGEN_ENVIO_MS) {
      throw new BadRequestException('Se ha agotado el tiempo');
    }
    await this.resultadoRepo.update(
      { id: resultado.id, enviadoEn: IsNull() },
      { respuestas: this.limpiarRespuestas(jornada, respuestas) as any },
    );
    return { ok: true };
  }

  async enviar(usuarioId: string, jornadaId: string, respuestas: (number | null)[]) {
    const { jornada } = await this.jornadaParaJugar(usuarioId, jornadaId);
    if (jornada.estado !== EstadoJornada.ABIERTA) throw new BadRequestException('La jornada ya ha cerrado');
    const resultado = await this.resultadoRepo.findOne({ where: { jornada: { id: jornada.id }, usuario: { id: usuarioId } } });
    if (!resultado) throw new BadRequestException('Primero tienes que empezar la jornada');
    if (resultado.enviadoEn) throw new BadRequestException('Ya has enviado esta jornada');

    // Fuera de plazo: cuenta lo que tuviera guardado, no lo que llegue ahora
    const tarde = Date.now() > this.finPartida(jornada, resultado) + MARGEN_ENVIO_MS;
    const final = await this.finalizar(jornada, resultado, tarde ? resultado.respuestas : respuestas, tarde);
    await registrarDiaDeEstudio(this.resultadoRepo.manager, usuarioId); // ⭐ cuenta para la racha
    return final;
  }

  private async finalizar(
    jornada: JornadaLiga,
    resultado: ResultadoJornada,
    respuestas: (number | null)[],
    tiempoAgotado: boolean,
  ) {
    const ahora = new Date();
    const correccion = this.corregir(jornada, jornada.liga.convocatoria, respuestas);
    const limite = this.limiteMs(jornada);
    const tiempoMs = tiempoAgotado
      ? limite
      : Math.min(Math.max(0, ahora.getTime() - new Date(resultado.iniciadoEn).getTime()), limite);

    const marcado = await this.resultadoRepo
      .createQueryBuilder()
      .update(ResultadoJornada)
      .set({ ...correccion, respuestas: correccion.respuestas as any, enviadoEn: ahora, tiempoMs })
      .where('id = :id AND "enviadoEn" IS NULL', { id: resultado.id })
      .execute();
    if (!marcado.affected) throw new BadRequestException('Ya has enviado esta jornada');

    const nota = Number(correccion.nota);
    const enviados = await this.resultadoRepo
      .createQueryBuilder('r')
      .where('r."jornadaId" = :j', { j: jornada.id })
      .andWhere('r."enviadoEn" IS NOT NULL')
      .select(['r.id', 'r.nota', 'r.tiempoMs'])
      .getMany();
    const delante = enviados.filter(
      (r) => Number(r.nota) > nota || (Number(r.nota) === nota && (r.tiempoMs ?? 0) < tiempoMs),
    ).length;

    return {
      nota,
      aciertos: correccion.aciertos,
      fallos: correccion.fallos,
      blancos: correccion.blancos,
      tiempoMs,
      tiempoAgotado,
      posicionProvisional: delante + 1,
      participantes: enviados.length,
    };
  }

  /** Clasificación de una jornada: provisional mientras está abierta. */
  async clasificacionJornada(usuarioId: string, jornadaId: string) {
    const { jornada } = await this.jornadaParaJugar(usuarioId, jornadaId);
    const resultados = await this.resultadoRepo
      .createQueryBuilder('r')
      .leftJoin('r.usuario', 'u')
      .addSelect(['u.id', 'u.nick', 'u.nombre', 'u.tipoAvatar', 'u.avatarUrl'])
      .where('r."jornadaId" = :j', { j: jornada.id })
      .andWhere('r."enviadoEn" IS NOT NULL')
      .getMany();

    const cerrada = jornada.estado === EstadoJornada.CERRADA;
    if (!cerrada) this.asignarPosicionesYPuntos(resultados, 0); // solo para ordenar; los puntos no se muestran
    resultados.sort((a, b) => (a.posicion ?? 0) - (b.posicion ?? 0));

    return {
      jornada: this.jornadaPublica(jornada),
      provisional: !cerrada,
      filas: resultados.map((r) => ({
        posicion: r.posicion,
        usuario: {
          id: (r.usuario as any)?.id,
          nick: (r.usuario as any)?.nick,
          nombre: (r.usuario as any)?.nombre,
          tipoAvatar: (r.usuario as any)?.tipoAvatar,
          avatarUrl: (r.usuario as any)?.avatarUrl,
        },
        nota: r.nota != null ? Number(r.nota) : null,
        aciertos: r.aciertos,
        fallos: r.fallos,
        blancos: r.blancos,
        tiempoMs: r.tiempoMs,
        puntos: cerrada && r.puntos != null ? Number(r.puntos) : null,
        esYo: (r.usuario as any)?.id === usuarioId,
      })),
    };
  }

  /** Revisión con soluciones: solo cuando la jornada ha cerrado. */
  async revision(usuarioId: string, jornadaId: string) {
    const { jornada } = await this.jornadaParaJugar(usuarioId, jornadaId);
    if (jornada.estado !== EstadoJornada.CERRADA) {
      throw new BadRequestException('Las soluciones se publican al cerrar la jornada');
    }
    const resultado = await this.resultadoRepo.findOne({ where: { jornada: { id: jornada.id }, usuario: { id: usuarioId } } });
    const respuestas = this.limpiarRespuestas(jornada, resultado?.respuestas);
    return {
      jornada: this.jornadaPublica(jornada),
      resultado: this.resultadoPublico(resultado),
      preguntas: (jornada.preguntas ?? []).map((p, i) => ({
        id: p.id,
        enunciado: p.enunciado,
        opciones: p.opciones,
        imagenUrl: p.imagenUrl ?? null,
        correcta: p.correcta,
        explicacion: p.explicacion ?? null,
        tuRespuesta: respuestas[i],
      })),
    };
  }

  async actualizarAvisos(usuarioId: string, body: any) {
    const { miembro } = await this.ligaDelUsuario(usuarioId);
    if (!miembro) throw new NotFoundException('No participas en ninguna liga');
    const cambios: Partial<MiembroLiga> = {};
    if (typeof body?.lunes === 'boolean') cambios.avisoLunes = body.lunes;
    if (typeof body?.viernes === 'boolean') cambios.avisoViernes = body.viernes;
    if (typeof body?.domingo === 'boolean') cambios.avisoDomingo = body.domingo;
    if (Object.keys(cambios).length) await this.miembroRepo.update(miembro.id, cambios);
    return { ok: true };
  }

  /* =========================================================
     ADMIN (base; el módulo completo de admin es la fase C)
  ========================================================= */

  async crearLiga(convocatoriaId: string) {
    const convocatoria = await this.convocatoriaRepo.findOne({ where: { id: convocatoriaId } });
    if (!convocatoria) throw new NotFoundException('Convocatoria no encontrada');
    const existente = await this.ligaRepo.findOne({ where: { convocatoria: { id: convocatoriaId } } });
    if (existente) return existente;

    const liga = await this.ligaRepo.save(this.ligaRepo.create({ convocatoria: { id: convocatoriaId } as any }));
    await this.divisionRepo.save(
      DIVISIONES_POR_DEFECTO.map((d) =>
        this.divisionRepo.create({
          liga: { id: liga.id } as any,
          division: d.division,
          modo: d.modo,
          temasPorJornada: d.temasPorJornada,
          numPreguntas: d.numPreguntas,
          segundosPorPregunta: LIGA_POR_DEFECTO.segundosPorPregunta,
          bloqueMensual: d.bloqueMensual,
        }),
      ),
    );
    return liga;
  }

  async listarLigas() {
    const ligas = await this.ligaRepo.find({
      relations: ['convocatoria', 'convocatoria.oposicion'],
      order: { creadoEn: 'DESC' },
    });
    const conteos = await this.miembroRepo
      .createQueryBuilder('m')
      .select('m."ligaId"', 'ligaId')
      .addSelect('m.division', 'division')
      .addSelect('COUNT(*)', 'total')
      .groupBy('m."ligaId"')
      .addGroupBy('m.division')
      .getRawMany();
    return ligas.map((l) => ({
      ...l,
      convocatoria: {
        id: l.convocatoria?.id,
        anyo: l.convocatoria?.anyo,
        fechaExamen: l.convocatoria?.fechaExamen,
        oposicion: { id: (l.convocatoria as any)?.oposicion?.id, nombre: (l.convocatoria as any)?.oposicion?.nombre },
      },
      miembrosPorDivision: conteos
        .filter((c: any) => c.ligaId === l.id)
        .reduce((acc: Record<number, number>, c: any) => ({ ...acc, [c.division]: Number(c.total) }), {}),
    }));
  }

  async detalleLiga(id: string) {
    const liga = await this.ligaRepo.findOne({ where: { id }, relations: ['convocatoria', 'convocatoria.oposicion'] });
    if (!liga) throw new NotFoundException('Liga no encontrada');
    const divisiones = await this.divisionRepo.find({ where: { liga: { id } }, order: { division: 'ASC' } });
    return { liga, divisiones };
  }

  async actualizarLiga(id: string, body: any) {
    const liga = await this.ligaRepo.findOne({ where: { id } });
    if (!liga) throw new NotFoundException('Liga no encontrada');
    const cambios: Partial<Liga> = {};
    if (body?.estado !== undefined) {
      if (!Object.values(EstadoLiga).includes(body.estado)) throw new BadRequestException('Estado no válido');
      cambios.estado = body.estado;
    }
    if (body?.porcentajeAscenso !== undefined) {
      const v = Math.trunc(Number(body.porcentajeAscenso));
      if (!(v >= 1 && v <= 100)) throw new BadRequestException('El % de ascenso debe estar entre 1 y 100');
      cambios.porcentajeAscenso = v;
    }
    if (body?.bonusParticipacion !== undefined) {
      const v = Math.trunc(Number(body.bonusParticipacion));
      if (!(v >= 0 && v <= 100)) throw new BadRequestException('El bonus debe estar entre 0 y 100');
      cambios.bonusParticipacion = v;
    }
    for (const campo of ['horaAviso', 'horaApertura', 'horaUltimaLlamada', 'horaCierre'] as const) {
      if (body?.[campo] !== undefined) {
        if (!REGEX_HORA.test(String(body[campo]))) throw new BadRequestException(`${campo} debe tener formato HH:mm`);
        cambios[campo] = String(body[campo]);
      }
    }
    if (Object.keys(cambios).length) await this.ligaRepo.update(id, cambios);
    return this.detalleLiga(id);
  }

  async actualizarDivision(ligaId: string, division: number, body: any) {
    const div = await this.divisionRepo.findOne({ where: { liga: { id: ligaId }, division } });
    if (!div) throw new NotFoundException('División no encontrada');
    const cambios: Partial<DivisionLiga> = {};
    if (body?.modo !== undefined) {
      if (!Object.values(ModoDivision).includes(body.modo)) throw new BadRequestException('Modo no válido');
      cambios.modo = body.modo;
    }
    const enteros: [keyof DivisionLiga, number, number][] = [
      ['temasPorJornada', 0, 60],
      ['numPreguntas', 5, 100],
      ['segundosPorPregunta', 10, 300],
      ['cursorTema', 0, 10000],
      ['cursorBloque', 0, 10000],
    ];
    for (const [campo, min, max] of enteros) {
      if (body?.[campo] !== undefined) {
        const v = Math.trunc(Number(body[campo]));
        if (!(v >= min && v <= max)) throw new BadRequestException(`${String(campo)} debe estar entre ${min} y ${max}`);
        (cambios as any)[campo] = v;
      }
    }
    if (typeof body?.bloqueMensual === 'boolean') cambios.bloqueMensual = body.bloqueMensual;
    if (Object.keys(cambios).length) await this.divisionRepo.update(div.id, cambios);
    return this.divisionRepo.findOne({ where: { id: div.id } });
  }

  async listarJornadas(ligaId: string) {
    const jornadas = await this.jornadaRepo.find({
      where: { liga: { id: ligaId } },
      order: { fechaApertura: 'DESC', division: 'ASC' },
      take: 100,
    });
    const conteos = jornadas.length
      ? await this.resultadoRepo
          .createQueryBuilder('r')
          .select('r."jornadaId"', 'jornadaId')
          .addSelect('COUNT(*)', 'total')
          .where('r."jornadaId" IN (:...ids)', { ids: jornadas.map((j) => j.id) })
          .andWhere('r."enviadoEn" IS NOT NULL')
          .groupBy('r."jornadaId"')
          .getRawMany()
      : [];
    const porJornada = new Map(conteos.map((c: any) => [c.jornadaId, Number(c.total)]));
    return jornadas.map((j) => ({ ...this.jornadaPublica(j), fijadaPorAdmin: j.fijadaPorAdmin, participantes: porJornada.get(j.id) ?? 0 }));
  }

  /**
   * Fija (o cambia) la jornada de un fin de semana para una división:
   * temas concretos, un bloque, todo el temario o psicotécnicos.
   * body: { division, viernes: 'AAAA-MM-DD', tipo, temaIds?, bloque?, numPreguntas?, segundosPorPregunta? }
   */
  async fijarJornada(ligaId: string, body: any) {
    const liga = await this.ligaRepo.findOne({ where: { id: ligaId }, relations: ['convocatoria'] });
    if (!liga) throw new NotFoundException('Liga no encontrada');
    const division = Math.trunc(Number(body?.division));
    const div = await this.divisionRepo.findOne({ where: { liga: { id: ligaId }, division } });
    if (!div) throw new BadRequestException('División no válida');
    const viernes = parsearFecha(body?.viernes);
    if (!viernes || diaSemanaDe(viernes) !== 5) throw new BadRequestException('"viernes" debe ser un viernes (AAAA-MM-DD)');
    if (!Object.values(TipoJornada).includes(body?.tipo)) throw new BadRequestException('Tipo de jornada no válido');

    const domingo = sumarDias(viernes.y, viernes.m, viernes.d, 2);
    const sabado = sumarDias(viernes.y, viernes.m, viernes.d, 1);
    const apertura = fechaMadrid(viernes.y, viernes.m, viernes.d, liga.horaApertura);
    if (apertura <= new Date()) throw new BadRequestException('Solo se pueden fijar jornadas que aún no han abierto');

    const temario = await this.temarioDe(liga.convocatoria.id);
    let temaIds: string[] = [];
    let bloque: string | null = null;
    let descripcion = '';
    switch (body.tipo as TipoJornada) {
      case TipoJornada.TEMAS: {
        const pedidos: string[] = Array.isArray(body.temaIds) ? body.temaIds : [];
        const temas = temario.temas.filter((t) => pedidos.includes(t.id));
        if (temas.length === 0) throw new BadRequestException('Elige al menos un tema de esta convocatoria');
        temaIds = temas.map((t) => t.id);
        descripcion = describirTemas(temas);
        break;
      }
      case TipoJornada.BLOQUE: {
        const b = temario.bloques.find((x) => x.nombre === body.bloque);
        if (!b) throw new BadRequestException('Bloque no encontrado en el temario');
        temaIds = b.temas.map((t) => t.id);
        bloque = b.nombre;
        descripcion = `Bloque ${b.nombre}`;
        break;
      }
      case TipoJornada.TEMARIO:
        temaIds = temario.temas.map((t) => t.id);
        descripcion = 'Todo el temario';
        break;
      case TipoJornada.PSICOTECNICO:
        descripcion = 'Psicotécnicos';
        break;
    }

    const numPreguntas = body.numPreguntas !== undefined ? Math.trunc(Number(body.numPreguntas)) : div.numPreguntas;
    const segundos = body.segundosPorPregunta !== undefined ? Math.trunc(Number(body.segundosPorPregunta)) : div.segundosPorPregunta;
    if (!(numPreguntas >= 5 && numPreguntas <= 100)) throw new BadRequestException('numPreguntas entre 5 y 100');
    if (!(segundos >= 10 && segundos <= 300)) throw new BadRequestException('segundosPorPregunta entre 10 y 300');

    const datos = {
      mes: mesDe(sabado),
      tipo: body.tipo as TipoJornada,
      temaIds,
      bloque,
      descripcion,
      numPreguntas,
      segundosPorPregunta: segundos,
      fechaApertura: apertura,
      fechaUltimaLlamada: fechaMadrid(domingo.y, domingo.m, domingo.d, liga.horaUltimaLlamada),
      fechaCierre: fechaMadrid(domingo.y, domingo.m, domingo.d, liga.horaCierre),
      fijadaPorAdmin: true,
    };

    const existente = await this.jornadaRepo.findOne({ where: { liga: { id: ligaId }, division, fechaApertura: apertura } });
    if (existente) {
      if (existente.estado !== EstadoJornada.PROGRAMADA && existente.estado !== EstadoJornada.CANCELADA) {
        throw new BadRequestException('Esa jornada ya está abierta o cerrada');
      }
      await this.jornadaRepo.update(existente.id, { ...datos, estado: EstadoJornada.PROGRAMADA, motivoCancelacion: null, preguntas: null } as any);
      return this.jornadaPublica((await this.jornadaRepo.findOne({ where: { id: existente.id } }))!);
    }
    const nueva = await this.jornadaRepo.save(this.jornadaRepo.create({ ...datos, liga: { id: ligaId } as any, division }));
    return this.jornadaPublica(nueva);
  }

  /** Para probar: abre ya una jornada programada. */
  async forzarApertura(jornadaId: string) {
    const jornada = await this.jornadaRepo.findOne({
      where: { id: jornadaId },
      relations: ['liga', 'liga.convocatoria', 'liga.convocatoria.oposicion'],
    });
    if (!jornada) throw new NotFoundException('Jornada no encontrada');
    if (jornada.estado !== EstadoJornada.PROGRAMADA) throw new BadRequestException('Solo se pueden abrir jornadas programadas');
    const ahora = new Date();
    if (new Date(jornada.fechaCierre) <= ahora) throw new BadRequestException('La fecha de cierre ya ha pasado');
    await this.jornadaRepo.update(jornada.id, { fechaApertura: ahora });
    jornada.fechaApertura = ahora;
    await this.abrirJornada(jornada.liga, jornada);
    return this.jornadaPublica((await this.jornadaRepo.findOne({ where: { id: jornada.id } }))!);
  }

  /** Para probar: cierra ya una jornada abierta (posiciones y puntos). */
  async forzarCierre(jornadaId: string) {
    const jornada = await this.jornadaRepo.findOne({
      where: { id: jornadaId },
      relations: ['liga', 'liga.convocatoria'],
    });
    if (!jornada) throw new NotFoundException('Jornada no encontrada');
    if (jornada.estado !== EstadoJornada.ABIERTA) throw new BadRequestException('Solo se pueden cerrar jornadas abiertas');
    const ahora = new Date();
    await this.jornadaRepo.update(jornada.id, { fechaCierre: ahora });
    jornada.fechaCierre = ahora;
    await this.cerrarJornada(jornada.liga, jornada);
    return this.jornadaPublica((await this.jornadaRepo.findOne({ where: { id: jornada.id } }))!);
  }

  /** Para probar: ejecuta ya la tarea periódica de una liga. */
  async ejecutarAhora(ligaId: string) {
    const liga = await this.ligaRepo.findOne({
      where: { id: ligaId },
      relations: ['convocatoria', 'convocatoria.oposicion'],
    });
    if (!liga) throw new NotFoundException('Liga no encontrada');
    await this.procesarLiga(liga, new Date());
    return this.listarJornadas(ligaId);
  }

  /* =========================================================
     FASE B — CLASIFICACIONES, CIERRE DE MES, ASCENSOS Y COPAS
  ========================================================= */

  private mesActual(ahora = new Date()): string {
    return mesDe(partesMadrid(ahora));
  }

  /** Puntos de un mes en una división (solo jornadas cerradas). */
  private async filasMes(ligaId: string, mes: string, division: number, manager = this.ligaRepo.manager): Promise<FilaMensual[]> {
    const filas = await manager.query(
      `SELECT r."usuarioId" AS "usuarioId",
              COALESCE(SUM(r.puntos), 0) AS puntos,
              COUNT(*) AS jugadas,
              SUM(CASE WHEN r.posicion = 1 THEN 1 ELSE 0 END) AS ganadas,
              COALESCE(MAX(r.nota), 0) AS "mejorNota"
         FROM resultados_jornada r
         JOIN jornadas_liga j ON j.id = r."jornadaId"
        WHERE j."ligaId" = $1 AND j.mes = $2 AND j.division = $3
          AND j.estado = 'cerrada' AND r."enviadoEn" IS NOT NULL
        GROUP BY r."usuarioId"`,
      [ligaId, mes, division],
    );
    return filas.map((f: any) => ({
      usuarioId: f.usuarioId,
      puntos: redondear(Number(f.puntos), 1),
      jornadasJugadas: Number(f.jugadas),
      jornadasGanadas: Number(f.ganadas),
      mejorNota: redondear(Number(f.mejorNota), 3),
    }));
  }

  /** Puntos de toda la liga, cada jornada multiplicada por el peso de su división. */
  private async filasGeneral(ligaId: string): Promise<{ usuarioId: string; puntos: number; jornadasJugadas: number; posicion?: number }[]> {
    const casos = Object.entries(COEFICIENTE_DIVISION)
      .map(([d, c]) => `WHEN ${Number(d)} THEN ${Number(c)}`)
      .join(' ');
    const filas = await this.ligaRepo.query(
      `SELECT r."usuarioId" AS "usuarioId",
              COALESCE(SUM(r.puntos * (CASE r.division ${casos} ELSE 1 END)), 0) AS puntos,
              COUNT(*) AS jugadas
         FROM resultados_jornada r
         JOIN jornadas_liga j ON j.id = r."jornadaId"
        WHERE j."ligaId" = $1 AND j.estado = 'cerrada' AND r."enviadoEn" IS NOT NULL
        GROUP BY r."usuarioId"`,
      [ligaId],
    );
    const orden = filas
      .map((f: any) => ({ usuarioId: f.usuarioId, puntos: redondear(Number(f.puntos), 1), jornadasJugadas: Number(f.jugadas) }))
      .sort((a: any, b: any) => b.puntos - a.puntos || b.jornadasJugadas - a.jornadasJugadas);
    orden.forEach((f: any, i: number) => {
      const ant = orden[i - 1];
      f.posicion = ant && ant.puntos === f.puntos && ant.jornadasJugadas === f.jornadasJugadas ? ant.posicion : i + 1;
    });
    return orden;
  }

  /** Datos públicos de usuarios (nunca email ni otros datos privados). */
  private async usuariosPublicos(ids: string[]): Promise<Map<string, any>> {
    if (!ids.length) return new Map();
    const filas = await this.ligaRepo.query(
      `SELECT id, nick, nombre, "tipoAvatar", "avatarUrl", "copaLiga" FROM usuarios WHERE id = ANY($1)`,
      [ids],
    );
    return new Map(filas.map((u: any) => [u.id, u]));
  }

  /** Cierra los meses terminados (todas sus jornadas cerradas) y, tras el examen, la temporada. */
  async cerrarMesesPendientes(liga: Liga, ahora = new Date()): Promise<void> {
    const mesActual = this.mesActual(ahora);
    const fechaExamen = liga.convocatoria?.fechaExamen ? new Date(liga.convocatoria.fechaExamen) : null;
    const examenPasado = !!fechaExamen && ahora > fechaExamen;

    const meses: { mes: string }[] = await this.ligaRepo.query(
      `SELECT DISTINCT mes FROM jornadas_liga
        WHERE "ligaId" = $1 AND ($2::varchar IS NULL OR mes > $2)
        ORDER BY mes ASC`,
      [liga.id, liga.ultimoMesCerrado ?? null],
    );
    for (const { mes } of meses) {
      if (mes >= mesActual && !examenPasado) break;
      const pendientes = await this.jornadaRepo.count({
        where: { liga: { id: liga.id }, mes, estado: In([EstadoJornada.PROGRAMADA, EstadoJornada.ABIERTA]) },
      });
      if (pendientes > 0) break;
      await this.cerrarMes(liga, mes);
    }

    if (examenPasado && liga.estado !== EstadoLiga.CERRADA) {
      const pendientes = await this.jornadaRepo.count({
        where: { liga: { id: liga.id }, estado: In([EstadoJornada.PROGRAMADA, EstadoJornada.ABIERTA]) },
      });
      if (pendientes === 0) await this.cerrarTemporada(liga);
    }
  }

  /** Cierre de un mes: tabla final por división, ascensos (sin descensos) y copas. */
  async cerrarMes(liga: Liga, mes: string): Promise<{ ascendidos: number; campeones: number } | null> {
    const avisos: { usuarioId: string; titulo: string; mensaje: string; esCampeon?: boolean }[] = [];
    let totalAscendidos = 0;
    let totalCampeones = 0;

    const hecho = await this.ligaRepo.manager.transaction(async (manager) => {
      // Guarda atómica: solo una ejecución cierra cada mes
      const marcado = await manager
        .createQueryBuilder()
        .update(Liga)
        .set({ ultimoMesCerrado: mes })
        .where('id = :id AND ("ultimoMesCerrado" IS NULL OR "ultimoMesCerrado" < :mes)', { id: liga.id, mes })
        .execute();
      if (!marcado.affected) return false;

      for (let division = 1; division <= 5; division++) {
        const orden = ordenarMensual(await this.filasMes(liga.id, mes, division, manager));
        if (!orden.length) continue;
        const cupo = division > 1 ? cupoAscenso(orden.length, liga.porcentajeAscenso) : 0;

        const cierres = orden.map((f) =>
          manager.create(CierreMesLiga, {
            liga: { id: liga.id } as any,
            mes,
            division,
            usuario: { id: f.usuarioId } as any,
            puntos: f.puntos,
            posicion: f.posicion!,
            jornadasJugadas: f.jornadasJugadas,
            jornadasGanadas: f.jornadasGanadas,
            ascendio: division > 1 && f.posicion! <= cupo,
            campeon: f.posicion === 1,
          }),
        );
        await manager.createQueryBuilder().insert().into(CierreMesLiga).values(cierres as any).orIgnore().execute();

        const ascendidos = cierres.filter((c) => c.ascendio).map((c) => (c.usuario as any).id as string);
        if (ascendidos.length) {
          await manager
            .createQueryBuilder()
            .update(MiembroLiga)
            .set({ division: division - 1 })
            .where('"ligaId" = :ligaId AND "usuarioId" IN (:...ids) AND division = :division', {
              ligaId: liga.id,
              ids: ascendidos,
              division,
            })
            .execute();
          totalAscendidos += ascendidos.length;
          for (const usuarioId of ascendidos) {
            avisos.push({
              usuarioId,
              titulo: `¡Has ascendido a ${NOMBRE_DIVISION[division - 1]}!`,
              mensaje: `Terminaste ${nombreMesTexto(mes)} entre el ${liga.porcentajeAscenso} % mejor de ${NOMBRE_DIVISION[division]}. Desde la próxima jornada juegas en ${NOMBRE_DIVISION[division - 1]}.`,
            });
          }
        }

        const campeones = cierres.filter((c) => c.campeon).map((c) => (c.usuario as any).id as string);
        if (campeones.length) {
          await manager
            .createQueryBuilder()
            .insert()
            .into(CopaLiga)
            .values(
              campeones.map((usuarioId) => ({
                usuario: { id: usuarioId } as any,
                liga: { id: liga.id } as any,
                mes,
                division,
                tipo: TipoCopa.MENSUAL,
              })) as any,
            )
            .execute();
          totalCampeones += campeones.length;
          for (const usuarioId of campeones) {
            avisos.push({
              usuarioId,
              titulo: `¡Campeón de ${NOMBRE_DIVISION[division]}! 🏆`,
              mensaje: `Has ganado ${NOMBRE_DIVISION[division]} en ${nombreMesTexto(mes)}. Tu copa ${TEXTO_COPA[division]} ya luce en tu avatar.`,
              esCampeon: true,
            });
          }
        }
      }
      return true;
    });

    if (!hecho) return null;
    await this.refrescarCopasUsuarios(avisos.filter((a) => a.esCampeon).map((a) => a.usuarioId));
    for (const a of avisos) {
      await this.notificacionService.crearVarios([a.usuarioId], {
        tipo: TipoNotificacion.LIGA,
        titulo: a.titulo,
        mensaje: a.mensaje,
        prioridad: PrioridadNotificacion.ALTA,
        urlAccion: URL_LIGA,
      });
    }
    this.logger.log(`Liga ${liga.id}: mes ${mes} cerrado (${totalAscendidos} ascensos, ${totalCampeones} campeones)`);
    return { ascendidos: totalAscendidos, campeones: totalCampeones };
  }

  /** Fin de temporada (tras el examen): copa al primero de la general y liga cerrada. */
  async cerrarTemporada(liga: Liga): Promise<void> {
    const marcado = await this.ligaRepo
      .createQueryBuilder()
      .update(Liga)
      .set({ estado: EstadoLiga.CERRADA })
      .where('id = :id AND estado <> :cerrada', { id: liga.id, cerrada: EstadoLiga.CERRADA })
      .execute();
    if (!marcado.affected) return;
    liga.estado = EstadoLiga.CERRADA;

    const general = await this.filasGeneral(liga.id);
    const campeones = general.filter((f) => f.posicion === 1);
    if (!campeones.length) return;
    const miembros = await this.miembroRepo.find({
      where: { liga: { id: liga.id }, usuario: { id: In(campeones.map((c) => c.usuarioId)) } },
      relations: ['usuario'],
    });
    const divisionDe = new Map(miembros.map((m) => [(m.usuario as any).id, m.division]));
    await this.copaRepo.insert(
      campeones.map((c) => ({
        usuario: { id: c.usuarioId } as any,
        liga: { id: liga.id } as any,
        mes: null,
        division: divisionDe.get(c.usuarioId) ?? 1,
        tipo: TipoCopa.TEMPORADA,
      })) as any,
    );
    await this.refrescarCopasUsuarios(campeones.map((c) => c.usuarioId));
    await this.notificacionService.crearVarios(
      campeones.map((c) => c.usuarioId),
      {
        tipo: TipoNotificacion.LIGA,
        titulo: '¡Campeón de la temporada! 🏆',
        mensaje: 'Has terminado primero en la clasificación general de la Liga Oplora de tu convocatoria.',
        prioridad: PrioridadNotificacion.ALTA,
        urlAccion: URL_LIGA,
      },
    );
  }

  /** Clasificación mensual de una división (por defecto, la tuya y el mes en curso). */
  async clasificacionMensual(usuarioId: string, mesPedido?: string, divisionPedida?: number) {
    const { liga, miembro } = await this.ligaDelUsuario(usuarioId);
    if (!liga || !miembro) throw new NotFoundException('No participas en ninguna liga');
    const mes = mesPedido && /^\d{4}-\d{2}$/.test(mesPedido) ? mesPedido : this.mesActual();
    const division =
      divisionPedida && divisionPedida >= 1 && divisionPedida <= 5 ? Math.trunc(divisionPedida) : miembro.division;

    const cerrado = !!liga.ultimoMesCerrado && liga.ultimoMesCerrado >= mes;
    let filas: (FilaMensual & { ascendio?: boolean; campeon?: boolean })[];
    if (cerrado) {
      const cierres = await this.cierreRepo.find({
        where: { liga: { id: liga.id }, mes, division },
        relations: ['usuario'],
        order: { posicion: 'ASC' },
      });
      filas = cierres.map((c) => ({
        usuarioId: (c.usuario as any).id,
        puntos: Number(c.puntos),
        jornadasJugadas: c.jornadasJugadas,
        jornadasGanadas: c.jornadasGanadas,
        mejorNota: 0,
        posicion: c.posicion,
        ascendio: c.ascendio,
        campeon: c.campeon,
      }));
    } else {
      filas = ordenarMensual(await this.filasMes(liga.id, mes, division));
    }
    const cupo = division > 1 ? cupoAscenso(filas.length, liga.porcentajeAscenso) : 0;
    const usuarios = await this.usuariosPublicos(filas.map((f) => f.usuarioId));

    return {
      mes,
      division,
      nombreDivision: NOMBRE_DIVISION[division],
      cerrado,
      porcentajeAscenso: liga.porcentajeAscenso,
      plazasAscenso: cupo,
      filas: filas.map((f) => ({
        posicion: f.posicion,
        usuario: usuarios.get(f.usuarioId) ?? { id: f.usuarioId },
        puntos: f.puntos,
        jornadasJugadas: f.jornadasJugadas,
        jornadasGanadas: f.jornadasGanadas,
        mejorNota: cerrado ? null : f.mejorNota,
        zonaAscenso: cerrado ? !!f.ascendio : division > 1 && (f.posicion ?? 0) <= cupo,
        campeon: cerrado ? !!f.campeon : false,
        esYo: f.usuarioId === usuarioId,
      })),
    };
  }

  /** Clasificación general de la liga (todas las divisiones, con su peso). */
  async clasificacionGeneral(usuarioId: string) {
    const { liga } = await this.ligaDelUsuario(usuarioId);
    if (!liga) throw new NotFoundException('No participas en ninguna liga');
    const filas = await this.filasGeneral(liga.id);
    const ids = filas.map((f) => f.usuarioId);
    const [usuarios, miembros] = await Promise.all([
      this.usuariosPublicos(ids),
      ids.length
        ? this.ligaRepo.query(`SELECT "usuarioId", division FROM miembros_liga WHERE "ligaId" = $1 AND "usuarioId" = ANY($2)`, [liga.id, ids])
        : Promise.resolve([]),
    ]);
    const divisionDe = new Map((miembros as any[]).map((m) => [m.usuarioId, Number(m.division)]));
    return {
      coeficientes: COEFICIENTE_DIVISION,
      cerrada: liga.estado === EstadoLiga.CERRADA,
      filas: filas.map((f) => ({
        posicion: f.posicion,
        usuario: usuarios.get(f.usuarioId) ?? { id: f.usuarioId },
        division: divisionDe.get(f.usuarioId) ?? null,
        nombreDivision: NOMBRE_DIVISION[divisionDe.get(f.usuarioId) ?? 0] ?? null,
        puntos: f.puntos,
        jornadasJugadas: f.jornadasJugadas,
        esYo: f.usuarioId === usuarioId,
      })),
    };
  }

  /** Recalcula la copa que se muestra en el avatar (usuarios.copaLiga). */
  async refrescarCopasUsuarios(usuarioIds: string[]): Promise<void> {
    for (const id of [...new Set(usuarioIds)]) {
      try {
        const { resumen } = await this.palmares(id);
        const copa = resumen.total
          ? resumen.temporadas
            ? { color: 'temporada', veces: resumen.temporadas, total: resumen.total }
            : { color: resumen.color as string, veces: resumen.veces, total: resumen.total }
          : null;
        await this.ligaRepo.query(`UPDATE usuarios SET "copaLiga" = $1::jsonb WHERE id = $2`, [
          copa ? JSON.stringify(copa) : null,
          id,
        ]);
      } catch (e) {
        this.logger.warn(`No se pudo actualizar la copa del usuario ${id}: ${(e as Error).message}`);
      }
    }
  }

  /** Admin: recalcula la copa del avatar de todos los que tienen copas (por si se tocan a mano). */
  async refrescarTodasLasCopas(): Promise<{ usuarios: number }> {
    const filas: { usuarioId: string }[] = await this.ligaRepo.query(
      `SELECT DISTINCT "usuarioId" FROM copas_liga WHERE "usuarioId" IS NOT NULL
       UNION SELECT id AS "usuarioId" FROM usuarios WHERE "copaLiga" IS NOT NULL`,
    );
    await this.refrescarCopasUsuarios(filas.map((f) => f.usuarioId));
    return { usuarios: filas.length };
  }

  /** Palmarés público de un usuario: sus copas y la mejor para mostrar en el avatar. */
  async palmares(usuarioId: string) {
    const copas = await this.copaRepo.find({
      where: { usuario: { id: usuarioId } },
      relations: ['liga', 'liga.convocatoria', 'liga.convocatoria.oposicion'],
      order: { creadoEn: 'DESC' },
    });
    const mensuales = copas.filter((c) => c.tipo === TipoCopa.MENSUAL);
    const mejorDivision = mensuales.length ? Math.min(...mensuales.map((c) => c.division)) : null;
    return {
      resumen: {
        temporadas: copas.filter((c) => c.tipo === TipoCopa.TEMPORADA).length,
        mejorDivision,
        color: mejorDivision ? COLOR_COPA[mejorDivision] : null,
        veces: mejorDivision ? mensuales.filter((c) => c.division === mejorDivision).length : 0,
        total: copas.length,
      },
      copas: copas.map((c) => ({
        id: c.id,
        tipo: c.tipo,
        mes: c.mes,
        division: c.division,
        nombreDivision: NOMBRE_DIVISION[c.division],
        color: c.tipo === TipoCopa.TEMPORADA ? 'temporada' : COLOR_COPA[c.division],
        convocatoria: {
          anyo: (c.liga as any)?.convocatoria?.anyo ?? null,
          oposicion: (c.liga as any)?.convocatoria?.oposicion?.nombre ?? null,
        },
        fecha: c.creadoEn,
      })),
    };
  }

  /** Admin, para probar: cierra ya un mes concreto (si todas sus jornadas están cerradas). */
  async forzarCierreMes(ligaId: string, mes: string) {
    if (!/^\d{4}-\d{2}$/.test(mes ?? '')) throw new BadRequestException('mes debe tener formato AAAA-MM');
    const liga = await this.ligaRepo.findOne({ where: { id: ligaId }, relations: ['convocatoria'] });
    if (!liga) throw new NotFoundException('Liga no encontrada');
    const pendientes = await this.jornadaRepo.count({
      where: { liga: { id: ligaId }, mes, estado: In([EstadoJornada.PROGRAMADA, EstadoJornada.ABIERTA]) },
    });
    if (pendientes > 0) throw new BadRequestException('Ese mes tiene jornadas sin cerrar');
    const r = await this.cerrarMes(liga, mes);
    if (!r) throw new BadRequestException('Ese mes ya estaba cerrado (o hay un mes posterior cerrado)');
    return r;
  }
}
