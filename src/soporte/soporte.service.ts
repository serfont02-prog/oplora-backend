import { Injectable, NotFoundException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketSoporte, EstadoTicketSoporte } from './ticket-soporte.entity';
import { CreateTicketDto, ResponderTicketDto, FiltrosTicketSoporte } from './soporte.dto';
import { NotificacionService } from '../notificacion/notificacion.service';

@Injectable()
export class SoporteService {
  constructor(
    @InjectRepository(TicketSoporte)
    private readonly repo: Repository<TicketSoporte>,
    @Inject(forwardRef(() => NotificacionService))
    private readonly notificacionService: NotificacionService,
  ) {}

  async crear(usuarioId: string, dto: CreateTicketDto): Promise<TicketSoporte> {
    const ticket = this.repo.create({
      usuario: { id: usuarioId } as any,
      asunto: dto.asunto,
      mensaje: dto.mensaje,
      estado: EstadoTicketSoporte.ABIERTO,
    });
    return this.repo.save(ticket);
  }

  // Estrictamente filtrado por el usuario del token: nunca acepta un usuarioId
  // externo, así un usuario no puede ver tickets de otro.
  async findByUsuario(usuarioId: string): Promise<TicketSoporte[]> {
    return this.repo.find({
      where: { usuario: { id: usuarioId } },
      order: { creadoEn: 'DESC' },
    });
  }

  async findAll(filtros: FiltrosTicketSoporte = {}): Promise<TicketSoporte[]> {
    const qb = this.repo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.usuario', 'usuario')
      .orderBy('t.creadoEn', 'DESC');

    if (filtros.estado) qb.andWhere('t.estado = :estado', { estado: filtros.estado });

    return qb.getMany();
  }

  async findOne(id: string): Promise<TicketSoporte> {
    const ticket = await this.repo.findOne({ where: { id }, relations: ['usuario'] });
    if (!ticket) throw new NotFoundException(`Ticket de soporte ${id} no encontrado`);
    return ticket;
  }

  async responder(id: string, dto: ResponderTicketDto): Promise<TicketSoporte> {
    const ticket = await this.findOne(id);

    await this.repo.update(id, {
      respuesta: dto.respuesta,
      estado: EstadoTicketSoporte.RESPONDIDO,
      respondidoEn: new Date(),
    });

    const usuarioId = (ticket.usuario as any)?.id;
    if (usuarioId) {
      await this.notificacionService.notificarRespuestaSoporte(usuarioId, ticket.asunto, '/app/soporte');
    }

    return this.findOne(id);
  }

  async cerrar(id: string): Promise<TicketSoporte> {
    await this.findOne(id);
    await this.repo.update(id, { estado: EstadoTicketSoporte.CERRADO });
    return this.findOne(id);
  }

  async countAbiertos(): Promise<number> {
    return this.repo.count({ where: { estado: EstadoTicketSoporte.ABIERTO } });
  }
}
