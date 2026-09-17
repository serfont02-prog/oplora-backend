import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { Oposicion } from '../oposicion/oposicion.entity';
import { PsicotecnicoTipo, PsicotecnicoDificultad } from './psicotecnico-tipo.enum';

// Métricas de entrenamiento de psicotécnicos, separadas de ResultadoTest a propósito
// para no mezclar estadísticas de temario/normativa con las de psicotécnicos.
@Entity('resultados_psicotecnicos')
export class ResultadoPsicotecnico {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: PsicotecnicoTipo })
  tipo: PsicotecnicoTipo;

  @Column({ nullable: true })
  subtipo: string;

  @Column({ type: 'enum', enum: PsicotecnicoDificultad, nullable: true })
  dificultad: PsicotecnicoDificultad;

  @Column()
  totalPreguntas: number;

  @Column()
  correctas: number;

  @Column({ type: 'float' })
  porcentaje: number;

  @Column({ default: 0 })
  tiempoSegundos: number;

  @Column({ type: 'jsonb', nullable: true })
  detallePreguntas: {
    preguntaId: string;
    correcta: boolean;
    tiempoMs?: number;
  }[];

  @CreateDateColumn()
  creadoEn: Date;

  @ManyToOne(() => Usuario)
  usuario: Usuario;

  @ManyToOne(() => Oposicion, { nullable: true })
  oposicion: Oposicion | null;
}
