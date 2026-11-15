import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Articulo } from './articulo.entity';
import { Usuario } from '../usuario/usuario.entity';
import { Tema } from '../tema/tema.entity';

// ⭐ Auditoría M9: índices para las consultas de cada usuario (Postgres no los crea solo por las claves foráneas)
@Index(['usuario', 'articulo'])
@Index(['usuario', 'tema'])
@Entity('notas_articulo')
export class NotaArticulo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  contenido: string;

  @Column({ nullable: true })
  fechaRepaso: Date;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;

  @ManyToOne(() => Articulo)
  articulo: Articulo;

  @ManyToOne(() => Usuario)
  usuario: Usuario;

  @ManyToOne(() => Tema, { nullable: true })
  tema: Tema;
}