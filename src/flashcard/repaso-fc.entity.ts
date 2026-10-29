import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn, Index } from 'typeorm';
import { Flashcard } from './flashcard.entity';
import { Usuario } from '../usuario/usuario.entity';

export enum EstadoFC {
  DOMINADA = 'dominada',
  DUDOSA = 'dudosa',
  NO_DOMINADA = 'no_dominada',
}

// ⭐ Índices para las consultas de cada usuario (antes casi no había)
@Index(['usuario', 'flashcard'])
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

  // ⭐ Los puntos por dominar la tarjeta se dan una sola vez (antes, dominar → olvidar →
  // dominar otra vez daba puntos sin fin).
  @Column({ default: false })
  puntosDados!: boolean;

  @UpdateDateColumn()
  actualizadoEn!: Date;

  // ⭐ synchronize=true: estas relaciones no son nullable (no tiene sentido un repaso sin
  // flashcard o sin usuario), así que al borrar el padre debe borrarse en cascada el repaso en
  // vez de dejar una FK apuntando a una fila inexistente.
  @ManyToOne(() => Flashcard, { onDelete: 'CASCADE' })
  flashcard!: Flashcard;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  usuario!: Usuario;
}