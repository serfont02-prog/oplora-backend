import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Titulo } from './titulo.entity';
import { Articulo } from './articulo.entity';
import { Seccion } from './seccion.entity';

@Entity('capitulos')
export class Capitulo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orden: number;

  @Column({ nullable: true })
  numero: string;

  @Column()
  nombre: string;

  @ManyToOne(() => Titulo, (t) => t.capitulos)
  tituloRef: Titulo;

  @OneToMany(() => Articulo, (a) => a.capitulo)
  articulos: Articulo[];

  @OneToMany(() => Seccion, (s) => s.capitulo)
  secciones: Seccion[];
}