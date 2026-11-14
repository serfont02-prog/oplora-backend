import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { NotificacionService } from '../notificacion/notificacion.service';
import { PrioridadNotificacion, TipoNotificacion } from '../notificacion/notificacion.entity';

const DIA = 864e5;
const ZONA = 'Europe/Madrid';

/** 'AAAA-MM-DD' del día en España. */
const diaMadrid = (d: Date) => d.toLocaleDateString('sv-SE', { timeZone: ZONA });
const fechaLarga = (d: Date) => d.toLocaleDateString('es-ES', { timeZone: ZONA, day: 'numeric', month: 'long' });

/** Días naturales (en España) que faltan desde hoy hasta esa fecha: 0 = hoy, 1 = mañana. */
export function diasNaturalesHasta(fin: Date, ahora = new Date()): number {
  const a = Date.parse(diaMadrid(ahora) + 'T00:00:00Z');
  const b = Date.parse(diaMadrid(fin) + 'T00:00:00Z');
  return Math.round((b - a) / DIA);
}

/** Cuándo termina, dicho para personas. */
function cuando(dias: number, fin: Date): string {
  if (dias <= 0) return 'hoy';
  if (dias === 1) return 'mañana';
  return `en ${dias} días (el ${fechaLarga(fin)})`;
}

/**
 * ⭐ Avisos antes de que se acabe el acceso (planes de nov 2026):
 *  - pago único (sin renovación automática): 5 días antes y 1 día antes;
 *  - prueba gratuita: 1 día antes.
 * La renovación automática no avisa: Stripe cobra solo.
 * No se repite: cada aviso lleva una clave (tipo, fecha de fin y etapa) en metadata.
 */
@Injectable()
export class AvisosCaducidadService {
  private readonly logger = new Logger(AvisosCaducidadService.name);

  constructor(
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    private readonly notificaciones: NotificacionService,
  ) {}

  @Cron('0 10 * * *', { timeZone: ZONA })
  async enviarAvisos(ahora = new Date()): Promise<number> {
    let enviados = 0;
    try {
      const candidatos: any[] = await this.usuarioRepo.manager.query(
        `SELECT id, "accesoHasta", "pruebaHasta", "renovacionAutomatica", suscripcion, rol
           FROM usuarios
          WHERE rol IS DISTINCT FROM 'admin'
            AND COALESCE(suscripcion, 'gratuito') = 'gratuito'
            AND (("accesoHasta" > $1 AND "accesoHasta" <= $2 AND "renovacionAutomatica" = false)
              OR ("pruebaHasta" > $1 AND "pruebaHasta" <= $3 AND ("accesoHasta" IS NULL OR "accesoHasta" <= $1)))`,
        [ahora, new Date(ahora.getTime() + 6 * DIA), new Date(ahora.getTime() + 2 * DIA)],
      );
      for (const u of candidatos) {
        const pago = u.accesoHasta ? new Date(u.accesoHasta) : null;
        if (pago && pago > ahora) {
          const dias = diasNaturalesHasta(pago, ahora);
          const etapa = dias <= 1 ? 1 : dias <= 5 ? 5 : 0;
          if (!etapa) continue;
          const base = `pago:${diaMadrid(pago)}`;
          // Si ya se mandó el de 1 día, el de 5 sobra
          const yaEnviadas = etapa === 5 ? [`${base}:5`, `${base}:1`] : [`${base}:1`];
          if (await this.yaAvisado(u.id, yaEnviadas)) continue;
          await this.notificaciones.crear({
            usuarioId: u.id,
            tipo: TipoNotificacion.SUSCRIPCION,
            titulo: `Tu acceso a OPLORA termina ${dias <= 0 ? 'hoy' : dias === 1 ? 'mañana' : `en ${dias} días`}`,
            mensaje: `Tu pago no se renueva solo y termina ${cuando(dias, pago)}. Renueva con tarjeta o Bizum para seguir con todo el temario; lo que pagues se suma al tiempo que te queda.`,
            prioridad: etapa === 1 ? PrioridadNotificacion.ALTA : PrioridadNotificacion.MEDIA,
            urlAccion: '/app/suscripciones',
            metadata: { clave: `${base}:${etapa}` },
          });
          enviados++;
          continue;
        }
        const prueba = u.pruebaHasta ? new Date(u.pruebaHasta) : null;
        if (prueba && prueba > ahora) {
          const dias = diasNaturalesHasta(prueba, ahora);
          if (dias > 1) continue;
          const clave = `prueba:${diaMadrid(prueba)}:1`;
          if (await this.yaAvisado(u.id, [clave])) continue;
          await this.notificaciones.crear({
            usuarioId: u.id,
            tipo: TipoNotificacion.SUSCRIPCION,
            titulo: `Tu prueba gratuita termina ${dias <= 0 ? 'hoy' : 'mañana'}`,
            mensaje: 'Después seguirás teniendo gratis el Tema 1. Con OPLORA mantienes todo el temario, los simulacros y la Liga al precio de lanzamiento.',
            prioridad: PrioridadNotificacion.ALTA,
            urlAccion: '/app/suscripciones',
            metadata: { clave },
          });
          enviados++;
        }
      }
      if (enviados) this.logger.log(`Avisos de fin de acceso enviados: ${enviados}`);
    } catch (e: any) {
      this.logger.error(`No se han podido enviar los avisos de fin de acceso: ${e?.message ?? e}`);
    }
    return enviados;
  }

  private async yaAvisado(usuarioId: string, claves: string[]): Promise<boolean> {
    const filas = await this.usuarioRepo.manager.query(
      `SELECT 1 FROM notificaciones WHERE "usuarioId" = $1 AND tipo = $2 AND metadata->>'clave' = ANY($3) LIMIT 1`,
      [usuarioId, TipoNotificacion.SUSCRIPCION, claves],
    );
    return filas.length > 0;
  }
}
