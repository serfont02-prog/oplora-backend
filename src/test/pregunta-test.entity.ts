import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
} from 'typeorm';

import { Tema } from '../tema/tema.entity';
import { Articulo } from '../normativa/articulo.entity';

@Entity('preguntas_test')
export class PreguntaTest {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'test' })
  tipo: string;

  @Column({ type: 'text' })
  enunciado: string;

  @Column({ type: 'jsonb' })
  opciones: string[];

  @Column()
  correcta: number;

  @Column({ type: 'text', nullable: true })
  explicacion: string;

  @Column({ default: 1 })
  dificultad: number;

  @Column({ nullable: true })
  fuente: string;

  @Column({ default: true })
  activa: boolean;

  @CreateDateColumn()
  creadoEn: Date;

  @Column({ nullable: true })
  anyo: number;

  @Column({ default: 'generada' })
  origen: string; // 'generada' | 'convocatoria' | 'ia'

  /* =========================================================
     Para estadísticas
  ========================================================= */
  @Column({ default: 0 })
  aciertos: number;

  @Column({ default: 0 })
  fallos: number;

  @Column({ default: 0 })
  vecesUsada: number;

  /* =========================================================
     RELACIONES
  ========================================================= */

    @ManyToMany(() => Tema)
    @JoinTable()
    temas: Tema[];

  @ManyToMany(() => Articulo)
  @JoinTable()
  articulos: Articulo[];
}