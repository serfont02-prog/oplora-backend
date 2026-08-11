import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Oposicion } from './oposicion.entity';
import { CreateOposicionDto, UpdateOposicionDto } from './oposicion.dto';
import { Convocatoria } from '../convocatoria/convocatoria.entity';
import { DocumentoConvocatoria } from '../convocatoria/documento-convocatoria.entity';
import { Tema } from '../tema/tema.entity';
import { NotaArticulo } from '../normativa/nota-articulo.entity'; 


@Injectable()
export class OposicionService {
  constructor(
    @InjectRepository(Oposicion)
    private readonly repo: Repository<Oposicion>,
    @InjectRepository(Convocatoria)
    private readonly convocatoriaRepo: Repository<Convocatoria>,
    @InjectRepository(DocumentoConvocatoria)
    private readonly documentoRepo: Repository<DocumentoConvocatoria>,
    @InjectRepository(Tema)
    private readonly temaRepo: Repository<Tema>,
    @InjectRepository(NotaArticulo)
    private readonly notaRepo: Repository<NotaArticulo>,
  ) {}

  async findAll(search?: string): Promise<Oposicion[]> {
    const qb = this.repo.createQueryBuilder('o')
      .loadRelationCountAndMap('o.totalConvocatorias', 'o.convocatorias')
      .loadRelationCountAndMap('o.totalLeyes', 'o.oposicionLeyes')
      .loadRelationCountAndMap('o.convocatoriasActivas', 'o.convocatorias', 'ca', 
        qb => qb.where('ca.estado = :estado', { estado: 'activa' })
      )
      .orderBy('o.creadoEn', 'DESC');

    if (search) {
      qb.where('LOWER(o.nombre) LIKE :search OR LOWER(o.administracion) LIKE :search', {
          search: `%${search.toLowerCase()}%`,
        });
      }
      const result = await qb.getMany();
      result.forEach(o => console.log(o.nombre, 'convocatoriasActivas:', (o as any).convocatoriasActivas));
      return result;
      //return qb.getMany();
    }

  async eliminar(id: string): Promise<void> {
  const convocatorias = await this.convocatoriaRepo.find({
    where: { oposicion: { id } },
  });

  for (const conv of convocatorias) {
    const temas = await this.temaRepo.find({
      where: { convocatoria: { id: conv.id } },
    });
    for (const tema of temas) {
      await this.notaRepo.delete({ tema: { id: tema.id } } as any);
    }
    await this.temaRepo.delete({ convocatoria: { id: conv.id } } as any);
    await this.documentoRepo.delete({ convocatoria: { id: conv.id } } as any);
  }

  await this.convocatoriaRepo.delete({ oposicion: { id } } as any);
  await this.repo.delete(id);
}

  async findOne(id: string): Promise<Oposicion> {
    const oposicion = await this.repo.findOne({
      where: { id },
      relations: ['convocatorias', 'oposicionLeyes', 'oposicionLeyes.ley'],
    });
    if (!oposicion) throw new NotFoundException(`Oposición ${id} no encontrada`);
    return oposicion;
  }

  async create(dto: CreateOposicionDto): Promise<Oposicion> {
  const oposicion = this.repo.create({
    ...dto,
    activa: false,
  });
  return this.repo.save(oposicion);
}

  async update(id: string, dto: UpdateOposicionDto): Promise<Oposicion> {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }

  async count(): Promise<number> {
  return this.repo.count();
}
}