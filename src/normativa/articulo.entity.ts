import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Capitulo } from './capitulo.entity';
import { Seccion } from './seccion.entity';
import { Titulo } from './titulo.entity';
import { ManyToMany } from 'typeorm';
import { PreguntaTest } from '../test/pregunta-test.entity';

@Entity('articulos')
export class Articulo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orden: number;

  @Column({ nullable: true })
  numero: string;

  @Column({ nullable: true })
  titulo: string;

  @Column({ type: 'text' })
  contenido: string;

  @Column({ default: true })
  vigente: boolean;

  @Column({ default: 1 })
  pesoExamen: number;

  @Column({ type: 'text', nullable: true })
  resumen: string;

  @Column({ type: 'text', nullable: true })
  esquema: string;

  @Column({ type: 'text', nullable: true })
  ejemplo: string;

  @ManyToOne(() => Capitulo, { nullable: true })
  capitulo: Capitulo;

  @ManyToOne(() => Seccion, (s) => s.articulos, { nullable: true })
  seccion: Seccion;

  @ManyToOne(() => Titulo, { nullable: true })
  tituloRef: Titulo;

  @ManyToMany(() => PreguntaTest, (p) => p.articulos)
  preguntasTest: PreguntaTest[];
}