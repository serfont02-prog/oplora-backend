import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

export interface LineaExtraida {
  texto: string;
  x: number;
  y: number;
  fontSize: number;
  fontName: string;
  bold: boolean;
  pagina: number;
}

export interface PaginaExtraida {
  pagina: number;
  lineas: LineaExtraida[];
  ancho: number;
  alto: number;
}

export async function extraerLineasPDF(buffer: Buffer): Promise<PaginaExtraida[]> {
  const uint8Array = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
  const pdf = await loadingTask.promise;

  const paginas: PaginaExtraida[] = [];

  for (let numPagina = 1; numPagina <= pdf.numPages; numPagina++) {
    const page = await pdf.getPage(numPagina);
    const viewport = page.getViewport({ scale: 1 });
    const textContent = await page.getTextContent();

const itemsPorY: Map<number, any[]> = new Map();

for (const item of textContent.items as any[]) {
  if (!item.str || item.str.trim() === '') continue;

  const yReal = item.transform[5];
  const fontSize = Math.abs(item.transform[3]);
  const tolerancia = Math.max(1.5, fontSize * 0.25);

  let yAgrupado: number | undefined;

  for (const yExistente of itemsPorY.keys()) {
    if (Math.abs(yExistente - yReal) <= tolerancia) {
      yAgrupado = yExistente;
      break;
    }
  }
if (yAgrupado === undefined) {
  yAgrupado = yReal;
  itemsPorY.set(yAgrupado as number, []);
}


// ⭐ Aquí TypeScript ya sabe que yAgrupado es number
const yKey = yAgrupado as number;

itemsPorY.get(yKey)!.push(item);
}


    // Ordenar líneas de arriba a abajo
    const yOrdenados = Array.from(itemsPorY.keys()).sort((a, b) => b - a);

    const lineas: LineaExtraida[] = [];

    for (const y of yOrdenados) {
      const items = itemsPorY.get(y)!.sort((a, b) => a.transform[4] - b.transform[4]);

      let texto = '';
      let lastX = null;

      for (const it of items) {
        const x = it.transform[4];

        // Añadir espacio si hay separación visual entre items
        if (lastX !== null && x - lastX > it.width * 0.6) {
          texto += ' ';
        }

        texto += it.str;
        lastX = x + it.width;
      }

      texto = texto.trim();
      if (!texto) continue;

      const primerItem = items[0];
      const fontSize = Math.round(Math.abs(primerItem.transform[3]) * 10) / 10;
      const fontName = primerItem.fontName ?? '';

      // Detección de negrita mejorada
      const bold =
        /bold|black|heavy|medium/i.test(fontName) ||
        (primerItem.font && primerItem.font.bold) ||
        fontName.includes('Bold') ||
        fontSize > calcularFontSizeBase([ { pagina: numPagina, lineas: [], ancho: viewport.width, alto: viewport.height } ]) * 1.15;

      lineas.push({
        texto,
        x: primerItem.transform[4],
        y,
        fontSize,
        fontName,
        bold,
        pagina: numPagina,
      });
    }

    paginas.push({
      pagina: numPagina,
      lineas,
      ancho: viewport.width,
      alto: viewport.height,
    });
  }

  return paginas;
}

// FontSize base = moda ponderada por longitud del texto
export function calcularFontSizeBase(paginas: PaginaExtraida[]): number {
  const conteo = new Map<number, number>();

  for (const pagina of paginas) {
    for (const linea of pagina.lineas) {
      const fs = Math.round(linea.fontSize);
      conteo.set(fs, (conteo.get(fs) ?? 0) + linea.texto.length);
    }
  }

  let maxFs = 12;
  let maxCount = 0;

  for (const [fs, count] of conteo.entries()) {
    if (count > maxCount) {
      maxCount = count;
      maxFs = fs;
    }
  }

  return maxFs;
}
