import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { Oposicion } from '../oposicion/oposicion.entity';
import { Tema } from '../tema/tema.entity';
import { ParticipacionReto } from './participacion-reto.entity';

export enum TipoReto {
  DIARIO = 'diario',
  SEMANAL = 'semanal',
  USUARIO = 'usuario',
}

export enum EstadoReto {
  PENDIENTE = 'pendiente',
  ACTIVO = 'activo',
  COMPLETADO = 'completado',
  EXPIRADO = 'expirado',
}

@Entity('retos')
export class Reto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TipoReto })
  tipo: TipoReto;

  @Column({ type: 'enum', enum: EstadoReto, default: EstadoReto.ACTIVO })
  estado: EstadoReto;

  @Column({ default: 1 })
  nivelRequerido: number;

  @Column({ type: 'jsonb' })
  preguntas: any[];

  @Column({ nullable: true })
  fechaFin: Date;

  @Column({ type: 'text', nullable: true })
  mensaje: string;

  @CreateDateColumn()
  creadoEn: Date;

  @ManyToOne(() => Usuario, { nullable: true })
  creador: Usuario;

  @ManyToOne(() => Oposicion, (o) => o.retos, {
  nullable: true,
  onDelete: 'CASCADE',
    })
    oposicion: Oposicion;

  @ManyToOne(() => Tema, { nullable: true })
  tema: Tema;

  @OneToMany(() => ParticipacionReto, (p) => p.reto)
  participaciones: ParticipacionReto[];
}