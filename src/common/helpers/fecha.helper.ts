import { diaMadrid } from './dia.helper';

// ⭐ En hora de España (antes en UTC).
export function obtenerFechaHoy() {
  return diaMadrid();
}

export function hanPasadoDias(fecha: Date, dias: number) {
  const ahora = new Date();

  const diferencia =
    ahora.getTime() - new Date(fecha).getTime();

  const diasPasados = diferencia / (1000 * 60 * 60 * 24);

  return diasPasados >= dias;
}

export function esMismoDia(
  fecha1?: Date | string,
  fecha2?: Date | string
) {
  if (!fecha1 || !fecha2) return false;
  return diaMadrid(fecha1) === diaMadrid(fecha2);
}
