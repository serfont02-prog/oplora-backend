import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Oposicion } from '../oposicion/oposicion.entity';
import { Convocatoria } from '../convocatoria/convocatoria.entity';
import { PsicotecnicoTipo, PsicotecnicoDificultad, DIFICULTADES_DEFECTO } from './psicotecnico-tipo.enum';

// Configura qué tipos de psicotécnico están habilitados para una oposición.
// Si `convocatoria` es null, es la configuración "por defecto" de la oposición.
// Si tiene valor, es un override específico de esa convocatoria (puede activar,
// desactivar o cambiar dificultades respecto a la config por defecto).
@Entity('psicotecnico_config_oposicion')
export class PsicotecnicoConfigOposicion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: PsicotecnicoTipo })
  tipo: PsicotecnicoTipo;

  @Column({ default: true })
  habilitado: boolean;

  // ¿Esta modalidad forma parte de la prueba oficial de esta oposición/convocatoria,
  // o es solo entrenamiento libre que Oplora ofrece igualmente?
  @Column({ default: false })
  oficial: boolean;

  @Column({ type: 'jsonb', nullable: true })
  subtiposHabilitados: string[] | null;

  @Column({ type: 'jsonb', default: () => `'${JSON.stringify(DIFICULTADES_DEFECTO)}'` })
  dificultadesDisponibles: PsicotecnicoDificultad[];

  @CreateDateColumn()
  creadoEn: Date;

  @ManyToOne(() => Oposicion, { onDelete: 'CASCADE' })
  oposicion: Oposicion;

  @ManyToOne(() => Convocatoria, { nullable: true, onDelete: 'CASCADE' })
  convocatoria: Convocatoria | null;
}
