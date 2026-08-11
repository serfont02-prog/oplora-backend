import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Tema } from '../tema/tema.entity';
import { Oposicion } from '../oposicion/oposicion.entity';

@Entity('apuntes_oplora')
export class ApunteOplora {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  titulo!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string | null;

  @Column()
  urlArchivo!: string;

  @Column({ default: 'pdf' })
  tipo!: string;

  @Column({ default: 0 })
  orden!: number;
  
  @Column({ type: 'jsonb', nullable: true })
  contenidoEstructurado!: any | null;


  @Column({ type: 'text', nullable: true })
  textoCompleto!: string | null;

  @Column({ default: true })
  activo!: boolean;

  @Column({ nullable: true })
  versionLeyId!: string;

  @Column({ type: 'int', nullable: true })
  paginas?: number | null;

  @Column({ type: 'int', nullable: true })
  tamanoBytes?: number | null;

  @Column({ default: 1 })
  versionParser!: number;

  @CreateDateColumn()
  creadoEn!: Date;

  @ManyToOne(() => Tema, { nullable: true })
  tema!: Tema;

  @ManyToOne(() => Oposicion, { nullable: true })
  oposicion!: Oposicion;
}