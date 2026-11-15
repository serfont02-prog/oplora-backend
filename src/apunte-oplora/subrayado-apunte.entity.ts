// subrayado-apunte.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { ApunteOplora } from './apunte-oplora.entity';

// ⭐ Auditoría M9: índices para las consultas de cada usuario (Postgres no los crea solo por las claves foráneas)
@Index(['usuario', 'apunte'])
@Entity('subrayados_apunte')
export class SubrayadoApunte {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'int' })
  inicio!: number;

  @Column({ type: 'int' })
  fin!: number;

  @Column({ type: 'text' })
  textoSeleccionado!: string;

  @Column({ default: 'amarillo' })
  color!: string;

  @CreateDateColumn()
  creadoEn!: Date;

  @ManyToOne(() => Usuario)
  usuario!: Usuario;

  @ManyToOne(() => ApunteOplora)
  apunte!: ApunteOplora;
}