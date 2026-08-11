import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Oposicion } from '../oposicion/oposicion.entity';
import { Ley } from './ley.entity';
import { VersionLey } from './version-ley.entity';

@Entity('oposiciones_leyes')
export class OposicionLey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: true })
  obligatoria: boolean;

  @ManyToOne(() => Oposicion, (o) => o.oposicionLeyes, {
    onDelete: 'CASCADE',
  })
  oposicion: Oposicion;

  @ManyToOne(() => Ley, (l) => l.oposicionLeyes, {
    onDelete: 'CASCADE',
  })
  ley: Ley;

  @ManyToOne(() => VersionLey, { nullable: true })
  versionLey: VersionLey;
}
