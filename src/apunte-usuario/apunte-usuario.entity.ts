import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { Oposicion } from '../oposicion/oposicion.entity';
import { Tema } from '../tema/tema.entity';

@Entity('apuntes_usuario')
export class ApunteUsuario {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  nombre!: string;

  @Column({ nullable: true })
  urlArchivo!: string;

  @Column({ type: 'text', nullable: true })
  textoExtraido!: string;

  @Column({ default: false })
  procesado!: boolean;

  @CreateDateColumn()
  creadoEn!: Date;

  @ManyToOne(() => Usuario)
  usuario!: Usuario;

  @ManyToOne(() => Oposicion)
  oposicion!: Oposicion;

  @ManyToOne(() => Tema, { nullable: true })
  tema!: Tema;
}