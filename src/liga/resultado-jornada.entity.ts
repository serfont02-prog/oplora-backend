import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, Index } from 'typeorm';
import { JornadaLiga } from './jornada-liga.entity';
import { Usuario } from '../usuario/usuario.entity';

/** La partida de un jugador en una jornada (un solo intento). */
@Entity('resultados_jornada')
@Unique(['jornada', 'usuario'])
@Index(['jornada', 'nota'])
export class ResultadoJornada {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => JornadaLiga, { onDelete: 'CASCADE', nullable: false })
  jornada: JornadaLiga;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE', nullable: false })
  usuario: Usuario;

  // División en el momento de jugar
  @Column({ type: 'int' })
  division: number;

  // Índice elegido por pregunta (null = en blanco), en el orden servido
  @Column({ type: 'jsonb', default: () => "'[]'" })
  respuestas: (number | null)[];

  @Column({ type: 'int', default: 0 })
  aciertos: number;

  @Column({ type: 'int', default: 0 })
  fallos: number;

  @Column({ type: 'int', default: 0 })
  blancos: number;

  @Column({ type: 'decimal', precision: 7, scale: 3, nullable: true })
  nota: number | null;

  // Medidos por el servidor
  @Column({ type: 'timestamp' })
  iniciadoEn: Date;

  @Column({ type: 'timestamp', nullable: true })
  enviadoEn: Date | null;

  @Column({ type: 'int', nullable: true })
  tiempoMs: number | null;

  @Column({ type: 'int', nullable: true })
  posicion: number | null;

  @Column({ type: 'decimal', precision: 6, scale: 1, nullable: true })
  puntos: number | null;
}
