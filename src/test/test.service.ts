import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Brackets } from 'typeorm';
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ResultadoTest } from './resultado-test.entity';
import { Usuario } from '../usuario/usuario.entity';
import { PreguntaTest } from './pregunta-test.entity';
import { EstadoUsuario } from '../usuario/usuario.entity';
import { TemaNormativa, NivelNormativa } from '../tema/tema-normativa.entity';
import { Tema } from '../tema/tema.entity';
import { Articulo } from '../normativa/articulo.entity';
import { OposicionLey } from '../ley/oposicion-ley.entity';
import { resetearConsumosSiEsNuevoDia } from '../common/helpers/consumo.helper';
import { ConfiguracionService } from '../config/configuracion.service';
import { UsuarioOposicion } from '../usuario/usuario-oposicion.entity';

/**
 * Recorta el pool de opciones de una pregunta vinculada a artículo (autoradas
 * con 4 opciones: 1 correcta + 3 distractoras) al número de opciones que use
 * la convocatoria activa del usuario (numOpcionesTest en Convocatoria).
 * No muta la fila guardada: opera sobre una copia y devuelve un nuevo índice
 * "correcta" recalculado tras el recorte + reordenado aleatorio.
 * Si numOpciones es null/undefined o >= opciones.length, devuelve tal cual.
 */
function recortarOpcionesArticulo(
  opciones: string[],
  correcta: number,
  numOpciones?: number | null,
): { opciones: string[]; correcta: number } {
  if (!numOpciones || numOpciones >= opciones.length || numOpciones < 2) {
    return { opciones, correcta };
  }

  const correctaTexto = opciones[correcta];
  const distractores = opciones.filter((_, i) => i !== correcta);

  // Barajar distractores y quedarnos con (numOpciones - 1)
  for (let i = distractores.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [distractores[i], distractores[j]] = [distractores[j], distractores[i]];
  }
  const seleccion = [correctaTexto, ...distractores.slice(0, numOpciones - 1)];

  // Barajar posición final para no dejar siempre la correcta en el índice 0
  for (let i = seleccion.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [seleccion[i], seleccion[j]] = [seleccion[j], seleccion[i]];
  }

  return { opciones: seleccion, correcta: seleccion.indexOf(correctaTexto) };
}

export interface Pregunta {
  id?: string;

  enunciado: string;

  opciones: string[];

  correcta: number;

  explicacion?: string;

  articulo?: string;

  fuente?: string;
}

@Injectable()
export class TestService {

  constructor(

    private readonly configuracionService: ConfiguracionService,

    @InjectRepository(ResultadoTest)
    private readonly resultadoRepo: Repository<ResultadoTest>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,

    @InjectRepository(PreguntaTest)
    private readonly preguntaRepo: Repository<PreguntaTest>,
    
    @InjectRepository(TemaNormativa)
    private readonly temaNormativaRepo: Repository<TemaNormativa>,

    @InjectRepository(Tema)
    private readonly temaRepo: Repository<Tema>,

    @InjectRepository(Articulo)
    private readonly articuloRepo: Repository<Articulo>,

  @InjectRepository(UsuarioOposicion)
  private readonly usuarioOposicionRepo: Repository<UsuarioOposicion>,

  ) {}

  /* =========================================================
     GENERAR TEST
  ========================================================= */

  async generarTest(
  oposicionId: string,
  numPreguntas = 10,
  temaId?: string,
  versionLeyId?: string,
  capituloId?: string,
  tituloId?: string,
  modo?: string,          
  nivel?: number,         
  dificultad?: string,  
  usuarioId?: string,
  temasIds?: string[],  
): Promise<Pregunta[]> {

  // Verificar límites si hay usuarioId
  if (usuarioId && modo !== 'primer_reto') {
    const tipoTest = temaId ? 'tema' : modo ?? 'rapido';
    const verificacion = await this.verificarLimiteTest(
      usuarioId,
      numPreguntas,
      tipoTest,
    );
    if (!verificacion.permitido) {
      throw new ForbiddenException(JSON.stringify({
        motivo: verificacion.motivo,
        limite: verificacion.limite,
      }));
    }
  }

// =========================================================
// PRIMER RETO (nivel 1, 5 preguntas, dificultad fácil)
// =========================================================
if (modo === 'primer_reto') {
  nivel = 1;
  numPreguntas = 5;
  dificultad = 'facil';
}

    let query = this.preguntaRepo
      .createQueryBuilder('pregunta')
      .leftJoinAndSelect(
        'pregunta.temas',
        'tema',
      )

      .leftJoinAndSelect(
        'pregunta.articulos',
        'articulo',
      );

    /* =========================================================
       FILTRO POR TEMA
    ========================================================= */

    if (temaId) {

      query = query.andWhere(
        'tema.id = :temaId',
        { temaId },
      );
    }

    /* =========================================================
       FILTRO POR MULTIPLES TEMAS
    ========================================================= */

    if (temasIds && temasIds.length > 0) {
      query = query.andWhere('tema.id IN (:...temasIds)', { temasIds });
    }

    /* =========================================================
       FILTRO POR CAPITULO
    ========================================================= */

    if (capituloId) {

      query = query
        .leftJoin(
          'articulo.capitulo',
          'capitulo',
        )
        .andWhere(
          'capitulo.id = :capituloId',
          { capituloId },
        );
    }

    /* =========================================================
       FILTRO POR TITULO
    ========================================================= */

    if (tituloId) {

      query = query
        .leftJoin(
          'articulo.capitulo',
          'capituloTitulo',
        )
        .leftJoin(
          'capituloTitulo.tituloRef',
          'titulo',
        )
        .andWhere(
          'titulo.id = :tituloId',
          { tituloId },
        );
    }

        // Resolver la convocatoria activa del usuario para esta oposición (si la tenemos)
    let convocatoriaActivaId: string | undefined;
    let numOpcionesTestActiva: number | null | undefined;
    if (usuarioId) {
      const uo = await this.usuarioOposicionRepo.findOne({
        where: { usuario: { id: usuarioId } as any, oposicion: { id: oposicionId } as any },
        relations: ['convocatoriaActiva'],
      });
      convocatoriaActivaId = uo?.convocatoriaActiva?.id;
      numOpcionesTestActiva = uo?.convocatoriaActiva?.numOpcionesTest;
    }

    /* =========================================================
       FILTRO POR VERSION LEY
    ========================================================= */

    if (versionLeyId) {
    query = query
      // ⭐ El artículo puede colgar de un Capítulo (capitulo → tituloRef → versionLey)
      // o, si su Título no tiene capítulos (ej. Título Preliminar de la CE, arts. 1-9,
      // o el Título X, arts. 166-169), colgar directamente de un Título (tituloRef → versionLey).
      .leftJoin('articulo.capitulo', 'capituloLey')
      .leftJoin('capituloLey.tituloRef', 'tituloViaCapituloLey')
      .leftJoin('articulo.tituloRef', 'tituloDirectoLey')
      .andWhere(
        new Brackets((qb) => {
          qb.where('tituloViaCapituloLey.versionLeyId = :versionLeyId', { versionLeyId })
            .orWhere('tituloDirectoLey.versionLeyId = :versionLeyId', { versionLeyId });
        }),
      )
      // ⭐ Exigir que el artículo esté realmente vinculado a algún tema del temario real
      .leftJoin(TemaNormativa, 'tnLey', 'tnLey."articuloId" = articulo.id')
      .leftJoin('tnLey.tema', 'temaLey')
      .andWhere(
        convocatoriaActivaId
          ? 'temaLey.id IS NOT NULL AND temaLey."convocatoriaId" = :convocatoriaActivaId'
          : 'temaLey.id IS NOT NULL',
        convocatoriaActivaId ? { convocatoriaActivaId } : {},
      );
  }



  /* =========================================================
       TEST GENERAL OPOSICION
    ========================================================= */

if (!temaId && (!temasIds || temasIds.length === 0) && !versionLeyId && !tituloId && !capituloId) {
  query = query
    .leftJoin('tema.convocatoria', 'convocatoria')
    .leftJoin('convocatoria.oposicion', 'oposicion')
    .leftJoin(
      TemaNormativa,
      'tn',
      'tn."articuloId" = articulo.id'
    )
    .leftJoin('tn.tema', 'temaNorm')
    .leftJoin('temaNorm.convocatoria', 'convocatoriaNorm')
    .leftJoin('convocatoriaNorm.oposicion', 'oposicionNorm')
    // ⭐ Igual que arriba: el artículo puede colgar de Capítulo o directamente de Título
    .leftJoin('articulo.capitulo', 'capituloArt')
    .leftJoin('capituloArt.tituloRef', 'tituloRefArt')
    .leftJoin('tituloRefArt.versionLey', 'versionLeyArt')
    .leftJoin('articulo.tituloRef', 'tituloDirectoArt')
    .leftJoin('tituloDirectoArt.versionLey', 'versionLeyDirectoArt')
    .leftJoin(
      OposicionLey,
      'ol',
      'ol."versionLeyId" = versionLeyArt.id OR ol."versionLeyId" = versionLeyDirectoArt.id'
    )
    .leftJoin('ol.oposicion', 'oposicionLey');

  if (convocatoriaActivaId) {
    // ⭐ si conocemos la convocatoria del usuario, filtramos por ella (más preciso)
    query = query.andWhere(
      '(convocatoria.id = :convocatoriaActivaId OR convocatoriaNorm.id = :convocatoriaActivaId OR oposicionLey.id = :oposicionId)',
      { convocatoriaActivaId, oposicionId },
    );
  } else {
    // Fallback: comportamiento anterior si no hay usuario/convocatoria resuelta
    query = query.andWhere(
      '(oposicion.id = :oposicionId OR oposicionNorm.id = :oposicionId OR oposicionLey.id = :oposicionId)',
      { oposicionId },
    );
  }
}



    /* =========================================================
       SOLO ACTIVAS
    ========================================================= */

    query = query.andWhere(
      'pregunta.activa = true',
    );

    /* =========================================================
       RANDOM
    ========================================================= */
const preguntasSinDeduplicar = await query
  .orderBy('RANDOM()')
  .limit(numPreguntas * 3)
  .getMany();

const vistas = new Set<string>();
const preguntas = preguntasSinDeduplicar.filter(p => {
  if (vistas.has(p.id)) return false;
  vistas.add(p.id);
  return true;
}).slice(0, numPreguntas);

    return preguntas.map((p) => {
      // El recorte de opciones (4→N) solo aplica a preguntas vinculadas a
      // artículo (banco compartido entre oposiciones/convocatorias). Las
      // preguntas por tema mantienen siempre sus opciones tal cual.
      const esArticulo = !!p.articulos?.length;
      const { opciones, correcta } = esArticulo
        ? recortarOpcionesArticulo(p.opciones, p.correcta, numOpcionesTestActiva)
        : { opciones: p.opciones, correcta: p.correcta };

      return {
        id: p.id,
        enunciado: p.enunciado,
        opciones,
        correcta,
        explicacion: p.explicacion ?? '',
        articulo: p.articulos?.[0] ? `Art. ${p.articulos[0].numero}` : undefined,
        articuloId: p.articulos?.[0]?.id ?? null,
        temaId: p.temas?.[0]?.id ?? null,
        fuente: 'banco',
      };
    });
  }

  /* =========================================================
     GUARDAR RESULTADO
  ========================================================= */

 async guardarResultado(datos: {
  usuarioId: string;
  oposicionId: string;
  totalPreguntas: number;
  correctas: number;
  tipoTest: string;
  tiempoSegundos: number;
  temaId?: string;
  detallePreguntas: {
    preguntaId?: string;
    enunciado: string;
    correcta: boolean;
    enBlanco?: boolean;
    temaId?: string;
    articuloId?: string;
    indiceSeleccionada?: number | null;
    indiceCorrecta?: number;
  }[];
}): Promise<ResultadoTest> {

  /* =========================================================
     ⭐ SEGURIDAD: nunca confiar en la corrección/puntuación que
     manda el cliente (se puede falsificar desde el navegador).
     Se recalcula aquí contra la respuesta real guardada en BD,
     usando únicamente preguntaId + indiceSeleccionada del cliente.
  ========================================================= */
  const preguntaIds = datos.detallePreguntas
    .map((d) => d.preguntaId)
    .filter((id): id is string => !!id);

  const preguntasReales = preguntaIds.length
    ? await this.preguntaRepo.find({ where: { id: In(preguntaIds) } })
    : [];
  const mapaPreguntas = new Map(preguntasReales.map((p) => [p.id, p]));

  const detalleVerificado = datos.detallePreguntas.map((d) => {
    if (d.enBlanco || !d.preguntaId) {
      return { ...d, correcta: false };
    }
    const real = mapaPreguntas.get(d.preguntaId);
    if (!real) {
      // Pregunta inexistente/eliminada: no puede contar como acierto
      return { ...d, correcta: false };
    }
    return { ...d, correcta: d.indiceSeleccionada === real.correcta };
  });

  const totalPreguntasVerificado = detalleVerificado.length || datos.totalPreguntas;
  const correctasVerificadas = detalleVerificado.filter(
    (d) => d.correcta && !d.enBlanco,
  ).length;
  const porcentaje = totalPreguntasVerificado > 0
    ? Math.round((correctasVerificadas / totalPreguntasVerificado) * 100)
    : 0;

  const resultado = this.resultadoRepo.create({
    totalPreguntas: totalPreguntasVerificado,
    correctas: correctasVerificadas,
    porcentaje,
    tipoTest: datos.tipoTest,
    tiempoSegundos: datos.tiempoSegundos,
    detallePreguntas: detalleVerificado,
    usuario: { id: datos.usuarioId } as any,
    oposicion: { id: datos.oposicionId } as any,
    tema: datos.temaId ? { id: datos.temaId } as any : undefined,
  });

 await this.resultadoRepo.save(resultado);

  // Incrementar preguntasTestHoy / histórico de forma atómica (evita condiciones de carrera)
  await this.usuarioRepo.increment({ id: datos.usuarioId }, 'preguntasTestHoy', totalPreguntasVerificado);
  await this.usuarioRepo.increment({ id: datos.usuarioId }, 'preguntasRespondidasTotales', totalPreguntasVerificado);
  await this.usuarioRepo.update(datos.usuarioId, { ultimaActividad: new Date() });

  /* =========================================================
     ⭐ PRIMER RETO → MARCAR USUARIO COMO ACTIVO
  ========================================================= */
  if (datos.tipoTest === 'primer_reto') {
    await this.usuarioRepo.update(datos.usuarioId, {
  estado: EstadoUsuario.ACTIVO,
      // ⭐ si quieres registrar que ya lo hizo:
      // primerRetoCompletado: true,
    });
  }

  /* =========================================================
     ACTUALIZAR ESTADISTICAS PREGUNTAS (incrementos atómicos)
  ========================================================= */
  for (const detalle of detalleVerificado) {
    if (!detalle.preguntaId || !mapaPreguntas.has(detalle.preguntaId)) continue;

    await this.preguntaRepo.increment({ id: detalle.preguntaId }, 'vecesUsada', 1);
    if (detalle.correcta) {
      await this.preguntaRepo.increment({ id: detalle.preguntaId }, 'aciertos', 1);
    } else {
      await this.preguntaRepo.increment({ id: detalle.preguntaId }, 'fallos', 1);
    }
  }

  /* =========================================================
     PUNTOS (si quieres excluir el primer reto, lo hacemos aquí)
     ⭐ Devolvemos el detalle de puntos/nivel ganados junto con el resultado
     para que el frontend pueda mostrar el feedback de gamificación
     (antes se calculaban y guardaban en BD pero no llegaban a la UI).
  ========================================================= */
  let gamificacion: {
    puntosGanados: number;
    puntosTotales: number;
    nivelAnterior: number;
    nivelNuevo: number;
    subioNivel: boolean;
    nombreNivel: string;
    badgeNivel: string;
  } | null = null;

  if (datos.tipoTest !== 'primer_reto') {
    gamificacion = await this.actualizarPuntos(
      datos.usuarioId,
      datos.oposicionId, // ⭐ nuevo
      totalPreguntasVerificado,
      correctasVerificadas,
      porcentaje,
    );
  }

  // ⭐ Guardamos el snapshot en el propio resultado (no solo en la respuesta del POST)
  // porque la pantalla de resultado navega con router.replace y relee el último
  // resultado por GET, sin recibir nunca esta respuesta directamente.
  if (gamificacion) {
    resultado.gamificacion = gamificacion;
    await this.resultadoRepo.update(resultado.id, { gamificacion });
  }

  return { ...resultado, gamificacion } as any;
}


  /* =========================================================
     PUNTOS Y NIVELES
  ========================================================= */

 private async actualizarPuntos(
  usuarioId: string,
  oposicionId: string,
  numPreguntas: number,
  correctas: number,
  porcentaje: number,
): Promise<{
  puntosGanados: number;
  puntosTotales: number;
  nivelAnterior: number;
  nivelNuevo: number;
  subioNivel: boolean;
  nombreNivel: string;
  badgeNivel: string;
} | null> {
  const puntosAcciones = await this.configuracionService.getPuntosAcciones();

  const usuarioOposicion = await this.usuarioOposicionRepo.findOne({
    where: { usuario: { id: usuarioId } as any, oposicion: { id: oposicionId } as any },
  });
  if (!usuarioOposicion) return null;

  // Puntos por preguntas correctas
  let puntosGanados = correctas * puntosAcciones.preguntaCorrecta;

  // Bonus por porcentaje
  if (porcentaje >= 80) {
    puntosGanados += puntosAcciones.testCompletadoMas80;
  } else if (porcentaje >= 60) {
    puntosGanados += puntosAcciones.testCompletadoMas60;
  }

  if (puntosGanados === 0) return null;

  const nivelAnterior = usuarioOposicion.nivel;
  const nuevosPuntos = usuarioOposicion.puntos + puntosGanados;
  const nuevoNivel = await this.configuracionService.calcularNivelPorPuntos(nuevosPuntos);

  await this.usuarioOposicionRepo.update(usuarioOposicion.id, {
    puntos: nuevosPuntos,
    nivel: nuevoNivel,
  });

  const nivelesEstudio = await this.configuracionService.getNivelesEstudio();
  const infoNivel = nivelesEstudio.find((n: any) => n.nivel === nuevoNivel);

  return {
    puntosGanados,
    puntosTotales: nuevosPuntos,
    nivelAnterior,
    nivelNuevo: nuevoNivel,
    subioNivel: nuevoNivel > nivelAnterior,
    nombreNivel: infoNivel?.nombre ?? '',
    badgeNivel: infoNivel?.badge ?? '',
  };
}

  /* =========================================================
     PROGRESO
  ========================================================= */

async getUltimoResultado(usuarioId: string) {
  const resultado = await this.resultadoRepo.findOne({
    where: {
      usuario: { id: usuarioId },
    },
    relations: ['oposicion'],
    order: { creadoEn: 'DESC' },
  });

  if (!resultado) return null;

  // Media histórica del usuario en esa oposición
  const resultados = await this.resultadoRepo.find({
    where: {
      usuario: { id: usuarioId },
      oposicion: { id: resultado.oposicion?.id },
    },
    order: { creadoEn: 'DESC' },
    take: 20,
  });

  const mediaAcierto = resultados.length > 0
    ? Math.round(resultados.reduce((acc, r) => acc + r.porcentaje, 0) / resultados.length)
    : 0;

  const mejorResultado = resultados.length > 0
    ? Math.max(...resultados.map(r => r.porcentaje))
    : 0;

   //const blancos = resultado.detallePreguntas?.filter((d: any) => d.enBlanco).length ?? 0; 
const detallePreguntas = resultado.detallePreguntas ?? [];
const blancos = detallePreguntas.filter((d: any) => d.enBlanco).length;
const correctas = detallePreguntas.filter((d: any) => d.correcta && !d.enBlanco).length;
const falladas = detallePreguntas.filter((d: any) => !d.correcta && !d.enBlanco).length;

return {
  id: resultado.id,
  oposicionId: resultado.oposicion?.id ?? null,
  porcentaje: resultado.porcentaje,
  correctas,
  falladas,
  blancos,
  totalPreguntas: resultado.totalPreguntas,
  tipoTest: resultado.tipoTest,
  tiempoSegundos: resultado.tiempoSegundos,
  detallePreguntas: resultado.detallePreguntas,
  creadoEn: resultado.creadoEn,
  mediaAcierto,
  mejorResultado,
  totalTestsRealizados: resultados.length,
  gamificacion: resultado.gamificacion ?? null,
};}

  async getProgresoTema(
  usuarioId: string,
  oposicionId: string,
  temaId: string,
): Promise<any> {

  const temaNormativas = await this.temaNormativaRepo.find({
    where: {
      tema: { id: temaId },
      nivel: NivelNormativa.ARTICULO,
    },
    relations: ['articulo'],
  });

  const articuloIds = temaNormativas
  .map(tn => tn.articulo?.id)
  .filter((id): id is string => !!id);

  const resultados = await this.resultadoRepo.find({
    where: {
      usuario: { id: usuarioId },
      oposicion: { id: oposicionId },
    },
  });

  const preguntasDelTema = resultados.flatMap(r =>
  (r.detallePreguntas ?? []).filter(d =>
    d.temaId === temaId ||
    (d.articuloId != null && articuloIds.includes(d.articuloId))
  )
);

  const total = preguntasDelTema.length;
  const correctas = preguntasDelTema.filter(d => d.correcta).length;
  const falladas = total - correctas;
  const porcentajeAcierto = total > 0
    ? Math.round((correctas / total) * 100)
    : 0;

  return { total, correctas, falladas, porcentajeAcierto };
}

  async getProgreso(
    usuarioId: string,
    oposicionId: string,
  ): Promise<any> {

    const resultados =
      await this.resultadoRepo.find({

        where: {
          usuario: {
            id: usuarioId,
          },

          oposicion: {
            id: oposicionId,
          },
        },

        order: {
          creadoEn: 'DESC',
        },

        take: 100,
      });

    if (resultados.length === 0) {

      return {

        totalTests: 0,

        promedioAcierto: 0,

        nivelEstimado: 0,

        tendencia: 'sin_datos',

        porDia: [],

        porTema: [],
      };
    }

    const totalTests =
      resultados.length;

    const promedioAcierto =
      Math.round(
        resultados.reduce(
          (acc, r) => acc + r.porcentaje,
          0,
        ) / totalTests,
      );

    return {

      totalTests,

      promedioAcierto,

      nivelEstimado: promedioAcierto,

      tendencia: 'estable',

      porDia: [],

      porTema: [],
    };
  }

  async getProgresoPorPeriodo(usuarioId: string, oposicionId: string) {
  const ahora = new Date();
  const inicioHoy = new Date(ahora); inicioHoy.setHours(0, 0, 0, 0);
  const inicioSemana = new Date(ahora); inicioSemana.setDate(ahora.getDate() - 7);
  const inicioMes = new Date(ahora); inicioMes.setDate(ahora.getDate() - 30);

  const resultados = await this.resultadoRepo.find({
    where: { usuario: { id: usuarioId }, oposicion: { id: oposicionId } },
  });

  const calcular = (desde: Date | null) => {
    const filtrados = desde ? resultados.filter(r => r.creadoEn >= desde) : resultados;
    const totalPreguntas = filtrados.reduce((acc, r) => acc + r.totalPreguntas, 0);
    const totalCorrectas = filtrados.reduce((acc, r) => acc + r.correctas, 0);
    const precision = totalPreguntas > 0 ? Math.round((totalCorrectas / totalPreguntas) * 100) : 0;
    return { totalPreguntas, precision };
  };

  return {
    dia: calcular(inicioHoy),
    semana: calcular(inicioSemana),
    mes: calcular(inicioMes),
    total: calcular(null),
  };
}

async importarPorConvocatoria(
  convocatoriaId: string,
  preguntas: {
    enunciado: string;
    opciones: string[];
    correcta: number;
    explicacion?: string;
    dificultad?: number;
    origen?: string;
    anyo?: number;
    temaNumero: number;
  }[],
  examenAnteriorId?: string, // ⭐ nuevo parámetro
): Promise<{ importadas: number; errores: string[] }> {

  const temas = await this.temaRepo.find({
    where: { convocatoria: { id: convocatoriaId } },
  });

  let importadas = 0;
  const errores: string[] = [];
  const enunciadosDeEsteLote = new Set<string>();

  for (const [i, p] of preguntas.entries()) {
    const etiqueta = `Fila ${i + 1} (Tema ${p?.temaNumero ?? '?'})`;

    const errorValidacion = this.validarPreguntaImportada(p);
    if (errorValidacion) {
      errores.push(`${etiqueta}: ${errorValidacion}`);
      continue;
    }

    const tema = temas.find(t => t.numero === p.temaNumero);

    if (!tema) {
      errores.push(`${etiqueta}: tema no encontrado en esta convocatoria`);
      continue;
    }

    // ⭐ Evitar duplicados: dentro del mismo lote y contra preguntas ya existentes
    const enunciadoNormalizado = p.enunciado.trim();
    if (enunciadosDeEsteLote.has(enunciadoNormalizado)) {
      errores.push(`${etiqueta}: pregunta duplicada dentro del propio archivo — "${enunciadoNormalizado.slice(0, 60)}..."`);
      continue;
    }
    const existente = await this.preguntaRepo.findOne({ where: { enunciado: enunciadoNormalizado } });
    if (existente) {
      errores.push(`${etiqueta}: pregunta ya existente en el banco — "${enunciadoNormalizado.slice(0, 60)}..."`);
      continue;
    }
    enunciadosDeEsteLote.add(enunciadoNormalizado);

    const pregunta = this.preguntaRepo.create({
      enunciado: p.enunciado,
      opciones: p.opciones,
      correcta: p.correcta,
      explicacion: p.explicacion,
      dificultad: p.dificultad ?? 1,
      origen: p.origen ?? 'convocatoria',
      anyo: p.anyo,
      activa: true,
      examenAnterior: examenAnteriorId ? { id: examenAnteriorId } as any : undefined, // ⭐ nuevo
    });

    const saved = await this.preguntaRepo.save(pregunta);

    await this.preguntaRepo
      .createQueryBuilder()
      .relation(PreguntaTest, 'temas')
      .of(saved.id)
      .add(tema.id);

    importadas++;
  }

  return { importadas, errores };
}


async importarPorVersionLey(
  versionLeyId: string,
  preguntas: {
    enunciado: string;
    opciones: string[];
    correcta: number;
    explicacion?: string;
    dificultad?: number;
    origen?: string;
    anyo?: number;
    articuloNumero: string;
  }[],
): Promise<{ importadas: number; errores: string[] }> {

  // Obtener artículos de la versión de ley.
  // ⭐ Un artículo puede colgar de un Capítulo (capitulo → tituloRef → versionLey)
  // O, si su Título no tiene capítulos (ej. Título Preliminar de la CE, arts. 1-9,
  // o el Título X, arts. 166-169), colgar directamente de un Título (tituloRef → versionLey).
  // Hay que buscar por ambos caminos o se pierden los artículos sin capítulo.
  const articulos = await this.articuloRepo
    .createQueryBuilder('articulo')
    .leftJoin('articulo.capitulo', 'capitulo')
    .leftJoin('capitulo.tituloRef', 'tituloViaCapitulo')
    .leftJoin('articulo.tituloRef', 'tituloDirecto')
    .where(
      new Brackets((qb) => {
        qb.where('tituloViaCapitulo.versionLeyId = :versionLeyId', { versionLeyId })
          .orWhere('tituloDirecto.versionLeyId = :versionLeyId', { versionLeyId });
      }),
    )
    .getMany();

  let importadas = 0;
  const errores: string[] = [];
  const enunciadosDeEsteLote = new Set<string>();

  for (const [i, p] of preguntas.entries()) {
    const etiqueta = `Fila ${i + 1} (Art. ${p?.articuloNumero ?? '?'})`;

    const errorValidacion = this.validarPreguntaImportada(p);
    if (errorValidacion) {
      errores.push(`${etiqueta}: ${errorValidacion}`);
      continue;
    }

    const articulo = articulos.find(a => a.numero === p.articuloNumero);

    if (!articulo) {
      errores.push(`${etiqueta}: artículo no encontrado en esta versión de ley`);
      continue;
    }

    // ⭐ Evitar duplicados: dentro del mismo lote y contra preguntas ya existentes
    const enunciadoNormalizado = p.enunciado.trim();
    if (enunciadosDeEsteLote.has(enunciadoNormalizado)) {
      errores.push(`${etiqueta}: pregunta duplicada dentro del propio archivo — "${enunciadoNormalizado.slice(0, 60)}..."`);
      continue;
    }
    const existente = await this.preguntaRepo.findOne({ where: { enunciado: enunciadoNormalizado } });
    if (existente) {
      errores.push(`${etiqueta}: pregunta ya existente en el banco — "${enunciadoNormalizado.slice(0, 60)}..."`);
      continue;
    }
    enunciadosDeEsteLote.add(enunciadoNormalizado);

    const pregunta = this.preguntaRepo.create({
      enunciado: p.enunciado,
      opciones: p.opciones,
      correcta: p.correcta,
      explicacion: p.explicacion,
      dificultad: p.dificultad ?? 1,
      origen: p.origen ?? 'convocatoria',
      anyo: p.anyo,
      activa: true,
    });

    const saved = await this.preguntaRepo.save(pregunta);

    // Vincular al artículo
    await this.preguntaRepo
      .createQueryBuilder()
      .relation(PreguntaTest, 'articulos')
      .of(saved.id)
      .add(articulo.id);

    importadas++;
  }

  return { importadas, errores };
}

/* =========================================================
   ⭐ REPASO INTELIGENTE
   Prioriza las preguntas que el usuario más ha fallado
   (históricamente, sobre sus propios intentos) y, si no hay
   histórico suficiente, completa con un test general normal.
========================================================= */
async generarRepasoInteligente(
  usuarioId: string,
  oposicionId: string,
  numPreguntas = 10,
): Promise<{ preguntas: Pregunta[]; basadoEnHistorial: number }> {

  // ⭐ A diferencia de generarTest, este método no tenía NINGUNA comprobación de
  // límites de plan. El relleno con preguntas generales solo pasa por
  // verificarLimiteTest de rebote (dentro de generarTest, y solo para "faltan",
  // no para numPreguntas total) — si el usuario tiene histórico de fallos
  // suficiente para cubrir todo el repaso con preguntas prioritarias, "faltan"
  // sale 0 y ese generarTest interno ni se llama, saltándose el límite diario
  // y el límite por test por completo. Lo comprobamos aquí, para el total.
  const verificacion = await this.verificarLimiteTest(usuarioId, numPreguntas, 'repaso');
  if (!verificacion.permitido) {
    throw new ForbiddenException(JSON.stringify({
      motivo: verificacion.motivo,
      limite: verificacion.limite,
    }));
  }

  // Historial reciente del usuario en esta oposición
  const resultados = await this.resultadoRepo.find({
    where: {
      usuario: { id: usuarioId },
      oposicion: { id: oposicionId },
    },
    order: { creadoEn: 'DESC' },
    take: 50,
  });

  // Agregamos fallos/aciertos por pregunta a partir del detalle guardado
  const stats = new Map<string, { fallos: number; aciertos: number; ultimaVez: number }>();
  for (const r of resultados) {
    for (const d of (r.detallePreguntas ?? []) as any[]) {
      if (!d.preguntaId || d.enBlanco) continue;
      const s = stats.get(d.preguntaId) ?? { fallos: 0, aciertos: 0, ultimaVez: 0 };
      if (d.correcta) s.aciertos++; else s.fallos++;
      const fecha = new Date(r.creadoEn).getTime();
      if (fecha > s.ultimaVez) s.ultimaVez = fecha;
      stats.set(d.preguntaId, s);
    }
  }

  // Priorizamos: al menos 1 fallo, mayor ratio de fallo primero, y a igualdad, el fallo más reciente
  const prioridadIds = [...stats.entries()]
    .filter(([, s]) => s.fallos > 0)
    .sort((a, b) => {
      const ratioA = a[1].fallos / (a[1].fallos + a[1].aciertos);
      const ratioB = b[1].fallos / (b[1].fallos + b[1].aciertos);
      if (ratioB !== ratioA) return ratioB - ratioA;
      return b[1].ultimaVez - a[1].ultimaVez;
    })
    .map(([id]) => id)
    .slice(0, numPreguntas);

  let preguntasPrioritarias: PreguntaTest[] = [];
  if (prioridadIds.length > 0) {
    const encontradas = await this.preguntaRepo.find({
      where: { id: In(prioridadIds), activa: true },
      relations: ['temas', 'articulos'],
    });
    // Mantener el orden de prioridad (por ratio de fallo)
    preguntasPrioritarias = prioridadIds
      .map((id) => encontradas.find((p) => p.id === id))
      .filter((p): p is PreguntaTest => !!p);
  }

  // Convocatoria activa del usuario, para recortar opciones en preguntas de artículo
  let numOpcionesTestActiva: number | null | undefined;
  const uoRepaso = await this.usuarioOposicionRepo.findOne({
    where: { usuario: { id: usuarioId } as any, oposicion: { id: oposicionId } as any },
    relations: ['convocatoriaActiva'],
  });
  numOpcionesTestActiva = uoRepaso?.convocatoriaActiva?.numOpcionesTest;

  const payloadPrioritario: Pregunta[] = preguntasPrioritarias.map((p) => {
    const esArticulo = !!p.articulos?.length;
    const { opciones, correcta } = esArticulo
      ? recortarOpcionesArticulo(p.opciones, p.correcta, numOpcionesTestActiva)
      : { opciones: p.opciones, correcta: p.correcta };

    return {
      id: p.id,
      enunciado: p.enunciado,
      opciones,
      correcta,
      explicacion: p.explicacion ?? '',
      articulo: p.articulos?.[0] ? `Art. ${p.articulos[0].numero}` : undefined,
      articuloId: p.articulos?.[0]?.id ?? null,
      temaId: p.temas?.[0]?.id ?? null,
      fuente: 'repaso_inteligente',
    } as any;
  });

  // Si no hay histórico suficiente, completamos con un test general (sin repetir preguntas)
  const faltan = numPreguntas - payloadPrioritario.length;
  let relleno: Pregunta[] = [];
  if (faltan > 0) {
    const generales = await this.generarTest(
      oposicionId,
      faltan,
      undefined,
      undefined,
      undefined,
      undefined,
      'repaso',
      undefined,
      undefined,
      usuarioId,
    );
    const yaIncluidos = new Set(payloadPrioritario.map((p) => p.id));
    relleno = generales.filter((p) => !yaIncluidos.has(p.id));
  }

  return {
    preguntas: [...payloadPrioritario, ...relleno].slice(0, numPreguntas),
    basadoEnHistorial: payloadPrioritario.length,
  };
}

/* =========================================================
   ⭐ GESTIÓN DEL BANCO DE PREGUNTAS (listar / editar / eliminar)
   Permite mantener el banco entre convocatorias sin tener que
   borrarlo entero cuando cambia el contenido de un tema.
========================================================= */
async listarPreguntasBanco(
  convocatoriaId: string,
  temaId?: string,
  pagina = 1,
  porPagina = 30,
): Promise<{ preguntas: any[]; total: number; pagina: number; totalPaginas: number }> {

  let query = this.preguntaRepo
    .createQueryBuilder('pregunta')
    .leftJoinAndSelect('pregunta.temas', 'tema')
    .leftJoinAndSelect('pregunta.articulos', 'articulo')
    .leftJoin('tema.convocatoria', 'convocatoria')
    .where('convocatoria.id = :convocatoriaId', { convocatoriaId })
    .orderBy('pregunta.creadoEn', 'DESC');

  if (temaId) {
    query = query.andWhere('tema.id = :temaId', { temaId });
  }

  const total = await query.getCount();
  const preguntas = await query
    .skip((pagina - 1) * porPagina)
    .take(porPagina)
    .getMany();

  return {
    preguntas,
    total,
    pagina,
    totalPaginas: Math.max(1, Math.ceil(total / porPagina)),
  };
}

/**
 * ⭐ Equivalente a listarPreguntasBanco pero para el banco de preguntas
 * vinculadas a artículos de una versión de ley (ej. Constitución Española),
 * que no cuelgan de ninguna convocatoria/tema. Usa el mismo doble camino
 * (capítulo o título directo) que el resto de queries por versión de ley,
 * para no perderse los artículos del Título Preliminar o el Título X.
 */
async listarPreguntasPorVersionLey(
  versionLeyId: string,
  articuloId?: string,
  pagina = 1,
  porPagina = 30,
): Promise<{ preguntas: any[]; total: number; pagina: number; totalPaginas: number }> {

  let query = this.preguntaRepo
    .createQueryBuilder('pregunta')
    .leftJoinAndSelect('pregunta.articulos', 'articulo')
    .leftJoinAndSelect('pregunta.temas', 'tema')
    .leftJoin('articulo.capitulo', 'capitulo')
    .leftJoin('capitulo.tituloRef', 'tituloViaCapitulo')
    .leftJoin('tituloViaCapitulo.versionLey', 'versionLeyViaCapitulo')
    .leftJoin('articulo.tituloRef', 'tituloDirecto')
    .leftJoin('tituloDirecto.versionLey', 'versionLeyDirecto')
    .where(
      new Brackets((qb) => {
        qb.where('versionLeyViaCapitulo.id = :versionLeyId', { versionLeyId })
          .orWhere('versionLeyDirecto.id = :versionLeyId', { versionLeyId });
      }),
    )
    .orderBy('pregunta.creadoEn', 'DESC');

  if (articuloId) {
    query = query.andWhere('articulo.id = :articuloId', { articuloId });
  }

  const total = await query.getCount();
  const preguntas = await query
    .skip((pagina - 1) * porPagina)
    .take(porPagina)
    .getMany();

  return {
    preguntas,
    total,
    pagina,
    totalPaginas: Math.max(1, Math.ceil(total / porPagina)),
  };
}

async actualizarPreguntaBanco(preguntaId: string, cambios: {
  enunciado?: string;
  opciones?: string[];
  correcta?: number;
  explicacion?: string;
  dificultad?: number;
  activa?: boolean;
}): Promise<PreguntaTest> {
  const pregunta = await this.preguntaRepo.findOne({ where: { id: preguntaId } });
  if (!pregunta) throw new NotFoundException('Pregunta no encontrada');

  // Si se tocan enunciado/opciones/correcta, validamos el resultado final igual que en la importación
  const propuesta = {
    enunciado: cambios.enunciado ?? pregunta.enunciado,
    opciones: cambios.opciones ?? pregunta.opciones,
    correcta: cambios.correcta ?? pregunta.correcta,
  };
  if (cambios.enunciado !== undefined || cambios.opciones !== undefined || cambios.correcta !== undefined) {
    const errorValidacion = this.validarPreguntaImportada(propuesta);
    if (errorValidacion) throw new ForbiddenException(`Cambios inválidos: ${errorValidacion}`);
  }

  await this.preguntaRepo.update(preguntaId, {
    ...(cambios.enunciado !== undefined && { enunciado: cambios.enunciado.trim() }),
    ...(cambios.opciones !== undefined && { opciones: cambios.opciones }),
    ...(cambios.correcta !== undefined && { correcta: cambios.correcta }),
    ...(cambios.explicacion !== undefined && { explicacion: cambios.explicacion }),
    ...(cambios.dificultad !== undefined && { dificultad: cambios.dificultad }),
    ...(cambios.activa !== undefined && { activa: cambios.activa }),
  });

  return this.preguntaRepo.findOne({ where: { id: preguntaId }, relations: ['temas', 'articulos'] }) as Promise<PreguntaTest>;
}

async eliminarPreguntaBanco(preguntaId: string): Promise<{ eliminada: boolean }> {
  const pregunta = await this.preguntaRepo.findOne({ where: { id: preguntaId } });
  if (!pregunta) throw new NotFoundException('Pregunta no encontrada');

  // Limpiamos primero las relaciones M2M (temas/articulos) para evitar
  // violaciones de FK en las tablas intermedias antes de borrar la fila.
  await this.preguntaRepo.createQueryBuilder().relation(PreguntaTest, 'temas').of(preguntaId).remove(
    (await this.preguntaRepo.findOne({ where: { id: preguntaId }, relations: ['temas'] }))?.temas ?? [],
  );
  await this.preguntaRepo.createQueryBuilder().relation(PreguntaTest, 'articulos').of(preguntaId).remove(
    (await this.preguntaRepo.findOne({ where: { id: preguntaId }, relations: ['articulos'] }))?.articulos ?? [],
  );

  await this.preguntaRepo.delete(preguntaId);
  return { eliminada: true };
}

/* =========================================================
   ⭐ VALIDACIÓN DE PREGUNTAS IMPORTADAS
   Se aplica a cualquier vía de importación (por convocatoria o
   por versión de ley) para evitar que un JSON mal formado
   corrompa el banco de preguntas en producción.
========================================================= */
private validarPreguntaImportada(p: any): string | null {
  if (!p || typeof p !== 'object') return 'la pregunta no es un objeto válido';

  if (typeof p.enunciado !== 'string' || !p.enunciado.trim()) {
    return 'falta el enunciado o está vacío';
  }

  if (!Array.isArray(p.opciones) || (p.opciones.length !== 3 && p.opciones.length !== 4)) {
    return `el número de opciones debe ser 3 o 4 (recibido: ${Array.isArray(p.opciones) ? p.opciones.length : 'no es un array'})`;
  }

  if (p.opciones.some((o: any) => typeof o !== 'string' || !o.trim())) {
    return 'hay alguna opción vacía o que no es texto';
  }

  const opcionesNormalizadas = p.opciones.map((o: string) => o.trim().toLowerCase());
  if (new Set(opcionesNormalizadas).size !== opcionesNormalizadas.length) {
    return 'hay opciones repetidas';
  }

  if (
    typeof p.correcta !== 'number' ||
    !Number.isInteger(p.correcta) ||
    p.correcta < 0 ||
    p.correcta >= p.opciones.length
  ) {
    return `el índice "correcta" (${p.correcta}) está fuera de rango para ${p.opciones.length} opciones`;
  }

  return null;
}

async verificarLimiteTest(
  usuarioId: string,
  numPreguntas: number,
  tipoTest: string,
): Promise<{ permitido: boolean; motivo?: string; limite?: number }> {

  const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
  if (!usuario) throw new NotFoundException('Usuario no encontrado');

  const usuarioActualizado = resetearConsumosSiEsNuevoDia(usuario);
  if (usuarioActualizado.fechaResetConsumo !== usuario.fechaResetConsumo) {
    await this.usuarioRepo.save(usuarioActualizado);
  }

  // ⭐ Leer límites desde configuración dinámica
  const limitesPlanes = await this.configuracionService.getLimitesPlanes();
  const limits = limitesPlanes[usuario.suscripcion ?? 'gratuito'];

  if (tipoTest === 'simulacro' && !limits.simulacros) {
    return { permitido: false, motivo: 'simulacro_bloqueado', limite: 0 };
  }

  const limitePorTest = tipoTest === 'tema'
    ? limits.preguntasPorTema
    : limits.preguntasPorTest;

  if (numPreguntas > limitePorTest) {
    return { permitido: false, motivo: 'limite_por_test', limite: limitePorTest };
  }

  const limiteDiario = limits.preguntasTestDia;
  if (limiteDiario !== null && usuario.preguntasTestHoy + numPreguntas > limiteDiario) {
    const restantes = limiteDiario - usuario.preguntasTestHoy;
    return { permitido: false, motivo: 'limite_diario', limite: Math.max(0, restantes) };
  }

  return { permitido: true };
}
}
