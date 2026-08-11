import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { VersionLey } from './version-ley.entity';

@Entity('diffs_version')
export class DiffVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => VersionLey, { nullable: true })
  versionAnterior: VersionLey;

  @ManyToOne(() => VersionLey, (v) => v.diffs)
  versionNueva: VersionLey;

  @Column({ type: 'jsonb', nullable: true })
  cambios: {
    articulos_modificados: string[];
    articulos_añadidos: string[];
    articulos_suprimidos: string[];
    resumen: string;
  };

  @Column({ type: 'text', nullable: true })
  textoCompleto: string;

  @Column({ default: false })
  generadoPorIa: boolean;

  @CreateDateColumn()
  creadoEn: Date;
}