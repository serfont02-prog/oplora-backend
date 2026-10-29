import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { borrarOposicion } from '../common/helpers/borrado.helper';
import { UsuarioOposicion } from '../usuario/usuario-oposicion.entity';
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

  async findAll(search?: string, soloPublicadas = false): Promise<Oposicion[]> {
    const qb = this.repo.createQueryBuilder('o')
      .loadRelationCountAndMap('o.totalConvocatorias', 'o.convocatorias')
      .loadRelationCountAndMap('o.totalLeyes', 'o.oposicionLeyes')
      .loadRelationCountAndMap('o.convocatoriasActivas', 'o.convocatorias', 'ca', 
        qb => qb.where('ca.estado = :estado', { estado: 'activa' })
      )
      .orderBy('o.creadoEn', 'DESC');

    if (search) {
      qb.where('(LOWER(o.nombre) LIKE :search OR LOWER(o.administracion) LIKE :search)', {
          search: `%${search.toLowerCase()}%`,
        });
      }
    // ⭐ El onboarding solo debe ofrecer las oposiciones publicadas (no las que están en preparación)
    if (soloPublicadas) qb.andWhere('o.activa = true');
      const result = await qb.getMany();
      //result.forEach(o => console.log(o.nombre, 'convocatoriasActivas:', (o as any).convocatoriasActivas));
      return result;
      //return qb.getMany();
    }

  async eliminar(id: string): Promise<void> {
  // ⭐ Borrar una oposición con alumnos inscritos borraba en cascada sus inscripciones
  // (puntos, nivel, convocatoria elegida). Se impide: mejor desactivarla.
  const inscritos = await this.repo.manager.count(UsuarioOposicion, { where: { oposicion: { id } as any } });
  if (inscritos > 0) {
    throw new BadRequestException(
      `No se puede borrar: tiene ${inscritos} usuario(s) inscrito(s). Desactívala para ocultarla sin perder sus datos.`,
    );
  }
  // ⭐ Todo en una transacción y sin chocar con las claves foráneas (antes fallaba a medias).
  await this.repo.manager.transaction((manager) => borrarOposicion(manager, id));
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
    await this.eliminar(id); // ⭐ misma comprobación y limpieza que eliminar()
  }

  async count(): Promise<number> {
  return this.repo.count();
}
}