import { Injectable, NotFoundException, forwardRef  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApunteOplora } from './apunte-oplora.entity';
import { ProgresoLectura } from './progreso-lectura.entity';
import { createClient } from '@supabase/supabase-js';
import pdfParse = require('pdf-parse');
import { SubrayadoApunte } from './subrayado-apunte.entity';
import { extraerLineasPDF } from './pdf-extractor';
import { clasificarDocumento } from './pdf-classifier';
import { NormativaService } from '../normativa/normativa.service';


@Injectable()
export class ApunteOploraService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
  );

  constructor(
    @InjectRepository(ApunteOplora)
    private readonly repo: Repository<ApunteOplora>,
    @InjectRepository(ProgresoLectura)
    private readonly progresoRepo: Repository<ProgresoLectura>,
    @InjectRepository(SubrayadoApunte)
    private readonly subrayadoRepo: Repository<SubrayadoApunte>,
    private readonly normativaService: NormativaService,
  ) {}

  
private parsearEstructura(texto: string) {
  const lineas = texto.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const secciones: { titulo: string; nivel: number; contenido: string }[] = [];
  let seccionActual: { titulo: string; nivel: number; contenido: string } | null = null;

  for (const linea of lineas) {
    const esTituloNumerico = /^\d+[\.\-]\s+[A-ZÁÉÍÓÚÑ]/.test(linea);
    const esTituloMayusculas = linea.length < 80 && linea === linea.toUpperCase() && linea.length > 3;

    if (esTituloNumerico || esTituloMayusculas) {
      if (seccionActual) secciones.push(seccionActual);
      seccionActual = {
        titulo: linea,
        nivel: esTituloNumerico ? 2 : 1,
        contenido: '',
      };
    } else if (seccionActual) {
      seccionActual.contenido += (seccionActual.contenido ? ' ' : '') + linea;
    } else {
      seccionActual = { titulo: 'Introducción', nivel: 1, contenido: linea };
    }
  }

  if (seccionActual) secciones.push(seccionActual);
  return secciones;
}
async subirArchivo(
  buffer: Buffer,
  nombreArchivo: string,
  mimeType: string,
  titulo: string,
  descripcion?: string,
  orden?: number,
  temaId?: string,
  oposicionId?: string,
  versionLeyId?: string,
): Promise<ApunteOplora> {
  const nombreSanitizado = nombreArchivo
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.\-_]/g, '_');

  const carpeta = temaId ? `temas/${temaId}` : `oposiciones/${oposicionId}`;
  const path = `${carpeta}/${Date.now()}_${nombreSanitizado}`;

  const { error } = await this.supabase.storage
    .from('apuntes-oplora')
    .upload(path, buffer, { contentType: mimeType, upsert: false });

  if (error) throw new Error(`Error subiendo archivo: ${error.message}`);

  const { data: urlData } = this.supabase.storage
    .from('apuntes-oplora')
    .getPublicUrl(path);

  const tipo = mimeType.includes('pdf') ? 'pdf' : 'imagen';

  let contenidoEstructurado: any = null;
  let textoCompleto: string | null = null;

if (tipo === 'pdf') {
  try {
    const paginas = await extraerLineasPDF(buffer);
    const documentoLectura = clasificarDocumento(paginas, titulo);

    contenidoEstructurado = documentoLectura; // ⭐ nuevo formato completo
    textoCompleto = documentoLectura.bloques
      .map((b: any) => {
        if (b.tipo === 'lista') return b.items.join('. ');
        if (b.tipo === 'titulo' || b.tipo === 'parrafo' || b.tipo === 'articulo_legal') return b.texto;
        return '';
      })
      .join(' ');
  } catch (e) {
    console.error('Error parseando PDF con nuevo parser:', e);
    // Fallback al parser viejo si el nuevo falla
    try {
      const data = await pdfParse(buffer);
      textoCompleto = data.text;
      const secciones = this.parsearEstructura(data.text);
      contenidoEstructurado = { secciones };
    } catch (e2) {
      console.error('Error también en parser legacy:', e2);
    }
  }
}

  const apunte = this.repo.create({
    titulo,
    descripcion,
    urlArchivo: urlData.publicUrl,
    tipo,
    orden: orden ?? 0,
    tamanoBytes: buffer.length,
    contenidoEstructurado,
    textoCompleto,
    versionParser: 2,
    versionLeyId,
    ...(temaId ? { tema: { id: temaId } as any } : {}),
    ...(oposicionId ? { oposicion: { id: oposicionId } as any } : {}),
  });

  return this.repo.save(apunte);
}

  async findByTema(temaId: string): Promise<ApunteOplora[]> {
    return this.repo.find({
      where: { tema: { id: temaId }, activo: true },
      order: { orden: 'ASC', creadoEn: 'ASC' },
    });
  }

  async eliminar(id: string): Promise<void> {
    const apunte = await this.repo.findOne({ where: { id } });
    if (!apunte) return;

    // Extraer path del archivo de la URL
    const url = new URL(apunte.urlArchivo);
    const path = url.pathname.split('/apuntes-oplora/')[1];

    if (path) {
      await this.supabase.storage
        .from('apuntes-oplora')
        .remove([path]);
    }

    await this.repo.delete(id);
  }

  async actualizar(id: string, datos: { titulo?: string; descripcion?: string; orden?: number }): Promise<ApunteOplora> {
    await this.repo.update(id, datos);
    return this.repo.findOne({ where: { id } }) as Promise<ApunteOplora>;
  }

  async findOne(id: string): Promise<ApunteOplora> {
  const apunte = await this.repo.findOne({ where: { id }, relations: ['tema'] });
  if (!apunte) throw new NotFoundException('Apunte no encontrado');
  return apunte;
}

  async findByOposicion(oposicionId: string): Promise<ApunteOplora[]> {
  return this.repo.find({
    where: { oposicion: { id: oposicionId }, activo: true },
    order: { orden: 'ASC' },
  });
}

async guardarProgreso(usuarioId: string, apunteId: string, porcentaje: number) {
  let progreso = await this.progresoRepo.findOne({
    where: { usuario: { id: usuarioId }, apunte: { id: apunteId } },
  });

  if (progreso) {
    // Solo actualiza si el nuevo % es mayor (no retroceder progreso)
    if (porcentaje > progreso.porcentaje) {
      await this.progresoRepo.update(progreso.id, { porcentaje });
    }
    return this.progresoRepo.findOne({ where: { id: progreso.id } });
  }

  return this.progresoRepo.save(this.progresoRepo.create({
    porcentaje,
    usuario: { id: usuarioId } as any,
    apunte: { id: apunteId } as any,
  }));
}

async getProgreso(usuarioId: string, apunteId: string) {
  const progreso = await this.progresoRepo.findOne({
    where: { usuario: { id: usuarioId }, apunte: { id: apunteId } },
  });
  return { porcentaje: progreso?.porcentaje ?? 0 };
}

async getSubrayados(usuarioId: string, apunteId: string) {
  return this.subrayadoRepo.find({
    where: { usuario: { id: usuarioId }, apunte: { id: apunteId } },
    order: { inicio: 'ASC' },
  });
}

async crearSubrayado(
  usuarioId: string,
  apunteId: string,
  inicio: number,
  fin: number,
  textoSeleccionado: string,
  color: string = 'amarillo',
) {
  return this.subrayadoRepo.save(this.subrayadoRepo.create({
    inicio,
    fin,
    textoSeleccionado,
    color,
    usuario: { id: usuarioId } as any,
    apunte: { id: apunteId } as any,
  }));
}

async borrarSubrayado(id: string, usuarioId: string) {
  await this.subrayadoRepo.delete({ id, usuario: { id: usuarioId } } as any);
}
 
}