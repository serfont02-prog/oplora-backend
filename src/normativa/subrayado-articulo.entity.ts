import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Articulo } from './articulo.entity';
import { Usuario } from '../usuario/usuario.entity';

@Entity('subrayados_articulo')
export class SubrayadoArticulo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  inicio: number;

  @Column({ type: 'int' })
  fin: number;

  @Column({ type: 'varchar', default: 'amarillo' })
  color: string;

  @Column({ type: 'text' })
  textoSeleccionado: string;

  @CreateDateColumn()
  creadoEn: Date;

  @ManyToOne(() => Articulo)
  articulo: Articulo;

  @ManyToOne(() => Usuario)
  usuario: Usuario;
}