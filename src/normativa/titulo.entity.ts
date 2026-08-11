import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { VersionLey } from '../ley/version-ley.entity';
import { Capitulo } from './capitulo.entity';
import { Libro } from './libro.entity';

@Entity('titulos')
export class Titulo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orden: number;

  @Column({ nullable: true })
  numero: string;

  @Column()
  nombre: string;

  @ManyToOne(() => VersionLey, (v) => v.titulos, { nullable: true })
  versionLey: VersionLey;

  @ManyToOne(() => Libro, (l) => l.titulos, { nullable: true })
  libro: Libro;

  @OneToMany(() => Capitulo, (c) => c.tituloRef)
  capitulos: Capitulo[];
}