import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';

@Entity('preferencias_widget')
export class PreferenciaWidget {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  ubicacion!: string; // ej: 'entrenamiento_progreso', 'inicio_progreso'

  @Column()
  variante!: string; // 'dia' | 'semana' | 'mes' | 'total'

  @UpdateDateColumn()
  actualizadoEn!: Date;

  @ManyToOne(() => Usuario)
  usuario!: Usuario;
}