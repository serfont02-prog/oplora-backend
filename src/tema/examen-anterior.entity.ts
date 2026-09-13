import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';

import { Convocatoria } from '../convocatoria/convocatoria.entity';
import { PreguntaTest } from '../test/pregunta-test.entity';

@Entity('examenes_anteriores')
export class ExamenAnterior {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  anyo: number;

  @Column({ nullable: true })
  mes: string;

  @Column({ default: 'test' })
  tipo: string; // test | practico | desarrollo | oral | supuesto

  @Column({ type: 'int', default: 1 })
  parte: number; // nº de ejercicio dentro de la convocatoria

  @Column()
  urlArchivo: string; // PDF del examen real

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  creadoEn: Date;

  @ManyToOne(() => Convocatoria, { onDelete: 'CASCADE' })
  convocatoria: Convocatoria;

  @OneToMany(() => PreguntaTest, (p) => p.examenAnterior)
  preguntas: PreguntaTest[];
}