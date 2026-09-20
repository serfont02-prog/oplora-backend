import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Convocatoria } from '../convocatoria/convocatoria.entity';
import { Oposicion } from '../oposicion/oposicion.entity';
import { Ley } from '../ley/ley.entity';
import { VersionLey } from '../ley/version-ley.entity';
import { DocumentoConvocatoria } from '../convocatoria/documento-convocatoria.entity';

export enum TipoNoticia {
  OFICIAL = 'oficial',
  LEGISLATIVA = 'legislativa',
  OPLORA = 'oplora',
}

export enum OrigenNoticia {
  SCRAPER_BOE = 'scraper_boe',
  CAMBIO_NORMATIVA = 'cambio_normativa',
  MANUAL_ADMIN = 'manual_admin',
  REGLA_AUTOMATICA = 'regla_automatica',
}

// Mismos valores literales que PrioridadNotificacion (notificacion.entity.ts) para consistencia.
export enum PrioridadNoticia {
  ALTA = 'alta',
  MEDIA = 'media',
  BAJA = 'baja',
}

@Entity('noticias')
export class Noticia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TipoNoticia })
  tipo: TipoNoticia;

  @Column({ type: 'enum', enum: OrigenNoticia })
  origen: OrigenNoticia;

  @Column()
  titulo: string;

  @Column({ type: 'text', nullable: true })
  resumen: string | null;

  @Column({ type: 'text', nullable: true })
  contenido: string | null;

  @Column({ type: 'varchar', nullable: true })
  urlOrigen: string | null;

  // Siempre relleno para 'oficial' y 'legislativa'; opcional para 'oplora'.
  @ManyToOne(() => Convocatoria, { nullable: true, onDelete: 'CASCADE' })
  convocatoria: Convocatoria | null;

  // Solo se usa para 'oplora' cuando el aviso aplica a toda la oposición sin convocatoria concreta.
  @ManyToOne(() => Oposicion, { nullable: true, onDelete: 'CASCADE' })
  oposicion: Oposicion | null;

  // Solo relevante para 'legislativa'.
  @ManyToOne(() => Ley, { nullable: true, onDelete: 'SET NULL' })
  ley: Ley | null;

  @ManyToOne(() => VersionLey, { nullable: true, onDelete: 'SET NULL' })
  versionLey: VersionLey | null;

  // Traza de qué documento del scraper generó una noticia 'oficial'.
  @ManyToOne(() => DocumentoConvocatoria, { nullable: true, onDelete: 'SET NULL' })
  documentoConvocatoria: DocumentoConvocatoria | null;

  @Column({ default: false })
  destacada: boolean;

  @Column({ type: 'enum', enum: PrioridadNoticia, default: PrioridadNoticia.MEDIA })
  prioridad: PrioridadNoticia;

  // false por defecto si origen es scraper_boe/cambio_normativa (cola de revisión editorial);
  // true por defecto si origen es manual_admin/regla_automatica (el admin publica directamente).
  @Column({ default: false })
  publicada: boolean;

  // Si está en el futuro, no debe aparecer en el feed público aunque publicada=true.
  @Column({ type: 'timestamp', nullable: true })
  fechaProgramada: Date | null;

  // Fecha editorial mostrada al usuario.
  @Column({ type: 'timestamp', nullable: true })
  fechaPublicacion: Date | null;

  @Column({ default: false })
  automatica: boolean;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;
}
