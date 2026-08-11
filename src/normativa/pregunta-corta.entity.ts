import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Articulo } from './articulo.entity';
import { Tema } from '../tema/tema.entity';

@Entity('preguntas_cortas')
export class PreguntaCorta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  pregunta: string;

  @Column({ type: 'text' })
  respuesta: string;

  @Column({ default: true })
  activa: boolean;

  @CreateDateColumn()
  creadoEn: Date;

  @ManyToOne(() => Articulo, { nullable: true })
  articulo: Articulo;

  @ManyToOne(() => Tema, { nullable: true })
  tema: Tema;
}