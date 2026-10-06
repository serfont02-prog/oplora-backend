/**
 * Utilidades para dejar el texto de los artículos con el MISMO formato que la
 * Constitución (el parseo de referencia):
 *
 *   "1. Primer apartado en una sola línea.\n\n2. Segundo apartado...\n\na) Letra..."
 *
 * Es decir: cada párrafo real en una sola línea y los párrafos separados por
 * una línea en blanco ("\n\n"). Nada de saltos de línea "duros" heredados del
 * PDF a mitad de frase.
 */
import * as cheerio from 'cheerio';

export const SEPARADOR_PARRAFOS = '\n\n';

/** Clave para emparejar artículos: "Artículo 24 bis." -> "24bis" */
export function claveArticulo(numero: string | null | undefined): string {
  return (numero ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/^art(iculo|\.)?\s*/, '')
    .replace(/[\s.º°]+/g, '')
    .trim();
}

/** Une los párrafos limpios con el separador estándar. */
export function unirParrafos(parrafos: string[]): string {
  return parrafos
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join(SEPARADOR_PARRAFOS);
}

// ─── MODO BOE (exacto) ─────────────────────────────────────────────────────

export interface ArticuloBoe {
  numero: string;   // "1", "24 bis"
  rubrica?: string; // "Objeto."
  contenido: string; // párrafos separados por \n\n
}

/**
 * Parsea el XML de la API de legislación consolidada del BOE
 * (/datosabiertos/api/legislacion-consolidada/id/{BOE-A-...}/texto) y devuelve
 * los artículos con su texto vigente (última <version> de cada bloque),
 * respetando los párrafos tal y como los publica el BOE (<p>).
 */
export function parsearXmlConsolidadoBoe(xml: string): { articulos: ArticuloBoe[]; otrosPreceptos: string[] } {
  const $ = cheerio.load(xml, { xml: true });
  const articulos: ArticuloBoe[] = [];
  const otrosPreceptos: string[] = [];

  $('bloque').each((_, el) => {
    const bloque = $(el);
    const tipo = (bloque.attr('tipo') ?? '').toLowerCase();
    if (tipo && tipo !== 'precepto') return;

    const tituloBloque = (bloque.attr('titulo') ?? '').trim();
    const versiones = bloque.children('version');
    const ultima = versiones.length ? versiones.last() : bloque;

    let cabecera = '';
    const parrafos: string[] = [];

    ultima.find('p').each((__, p) => {
      const nodo = $(p);
      const clase = (nodo.attr('class') ?? '').toLowerCase();
      const texto = nodo.text().replace(/\s+/g, ' ').trim();
      if (!texto) return;
      if (clase === 'articulo') { cabecera = texto; return; }
      // Notas del BOE ("Se modifica por...", "Téngase en cuenta...") no son texto de la ley
      if (clase.startsWith('nota')) return;
      parrafos.push(texto);
    });

    const ref = tituloBloque || cabecera;
    const m = ref.match(/^Art[íi]culo\s+(\d+(?:\s*(?:bis|ter|quater|quinquies|sexies|septies|octies|nonies|decies))?)/i);
    if (!m) {
      if (ref) otrosPreceptos.push(ref);
      return;
    }

    const numero = m[1].replace(/\s+/g, ' ').trim();
    let rubrica: string | undefined;
    const mc = cabecera.match(/^Art[íi]culo\s+[^.]+\.\s*(.*)$/i);
    if (mc && mc[1]) rubrica = mc[1].trim();

    articulos.push({ numero, rubrica, contenido: unirParrafos(parrafos) });
  });

  return { articulos, otrosPreceptos };
}

// ─── MODO LOCAL (sin red, heurístico) ──────────────────────────────────────

// Una línea que empieza así abre un párrafo nuevo (apartados y letras)
const INICIO_PARRAFO = [
  /^\d+(\.\d+)*\.\s+\S/,       // "1. ", "2.1. "
  /^\d+\.ª\s/,                 // "1.ª "
  /^[a-zñ]\)\s/i,              // "a) "
  /^[a-zñ]\.\s+[A-ZÁÉÍÓÚÑ]/,   // "a. Texto"
  /^[ivxlc]+\)\s/i,            // "i) ", "iv) "
  /^\d+\.º\s/,                 // "1.º "
  /^[–—•·-]\s/,                // guiones / viñetas
  /^«/,                        // inicio de cita
];

/**
 * Reconstruye los párrafos de un texto con saltos de línea "duros" (los del
 * PDF). Une todas las líneas salvo cuando la siguiente empieza por un marcador
 * de apartado (1., a), 1.ª, –...). Pensado como respaldo cuando no se puede
 * descargar el texto del BOE.
 */
export function normalizarSaltosLocal(texto: string): string {
  if (!texto) return '';
  const limpio = texto
    .replace(/\r\n?/g, '\n')
    .replace(/­/g, '')                              // guiones blandos
    .replace(/([a-záéíóúñü])-\n\s*([a-záéíóúñü])/g, '$1$2'); // "adminis-\ntración"

  const lineas = limpio.split('\n').map((l) => l.trim()).filter(Boolean);
  const parrafos: string[] = [];
  let actual = '';

  // Ancho típico de línea del PDF: una línea que acaba en "." / ":" y es
  // claramente más corta que el resto suele ser el final de un párrafo.
  const longitudes = lineas.map((l) => l.length).sort((a, b) => a - b);
  const mediana = longitudes[Math.floor(longitudes.length / 2)] ?? 0;
  let anterior = '';

  for (const linea of lineas) {
    const abre =
      INICIO_PARRAFO.some((re) => re.test(linea)) ||
      (lineas.length >= 6 && /[.:]$/.test(anterior) && anterior.length < mediana * 0.7 && /^[A-ZÁÉÍÓÚÑ«]/.test(linea));
    anterior = linea;
    if (abre && actual) {
      parrafos.push(actual);
      actual = linea;
    } else {
      actual = actual ? `${actual} ${linea}` : linea;
    }
  }
  if (actual) parrafos.push(actual);

  return unirParrafos(parrafos);
}

/**
 * Normaliza el contenido que llega en un import (JSON hecho a mano / por IA):
 *  - Si ya trae párrafos separados por línea en blanco (formato Constitución),
 *    se respetan y solo se eliminan los saltos sueltos DENTRO de cada párrafo.
 *  - Si solo trae saltos simples (copiado de PDF), se reconstruyen los párrafos.
 */
export function normalizarContenido(texto: string | null | undefined): string {
  if (!texto) return '';
  const t = texto.replace(/\r\n?/g, '\n').trim();
  if (/\n\s*\n/.test(t)) {
    return unirParrafos(
      t.split(/\n\s*\n/).map((bloque) =>
        bloque.replace(/([a-záéíóúñü])-\n\s*([a-záéíóúñü])/g, '$1$2').replace(/\n/g, ' '),
      ),
    );
  }
  return t.includes('\n') ? normalizarSaltosLocal(t) : unirParrafos([t]);
}

// ─── SUBRAYADOS ────────────────────────────────────────────────────────────

/**
 * Busca un fragmento subrayado dentro del nuevo contenido ignorando
 * diferencias de espacios/saltos de línea. Devuelve [inicio, fin] o null.
 */
export function relocalizarFragmento(contenido: string, fragmento: string, inicioAnterior = 0): [number, number] | null {
  const palabras = (fragmento ?? '').trim().split(/\s+/).filter(Boolean);
  if (!palabras.length) return null;
  const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(palabras.map(escapar).join('\\s+'), 'g');

  let mejor: [number, number] | null = null;
  let m: RegExpExecArray | null;
  while ((m = re.exec(contenido)) !== null) {
    const cand: [number, number] = [m.index, m.index + m[0].length];
    // Si el fragmento aparece varias veces, nos quedamos con la más cercana a la posición original
    if (!mejor || Math.abs(cand[0] - inicioAnterior) < Math.abs(mejor[0] - inicioAnterior)) mejor = cand;
    if (m[0].length === 0) re.lastIndex++;
  }
  return mejor;
}
