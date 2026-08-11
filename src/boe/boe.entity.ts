import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum EstadoBOE {
  PENDIENTE = 'pendiente',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
  PROCESADA = 'procesada',
}

@Entity('boe_convocatorias')
export class BoeConvocatoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fechaBOE: string;

  @Column()
  referenciaBOE: string;

  @Column({ type: 'text' })
  titulo: string;

  @Column({ nullable: true })
  urlPdf: string;

  @Column({ nullable: true })
  urlHtml: string;

  @Column({ nullable: true })
  departamento: string;

  @Column({ type: 'jsonb', nullable: true })
  datosExtraidos: Record<string, any>;

  @Column({ type: 'enum', enum: EstadoBOE, default: EstadoBOE.PENDIENTE })
  estado: EstadoBOE;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @CreateDateColumn()
  creadoEn: Date;
}