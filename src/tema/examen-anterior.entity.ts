import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Oposicion } from '../oposicion/oposicion.entity';
import { Convocatoria } from '../convocatoria/convocatoria.entity';

export enum TipoExamen {
  TEST = 'test',
  PRACTICO = 'practico',
  DESARROLLO = 'desarrollo',
  ORAL = 'oral',
  SUPUESTO = 'supuesto',
}

@Entity('examenes_anteriores')
export class ExamenAnterior {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  anyo: number;

  @Column({ nullable: true })
  parte: number; // 1, 2, 3...

  @Column({ nullable: true })
  nombre: string;

  @Column({ type: 'enum', enum: TipoExamen, default: TipoExamen.TEST })
  tipo: TipoExamen;

  @Column({ nullable: true })
  numPreguntas: number;

  @Column({ nullable: true })
  urlPdf: string;

  @Column({ type: 'text', nullable: true })
  textoExtraido: string;

  @Column({ default: false })
  procesado: boolean;

  @Column({ nullable: true })
  totalPreguntas: number;

  @Column({ nullable: true })
  mes: string;

  @CreateDateColumn()
  creadoEn: Date;

  @ManyToOne(() => Oposicion, { nullable: true })
  oposicion: Oposicion;

  @ManyToOne(() => Convocatoria, { nullable: true })
  convocatoria: Convocatoria;
}