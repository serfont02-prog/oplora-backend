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