import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique, Index } from 'typeorm';
import { Liga } from './liga.entity';
import { Usuario } from '../usuario/usuario.entity';
import { DIVISION_INICIAL } from './liga.constants';

/** Un jugador en una liga, con su división y sus avisos. */
@Entity('miembros_liga')
@Unique(['liga', 'usuario'])
@Index(['liga', 'division'])
export class MiembroLiga {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Liga, { onDelete: 'CASCADE', nullable: false })
  liga: Liga;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE', nullable: false })
  usuario: Usuario;

  // Sin descensos: solo sube a final de mes
  @Column({ type: 'int', default: DIVISION_INICIAL })
  division: number;

  @Column({ default: true })
  avisoLunes: boolean;

  @Column({ default: true })
  avisoViernes: boolean;

  @Column({ default: true })
  avisoDomingo: boolean;

  @CreateDateColumn()
  fechaAlta: Date;
}
