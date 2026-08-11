import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flashcard, TipoFlashcard, NivelFlashcard } from './flashcard.entity';
import { RepasoFC, EstadoFC } from './repaso-fc.entity';
import { RetoFC, TipoRetoFC, EstadoRetoFC } from './reto-fc.entity';
import { ResultadoRetoFC } from './resultado-reto-fc.entity';
import { NotificacionService } from '../notificacion/notificacion.service';
import { TipoNotificacion, PrioridadNotificacion } from '../notificacion/notificacion.entity';
import { Usuario } from '../usuario/usuario.entity';
import { ConfiguracionService } from '../config/configuracion.service';

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
  ) {}

  // ─── CRUD FLASHCARDS ─────────────────────────────────────

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
  }[]): Promise<{ importadas: number }> {
    for (const fc of flashcards) {
      await this.fcRepo.save(this.fcRepo.create({
        tipo: fc.tipo,
        nivel: fc.nivel,
        pregunta: fc.pregunta,
        respuesta: fc.respuesta,
        explicacion: fc.explicacion,
        esParaDuelo: fc.esParaDuelo ?? (fc.tipo === TipoFlashcard.VF || fc.tipo === TipoFlashcard.ARTICULO),
        articulo: fc.articuloId ? { id: fc.articuloId } as any : undefined,
        tema: fc.temaId ? { id: fc.temaId } as any : undefined,
        oposicion: fc.oposicionId ? { id: fc.oposicionId } as any : undefined,
        creadaPor: 'admin',
      }));
    }
    return { importadas: flashcards.length };
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

  async findParaDuelo(oposicionId: string, limite = 10): Promise<Flashcard[]> {
    return this.fcRepo.find({
      where: { oposicion: { id: oposicionId }, activa: true, esParaDuelo: true },
      take: limite,
      order: { creadoEn: 'ASC' },
    });
  }

  // ─── REPASO ──────────────────────────────────────────────

  async getPendientesRepaso(usuarioId: string, oposicionId: string, limite = 10): Promise<Flashcard[]> {
  const ahora = new Date();

  // FC con repaso pendiente — busca por oposicion, tema o articulo vinculado
  const conRepaso = await this.repasoRepo
    .createQueryBuilder('r')
    .leftJoinAndSelect('r.flashcard', 'fc')
    .leftJoin('fc.articulo', 'art')
    .leftJoin('art.capitulo', 'cap')
    .leftJoin('cap.tituloRef', 'tit')
    .leftJoin('tit.versionLey', 'vl')
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
  repaso.proximoRepaso = new Date(
    ahora.getTime() + nuevoIntervalo * 24 * 60 * 60 * 1000
  );

  const repasoGuardado = await this.repasoRepo.save(repaso);

  // ⭐ Dar puntos solo si acaba de pasar a DOMINADA por primera vez
  if (
    repasoGuardado.estado === EstadoFC.DOMINADA &&
    estadoAnterior !== EstadoFC.DOMINADA
  ) {
    await this.darPuntosPorDominar(usuarioId);
  }

  return repasoGuardado;
}

private async darPuntosPorDominar(usuarioId: string): Promise<void> {
  const puntosAcciones = await this.configuracionService.getPuntosAcciones();
  const puntosPorDominar = puntosAcciones.flashcardDominada ?? 5;

  const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
  if (!usuario) return;

  const nuevosPuntos = usuario.puntos + puntosPorDominar;
  const nuevoNivel = await this.configuracionService.calcularNivelPorPuntos(nuevosPuntos);

  await this.usuarioRepo.update(usuarioId, {
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
      const diasHastaViernes = (5 - fecha.getDay() + 7) % 7 || 7;
      fecha.setDate(fecha.getDate() + diasHastaViernes);
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
  ): Promise<RetoFC> {
    const flashcards = await this.findParaDuelo(oposicionId, numFC);
    if (flashcards.length === 0) throw new BadRequestException('No hay flashcards de duelo disponibles');

    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + 2);

    const reto = await this.retoFcRepo.save(this.retoFcRepo.create({
      tipo: TipoRetoFC.DUELO,
      flashcards,
      fechaFin,
      retador: { id: retadorId } as any,
      oposicion: { id: oposicionId } as any,
    }));

    return reto;
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
    respuestas: { flashcardId: string; correcta: boolean; tiempoRespuesta: number }[],
  ): Promise<ResultadoRetoFC> {
    const reto = await this.retoFcRepo.findOne({
      where: { id: retoId },
      relations: ['resultados', 'resultados.usuario'],
    });
    if (!reto) throw new NotFoundException('Reto FC no encontrado');

    const yaCompletado = reto.resultados?.some(
      (r) => (r.usuario as any).id === usuarioId && r.completado
    );
    if (yaCompletado) throw new BadRequestException('Ya completaste este reto');

    const aciertos = respuestas.filter((r) => r.correcta).length;
    const tiempoTotal = respuestas.reduce((acc, r) => acc + r.tiempoRespuesta, 0);

    // Registrar cada respuesta en el repaso individual
    for (const r of respuestas) {
      await this.registrarRespuesta(usuarioId, r.flashcardId, r.correcta ? 4 : 1, r.tiempoRespuesta);
    }

    const resultado = await this.resultadoRepo.save(this.resultadoRepo.create({
      retoFc: { id: retoId } as any,
      usuario: { id: usuarioId } as any,
      completado: true,
      aciertos,
      fallos: respuestas.length - aciertos,
      tiempoTotal,
      respuestas,
    }));

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

  private async cerrarDuelo(reto: RetoFC): Promise<void> {
    const resultados = await this.resultadoRepo.find({
      where: { retoFc: { id: reto.id }, completado: true },
      relations: ['usuario'],
      order: { aciertos: 'DESC', tiempoTotal: 'ASC' },
    });

    for (let i = 0; i < resultados.length; i++) {
      await this.resultadoRepo.update(resultados[i].id, { posicion: i + 1 });
    }

    await this.retoFcRepo.update(reto.id, { estado: EstadoRetoFC.COMPLETADO });

    if (resultados.length >= 2) {
      const ganador = resultados[0].usuario as any;
      const perdedor = resultados[1].usuario as any;

      await this.notificacionService.crear({
        usuarioId: ganador.id,
        tipo: TipoNotificacion.RETO_RESULTADO,
        titulo: '¡Has ganado el duelo de FC! 🃏',
        mensaje: `Has ganado a ${perdedor.nick ?? perdedor.nombre} con ${resultados[0].aciertos} aciertos`,
        prioridad: PrioridadNotificacion.MEDIA,
      });

      await this.notificacionService.crear({
        usuarioId: perdedor.id,
        tipo: TipoNotificacion.RETO_RESULTADO,
        titulo: 'Duelo de FC finalizado',
        mensaje: `${ganador.nick ?? ganador.nombre} ha ganado el duelo con ${resultados[0].aciertos} aciertos`,
        prioridad: PrioridadNotificacion.MEDIA,
      });
    }
  }

  // ─── STATS ───────────────────────────────────────────────

  async getEstadisticasFC(usuarioId: string, oposicionId: string): Promise<any> {
  const total = await this.fcRepo
    .createQueryBuilder('fc')
    .leftJoin('fc.articulo', 'art')
    .leftJoin('art.capitulo', 'cap')
    .leftJoin('cap.tituloRef', 'tit')
    .leftJoin('tit.versionLey', 'vl')
    .leftJoin('vl.oposicionLeyes', 'ol')
    .leftJoin('fc.tema', 'tema')
    .leftJoin('fc.oposicion', 'opo')
    .where('fc.activa = true')
    .andWhere(
      '(opo.id = :oposicionId OR EXISTS (SELECT 1 FROM convocatorias conv JOIN oposiciones op ON op.id = conv."oposicionId" WHERE conv.id = tema."convocatoriaId" AND op.id = :oposicionId) OR ol.oposicion = :oposicionId)',
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