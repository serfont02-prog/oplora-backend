import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { VersionLey } from './version-ley.entity';
import { Articulo } from '../normativa/articulo.entity';
import { Disposicion } from '../normativa/disposicion.entity';
import { SubrayadoArticulo } from '../normativa/subrayado-articulo.entity';
import { claveArticulo, normalizarContenido, relocalizarFragmento } from './texto-legal.util';

interface ArticuloJson { numero: string; titulo?: string | null; contenido: string; ruta?: string }
/** Dónde cuelga un artículo de la app: exactamente uno de los tres. */
type Contenedor = { campo: 'seccion' | 'capitulo' | 'tituloRef'; id: string };
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
    soloEnJson: string[];  // no existen en la app y no se pueden colocar: no se crean
    creados: string[];     // no existían: se crean junto a su vecino del JSON (mismo título/capítulo/sección)
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
      articulos: { enApp: articulosBd.length, enJson: articulosJson.length, aCambiar: 0, sinCambios: 0, rubricasCambiadas: 0, soloEnApp: [], soloEnJson: [], creados: [] },
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
    // ⭐ Artículos que vienen en el JSON y no existen en la app (p. ej. LO 2/1979, arts. 100-102,
    // que en la primera carga iban pegados al 99): se crean en el mismo título/capítulo/sección
    // que su vecino del JSON, justo detrás del anterior (o delante del siguiente). Solo si el vecino
    // está en el mismo sitio de la estructura en el JSON; si no, se avisa y no se crean.
    const nuevosArt = this.planificarNuevos(articulosJson, articulosBd, clavesBd, r);

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
      // Nuevos artículos: se abre hueco en el orden del contenedor y se insertan
      for (const n of nuevosArt) {
        const pos = n.ancla.tipo === 'despues' ? n.ancla.ref.orden + 1 : n.ancla.ref.orden;
        const { campo, id } = n.ancla.ref.contenedor;
        await m.createQueryBuilder().update(Articulo).set({ orden: () => 'orden + 1' })
          .where(`"${campo}Id" = :id AND orden >= :pos`, { id, pos }).execute();
        for (const ref of n.vecinos) if (ref.contenedor.campo === campo && ref.contenedor.id === id && ref.orden >= pos) ref.orden++;
        await m.save(m.create(Articulo, {
          orden: pos,
          numero: n.json.numero,
          titulo: (n.json.titulo ?? '').trim() || undefined,
          contenido: normalizarContenido(n.json.contenido),
          vigente: true,
          pesoExamen: 1,
          [campo]: { id } as any,
        } as any));
        n.propio.orden = pos;
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
        `${r.articulos.aCambiar} artículos (${r.articulos.creados.length} nuevos) y ${r.disposiciones.aCambiar + r.disposiciones.nuevas} disposiciones`,
    );
    return r;
  }

  // ─── helpers ─────────────────────────────────────────────

  /** Recorre libros/títulos/capítulos/secciones del JSON y devuelve todos los artículos,
   *  cada uno con su `ruta` (dónde cuelga) para saber si dos vecinos van en el mismo sitio. */
  private aplanarArticulos(e: EstructuraJson): ArticuloJson[] {
    const out: ArticuloJson[] = [];
    const n = (x: any, i: number) => `${x?.numero ?? ''}~${x?.nombre ?? ''}~${i}`;
    const add = (arts: any[], ruta: string) => { for (const a of arts ?? []) out.push({ ...a, ruta }); };
    const deTitulo = (t: any, rt: string) => {
      add(t?.articulos, rt);
      (t?.capitulos ?? []).forEach((c: any, ci: number) => {
        const rc = `${rt}|C${n(c, ci)}`;
        add(c?.articulos, rc);
        (c?.secciones ?? []).forEach((s: any, si: number) => add(s?.articulos, `${rc}|S${n(s, si)}`));
      });
    };
    (e.libros ?? []).forEach((l: any, li: number) => (l?.titulos ?? []).forEach((t: any, ti: number) => deTitulo(t, `L${li}|T${n(t, ti)}`)));
    (e.titulos ?? []).forEach((t: any, ti: number) => deTitulo(t, `L-|T${n(t, ti)}`));
    return out.filter((a) => a && a.numero != null);
  }

  /** Decide dónde va cada artículo del JSON que no existe en la app. */
  private planificarNuevos(articulosJson: ArticuloJson[], articulosBd: Articulo[], clavesBd: Set<string>, r: ResultadoActualizacion) {
    type Ref = { orden: number; contenedor: Contenedor };
    const contenedorDe = (a: any): Contenedor | null =>
      a.seccion ? { campo: 'seccion', id: a.seccion } : a.capitulo ? { campo: 'capitulo', id: a.capitulo } : a.tituloRef ? { campo: 'tituloRef', id: a.tituloRef } : null;
    const refs = new Map<string, Ref>();
    for (const a of articulosBd) {
      const c = contenedorDe(a);
      if (c) refs.set(claveArticulo(a.numero), { orden: a.orden, contenedor: c });
    }
    const vecinos = [...refs.values()];
    const nuevos: { json: ArticuloJson; ancla: { tipo: 'despues' | 'antes'; ref: Ref }; propio: Ref; vecinos: Ref[] }[] = [];
    articulosJson.forEach((a, i) => {
      const clave = claveArticulo(a.numero);
      if (clavesBd.has(clave) || refs.has(clave)) return;
      const prev = articulosJson[i - 1];
      const next = articulosJson[i + 1];
      let ancla: { tipo: 'despues' | 'antes'; ref: Ref } | null = null;
      if (prev && prev.ruta === a.ruta && refs.has(claveArticulo(prev.numero))) ancla = { tipo: 'despues', ref: refs.get(claveArticulo(prev.numero))! };
      else if (next && next.ruta === a.ruta && clavesBd.has(claveArticulo(next.numero))) ancla = { tipo: 'antes', ref: refs.get(claveArticulo(next.numero))! };
      if (!ancla) { r.articulos.soloEnJson.push(a.numero); return; }
      // Su propia referencia (el orden real se fija al insertar) para que el siguiente nuevo vaya detrás
      const propio: Ref = { orden: ancla.tipo === 'despues' ? ancla.ref.orden + 1 : ancla.ref.orden, contenedor: ancla.ref.contenedor };
      refs.set(clave, propio);
      vecinos.push(propio);
      nuevos.push({ json: a, ancla, propio, vecinos });
      r.articulos.creados.push(a.numero);
    });
    return nuevos;
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
      // ⭐ Con los IDs de su sección/capítulo/título, para colocar los artículos nuevos
      .loadAllRelationIds({ relations: ['capitulo', 'seccion', 'tituloRef'] })
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
