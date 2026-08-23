/**
 * pdf-classifier.ts
 *
 * Clasificador de líneas extraídas del PDF en bloques estructurados:
 * - títulos (niveles 1 y 2)
 * - párrafos
 * - listas (bullets y numeradas)
 * - artículos legales
 * - cajas destacadas
 *
 * Marcadores explícitos soportados:
 * - [EJ texto] -> EJEMPLO
 * - [ID texto] -> IDEA
 * - [ES texto] -> ESQUEMA
 * - [TR texto] -> TRAMPA DE EXAMEN
 * - [RE texto] -> REGLA DE EXAMEN
 * - [PR texto] -> PREGUNTA FRECUENTE
 *
 * El contenido va DENTRO del corchete (puede cerrarse en la misma línea
 * o continuar en líneas siguientes hasta encontrar el "]").
 */

import {
  LineaExtraida,
  PaginaExtraida,
  calcularFontSizeBase
} from './pdf-extractor';

// =====================================================
// CONFIG / DEBUG
// =====================================================

const DEBUG = false; // poner true para depurar (logs por línea)

// =====================================================
// TIPOS
// =====================================================

export type TipoBloque =
  | 'titulo'
  | 'parrafo'
  | 'lista'
  | 'nota'
  | 'articulo_legal'
  | 'destacado';

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

export type Bloque =
  | BloqueTitulo
  | BloqueParrafo
  | BloqueLista
  | BloqueArticuloLegal
  | BloqueDestacado;

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

// =====================================================
// PATRONES (regex y constantes)
// =====================================================

const REGEX_TITULO_NIVEL_1 = /^(\d+)\.-\s*(.+)$/;
const REGEX_TITULO_NIVEL_2 = /^(\d+\.\d+)\.?\s+(.+)$/;
const REGEX_TITULO_ORDINAL = /^(\d+)\.[oº]\s+(.+)$/i; // "1.º", "2.º" (o "1.o" si el PDF exporta la º como "o")
const REGEX_SUBAPARTADO_LETRA = /^[A-ZÁÉÍÓÚÑ]\)\s+(.+)$/;
const REGEX_BULLET = /^[•▪◦·]\s*/;
const REGEX_LISTA_NUMERADA = /^(\d+)\.\s+(.+)$/;
const REGEX_LISTA_ORDINAL = /^(\d+)[.ºªº]\s+(.+)$/;
const REGEX_ARTICULO_LEGAL = /^art[íi]culo\s+(\d+(?:\.\d+)?)/i;
const REGEX_APERTURA_MARCADOR = /\[(EJ|ID|ES|TR|RE|PR)\b\s*(.*)$/i;

// =====================================================
// UTILIDADES
// =====================================================

function normalizarEspacios(texto: string): string {
  return texto.replace(/\s+/g, ' ').trim();
}

function normalizarComparacion(texto: string): string {
  return normalizarEspacios(texto).toUpperCase().replace(/:$/, '').trim();
}

function esTodoMayusculas(texto: string): boolean {
  const soloLetras = texto.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '');
  if (soloLetras.length < 4) return false;
  return soloLetras === soloLetras.toUpperCase();
}

// =====================================================
// DETECCIÓN DE TÍTULOS (niveles)
// =====================================================

function esTituloNivel1(linea: LineaExtraida, fontSizeBase: number): boolean {
  const texto = linea.texto.trim();
  if (!REGEX_TITULO_NIVEL_1.test(texto)) return false;
  return true; // el patrón numérico "N." es suficiente
}

function esTituloNivel2(linea: LineaExtraida, fontSizeBase: number): boolean {
  const texto = linea.texto.trim();
  if (!REGEX_TITULO_NIVEL_2.test(texto)) return false;
  return true; // el patrón numérico "N.N." es suficiente, sin exigir fuente/negrita
}

function esTituloOrdinal(linea: LineaExtraida): boolean {
  return REGEX_TITULO_ORDINAL.test(linea.texto.trim());
}

// =====================================================
// DETECCIÓN DE LISTAS
// =====================================================

function esBullet(texto: string): boolean {
  return REGEX_BULLET.test(texto);
}

function esBulletPorIndentacion(linea: LineaExtraida, margen = 40): boolean {
  return typeof linea.x === 'number' && linea.x < margen;
}

function esListaNumerada(texto: string): boolean {
  return REGEX_LISTA_NUMERADA.test(texto) || REGEX_LISTA_ORDINAL.test(texto);
}

function limpiarBullet(texto: string): string {
  return texto.replace(REGEX_BULLET, '').trim();
}

function limpiarNumeroLista(texto: string): string {
  return texto.replace(/^(\d+)[\.\ºªº]?\s+/, '').trim();
}

// =====================================================
// HEURÍSTICAS DE CONTINUACIÓN (listas / párrafos)
// =====================================================

function esContinuacionLista(
  linea: LineaExtraida,
  siguiente: LineaExtraida | undefined,
  fontSizeBase: number
): boolean {
  const texto = linea.texto.trim();
  if (!texto) return false;
  if (
    esTituloNivel1(linea, fontSizeBase) ||
    esTituloNivel2(linea, fontSizeBase) ||
    esBullet(texto) ||
    esListaNumerada(texto)
  ) {
    return false;
  }
  if (typeof linea.x === 'number' && linea.x > 40) return false;
  if (siguiente) {
    if (
      esTituloNivel1(siguiente, fontSizeBase) ||
      esTituloNivel2(siguiente, fontSizeBase)
    ) {
      return false;
    }
  }
  return true;
}
// =====================================================
// CLASIFICADOR PRINCIPAL
// =====================================================

export function clasificarDocumento(
  paginas: PaginaExtraida[],
  tituloDocumento: string
): DocumentoLectura {

  const fontSizeBase = calcularFontSizeBase(paginas);
  const bloques: Bloque[] = [];
  const indice: ItemIndice[] = [];
  let idCounter = 1;

  // Buffers
  let bufferParrafo: string[] = [];
  let bufferListaItems: string[] = [];
  let bufferListaOrdenada = false;
  let ultimoTipo: 'parrafo' | 'lista' | 'titulo' | null = null;
  let destacadoAbierto: { titulo: string; contenido: Bloque[]; idInterno: number } | null = null;

  // Debug counters
  let contadorLineasEntrantes = 0;
  let contadorSaltadas = 0;
  const motivosSaltado: Record<string, number> = {};
  function markSkip(motivo: string) {
    contadorSaltadas++;
    motivosSaltado[motivo] = (motivosSaltado[motivo] || 0) + 1;
  }

  // Helpers
  const añadirBloque = (bloque: Bloque) => {
    if (destacadoAbierto) destacadoAbierto.contenido.push(bloque);
    else bloques.push(bloque);
  };

  const flushParrafo = () => {
    if (bufferParrafo.length === 0) return;
    const texto = normalizarEspacios(bufferParrafo.join(' '));
    if (texto.length > 0) {
      añadirBloque({ id: idCounter++, tipo: 'parrafo', texto });
    }
    bufferParrafo = [];
    ultimoTipo = 'parrafo';
  };

  const flushLista = () => {
    if (bufferListaItems.length === 0) return;
    añadirBloque({ id: idCounter++, tipo: 'lista', ordenada: bufferListaOrdenada, items: bufferListaItems.map(normalizarEspacios) });
    bufferListaItems = [];
    ultimoTipo = 'lista';
  };

  const cerrarDestacado = () => {
    if (!destacadoAbierto) return;
    flushParrafo();
    flushLista();
    bloques.push({ id: destacadoAbierto.idInterno, tipo: 'destacado', titulo: destacadoAbierto.titulo, contenido: destacadoAbierto.contenido });
    destacadoAbierto = null;
  };

  const añadirTitulo = (texto: string, nivel: number) => {
    const bloque: BloqueTitulo = { id: idCounter++, tipo: 'titulo', nivel, texto: normalizarEspacios(texto) };
    bloques.push(bloque);
    indice.push({ titulo: bloque.texto, nivel, bloqueId: bloque.id });
    ultimoTipo = 'titulo';
  };

  // RECORRIDO PRINCIPAL
  for (const pagina of paginas) {
    const lineas = pagina.lineas;

    for (let i = 0; i < lineas.length; i++) {
      const linea = lineas[i];
      contadorLineasEntrantes++;

      const siguiente = lineas[i + 1];
      const texto = normalizarEspacios(linea.texto);

      if (DEBUG) console.debug('LINEA_IN', { i, texto: texto.slice(0, 120), x: linea.x, y: linea.y, fontSize: linea.fontSize, bold: linea.bold });

      if (!texto) {
        markSkip('vacia');
        continue;
      }

      // Ignorar portada (título gigante)
      const esPrimeraPagina = pagina.pagina === 1;
      const esTextoMuyGrande = linea.fontSize >= fontSizeBase * 1.8;
      if (esPrimeraPagina && esTextoMuyGrande) {
        markSkip('portada');
        continue;
      }

      // -----------------------------
      // DETECCIÓN DE MARCADORES EXPLÍCITOS [EJ ...], [ID ...], [ES ...], [TR ...], [RE ...], [PR ...]
      // El contenido va DENTRO del corchete, que puede cerrarse en la misma línea
      // o continuar en líneas siguientes hasta el "]"
      // -----------------------------
      const matchMarcador = texto.match(REGEX_APERTURA_MARCADOR);

      if (matchMarcador) {
        const key = matchMarcador[1].toUpperCase();
        const lineasContenido: string[] = [];
        const primerSegmento = (matchMarcador[2] || '').trim();

        let cerrado = primerSegmento.includes(']');
        if (cerrado) {
          const idxCierre = primerSegmento.indexOf(']');
          const trozo = primerSegmento.slice(0, idxCierre).trim();
          if (trozo) lineasContenido.push(trozo);
        } else if (primerSegmento) {
          lineasContenido.push(primerSegmento);
        }

        let j = i;
        const MAX_LINEAS_MARCADOR = 15;
        let consumidas = 0;

        while (!cerrado && consumidas < MAX_LINEAS_MARCADOR && j + 1 < lineas.length) {
          j++;
          const siguienteTexto = normalizarEspacios(lineas[j].texto || '');
          if (siguienteTexto) {
            if (siguienteTexto.includes(']')) {
              const idxCierre = siguienteTexto.indexOf(']');
              const trozo = siguienteTexto.slice(0, idxCierre).trim();
              if (trozo) lineasContenido.push(trozo);
              cerrado = true;
            } else {
              lineasContenido.push(siguienteTexto);
            }
          }
          consumidas++;
        }

        const tituloMap: Record<string, string> = {
          EJ: 'EJEMPLO',
          ID: 'IDEA',
          ES: 'ESQUEMA',
          TR: 'TRAMPA DE EXAMEN',
          RE: 'REGLA DE EXAMEN',
          PR: 'PREGUNTA FRECUENTE',
        };
        const titulo = tituloMap[key] || key;

        flushParrafo();
        flushLista();
        cerrarDestacado();

        // cada línea original se conserva como su propio párrafo dentro de la caja
        const contenidoBloques: Bloque[] = lineasContenido
          .filter(Boolean)
          .map((linea) => ({ id: idCounter++, tipo: 'parrafo' as const, texto: normalizarEspacios(linea) }));

        bloques.push({
          id: idCounter++,
          tipo: 'destacado',
          titulo,
          contenido: contenidoBloques,
        });

        ultimoTipo = 'parrafo';
        i = j; // saltar las líneas ya consumidas por el marcador
        continue;
      }

            // TITULO ORDINAL (1.º, 2.º, 3.º...)
      if (esTituloOrdinal(linea)) {
        flushParrafo();
        flushLista();
        cerrarDestacado();
        añadirTitulo(texto, 2); // nivel 2, mismo peso visual que "1.1."
        if (DEBUG) console.debug('TITULO_ORDINAL', { texto });
        continue;
      }

      // TITULO NIVEL 1
      if (esTituloNivel1(linea, fontSizeBase)) {
        flushParrafo();
        flushLista();
        cerrarDestacado();
        añadirTitulo(texto, 1);
        if (DEBUG) console.debug('TITULO1', { texto });
        continue;
      }

      // TITULO NIVEL 2
      if (esTituloNivel2(linea, fontSizeBase)) {
        flushParrafo();
        flushLista();
        cerrarDestacado();
        añadirTitulo(texto, 2);
        if (DEBUG) console.debug('TITULO2', { texto });
        continue;
      }

      // SUBAPARTADOS tipo A) B) C)
      // Tratamos A) como párrafo propio (salto de línea).
      if (REGEX_SUBAPARTADO_LETRA.test(texto)) {
        flushParrafo();
        flushLista();
        añadirBloque({ id: idCounter++, tipo: 'parrafo', texto });
        ultimoTipo = 'parrafo';
        if (DEBUG) console.debug('SUBAPARTADO como parrafo (salto)', { texto });
        continue;
      }

      // ARTÍCULO LEGAL
      const matchArticulo = texto.match(REGEX_ARTICULO_LEGAL);
      if (matchArticulo) {
        flushParrafo();
        flushLista();
        añadirBloque({ id: idCounter++, tipo: 'articulo_legal', numero: matchArticulo[1], texto });
        ultimoTipo = 'titulo';
        if (DEBUG) console.debug('ARTICULO', { numero: matchArticulo[1], texto });
        continue;
      }

      // BULLETS (carácter o indentación)
      const esBulletLinea = esBullet(texto) || esBulletPorIndentacion(linea, 40);
      if (esBulletLinea) {
        flushParrafo();
        if (bufferListaItems.length > 0 && bufferListaOrdenada) flushLista();
        bufferListaOrdenada = false;
        bufferListaItems.push(limpiarBullet(texto));
        ultimoTipo = 'lista';
        if (DEBUG) console.debug('BULLET', { texto });
        continue;
      }

      // LISTAS NUMERADAS
      if (esListaNumerada(texto)) {
        if (bufferListaItems.length > 0 && !bufferListaOrdenada) flushLista();
        flushParrafo();
        bufferListaOrdenada = true;
        bufferListaItems.push(limpiarNumeroLista(texto));
        ultimoTipo = 'lista';
        if (DEBUG) console.debug('LISTA NUM', { texto });
        continue;
      }

      // CONTINUACIÓN DE LISTA
      if (bufferListaItems.length > 0 && ultimoTipo === 'lista' && esContinuacionLista(linea, siguiente, fontSizeBase)) {
        const ultimoIndice = bufferListaItems.length - 1;
        bufferListaItems[ultimoIndice] = normalizarEspacios(bufferListaItems[ultimoIndice] + ' ' + texto);
        if (DEBUG) console.debug('CONTINUACION LISTA', { texto });
        continue;
      }

      // CERRAR LISTA SI EMPIEZA PÁRRAFO
      if (bufferListaItems.length > 0) {
        flushLista();
      }

      // PÁRRAFO (regla simple: añadimos al buffer; cerramos solo con punto y aparte)
      bufferParrafo.push(texto);
      ultimoTipo = 'parrafo';

      // Cierre de párrafo: solo punto y aparte (regla estricta).
      const termina = /\.\s*$/.test(texto);
      if (termina) {
        flushParrafo();
      }
    } // fin for lineas

    // No cerramos párrafo al final de página para permitir continuidad entre páginas
  } // fin for paginas

  // FLUSH FINAL
  flushParrafo();
  flushLista();
  cerrarDestacado();

  if (DEBUG) {
    console.debug('STATS', { contadorLineasEntrantes, contadorSaltadas, motivosSaltado, bloques: bloques.length });
  }

  // =================================================
  // ESTADÍSTICAS
  // =================================================

  function extraerTextoBloques(bloques: Bloque[]): string {
    return bloques
      .map((bloque) => {
        switch (bloque.tipo) {
          case 'titulo': return bloque.texto;
          case 'parrafo': return bloque.texto;
          case 'lista': return bloque.items.join(' ');
          case 'articulo_legal': return bloque.texto;
          case 'destacado': return bloque.titulo + ' ' + extraerTextoBloques(bloque.contenido);
          default: return '';
        }
      })
      .join(' ');
  }

  const textoTotal = extraerTextoBloques(bloques);
  const numPalabras = textoTotal.split(/\s+/).filter(Boolean).length;
  const tiempoLecturaMin = Math.max(1, Math.ceil(numPalabras / 200));

  function obtenerParrafos(bloques: Bloque[]): BloqueParrafo[] {
    const resultado: BloqueParrafo[] = [];
    for (const bloque of bloques) {
      if (bloque.tipo === 'parrafo') resultado.push(bloque);
      if (bloque.tipo === 'destacado') resultado.push(...obtenerParrafos(bloque.contenido));
    }
    return resultado;
  }

  function contarBloques(bloques: Bloque[], tipo: Bloque['tipo']): number {
    let contador = 0;
    for (const bloque of bloques) {
      if (bloque.tipo === tipo) contador++;
      if (bloque.tipo === 'destacado') contador += contarBloques(bloque.contenido, tipo);
    }
    return contador;
  }

  const parrafos = obtenerParrafos(bloques);
  const longitudMediaParrafo = parrafos.length > 0 ? Math.round(parrafos.reduce((acc, p) => acc + p.texto.length, 0) / parrafos.length) : 0;

  return {
    titulo: tituloDocumento,
    indice,
    bloques,
    estadisticas: {
      numPalabras,
      tiempoLecturaMin,
      numTitulos: contarBloques(bloques, 'titulo'),
      numParrafos: parrafos.length,
      numListas: contarBloques(bloques, 'lista'),
      longitudMediaParrafo
    }
  };
}