import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Oposicion } from '../oposicion/oposicion.entity';
import { PsicotecnicoTipo, PsicotecnicoDificultad } from './psicotecnico-tipo.enum';

// Pregunta del banco de psicotécnicos. Es independiente del banco de PreguntaTest
// (temario/normativa) a propósito: no se mezclan estadísticas ni generación.
// `oposicion` nullable: si es null, la pregunta es de banco general reutilizable
// entre oposiciones; si tiene valor, es específica de esa oposición.
@Entity('preguntas_psicotecnicas')
export class PreguntaPsicotecnica {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: PsicotecnicoTipo })
  tipo: PsicotecnicoTipo;

  @Column({ nullable: true })
  subtipo: string;

  @Column({ type: 'enum', enum: PsicotecnicoDificultad, default: PsicotecnicoDificultad.MEDIO })
  dificultad: PsicotecnicoDificultad;

  @Column({ type: 'text' })
  enunciado: string;

  // URL de Supabase Storage para preguntas visuales (espaciales, matrices, atención...)
  @Column({ nullable: true })
  imagenUrl: string;

  @Column({ type: 'jsonb' })
  opciones: string[];

  @Column()
  correcta: number;

  @Column({ type: 'text', nullable: true })
  explicacion: string;

  @Column({ nullable: true })
  tiempoRecomendadoSegundos: number;

  @Column({ type: 'jsonb', nullable: true })
  etiquetas: string[];

  @Column({ default: true })
  activa: boolean;

  @Column({ nullable: true })
  origen: string; // 'oplora' | 'convocatoria' | 'ia'

  @Column({ default: 0 })
  aciertos: number;

  @Column({ default: 0 })
  fallos: number;

  @Column({ default: 0 })
  vecesUsada: number;

  @CreateDateColumn()
  creadoEn: Date;

  @ManyToOne(() => Oposicion, { nullable: true, onDelete: 'CASCADE' })
  oposicion: Oposicion | null;
}
