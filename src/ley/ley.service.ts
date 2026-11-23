import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ley } from './ley.entity';
import { VersionLey, TipoCambio } from './version-ley.entity';
import { DiffVersion } from './diff-version.entity';
import { OposicionLey } from './oposicion-ley.entity';
import * as fs from 'fs';
import { NoticiaService } from '../noticia/noticia.service';
const pdfParse = require('pdf-parse');

@Injectable()
export class LeyService {
  private readonly logger = new Logger(LeyService.name);

  constructor(
    @InjectRepository(Ley)
    private readonly leyRepo: Repository<Ley>,
    @InjectRepository(VersionLey)
    private readonly versionRepo: Repository<VersionLey>,
    @InjectRepository(DiffVersion)
    private readonly diffRepo: Repository<DiffVersion>,
    @InjectRepository(OposicionLey)
    private readonly oposicionLeyRepo: Repository<OposicionLey>,
    private readonly noticiaService: NoticiaService,
  ) {}

  // ─── LEYES ───────────────────────────────────────────────

  // ⭐ Además de la ley, cada fila lleva cuántos artículos tiene su versión activa (articulosTotal)
  // y cuántos están vinculados a algún tema de cualquier oposición (articulosVinculados), sea cual
  // sea el nivel del vínculo (artículo, capítulo, título o ley completa). La búsqueda mira también las siglas.
  async findAll(search?: string): Promise<(Ley & { articulosTotal: number; articulosVinculados: number })[]> {
  const qb = this.leyRepo.createQueryBuilder('l')
    .leftJoinAndSelect('l.versiones', 'v', 'v.activa = true')
    .leftJoinAndSelect('l.oposicionLeyes', 'ol')
    .orderBy('l.nombre', 'ASC');
  if (search) {
    qb.where('(LOWER(l.nombre) LIKE :s OR LOWER(COALESCE(l.siglas, \'\')) LIKE :s)', { s: `%${search.toLowerCase()}%` });
  }
  const leyes = await qb.getMany();
  const conteos: { ley: string; total: string; vinculados: string }[] = leyes.length
    ? await this.leyRepo.query(
        `SELECT v."leyId" AS ley,
                COUNT(DISTINCT a.id) AS total,
                COUNT(DISTINCT a.id) FILTER (WHERE EXISTS (
                  SELECT 1 FROM temas_normativa tn
                   WHERE tn."articuloId" = a.id
                      OR tn."capituloId" = c.id
                      OR tn."capituloId" = cs.id
                      OR tn."tituloId" = t.id
                      OR tn."versionLeyId" = v.id
                )) AS vinculados
           FROM articulos a
           LEFT JOIN capitulos c ON c.id = a."capituloId"
           LEFT JOIN secciones s ON s.id = a."seccionId"
           LEFT JOIN capitulos cs ON cs.id = s."capituloId"
           LEFT JOIN titulos t ON t.id = COALESCE(a."tituloRefId", c."tituloRefId", cs."tituloRefId")
           LEFT JOIN libros lb ON lb.id = t."libroId"
           JOIN versiones_ley v ON v.id = COALESCE(t."versionLeyId", lb."versionLeyId") AND v.activa = true
          WHERE v."leyId" = ANY($1)
          GROUP BY v."leyId"`,
        [leyes.map((l) => l.id)],
      )
    : [];
  const porLey = new Map(conteos.map((c) => [c.ley, c]));
  return leyes.map((l) => Object.assign(l, {
    articulosTotal: Number(porLey.get(l.id)?.total ?? 0),
    articulosVinculados: Number(porLey.get(l.id)?.vinculados ?? 0),
  }));
}

  async findOne(id: string): Promise<Ley> {
    const ley = await this.leyRepo.findOne({
      where: { id },
      relations: ['versiones'],
    });
    if (!ley) throw new NotFoundException(`Ley ${id} no encontrada`);
    return ley;
  }

// ⭐ Las siglas son únicas: si ya las tiene otra ley, se avisa con un mensaje claro
// (antes saltaba el error interno de Postgres "duplicate key value"). Vacías = sin siglas.
async comprobarSiglas(siglas?: string | null, excluirLeyId?: string): Promise<string | null> {
  const s = (siglas ?? '').trim().toUpperCase();
  if (!s) return null;
  const otra = await this.leyRepo.findOne({ where: { siglas: s } });
  if (otra && otra.id !== excluirLeyId) {
    throw new ConflictException(
      `Ya existe una ley con las siglas "${s}" (${otra.nombre}). Pon otras siglas o déjalas en blanco.`,
    );
  }
  return s;
}

async create(nombre: string, siglas?: string, descripcion?: string): Promise<Ley> {
  const siglasOk = await this.comprobarSiglas(siglas);
  const ley = this.leyRepo.create({ nombre, siglas: siglasOk ?? undefined, descripcion });
  return this.leyRepo.save(ley);
}

  async update(id: string, datos: Partial<{ nombre: string; siglas: string | null; descripcion: string }>): Promise<Ley> {
    await this.findOne(id);
    if ('siglas' in datos) datos.siglas = await this.comprobarSiglas(datos.siglas, id);
    await this.leyRepo.update(id, datos as any); // siglas puede ser null (sin siglas)
    return this.findOne(id);
  }

  // ─── VERSIONES ───────────────────────────────────────────

  findVersiones(leyId: string): Promise<VersionLey[]> {
    return this.versionRepo.find({
      where: { ley: { id: leyId } },
      order: { fechaPublicacion: 'DESC' },
    });
  }

  async findVersionActiva(leyId: string): Promise<VersionLey | null> {
    return this.versionRepo.findOne({
      where: { ley: { id: leyId }, activa: true },
    });
  }

  async crearVersion(
    leyId: string,
    datos: {
      version: string;
      referenciaBoe?: string;
      tipoNorma?: string;
      fechaPublicacion?: string;
      fechaVigencia?: string;
      tipoCambio?: TipoCambio;
      notas?: string;
    },
    texto: string,
  ): Promise<VersionLey> {
    // Desactivar versión anterior si la hay
    await this.versionRepo.update(
      { ley: { id: leyId }, activa: true },
      { activa: false },
    );

    const version = this.versionRepo.create({
      ...datos,
      fechaPublicacion: datos.fechaPublicacion ? new Date(datos.fechaPublicacion) : undefined,
      fechaVigencia: datos.fechaVigencia ? new Date(datos.fechaVigencia) : undefined,
      tipoCambio: datos.tipoCambio ?? TipoCambio.INICIAL,
      activa: true,
      textoCompleto: texto,
      ley: { id: leyId } as any,
    });

    const versionGuardada = await this.versionRepo.save(version);

    const versionConLey = await this.versionRepo.findOne({
      where: { id: versionGuardada.id },
      relations: ['ley'],
    });
    if (versionConLey) {
      // No dejar que un fallo generando noticias (efecto secundario) tumbe la
      // subida de la versión de ley (efecto principal, ya persistido).
      try {
        await this.noticiaService.generarNoticiasLegislativasDesdeVersion(versionConLey);
      } catch (e: any) {
        this.logger.error(`Error generando noticias legislativas para versión ${versionGuardada.id}: ${e.message}`);
      }
    }

    return versionGuardada;
  }

  async activarVersion(versionId: string): Promise<VersionLey> {
  const version = await this.versionRepo.findOne({
    where: { id: versionId },
    relations: ['ley'],
  });
  if (!version) throw new NotFoundException(`Versión ${versionId} no encontrada`);

  await this.versionRepo.update(
    { ley: { id: version.ley.id }, activa: true },
    { activa: false },
  );
  await this.versionRepo.update(versionId, { activa: true });
  
  const actualizada = await this.versionRepo.findOne({ 
    where: { id: versionId }, 
    relations: ['ley'] 
  });
  if (!actualizada) throw new NotFoundException(`Versión ${versionId} no encontrada`);
  return actualizada;
  }

  // ─── PROCESADO DE ARCHIVOS ───────────────────────────────

  async procesarArchivo(filePath: string, ext: string): Promise<string> {
    if (ext === '.pdf') {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      fs.unlinkSync(filePath);
      return data.text;
    }
    const texto = fs.readFileSync(filePath, 'utf-8');
    fs.unlinkSync(filePath);
    return texto;
  }

  // ─── VINCULACIÓN OPOSICIONES ─────────────────────────────

  async vincular(leyId: string, oposicionId: string, versionLeyId?: string): Promise<OposicionLey> {
    const existente = await this.oposicionLeyRepo.findOne({
      where: { ley: { id: leyId }, oposicion: { id: oposicionId } },
    });
    if (existente) {
      if (versionLeyId) {
        await this.oposicionLeyRepo.update(existente.id, {
          versionLey: { id: versionLeyId } as any,
        });
      }
      return existente;
    }

    const vinculo = this.oposicionLeyRepo.create({
      ley: { id: leyId } as any,
      oposicion: { id: oposicionId } as any,
      versionLey: versionLeyId ? ({ id: versionLeyId } as any) : undefined,
      obligatoria: true,
    });
    return this.oposicionLeyRepo.save(vinculo);
  }

  async desvincular(leyId: string, oposicionId: string): Promise<void> {
    await this.oposicionLeyRepo.delete({
      ley: { id: leyId },
      oposicion: { id: oposicionId },
    });
  }

  findByOposicion(oposicionId: string): Promise<OposicionLey[]> {
    return this.oposicionLeyRepo.find({
      where: { oposicion: { id: oposicionId } },
      relations: ['ley', 'versionLey'],
    });
  }

  findOposicionesByLey(leyId: string): Promise<OposicionLey[]> {
    return this.oposicionLeyRepo.find({
      where: { ley: { id: leyId } },
      relations: ['oposicion', 'versionLey'],
    });
  }

  // ─── DIFFS ───────────────────────────────────────────────

  async findDiffs(leyId: string): Promise<DiffVersion[]> {
    return this.diffRepo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.versionNueva', 'vn')
      .leftJoinAndSelect('d.versionAnterior', 'va')
      .where('vn.ley.id = :leyId', { leyId })
      .orderBy('d.creadoEn', 'DESC')
      .getMany();
  }

  async crearDiff(versionNuevaId: string, versionAnteriorId?: string): Promise<DiffVersion> {
    const diff = this.diffRepo.create({
      versionNueva: { id: versionNuevaId } as any,
      versionAnterior: versionAnteriorId ? ({ id: versionAnteriorId } as any) : undefined,
      generadoPorIa: false,
    });
    return this.diffRepo.save(diff);
  }

  // ⭐ Auditoría M7: borrar una ley con versiones daba error 500 (las versiones y su estructura
  // impedían el borrado). Ahora se borra todo en orden y en una transacción. Si hay contenido
  // vinculado (temas, preguntas, flashcards, notas o subrayados de usuarios), no se borra nada y
  // se avisa de qué hay que desvincular antes.
  async eliminar(id: string): Promise<void> {
  await this.leyRepo.manager.transaction(async (m) => {
    const ley = await m.query(`SELECT id FROM leyes WHERE id = $1`, [id]);
    if (!ley.length) throw new NotFoundException('Ley no encontrada');
    const versiones: string[] = (await m.query(`SELECT id FROM versiones_ley WHERE "leyId" = $1`, [id])).map((f: any) => f.id);

    if (versiones.length) {
      const titulos = `SELECT id FROM titulos WHERE "versionLeyId" = ANY($1) OR "libroId" IN (SELECT id FROM libros WHERE "versionLeyId" = ANY($1))`;
      const capitulos = `SELECT id FROM capitulos WHERE "tituloRefId" IN (${titulos})`;
      const secciones = `SELECT id FROM secciones WHERE "capituloId" IN (${capitulos})`;
      const articulos = `SELECT id FROM articulos WHERE "tituloRefId" IN (${titulos}) OR "capituloId" IN (${capitulos}) OR "seccionId" IN (${secciones})`;
      const contar = async (sql: string) => Number((await m.query(sql, [versiones]))[0]?.n ?? 0);
      const detalle: Record<string, number> = {
        'vínculos con temas': await contar(`SELECT COUNT(*) AS n FROM temas_normativa WHERE "versionLeyId" = ANY($1) OR "tituloId" IN (${titulos}) OR "capituloId" IN (${capitulos}) OR "articuloId" IN (${articulos})`),
        'preguntas de test': await contar(`SELECT COUNT(*) AS n FROM preguntas_test_articulos_articulos WHERE "articulosId" IN (${articulos})`),
        'preguntas del banco': await contar(`SELECT COUNT(*) AS n FROM preguntas_banco WHERE "articuloId" IN (${articulos})`),
        'preguntas cortas': await contar(`SELECT COUNT(*) AS n FROM preguntas_cortas WHERE "articuloId" IN (${articulos})`),
        flashcards: await contar(`SELECT COUNT(*) AS n FROM flashcards WHERE "articuloId" IN (${articulos})`),
        notas: await contar(`SELECT COUNT(*) AS n FROM notas_articulo WHERE "articuloId" IN (${articulos})`),
        subrayados: await contar(`SELECT COUNT(*) AS n FROM subrayados_articulo WHERE "articuloId" IN (${articulos})`),
      };
      const texto = Object.entries(detalle).filter(([, n]) => n > 0).map(([k, n]) => `${n} ${k}`).join(', ');
      if (texto) {
        throw new BadRequestException(`Esta ley tiene contenido vinculado (${texto}). Desvincúlalo antes de borrarla. No se ha borrado nada.`);
      }

      await m.query(`DELETE FROM articulos WHERE id IN (${articulos})`, [versiones]);
      await m.query(`DELETE FROM secciones WHERE id IN (${secciones})`, [versiones]);
      await m.query(`DELETE FROM capitulos WHERE id IN (${capitulos})`, [versiones]);
      await m.query(`DELETE FROM titulos WHERE id IN (${titulos})`, [versiones]);
      await m.query(`DELETE FROM libros WHERE "versionLeyId" = ANY($1)`, [versiones]);
      await m.query(`DELETE FROM disposiciones WHERE "versionLeyId" = ANY($1)`, [versiones]);
      await m.query(`DELETE FROM diffs_version WHERE "versionAnteriorId" = ANY($1) OR "versionNuevaId" = ANY($1)`, [versiones]);
      await m.query(`DELETE FROM oposiciones_leyes WHERE "versionLeyId" = ANY($1)`, [versiones]);
      await m.query(`DELETE FROM versiones_ley WHERE id = ANY($1)`, [versiones]);
    }
    await m.query(`DELETE FROM leyes WHERE id = $1`, [id]);
  });
}

async getNoticiasLegislacion(oposicionId: string, limite?: number) {
  const oposicionLeyes = await this.oposicionLeyRepo.find({
    where: { oposicion: { id: oposicionId } },
    relations: ['ley'],
  });

  const leyIds = oposicionLeyes.map((ol) => ol.ley.id);
  if (leyIds.length === 0) return [];

  const query = this.versionRepo
    .createQueryBuilder('v')
    .leftJoinAndSelect('v.ley', 'ley')
    .where('v.leyId IN (:...leyIds)', { leyIds })
    .orderBy('v.fechaPublicacion', 'DESC');

  if (limite) query.take(limite);

  const versiones = await query.getMany();

  return versiones.map((v) => ({
    id: v.id,
    titular: `${v.ley.nombre} — ${v.tipoCambio === 'inicial' ? 'Nueva versión publicada' : 'Actualización normativa'}`,
    descripcion: v.notas || undefined,
    fecha: v.fechaPublicacion,
    leyId: v.ley.id,
  }));
}

async editarVersion(versionId: string, datos: {
  referenciaBoe?: string;
  tipoNorma?: string;
  fechaPublicacion?: string;
  fechaVigencia?: string;
  notas?: string;
}): Promise<VersionLey> {
  const payload: any = { ...datos };
  if (datos.fechaPublicacion) payload.fechaPublicacion = new Date(datos.fechaPublicacion);
  if (datos.fechaVigencia) payload.fechaVigencia = new Date(datos.fechaVigencia);

  await this.versionRepo.update(versionId, payload);
  const version = await this.versionRepo.findOne({ where: { id: versionId } });
  if (!version) throw new NotFoundException('Versión no encontrada');
  return version;
}



}