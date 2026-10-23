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

  // ⭐ Momento del último cambio de contraseña. Los tokens emitidos antes dejan de valer,
  // así que cambiarla cierra todas las sesiones abiertas (otros móviles, ordenadores…).
  @Column({ type: 'timestamptz', nullable: true, select: false })
  passwordCambiadaEn: Date | null;

  // ⭐ select:false: no se lee por defecto, así nunca viaja en relaciones de otros usuarios.
  @Column({ nullable: true, select: false })
  dni: string;

  @Column({ nullable: true })
  tiempoDisponible: string;

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

  // ⭐ Última vez que abrió la app (se actualiza como mucho una vez por hora desde la sesión).
  // ultimaActividad solo cambia al hacer tests; esto cuenta cualquier entrada.
  @Column({ type: 'timestamptz', nullable: true })
  ultimoAcceso: Date | null;

  // ⭐ Notificaciones y avisos: acepta que otros opositores de su convocatoria le reten al azar.
  @Column({ default: true })
  recibirRetosAleatorios: boolean;

  // ⭐ Notificaciones y avisos: categorías desactivadas ({ retos: false, ... }). null = todas activadas.
  @Column({ type: 'jsonb', nullable: true })
  preferenciasAvisos: Record<string, boolean> | null;

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

  // ⭐ Guarda el HASH (sha256) del token, nunca el token en claro, y no se lee por
  // defecto: antes salía en rankings/retos y permitía secuestrar cuentas.
  @Column({ type: 'varchar', nullable: true, select: false })
  resetPasswordToken: string | null;

  @Column({ type: 'timestamp', nullable: true, select: false })
  resetPasswordExpira: Date | null;

 
  @Column({
    type: 'enum',
    enum: EstadoUsuario,
    default: EstadoUsuario.NUEVO,
  })
  estado: EstadoUsuario;

  // ⭐ Liga Oplora: copa que se muestra sobre el avatar (la mejor y cuántas veces).
  // Se recalcula al repartir copas; es un dato público del perfil.
  // ⭐ Hasta cuándo ha visto las noticias (Inicio: la última noticia se muestra mientras sea nueva)
  @Column({ type: 'timestamp', nullable: true })
  noticiasVistasHasta: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  copaLiga: { color: string; veces: number; total: number } | null;

  @OneToMany(() => UsuarioOposicion, uo => uo.usuario)
  usuarioOposiciones: UsuarioOposicion[];

}
