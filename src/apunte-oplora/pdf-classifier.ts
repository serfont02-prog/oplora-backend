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
 * Esta versión mantiene la estructura y comentarios extensos para facilitar
 * la lectura y edición (similar al fichero original, ~900 líneas).
 *
 * Cambios principales:
 * - Corrección en esTituloNivel2 (eliminado "|| true")
 * - Detección de bullets por carácter + indentación
 * - Subapartados "A) B) ..." tratados como párrafos normales
 * - Heurísticas de continuación más conservadoras
 * - Cierre de párrafo por punto y aparte (regla estricta)
 *
 * DEBUG: activar para ver logs por línea (console.debug)
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

/**
 * 1. TITULO PRINCIPAL
 *
 * Ejemplo:
 * 1. EL DERECHO: CONCEPTO Y ACEPCIONES
 */
const REGEX_TITULO_NIVEL_1 = /^(\d+)\.\s+(.+)$/;

/**
 * 1.1. Subtítulo
 *
 * Ejemplo:
 * 1.1. Concepto de Derecho
 */
const REGEX_TITULO_NIVEL_2 = /^(\d+\.\d+)\.?\s+(.+)$/;

/**
 * A) Subapartado
 *
 * Ejemplo:
 * A) Derecho objetivo
 *
 * Nota: en esta versión NO tratamos A) como título; lo dejamos como párrafo.
 */
const REGEX_SUBAPARTADO_LETRA = /^[A-ZÁÉÍÓÚÑ]\)\s+(.+)$/;

/**
 * • Bullet (más estricta: no incluimos guiones por defecto)
 *
 * Si necesitas admitir guiones como bullets, ver la sección de indentación.
 */
const REGEX_BULLET = /^[•▪◦·]\s*/;

/**
 * Lista numerada:
 *
 * 1. Texto
 * 2. Texto
 */
const REGEX_LISTA_NUMERADA = /^(\d+)\.\s+(.+)$/;

/**
 * Lista ordinal:
 *
 * 1.º Constitución
 * 2.º Derecho UE
 */
const REGEX_LISTA_ORDINAL = /^(\d+)[.ºªº]\s+(.+)$/;

/**
 * Artículo legal real.
 *
 * Solo cuando empieza directamente por:
 *
 * Artículo 30
 * Artículo 30.
 */
const REGEX_ARTICULO_LEGAL = /^art[íi]culo\s+(\d+(?:\.\d+)?)/i;

// =====================================================
// TITULOS DESTACADOS (cajas tipo "IMPORTANTE", "ESQUEMA", etc.)
// =====================================================

const TITULOS_DESTACADOS = [
  'ESQUEMA',
  'ESQUEMA DE MEMORIZACIÓN',
  'ESQUEMA DE ESTUDIO',
  'IDEA CLAVE',
  'REGLA DE EXAMEN',
  'REGLA GENERAL',
  'TRAMPA DE EXAMEN',
  'TRAMPA FRECUENTE',
  'MNEMOTECNIA',
  'MNEMOTECNIA DE LOS PLAZOS',
  'FÓRMULA BÁSICA',
  'IMPORTANTE',
  'ATENCIÓN',
  'RECUERDA',
  'EJEMPLO',
  'EJEMPLOS',
  'REQUISITOS',
  'PLAZOS'
];

// =====================================================
// UTILIDADES
// =====================================================

function normalizarEspacios(texto: string): string {
  return texto.replace(/\s+/g, ' ').trim();
}

/**
 * Normaliza para comparar títulos destacados.
 */
function normalizarComparacion(texto: string): string {
  return normalizarEspacios(texto).toUpperCase().replace(/:$/, '').trim();
}

/**
 * Comprueba si un texto está todo en mayúsculas (ignorando caracteres no alfabéticos).
 */
function esTodoMayusculas(texto: string): boolean {
  const soloLetras = texto.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '');
  if (soloLetras.length < 4) return false;
  return soloLetras === soloLetras.toUpperCase();
}

// =====================================================
// DETECCIÓN DE DESTACADOS
// =====================================================

function esTituloDestacado(
  texto: string,
  linea: LineaExtraida,
  fontSizeBase: number
): boolean {
  const normalizado = normalizarComparacion(texto);

  // Coincidencia exacta con lista de títulos destacados
  if (TITULOS_DESTACADOS.includes(normalizado)) return true;

  // Heurística: línea corta, parece encabezado y contiene patrón
  const esCorto = texto.length <= 60;

  // Ajuste: exigir bold o tamaño mayor para evitar falsos positivos
  const pareceEncabezado = linea.bold || linea.fontSize >= fontSizeBase * 1.1;

  const contienePatron = /^(IDEA CLAVE|REGLA|TRAMPA|MNEMOTECNIA|ESQUEMA|IMPORTANTE|ATENCIÓN|RECUERDA)/i.test(texto);

  return esCorto && pareceEncabezado && contienePatron;
}

// =====================================================
// DETECCIÓN DE TÍTULOS (niveles)
// =====================================================

function esTituloNivel1(linea: LineaExtraida, fontSizeBase: number): boolean {
  const texto = linea.texto.trim();
  if (!REGEX_TITULO_NIVEL_1.test(texto)) return false;

  const contenido = texto.replace(/^\d+\.\s+/, '');
  const esGrande = linea.fontSize >= fontSizeBase * 1.2;
  const esMayusculas = esTodoMayusculas(contenido);

  // Títulos principales suelen ser más grandes o en mayúsculas/negrita
  return esGrande || (linea.bold && esMayusculas) || esMayusculas;
}

function esTituloNivel2(linea: LineaExtraida, fontSizeBase: number): boolean {
  const texto = linea.texto.trim();
  if (!REGEX_TITULO_NIVEL_2.test(texto)) return false;

  // Eliminado "|| true" que forzaba siempre true
  return linea.fontSize >= fontSizeBase * 1.05 || linea.bold;
}

// NOTA: no tratamos A), B) ... como título; se manejan en el flujo principal.

// =====================================================
// DETECCIÓN DE LISTAS
// =====================================================

function esBullet(texto: string): boolean {
  return REGEX_BULLET.test(texto);
}

/**
 * Detección por indentación: si la coordenada X es pequeña, es probable que sea bullet.
 * Ajusta margen según tus PDFs (30-50 suele funcionar).
 */
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

  // Si empieza otro bloque estructural, no es continuación
  if (
    esTituloNivel1(linea, fontSizeBase) ||
    esTituloNivel2(linea, fontSizeBase) ||
    esBullet(texto) ||
    esListaNumerada(texto) ||
    esTituloDestacado(texto, linea, fontSizeBase)
  ) {
    return false;
  }

  // Evitamos unir líneas que están claramente indentadas a la derecha
  if (typeof linea.x === 'number' && linea.x > 40) return false;

  // Si la siguiente línea es un título o destacado, no continuamos
  if (siguiente) {
    if (
      esTituloNivel1(siguiente, fontSizeBase) ||
      esTituloNivel2(siguiente, fontSizeBase) ||
      esTituloDestacado(siguiente.texto, siguiente, fontSizeBase)
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

  // -----------------------------------------------
  // BUFFERS
  // -----------------------------------------------

  let bufferParrafo: string[] = [];
  let bufferListaItems: string[] = [];
  let bufferListaOrdenada = false;
  let ultimoTipo: 'parrafo' | 'lista' | 'titulo' | null = null;

  let destacadoAbierto: { titulo: string; contenido: Bloque[]; idInterno: number } | null = null;

  // Estadísticas / debug
  let contadorLineasEntrantes = 0;
  let contadorSaltadas = 0;
  const motivosSaltado: Record<string, number> = {};

  function markSkip(motivo: string) {
    contadorSaltadas++;
    motivosSaltado[motivo] = (motivosSaltado[motivo] || 0) + 1;
  }

  // -----------------------------------------------
  // HELPERS PARA AÑADIR BLOQUES
  // -----------------------------------------------

  const añadirBloque = (bloque: Bloque) => {
    if (destacadoAbierto) {
      destacadoAbierto.contenido.push(bloque);
    } else {
      bloques.push(bloque);
    }
  };

  // -----------------------------------------------
  // FLUSH PÁRRAFO
  // -----------------------------------------------

  const flushParrafo = () => {
    if (bufferParrafo.length === 0) return;

    const texto = normalizarEspacios(bufferParrafo.join(' '));

    if (texto.length > 0) {
      añadirBloque({
        id: idCounter++,
        tipo: 'parrafo',
        texto
      });
    }

    bufferParrafo = [];
    ultimoTipo = 'parrafo';
  };

  // -----------------------------------------------
  // FLUSH LISTA
  // -----------------------------------------------

  const flushLista = () => {
    if (bufferListaItems.length === 0) return;

    añadirBloque({
      id: idCounter++,
      tipo: 'lista',
      ordenada: bufferListaOrdenada,
      items: bufferListaItems.map(normalizarEspacios)
    });

    bufferListaItems = [];
    ultimoTipo = 'lista';
  };

  // -----------------------------------------------
  // CERRAR DESTACADO
  // -----------------------------------------------

  const cerrarDestacado = () => {
    if (!destacadoAbierto) return;

    // Cerramos buffers antes de cerrar la caja
    flushParrafo();
    flushLista();

    bloques.push({
      id: destacadoAbierto.idInterno,
      tipo: 'destacado',
      titulo: destacadoAbierto.titulo,
      contenido: destacadoAbierto.contenido
    });

    destacadoAbierto = null;
  };

  // -----------------------------------------------
  // AÑADIR TÍTULO
  // -----------------------------------------------

  const añadirTitulo = (texto: string, nivel: number) => {
    const bloque: BloqueTitulo = {
      id: idCounter++,
      tipo: 'titulo',
      nivel,
      texto: normalizarEspacios(texto)
    };

    bloques.push(bloque);

    indice.push({
      titulo: bloque.texto,
      nivel,
      bloqueId: bloque.id
    });

    ultimoTipo = 'titulo';
  };

  // =================================================
  // RECORRIDO PRINCIPAL
  // =================================================

  for (const pagina of paginas) {
    const lineas = pagina.lineas;

    for (let i = 0; i < lineas.length; i++) {
      const linea = lineas[i];
      contadorLineasEntrantes++;

      const siguiente = lineas[i + 1];
      const texto = normalizarEspacios(linea.texto);

      if (DEBUG) {
        console.debug('LINEA_IN', { i, texto: texto.slice(0, 120), x: linea.x, y: linea.y, fontSize: linea.fontSize, bold: linea.bold });
      }

      if (!texto) {
        markSkip('vacia');
        if (DEBUG) console.debug('SKIP empty');
        continue;
      }

      // ---------------------------------------------
      // IGNORAR PORTADA (título gigante)
      // ---------------------------------------------

      const esPrimeraPagina = pagina.pagina === 1;
      const esTextoMuyGrande = linea.fontSize >= fontSizeBase * 1.8;

      if (esPrimeraPagina && esTextoMuyGrande) {
        markSkip('portada');
        if (DEBUG) console.debug('SKIP portada');
        continue;
      }

      // ---------------------------------------------
      // 1. DESTACADOS (cajas tipo IMPORTANTE, ESQUEMA...)
      // ---------------------------------------------

      if (esTituloDestacado(texto, linea, fontSizeBase)) {
        flushParrafo();
        flushLista();

        if (destacadoAbierto) {
          cerrarDestacado();
        }

        destacadoAbierto = {
          titulo: texto,
          contenido: [],
          idInterno: idCounter++
        };

        if (DEBUG) console.debug('DESTACADO OPEN', { texto });
        continue;
      }

      // ---------------------------------------------
      // 2. TÍTULO NIVEL 1
      // ---------------------------------------------

      if (esTituloNivel1(linea, fontSizeBase)) {
        flushParrafo();
        flushLista();
        cerrarDestacado();

        añadirTitulo(texto, 1);
        if (DEBUG) console.debug('TITULO1', { texto });
        continue;
      }

      // ---------------------------------------------
      // 3. TÍTULO NIVEL 2
      // ---------------------------------------------

      if (esTituloNivel2(linea, fontSizeBase)) {
        flushParrafo();
        flushLista();
        cerrarDestacado();

        añadirTitulo(texto, 2);
        if (DEBUG) console.debug('TITULO2', { texto });
        continue;
      }

      

            // 4 SUBAPARTADOS tipo A) B) C)
      // Nuevo enfoque:
      // - No los convertimos en título.
      // - No añadimos un bloque independiente que provoque salto visual.
      // - Añadimos el prefijo "A) ..." al bufferParrafo para que el texto siguiente
      //   (si no es estructural) quede en la misma unidad textual.
      // - No consumimos la siguiente línea (no i++), así evitamos reordenados.
      if (REGEX_SUBAPARTADO_LETRA.test(texto)) {
        // Si la línea coincide también con un título numerado (raro), respetamos el título.
        // Esto protege el orden: 1.1 / 1.2 siempre tienen prioridad.
        if (esTituloNivel2(linea, fontSizeBase) || esTituloNivel1(linea, fontSizeBase)) {
          // Dejar que la lógica de títulos la procese (no interferimos).
        } else {
          // No forzamos flushParrafo() ni flushLista() aquí.
          // Añadimos el subapartado al bufferParrafo para que se renderice como parte del párrafo.
          // Ejemplo resultante: "A) Derecho objetivo El Derecho es..." (si la siguiente línea no es estructural).
          bufferParrafo.push(texto);
          ultimoTipo = 'parrafo';

          // No consumimos la siguiente línea aquí. La siguiente iteración decidirá si unirla
          // (si no es estructural) o si provoca flush por su propia naturaleza.
          if (DEBUG) console.debug('SUBAPARTADO añadido a bufferParrafo', { texto });
          continue;
        }
      }


      // ---------------------------------------------
      // 5. ARTÍCULO LEGAL
      // ---------------------------------------------

      const matchArticulo = texto.match(REGEX_ARTICULO_LEGAL);

      if (matchArticulo) {
        // Solo entra aquí si la línea empieza por "Artículo"
        flushParrafo();
        flushLista();

        añadirBloque({
          id: idCounter++,
          tipo: 'articulo_legal',
          numero: matchArticulo[1],
          texto
        });

        ultimoTipo = 'titulo';
        if (DEBUG) console.debug('ARTICULO', { numero: matchArticulo[1], texto });
        continue;
      }

      // ---------------------------------------------
      // 6. BULLETS (carácter o indentación)
      // ---------------------------------------------

      // Detección combinada: carácter típico OR indentación a la izquierda
      const esBulletLinea = esBullet(texto) || esBulletPorIndentacion(linea, 40);

      if (esBulletLinea) {
        flushParrafo();

        // Si veníamos de una lista numerada, cerramos esa lista
        if (bufferListaItems.length > 0 && bufferListaOrdenada) {
          flushLista();
        }

        bufferListaOrdenada = false;
        bufferListaItems.push(limpiarBullet(texto));
        ultimoTipo = 'lista';
        if (DEBUG) console.debug('BULLET', { texto });
        continue;
      }

      // ---------------------------------------------
      // 7. LISTAS NUMERADAS
      // ---------------------------------------------

      if (esListaNumerada(texto)) {
        // Cerramos una lista bullet anterior
        if (bufferListaItems.length > 0 && !bufferListaOrdenada) {
          flushLista();
        }

        flushParrafo();

        bufferListaOrdenada = true;
        bufferListaItems.push(limpiarNumeroLista(texto));
        ultimoTipo = 'lista';
        if (DEBUG) console.debug('LISTA NUM', { texto });
        continue;
      }

      // ---------------------------------------------
      // 8. CONTINUACIÓN DE LISTA
      // ---------------------------------------------

      if (
        bufferListaItems.length > 0 &&
        ultimoTipo === 'lista' &&
        esContinuacionLista(linea, siguiente, fontSizeBase)
      ) {
        // Añadimos la línea al último item
        const ultimoIndice = bufferListaItems.length - 1;
        bufferListaItems[ultimoIndice] = normalizarEspacios(bufferListaItems[ultimoIndice] + ' ' + texto);
        if (DEBUG) console.debug('CONTINUACION LISTA', { texto });
        continue;
      }

      // ---------------------------------------------
      // 9. CERRAR LISTA SI EMPIEZA PÁRRAFO
      // ---------------------------------------------

      if (bufferListaItems.length > 0) {
        flushLista();
      }

      // ---------------------------------------------
      // 10. PÁRRAFO
      // ---------------------------------------------

      bufferParrafo.push(texto);
      ultimoTipo = 'parrafo';

      // Cierre de párrafo: solo punto y aparte (regla estricta).
      // Si prefieres aceptar ?, ! o puntos suspensivos, cambia la regex.
      const termina = /\.\s*$/.test(texto);

      if (termina) {
        flushParrafo();
      }
    } // fin for lineas de la página

    // No cerramos párrafo al final de página para permitir continuidad entre páginas
  } // fin for paginas

  // =================================================
  // FLUSH FINAL
  // =================================================

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
          case 'titulo':
            return bloque.texto;
          case 'parrafo':
            return bloque.texto;
          case 'lista':
            return bloque.items.join(' ');
          case 'articulo_legal':
            return bloque.texto;
          case 'destacado':
            return bloque.titulo + ' ' + extraerTextoBloques(bloque.contenido);
          default:
            return '';
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
