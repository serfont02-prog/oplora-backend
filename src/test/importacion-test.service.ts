import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PreguntaTest } from './pregunta-test.entity';

/**
 * ⭐ IMPORTACIÓN MASIVA DEL BANCO DE TEST (nov 2026)
 *
 * Un solo archivo con preguntas de todos los temas. Cada pregunta dice por sí misma a qué
 * se vincula:
 *   - "tema": número de tema de la convocatoria activa de la oposición (o "temaId"), y/o
 *   - "norma" (siglas) + "articulo" (número), o "articulos": [{ norma, articulo }, ...].
 * Si trae las dos cosas, se vincula al tema Y al artículo (lo normal en preguntas de ley).
 * Hace falta al menos un tema o un artículo que se encuentre.
 *
 * Opciones:
 *   - borrar: 'ninguno' (por defecto) | 'banco' | 'todo'
 *       'banco' borra las preguntas de esta oposición SALVO las de exámenes oficiales;
 *       'todo' borra también las de exámenes oficiales (los simulacros se quedan vacíos).
 *       Nunca borra preguntas que también estén en temas de otra oposición, ni las que solo
 *       cuelgan de artículos de leyes compartidas con otra oposición.
 *   - simular: true → no escribe nada; devuelve el mismo informe para revisar antes.
 *
 * Duplicados (mismo enunciado y mismas opciones): no se crea otra; se vincula la existente
 * al tema/artículo que falte.
 */

type Vinculo = { norma: string; articulo: string };

export interface InformeImportacion {
  simulacion: boolean;
  recibidas: number;
  importadas: number;
  vinculadasExistentes: number;
  yaEstaban: number;
  conArticulo: number;
  noEnlazadas: { fila: number; enunciado: string; referencia: string }[];
  errores: string[];
  borrado?: { modo: string; borradas: number; conservadasOficiales: number; conservadasCompartidas: number };
}

const MAX_POR_PETICION = 2000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normTexto(v: any): string {
  return String(v ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}
/** Igual que claveDuplicado de TestService: enunciado + opciones. */
function claveDuplicado(enunciado: string, opciones: any): string {
  return `${normTexto(enunciado)}§${JSON.stringify((Array.isArray(opciones) ? opciones : []).map(normTexto))}`;
}
/** Igual que FlashcardService.normalizarNumeroArticulo. */
function normalizarNumeroArticulo(n: any): string {
  return String(n ?? '')
    .toLowerCase()
    .replace(/^\s*(art[íi]culo|art\.?)\s*/i, '')
    .replace(/[º°ª]/g, '')
    .replace(/\.\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Artículo → ley (por capítulo, sección → capítulo, o colgando del título; el título puede
// estar en la versión o dentro de un libro, como en el CC).
const SQL_ARTICULO_LEY = `
  SELECT a.id AS art, v."leyId" AS ley
    FROM articulos a
    LEFT JOIN secciones s ON s.id = a."seccionId"
    LEFT JOIN capitulos c ON c.id = COALESCE(a."capituloId", s."capituloId")
    LEFT JOIN titulos t ON t.id = COALESCE(c."tituloRefId", a."tituloRefId")
    LEFT JOIN libros lb ON lb.id = t."libroId"
    JOIN versiones_ley v ON v.id = COALESCE(t."versionLeyId", lb."versionLeyId")`;

@Injectable()
export class ImportacionTestService {
  constructor(
    @InjectRepository(PreguntaTest)
    private readonly preguntaRepo: Repository<PreguntaTest>,
    private readonly dataSource: DataSource,
  ) {}

  /* ───────────────────────── Borrado ───────────────────────── */

  /** Ids de las preguntas de la oposición que se borrarían (y cuántas se conservan y por qué). */
  private async candidatasABorrar(oposicionId: string, incluirOficiales: boolean) {
    const filas: { id: string; oficial: boolean; compartida: boolean }[] = await this.preguntaRepo.query(
      `WITH opo_temas AS (
         SELECT t.id FROM temas t JOIN convocatorias c ON c.id = t."convocatoriaId" WHERE c."oposicionId" = $1),
       otros_temas AS (
         SELECT t.id FROM temas t JOIN convocatorias c ON c.id = t."convocatoriaId" WHERE c."oposicionId" <> $1),
       art_ley AS (${SQL_ARTICULO_LEY}),
       leyes_otras AS (SELECT "leyId" FROM oposiciones_leyes WHERE "oposicionId" <> $1),
       leyes_opo AS (SELECT "leyId" FROM oposiciones_leyes WHERE "oposicionId" = $1),
       base AS (
         SELECT p.id, p."examenAnteriorId" IS NOT NULL AS oficial,
           EXISTS (SELECT 1 FROM preguntas_test_temas_temas x WHERE x."preguntasTestId" = p.id AND x."temasId" IN (SELECT id FROM opo_temas)) AS en_tema_opo,
           EXISTS (SELECT 1 FROM preguntas_test_temas_temas x WHERE x."preguntasTestId" = p.id) AS con_tema,
           EXISTS (SELECT 1 FROM preguntas_test_temas_temas x WHERE x."preguntasTestId" = p.id AND x."temasId" IN (SELECT id FROM otros_temas)) AS en_otra_opo,
           EXISTS (SELECT 1 FROM preguntas_test_articulos_articulos y JOIN art_ley al ON al.art = y."articulosId"
                    WHERE y."preguntasTestId" = p.id AND al.ley IN (SELECT "leyId" FROM leyes_opo)) AS ley_opo,
           EXISTS (SELECT 1 FROM preguntas_test_articulos_articulos y JOIN art_ley al ON al.art = y."articulosId"
                    WHERE y."preguntasTestId" = p.id AND al.ley IN (SELECT "leyId" FROM leyes_otras)) AS ley_compartida
           FROM preguntas_test p)
       SELECT id, oficial,
              (en_otra_opo OR (NOT con_tema AND ley_compartida)) AS compartida
         FROM base
        WHERE en_tema_opo OR (NOT con_tema AND ley_opo)`,
      [oposicionId],
    );
    const borrar = filas.filter((f) => !f.compartida && (incluirOficiales || !f.oficial)).map((f) => f.id);
    return {
      borrar,
      conservadasOficiales: filas.filter((f) => !f.compartida && f.oficial && !incluirOficiales).length,
      conservadasCompartidas: filas.filter((f) => f.compartida).length,
    };
  }

  /* ──────────────────────── Importación ─────────────────────── */

  async importarMasivo(
    oposicionId: string,
    preguntas: any[],
    opciones: { borrar?: string; simular?: boolean; offset?: number } = {},
  ): Promise<InformeImportacion> {
    if (!UUID.test(oposicionId ?? '')) throw new BadRequestException('oposicionId no válido');
    if (!Array.isArray(preguntas)) throw new BadRequestException('"preguntas" tiene que ser una lista');
    if (preguntas.length > MAX_POR_PETICION) {
      throw new BadRequestException(`Como mucho ${MAX_POR_PETICION} preguntas por envío (la pantalla de importación las manda por partes)`);
    }
    const [opo] = await this.preguntaRepo.query(`SELECT id FROM oposiciones WHERE id = $1`, [oposicionId]);
    if (!opo) throw new NotFoundException('Oposición no encontrada');

    const simular = opciones.simular === true;
    const modoBorrado = ['banco', 'todo'].includes(String(opciones.borrar)) ? String(opciones.borrar) : 'ninguno';

    const informe: InformeImportacion = {
      simulacion: simular, recibidas: preguntas.length, importadas: 0, vinculadasExistentes: 0,
      yaEstaban: 0, conArticulo: 0, noEnlazadas: [], errores: [],
    };

    // ── 1. Borrado previo (si se pide)
    if (modoBorrado !== 'ninguno') {
      const c = await this.candidatasABorrar(oposicionId, modoBorrado === 'todo');
      if (!simular && c.borrar.length) {
        await this.dataSource.transaction(async (m) => {
          for (let i = 0; i < c.borrar.length; i += 1000) {
            // Las tablas intermedias (temas/artículos) se limpian solas (ON DELETE CASCADE).
            await m.query(`DELETE FROM preguntas_test WHERE id = ANY($1::uuid[])`, [c.borrar.slice(i, i + 1000)]);
          }
        });
      }
      informe.borrado = {
        modo: modoBorrado, borradas: c.borrar.length,
        conservadasOficiales: c.conservadasOficiales, conservadasCompartidas: c.conservadasCompartidas,
      };
    }

    // ── 2. Datos de apoyo
    const temas: { id: string; numero: number }[] = await this.preguntaRepo.query(
      `SELECT t.id, t.numero FROM temas t
        WHERE t."convocatoriaId" = (
          SELECT c.id FROM convocatorias c WHERE c."oposicionId" = $1
           ORDER BY (c.estado::text = 'activa') DESC, c.anyo DESC NULLS LAST LIMIT 1)`,
      [oposicionId],
    );
    const temaPorNumero = new Map(temas.map((t) => [Number(t.numero), t.id]));
    const temaIdsValidos = new Set(temas.map((t) => t.id));

    const cacheLeyes = new Map<string, Map<string, string> | null>();
    const resolverArticulo = async (siglas: string, numero: string): Promise<string | null> => {
      const clave = siglas.trim().toLowerCase();
      if (!cacheLeyes.has(clave)) {
        const [version] = await this.preguntaRepo.query(
          `SELECT v.id FROM versiones_ley v JOIN leyes l ON l.id = v."leyId"
            WHERE lower(trim(l.siglas)) = $1 AND v.activa = true
            ORDER BY v."creadoEn" DESC LIMIT 1`,
          [clave],
        );
        if (!version) cacheLeyes.set(clave, null);
        else {
          const filas: { id: string; numero: string }[] = await this.preguntaRepo.query(
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
            const n = normalizarNumeroArticulo(f.numero);
            if (n && !mapa.has(n)) mapa.set(n, f.id);
          }
          cacheLeyes.set(clave, mapa);
        }
      }
      return cacheLeyes.get(clave)?.get(normalizarNumeroArticulo(numero)) ?? null;
    };

    // Preguntas que ya existen (después del borrado): clave → id
    const existentes = new Map<string, string>();
    if (!simular || modoBorrado === 'ninguno') {
      const filas: { id: string; enunciado: string; opciones: any }[] =
        await this.preguntaRepo.query(`SELECT id, enunciado, opciones FROM preguntas_test`);
      for (const f of filas) existentes.set(claveDuplicado(f.enunciado, f.opciones), f.id);
    } else {
      // En simulación con borrado: solo cuentan como existentes las que NO se borrarían.
      const c = await this.candidatasABorrar(oposicionId, modoBorrado === 'todo');
      const fuera = new Set(c.borrar);
      const filas: { id: string; enunciado: string; opciones: any }[] =
        await this.preguntaRepo.query(`SELECT id, enunciado, opciones FROM preguntas_test`);
      for (const f of filas) if (!fuera.has(f.id)) existentes.set(claveDuplicado(f.enunciado, f.opciones), f.id);
    }
    const enLote = new Set<string>();

    const vincularSiFalta = async (preguntaId: string, relacion: 'temas' | 'articulos', destinoId: string) => {
      const tabla = relacion === 'temas' ? 'preguntas_test_temas_temas' : 'preguntas_test_articulos_articulos';
      const col = relacion === 'temas' ? 'temasId' : 'articulosId';
      const [fila] = await this.preguntaRepo.query(
        `SELECT 1 FROM ${tabla} WHERE "preguntasTestId" = $1 AND "${col}" = $2 LIMIT 1`, [preguntaId, destinoId]);
      if (fila) return false;
      if (!simular) await this.preguntaRepo.createQueryBuilder().relation(PreguntaTest, relacion).of(preguntaId).add(destinoId);
      return true;
    };

    // ── 3. Pregunta a pregunta
    const offset = Number.isInteger(opciones.offset) ? (opciones.offset as number) : 0;
    for (const [i, p] of preguntas.entries()) {
      const fila = offset + i + 1;
      const etiqueta = `Fila ${fila}${p?.tema !== undefined ? ` (Tema ${p.tema})` : ''}`;
      const errorValidacion = this.validar(p);
      if (errorValidacion) { informe.errores.push(`${etiqueta}: ${errorValidacion}`); continue; }

      // Tema
      let temaId: string | null = null;
      if (p.temaId) {
        if (!temaIdsValidos.has(p.temaId)) { informe.errores.push(`${etiqueta}: el temaId no es de la convocatoria activa de esta oposición`); continue; }
        temaId = p.temaId;
      } else if (p.tema !== undefined && p.tema !== null && p.tema !== '') {
        temaId = temaPorNumero.get(Number(p.tema)) ?? null;
        if (!temaId) { informe.errores.push(`${etiqueta}: la convocatoria activa no tiene tema ${p.tema}`); continue; }
      }

      // Artículos
      const vinculos: Vinculo[] = [];
      if (Array.isArray(p.articulos)) {
        for (const v of p.articulos) if (v?.norma && v?.articulo !== undefined) vinculos.push({ norma: String(v.norma), articulo: String(v.articulo) });
      } else if (p.norma && p.articulo !== undefined && p.articulo !== null && p.articulo !== '') {
        vinculos.push({ norma: String(p.norma), articulo: String(p.articulo) });
      }
      const articuloIds: string[] = [];
      for (const v of vinculos) {
        const id = await resolverArticulo(v.norma, v.articulo);
        if (id) { if (!articuloIds.includes(id)) articuloIds.push(id); }
        else informe.noEnlazadas.push({ fila, enunciado: String(p.enunciado).slice(0, 80), referencia: `${v.norma.toUpperCase()} art. ${v.articulo}` });
      }

      if (!temaId && !articuloIds.length) {
        informe.errores.push(`${etiqueta}: sin tema ni artículo encontrado; no se importa`);
        continue;
      }

      // Duplicados
      const clave = claveDuplicado(p.enunciado, p.opciones);
      if (enLote.has(clave)) { informe.errores.push(`${etiqueta}: duplicada dentro del archivo — "${String(p.enunciado).slice(0, 60)}…"`); continue; }
      enLote.add(clave);
      const existente = existentes.get(clave);
      if (existente) {
        let nuevo = false;
        if (temaId) nuevo = (await vincularSiFalta(existente, 'temas', temaId)) || nuevo;
        for (const a of articuloIds) nuevo = (await vincularSiFalta(existente, 'articulos', a)) || nuevo;
        if (nuevo) informe.vinculadasExistentes++; else informe.yaEstaban++;
        continue;
      }

      if (!simular) {
        const saved = await this.preguntaRepo.save(this.preguntaRepo.create({
          tipo: 'test',
          enunciado: String(p.enunciado).trim(),
          opciones: p.opciones.map((o: string) => String(o).trim()),
          correcta: p.correcta,
          explicacion: p.explicacion ? String(p.explicacion).trim() : undefined,
          dificultad: [1, 2, 3].includes(Number(p.dificultad)) ? Number(p.dificultad) : 1,
          fuente: p.fuente ? String(p.fuente).trim().slice(0, 250) : undefined,
          origen: p.origen ? String(p.origen) : 'generada',
          anyo: Number.isInteger(p.anyo) ? p.anyo : undefined,
          estado: p.estado && ['vigente', 'fuera_temario', 'desactualizada', 'anulada'].includes(p.estado) ? p.estado : 'vigente',
          activa: true,
        }));
        if (temaId) await this.preguntaRepo.createQueryBuilder().relation(PreguntaTest, 'temas').of(saved.id).add(temaId);
        if (articuloIds.length) await this.preguntaRepo.createQueryBuilder().relation(PreguntaTest, 'articulos').of(saved.id).add(articuloIds);
        existentes.set(clave, saved.id);
      }
      informe.importadas++;
      if (articuloIds.length) informe.conArticulo++;
    }

    return informe;
  }

  /** Mismas reglas que TestService.validarPreguntaImportada, más las de esta importación. */
  private validar(p: any): string | null {
    if (!p || typeof p !== 'object') return 'la pregunta no es un objeto válido';
    if (typeof p.enunciado !== 'string' || !p.enunciado.trim()) return 'falta el enunciado o está vacío';
    if (!Array.isArray(p.opciones) || (p.opciones.length !== 3 && p.opciones.length !== 4)) {
      return `el número de opciones debe ser 3 o 4 (recibido: ${Array.isArray(p.opciones) ? p.opciones.length : 'no es una lista'})`;
    }
    if (p.opciones.some((o: any) => typeof o !== 'string' || !o.trim())) return 'hay alguna opción vacía o que no es texto';
    const normal = p.opciones.map((o: string) => normTexto(o));
    if (new Set(normal).size !== normal.length) return 'hay opciones repetidas';
    if (typeof p.correcta !== 'number' || !Number.isInteger(p.correcta) || p.correcta < 0 || p.correcta >= p.opciones.length) {
      return `el índice "correcta" (${p.correcta}) está fuera de rango para ${p.opciones.length} opciones`;
    }
    if (p.temaId && !UUID.test(String(p.temaId))) return '"temaId" no válido';
    if (String(p.norma ?? '').length > 40 || String(p.articulo ?? '').length > 40) return '"norma" o "articulo" demasiado largos';
    return null;
  }
}
