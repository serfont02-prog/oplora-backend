import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

export interface LineaExtraida {
  texto: string;
  x: number;
  y: number;
  fontSize: number;
  fontName: string;
  bold: boolean;
  pagina: number;

  // Información útil para el clasificador
  ancho?: number;
  altura?: number;
}

export interface PaginaExtraida {
  pagina: number;
  lineas: LineaExtraida[];
  ancho: number;
  alto: number;
}

interface FragmentoPDF {
  texto: string;
  x: number;
  y: number;
  fontSize: number;
  fontName: string;
  bold: boolean;
  width: number;
}

/**
 * Agrupa los items de PDF.js en líneas reales.
 */
export async function extraerLineasPDF(
  buffer: Buffer
): Promise<PaginaExtraida[]> {

  const uint8Array = new Uint8Array(buffer);

  const loadingTask = pdfjsLib.getDocument({
    data: uint8Array
  });

  const pdf = await loadingTask.promise;

  const paginas: PaginaExtraida[] = [];

  for (
    let numPagina = 1;
    numPagina <= pdf.numPages;
    numPagina++
  ) {
    const page = await pdf.getPage(numPagina);

    const viewport = page.getViewport({
      scale: 1
    });

    const textContent = await page.getTextContent();

    const fragmentos: FragmentoPDF[] = (
      textContent.items as any[]
    )
      .map((item) => {

        const texto = item.str?.trim();

        if (!texto) return null;

        const fontName = item.fontName ?? '';

        return {
          texto,
          x: item.transform[4],
          y: item.transform[5],

          // Mejor aproximación del tamaño
          fontSize: Math.abs(
            item.transform[3] || item.transform[0]
          ),

          fontName,

          bold: /bold|black|heavy|semibold|demi/i.test(
            fontName
          ),

          width: Math.abs(item.width ?? 0)
        };

      })
      .filter(
        (item): item is FragmentoPDF => item !== null
      );

    /**
     * Primero ordenamos verticalmente.
     */
    fragmentos.sort((a, b) => {

      const diferenciaY = b.y - a.y;

      // Si están prácticamente a la misma altura,
      // ordenamos horizontalmente.
      if (Math.abs(diferenciaY) < 3) {
        return a.x - b.x;
      }

      return diferenciaY;
    });

    /**
     * Agrupamos fragmentos que pertenecen
     * a la misma línea visual.
     */
    const grupos: FragmentoPDF[][] = [];

    const toleranciaY = 4;

    for (const fragmento of fragmentos) {

      const ultimoGrupo =
        grupos[grupos.length - 1];

      if (!ultimoGrupo) {
        grupos.push([fragmento]);
        continue;
      }

      const yReferencia = ultimoGrupo[0].y;

      const mismaLinea =
        Math.abs(fragmento.y - yReferencia)
        <= toleranciaY;

      if (mismaLinea) {
        ultimoGrupo.push(fragmento);
      } else {
        grupos.push([fragmento]);
      }
    }

    /**
     * Convertimos cada grupo en una LineaExtraida.
     */
    const lineas: LineaExtraida[] = grupos
      .map((grupo) => {

        // Orden horizontal real
        grupo.sort((a, b) => a.x - b.x);

        const texto = grupo
          .map(f => f.texto)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        const x = Math.min(
          ...grupo.map(f => f.x)
        );

        const y = grupo[0].y;

        /**
         * Elegimos como fontSize el más frecuente,
         * ponderado por cantidad de texto.
         */
        const fontStats = new Map<
          number,
          number
        >();

        for (const f of grupo) {

          const size = Math.round(
            f.fontSize * 10
          ) / 10;

          const peso = f.texto.length;

          fontStats.set(
            size,
            (fontStats.get(size) ?? 0) + peso
          );
        }

        let fontSize = 0;
        let maxPeso = 0;

        for (
          const [size, peso]
          of fontStats.entries()
        ) {
          if (peso > maxPeso) {
            fontSize = size;
            maxPeso = peso;
          }
        }

        /**
         * Consideramos bold si una parte significativa
         * del texto de la línea está en bold.
         */
        const longitudTotal = grupo.reduce(
          (acc, f) => acc + f.texto.length,
          0
        );

        const longitudBold = grupo
          .filter(f => f.bold)
          .reduce(
            (acc, f) => acc + f.texto.length,
            0
          );

        const bold =
          longitudTotal > 0 &&
          longitudBold / longitudTotal >= 0.5;

        const fragmentoPrincipal =
          grupo.reduce((a, b) =>
            b.texto.length > a.texto.length
              ? b
              : a
          );

        const ancho =
          Math.max(
            ...grupo.map(
              f => f.x + f.width
            )
          ) - x;

        return {
          texto,
          x,
          y,
          fontSize,
          fontName:
            fragmentoPrincipal.fontName,
          bold,
          pagina: numPagina,
          ancho,
          altura: fontSize
        };

      })
      .filter(linea => linea.texto.length > 0);

    paginas.push({
      pagina: numPagina,
      lineas,
      ancho: viewport.width,
      alto: viewport.height
    });
  }

  return paginas;
}

// FontSize base = moda ponderada por longitud del texto
export function calcularFontSizeBase(
  paginas: PaginaExtraida[]
): number {
  const conteo = new Map<number, number>();

  for (const pagina of paginas) {
    for (const linea of pagina.lineas) {
      const fs = Math.round(linea.fontSize);

      conteo.set(
        fs,
        (conteo.get(fs) ?? 0) + linea.texto.length
      );
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