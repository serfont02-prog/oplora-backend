import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('configuracion')
export class Configuracion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  clave!: string;

  @Column({ type: 'jsonb' })
  valor!: any;

  @Column({ nullable: true })
  descripcion!: string;

  @UpdateDateColumn()
  actualizadoEn!: Date;
}