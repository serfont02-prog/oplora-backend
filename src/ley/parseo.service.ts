import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VersionLey } from './version-ley.entity';
import { Titulo } from '../normativa/titulo.entity';
import { Capitulo } from '../normativa/capitulo.entity';
import { Articulo } from '../normativa/articulo.entity';
import { Seccion } from '../normativa/seccion.entity';
import { Libro } from '../normativa/libro.entity';

interface NodoParseado {
  tipo: 'libro' | 'titulo' | 'capitulo' | 'seccion' | 'articulo';
  numero?: string;
  nombre?: string;
  numeroArticulo?: string;
  tituloArticulo?: string;
  contenido?: string;
}

// Patrones típicos de textos legales españoles (mayúsculas, con o sin tildes)
const REGEX_LIBRO = /^LIBRO\s+([IVXLCDM]+|PRELIMINAR|\d+)\.?\s*[-–—]?\s*(.*)$/i;
const REGEX_TITULO = /^T[ÍI]TULO\s+([IVXLCDM]+|PRELIMINAR|\d+)\.?\s*[-–—]?\s*(.*)$/i;
const REGEX_CAPITULO = /^CAP[ÍI]TULO\s+([IVXLCDM]+|\d+)\.?\s*[-–—]?\s*(.*)$/i;
const REGEX_SECCION = /^SECCI[ÓO]N\s+([IVXLCDMª\d]+)\.?\s*[-–—]?\s*(.*)$/i;
const REGEX_ARTICULO = /^Art[íi]culo\s+(\d+(?:\.\d+)?)\.?\s*[-–—]?\s*(.*)$/i;

@Injectable()
export class ParseoService {
  private readonly logger = new Logger(ParseoService.name);

  constructor(
    @InjectRepository(VersionLey)
    private readonly versionRepo: Repository<VersionLey>,
    @InjectRepository(Titulo)
    private readonly tituloRepo: Repository<Titulo>,
    @InjectRepository(Capitulo)
    private readonly capituloRepo: Repository<Capitulo>,
    @InjectRepository(Articulo)
    private readonly articuloRepo: Repository<Articulo>,
    @InjectRepository(Seccion)
    private readonly seccionRepo: Repository<Seccion>,
    @InjectRepository(Libro)
    private readonly libroRepo: Repository<Libro>,
  ) {}

  async parsearVersion(versionId: string): Promise<{ ok: boolean; resumen: any }> {
    const version = await this.versionRepo.findOne({
      where: { id: versionId },
      relations: ['ley'],
    });
    if (!version) throw new NotFoundException(`Versión ${versionId} no encontrada`);
    if (!version.textoCompleto) throw new Error('La versión no tiene texto extraído');

    this.logger.log(`Iniciando parseo (sin IA) de ${version.ley.nombre} v${version.version}`);

    // Limpiar estructura previa por si se reparsea
    await this.limpiarEstructuraAnterior(versionId);

    const nodos = this.parsearTextoARegex(version.textoCompleto);
    this.logger.log(`Detectados ${nodos.length} nodos estructurales`);

    const resumen = await this.guardarNodos(versionId, nodos);

    this.logger.log(`Parseo completado: ${JSON.stringify(resumen)}`);
    return { ok: true, resumen };
  }

  private async limpiarEstructuraAnterior(versionId: string): Promise<void> {
    const titulos = await this.tituloRepo.find({ where: { versionLey: { id: versionId } as any } });
    for (const t of titulos) {
      const capitulos = await this.capituloRepo.find({ where: { tituloRef: { id: t.id } as any } });
      for (const c of capitulos) {
        await this.articuloRepo.delete({ capitulo: { id: c.id } as any });
        await this.seccionRepo.delete({ capitulo: { id: c.id } as any });
      }
      await this.capituloRepo.delete({ tituloRef: { id: t.id } as any });
    }
    await this.tituloRepo.delete({ versionLey: { id: versionId } as any });
  }

  /**
   * Recorre el texto línea a línea detectando la jerarquía legal
   * (Libro > Título > Capítulo > Sección > Artículo) mediante patrones.
   */
  private parsearTextoARegex(texto: string): NodoParseado[] {
    const lineas = texto.split('\n').map((l) => l.trim()).filter(Boolean);
    const nodos: NodoParseado[] = [];

    let articuloActual: { numero: string; titulo?: string; lineas: string[] } | null = null;

    const flushArticulo = () => {
      if (!articuloActual) return;
      nodos.push({
        tipo: 'articulo',
        numeroArticulo: articuloActual.numero,
        tituloArticulo: articuloActual.titulo,
        contenido: articuloActual.lineas.join(' ').replace(/\s+/g, ' ').trim(),
      });
      articuloActual = null;
    };

    for (const linea of lineas) {
      const mLibro = linea.match(REGEX_LIBRO);
      if (mLibro) {
        flushArticulo();
        nodos.push({ tipo: 'libro', numero: mLibro[1], nombre: mLibro[2] || undefined });
        continue;
      }

      const mTitulo = linea.match(REGEX_TITULO);
      if (mTitulo) {
        flushArticulo();
        nodos.push({ tipo: 'titulo', numero: mTitulo[1], nombre: mTitulo[2] || undefined });
        continue;
      }

      const mCapitulo = linea.match(REGEX_CAPITULO);
      if (mCapitulo) {
        flushArticulo();
        nodos.push({ tipo: 'capitulo', numero: mCapitulo[1], nombre: mCapitulo[2] || undefined });
        continue;
      }

      const mSeccion = linea.match(REGEX_SECCION);
      if (mSeccion) {
        flushArticulo();
        nodos.push({ tipo: 'seccion', numero: mSeccion[1], nombre: mSeccion[2] || undefined });
        continue;
      }

      const mArticulo = linea.match(REGEX_ARTICULO);
      if (mArticulo) {
        flushArticulo();
        articuloActual = { numero: mArticulo[1], titulo: mArticulo[2] || undefined, lineas: [] };
        continue;
      }

      // Línea de contenido: se acumula en el artículo actual, si lo hay
      if (articuloActual) {
        articuloActual.lineas.push(linea);
      }
    }

    flushArticulo();
    return nodos;
  }

  /**
   * Recorre la lista lineal de nodos y va creando la jerarquía en BD,
   * manteniendo referencias al libro/título/capítulo/sección "actuales".
   */
  private async guardarNodos(versionId: string, nodos: NodoParseado[]): Promise<any> {
    let totalLibros = 0, totalTitulos = 0, totalCapitulos = 0, totalSecciones = 0, totalArticulos = 0;

    let libroActualId: string | null = null;
    let tituloActualId: string | null = null;
    let capituloActualId: string | null = null;
    let seccionActualId: string | null = null;

    let ordenLibro = 0, ordenTitulo = 0, ordenCapitulo = 0, ordenSeccion = 0, ordenArticulo = 0;

    for (const nodo of nodos) {
      if (nodo.tipo === 'libro') {
        const libro = this.libroRepo.create({
          orden: ++ordenLibro,
          numero: nodo.numero,
          nombre: nodo.nombre || `Libro ${nodo.numero}`,
        } as any);
        const guardado = await this.libroRepo.save(libro);
        libroActualId = (guardado as any).id;
        tituloActualId = null;
        capituloActualId = null;
        seccionActualId = null;
        totalLibros++;
        continue;
      }

      if (nodo.tipo === 'titulo') {
        const titulo = this.tituloRepo.create({
          orden: ++ordenTitulo,
          numero: nodo.numero,
          nombre: nodo.nombre || `Título ${nodo.numero}`,
          versionLey: { id: versionId } as any,
          libro: libroActualId ? ({ id: libroActualId } as any) : undefined,
        });
        const guardado = await this.tituloRepo.save(titulo);
        tituloActualId = guardado.id;
        capituloActualId = null;
        seccionActualId = null;
        totalTitulos++;
        continue;
      }

      if (nodo.tipo === 'capitulo') {
        const capitulo = this.capituloRepo.create({
          orden: ++ordenCapitulo,
          numero: nodo.numero,
          nombre: nodo.nombre || `Capítulo ${nodo.numero}`,
          tituloRef: tituloActualId ? ({ id: tituloActualId } as any) : undefined,
        });
        const guardado = await this.capituloRepo.save(capitulo);
        capituloActualId = guardado.id;
        seccionActualId = null;
        totalCapitulos++;
        continue;
      }

      if (nodo.tipo === 'seccion') {
        const seccion = this.seccionRepo.create({
          orden: ++ordenSeccion,
          numero: nodo.numero,
          nombre: nodo.nombre || `Sección ${nodo.numero}`,
          capitulo: capituloActualId ? ({ id: capituloActualId } as any) : undefined,
        });
        const guardado = await this.seccionRepo.save(seccion);
        seccionActualId = guardado.id;
        totalSecciones++;
        continue;
      }

      if (nodo.tipo === 'articulo') {
        const articulo = this.articuloRepo.create({
          orden: ++ordenArticulo,
          numero: nodo.numeroArticulo,
          titulo: nodo.tituloArticulo || undefined,
          contenido: nodo.contenido || '',
          vigente: true,
          pesoExamen: 1,
          seccion: seccionActualId ? ({ id: seccionActualId } as any) : undefined,
          capitulo: !seccionActualId && capituloActualId ? ({ id: capituloActualId } as any) : undefined,
          tituloRef: !seccionActualId && !capituloActualId && tituloActualId ? ({ id: tituloActualId } as any) : undefined,
        } as any);
        await this.articuloRepo.save(articulo);
        totalArticulos++;
        continue;
      }
    }

    return { totalLibros, totalTitulos, totalCapitulos, totalSecciones, totalArticulos };
  }
}