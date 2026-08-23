import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { VersionLey } from './version-ley.entity';
import { OposicionLey } from './oposicion-ley.entity';

@Entity('leyes')
export class Ley {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({ nullable: true, unique: true })
  siglas: string;

  @Column({ nullable: true })
  descripcion: string;

  @OneToMany(() => VersionLey, (v) => v.ley)
  versiones: VersionLey[];

  @OneToMany(() => OposicionLey, (ol) => ol.ley)
  oposicionLeyes: OposicionLey[];

  @Column({ type: 'date', nullable: true })
  fechaPublicacion: Date;

}