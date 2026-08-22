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

    const rawItems = textContent.items as any[];

    // Convertimos cada item en una línea base
    const rawLines = rawItems.map((item) => ({
      texto: item.str.trim(),
      x: item.transform[4],
      y: item.transform[5],
      fontSize: Math.abs(item.transform[3]),
      fontName: item.fontName ?? '',
      bold: /bold|black|heavy|medium/i.test(item.fontName ?? '')
    })).filter(l => l.texto.length > 0);

    // Ordenar por Y descendente
    rawLines.sort((a, b) => b.y - a.y);

    const lineas: LineaExtraida[] = [];
    let buffer = '';
    let lastY: number | undefined = undefined;

    for (const l of rawLines) {
      if (lastY === undefined) {
        buffer = l.texto;
        lastY = l.y;
        continue;
      }

      const saltoY = Math.abs(l.y - lastY);

      // Si el salto vertical es pequeño → misma línea/párrafo
      if (saltoY < 12) {
        buffer += ' ' + l.texto;
      } else {
        // Nueva línea real
        lineas.push({
          texto: buffer.trim(),
          x: 0,
          y: lastY,
          fontSize: l.fontSize,
          fontName: l.fontName,
          bold: l.bold,
          pagina: numPagina
        });

        buffer = l.texto;
      }

      lastY = l.y;
    }

    // Última línea
    if (buffer.trim().length > 0) {
      const last = rawLines[rawLines.length - 1];
      lineas.push({
        texto: buffer.trim(),
        x: 0,
        y: lastY!,
        fontSize: last.fontSize,
        fontName: last.fontName,
        bold: last.bold,
        pagina: numPagina
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
