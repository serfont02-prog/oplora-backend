import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { Oposicion } from '../oposicion/oposicion.entity';
import { Tema } from '../tema/tema.entity';
import { ResultadoRetoFC } from './resultado-reto-fc.entity';

export enum TipoRetoFC {
  DIARIO = 'diario',
  SEMANAL = 'semanal',
  DUELO = 'duelo',
  PERSONAL = 'personal',
}

export enum EstadoRetoFC {
  PENDIENTE = 'pendiente',
  ACTIVO = 'activo',
  COMPLETADO = 'completado',
  EXPIRADO = 'expirado',
}

@Entity('retos_fc')
export class RetoFC {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TipoRetoFC })
  tipo: TipoRetoFC;

  @Column({ type: 'enum', enum: EstadoRetoFC, default: EstadoRetoFC.ACTIVO })
  estado: EstadoRetoFC;

  @Column({ type: 'jsonb' })
  flashcards: any[];

  @Column({ nullable: true })
  tiempoLimite: number;

  @Column({ nullable: true })
  fechaFin: Date;

  @CreateDateColumn()
  creadoEn: Date;

  @ManyToOne(() => Usuario, { nullable: true })
  retador: Usuario;

  @ManyToOne(() => Usuario, { nullable: true })
  retado: Usuario;

  @ManyToOne(() => Oposicion, { nullable: true })
  oposicion: Oposicion;

  @ManyToOne(() => Tema, { nullable: true })
  tema: Tema;

  @OneToMany(() => ResultadoRetoFC, (r) => r.retoFc)
  resultados: ResultadoRetoFC[];
}