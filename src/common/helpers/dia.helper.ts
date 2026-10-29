// ⭐ Días "de calendario" en hora de España. El servidor trabaja en UTC: antes, entre las 00:00 y
// las 01:00/02:00 de España todo contaba como del día anterior (rachas, límites diarios, "hoy"…).
import { partesMadrid, fechaMadrid, sumarDias, textoFecha } from '../../liga/liga-fechas.util';

/** 'YYYY-MM-DD' del día de España en que cae `fecha` (por defecto, ahora). */
export function diaMadrid(fecha: Date | string | number = new Date()): string {
  const p = partesMadrid(new Date(fecha));
  return textoFecha(p);
}

/** 'YYYY-MM-DD' sumando (o restando) días a un día de España. */
export function sumarDiasMadrid(dia: string, dias: number): string {
  const [y, m, d] = dia.split('-').map(Number);
  return textoFecha(sumarDias(y, m, d, dias));
}

/** Instante en que empieza (00:00 en España) el día de `fecha`. */
export function inicioDiaMadrid(fecha: Date = new Date()): Date {
  const p = partesMadrid(fecha);
  return fechaMadrid(p.y, p.m, p.d, '00:00');
}

/** Instante en que empieza el día de España que está `dias` días antes (o después) del de `fecha`. */
export function inicioDiaMadridDesplazado(dias: number, fecha: Date = new Date()): Date {
  const p = partesMadrid(fecha);
  const c = sumarDias(p.y, p.m, p.d, dias);
  return fechaMadrid(c.y, c.m, c.d, '00:00');
}
