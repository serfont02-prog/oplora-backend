import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, CreateDateColumn } from 'typeorm';
import { Liga } from './liga.entity';
import { Usuario } from '../usuario/usuario.entity';

/** Tabla final de un mes por división (fase B: ascensos y campeones). */
@Entity('cierres_mes_liga')
@Unique(['liga', 'mes', 'usuario'])
export class CierreMesLiga {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Liga, { onDelete: 'CASCADE', nullable: false })
  liga: Liga;

  @Column({ type: 'varchar', length: 7 })
  mes: string;

  @Column({ type: 'int' })
  division: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE', nullable: false })
  usuario: Usuario;

  @Column({ type: 'decimal', precision: 8, scale: 1 })
  puntos: number;

  @Column({ type: 'int' })
  posicion: number;

  @Column({ type: 'int', default: 0 })
  jornadasJugadas: number;

  @Column({ type: 'int', default: 0 })
  jornadasGanadas: number;

  @Column({ default: false })
  ascendio: boolean;

  @Column({ default: false })
  campeon: boolean;

  @CreateDateColumn()
  creadoEn: Date;
}
