import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { inicioDiaMadrid, inicioDiaMadridDesplazado, diaMadrid } from '../common/helpers/dia.helper';
import { InicioDueloService } from '../duelo/inicio-duelo.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, In } from 'typeorm';
import { Flashcard, TipoFlashcard, NivelFlashcard, EstadoFlashcard } from './flashcard.entity';
import { RepasoFC, EstadoFC } from './repaso-fc.entity';
import { RetoFC, TipoRetoFC, EstadoRetoFC } from './reto-fc.entity';
import { ResultadoRetoFC } from './resultado-reto-fc.entity';
import { NotificacionService } from '../notificacion/notificacion.service';
import { TipoNotificacion, PrioridadNotificacion } from '../notificacion/notificacion.entity';
import { Usuario } from '../usuario/usuario.entity';
import { ConfiguracionService } from '../config/configuracion.service';
import { UsuarioOposicion } from '../usuario/usuario-oposicion.entity';
import { resetearConsumosSiEsNuevoDia, registrarDiaDeEstudio } from '../common/helpers/consumo.helper';


// ⭐ Tipos corregibles en servidor (respuesta true/false). Los de respuesta libre (hueco,
// artículo) no pueden usarse en duelos porque exigirían autoevaluación.
const TIPOS_DUELO = [TipoFlashcard.VF, TipoFlashcard.TRAMPA];

// ─── Qué flashcards ve un usuario (criterio ÚNICO, nov 2026) ─────────────────────────────
// Una flashcard se muestra en el entrenamiento si está activa, VALIDADA, es oficial (no personal)
// y pertenece a la oposición: por su oposicionId o por su tema (tema → convocatoria → oposición).
// El artículo enlazado ya NO decide la oposición (antes una FC de una oposición aparecía en otra
// que compartiera ese artículo). `op` es una expresión SQL: ':param', '$1' o una columna.
function sqlVisible(a: string, op: string): string {
  return `(${a}.activa = true AND ${a}.estado = 'validada' AND ${a}."usuarioId" IS NULL AND (${a}."oposicionId" = ${op} OR EXISTS (SELECT 1 FROM temas vt JOIN convocatorias vc ON vc.id = vt."convocatoriaId" WHERE vt.id = ${a}."temaId" AND vc."oposicionId" = ${op})))`;
}
// Una flashcard es de un tema si lo tiene asignado. Las que no tienen tema (solo oposición y
// artículo) cuentan en los temas que incluyen ese artículo. `tema`: expresión SQL.
function sqlDeTema(a: string, tema: string): string {
  return `(${a}."temaId" = ${tema} OR (${a}."temaId" IS NULL AND ${a}."articuloId" IS NOT NULL AND EXISTS (SELECT 1 FROM temas_normativa tn WHERE tn."temaId" = ${tema} AND tn."articuloId" = ${a}."articuloId")))`;
}

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
    private readonly inicioDuelo: InicioDueloService,
  ) {}

  // ─── CRUD FLASHCARDS ─────────────────────────────────────

  // ⭐ Antes esto no validaba nada (ni tipo/nivel válidos, ni pregunta/respuesta vacías), no
  // detectaba duplicados dentro del propio lote ni contra el banco existente, y un solo objeto
  // mal formado en 200 tiraba abajo TODO el import con un error genérico de TypeORM sin decir
  // cuál era la fila problemática — exactamente los mismos fallos que ya se corrigieron en la
  // importación de preguntas de test (TestService.importarPorConvocatoria/validarPreguntaImportada).
  // Se replica aquí el mismo patrón: validar fila a fila, seguir con las demás si una falla,
  // y devolver un desglose de qué se importó y qué no (y por qué).
  private static readonly FECHA = /^\d{4}-\d{2}-\d{2}$/;
  private static readonly ESTADOS = Object.values(EstadoFlashcard) as string[];

  // ⭐ Validación por fila (estándar nov 2026). Devuelve el error o null.
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
    if (fc.pregunta.length > 4000 || fc.respuesta.length > 4000 || (fc.explicacion ?? '').length > 6000) return 'texto demasiado largo';
    if ((fc.tipo === TipoFlashcard.VF || fc.tipo === TipoFlashcard.TRAMPA) && !['true', 'false'].includes(fc.respuesta.trim().toLowerCase())) {
      return `"respuesta" debe ser "true" o "false" para el tipo "${fc.tipo}" (recibido: ${JSON.stringify(fc.respuesta)})`;
    }
    if (fc.tipo === TipoFlashcard.HUECO && !fc.pregunta.includes('___')) {
      return 'en el tipo "hueco" la pregunta tiene que llevar el hueco marcado con ___';
    }
    if (fc.tipo === TipoFlashcard.COMPARATIVA) {
      const c = fc.comparativa ?? fc.estructura;
      const texto = (v: any) => typeof v === 'string' && v.trim().length > 0;
      if (!c || typeof c !== 'object' || !texto(c.conceptoA) || !texto(c.conceptoB)) {
        return 'una "comparativa" tiene que traer "comparativa": { conceptoA, conceptoB, diferencias }';
      }
      if (!Array.isArray(c.diferencias) || !c.diferencias.length || c.diferencias.some((d: any) => !d || !texto(d.aspecto) || !texto(d.a) || !texto(d.b))) {
        return '"comparativa.diferencias" tiene que ser una lista de { aspecto, a, b } con texto en los tres';
      }
    }
    if (fc.estado !== undefined && !FlashcardService.ESTADOS.includes(fc.estado)) {
      return `"estado" inválido (recibido: ${JSON.stringify(fc.estado)}); debe ser uno de: ${FlashcardService.ESTADOS.join(', ')}`;
    }
    for (const campo of ['fechaReferencia', 'fechaRevision']) {
      if (fc[campo] !== undefined && fc[campo] !== null && !(typeof fc[campo] === 'string' && FlashcardService.FECHA.test(fc[campo]))) {
        return `"${campo}" tiene que ser una fecha AAAA-MM-DD (recibido: ${JSON.stringify(fc[campo])})`;
      }
    }
    if (!fc.oposicionId && !fc.temaId) {
      return 'falta la oposición: indica "oposicionId" (o elígela arriba) o "temaId"';
    }
    if (fc.tema !== undefined && !(Number.isInteger(Number(fc.tema)) && Number(fc.tema) > 0)) {
      return `"tema" tiene que ser el número del tema (recibido: ${JSON.stringify(fc.tema)})`;
    }
    for (const campo of ['norma', 'articulo', 'apartado', 'referencia', 'bloque', 'fuenteValidacion']) {
      if (fc[campo] !== undefined && fc[campo] !== null && typeof fc[campo] !== 'string' && typeof fc[campo] !== 'number') return `"${campo}" tiene que ser texto`;
    }
    if (String(fc.norma ?? '').length > 40 || String(fc.articulo ?? '').length > 40) return '"norma" o "articulo" demasiado largos';
    return null;
  }

  /** "Art. 22 bis." → "22 bis" (para comparar números de artículo). */
  private static normalizarNumeroArticulo(n: any): string {
    return String(n ?? '')
      .toLowerCase()
      .replace(/^\s*(art[íi]culo|art\.?)\s*/i, '')
      .replace(/[º°ª]/g, '')
      .replace(/\.\s*$/, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Resuelve siglas + número de artículo al artículo de la versión VIGENTE de la ley
   * (versiones_ley.activa). Usa una caché por importación para no repetir consultas.
   */
  private async resolverArticulo(
    siglas: string,
    numero: string,
    cache: Map<string, Map<string, string> | null>,
  ): Promise<string | null> {
    const clave = siglas.trim().toLowerCase();
    if (!cache.has(clave)) {
      const [version] = await this.fcRepo.query(
        `SELECT v.id FROM versiones_ley v JOIN leyes l ON l.id = v."leyId"
          WHERE lower(trim(l.siglas)) = $1 AND v.activa = true
          ORDER BY v."creadoEn" DESC LIMIT 1`,
        [clave],
      );
      if (!version) {
        cache.set(clave, null);
      } else {
        // Artículos de esa versión: por capítulo, por sección (→ capítulo) o colgando del título;
        // y el título puede estar en la versión directamente o dentro de un libro (p. ej. el CC).
        const filas: { id: string; numero: string }[] = await this.fcRepo.query(
          `SELECT a.id, a.numero FROM articulos a
             LEFT JOIN secciones s ON s.id = a."seccionId"
             LEFT JOIN capitulos c ON c.id = COALESCE(a."capituloId", s."capituloId")
             LEFT JOIN titulos t ON t.id = COALESCE(c."tituloRefId", a."tituloRefId")
             LEFT JOIN libros lb ON lb.id = t."libroId"
            WHERE COALESCE(t."versionLeyId", lb."versionLeyId") = $1
            ORDER BY a.orden ASC`,
          [version.id],
        );
        const mapa = new Map<string, string>();
        for (const f of filas) {
          const n = FlashcardService.normalizarNumeroArticulo(f.numero);
          if (n && !mapa.has(n)) mapa.set(n, f.id);
        }
        cache.set(clave, mapa);
      }
    }
    const mapa = cache.get(clave);
    return mapa?.get(FlashcardService.normalizarNumeroArticulo(numero)) ?? null;
  }

  /**
   * Importación (estándar nov 2026). Cada fila:
   *   tipo, nivel, pregunta, respuesta, explicacion,
   *   oposicionId | temaId | tema (número, con oposicionId),
   *   bloque?, norma? (siglas), articulo? (número), apartado?, referencia?, fechaReferencia?,
   *   comparativa? { conceptoA, conceptoB, diferencias:[{aspecto,a,b}] }, estado?, fuenteValidacion?,
   *   fechaRevision?, esParaDuelo?   (articuloId sigue aceptándose)
   * Si norma+articulo no se resuelven, se guarda la referencia y la FC queda "pendiente_revision".
   * Duplicados: misma pregunta en la misma oposición.
   */
  async importar(flashcards: any[]): Promise<{
    importadas: number;
    enlazadas: number;
    noEnlazadas: { fila: number; pregunta: string; referencia: string }[];
    duplicadas: { fila: number; pregunta: string }[];
    pendientesRevision: number;
    errores: string[];
    sinVincular: number;
  }> {
    const errores: string[] = [];
    const noEnlazadas: { fila: number; pregunta: string; referencia: string }[] = [];
    const duplicadas: { fila: number; pregunta: string }[] = [];
    let importadas = 0;
    let enlazadas = 0;
    let pendientesRevision = 0;
    if (!Array.isArray(flashcards)) throw new BadRequestException('"flashcards" tiene que ser una lista');
    if (flashcards.length > 5000) throw new BadRequestException('Como mucho 5.000 flashcards por importación');

    const cacheLeyes = new Map<string, Map<string, string> | null>();
    const preguntasPorOposicion = new Map<string, Set<string>>();
    const temasPorOposicion = new Map<string, Map<number, string>>();
    const oposicionDeTema = new Map<string, string | null>();
    const norm = (t: string) => t.trim().toLowerCase().replace(/\s+/g, ' ');
    const recorte = (t: string) => (t.length > 80 ? t.slice(0, 80) + '…' : t);

    const preguntasDe = async (oposicionId: string) => {
      if (!preguntasPorOposicion.has(oposicionId)) {
        const filas: { p: string }[] = await this.fcRepo.query(
          `SELECT f.pregunta AS p FROM flashcards f
            WHERE f."usuarioId" IS NULL AND (f."oposicionId" = $1 OR EXISTS (
              SELECT 1 FROM temas t JOIN convocatorias c ON c.id = t."convocatoriaId" WHERE t.id = f."temaId" AND c."oposicionId" = $1))`,
          [oposicionId],
        );
        preguntasPorOposicion.set(oposicionId, new Set(filas.map((f) => norm(f.p))));
      }
      return preguntasPorOposicion.get(oposicionId)!;
    };
    // Temas (número → id) de la convocatoria activa de la oposición (o la más reciente)
    const temasDe = async (oposicionId: string) => {
      if (!temasPorOposicion.has(oposicionId)) {
        const filas: { id: string; numero: number }[] = await this.fcRepo.query(
          `SELECT t.id, t.numero FROM temas t
            WHERE t."convocatoriaId" = (
              SELECT c.id FROM convocatorias c WHERE c."oposicionId" = $1
               ORDER BY (c.estado::text = 'activa') DESC, c.anyo DESC NULLS LAST LIMIT 1)`,
          [oposicionId],
        );
        temasPorOposicion.set(oposicionId, new Map(filas.map((f) => [Number(f.numero), f.id])));
      }
      return temasPorOposicion.get(oposicionId)!;
    };
    const oposicionDelTema = async (temaId: string) => {
      if (!oposicionDeTema.has(temaId)) {
        const [f] = FlashcardService.UUID.test(temaId)
          ? await this.fcRepo.query(`SELECT c."oposicionId" AS o FROM temas t JOIN convocatorias c ON c.id = t."convocatoriaId" WHERE t.id = $1`, [temaId])
          : [];
        oposicionDeTema.set(temaId, f?.o ?? null);
      }
      return oposicionDeTema.get(temaId)!;
    };

    for (const [i, fc] of flashcards.entries()) {
      const fila = i + 1;
      const etiqueta = `Fila ${fila}`;
      const errorValidacion = this.validarFlashcardImportada(fc);
      if (errorValidacion) {
        errores.push(`${etiqueta}: ${errorValidacion}`);
        continue;
      }

      // ── Oposición y tema
      let oposicionId: string | null = fc.oposicionId ?? null;
      let temaId: string | null = fc.temaId ?? null;
      if (oposicionId && !FlashcardService.UUID.test(oposicionId)) { errores.push(`${etiqueta}: "oposicionId" no válido`); continue; }
      if (temaId) {
        const opoTema = await oposicionDelTema(temaId);
        if (!opoTema) { errores.push(`${etiqueta}: el tema indicado no existe`); continue; }
        if (oposicionId && oposicionId !== opoTema) { errores.push(`${etiqueta}: el tema no es de la oposición indicada`); continue; }
        oposicionId = opoTema;
      } else if (fc.tema !== undefined) {
        if (!oposicionId) { errores.push(`${etiqueta}: para usar "tema" (número) hay que indicar la oposición`); continue; }
        temaId = (await temasDe(oposicionId)).get(Number(fc.tema)) ?? null;
        if (!temaId) { errores.push(`${etiqueta}: la oposición no tiene un tema ${fc.tema} en su convocatoria activa`); continue; }
      }
      if (!oposicionId) { errores.push(`${etiqueta}: falta la oposición`); continue; }

      // ── Duplicados dentro de la oposición (incluye las de este mismo lote)
      const preguntas = await preguntasDe(oposicionId);
      const clave = norm(fc.pregunta);
      if (preguntas.has(clave)) {
        duplicadas.push({ fila, pregunta: recorte(fc.pregunta.trim()) });
        continue;
      }

      // ── Norma y artículo → artículo de la versión vigente
      const siglas = fc.norma !== undefined && fc.norma !== null ? String(fc.norma).trim().toUpperCase() : '';
      // "Art. 14" → "14" (se guarda limpio para mostrarlo y para volver a enlazar)
      const numArt = fc.articulo !== undefined && fc.articulo !== null
        ? String(fc.articulo).trim().replace(/^(art[íi]culo|art\.?)\s*/i, '').trim()
        : '';
      const apartado = fc.apartado !== undefined && fc.apartado !== null ? String(fc.apartado).trim() : '';
      let articuloId: string | null = fc.articuloId && FlashcardService.UUID.test(fc.articuloId) ? fc.articuloId : null;
      const pideArticulo = !!(siglas || numArt);
      if (!articuloId && siglas && numArt) {
        articuloId = await this.resolverArticulo(siglas, numArt, cacheLeyes);
      }
      const referencia = (fc.referencia ? String(fc.referencia).trim() : '')
        || (numArt ? `art. ${numArt}${apartado ? '.' + apartado : ''}${siglas ? ' ' + siglas : ''}` : '')
        || null;

      let estado: EstadoFlashcard = (fc.estado as EstadoFlashcard) ?? EstadoFlashcard.VALIDADA;
      const sinEnlazar = pideArticulo && !articuloId;
      if (sinEnlazar && estado === EstadoFlashcard.VALIDADA) estado = EstadoFlashcard.PENDIENTE_REVISION;

      const sinDuelo = fc.tipo === TipoFlashcard.SUPUESTO || fc.tipo === TipoFlashcard.COMPARATIVA;
      const c = fc.comparativa ?? fc.estructura;
      const respuesta = fc.tipo === TipoFlashcard.VF || fc.tipo === TipoFlashcard.TRAMPA
        ? fc.respuesta.trim().toLowerCase()
        : fc.respuesta.trim();

      try {
        await this.fcRepo.save(this.fcRepo.create({
          tipo: fc.tipo,
          nivel: fc.nivel ?? NivelFlashcard.BASICO,
          pregunta: fc.pregunta.trim(),
          respuesta,
          explicacion: fc.explicacion?.trim() || null,
          esParaDuelo: sinDuelo ? false : (fc.esParaDuelo ?? (fc.tipo === TipoFlashcard.VF || fc.tipo === TipoFlashcard.TRAMPA)),
          articulo: articuloId ? ({ id: articuloId } as any) : undefined,
          tema: temaId ? ({ id: temaId } as any) : undefined,
          oposicion: { id: oposicionId } as any,
          creadaPor: 'admin',
          estado,
          bloque: fc.bloque ? String(fc.bloque).trim() : null,
          referencia,
          normaSiglas: siglas || null,
          articuloNumero: numArt || null,
          apartado: apartado || null,
          fechaReferencia: fc.fechaReferencia ?? null,
          estructura: fc.tipo === TipoFlashcard.COMPARATIVA
            ? {
                conceptoA: String(c.conceptoA).trim(),
                conceptoB: String(c.conceptoB).trim(),
                diferencias: c.diferencias.map((d: any) => ({ aspecto: String(d.aspecto).trim(), a: String(d.a).trim(), b: String(d.b).trim() })),
              }
            : null,
          fuenteValidacion: fc.fuenteValidacion ? String(fc.fuenteValidacion).trim() : null,
          fechaRevision: fc.fechaRevision ?? null,
        } as Partial<Flashcard>));
        preguntas.add(clave);
        importadas++;
        if (articuloId) enlazadas++;
        if (sinEnlazar) noEnlazadas.push({ fila, pregunta: recorte(fc.pregunta.trim()), referencia: referencia ?? `${siglas} ${numArt}`.trim() });
        if (estado === EstadoFlashcard.PENDIENTE_REVISION) pendientesRevision++;
      } catch (e: any) {
        // Lo habitual: un id (tema/oposición/artículo) que no existe
        errores.push(`${etiqueta}: error al guardar — ${e?.message ?? 'error desconocido'}`);
      }
    }

    return { importadas, enlazadas, noEnlazadas, duplicadas, pendientesRevision, errores, sinVincular: 0 };
  }

  /**
   * Vuelve a enlazar con su artículo las flashcards que tienen norma y número guardados pero
   * se quedaron sin artículo (no se encontró al importar, o se reimportó la ley y se perdió el
   * enlace). No cambia su estado: si estaban pendientes de revisión, siguen así.
   */
  async reenlazarArticulos(oposicionId?: string): Promise<{ revisadas: number; enlazadas: number }> {
    const usarOpo = !!oposicionId && FlashcardService.UUID.test(oposicionId);
    const filas: { id: string; s: string; n: string }[] = await this.fcRepo.query(
      `SELECT f.id, f."normaSiglas" AS s, f."articuloNumero" AS n FROM flashcards f
        WHERE f."articuloId" IS NULL AND f."normaSiglas" IS NOT NULL AND f."articuloNumero" IS NOT NULL
          ${usarOpo ? `AND (f."oposicionId" = $1 OR EXISTS (SELECT 1 FROM temas t JOIN convocatorias c ON c.id = t."convocatoriaId" WHERE t.id = f."temaId" AND c."oposicionId" = $1))` : ''}`,
      usarOpo ? [oposicionId] : [],
    );
    const cache = new Map<string, Map<string, string> | null>();
    let enlazadas = 0;
    for (const f of filas) {
      const articuloId = await this.resolverArticulo(f.s, f.n, cache);
      if (articuloId) {
        await this.fcRepo.query(`UPDATE flashcards SET "articuloId" = $1 WHERE id = $2`, [articuloId, f.id]);
        enlazadas++;
      }
    }
    return { revisadas: filas.length, enlazadas };
  }

  /** Flashcards de un artículo, solo de la oposición indicada (sin oposición no devuelve nada). */
  async findByArticulo(articuloId: string, oposicionId?: string): Promise<Flashcard[]> {
    if (!oposicionId || !FlashcardService.UUID.test(oposicionId) || !FlashcardService.UUID.test(articuloId)) return [];
    return this.fcRepo
      .createQueryBuilder('fc')
      .leftJoinAndSelect('fc.articulo', 'art')
      .leftJoinAndSelect('fc.tema', 'tema')
      .where('fc."articuloId" = :articuloId', { articuloId })
      .andWhere(sqlVisible('fc', ':opoId'), { opoId: oposicionId })
      .orderBy('fc."creadoEn"', 'ASC')
      .getMany();
  }

  /** Todas las flashcards visibles de un tema (de la oposición de ese tema), en orden de subida. */
  async findByTema(temaId: string): Promise<Flashcard[]> {
    if (!FlashcardService.UUID.test(temaId)) return [];
    const filas: { id: string }[] = await this.fcRepo.query(
      `SELECT f.id FROM flashcards f
         JOIN temas t ON t.id = $1
         JOIN convocatorias c ON c.id = t."convocatoriaId"
        WHERE ${sqlDeTema('f', '$1')} AND ${sqlVisible('f', 'c."oposicionId"')}
        ORDER BY f."creadoEn" ASC, f.id ASC`,
      [temaId],
    );
    return this.cargarEnOrden(filas.map((f) => f.id));
  }

  async findByOposicion(oposicionId: string): Promise<Flashcard[]> {
    if (!FlashcardService.UUID.test(oposicionId)) return [];
    return this.fcRepo
      .createQueryBuilder('fc')
      .leftJoinAndSelect('fc.articulo', 'art')
      .leftJoinAndSelect('fc.tema', 'tema')
      .where(sqlVisible('fc', ':opoId'), { opoId: oposicionId })
      .getMany();
  }

  /** Carga flashcards por id (con tema y artículo) respetando el orden recibido. */
  private async cargarEnOrden(ids: string[]): Promise<Flashcard[]> {
    if (!ids.length) return [];
    const fcs = await this.fcRepo.find({ where: { id: In(ids) }, relations: ['tema', 'articulo'] });
    const porId = new Map(fcs.map((f) => [f.id, f]));
    return ids.map((id) => porId.get(id)!).filter(Boolean);
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
    // ⭐ Solo validadas y de la oposición del duelo (antes, sin tema, solo entraban las que tenían
    // oposicionId directo; con tema, podían colarse las de otra oposición por el artículo).
    if (temaId || versionLeyId) {
      let query = this.fcRepo
        .createQueryBuilder('fc')
        .leftJoin('fc.articulo', 'art')
        .where(sqlVisible('fc', ':opoDuelo'), { opoDuelo: oposicionId })
        .andWhere('fc.esParaDuelo = true')
        .andWhere('fc.tipo IN (:...tiposDuelo)', { tiposDuelo: TIPOS_DUELO });

      if (temaId) {
        query = query.andWhere(sqlDeTema('fc', ':temaId'), { temaId });
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

      const filas = await query.select('fc.id', 'id').getRawMany();
      return this.cargarAlAzar(filas.map((f: any) => f.id), limite);
    }
    const todas = await this.fcRepo
      .createQueryBuilder('fc')
      .select('fc.id', 'id')
      .where(sqlVisible('fc', ':opoDuelo'), { opoDuelo: oposicionId })
      .andWhere('fc.esParaDuelo = true')
      .andWhere('fc.tipo IN (:...tiposDuelo)', { tiposDuelo: TIPOS_DUELO })
      .getRawMany();
    return this.cargarAlAzar(todas.map((f: any) => f.id), limite);
  }

  // ⭐ Antes los duelos salían siempre con las mismas tarjetas (las más antiguas). Ahora se eligen
  // al azar entre todas las válidas.
  private async cargarAlAzar(ids: string[], limite: number): Promise<Flashcard[]> {
    const elegidos = [...new Set(ids)];
    for (let i = elegidos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [elegidos[i], elegidos[j]] = [elegidos[j], elegidos[i]];
    }
    const lote = elegidos.slice(0, Math.max(0, limite));
    if (!lote.length) return [];
    const filas = await this.fcRepo.find({ where: { id: In(lote) } });
    const orden = new Map(lote.map((id, i) => [id, i]));
    return filas.sort((a, b) => (orden.get(a.id) ?? 0) - (orden.get(b.id) ?? 0));
  }

  // ─── REPASO ──────────────────────────────────────────────

  // ⭐ Solo los REPASOS que tocan (tarjetas ya vistas cuyo día ha llegado). Antes se rellenaba con
  // tarjetas nuevas de toda la oposición, y al subir un temario entero el botón de Inicio
  // mostraba miles de "pendientes" sin saber de qué tema eran. Las nuevas se empiezan ahora
  // desde cada tema, eligiendo cuántas (ver nuevasDeTema).
  async getPendientesRepaso(usuarioId: string, oposicionId: string, limite = 10, temaId?: string): Promise<Flashcard[]> {
  const ahora = new Date();
  const tope = Math.max(1, Math.min(200, Math.trunc(limite) || 10));
  if (!FlashcardService.UUID.test(oposicionId)) return [];
  const qb = this.repasoRepo
    .createQueryBuilder('r')
    .innerJoinAndSelect('r.flashcard', 'fc')
    .leftJoinAndSelect('fc.tema', 'tema')
    .leftJoinAndSelect('fc.articulo', 'art')
    .where('r."usuarioId" = :usuarioId', { usuarioId })
    .andWhere('r."proximoRepaso" <= :ahora', { ahora })
    .andWhere(sqlVisible('fc', ':opoId'), { opoId: oposicionId });
  if (temaId && FlashcardService.UUID.test(temaId)) {
    qb.andWhere(sqlDeTema('fc', ':temaId'), { temaId });
  }
  // Primero las que llevan más tiempo esperando
  const repasos = await qb.orderBy('r."proximoRepaso"', 'ASC').addOrderBy('r.id', 'ASC').limit(tope).getMany();
  return repasos.map((r) => r.flashcard);
}

  // Flashcards de cada tema de una convocatoria (directas o por artículo vinculado al tema),
  // oficiales o personales del propio usuario.
  private get sqlFlashcardsPorTema() { return `
    SELECT t.id AS "temaId", fc.id AS "fcId"
      FROM temas t
      JOIN convocatorias c ON c.id = t."convocatoriaId"
      JOIN flashcards fc ON fc."temaId" = t.id
     WHERE t."convocatoriaId" = $1 AND ${sqlVisible('fc', 'c."oposicionId"')}
    UNION
    SELECT tn."temaId", fc.id
      FROM temas_normativa tn
      JOIN temas t ON t.id = tn."temaId"
      JOIN convocatorias c ON c.id = t."convocatoriaId"
      JOIN flashcards fc ON fc."articuloId" = tn."articuloId" AND fc."temaId" IS NULL
     WHERE t."convocatoriaId" = $1 AND ${sqlVisible('fc', 'c."oposicionId"')}`; }

  /** Por cada tema: cuántas tiene, cuántas ha visto, dominadas y por repasar hoy. Y las nuevas de hoy. */
  async resumenTemas(usuarioId: string, convocatoriaId: string) {
    if (!FlashcardService.UUID.test(convocatoriaId)) throw new BadRequestException('Convocatoria no válida');
    const temas: { temaId: string; total: number; vistas: number; dominadas: number; porRepasar: number }[] =
      await this.repasoRepo.query(
        `WITH tfc AS (${this.sqlFlashcardsPorTema})
         SELECT tfc."temaId",
                COUNT(*)::int AS total,
                COUNT(r.id)::int AS vistas,
                (COUNT(*) FILTER (WHERE r.estado = 'dominada'))::int AS dominadas,
                (COUNT(*) FILTER (WHERE r."proximoRepaso" <= $3))::int AS "porRepasar"
           FROM tfc
           LEFT JOIN repasos_fc r ON r."flashcardId" = tfc."fcId" AND r."usuarioId" = $2
          GROUP BY tfc."temaId"`,
        [convocatoriaId, usuarioId, new Date()],
      );
    return { temas, nuevasHoy: await this.nuevasHoy(usuarioId) };
  }

  /** Tarjetas que el usuario ha empezado hoy (hora de Madrid). */
  async nuevasHoy(usuarioId: string): Promise<number> {
    const [{ n }] = await this.repasoRepo.query(
      `SELECT COUNT(*)::int AS n FROM repasos_fc WHERE "usuarioId" = $1 AND "primeraVez" >= $2`,
      [usuarioId, inicioDiaMadrid()],
    );
    return n;
  }

  /** Las primeras N tarjetas sin ver de un tema, en el orden en que se subieron (el del temario). */
  async nuevasDeTema(usuarioId: string, temaId: string, limite = 10): Promise<Flashcard[]> {
    if (!FlashcardService.UUID.test(temaId)) throw new BadRequestException('Tema no válido');
    const tope = Math.max(1, Math.min(200, Math.trunc(limite) || 10));
    const filas: { id: string }[] = await this.fcRepo.query(
      `SELECT f.id
         FROM flashcards f
         JOIN temas t ON t.id = $1
         JOIN convocatorias c ON c.id = t."convocatoriaId"
        WHERE ${sqlDeTema('f', '$1')} AND ${sqlVisible('f', 'c."oposicionId"')}
          AND NOT EXISTS (SELECT 1 FROM repasos_fc r WHERE r."flashcardId" = f.id AND r."usuarioId" = $2)
        ORDER BY f."creadoEn" ASC, f.id ASC
        LIMIT $3`,
      [temaId, usuarioId, tope],
    );
    return this.cargarEnOrden(filas.map((f) => f.id));
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

  // ⭐ Límite diario de flashcards del plan (antes solo se mostraba, no se aplicaba).
  await this.comprobarLimiteFlashcards(usuarioId);

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
      primeraVez: ahora,
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
  await this.usuarioRepo.increment({ id: usuarioId }, 'flashcardsHoy', 1);
  await registrarDiaDeEstudio(this.usuarioRepo.manager, usuarioId); // ⭐ cuenta para la racha

  if (
    repasoGuardado.estado === EstadoFC.DOMINADA &&
    estadoAnterior !== EstadoFC.DOMINADA
  ) {
    // Marca atómica: solo la primera vez que se domina esta tarjeta da puntos
    const marcado = await this.repasoRepo
      .createQueryBuilder()
      .update(RepasoFC)
      .set({ puntosDados: true })
      .where('id = :id AND "puntosDados" = false', { id: repasoGuardado.id })
      .execute();
    if (marcado.affected) {
      repasoGuardado.puntosDados = true;
      await this.darPuntosPorDominar(usuarioId, flashcardId);
    }
  }

  return repasoGuardado;
}

private async comprobarLimiteFlashcards(usuarioId: string): Promise<void> {
  const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
  if (!usuario) throw new NotFoundException('Usuario no encontrado');
  const fechaAntes = usuario.fechaResetConsumo;
  resetearConsumosSiEsNuevoDia(usuario);
  if (usuario.fechaResetConsumo !== fechaAntes) {
    await this.usuarioRepo.update(usuarioId, {
      preguntasTestHoy: usuario.preguntasTestHoy,
      flashcardsHoy: usuario.flashcardsHoy,
      temasRevisadosHoy: usuario.temasRevisadosHoy,
      fechaResetConsumo: usuario.fechaResetConsumo,
    });
  }
  const limites = await this.configuracionService.getLimitesPlanes();
  const limite = limites?.[usuario.suscripcion ?? 'gratuito']?.flashcardsDia;
  if (typeof limite === 'number' && Number.isFinite(limite) && (usuario.flashcardsHoy ?? 0) >= limite) {
    throw new ForbiddenException(
      `Has llegado al límite de ${limite} flashcards al día de tu plan. Vuelve mañana o mejora tu plan para seguir repasando.`,
    );
  }
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
    const flashcards = await this.findByArticulo(articuloId, oposicionId);
    return {
      sugerir: flashcards.length > 0,
      totalFC: flashcards.length,
    };
  }

  async programarRepasoArticulo(
    usuarioId: string,
    articuloId: string,
    cuando: 'manana' | 'finde' | Date,
    oposicionId?: string,
  ): Promise<void> {
    const flashcards = await this.findByArticulo(articuloId, oposicionId);
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
    // ⭐ Mismo criterio que los duelos: validadas, de la oposición y corregibles (vf/trampa)
    const flashcards = await this.findParaDuelo(oposicionId, 10);

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

    // ⭐ El retador aún no ha jugado: sin soluciones en la respuesta.
    reto.flashcards = (reto.flashcards ?? []).map((fc) => ({ ...fc, respuesta: undefined, explicacion: undefined }) as any);
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

async getEstadisticasFCTema(
  usuarioId: string,
  oposicionId: string,
  temaId: string,
): Promise<any> {

  if (!FlashcardService.UUID.test(temaId) || !FlashcardService.UUID.test(oposicionId)) {
    return { total: 0, dominadas: 0, dudosas: 0, noDominadas: 0, sinVer: 0 };
  }
  // Total de flashcards visibles del tema (validadas y de la oposición)
  const total = await this.fcRepo
    .createQueryBuilder('fc')
    .where(sqlVisible('fc', ':opoId'), { opoId: oposicionId })
    .andWhere(sqlDeTema('fc', ':temaId'), { temaId })
    .getCount();

  // Stats del usuario para esas mismas flashcards
  const repasos = await this.repasoRepo
    .createQueryBuilder('r')
    .innerJoin('r.flashcard', 'fc')
    .where('r."usuarioId" = :usuarioId', { usuarioId })
    .andWhere(sqlVisible('fc', ':opoId'), { opoId: oposicionId })
    .andWhere(sqlDeTema('fc', ':temaId'), { temaId })
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
  const inicioHoy = inicioDiaMadrid(ahora); // ⭐ medianoche de España (antes UTC)
  const inicioSemana = new Date(ahora); inicioSemana.setDate(ahora.getDate() - 7);
  const inicioMes = new Date(ahora); inicioMes.setDate(ahora.getDate() - 30);

  // Todos los repasos del usuario para flashcards de esa oposición
  const subPeriodo = this.flashcardsDeOposicionQB(oposicionId, 'pfc').select('pfc.id');
  const repasos = await this.repasoRepo
    .createQueryBuilder('r')
    .where('r."usuarioId" = :usuarioId', { usuarioId })
    // ⭐ Mismo conjunto de flashcards que las estadísticas generales (antes quedaban fuera las
    // de artículos de ley).
    .andWhere(`r."flashcardId" IN (${subPeriodo.getQuery()})`)
    .setParameters(subPeriodo.getParameters())
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
    // ⭐ En los duelos el tiempo total (que desempata) lo mide el servidor desde que pulsó "Empezar".
    const tiempoTotal = reto.tipo === TipoRetoFC.DUELO
      ? await this.inicioDuelo.tiempoMs('fc', reto.id, usuarioId, reto.creadoEn)
      : respuestas.reduce((acc, r) => acc + r.tiempoRespuesta, 0);

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
      // ⭐ Tope: los 300 más recientes (antes se cargaba el historial entero en cada visita)
      .take(300)
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
        // Las respuestas corregidas del rival también revelan las soluciones
        for (const x of r.resultados ?? []) {
          if ((x as any).usuario?.id !== usuarioId) (x as any).respuestas = null;
        }
      }
    }

    return retos;
  }

  // ─── STATS ───────────────────────────────────────────────

  /**
   * Flashcards activas de una oposición (por oposición directa, por tema de una de sus
   * convocatorias o por artículo de una de sus leyes, también vía Sección). Se usa para el
   * total y como subconsulta para contar solo los repasos de ESA oposición.
   */
  private flashcardsDeOposicionQB(oposicionId: string, alias = 'fc') {
    // ⭐ Mismo criterio único que el resto (validadas y de la oposición, no por ley compartida)
    return this.fcRepo
      .createQueryBuilder(alias)
      .where(sqlVisible(alias, ':fcOpoId'), { fcOpoId: FlashcardService.UUID.test(oposicionId) ? oposicionId : '00000000-0000-0000-0000-000000000000' });
  }

  async getEstadisticasFC(usuarioId: string, oposicionId: string): Promise<any> {
  const total = await this.flashcardsDeOposicionQB(oposicionId).getCount();

  // ⭐ Antes se contaban las dominadas/dudosas de TODAS las oposiciones del usuario y el total
  // solo de la activa (salían porcentajes de más del 100%). Ahora solo cuentan los repasos de
  // flashcards de esta oposición.
  const sub = this.flashcardsDeOposicionQB(oposicionId, 'sfc').select('sfc.id');
  const filas: { estado: EstadoFC; n: string }[] = await this.repasoRepo
    .createQueryBuilder('r')
    .select('r.estado', 'estado')
    .addSelect('COUNT(*)', 'n')
    .where('r."usuarioId" = :usuarioId', { usuarioId })
    .andWhere(`r."flashcardId" IN (${sub.getQuery()})`)
    .setParameters(sub.getParameters())
    .groupBy('r.estado')
    .getRawMany();

  const contar = (e: EstadoFC) => Number(filas.find((f) => f.estado === e)?.n ?? 0);
  const dominadas = contar(EstadoFC.DOMINADA);
  const dudosas = contar(EstadoFC.DUDOSA);
  const noDominadas = contar(EstadoFC.NO_DOMINADA);

  return {
    total,
    dominadas,
    dudosas,
    noDominadas,
    sinVer: Math.max(0, total - dominadas - dudosas - noDominadas),
  };
}

  // ─── ADMIN ───────────────────────────────────────────────

  private static readonly UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  /** Listado para el panel: 50 por página, con búsqueda, tipo, estado y oposición (directa o por tema). */
  async listarAdmin(f: { oposicionId?: string; temaId?: string; q?: string; tipo?: string; estado?: string; revision?: string; pagina: number }) {
    const POR_PAGINA = 50;
    const qb = this.fcRepo
      .createQueryBuilder('fc')
      .leftJoinAndSelect('fc.tema', 'tema')
      .leftJoinAndSelect('fc.articulo', 'art')
      .leftJoinAndSelect('fc.oposicion', 'opo')
      .leftJoin('tema.convocatoria', 'conv');
    if (f.oposicionId && FlashcardService.UUID.test(f.oposicionId)) {
      qb.andWhere('(opo.id = :o OR conv."oposicionId" = :o)', { o: f.oposicionId });
    }
    if (f.temaId && FlashcardService.UUID.test(f.temaId)) qb.andWhere('tema.id = :t', { t: f.temaId });
    const q = (f.q ?? '').trim();
    if (q) qb.andWhere('(fc.pregunta ILIKE :q OR fc.respuesta ILIKE :q OR fc.explicacion ILIKE :q)', { q: `%${q.replace(/[%_\\]/g, (c) => '\\' + c)}%` });
    if (f.tipo && (Object.values(TipoFlashcard) as string[]).includes(f.tipo)) qb.andWhere('fc.tipo = :tipo', { tipo: f.tipo });
    if (f.estado === 'activas') qb.andWhere('fc.activa = true');
    if (f.estado === 'inactivas') qb.andWhere('fc.activa = false');
    if (f.estado === 'duelo') qb.andWhere('fc.esParaDuelo = true');
    // Recuento por estado editorial con los filtros de oposición/tema (para las pestañas del panel)
    const porEstadoFilas: { estado: string; n: number }[] = await qb.clone()
      .select('fc.estado', 'estado').addSelect('COUNT(*)::int', 'n')
      .groupBy('fc.estado').orderBy().skip(undefined).take(undefined)
      .getRawMany();
    const porEstado = Object.fromEntries(porEstadoFilas.map((r) => [r.estado, Number(r.n)]));
    if (f.revision && FlashcardService.ESTADOS.includes(f.revision)) qb.andWhere('fc.estado = :revision', { revision: f.revision });
    const pagina = Math.max(1, Math.min(10_000, Math.trunc(f.pagina) || 1));
    const [items, total] = await qb
      .orderBy('fc.creadoEn', 'DESC')
      .skip((pagina - 1) * POR_PAGINA)
      .take(POR_PAGINA)
      .getManyAndCount();
    // Cuántos usuarios la han repasado (para avisar antes de borrar)
    const ids = items.map((i) => i.id);
    const usos: { id: string; n: number }[] = ids.length
      ? await this.repasoRepo.query(`SELECT "flashcardId" AS id, COUNT(*)::int AS n FROM repasos_fc WHERE "flashcardId" = ANY($1) GROUP BY 1`, [ids])
      : [];
    const mapa = new Map(usos.map((u) => [u.id, u.n]));
    return {
      items: items.map((i) => ({
        id: i.id, tipo: i.tipo, nivel: i.nivel, pregunta: i.pregunta, respuesta: i.respuesta,
        explicacion: i.explicacion, esParaDuelo: i.esParaDuelo, activa: i.activa, creadoEn: i.creadoEn,
        estado: i.estado, bloque: i.bloque, referencia: i.referencia, normaSiglas: i.normaSiglas, articuloNumero: i.articuloNumero,
        apartado: i.apartado, fechaReferencia: i.fechaReferencia, estructura: i.estructura, fechaRevision: i.fechaRevision,
        fuenteValidacion: i.fuenteValidacion, motivoObsolescencia: i.motivoObsolescencia,
        tema: i.tema ? { id: i.tema.id, numero: (i.tema as any).numero, titulo: (i.tema as any).titulo } : null,
        articulo: i.articulo ? { id: i.articulo.id, numero: (i.articulo as any).numero } : null,
        oposicion: i.oposicion ? { id: i.oposicion.id, nombre: (i.oposicion as any).nombre } : null,
        repasos: mapa.get(i.id) ?? 0,
      })),
      total,
      pagina,
      paginas: Math.max(1, Math.ceil(total / POR_PAGINA)),
      porEstado,
    };
  }

  /** Corregir una tarjeta. Solo se tocan los campos enviados y se validan como en la importación. */
  async editarAdmin(id: string, body: any) {
    const fc = await this.fcRepo.findOne({ where: { id } });
    if (!fc) throw new NotFoundException('Flashcard no encontrada');
    const cambios: Partial<Flashcard> = {};
    const texto = (v: any, campo: string, obligatorio: boolean) => {
      if (v === undefined) return undefined;
      const t = String(v ?? '').trim();
      if (obligatorio && !t) throw new BadRequestException(`${campo} no puede quedar vacío`);
      if (t.length > 4000) throw new BadRequestException(`${campo} es demasiado largo`);
      return t;
    };
    const pregunta = texto(body.pregunta, 'La pregunta', true);
    const respuesta = texto(body.respuesta, 'La respuesta', true);
    const explicacion = texto(body.explicacion, 'La explicación', false);
    if (pregunta !== undefined) cambios.pregunta = pregunta;
    if (respuesta !== undefined) cambios.respuesta = respuesta;
    if (explicacion !== undefined) cambios.explicacion = explicacion || (null as any);
    if (body.tipo !== undefined) {
      if (!(Object.values(TipoFlashcard) as string[]).includes(body.tipo)) throw new BadRequestException('Tipo no válido');
      cambios.tipo = body.tipo;
    }
    if (body.nivel !== undefined) {
      if (!(Object.values(NivelFlashcard) as string[]).includes(body.nivel)) throw new BadRequestException('Nivel no válido');
      cambios.nivel = body.nivel;
    }
    if (typeof body.activa === 'boolean') cambios.activa = body.activa;
    // ⭐ Estado editorial: validar (queda con fecha de revisión de hoy) u obsoleta (con motivo)
    if (body.estado !== undefined) {
      if (!FlashcardService.ESTADOS.includes(body.estado)) throw new BadRequestException('Estado no válido');
      cambios.estado = body.estado;
      if (body.estado === EstadoFlashcard.OBSOLETA) {
        const motivo = String(body.motivoObsolescencia ?? '').trim();
        if (!motivo) throw new BadRequestException('Indica el motivo por el que queda obsoleta');
        if (motivo.length > 1000) throw new BadRequestException('El motivo es demasiado largo');
        cambios.motivoObsolescencia = motivo;
      } else {
        cambios.motivoObsolescencia = null;
      }
      if (body.estado === EstadoFlashcard.VALIDADA) cambios.fechaRevision = diaMadrid();
    }
    if (typeof body.esParaDuelo === 'boolean') cambios.esParaDuelo = body.esParaDuelo;
    const tipoFinal = cambios.tipo ?? fc.tipo;
    const respFinal = String(cambios.respuesta ?? fc.respuesta).trim().toLowerCase();
    if ((tipoFinal === TipoFlashcard.VF || tipoFinal === TipoFlashcard.TRAMPA) && !['true', 'false'].includes(respFinal)) {
      throw new BadRequestException('En verdadero/falso y trampa la respuesta tiene que ser "true" o "false"');
    }
    if (Object.keys(cambios).length) await this.fcRepo.update(id, cambios);
    return this.fcRepo.findOne({ where: { id }, relations: ['tema', 'articulo', 'oposicion'] });
  }

  // Flashcards oficiales (no las personales de los usuarios) de una oposición: vinculadas a ella
  // directamente o a un tema de una de sus convocatorias. Opcionalmente, solo las de un tema.
  private async idsOficiales(oposicionId: string, temaId?: string): Promise<string[]> {
    const filas: { id: string }[] = await this.fcRepo.query(
      `SELECT fc.id FROM flashcards fc
         LEFT JOIN temas t ON t.id = fc."temaId"
         LEFT JOIN convocatorias c ON c.id = t."convocatoriaId"
        WHERE fc."usuarioId" IS NULL
          AND (fc."oposicionId" = $1 OR c."oposicionId" = $1)
          AND ($2::uuid IS NULL OR fc."temaId" = $2::uuid)`,
      [oposicionId, temaId ?? null],
    );
    return filas.map((f) => f.id);
  }

  async temasConFlashcards(oposicionId: string) {
    if (!oposicionId || !FlashcardService.UUID.test(oposicionId)) return { temas: [], sinTema: 0 };
    const temas: { id: string; numero: number; titulo: string; n: number }[] = await this.fcRepo.query(
      `SELECT t.id, t.numero, t.titulo, COUNT(*)::int AS n
         FROM flashcards fc
         JOIN temas t ON t.id = fc."temaId"
         LEFT JOIN convocatorias c ON c.id = t."convocatoriaId"
        WHERE fc."usuarioId" IS NULL AND (fc."oposicionId" = $1 OR c."oposicionId" = $1)
        GROUP BY t.id, t.numero, t.titulo
        ORDER BY t.numero`,
      [oposicionId],
    );
    const [{ n: sinTema }] = await this.fcRepo.query(
      `SELECT COUNT(*)::int AS n FROM flashcards fc WHERE fc."usuarioId" IS NULL AND fc."temaId" IS NULL AND fc."oposicionId" = $1`,
      [oposicionId],
    );
    return { temas, sinTema };
  }

  /** Borrado masivo (con la misma limpieza que el borrado de una sola tarjeta). */
  async borrarMasivo(oposicionId: string, temaId?: string) {
    if (!oposicionId || !FlashcardService.UUID.test(oposicionId)) throw new BadRequestException('Elige una oposición');
    if (temaId && !FlashcardService.UUID.test(temaId)) throw new BadRequestException('Tema no válido');
    const ids = await this.idsOficiales(oposicionId, temaId || undefined);
    if (!ids.length) return { borradas: 0 };
    await this.fcRepo.manager.transaction(async (m) => {
      await m.query(`UPDATE resultados_reto_fc SET "flashcardId" = NULL WHERE "flashcardId" = ANY($1)`, [ids]);
      await m.query(`DELETE FROM repasos_fc WHERE "flashcardId" = ANY($1)`, [ids]);
      await m.query(`DELETE FROM flashcards WHERE id = ANY($1)`, [ids]);
    });
    return { borradas: ids.length };
  }

  /** Borrar una tarjeta: se borran sus repasos; los resultados de duelos ya jugados se conservan. */
  async borrarAdmin(id: string) {
    const fc = await this.fcRepo.findOne({ where: { id } });
    if (!fc) throw new NotFoundException('Flashcard no encontrada');
    await this.fcRepo.manager.transaction(async (m) => {
      await m.query(`UPDATE resultados_reto_fc SET "flashcardId" = NULL WHERE "flashcardId" = $1`, [id]);
      await m.query(`DELETE FROM repasos_fc WHERE "flashcardId" = $1`, [id]);
      await m.query(`DELETE FROM flashcards WHERE id = $1`, [id]);
    });
    return { ok: true };
  }
}