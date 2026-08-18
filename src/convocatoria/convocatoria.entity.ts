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

export enum TurnoEnum {
  LIBRE = 'libre',
  PROMOCION_INTERNA = 'promocion_interna',
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

  @Column({ type: 'enum', enum: TurnoEnum, nullable: true })
  turno: TurnoEnum;

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

  @Column({ type: 'jsonb', nullable: true })
  ejercicios: {
    numero: number;
    tipo: TipoEjercicio;
    numPreguntas?: number;
    tiempoMinutos?: number;
    descripcion?: string;
  }[];
  
  @Column({ default: true })
  permiteBlancos: boolean;

  @Column({ nullable: true })
  fraccionPenalizacion: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  notaMinimaAprobado: number;

  // ── Requisitos y fases (oposición pura o mixta) ──
  @Column({ type: 'text', nullable: true })
  requisitos: string;

  @Column({ type: 'jsonb', nullable: true })
  fasesAdicionales: {
    tipo: 'fisica' | 'psicotecnico' | 'entrevista' | 'medico' | 'meritos' | 'otro';
    nombre: string;
    descripcion?: string;
    criterios?: string[]; // ej: para méritos → ["Antigüedad", "Cursos oficiales", "Carnet A1/A2/B", "Idiomas"]
    puntuacionMax?: number;
    eliminatoria?: boolean;
    orden?: number;
  }[];

  // ── Concurso-oposición: ¿genera bolsa de empleo? ──
  @Column({ default: false })
  generaBolsaEmpleo: boolean;

  @Column({ type: 'text', nullable: true })
  bolsaEmpleoDescripcion: string;

  // ── Puestos múltiples dentro de la misma convocatoria ──
  @Column({ type: 'jsonb', nullable: true })
  puestos: {
    nombre: string;
    descripcion?: string;
    requisitosEspecificos?: string;
    plazas?: number;
  }[];

  // ── Temario agrupado por bloques ──
  @Column({ type: 'jsonb', nullable: true })
  bloquesTemario: {
    nombre: string;
    descripcion?: string;
  }[];

  // ── Plazas por colectivo ──
  @Column({ type: 'jsonb', nullable: true })
  plazasDesglose: {
    libres?: number;
    promocionInterna?: number;
    militares?: number;
    discapacidad?: number;
    otros?: number;
  };

  @Column({ type: 'text', nullable: true })
  formacionPosterior: string;

  @Column({ type: 'text', nullable: true })
  descripcionAdicional: string;

  @ManyToOne(() => Oposicion, (o) => o.convocatorias)
  oposicion: Oposicion;

  @OneToMany(() => DocumentoConvocatoria, (d) => d.convocatoria)
  documentos: DocumentoConvocatoria[];

  @OneToMany(() => Tema, (t) => t.convocatoria)
  temas: Tema[];
}