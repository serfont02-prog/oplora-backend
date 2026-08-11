import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { Oposicion } from '../oposicion/oposicion.entity';
import { Tema } from '../tema/tema.entity';
import { Articulo } from '../normativa/articulo.entity';

@Entity('resultados_test')
export class ResultadoTest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  totalPreguntas: number;

  @Column()
  correctas: number;

  @Column({ type: 'float' })
  porcentaje: number;

  @Column({ nullable: true })
  tipoTest: string;

  @Column({ default: 0 })
  tiempoSegundos: number;

  @Column({
  type: 'jsonb',
  nullable: true,
})
detallePreguntas: {
  preguntaId: string;
  correcta: boolean;
  temaId?: string;
  articuloId?: string;
}[];

  @CreateDateColumn()
  creadoEn: Date;

  @ManyToOne(() => Usuario)
  usuario: Usuario;

  @ManyToOne(() => Oposicion, { nullable: true })
  oposicion: Oposicion;

  @ManyToOne(() => Tema, { nullable: true })
  tema: Tema;
}