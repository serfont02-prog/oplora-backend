import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { VersionLey } from '../ley/version-ley.entity';

export enum CategoriaDisposicion {
  ADICIONAL = 'adicional',
  TRANSITORIA = 'transitoria',
  DEROGATORIA = 'derogatoria',
  FINAL = 'final',
}

@Entity('disposiciones')
export class Disposicion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: CategoriaDisposicion })
  categoria!: CategoriaDisposicion;

  @Column({ nullable: true })
  etiqueta!: string; // "primera", "segunda", "única"...

  @Column({ type: 'text' })
  contenido!: string;

  @Column()
  orden!: number;

  @ManyToOne(() => VersionLey)
  versionLey!: VersionLey;
}