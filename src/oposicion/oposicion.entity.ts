import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

import { Convocatoria } from '../convocatoria/convocatoria.entity';
import { OposicionLey } from '../ley/oposicion-ley.entity';
import { Reto } from '../reto/reto.entity';
import { UsuarioOposicion } from '../usuario/usuario-oposicion.entity';

export enum SubgrupoEnum {
  A1 = 'A1',
  A2 = 'A2',
  C1 = 'C1',
  C2 = 'C2',
}

export enum TurnoEnum {
  LIBRE = 'libre',
  PROMOCION_INTERNA = 'promocion_interna',
}

/* 🔥 NUEVO */
export enum TipoAdministracionEnum {
  ESTADO = 'estado',
  CCAA = 'ccaa',
  EMPRESA_PUBLICA = 'empresa_publica',
}

/* 🔥 NUEVO */
export enum CategoriaEstadoEnum {
  ADMINISTRACION_GENERAL = 'administracion_general',
  SEGURIDAD = 'seguridad',
  JUSTICIA = 'justicia',
  SANIDAD = 'sanidad',
}

@Entity('oposiciones')
export class Oposicion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  cuerpo: string;

  @Column({ nullable: true })
  administracion: string;

  @Column({ nullable: true })
  ministerio: string;

  @Column({ default: false })
  activa: boolean;

  // 🔥 NUEVO → NIVEL ALTO
  @Column({
    type: 'enum',
    enum: TipoAdministracionEnum,
  })
  tipoAdministracion: TipoAdministracionEnum;

   @Column({
    type: 'enum',
    enum: CategoriaEstadoEnum,
    nullable: false,
  })
  categoria: CategoriaEstadoEnum;

 
  @Column({
    type: 'enum',
    enum: SubgrupoEnum,
    nullable: false,
  })
  subgrupo: SubgrupoEnum;

  @Column({
    type: 'enum',
    enum: TurnoEnum,
    nullable: false,
    default: TurnoEnum.LIBRE,
  })
  turno: TurnoEnum;

  @CreateDateColumn()
  creadoEn: Date;

  @OneToMany(() => Convocatoria, (c) => c.oposicion)
  convocatorias: Convocatoria[];

  @OneToMany(() => Reto, (r) => r.oposicion)
  retos: Reto[];

  @OneToMany(() => OposicionLey, (ol) => ol.oposicion, {
    cascade: true,
  })
  oposicionLeyes: OposicionLey[];

  @OneToMany(() => UsuarioOposicion, uo => uo.oposicion)
  usuarioOposiciones: UsuarioOposicion[];

}