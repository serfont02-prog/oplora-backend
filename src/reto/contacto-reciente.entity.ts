import { Entity, PrimaryGeneratedColumn, ManyToOne, UpdateDateColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';

@Entity('contactos_recientes')
export class ContactoReciente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Usuario)
  usuario: Usuario;

  @ManyToOne(() => Usuario)
  contacto: Usuario;

  @UpdateDateColumn()
  ultimoUso: Date;
}