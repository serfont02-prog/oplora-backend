// ⭐ Fechas de la liga en hora de Madrid (el servidor trabaja en UTC).

const ZONA = 'Europe/Madrid';

export interface PartesMadrid {
  y: number;
  m: number; // 1-12
  d: number;
  h: number;
  min: number;
  diaSemana: number; // 1 = lunes … 7 = domingo
}

const formateador = new Intl.DateTimeFormat('en-GB', {
  timeZone: ZONA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  weekday: 'short',
});

const DIAS: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

export function partesMadrid(fecha: Date): PartesMadrid {
  const p: Record<string, string> = {};
  for (const parte of formateador.formatToParts(fecha)) p[parte.type] = parte.value;
  return {
    y: Number(p.year),
    m: Number(p.month),
    d: Number(p.day),
    h: Number(p.hour) % 24,
    min: Number(p.minute),
    diaSemana: DIAS[p.weekday] ?? 1,
  };
}

// Diferencia (ms) entre la hora de Madrid y UTC en un instante dado.
function desfaseMadrid(instante: number): number {
  const p = partesMadrid(new Date(instante));
  const comoUtc = Date.UTC(p.y, p.m - 1, p.d, p.h, p.min);
  const redondeado = Math.floor(instante / 60000) * 60000;
  return comoUtc - redondeado;
}

/** Fecha (UTC) correspondiente a una hora local de Madrid. */
export function fechaMadrid(y: number, m: number, d: number, hhmm: string): Date {
  const [h, min] = hhmm.split(':').map((x) => Number(x) || 0);
  const supuesto = Date.UTC(y, m - 1, d, h, min);
  let resultado = supuesto - desfaseMadrid(supuesto);
  // Segunda pasada por si el cambio de hora cae entre medias
  resultado = supuesto - desfaseMadrid(resultado);
  return new Date(resultado);
}

/** Suma días a una fecha de calendario (sin horas). */
export function sumarDias(y: number, m: number, d: number, dias: number): { y: number; m: number; d: number } {
  const f = new Date(Date.UTC(y, m - 1, d + dias));
  return { y: f.getUTCFullYear(), m: f.getUTCMonth() + 1, d: f.getUTCDate() };
}

export function textoFecha(c: { y: number; m: number; d: number }): string {
  return `${c.y}-${String(c.m).padStart(2, '0')}-${String(c.d).padStart(2, '0')}`;
}

export function mesDe(c: { y: number; m: number }): string {
  return `${c.y}-${String(c.m).padStart(2, '0')}`;
}

/**
 * Fin de semana de la semana (lunes a domingo, hora de Madrid) que contiene `ahora`.
 * Devuelve el lunes, el viernes, el sábado (que decide el mes) y el domingo.
 */
export function finDeSemanaDe(ahora: Date) {
  const p = partesMadrid(ahora);
  const lunes = sumarDias(p.y, p.m, p.d, -(p.diaSemana - 1));
  return {
    lunes,
    viernes: sumarDias(lunes.y, lunes.m, lunes.d, 4),
    sabado: sumarDias(lunes.y, lunes.m, lunes.d, 5),
    domingo: sumarDias(lunes.y, lunes.m, lunes.d, 6),
  };
}

/** Parte un viernes 'AAAA-MM-DD' en sus componentes. */
export function parsearFecha(texto: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto ?? '');
  if (!m) return null;
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
}

export function diaSemanaDe(c: { y: number; m: number; d: number }): number {
  const dia = new Date(Date.UTC(c.y, c.m - 1, c.d)).getUTCDay(); // 0 = domingo
  return dia === 0 ? 7 : dia;
}
