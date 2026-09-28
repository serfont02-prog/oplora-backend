import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { RetoPsicotecnico } from './reto-psicotecnico.entity';
import { Usuario } from '../usuario/usuario.entity';

// Espejo de ResultadoRetoFC. No se replica el campo `flashcard` (ManyToOne a
// una única Flashcard) que tiene ResultadoRetoFC: ese campo no participa en
// ninguna consulta de flashcard.service.ts (el detalle por pregunta ya vive
// en `respuestas`), así que aquí no se arrastra ese campo sin uso claro.
@Entity('resultados_reto_psicotecnico')
export class ResultadoRetoPsicotecnico {
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
  respuestas: { preguntaId: string; correcta: boolean; tiempoRespuesta: number }[];

  @CreateDateColumn()
  creadoEn: Date;

  @ManyToOne(() => RetoPsicotecnico, (r) => r.resultados)
  retoPsicotecnico: RetoPsicotecnico;

  @ManyToOne(() => Usuario)
  usuario: Usuario;
}
