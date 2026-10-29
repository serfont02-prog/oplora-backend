import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { Tema } from '../tema/tema.entity';

// ⭐ Índices para las consultas de cada usuario (antes casi no había)
@Index(['usuario', 'tema'])
@Entity('sesiones_tema')
export class SesionTema {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  creadoEn!: Date;

  @UpdateDateColumn() // ⭐ se actualiza automáticamente cada vez que se hace .save()
  ultimaVisita!: Date;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  usuario!: Usuario;

  @ManyToOne(() => Tema, { onDelete: 'CASCADE' })
  tema!: Tema;
}