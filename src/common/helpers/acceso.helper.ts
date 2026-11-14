import { ForbiddenException } from '@nestjs/common';
import { EntityManager } from 'typeorm';

// ─── Acceso a OPLORA (planes de nov 2026) ───────────────────────────────────────────────
// Un único plan de pago con todo y sin límites diarios. Sin pagar:
//  · los primeros DIAS_PRUEBA días desde el registro, acceso completo (prueba sin tarjeta);
//  · después, solo el TEMA_GRATIS de cada oposición (temario, tests, flashcards y duelos de
//    ese tema). Simulacros, exámenes oficiales, psicotécnicos y liga quedan para quien paga.
// Tienen acceso completo: admins, cuentas con un plan puesto a mano por el admin
// (suscripcion distinta de 'gratuito') y quien tiene accesoHasta o pruebaHasta en el futuro.

export const DIAS_PRUEBA = 5;
export const TEMA_GRATIS = 1;

export type MotivoAcceso = 'admin' | 'regalo' | 'pago' | 'prueba' | 'gratis';

export interface DatosAcceso {
  rol?: string | null;
  suscripcion?: string | null;
  accesoHasta?: Date | string | null;
  pruebaHasta?: Date | string | null;
  renovacionAutomatica?: boolean | null;
}

const fecha = (v: Date | string | null | undefined) => (v ? new Date(v) : null);

export function estadoAcceso(u: DatosAcceso, ahora = new Date()) {
  const pago = fecha(u.accesoHasta);
  const prueba = fecha(u.pruebaHasta);
  let motivo: MotivoAcceso = 'gratis';
  if (u.rol === 'admin') motivo = 'admin';
  else if (u.suscripcion && u.suscripcion !== 'gratuito') motivo = 'regalo';
  else if (pago && pago > ahora) motivo = 'pago';
  else if (prueba && prueba > ahora) motivo = 'prueba';
  return {
    completo: motivo !== 'gratis',
    motivo,
    accesoHasta: pago,
    pruebaHasta: prueba,
    renovacionAutomatica: !!u.renovacionAutomatica && motivo === 'pago',
    temaGratis: TEMA_GRATIS,
  };
}

export function tieneAccesoCompleto(u: DatosAcceso, ahora = new Date()): boolean {
  return estadoAcceso(u, ahora).completo;
}

/** Error que el frontend reconoce para enseñar la hoja de planes. */
export function errorSuscripcion(motivo: 'requiere_suscripcion' | 'tema_bloqueado' = 'requiere_suscripcion'): ForbiddenException {
  return new ForbiddenException(JSON.stringify({
    motivo,
    mensaje: motivo === 'tema_bloqueado'
      ? `Sin suscripción tienes gratis el Tema ${TEMA_GRATIS}. Hazte de OPLORA para estudiar todos los temas.`
      : 'Esto está incluido en OPLORA. Hazte de OPLORA para usarlo.',
  }));
}

async function leerUsuario(m: EntityManager, usuarioId: string): Promise<DatosAcceso | null> {
  const [u] = await m.query(
    `SELECT rol, suscripcion::text AS suscripcion, "accesoHasta", "pruebaHasta", "renovacionAutomatica" FROM usuarios WHERE id = $1`,
    [usuarioId],
  );
  return u ?? null;
}

export async function accesoDeUsuario(m: EntityManager, usuarioId: string) {
  const u = await leerUsuario(m, usuarioId);
  return estadoAcceso(u ?? {});
}

/** Lanza 403 (requiere_suscripcion) si el usuario no tiene acceso completo. */
export async function exigirAccesoCompleto(m: EntityManager, usuarioId: string): Promise<void> {
  if (!(await accesoDeUsuario(m, usuarioId)).completo) throw errorSuscripcion();
}

/**
 * Id del tema gratis del usuario en una oposición: el Tema 1 de su convocatoria en esa oposición
 * (o, si no tiene, de la convocatoria activa / más reciente de la oposición).
 */
export async function temaGratisDe(m: EntityManager, usuarioId: string, oposicionId: string): Promise<string | null> {
  const [f] = await m.query(
    `SELECT t.id FROM temas t
      WHERE t.numero = $3 AND t."convocatoriaId" = COALESCE(
        (SELECT uo."convocatoriaActivaId" FROM usuario_oposiciones uo
          WHERE uo.usuario_id = $1 AND uo.oposicion_id = $2 AND uo."convocatoriaActivaId" IS NOT NULL
          ORDER BY uo.activa DESC LIMIT 1),
        (SELECT c.id FROM convocatorias c WHERE c."oposicionId" = $2
          ORDER BY (c.estado::text = 'activa') DESC, c.anyo DESC NULLS LAST LIMIT 1))
      LIMIT 1`,
    [usuarioId, oposicionId, TEMA_GRATIS],
  );
  return f?.id ?? null;
}

/** Número del tema y oposición de un tema (para comprobar si es el gratis). */
export async function datosTema(m: EntityManager, temaId: string): Promise<{ numero: number; oposicionId: string } | null> {
  const [f] = await m.query(
    `SELECT t.numero, c."oposicionId" FROM temas t JOIN convocatorias c ON c.id = t."convocatoriaId" WHERE t.id = $1`,
    [temaId],
  );
  return f ? { numero: Number(f.numero), oposicionId: f.oposicionId } : null;
}

/** Sin acceso completo, solo se permite el tema gratis (Tema 1 de cualquier oposición). */
export async function exigirTemaPermitido(m: EntityManager, usuarioId: string, temaId: string): Promise<void> {
  const acceso = await accesoDeUsuario(m, usuarioId);
  if (acceso.completo) return;
  const t = await datosTema(m, temaId);
  if (!t || t.numero !== TEMA_GRATIS) throw errorSuscripcion('tema_bloqueado');
}

/** ¿Está el usuario inscrito en la oposición? (para no servir contenido de oposiciones ajenas) */
export async function estaInscrito(m: EntityManager, usuarioId: string, oposicionId: string): Promise<boolean> {
  const [f] = await m.query(
    `SELECT 1 FROM usuario_oposiciones WHERE usuario_id = $1 AND oposicion_id = $2 LIMIT 1`,
    [usuarioId, oposicionId],
  );
  return !!f;
}
