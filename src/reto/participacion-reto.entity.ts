import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { Reto } from './reto.entity';
import { Usuario } from '../usuario/usuario.entity';

// ⭐ Índices para las consultas de cada usuario (antes casi no había)
@Index(['usuario'])
@Index(['reto'])
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
  respuestas: { seleccionada: number | null; correcta: boolean; enBlanco?: boolean }[];

  // ⭐ Duelos como el test de Practicar: se pueden dejar preguntas en blanco y gana la mejor
  // nota sobre 10 con la penalización de la convocatoria (fallos y, si resta, blancos).
  @Column({ type: 'int', nullable: true })
  blancos: number | null;

  @Column({ type: 'float', nullable: true })
  puntuacion: number | null;

  @CreateDateColumn()
  creadoEn: Date;

  @ManyToOne(() => Reto, (r) => r.participaciones, {
  onDelete: 'CASCADE',
    })
    reto: Reto;


  @ManyToOne(() => Usuario)
  usuario: Usuario;
}