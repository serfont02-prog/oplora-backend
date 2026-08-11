import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Tema } from './tema.entity';
import { Articulo } from '../normativa/articulo.entity';

export enum FuentePregunta {
  EXAMEN_ANTERIOR = 'examen_anterior',
  IA_GENERADA = 'ia_generada',
  ADMIN_MANUAL = 'admin_manual',
  USUARIO_APUNTE = 'usuario_apunte',
}

@Entity('preguntas_banco')
export class PreguntaBanco {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  enunciado: string;

  @Column({ type: 'jsonb' })
  opciones: string[];

  @Column()
  correcta: number;

  @Column({ type: 'text', nullable: true })
  explicacion: string;

  @Column({ type: 'enum', enum: FuentePregunta, default: FuentePregunta.IA_GENERADA })
  fuente: FuentePregunta;

  @Column({ default: false })
  validada: boolean;

  @Column({ default: 0 })
  vecesUsada: number;

  @Column({ type: 'float', default: 0 })
  tasaAcierto: number;

  @CreateDateColumn()
  creadoEn: Date;

  @ManyToOne(() => Tema, (t) => t.preguntas, { nullable: true })
  tema: Tema;

  @ManyToOne(() => Articulo, { nullable: true })
  articulo: Articulo;
}