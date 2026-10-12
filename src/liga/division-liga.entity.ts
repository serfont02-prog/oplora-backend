import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { Liga } from './liga.entity';
import { ModoDivision, LIGA_POR_DEFECTO } from './liga.constants';

/** Configuración de cada división de una liga y su avance por el temario. */
@Entity('divisiones_liga')
@Unique(['liga', 'division'])
export class DivisionLiga {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Liga, { onDelete: 'CASCADE', nullable: false })
  liga: Liga;

  @Column({ type: 'int' })
  division: number; // 1 = Primera … 5 = Quinta

  @Column({ type: 'enum', enum: ModoDivision })
  modo: ModoDivision;

  @Column({ type: 'int', default: 0 })
  temasPorJornada: number;

  @Column({ type: 'int' })
  numPreguntas: number;

  @Column({ type: 'int', default: LIGA_POR_DEFECTO.segundosPorPregunta })
  segundosPorPregunta: number;

  // Primera: la primera jornada de cada mes es de un bloque en vez de todo el temario
  @Column({ default: false })
  bloqueMensual: boolean;

  // Avance por el temario (índice en la lista de temas ordenada por número)
  @Column({ type: 'int', default: 0 })
  cursorTema: number;

  // Avance por los bloques
  @Column({ type: 'int', default: 0 })
  cursorBloque: number;
}
