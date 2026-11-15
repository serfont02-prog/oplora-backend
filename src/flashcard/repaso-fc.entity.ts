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
// ⭐ Auditoría M9: repasos que tocan hoy de cada usuario
@Index(['usuario', 'proximoRepaso'])
// ⭐ Auditoría M5: índice único (usuario, tarjeta). Lo crea la migración después de limpiar los
// duplicados; con `synchronize: false` el arranque no lo crea (fallaría si quedan) ni lo borra.
@Index('UQ_repasos_fc_usuario_flashcard', { synchronize: false })
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

  // ⭐ Cuándo se vio la tarjeta por primera vez: sirve para contar las "nuevas de hoy" y avisar
  // si se empiezan demasiadas en un día. Los repasos anteriores a este cambio quedan en null.
  @Column({ type: 'timestamptz', nullable: true })
  primeraVez!: Date | null;

  // ⭐ synchronize=true: estas relaciones no son nullable (no tiene sentido un repaso sin
  // flashcard o sin usuario), así que al borrar el padre debe borrarse en cascada el repaso en
  // vez de dejar una FK apuntando a una fila inexistente.
  @ManyToOne(() => Flashcard, { onDelete: 'CASCADE' })
  flashcard!: Flashcard;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  usuario!: Usuario;
}