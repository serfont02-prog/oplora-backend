// subrayado-apunte.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { ApunteOplora } from './apunte-oplora.entity';

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