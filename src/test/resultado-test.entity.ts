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

  // ⭐ Snapshot de puntos/nivel ganados con ESTE resultado concreto, para poder
  // mostrar el feedback de gamificación (tarjeta de OPLO) incluso después de
  // navegar a la pantalla de resultado, que relee el último resultado por GET
  // en vez de recibir la respuesta del POST original.
  @Column({ type: 'jsonb', nullable: true })
  gamificacion: {
    puntosGanados: number;
    puntosTotales: number;
    nivelAnterior: number;
    nivelNuevo: number;
    subioNivel: boolean;
    nombreNivel: string;
    badgeNivel: string;
  } | null;

  @CreateDateColumn()
  creadoEn: Date;

  @ManyToOne(() => Usuario)
  usuario: Usuario;

  @ManyToOne(() => Oposicion, { nullable: true })
  oposicion: Oposicion;

  @ManyToOne(() => Tema, { nullable: true })
  tema: Tema;
}