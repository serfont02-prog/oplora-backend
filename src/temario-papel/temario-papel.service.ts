import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createClient } from '@supabase/supabase-js';
import { Configuracion } from '../config/configuracion.entity';
import { Oposicion } from '../oposicion/oposicion.entity';
import { InteresTemarioPapel } from './interes-temario-papel.entity';

/**
 * ⭐ Temario en papel: ficha del temario impreso de cada oposición y lista de interesados.
 * La ficha se guarda en la tabla de configuración (clave "temario_papel"), una por oposición.
 * Mientras no haya pago, la app muestra "Avísame cuando esté disponible".
 */
export type LugarTemarioPapel = 'lector' | 'tema' | 'listaTemas' | 'perfil';
export const LUGARES: LugarTemarioPapel[] = ['lector', 'tema', 'listaTemas', 'perfil'];

export interface ValorOpcion { id: string; nombre: string; descripcion: string; suplemento: number | null }
export interface GrupoOpciones { id: string; nombre: string; valores: ValorOpcion[] }

export interface ProductoTemarioPapel {
  activo: boolean;          // visible en la app
  ubicaciones: Record<LugarTemarioPapel, boolean>; // dónde aparece el acceso
  opciones: GrupoOpciones[];  // lo que el opositor puede elegir (color, caras...)
  titulo: string;
  edicion: string;          // p. ej. "Edición convocatoria 2026"
  paginas: number | null;
  tomos: number | null;
  encuadernacion: string;
  precio: number | null;    // € (opcional mientras sea "próximamente")
  gastosEnvio: number | null;
  plazoEnvio: string;
  descripcion: string;
  imagenes: string[];       // rutas de /public o URLs https
}

const CLAVE = 'temario_papel';
// Imágenes de la ficha (portada y páginas de muestra): bucket público propio.
const BUCKET = 'temario-papel';
const TIPOS_IMAGEN: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

const PRODUCTO_VACIO: ProductoTemarioPapel = {
  activo: false,
  ubicaciones: { lector: true, tema: true, listaTemas: true, perfil: true },
  opciones: [],
  titulo: 'Temario completo en papel',
  edicion: '',
  paginas: null,
  tomos: null,
  encuadernacion: '',
  precio: null,
  gastosEnvio: null,
  plazoEnvio: '',
  descripcion: '',
  imagenes: [],
};

function texto(v: any, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}
function numero(v: any, min: number, max: number): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < min || n > max) throw new BadRequestException('Revisa los números de la ficha');
  return Math.round(n * 100) / 100;
}

function slug(t: string): string {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

function normalizarOpciones(v: any): GrupoOpciones[] {
  if (!Array.isArray(v)) return [];
  const grupos: GrupoOpciones[] = [];
  const idsGrupo = new Set<string>();
  for (const g of v.slice(0, 6)) {
    const nombre = texto(g?.nombre, 60);
    if (!nombre) continue;
    let id = slug(texto(g?.id, 40) || nombre) || `grupo-${grupos.length + 1}`;
    while (idsGrupo.has(id)) id += '-2';
    idsGrupo.add(id);
    const idsValor = new Set<string>();
    const valores: ValorOpcion[] = [];
    for (const val of (Array.isArray(g?.valores) ? g.valores : []).slice(0, 8)) {
      const nv = texto(val?.nombre, 60);
      if (!nv) continue;
      let vid = slug(texto(val?.id, 40) || nv) || `opcion-${valores.length + 1}`;
      while (idsValor.has(vid)) vid += '-2';
      idsValor.add(vid);
      valores.push({ id: vid, nombre: nv, descripcion: texto(val?.descripcion, 120), suplemento: numero(val?.suplemento, 0, 1000) });
    }
    if (valores.length >= 2) grupos.push({ id, nombre, valores });
  }
  return grupos;
}

/** Deja solo elecciones válidas de la ficha; lo que falte se completa con la primera opción. */
export function normalizarEleccion(producto: ProductoTemarioPapel, eleccion: any): Record<string, string> | null {
  if (!producto.opciones.length) return null;
  const r: Record<string, string> = {};
  for (const g of producto.opciones) {
    const elegido = eleccion && typeof eleccion === 'object' ? eleccion[g.id] : undefined;
    r[g.id] = g.valores.some((v) => v.id === elegido) ? elegido : g.valores[0].id;
  }
  return r;
}

export function normalizarProducto(d: any): ProductoTemarioPapel {
  if (!d || typeof d !== 'object') throw new BadRequestException('Ficha no válida');
  const imagenes = Array.isArray(d.imagenes) ? d.imagenes : [];
  const imagenesOk = imagenes
    .filter((u: any) => typeof u === 'string')
    .map((u: string) => u.trim())
    .filter((u: string) => /^\/temario-papel\/[\w\-./]+$/.test(u) || /^https:\/\/[^\s"'<>]+$/.test(u))
    .slice(0, 12);
  const ub = d.ubicaciones && typeof d.ubicaciones === 'object' ? d.ubicaciones : {};
  return {
    activo: d.activo === true,
    ubicaciones: Object.fromEntries(LUGARES.map((l) => [l, ub[l] !== false])) as Record<LugarTemarioPapel, boolean>,
    opciones: normalizarOpciones(d.opciones),
    titulo: texto(d.titulo, 120) || PRODUCTO_VACIO.titulo,
    edicion: texto(d.edicion, 80),
    paginas: numero(d.paginas, 1, 5000),
    tomos: numero(d.tomos, 1, 20),
    encuadernacion: texto(d.encuadernacion, 80),
    precio: numero(d.precio, 0, 10000),
    gastosEnvio: numero(d.gastosEnvio, 0, 1000),
    plazoEnvio: texto(d.plazoEnvio, 120),
    descripcion: texto(d.descripcion, 1200),
    imagenes: imagenesOk,
  };
}

@Injectable()
export class TemarioPapelService {
  private supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
    : null;

  constructor(
    @InjectRepository(Configuracion) private readonly configRepo: Repository<Configuracion>,
    @InjectRepository(InteresTemarioPapel) private readonly interesRepo: Repository<InteresTemarioPapel>,
    @InjectRepository(Oposicion) private readonly oposicionRepo: Repository<Oposicion>,
  ) {}

  private async leerFichas(): Promise<Record<string, ProductoTemarioPapel>> {
    const fila = await this.configRepo.findOne({ where: { clave: CLAVE } });
    const valor = fila?.valor;
    return valor && typeof valor === 'object' && !Array.isArray(valor) ? valor : {};
  }

  async getFicha(oposicionId: string): Promise<ProductoTemarioPapel | null> {
    const fichas = await this.leerFichas();
    const f = fichas[oposicionId];
    if (!f) return null;
    return {
      ...PRODUCTO_VACIO,
      ...f,
      ubicaciones: { ...PRODUCTO_VACIO.ubicaciones, ...(f.ubicaciones ?? {}) },
      opciones: Array.isArray(f.opciones) ? f.opciones : [],
    };
  }

  /** Lo que ve el opositor: la ficha solo si está activa, y si ya ha pedido aviso. */
  async paraUsuario(usuarioId: string, oposicionId: string) {
    const ficha = await this.getFicha(oposicionId);
    if (!ficha?.activo) return { producto: null, interesado: false, opciones: null };
    const interes = await this.interesRepo.findOne({
      where: { usuario: { id: usuarioId }, oposicion: { id: oposicionId } },
    });
    return {
      producto: ficha,
      interesado: !!interes,
      opciones: interes ? normalizarEleccion(ficha, interes.opciones) : null,
    };
  }

  /** Apunta al usuario a la lista de aviso (o actualiza cómo lo quiere si ya estaba). */
  async apuntarInteres(usuarioId: string, oposicionId: string, eleccion?: any) {
    const ficha = await this.getFicha(oposicionId);
    if (!ficha?.activo) throw new NotFoundException('Esta oposición no tiene temario en papel');
    const opciones = normalizarEleccion(ficha, eleccion);
    const existe = await this.interesRepo.findOne({
      where: { usuario: { id: usuarioId }, oposicion: { id: oposicionId } },
    });
    if (existe) {
      existe.opciones = opciones;
      await this.interesRepo.save(existe);
    } else {
      try {
        await this.interesRepo.save(this.interesRepo.create({
          usuario: { id: usuarioId } as any,
          oposicion: { id: oposicionId } as any,
          opciones,
        }));
      } catch (e: any) {
        if (e?.code !== '23505') throw e; // doble pulsación: ya estaba apuntado
      }
    }
    return { interesado: true, opciones };
  }

  async quitarInteres(usuarioId: string, oposicionId: string) {
    await this.interesRepo.delete({ usuario: { id: usuarioId }, oposicion: { id: oposicionId } } as any);
    return { interesado: false };
  }

  // ---------- Administración ----------

  async resumenAdmin() {
    const [fichas, oposiciones, cuentas] = await Promise.all([
      this.leerFichas(),
      this.oposicionRepo.find({ select: ['id', 'nombre'] as any, order: { nombre: 'ASC' } as any }),
      this.interesRepo
        .createQueryBuilder('i')
        .select('i."oposicionId"', 'oposicionId')
        .addSelect('COUNT(*)::int', 'total')
        .groupBy('i."oposicionId"')
        .getRawMany(),
    ]);
    const porOposicion = new Map(cuentas.map((c: any) => [c.oposicionId, Number(c.total)]));
    const resultado: { oposicion: { id: string; nombre: string }; producto: ProductoTemarioPapel | null; interesados: number }[] = [];
    for (const o of oposiciones) {
      resultado.push({
        oposicion: { id: o.id, nombre: o.nombre },
        producto: fichas[o.id] ? await this.getFicha(o.id) : null,
        interesados: porOposicion.get(o.id) ?? 0,
      });
    }
    return resultado;
  }

  async guardarFicha(oposicionId: string, datos: any) {
    const oposicion = await this.oposicionRepo.findOne({ where: { id: oposicionId } });
    if (!oposicion) throw new NotFoundException('Oposición no encontrada');
    const producto = normalizarProducto(datos);
    const fichas = await this.leerFichas();
    fichas[oposicionId] = producto;
    const fila = await this.configRepo.findOne({ where: { clave: CLAVE } });
    if (fila) {
      fila.valor = fichas;
      await this.configRepo.save(fila);
    } else {
      await this.configRepo.save(this.configRepo.create({ clave: CLAVE, valor: fichas, descripcion: 'Temario en papel por oposición' }));
    }
    return producto;
  }

  /** Sube una imagen de la ficha y devuelve su enlace público. Crea el bucket la primera vez. */
  async subirImagen(oposicionId: string, archivo?: { buffer: Buffer; mimetype: string; size: number }) {
    if (!archivo?.buffer) throw new BadRequestException('Falta la imagen');
    const ext = TIPOS_IMAGEN[archivo.mimetype];
    if (!ext) throw new BadRequestException('Sube una imagen JPG, PNG o WebP (un PDF no se puede usar como imagen)');
    if (archivo.size > 5 * 1024 * 1024) throw new BadRequestException('La imagen no puede pasar de 5 MB');
    if (!this.supabase) throw new BadRequestException('El almacenamiento de archivos no está configurado');
    const ruta = `${oposicionId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const subir = () => this.supabase!.storage.from(BUCKET).upload(ruta, archivo.buffer, { contentType: archivo.mimetype, upsert: false });
    let { error } = await subir();
    if (error && /bucket not found|not found/i.test(error.message)) {
      const creado = await this.supabase.storage.createBucket(BUCKET, { public: true });
      if (creado.error && !/already exists/i.test(creado.error.message)) throw new BadRequestException(`No se ha podido preparar el almacenamiento: ${creado.error.message}`);
      ({ error } = await subir());
    }
    if (error) throw new BadRequestException(`No se ha podido subir la imagen: ${error.message}`);
    const { data } = this.supabase.storage.from(BUCKET).getPublicUrl(ruta);
    return { url: data.publicUrl };
  }

  async interesados(oposicionId: string) {
    const filas = await this.interesRepo.find({
      where: { oposicion: { id: oposicionId } },
      relations: ['usuario'],
      order: { creadoEn: 'DESC' },
    });
    const ficha = await this.getFicha(oposicionId);
    return filas.map((f) => ({
      id: f.id,
      creadoEn: f.creadoEn,
      opciones: ficha ? normalizarEleccion(ficha, f.opciones) : null,
      usuario: f.usuario ? { id: f.usuario.id, nick: (f.usuario as any).nick, nombre: f.usuario.nombre, email: f.usuario.email } : null,
    }));
  }
}
