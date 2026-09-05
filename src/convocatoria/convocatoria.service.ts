import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Convocatoria, EstadoConvocatoria } from './convocatoria.entity';
import { DocumentoConvocatoria } from './documento-convocatoria.entity';
import { CreateConvocatoriaDto, UpdateConvocatoriaDto } from './convocatoria.dto';
import { Oposicion } from '../oposicion/oposicion.entity';
import { Tema } from '../tema/tema.entity';
import { NotaArticulo } from '../normativa/nota-articulo.entity';
import { TemaNormativa } from '../tema/tema-normativa.entity';
import { UsuarioOposicion } from '../usuario/usuario-oposicion.entity';
import { NotificacionService } from '../notificacion/notificacion.service';
import { TemaService } from '../tema/tema.service';
import { Flashcard } from '../flashcard/flashcard.entity';
import { ApunteOplora } from '../apunte-oplora/apunte-oplora.entity';
import { PreguntaTest } from '../test/pregunta-test.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LessThanOrEqual } from 'typeorm';


@Injectable()
export class ConvocatoriaService {
  constructor(
    @InjectRepository(Convocatoria)
    private readonly convocatoriaRepo: Repository<Convocatoria>,
    @InjectRepository(DocumentoConvocatoria)
    private readonly documentoRepo: Repository<DocumentoConvocatoria>,
    @InjectRepository(Oposicion)
    private readonly oposicionRepo: Repository<Oposicion>,
    @InjectRepository(Tema)
    private readonly temaRepo: Repository<Tema>,
    @InjectRepository(NotaArticulo)
    private readonly notaRepo: Repository<NotaArticulo>,
    @InjectRepository(TemaNormativa)
    private readonly temaNormativaRepo: Repository<TemaNormativa>,
    @InjectRepository(UsuarioOposicion) // ⭐ nuevo
    private readonly usuarioOposicionRepo: Repository<UsuarioOposicion>,
    private readonly temaService: TemaService,
    private readonly notificacionService: NotificacionService, 
    @InjectRepository(Flashcard)
    private readonly flashcardRepo: Repository<Flashcard>,
    @InjectRepository(ApunteOplora)
    private readonly apunteOploraRepo: Repository<ApunteOplora>,
    @InjectRepository(PreguntaTest)
    private readonly preguntaTestRepo: Repository<PreguntaTest>,
  ) {}

  findByOposicion(oposicionId: string): Promise<Convocatoria[]> {
    return this.convocatoriaRepo.find({
      where: { oposicion: { id: oposicionId } },
      relations: ['documentos'],
      order: { anyo: 'DESC' },
    });
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async revisarNotificacionesConvocatoriaPendientes() {
  const ahora = new Date();

  const pendientes = await this.convocatoriaRepo.find({
    where: {
      notificacionCambioEnviada: false,
      notificarCambioEn: LessThanOrEqual(ahora),
    } as any,
    relations: ['oposicion'],
  });

  for (const conv of pendientes) {
    const origenId = (conv as any).convocatoriaOrigenId;
    if (!origenId) continue;

    const usuariosVinculados = await this.usuarioOposicionRepo.find({
      where: { convocatoriaActiva: { id: origenId } },
      relations: ['usuario'],
    });

    for (const uo of usuariosVinculados) {
      await this.notificacionService.crear({
        usuarioId: (uo.usuario as any).id,
        tipo: 'nueva_convocatoria' as any,
        titulo: `Nueva convocatoria ${conv.anyo} disponible`,
        mensaje: `Ya está disponible la convocatoria ${conv.anyo} de tu oposición. ¿Quieres cambiarte?`,
        prioridad: 'alta' as any,
        urlAccion: `/app/oposicion/${conv.oposicion.id}/cambiar-convocatoria`,
      });
    }

    await this.convocatoriaRepo.update(conv.id, { notificacionCambioEnviada: true } as any);
  }
}


  async findDocumentosByHash(hash: string, convocatoriaId: string) {
  return this.documentoRepo.find({
    where: { hashContenido: hash, convocatoria: { id: convocatoriaId } },
  });
}

  async actualizarPlazo(id: string, inicio: Date, fin: Date): Promise<void> {
  await this.convocatoriaRepo.update(id, {
    plazoInscripcionInicio: inicio,
    plazoInscripcionFin: fin,
  });
}

  async findOne(id: string): Promise<Convocatoria> {
    const c = await this.convocatoriaRepo.findOne({
      where: { id },
      relations: ['oposicion', 'documentos'],
    });
    if (!c) throw new NotFoundException(`Convocatoria ${id} no encontrada`);
    return c;
  }

  findActivas(): Promise<Convocatoria[]> {
  return this.convocatoriaRepo.find({
    where: { estado: 'activa' as any },
    relations: ['oposicion'],
  });
}

  findActivasConUrl(): Promise<Convocatoria[]> {
    return this.convocatoriaRepo
      .createQueryBuilder('c')
      .where('c.estado = :estado', { estado: 'activa' })
      .andWhere('c.urlInap IS NOT NULL')
      .getMany();
  }

 async create(dto: CreateConvocatoriaDto): Promise<Convocatoria> {
  const convocatoria = this.convocatoriaRepo.create({
    anyo: dto.anyo,
    plazas: dto.plazas,
    estado: dto.estado,
    fechaExamen: dto.fechaExamen,
    urlInap: dto.urlInap,
    fechaConvocatoria: dto.fechaConvocatoria ? new Date(dto.fechaConvocatoria) : undefined,
    numeroSolicitudes: dto.numeroSolicitudes,
    numeroPresentados: dto.numeroPresentados,
    oposicion: { id: dto.oposicionId } as any,
  });

  const resultado = await this.convocatoriaRepo.save(convocatoria);

  // Actualizar estado de la oposición según si hay convocatoria activa
  await this.actualizarEstadoOposicion(dto.oposicionId);

  return resultado;
}

private async actualizarEstadoOposicion(oposicionId: string): Promise<void> {
  const convocatoriaActiva = await this.convocatoriaRepo.findOne({
    where: { oposicion: { id: oposicionId }, estado: EstadoConvocatoria.ACTIVA },
  });

  await this.oposicionRepo.update(oposicionId, {
    activa: !!convocatoriaActiva,
  });
}

  async update(id: string, dto: UpdateConvocatoriaDto): Promise<Convocatoria> {
  await this.findOne(id);

  const payload: any = { ...dto };

  // Convertir cadenas vacías en null para campos de fecha
  if (payload.fechaConvocatoria === '') payload.fechaConvocatoria = null;
  if (payload.fechaExamen === '') payload.fechaExamen = null;
  if (payload.plazoInscripcionInicio === '') payload.plazoInscripcionInicio = null;
  if (payload.plazoInscripcionFin === '') payload.plazoInscripcionFin = null;

  // Convertir cadenas vacías en null para campos numéricos
  if (payload.numeroSolicitudes === '' as any) payload.numeroSolicitudes = null;
  if (payload.numeroPresentados === '' as any) payload.numeroPresentados = null;

  await this.convocatoriaRepo.update(id, payload);
  const convocatoria = await this.findOne(id);
  await this.actualizarEstadoOposicion((convocatoria.oposicion as any).id);
  return convocatoria;
}

async remove(id: string): Promise<void> {
  const convocatoria = await this.convocatoriaRepo.findOne({ where: { id } });
  if (!convocatoria) throw new NotFoundException('Convocatoria no encontrada');

  // Bloquear el borrado si hay usuarios activos en esta convocatoria
  const usuariosAfectados = await this.usuarioOposicionRepo
    .createQueryBuilder('uo')
    .where('uo."convocatoriaActivaId" = :id', { id })
    .getCount();

  if (usuariosAfectados > 0) {
    throw new BadRequestException(
      `No se puede borrar esta convocatoria: ${usuariosAfectados} usuario(s) la tienen como convocatoria activa. Cámbialos de convocatoria antes de borrarla.`,
    );
  }

  // Borrar documentos asociados
  await this.documentoRepo.delete({ convocatoria: { id } as any });

  // Borrar temas asociados (reutilizando la limpieza completa en cascada)
  const temas = await this.temaRepo.find({ where: { convocatoria: { id } as any } });
  for (const tema of temas) {
    await this.temaService.remove(tema.id);
  }

  // Finalmente, la convocatoria
  await this.convocatoriaRepo.delete(id);
}

  async saveDocumento(datos: Partial<DocumentoConvocatoria>): Promise<DocumentoConvocatoria> {
  console.log('Intentando guardar documento:', datos.titulo, datos.urlPdf);
  try {
    const doc = this.documentoRepo.create(datos);
    const guardado = await this.documentoRepo.save(doc);
    console.log('Documento guardado con id:', guardado.id);
    return guardado;
  } catch (error: any) {
    console.error('ERROR guardando documento:', error.message);
    throw error;
  }
}

  async findDocumentosByUrl(url: string, convocatoriaId: string) {
  const existentes = await this.documentoRepo.find({
    where: { urlPdf: url, convocatoria: { id: convocatoriaId } },
  });
  return existentes;
}

  findDocumentosByConvocatoria(convocatoriaId: string): Promise<DocumentoConvocatoria[]> {
  return this.documentoRepo.find({
    where: { convocatoria: { id: convocatoriaId } },
    order: { detectadoEn: 'DESC' },
  });
}

async copiarConvocatoria(id: string): Promise<Convocatoria> {
  const original = await this.convocatoriaRepo.findOne({
    where: { id },
    relations: ['oposicion', 'temas'],
  });
  if (!original) throw new NotFoundException('Convocatoria no encontrada');

  const nueva = await this.convocatoriaRepo.save(this.convocatoriaRepo.create({
    anyo: original.anyo + 1,
    plazas: original.plazas,
    estado: 'borrador' as any,
    urlInap: original.urlInap,
    turno: original.turno,
    ejercicios: original.ejercicios,
    fraccionPenalizacion: original.fraccionPenalizacion,
    notaMinimaAprobado: original.notaMinimaAprobado,
    requisitos: original.requisitos,
    formacionPosterior: original.formacionPosterior,
    descripcionAdicional: original.descripcionAdicional,
    generaBolsaEmpleo: original.generaBolsaEmpleo,
    bolsaEmpleoDescripcion: original.bolsaEmpleoDescripcion,
    plazasDesglose: original.plazasDesglose,
    fasesAdicionales: original.fasesAdicionales,
    puestos: original.puestos,
    bloquesTemario: original.bloquesTemario,
    fechaConvocatoria: undefined,
    numeroSolicitudes: undefined,
    numeroPresentados: undefined,
    oposicion: { id: original.oposicion.id } as any,
  }));

  // Copiar temas
  const temas = await this.temaRepo.find({
    where: { convocatoria: { id } },
    relations: ['normativas', 'normativas.articulo'],
    order: { numero: 'ASC' },
  });

  const mapaTemasViejoNuevo: Record<string, string> = {};

  for (const tema of temas) {
    const nuevoTema = await this.temaRepo.save(this.temaRepo.create({
      numero: tema.numero,
      titulo: tema.titulo,
      tipo: tema.tipo,
      contexto: tema.contexto,
      convocatoria: { id: nueva.id } as any,
      claveEstable: tema.claveEstable,
    }));
    mapaTemasViejoNuevo[tema.id] = nuevoTema.id;

    // Copiar vinculación de artículos (TemaNormativa)
    if (tema.normativas?.length) {
      for (const tn of tema.normativas) {
        await this.temaNormativaRepo.save(this.temaNormativaRepo.create({
          tema: { id: nuevoTema.id } as any,
          articulo: { id: (tn.articulo as any).id } as any,
        }));
      }
    }

    // Vincular preguntas al tema nuevo
    const temaConPreguntas = await this.temaRepo.findOne({
      where: { id: tema.id },
      relations: ['preguntasTest'],
    });
    if (temaConPreguntas?.preguntasTest?.length) {
      const nuevoTemaConRelacion = await this.temaRepo.findOne({
        where: { id: nuevoTema.id },
        relations: ['preguntasTest'],
      });
      if (nuevoTemaConRelacion) {
        nuevoTemaConRelacion.preguntasTest = temaConPreguntas.preguntasTest;
        await this.temaRepo.save(nuevoTemaConRelacion);
      }
    }

    // Copiar Flashcards del tema
    const flashcardsOrigen = await this.flashcardRepo.find({ where: { tema: { id: tema.id } as any } });
    for (const fc of flashcardsOrigen) {
      await this.flashcardRepo.save(this.flashcardRepo.create({
        tipo: fc.tipo,
        nivel: fc.nivel,
        pregunta: fc.pregunta,
        respuesta: fc.respuesta,
        explicacion: fc.explicacion,
        esParaDuelo: fc.esParaDuelo,
        activa: fc.activa,
        tema: { id: nuevoTema.id } as any,
        articulo: fc.articulo ? { id: (fc.articulo as any).id } as any : undefined,
      } as any));
    }

    // Copiar Apuntes OPLORA del tema
    const apuntesOrigen = await this.apunteOploraRepo.find({ where: { tema: { id: tema.id } as any } });
    for (const ap of apuntesOrigen) {
      await this.apunteOploraRepo.save(this.apunteOploraRepo.create({
        titulo: ap.titulo,
        descripcion: ap.descripcion,
        urlArchivo: ap.urlArchivo,
        tipo: ap.tipo,
        orden: ap.orden,
        contenidoEstructurado: ap.contenidoEstructurado,
        textoCompleto: ap.textoCompleto,
        activo: ap.activo,
        versionLeyId: ap.versionLeyId,
        paginas: ap.paginas,
        tamanoBytes: ap.tamanoBytes,
        versionParser: ap.versionParser,
        tema: { id: nuevoTema.id } as any,
      } as any));
    }
  }

  // Copiar datos de usuarios — notas de temas
  for (const [temaViejoId, temaNuevoId] of Object.entries(mapaTemasViejoNuevo)) {
    const notas = await this.notaRepo.find({
      where: { tema: { id: temaViejoId } } as any,
      relations: ['usuario'],
    });
    for (const nota of notas) {
      await this.notaRepo.save(this.notaRepo.create({
        contenido: nota.contenido,
        fechaRepaso: nota.fechaRepaso,
        usuario: { id: (nota.usuario as any).id } as any,
        tema: { id: temaNuevoId } as any,
      }));
    }
  }

  // ⭐ Programar notificación diferida (1 hora), en vez de notificar inmediatamente
  await this.convocatoriaRepo.update(nueva.id, {
    notificarCambioEn: new Date(Date.now() + 60 * 60 * 1000),
    notificacionCambioEnviada: false,
    convocatoriaOrigenId: original.id,
  } as any);

  return nueva;
}

private readonly plantillasNoticia: Record<string, (doc: DocumentoConvocatoria, anyo: number) => string> = {
  resolucion_convocatoria: (_, anyo) => `Resolución de la convocatoria ${anyo}`,
  lista_admitidos_provisional: (_, anyo) => `Lista provisional de admitidos · convocatoria ${anyo}`,
  lista_admitidos_definitiva: (_, anyo) => `Lista definitiva de admitidos · convocatoria ${anyo}`,
  lista_excluidos_provisional: (_, anyo) => `Lista provisional de excluidos · convocatoria ${anyo}`,
  lista_excluidos_definitiva: (_, anyo) => `Lista definitiva de excluidos · convocatoria ${anyo}`,
  fecha_examen: (_, anyo) => `Fecha de examen · convocatoria ${anyo}`,
  resultado_ejercicio: (_, anyo) => `Resultados de un ejercicio · convocatoria ${anyo}`,
  cronograma: (_, anyo) => `Nuevo cronograma · convocatoria ${anyo}`,
  normas_especificas: (_, anyo) => `Normas específicas · convocatoria ${anyo}`,
  nota_informativa: (doc) => doc.titulo,
  guia_inscripcion: (_, anyo) => `Guía de inscripción · convocatoria ${anyo}`,
  otro: (doc) => doc.titulo,
};

async reprocesarUrlInap(id: string, nuevaUrl: string): Promise<void> {
  // Borrar todos los documentos existentes de esta convocatoria
  await this.documentoRepo.delete({ convocatoria: { id } as any });

  // Actualizar la URL y resetear el plazo (por si cambia la convocatoria de origen)
  await this.convocatoriaRepo.update(id, {
    urlInap: nuevaUrl,
    plazoInscripcionInicio: null as any,
    plazoInscripcionFin: null as any,
  });
}

async getNoticiasByOposicion(oposicionId: string, limite: number = 3) {
  const convocatorias = await this.convocatoriaRepo.find({
    where: { oposicion: { id: oposicionId } },
    order: { anyo: 'DESC' },
  });

  if (convocatorias.length === 0) return [];

  const convocatoriaRelevante = convocatorias.find((c) => c.estado === 'activa') ?? convocatorias[0];

  const documentos = await this.documentoRepo.find({
    where: { convocatoria: { id: convocatoriaRelevante.id } },
    relations: ['convocatoria'],
    order: { detectadoEn: 'DESC' }, // ⭐ orden por cuándo se detectó, no por fecha de publicación
    take: limite,
  });

  return documentos.map((doc) => {
    const plantilla = this.plantillasNoticia[doc.tipo] ?? this.plantillasNoticia.otro;
    return {
      id: doc.id,
      titular: plantilla(doc, doc.convocatoria?.anyo ?? 0),
      descripcion: doc.descripcion,
      tipo: doc.tipo,
      fecha: doc.fechaPublicacion ?? doc.detectadoEn, // ⭐ para mostrar, sí usa la real si existe
      urlPdf: doc.urlPdf,
    };
  });
}

async getDocumentosCompletos(oposicionId: string) {
  const convocatorias = await this.convocatoriaRepo.find({
    where: { oposicion: { id: oposicionId } },
    order: { anyo: 'DESC' },
  });
  if (convocatorias.length === 0) return [];

  const convocatoriaRelevante = convocatorias.find((c) => c.estado === 'activa') ?? convocatorias[0];

  const documentos = await this.documentoRepo.find({
    where: { convocatoria: { id: convocatoriaRelevante.id } },
    order: { detectadoEn: 'DESC' },
  });

  return documentos.map((doc) => {
    const plantilla = this.plantillasNoticia[doc.tipo] ?? this.plantillasNoticia.otro;
    return {
      id: doc.id,
      titular: plantilla(doc, convocatoriaRelevante.anyo),
      descripcion: doc.descripcion,
      tipo: doc.tipo,
      fecha: doc.fechaPublicacion ?? doc.detectadoEn,
      urlPdf: doc.urlPdf,
    };
  });
}
}