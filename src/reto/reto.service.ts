import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
  ) {}

  // ─── RETO DIARIO ─────────────────────────────────────────

  @Cron(CronExpression.EVERY_HOUR)
  async revisarRetosExpirados() {
    const ahora = new Date();

    const retosActivos = await this.retoRepo.find({
      where: {
        tipo: TipoReto.USUARIO,
        estado: EstadoReto.ACTIVO,
      },
    });

    for (const reto of retosActivos) {
      if (!reto.fechaFin || new Date(reto.fechaFin) > ahora) continue;
      await this.retoRepo.update(reto.id, { estado: EstadoReto.EXPIRADO });
      console.log(`Reto ${reto.id} marcado como expirado por caducidad`);
    }
  }
  async getRetoDiario(usuarioId: string, oposicionId: string): Promise<Reto> {
    const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    // Buscar si ya existe un reto diario para hoy y el nivel del usuario
    let reto = await this.retoRepo.findOne({
      where: {
        tipo: TipoReto.DIARIO,
        estado: EstadoReto.ACTIVO,
        oposicion: { id: oposicionId },
        nivelRequerido: usuario.nivel,
      },
      relations: ['participaciones', 'participaciones.usuario'],
    });

    if (!reto || new Date(reto.creadoEn) < hoy) {
      reto = await this.crearRetoDiario(oposicionId, usuario.nivel);
    }

    return reto;
  }

  private async crearRetoDiario(oposicionId: string, nivel: number): Promise<Reto> {
    const numPreguntas = this.preguntasPorNivel(nivel);

    const preguntas = await this.testService.generarTest(
      oposicionId,
      numPreguntas,
    );

    const fechaFin = new Date();
    fechaFin.setHours(23, 59, 59, 999);

    const reto = this.retoRepo.create({
      tipo: TipoReto.DIARIO,
      estado: EstadoReto.ACTIVO,
      nivelRequerido: nivel,
      preguntas,
      fechaFin,
      oposicion: { id: oposicionId } as any,
    });

    return this.retoRepo.save(reto);
  }

  // ─── RETO SEMANAL ────────────────────────────────────────

  async getRetoSemanal(usuarioId: string, oposicionId: string): Promise<Reto> {
    const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const inicioSemana = new Date();
    inicioSemana.setHours(0, 0, 0, 0);
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay() + 1);

    let reto = await this.retoRepo.findOne({
      where: {
        tipo: TipoReto.SEMANAL,
        estado: EstadoReto.ACTIVO,
        oposicion: { id: oposicionId },
        nivelRequerido: usuario.nivel,
      },
      relations: ['participaciones', 'participaciones.usuario', 'tema'],
    });

    if (!reto || new Date(reto.creadoEn) < inicioSemana) {
      reto = await this.crearRetoSemanal(oposicionId, usuario.nivel);
    }

    return reto;
  }

  private async crearRetoSemanal(oposicionId: string, nivel: number): Promise<Reto> {
  const convocatoria = await this.convocatoriaRepo.findOne({
    where: { oposicion: { id: oposicionId }, estado: 'activa' as any },
    order: { anyo: 'DESC' },
  });

  const temas = convocatoria ? await this.temaRepo.find({
    where: { convocatoria: { id: convocatoria.id }, activo: true },
    order: { numero: 'ASC' },
  }) : [];

  const indiceMax = Math.min(nivel * 5, temas.length - 1);
  const tema = temas.length > 0 ? temas[Math.floor(Math.random() * (indiceMax + 1))] : null;
  const numPreguntas = this.preguntasPorNivel(nivel) * 2;
  const preguntas = await this.testService.generarTest(
    oposicionId,
    numPreguntas,
    tema?.id,
  );

  const fechaFin = new Date();
  fechaFin.setDate(fechaFin.getDate() + (7 - fechaFin.getDay()));
  fechaFin.setHours(23, 59, 59, 999);

  const reto = this.retoRepo.create({
    tipo: TipoReto.SEMANAL,
    estado: EstadoReto.ACTIVO,
    nivelRequerido: nivel,
    preguntas,
    fechaFin,
    oposicion: { id: oposicionId } as any,
    tema: tema ? { id: tema.id } as any : undefined,
  });

  return this.retoRepo.save(reto);
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
    let retado = await this.usuarioRepo.findOne({ where: { nick: retadoNickOEmail } });
    if (!retado) retado = await this.usuarioRepo.findOne({ where: { email: retadoNickOEmail } });
    if (!retado) throw new NotFoundException('Usuario no encontrado con ese nick o email');
    if (retado.id === retadorId) throw new BadRequestException('No puedes retarte a ti mismo');

    const preguntas = await this.testService.generarTest(oposicionId, numPreguntas, temaId, versionLeyId);

    const fechaFin = new Date();
    fechaFin.setHours(fechaFin.getHours() + (horasPlazo ?? 48));

    const reto = this.retoRepo.create({
  tipo: TipoReto.USUARIO,
  estado: EstadoReto.ACTIVO,
  nivelRequerido: 1,
  preguntas,
  fechaFin,
  mensaje: mensaje || undefined,
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
      mensaje: `Te han enviado un reto. Tienes 48h para completarlo. ¿Aceptas el desafío?`,
      prioridad: PrioridadNotificacion.MEDIA,
      urlAccion: `/app/retos/${retoGuardado.id}`,
    });

    return retoGuardado;
  }

  // ─── COMPLETAR RETO ──────────────────────────────────────

async completarReto(
  retoId: string,
  usuarioId: string,
  respuestas: any[],
  tiempoSegundos: number,
): Promise<ParticipacionReto> {
  console.log('=== INTENTO COMPLETAR ===', 'retoId:', retoId, 'usuarioId:', usuarioId);

  const participacion = await this.participacionRepo.findOne({
    where: {
      reto: { id: retoId },
      usuario: { id: usuarioId },
    },
    relations: ['usuario', 'reto'],
  });

  console.log('Participación:', participacion?.id, 'completado:', participacion?.completado, 'usuarioId real:', (participacion?.usuario as any)?.id);

  if (!participacion) throw new BadRequestException('No estás participando en este reto');
  if (participacion.completado) throw new BadRequestException('Ya completaste este reto');

  const reto = await this.retoRepo.findOne({
    where: { id: retoId },
    relations: ['participaciones', 'participaciones.usuario'],
  });
  if (!reto) throw new NotFoundException('Reto no encontrado');

  const correctas = respuestas.filter((r) => r.esCorrecta).length;
  const porcentaje = Math.round((correctas / reto.preguntas.length) * 100);

  console.log('Correctas:', correctas, 'de', reto.preguntas.length, '→', porcentaje, '%');

  await this.participacionRepo.update(participacion.id, {
    completado: true,
    porcentaje,
    tiempoSegundos,
    respuestas,
  });

  // ⭐ Dar puntos por las preguntas acertadas (siempre, gane o no)
  await this.darPuntosPorReto(usuarioId, correctas, false);

   // Verificar si todos han completado
  const todasCompletadas = reto.participaciones.every(
    (p) => p.id === participacion.id || p.completado
  );

  if (todasCompletadas) {
    await this.cerrarRetoUsuario(reto);
  }

  return this.participacionRepo.findOne({
    where: { id: participacion.id },
  }) as Promise<ParticipacionReto>;
}

 private async cerrarRetoUsuario(reto: Reto): Promise<void> {
  const participaciones = await this.participacionRepo.find({
    where: { reto: { id: reto.id } },
    relations: ['usuario'],
    order: { porcentaje: 'DESC', tiempoSegundos: 'ASC' },
  });

  await this.retoRepo.update(reto.id, { estado: EstadoReto.COMPLETADO });

  const primera = participaciones[0];
  const segunda = participaciones[1];

  if (!primera || !segunda) return;

  const empate = primera.porcentaje === segunda.porcentaje &&
    primera.tiempoSegundos === segunda.tiempoSegundos;

  if (empate) {
    await this.participacionRepo.update(primera.id, { posicion: 1 });
    await this.participacionRepo.update(segunda.id, { posicion: 1 });

    const primerUsuario = primera.usuario as any;
    const segundoUsuario = segunda.usuario as any;

    for (const u of [primerUsuario, segundoUsuario]) {
      await this.notificacionService.crear({
        usuarioId: u.id,
        tipo: TipoNotificacion.RETO_RESULTADO,
        titulo: '¡Empate en el reto! 🤝',
        mensaje: `Empate perfecto con ${u.id === primerUsuario.id ? segundoUsuario.nick ?? segundoUsuario.nombre : primerUsuario.nick ?? primerUsuario.nombre}`,
        prioridad: PrioridadNotificacion.MEDIA,
      });
    }
} else {
  for (let i = 0; i < participaciones.length; i++) {
    await this.participacionRepo.update(participaciones[i].id, { posicion: i + 1 });
  }

  const ganador = participaciones[0].usuario as any;
  const perdedor = participaciones[1].usuario as any;

  await this.notificacionService.crear({
    usuarioId: ganador.id,
    tipo: TipoNotificacion.RETO_RESULTADO,
    titulo: '¡Has ganado el reto! 🏆',
    mensaje: `Has ganado a ${perdedor.nick ?? perdedor.nombre} con ${primera.porcentaje}% de acierto`,
    prioridad: PrioridadNotificacion.MEDIA,
  });

  await this.notificacionService.crear({
    usuarioId: perdedor.id,
    tipo: TipoNotificacion.RETO_RESULTADO,
    titulo: 'Reto finalizado',
    mensaje: `${ganador.nick ?? ganador.nombre} ha ganado con ${primera.porcentaje}%. ¡Sigue practicando!`,
    prioridad: PrioridadNotificacion.MEDIA,
  });

  await this.darPuntosPorReto(ganador.id, 0, true); // ⭐ bonus de victoria
}
}
  

  // ─── CONSULTAS ───────────────────────────────────────────

  async getMisRetos(usuarioId: string): Promise<ParticipacionReto[]> {
  return this.participacionRepo.find({
    where: { usuario: { id: usuarioId } },
    relations: ['reto', 'reto.creador', 'reto.tema', 'reto.oposicion', 'reto.participaciones', 'reto.participaciones.usuario'],
    order: { creadoEn: 'DESC' },
  });
}

  async getReto(retoId: string): Promise<Reto> {
    const reto = await this.retoRepo.findOne({
      where: { id: retoId },
      relations: ['participaciones', 'participaciones.usuario', 'creador', 'tema', 'oposicion'],
    });
    if (!reto) throw new NotFoundException('Reto no encontrado');
    return reto;
  }

  async getRanking(retoId: string): Promise<ParticipacionReto[]> {
    return this.participacionRepo.find({
      where: { reto: { id: retoId }, completado: true },
      relations: ['usuario'],
      order: { porcentaje: 'DESC', tiempoSegundos: 'ASC' },
    });
  }

  // ─── HELPERS ─────────────────────────────────────────────

  private preguntasPorNivel(nivel: number): number {
    const mapa: Record<number, number> = { 1: 5, 2: 8, 3: 10, 4: 15, 5: 20 };
    return mapa[nivel] ?? 10;
  }

  async getContactosRecientes(usuarioId: string): Promise<ContactoReciente[]> {
  return this.contactoRepo.find({
    where: { usuario: { id: usuarioId } },
    relations: ['contacto'],
    order: { ultimoUso: 'DESC' },
    take: 5,
  });
}

async getRankingOposicion(oposicionId: string, nivel?: number): Promise<any[]> {
  const qb = this.usuarioRepo
    .createQueryBuilder('u')
    .leftJoin('u.resultados', 'r', 'r.oposicionId = :oposicionId', { oposicionId })
    .select([
      'u.id', 'u.nick', 'u.nombre', 'u.nivel', 'u.puntos', 'u.testsSuperados',
    ])
    .where('u.puntos > 0')
    .orderBy('u.puntos', 'DESC')
    .limit(50);

  if (nivel) qb.andWhere('u.nivel = :nivel', { nivel });

  return qb.getMany();
}

async getRankingRetos(oposicionId: string): Promise<any[]> {
  const participaciones = await this.participacionRepo
    .createQueryBuilder('p')
    .leftJoinAndSelect('p.usuario', 'u')
    .leftJoin('p.reto', 'r')
    .where('r.oposicionId = :oposicionId', { oposicionId })
    .andWhere('p.completado = true')
    .andWhere('p.posicion IS NOT NULL')
    .getMany();

  // Agrupar por usuario
  const porUsuario: Record<string, {
    usuario: any;
    victorias: number;
    derrotas: number;
    total: number;
  }> = {};

  for (const p of participaciones) {
    const uid = (p.usuario as any).id;
    if (!porUsuario[uid]) {
      porUsuario[uid] = {
        usuario: p.usuario,
        victorias: 0,
        derrotas: 0,
        total: 0,
      };
    }
    porUsuario[uid].total++;
    if (p.posicion === 1) porUsuario[uid].victorias++;
    else porUsuario[uid].derrotas++;
  }

  return Object.values(porUsuario)
    .sort((a, b) => b.victorias - a.victorias || a.derrotas - b.derrotas)
    .slice(0, 50);
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

private async darPuntosPorReto(usuarioId: string, correctas: number, gano: boolean): Promise<void> {
  console.log('=== DAR PUNTOS RETO ===', 'usuarioId:', usuarioId, 'correctas:', correctas, 'gano:', gano);

  const puntosAcciones = await this.configuracionService.getPuntosAcciones();
  console.log('puntosAcciones:', puntosAcciones);

  const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
  if (!usuario) {
    console.log('⚠️ Usuario no encontrado');
    return;
  }

  let puntosGanados = correctas * (puntosAcciones.preguntaCorrecta ?? 2);
  if (gano) puntosGanados += (puntosAcciones.ganarReto ?? 20);

  console.log('Puntos actuales:', usuario.puntos, '→ Puntos ganados esta vez:', puntosGanados);

  const nuevosPuntos = usuario.puntos + puntosGanados;
  const nuevoNivel = await this.configuracionService.calcularNivelPorPuntos(nuevosPuntos);

  await this.usuarioRepo.update(usuarioId, {
    puntos: nuevosPuntos,
    nivel: nuevoNivel,
  });

  console.log('Puntos guardados:', nuevosPuntos, 'nivel:', nuevoNivel);
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

  await this.participacionRepo.delete({ reto: { id: retoId } as any });
  await this.retoRepo.delete(retoId);
}

// En reto.service.ts:
async getEstadisticasUsuario(usuarioId: string) {
  const completados = await this.participacionRepo.find({
    where: { usuario: { id: usuarioId }, completado: true, posicion: Not(IsNull()) } as any,
  });

  const victorias = completados.filter((p) => p.posicion === 1).length;
  const derrotas = completados.length - victorias;
  const total = completados.length;
  const porcentajeVictoria = total > 0 ? Math.round((victorias / total) * 100) : 0;

  return { victorias, derrotas, total, porcentajeVictoria };
}
}