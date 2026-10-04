import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, In } from 'typeorm';
import { Flashcard, TipoFlashcard, NivelFlashcard } from './flashcard.entity';
import { RepasoFC, EstadoFC } from './repaso-fc.entity';
import { RetoFC, TipoRetoFC, EstadoRetoFC } from './reto-fc.entity';
import { ResultadoRetoFC } from './resultado-reto-fc.entity';
import { NotificacionService } from '../notificacion/notificacion.service';
import { TipoNotificacion, PrioridadNotificacion } from '../notificacion/notificacion.entity';
import { Usuario } from '../usuario/usuario.entity';
import { ConfiguracionService } from '../config/configuracion.service';
import { UsuarioOposicion } from '../usuario/usuario-oposicion.entity';


// ⭐ Tipos corregibles en servidor (respuesta true/false). Los de respuesta libre (hueco,
// artículo) no pueden usarse en duelos porque exigirían autoevaluación.
const TIPOS_DUELO = [TipoFlashcard.VF, TipoFlashcard.TRAMPA];

@Injectable()
export class FlashcardService {
  constructor(
    @InjectRepository(Flashcard)
    private readonly fcRepo: Repository<Flashcard>,
    @InjectRepository(RepasoFC)
    private readonly repasoRepo: Repository<RepasoFC>,
    @InjectRepository(RetoFC)
    private readonly retoFcRepo: Repository<RetoFC>,
    @InjectRepository(ResultadoRetoFC)
    private readonly resultadoRepo: Repository<ResultadoRetoFC>,
    private readonly notificacionService: NotificacionService,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    private readonly configuracionService: ConfiguracionService,
    @InjectRepository(UsuarioOposicion)
    private readonly usuarioOposicionRepo: Repository<UsuarioOposicion>,
    @InjectRepository(Flashcard)
    private readonly flashcardRepo: Repository<Flashcard>,
  ) {}

  // ─── CRUD FLASHCARDS ─────────────────────────────────────

  // ⭐ Antes esto no validaba nada (ni tipo/nivel válidos, ni pregunta/respuesta vacías), no
  // detectaba duplicados dentro del propio lote ni contra el banco existente, y un solo objeto
  // mal formado en 200 tiraba abajo TODO el import con un error genérico de TypeORM sin decir
  // cuál era la fila problemática — exactamente los mismos fallos que ya se corrigieron en la
  // importación de preguntas de test (TestService.importarPorConvocatoria/validarPreguntaImportada).
  // Se replica aquí el mismo patrón: validar fila a fila, seguir con las demás si una falla,
  // y devolver un desglose de qué se importó y qué no (y por qué).
  private validarFlashcardImportada(fc: any): string | null {
    if (!fc || typeof fc !== 'object') return 'la flashcard no es un objeto válido';
    const tiposValidos = Object.values(TipoFlashcard) as string[];
    if (typeof fc.tipo !== 'string' || !tiposValidos.includes(fc.tipo)) {
      return `"tipo" inválido (recibido: ${JSON.stringify(fc.tipo)}); debe ser uno de: ${tiposValidos.join(', ')}`;
    }
    const nivelesValidos = Object.values(NivelFlashcard) as string[];
    if (fc.nivel !== undefined && !nivelesValidos.includes(fc.nivel)) {
      return `"nivel" inválido (recibido: ${JSON.stringify(fc.nivel)}); debe ser uno de: ${nivelesValidos.join(', ')}`;
    }
    if (typeof fc.pregunta !== 'string' || !fc.pregunta.trim()) return 'falta "pregunta" o está vacía';
    if (typeof fc.respuesta !== 'string' || !fc.respuesta.trim()) return 'falta "respuesta" o está vacía';
    if ((fc.tipo === TipoFlashcard.VF || fc.tipo === TipoFlashcard.TRAMPA) && !['true', 'false'].includes(fc.respuesta.trim().toLowerCase())) {
      return `"respuesta" debe ser "true" o "false" para el tipo "${fc.tipo}" (recibido: ${JSON.stringify(fc.respuesta)})`;
    }
    return null;
  }

  async importar(flashcards: {
    tipo: TipoFlashcard;
    nivel: NivelFlashcard;
    pregunta: string;
    respuesta: string;
    explicacion?: string;
    esParaDuelo?: boolean;
    articuloId?: string;
    temaId?: string;
    oposicionId?: string;
  }[]): Promise<{ importadas: number; errores: string[]; sinVincular: number }> {
    const errores: string[] = [];
    const preguntasDeEsteLote = new Set<string>();
    let importadas = 0;
    let sinVincular = 0;

    // ⭐ Antes se hacía un findOne por cada fila del lote (N+1 queries) y la comparación era
    // sensible a mayúsculas/tildes de espacios, así que "¿Qué es...?" y "¿qué es...? " (con un
    // espacio final) se consideraban distintas y colaban duplicados reales. Se trae una sola vez
    // el conjunto de preguntas existentes, normalizado, y se compara en memoria.
    const existentes = await this.fcRepo.find({ select: ['pregunta'] });
    const preguntasExistentes = new Set(
      existentes.map((e) => e.pregunta.trim().toLowerCase()),
    );

    for (const [i, fc] of flashcards.entries()) {
      const etiqueta = `Fila ${i + 1}`;
      const errorValidacion = this.validarFlashcardImportada(fc);
      if (errorValidacion) {
        errores.push(`${etiqueta}: ${errorValidacion}`);
        continue;
      }

      const preguntaNormalizada = fc.pregunta.trim().toLowerCase();
      if (preguntasDeEsteLote.has(preguntaNormalizada)) {
        errores.push(`${etiqueta}: flashcard duplicada dentro del propio lote — "${fc.pregunta.trim().slice(0, 60)}..."`);
        continue;
      }
      if (preguntasExistentes.has(preguntaNormalizada)) {
        errores.push(`${etiqueta}: ya existe una flashcard con esa pregunta en el banco — "${fc.pregunta.trim().slice(0, 60)}..."`);
        continue;
      }
      preguntasDeEsteLote.add(preguntaNormalizada);

      try {
        await this.fcRepo.save(this.fcRepo.create({
          tipo: fc.tipo,
          nivel: fc.nivel ?? NivelFlashcard.BASICO,
          pregunta: fc.pregunta.trim(),
          respuesta: fc.respuesta.trim(),
          explicacion: fc.explicacion,
          esParaDuelo: fc.esParaDuelo ?? (fc.tipo === TipoFlashcard.VF || fc.tipo === TipoFlashcard.ARTICULO),
          articulo: fc.articuloId ? { id: fc.articuloId } as any : undefined,
          tema: fc.temaId ? { id: fc.temaId } as any : undefined,
          oposicion: fc.oposicionId ? { id: fc.oposicionId } as any : undefined,
          creadaPor: 'admin',
        }));
        importadas++;
        if (!fc.temaId && !fc.articuloId) sinVincular++;
      } catch (e: any) {
        // ⭐ Lo más habitual aquí es un temaId/articuloId/oposicionId con un UUID que no existe
        // (violación de FK) — antes esto tiraba abajo el resto del lote entero sin guardar nada.
        errores.push(`${etiqueta}: error al guardar — ${e?.message ?? 'error desconocido'}`);
      }
    }

    return { importadas, errores, sinVincular };
  }

  async findByArticulo(articuloId: string): Promise<Flashcard[]> {
    return this.fcRepo.find({
      where: { articulo: { id: articuloId }, activa: true },
      relations: ['articulo', 'tema'],
    });
  }

  async findByTema(temaId: string): Promise<Flashcard[]> {
  return this.fcRepo
    .createQueryBuilder('fc')
    .leftJoin('fc.articulo', 'art')
    .leftJoin('fc.tema', 'tema')
    .where('fc.activa = true')
    .andWhere(
      `(tema.id = :temaId OR EXISTS (
        SELECT 1 FROM temas_normativa tn 
        WHERE tn."articuloId" = art.id 
        AND tn."temaId" = :temaId
      ))`,
      { temaId }
    )
    .getMany();
}

  async findByOposicion(oposicionId: string): Promise<Flashcard[]> {
    return this.fcRepo.find({
      where: { oposicion: { id: oposicionId }, activa: true },
      relations: ['articulo', 'tema'],
    });
  }

  async findParaDuelo(
    oposicionId: string,
    limite = 10,
    temaId?: string,
    versionLeyId?: string,
  ): Promise<Flashcard[]> {
    // ⭐ Antes findParaDuelo solo filtraba por oposicionId, ignorando temaId. Se añade el mismo
    // patrón "vía tema_normativa" ya usado en findByTema para poder acotar el duelo a un tema,
    // y ahora también por versionLeyId, replicando el join
    // articulo→capitulo→tituloRef→versionLey (o vía sección, o vía título directo) con Brackets
    // tal como en test.service.ts#construirQueryPreguntas.
    if (temaId || versionLeyId) {
      let query = this.fcRepo
        .createQueryBuilder('fc')
        .leftJoin('fc.articulo', 'art')
        .leftJoin('fc.tema', 'tema')
        .where('fc.activa = true')
        .andWhere('fc.esParaDuelo = true')
        .andWhere('fc.tipo IN (:...tiposDuelo)', { tiposDuelo: TIPOS_DUELO });

      if (temaId) {
        query = query.andWhere(
          `(tema.id = :temaId OR EXISTS (
            SELECT 1 FROM temas_normativa tn
            WHERE tn."articuloId" = art.id
            AND tn."temaId" = :temaId
          ))`,
          { temaId },
        );
      }

      if (versionLeyId) {
        query = query
          .leftJoin('art.capitulo', 'capituloDuelo')
          .leftJoin('capituloDuelo.tituloRef', 'tituloViaCapituloDuelo')
          .leftJoin('art.seccion', 'seccionDuelo')
          .leftJoin('seccionDuelo.capitulo', 'capituloViaSeccionDuelo')
          .leftJoin('capituloViaSeccionDuelo.tituloRef', 'tituloViaSeccionDuelo')
          .leftJoin('art.tituloRef', 'tituloDirectoDuelo')
          .andWhere(
            new Brackets((qb) => {
              qb.where('tituloViaCapituloDuelo.versionLeyId = :versionLeyId', { versionLeyId })
                .orWhere('tituloViaSeccionDuelo.versionLeyId = :versionLeyId', { versionLeyId })
                .orWhere('tituloDirectoDuelo.versionLeyId = :versionLeyId', { versionLeyId });
            }),
          );
      }

      return query.orderBy('fc.creadoEn', 'ASC').take(limite).getMany();
    }
    return this.fcRepo.find({
      where: { oposicion: { id: oposicionId }, activa: true, esParaDuelo: true, tipo: In(TIPOS_DUELO) },
      take: limite,
      order: { creadoEn: 'ASC' },
    });
  }

  // ─── REPASO ──────────────────────────────────────────────

  async getPendientesRepaso(usuarioId: string, oposicionId: string, limite = 10): Promise<Flashcard[]> {
  const ahora = new Date();

  // FC con repaso pendiente — busca por oposicion, tema o articulo vinculado
  // ⭐ Antes solo se unía art.capitulo→tituloRef→versionLey, así que las flashcards ligadas a un
  // artículo colgado de una Sección (en vez de directamente de un Capítulo) quedaban invisibles
  // para el repaso. Se añade también el camino art.seccion→capitulo→tituloRef, igual que en
  // test.service.ts#construirQueryPreguntas.
  const conRepaso = await this.repasoRepo
    .createQueryBuilder('r')
    .leftJoinAndSelect('r.flashcard', 'fc')
    .leftJoin('fc.articulo', 'art')
    .leftJoin('art.capitulo', 'cap')
    .leftJoin('cap.tituloRef', 'tit')
    .leftJoin('tit.versionLey', 'vl')
    .leftJoin('art.seccion', 'secc')
    .leftJoin('secc.capitulo', 'capViaSecc')
    .leftJoin('capViaSecc.tituloRef', 'titViaSecc')
    .leftJoin('fc.tema', 'tema')
    .leftJoin('fc.oposicion', 'opo')
    .where('r.usuario = :usuarioId', { usuarioId })
    .andWhere('r.proximoRepaso <= :ahora', { ahora })
    .andWhere(
      '(opo.id = :oposicionId OR EXISTS (SELECT 1 FROM convocatorias conv JOIN oposiciones op ON op.id = conv."oposicionId" WHERE conv.id = tema."convocatoriaId" AND op.id = :oposicionId))',
      { oposicionId }
    )
    .orderBy('r.intervalo', 'DESC')
    .limit(limite)
    .getMany();

  const ids = conRepaso.map((r) => r.flashcard.id);

  // FC nuevas que el usuario no ha visto — busca por las tres vías
  const nuevas = await this.fcRepo
    .createQueryBuilder('fc')
    .leftJoin('fc.repasos', 'r', 'r.usuario = :usuarioId', { usuarioId })
    .leftJoin('fc.articulo', 'art')
    .leftJoin('art.capitulo', 'cap')
    .leftJoin('cap.tituloRef', 'tit')
    .leftJoin('tit.versionLey', 'vl')
    .leftJoin('vl.oposicionLeyes', 'ol')
    // ⭐ Camino "vía sección": el artículo puede colgar de una Sección dentro de un Capítulo
    // (art.seccion → seccion.capitulo → capitulo.tituloRef → tituloRef.versionLey) en vez de
    // colgar directamente de un Capítulo. Sin este segundo camino, las flashcards de artículos
    // dentro de una Sección quedaban invisibles aquí, igual que ya se corrigió en
    // test.service.ts#construirQueryPreguntas.
    .leftJoin('art.seccion', 'secc')
    .leftJoin('secc.capitulo', 'capViaSecc')
    .leftJoin('capViaSecc.tituloRef', 'titViaSecc')
    .leftJoin('titViaSecc.versionLey', 'vlViaSecc')
    .leftJoin('vlViaSecc.oposicionLeyes', 'olViaSecc')
    .leftJoin('fc.tema', 'tema')
    .leftJoin('fc.oposicion', 'opo')
    .where('fc.activa = true')
    .andWhere('r.id IS NULL')
    .andWhere(
      `(opo.id = :oposicionId
        OR EXISTS (
          SELECT 1 FROM convocatorias conv
          JOIN oposiciones op ON op.id = conv."oposicionId"
          WHERE conv.id = tema."convocatoriaId"
          AND op.id = :oposicionId
        )
        OR ol.oposicion = :oposicionId
        OR olViaSecc.oposicion = :oposicionId
        OR EXISTS (
          SELECT 1 FROM temas_normativa tn
          JOIN temas t ON t.id = tn."temaId"
          JOIN convocatorias conv ON conv.id = t."convocatoriaId"
          JOIN oposiciones op ON op.id = conv."oposicionId"
          WHERE tn."articuloId" = art.id
          AND op.id = :oposicionId
        ))`,
      { oposicionId }
    )
    .limit(Math.max(0, limite - ids.length))
    .getMany();

  return [
    ...conRepaso.map((r) => r.flashcard),
    ...nuevas.filter((fc) => !ids.includes(fc.id)),
  ].slice(0, limite);
}

async registrarRespuesta(
  usuarioId: string,
  flashcardId: string,
  calificacion: number,
  tiempoMs: number,
): Promise<RepasoFC> {
  // ⭐ calificacion debe estar en el rango 0-5 que usa el algoritmo SM2; sin esta validación
  // un valor fuera de rango (p.ej. negativo o 100) desestabilizaba el cálculo de factorFacilidad
  // e intervalo de forma silenciosa.
  if (
    typeof calificacion !== 'number' ||
    Number.isNaN(calificacion) ||
    calificacion < 0 ||
    calificacion > 5
  ) {
    throw new BadRequestException('"calificacion" debe ser un número entre 0 y 5');
  }

  let repaso = await this.repasoRepo.findOne({
    where: { usuario: { id: usuarioId }, flashcard: { id: flashcardId } },
  });

  const ahora = new Date();
  const estadoAnterior = repaso?.estado; // ⭐ guardar estado anterior

  if (!repaso) {
    repaso = this.repasoRepo.create({
      usuario: { id: usuarioId } as any,
      flashcard: { id: flashcardId } as any,
      aciertos: 0,
      fallos: 0,
      fallosConsecutivos: 0,
      tiempoMedioRespuesta: tiempoMs,
      factorFacilidad: 2.5,
      intervalo: 0,
      repeticiones: 0,
    });
  }

  const correcta = calificacion >= 3;
  if (correcta) {
    repaso.aciertos++;
    repaso.fallosConsecutivos = 0;
  } else {
    repaso.fallos++;
    repaso.fallosConsecutivos++;
  }

  repaso.tiempoMedioRespuesta = Math.round(
    (repaso.tiempoMedioRespuesta + tiempoMs) / 2
  );

  const { nuevoIntervalo, nuevasRepeticiones, nuevoEF } = this.calcularSM2(
    calificacion,
    repaso.repeticiones,
    repaso.intervalo,
    repaso.factorFacilidad,
  );

  repaso.intervalo = nuevoIntervalo;
  repaso.repeticiones = nuevasRepeticiones;
  repaso.factorFacilidad = nuevoEF;

  if (nuevoEF >= 2.3 && nuevasRepeticiones >= 2) {
    repaso.estado = EstadoFC.DOMINADA;
  } else if (nuevoEF >= 1.8 && nuevasRepeticiones >= 1) {
    repaso.estado = EstadoFC.DUDOSA;
  } else {
    repaso.estado = EstadoFC.NO_DOMINADA;
  }

  repaso.ultimaVista = ahora;
  // ⭐ Antes proximoRepaso se calculaba sumando milisegundos directamente a "ahora", así que una
  // tarjeta repasada a las 23:58 quedaba "pendiente" casi de inmediato en vez de al día siguiente.
  // Se normaliza al mediodía del día objetivo para que el intervalo en días sea consistente
  // independientemente de la hora en la que se responda.
  const proximoRepaso = new Date(ahora);
  proximoRepaso.setDate(proximoRepaso.getDate() + nuevoIntervalo);
  proximoRepaso.setHours(12, 0, 0, 0);
  repaso.proximoRepaso = proximoRepaso;

  const repasoGuardado = await this.repasoRepo.save(repaso);

 if (
    repasoGuardado.estado === EstadoFC.DOMINADA &&
    estadoAnterior !== EstadoFC.DOMINADA
  ) {
    await this.darPuntosPorDominar(usuarioId, flashcardId);
  }

  return repasoGuardado;
}

private async darPuntosPorDominar(usuarioId: string, flashcardId: string): Promise<void> {
  const flashcard = await this.flashcardRepo.findOne({
    where: { id: flashcardId },
    relations: ['oposicion', 'tema', 'tema.convocatoria', 'tema.convocatoria.oposicion'],
  });
  if (!flashcard) return;

  const oposicionId = (flashcard.oposicion as any)?.id
    ?? (flashcard.tema as any)?.convocatoria?.oposicion?.id;
  if (!oposicionId) return;

  const usuarioOposicion = await this.usuarioOposicionRepo.findOne({
    where: { usuario: { id: usuarioId } as any, oposicion: { id: oposicionId } as any },
  });
  if (!usuarioOposicion) return;

  const puntosAcciones = await this.configuracionService.getPuntosAcciones();
  const puntosPorDominar = puntosAcciones.flashcardDominada ?? 5;

  const nuevosPuntos = usuarioOposicion.puntos + puntosPorDominar;
  const nuevoNivel = await this.configuracionService.calcularNivelPorPuntos(nuevosPuntos);

  await this.usuarioOposicionRepo.update(usuarioOposicion.id, {
    puntos: nuevosPuntos,
    nivel: nuevoNivel,
  });
}

  private calcularSM2(
  calificacion: number, // 0-5
  repeticiones: number,
  intervalo: number,
  factorFacilidad: number,
): { nuevoIntervalo: number; nuevasRepeticiones: number; nuevoEF: number } {

  let nuevoEF = factorFacilidad + (0.1 - (5 - calificacion) * (0.08 + (5 - calificacion) * 0.02));
  nuevoEF = Math.max(1.3, nuevoEF);

  if (calificacion < 3) {
    return {
      nuevoIntervalo: 1,
      nuevasRepeticiones: 0,
      nuevoEF,
    };
  }

  let nuevoIntervalo: number;
  if (repeticiones === 0) {
    nuevoIntervalo = 1;
  } else if (repeticiones === 1) {
    nuevoIntervalo = 6;
  } else {
    nuevoIntervalo = Math.round(intervalo * nuevoEF);
  }

  // ⭐ Sin tope, el intervalo crecía sin límite (factorFacilidad compuesto), llevando a repasos
  // programados a años vista. Se limita a un máximo razonable de 365 días.
  nuevoIntervalo = Math.min(nuevoIntervalo, 365);

  return {
    nuevoIntervalo,
    nuevasRepeticiones: repeticiones + 1,
    nuevoEF,
  };
}


  // ─── SUGERENCIA REPASO POR FALLOS EN TEST ────────────────

  async sugerirRepasoArticulo(
    usuarioId: string,
    articuloId: string,
    oposicionId: string,
  ): Promise<{ sugerir: boolean; totalFC: number }> {
    const flashcards = await this.findByArticulo(articuloId);
    return {
      sugerir: flashcards.length > 0,
      totalFC: flashcards.length,
    };
  }

  async programarRepasoArticulo(
    usuarioId: string,
    articuloId: string,
    cuando: 'manana' | 'finde' | Date,
  ): Promise<void> {
    const flashcards = await this.findByArticulo(articuloId);
    if (flashcards.length === 0) return;

    let fecha: Date;
    const ahora = new Date();

    if (cuando === 'manana') {
      fecha = new Date(ahora);
      fecha.setDate(fecha.getDate() + 1);
      fecha.setHours(9, 0, 0, 0);
    } else if (cuando === 'finde') {
      fecha = new Date(ahora);
      // ⭐ 'finde' (fin de semana) debe apuntar al sábado (índice 6), no al viernes (índice 5)
      // como hacía el cálculo anterior.
      const diasHastaSabado = (6 - fecha.getDay() + 7) % 7 || 7;
      fecha.setDate(fecha.getDate() + diasHastaSabado);
      fecha.setHours(10, 0, 0, 0);
    } else {
      fecha = cuando;
    }

    for (const fc of flashcards) {
      let repaso = await this.repasoRepo.findOne({
        where: { usuario: { id: usuarioId }, flashcard: { id: fc.id } },
      });

      if (!repaso) {
        repaso = this.repasoRepo.create({
          usuario: { id: usuarioId } as any,
          flashcard: { id: fc.id } as any,
        });
      }

      repaso.proximoRepaso = fecha;
      await this.repasoRepo.save(repaso);
    }

    // Notificar
    await this.notificacionService.crear({
      usuarioId,
      tipo: TipoNotificacion.RETO_DIARIO,
      titulo: '📚 Repaso programado',
      mensaje: `Tienes ${flashcards.length} flashcards programadas para repasar`,
      prioridad: PrioridadNotificacion.BAJA,
      urlAccion: '/app/flashcards',
    });
  }

  // ─── RETOS FC ────────────────────────────────────────────

  async crearRetoDiarioFC(oposicionId: string): Promise<RetoFC> {
    const flashcards = await this.fcRepo.find({
      where: { oposicion: { id: oposicionId }, activa: true },
      order: { creadoEn: 'ASC' },
      take: 10,
    });

    const fechaFin = new Date();
    fechaFin.setHours(23, 59, 59, 999);

    return this.retoFcRepo.save(this.retoFcRepo.create({
      tipo: TipoRetoFC.DIARIO,
      flashcards,
      fechaFin,
      oposicion: { id: oposicionId } as any,
    }));
  }

  async crearDueloFC(
    retadorId: string,
    retadoNickOEmail: string,
    oposicionId: string,
    numFC = 5,
    temaId?: string,
    versionLeyId?: string,
    mensaje?: string,
    horasPlazo?: number,
  ): Promise<RetoFC> {
    // ⭐ Reescrito por completo: la versión anterior recibía retadoNickOEmail pero nunca lo
    // usaba, así que el campo "retado" del RetoFC nunca se rellenaba (el duelo no tenía
    // segundo participante). Se replica el mismo patrón de validación que
    // reto.service.ts#crearRetoUsuario: buscar por nick y luego por email, rechazar auto-reto,
    // y comprobar que ambos usuarios están vinculados a la oposición en la misma convocatoria.
    const retador = await this.usuarioRepo.findOne({ where: { id: retadorId } });
    if (!retador) throw new NotFoundException('Retador no encontrado');

    const busqueda = retadoNickOEmail.toLowerCase().trim();
    let retado = await this.usuarioRepo.findOne({ where: { nick: busqueda } });
    if (!retado) retado = await this.usuarioRepo.findOne({ where: { email: busqueda } });
    if (!retado) throw new NotFoundException('Usuario no encontrado con ese nick o email');
    if (retado.id === retadorId) throw new BadRequestException('No puedes retarte a ti mismo');

    const retadorOposicion = await this.usuarioOposicionRepo.findOne({
      where: { usuario: { id: retadorId } as any, oposicion: { id: oposicionId } as any },
      relations: ['convocatoriaActiva'],
    });
    if (!retadorOposicion) throw new BadRequestException('No estás vinculado a esta oposición');

    const retadoOposicion = await this.usuarioOposicionRepo.findOne({
      where: { usuario: { id: retado.id } as any, oposicion: { id: oposicionId } as any },
      relations: ['convocatoriaActiva'],
    });
    if (!retadoOposicion) {
      throw new BadRequestException(`${retado.nick ?? retado.nombre} no está preparando esta oposición`);
    }

    const convocatoriaRetador = (retadorOposicion as any).convocatoriaActiva?.id;
    const convocatoriaRetado = (retadoOposicion as any).convocatoriaActiva?.id;
    if (convocatoriaRetador !== convocatoriaRetado) {
      throw new BadRequestException(`${retado.nick ?? retado.nombre} está en una convocatoria distinta a la tuya`);
    }

    // ⭐ Tope de nº de tarjetas (igual que el clamp 1-30 de los retos de test).
    const numFCFinal = Math.min(Math.max(Math.trunc(numFC) || 5, 1), 30);
    const flashcards = await this.findParaDuelo(oposicionId, numFCFinal, temaId, versionLeyId);
    if (flashcards.length === 0) throw new BadRequestException('No hay flashcards de duelo disponibles');

    // ⭐ Plazo configurable (antes fijo a 48h): mismo criterio que crearRetoUsuario de test.
    const horasPlazoFinal = horasPlazo && horasPlazo > 0 ? Math.min(horasPlazo, 24 * 14) : 48;
    const fechaFin = new Date();
    fechaFin.setHours(fechaFin.getHours() + horasPlazoFinal);
    const mensajeLimpio = mensaje?.trim().slice(0, 140) || null;

    const reto = await this.retoFcRepo.save(this.retoFcRepo.create({
      tipo: TipoRetoFC.DUELO,
      flashcards,
      fechaFin,
      mensaje: mensajeLimpio,
      tema: temaId ? ({ id: temaId } as any) : undefined,
      retador: { id: retadorId } as any,
      retado: { id: retado.id } as any,
      oposicion: { id: oposicionId } as any,
    }));

    await this.notificacionService.crear({
      usuarioId: retado.id,
      tipo: TipoNotificacion.RETO_RECIBIDO,
      titulo: '🃏 ¡Nuevo duelo de flashcards!',
      mensaje: `${retador.nick ?? retador.nombre} te ha retado a un duelo de flashcards${mensajeLimpio ? `: "${mensajeLimpio}"` : ''}`,
      prioridad: PrioridadNotificacion.MEDIA,
      urlAccion: `/app/retos/fc/${reto.id}`,
    });

    return reto;
  }

  // ⭐ Cancelar (retador) o rechazar (retado) un duelo de FC: mismas guardas que
  // reto.service.ts#eliminarRetoUsuario de test.
  async eliminarDueloFC(retoId: string, usuarioId: string): Promise<void> {
    const reto = await this.retoFcRepo.findOne({
      where: { id: retoId },
      relations: ['retador', 'retado', 'resultados', 'resultados.usuario'],
    });
    if (!reto) throw new NotFoundException('Reto no encontrado');
    if (reto.tipo !== TipoRetoFC.DUELO) {
      throw new BadRequestException('Solo se pueden eliminar duelos entre usuarios');
    }

    const esParticipante = (reto.retador as any)?.id === usuarioId || (reto.retado as any)?.id === usuarioId;
    if (!esParticipante) throw new ForbiddenException('No tienes acceso a este reto');

    const miResultado = reto.resultados?.find((r) => (r.usuario as any)?.id === usuarioId);
    if (miResultado?.completado) {
      throw new BadRequestException('No puedes cancelar un reto que ya has completado');
    }
    if (reto.estado === EstadoRetoFC.COMPLETADO) {
      throw new BadRequestException('Este reto ya se ha completado y no se puede cancelar');
    }

    await this.resultadoRepo.delete({ retoFc: { id: retoId } as any });
    await this.retoFcRepo.delete(retoId);
  }

  async enviarFCPersonal(
    remiteteId: string,
    destinatarioId: string,
    flashcardId: string,
    mensaje?: string,
  ): Promise<void> {
    const fc = await this.fcRepo.findOne({ where: { id: flashcardId } });
    if (!fc) throw new NotFoundException('Flashcard no encontrada');

    await this.notificacionService.crear({
      usuarioId: destinatarioId,
      tipo: TipoNotificacion.RETO_RECIBIDO,
      titulo: '📬 Te han enviado una flashcard',
      mensaje: mensaje ?? `Alguien te ha enviado una flashcard para repasar: "${fc.pregunta.slice(0, 60)}..."`,
      prioridad: PrioridadNotificacion.BAJA,
      urlAccion: `/app/flashcards/${flashcardId}`,
      metadata: { flashcardId, remiteteId },
    });
  }

async getEstadisticasFCTema(
  usuarioId: string,
  oposicionId: string,
  temaId: string,
): Promise<any> {

  const existsSubquery = `EXISTS (SELECT 1 FROM temas_normativa tn WHERE tn."articuloId" = art.id AND tn."temaId" = :temaId)`;

  // Total flashcards del tema
  const total = await this.fcRepo
    .createQueryBuilder('fc')
    .leftJoin('fc.articulo', 'art')
    .leftJoin('fc.tema', 'tema')
    .where('fc.activa = true')
    .andWhere(`(tema.id = :temaId OR ${existsSubquery})`, { temaId })
    .getCount();

  // Stats del usuario para esas flashcards
  const repasos = await this.repasoRepo
    .createQueryBuilder('r')
    .leftJoin('r.flashcard', 'fc')
    .leftJoin('fc.tema', 'tema')
    .leftJoin('fc.articulo', 'art')
    .where('r.usuario = :usuarioId', { usuarioId })
    .andWhere(`(tema.id = :temaId OR ${existsSubquery})`, { temaId })
    .getMany();

  const dominadas = repasos.filter(r => r.estado === EstadoFC.DOMINADA).length;
  const dudosas = repasos.filter(r => r.estado === EstadoFC.DUDOSA).length;
  const noDominadas = repasos.filter(r => r.estado === EstadoFC.NO_DOMINADA).length;

  return {
    total,
    dominadas,
    dudosas,
    noDominadas,
    sinVer: Math.max(0, total - dominadas - dudosas - noDominadas),
  };
}


async getEstadisticasFCPorPeriodo(usuarioId: string, oposicionId: string) {
  const ahora = new Date();
  const inicioHoy = new Date(ahora); inicioHoy.setHours(0, 0, 0, 0);
  const inicioSemana = new Date(ahora); inicioSemana.setDate(ahora.getDate() - 7);
  const inicioMes = new Date(ahora); inicioMes.setDate(ahora.getDate() - 30);

  // Todos los repasos del usuario para flashcards de esa oposición
  const repasos = await this.repasoRepo
    .createQueryBuilder('r')
    .leftJoin('r.flashcard', 'fc')
    .leftJoin('fc.tema', 'tema')
    .leftJoin('tema.convocatoria', 'conv')
    .leftJoin('conv.oposicion', 'op')
    .leftJoin('fc.oposicion', 'fcOp')
    .where('r.usuario = :usuarioId', { usuarioId })
    .andWhere('(op.id = :oposicionId OR fcOp.id = :oposicionId)', { oposicionId })
    .getMany();

  const calcular = (desde: Date | null) => {
    const filtrados = desde
      ? repasos.filter((r) => r.ultimaVista && r.ultimaVista >= desde)
      : repasos;

    const total = filtrados.length;
    const dominadas = filtrados.filter((r) => r.estado === EstadoFC.DOMINADA).length;
    const porcentajeDominadas = total > 0 ? Math.round((dominadas / total) * 100) : 0;

    return { total, dominadas, porcentajeDominadas };
  };

  return {
    dia: calcular(inicioHoy),
    semana: calcular(inicioSemana),
    mes: calcular(inicioMes),
    total: calcular(null),
  };
}

  async completarRetoFC(
    retoId: string,
    usuarioId: string,
    respuestas: { flashcardId: string; respuesta?: boolean; correcta?: boolean; tiempoRespuesta: number }[],
  ): Promise<ResultadoRetoFC> {
    const reto = await this.retoFcRepo.findOne({
      where: { id: retoId },
      relations: ['resultados', 'resultados.usuario', 'flashcards', 'retador', 'retado'],
    });
    if (!reto) throw new NotFoundException('Reto FC no encontrado');

    // ⭐ Antes no se comprobaba que usuarioId fuera realmente el retador o el retado de este
    // reto — cualquier usuario autenticado podía "completar" el reto de otro.
    const retadorId = (reto.retador as any)?.id;
    const retadoId = (reto.retado as any)?.id;
    const esParticipante = usuarioId === retadorId || usuarioId === retadoId;
    if (!esParticipante) {
      throw new ForbiddenException('No eres participante de este reto');
    }

    // ⭐ Antes no se validaba que las flashcardId respondidas pertenecieran realmente a las
    // flashcards congeladas del reto — se podían colar ids arbitrarias.
    const idsValidos = new Set((reto.flashcards ?? []).map((fc) => fc.id));
    const idsInvalidos = respuestas
      .map((r) => r.flashcardId)
      .filter((id) => !idsValidos.has(id));
    if (idsInvalidos.length > 0) {
      throw new BadRequestException(
        `Las siguientes flashcards no pertenecen a este reto: ${idsInvalidos.join(', ')}`,
      );
    }

    const yaCompletado = reto.resultados?.some(
      (r) => (r.usuario as any).id === usuarioId && r.completado
    );
    if (yaCompletado) throw new BadRequestException('Ya completaste este reto');

    // ⭐ Igual que en test: se exige una respuesta por flashcard (sin repetidas ni parciales).
    const totalEsperadas = (reto.flashcards ?? []).length;
    if (
      respuestas.length !== totalEsperadas ||
      new Set(respuestas.map((r) => r.flashcardId)).size !== totalEsperadas
    ) {
      throw new BadRequestException(
        'El número de respuestas no coincide con el número de flashcards del reto',
      );
    }

    // ⭐ Antes se podía completar (y puntuar) un duelo ya vencido: se rechaza igual que en
    // reto.service.ts#completarReto de test.
    if (
      reto.tipo === TipoRetoFC.DUELO &&
      (reto.estado === EstadoRetoFC.EXPIRADO || (reto.fechaFin && new Date(reto.fechaFin) < new Date()))
    ) {
      if (reto.estado !== EstadoRetoFC.EXPIRADO) {
        await this.retoFcRepo.update(reto.id, { estado: EstadoRetoFC.EXPIRADO });
      }
      throw new BadRequestException('Este reto ya ha expirado, no puedes completarlo');
    }

    // ⭐ Corrección en servidor (como en test): en los duelos el cliente solo envía lo que
    // contestó (verdadero/falso) y aquí se calcula si es correcto; nunca se fía de `correcta`.
    if (reto.tipo === TipoRetoFC.DUELO) {
      const porId = new Map((reto.flashcards ?? []).map((fc) => [fc.id, fc]));
      for (const r of respuestas) {
        if (typeof r.respuesta !== 'boolean') {
          throw new BadRequestException('Falta la respuesta de alguna flashcard');
        }
        const fc = porId.get(r.flashcardId)!;
        r.correcta = r.respuesta === (String(fc.respuesta).trim().toLowerCase() === 'true');
      }
    }
    for (const r of respuestas) {
      r.tiempoRespuesta = Math.max(0, Number(r.tiempoRespuesta) || 0);
      r.correcta = !!r.correcta;
    }

    const aciertos = respuestas.filter((r) => r.correcta).length;
    const tiempoTotal = respuestas.reduce((acc, r) => acc + r.tiempoRespuesta, 0);

    // ⭐ Antes el bucle de registrarRespuesta y el guardado del resultado no estaban en una
    // transacción: si el proceso fallaba a mitad del bucle, quedaban repasos SM2 actualizados
    // sin fila de resultado, y el usuario podía volver a responder y "doblar" los puntos.
    // Se envuelve todo en una transacción del manager de resultadoRepo.
    const resultado = await this.resultadoRepo.manager.transaction(async (manager) => {
      // ⭐ Bloqueo por (reto, usuario): dos envíos simultáneos se serializan y el segundo ve
      // el resultado ya guardado, así que no se duplica resultado ni se re-puntúa.
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`retofc:${retoId}:${usuarioId}`]);
      const previo = await manager.findOne(ResultadoRetoFC, {
        where: { retoFc: { id: retoId } as any, usuario: { id: usuarioId } as any, completado: true },
      });
      if (previo) throw new BadRequestException('Ya completaste este reto');

      for (const r of respuestas) {
        await this.registrarRespuesta(usuarioId, r.flashcardId, r.correcta ? 4 : 1, r.tiempoRespuesta);
      }

      return manager.save(
        manager.create(ResultadoRetoFC, {
          retoFc: { id: retoId } as any,
          usuario: { id: usuarioId } as any,
          completado: true,
          aciertos,
          fallos: respuestas.length - aciertos,
          tiempoTotal,
          respuestas,
        }),
      );
    });

    // Si es duelo y ambos completaron — determinar ganador
    if (reto.tipo === TipoRetoFC.DUELO) {
      const todosCompletos = await this.resultadoRepo.count({
        where: { retoFc: { id: retoId }, completado: true },
      });
      if (todosCompletos >= 2) {
        await this.cerrarDuelo(reto);
      }
    }

    return resultado;
  }

  // ⭐ Cierre del duelo igualado al de test (reto.service.ts#cerrarRetoUsuario): empates reales
  // comparten posición (antes se asignaba posicion = i + 1 por orden de BD, así que un empate
  // daba un ganador arbitrario), notificación de empate y bonus de puntos solo por ganar.
  private async cerrarDuelo(reto: RetoFC): Promise<void> {
    // Guarda atómica: si los dos rivales terminan a la vez, solo una petición llega a cerrar
    // (la otra afecta 0 filas) y no se duplican posiciones, notificaciones ni bonus.
    const cierre = await this.retoFcRepo
      .createQueryBuilder()
      .update(RetoFC)
      .set({ estado: EstadoRetoFC.COMPLETADO })
      .where('id = :id AND estado <> :completado', { id: reto.id, completado: EstadoRetoFC.COMPLETADO })
      .execute();
    if (!cierre.affected) return;

    const resultados = await this.resultadoRepo.find({
      where: { retoFc: { id: reto.id }, completado: true },
      relations: ['usuario'],
      order: { aciertos: 'DESC', tiempoTotal: 'ASC' },
    });
    if (resultados.length < 2) return;

    const mismoResultado = (a: ResultadoRetoFC, b: ResultadoRetoFC) =>
      a.aciertos === b.aciertos && a.tiempoTotal === b.tiempoTotal;

    const mejor = resultados[0];
    const ganadores = resultados.filter((r) => mismoResultado(r, mejor));
    const empateGeneral = ganadores.length === resultados.length;

    // Posiciones: los empatados comparten puesto; el resto se numera a continuación.
    let posicionActual = 1;
    let i = 0;
    while (i < resultados.length) {
      const actual = resultados[i];
      const empatados = resultados.filter((r) => mismoResultado(r, actual));
      for (const r of empatados) {
        await this.resultadoRepo.update(r.id, { posicion: posicionActual });
      }
      i += empatados.length;
      posicionActual += empatados.length;
    }

    if (empateGeneral) {
      for (const r of resultados) {
        await this.notificacionService.crear({
          usuarioId: (r.usuario as any).id,
          tipo: TipoNotificacion.RETO_RESULTADO,
          titulo: '¡Empate en el duelo de FC! 🤝',
          mensaje: `Habéis empatado con ${mejor.aciertos} aciertos`,
          prioridad: PrioridadNotificacion.MEDIA,
        });
      }
      return;
    }

    const retoConOposicion = await this.retoFcRepo.findOne({ where: { id: reto.id }, relations: ['oposicion'] });
    const oposicionId = (retoConOposicion?.oposicion as any)?.id;

    for (const r of resultados) {
      const usuario = r.usuario as any;
      const esGanador = ganadores.some((g) => g.id === r.id);
      if (esGanador) {
        const rival = resultados.find((x) => x.id !== r.id)?.usuario as any;
        await this.notificacionService.crear({
          usuarioId: usuario.id,
          tipo: TipoNotificacion.RETO_RESULTADO,
          titulo: '¡Has ganado el duelo de FC! 🃏',
          mensaje: rival
            ? `Has ganado a ${rival.nick ?? rival.nombre} con ${r.aciertos} aciertos`
            : `Has terminado con ${r.aciertos} aciertos`,
          prioridad: PrioridadNotificacion.MEDIA,
        });
        // ⭐ Puntos de FC solo por victoria (los aciertos ya puntúan al dominar cada tarjeta).
        if (oposicionId) await this.darBonusVictoriaFC(usuario.id, oposicionId);
      } else {
        const ganador = ganadores[0]?.usuario as any;
        await this.notificacionService.crear({
          usuarioId: usuario.id,
          tipo: TipoNotificacion.RETO_RESULTADO,
          titulo: 'Duelo de FC finalizado',
          mensaje: `${ganador.nick ?? ganador.nombre} ha ganado el duelo con ${mejor.aciertos} aciertos`,
          prioridad: PrioridadNotificacion.MEDIA,
        });
      }
    }
  }

  // ⭐ Bonus por ganar un duelo de FC: mismo valor configurable (`ganarReto`) que en test,
  // con incremento atómico en BD y recálculo de nivel.
  private async darBonusVictoriaFC(usuarioId: string, oposicionId: string): Promise<void> {
    const usuarioOposicion = await this.usuarioOposicionRepo.findOne({
      where: { usuario: { id: usuarioId } as any, oposicion: { id: oposicionId } as any },
    });
    if (!usuarioOposicion) return;

    const puntosAcciones = await this.configuracionService.getPuntosAcciones();
    const bonus = puntosAcciones.ganarReto ?? 20;
    if (!bonus) return;

    await this.usuarioOposicionRepo.increment({ id: usuarioOposicion.id }, 'puntos', bonus);
    const actualizado = await this.usuarioOposicionRepo.findOne({ where: { id: usuarioOposicion.id } });
    if (!actualizado) return;

    const nuevoNivel = await this.configuracionService.calcularNivelPorPuntos(actualizado.puntos);
    if (nuevoNivel !== actualizado.nivel) {
      await this.usuarioOposicionRepo.update(usuarioOposicion.id, { nivel: nuevoNivel });
    }
  }

  // ⭐ No existía ningún listado de duelos de FC: crearDueloFC guardaba el RetoFC pero no había
  // forma de recuperarlo desde el frontend salvo por id directo. Se replica el patrón de
  // reto.service.ts#getMisRetos (retos donde el usuario es retador o retado, con relaciones
  // cargadas y ordenados por fecha de creación descendente).
  async getMisRetosFC(usuarioId: string): Promise<RetoFC[]> {
    const retos = await this.retoFcRepo
      .createQueryBuilder('reto')
      .leftJoinAndSelect('reto.retador', 'retador')
      .leftJoinAndSelect('reto.retado', 'retado')
      .leftJoinAndSelect('reto.oposicion', 'oposicion')
      .leftJoinAndSelect('reto.tema', 'tema')
      .leftJoinAndSelect('reto.resultados', 'resultados')
      .leftJoinAndSelect('resultados.usuario', 'resultadoUsuario')
      .where('retador.id = :usuarioId', { usuarioId })
      .orWhere('retado.id = :usuarioId', { usuarioId })
      .orderBy('reto.creadoEn', 'DESC')
      .getMany();

    // ⭐ Expiración "al vuelo": ningún cron marcaba como EXPIRADO los duelos de FC
    // cuyo plazo ya pasó, así que se quedaban eternamente en "en curso". Se marcan
    // aquí antes de devolverlos (y se refleja en memoria) para que el frontend los
    // mande a Historial.
    const ahora = new Date();
    const vencidos = retos.filter(
      (r) =>
        r.tipo === TipoRetoFC.DUELO &&
        (r.estado === EstadoRetoFC.ACTIVO || r.estado === EstadoRetoFC.PENDIENTE) &&
        r.fechaFin &&
        new Date(r.fechaFin) < ahora,
    );
    if (vencidos.length > 0) {
      await this.retoFcRepo.update(vencidos.map((r) => r.id), { estado: EstadoRetoFC.EXPIRADO });
      for (const r of vencidos) r.estado = EstadoRetoFC.EXPIRADO;
    }

    // ⭐ No se envía la solución de las tarjetas de un duelo que el usuario aún no ha jugado:
    // la corrección es en servidor y así no se puede mirar en la respuesta de red.
    for (const r of retos) {
      const completado = r.resultados?.some((x: any) => x.usuario?.id === usuarioId && x.completado);
      if (r.tipo === TipoRetoFC.DUELO && !completado) {
        r.flashcards = (r.flashcards ?? []).map((fc) => ({ ...fc, respuesta: undefined, explicacion: undefined }) as any);
      }
    }

    return retos;
  }

  // ─── STATS ───────────────────────────────────────────────

  async getEstadisticasFC(usuarioId: string, oposicionId: string): Promise<any> {
  // ⭐ Igual que en getPendientesRepaso, se añade el camino "vía sección"
  // (art.seccion→capitulo→tituloRef→versionLey) para no dejar fuera del total las flashcards
  // de artículos colgados de una Sección.
  const total = await this.fcRepo
    .createQueryBuilder('fc')
    .leftJoin('fc.articulo', 'art')
    .leftJoin('art.capitulo', 'cap')
    .leftJoin('cap.tituloRef', 'tit')
    .leftJoin('tit.versionLey', 'vl')
    .leftJoin('vl.oposicionLeyes', 'ol')
    .leftJoin('art.seccion', 'secc')
    .leftJoin('secc.capitulo', 'capViaSecc')
    .leftJoin('capViaSecc.tituloRef', 'titViaSecc')
    .leftJoin('titViaSecc.versionLey', 'vlViaSecc')
    .leftJoin('vlViaSecc.oposicionLeyes', 'olViaSecc')
    .leftJoin('fc.tema', 'tema')
    .leftJoin('fc.oposicion', 'opo')
    .where('fc.activa = true')
    .andWhere(
      '(opo.id = :oposicionId OR EXISTS (SELECT 1 FROM convocatorias conv JOIN oposiciones op ON op.id = conv."oposicionId" WHERE conv.id = tema."convocatoriaId" AND op.id = :oposicionId) OR ol.oposicion = :oposicionId OR olViaSecc.oposicion = :oposicionId)',
      { oposicionId }
    )
    .getCount();

  const dominadas = await this.repasoRepo.count({
    where: { usuario: { id: usuarioId }, estado: EstadoFC.DOMINADA },
  });

  const dudosas = await this.repasoRepo.count({
    where: { usuario: { id: usuarioId }, estado: EstadoFC.DUDOSA },
  });

  const noDominadas = await this.repasoRepo.count({
    where: { usuario: { id: usuarioId }, estado: EstadoFC.NO_DOMINADA },
  });

  return {
    total,
    dominadas,
    dudosas,
    noDominadas,
    sinVer: Math.max(0, total - dominadas - dudosas - noDominadas),
  };
}
}