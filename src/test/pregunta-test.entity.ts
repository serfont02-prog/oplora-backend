import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
  JoinTable,
  CreateDateColumn,
} from 'typeorm';

import { Tema } from '../tema/tema.entity';
import { Articulo } from '../normativa/articulo.entity';
import { ExamenAnterior } from '../tema/examen-anterior.entity';

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
     ⭐ Estado de la pregunta (sobre todo, preguntas de exámenes oficiales)
     - vigente: sale en tests (si tiene tema o artículo) y en su simulacro.
     - fuera_temario: solo en el simulacro de su examen (ya no entra en el temario).
     - desactualizada: solo en el simulacro, con la respuesta oficial de entonces
       y el aviso de notaActualizacion (la normativa ha cambiado).
     - anulada: anulada por el tribunal; se muestra en el simulacro pero no puntúa.
  ========================================================= */
  @Column({ default: 'vigente' })
  estado: string;

  @Column({ type: 'text', nullable: true })
  notaActualizacion: string | null;

  // Posición dentro del examen oficial (1, 2, 3…). Las preguntas sueltas lo dejan vacío.
  @Column({ type: 'int', nullable: true })
  ordenExamen: number | null;

  // Si es la copia actualizada de una pregunta desactualizada, id de la original.
  @Column({ type: 'uuid', nullable: true })
  actualizadaDesdeId: string | null;

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

  @ManyToOne(() => ExamenAnterior, (e) => e.preguntas, { nullable: true })
  examenAnterior: ExamenAnterior;
}