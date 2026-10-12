import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { Liga } from './liga.entity';
import { Usuario } from '../usuario/usuario.entity';
import { TipoCopa } from './liga.constants';

/** Palmarés: una copa por título (mensual por división o de temporada). */
@Entity('copas_liga')
@Index(['usuario'])
export class CopaLiga {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE', nullable: false })
  usuario: Usuario;

  @ManyToOne(() => Liga, { onDelete: 'CASCADE', nullable: false })
  liga: Liga;

  @Column({ type: 'varchar', length: 7, nullable: true })
  mes: string | null;

  @Column({ type: 'int' })
  division: number;

  @Column({ type: 'enum', enum: TipoCopa })
  tipo: TipoCopa;

  @CreateDateColumn()
  creadoEn: Date;
}
