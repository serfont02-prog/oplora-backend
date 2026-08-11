import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Tema } from './tema.entity';
import { Articulo } from '../normativa/articulo.entity';
import { Capitulo } from '../normativa/capitulo.entity';
import { Titulo } from '../normativa/titulo.entity';
import { VersionLey } from '../ley/version-ley.entity';

export enum NivelNormativa {
  ARTICULO = 'articulo',
  CAPITULO = 'capitulo',
  TITULO = 'titulo',
  VERSION_LEY = 'version_ley',
}

@Entity('temas_normativa')
export class TemaNormativa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: NivelNormativa })
  nivel: NivelNormativa;

  @ManyToOne(() => Tema, (t) => t.normativas)
  tema: Tema;

  @ManyToOne(() => Articulo, { nullable: true })
  articulo: Articulo;

  @ManyToOne(() => Capitulo, { nullable: true })
  capitulo: Capitulo;

  @ManyToOne(() => Titulo, { nullable: true })
  titulo: Titulo;

  @ManyToOne(() => VersionLey, { nullable: true })
  versionLey: VersionLey;
}