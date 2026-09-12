import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Oposicion } from '../oposicion/oposicion.entity';
import { Convocatoria } from '../convocatoria/convocatoria.entity';

@Entity('usuario_oposiciones')
export class UsuarioOposicion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Usuario, usuario => usuario.usuarioOposiciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => Oposicion, oposicion => oposicion.usuarioOposiciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'oposicion_id' })
  oposicion: Oposicion;

  @Column({ default: false })
  activa: boolean;

  @CreateDateColumn()
  creadoEn: Date;

  @ManyToOne(() => Convocatoria, { nullable: true })
  convocatoriaActiva: Convocatoria | null;

  // ⭐ Nuevo: puntos y nivel son específicos de cada oposición
  @Column({ default: 0 })
  puntos: number;

  @Column({ default: 1 })
  nivel: number;

  @Column({ nullable: true })
  nivelExperiencia: number; // 1=Principiante, 2=Intermedio, 3=Avanzado — declarado por el usuario en onboarding
}