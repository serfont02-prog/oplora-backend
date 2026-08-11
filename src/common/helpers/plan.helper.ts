import { SUSCRIPCION_LIMITS } from '../../config/plan-limits';
import { SuscripcionUsuario } from '../../usuario/usuario.entity';

/* =========================================================
   OBTENER LIMITES DE LA SUSCRIPCION
========================================================= */

export function getSuscripcionLimits(suscripcion?: SuscripcionUsuario) {
  return (
    SUSCRIPCION_LIMITS[suscripcion || SuscripcionUsuario.GRATUITO] ||
    SUSCRIPCION_LIMITS[SuscripcionUsuario.GRATUITO]
  );
}

/* =========================================================
   FEATURES BOOLEANAS
========================================================= */

export function puedeAcceder(
  suscripcion: SuscripcionUsuario,
  feature: string,
): boolean {
  const limits = getSuscripcionLimits(suscripcion);

  return Boolean(limits[feature]);
}

/* =========================================================
   LIMITES NUMERICOS
========================================================= */

export function obtenerLimite(
  suscripcion: SuscripcionUsuario,
  feature: string,
): number {
  const limits = getSuscripcionLimits(suscripcion);

  return limits[feature] ?? 0;
}

/* =========================================================
   VALIDAR LIMITE
========================================================= */

export function haSuperadoLimite(
  suscripcion: SuscripcionUsuario,
  feature: string,
  valorActual: number,
): boolean {
  const limite = obtenerLimite(suscripcion, feature);

  if (limite === Infinity) {
    return false;
  }

  return valorActual >= limite;
}