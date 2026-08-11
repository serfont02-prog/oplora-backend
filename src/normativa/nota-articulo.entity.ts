import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Articulo } from './articulo.entity';
import { Usuario } from '../usuario/usuario.entity';
import { Tema } from '../tema/tema.entity';

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