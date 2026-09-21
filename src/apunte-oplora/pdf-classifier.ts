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
      const matchEtiquetaTrasDosPuntos = texto.match(/^(.+:)\s+([^\s:.,;]{2,25})$/);
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

      // MINI-SUBTÍTULO EN NEGRITA (p.ej. "Concepto", "Regula:", "Fue:")
      // ⭐ El buffer de párrafo normal solo corta con un punto y aparte, así que una línea
      // corta sin punto (un mini-encabezado como "Concepto") se quedaba pegada al párrafo
      // siguiente, perdiendo su salto de línea, y además la negrita del PDF nunca llegaba
      // al frontend (se leía pero no se usaba para nada). Si la línea viene en negrita la
      // tratamos como su propio bloque —cerrando cualquier párrafo pendiente antes y
      // empezando uno nuevo después—, y marcamos el bloque como `negrita` para que el
      // frontend la pinte en negrita.
      const esLineaCortaEnNegrita = linea.bold && texto.length <= 80;
      if (esLineaCortaEnNegrita) {
        flushParrafo();
        añadirBloque({ id: idCounter++, tipo: 'parrafo', texto, negrita: true });
        ultimoTipo = 'parrafo';
        if (DEBUG) console.debug('MINI_SUBTITULO_NEGRITA', { texto });
        continue;
      }

      // PÁRRAFO (regla simple: añadimos al buffer; cerramos con punto y aparte o con ":")
      bufferParrafo.push(texto);
      ultimoTipo = 'parrafo';

      // Cierre de párrafo: punto y aparte, o dos puntos al final de línea.
      // ⭐ Una línea como "La Constitución Española es:" iba directa al buffer (no acaba
      // en punto) y se quedaba pegada a lo que viniera después hasta el siguiente punto
      // final, perdiendo el salto de línea justo tras los ":". Los dos puntos ya anuncian
      // el fin de esa frase (lo que sigue es la lista/explicación), así que cortamos ahí
      // también.
      const termina = /[.:]\s*$/.test(texto);
      if (termina) {
        flushParrafo();
      }
    } // fin for lineas
  }

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