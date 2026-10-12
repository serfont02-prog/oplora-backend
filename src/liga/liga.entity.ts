import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { Convocatoria } from '../convocatoria/convocatoria.entity';
import { EstadoLiga, LIGA_POR_DEFECTO } from './liga.constants';

/** Una Liga Oplora por convocatoria, con sus parámetros (editables desde admin). */
@Entity('ligas')
@Unique(['convocatoria'])
export class Liga {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Convocatoria, { onDelete: 'CASCADE', nullable: false })
  convocatoria: Convocatoria;

  @Column({ type: 'enum', enum: EstadoLiga, default: EstadoLiga.ACTIVA })
  estado: EstadoLiga;

  @Column({ type: 'int', default: LIGA_POR_DEFECTO.porcentajeAscenso })
  porcentajeAscenso: number;

  @Column({ type: 'int', default: LIGA_POR_DEFECTO.bonusParticipacion })
  bonusParticipacion: number;

  // Horas en hora de Madrid, formato 'HH:mm'
  @Column({ type: 'varchar', length: 5, default: LIGA_POR_DEFECTO.horaAviso })
  horaAviso: string; // lunes

  @Column({ type: 'varchar', length: 5, default: LIGA_POR_DEFECTO.horaApertura })
  horaApertura: string; // viernes

  @Column({ type: 'varchar', length: 5, default: LIGA_POR_DEFECTO.horaUltimaLlamada })
  horaUltimaLlamada: string; // domingo

  @Column({ type: 'varchar', length: 5, default: LIGA_POR_DEFECTO.horaCierre })
  horaCierre: string; // domingo

  // Último mes cerrado (clasificación mensual, ascensos y copas) — fase B
  @Column({ type: 'varchar', length: 7, nullable: true })
  ultimoMesCerrado: string | null;

  @CreateDateColumn()
  creadoEn: Date;
}
