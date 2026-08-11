export function obtenerFechaHoy() {
  return new Date().toISOString().split('T')[0];
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

  return (
    new Date(fecha1).toISOString().split('T')[0] ===
    new Date(fecha2).toISOString().split('T')[0]
  );
}