import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Convocatoria } from '../convocatoria/convocatoria.entity';

@Entity('usuario_convocatoria_historial')
export class UsuarioConvocatoriaHistorial {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  usuario!: Usuario;

  @ManyToOne(() => Convocatoria, { onDelete: 'CASCADE' })
  convocatoria!: Convocatoria;

  @CreateDateColumn()
  vinculadoEn!: Date;
}