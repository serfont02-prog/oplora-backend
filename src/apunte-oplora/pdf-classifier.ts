import { LineaExtraida, PaginaExtraida, calcularFontSizeBase } from './pdf-extractor';

export type TipoBloque = 'titulo' | 'parrafo' | 'lista' | 'nota' | 'articulo_legal';

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

export type Bloque = BloqueTitulo | BloqueParrafo | BloqueLista | BloqueArticuloLegal;

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

// Patrones de detección
const REGEX_BULLET = /^[•\-\*▪◦]\s*/;
const REGEX_NUMERADO_LISTA = /^(\d+[\.\)]|[a-z][\.\)])\s+/i;
const REGEX_ARTICULO_LEGAL = /^Art[íi]culo\s+(\d+[\.\d]*)/i;
const REGEX_TITULO_NUMERADO = /^(\d+)\.\s+[A-ZÁÉÍÓÚÑ]/; // "1. La Constitución"
const REGEX_SUBTITULO_NUMERADO = /^(\d+\.\d+)\.?\s+[A-ZÁÉÍÓÚÑ]/; // "1.1. Concepto"

function limpiarTextoBullet(texto: string): string {
  return texto.replace(REGEX_BULLET, '').replace(REGEX_NUMERADO_LISTA, '').trim();
}

function esLineaDeLista(texto: string): boolean {
  return REGEX_BULLET.test(texto) || REGEX_NUMERADO_LISTA.test(texto);
}

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
  let ultimoFueItemLista = false; // ⭐ para saber si continuar el último ítem

  const flushTitulo = () => {
  if (!bufferTitulo) return;
  const texto = normalizarEspacios(bufferTitulo.lineas.join(' ').replace(/\s+/g, ' ').trim());
  bloques.push({ id: idCounter++, tipo: 'titulo', nivel: bufferTitulo.nivel, texto });
  indice.push({ titulo: texto, nivel: bufferTitulo.nivel, bloqueId: bloques[bloques.length - 1].id });
  bufferTitulo = null;
};

  const flushParrafo = () => {
  if (bufferParrafo.length === 0) return;
  const texto = normalizarEspacios(bufferParrafo.join(' ').replace(/\s+/g, ' ').trim());
  if (texto.length > 0) {
    bloques.push({ id: idCounter++, tipo: 'parrafo', texto });
  }
  bufferParrafo = [];
};

  const flushLista = () => {
  if (bufferListaItems.length === 0) return;
  bloques.push({
    id: idCounter++,
    tipo: 'lista',
    ordenada: bufferListaOrdenada,
    items: bufferListaItems.map((item) => normalizarEspacios(item)),
  });
  bufferListaItems = [];
  ultimoFueItemLista = false;
};

  for (const pagina of paginas) {
    for (const linea of pagina.lineas) {
      const texto = linea.texto.trim();
      if (!texto) continue;

      if (pagina.pagina === 1 && linea.fontSize >= umbralPortada) {
        continue;
      }

      const matchArticulo = texto.match(REGEX_ARTICULO_LEGAL);
            if (matchArticulo) {
            flushTitulo();
            flushParrafo();
            flushLista();
            bloques.push({
                id: idCounter++,
                tipo: 'articulo_legal',
                numero: matchArticulo[1],
                texto: normalizarEspacios(texto),
            });
            continue;
            }
            
      const esTitulo1 = linea.fontSize >= umbralTitulo1;
      const esTitulo2 = !esTitulo1 && linea.fontSize >= umbralTitulo2;

      if (esTitulo1 || esTitulo2) {
        const nivelActual = esTitulo1 ? 1 : 2;
        flushParrafo();
        flushLista();

        // ⭐ Si ya había un título abierto del mismo nivel, fusionar (línea partida)
        if (bufferTitulo && bufferTitulo.nivel === nivelActual) {
          bufferTitulo.lineas.push(texto);
        } else {
          flushTitulo();
          bufferTitulo = { nivel: nivelActual, lineas: [texto] };
        }
        continue;
      }

      // No es título → si había uno abierto, cerrarlo
      flushTitulo();

      // Detectar línea de lista (nuevo bullet)
      if (esLineaDeLista(texto)) {
        flushParrafo();
        const esNumerada = REGEX_NUMERADO_LISTA.test(texto) && !REGEX_BULLET.test(texto);
        if (bufferListaItems.length === 0) {
          bufferListaOrdenada = esNumerada;
        }
        bufferListaItems.push(limpiarTextoBullet(texto));
        ultimoFueItemLista = true;
        continue;
      }

      // ⭐ Continuación de un ítem de lista (línea sin bullet, pero venimos de lista)
      if (ultimoFueItemLista && bufferListaItems.length > 0) {
        const ultimoIndex = bufferListaItems.length - 1;
        bufferListaItems[ultimoIndex] = bufferListaItems[ultimoIndex] + ' ' + texto;
        continue;
      }

      // Si no es lista y no hay lista abierta, cerrar lista pendiente
      if (bufferListaItems.length > 0) {
        flushLista();
      }

      bufferParrafo.push(texto);
    }
  }

  flushTitulo();
  flushParrafo();
  flushLista();

  // Estadísticas (igual que antes)
  const textoTotal = bloques
    .map((b) => {
      if (b.tipo === 'parrafo' || b.tipo === 'articulo_legal') return b.texto;
      if (b.tipo === 'lista') return b.items.join(' ');
      if (b.tipo === 'titulo') return b.texto;
      return '';
    })
    .join(' ');

  const numPalabras = textoTotal.split(/\s+/).filter(Boolean).length;
  const tiempoLecturaMin = Math.max(1, Math.round(numPalabras / 200));

  const parrafos = bloques.filter((b) => b.tipo === 'parrafo') as BloqueParrafo[];
  const longitudMediaParrafo = parrafos.length > 0
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
      longitudMediaParrafo,
    },
  };
}

function normalizarEspacios(texto: string): string {
  return texto
    // separar minúscula seguida de mayúscula sin espacio: "normasupremadel" no se puede arreglar así,
    // pero "supremadel" → sí detectamos patrón palabra+"del/la/el" pegado es más difícil.
    // Nos centramos en los casos más comunes y seguros:
    .replace(/([a-záéíóúñ])([A-ZÁÉÍÓÚÑ])/g, '$1 $2') // "supremadel" no aplica (ambas minúsculas), pero "TítuloPreliminar" sí
    .replace(/(\d)([a-zA-ZáéíóúÁÉÍÓÚñÑ])/g, '$1 $2')  // "169artículos" → "169 artículos"
    .replace(/([a-zA-ZáéíóúñÁÉÍÓÚÑ])(\()/g, '$1 $2')   // "Preliminar(arts" → "Preliminar (arts"
    .replace(/\s+/g, ' ')
    .trim();
}