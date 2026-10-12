import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique, Index } from 'typeorm';
import { Liga } from './liga.entity';
import { TipoJornada, EstadoJornada } from './liga.constants';

export interface PreguntaJornada {
  id: string;
  origen: 'test' | 'psicotecnico';
  enunciado: string;
  opciones: string[];
  correcta: number; // índice en `opciones` TAL COMO se sirven
  explicacion?: string | null;
  imagenUrl?: string | null;
  temaId?: string | null;
}

/** Una jornada de fin de semana para una división. */
@Entity('jornadas_liga')
@Unique(['liga', 'division', 'fechaApertura'])
@Index(['estado', 'fechaApertura'])
export class JornadaLiga {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Liga, { onDelete: 'CASCADE', nullable: false })
  liga: Liga;

  @Column({ type: 'int' })
  division: number;

  // Mes al que cuenta (el del sábado), 'AAAA-MM'
  @Column({ type: 'varchar', length: 7 })
  mes: string;

  @Column({ type: 'enum', enum: TipoJornada })
  tipo: TipoJornada;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  temaIds: string[];

  @Column({ type: 'varchar', nullable: true })
  bloque: string | null;

  // Texto para el usuario: "Temas 3 y 4", "Bloque Jurídico", "Todo el temario"…
  @Column({ type: 'varchar' })
  descripcion: string;

  @Column({ type: 'int' })
  numPreguntas: number;

  @Column({ type: 'int' })
  segundosPorPregunta: number;

  // Con solución: NUNCA se envía tal cual al navegador antes del cierre
  @Column({ type: 'jsonb', nullable: true })
  preguntas: PreguntaJornada[] | null;

  @Column({ type: 'timestamp' })
  fechaApertura: Date;

  @Column({ type: 'timestamp' })
  fechaUltimaLlamada: Date;

  @Column({ type: 'timestamp' })
  fechaCierre: Date;

  @Column({ type: 'enum', enum: EstadoJornada, default: EstadoJornada.PROGRAMADA })
  estado: EstadoJornada;

  @Column({ type: 'varchar', nullable: true })
  motivoCancelacion: string | null;

  @Column({ default: false })
  fijadaPorAdmin: boolean;

  @Column({ default: false })
  avisoLunesEnviado: boolean;

  @Column({ default: false })
  avisoAperturaEnviado: boolean;

  @Column({ default: false })
  avisoUltimaLlamadaEnviado: boolean;

  @CreateDateColumn()
  creadoEn: Date;
}
