import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Reto } from './reto.entity';
import { Usuario } from '../usuario/usuario.entity';

@Entity('participaciones_reto')
export class ParticipacionReto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  completado: boolean;

  @Column({ nullable: true, type: 'float' })
  porcentaje: number;

  @Column({ nullable: true })
  tiempoSegundos: number;

  @Column({ nullable: true })
  posicion: number;

  @Column({ type: 'jsonb', nullable: true })
  respuestas: { correcta: boolean }[];

  @CreateDateColumn()
  creadoEn: Date;

  @ManyToOne(() => Reto, (r) => r.participaciones, {
  onDelete: 'CASCADE',
    })
    reto: Reto;


  @ManyToOne(() => Usuario)
  usuario: Usuario;
}