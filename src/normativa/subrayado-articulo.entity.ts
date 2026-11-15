import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { Articulo } from './articulo.entity';
import { Usuario } from '../usuario/usuario.entity';

// ⭐ Auditoría M9: índices para las consultas de cada usuario (Postgres no los crea solo por las claves foráneas)
@Index(['usuario', 'articulo'])
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