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

    // Agrupar items por línea (misma coordenada Y aproximada)
    const itemsPorY = new Map<number, any[]>();

    for (const item of textContent.items as any[]) {
      if (!item.str || item.str.trim() === '') continue;

      // Redondear Y para agrupar items de la misma línea visual
      const yRedondeado = Math.round(item.transform[5] / 2) * 2;

      if (!itemsPorY.has(yRedondeado)) {
        itemsPorY.set(yRedondeado, []);
      }
      itemsPorY.get(yRedondeado)!.push(item);
    }

    // Ordenar por Y descendente (arriba a abajo en PDF) y dentro de cada línea por X
    const yOrdenados = Array.from(itemsPorY.keys()).sort((a, b) => b - a);

    const lineas: LineaExtraida[] = [];

    for (const y of yOrdenados) {
      const items = itemsPorY.get(y)!.sort((a, b) => a.transform[4] - b.transform[4]);

      const texto = items.map((it) => it.str).join('').trim();
      if (!texto) continue;

      const primerItem = items[0];
      const fontSize = Math.round(Math.abs(primerItem.transform[3]) * 10) / 10;
      const fontName = primerItem.fontName ?? '';
      const bold = /bold|black|heavy/i.test(fontName);

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

// Utilidad: obtener el fontSize más común (moda) del documento → texto "normal"
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