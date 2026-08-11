import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { RetoFC } from './reto-fc.entity';
import { Usuario } from '../usuario/usuario.entity';
import { Flashcard } from './flashcard.entity';

@Entity('resultados_reto_fc')
export class ResultadoRetoFC {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  completado: boolean;

  @Column({ default: 0 })
  aciertos: number;

  @Column({ default: 0 })
  fallos: number;

  @Column({ nullable: true })
  tiempoTotal: number;

  @Column({ nullable: true })
  posicion: number;

  @Column({ type: 'jsonb', nullable: true })
  respuestas: { flashcardId: string; correcta: boolean; tiempoRespuesta: number }[];

  @CreateDateColumn()
  creadoEn: Date;

  @ManyToOne(() => RetoFC, (r) => r.resultados)
  retoFc: RetoFC;

  @ManyToOne(() => Usuario)
  usuario: Usuario;

  @ManyToOne(() => Flashcard, (f) => f.repasos)
  flashcard: Flashcard;
}