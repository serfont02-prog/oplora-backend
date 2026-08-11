import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn } from 'typeorm';
import { Flashcard } from './flashcard.entity';
import { Usuario } from '../usuario/usuario.entity';

export enum EstadoFC {
  DOMINADA = 'dominada',
  DUDOSA = 'dudosa',
  NO_DOMINADA = 'no_dominada',
}

@Entity('repasos_fc')
export class RepasoFC {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: EstadoFC, default: EstadoFC.NO_DOMINADA })
  estado!: EstadoFC;

  @Column({ default: 0 })
  aciertos!: number;

  @Column({ default: 0 })
  fallos!: number;

  @Column({ default: 0 })
  fallosConsecutivos!: number;

  @Column({ type: 'float', default: 0 })
  tiempoMedioRespuesta!: number;

  @Column({ nullable: true })
  ultimaVista!: Date;

  @Column({ nullable: true })
  proximoRepaso!: Date;

  @Column({ type: 'float', default: 2.5 })
  factorFacilidad!: number;

  @Column({ default: 0 })
  intervalo!: number;

  @Column({ default: 0 })
  repeticiones!: number;

  @UpdateDateColumn()
  actualizadoEn!: Date;

  @ManyToOne(() => Flashcard)
  flashcard!: Flashcard;

  @ManyToOne(() => Usuario)
  usuario!: Usuario;
}