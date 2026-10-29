import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

// ⭐ Cuándo empezó a jugar cada usuario cada duelo (test, psicotécnico o flashcards).
// El tiempo que desempata se calcula en el servidor desde aquí, en vez de fiarse del que manda el móvil.
@Entity('inicios_duelo')
@Index(['tipo', 'retoId', 'usuarioId'], { unique: true })
export class InicioDuelo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 10 })
  tipo: 'test' | 'psico' | 'fc';

  @Column({ type: 'uuid' })
  retoId: string;

  @Column({ type: 'uuid' })
  usuarioId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  iniciadoEn: Date;
}
