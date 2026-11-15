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

  // ⭐ Ruta del archivo en el almacén. El enlace se firma cada vez que se lee (antes se guardaba
  // un enlace firmado por un año, que dejaría de abrirse). Los apuntes antiguos no la tienen:
  // se saca de `urlArchivo`.
  @Column({ type: 'varchar', nullable: true })
  rutaArchivo!: string | null;

  @Column({ type: 'int', nullable: true })
  tamanoBytes!: number | null;

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