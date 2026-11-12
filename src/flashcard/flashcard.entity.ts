import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToMany } from 'typeorm';
import { Articulo } from '../normativa/articulo.entity';
import { Tema } from '../tema/tema.entity';
import { Oposicion } from '../oposicion/oposicion.entity';
import { Usuario } from '../usuario/usuario.entity';
import { RepasoFC } from './repaso-fc.entity';

export enum TipoFlashcard {
  VF = 'vf',
  HUECO = 'hueco',
  TRAMPA = 'trampa',
  ARTICULO = 'articulo',
  SUPUESTO = 'supuesto',       // caso práctico: pensar → ver solución → autoevaluar
  COMPARATIVA = 'comparativa', // dos conceptos con sus diferencias (ver "estructura")
}

// ⭐ Estado editorial. En el entrenamiento solo se muestran las VALIDADAS.
export enum EstadoFlashcard {
  BORRADOR = 'borrador',
  PENDIENTE_REVISION = 'pendiente_revision',
  VALIDADA = 'validada',
  OBSOLETA = 'obsoleta',
}

/** Contenido de una comparativa: se muestra como tabla (aspecto | A | B). */
export interface EstructuraComparativa {
  conceptoA: string;
  conceptoB: string;
  diferencias: { aspecto: string; a: string; b: string }[];
}

export enum NivelFlashcard {
  BASICO = 'basico',
  MEDIO = 'medio',
  ALTO = 'alto',
}

@Entity('flashcards')
export class Flashcard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TipoFlashcard })
  tipo: TipoFlashcard;

  @Column({ type: 'enum', enum: NivelFlashcard, default: NivelFlashcard.BASICO })
  nivel: NivelFlashcard;

  @Column({ type: 'text' })
  pregunta: string;

  @Column({ type: 'text' })
  respuesta: string;

  @Column({ type: 'text', nullable: true })
  explicacion: string;

  @Column({ default: false })
  esParaDuelo: boolean;

  @Column({ default: true })
  activa: boolean;

  @Column({ type: 'varchar', default: 'admin' })
  creadaPor: string;

  @CreateDateColumn()
  creadoEn: Date;

  // ─── Estándar de contenido (nov 2026). Todos opcionales; las filas anteriores quedan validadas.
  @Column({ type: 'enum', enum: EstadoFlashcard, default: EstadoFlashcard.VALIDADA })
  estado: EstadoFlashcard;

  @Column({ type: 'text', nullable: true })
  bloque: string | null;

  /** Cita legible, p. ej. "art. 22.1 CC". */
  @Column({ type: 'text', nullable: true })
  referencia: string | null;

  /** Siglas de la norma y número de artículo tal como vinieron en la importación: permiten volver
   *  a enlazar el artículo (p. ej. tras reimportar una ley, que deja articuloId a NULL). */
  @Column({ type: 'varchar', length: 40, nullable: true })
  normaSiglas: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  articuloNumero: string | null;

  @Column({ type: 'text', nullable: true })
  apartado: string | null;

  /** Fecha de la versión de la norma con la que se redactó la tarjeta. */
  @Column({ type: 'date', nullable: true })
  fechaReferencia: string | null;

  /** Solo comparativas: { conceptoA, conceptoB, diferencias: [{ aspecto, a, b }] } */
  @Column({ type: 'jsonb', nullable: true })
  estructura: EstructuraComparativa | null;

  @Column({ type: 'date', nullable: true })
  fechaRevision: string | null;

  @Column({ type: 'text', nullable: true })
  fuenteValidacion: string | null;

  @Column({ type: 'text', nullable: true })
  motivoObsolescencia: string | null;

  // ⭐ synchronize=true en TypeORM: sin onDelete, borrar un Articulo/Tema/Oposicion/Usuario
  // referenciado dejaba la FK huérfana bloqueando el borrado (o fallando) en la BD. Al ser
  // relaciones nullable, SET NULL es lo correcto: la flashcard sobrevive sin el vínculo.
  @ManyToOne(() => Articulo, { nullable: true, onDelete: 'SET NULL' })
  articulo: Articulo;

  @ManyToOne(() => Tema, { nullable: true, onDelete: 'SET NULL' })
  tema: Tema;

  @ManyToOne(() => Oposicion, { nullable: true, onDelete: 'SET NULL' })
  oposicion: Oposicion;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  usuario: Usuario;

  @OneToMany(() => RepasoFC, (r) => r.flashcard)
  repasos: RepasoFC[];
}