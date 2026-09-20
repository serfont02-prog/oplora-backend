import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Noticia, TipoNoticia, OrigenNoticia, PrioridadNoticia } from './noticia.entity';
import { CreateNoticiaDto, UpdateNoticiaDto, FiltrosNoticiaAdmin, FiltrosFeedNoticia } from './noticia.dto';
import { DocumentoConvocatoria } from '../convocatoria/documento-convocatoria.entity';
import { PLANTILLAS_NOTICIA_DOCUMENTO } from '../convocatoria/convocatoria.service';
import { VersionLey, TipoCambio } from '../ley/version-ley.entity';
import { TemaNormativa } from '../tema/tema-normativa.entity';
import { Articulo } from '../normativa/articulo.entity';
import { Capitulo } from '../normativa/capitulo.entity';
import { Titulo } from '../normativa/titulo.entity';

@Injectable()
export class NoticiaService {
  private readonly logger = new Logger(NoticiaService.name);

  constructor(
    @InjectRepository(Noticia)
    private readonly noticiaRepo: Repository<Noticia>,
    @InjectRepository(TemaNormativa)
    private readonly temaNormativaRepo: Repository<TemaNormativa>,
    @InjectRepository(Articulo)
    private readonly articuloRepo: Repository<Articulo>,
    @InjectRepository(Capitulo)
    private readonly capituloRepo: Repository<Capitulo>,
    @InjectRepository(Titulo)
    private readonly tituloRepo: Repository<Titulo>,
    @InjectRepository(VersionLey)
    private readonly versionLeyRepo: Repository<VersionLey>,
    @InjectRepository(DocumentoConvocatoria)
    private readonly documentoRepo: Repository<DocumentoConvocatoria>,
  ) {}

  // ─── CRUD ADMIN ────────────────────────────────────────────

  async findAll(filtros: FiltrosNoticiaAdmin = {}): Promise<Noticia[]> {
    const qb = this.noticiaRepo
      .createQueryBuilder('n')
      .leftJoinAndSelect('n.convocatoria', 'convocatoria')
      .leftJoinAndSelect('n.oposicion', 'oposicion')
      .leftJoinAndSelect('n.ley', 'ley')
      .leftJoinAndSelect('n.versionLey', 'versionLey')
      .orderBy('n.destacada', 'DESC')
      .addOrderBy('n.creadoEn', 'DESC');

    if (filtros.tipo) qb.andWhere('n.tipo = :tipo', { tipo: filtros.tipo });
    if (filtros.convocatoriaId) qb.andWhere('convocatoria.id = :convocatoriaId', { convocatoriaId: filtros.convocatoriaId });
    if (filtros.oposicionId) qb.andWhere('oposicion.id = :oposicionId', { oposicionId: filtros.oposicionId });

    if (filtros.estado === 'publicada') {
      qb.andWhere('n.publicada = true').andWhere('(n.fechaProgramada IS NULL OR n.fechaProgramada <= :ahora)', { ahora: new Date() });
    } else if (filtros.estado === 'borrador') {
      qb.andWhere('n.publicada = false');
    } else if (filtros.estado === 'programada') {
      qb.andWhere('n.publicada = true').andWhere('n.fechaProgramada IS NOT NULL').andWhere('n.fechaProgramada > :ahora', { ahora: new Date() });
    }

    return qb.getMany();
  }

  async findPendientesRevision(): Promise<Noticia[]> {
    return this.noticiaRepo.find({
      where: {
        publicada: false,
        origen: In([OrigenNoticia.SCRAPER_BOE, OrigenNoticia.CAMBIO_NORMATIVA]),
      },
      relations: ['convocatoria', 'oposicion', 'ley', 'versionLey'],
      order: { creadoEn: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Noticia> {
    const noticia = await this.noticiaRepo.findOne({
      where: { id },
      relations: ['convocatoria', 'oposicion', 'ley', 'versionLey', 'documentoConvocatoria'],
    });
    if (!noticia) throw new NotFoundException(`Noticia ${id} no encontrada`);
    return noticia;
  }

  async create(dto: CreateNoticiaDto): Promise<Noticia> {
    const origen = dto.origen ?? OrigenNoticia.MANUAL_ADMIN;
    const publicadaPorDefecto = origen === OrigenNoticia.MANUAL_ADMIN || origen === OrigenNoticia.REGLA_AUTOMATICA;

    const noticia = this.noticiaRepo.create({
      tipo: dto.tipo,
      origen,
      titulo: dto.titulo,
      resumen: dto.resumen ?? null,
      contenido: dto.contenido ?? null,
      urlOrigen: dto.urlOrigen ?? null,
      convocatoria: dto.convocatoriaId ? ({ id: dto.convocatoriaId } as any) : null,
      oposicion: dto.oposicionId ? ({ id: dto.oposicionId } as any) : null,
      ley: dto.leyId ? ({ id: dto.leyId } as any) : null,
      versionLey: dto.versionLeyId ? ({ id: dto.versionLeyId } as any) : null,
      documentoConvocatoria: dto.documentoConvocatoriaId ? ({ id: dto.documentoConvocatoriaId } as any) : null,
      destacada: dto.destacada ?? false,
      prioridad: dto.prioridad ?? PrioridadNoticia.MEDIA,
      publicada: dto.publicada ?? publicadaPorDefecto,
      fechaProgramada: dto.fechaProgramada ? new Date(dto.fechaProgramada) : null,
      fechaPublicacion: dto.fechaPublicacion ? new Date(dto.fechaPublicacion) : null,
      automatica: dto.automatica ?? false,
    });

    return this.noticiaRepo.save(noticia);
  }

  async update(id: string, dto: UpdateNoticiaDto): Promise<Noticia> {
    await this.findOne(id);

    const payload: any = { ...dto };
    delete payload.convocatoriaId;
    delete payload.oposicionId;
    delete payload.leyId;
    delete payload.versionLeyId;

    if (dto.convocatoriaId !== undefined) payload.convocatoria = dto.convocatoriaId ? { id: dto.convocatoriaId } : null;
    if (dto.oposicionId !== undefined) payload.oposicion = dto.oposicionId ? { id: dto.oposicionId } : null;
    if (dto.leyId !== undefined) payload.ley = dto.leyId ? { id: dto.leyId } : null;
    if (dto.versionLeyId !== undefined) payload.versionLey = dto.versionLeyId ? { id: dto.versionLeyId } : null;
    if (dto.fechaProgramada !== undefined) payload.fechaProgramada = dto.fechaProgramada ? new Date(dto.fechaProgramada) : null;
    if (dto.fechaPublicacion !== undefined) payload.fechaPublicacion = dto.fechaPublicacion ? new Date(dto.fechaPublicacion) : null;

    await this.noticiaRepo.save({ id, ...payload });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.noticiaRepo.delete(id);
  }

  async publicar(id: string): Promise<Noticia> {
    await this.findOne(id);
    await this.noticiaRepo.update(id, { publicada: true, fechaPublicacion: new Date() });
    return this.findOne(id);
  }

  async despublicar(id: string): Promise<Noticia> {
    await this.findOne(id);
    await this.noticiaRepo.update(id, { publicada: false });
    return this.findOne(id);
  }

  async destacar(id: string, destacada: boolean = true): Promise<Noticia> {
    await this.findOne(id);
    await this.noticiaRepo.update(id, { destacada });
    return this.findOne(id);
  }

  // ─── FEED PÚBLICO ──────────────────────────────────────────

  async getFeed(filtros: FiltrosFeedNoticia = {}): Promise<Noticia[]> {
    const ahora = new Date();
    const qb = this.noticiaRepo
      .createQueryBuilder('n')
      .leftJoinAndSelect('n.convocatoria', 'convocatoria')
      .leftJoinAndSelect('n.oposicion', 'oposicion')
      .leftJoinAndSelect('n.ley', 'ley')
      .leftJoinAndSelect('n.versionLey', 'versionLey')
      .where('n.publicada = true')
      .andWhere('(n.fechaProgramada IS NULL OR n.fechaProgramada <= :ahora)', { ahora });

    if (filtros.tipos && filtros.tipos.length > 0) {
      qb.andWhere('n.tipo IN (:...tipos)', { tipos: filtros.tipos });
    }

    // Visible si: es global (sin convocatoria ni oposición), o coincide con la
    // convocatoria pedida, o coincide con la oposición pedida.
    const condicionesAmbito: string[] = ['(convocatoria.id IS NULL AND oposicion.id IS NULL)'];
    const params: Record<string, any> = { ahora };

    if (filtros.convocatoriaId) {
      condicionesAmbito.push('convocatoria.id = :convocatoriaId');
      params.convocatoriaId = filtros.convocatoriaId;
    }
    if (filtros.oposicionId) {
      condicionesAmbito.push('oposicion.id = :oposicionId');
      params.oposicionId = filtros.oposicionId;
    }

    qb.andWhere(`(${condicionesAmbito.join(' OR ')})`, params);
    qb.orderBy('n.destacada', 'DESC').addOrderBy('n.fechaPublicacion', 'DESC');

    if (filtros.limite) qb.take(filtros.limite);

    return qb.getMany();
  }

  // ─── GENERACIÓN AUTOMÁTICA: OFICIALES ────────────────────────

  async generarNoticiaOficialDesdeDocumento(documento: DocumentoConvocatoria): Promise<Noticia | null> {
    // El documento puede llegar sin la relación 'convocatoria' totalmente cargada
    // (p.ej. justo tras un .save() con solo el id) — se recarga con la relación
    // completa para poder leer convocatoria.anyo en la plantilla del titular.
    const documentoCompleto = documento.convocatoria && (documento.convocatoria as any).anyo !== undefined
      ? documento
      : await this.documentoRepo.findOne({ where: { id: documento.id }, relations: ['convocatoria'] });

    if (!documentoCompleto || !documentoCompleto.convocatoria) {
      this.logger.warn(`Documento ${documento.id} sin convocatoria asociada; no se genera noticia oficial`);
      return null;
    }

    // Evita duplicados por documentoConvocatoria.id
    const existente = await this.noticiaRepo.findOne({
      where: { documentoConvocatoria: { id: documentoCompleto.id } as any },
    });
    if (existente) return existente;

    const plantilla = PLANTILLAS_NOTICIA_DOCUMENTO[documentoCompleto.tipo] ?? PLANTILLAS_NOTICIA_DOCUMENTO.otro;
    const anyo = (documentoCompleto.convocatoria as any).anyo ?? 0;

    const noticia = this.noticiaRepo.create({
      tipo: TipoNoticia.OFICIAL,
      origen: OrigenNoticia.SCRAPER_BOE,
      titulo: plantilla(documentoCompleto, anyo),
      resumen: documentoCompleto.descripcion ?? null,
      urlOrigen: documentoCompleto.urlPdf ?? null,
      convocatoria: { id: (documentoCompleto.convocatoria as any).id } as any,
      documentoConvocatoria: { id: documentoCompleto.id } as any,
      publicada: false,
      automatica: true,
      fechaPublicacion: documentoCompleto.fechaPublicacion ?? null,
    });

    return this.noticiaRepo.save(noticia);
  }

  // ─── GENERACIÓN AUTOMÁTICA: LEGISLATIVAS ─────────────────────

  /**
   * Dada una nueva VersionLey, encuentra todas las Convocatorias cuyo temario
   * real (Tema.convocatoria vía TemaNormativa) referencia la MISMA Ley (en
   * cualquiera de sus versiones históricas) y crea, para cada convocatoria
   * afectada, una Noticia legislativa evitando duplicados.
   */
  async generarNoticiasLegislativasDesdeVersion(versionLey: VersionLey): Promise<Noticia[]> {
    const version = versionLey.ley
      ? versionLey
      : await this.versionLeyRepo.findOne({ where: { id: versionLey.id }, relations: ['ley'] });

    if (!version || !version.ley) {
      this.logger.warn(`VersionLey ${versionLey.id} sin Ley asociada; no se generan noticias legislativas`);
      return [];
    }

    const leyId = version.ley.id;

    // 1. Todas las versiones (históricas) de esta ley.
    const versiones = await this.versionLeyRepo.find({ where: { ley: { id: leyId } as any } });
    const versionIds = versiones.map((v) => v.id);
    if (versionIds.length === 0) return [];

    // 2. Todos los Títulos que cuelgan de esas versiones.
    const titulos = await this.tituloRepo.find({ where: { versionLey: { id: In(versionIds) } } as any });
    const tituloIds = titulos.map((t) => t.id);

    // 3. Todos los Capítulos que cuelgan de esos títulos.
    const capitulos = tituloIds.length
      ? await this.capituloRepo.find({ where: { tituloRef: { id: In(tituloIds) } } as any })
      : [];
    const capituloIds = capitulos.map((c) => c.id);

    // 4. Todos los Artículos que cuelgan (directa o indirectamente vía capítulo/sección) de esos títulos.
    const articulos = (tituloIds.length || capituloIds.length)
      ? await this.articuloRepo
          .createQueryBuilder('a')
          .leftJoin('a.seccion', 'seccion')
          .where(
            tituloIds.length && capituloIds.length
              ? '(a.tituloRefId IN (:...tituloIds) OR a.capituloId IN (:...capituloIds) OR seccion.capituloId IN (:...capituloIds))'
              : tituloIds.length
              ? 'a.tituloRefId IN (:...tituloIds)'
              : '(a.capituloId IN (:...capituloIds) OR seccion.capituloId IN (:...capituloIds))',
            { tituloIds, capituloIds },
          )
          .getMany()
      : [];
    const articuloIds = articulos.map((a) => a.id);

    // 5. TemaNormativa que apunten a cualquiera de estos niveles (artículo, capítulo, título o versión directamente).
    const condiciones: string[] = [];
    const params: Record<string, any> = {};
    if (articuloIds.length) { condiciones.push('tn.articuloId IN (:...articuloIds)'); params.articuloIds = articuloIds; }
    if (capituloIds.length) { condiciones.push('tn.capituloId IN (:...capituloIds)'); params.capituloIds = capituloIds; }
    if (tituloIds.length) { condiciones.push('tn.tituloId IN (:...tituloIds)'); params.tituloIds = tituloIds; }
    condiciones.push('tn.versionLeyId IN (:...versionIds)');
    params.versionIds = versionIds;

    if (condiciones.length === 0) return [];

    const temasNormativa = await this.temaNormativaRepo
      .createQueryBuilder('tn')
      .leftJoinAndSelect('tn.tema', 'tema')
      .leftJoinAndSelect('tema.convocatoria', 'convocatoria')
      .where(condiciones.join(' OR '), params)
      .getMany();

    // 6. Convocatorias únicas afectadas.
    const convocatoriaIds = new Set<string>();
    for (const tn of temasNormativa) {
      const convId = tn.tema?.convocatoria?.id;
      if (convId) convocatoriaIds.add(convId);
    }

    if (convocatoriaIds.size === 0) {
      this.logger.log(`VersionLey ${version.id} (${version.ley.nombre}) no afecta a ninguna convocatoria con temario vinculado`);
      return [];
    }

    const titulo = version.tipoCambio === TipoCambio.INICIAL
      ? `Nueva versión publicada: ${version.ley.nombre}`
      : `Actualización normativa: ${version.ley.nombre}`;

    const creadas: Noticia[] = [];
    for (const convocatoriaId of convocatoriaIds) {
      const existente = await this.noticiaRepo.findOne({
        where: {
          convocatoria: { id: convocatoriaId } as any,
          versionLey: { id: version.id } as any,
        },
      });
      if (existente) {
        creadas.push(existente);
        continue;
      }

      const noticia = this.noticiaRepo.create({
        tipo: TipoNoticia.LEGISLATIVA,
        origen: OrigenNoticia.CAMBIO_NORMATIVA,
        titulo,
        resumen: version.notas ?? null,
        ley: { id: leyId } as any,
        versionLey: { id: version.id } as any,
        convocatoria: { id: convocatoriaId } as any,
        publicada: false,
        automatica: true,
        fechaPublicacion: version.fechaPublicacion ?? null,
      });
      creadas.push(await this.noticiaRepo.save(noticia));
    }

    return creadas;
  }
}
