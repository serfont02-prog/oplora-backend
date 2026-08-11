import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApunteUsuario } from './apunte-usuario.entity';
import { createClient } from '@supabase/supabase-js';
import pdfParse = require('pdf-parse');

@Injectable()
export class ApunteUsuarioService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
  );

  constructor(
    @InjectRepository(ApunteUsuario)
    private readonly repo: Repository<ApunteUsuario>,
  ) {}

async subirApunte(
  usuarioId: string,
  oposicionId: string,
  nombre: string,
  buffer: Buffer,
  mimeType: string,
  temaId?: string,
): Promise<ApunteUsuario> {
  const nombreSanitizado = nombre
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.\-_]/g, '_');

  const path = `usuarios/${usuarioId}/${Date.now()}_${nombreSanitizado}`;

  const { error } = await this.supabase.storage
    .from('apuntes-usuario')
    .upload(path, buffer, { contentType: mimeType, upsert: false });

  if (error) throw new Error(`Error subiendo archivo: ${error.message}`);

  // ⭐ URL firmada en lugar de pública (bucket privado)
  const { data: urlData, error: urlError } = await this.supabase.storage
    .from('apuntes-usuario')
    .createSignedUrl(path, 60 * 60 * 24 * 365); // 1 año

  if (urlError) throw new Error(`Error generando URL: ${urlError.message}`);

  let textoExtraido = '';
  if (mimeType === 'application/pdf') {
    try {
      const parsed = await pdfParse(buffer);
      textoExtraido = parsed.text;
    } catch (e) {
      console.error('Error parseando PDF:', e);
    }
  }

  const apunte = this.repo.create({
    nombre,
    urlArchivo: urlData.signedUrl,
    textoExtraido,
    procesado: true,
    usuario: { id: usuarioId } as any,
    oposicion: { id: oposicionId } as any,
    ...(temaId ? { tema: { id: temaId } as any } : {}),
  });

  return this.repo.save(apunte);
  }
  
  async getApuntesPorTema(usuarioId: string, temaId: string): Promise<ApunteUsuario[]> {
  return this.repo.find({
    where: { usuario: { id: usuarioId }, tema: { id: temaId } },
    order: { creadoEn: 'DESC' },
  });
}

  async getApuntesPorOposicion(usuarioId: string, oposicionId: string): Promise<ApunteUsuario[]> {
  return this.repo
    .createQueryBuilder('ap')
    .where('ap.usuario = :usuarioId', { usuarioId })
    .andWhere('ap.oposicion = :oposicionId', { oposicionId })
    .andWhere('ap.tema IS NULL') // ⭐ solo los generales, sin tema
    .orderBy('ap.creadoEn', 'DESC')
    .getMany();
  }

  async eliminar(id: string, usuarioId: string): Promise<void> {
  const apunte = await this.repo.findOne({ where: { id, usuario: { id: usuarioId } } });
  if (!apunte) return;

  if (apunte.urlArchivo) {
    const url = new URL(apunte.urlArchivo);
    // La URL firmada tiene un formato distinto, extraemos el path antes del "?"
    const path = url.pathname.split('/apuntes-usuario/')[1];
    if (path) {
      await this.supabase.storage.from('apuntes-usuario').remove([path]);
    }
  }

  await this.repo.delete(id);
  }
}