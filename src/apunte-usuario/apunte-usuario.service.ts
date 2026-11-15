import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApunteUsuario } from './apunte-usuario.entity';
import { createClient } from '@supabase/supabase-js';
import { exigirAccesoCompleto, estaInscrito, datosTema } from '../common/helpers/acceso.helper';
import pdfParse = require('pdf-parse');

const BUCKET = 'apuntes-usuario';
// ⭐ Auditoría A10: topes de la subida de apuntes propios.
export const MAX_APUNTES_POR_USUARIO = 50;
export const MAX_BYTES_POR_USUARIO = 250 * 1024 * 1024; // 250 MB entre todos
const MAX_TEXTO_EXTRAIDO = 300_000; // caracteres
const SEGUNDOS_ENLACE = 60 * 60; // el enlace se firma al leer y vale 1 hora

const ES_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ⭐ Tipo real del archivo por sus primeros bytes (no por lo que diga el navegador).
function tipoReal(b: Buffer): { mime: string; ext: string } | null {
  if (!b || b.length < 12) return null;
  if (b.toString('ascii', 0, 5) === '%PDF-') return { mime: 'application/pdf', ext: 'pdf' };
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { mime: 'image/jpeg', ext: 'jpg' };
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { mime: 'image/png', ext: 'png' };
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') return { mime: 'image/webp', ext: 'webp' };
  return null;
}

/** Ruta en el almacén: la guardada o, en apuntes antiguos, la que va dentro del enlace firmado. */
function rutaDe(ap: { rutaArchivo?: string | null; urlArchivo?: string | null }): string | null {
  if (ap.rutaArchivo) return ap.rutaArchivo;
  if (!ap.urlArchivo) return null;
  try {
    const ruta = new URL(ap.urlArchivo).pathname.split(`/${BUCKET}/`)[1];
    return ruta ? decodeURIComponent(ruta) : null;
  } catch {
    return null;
  }
}

@Injectable()
export class ApunteUsuarioService {
  private readonly logger = new Logger(ApunteUsuarioService.name);
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
  );

  constructor(
    @InjectRepository(ApunteUsuario)
    private readonly repo: Repository<ApunteUsuario>,
  ) {}

  // ⭐ Auditoría A10. Antes: cualquier tipo de archivo, sin tope por usuario, sin mirar el acceso,
  // con el texto del PDF sin límite y un enlace firmado por un año.
  async subirApunte(
    usuarioId: string,
    oposicionId: string,
    nombre: string,
    buffer: Buffer,
    _mimeType: string,
    temaId?: string,
  ): Promise<any> {
    if (!buffer?.length) throw new BadRequestException('No se ha recibido ningún archivo');
    if (!ES_UUID.test(String(oposicionId ?? ''))) throw new BadRequestException('Oposición no válida');
    if (temaId !== undefined && !ES_UUID.test(String(temaId))) throw new BadRequestException('Tema no válido');

    const m = this.repo.manager;
    await exigirAccesoCompleto(m, usuarioId);
    if (!(await estaInscrito(m, usuarioId, oposicionId))) throw new ForbiddenException('No estás inscrito en esta oposición');
    if (temaId) {
      const t = await datosTema(m, temaId);
      if (!t || t.oposicionId !== oposicionId) throw new BadRequestException('Tema no válido');
    }

    const tipo = tipoReal(buffer);
    if (!tipo) throw new BadRequestException('Solo se pueden subir archivos PDF o imágenes (JPG, PNG o WEBP)');

    const [uso] = await m.query(
      `SELECT COUNT(*)::int AS n, COALESCE(SUM("tamanoBytes"), 0)::bigint AS bytes FROM apuntes_usuario WHERE "usuarioId" = $1`,
      [usuarioId],
    );
    if (Number(uso.n) >= MAX_APUNTES_POR_USUARIO) {
      throw new BadRequestException(`Has llegado al máximo de ${MAX_APUNTES_POR_USUARIO} archivos. Borra alguno para subir más.`);
    }
    if (Number(uso.bytes) + buffer.length > MAX_BYTES_POR_USUARIO) {
      throw new BadRequestException('Has llegado al espacio máximo para tus archivos (250 MB). Borra alguno para subir más.');
    }

    const nombreLimpio = String(nombre ?? 'archivo').slice(0, 150);
    const base = nombreLimpio
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\.[a-zA-Z0-9]{1,5}$/, '')
      .replace(/[^a-zA-Z0-9\-_]/g, '_')
      .slice(0, 80) || 'archivo';
    const ruta = `usuarios/${usuarioId}/${Date.now()}_${base}.${tipo.ext}`;

    const { error } = await this.supabase.storage
      .from(BUCKET)
      .upload(ruta, buffer, { contentType: tipo.mime, upsert: false });
    if (error) {
      this.logger.error(`Error subiendo apunte: ${error.message}`);
      throw new BadRequestException('No se ha podido subir el archivo. Inténtalo de nuevo.');
    }

    let textoExtraido = '';
    if (tipo.mime === 'application/pdf') {
      try {
        textoExtraido = String((await pdfParse(buffer)).text ?? '').replace(/\u0000/g, '').slice(0, MAX_TEXTO_EXTRAIDO);
      } catch (e: any) {
        this.logger.warn(`No se pudo leer el texto del PDF: ${e?.message}`);
      }
    }

    let guardado: ApunteUsuario;
    try {
      guardado = await this.repo.save(this.repo.create({
        nombre: nombreLimpio,
        rutaArchivo: ruta,
        tamanoBytes: buffer.length,
        textoExtraido,
        procesado: true,
        usuario: { id: usuarioId } as any,
        oposicion: { id: oposicionId } as any,
        ...(temaId ? { tema: { id: temaId } as any } : {}),
      }));
    } catch (e) {
      // Si no se guarda la fila, no se deja el archivo suelto en el almacén
      await this.supabase.storage.from(BUCKET).remove([ruta]).catch(() => null);
      throw e;
    }
    const [conEnlace] = await this.conEnlaces([guardado]);
    return conEnlace;
  }

  /** Devuelve los apuntes con un enlace recién firmado y sin el texto extraído. */
  private async conEnlaces(apuntes: ApunteUsuario[]): Promise<any[]> {
    const rutas = apuntes.map((a) => rutaDe(a));
    const pedir = rutas.filter((r): r is string => !!r);
    const enlaces = new Map<string, string>();
    if (pedir.length) {
      const { data, error } = await this.supabase.storage.from(BUCKET).createSignedUrls(pedir, SEGUNDOS_ENLACE);
      if (error) this.logger.error(`Error firmando enlaces de apuntes: ${error.message}`);
      for (const d of data ?? []) if (d?.path && d.signedUrl) enlaces.set(d.path, d.signedUrl);
    }
    return apuntes.map((a, i) => ({
      id: a.id,
      nombre: a.nombre,
      procesado: a.procesado,
      creadoEn: a.creadoEn,
      tamanoBytes: a.tamanoBytes ?? null,
      // si no se ha podido firmar, se deja el enlace antiguo (apuntes anteriores a este cambio)
      urlArchivo: (rutas[i] && enlaces.get(rutas[i]!)) || a.urlArchivo || null,
    }));
  }

  private readonly columnasLista = ['ap.id', 'ap.nombre', 'ap.urlArchivo', 'ap.rutaArchivo', 'ap.tamanoBytes', 'ap.procesado', 'ap.creadoEn'];

  async getApuntesPorTema(usuarioId: string, temaId: string): Promise<any[]> {
    if (!ES_UUID.test(String(temaId ?? ''))) return [];
    const filas = await this.repo
      .createQueryBuilder('ap')
      .select(this.columnasLista)
      .where('ap.usuario = :usuarioId', { usuarioId })
      .andWhere('ap.tema = :temaId', { temaId })
      .orderBy('ap.creadoEn', 'DESC')
      .getMany();
    return this.conEnlaces(filas);
  }

  async getApuntesPorOposicion(usuarioId: string, oposicionId: string): Promise<any[]> {
    if (!ES_UUID.test(String(oposicionId ?? ''))) return [];
    const filas = await this.repo
      .createQueryBuilder('ap')
      .select(this.columnasLista)
      .where('ap.usuario = :usuarioId', { usuarioId })
      .andWhere('ap.oposicion = :oposicionId', { oposicionId })
      .andWhere('ap.tema IS NULL') // ⭐ solo los generales, sin tema
      .orderBy('ap.creadoEn', 'DESC')
      .getMany();
    return this.conEnlaces(filas);
  }

  async eliminar(id: string, usuarioId: string): Promise<void> {
    if (!ES_UUID.test(String(id ?? ''))) return;
    const apunte = await this.repo.findOne({
      where: { id, usuario: { id: usuarioId } },
      select: { id: true, urlArchivo: true, rutaArchivo: true },
    });
    if (!apunte) return;

    const ruta = rutaDe(apunte);
    // Solo se borra del almacén lo que está en la carpeta del propio usuario
    if (ruta && ruta.startsWith(`usuarios/${usuarioId}/`)) {
      await this.supabase.storage.from(BUCKET).remove([ruta]);
    }
    await this.repo.delete(id);
  }
}
