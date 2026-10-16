import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { Oposicion } from '../oposicion/oposicion.entity';

/**
 * Invitaciones por email (a OPLORA, a una oposición o a una convocatoria). Se guardan para
 * limitar envíos: como mucho 10 al día por usuario y una cada 7 días al mismo destinatario.
 */
@Entity('invitaciones')
export class Invitacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  emailDestino: string;

  // 'app' (no tiene cuenta) | 'oposicion' (tiene cuenta, otra oposición) | 'convocatoria' (misma oposición, otra convocatoria)
  @Column({ default: 'app' })
  tipo: string;

  // 'reto' | 'amigo'
  @Column({ default: 'amigo' })
  motivo: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  remitente: Usuario;

  @ManyToOne(() => Oposicion, { nullable: true, onDelete: 'SET NULL' })
  oposicion: Oposicion | null;

  @CreateDateColumn()
  creadoEn: Date;
}
