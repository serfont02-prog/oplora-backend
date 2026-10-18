import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { PreguntaTest } from './pregunta-test.entity';
import { ExamenAnterior } from '../tema/examen-anterior.entity';
import { Convocatoria } from '../convocatoria/convocatoria.entity';
import { Tema } from '../tema/tema.entity';
import { OposicionLey } from '../ley/oposicion-ley.entity';
import { VersionLey } from '../ley/version-ley.entity';

/* =========================================================
   ⭐ EXÁMENES OFICIALES CON SUS PREGUNTAS
   Un examen oficial se crea directamente con sus preguntas (sin PDF).
   Cada pregunta puede ir:
     - por artículo de ley  → "ley" (siglas o nombre) + "articulo"
     - por tema             → "temaNumero" (del temario de referencia)
     - sin clasificar       → solo sale en el simulacro de su examen
   y tiene un estado: vigente | fuera_temario | desactualizada | anulada.
   Solo las vigentes y clasificadas salen en los tests.
========================================================= */

export const ESTADOS_PREGUNTA = ['vigente', 'fuera_temario', 'desactualizada', 'anulada'] as const;
export type EstadoPregunta = (typeof ESTADOS_PREGUNTA)[number];

const MAX_PREGUNTAS_EXAMEN = 300;
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export interface PreguntaExamenEntrada {
  enunciado: string;
  opciones: string[];
  correcta: number;
  explicacion?: string;
  dificultad?: number;
  temaNumero?: number | string | null;
  ley?: string | null;
  articulo?: string | number | null;
  articuloNumero?: string | number | null; // alias de "articulo"
  estado?: string | null;
  notaActualizacion?: string | null;
}

export interface FilaInforme {
  n: number;
  enunciado: string;
  clasificacion: 'ley' | 'tema' | 'ninguna';
  etiqueta: string; // "LOFCS · Art. 9", "Tema 12" o "Solo simulacro"
  estado: EstadoPregunta;
  avisos: string[];
  error: string | null;
  reutilizada?: boolean; // ya estaba en el banco (sin examen): se vincula a este examen, no se duplica
}

export interface InformeExamen {
  total: number;
  porLey: number;
  porTema: number;
  soloSimulacro: number;
  noVigentes: number;
  conError: number;
  conAvisos: number;
  reutilizadas: number;
  temario: { convocatoriaId: string; anyo: number } | null;
  filas: FilaInforme[];
}

interface PreguntaResuelta {
  entrada: PreguntaExamenEntrada;
  temaId: string | null;
  articuloId: string | null;
  estado: EstadoPregunta;
  reutilizarId: string | null; // pregunta del banco que se vincula al examen en lugar de crear otra
}

interface LeyOposicion {
  leyId: string;
  siglas: string | null;
  nombre: string;
  versionLeyId: string | null;
}

interface Contexto {
  convocatoria: Convocatoria;
  oposicionId: string;
  temario: Convocatoria | null;
  temas: Tema[];
  leyes: LeyOposicion[];
  articulosPorVersion: Map<string, { id: string; numero: string | null }[]>;
}

const normTexto = (v: any) =>
  String(v ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const normNumArticulo = (v: any) =>
  String(v ?? '')
    .toLowerCase()
    .replace(/^art(iculo|ículo)?\.?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();

const recortar = (s: string, n = 90) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

// versionLeyId de un título, venga directo o a través de un Libro (Código Civil, etc.)
const VERSION_DE_TITULO = (t: string, lb: string) => `COALESCE(${t}."versionLeyId", ${lb}."versionLeyId")`;

// Joins para llegar de un artículo a su versión de ley por cualquiera de sus caminos:
// capítulo → título, sección → capítulo → título, o título directo (y título → libro).
const JOINS_ARTICULO_VERSION = `
  LEFT JOIN capitulos c1 ON c1.id = a."capituloId"
  LEFT JOIN titulos t1 ON t1.id = c1."tituloRefId"
  LEFT JOIN libros lb1 ON lb1.id = t1."libroId"
  LEFT JOIN secciones s2 ON s2.id = a."seccionId"
  LEFT JOIN capitulos c2 ON c2.id = s2."capituloId"
  LEFT JOIN titulos t2 ON t2.id = c2."tituloRefId"
  LEFT JOIN libros lb2 ON lb2.id = t2."libroId"
  LEFT JOIN titulos t3 ON t3.id = a."tituloRefId"
  LEFT JOIN libros lb3 ON lb3.id = t3."libroId"
`;
const VERSION_DE_ARTICULO = `COALESCE(${VERSION_DE_TITULO('t1', 'lb1')}, ${VERSION_DE_TITULO('t2', 'lb2')}, ${VERSION_DE_TITULO('t3', 'lb3')})`;

@Injectable()
export class ExamenOficialService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(PreguntaTest) private readonly preguntaRepo: Repository<PreguntaTest>,
    @InjectRepository(ExamenAnterior) private readonly examenRepo: Repository<ExamenAnterior>,
    @InjectRepository(Convocatoria) private readonly convocatoriaRepo: Repository<Convocatoria>,
    @InjectRepository(Tema) private readonly temaRepo: Repository<Tema>,
    @InjectRepository(OposicionLey) private readonly oposicionLeyRepo: Repository<OposicionLey>,
    @InjectRepository(VersionLey) private readonly versionRepo: Repository<VersionLey>,
  ) {}

  /* ---------------------------------------------------------
     Contexto: convocatoria del examen, temario de referencia y
     leyes de la oposición (con la versión vinculada).
  --------------------------------------------------------- */
  private async cargarContexto(convocatoriaId: string, temarioConvocatoriaId?: string | null): Promise<Contexto> {
    const convocatoria = await this.convocatoriaRepo.findOne({
      where: { id: convocatoriaId },
      relations: ['oposicion'],
    });
    if (!convocatoria) throw new NotFoundException('Convocatoria no encontrada');
    const oposicionId = (convocatoria as any).oposicion?.id as string;

    // Temario de referencia para "temaNumero": el indicado o, por defecto, la convocatoria
    // más reciente de la oposición que tenga temas (los tests usan la convocatoria activa).
    let temario: Convocatoria | null = null;
    if (temarioConvocatoriaId) {
      temario = await this.convocatoriaRepo.findOne({
        where: { id: temarioConvocatoriaId, oposicion: { id: oposicionId } } as any,
      });
      if (!temario) throw new BadRequestException('El temario de referencia no pertenece a esta oposición');
    } else {
      temario = await this.temarioPorDefecto(oposicionId);
    }
    const temas = temario ? await this.temaRepo.find({ where: { convocatoria: { id: temario.id } } as any }) : [];

    const ols = await this.oposicionLeyRepo.find({
      where: { oposicion: { id: oposicionId } } as any,
      relations: ['ley', 'versionLey'],
    });
    const leyes: LeyOposicion[] = [];
    for (const ol of ols) {
      if (!ol.ley) continue;
      let versionLeyId: string | null = ol.versionLey?.id ?? null;
      if (!versionLeyId) {
        const activa = await this.versionRepo.findOne({ where: { ley: { id: ol.ley.id }, activa: true } as any });
        versionLeyId = activa?.id ?? null;
      }
      leyes.push({ leyId: ol.ley.id, siglas: ol.ley.siglas ?? null, nombre: ol.ley.nombre, versionLeyId });
    }

    return { convocatoria, oposicionId, temario, temas, leyes, articulosPorVersion: new Map() };
  }

  private async temarioPorDefecto(oposicionId: string): Promise<Convocatoria | null> {
    const filas = await this.convocatoriaRepo.query(
      `SELECT c.id FROM convocatorias c
        WHERE c."oposicionId" = $1
          AND EXISTS (SELECT 1 FROM temas t WHERE t."convocatoriaId" = c.id)
        ORDER BY c.anyo DESC, c."creadoEn" DESC
        LIMIT 1`,
      [oposicionId],
    );
    if (!filas.length) return null;
    return this.convocatoriaRepo.findOne({ where: { id: filas[0].id } });
  }

  private async articulosDeVersion(ctx: Contexto, versionLeyId: string) {
    let lista = ctx.articulosPorVersion.get(versionLeyId);
    if (!lista) {
      lista = await this.preguntaRepo.query(
        `SELECT a.id, a.numero FROM articulos a ${JOINS_ARTICULO_VERSION}
          WHERE ${VERSION_DE_ARTICULO} = $1`,
        [versionLeyId],
      );
      ctx.articulosPorVersion.set(versionLeyId, lista!);
    }
    return lista!;
  }

  private buscarLey(ctx: Contexto, texto: string): LeyOposicion | null {
    const q = normTexto(texto);
    if (!q) return null;
    const exacta = ctx.leyes.find((l) => normTexto(l.siglas) === q || normTexto(l.nombre) === q);
    if (exacta) return exacta;
    const parciales = ctx.leyes.filter((l) => normTexto(l.nombre).includes(q));
    return parciales.length === 1 ? parciales[0] : null;
  }

  /* ---------------------------------------------------------
     Validación de una pregunta (mismas reglas que el resto de importaciones)
  --------------------------------------------------------- */
  private validar(p: any): string | null {
    if (!p || typeof p !== 'object') return 'la pregunta no es un objeto válido';
    if (typeof p.enunciado !== 'string' || !p.enunciado.trim()) return 'falta el enunciado';
    if (!Array.isArray(p.opciones) || p.opciones.length < 2 || p.opciones.length > 4) {
      return `debe tener entre 2 y 4 opciones (tiene ${Array.isArray(p.opciones) ? p.opciones.length : 0})`;
    }
    if (p.opciones.some((o: any) => typeof o !== 'string' || !o.trim())) return 'hay alguna opción vacía';
    const norm = p.opciones.map((o: string) => o.trim().toLowerCase());
    if (new Set(norm).size !== norm.length) return 'hay opciones repetidas';
    if (typeof p.correcta !== 'number' || !Number.isInteger(p.correcta) || p.correcta < 0 || p.correcta >= p.opciones.length) {
      return `"correcta" (${p.correcta}) debe ser el índice de una opción, de 0 a ${p.opciones.length - 1}`;
    }
    if (p.estado != null && p.estado !== '' && !ESTADOS_PREGUNTA.includes(p.estado)) {
      return `estado "${p.estado}" no válido (usa: ${ESTADOS_PREGUNTA.join(', ')})`;
    }
    return null;
  }

  /* ---------------------------------------------------------
     Resuelve la clasificación de una pregunta.
  --------------------------------------------------------- */
  private async clasificar(ctx: Contexto, p: PreguntaExamenEntrada) {
    const avisos: string[] = [];
    let temaId: string | null = null;
    let articuloId: string | null = null;
    const etiquetas: string[] = [];

    const textoLey = typeof p.ley === 'string' ? p.ley.trim() : '';
    const numArticulo = p.articulo ?? p.articuloNumero;
    const hayArticulo = numArticulo != null && String(numArticulo).trim() !== '';

    if (textoLey || hayArticulo) {
      if (!textoLey) {
        avisos.push('tiene artículo pero falta "ley"');
      } else if (!hayArticulo) {
        avisos.push(`tiene ley "${textoLey}" pero falta "articulo"`);
      } else {
        const ley = this.buscarLey(ctx, textoLey);
        if (!ley) {
          avisos.push(`la ley "${textoLey}" no está vinculada a esta oposición (o el nombre es ambiguo)`);
        } else if (!ley.versionLeyId) {
          avisos.push(`la ley "${textoLey}" no tiene versión vigente cargada`);
        } else {
          const arts = await this.articulosDeVersion(ctx, ley.versionLeyId);
          const buscado = normNumArticulo(numArticulo);
          const art = arts.find((a) => normNumArticulo(a.numero) === buscado);
          if (!art) {
            avisos.push(`no existe el artículo ${numArticulo} en ${ley.siglas || ley.nombre}`);
          } else {
            articuloId = art.id;
            etiquetas.push(`${ley.siglas || ley.nombre} · Art. ${art.numero}`);
          }
        }
      }
    }

    if (p.temaNumero != null && String(p.temaNumero).trim() !== '') {
      const num = Number(p.temaNumero);
      if (!ctx.temario) {
        avisos.push('no hay temario de referencia con temas para resolver "temaNumero"');
      } else {
        const tema = ctx.temas.find((t) => t.numero === num);
        if (!tema) avisos.push(`no existe el tema ${p.temaNumero} en el temario ${ctx.temario.anyo}`);
        else {
          temaId = tema.id;
          etiquetas.push(`Tema ${tema.numero}`);
        }
      }
    }

    return { temaId, articuloId, avisos, etiqueta: etiquetas.join(' + ') };
  }

  /* ---------------------------------------------------------
     Analiza el lote completo (sirve para la vista previa y para crear).
  --------------------------------------------------------- */
  private async analizar(ctx: Contexto, preguntas: PreguntaExamenEntrada[], offset = 0) {
    const filas: FilaInforme[] = [];
    const resueltas: PreguntaResuelta[] = [];
    const vistos = new Set<string>();

    // ⭐ Preguntas que ya existen en el banco con el mismo enunciado.
    //  - Si una no pertenece a ningún examen y tiene las mismas opciones y respuesta (p. ej. tras
    //    borrar el examen y volver a crearlo), se REUTILIZA: se vincula a este examen.
    //  - Si pertenece a otro examen o difiere, se crea otra fila solo para el simulacro,
    //    sin clasificar, para no duplicarla en los tests.
    const enunciados = preguntas
      .map((p) => (typeof p?.enunciado === 'string' ? p.enunciado.trim() : ''))
      .filter(Boolean);
    const existentes = enunciados.length
      ? await this.preguntaRepo.find({
          where: { enunciado: In(enunciados) },
          relations: ['examenAnterior', 'temas', 'articulos'],
        })
      : [];
    const porEnunciado = new Map<string, PreguntaTest[]>();
    for (const e of existentes) {
      const k = e.enunciado.trim();
      porEnunciado.set(k, [...(porEnunciado.get(k) ?? []), e]);
    }
    const normOps = (ops: any) => JSON.stringify((Array.isArray(ops) ? ops : []).map((o: any) => normTexto(o)));
    const yaReutilizadas = new Set<string>();

    for (const [i, p] of preguntas.entries()) {
      const n = offset + i + 1;
      const enunciado = typeof p?.enunciado === 'string' ? p.enunciado.trim() : '';
      const estado = (p?.estado && ESTADOS_PREGUNTA.includes(p.estado as any) ? p.estado : 'vigente') as EstadoPregunta;
      let error = this.validar(p);

      if (!error) {
        // ⭐ Repetida = mismo enunciado Y mismas opciones. Hay enunciados genéricos que se repiten
        // con opciones distintas (p. ej. "¿Cuál de las siguientes opciones es correcta?").
        const clave = `${normTexto(enunciado)}§${normOps(p.opciones)}`;
        if (vistos.has(clave)) error = 'pregunta repetida dentro del propio examen (mismo enunciado y opciones)';
        vistos.add(clave);
      }

      if (error) {
        filas.push({ n, enunciado: recortar(enunciado || '(sin enunciado)'), clasificacion: 'ninguna', etiqueta: '—', estado, avisos: [], error });
        continue;
      }

      let { temaId, articuloId, avisos, etiqueta } = await this.clasificar(ctx, p);
      let reutilizarId: string | null = null;

      // Solo cuentan como "la misma pregunta" las que tienen también las mismas opciones
      const iguales = (porEnunciado.get(enunciado) ?? []).filter((e) => normOps(e.opciones) === normOps(p.opciones));
      const libre = iguales.find(
        (e) => !e.examenAnterior && !yaReutilizadas.has(e.id) && e.correcta === p.correcta,
      );
      if (libre) {
        reutilizarId = libre.id;
        yaReutilizadas.add(libre.id);
        // Conserva su clasificación y suma la del JSON (si la hay)
        const etiquetasPrevias = [
          ...(libre.articulos ?? []).map((a) => `Art. ${a.numero}`),
          ...(libre.temas ?? []).map((t) => `Tema ${t.numero}`),
        ];
        if (!etiqueta && etiquetasPrevias.length) etiqueta = etiquetasPrevias.join(' + ');
        if (!articuloId && libre.articulos?.length) articuloId = libre.articulos[0].id;
        if (!temaId && libre.temas?.length) temaId = libre.temas[0].id;
      } else if (iguales.length && (temaId || articuloId)) {
        avisos.push('ya existe en el banco (en otro examen o con otras opciones): aquí queda solo para el simulacro, para no duplicarla en los tests');
        temaId = null;
        articuloId = null;
        etiqueta = '';
      }
      if (estado === 'desactualizada' && !p.notaActualizacion?.trim()) {
        avisos.push('desactualizada sin "notaActualizacion" (conviene explicar qué ha cambiado)');
      }

      const clasificacion: FilaInforme['clasificacion'] = articuloId ? 'ley' : temaId ? 'tema' : 'ninguna';
      filas.push({
        n,
        enunciado: recortar(enunciado),
        clasificacion,
        etiqueta: etiqueta || 'Solo simulacro',
        estado,
        avisos,
        error: null,
        reutilizada: !!reutilizarId,
      });
      resueltas.push({ entrada: p, temaId, articuloId, estado, reutilizarId });
    }

    const validas = filas.filter((f) => !f.error);
    const informe: InformeExamen = {
      total: filas.length,
      porLey: validas.filter((f) => f.clasificacion === 'ley').length,
      porTema: validas.filter((f) => f.clasificacion === 'tema').length,
      soloSimulacro: validas.filter((f) => f.clasificacion === 'ninguna').length,
      noVigentes: validas.filter((f) => f.estado !== 'vigente').length,
      conError: filas.filter((f) => f.error).length,
      conAvisos: filas.filter((f) => f.avisos.length > 0).length,
      reutilizadas: filas.filter((f) => f.reutilizada).length,
      temario: ctx.temario ? { convocatoriaId: ctx.temario.id, anyo: ctx.temario.anyo } : null,
      filas,
    };
    return { informe, resueltas };
  }

  private comprobarLote(preguntas: any) {
    if (!Array.isArray(preguntas) || preguntas.length === 0) {
      throw new BadRequestException('Las preguntas deben ser una lista (array) con al menos una pregunta');
    }
    if (preguntas.length > MAX_PREGUNTAS_EXAMEN) {
      throw new BadRequestException(`Máximo ${MAX_PREGUNTAS_EXAMEN} preguntas por examen`);
    }
  }

  private async guardarPreguntas(
    manager: EntityManager,
    examen: ExamenAnterior,
    resueltas: PreguntaResuelta[],
    offset: number,
  ) {
    for (const [i, r] of resueltas.entries()) {
      const p = r.entrada;

      if (r.reutilizarId) {
        // ⭐ Pregunta que ya estaba en el banco: se vincula al examen (sin duplicarla) y se le
        // aplica el estado/nota del JSON; su clasificación previa se conserva.
        await manager.update(PreguntaTest, r.reutilizarId, {
          examenAnterior: { id: examen.id } as any,
          ordenExamen: offset + i + 1,
          estado: r.estado,
          notaActualizacion: p.notaActualizacion?.trim() || null,
          ...(p.explicacion?.trim() ? { explicacion: p.explicacion.trim() } : {}),
        } as any);
        if (r.temaId) {
          await manager.query(
            `INSERT INTO preguntas_test_temas_temas ("preguntasTestId", "temasId") VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [r.reutilizarId, r.temaId],
          );
        }
        if (r.articuloId) {
          await manager.query(
            `INSERT INTO preguntas_test_articulos_articulos ("preguntasTestId", "articulosId") VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [r.reutilizarId, r.articuloId],
          );
        }
        continue;
      }

      const pregunta = manager.create(PreguntaTest, {
        enunciado: p.enunciado.trim(),
        opciones: p.opciones.map((o) => o.trim()),
        correcta: p.correcta,
        explicacion: p.explicacion?.trim() || null,
        dificultad: p.dificultad ?? 1,
        origen: 'convocatoria',
        anyo: examen.anyo,
        activa: true,
        estado: r.estado,
        notaActualizacion: p.notaActualizacion?.trim() || null,
        ordenExamen: offset + i + 1,
        examenAnterior: { id: examen.id } as any,
      } as any);
      const saved = (await manager.save(PreguntaTest, pregunta)) as unknown as PreguntaTest;
      if (r.temaId) await manager.createQueryBuilder().relation(PreguntaTest, 'temas').of(saved.id).add(r.temaId);
      if (r.articuloId) await manager.createQueryBuilder().relation(PreguntaTest, 'articulos').of(saved.id).add(r.articuloId);
    }
  }

  /* ---------------------------------------------------------
     Crear examen con sus preguntas (o solo comprobar, con simular=true)
  --------------------------------------------------------- */
  async crearConPreguntas(
    convocatoriaId: string,
    datos: { nombre?: string; parte?: number | string; temarioConvocatoriaId?: string; preguntas: any; simular?: boolean },
  ) {
    this.comprobarLote(datos.preguntas);
    const ctx = await this.cargarContexto(convocatoriaId, datos.temarioConvocatoriaId);
    const conv = ctx.convocatoria;

    const ejercicios = conv.ejercicios ?? [];
    let parte = Number(datos.parte) || (ejercicios.length === 1 ? ejercicios[0].numero : 1);
    const ejercicio = ejercicios.find((e) => e.numero === parte);
    if (ejercicios.length > 1 && !ejercicio) throw new BadRequestException('Elige a qué ejercicio pertenece el examen');

    const { informe, resueltas } = await this.analizar(ctx, datos.preguntas);
    if (datos.simular) return { creado: false, informe };
    if (informe.conError > 0) {
      throw new BadRequestException({ message: `Hay ${informe.conError} pregunta(s) con errores. Corrígelas antes de crear el examen.`, informe });
    }

    const fecha = conv.fechaExamen ? new Date(conv.fechaExamen) : null;
    const anyo = fecha && !isNaN(fecha.getTime()) ? fecha.getFullYear() : conv.anyo;
    const mes = fecha && !isNaN(fecha.getTime()) ? MESES[fecha.getMonth()] : undefined;
    const nombre = datos.nombre?.trim() || `Examen ${anyo}${ejercicios.length > 1 ? ` · Ejercicio ${parte}` : ''}`;

    const examen = await this.dataSource.transaction(async (manager) => {
      const ex = await manager.save(
        ExamenAnterior,
        manager.create(ExamenAnterior, {
          nombre,
          anyo,
          mes,
          tipo: ejercicio?.tipo ?? 'test',
          parte,
          urlArchivo: null,
          convocatoria: { id: conv.id } as any,
        } as any),
      );
      await this.guardarPreguntas(manager, ex as ExamenAnterior, resueltas, 0);
      return ex as ExamenAnterior;
    });

    return { creado: true, examen: { id: examen.id, nombre: examen.nombre, anyo: examen.anyo, parte: examen.parte }, informe };
  }

  /* ---------------------------------------------------------
     Añadir preguntas a un examen existente (se colocan al final)
  --------------------------------------------------------- */
  async anadirPreguntas(
    examenId: string,
    datos: { temarioConvocatoriaId?: string; preguntas: any; simular?: boolean },
  ) {
    this.comprobarLote(datos.preguntas);
    const examen = await this.examenRepo.findOne({ where: { id: examenId }, relations: ['convocatoria'] });
    if (!examen) throw new NotFoundException('Examen no encontrado');

    const actuales = await this.preguntaRepo.find({
      where: { examenAnterior: { id: examenId } as any },
      select: ['id', 'enunciado', 'opciones', 'ordenExamen'],
    });
    const offset = actuales.reduce((m, p) => Math.max(m, p.ordenExamen ?? 0), actuales.length);

    const ctx = await this.cargarContexto(examen.convocatoria.id, datos.temarioConvocatoriaId);
    const { informe, resueltas } = await this.analizar(ctx, datos.preguntas, offset);

    // Repetidas respecto a las que ya tiene el examen
    const claveP = (e: any, ops: any) =>
      `${normTexto(e)}§${JSON.stringify((Array.isArray(ops) ? ops : []).map((o: any) => normTexto(o)))}`;
    const yaEnExamen = new Set(actuales.map((p) => claveP(p.enunciado, p.opciones)));
    for (const f of informe.filas) {
      const original = datos.preguntas[f.n - offset - 1];
      if (!f.error && yaEnExamen.has(claveP(original?.enunciado, original?.opciones))) {
        f.error = 'esta pregunta ya está en el examen';
      }
    }
    informe.conError = informe.filas.filter((f) => f.error).length;
    const validasIdx = new Set(informe.filas.filter((f) => !f.error).map((f) => f.n));
    const aGuardar = resueltas.filter((r) => {
      const idx = datos.preguntas.indexOf(r.entrada);
      return validasIdx.has(offset + idx + 1);
    });

    if (datos.simular) return { creado: false, informe };
    if (informe.conError > 0) {
      throw new BadRequestException({ message: `Hay ${informe.conError} pregunta(s) con errores. Corrígelas antes de añadirlas.`, informe });
    }

    await this.dataSource.transaction((manager) => this.guardarPreguntas(manager, examen, aGuardar, offset));
    return { creado: true, informe };
  }

  /* ---------------------------------------------------------
     Listado de preguntas de un examen para el admin (con respuesta,
     clasificación y estado).
  --------------------------------------------------------- */
  async listarPreguntas(examenId: string) {
    const examen = await this.examenRepo.findOne({ where: { id: examenId }, relations: ['convocatoria', 'convocatoria.oposicion'] });
    if (!examen) throw new NotFoundException('Examen no encontrado');

    const preguntas = await this.preguntaRepo.find({
      where: { examenAnterior: { id: examenId } as any },
      relations: ['temas', 'temas.convocatoria', 'articulos'],
      order: { ordenExamen: 'ASC', creadoEn: 'ASC' } as any,
    });

    const articuloIds = [...new Set(preguntas.flatMap((p) => (p.articulos ?? []).map((a) => a.id)))];
    const leyPorArticulo = new Map<string, string>();
    if (articuloIds.length) {
      const filas = await this.preguntaRepo.query(
        `SELECT a.id, l.siglas, l.nombre FROM articulos a ${JOINS_ARTICULO_VERSION}
           LEFT JOIN versiones_ley v ON v.id = ${VERSION_DE_ARTICULO}
           LEFT JOIN leyes l ON l.id = v."leyId"
          WHERE a.id = ANY($1)`,
        [articuloIds],
      );
      for (const f of filas) leyPorArticulo.set(f.id, f.siglas || f.nombre || 'Ley');
    }

    // Copias actualizadas ya creadas a partir de estas preguntas
    const ids = preguntas.map((p) => p.id);
    const copias = ids.length
      ? await this.preguntaRepo.find({ where: { actualizadaDesdeId: In(ids) } as any, select: ['id', 'actualizadaDesdeId'] })
      : [];
    const tieneCopia = new Set(copias.map((c) => c.actualizadaDesdeId));

    const temario = await this.temarioPorDefecto((examen.convocatoria as any).oposicion?.id);

    return {
      examen: { id: examen.id, nombre: examen.nombre, anyo: examen.anyo, parte: examen.parte, urlArchivo: examen.urlArchivo },
      temarioPorDefecto: temario ? { convocatoriaId: temario.id, anyo: temario.anyo } : null,
      preguntas: preguntas.map((p, i) => ({
        id: p.id,
        orden: p.ordenExamen ?? i + 1,
        enunciado: p.enunciado,
        opciones: p.opciones,
        correcta: p.correcta,
        explicacion: p.explicacion,
        estado: p.estado ?? 'vigente',
        notaActualizacion: p.notaActualizacion,
        tieneCopiaActualizada: tieneCopia.has(p.id),
        temas: (p.temas ?? []).map((t) => ({ id: t.id, numero: t.numero, titulo: t.titulo, anyo: (t as any).convocatoria?.anyo ?? null })),
        articulos: (p.articulos ?? []).map((a) => ({ id: a.id, numero: a.numero, ley: leyPorArticulo.get(a.id) ?? 'Ley' })),
      })),
    };
  }

  /* ---------------------------------------------------------
     Cambiar estado / nota / clasificación de una pregunta
  --------------------------------------------------------- */
  async actualizarPregunta(
    preguntaId: string,
    cambios: {
      estado?: string;
      notaActualizacion?: string | null;
      clasificacion?: { temaNumero?: number | string | null; ley?: string | null; articulo?: string | number | null; temarioConvocatoriaId?: string | null } | null;
    },
  ) {
    const pregunta = await this.preguntaRepo.findOne({
      where: { id: preguntaId },
      relations: ['examenAnterior', 'examenAnterior.convocatoria', 'temas', 'articulos'],
    });
    if (!pregunta) throw new NotFoundException('Pregunta no encontrada');

    if (cambios.estado !== undefined) {
      if (!ESTADOS_PREGUNTA.includes(cambios.estado as any)) throw new BadRequestException('Estado no válido');
      pregunta.estado = cambios.estado;
    }
    if (cambios.notaActualizacion !== undefined) {
      pregunta.notaActualizacion = cambios.notaActualizacion?.trim() || null;
    }
    await this.preguntaRepo.update(preguntaId, { estado: pregunta.estado, notaActualizacion: pregunta.notaActualizacion });

    const avisos: string[] = [];
    if (cambios.clasificacion !== undefined) {
      const convocatoriaId = pregunta.examenAnterior?.convocatoria?.id;
      if (!convocatoriaId) throw new BadRequestException('La pregunta no pertenece a ningún examen');
      let temaId: string | null = null;
      let articuloId: string | null = null;
      if (cambios.clasificacion) {
        const ctx = await this.cargarContexto(convocatoriaId, cambios.clasificacion.temarioConvocatoriaId);
        const r = await this.clasificar(ctx, {
          enunciado: pregunta.enunciado,
          opciones: pregunta.opciones,
          correcta: pregunta.correcta,
          temaNumero: cambios.clasificacion.temaNumero,
          ley: cambios.clasificacion.ley,
          articulo: cambios.clasificacion.articulo,
        });
        if (r.avisos.length) throw new BadRequestException(r.avisos.join(' · '));
        temaId = r.temaId;
        articuloId = r.articuloId;
      }
      const rel = this.preguntaRepo.createQueryBuilder().relation(PreguntaTest, 'temas').of(preguntaId);
      await rel.remove((pregunta.temas ?? []).map((t) => t.id));
      if (temaId) await rel.add(temaId);
      const relA = this.preguntaRepo.createQueryBuilder().relation(PreguntaTest, 'articulos').of(preguntaId);
      await relA.remove((pregunta.articulos ?? []).map((a) => a.id));
      if (articuloId) await relA.add(articuloId);
    }

    return { ok: true, avisos };
  }

  /* ---------------------------------------------------------
     ⭐ Copia actualizada: la pregunta original se queda en su examen como
     "desactualizada" (con la respuesta oficial de entonces) y se crea una copia
     en el banco, vigente y con la misma clasificación, con la respuesta actual.
  --------------------------------------------------------- */
  async crearCopiaActualizada(
    preguntaId: string,
    datos: { enunciado?: string; opciones?: string[]; correcta?: number; explicacion?: string; notaActualizacion?: string },
  ) {
    const original = await this.preguntaRepo.findOne({ where: { id: preguntaId }, relations: ['temas', 'articulos'] });
    if (!original) throw new NotFoundException('Pregunta no encontrada');
    if (!(original.temas?.length || original.articulos?.length)) {
      throw new BadRequestException('Clasifica primero la pregunta (tema o artículo) para que la copia pueda salir en los tests');
    }

    const nueva = {
      enunciado: (datos.enunciado ?? original.enunciado).trim(),
      opciones: datos.opciones ?? original.opciones,
      correcta: datos.correcta ?? original.correcta,
    };
    const error = this.validar(nueva);
    if (error) throw new BadRequestException(`Pregunta no válida: ${error}`);
    if (
      nueva.enunciado === original.enunciado.trim() &&
      nueva.correcta === original.correcta &&
      JSON.stringify(nueva.opciones) === JSON.stringify(original.opciones)
    ) {
      throw new BadRequestException('La copia es igual que la original: cambia la respuesta, las opciones o el enunciado');
    }

    const copia = await this.dataSource.transaction(async (manager) => {
      const saved = (await manager.save(
        PreguntaTest,
        manager.create(PreguntaTest, {
          enunciado: nueva.enunciado,
          opciones: nueva.opciones.map((o) => o.trim()),
          correcta: nueva.correcta,
          explicacion: datos.explicacion?.trim() || original.explicacion,
          dificultad: original.dificultad,
          origen: 'convocatoria',
          anyo: original.anyo,
          activa: true,
          estado: 'vigente',
          actualizadaDesdeId: original.id,
        } as any),
      )) as unknown as PreguntaTest;
      for (const t of original.temas ?? []) await manager.createQueryBuilder().relation(PreguntaTest, 'temas').of(saved.id).add(t.id);
      for (const a of original.articulos ?? []) await manager.createQueryBuilder().relation(PreguntaTest, 'articulos').of(saved.id).add(a.id);
      await manager.update(PreguntaTest, original.id, {
        estado: 'desactualizada',
        notaActualizacion: datos.notaActualizacion?.trim() || original.notaActualizacion || null,
      });
      return saved;
    });

    return { ok: true, copiaId: copia.id };
  }

  async renombrarExamen(examenId: string, datos: { nombre?: string; parte?: number }) {
    const examen = await this.examenRepo.findOne({ where: { id: examenId } });
    if (!examen) throw new NotFoundException('Examen no encontrado');
    if (datos.nombre !== undefined) {
      if (!datos.nombre.trim()) throw new BadRequestException('El nombre no puede estar vacío');
      examen.nombre = datos.nombre.trim();
    }
    if (datos.parte !== undefined) examen.parte = Number(datos.parte) || examen.parte;
    await this.examenRepo.save(examen);
    return { ok: true };
  }

  /** Resumen por examen de una convocatoria: total y desglose por estado/clasificación. */
  async resumenConvocatoria(convocatoriaId: string) {
    const examenes = await this.examenRepo.find({
      where: { convocatoria: { id: convocatoriaId } } as any,
      order: { parte: 'ASC', creadoEn: 'ASC' } as any,
    });
    if (!examenes.length) return [];
    const filas = await this.preguntaRepo.query(
      `SELECT p."examenAnteriorId" AS "examenId",
              COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE p.estado = 'anulada')::int AS anuladas,
              COUNT(*) FILTER (WHERE p.estado = 'desactualizada')::int AS desactualizadas,
              COUNT(*) FILTER (WHERE p.estado = 'fuera_temario')::int AS "fueraTemario",
              COUNT(*) FILTER (WHERE p.estado = 'vigente' AND (
                EXISTS (SELECT 1 FROM preguntas_test_temas_temas t WHERE t."preguntasTestId" = p.id) OR
                EXISTS (SELECT 1 FROM preguntas_test_articulos_articulos a WHERE a."preguntasTestId" = p.id)
              ))::int AS "enTests"
         FROM preguntas_test p
        WHERE p."examenAnteriorId" = ANY($1)
        GROUP BY p."examenAnteriorId"`,
      [examenes.map((e) => e.id)],
    );
    const porId = new Map(filas.map((f: any) => [f.examenId, f]));
    return examenes.map((e) => {
      const f: any = porId.get(e.id) ?? {};
      return {
        id: e.id,
        nombre: e.nombre,
        anyo: e.anyo,
        mes: e.mes,
        parte: e.parte,
        tipo: e.tipo,
        urlArchivo: e.urlArchivo,
        total: f.total ?? 0,
        anuladas: f.anuladas ?? 0,
        desactualizadas: f.desactualizadas ?? 0,
        fueraTemario: f.fueraTemario ?? 0,
        enTests: f.enTests ?? 0,
      };
    });
  }
}
