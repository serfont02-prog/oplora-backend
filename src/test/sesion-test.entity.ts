import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';

/**
 * ⭐ Sesión de test: guarda en el servidor qué preguntas se sirvieron a un usuario
 * y en qué orden de opciones (con el índice correcto TRAS barajar/recortar).
 *
 * Al guardar el resultado solo cuentan esas preguntas, una vez cada una, y la
 * sesión solo se puede usar una vez. Así:
 *  - no se pueden inventar puntos enviando preguntas repetidas o ajenas al test;
 *  - la corrección compara con el orden de opciones que vio el usuario (antes, con
 *    3 opciones barajadas, se comparaba con el orden original de la pregunta).
 */
@Entity('sesiones_test')
@Index(['usuario', 'creadoEn'])
export class SesionTest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  usuario: Usuario;

  @Column({ type: 'uuid', nullable: true })
  oposicionId: string | null;

  @Column({ type: 'varchar', nullable: true })
  modo: string | null;

  // [{ id, correcta }] — `correcta` es el índice en las opciones TAL COMO se sirvieron.
  @Column({ type: 'jsonb' })
  preguntas: { id: string; correcta: number }[];

  @Column({ default: false })
  usada: boolean;

  @CreateDateColumn()
  creadoEn: Date;
}
