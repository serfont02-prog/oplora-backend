import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { registrarDiaDeEstudio } from '../common/helpers/consumo.helper';
import { InicioDueloService } from '../duelo/inicio-duelo.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Reto, TipoReto, EstadoReto } from './reto.entity';
import { ParticipacionReto } from './participacion-reto.entity';
import { Usuario } from '../usuario/usuario.entity';
import { Tema } from '../tema/tema.entity';
import { TestService } from '../test/test.service';
import { NotificacionService } from '../notificacion/notificacion.service';
import { TipoNotificacion, PrioridadNotificacion } from '../notificacion/notificacion.entity';
import { ContactoReciente } from './contacto-reciente.entity';
import { Convocatoria } from '../convocatoria/convocatoria.entity';
import { ConfiguracionService } from '../config/configuracion.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsuarioOposicion } from '../usuario/usuario-oposicion.entity';
import { SorteoReto } from './sorteo-reto.entity';

/** "1/3" → 0.333…, "0,25" → 0.25, vacío → 0 */
function parseFraccionReto(f: string | null | undefined): number {
  if (f == null || String(f).trim() === '') return 0;
  const s = String(f).trim().replace(',', '.');
  if (s.includes('/')) {
    const [a, b] = s.split('/').map(Number);
    return b ? a / b : 0;
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

/** Nota del duelo (participaciones antiguas sin puntuación: su % de acierto sobre 10). */
const notaDe = (p: { puntuacion?: number | null; porcentaje?: number | null }) =>
  p.puntuacion ?? (p.porcentaje ?? 0) / 10;
const fmtNota = (n: number) => n.toLocaleString('es-ES', { maximumFractionDigits: 2 });

// Reto al azar
const AZAR_MAX_RECIBIDOS_DIA = 3;   // retos al azar que puede recibir una persona en 24 h
const AZAR_MAX_SORTEOS_DIA = 10;    // sorteos que puede hacer cada uno en 24 h (incluye "otro rival")
const AZAR_DIAS_ACTIVO = 7;         // solo gente que ha entrado en la app en los últimos 7 días


@Injectable()
export class RetoService {
  constructor(
    @InjectRepository(Reto)
    private readonly retoRepo: Repository<Reto>,
    @InjectRepository(ParticipacionReto)
    private readonly participacionRepo: Repository<ParticipacionReto>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Tema)
    private readonly temaRepo: Repository<Tema>,
    @InjectRepository(Convocatoria)
    private readonly convocatoriaRepo: Repository<Convocatoria>,
    private readonly testService: TestService,
    private readonly notificacionService: NotificacionService,
    @InjectRepository(ContactoReciente)
    private readonly contactoRepo: Repository<ContactoReciente>,
    private readonly configuracionService: ConfiguracionService,
    @InjectRepository(UsuarioOposicion)
    private readonly usuarioOposicionRepo: Repository<UsuarioOposicion>,
    @InjectRepository(SorteoReto)
    private readonly sorteoRepo: Repository<SorteoReto>,
    private readonly inicioDuelo: InicioDueloService,
  ) {}

  // ─── RETO AL AZAR ────────────────────────────────────────

  /**
   * ⭐ Elige al azar un rival para quien no conoce a nadie. Candidatos:
   * - misma oposición y misma convocatoria activa que quien reta,
   * - con "Recibir retos al azar" activado (Notificaciones y avisos), cuenta activa y nick,
   * - que haya entrado en la app en los últimos 7 días,
   * - que no haya recibido ya 3 retos al azar en las últimas 24 h,
   * - sin un duelo de test en curso contigo y que no te haya tocado ya hoy.
   * Devuelve sus datos públicos; el reto se crea después con el flujo normal (test, flashcards o
   * psicotécnicos), usando su nick.
   */
  async sortearRival(retadorId: string, oposicionId: string) {
    if (!oposicionId) throw new BadRequestException('Falta la oposición');
    const uo = await this.usuarioOposicionRepo.findOne({
      where: { usuario: { id: retadorId } as any, oposicion: { id: oposicionId } as any, activa: true },
      relations: ['convocatoriaActiva'],
    });
    const convocatoriaId = uo?.convocatoriaActiva?.id;
    if (!convocatoriaId) throw new BadRequestException('Elige primero tu convocatoria para poder retar al azar');

    const hace24h = new Date(Date.now() - 24 * 3600_000);
    const sorteosHoy = await this.sorteoRepo
      .createQueryBuilder('s')
      .where('s."retadorId" = :yo', { yo: retadorId })
      .andWhere('s."creadoEn" >= :hace24h', { hace24h })
      .getCount();
    if (sorteosHoy >= AZAR_MAX_SORTEOS_DIA) {
      throw new BadRequestException('Has hecho muchos sorteos hoy. Vuelve a probar mañana o reta a alguien por su nick.');
    }

    const haceActivo = new Date(Date.now() - AZAR_DIAS_ACTIVO * 24 * 3600_000);
    const rival = await this.usuarioRepo
      .createQueryBuilder('u')
      .innerJoin(
        UsuarioOposicion, 'uo',
        'uo."usuario_id" = u.id AND uo.activa = true AND uo."oposicion_id" = :op AND uo."convocatoriaActivaId" = :conv',
        { op: oposicionId, conv: convocatoriaId },
      )
      .select(['u.id', 'u.nick', 'u.nombre', 'u.tipoAvatar', 'u.avatarUrl'])
      .addSelect('uo.nivel', 'nivel')
      .where('u.id != :yo', { yo: retadorId })
      .andWhere('u.activo = true')
      .andWhere('u."recibirRetosAleatorios" = true')
      .andWhere('u.nick IS NOT NULL')
      .andWhere('u."ultimoAcceso" >= :haceActivo', { haceActivo })
      .andWhere(
        `(SELECT COUNT(*) FROM sorteos_reto s WHERE s."retadoId" = u.id AND s."creadoEn" >= :hace24h) < :maxRecibidos`,
        { hace24h, maxRecibidos: AZAR_MAX_RECIBIDOS_DIA },
      )
      .andWhere(
        `NOT EXISTS (SELECT 1 FROM sorteos_reto s2 WHERE s2."retadorId" = :yo AND s2."retadoId" = u.id AND s2."creadoEn" >= :hace24h)`,
      )
      .andWhere(
        `NOT EXISTS (
          SELECT 1 FROM participaciones_reto p1
          JOIN participaciones_reto p2 ON p2."retoId" = p1."retoId"
          JOIN retos r ON r.id = p1."retoId"
          WHERE p1."usuarioId" = :yo AND p2."usuarioId" = u.id AND r.estado = 'activo'
        )`,
      )
      .orderBy('RANDOM()')
      .limit(1)
      .getRawAndEntities();

    const elegido = rival.entities[0];
    if (!elegido) {
      throw new NotFoundException('Ahora mismo no hay nadie disponible en tu convocatoria para un reto al azar. Prueba más tarde o invita a alguien.');
    }

    await this.sorteoRepo.save(this.sorteoRepo.create({
      retador: { id: retadorId } as any,
      retado: { id: elegido.id } as any,
    }));

    return {
      id: elegido.id,
      nick: elegido.nick,
      nombre: elegido.nombre,
      tipoAvatar: elegido.tipoAvatar,
      avatarUrl: elegido.avatarUrl,
      nivel: Number(rival.raw[0]?.nivel) || 1,
    };
  }

  // ─── EXPIRACIÓN ──────────────────────────────────────────

  @Cron(CronExpression.EVERY_HOUR)
  async revisarRetosExpirados() {
    const ahora = new Date();

    // ⭐ Sin filtrar por tipo: así también se cierran los antiguos retos diarios y
    // semanales (retirados hasta la Liga Oplora) que quedaron activos en la BD.
    const retosActivos = await this.retoRepo.find({
      where: {
        estado: EstadoReto.ACTIVO,
      },
    });

    for (const reto of retosActivos) {
      if (!reto.fechaFin || new Date(reto.fechaFin) > ahora) continue;
      await this.retoRepo.update(reto.id, { estado: EstadoReto.EXPIRADO });
      console.log(`Reto ${reto.id} marcado como expirado por caducidad`);
    }
  }

  // ─── RETO ENTRE USUARIOS ─────────────────────────────────

async crearRetoUsuario(
  retadorId: string,
  retadoNickOEmail: string,
  oposicionId: string,
  numPreguntas: number,
  temaId?: string,
  versionLeyId?: string,
  mensaje?: string,
  horasPlazo?: number,
): Promise<Reto> {
  const retador = await this.usuarioRepo.findOne({ where: { id: retadorId } });
  if (!retador) throw new NotFoundException('Retador no encontrado');

  // Buscar retado por nick o email
  let retado = await this.usuarioRepo.findOne({ where: { nick: retadoNickOEmail.toLowerCase().trim() } });
  if (!retado) retado = await this.usuarioRepo.findOne({ where: { email: retadoNickOEmail.toLowerCase().trim() } });
  if (!retado) throw new NotFoundException('Usuario no encontrado con ese nick o email');
  if (retado.id === retadorId) throw new BadRequestException('No puedes retarte a ti mismo');

  // ⭐ Verificar misma oposición y convocatoria
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

  const convocatoriaRetador = retadorOposicion.convocatoriaActiva?.id;
  const convocatoriaRetado = retadoOposicion.convocatoriaActiva?.id;
  if (convocatoriaRetador !== convocatoriaRetado) {
    throw new BadRequestException(`${retado.nick ?? retado.nombre} está en una convocatoria distinta a la tuya`);
  }

  // ⭐ Límite razonable: evita retos absurdamente largos/costosos por un valor manipulado del cliente
  const numPreguntasFinal = Math.min(Math.max(Math.trunc(numPreguntas) || 10, 1), 30);

  // ⭐ Con el id del retador: preguntas del temario de SU convocatoria y con el nº de opciones de
  // esa convocatoria (antes salían siempre 4 opciones aunque el examen fuera de 3, y podían
  // colarse preguntas de fuera de la convocatoria). Ambos están en la misma convocatoria.
  const preguntas = await this.testService.generarTest(
    oposicionId, numPreguntasFinal, temaId, versionLeyId,
    undefined, undefined, undefined, undefined, undefined,
    retadorId, undefined, true,
  );
  if (!preguntas.length) throw new BadRequestException('No hay preguntas disponibles para este reto');

   const horasPlazoFinal = horasPlazo && horasPlazo > 0 ? horasPlazo : 48;
   const fechaFin = new Date();
    fechaFin.setHours(fechaFin.getHours() + horasPlazoFinal);

    const reto = this.retoRepo.create({
  tipo: TipoReto.USUARIO,
  estado: EstadoReto.ACTIVO,
  nivelRequerido: 1,
  preguntas,
  fechaFin,
  mensaje: mensaje?.trim().slice(0, 140) || undefined,
  creador: { id: retadorId } as any,
  oposicion: { id: oposicionId } as any,
  tema: temaId ? { id: temaId } as any : undefined,
  });

    const retoGuardado = await this.retoRepo.save(reto);
    await this.guardarContactoReciente(retadorId, retado.id);

    // Crear participación del retador
    await this.participacionRepo.save(
      this.participacionRepo.create({
        reto: { id: retoGuardado.id } as any,
        usuario: { id: retadorId } as any,
      })
    );

    // Crear participación del retado
    await this.participacionRepo.save(
      this.participacionRepo.create({
        reto: { id: retoGuardado.id } as any,
        usuario: { id: retado.id } as any,
      })
    );

    // Notificar al retado
    await this.notificacionService.crear({
      usuarioId: retado.id,
      tipo: TipoNotificacion.RETO_RECIBIDO,
      titulo: `${retador.nick ?? retador.nombre} te reta ⚡`,
      mensaje: `Te han enviado un reto. Tienes ${horasPlazoFinal}h para completarlo. ¿Aceptas el desafío?`,
      prioridad: PrioridadNotificacion.MEDIA,
      urlAccion: `/app/retos/${retoGuardado.id}`,
    });

    // ⭐ El creador todavía no ha jugado: no se le devuelven las soluciones.
    this.ocultarSoluciones(retoGuardado, retadorId, false);
    return retoGuardado;
  }

  /**
   * ⭐ Quita lo que permitiría conocer las soluciones antes de jugar:
   * `correcta` y `explicacion` de cada pregunta y las respuestas corregidas de los
   * demás participantes (sus `respuestas` llevan si acertaron cada pregunta).
   */
  private ocultarSoluciones(reto: Reto | null | undefined, usuarioId: string, yaCompletado?: boolean): void {
    if (!reto) return;
    const completado =
      yaCompletado ??
      !!reto.participaciones?.find((p) => (p.usuario as any)?.id === usuarioId)?.completado;
    if (completado) return;
    reto.preguntas = (reto.preguntas ?? []).map((p: any) => {
      const { correcta, explicacion, ...resto } = p ?? {};
      return resto;
    });
    for (const p of reto.participaciones ?? []) {
      if ((p.usuario as any)?.id !== usuarioId) (p as any).respuestas = null;
    }
  }

  // ─── COMPLETAR RETO ──────────────────────────────────────

async completarReto(
  retoId: string,
  usuarioId: string,
  respuestasSeleccionadas: (number | null)[],
  tiempoSegundos: number,
): Promise<ParticipacionReto> {

  const participacion = await this.participacionRepo.findOne({
    where: {
      reto: { id: retoId },
      usuario: { id: usuarioId },
    },
    relations: ['usuario', 'reto'],
  });

  if (!participacion) throw new BadRequestException('No estás participando en este reto');
  if (participacion.completado) throw new BadRequestException('Ya completaste este reto');

    const reto = await this.retoRepo.findOne({
    where: { id: retoId },
    relations: ['participaciones', 'participaciones.usuario', 'oposicion'],
  });
  if (!reto) throw new NotFoundException('Reto no encontrado');

  const yaExpirado =
    reto.estado === EstadoReto.EXPIRADO ||
    (reto.fechaFin && new Date(reto.fechaFin) < new Date());
  if (yaExpirado) {
    if (reto.estado !== EstadoReto.EXPIRADO) {
      await this.retoRepo.update(reto.id, { estado: EstadoReto.EXPIRADO });
    }
    throw new BadRequestException('Este reto ya ha expirado, no puedes completarlo');
  }

  if (
    !Array.isArray(respuestasSeleccionadas) ||
    respuestasSeleccionadas.length !== reto.preguntas.length
  ) {
    throw new BadRequestException(
      'El número de respuestas no coincide con el número de preguntas del reto',
    );
  }

  // ⭐ Guarda de carrera: dos peticiones simultáneas podían pasar ambas el
  // chequeo "completado" de arriba (leído antes de que ninguna escribiera)
  // y acabar dando los puntos dos veces (darPuntosPorReto). Este UPDATE
  // condicional es atómico a nivel de base de datos: solo una de las dos
  // peticiones concurrentes logrará marcar completado=true (afecta 1 fila);
  // la otra afecta 0 filas y se corta aquí, sin volver a abonar puntos.
  const bloqueo = await this.participacionRepo
    .createQueryBuilder()
    .update(ParticipacionReto)
    .set({ completado: true })
    .where('id = :id AND completado = false', { id: participacion.id })
    .execute();
  if (!bloqueo.affected) {
    throw new BadRequestException('Ya completaste este reto');
  }

  // ⭐ La corrección se calcula en el servidor a partir de las preguntas
  // reales del reto, nunca a partir de lo que envíe el cliente.
  // null (o cualquier valor que no sea una opción válida) = pregunta en blanco.
  const respuestas = reto.preguntas.map((p: any, i: number) => {
    const v = respuestasSeleccionadas[i];
    const valida = Number.isInteger(v) && (v as number) >= 0 && (v as number) < (p.opciones?.length ?? 0);
    const seleccionada = valida ? (v as number) : null;
    return { seleccionada, correcta: seleccionada !== null && seleccionada === p.correcta, enBlanco: seleccionada === null };
  });
  const total = reto.preguntas.length;
  const correctas = respuestas.filter((r) => r.correcta).length;
  const blancos = respuestas.filter((r) => r.enBlanco).length;
  const fallos = total - correctas - blancos;
  const porcentaje = Math.round((correctas / total) * 100);

  // Penalización de la convocatoria (la misma que ve en la nota de los tests de Practicar)
  const uoPen = await this.usuarioOposicionRepo.findOne({
    where: { usuario: { id: usuarioId } as any, oposicion: { id: (reto.oposicion as any)?.id } as any },
    relations: ['convocatoriaActiva'],
  });
  const conv = uoPen?.convocatoriaActiva;
  const fraccion = parseFraccionReto(conv?.fraccionPenalizacion);
  const fraccionBlanco = conv?.permiteBlancos === false ? parseFraccionReto(conv?.fraccionPenalizacionBlanco) : 0;
  const puntuacion = Math.round(Math.max(0, ((correctas - fallos * fraccion - blancos * fraccionBlanco) / total) * 10) * 100) / 100;

  // ⭐ El tiempo que desempata lo mide el servidor (desde que pulsó "Empezar"); el que manda el
  // móvil ya no cuenta, porque se podía enviar 1 segundo y ganar cualquier empate.
  void tiempoSegundos;
  const tiempoServidor = Math.round(
    (await this.inicioDuelo.tiempoMs('test', reto.id, usuarioId, reto.creadoEn)) / 1000,
  );

  await this.participacionRepo.update(participacion.id, {
    completado: true,
    porcentaje,
    tiempoSegundos: tiempoServidor,
    respuestas,
    blancos,
    puntuacion,
  });

  // ⭐ Nota: al completar, todavía no sabemos si el usuario "gana" el reto (en los
  // retos de tipo USUARIO eso depende de que el rival también termine), así que aquí
  // solo se abonan los puntos por aciertos; el bonus por ganar (si aplica) se añade
  // más tarde en cerrarRetoUsuario y no llega a este toast de feedback inmediato.
  await registrarDiaDeEstudio(this.participacionRepo.manager, usuarioId); // ⭐ cuenta para la racha
  const gamificacion = await this.darPuntosPorReto(usuarioId, (reto.oposicion as any).id, correctas, false);

   // Verificar si todos han completado (el cierre con ganador/perdedor solo aplica a duelos entre usuarios;
  // los retos diario/semanal comparten cohortes grandes y no deben cerrarse como si fueran un duelo 1 a 1)
  const todasCompletadas = reto.participaciones.every(
    (p) => p.id === participacion.id || p.completado
  );

  if (todasCompletadas && reto.tipo === TipoReto.USUARIO) {
    await this.cerrarRetoUsuario(reto);
  } else if (todasCompletadas) {
    await this.retoRepo.update(reto.id, { estado: EstadoReto.COMPLETADO });
  }

  const participacionFinal = await this.participacionRepo.findOne({
    where: { id: participacion.id },
  });

  return { ...participacionFinal, gamificacion, correctas, fallos, blancos, penalizacion: { fraccion, fraccionBlanco } } as any;
}

 // ⭐ Generalizado para cualquier número de participantes (hoy siempre 2 en retos de tipo
 // usuario, pero ya no asume índices fijos [0]/[1] ni rompe si algún día hay más).
 private async cerrarRetoUsuario(reto: Reto): Promise<void> {
  // ⭐ Gana la mejor nota (con penalización); a igualdad de nota, el más rápido.
  const participaciones = (await this.participacionRepo.find({
    where: { reto: { id: reto.id } },
    relations: ['usuario'],
  })).sort((a, b) => notaDe(b) - notaDe(a) || (a.tiempoSegundos ?? 0) - (b.tiempoSegundos ?? 0));

  await this.retoRepo.update(reto.id, { estado: EstadoReto.COMPLETADO });

  if (participaciones.length < 2) return;

  const igual = (a: ParticipacionReto, b: ParticipacionReto) =>
    notaDe(a) === notaDe(b) && a.tiempoSegundos === b.tiempoSegundos;
  const mejor = participaciones[0];
  const ganadores = participaciones.filter((p) => igual(p, mejor));
  const empateGeneral = ganadores.length === participaciones.length;

  // Asignar posiciones: los empatados en cabeza comparten puesto; el resto se numera
  // correlativamente a partir de ahí (en vez de asumir exactamente 2 participantes).
  let posicionActual = 1;
  let i = 0;
  while (i < participaciones.length) {
    const actual = participaciones[i];
    const empatadosConActual = participaciones.filter((p) => igual(p, actual));
    for (const p of empatadosConActual) {
      await this.participacionRepo.update(p.id, { posicion: posicionActual });
    }
    i += empatadosConActual.length;
    posicionActual += empatadosConActual.length;
  }

  if (empateGeneral) {
    for (const p of participaciones) {
      const u = p.usuario as any;
      await this.notificacionService.crear({
        usuarioId: u.id,
        tipo: TipoNotificacion.RETO_RESULTADO,
        titulo: '¡Empate en el reto! 🤝',
        mensaje: `Habéis empatado con un ${fmtNota(notaDe(mejor))} sobre 10`,
        prioridad: PrioridadNotificacion.MEDIA,
      });
    }
    return;
  }

  for (const p of participaciones) {
    const usuario = p.usuario as any;
    const esGanador = ganadores.some((g) => g.id === p.id);

    if (esGanador) {
      const rival = participaciones.find((r) => r.id !== p.id);
      const rivalUsuario = rival?.usuario as any;
      await this.notificacionService.crear({
        usuarioId: usuario.id,
        tipo: TipoNotificacion.RETO_RESULTADO,
        titulo: '¡Has ganado el reto! 🏆',
        mensaje: rivalUsuario
          ? `Has ganado a ${rivalUsuario.nick ?? rivalUsuario.nombre} con un ${fmtNota(notaDe(p))} sobre 10`
          : `Has terminado con un ${fmtNota(notaDe(p))} sobre 10`,
        prioridad: PrioridadNotificacion.MEDIA,
      });
      await this.darPuntosPorReto(usuario.id, (reto.oposicion as any).id, 0, true);
    } else {
      const ganador = ganadores[0]?.usuario as any;
      await this.notificacionService.crear({
        usuarioId: usuario.id,
        tipo: TipoNotificacion.RETO_RESULTADO,
        titulo: 'Reto finalizado',
        mensaje: ganador
          ? `${ganador.nick ?? ganador.nombre} ha ganado con un ${fmtNota(notaDe(mejor))} sobre 10. ¡Sigue practicando!`
          : `Has terminado con un ${fmtNota(notaDe(p))} sobre 10. ¡Sigue practicando!`,
        prioridad: PrioridadNotificacion.MEDIA,
      });
    }
  }
}
  

  // ─── CONSULTAS ───────────────────────────────────────────

  /**
   * ⭐ Retos que el usuario tiene por jugar (test, flashcards y psicotécnicos), para el
   * contador del Inicio. Cuenta los activos, no caducados y que aún no ha completado.
   */
  async contarPendientes(usuarioId: string): Promise<{ total: number; test: number; fc: number; psico: number }> {
    const [[t], [f], [p]] = await Promise.all([
      this.retoRepo.query(
        `SELECT COUNT(*)::int AS n FROM participaciones_reto pr
           JOIN retos r ON r.id = pr."retoId"
          WHERE pr."usuarioId" = $1 AND pr.completado = false
            AND r.estado IN ('activo', 'pendiente')
            AND (r."fechaFin" IS NULL OR r."fechaFin" > NOW())`,
        [usuarioId],
      ),
      this.retoRepo.query(
        `SELECT COUNT(*)::int AS n FROM retos_fc r
          WHERE (r."retadorId" = $1 OR r."retadoId" = $1)
            AND r.estado IN ('activo', 'pendiente')
            AND (r."fechaFin" IS NULL OR r."fechaFin" > NOW())
            AND NOT EXISTS (SELECT 1 FROM resultados_reto_fc x
                             WHERE x."retoFcId" = r.id AND x."usuarioId" = $1 AND x.completado = true)`,
        [usuarioId],
      ),
      this.retoRepo.query(
        `SELECT COUNT(*)::int AS n FROM retos_psicotecnicos r
          WHERE (r."retadorId" = $1 OR r."retadoId" = $1)
            AND r.estado IN ('activo', 'pendiente')
            AND (r."fechaFin" IS NULL OR r."fechaFin" > NOW())
            AND NOT EXISTS (SELECT 1 FROM resultados_reto_psicotecnico x
                             WHERE x."retoPsicotecnicoId" = r.id AND x."usuarioId" = $1 AND x.completado = true)`,
        [usuarioId],
      ),
    ]);
    const test = Number(t?.n ?? 0), fc = Number(f?.n ?? 0), psico = Number(p?.n ?? 0);
    return { total: test + fc + psico, test, fc, psico };
  }

  async getMisRetos(usuarioId: string): Promise<ParticipacionReto[]> {
  const participaciones = await this.participacionRepo.find({
    where: { usuario: { id: usuarioId } },
    relations: ['reto', 'reto.creador', 'reto.tema', 'reto.oposicion', 'reto.participaciones', 'reto.participaciones.usuario'],
    order: { creadoEn: 'DESC' },
  });

  // ⭐ Chequeo de expiración "al vuelo": no confiamos solo en el @Cron de
  // revisarRetosExpirados (que depende de que el proceso backend siga vivo
  // en memoria para disparar el setInterval — en despliegues que reciclan o
  // duermen el proceso, el cron puede no llegar a ejecutarse nunca). Antes
  // de devolver los retos, marcamos aquí mismo como EXPIRADO cualquier reto
  // de tipo usuario que ya haya superado su fechaFin, para que el frontend
  // siempre vea el estado correcto y lo mande a Historial sin depender de
  // que el cron haya corrido.
  const ahora = new Date();
  const idsAExpirar = new Set<string>();
  for (const p of participaciones) {
    const reto = p.reto;
    if (
      reto &&
      reto.tipo === TipoReto.USUARIO &&
      reto.estado === EstadoReto.ACTIVO &&
      reto.fechaFin &&
      new Date(reto.fechaFin) < ahora
    ) {
      idsAExpirar.add(reto.id);
    }
  }

  if (idsAExpirar.size > 0) {
    await this.retoRepo.update(Array.from(idsAExpirar), { estado: EstadoReto.EXPIRADO });
    // Reflejar el nuevo estado en los objetos ya cargados en memoria, para no
    // tener que volver a consultar la base de datos antes de responder.
    for (const p of participaciones) {
      if (p.reto && idsAExpirar.has(p.reto.id)) {
        p.reto.estado = EstadoReto.EXPIRADO;
      }
    }
  }

  for (const p of participaciones) {
    if (p.reto?.oposicion?.id) {
      await this.enriquecerNivelesParticipantes(p.reto, (p.reto.oposicion as any).id);
    }
    // ⭐ Sin soluciones mientras no haya jugado
    this.ocultarSoluciones(p.reto, usuarioId, p.completado);
  }

  return participaciones;
}

  async getReto(retoId: string, usuarioId: string): Promise<Reto> {
    const reto = await this.retoRepo.findOne({
      where: { id: retoId },
      relations: ['participaciones', 'participaciones.usuario', 'creador', 'tema', 'oposicion'],
    });
    if (!reto) throw new NotFoundException('Reto no encontrado');

    const miParticipacion = reto.participaciones?.find(
      (p) => (p.usuario as any)?.id === usuarioId,
    );
    const esCreador = reto.creador?.id === usuarioId;
    const esParticipante = esCreador || !!miParticipacion;

    // Los retos entre usuarios son privados: solo sus participantes pueden verlos.
    if (reto.tipo === TipoReto.USUARIO && !esParticipante) {
      throw new ForbiddenException('No tienes acceso a este reto');
    }

    // No exponer las soluciones hasta que el usuario haya completado su participación.
    this.ocultarSoluciones(reto, usuarioId, !!miParticipacion?.completado);

    return this.enriquecerNivelesParticipantes(reto, (reto.oposicion as any).id);
  }

  async getRanking(retoId: string, usuarioId: string): Promise<ParticipacionReto[]> {
    const reto = await this.retoRepo.findOne({
      where: { id: retoId },
      relations: ['participaciones', 'participaciones.usuario', 'creador'],
    });
    if (!reto) throw new NotFoundException('Reto no encontrado');

    if (reto.tipo === TipoReto.USUARIO) {
      const esParticipante =
        reto.creador?.id === usuarioId ||
        reto.participaciones?.some((p) => (p.usuario as any)?.id === usuarioId);
      if (!esParticipante) throw new ForbiddenException('No tienes acceso a este reto');
    }

    const ranking = await this.participacionRepo.find({
      where: { reto: { id: retoId }, completado: true },
      relations: ['usuario'],
      order: { porcentaje: 'DESC', tiempoSegundos: 'ASC' },
    });
    // ⭐ Las respuestas corregidas de otros revelan las soluciones si aún no has jugado
    const yoCompletado = ranking.some((p) => (p.usuario as any)?.id === usuarioId);
    if (!yoCompletado) {
      for (const p of ranking) (p as any).respuestas = null;
    }
    return ranking;
  }

  // ─── HELPERS ─────────────────────────────────────────────



  async getContactosRecientes(usuarioId: string): Promise<ContactoReciente[]> {
  return this.contactoRepo.find({
    where: { usuario: { id: usuarioId } },
    relations: ['contacto'],
    order: { ultimoUso: 'DESC' },
    take: 5,
  });
}

private async guardarContactoReciente(usuarioId: string, contactoId: string): Promise<void> {
  const existente = await this.contactoRepo.findOne({
    where: {
      usuario: { id: usuarioId },
      contacto: { id: contactoId },
    },
  });

  if (existente) {
    await this.contactoRepo.update(existente.id, { ultimoUso: new Date() });
  } else {
    await this.contactoRepo.save(
      this.contactoRepo.create({
        usuario: { id: usuarioId } as any,
        contacto: { id: contactoId } as any,
      })
    );
  }
}

private async darPuntosPorReto(usuarioId: string, oposicionId: string, correctas: number, gano: boolean): Promise<{
  puntosGanados: number;
  puntosTotales: number;
  nivelAnterior: number;
  nivelNuevo: number;
  subioNivel: boolean;
  nombreNivel: string;
  badgeNivel: string;
} | null> {
  const puntosAcciones = await this.configuracionService.getPuntosAcciones();

  const usuarioOposicion = await this.usuarioOposicionRepo.findOne({
    where: { usuario: { id: usuarioId } as any, oposicion: { id: oposicionId } as any },
  });
  if (!usuarioOposicion) return null;

  let puntosGanados = correctas * (puntosAcciones.preguntaCorrecta ?? 2);
  if (gano) puntosGanados += (puntosAcciones.ganarReto ?? 20);

  if (puntosGanados === 0) return null;

  const nivelAnterior = usuarioOposicion.nivel;

  // ⭐ Incremento atómico a nivel de base de datos (evita perder puntos si dos
  // actualizaciones concurrentes leen el mismo valor antes de escribir).
  await this.usuarioOposicionRepo.increment(
    { id: usuarioOposicion.id },
    'puntos',
    puntosGanados,
  );

  const actualizado = await this.usuarioOposicionRepo.findOne({
    where: { id: usuarioOposicion.id },
  });
  if (!actualizado) return null;

  const nuevoNivel = await this.configuracionService.calcularNivelPorPuntos(actualizado.puntos);
  if (nuevoNivel !== actualizado.nivel) {
    await this.usuarioOposicionRepo.update(usuarioOposicion.id, { nivel: nuevoNivel });
  }

  const nivelesEstudio = await this.configuracionService.getNivelesEstudio();
  const infoNivel = nivelesEstudio.find((n: any) => n.nivel === nuevoNivel);

  return {
    puntosGanados,
    puntosTotales: actualizado.puntos,
    nivelAnterior,
    nivelNuevo: nuevoNivel,
    subioNivel: nuevoNivel > nivelAnterior,
    nombreNivel: infoNivel?.nombre ?? '',
    badgeNivel: infoNivel?.badge ?? '',
  };
}

async eliminarRetoUsuario(retoId: string, usuarioId: string): Promise<void> {
  const reto = await this.retoRepo.findOne({
    where: { id: retoId },
    relations: ['creador', 'participaciones', 'participaciones.usuario'],
  });
  if (!reto) throw new NotFoundException('Reto no encontrado');
  if (reto.tipo !== TipoReto.USUARIO) {
    throw new BadRequestException('Solo se pueden eliminar retos entre usuarios');
  }

  const miParticipacion = reto.participaciones.find((p) => (p.usuario as any)?.id === usuarioId);
  const esParticipante = reto.creador?.id === usuarioId || !!miParticipacion;
  if (!esParticipante) throw new BadRequestException('No tienes acceso a este reto');

  // ⭐ Solo bloquea si el usuario que cancela YA completó su parte
  if (miParticipacion?.completado) {
    throw new BadRequestException('No puedes cancelar un reto que ya has completado');
  }

  // ⭐ Evita la carrera cancelar/completar: si para cuando llegamos aquí el reto ya se
  // cerró (p. ej. el rival completó justo antes), no lo borramos por debajo del cierre.
  const retoActual = await this.retoRepo.findOne({ where: { id: retoId } });
  if (!retoActual) return; // ya no existe, nada que cancelar
  if (retoActual.estado === EstadoReto.COMPLETADO) {
    throw new BadRequestException('Este reto ya se ha completado y no se puede cancelar');
  }

  await this.participacionRepo.delete({ reto: { id: retoId } as any });
  await this.retoRepo.delete(retoId);
}

// En reto.service.ts:
async getEstadisticasUsuario(usuarioId: string, oposicionId?: string) {
  // ⭐ Un empate ya no cuenta como victoria para los dos: si alguien más del mismo duelo comparte
  // el primer puesto, es empate (igual que lo calcula la pantalla de Retos).
  const filas: { posicion: number; empatados: number }[] = await this.participacionRepo.query(
    `SELECT p.posicion,
            (SELECT COUNT(*)::int FROM participaciones_reto o
              WHERE o."retoId" = p."retoId" AND o.id <> p.id AND o.posicion = p.posicion) AS empatados
       FROM participaciones_reto p
      WHERE p."usuarioId" = $1 AND p.completado = true AND p.posicion IS NOT NULL
        AND ($2::uuid IS NULL OR p."retoId" IN (SELECT r.id FROM retos r WHERE r."oposicionId" = $2::uuid))`,
    [usuarioId, oposicionId || null],
  );
  const empates = filas.filter((f) => f.empatados > 0).length;
  const victorias = filas.filter((f) => f.posicion === 1 && f.empatados === 0).length;
  const total = filas.length;
  const derrotas = total - victorias - empates;
  const porcentajeVictoria = total > 0 ? Math.round((victorias / total) * 100) : 0;

  return { victorias, empates, derrotas, total, porcentajeVictoria };
}

private async enriquecerNivelesParticipantes(reto: Reto, oposicionId: string): Promise<Reto> {
  if (!reto?.participaciones?.length) return reto;

  for (const p of reto.participaciones) {
    const usuarioId = (p.usuario as any)?.id;
    if (!usuarioId) continue;

    const uo = await this.usuarioOposicionRepo.findOne({
      where: { usuario: { id: usuarioId } as any, oposicion: { id: oposicionId } as any },
    });

    (p.usuario as any).nivel = uo?.nivel ?? 1;
  }

  return reto;
}

// Backend — nuevo endpoint
async validarDestinatarioReto(retadorId: string, nickOEmail: string, oposicionId: string) {
  let retado = await this.usuarioRepo.findOne({ where: { nick: nickOEmail.toLowerCase().trim() } });
  if (!retado) retado = await this.usuarioRepo.findOne({ where: { email: nickOEmail.toLowerCase().trim() } });  

  if (!retado) {
    return { encontrado: false };
  }
  if (retado.id === retadorId) {
    return { encontrado: true, error: 'No puedes retarte a ti mismo' };
  }

  const retadorOposicion = await this.usuarioOposicionRepo.findOne({
    where: { usuario: { id: retadorId } as any, oposicion: { id: oposicionId } as any },
    relations: ['convocatoriaActiva'],
  });
  const retadoOposicion = await this.usuarioOposicionRepo.findOne({
    where: { usuario: { id: retado.id } as any, oposicion: { id: oposicionId } as any },
    relations: ['convocatoriaActiva'],
  });

  if (!retadoOposicion) {
    return { encontrado: true, nombre: retado.nick ?? retado.nombre, mismaOposicion: false };
  }

  const mismaConvocatoria = retadorOposicion?.convocatoriaActiva?.id === retadoOposicion.convocatoriaActiva?.id;

  return {
    encontrado: true,
    nombre: retado.nick ?? retado.nombre,
    mismaOposicion: true,
    mismaConvocatoria,
  };
}
}
