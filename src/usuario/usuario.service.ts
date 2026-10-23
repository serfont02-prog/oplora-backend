import { invalidarCacheUsuario } from '../auth/jwt.strategy';
import { Injectable, ConflictException, NotFoundException, BadRequestException  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull, In } from 'typeorm';
import { Usuario } from './usuario.entity';
import { CATEGORIAS_AVISOS, normalizarAvisos } from '../notificacion/categorias-avisos';
import * as bcrypt from 'bcrypt';
import { UsuarioOposicion } from './usuario-oposicion.entity';
import { Oposicion } from '../oposicion/oposicion.entity';
import { EstadoUsuario, SuscripcionUsuario } from './usuario.entity';
import { resetearConsumosSiEsNuevoDia } from '../common/helpers/consumo.helper';
import { getSuscripcionLimits, haSuperadoLimite } from '../common/helpers/plan.helper';
import { createClient } from '@supabase/supabase-js';
import { TipoAvatar } from './usuario.entity';
import { Convocatoria } from 'src/convocatoria/convocatoria.entity';
import { UsuarioConvocatoriaHistorial } from './usuario-convocatoria-historial.entity';
import { RepasoFC } from '../flashcard/repaso-fc.entity';
import { Flashcard } from '../flashcard/flashcard.entity';
import { ApunteOplora } from '../apunte-oplora/apunte-oplora.entity';
import { ProgresoLectura } from '../apunte-oplora/progreso-lectura.entity'; // ajusta la ruta real
import { ApunteUsuario } from '../apunte-usuario/apunte-usuario.entity';
import { Tema } from '../tema/tema.entity';
import { ResultadoTest } from '../test/resultado-test.entity';





@Injectable()
export class UsuarioService {
  private supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);
  constructor(
    @InjectRepository(Usuario)
    private readonly repo: Repository<Usuario>,

    @InjectRepository(UsuarioOposicion)
    private readonly usuarioOposicionRepo: Repository<UsuarioOposicion>,

    @InjectRepository(Oposicion)
    private readonly oposicionRepo: Repository<Oposicion>,

    @InjectRepository(Convocatoria)
    private readonly convocatoriaRepo: Repository<Convocatoria>,

    @InjectRepository(UsuarioConvocatoriaHistorial)
    private readonly historialRepo: Repository<UsuarioConvocatoriaHistorial>,

    @InjectRepository(RepasoFC)
    private readonly repasoFcRepo: Repository<RepasoFC>,

    @InjectRepository(Flashcard)
    private readonly flashcardRepo: Repository<Flashcard>,

    @InjectRepository(ApunteOplora)
    private readonly apunteOploraRepo: Repository<ApunteOplora>,

    @InjectRepository(ProgresoLectura)
    private readonly progresoLecturaRepo: Repository<ProgresoLectura>,

    @InjectRepository(ApunteUsuario)
    private readonly apunteUsuarioRepo: Repository<ApunteUsuario>,

    @InjectRepository(Tema)
    private readonly temaRepo: Repository<Tema>,

    @InjectRepository(ResultadoTest)
    private readonly resultadoTestRepo: Repository<ResultadoTest>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  // ---------------------------------------------------------
  // OPOSICIONES DEL USUARIO
  // ---------------------------------------------------------

  async getMisOposiciones(usuarioId: string): Promise<any[]> {
    const relaciones = await this.usuarioOposicionRepo.find({
      where: { usuario: { id: usuarioId } },
      relations: ['oposicion'],
      order: { creadoEn: 'DESC' },
    });

    return relaciones.map(r => ({
      ...r.oposicion,
      activa: r.activa,
    }));
  }




 async activarOposicion(usuarioId: string, oposicionId: string) {
  // ⭐ Antes se podía activar cualquier id: una oposición inexistente daba un error 500 y una
  // oposición aún no publicada (activa = false, en preparación en el admin) se podía elegir.
  const oposicion = await this.oposicionRepo.findOne({ where: { id: oposicionId } });
  if (!oposicion) throw new NotFoundException('Oposición no encontrada');
  if (oposicion.activa === false) throw new BadRequestException('Esta oposición todavía no está disponible');

  // Buscar si ya existe la relación usuario-oposición
  let relacion = await this.usuarioOposicionRepo.findOne({
    where: {
      usuario: { id: usuarioId },
      oposicion: { id: oposicionId },
    },
    relations: ['usuario', 'oposicion', 'convocatoriaActiva'],
  });

  // ⭐ Ya es su oposición activa: no se toca nada. Antes se volvía a asignar la última
  // convocatoria (perdiendo la que hubiera elegido) y se añadía otra fila al historial.
  if (relacion?.activa) return relacion;

  // 1. Desactivar todas las oposiciones anteriores del usuario
  await this.usuarioOposicionRepo.update(
    { usuario: { id: usuarioId } },
    { activa: false }
  );

  // 3. Si no existe, crearla
  if (!relacion) {
    relacion = this.usuarioOposicionRepo.create({
      usuario: { id: usuarioId },
      oposicion: { id: oposicionId },
      activa: true,
    });
  } else {
    relacion.activa = true;
  }

  // 4. Guardar la relación
  await this.usuarioOposicionRepo.save(relacion);

  // 5. Asignar convocatoria, solo si no tenía ya una (al volver a una oposición anterior
  //    se conserva la convocatoria con la que estaba).
  if (relacion.convocatoriaActiva) return relacion;
    const convocatorias = await this.convocatoriaRepo.find({
      where: { oposicion: { id: oposicionId } },
      order: { anyo: 'DESC' },
    });
    const convocatoriaActiva = convocatorias.find((c) => c.estado === 'activa') ?? convocatorias[0];

    if (convocatoriaActiva) {
      await this.usuarioOposicionRepo.update(
        { usuario: { id: usuarioId }, oposicion: { id: oposicionId } } as any,
        { convocatoriaActiva: { id: convocatoriaActiva.id } as any },
      );

      await this.historialRepo.save(this.historialRepo.create({
        usuario: { id: usuarioId } as any,
        convocatoria: { id: convocatoriaActiva.id } as any,
      }));
    }

  return relacion;
}

/**
 * ⭐ Exportar mi progreso (Ajustes de la oposición): CSV con el resumen y todos los tests
 * hechos en esa oposición. Antes el botón llamaba a una ruta que no existía (404).
 */
async exportarProgreso(usuarioId: string, oposicionId: string): Promise<string> {
  const relacion = await this.usuarioOposicionRepo.findOne({
    where: { usuario: { id: usuarioId } as any, oposicion: { id: oposicionId } as any },
    relations: ['oposicion', 'convocatoriaActiva'],
  });
  if (!relacion) throw new NotFoundException('No estás inscrito en esta oposición');

  const resultados = await this.resultadoTestRepo.find({
    where: { usuario: { id: usuarioId } as any, oposicion: { id: oposicionId } as any },
    relations: ['tema'],
    order: { creadoEn: 'DESC' },
  });
  const repasos = await this.repasoFcRepo
    .createQueryBuilder('r')
    .select('r.estado', 'estado')
    .addSelect('COUNT(*)', 'total')
    .where('r."usuarioId" = :u', { u: usuarioId })
    .groupBy('r.estado')
    .getRawMany()
    .catch(() => [] as any[]);

  const celda = (v: any) => {
    const t = v == null ? '' : String(v);
    return /[;"\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  const fila = (...v: any[]) => v.map(celda).join(';');
  const fecha = (d: Date) => new Date(d).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });

  const lineas: string[] = [];
  lineas.push(fila('OPLORA · Exportación de progreso', fecha(new Date())));
  lineas.push(fila('Oposición', (relacion.oposicion as any)?.nombre));
  lineas.push(fila('Convocatoria', (relacion as any).convocatoriaActiva?.anyo ?? ''));
  lineas.push(fila('Puntos', (relacion as any).puntos ?? 0));
  lineas.push(fila('Nivel', (relacion as any).nivel ?? 1));
  lineas.push(fila('Tests realizados', resultados.length));
  const totalPreg = resultados.reduce((a, r) => a + (r.totalPreguntas ?? 0), 0);
  const totalOk = resultados.reduce((a, r) => a + (r.correctas ?? 0), 0);
  lineas.push(fila('Preguntas respondidas', totalPreg));
  lineas.push(fila('Aciertos', totalOk));
  lineas.push(fila('% de acierto', totalPreg ? Math.round((totalOk / totalPreg) * 1000) / 10 : 0));
  for (const r of repasos) lineas.push(fila(`Flashcards (${r.estado})`, Number(r.total)));
  lineas.push('');
  lineas.push(fila('Fecha', 'Tipo', 'Tema', 'Preguntas', 'Aciertos', '% acierto', 'Tiempo (s)'));
  for (const r of resultados) {
    const tema = (r as any).tema;
    lineas.push(
      fila(
        fecha(r.creadoEn),
        r.tipoTest ?? '',
        tema ? `Tema ${tema.numero ?? ''} ${tema.titulo ?? ''}`.trim() : '',
        r.totalPreguntas,
        r.correctas,
        Math.round((r.porcentaje ?? 0) * 10) / 10,
        r.tiempoSegundos ?? 0,
      ),
    );
  }
  return '\uFEFF' + lineas.join('\r\n');
}

async desactivarOposicion(usuarioId: string, oposicionId: string) {
  const relacion = await this.usuarioOposicionRepo.findOne({
    where: {
      usuario: { id: usuarioId },
      oposicion: { id: oposicionId },
    },
  });

  if (!relacion) return;

  relacion.activa = false;
  await this.usuarioOposicionRepo.save(relacion);

  return relacion;
}

async marcarOnboardingGeneral(usuarioId: string) {
  // ⭐ Sin oposición activa el Inicio no tiene nada que mostrar: no se da por terminado el
  // onboarding hasta que el usuario haya elegido una.
  const activa = await this.usuarioOposicionRepo.findOne({
    where: { usuario: { id: usuarioId } as any, activa: true },
  });
  if (!activa) throw new BadRequestException('Elige primero tu oposición');

  await this.repo.update(usuarioId, {
    onboardingGeneralCompletado: true,
  });

  return { ok: true };
}

async marcarOnboardingEntrenamiento(usuarioId: string) {
  await this.repo.update(usuarioId, {
    estado: EstadoUsuario.ACTIVO,
  });

  return this.findMe(usuarioId);
}




  // ---------------------------------------------------------
  // MÉTODOS DE BÚSQUEDA (CORREGIDOS PARA LOGIN)
  // ---------------------------------------------------------

    async findByEmail(email: string): Promise<Usuario | null> {
      return this.repo.findOne({
        where: { email },
        select: [
          'id',
          'email',
          'nombre',
          'apellidos',
          'nick',
          'rol',
          'estado',
          'onboardingGeneralCompletado',
          'activo',
          'password',
        ],
      });
    }

    async findByNick(nick: string): Promise<Usuario | null> {
      return this.repo.findOne({
        where: { nick },
        select: [
          'id',
          'email',
          'nombre',
          'apellidos',
          'nick',
          'rol',
          'estado',
          'onboardingGeneralCompletado',
          'activo',
          'password',
        ],
      });
    }

  async findById(id: string): Promise<Usuario | null> {
    return this.repo.findOne({ where: { id } });
  }

  // ---------------------------------------------------------
  // CREAR USUARIO
  // ---------------------------------------------------------

  async crear(datos: {
    email: string;
    nombre: string;
    apellidos?: string;
    nick?: string;
    password: string;
    dni?: string;
    notificacionesListas?: boolean;
  }): Promise<Usuario> {
    const emailNormalizado = datos.email?.toLowerCase().trim();
    const nickNormalizado = datos.nick ? datos.nick.toLowerCase().trim() : datos.nick;

    const existente = await this.findByEmail(emailNormalizado);
    if (existente) throw new ConflictException('Ya existe una cuenta con ese email');

    if (nickNormalizado) {
      const nickExistente = await this.findByNick(nickNormalizado);
      if (nickExistente) throw new ConflictException('Ese nick ya está en uso');
    }

    const hash = await bcrypt.hash(datos.password, 10);

    const usuario = this.repo.create({
      ...datos,
      email: emailNormalizado,
      nick: nickNormalizado,
      password: hash,


    });

    return this.repo.save(usuario);
  }

  // ---------------------------------------------------------
  // VALIDAR PASSWORD (opcional)
  // ---------------------------------------------------------

  async validarPassword(email: string, password: string): Promise<Usuario | null> {
    const usuario = await this.findByEmail(email?.toLowerCase().trim());
    if (!usuario) return null;

    const ok = await bcrypt.compare(password, usuario.password);
    return ok ? usuario : null;
  }

  // ---------------------------------------------------------
  // ADMIN
  // ---------------------------------------------------------

  async findAll(): Promise<Usuario[]> {
    return this.repo.find({ order: { creadoEn: 'DESC' } });
  }

  /**
   * ⭐ Listado del panel de admin. Antes devolvía el usuario a pelo: puntos y nivel viven en
   * la inscripción a la oposición (usuarios_oposiciones), así que salían vacíos, y no se
   * veía si la cuenta estaba activa ni la última actividad.
   */
  async listarParaAdmin(): Promise<any[]> {
    const usuarios = await this.repo.find({
      relations: ['usuarioOposiciones', 'usuarioOposiciones.oposicion', 'usuarioOposiciones.convocatoriaActiva'],
      order: { creadoEn: 'DESC' },
    });
    return usuarios.map((u) => {
      const activa = u.usuarioOposiciones?.find((o) => o.activa) ?? null;
      return {
        id: u.id,
        email: u.email,
        nombre: u.nombre,
        apellidos: u.apellidos,
        nick: u.nick,
        rol: u.rol,
        activo: u.activo !== false,
        estado: u.estado,
        suscripcion: u.suscripcion,
        creadoEn: u.creadoEn,
        ultimaActividad: u.ultimaActividad,
        rachaActual: u.rachaActual,
        preguntasRespondidasTotales: u.preguntasRespondidasTotales,
        preguntasCorrectasTotales: u.preguntasCorrectasTotales,
        oposicion: activa?.oposicion ? { id: activa.oposicion.id, nombre: activa.oposicion.nombre } : null,
        convocatoria: activa?.convocatoriaActiva ? { id: activa.convocatoriaActiva.id, anyo: (activa.convocatoriaActiva as any).anyo } : null,
        puntos: activa?.puntos ?? 0,
        nivel: activa?.nivel ?? 1,
        totalOposiciones: u.usuarioOposiciones?.length ?? 0,
      };
    });
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  async cambiarSuscripcion(id: string, suscripcion: string): Promise<void> {
    await this.repo.update(id, {
  suscripcion: suscripcion as SuscripcionUsuario,
  });};

  async desactivar(id: string): Promise<void> {
    const u = await this.repo.findOne({ where: { id }, select: { id: true, rol: true } });
    if (!u) throw new NotFoundException('Usuario no encontrado');
    if (u.rol === 'admin') throw new BadRequestException('No se puede desactivar una cuenta de administrador');
    await this.repo.update(id, { activo: false });
    invalidarCacheUsuario(id);
  }

  async reactivar(id: string): Promise<void> {
    await this.repo.update(id, { activo: true });
    invalidarCacheUsuario(id);
  }

async actualizarNivel(usuarioId: string, oposicionId: string, nivel: number) {
  await this.usuarioOposicionRepo.update(
    { usuario: { id: usuarioId } as any, oposicion: { id: oposicionId } as any },
    { nivel },
  );
  return this.findMe(usuarioId);
}

  async guardarConsumo(usuario: Usuario): Promise<void> {
  await this.repo.update(usuario.id, {
    preguntasTestHoy: usuario.preguntasTestHoy,
    flashcardsHoy: usuario.flashcardsHoy,
    temasRevisadosHoy: usuario.temasRevisadosHoy,
    fechaResetConsumo: usuario.fechaResetConsumo,
    ultimaActividad: usuario.ultimaActividad,
    rachaActual: usuario.rachaActual, 
    rachaMaxima: usuario.rachaMaxima, 
  });
}
  async actualizarObjetivo(
  id: string,
  objetivo: string,
) {
  await this.repo.update(id, { objetivo });

  return this.findById(id);
}

  
  async actualizarCompromiso(id: string, compromiso: boolean) {
  await this.repo.update(id, { compromiso });
  return this.findById(id);
}

/** ⭐ Notificaciones y avisos: de momento, si acepta retos al azar. */
async actualizarPreferencias(usuarioId: string, datos: { recibirRetosAleatorios?: unknown; avisos?: unknown }) {
  const actual = await this.repo.findOne({ where: { id: usuarioId }, select: { id: true, recibirRetosAleatorios: true, preferenciasAvisos: true } });
  if (!actual) throw new NotFoundException('Usuario no encontrado');
  const cambios: Partial<Usuario> = {};
  if (datos.recibirRetosAleatorios !== undefined) {
    if (typeof datos.recibirRetosAleatorios !== 'boolean') throw new BadRequestException('Valor no válido');
    cambios.recibirRetosAleatorios = datos.recibirRetosAleatorios;
  }
  // ⭐ Avisos por categoría (retos, repasos, noticias, convocatoria, normativa): se mezclan con lo guardado.
  if (datos.avisos !== undefined) {
    if (!datos.avisos || typeof datos.avisos !== 'object' || Array.isArray(datos.avisos)) throw new BadRequestException('Valor no válido');
    const nuevas = { ...normalizarAvisos(actual.preferenciasAvisos) };
    for (const [clave, valor] of Object.entries(datos.avisos as Record<string, unknown>)) {
      if (!(CATEGORIAS_AVISOS as readonly string[]).includes(clave) || typeof valor !== 'boolean') {
        throw new BadRequestException('Valor no válido');
      }
      (nuevas as any)[clave] = valor;
    }
    cambios.preferenciasAvisos = nuevas;
  }
  if (Object.keys(cambios).length) await this.repo.update(usuarioId, cambios as any);
  const u = { ...actual, ...cambios };
  return { recibirRetosAleatorios: u.recibirRetosAleatorios, avisos: normalizarAvisos(u.preferenciasAvisos) };
}

async findMe(id: string) {
  const usuario = await this.repo.findOne({
    where: { id },
    relations: [
      'usuarioOposiciones',
      'usuarioOposiciones.oposicion',
      'usuarioOposiciones.convocatoriaActiva', 
    ],
  });

  if (!usuario) throw new NotFoundException('Usuario no encontrado');

  const activa = usuario.usuarioOposiciones?.find(o => o.activa) || null;
  const { password, usuarioOposiciones, ...usuarioSeguro } = usuario;

  return {
    ...usuarioSeguro,
    oposicionActiva: activa
      ? {
          ...activa.oposicion,
          puntos: activa.puntos,
          nivel: activa.nivel,
          nivelExperiencia: activa.nivelExperiencia,
          convocatoriaActiva: activa.convocatoriaActiva,
        }
      : null,
  };
}


async verificarLimiteTest(
  usuarioId: string,
  numPreguntas: number,
  tipoTest: string,
): Promise<{ permitido: boolean; motivo?: string; limite?: number }> {
  const usuario = await this.findById(usuarioId);
  if (!usuario) throw new NotFoundException('Usuario no encontrado');

  // Reset diario si es nuevo día
  const usuarioActualizado = resetearConsumosSiEsNuevoDia(usuario);
  if (usuarioActualizado.fechaResetConsumo !== usuario.fechaResetConsumo) {
    await this.repo.save(usuarioActualizado);
  }

  const limits = getSuscripcionLimits(usuario.suscripcion);

  // Simulacros bloqueados
  if (tipoTest === 'simulacro' && !limits.simulacros) {
    return { permitido: false, motivo: 'simulacro_bloqueado', limite: 0 };
  }

  // Límite por test según tipo
  const limitePorTest = tipoTest === 'tema'
    ? limits.preguntasPorTema
    : limits.preguntasPorTest;

  if (numPreguntas > limitePorTest) {
    return { permitido: false, motivo: 'limite_por_test', limite: limitePorTest };
  }

  // Límite diario
  if (
    limits.preguntasTestDia !== Infinity &&
    haSuperadoLimite(usuario.suscripcion, 'preguntasTestDia', usuario.preguntasTestHoy + numPreguntas)
  ) {
    const restantes = limits.preguntasTestDia - usuario.preguntasTestHoy;
    return { permitido: false, motivo: 'limite_diario', limite: Math.max(0, restantes) };
  }

  return { permitido: true };
}

async verificarLimiteFlashcards(
  usuarioId: string,
  cantidad: number,
): Promise<{ permitido: boolean; motivo?: string; limite?: number }> {
  const usuario = await this.findById(usuarioId);
  if (!usuario) throw new NotFoundException('Usuario no encontrado');

  const usuarioActualizado = resetearConsumosSiEsNuevoDia(usuario);
  if (usuarioActualizado.fechaResetConsumo !== usuario.fechaResetConsumo) {
    await this.repo.save(usuarioActualizado);
  }

  const limits = getSuscripcionLimits(usuario.suscripcion);

  if (
    limits.flashcardsDia !== Infinity &&
    haSuperadoLimite(usuario.suscripcion, 'flashcardsDia', usuario.flashcardsHoy + cantidad)
  ) {
    const restantes = limits.flashcardsDia - usuario.flashcardsHoy;
    return { permitido: false, motivo: 'limite_diario_flashcards', limite: Math.max(0, restantes) };
  }

  return { permitido: true };
}

  async getEstadisticas(): Promise<any> {
    const total = await this.repo.count();
    // ⭐ Todos tienen plan (por defecto "gratuito"): "con suscripción" = de pago. Antes contaba
    // a todos y la conversión salía siempre al 100 %.
    const conSuscripcion = await this.repo.count({
      where: { suscripcion: In([SuscripcionUsuario.ESENCIAL, SuscripcionUsuario.PROFESIONAL]) },
    });
    const desactivados = await this.repo.count({ where: { activo: false } });

    const porSuscripcion = await this.repo
      .createQueryBuilder('u')
      .select('u.suscripcion', 'suscripcion')
      .addSelect('COUNT(*)', 'total')
      .where('u.suscripcion IS NOT NULL')
      .groupBy('u.suscripcion')
      .getRawMany();

      const porNivel = await this.usuarioOposicionRepo
    .createQueryBuilder('uo')
    .select('uo.nivel', 'nivel')
    .addSelect('COUNT(*)', 'total')
    .groupBy('uo.nivel')
    .orderBy('uo.nivel', 'ASC')
    .getRawMany();

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const hace7dias = new Date(hoy);
    hace7dias.setDate(hace7dias.getDate() - 7);

    const hace30dias = new Date(hoy);
    hace30dias.setDate(hace30dias.getDate() - 30);

    const nuevosHoy = await this.repo
      .createQueryBuilder('u')
      .where('u.creadoEn >= :hoy', { hoy })
      .getCount();

    const nuevos7dias = await this.repo
      .createQueryBuilder('u')
      .where('u.creadoEn >= :fecha', { fecha: hace7dias })
      .getCount();

    const nuevos30dias = await this.repo
      .createQueryBuilder('u')
      .where('u.creadoEn >= :fecha', { fecha: hace30dias })
      .getCount();

      

    const activos7dias = await this.repo
      .createQueryBuilder('u')
      .where('u.ultimaActividad >= :fecha', { fecha: hace7dias })
      .getCount();
    const activos30dias = await this.repo
      .createQueryBuilder('u')
      .where('u.ultimaActividad >= :fecha', { fecha: hace30dias })
      .getCount();

    return {
      total,
      conSuscripcion,
      sinSuscripcion: total - conSuscripcion,
      desactivados,
      activos7dias,
      activos30dias,
      porSuscripcion,
      porNivel,
      nuevosHoy,
      nuevos7dias,
      nuevos30dias,
    };
  }

  async subirAvatar(usuarioId: string, buffer: Buffer, mimeType: string): Promise<Usuario> {
  const path = `usuarios/${usuarioId}/${Date.now()}.jpg`;

  const { error } = await this.supabase.storage
    .from('avatares')
    .upload(path, buffer, { contentType: mimeType, upsert: false });

  if (error) throw new Error(`Error subiendo avatar: ${error.message}`);

  const { data: urlData } = await this.supabase.storage
  .from('avatares')
  .createSignedUrl(path, 60 * 60 * 24 * 365);

  await this.repo.update(usuarioId, {
    tipoAvatar: TipoAvatar.FOTO,
    avatarUrl: urlData?.signedUrl,
  });

  return this.findById(usuarioId) as Promise<Usuario>;
}

async cambiarTipoAvatar(usuarioId: string, tipo: 'oplo' | 'foto'): Promise<Usuario> {
  await this.repo.update(usuarioId, { tipoAvatar: tipo as TipoAvatar });
  return this.findById(usuarioId) as Promise<Usuario>;
}

async getConvocatoriasDisponibles(usuarioId: string, oposicionId: string) {
  const uo = await this.usuarioOposicionRepo.findOne({
    where: { usuario: { id: usuarioId }, oposicion: { id: oposicionId } },
    relations: ['convocatoriaActiva'],
  });

  const historial = await this.historialRepo.find({
    where: { usuario: { id: usuarioId }, convocatoria: { oposicion: { id: oposicionId } } as any },
    relations: ['convocatoria'],
  });

  const anyosVisitados = historial.map((h) => h.convocatoria.anyo);
  const anyoMinimo = anyosVisitados.length > 0 ? Math.min(...anyosVisitados) : (uo?.convocatoriaActiva?.anyo ?? 0);

  const todasLasConvocatorias = await this.convocatoriaRepo.find({
    where: { oposicion: { id: oposicionId } },
    order: { anyo: 'DESC' },
  });

  return {
    actual: uo?.convocatoriaActiva ?? null,
    disponibles: todasLasConvocatorias.filter((c) => c.anyo >= anyoMinimo),
  };
}

  async cambiarConvocatoria(usuarioId: string, oposicionId: string, convocatoriaNuevaId: string): Promise<void> {
  const uo = await this.usuarioOposicionRepo.findOne({
    where: { usuario: { id: usuarioId }, oposicion: { id: oposicionId } },
    relations: ['convocatoriaActiva'],
  });
  if (!uo) throw new NotFoundException('No estás vinculado a esta oposición');

  const nueva = await this.convocatoriaRepo.findOne({ where: { id: convocatoriaNuevaId } });
  if (!nueva) throw new NotFoundException('Convocatoria no encontrada');

  // Verificar límite: no puede ir a un año anterior al mínimo visitado
  const historial = await this.historialRepo.find({
    where: { usuario: { id: usuarioId }, convocatoria: { oposicion: { id: oposicionId } } as any },
    relations: ['convocatoria'],
  });
  const anyosVisitados = historial.map((h) => h.convocatoria.anyo);
  const anyoMinimo = anyosVisitados.length > 0 ? Math.min(...anyosVisitados) : (uo.convocatoriaActiva?.anyo ?? 0);

  if (nueva.anyo < anyoMinimo) {
    throw new BadRequestException('No puedes volver a una convocatoria anterior a la primera que visitaste');
  }

  

  const convocatoriaOrigenId = uo.convocatoriaActiva?.id;

  // Cambiar convocatoria activa
  await this.usuarioOposicionRepo.update(uo.id, {
    convocatoriaActiva: { id: convocatoriaNuevaId } as any,
  });

  // Registrar en historial (si no estaba ya)
  const yaVisitada = historial.some((h) => h.convocatoria.id === convocatoriaNuevaId);
  if (!yaVisitada) {
    await this.historialRepo.save(this.historialRepo.create({
      usuario: { id: usuarioId } as any,
      convocatoria: { id: convocatoriaNuevaId } as any,
    }));
  }

  // Copiar progreso (siempre, en cada cambio, con los datos más recientes)
  if (convocatoriaOrigenId) {
  await this.migrarProgreso(usuarioId, oposicionId, convocatoriaOrigenId, convocatoriaNuevaId);
  }
}

private async migrarProgreso(usuarioId: string, oposicionId: string, origenId: string, destinoId: string): Promise<void> {
  // ⭐ Todas las lecturas/escrituras se agrupan en una única transacción: si cualquier paso
  // falla, no se confirma ninguno y el usuario no queda con la migración a medias.
  return this.usuarioRepo.manager.transaction(async (manager) => {
    const temasOrigen = await manager.find(Tema, { where: { convocatoria: { id: origenId } as any } });
    const temasDestino = await manager.find(Tema, { where: { convocatoria: { id: destinoId } as any } });

    // Mapa origen -> destino por número de tema (se reutiliza también para ResultadoTest)
    const mapaTemaId: Record<string, string> = {};
    for (const temaOrigen of temasOrigen) {
      const temaDestino = temasDestino.find((t) => t.numero === temaOrigen.numero);
      if (temaDestino) mapaTemaId[temaOrigen.id] = temaDestino.id;
    }

    for (const temaOrigen of temasOrigen) {
      const temaDestino = temasDestino.find((t) => t.claveEstable === temaOrigen.claveEstable);
      if (!temaDestino) continue; // el tema ya no existe en la nueva convocatoria

      // --- Flashcards: emparejar por texto de pregunta ---
      const fcOrigen = await manager.find(Flashcard, { where: { tema: { id: temaOrigen.id } as any } });
      const fcDestino = await manager.find(Flashcard, { where: { tema: { id: temaDestino.id } as any } });

      for (const fcO of fcOrigen) {
        const fcD = fcDestino.find((f) => f.pregunta === fcO.pregunta);
        if (!fcD) continue;

        const repasoOrigen = await manager.findOne(RepasoFC, {
          where: { usuario: { id: usuarioId } as any, flashcard: { id: fcO.id } as any },
        });
        if (!repasoOrigen) continue;

        const yaExisteRepaso = await manager.findOne(RepasoFC, {
          where: { usuario: { id: usuarioId } as any, flashcard: { id: fcD.id } as any },
        });
        if (yaExisteRepaso) continue;

        await manager.save(RepasoFC, manager.create(RepasoFC, {
          usuario: { id: usuarioId } as any,
          flashcard: { id: fcD.id } as any,
          estado: repasoOrigen.estado,
          aciertos: repasoOrigen.aciertos,
          fallos: repasoOrigen.fallos,
          proximoRepaso: repasoOrigen.proximoRepaso,
          factorFacilidad: repasoOrigen.factorFacilidad,
          intervalo: repasoOrigen.intervalo,
          repeticiones: repasoOrigen.repeticiones,
        } as any));
      }

      // --- Progreso de lectura de apuntes ---
      const apunteOrigen = await manager.findOne(ApunteOplora, { where: { tema: { id: temaOrigen.id } as any } });
      const apunteDestino = await manager.findOne(ApunteOplora, { where: { tema: { id: temaDestino.id } as any } });

      if (apunteOrigen && apunteDestino) {
        const progresoOrigen = await manager.findOne(ProgresoLectura, {
          where: { usuario: { id: usuarioId } as any, apunte: { id: apunteOrigen.id } as any },
        });
        if (progresoOrigen) {
          const yaExisteProgreso = await manager.findOne(ProgresoLectura, {
            where: { usuario: { id: usuarioId } as any, apunte: { id: apunteDestino.id } as any },
          });
          if (!yaExisteProgreso) {
            await manager.save(ProgresoLectura, manager.create(ProgresoLectura, {
              usuario: { id: usuarioId } as any,
              apunte: { id: apunteDestino.id } as any,
              porcentaje: progresoOrigen.porcentaje,
            } as any));
          }
        }
      }

      // --- Notas personales del usuario: se reapuntan directamente al nuevo tema ---
      await manager.update(
        ApunteUsuario,
        { usuario: { id: usuarioId } as any, tema: { id: temaOrigen.id } as any },
        { tema: { id: temaDestino.id } as any },
      );
    }

    // --- ResultadoTest ligados directamente a un tema: se reapuntan al tema equivalente ---
    for (const [origenTemaId, destinoTemaId] of Object.entries(mapaTemaId)) {
      await manager.update(
        ResultadoTest,
        { usuario: { id: usuarioId } as any, tema: { id: origenTemaId } as any },
        { tema: { id: destinoTemaId } as any },
      );
    }

    // --- ResultadoTest de tests generales (sin tema propio): re-apuntar temaId dentro de detallePreguntas ---
    const resultadosGenerales = await manager.find(ResultadoTest, {
      where: { usuario: { id: usuarioId } as any, oposicion: { id: oposicionId } as any, tema: null as any },
    });

    for (const resultado of resultadosGenerales) {
      if (!resultado.detallePreguntas?.length) continue;
      let cambiado = false;
      const nuevoDetalle = resultado.detallePreguntas.map((p) => {
        if (p.temaId && mapaTemaId[p.temaId]) {
          cambiado = true;
          return { ...p, temaId: mapaTemaId[p.temaId] };
        }
        return p;
      });
      if (cambiado) {
        await manager.update(ResultadoTest, resultado.id, { detallePreguntas: nuevoDetalle });
      }
    }
  });
}

  async actualizarTiempoDisponible(id: string, tiempoDisponible: string) {
    // ⭐ Solo los valores que ofrece el onboarding (antes se guardaba cualquier texto)
    if (!['menos_1h', '1_3h', 'mas_3h', 'variable'].includes(tiempoDisponible)) {
      throw new BadRequestException('Tiempo disponible no válido');
    }
    await this.repo.update(id, { tiempoDisponible });
    return this.findById(id);
  }

  async actualizarNivelExperiencia(usuarioId: string, oposicionId: string, nivelExperiencia: number) {
  const nivel = Number(nivelExperiencia);
  if (![1, 2, 3].includes(nivel)) throw new BadRequestException('Nivel de experiencia no válido');
  if (!oposicionId) throw new BadRequestException('Falta la oposición');
  const res = await this.usuarioOposicionRepo.update(
    { usuario: { id: usuarioId } as any, oposicion: { id: oposicionId } as any },
    { nivelExperiencia: nivel },
  );
  if (!res.affected) throw new NotFoundException('No estás apuntado a esta oposición');
  return this.findMe(usuarioId);
}

async resetearProgreso(
  usuarioId: string,
  oposicionId: string,
  conservar: {
    puntosYNivel?: boolean;
    racha?: boolean;
    flashcards?: boolean;
    lectura?: boolean;
    historialTests?: boolean;
    notas?: boolean;
  },
): Promise<void> {
  const uo = await this.usuarioOposicionRepo.findOne({
    where: { usuario: { id: usuarioId } as any, oposicion: { id: oposicionId } as any },
    relations: ['convocatoriaActiva'],
  });
  if (!uo) throw new NotFoundException('No estás vinculado a esta oposición');

  const convocatoriaId = uo.convocatoriaActiva?.id;
  if (!convocatoriaId) throw new BadRequestException('No tienes convocatoria activa');

  // ⭐ Todas las escrituras (puntos/nivel, racha, flashcards, lectura, tests, notas) se agrupan
  // en una única transacción: si cualquier paso falla, no se confirma ninguno y el usuario no
  // queda con el progreso parcialmente reseteado.
  await this.usuarioRepo.manager.transaction(async (manager) => {
    // --- Puntos y nivel (ahora correctamente acotados a esta oposición) ---
    if (!conservar.puntosYNivel) {
      await manager.update(UsuarioOposicion, uo.id, { puntos: 0, nivel: 1 });
    }

    // --- Racha (sigue siendo global de cuenta, se resetea igualmente si se pide) ---
    if (!conservar.racha) {
      await manager.update(Usuario, usuarioId, { rachaActual: 0 });
      // rachaMaxima se mantiene como récord histórico, no se resetea nunca
    }

    const temas = await manager.find(Tema, { where: { convocatoria: { id: convocatoriaId } as any } });
    const temaIds = temas.map((t) => t.id);

    if (temaIds.length > 0) {
      // --- Flashcards (RepasoFC) ---
      if (!conservar.flashcards) {
        const flashcardsDeLosTemas = await manager.find(Flashcard, {
          where: { tema: { id: In(temaIds) } as any },
          select: ['id'],
        });
        const flashcardIds = flashcardsDeLosTemas.map((f) => f.id);
        if (flashcardIds.length > 0) {
          await manager.delete(RepasoFC, {
            usuario: { id: usuarioId } as any,
            flashcard: { id: In(flashcardIds) } as any,
          });
        }
      }

      // --- Progreso de lectura ---
      if (!conservar.lectura) {
        const apuntesDeLosTemas = await manager.find(ApunteOplora, {
          where: { tema: { id: In(temaIds) } as any },
          select: ['id'],
        });
        const apunteIds = apuntesDeLosTemas.map((a) => a.id);
        if (apunteIds.length > 0) {
          await manager.delete(ProgresoLectura, {
            usuario: { id: usuarioId } as any,
            apunte: { id: In(apunteIds) } as any,
          });
        }
      }

      // --- Historial de tests ---
      if (!conservar.historialTests) {
        await manager.delete(ResultadoTest, {
          usuario: { id: usuarioId } as any,
          oposicion: { id: oposicionId } as any,
        });
      }

      // --- Notas personales ---
      if (!conservar.notas) {
        await manager.delete(ApunteUsuario, {
          usuario: { id: usuarioId } as any,
          tema: { id: In(temaIds) } as any,
        });
      }
    }
  });
}

}
