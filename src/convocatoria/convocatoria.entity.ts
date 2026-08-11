import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Oposicion } from '../oposicion/oposicion.entity';
import { DocumentoConvocatoria } from './documento-convocatoria.entity';
import { Tema } from '../tema/tema.entity';


export enum EstadoConvocatoria {
  ACTIVA = 'activa',
  CERRADA = 'cerrada',
  BORRADOR = 'borrador',
}

export enum TipoEjercicio {
  TEST = 'test',
  DESARROLLO = 'desarrollo',
  ORAL = 'oral',
  PRACTICO = 'practico',
  MIXTO = 'mixto',
}

@Entity('convocatorias')
export class Convocatoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  anyo: number;

  @Column({ nullable: true })
  plazas: number;

  @Column({ type: 'enum', enum: EstadoConvocatoria, default: EstadoConvocatoria.BORRADOR })
  estado: EstadoConvocatoria;

  @Column({ nullable: true })
  fechaExamen: Date;

  @Column({ nullable: true })
  urlInap: string;

  @Column({ type: 'text', nullable: true })
  diferenciasAnterior: string;

  @Column({ nullable: true })
  referenciaBoe: string;

  @Column({ nullable: true })
  plazoInscripcionInicio: Date;

  @Column({ nullable: true })
  plazoInscripcionFin: Date;

  @CreateDateColumn()
  creadoEn: Date;

  @Column({ nullable: true })
numEjercicios: number;

  @Column({ type: 'enum', enum: TipoEjercicio, nullable: true })
  tipoEjercicio: TipoEjercicio;

  @Column({ nullable: true })
  numPreguntas: number;

  @Column({ nullable: true })
  tiempoMinutos: number;

  @Column({ default: true })
  permiteBlancos: boolean;

  @Column({ default: false })
  penalizacion: boolean;

  @Column({ nullable: true })
  fraccionPenalizacion: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  notaMinimaAprobado: number;

  @ManyToOne(() => Oposicion, (o) => o.convocatorias)
  oposicion: Oposicion;

  @OneToMany(() => DocumentoConvocatoria, (d) => d.convocatoria)
  documentos: DocumentoConvocatoria[];

  @OneToMany(() => Tema, (t) => t.convocatoria)
  temas: Tema[];
}