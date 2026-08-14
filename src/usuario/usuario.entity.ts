import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { ResultadoTest } from '../test/resultado-test.entity';
import { UsuarioOposicion } from '../usuario/usuario-oposicion.entity';

export enum EstadoUsuario {
  NUEVO = 'nuevo',
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

export enum SuscripcionUsuario {
  GRATUITO = 'gratuito',
  ESENCIAL = 'esencial',
  PROFESIONAL = 'profesional',
}

export enum TipoAvatar {
  OPLO = 'oplo',
  FOTO = 'foto',
}

@Entity('usuarios')
export class Usuario {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  apellidos: string;

  @Column({ type: 'enum', enum: TipoAvatar, default: TipoAvatar.OPLO })
  tipoAvatar: TipoAvatar;

  @Column({ nullable: true })
  avatarUrl: string; // solo se usa si tipoAvatar === 'foto'

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  dni: string;

  @Column({ default: false })
  notificacionesListas: boolean;

  @Column({ default: 0 })
  rachaActual: number;

  @Column({ default: 0 })
  rachaMaxima: number;

  @Column({ default: false })
  emailVerificado: boolean;

  @Column({ default: 'usuario' })
  rol: string;

  @CreateDateColumn()
  creadoEn: Date;

  @Column({ unique: true, nullable: true })
  nick: string;

  @Column({ default: 0 })
  puntos: number;

  @Column({ default: 1 })
  nivel: number;

  @Column({ default: 0 })
  preguntasCorrectasTotales: number;

  @OneToMany(() => ResultadoTest, (r) => r.usuario)
  resultados: ResultadoTest[];

  @Column({ default: true })
  activo: boolean;

  @Column({ default: false })
  onboardingGeneralCompletado: boolean;

  
  @Column({ default: 0 })
  simulacrosHoy: number;

  @Column({ default: 0 })
  preguntasRespondidasTotales: number;
  
  @Column({ default: 0 })
  preguntasTestHoy: number;

  @Column({ default: 0 })
  flashcardsHoy: number;

  @Column({ default: 0 })
  temasRevisadosHoy: number;

  @Column({ type: 'timestamp', nullable: true })
  ultimaActividad: Date;

  @Column({ type: 'date', nullable: true })
  fechaResetConsumo: string;
  
  @Column({
  type: 'enum',
  enum: SuscripcionUsuario,
  default: SuscripcionUsuario.GRATUITO,
  })
  suscripcion: SuscripcionUsuario;


  @Column({ type: 'varchar', nullable: true })
  objetivo: string;

  @Column({ type: 'boolean', default: false })
  compromiso: boolean;

  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpira: Date | null;

 
  @Column({
    type: 'enum',
    enum: EstadoUsuario,
    default: EstadoUsuario.NUEVO,
  })
  estado: EstadoUsuario;

  @OneToMany(() => UsuarioOposicion, uo => uo.usuario)
  usuarioOposiciones: UsuarioOposicion[];

}
