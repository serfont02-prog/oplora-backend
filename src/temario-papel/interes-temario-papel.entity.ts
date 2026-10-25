import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, Column, Index, Unique } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { Oposicion } from '../oposicion/oposicion.entity';

// ⭐ Opositores que han pedido que les avisemos cuando el temario en papel de su oposición
// se pueda comprar. Sirve también para saber cuántos ejemplares imprimir.
@Entity('interes_temario_papel')
@Unique(['usuario', 'oposicion'])
@Index(['oposicion'])
export class InteresTemarioPapel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @ManyToOne(() => Oposicion, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'oposicionId' })
  oposicion: Oposicion;

  @CreateDateColumn({ type: 'timestamptz' })
  creadoEn: Date;

  // Cómo lo quiere: { idGrupo: idValor }, p. ej. { impresion: 'color', caras: 'una' }
  @Column({ type: 'jsonb', nullable: true })
  opciones: Record<string, string> | null;

  // Cuándo se le avisó de que ya se puede comprar (para no avisar dos veces)
  @Column({ type: 'timestamptz', nullable: true })
  avisadoEn: Date | null;
}
