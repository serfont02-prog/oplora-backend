import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { VersionLey } from './version-ley.entity';
import { Articulo } from '../normativa/articulo.entity';
import { Disposicion } from '../normativa/disposicion.entity';
import { SubrayadoArticulo } from '../normativa/subrayado-articulo.entity';
import { claveArticulo, normalizarContenido, relocalizarFragmento } from './texto-legal.util';

interface ArticuloJson { numero: string; titulo?: string | null; contenido: string }
interface DisposicionJson { categoria: string; etiqueta?: string | null; contenido: string }
export interface EstructuraJson { libros?: any[]; titulos?: any[]; disposiciones?: DisposicionJson[] }

export interface ResultadoActualizacion {
  aplicado: boolean;
  articulos: {
    enApp: number;
    enJson: number;
    aCambiar: number;
    sinCambios: number;
    rubricasCambiadas: number;
    soloEnApp: string[];   // no vienen en el JSON: no se tocan
    soloEnJson: string[];  // no existen en la app: no se crean (usar Importar JSON)
  };
  disposiciones: { aCambiar: number; sinCambios: number; nuevas: number; soloEnApp: string[] };
  subrayados: { recolocados: number; noEncontrados: number };
  muestras: { numero: string; antes: string; despues: string }[];
}

/**
 * "Actualizar desde JSON": aplica un JSON corregido a una versión de ley que
 * YA está subida, SIN borrar nada. Empareja los artículos por número y solo
 * cambia texto y rúbrica, así que conservan su ID y con él las preguntas de
 * test, flashcards, notas, subrayados (que se recolocan) y vínculos con temas.
 *
 * Por defecto es una simulación (aplicar=false). Con aplicar=true todo se
 * guarda en una única transacción: o se aplica entero o no se aplica nada.
 */
@Injectable()
export class SincronizacionTextoService {
  private readonly logger = new Logger(SincronizacionTextoService.name);

  constructor(
    @InjectRepository(VersionLey)
    private readonly versionRepo: Repository<VersionLey>,
    @InjectRepository(Articulo)
    private readonly articuloRepo: Repository<Articulo>,
    @InjectRepository(Disposicion)
    private readonly disposicionRepo: Repository<Disposicion>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async actualizarDesdeJson(versionId: string, estructura: EstructuraJson, aplicar = false): Promise<ResultadoActualizacion> {
    const version = await this.versionRepo.findOne({ where: { id: versionId }, relations: ['ley'] });
    if (!version) throw new NotFoundException(`Versión ${versionId} no encontrada`);
    if (!estructura || typeof estructura !== 'object') throw new BadRequestException('JSON vacío o inválido');

    const articulosJson = this.aplanarArticulos(estructura);
    if (!articulosJson.length && !(estructura.disposiciones ?? []).length) {
      throw new BadRequestException('El JSON no trae artículos ni disposiciones');
    }

    const articulosBd = await this.articulosDeVersion(versionId);
    if (!articulosBd.length) {
      throw new BadRequestException('Esta versión aún no tiene artículos: usa "Importar JSON" para la primera carga');
    }
    const disposicionesBd = await this.disposicionRepo.find({ where: { versionLey: { id: versionId } as any } });

    const r: ResultadoActualizacion = {
      aplicado: aplicar,
      articulos: { enApp: articulosBd.length, enJson: articulosJson.length, aCambiar: 0, sinCambios: 0, rubricasCambiadas: 0, soloEnApp: [], soloEnJson: [] },
      disposiciones: { aCambiar: 0, sinCambios: 0, nuevas: 0, soloEnApp: [] },
      subrayados: { recolocados: 0, noEncontrados: 0 },
      muestras: [],
    };

    // ── Plan de cambios (se calcula igual en simulación y al aplicar) ──
    const porClave = new Map<string, ArticuloJson>();
    for (const a of articulosJson) porClave.set(claveArticulo(a.numero), a);

    const cambiosArt: { id: string; contenido?: string; titulo?: string }[] = [];
    const clavesBd = new Set<string>();
    for (const art of articulosBd) {
      const clave = claveArticulo(art.numero);
      clavesBd.add(clave);
      const nuevo = porClave.get(clave);
      if (!nuevo) { r.articulos.soloEnApp.push(art.numero); continue; }

      const contenido = normalizarContenido(nuevo.contenido);
      const titulo = (nuevo.titulo ?? '').trim();
      const cambio: { id: string; contenido?: string; titulo?: string } = { id: art.id };
      if (contenido && contenido !== art.contenido) cambio.contenido = contenido;
      if (titulo && titulo !== (art.titulo ?? '')) { cambio.titulo = titulo; r.articulos.rubricasCambiadas++; }

      if (cambio.contenido === undefined && cambio.titulo === undefined) { r.articulos.sinCambios++; continue; }
      r.articulos.aCambiar++;
      cambiosArt.push(cambio);
      if (cambio.contenido !== undefined && r.muestras.length < 5) {
        r.muestras.push({ numero: art.numero, antes: art.contenido, despues: contenido });
      }
    }
    for (const a of articulosJson) if (!clavesBd.has(claveArticulo(a.numero))) r.articulos.soloEnJson.push(a.numero);

    const claveDisp = (categoria: string, etiqueta?: string | null) =>
      `${(categoria ?? '').toLowerCase().trim()}|${(etiqueta ?? '').toLowerCase().trim()}`;
    const dispBd = new Map(disposicionesBd.map((d) => [claveDisp(d.categoria, d.etiqueta), d]));
    const dispJsonClaves = new Set<string>();
    const cambiosDisp: { id: string; contenido: string }[] = [];
    const nuevasDisp: DisposicionJson[] = [];
    for (const d of estructura.disposiciones ?? []) {
      const clave = claveDisp(d.categoria, d.etiqueta);
      dispJsonClaves.add(clave);
      const existente = dispBd.get(clave);
      const contenido = normalizarContenido(d.contenido);
      if (!existente) { nuevasDisp.push({ ...d, contenido }); r.disposiciones.nuevas++; continue; }
      if (contenido === existente.contenido) { r.disposiciones.sinCambios++; continue; }
      cambiosDisp.push({ id: existente.id, contenido });
      r.disposiciones.aCambiar++;
    }
    for (const d of disposicionesBd) {
      if (!dispJsonClaves.has(claveDisp(d.categoria, d.etiqueta))) r.disposiciones.soloEnApp.push(`${d.categoria} ${d.etiqueta ?? ''}`.trim());
    }

    if (!aplicar) return r;

    // ── Aplicar en una sola transacción ──
    await this.dataSource.transaction(async (m: EntityManager) => {
      for (const c of cambiosArt) {
        const { id, ...datos } = c;
        await m.update(Articulo, id, datos);
        if (datos.contenido !== undefined) await this.recolocarSubrayados(m, id, datos.contenido, r);
      }
      for (const c of cambiosDisp) await m.update(Disposicion, c.id, { contenido: c.contenido });
      let orden = disposicionesBd.reduce((max, d) => Math.max(max, d.orden ?? 0), 0);
      for (const d of nuevasDisp) {
        await m.save(m.create(Disposicion, {
          categoria: d.categoria as any,
          etiqueta: d.etiqueta || undefined,
          contenido: d.contenido,
          orden: ++orden,
          versionLey: { id: versionId } as any,
        }));
      }
    });

    this.logger.log(
      `Actualizar desde JSON ${version.ley?.nombre ?? ''} v${version.version}: ` +
        `${r.articulos.aCambiar} artículos y ${r.disposiciones.aCambiar + r.disposiciones.nuevas} disposiciones`,
    );
    return r;
  }

  // ─── helpers ─────────────────────────────────────────────

  /** Recorre libros/títulos/capítulos/secciones del JSON y devuelve todos los artículos. */
  private aplanarArticulos(e: EstructuraJson): ArticuloJson[] {
    const out: ArticuloJson[] = [];
    const deCapitulo = (c: any) => {
      out.push(...(c?.articulos ?? []));
      for (const s of c?.secciones ?? []) out.push(...(s?.articulos ?? []));
    };
    const deTitulo = (t: any) => {
      out.push(...(t?.articulos ?? []));
      for (const c of t?.capitulos ?? []) deCapitulo(c);
    };
    for (const l of e.libros ?? []) for (const t of l?.titulos ?? []) deTitulo(t);
    for (const t of e.titulos ?? []) deTitulo(t);
    return out.filter((a) => a && a.numero != null);
  }

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

  private async recolocarSubrayados(m: EntityManager, articuloId: string, contenido: string, r: ResultadoActualizacion) {
    const subrayados = await m.find(SubrayadoArticulo, { where: { articulo: { id: articuloId } as any } });
    for (const s of subrayados) {
      const pos = relocalizarFragmento(contenido, s.textoSeleccionado, s.inicio);
      if (!pos) { r.subrayados.noEncontrados++; continue; }
      await m.update(SubrayadoArticulo, s.id, {
        inicio: pos[0],
        fin: pos[1],
        textoSeleccionado: contenido.slice(pos[0], pos[1]),
      });
      r.subrayados.recolocados++;
    }
  }
}
