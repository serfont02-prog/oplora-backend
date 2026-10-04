import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { Oposicion } from '../oposicion/oposicion.entity';
import { PsicotecnicoTipo } from './psicotecnico-tipo.enum';
import { ResultadoRetoPsicotecnico } from './resultado-reto-psicotecnico.entity';

// Espejo de EstadoRetoFC (reto-fc.entity.ts). No se replica TipoRetoFC
// (diario/semanal/duelo/personal) porque, de momento, el único modo de reto
// psicotécnico que se construye es el duelo 1 contra 1; en su lugar el campo
// `tipo` guarda directamente la modalidad psicotécnica (numerico/verbal/...),
// ya que cada duelo está acotado a una sola modalidad.
export enum EstadoRetoPsicotecnico {
  PENDIENTE = 'pendiente',
  ACTIVO = 'activo',
  COMPLETADO = 'completado',
  EXPIRADO = 'expirado',
}

@Entity('retos_psicotecnicos')
export class RetoPsicotecnico {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Modalidad psicotécnica a la que está acotado el duelo (numerico, verbal...).
  @Column({ type: 'enum', enum: PsicotecnicoTipo })
  tipo: PsicotecnicoTipo;

  @Column({ type: 'enum', enum: EstadoRetoPsicotecnico, default: EstadoRetoPsicotecnico.ACTIVO })
  estado: EstadoRetoPsicotecnico;

  // ⭐ Snapshot CONGELADO en el momento de crear el duelo (espejo de
  // RetoFC.flashcards, que también es un jsonb y no una relación). Cada
  // elemento guarda { id, enunciado, imagenUrl, opciones } ya con el recorte
  // (recortarOpcionesPsicotecnico) y el reordenado aplicados UNA sola vez.
  // Congelar aquí — en vez de recalcular el recorte/reordenado cada vez que
  // se "sirve" la pregunta a cada duelista, como hace el flujo individual de
  // práctica — es imprescindible en un duelo de 2 jugadores: si cada lado
  // generara su propio recorte/orden por separado (aunque fuera determinista
  // por preguntaId), cualquier futuro cambio en la lógica de recorte, o una
  // ejecución en momentos distintos con `Math.random()`, podría hacer que
  // retador y retado vieran opciones distintas para la "misma" pregunta.
  // Guardando el snapshot una vez, ambos leen literalmente el mismo tablero.
  @Column({ type: 'jsonb' })
  preguntas: { id: string; enunciado: string; imagenUrl?: string | null; opciones: string[] }[];

  @Column({ nullable: true })
  tiempoLimite: number;

  @Column({ nullable: true })
  fechaFin: Date;

  // ⭐ Mensaje opcional del retador al retado (máx. 140), igual que en los retos de test.
  @Column({ type: 'varchar', length: 140, nullable: true })
  mensaje: string | null;

  @CreateDateColumn()
  creadoEn: Date;

  @ManyToOne(() => Usuario, { nullable: true })
  retador: Usuario;

  @ManyToOne(() => Usuario, { nullable: true })
  retado: Usuario;

  @ManyToOne(() => Oposicion, { nullable: true })
  oposicion: Oposicion;

  @OneToMany(() => ResultadoRetoPsicotecnico, (r) => r.retoPsicotecnico)
  resultados: ResultadoRetoPsicotecnico[];
}
