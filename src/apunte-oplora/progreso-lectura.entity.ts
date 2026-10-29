import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn, Index } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { ApunteOplora } from './apunte-oplora.entity';

// ⭐ Índices para las consultas de cada usuario (antes casi no había)
@Index(['usuario', 'apunte'])
@Entity('progreso_lectura')
export class ProgresoLectura {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'int', default: 0 })
  porcentaje!: number;

  @UpdateDateColumn()
  actualizadoEn!: Date;

  @ManyToOne(() => Usuario)
  usuario!: Usuario;

  @ManyToOne(() => ApunteOplora)
  apunte!: ApunteOplora;
}