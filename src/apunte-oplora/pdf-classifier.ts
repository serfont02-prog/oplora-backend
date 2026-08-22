import { LineaExtraida, PaginaExtraida, calcularFontSizeBase } from './pdf-extractor';

export type TipoBloque = 'titulo' | 'parrafo' | 'lista' | 'nota' | 'articulo_legal' | 'destacado';

export interface BloqueTitulo {
  id: number;
  tipo: 'titulo';
  nivel: number;
  texto: string;
}

export interface BloqueParrafo {
  id: number;
  tipo: 'parrafo';
  texto: string;
}

export interface BloqueLista {
  id: number;
  tipo: 'lista';
  ordenada: boolean;
  items: string[];
}

export interface BloqueArticuloLegal {
  id: number;
  tipo: 'articulo_legal';
  numero: string;
  texto: string;
}

export interface BloqueDestacado {
  id: number;
  tipo: 'destacado';
  titulo: string;
  contenido: Bloque[];
}

export type Bloque = BloqueTitulo | BloqueParrafo | BloqueLista | BloqueArticuloLegal | BloqueDestacado;

export interface ItemIndice {
  titulo: string;
  nivel: number;
  bloqueId: number;
}

export interface DocumentoLectura {
  titulo: string;
  indice: ItemIndice[];
  bloques: Bloque[];
  estadisticas: {
    numPalabras: number;
    tiempoLecturaMin: number;
    numTitulos: number;
    numParrafos: number;
    numListas: number;
    longitudMediaParrafo: number;
  };
}

// -------------------------------
// PATRONES OPTIMIZADOS
// -------------------------------

// Añadido "·" del PDF
const REGEX_BULLET = /^[•\-\*▪◦·]\s*/;

// Listas numeradas
const REGEX_NUMERADO_LISTA = /^(\d+[\.\)]|[a-z][\.\)])\s+/;

// Artículos legales del Código Civil
const REGEX_ARTICULO_LEGAL = /art[íi]culo\s+(\d+)/i;

// Títulos numerados (sin exigir mayúsculas)
const REGEX_TITULO_NUMERADO = /^(\d+)\.\s+/;

// Subtítulos tipo "1.1."
const REGEX_SUBTITULO_NUMERADO = /^(\d+\.\d+)\.?\s+/;

// Subapartados tipo "A) Derecho objetivo"
const REGEX_SUBAPARTADO_LETRA = /^[A-Z]\)\s+/;

// Palabras clave para cajas destacadas
const PALABRAS_CLAVE_DESTACADO = [
  'ESQUEMA', 'MEMORIZA', 'PREGUNTA', 'FRECUENTE',
  'TRUCO', 'RECUERDA', 'IMPORTANTE', 'ATENCIÓN', 'CLAVE'
];

function esCajaDestacado(texto: string): boolean {
  const upper = texto.toUpperCase();
  return PALABRAS_CLAVE_DESTACADO.some((p) => upper.includes(p));
}

function limpiarTextoBullet(texto: string): string {
  return texto.replace(REGEX_BULLET, '').replace(REGEX_NUMERADO_LISTA, '').trim();
}

function esLineaDeLista(texto: string): boolean {
  return REGEX_BULLET.test(texto) || REGEX_NUMERADO_LISTA.test(texto);
}

function normalizarEspacios(texto: string): string {
  return texto
    .replace(/([a-záéíóúñ])([A-ZÁÉÍÓÚÑ])/g, '$1 $2')
    .replace(/(\d)([a-zA-ZáéíóúÁÉÍÓÚñÑ])/g, '$1 $2')
    .replace(/([a-zA-ZáéíóúñÁÉÍÓÚÑ])(\()/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

// -------------------------------
// CLASIFICADOR PRINCIPAL
// -------------------------------

export function clasificarDocumento(paginas: PaginaExtraida[], tituloDocumento: string): DocumentoLectura {
  const fontSizeBase = calcularFontSizeBase(paginas);
  const umbralTitulo1 = fontSizeBase * 1.6;
  const umbralTitulo2 = fontSizeBase * 1.25;
  const umbralPortada = fontSizeBase * 2;

  const bloques: Bloque[] = [];
  const indice: ItemIndice[] = [];
  let idCounter = 0;

  let bufferParrafo: string[] = [];
  let bufferListaItems: string[] = [];
  let bufferListaOrdenada = false;
  let bufferTitulo: { nivel: number; lineas: string[] } | null = null;
  let ultimoFueItemLista = false;

  let destacadoAbierto: { titulo: string; contenido: Bloque[]; idInterno: number } | null = null;

  const flushTitulo = () => {
    if (!bufferTitulo) return;
    const texto = normalizarEspacios(bufferTitulo.lineas.join(' ').trim());
    const bloque: BloqueTitulo = {
      id: idCounter++,
      tipo: 'titulo',
      nivel: bufferTitulo.nivel,
      texto
    };
    bloques.push(bloque);
    indice.push({ titulo: texto, nivel: bufferTitulo.nivel, bloqueId: bloque.id });
    bufferTitulo = null;
  };

  const flushParrafo = () => {
    if (bufferParrafo.length === 0) return;
    const texto = normalizarEspacios(bufferParrafo.join(' ').trim());
    if (texto.length > 0) {
      const bloque: BloqueParrafo = { id: idCounter++, tipo: 'parrafo', texto };
      if (destacadoAbierto) destacadoAbierto.contenido.push(bloque);
      else bloques.push(bloque);
    }
    bufferParrafo = [];
  };

  const flushLista = () => {
    if (bufferListaItems.length === 0) return;
    const bloque: BloqueLista = {
      id: idCounter++,
      tipo: 'lista',
      ordenada: bufferListaOrdenada,
      items: bufferListaItems.map(normalizarEspacios)
    };
    if (destacadoAbierto) destacadoAbierto.contenido.push(bloque);
    else bloques.push(bloque);
    bufferListaItems = [];
    ultimoFueItemLista = false;
  };

  const cerrarDestacado = () => {
    if (!destacadoAbierto) return;
    bloques.push({
      id: destacadoAbierto.idInterno,
      tipo: 'destacado',
      titulo: destacadoAbierto.titulo,
      contenido: destacadoAbierto.contenido
    });
    destacadoAbierto = null;
  };

  // -------------------------------
  // RECORRIDO DEL PDF
  // -------------------------------

  for (const pagina of paginas) {
    for (const linea of pagina.lineas) {
      const texto = linea.texto.trim();
      if (!texto) continue;

      if (pagina.pagina === 1 && linea.fontSize >= umbralPortada) continue;

      // Caja destacada
      if (linea.bold && esCajaDestacado(texto)) {
        flushTitulo();
        flushParrafo();
        flushLista();
        cerrarDestacado();
        destacadoAbierto = {
          titulo: normalizarEspacios(texto),
          contenido: [],
          idInterno: idCounter++
        };
        continue;
      }

      // Artículo legal
      const matchArticulo = texto.match(REGEX_ARTICULO_LEGAL);
      if (matchArticulo) {
        flushTitulo();
        flushParrafo();
        flushLista();
        cerrarDestacado();
        bloques.push({
          id: idCounter++,
          tipo: 'articulo_legal',
          numero: matchArticulo[1],
          texto: normalizarEspacios(texto)
        });
        continue;
      }

      // Títulos
      const esTitulo1 =
        linea.fontSize >= umbralTitulo1 ||
        (linea.bold && REGEX_TITULO_NUMERADO.test(texto));

      const esTitulo2 =
        !esTitulo1 &&
        (linea.fontSize >= umbralTitulo2 ||
          (linea.bold &&
            (REGEX_SUBTITULO_NUMERADO.test(texto) ||
             REGEX_SUBAPARTADO_LETRA.test(texto))));

      if (esTitulo1 || esTitulo2) {
        cerrarDestacado();
        flushParrafo();
        flushLista();

        const nivelActual = esTitulo1 ? 1 :
          REGEX_SUBAPARTADO_LETRA.test(texto) ? 3 : 2;

        if (bufferTitulo && bufferTitulo.nivel === nivelActual) {
          bufferTitulo.lineas.push(texto);
        } else {
          flushTitulo();
          bufferTitulo = { nivel: nivelActual, lineas: [texto] };
        }
        continue;
      }

      flushTitulo();

      // Listas
      if (esLineaDeLista(texto)) {
        flushParrafo();
        const esNumerada = REGEX_NUMERADO_LISTA.test(texto) && !REGEX_BULLET.test(texto);
        if (bufferListaItems.length === 0) bufferListaOrdenada = esNumerada;
        bufferListaItems.push(limpiarTextoBullet(texto));
        ultimoFueItemLista = true;
        continue;
      }

      // Líneas que continúan el último item de lista
      if (ultimoFueItemLista && bufferListaItems.length > 0) {
        const idx = bufferListaItems.length - 1;
        bufferListaItems[idx] += ' ' + texto;
        continue;
      }

      if (bufferListaItems.length > 0) flushLista();

      // Párrafos (optimización: cortar por puntos finales)
      bufferParrafo.push(texto);
      if (texto.endsWith('.')) flushParrafo();
    }
  }

  flushTitulo();
  flushParrafo();
  flushLista();
  cerrarDestacado();

  // -------------------------------
  // ESTADÍSTICAS
  // -------------------------------

  const textoTotal = bloques
    .map((b) => {
      if (b.tipo === 'parrafo' || b.tipo === 'articulo_legal') return b.texto;
      if (b.tipo === 'lista') return b.items.join(' ');
      if (b.tipo === 'titulo') return b.texto;
      if (b.tipo === 'destacado') return b.contenido.map((c: any) => c.texto ?? (c.items ?? []).join(' ')).join(' ');
      return '';
    })
    .join(' ');

  const numPalabras = textoTotal.split(/\s+/).filter(Boolean).length;
  const tiempoLecturaMin = Math.max(1, Math.round(numPalabras / 200));

  const parrafos = bloques.filter((b) => b.tipo === 'parrafo') as BloqueParrafo[];
  const longitudMediaParrafo =
    parrafos.length > 0
      ? Math.round(parrafos.reduce((acc, p) => acc + p.texto.length, 0) / parrafos.length)
      : 0;

  return {
    titulo: tituloDocumento,
    indice,
    bloques,
    estadisticas: {
      numPalabras,
      tiempoLecturaMin,
      numTitulos: bloques.filter((b) => b.tipo === 'titulo').length,
      numParrafos: parrafos.length,
      numListas: bloques.filter((b) => b.tipo === 'lista').length,
      longitudMediaParrafo
    }
  };
}
