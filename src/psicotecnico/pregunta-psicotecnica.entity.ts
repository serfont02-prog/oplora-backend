import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, CreateDateColumn } from 'typeorm';
import { Oposicion } from '../oposicion/oposicion.entity';
import { Convocatoria } from '../convocatoria/convocatoria.entity';
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

  // Si está vacío, la pregunta aplica a TODAS las convocatorias de la oposición
  // (comportamiento por defecto). Si tiene convocatorias, solo sale en esas —
  // igual que PreguntaTest se vincula a Tema (y este a Convocatoria): así una
  // convocatoria nueva puede tener preguntas propias sin afectar a las anteriores,
  // y al copiar una convocatoria se copian los ENLACES, no las preguntas.
  @ManyToMany(() => Convocatoria)
  @JoinTable({
    name: 'preguntas_psicotecnicas_convocatorias',
    joinColumn: { name: 'preguntaId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'convocatoriaId', referencedColumnName: 'id' },
  })
  convocatorias: Convocatoria[];
}
