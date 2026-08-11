import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { VersionLey } from '../ley/version-ley.entity';
import { Titulo } from './titulo.entity';

@Entity('libros')
export class Libro {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orden: number;

  @Column({ nullable: true })
  numero: string;

  @Column()
  nombre: string;

  @ManyToOne(() => VersionLey, (v) => v.libros)
  versionLey: VersionLey;

  @OneToMany(() => Titulo, (t) => t.libro)
  titulos: Titulo[];
}