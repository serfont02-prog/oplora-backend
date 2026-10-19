import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { Notificacion, TipoNotificacion, PrioridadNotificacion } from './notificacion.entity';

// ⭐ La app no usa emojis (solo iconos): se quitan de los textos al crear la notificación,
// así no hay que tocar cada servicio que avisa (retos, duelos, flashcards…).
const EMOJIS = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\uFE0F\u200D]/gu;
const limpiar = (t: string, max?: number) => {
  const s = String(t ?? '').replace(EMOJIS, '').replace(/\s{2,}/g, ' ').replace(/\s+([!?.,:])/g, '$1').trim();
  return max && s.length > max ? s.slice(0, max - 1) + '…' : s;
};

// Limpieza periódica: leídas de hace más de 60 días y cualquiera de hace más de 180.
const DIAS_LEIDAS = 60;
const DIAS_TODAS = 180;

@Injectable()
export class NotificacionService {
  private readonly logger = new Logger(NotificacionService.name);

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
      titulo: limpiar(datos.titulo, 255),
      mensaje: limpiar(datos.mensaje),
      prioridad: datos.prioridad ?? PrioridadNotificacion.MEDIA,
      urlAccion: datos.urlAccion,
      metadata: datos.metadata,
      usuario: { id: datos.usuarioId } as any,
    });
    return this.repo.save(n);
  }

  /** ⭐ Misma notificación para muchos usuarios, insertada por lotes (Liga Oplora). */
  async crearVarios(
    usuarioIds: string[],
    datos: {
      tipo: TipoNotificacion;
      titulo: string;
      mensaje: string;
      prioridad?: PrioridadNotificacion;
      urlAccion?: string;
      metadata?: Record<string, any>;
    },
  ): Promise<number> {
    const ids = [...new Set((usuarioIds ?? []).filter(Boolean))];
    const LOTE = 500;
    for (let i = 0; i < ids.length; i += LOTE) {
      const filas = ids.slice(i, i + LOTE).map((usuarioId) =>
        this.repo.create({
          tipo: datos.tipo,
          titulo: limpiar(datos.titulo, 255),
          mensaje: limpiar(datos.mensaje),
          prioridad: datos.prioridad ?? PrioridadNotificacion.MEDIA,
          urlAccion: datos.urlAccion,
          metadata: datos.metadata,
          usuario: { id: usuarioId } as any,
        }),
      );
      await this.repo.insert(filas as any);
    }
    return ids.length;
  }

  async findByUsuario(usuarioId: string, soloNoLeidas = false): Promise<Notificacion[]> {
    const qb = this.repo.createQueryBuilder('n')
      .where('n.usuario = :usuarioId', { usuarioId })
      .orderBy('n.creadoEn', 'DESC')
      .limit(50);

    if (soloNoLeidas) qb.andWhere('n.leida = false');

    return qb.getMany();
  }

  async marcarLeida(id: string, usuarioId: string): Promise<{ ok: true }> {
    // Solo las del propio usuario (el id de otra persona no hace nada).
    await this.repo
      .createQueryBuilder()
      .update()
      .set({ leida: true })
      .where('id = :id', { id })
      .andWhere('"usuarioId" = :usuarioId', { usuarioId })
      .execute();
    return { ok: true };
  }

  async marcarTodasLeidas(usuarioId: string): Promise<{ ok: true }> {
    await this.repo
      .createQueryBuilder()
      .update()
      .set({ leida: true })
      .where('"usuarioId" = :usuarioId', { usuarioId })
      .andWhere('leida = false')
      .execute();
    return { ok: true };
  }

  /** ⭐ Las notificaciones se acumulaban para siempre (la Liga crea muchas cada semana). */
  @Cron('30 4 * * *', { timeZone: 'Europe/Madrid' })
  async limpiarAntiguas(): Promise<void> {
    try {
      const res = await this.repo
        .createQueryBuilder()
        .delete()
        .where(`("leida" = true AND "creadoEn" < NOW() - INTERVAL '${DIAS_LEIDAS} days') OR "creadoEn" < NOW() - INTERVAL '${DIAS_TODAS} days'`)
        .execute();
      if (res.affected) this.logger.log(`Notificaciones antiguas borradas: ${res.affected}`);
    } catch (e: any) {
      this.logger.error(`No se han podido limpiar las notificaciones: ${e?.message ?? e}`);
    }
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

  async notificarNuevaNoticia(usuarioIds: string[], noticiaTitulo: string, urlAccion?: string): Promise<void> {
    for (const usuarioId of usuarioIds) {
      await this.crear({
        usuarioId,
        tipo: TipoNotificacion.NUEVA_NOTICIA,
        titulo: 'Nueva noticia publicada',
        mensaje: `Se ha publicado "${noticiaTitulo}"`,
        prioridad: PrioridadNotificacion.MEDIA,
        urlAccion,
      });
    }
  }

  async notificarRespuestaSoporte(usuarioId: string, asunto: string, urlAccion?: string): Promise<void> {
    await this.crear({
      usuarioId,
      tipo: TipoNotificacion.RESPUESTA_SOPORTE,
      titulo: 'Respuesta a tu consulta de soporte',
      mensaje: `Hemos respondido a tu consulta "${asunto}"`,
      prioridad: PrioridadNotificacion.MEDIA,
      urlAccion,
    });
  }

}