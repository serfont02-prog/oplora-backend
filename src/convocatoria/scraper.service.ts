import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { ConvocatoriaService } from './convocatoria.service';
import { TipoDocumento } from './documento-convocatoria.entity';
import * as crypto from 'crypto';


@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);
  private readonly MESES: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
};

  constructor(private readonly convocatoriaService: ConvocatoriaService) {}

  @Cron('0 */4 * * *')
  async checkTodasConvocatorias() {
    this.logger.log('Iniciando check de convocatorias...');
    const convocatorias = await this.convocatoriaService.findActivasConUrl();
    for (const c of convocatorias) {
      await this.scrapeConvocatoria(c.id, c.urlInap);
    }
    this.logger.log(`Check finalizado. ${convocatorias.length} convocatorias revisadas.`);
  }

  async scrapeConvocatoria(convocatoriaId: string, url: string): Promise<void> {
  try {
    this.logger.log(`Scrapeando: ${url}`);
    const { data: html } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 20000,
    });

    const plazo = this.extraerPlazoInscripcion(html);
    if (plazo) {
      this.logger.log(`Plazo inscripción detectado: ${plazo.inicio.toLocaleDateString()} - ${plazo.fin.toLocaleDateString()}`);
      await this.convocatoriaService.actualizarPlazo(convocatoriaId, plazo.inicio, plazo.fin);
    }

    const $ = cheerio.load(html);
    const pdfsEncontrados: { texto: string; url: string; descripcion: string; fechaTexto: string | null }[] = [];

    $('a[href$=".pdf"]').each((_, el) => {
      const $link = $(el);
      const href = $link.attr('href');
      const texto = $link.text().trim();
      if (!href) return;

      const urlCompleta = href.startsWith('http') ? href : `https://sede.inap.gob.es${href}`;

      // Buscar el <li> (o párrafo) que envuelve este enlace, sin incluir sub-listas anidadas
      const $contenedor = $link.closest('li, p');
      let descripcion = '';
      let fechaTexto: string | null = null;

      if ($contenedor.length > 0) {
        const $clone = $contenedor.clone();
        $clone.find('ul, ol').remove(); // quita texto de sub-items anidados
        const textoCompleto = $clone.text().replace(/\s+/g, ' ').trim();

        // Quita el propio texto del enlace del inicio de la descripción
        descripcion = textoCompleto.startsWith(texto)
          ? textoCompleto.slice(texto.length).replace(/^[:,]\s*/, '').trim()
          : textoCompleto;

        const matchFecha = textoCompleto.match(/Fecha de publicaci[oó]n:\s*([^)]+)\)/i);
        fechaTexto = matchFecha ? matchFecha[1].trim() : null;
      }

      pdfsEncontrados.push({ texto, url: urlCompleta, descripcion, fechaTexto });
    });

    this.logger.log(`Encontrados ${pdfsEncontrados.length} PDFs en ${url}`);

    for (const pdf of pdfsEncontrados) {
      if (this.esLugarDeExamen(pdf.texto)) continue; // ⭐ salta aulas/planos de acceso
      const existente = await this.convocatoriaService.findDocumentosByUrl(pdf.url, convocatoriaId);
      if (existente.length > 0) continue;

      const tipo = this.clasificarDocumento(pdf.texto + ' ' + pdf.descripcion);
      const subtipo = this.detectarSubtipo(pdf.texto);
      const fechaPublicacion = pdf.fechaTexto ? this.parseFechaTexto(pdf.fechaTexto) : null;

      await this.convocatoriaService.saveDocumento({
        titulo: pdf.texto || 'Documento sin título',
        descripcion: pdf.descripcion || null,
        tipo,
        subtipo,
        urlPdf: pdf.url,
        fechaPublicacionTexto: pdf.fechaTexto,
        fechaPublicacion,
        procesado: false,
        convocatoria: { id: convocatoriaId } as any,
      });

      this.logger.log(`Nuevo documento: ${pdf.texto} (${tipo}) — publicado: ${pdf.fechaTexto ?? 'sin fecha'}`);
    }

        // Enlaces informativos sin PDF (ej: Inscripción)
    const enlacesInfo = this.extraerEnlacesInformativos(html);
    this.logger.log(`Encontrados ${enlacesInfo.length} enlaces informativos en ${url}`);


for (const enlace of enlacesInfo) {
  const existente = await this.convocatoriaService.findDocumentosByUrl(enlace.url, convocatoriaId);
  if (existente.length > 0) continue;

  const descripcionFinal = enlace.descripcion || enlace.rangoFechas || null;

  await this.convocatoriaService.saveDocumento({
    titulo: enlace.texto,
    descripcion: descripcionFinal,
    tipo: TipoDocumento.NOTA_INFORMATIVA,
    subtipo: 'inscripcion',
    urlPdf: enlace.url,
    procesado: false,
    convocatoria: { id: convocatoriaId } as any,
  });

  this.logger.log(`Nuevo enlace informativo: ${enlace.texto} — ${descripcionFinal}`);
}

    // Fallback: avisos de texto sin PDF (para páginas de otras oposiciones que sí los tengan)
    const avisos = this.extraerAvisosTexto(html);
    this.logger.log(`Encontrados ${avisos.length} avisos de texto sin PDF en ${url}`);

    for (const aviso of avisos) {
      const hash = this.hashTexto(aviso.contenidoTexto);
      const existente = await this.convocatoriaService.findDocumentosByHash(hash, convocatoriaId);
      if (existente.length > 0) continue;

      const tipo = this.clasificarDocumento(aviso.contenidoTexto);

      await this.convocatoriaService.saveDocumento({
        titulo: aviso.titulo,
        tipo,
        subtipo: null,
        urlPdf: null,
        contenidoTexto: aviso.contenidoTexto,
        hashContenido: hash,
        procesado: false,
        convocatoria: { id: convocatoriaId } as any,
      });

      this.logger.log(`Nuevo aviso de texto: ${aviso.titulo} (${tipo})`);
    }
  } catch (error:any) {
    this.logger.error(`Error scrapeando ${url}: ${error.message}`);
  }
}

private esLugarDeExamen(textoEnlace: string): boolean {
  const ciudadesPatron = /^(A Coruña|Álava|Araba|Alicante|Alacant|Asturias|Badajoz|Barcelona|Cádiz|Cantabria|Ceuta|Córdoba|Granada|Illes Balears|La Rioja|Las Palmas|Madrid|Málaga|Melilla|Murcia|Navarra|Pontevedra|Santa Cruz de Tenerife|Sevilla|Toledo|Valencia|València|Valladolid|Zaragoza|Plano acceso|Distribución)/i;
  return ciudadesPatron.test(textoEnlace.trim());
}

private extraerAvisosTexto(html: string): { titulo: string; contenidoTexto: string }[] {
  const $ = cheerio.load(html);
  const avisos: { titulo: string; contenidoTexto: string }[] = [];

  const palabrasClave = [
    'plazo de presentación', 'se abre el plazo', 'se comunica', 'aviso importante',
    'fecha de celebración', 'primer ejercicio', 'segundo ejercicio', 'se informa',
    'advertencia', 'atención:', 'importante:', 'se convoca', 'se pospone',
    'se aplaza', 'nueva fecha', 'fecha de publicación',
  ];

  // ⭐ Limita la búsqueda al contenido principal, evitando menú y pie de página
  const $contenido = $('main, .region-content, article, #main-content').first();
  const $ambito = $contenido.length > 0 ? $contenido : $('body');

  $ambito.find('li, p').each((_, el) => {
    const $el = $(el);
    if ($el.find('a[href$=".pdf"]').length > 0) return;

    const $clone = $el.clone();
    $clone.find('ul, ol').remove();
    const texto = $clone.text().replace(/\s+/g, ' ').trim();

    if (texto.length < 20 || texto.length > 400) return;

    // ⭐ solo si contiene alguna palabra clave real de aviso
    const textoLower = texto.toLowerCase();
    if (!palabrasClave.some((clave) => textoLower.includes(clave))) return;

    if (avisos.some((a) => a.contenidoTexto === texto)) return;

    const titulo = texto.length > 80 ? texto.slice(0, 80) + '...' : texto;
    avisos.push({ titulo, contenidoTexto: texto });
  });

  return avisos;
}

private hashTexto(texto: string): string {
  return crypto.createHash('md5').update(texto.trim().toLowerCase()).digest('hex');
}

private extraerRangoFechas(texto: string): { inicio: string; fin: string } | null {
  // Patrón: "Del 23 de diciembre de 2025 al 22 de enero de 2026"
  const match = texto.match(/Del\s+(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})\s+al\s+(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/i);
  if (!match) return null;
  return { inicio: match[1], fin: match[2] };
}

  private parseFechaTexto(str: string): Date | null {
  const m = str.toLowerCase().match(/(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/);
  if (!m) return null;
  const mes = this.MESES[m[2]];
  if (mes === undefined) return null;
  return new Date(parseInt(m[3]), mes, parseInt(m[1]));
}

private clasificarDocumento(texto: string): TipoDocumento {
  const t = texto.toLowerCase();

  if (t.includes('admitidos') && t.includes('provisional')) return TipoDocumento.LISTA_ADMITIDOS_PROVISIONAL;
  if (t.includes('admitidos') && (t.includes('definitiv'))) return TipoDocumento.LISTA_ADMITIDOS_DEFINITIVA;
  if (t.includes('exclui') && t.includes('provisional')) return TipoDocumento.LISTA_EXCLUIDOS_PROVISIONAL;
  if (t.includes('exclui') && t.includes('definitiv')) return TipoDocumento.LISTA_EXCLUIDOS_DEFINITIVA;
  if (t.includes('cronograma')) return TipoDocumento.CRONOGRAMA;
  if (t.includes('normas específicas') || t.includes('normas especificas')) return TipoDocumento.NORMAS_ESPECIFICAS;
  if (t.includes('guía para la inscripción') || t.includes('guia para la inscripcion')) return TipoDocumento.GUIA_INSCRIPCION;
  if (t.includes('resultado') && (t.includes('ejercicio') || t.includes('calificaci'))) return TipoDocumento.RESULTADO_EJERCICIO;
  if (t.includes('fecha') && t.includes('examen')) return TipoDocumento.FECHA_EXAMEN;

  // ⭐ Resolución de convocatoria: solo si explícitamente "convoca/convocan"
  if (t.includes('resoluci') && (t.includes('se convoca') || t.includes('se convocan'))) {
    return TipoDocumento.RESOLUCION_CONVOCATORIA;
  }

  if (t.includes('nota informativa')) return TipoDocumento.NOTA_INFORMATIVA;

  return TipoDocumento.OTRO;
}

  private detectarSubtipo(texto: string): string | null {
    const t = texto.toLowerCase();
    if (t.includes('acceso general')) return 'acceso_general';
    if (t.includes('cupo norma') || t.includes('discapacidad')) return 'cupo_discapacidad';
    return null;
  }

  private extraerPlazoInscripcion(html: string): { inicio: Date; fin: Date } | null {
    const $ = cheerio.load(html);
    const texto = $('body').text();

    const patron = /Del\s+(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})\s+al\s+(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/i;
    const match = texto.match(patron);
    if (!match) return null;

    const meses: Record<string, number> = {
      enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
      julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
    };

    const parseFecha = (str: string): Date | null => {
      const partes = str.toLowerCase().match(/(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/);
      if (!partes) return null;
      return new Date(parseInt(partes[3]), meses[partes[2]], parseInt(partes[1]));
    };

    const inicio = parseFecha(match[1]);
    const fin = parseFecha(match[2]);
    if (!inicio || !fin) return null;

    return { inicio, fin };
  }

  // Nuevo método en scraper.service.ts
private extraerEnlacesInformativos(html: string): { texto: string; url: string; descripcion: string; rangoFechas: string | null }[] {
  const $ = cheerio.load(html);
  const enlaces: { texto: string; url: string; descripcion: string; rangoFechas: string | null }[] = [];

  const palabrasClaveEnlace = ['inscripción', 'inscripcion', 'presentación de solicitudes', 'plazo'];

  $('a').each((_, el) => {
    const $link = $(el);
    const href = $link.attr('href');
    const texto = $link.text().trim().toLowerCase();

    if (!href || href.endsWith('.pdf')) return;
    if (!palabrasClaveEnlace.some((clave) => texto.includes(clave))) return;

    const $contenedor = $link.closest('li, p');
    let descripcion = '';
    let rangoFechas: string | null = null;

if ($contenedor.length > 0) {
  const $clone = $contenedor.clone();
  $clone.find('ul, ol').remove();
  const textoCompleto = $clone.text().replace(/\s+/g, ' ').trim();
  const textoLink = $link.text().trim();
  descripcion = textoCompleto.startsWith(textoLink)
    ? textoCompleto.slice(textoLink.length).replace(/^[:,]\s*/, '').trim()
    : textoCompleto;

  console.log('TEXTO COMPLETO para inscripción:', textoCompleto); // ⭐ añadir

  const rango = this.extraerRangoFechas(textoCompleto);
  console.log('RANGO detectado:', rango); // ⭐ añadir
  rangoFechas = rango ? `Del ${rango.inicio} al ${rango.fin}` : null;
}

    const urlCompleta = href.startsWith('http') ? href : `https://sede.inap.gob.es${href}`;
    enlaces.push({ texto: $link.text().trim(), url: urlCompleta, descripcion, rangoFechas });
  });

  return enlaces;
}
}