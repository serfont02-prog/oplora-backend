import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';

/**
 * ⭐ Pagos recibidos de Stripe. stripeId es único (sesión de pago o factura), así que si
 * Stripe reenvía el mismo aviso, el acceso no se alarga dos veces.
 */
@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => Usuario, { onDelete: 'SET NULL', nullable: true })
  usuario: Usuario | null;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  stripeId: string;

  /** 'unico' (pago por periodo, tarjeta o Bizum) o 'suscripcion' (mensual con renovación). */
  @Column({ type: 'varchar', length: 20 })
  tipo: string;

  @Column({ type: 'int', default: 0 })
  meses: number;

  @Column({ type: 'int', default: 0 })
  importeCentimos: number;

  @Column({ type: 'timestamptz', nullable: true })
  accesoHastaResultante: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  creadoEn: Date;
}
