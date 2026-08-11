import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VersionLey } from './version-ley.entity';
import { Titulo } from '../normativa/titulo.entity';
import { Capitulo } from '../normativa/capitulo.entity';
import { Articulo } from '../normativa/articulo.entity';
import { Seccion } from '../normativa/seccion.entity';
import { Libro } from '../normativa/libro.entity';
import { IaService } from '../ia/ia.service';

interface ArticuloParseado {
  numero: string;
  titulo?: string;
  contenido: string;
}

interface SeccionParseada {
  numero?: string;
  nombre: string;
  articulos: ArticuloParseado[];
}

interface CapituloParseado {
  numero?: string;
  nombre: string;
  secciones?: SeccionParseada[];
  articulos?: ArticuloParseado[];
}

interface TituloParseado {
  numero?: string;
  nombre: string;
  capitulos?: CapituloParseado[];
  articulos?: ArticuloParseado[];
}

interface LibroParseado {
  numero?: string;
  nombre: string;
  titulos: TituloParseado[];
}

interface EstructuraParseada {
  tieneLibros: boolean;
  preambulo?: string;
  libros?: LibroParseado[];
  titulos?: TituloParseado[];
}

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
    private readonly iaService: IaService,
  ) {}

  async parsearVersion(versionId: string): Promise<{ ok: boolean; resumen: any }> {
    const version = await this.versionRepo.findOne({
      where: { id: versionId },
      relations: ['ley'],
    });
    if (!version) throw new NotFoundException(`Versión ${versionId} no encontrada`);
    if (!version.textoCompleto) throw new Error('La versión no tiene texto extraído');

    this.logger.log(`Iniciando parseo de ${version.ley.nombre} v${version.version}`);

    const chunks = this.dividirTexto(version.textoCompleto, 3000);
    this.logger.log(`Texto dividido en ${chunks.length} fragmentos`);

    const estructura = await this.detectarEstructura(chunks[0], version.ley.nombre);
    this.logger.log(`Estructura detectada: ${JSON.stringify(estructura)}`);

    const contenido = await this.parsearContenido(version.textoCompleto, estructura);

    const resumen = await this.guardarEstructura(versionId, contenido);

    this.logger.log(`Parseo completado: ${JSON.stringify(resumen)}`);
    return { ok: true, resumen };
  }

  private dividirTexto(texto: string, maxCaracteres: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < texto.length; i += maxCaracteres) {
      chunks.push(texto.slice(i, i + maxCaracteres));
    }
    return chunks;
  }

  private async detectarEstructura(muestra: string, _nombreLey: string): Promise<{ tieneLibros: boolean; tieneTitulos: boolean; tieneCapitulos: boolean; tieneSecciones: boolean }> {
    const texto = muestra.toLowerCase();
    return {
      tieneLibros: texto.includes('libro ') || texto.includes('libro i') || texto.includes('libro ii'),
      tieneTitulos: texto.includes('título ') || texto.includes('titulo ') || texto.includes('título i'),
      tieneCapitulos: texto.includes('capítulo ') || texto.includes('capitulo ') || texto.includes('capítulo i'),
      tieneSecciones: texto.includes('sección ') || texto.includes('seccion '),
    };
  }

  private async parsearContenido(texto: string, _estructura: any): Promise<EstructuraParseada> {
    const system = `Eres un parser de textos legales españoles. 
Responde ÚNICAMENTE con JSON válido. Sin texto adicional. Sin markdown. Solo JSON.`;

    const prompt = `Extrae los artículos de este texto legal español.
Devuelve SOLO este JSON, nada más:
{
  "tieneLibros": false,
  "titulos": [
    {
      "numero": "I",
      "nombre": "nombre del titulo",
      "capitulos": [
        {
          "numero": "I",
          "nombre": "nombre del capitulo",
          "articulos": [
            {
              "numero": "1",
              "titulo": "rubrica del articulo o null",
              "contenido": "texto completo del articulo"
            }
          ]
        }
      ]
    }
  ]
}

TEXTO:
${texto.slice(0, 3000)}`;

    try {
      return await this.iaService.chatJson<EstructuraParseada>(prompt, system);
    } catch (e) {
      this.logger.error(`Error parseando: ${e.message}`);
      return { tieneLibros: false, titulos: [] };
    }
  }

  private async guardarEstructura(versionId: string, estructura: EstructuraParseada): Promise<any> {
    let totalTitulos = 0;
    let totalCapitulos = 0;
    let totalArticulos = 0;

    const titulos = estructura.titulos ?? [];

    for (let ti = 0; ti < titulos.length; ti++) {
      const tData = titulos[ti];

      const titulo = this.tituloRepo.create({
        orden: ti + 1,
        numero: tData.numero,
        nombre: tData.nombre,
        versionLey: { id: versionId } as any,
      });
      const tituloGuardado = await this.tituloRepo.save(titulo);
      totalTitulos++;

      const capitulos = tData.capitulos ?? [];
      for (let ci = 0; ci < capitulos.length; ci++) {
        const cData = capitulos[ci];

        const capitulo = this.capituloRepo.create({
          orden: ci + 1,
          numero: cData.numero,
          nombre: cData.nombre,
          tituloRef: { id: tituloGuardado.id } as any,
        });
        const capituloGuardado = await this.capituloRepo.save(capitulo);
        totalCapitulos++;

        const articulos = cData.articulos ?? [];
        for (let ai = 0; ai < articulos.length; ai++) {
          const aData = articulos[ai];
          const articulo = this.articuloRepo.create({
            orden: ai + 1,
            numero: aData.numero,
            titulo: aData.titulo,
            contenido: aData.contenido,
            vigente: true,
            pesoExamen: 1,
            capitulo: { id: capituloGuardado.id } as any,
          });
          await this.articuloRepo.save(articulo);
          totalArticulos++;
        }

        const secciones = cData.secciones ?? [];
        for (let si = 0; si < secciones.length; si++) {
          const sData = secciones[si];
          const seccion = this.seccionRepo.create({
            orden: si + 1,
            numero: sData.numero,
            nombre: sData.nombre,
            capitulo: { id: capituloGuardado.id } as any,
          });
          const seccionGuardada = await this.seccionRepo.save(seccion);

          const articulosSeccion = sData.articulos ?? [];
          for (let ai = 0; ai < articulosSeccion.length; ai++) {
            const aData = articulosSeccion[ai];
            const articulo = this.articuloRepo.create({
              orden: ai + 1,
              numero: aData.numero,
              titulo: aData.titulo,
              contenido: aData.contenido,
              vigente: true,
              pesoExamen: 1,
              seccion: { id: seccionGuardada.id } as any,
            });
            await this.articuloRepo.save(articulo);
            totalArticulos++;
          }
        }
      }

      const articulosTitulo = tData.articulos ?? [];
      for (let ai = 0; ai < articulosTitulo.length; ai++) {
        const aData = articulosTitulo[ai];
        const articulo = this.articuloRepo.create({
          orden: ai + 1,
          numero: aData.numero,
          titulo: aData.titulo,
          contenido: aData.contenido,
          vigente: true,
          pesoExamen: 1,
        });
        await this.articuloRepo.save(articulo);
        totalArticulos++;
      }
    }

    return { totalTitulos, totalCapitulos, totalArticulos };
  }
}