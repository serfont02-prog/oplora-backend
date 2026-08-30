import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { TemaNormativa } from './tema-normativa.entity';
import { PreguntaBanco } from './pregunta-banco.entity';
import { Convocatoria } from '../convocatoria/convocatoria.entity';
import { ManyToMany } from 'typeorm';
import { PreguntaTest } from '../test/pregunta-test.entity';

export enum TipoTema {
  CON_NORMATIVA = 'con_normativa',
  CONCEPTUAL = 'conceptual',
  MIXTO = 'mixto',
}

@Entity('temas')
export class Tema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  claveEstable: string;

  @Column()
  numero: number;

  @Column()
  titulo: string;

  @Column({ type: 'enum', enum: TipoTema, default: TipoTema.CON_NORMATIVA })
  tipo: TipoTema;

  @Column({ type: 'text', nullable: true })
  contexto: string;

  @Column({ default: true })
  activo: boolean;

  @Column({ nullable: true })
  bloque: string; // nombre del bloque, debe coincidir con uno de los definidos en Convocatoria.bloquesTemario

  @CreateDateColumn()
  creadoEn: Date;

  @OneToMany(() => TemaNormativa, (tn) => tn.tema)
  normativas: TemaNormativa[];

  @OneToMany(() => PreguntaBanco, (p) => p.tema)
  preguntas: PreguntaBanco[];

  @ManyToOne(() => Convocatoria, { nullable: true })
  convocatoria: Convocatoria;

  @ManyToMany(() => PreguntaTest, (p) => p.temas)
  preguntasTest: PreguntaTest[];
}