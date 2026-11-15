// ⭐ Auditoría M11: una sola forma de leer la penalización de una convocatoria.
// Antes había tres (simulacros, liga y duelos) y no entendían lo mismo: con «0,33» los simulacros
// y la liga no penalizaban y los duelos sí.
// Admite «1/3», «0.33» y «0,33». Vacío o no válido → 0 (no penaliza).

export const FORMATO_PENALIZACION = /^\s*(|\d+\s*\/\s*[1-9]\d*|\d+([.,]\d+)?)\s*$/;

export function parseFraccion(valor: string | number | null | undefined): number {
  if (valor == null) return 0;
  const s = String(valor).trim().replace(',', '.');
  if (!s) return 0;
  let n: number;
  if (s.includes('/')) {
    const partes = s.split('/');
    if (partes.length !== 2) return 0;
    const a = Number(partes[0]);
    const b = Number(partes[1]);
    n = b ? a / b : 0;
  } else {
    n = Number(s);
  }
  return Number.isFinite(n) && n > 0 ? n : 0;
}
