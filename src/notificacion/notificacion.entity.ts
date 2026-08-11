import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';

export enum TipoNotificacion {
  ADMITIDO = 'admitido',
  EXCLUIDO = 'excluido',
  CAMBIO_NORMATIVO = 'cambio_normativo',
  NUEVO_DOCUMENTO = 'nuevo_documento',
  NUEVA_CONVOCATORIA = 'nueva_convocatoria',
  PLAZO_IMPORTANTE = 'plazo_importante',
  RETO_DIARIO = 'reto_diario',
  RETO_RECIBIDO = 'reto_recibido',
  RETO_RESULTADO = 'reto_resultado',
  LOGRO = 'logro',
  RACHA_PELIGRO = 'racha_peligro',
}

export enum PrioridadNotificacion {
  ALTA = 'alta',
  MEDIA = 'media',
  BAJA = 'baja',
}

@Entity('notificaciones')
export class Notificacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TipoNotificacion })
  tipo: TipoNotificacion;

  @Column({ type: 'enum', enum: PrioridadNotificacion, default: PrioridadNotificacion.MEDIA })
  prioridad: PrioridadNotificacion;

  @Column()
  titulo: string;

  @Column({ type: 'text' })
  mensaje: string;

  @Column({ default: false })
  leida: boolean;

  @Column({ nullable: true })
  urlAccion: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  creadoEn: Date;

  @ManyToOne(() => Usuario)
  usuario: Usuario;
}