import {
  LineaExtraida,
  PaginaExtraida,
  calcularFontSizeBase
} from './pdf-extractor';

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
// PATRONES
// =====================================================

/**
 * 1. TITULO PRINCIPAL
 *
 * Ejemplo:
 * 1. EL DERECHO: CONCEPTO Y ACEPCIONES
 */
const REGEX_TITULO_NIVEL_1 =
  /^(\d+)\.\s+(.+)$/;

/**
 * 1.1. Subtítulo
 *
 * Ejemplo:
 * 1.1. Concepto de Derecho
 */
const REGEX_TITULO_NIVEL_2 =
  /^(\d+\.\d+)\.?\s+(.+)$/;

/**
 * A) Subapartado
 *
 * Ejemplo:
 * A) Derecho objetivo
 */
const REGEX_SUBAPARTADO_LETRA =
  /^[A-ZÁÉÍÓÚÑ]\)\s+(.+)$/;

/**
 * • Bullet
 */
const REGEX_BULLET =
  /^[•▪◦·\-–—]\s*/;

/**
 * Lista:
 *
 * 1. Texto
 * 2. Texto
 */
const REGEX_LISTA_NUMERADA =
  /^(\d+)\.\s+(.+)$/;

/**
 * Lista ordinal:
 *
 * 1.º Constitución
 * 2.º Derecho UE
 */
const REGEX_LISTA_ORDINAL =
  /^(\d+)[.ºªº]\s+(.+)$/;

/**
 * Artículo legal real.
 *
 * Solo cuando empieza directamente por:
 *
 * Artículo 30
 * Artículo 30.
 */
const REGEX_ARTICULO_LEGAL =
  /^art[íi]culo\s+(\d+(?:\.\d+)?)/i;

// =====================================================
// DESTACADOS
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

function normalizarEspacios(texto: string): string {
  return texto
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normaliza para comparar títulos destacados.
 */
function normalizarComparacion(texto: string): string {
  return normalizarEspacios(texto)
    .toUpperCase()
    .replace(/:$/, '')
    .trim();
}

function esTituloDestacado(
  texto: string,
  linea: LineaExtraida,
  fontSizeBase: number
): boolean {

  const normalizado =
    normalizarComparacion(texto);

  const coincideExactamente =
    TITULOS_DESTACADOS.includes(normalizado);

  if (coincideExactamente) {
    return true;
  }

  /**
   * Detectamos algunos patrones,
   * pero solo si son líneas cortas.
   */
  const esCorto = texto.length <= 60;

  const pareceEncabezado =
    linea.bold ||
    linea.fontSize >= fontSizeBase * 1.1;

  const contienePatron =
    /^(IDEA CLAVE|REGLA|TRAMPA|MNEMOTECNIA|ESQUEMA|IMPORTANTE|ATENCIÓN|RECUERDA)/i
      .test(texto);

  return (
    esCorto &&
    pareceEncabezado &&
    contienePatron
  );
}

// =====================================================
// DETECCIÓN DE TÍTULOS
// =====================================================

function esTodoMayusculas(texto: string): boolean {

  const soloLetras =
    texto.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '');

  if (soloLetras.length < 4) {
    return false;
  }

  return (
    soloLetras === soloLetras.toUpperCase()
  );
}

/**
 * Determina si:
 *
 * 1. TEXTO
 *
 * es realmente un título principal y no
 * una lista numerada.
 */
function esTituloNivel1(
  linea: LineaExtraida,
  fontSizeBase: number
): boolean {

  const texto =
    linea.texto.trim();

  if (!REGEX_TITULO_NIVEL_1.test(texto)) {
    return false;
  }

  const contenido =
    texto.replace(/^\d+\.\s+/, '');

  const esGrande =
    linea.fontSize >= fontSizeBase * 1.2;

  const esMayusculas =
    esTodoMayusculas(contenido);

  /**
   * En este tipo de temario,
   * los títulos principales suelen ser:
   *
   * - más grandes
   * - en negrita
   * - o en mayúsculas
   */
  return (
    esGrande ||
    (linea.bold && esMayusculas) ||
    esMayusculas
  );
}

/**
 * 1.1. Concepto de Derecho
 */
function esTituloNivel2(
  linea: LineaExtraida,
  fontSizeBase: number
): boolean {

  const texto =
    linea.texto.trim();

  if (!REGEX_TITULO_NIVEL_2.test(texto)) {
    return false;
  }

  return (
    linea.fontSize >= fontSizeBase * 1.05 ||
    linea.bold ||
    true
  );
}

/**
 * A) Derecho objetivo
 */
function esTituloNivel3(
  linea: LineaExtraida,
  fontSizeBase: number
): boolean {

  const texto =
    linea.texto.trim();

  if (!REGEX_SUBAPARTADO_LETRA.test(texto)) {
    return false;
  }

  /**
   * Los A), B), C)... del Tema 1
   * son estructurales.
   */
  return true;
}

// =====================================================
// DETECCIÓN DE LISTAS
// =====================================================

function esBullet(texto: string): boolean {
  return REGEX_BULLET.test(texto);
}

function esListaNumerada(texto: string): boolean {

  /**
   * Evitamos confundir:
   *
   * 1. EL DERECHO...
   *
   * con una lista.
   */
  return (
    REGEX_LISTA_NUMERADA.test(texto) ||
    REGEX_LISTA_ORDINAL.test(texto)
  );
}

function limpiarBullet(texto: string): string {
  return texto
    .replace(REGEX_BULLET, '')
    .trim();
}

function limpiarNumeroLista(texto: string): string {

  return texto
    .replace(REGEX_LISTA_NUMERADA, '$2')
    .replace(REGEX_LISTA_ORDINAL, '$2')
    .trim();
}

// =====================================================
// HEURÍSTICAS DE CONTINUACIÓN
// =====================================================

function esContinuacionLista(
  linea: LineaExtraida,
  siguiente: LineaExtraida | undefined,
  fontSizeBase: number
): boolean {

  const texto =
    linea.texto.trim();

  if (!texto) return false;

  /**
   * Si empieza otro bloque estructural,
   * no es continuación.
   */
  if (
    esTituloNivel1(linea, fontSizeBase) ||
    esTituloNivel2(linea, fontSizeBase) ||
    esTituloNivel3(linea, fontSizeBase) ||
    esBullet(texto) ||
    esListaNumerada(texto) ||
    esTituloDestacado(
      texto,
      linea,
      fontSizeBase
    )
  ) {
    return false;
  }

  /**
   * Si la línea anterior estaba en una lista,
   * el clasificador decidirá si añadirla
   * al último item.
   */
  return true;
}

// =====================================================
// CLASIFICADOR PRINCIPAL
// =====================================================

export function clasificarDocumento(
  paginas: PaginaExtraida[],
  tituloDocumento: string
): DocumentoLectura {

  const fontSizeBase =
    calcularFontSizeBase(paginas);

  const bloques: Bloque[] = [];

  const indice: ItemIndice[] = [];

  let idCounter = 1;

  // -----------------------------------------------
  // BUFFERS
  // -----------------------------------------------

  let bufferParrafo: string[] = [];

  let bufferListaItems: string[] = [];

  let bufferListaOrdenada = false;

  let ultimoTipo:
    | 'parrafo'
    | 'lista'
    | 'titulo'
    | null = null;

  let destacadoAbierto: {
    titulo: string;
    contenido: Bloque[];
    idInterno: number;
  } | null = null;

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

    if (bufferParrafo.length === 0) {
      return;
    }

    const texto =
      normalizarEspacios(
        bufferParrafo.join(' ')
      );

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

    if (bufferListaItems.length === 0) {
      return;
    }

    añadirBloque({
      id: idCounter++,
      tipo: 'lista',
      ordenada: bufferListaOrdenada,
      items: bufferListaItems.map(
        normalizarEspacios
      )
    });

    bufferListaItems = [];
    ultimoTipo = 'lista';
  };

  // -----------------------------------------------
  // CERRAR DESTACADO
  // -----------------------------------------------

  const cerrarDestacado = () => {

    if (!destacadoAbierto) {
      return;
    }

    /**
     * Cerramos buffers antes
     * de cerrar la caja.
     */
    flushParrafo();
    flushLista();

    bloques.push({
      id: destacadoAbierto.idInterno,
      tipo: 'destacado',
      titulo: destacadoAbierto.titulo,
      contenido:
        destacadoAbierto.contenido
    });

    destacadoAbierto = null;
  };

  // -----------------------------------------------
  // AÑADIR TÍTULO
  // -----------------------------------------------

  const añadirTitulo = (
    texto: string,
    nivel: number
  ) => {

    const bloque: BloqueTitulo = {
      id: idCounter++,
      tipo: 'titulo',
      nivel,
      texto:
        normalizarEspacios(texto)
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
  // RECORRIDO
  // =================================================

  for (const pagina of paginas) {

    const lineas =
      pagina.lineas;

    for (
      let i = 0;
      i < lineas.length;
      i++
    ) {

      const linea =
        lineas[i];

      const siguiente =
        lineas[i + 1];

      const texto =
        normalizarEspacios(
          linea.texto
        );

      if (!texto) {
        continue;
      }

      // ---------------------------------------------
      // IGNORAR PORTADA
      // ---------------------------------------------

      const esPrimeraPagina =
        pagina.pagina === 1;

      const esTextoMuyGrande =
        linea.fontSize >=
        fontSizeBase * 1.8;

      /**
       * Esto evita meter como contenido
       * el título gigante de portada.
       */
      if (
        esPrimeraPagina &&
        esTextoMuyGrande
      ) {
        continue;
      }

      // ---------------------------------------------
      // 1. DESTACADOS
      // ---------------------------------------------

      if (
        esTituloDestacado(
          texto,
          linea,
          fontSizeBase
        )
      ) {

        flushParrafo();
        flushLista();

        /**
         * Cerramos el anterior.
         */
        if (destacadoAbierto) {
          cerrarDestacado();
        }

        destacadoAbierto = {
          titulo: texto,
          contenido: [],
          idInterno: idCounter++
        };

        continue;
      }

      // ---------------------------------------------
      // 2. TÍTULO NIVEL 1
      // ---------------------------------------------

      if (
        esTituloNivel1(
          linea,
          fontSizeBase
        )
      ) {

        flushParrafo();
        flushLista();
        cerrarDestacado();

        añadirTitulo(
          texto,
          1
        );

        continue;
      }

      // ---------------------------------------------
      // 3. TÍTULO NIVEL 2
      // ---------------------------------------------

      if (
        esTituloNivel2(
          linea,
          fontSizeBase
        )
      ) {

        flushParrafo();
        flushLista();
        cerrarDestacado();

        añadirTitulo(
          texto,
          2
        );

        continue;
      }

      // ---------------------------------------------
      // 4. TÍTULO NIVEL 3
      // ---------------------------------------------

      if (
        esTituloNivel3(
          linea,
          fontSizeBase
        )
      ) {

        flushParrafo();
        flushLista();

        añadirTitulo(
          texto,
          3
        );

        continue;
      }

      // ---------------------------------------------
      // 5. ARTÍCULO LEGAL
      // ---------------------------------------------

      const matchArticulo =
        texto.match(
          REGEX_ARTICULO_LEGAL
        );

      if (matchArticulo) {

        /**
         * IMPORTANTE:
         *
         * Solo entra aquí si la línea empieza
         * directamente por "Artículo".
         *
         * "El artículo 30..." seguirá siendo
         * un párrafo normal.
         */
        flushParrafo();
        flushLista();

        añadirBloque({
          id: idCounter++,
          tipo: 'articulo_legal',
          numero: matchArticulo[1],
          texto
        });

        ultimoTipo = 'titulo';

        continue;
      }

      // ---------------------------------------------
      // 6. BULLETS
      // ---------------------------------------------

      if (esBullet(texto)) {

        flushParrafo();

        /**
         * Si veníamos de una lista numerada,
         * cerramos esa lista.
         */
        if (
          bufferListaItems.length > 0 &&
          bufferListaOrdenada
        ) {
          flushLista();
        }

        bufferListaOrdenada = false;

        bufferListaItems.push(
          limpiarBullet(texto)
        );

        ultimoTipo = 'lista';

        continue;
      }

      // ---------------------------------------------
      // 7. LISTAS NUMERADAS
      // ---------------------------------------------

      if (
        esListaNumerada(texto)
      ) {

        /**
         * Cerramos una lista bullet anterior.
         */
        if (
          bufferListaItems.length > 0 &&
          !bufferListaOrdenada
        ) {
          flushLista();
        }

        flushParrafo();

        bufferListaOrdenada = true;

        bufferListaItems.push(
          limpiarNumeroLista(texto)
        );

        ultimoTipo = 'lista';

        continue;
      }

      // ---------------------------------------------
      // 8. CONTINUACIÓN DE LISTA
      // ---------------------------------------------

      if (
        bufferListaItems.length > 0 &&
        ultimoTipo === 'lista' &&
        esContinuacionLista(
          linea,
          siguiente,
          fontSizeBase
        )
      ) {

        /**
         * Añadimos la línea al último item.
         *
         * Esto permite:
         *
         * • La Administración y los ciudadanos
         *   cuando aquella actúa...
         */
        const ultimoIndice =
          bufferListaItems.length - 1;

        bufferListaItems[
          ultimoIndice
        ] =
          normalizarEspacios(
            bufferListaItems[
              ultimoIndice
            ] +
            ' ' +
            texto
          );

        continue;
      }

      // ---------------------------------------------
      // 9. CERRAR LISTA SI EMPIEZA PÁRRAFO
      // ---------------------------------------------

      if (
        bufferListaItems.length > 0
      ) {
        flushLista();
      }

      // ---------------------------------------------
      // 10. PÁRRAFO
      // ---------------------------------------------

      bufferParrafo.push(texto);

      ultimoTipo = 'parrafo';

      /**
       * He mantenido el punto como señal
       * para cerrar el párrafo, pero NO es
       * el único mecanismo.
       *
       * Los cambios estructurales anteriores
       * también hacen flush.
       */
      const termina =
        /[.!?…]["»”']?$/.test(texto);

      if (termina) {
        flushParrafo();
      }
    }

    /**
     * Al terminar la página no cerramos
     * automáticamente un párrafo.
     *
     * Así un párrafo partido entre páginas
     * puede continuar.
     */
  }

  // =================================================
  // FLUSH FINAL
  // =================================================

  flushParrafo();
  flushLista();
  cerrarDestacado();

  // =================================================
  // ESTADÍSTICAS
  // =================================================

  function extraerTextoBloques(
    bloques: Bloque[]
  ): string {

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
            return (
              bloque.titulo +
              ' ' +
              extraerTextoBloques(
                bloque.contenido
              )
            );

          default:
            return '';
        }
      })
      .join(' ');
  }

  const textoTotal =
    extraerTextoBloques(bloques);

  const numPalabras =
    textoTotal
      .split(/\s+/)
      .filter(Boolean)
      .length;

  const tiempoLecturaMin =
    Math.max(
      1,
      Math.ceil(numPalabras / 200)
    );

  /**
   * Buscamos párrafos también dentro
   * de los destacados.
   */
  function obtenerParrafos(
    bloques: Bloque[]
  ): BloqueParrafo[] {

    const resultado:
      BloqueParrafo[] = [];

    for (const bloque of bloques) {

      if (
        bloque.tipo === 'parrafo'
      ) {
        resultado.push(bloque);
      }

      if (
        bloque.tipo === 'destacado'
      ) {
        resultado.push(
          ...obtenerParrafos(
            bloque.contenido
          )
        );
      }
    }

    return resultado;
  }

  function contarBloques(
    bloques: Bloque[],
    tipo: Bloque['tipo']
  ): number {

    let contador = 0;

    for (const bloque of bloques) {

      if (bloque.tipo === tipo) {
        contador++;
      }

      if (
        bloque.tipo === 'destacado'
      ) {
        contador += contarBloques(
          bloque.contenido,
          tipo
        );
      }
    }

    return contador;
  }

  const parrafos =
    obtenerParrafos(bloques);

  const longitudMediaParrafo =
    parrafos.length > 0
      ? Math.round(
          parrafos.reduce(
            (acc, parrafo) =>
              acc +
              parrafo.texto.length,
            0
          ) / parrafos.length
        )
      : 0;

  return {
    titulo: tituloDocumento,

    indice,

    bloques,

    estadisticas: {
      numPalabras,

      tiempoLecturaMin,

      numTitulos:
        contarBloques(
          bloques,
          'titulo'
        ),

      numParrafos:
        parrafos.length,

      numListas:
        contarBloques(
          bloques,
          'lista'
        ),

      longitudMediaParrafo
    }
  };
}