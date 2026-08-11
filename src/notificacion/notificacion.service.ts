import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion, TipoNotificacion, PrioridadNotificacion } from './notificacion.entity';

@Injectable()
export class NotificacionService {
  constructor(
    @InjectRepository(Notificacion)
    private readonly repo: Repository<Notificacion>,
  ) {}

  async crear(datos: {
    usuarioId: string;
    tipo: TipoNotificacion;
    titulo: string;
    mensaje: string;
    prioridad?: PrioridadNotificacion;
    urlAccion?: string;
    metadata?: Record<string, any>;
  }): Promise<Notificacion> {
    const n = this.repo.create({
      tipo: datos.tipo,
      titulo: datos.titulo,
      mensaje: datos.mensaje,
      prioridad: datos.prioridad ?? PrioridadNotificacion.MEDIA,
      urlAccion: datos.urlAccion,
      metadata: datos.metadata,
      usuario: { id: datos.usuarioId } as any,
    });
    return this.repo.save(n);
  }

  async findByUsuario(usuarioId: string, soloNoLeidas = false): Promise<Notificacion[]> {
    const qb = this.repo.createQueryBuilder('n')
      .where('n.usuario = :usuarioId', { usuarioId })
      .orderBy('n.creadoEn', 'DESC')
      .limit(50);

    if (soloNoLeidas) qb.andWhere('n.leida = false');

    return qb.getMany();
  }

  async marcarLeida(id: string, usuarioId: string): Promise<void> {
    await this.repo.update(
      { id, usuario: { id: usuarioId } },
      { leida: true },
    );
  }

  async marcarTodasLeidas(usuarioId: string): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update()
      .set({ leida: true })
      .where('usuarioId = :usuarioId', { usuarioId })
      .andWhere('leida = false')
      .execute();
  }

    async countNoLeidas(usuarioId: string): Promise<{ count: number }> {
    const total = await this.repo.count({
      where: { usuario: { id: usuarioId }, leida: false },
    });
    return { count: total };
}

  async notificarNuevoDocumento(usuarioIds: string[], titulo: string, convocatoriaNombre: string, urlAccion?: string): Promise<void> {
    for (const usuarioId of usuarioIds) {
      await this.crear({
        usuarioId,
        tipo: TipoNotificacion.NUEVO_DOCUMENTO,
        titulo: 'Nuevo documento publicado',
        mensaje: `Se ha publicado "${titulo}" en ${convocatoriaNombre}`,
        prioridad: PrioridadNotificacion.MEDIA,
        urlAccion,
      });
    }
  }

  async notificarAdmitido(usuarioId: string, convocatoriaNombre: string, estado: 'admitido' | 'excluido', causa?: string, urlAccion?: string): Promise<void> {
  const admitido = estado === 'admitido';
  await this.crear({
    usuarioId,
    tipo: admitido ? TipoNotificacion.ADMITIDO : TipoNotificacion.EXCLUIDO,
    titulo: admitido ? '¡Apareces en la lista de admitidos!' : 'Apareces en la lista de excluidos',
    mensaje: admitido
      ? `Estás en la lista provisional de admitidos de ${convocatoriaNombre}`
      : `Apareces como excluido en ${convocatoriaNombre}${causa ? `. Motivo: ${causa}` : ''}`,
    prioridad: PrioridadNotificacion.ALTA,
    urlAccion,
  });
}

  async notificarCambioNormativo(usuarioIds: string[], leyNombre: string, resumen: string, versionLeyId?: string): Promise<void> {
  for (const usuarioId of usuarioIds) {
    await this.crear({
      usuarioId,
      tipo: TipoNotificacion.CAMBIO_NORMATIVO,
      titulo: 'Cambio en normativa de tu temario',
      mensaje: `${leyNombre}: ${resumen}`,
      prioridad: PrioridadNotificacion.ALTA,
      urlAccion: versionLeyId ? `/app/ley/${versionLeyId}` : undefined,
    });
  }
}

  async notificarRetoDiario(usuarioIds: string[]): Promise<void> {
    for (const usuarioId of usuarioIds) {
      await this.crear({
        usuarioId,
        tipo: TipoNotificacion.RETO_DIARIO,
        titulo: 'Nuevo reto diario disponible ⚡',
        mensaje: 'Tu reto de hoy te está esperando. ¡No rompas la racha!',
        prioridad: PrioridadNotificacion.BAJA,
       urlAccion: '/app/retos',
      });
    }
  }

async notificarRetoRecibido(usuarioId: string, retadorNombre: string, oposicionNombre: string, retoId: string): Promise<void> {
  await this.crear({
    usuarioId,
    tipo: TipoNotificacion.RETO_RECIBIDO,
    titulo: `${retadorNombre} te reta ⚡`,
    mensaje: `Te han enviado un reto de ${oposicionNombre}. ¿Aceptas el desafío?`,
    prioridad: PrioridadNotificacion.MEDIA,
    urlAccion: `/app/retos/${retoId}`, // ⭐ deep-link directo
  });
}


async notificarResultadoReto(usuarioId: string, retadorNombre: string, ganador: string, retoId: string): Promise<void> {
  await this.crear({
    usuarioId,
    tipo: TipoNotificacion.RETO_RESULTADO,
    titulo: 'Resultado del reto',
    mensaje: `El reto contra ${retadorNombre} ha terminado. Ganador: ${ganador}`,
    prioridad: PrioridadNotificacion.MEDIA,
    urlAccion: `/app/retos/${retoId}`, // ⭐ deep-link directo
  });
}


}   