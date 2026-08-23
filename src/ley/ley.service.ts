import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ley } from './ley.entity';
import { VersionLey, TipoCambio } from './version-ley.entity';
import { DiffVersion } from './diff-version.entity';
import { OposicionLey } from './oposicion-ley.entity';
import * as fs from 'fs';
const pdfParse = require('pdf-parse');

@Injectable()
export class LeyService {
  constructor(
    @InjectRepository(Ley)
    private readonly leyRepo: Repository<Ley>,
    @InjectRepository(VersionLey)
    private readonly versionRepo: Repository<VersionLey>,
    @InjectRepository(DiffVersion)
    private readonly diffRepo: Repository<DiffVersion>,
    @InjectRepository(OposicionLey)
    private readonly oposicionLeyRepo: Repository<OposicionLey>,
    
  ) {}

  // ─── LEYES ───────────────────────────────────────────────

  findAll(search?: string): Promise<Ley[]> {
  const qb = this.leyRepo.createQueryBuilder('l')
    .leftJoinAndSelect('l.versiones', 'v', 'v.activa = true')
    .leftJoinAndSelect('l.oposicionLeyes', 'ol')
    .orderBy('l.nombre', 'ASC');
  if (search) {
    qb.where('LOWER(l.nombre) LIKE :s', { s: `%${search.toLowerCase()}%` });
  }
  return qb.getMany();
}

  async findOne(id: string): Promise<Ley> {
    const ley = await this.leyRepo.findOne({
      where: { id },
      relations: ['versiones'],
    });
    if (!ley) throw new NotFoundException(`Ley ${id} no encontrada`);
    return ley;
  }

async create(nombre: string, siglas?: string, descripcion?: string): Promise<Ley> {
  const ley = this.leyRepo.create({ nombre, siglas, descripcion });
  return this.leyRepo.save(ley);
}

  async update(id: string, datos: Partial<{ nombre: string; siglas: string; descripcion: string }>): Promise<Ley> {
    await this.findOne(id);
    await this.leyRepo.update(id, datos); 
    return this.findOne(id);
  }

  // ─── VERSIONES ───────────────────────────────────────────

  findVersiones(leyId: string): Promise<VersionLey[]> {
    return this.versionRepo.find({
      where: { ley: { id: leyId } },
      order: { fechaPublicacion: 'DESC' },
    });
  }

  async findVersionActiva(leyId: string): Promise<VersionLey | null> {
    return this.versionRepo.findOne({
      where: { ley: { id: leyId }, activa: true },
    });
  }

  async crearVersion(
    leyId: string,
    datos: {
      version: string;
      referenciaBoe?: string;
      tipoNorma?: string;
      fechaPublicacion?: string;
      fechaVigencia?: string;
      tipoCambio?: TipoCambio;
      notas?: string;
    },
    texto: string,
  ): Promise<VersionLey> {
    // Desactivar versión anterior si la hay
    await this.versionRepo.update(
      { ley: { id: leyId }, activa: true },
      { activa: false },
    );

    const version = this.versionRepo.create({
      ...datos,
      fechaPublicacion: datos.fechaPublicacion ? new Date(datos.fechaPublicacion) : undefined,
      fechaVigencia: datos.fechaVigencia ? new Date(datos.fechaVigencia) : undefined,
      tipoCambio: datos.tipoCambio ?? TipoCambio.INICIAL,
      activa: true,
      textoCompleto: texto,
      ley: { id: leyId } as any,
    });

    return this.versionRepo.save(version);
  }

  async activarVersion(versionId: string): Promise<VersionLey> {
  const version = await this.versionRepo.findOne({
    where: { id: versionId },
    relations: ['ley'],
  });
  if (!version) throw new NotFoundException(`Versión ${versionId} no encontrada`);

  await this.versionRepo.update(
    { ley: { id: version.ley.id }, activa: true },
    { activa: false },
  );
  await this.versionRepo.update(versionId, { activa: true });
  
  const actualizada = await this.versionRepo.findOne({ 
    where: { id: versionId }, 
    relations: ['ley'] 
  });
  if (!actualizada) throw new NotFoundException(`Versión ${versionId} no encontrada`);
  return actualizada;
  }

  // ─── PROCESADO DE ARCHIVOS ───────────────────────────────

  async procesarArchivo(filePath: string, ext: string): Promise<string> {
    if (ext === '.pdf') {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      fs.unlinkSync(filePath);
      return data.text;
    }
    const texto = fs.readFileSync(filePath, 'utf-8');
    fs.unlinkSync(filePath);
    return texto;
  }

  // ─── VINCULACIÓN OPOSICIONES ─────────────────────────────

  async vincular(leyId: string, oposicionId: string, versionLeyId?: string): Promise<OposicionLey> {
    const existente = await this.oposicionLeyRepo.findOne({
      where: { ley: { id: leyId }, oposicion: { id: oposicionId } },
    });
    if (existente) {
      if (versionLeyId) {
        await this.oposicionLeyRepo.update(existente.id, {
          versionLey: { id: versionLeyId } as any,
        });
      }
      return existente;
    }

    const vinculo = this.oposicionLeyRepo.create({
      ley: { id: leyId } as any,
      oposicion: { id: oposicionId } as any,
      versionLey: versionLeyId ? ({ id: versionLeyId } as any) : undefined,
      obligatoria: true,
    });
    return this.oposicionLeyRepo.save(vinculo);
  }

  async desvincular(leyId: string, oposicionId: string): Promise<void> {
    await this.oposicionLeyRepo.delete({
      ley: { id: leyId },
      oposicion: { id: oposicionId },
    });
  }

  findByOposicion(oposicionId: string): Promise<OposicionLey[]> {
    return this.oposicionLeyRepo.find({
      where: { oposicion: { id: oposicionId } },
      relations: ['ley', 'versionLey'],
    });
  }

  findOposicionesByLey(leyId: string): Promise<OposicionLey[]> {
    return this.oposicionLeyRepo.find({
      where: { ley: { id: leyId } },
      relations: ['oposicion', 'versionLey'],
    });
  }

  // ─── DIFFS ───────────────────────────────────────────────

  async findDiffs(leyId: string): Promise<DiffVersion[]> {
    return this.diffRepo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.versionNueva', 'vn')
      .leftJoinAndSelect('d.versionAnterior', 'va')
      .where('vn.ley.id = :leyId', { leyId })
      .orderBy('d.creadoEn', 'DESC')
      .getMany();
  }

  async crearDiff(versionNuevaId: string, versionAnteriorId?: string): Promise<DiffVersion> {
    const diff = this.diffRepo.create({
      versionNueva: { id: versionNuevaId } as any,
      versionAnterior: versionAnteriorId ? ({ id: versionAnteriorId } as any) : undefined,
      generadoPorIa: false,
    });
    return this.diffRepo.save(diff);
  }

  async eliminar(id: string): Promise<void> {
  await this.leyRepo.delete(id);
}

async getNoticiasLegislacion(oposicionId: string, limite?: number) {
  const oposicionLeyes = await this.oposicionLeyRepo.find({
    where: { oposicion: { id: oposicionId } },
    relations: ['ley'],
  });

  const leyIds = oposicionLeyes.map((ol) => ol.ley.id);
  if (leyIds.length === 0) return [];

  const query = this.versionRepo
    .createQueryBuilder('v')
    .leftJoinAndSelect('v.ley', 'ley')
    .where('v.leyId IN (:...leyIds)', { leyIds })
    .orderBy('v.fechaPublicacion', 'DESC');

  if (limite) query.take(limite);

  const versiones = await query.getMany();

  return versiones.map((v) => ({
    id: v.id,
    titular: `${v.ley.nombre} — ${v.tipoCambio === 'inicial' ? 'Nueva versión publicada' : 'Actualización normativa'}`,
    descripcion: v.notas || undefined,
    fecha: v.fechaPublicacion,
    leyId: v.ley.id,
  }));
}

}