import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Capitulo } from './capitulo.entity';
import { Articulo } from './articulo.entity';

@Entity('secciones')
export class Seccion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orden: number;

  @Column({ nullable: true })
  numero: string;

  @Column()
  nombre: string;

  @ManyToOne(() => Capitulo, (c) => c.secciones)
  capitulo: Capitulo;

  @OneToMany(() => Articulo, (a) => a.seccion)
  articulos: Articulo[];
}