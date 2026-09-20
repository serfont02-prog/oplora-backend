import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';

export enum EstadoTicketSoporte {
  ABIERTO = 'abierto',
  RESPONDIDO = 'respondido',
  CERRADO = 'cerrado',
}

@Entity('tickets_soporte')
export class TicketSoporte {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  usuario: Usuario;

  @Column()
  asunto: string;

  @Column({ type: 'text' })
  mensaje: string;

  @Column({ type: 'enum', enum: EstadoTicketSoporte, default: EstadoTicketSoporte.ABIERTO })
  estado: EstadoTicketSoporte;

  @Column({ type: 'text', nullable: true })
  respuesta: string | null;

  @Column({ type: 'timestamp', nullable: true })
  respondidoEn: Date | null;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;
}
