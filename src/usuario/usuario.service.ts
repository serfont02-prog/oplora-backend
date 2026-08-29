import { Injectable, ConflictException, NotFoundException, BadRequestException  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Usuario } from './usuario.entity';
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
  // 1. Desactivar todas las oposiciones anteriores del usuario
  await this.usuarioOposicionRepo.update(
    { usuario: { id: usuarioId } },
    { activa: false }
  );

  // 2. Buscar si ya existe la relación usuario-oposición
  let relacion = await this.usuarioOposicionRepo.findOne({
    where: {
      usuario: { id: usuarioId },
      oposicion: { id: oposicionId },
    },
    relations: ['usuario', 'oposicion'],
  });

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

  // 5. Asignar convocatoria
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
        'puntos',
        'nivel',
        'estado',
        'onboardingGeneralCompletado',
        'password', // ← NECESARIO PARA LOGIN
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
        'puntos',
        'nivel',
        'estado',
        'onboardingGeneralCompletado',
        'password', // ← NECESARIO PARA LOGIN
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
    const existente = await this.findByEmail(datos.email);
    if (existente) throw new ConflictException('Ya existe una cuenta con ese email');

    if (datos.nick) {
      const nickExistente = await this.findByNick(datos.nick);
      if (nickExistente) throw new ConflictException('Ese nick ya está en uso');
    }

    const hash = await bcrypt.hash(datos.password, 10);

    const usuario = this.repo.create({
      ...datos,
      password: hash,

      
    });

    return this.repo.save(usuario);
  }

  // ---------------------------------------------------------
  // VALIDAR PASSWORD (opcional)
  // ---------------------------------------------------------

  async validarPassword(email: string, password: string): Promise<Usuario | null> {
    const usuario = await this.findByEmail(email);
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

  async count(): Promise<number> {
    return this.repo.count();
  }

  async cambiarSuscripcion(id: string, suscripcion: string): Promise<void> {
    await this.repo.update(id, {
  suscripcion: suscripcion as SuscripcionUsuario,
  });};

  async desactivar(id: string): Promise<void> {
    await this.repo.update(id, { activo: false });
  }

  async actualizarNivel(id: string, nivel: number) {
  await this.repo.update(id, { nivel });
  return this.findById(id);
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
  nivel?: number,
) {
  await this.repo.update(id, {
    objetivo,
    ...(nivel && { nivel }),
  });

  return this.findById(id);
}

  
  async actualizarCompromiso(id: string, compromiso: boolean) {
  await this.repo.update(id, { compromiso });
  return this.findById(id);
}

async findMe(id: string) {
  const usuario = await this.repo.findOne({
    where: { id },
    relations: [
      'usuarioOposiciones',
      'usuarioOposiciones.oposicion',
    ],
  });

  if (!usuario) throw new NotFoundException('Usuario no encontrado');

  const activa = usuario.usuarioOposiciones?.find(o => o.activa) || null;
  const { password, usuarioOposiciones, ...usuarioSeguro } = usuario;

  return {
    ...usuarioSeguro,
    oposicionActiva: activa ? activa.oposicion : null,
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
    const conSuscripcion = await this.repo.count({ where: { suscripcion: Not(IsNull()) } });

    const porSuscripcion = await this.repo
      .createQueryBuilder('u')
      .select('u.suscripcion', 'suscripcion')
      .addSelect('COUNT(*)', 'total')
      .where('u.suscripcion IS NOT NULL')
      .groupBy('u.suscripcion')
      .getRawMany();

    const porNivel = await this.repo
      .createQueryBuilder('u')
      .select('u.nivel', 'nivel')
      .addSelect('COUNT(*)', 'total')
      .groupBy('u.nivel')
      .orderBy('u.nivel', 'ASC')
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

      

    return {
      total,
      conSuscripcion,
      sinSuscripcion: total - conSuscripcion,
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
  const temasOrigen = await this.temaRepo.find({ where: { convocatoria: { id: origenId } as any } });
  const temasDestino = await this.temaRepo.find({ where: { convocatoria: { id: destinoId } as any } });

  // Mapa origen -> destino por número de tema (se reutiliza también para ResultadoTest)
  const mapaTemaId: Record<string, string> = {};
  for (const temaOrigen of temasOrigen) {
    const temaDestino = temasDestino.find((t) => t.numero === temaOrigen.numero);
    if (temaDestino) mapaTemaId[temaOrigen.id] = temaDestino.id;
  }

  for (const temaOrigen of temasOrigen) {
    const temaDestino = temasDestino.find((t) => t.numero === temaOrigen.numero);
    if (!temaDestino) continue; // el tema ya no existe en la nueva convocatoria

    // --- Flashcards: emparejar por texto de pregunta ---
    const fcOrigen = await this.flashcardRepo.find({ where: { tema: { id: temaOrigen.id } as any } });
    const fcDestino = await this.flashcardRepo.find({ where: { tema: { id: temaDestino.id } as any } });

    for (const fcO of fcOrigen) {
      const fcD = fcDestino.find((f) => f.pregunta === fcO.pregunta);
      if (!fcD) continue;

      const repasoOrigen = await this.repasoFcRepo.findOne({
        where: { usuario: { id: usuarioId } as any, flashcard: { id: fcO.id } as any },
      });
      if (!repasoOrigen) continue;

      const yaExisteRepaso = await this.repasoFcRepo.findOne({
        where: { usuario: { id: usuarioId } as any, flashcard: { id: fcD.id } as any },
      });
      if (yaExisteRepaso) continue;

      await this.repasoFcRepo.save(this.repasoFcRepo.create({
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
    const apunteOrigen = await this.apunteOploraRepo.findOne({ where: { tema: { id: temaOrigen.id } as any } });
    const apunteDestino = await this.apunteOploraRepo.findOne({ where: { tema: { id: temaDestino.id } as any } });

    if (apunteOrigen && apunteDestino) {
      const progresoOrigen = await this.progresoLecturaRepo.findOne({
        where: { usuario: { id: usuarioId } as any, apunte: { id: apunteOrigen.id } as any },
      });
      if (progresoOrigen) {
        const yaExisteProgreso = await this.progresoLecturaRepo.findOne({
          where: { usuario: { id: usuarioId } as any, apunte: { id: apunteDestino.id } as any },
        });
        if (!yaExisteProgreso) {
          await this.progresoLecturaRepo.save(this.progresoLecturaRepo.create({
            usuario: { id: usuarioId } as any,
            apunte: { id: apunteDestino.id } as any,
            porcentaje: progresoOrigen.porcentaje,
          } as any));
        }
      }
    }

    // --- Notas personales del usuario: se reapuntan directamente al nuevo tema ---
    await this.apunteUsuarioRepo.update(
      { usuario: { id: usuarioId } as any, tema: { id: temaOrigen.id } as any },
      { tema: { id: temaDestino.id } as any },
    );
  }

  // --- ResultadoTest ligados directamente a un tema: se reapuntan al tema equivalente ---
  for (const [origenTemaId, destinoTemaId] of Object.entries(mapaTemaId)) {
    await this.resultadoTestRepo.update(
      { usuario: { id: usuarioId } as any, tema: { id: origenTemaId } as any },
      { tema: { id: destinoTemaId } as any },
    );
  }

  // --- ResultadoTest de tests generales (sin tema propio): re-apuntar temaId dentro de detallePreguntas ---
  const resultadosGenerales = await this.resultadoTestRepo.find({
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
      await this.resultadoTestRepo.update(resultado.id, { detallePreguntas: nuevoDetalle });
    }
  }
}
}
