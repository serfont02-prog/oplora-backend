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
  negrita?: boolean; // mini-subtítulo detectado por negrita en el PDF (p.ej. "Concepto")
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

export interface BloqueReferenciaArticulo {
  id: number;
  tipo: 'referencia_articulo';
  siglas: string; // "CE", "LOFCS"...
  numeroArticulo: string; // "1.1", "5"...
}

export type Bloque =
  | BloqueTitulo
  | BloqueParrafo
  | BloqueLista
  | BloqueArticuloLegal
  | BloqueDestacado
  | BloqueReferenciaArticulo; 

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

const REGEX_TITULO_NIVEL_1 = /^(\d+)\.-\s*(.+)$/; // requiere guion: "1.- El derecho"
// Variante sin guion, tipo "1. LA CONSTITUCIÓN ESPAÑOLA DE 1978" (usada en Tema 2/3).
// Solo cuenta como título si el resto va en mayúsculas (si no, es más probable que sea
// un ítem de una lista numerada normal, tipo "1. Aprobada por las Cortes.").
const REGEX_TITULO_NIVEL_1_SIMPLE = /^(\d+)\.\s+(.+)$/;
const REGEX_TITULO_NIVEL_2 = /^(\d+\.\d+)\.?\s+(.+)$/; // sin guion, como antes: "1.1. Concepto"
const REGEX_TITULO_ORDINAL = /^(\d+)\.[oº]\s+(.+)$/i; // "1.º", "2.º" (o "1.o" si el PDF exporta la º como "o")
const REGEX_SUBAPARTADO_LETRA = /^[A-ZÁÉÍÓÚÑ]\)\s+(.+)$/;
// ⭐ Ampliado: Word puede exportar viñetas con distintos glifos según la plantilla de lista
// usada en el documento (p.ej. Tema 3 usaba "●" en vez de "•"). Si el glifo no está aquí,
// las líneas de la lista no se detectan como bullet y el párrafo/lista se rompe o se
// fusiona mal (sin saltos de línea) al renderizarse en la app.
//  y  son los códigos "crudos" de las viñetas de fuentes Symbol/Wingdings
// (así vienen en el XML de Word). Word suele reasignarlos a "•"/"▪" reales al exportar
// a PDF, pero si el PDF se genera con otra herramienta (p.ej. LibreOffice) puede quedarse
// con el código crudo — los cubrimos también para no depender de qué exportador se use.
const REGEX_BULLET = /^[•▪◦·●○■□▶►‣∙]\s*/;
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

// ⭐ El extractor (pdf-extractor.ts) parte deliberadamente una misma línea visual del PDF en
// varios objetos LineaExtraida cuando cambia la negrita a media línea (para no perder, p.ej.,
// una etiqueta corta en negrita al final de una frase corrida). Eso significa que un tramo en
// negrita puede ser: (a) una línea completa por sí misma (un mini-subtítulo real, tipo
// "Concepto"), o (b) solo un fragmento de una frase más larga que sigue en líneas hermanas NO
// en negrita a la MISMA altura (mismo "y" y misma página). El clasificador solo debe tratar el
// caso (a) como el inicio de un párrafo en negrita aparte; el caso (b) debe fusionarse sin más
// en el flujo normal del párrafo, o la frase queda partida en 2-3 bloques con puntuación suelta.
function compartenLineaFisica(a: LineaExtraida | undefined, b: LineaExtraida | undefined): boolean {
  if (!a || !b) return false;
  return a.pagina === b.pagina && Math.abs(a.y - b.y) <= 2;
}

// =====================================================
// DETECCIÓN DE TÍTULOS (niveles)
// =====================================================

function esTituloNivel1(linea: LineaExtraida, fontSizeBase: number): boolean {
  const texto = linea.texto.trim();
  if (REGEX_TITULO_NIVEL_1.test(texto)) return true; // "1.- Texto"

  // ⭐ "1. TEXTO EN MAYÚSCULAS" (sin guion): antes cualquier "N. texto" cabecera de tema
  // caía en la rama de lista numerada, así que el índice y los títulos se perdían y la
  // app volvía a numerar desde 1 en cada capítulo. Solo lo tratamos como título si el
  // resto de la línea va en mayúsculas, para no confundirlo con un ítem real de lista
  // numerada (p.ej. "1. Aprobada por las Cortes Generales.").
  const matchSimple = texto.match(REGEX_TITULO_NIVEL_1_SIMPLE);
  if (matchSimple && esTodoMayusculas(matchSimple[2])) return true;

  return false;
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
  fontSizeBase: number,
  xReferenciaBullet: number | null
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
  // ⭐ Antes exigíamos que la línea de continuación empezara casi en el margen (x <= 40),
  // asumiendo que el ajuste de línea de una viñeta vuelve al margen del cuerpo del texto.
  // Pero muchos documentos (p.ej. Tema 4) usan sangría francesa: la viñeta va en una
  // posición y el texto que la sigue —incluidas sus líneas de ajuste— va más indentado
  // todavía (p.ej. viñeta en x=90, texto envuelto en x=108). Con el umbral fijo de 40,
  // esa continuación real se descartaba y quedaba como un párrafo suelto fuera de la
  // lista. Ahora comparamos con la x real de la viñeta activa: solo tratamos la línea
  // como algo AJENO a la lista (nuevo párrafo) si vuelve a una indentación claramente
  // MENOR que la de la propia viñeta (típico de que el texto ha vuelto al margen general
  // del documento, fuera ya de la lista).
  if (
    typeof linea.x === 'number' &&
    typeof xReferenciaBullet === 'number' &&
    linea.x < xReferenciaBullet - 5
  ) {
    return false;
  }
  // ⭐ Antes también se descartaba la continuación si la línea SIGUIENTE resultaba ser un
  // título, asumiendo que eso delataba que "linea" no encajaba de verdad en la lista. Pero
  // eso rechazaba precisamente el caso normal de que el último ítem de una lista venga
  // seguido, tras su propio ajuste de línea, por el título de la siguiente sección (p.ej.
  // "...fiscaliza las cuentas y la ejecución del presupuesto" + "de la Unión." + título
  // "4. LA COOPERACIÓN..."): la línea "de la Unión." se quedaba fuera de la lista solo por
  // venir justo antes de un título, que es la situación más común de todas. Ya se comprueba
  // que "linea" en sí misma no es un título (arriba), así que no hace falta mirar la
  // siguiente, y el parámetro se conserva solo por compatibilidad de la firma.
  void siguiente;
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
  // ⭐ Acumula líneas CONSECUTIVAS en negrita como un único párrafo. Antes cada línea en
  // negrita se cerraba como su propio bloque inmediatamente, así que una frase en negrita
  // que ocupaba dos o más líneas por el ajuste de línea normal del PDF (no un párrafo
  // nuevo de verdad) salía partida en varios bloques con saltos de línea de más. Ahora se
  // van acumulando mientras la negrita continúe, y solo se cierran como un bloque cuando
  // aparece una línea que ya no es negrita (o cambia el tipo de bloque).
  let bufferParrafoNegrita: string[] = [];
  let bufferListaItems: string[] = [];
  let bufferListaOrdenada = false;
  // x de la viñeta/número del último ítem de lista añadido, usada para reconocer sus
  // líneas de ajuste (ver esContinuacionLista).
  let ultimaXBullet: number | null = null;
  let ultimoTipo: 'parrafo' | 'lista' | 'titulo' | null = null;
  // ⭐ Referencia al último bloque de tipo 'titulo' añadido, mientras no se haya añadido
  // ningún otro contenido real desde entonces. Un título largo que el PDF ajusta en dos o
  // más líneas visuales suele imprimir la continuación en negrita (mismo peso visual que
  // el título), y sin esto esa continuación se colaba en el acumulador de negrita normal
  // y salía como un párrafo en negrita aparte en vez de seguir siendo parte del título.
  const tituloState: { actual: BloqueTitulo | null } = { actual: null };
  let destacadoAbierto: { titulo: string; contenido: Bloque[]; idInterno: number } | null = null;

  // ⭐ LISTA "INVISIBLE": algunos documentos (p.ej. Tema 1) usan viñetas de fuente
  // Wingdings/Symbol que, al exportar a PDF, no dejan NINGÚN carácter en la capa de texto
  // (ni siquiera el código crudo que ya cubre REGEX_BULLET) — la línea del ítem llega sin
  // más marca que su propia indentación (x mayor que el margen del párrafo introductorio).
  // Sin esto, cada ítem se colaba como su propio párrafo suelto (o se fusionaba mal con la
  // frase introductoria), perdiendo por completo la estructura de lista.
  const UMBRAL_INDENT_LISTA_INVISIBLE = 8;
  let bufferListaInvisibleItems: string[] = [];
  // x de la línea introductoria (termina en ":") tras la que se espera una lista invisible.
  let xIntroListaInvisible: number | null = null;
  // x real de los ítems ya detectados de la lista invisible en curso.
  let xListaInvisibleActiva: number | null = null;

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
    tituloState.actual = null;
    if (destacadoAbierto) destacadoAbierto.contenido.push(bloque);
    else bloques.push(bloque);
  };

  const flushParrafoNegrita = () => {
    if (bufferParrafoNegrita.length === 0) return;
    const texto = normalizarEspacios(bufferParrafoNegrita.join(' '));
    if (texto.length > 0) {
      añadirBloque({ id: idCounter++, tipo: 'parrafo', texto, negrita: true });
    }
    bufferParrafoNegrita = [];
    ultimoTipo = 'parrafo';
  };

  const flushParrafo = () => {
    // Los dos buffers de párrafo (normal y negrita) son mutuamente excluyentes en cada
    // momento, así que cerrar uno siempre implica cerrar también el otro si estuviera
    // abierto, para no dejar párrafos de negrita a medias al cambiar de tipo de bloque.
    flushParrafoNegrita();
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
    ultimaXBullet = null;
    ultimoTipo = 'lista';
  };

  const flushListaInvisible = () => {
    if (bufferListaInvisibleItems.length === 0) return;
    añadirBloque({ id: idCounter++, tipo: 'lista', ordenada: false, items: bufferListaInvisibleItems.map(normalizarEspacios) });
    bufferListaInvisibleItems = [];
    xListaInvisibleActiva = null;
    xIntroListaInvisible = null;
    ultimoTipo = 'lista';
  };

  const cerrarDestacado = () => {
    if (!destacadoAbierto) return;
    flushParrafo();
    flushLista();
    flushListaInvisible();
    bloques.push({ id: destacadoAbierto.idInterno, tipo: 'destacado', titulo: destacadoAbierto.titulo, contenido: destacadoAbierto.contenido });
    destacadoAbierto = null;
  };

  const añadirTitulo = (texto: string, nivel: number) => {
    const bloque: BloqueTitulo = { id: idCounter++, tipo: 'titulo', nivel, texto: normalizarEspacios(texto) };
    bloques.push(bloque);
    indice.push({ titulo: bloque.texto, nivel, bloqueId: bloque.id });
    ultimoTipo = 'titulo';
    tituloState.actual = bloque;
  };

  // RECORRIDO PRINCIPAL
  // ⭐ Aplanamos las líneas de TODAS las páginas en un único array antes de recorrerlas.
  // Antes se recorría página a página (for pagina -> for lineas de esa página), y la
  // búsqueda del "]" que cierra un marcador [EJ|ID|ES|TR|RE|PR ...] solo miraba dentro
  // de las líneas de la página en la que empezaba (`j + 1 < lineas.length` usaba el
  // length de esa página). Si el marcador se abría cerca del final de una página y su
  // texto continuaba en la siguiente, la búsqueda se quedaba sin líneas que mirar, el
  // marcador se cerraba a la fuerza ahí mismo y el resto del texto (incluido el "]" real)
  // aparecía suelto como párrafo normal en la página siguiente. Con un único array que
  // cruza páginas, la búsqueda del cierre sigue funcionando aunque el salto de página
  // caiga en mitad del contenido del marcador.
  const lineas: LineaExtraida[] = paginas.flatMap((p) => p.lineas);

  // ⭐ PRE-FUSIÓN DE CORCHETES SUELTOS SIN CERRAR (referencias [SIGLAS artículo N] u otro
  // corchete cualquiera que NO sea un marcador [EJ|ID|ES|TR|RE|PR ...], que ya se gestiona
  // aparte más abajo). Si el PDF envuelve el texto de una referencia en varias líneas
  // (p.ej. "[LOTC" / "Artículo 44" / "artículo 44]."), cada línea intermedia se procesaba
  // suelta por su cuenta ANTES de este fix, y si alguna de esas líneas intermedias parecía
  // por sí sola un título, una viñeta o un "artículo X" (como aquí, "Artículo 44"), se
  // clasificaba como su propio bloque especial, partiendo la referencia en trozos: el
  // enlace [SIGLAS artículo N] resultante quedaba roto y no era clicable, con un formato
  // raro al mezclarse con un bloque de "artículo legal". Aquí fusionamos por adelantado
  // cualquier línea con un "[" sin su "]" correspondiente con las líneas siguientes hasta
  // que el corchete se cierra, así el resto del clasificador ve una única línea completa.
  for (let k = 0; k < lineas.length; k++) {
    const t = lineas[k].texto;
    if (REGEX_APERTURA_MARCADOR.test(t)) continue; // eso ya lo gestiona su propia lógica
    const abiertos = (t.match(/\[/g) || []).length;
    const cerrados = (t.match(/\]/g) || []).length;
    if (abiertos <= cerrados) continue;

    let acumulado = t;
    let consumidas = 0;
    const MAX_LINEAS_CORCHETE = 15;
    while (consumidas < MAX_LINEAS_CORCHETE && k + 1 < lineas.length) {
      const siguiente = lineas[k + 1];
      acumulado = normalizarEspacios(acumulado + ' ' + siguiente.texto);
      lineas.splice(k + 1, 1);
      consumidas++;
      const totalAbiertos = (acumulado.match(/\[/g) || []).length;
      const totalCerrados = (acumulado.match(/\]/g) || []).length;
      if (totalCerrados >= totalAbiertos) break;
    }
    lineas[k] = { ...lineas[k], texto: acumulado };
  }

  {
    for (let i = 0; i < lineas.length; i++) {
      const linea = lineas[i];
      contadorLineasEntrantes++;

      let texto = normalizarEspacios(linea.texto);

      if (DEBUG) console.debug('LINEA_IN', { i, texto: texto.slice(0, 120), x: linea.x, y: linea.y, fontSize: linea.fontSize, bold: linea.bold });

      if (!texto) {
        markSkip('vacia');
        continue;
      }

      // ⭐ A veces la etiqueta corta de un ítem tipo "definición" (p.ej. "Escrita") queda
      // pegada, en la MISMA línea física del PDF, a la frase introductoria que termina en
      // ":" ("La Constitución Española es: Escrita" — el resto, "Recogida en un único
      // texto.", ya cae en la línea siguiente como continuación de ese ítem). Al venir todo
      // en una sola línea, la proporción de negrita de esa etiqueta corta queda diluida en
      // el conjunto y no se detecta como mini-subtítulo, y el texto se queda pegado a la
      // introducción en vez de arrancar su propio ítem/línea. Si detectamos el patrón
      // "...: Palabra" al final de la línea, separamos esa palabra en su propia línea.
      // ⭐ Este split NO debe aplicarse a una línea que en realidad es un título (p.ej.
      // "2.4. LOS ELEMENTOS ORGANIZATIVOS BÁSICOS: LAS", cortada por el PDF justo después
      // de "LAS" antes de "UNIDADES ADMINISTRATIVAS" en la siguiente línea): si el título
      // termina en ":" seguido de una palabra corta, este split le arrancaba esa palabra
      // final al texto del título (que además ya no coincidía con esTituloNivel2 al
      // comprobarlo después), rompiéndolo en dos y perdiendo el enganche con la continuación
      // real de la línea siguiente.
      const esTituloEstaLinea =
        esTituloNivel1(linea, fontSizeBase) ||
        esTituloNivel2(linea, fontSizeBase) ||
        esTituloOrdinal(linea);
      const matchEtiquetaTrasDosPuntos = esTituloEstaLinea
        ? null
        : texto.match(/^(.+:)\s+([^\s:.,;]{2,25})$/);
      if (matchEtiquetaTrasDosPuntos) {
        const intro = matchEtiquetaTrasDosPuntos[1];
        const etiqueta = matchEtiquetaTrasDosPuntos[2];
        lineas.splice(i + 1, 0, { ...linea, texto: etiqueta });
        linea.texto = intro;
        texto = normalizarEspacios(intro);
      }

      const siguiente = lineas[i + 1];

      // Ignorar portada (título gigante)
      const esPrimeraPagina = linea.pagina === 1;
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
        // ⭐ Texto que pueda venir DESPUÉS del "]" en la misma línea física de cierre.
        // Antes se descartaba sin más, así que si en el PDF el cierre de la etiqueta y el
        // inicio del párrafo siguiente caían en la misma línea (el propio "]Después de la
        // etiqueta..."), ese texto desaparecía. Ahora lo guardamos y lo reinsertamos como
        // una línea nueva justo a continuación, para que se procese como su propio párrafo
        // (con su salto de línea) en vez de perderse o quedar pegado a otra cosa.
        let restanteTrasCierre: string | null = null;

        let cerrado = primerSegmento.includes(']');
        if (cerrado) {
          const idxCierre = primerSegmento.indexOf(']');
          const trozo = primerSegmento.slice(0, idxCierre).trim();
          if (trozo) lineasContenido.push(trozo);
          const restante = primerSegmento.slice(idxCierre + 1).trim();
          if (restante) restanteTrasCierre = restante;
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
              const restante = siguienteTexto.slice(idxCierre + 1).trim();
              if (restante) restanteTrasCierre = restante;
              cerrado = true;
            } else {
              lineasContenido.push(siguienteTexto);
            }
          }
          consumidas++;
        }

        // Si había texto tras el "]" en la línea de cierre, lo insertamos como una línea
        // independiente inmediatamente después, para que el recorrido principal la procese
        // como el inicio de un párrafo/bloque nuevo (respetando el salto de línea).
        if (restanteTrasCierre) {
          const lineaCierre = lineas[j];
          lineas.splice(j + 1, 0, { ...lineaCierre, texto: restanteTrasCierre });
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
        flushListaInvisible();
        cerrarDestacado();

        // ⭐ Dentro de una caja [ES ...] cada ítem suele venir en 2-3 líneas físicas propias:
        // la viñeta ("", código crudo de Wingdings que SÍ sobrevive como carácter,
        // a diferencia del caso "invisible" de la lista de fuera de estas cajas), la
        // etiqueta ("Derecho objetivo:") y su continuación ("conjunto de normas."). Antes
        // cada una de esas líneas se conservaba como su propio párrafo suelto dentro de la
        // caja, así que un ítem de "Etiqueta: definición." salía partido en 2-3 líneas
        // (incluida una con solo el carácter de la viñeta). Aquí quitamos las líneas que son
        // solo el carácter de viñeta y fusionamos una etiqueta terminada en ":" con la línea
        // que la sigue, para que cada ítem quede como un único párrafo "Etiqueta: definición.".
        const lineasSinViñetasSueltas = lineasContenido
          .map((l) => l.trim())
          .filter((l) => l.length > 0)
          .filter((l) => !/^[•▪◦·●○■□▶►‣∙]$/.test(l));
        // ⭐ Más general: un ítem puede venir partido en más de 2 líneas físicas (p.ej. una
        // frase en negrita a caballo entre líneas, "Derecho objetivo equivale a" + "norma
        // jurídica" + "."), no solo el caso "Etiqueta:" + continuación. En vez de fusionar
        // solo el caso ":", volvemos a unir TODO el contenido en un único texto y lo
        // recortamos por frase (tras cada punto, antes de la siguiente mayúscula/dígito),
        // igual que ya se hace con el texto normal fuera de estas cajas.
        //
        // ⭐ BUG: si dentro de la caja hay una lista (bullets "•" o numerada "1.", "2.")
        // el texto de cada ítem se unía con el resto SIN quitar la viñeta/número, y el
        // split por frase exige que tras el punto venga una mayúscula/dígito — pero un
        // ítem siguiente empieza por "•" o similar, así que ese carácter nunca cumplía
        // la condición y el split no partía ahí: todos los ítems de la lista quedaban
        // pegados en un único párrafo sin salto de línea. Ahora tratamos cada línea que
        // sea un ítem de lista (viñeta o numeración) como el inicio forzoso de un nuevo
        // párrafo dentro de la caja, igual que ya hacemos fuera de ellas, y solo aplicamos
        // el split por frase al texto que NO forma parte de una lista.
        const esLineaListaDentroCaja = (l: string) => REGEX_BULLET.test(l) || esListaNumerada(l);
        const limpiarMarcaListaDentroCaja = (l: string) =>
          REGEX_BULLET.test(l) ? limpiarBullet(l) : limpiarNumeroLista(l);

        const lineasFusionadas: string[] = [];
        let bufferTextoLibre: string[] = [];
        let bufferItemLista: string[] | null = null;

        const cerrarBufferTextoLibre = () => {
          if (bufferTextoLibre.length === 0) return;
          const textoUnido = normalizarEspacios(bufferTextoLibre.join(' '));
          lineasFusionadas.push(
            ...textoUnido
              .split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÜÑ0-9¿¡])/)
              .map((s) => s.trim())
              .filter(Boolean),
          );
          bufferTextoLibre = [];
        };

        const cerrarBufferItemLista = () => {
          if (!bufferItemLista) return;
          lineasFusionadas.push(normalizarEspacios(bufferItemLista.join(' ')));
          bufferItemLista = null;
        };

        for (const l of lineasSinViñetasSueltas) {
          if (esLineaListaDentroCaja(l)) {
            cerrarBufferTextoLibre();
            cerrarBufferItemLista();
            bufferItemLista = [limpiarMarcaListaDentroCaja(l)];
          } else if (bufferItemLista) {
            // continuación (ajuste de línea) del ítem de lista en curso
            bufferItemLista.push(l);
          } else {
            bufferTextoLibre.push(l);
          }
        }
        cerrarBufferTextoLibre();
        cerrarBufferItemLista();

        // cada línea (ya fusionada por ítem) se conserva como su propio párrafo dentro de la caja
        const contenidoBloques: Bloque[] = lineasFusionadas
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
        flushListaInvisible();
        cerrarDestacado();
        añadirTitulo(texto, 2); // nivel 2, mismo peso visual que "1.1."
        if (DEBUG) console.debug('TITULO_ORDINAL', { texto });
        continue;
      }

      // TITULO NIVEL 1
      if (esTituloNivel1(linea, fontSizeBase)) {
        flushParrafo();
        flushLista();
        flushListaInvisible();
        cerrarDestacado();
        añadirTitulo(texto, 1);
        if (DEBUG) console.debug('TITULO1', { texto });
        continue;
      }

      // TITULO NIVEL 2
      if (esTituloNivel2(linea, fontSizeBase)) {
        flushParrafo();
        flushLista();
        flushListaInvisible();
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
        flushListaInvisible();
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
        flushListaInvisible();
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
        flushListaInvisible();
        bufferListaOrdenada = false;
        bufferListaItems.push(limpiarBullet(texto));
        ultimaXBullet = typeof linea.x === 'number' ? linea.x : null;
        ultimoTipo = 'lista';
        if (DEBUG) console.debug('BULLET', { texto });
        continue;
      }

      // LISTAS NUMERADAS
      if (esListaNumerada(texto)) {
        if (bufferListaItems.length > 0 && !bufferListaOrdenada) flushLista();
        flushListaInvisible();
        flushParrafo();
        bufferListaOrdenada = true;
        bufferListaItems.push(limpiarNumeroLista(texto));
        ultimaXBullet = typeof linea.x === 'number' ? linea.x : null;
        ultimoTipo = 'lista';
        if (DEBUG) console.debug('LISTA NUM', { texto });
        continue;
      }

      // CONTINUACIÓN DE LISTA
      if (bufferListaItems.length > 0 && ultimoTipo === 'lista' && esContinuacionLista(linea, siguiente, fontSizeBase, ultimaXBullet)) {
        const ultimoIndice = bufferListaItems.length - 1;
        bufferListaItems[ultimoIndice] = normalizarEspacios(bufferListaItems[ultimoIndice] + ' ' + texto);
        if (DEBUG) console.debug('CONTINUACION LISTA', { texto });
        continue;
      }

      // CERRAR LISTA SI EMPIEZA PÁRRAFO
      if (bufferListaItems.length > 0) {
        flushLista();
        flushListaInvisible();
      }

      // CONTINUACIÓN (ajuste de línea) DE UN TÍTULO LARGO
      // ⭐ Nada real se ha añadido desde que se creó el título, así que esta línea PODRÍA ser
      // su segunda línea visual en vez de un mini-encabezado nuevo (p.ej. "Concepto"), que
      // también puede venir justo después de un título. Para no confundir ambos casos solo lo
      // tratamos como continuación del título cuando, además de venir justo después (nada real
      // añadido todavía), se cumple UNA de estas señales de que el PDF cortó la línea a media
      // frase en vez de empezar contenido nuevo:
      //  a) el título tiene un paréntesis sin cerrar (p.ej. "... (TÍTULO IV, ARTS. 97 A"), o
      //  b) la propia línea de continuación va casi toda en mayúsculas (p.ej. "GENERALES
      //     (TÍTULO V, ARTS. 108 A 116 CE)" o "HUMANOS Y AL TRIBUNAL..."), como el título
      //     al que continúa — un mini-encabezado real como "Concepto" no cumple esto.
      // ⭐ Esta comprobación NO puede limitarse a líneas en negrita: algunos documentos (p.ej.
      // Tema 7) dan estilo a sus títulos con el estilo "Heading" de Word (tamaño de fuente
      // mayor), no con negrita por-run, así que su línea de ajuste tampoco llega marcada como
      // negrita — pero sigue siendo, igualmente, la continuación del título.
      {
        const tituloEnCurso = tituloState.actual;
        const parensAbiertos = tituloEnCurso ? (tituloEnCurso.texto.match(/\(/g) || []).length : 0;
        const parensCerrados = tituloEnCurso ? (tituloEnCurso.texto.match(/\)/g) || []).length : 0;
        const pareceContinuacionTitulo =
          parensAbiertos > parensCerrados || esTodoMayusculas(texto);
        if (
          tituloEnCurso &&
          pareceContinuacionTitulo &&
          bufferParrafo.length === 0 &&
          bufferParrafoNegrita.length === 0
        ) {
          tituloEnCurso.texto = normalizarEspacios(tituloEnCurso.texto + ' ' + texto);
          ultimoTipo = 'titulo';
          if (DEBUG) console.debug('TITULO_CONTINUACION', { texto });
          continue;
        }
      }

      // LISTA INVISIBLE (ver declaración de bufferListaInvisibleItems / UMBRAL más arriba):
      // continuación o inicio de una lista cuyas viñetas no dejaron carácter en el PDF.
      if (
        typeof linea.x === 'number' &&
        !esTituloEstaLinea &&
        !REGEX_SUBAPARTADO_LETRA.test(texto) &&
        !matchArticulo
      ) {
        if (xListaInvisibleActiva !== null && bufferListaInvisibleItems.length > 0) {
          if (Math.abs(linea.x - xListaInvisibleActiva) <= 3) {
            bufferListaInvisibleItems.push(texto);
            ultimoTipo = 'lista';
            if (DEBUG) console.debug('LISTA_INVISIBLE_ITEM', { texto });
            continue;
          } else if (linea.x > xListaInvisibleActiva + 3) {
            const idx = bufferListaInvisibleItems.length - 1;
            bufferListaInvisibleItems[idx] = normalizarEspacios(bufferListaInvisibleItems[idx] + ' ' + texto);
            if (DEBUG) console.debug('LISTA_INVISIBLE_CONTINUACION', { texto });
            continue;
          } else {
            // vuelve a un x menor o igual al del cuerpo: la lista invisible ha terminado
            flushListaInvisible();
          }
        } else if (
          xIntroListaInvisible !== null &&
          linea.x > xIntroListaInvisible + UMBRAL_INDENT_LISTA_INVISIBLE
        ) {
          bufferListaInvisibleItems.push(texto);
          xListaInvisibleActiva = linea.x;
          xIntroListaInvisible = null;
          ultimoTipo = 'lista';
          if (DEBUG) console.debug('LISTA_INVISIBLE_INICIO', { texto });
          continue;
        } else if (xIntroListaInvisible !== null) {
          // la línea que sigue a la intro no está más indentada: no era una lista invisible
          xIntroListaInvisible = null;
        }
      }

      // TEXTO EN NEGRITA (mini-subtítulo tipo "Concepto", o una frase entera en negrita)
      // ⭐ El buffer de párrafo normal solo corta con un punto y aparte, así que una línea
      // corta sin punto (un mini-encabezado como "Concepto") se quedaba pegada al párrafo
      // siguiente, perdiendo su salto de línea, y además la negrita del PDF nunca llegaba
      // al frontend. Si la línea viene en negrita Y no hay ningún párrafo normal ya empezado
      // (ver más abajo), la acumulamos en su propio buffer; mientras las líneas siguientes
      // sigan en negrita se van sumando a ese MISMO bloque, para que una frase en negrita
      // que ocupa dos o más líneas por el ajuste de línea normal del PDF salga seguida, sin
      // saltos de línea de más. El bloque se cierra en cuanto aparece una línea que ya no
      // es negrita (ver flushParrafo, que cierra ambos buffers).
      // ⭐ PERO: si ya hay un párrafo normal EN CURSO (bufferParrafo no vacío, es decir, la
      // frase empezó en texto normal y aún no ha cerrado con un punto), un tramo en negrita
      // que llega ahora es solo ÉNFASIS dentro de esa misma frase (p.ej. "El Derecho puede
      // definirse como el **conjunto de normas...**", donde la parte en negrita puede incluso
      // ocupar varias líneas de ajuste). Antes esto abría/cerraba un bloque de párrafo en
      // negrita aparte, partiendo una única frase en 2-3 bloques (con puntuación suelta como
      // un "." solo en su propio bloque). Ahora, en ese caso, el tramo se anexa directamente
      // al párrafo normal en curso (perdiendo el marcado de negrita, pero conservando la
      // frase como un único párrafo), y dejamos que el cierre por punto de más abajo actúe
      // con normalidad sobre ese párrafo.
      if (linea.bold) {
        const yaHayParrafoNormalEnCurso = bufferParrafo.length > 0 && bufferParrafoNegrita.length === 0;
        if (!yaHayParrafoNormalEnCurso) {
          if (bufferParrafoNegrita.length === 0) flushParrafo();
          bufferParrafoNegrita.push(texto);
          ultimoTipo = 'parrafo';
          if (DEBUG) console.debug('NEGRITA_ACUMULADA', { texto });
          continue;
        }
        // yaHayParrafoNormalEnCurso: cae al bloque de PÁRRAFO normal de más abajo (énfasis
        // dentro de la misma frase), sin pasar por el buffer de negrita.
      }
      if (bufferParrafoNegrita.length > 0) flushParrafoNegrita();

      // PÁRRAFO (regla simple: añadimos al buffer; cerramos con punto y aparte o con ":")
      bufferParrafo.push(texto);
      ultimoTipo = 'parrafo';

      // Cierre de párrafo: punto y aparte, o dos puntos al final de línea cuando lo que
      // sigue es realmente una lista.
      // ⭐ Una línea como "La Constitución Española es:" iba directa al buffer (no acaba
      // en punto) y se quedaba pegada a lo que viniera después hasta el siguiente punto
      // final, perdiendo el salto de línea justo tras los ":". Los dos puntos ya anuncian
      // el fin de esa frase cuando anteceden a una lista, así que cortamos ahí también.
      // ⭐ Pero un ":" seguido de una frase corrida (sin viñetas ni numeración, solo texto
      // separado por comas o punto y coma, p.ej. "...entre ellas: nacionalidad, inmigración,
      // ...") NO es el final del párrafo — es solo puntuación dentro de la misma frase. Antes
      // se cortaba igualmente en CUALQUIER ":", partiendo esa frase en dos bloques con un
      // salto de línea artificial en medio. Ahora solo tratamos el ":" como cierre cuando la
      // línea siguiente es de verdad el inicio de una lista (viñeta o numerada); un punto
      // final "." sigue cerrando siempre, sea lo que sea lo que venga después.
      const terminaPunto = /\.\s*$/.test(texto);
      const terminaDosPuntos = /:\s*$/.test(texto);
      const siguienteEsInicioDeLista =
        !!siguiente && (esBullet(siguiente.texto.trim()) || esListaNumerada(siguiente.texto.trim()));
      // ⭐ Además de una lista con viñeta real, los ":" también pueden anunciar una lista
      // INVISIBLE (ver más arriba): la línea siguiente no lleva ningún carácter de viñeta,
      // pero está más indentada que esta línea introductoria — señal de que el PDF perdió
      // el glifo de la viñeta en la extracción de texto, no de que sea una frase corrida.
      const siguienteParaceInicioListaInvisible =
        !!siguiente &&
        !siguienteEsInicioDeLista &&
        typeof linea.x === 'number' &&
        typeof siguiente.x === 'number' &&
        siguiente.x > linea.x + UMBRAL_INDENT_LISTA_INVISIBLE;
      const termina =
        terminaPunto || (terminaDosPuntos && (siguienteEsInicioDeLista || siguienteParaceInicioListaInvisible));
      if (termina) {
        flushParrafo();
        if (terminaDosPuntos && siguienteParaceInicioListaInvisible && typeof linea.x === 'number') {
          xIntroListaInvisible = linea.x;
        }
      }
    } // fin for lineas
  }

  // FLUSH FINAL
  flushParrafo();
  flushLista();
  flushListaInvisible();
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