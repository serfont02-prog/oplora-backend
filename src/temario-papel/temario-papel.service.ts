import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Configuracion } from '../config/configuracion.entity';
import { Oposicion } from '../oposicion/oposicion.entity';
import { InteresTemarioPapel } from './interes-temario-papel.entity';

/**
 * ⭐ Temario en papel: ficha del temario impreso de cada oposición y lista de interesados.
 * La ficha se guarda en la tabla de configuración (clave "temario_papel"), una por oposición.
 * Mientras no haya pago, la app muestra "Avísame cuando esté disponible".
 */
export interface ProductoTemarioPapel {
  activo: boolean;          // visible en la app
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

const PRODUCTO_VACIO: ProductoTemarioPapel = {
  activo: false,
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

export function normalizarProducto(d: any): ProductoTemarioPapel {
  if (!d || typeof d !== 'object') throw new BadRequestException('Ficha no válida');
  const imagenes = Array.isArray(d.imagenes) ? d.imagenes : [];
  const imagenesOk = imagenes
    .filter((u: any) => typeof u === 'string')
    .map((u: string) => u.trim())
    .filter((u: string) => /^\/temario-papel\/[\w\-./]+$/.test(u) || /^https:\/\/[^\s"'<>]+$/.test(u))
    .slice(0, 12);
  return {
    activo: d.activo === true,
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
    return fichas[oposicionId] ? { ...PRODUCTO_VACIO, ...fichas[oposicionId] } : null;
  }

  /** Lo que ve el opositor: la ficha solo si está activa, y si ya ha pedido aviso. */
  async paraUsuario(usuarioId: string, oposicionId: string) {
    const ficha = await this.getFicha(oposicionId);
    if (!ficha?.activo) return { producto: null, interesado: false };
    const interes = await this.interesRepo.findOne({
      where: { usuario: { id: usuarioId }, oposicion: { id: oposicionId } },
    });
    return { producto: ficha, interesado: !!interes };
  }

  async apuntarInteres(usuarioId: string, oposicionId: string) {
    const ficha = await this.getFicha(oposicionId);
    if (!ficha?.activo) throw new NotFoundException('Esta oposición no tiene temario en papel');
    const existe = await this.interesRepo.findOne({
      where: { usuario: { id: usuarioId }, oposicion: { id: oposicionId } },
    });
    if (!existe) {
      try {
        await this.interesRepo.save(this.interesRepo.create({
          usuario: { id: usuarioId } as any,
          oposicion: { id: oposicionId } as any,
        }));
      } catch (e: any) {
        if (e?.code !== '23505') throw e; // doble pulsación: ya estaba apuntado
      }
    }
    return { interesado: true };
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
    return oposiciones.map((o) => ({
      oposicion: { id: o.id, nombre: o.nombre },
      producto: fichas[o.id] ? { ...PRODUCTO_VACIO, ...fichas[o.id] } : null,
      interesados: porOposicion.get(o.id) ?? 0,
    }));
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

  async interesados(oposicionId: string) {
    const filas = await this.interesRepo.find({
      where: { oposicion: { id: oposicionId } },
      relations: ['usuario'],
      order: { creadoEn: 'DESC' },
    });
    return filas.map((f) => ({
      id: f.id,
      creadoEn: f.creadoEn,
      usuario: f.usuario ? { id: f.usuario.id, nick: (f.usuario as any).nick, nombre: f.usuario.nombre, email: f.usuario.email } : null,
    }));
  }
}
