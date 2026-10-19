import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';

/**
 * ⭐ Reto al azar: cada vez que alguien sortea un rival se guarda aquí.
 * Sirve para limitar cuántos retos al azar recibe una persona al día (máx. 3), cuántos sorteos
 * hace cada uno y para no repetir el mismo rival en el día.
 */
@Entity('sorteos_reto')
@Index('idx_sorteo_retado_fecha', ['retado', 'creadoEn'])
@Index('idx_sorteo_retador_fecha', ['retador', 'creadoEn'])
export class SorteoReto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  retador: Usuario;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  retado: Usuario;

  @CreateDateColumn()
  creadoEn: Date;
}
