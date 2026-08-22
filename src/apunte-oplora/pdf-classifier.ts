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
// PATRONES
// -------------------------------

// Desactivamos listas numeradas (tu PDF no las usa)
const REGEX_NUMERADO_LISTA = /^$/;

// Bullets reales (si el extractor los detecta)
const REGEX_BULLET = /^[•\-\*▪◦·]\s*/;

// Artículos legales
const REGEX_ARTICULO_LEGAL = /art[íi]culo\s+(\d+)/i;

// Títulos numerados
const REGEX_TITULO_NUMERADO = /^(\d+)\.\s+/;

// Subtítulos tipo 1.1
const REGEX_SUBTITULO_NUMERADO = /^(\d+\.\d+)\.?\s+/;

// Subapartados tipo A)
const REGEX_SUBAPARTADO_LETRA = /^[A-Z]\)\s+/;

// Cajas destacadas
const PALABRAS_CLAVE_DESTACADO = [
  'ESQUEMA', 'MEMORIZA', 'PREGUNTA', 'FRECUENTE',
  'TRUCO', 'RECUERDA', 'IMPORTANTE', 'ATENCIÓN', 'CLAVE'
];

function esCajaDestacado(texto: string): boolean {
  const upper = texto.toUpperCase();
  return PALABRAS_CLAVE_DESTACADO.some((p) => upper.includes(p));
}

function normalizarEspacios(texto: string): string {
  return texto.replace(/\s+/g, ' ').trim();
}

// -------------------------------
// CLASIFICADOR
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
    const texto = normalizarEspacios(bufferTitulo.lineas.join(' '));
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
    const texto = normalizarEspacios(bufferParrafo.join(' '));
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

      // Detectar lista por indentación (muy fiable)
      const esBulletPorIndentacion = linea.x < 40;

      if (esBulletPorIndentacion) {
        flushTitulo();
        flushParrafo();
        bufferListaOrdenada = false;
        bufferListaItems.push(texto);
        ultimoFueItemLista = true;
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

        // Nunca concatenar títulos
        flushTitulo();
        bufferTitulo = { nivel: nivelActual, lineas: [texto] };
        continue;
      }

      flushTitulo();

      // Si venimos de lista y esta línea no es lista → cerrar lista
      if (ultimoFueItemLista && bufferListaItems.length > 0) {
        flushLista();
      }

      // Párrafo (siempre separado)
      bufferParrafo.push(texto);
      flushParrafo();
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
