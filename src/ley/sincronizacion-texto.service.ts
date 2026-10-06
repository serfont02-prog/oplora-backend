import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { VersionLey } from './version-ley.entity';
import { Articulo } from '../normativa/articulo.entity';
import { SubrayadoArticulo } from '../normativa/subrayado-articulo.entity';
import {
  ArticuloBoe,
  claveArticulo,
  normalizarSaltosLocal,
  parsearXmlConsolidadoBoe,
  relocalizarFragmento,
} from './texto-legal.util';

export type ModoSincronizacion = 'boe' | 'local';

export interface ResultadoSincronizacion {
  modo: ModoSincronizacion;
  aplicado: boolean;
  referenciaBoe?: string;
  totalArticulosBd: number;
  totalArticulosBoe?: number;
  aCambiar: number;
  sinCambios: number;
  rubricasDistintas: { numero: string; bd: string | null; boe: string }[];
  noEncontradosEnBoe: string[];
  noEncontradosEnBd: string[];
  subrayados: { recolocados: number; noEncontrados: number };
  muestras: { numero: string; antes: string; despues: string }[];
}

/**
 * Corrige el texto (contenido) de los artículos de una versión de ley SIN
 * borrar ni recrear artículos: se conservan los IDs, así que siguen intactas
 * las preguntas vinculadas, flashcards, notas y subrayados (estos últimos se
 * recolocan porque guardan posiciones inicio/fin).
 *
 *  - modo 'boe'  : descarga el texto consolidado oficial del BOE y copia los
 *                  párrafos exactamente como los publica el BOE (recomendado).
 *  - modo 'local': sin red; reconstruye los párrafos uniendo líneas partidas.
 *
 * Por defecto es un SIMULACRO (aplicar=false): devuelve lo que cambiaría.
 */
@Injectable()
export class SincronizacionTextoService {
  private readonly logger = new Logger(SincronizacionTextoService.name);

  constructor(
    @InjectRepository(VersionLey)
    private readonly versionRepo: Repository<VersionLey>,
    @InjectRepository(Articulo)
    private readonly articuloRepo: Repository<Articulo>,
    @InjectRepository(SubrayadoArticulo)
    private readonly subrayadoRepo: Repository<SubrayadoArticulo>,
  ) {}

  async sincronizar(
    versionId: string,
    opciones: { modo?: ModoSincronizacion; referenciaBoe?: string; aplicar?: boolean } = {},
  ): Promise<ResultadoSincronizacion> {
    const modo: ModoSincronizacion = opciones.modo === 'local' ? 'local' : 'boe';
    const aplicar = opciones.aplicar === true;

    const version = await this.versionRepo.findOne({ where: { id: versionId }, relations: ['ley'] });
    if (!version) throw new NotFoundException(`Versión ${versionId} no encontrada`);

    const articulosBd = await this.articulosDeVersion(versionId);
    if (!articulosBd.length) throw new BadRequestException('Esta versión no tiene artículos parseados');

    // numero normalizado -> texto nuevo
    const nuevos = new Map<string, ArticuloBoe>();
    let referenciaBoe: string | undefined;
    let totalArticulosBoe: number | undefined;

    if (modo === 'boe') {
      referenciaBoe = this.extraerIdBoe(opciones.referenciaBoe || version.referenciaBoe);
      if (!referenciaBoe) {
        throw new BadRequestException(
          'Falta la referencia BOE (formato BOE-A-2015-10566). Ponla en la versión o pásala en "referenciaBoe".',
        );
      }
      const { articulos } = await this.descargarArticulosBoe(referenciaBoe);
      totalArticulosBoe = articulos.length;
      for (const a of articulos) nuevos.set(claveArticulo(a.numero), a);
    } else {
      for (const a of articulosBd) {
        nuevos.set(claveArticulo(a.numero), { numero: a.numero, contenido: normalizarSaltosLocal(a.contenido) });
      }
    }

    const resultado: ResultadoSincronizacion = {
      modo,
      aplicado: aplicar,
      referenciaBoe,
      totalArticulosBd: articulosBd.length,
      totalArticulosBoe,
      aCambiar: 0,
      sinCambios: 0,
      rubricasDistintas: [],
      noEncontradosEnBoe: [],
      noEncontradosEnBd: [],
      subrayados: { recolocados: 0, noEncontrados: 0 },
      muestras: [],
    };

    const clavesBd = new Set<string>();

    for (const art of articulosBd) {
      const clave = claveArticulo(art.numero);
      clavesBd.add(clave);
      const nuevo = nuevos.get(clave);
      if (!nuevo || !nuevo.contenido) {
        resultado.noEncontradosEnBoe.push(art.numero);
        continue;
      }

      if (nuevo.rubrica && this.sinPuntoFinal(nuevo.rubrica) !== this.sinPuntoFinal(art.titulo ?? '')) {
        resultado.rubricasDistintas.push({ numero: art.numero, bd: art.titulo ?? null, boe: nuevo.rubrica });
      }

      if (nuevo.contenido === art.contenido) {
        resultado.sinCambios++;
        continue;
      }

      resultado.aCambiar++;
      if (resultado.muestras.length < 5) {
        resultado.muestras.push({ numero: art.numero, antes: art.contenido, despues: nuevo.contenido });
      }

      if (aplicar) {
        await this.articuloRepo.update(art.id, { contenido: nuevo.contenido });
        await this.recolocarSubrayados(art.id, nuevo.contenido, resultado);
      }
    }

    if (modo === 'boe') {
      for (const [clave, a] of nuevos) if (!clavesBd.has(clave)) resultado.noEncontradosEnBd.push(a.numero);
    }

    this.logger.log(
      `Sincronización ${modo} ${version.ley?.nombre ?? ''} v${version.version}: ` +
        `${resultado.aCambiar} a cambiar, ${resultado.sinCambios} iguales, aplicado=${aplicar}`,
    );
    return resultado;
  }

  // ─── helpers ─────────────────────────────────────────────

  private async articulosDeVersion(versionId: string): Promise<Articulo[]> {
    // Mismo patrón que normativa.service (artículo bajo título, capítulo o sección)
    return this.articuloRepo
      .createQueryBuilder('a')
      .leftJoin('a.capitulo', 'c')
      .leftJoin('c.tituloRef', 't')
      .leftJoin('a.tituloRef', 'tr')
      .leftJoin('a.seccion', 's')
      .leftJoin('s.capitulo', 'sc')
      .leftJoin('sc.tituloRef', 'st')
      .where('(t.versionLey = :vId OR tr.versionLey = :vId OR st.versionLey = :vId)', { vId: versionId })
      .orderBy('a.orden', 'ASC')
      .getMany();
  }

  private extraerIdBoe(ref?: string | null): string | undefined {
    const m = (ref ?? '').toUpperCase().match(/BOE-[A-Z]-\d{4}-\d+/);
    return m ? m[0] : undefined;
  }

  private async descargarArticulosBoe(idBoe: string) {
    const url = `https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/${idBoe}/texto`;
    let xml: string;
    try {
      const res = await axios.get(url, {
        headers: { Accept: 'application/xml' },
        responseType: 'text',
        timeout: 60000,
      });
      xml = res.data;
    } catch (e: any) {
      throw new BadRequestException(`No se pudo descargar el texto del BOE (${idBoe}): ${e.message}`);
    }
    const parsed = parsearXmlConsolidadoBoe(xml);
    if (!parsed.articulos.length) {
      throw new BadRequestException(`El BOE no devolvió artículos para ${idBoe}. ¿Es la referencia correcta?`);
    }
    return parsed;
  }

  private async recolocarSubrayados(articuloId: string, contenido: string, r: ResultadoSincronizacion) {
    const subrayados = await this.subrayadoRepo.find({ where: { articulo: { id: articuloId } as any } });
    for (const s of subrayados) {
      const pos = relocalizarFragmento(contenido, s.textoSeleccionado, s.inicio);
      if (!pos) { r.subrayados.noEncontrados++; continue; }
      await this.subrayadoRepo.update(s.id, {
        inicio: pos[0],
        fin: pos[1],
        textoSeleccionado: contenido.slice(pos[0], pos[1]),
      });
      r.subrayados.recolocados++;
    }
  }

  private sinPuntoFinal(s: string): string {
    return s.trim().replace(/\.$/, '').toLowerCase();
  }
}
