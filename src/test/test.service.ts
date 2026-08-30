import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    /* =========================================================
       FILTRO POR VERSION LEY
    ========================================================= */

    if (versionLeyId) {

      query = query
        .leftJoin(
          'articulo.capitulo',
          'capituloLey',
        )
        .leftJoin(
          'capituloLey.tituloRef',
          'tituloLey',
        )
        .leftJoin(
          'tituloLey.versionLey',
          'versionLey',
        )
        .andWhere(
          'versionLey.id = :versionLeyId',
          { versionLeyId },
        );
    }

    // Resolver la convocatoria activa del usuario para esta oposición (si la tenemos)
    let convocatoriaActivaId: string | undefined;
    if (usuarioId) {
      const uo = await this.usuarioOposicionRepo.findOne({
        where: { usuario: { id: usuarioId } as any, oposicion: { id: oposicionId } as any },
        relations: ['convocatoriaActiva'],
      });
      convocatoriaActivaId = uo?.convocatoriaActiva?.id;
    }

  /* =========================================================
       TEST GENERAL OPOSICION
    ========================================================= */

if (!temaId && !versionLeyId && !tituloId && !capituloId) {
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
    .leftJoin('articulo.capitulo', 'capituloArt')
    .leftJoin('capituloArt.tituloRef', 'tituloRefArt')
    .leftJoin('tituloRefArt.versionLey', 'versionLeyArt')
    .leftJoin(
      OposicionLey,
      'ol',
      'ol."versionLeyId" = versionLeyArt.id'
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

    return preguntas.map((p) => ({

      id: p.id,
      enunciado: p.enunciado,
      opciones: p.opciones,
      correcta: p.correcta,
      explicacion: p.explicacion ?? '',
      articulo: p.articulos?.[0] ? `Art. ${p.articulos[0].numero}` : undefined,
      articuloId: p.articulos?.[0]?.id ?? null,  
      temaId: p.temas?.[0]?.id ?? null,          
      fuente: 'banco',
    }));
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
    temaId?: string;
    articuloId?: string;
  }[];
}): Promise<ResultadoTest> {
  
  const porcentaje = Math.round(
    (datos.correctas / datos.totalPreguntas) * 100,
  );

  const resultado = this.resultadoRepo.create({
    totalPreguntas: datos.totalPreguntas,
    correctas: datos.correctas,
    porcentaje,
    tipoTest: datos.tipoTest,
    tiempoSegundos: datos.tiempoSegundos,
    detallePreguntas: datos.detallePreguntas,
    usuario: { id: datos.usuarioId } as any,
    oposicion: { id: datos.oposicionId } as any,
    tema: datos.temaId ? { id: datos.temaId } as any : undefined,
  });

 await this.resultadoRepo.save(resultado);

  // Incrementar preguntasTestHoy siempre
  const usuario = await this.usuarioRepo.findOne({ where: { id: datos.usuarioId } });
  if (usuario) {
    await this.usuarioRepo.update(datos.usuarioId, {
      preguntasTestHoy: usuario.preguntasTestHoy + datos.totalPreguntas,           // hoy
      preguntasRespondidasTotales: usuario.preguntasRespondidasTotales + datos.totalPreguntas, // histórico
      ultimaActividad: new Date(),
    });
  }

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
     ACTUALIZAR ESTADISTICAS PREGUNTAS
  ========================================================= */
  for (const detalle of datos.detallePreguntas) {
    if (!detalle.preguntaId) continue;

    const pregunta = await this.preguntaRepo.findOne({
      where: { id: detalle.preguntaId },
    });

    if (!pregunta) continue;

    await this.preguntaRepo.update(
      pregunta.id,
      {
        vecesUsada: pregunta.vecesUsada + 1,
        aciertos: detalle.correcta
          ? pregunta.aciertos + 1
          : pregunta.aciertos,
        fallos: detalle.correcta
          ? pregunta.fallos
          : pregunta.fallos + 1,
      },
    );
  }

  /* =========================================================
     PUNTOS (si quieres excluir el primer reto, lo hacemos aquí)
  ========================================================= */
  if (datos.tipoTest !== 'primer_reto') {
  await this.actualizarPuntos(
    datos.usuarioId,
    datos.totalPreguntas,
    datos.correctas,
    porcentaje,
  );
}

  return resultado;
}


  /* =========================================================
     PUNTOS Y NIVELES
  ========================================================= */

 private async actualizarPuntos(
  usuarioId: string,
  numPreguntas: number,
  correctas: number,
  porcentaje: number,
): Promise<void> {
  const puntosAcciones = await this.configuracionService.getPuntosAcciones();

  const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
  if (!usuario) return;

  // Puntos por preguntas correctas
  let puntosGanados = correctas * puntosAcciones.preguntaCorrecta;

  // Bonus por porcentaje
  if (porcentaje >= 80) {
    puntosGanados += puntosAcciones.testCompletadoMas80;
  } else if (porcentaje >= 60) {
    puntosGanados += puntosAcciones.testCompletadoMas60;
  }

  if (puntosGanados === 0) return;

  const nuevosPuntos = usuario.puntos + puntosGanados;
  const nuevoNivel = await this.configuracionService.calcularNivelPorPuntos(nuevosPuntos);

  await this.usuarioRepo.update(usuarioId, {
    puntos: nuevosPuntos,
    nivel: nuevoNivel,
  });
}

  private calcularNivel(
    puntos: number,
  ): number {

    if (puntos >= 351) return 5;

    if (puntos >= 151) return 4;

    if (puntos >= 61) return 3;

    if (puntos >= 21) return 2;

    return 1;
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
): Promise<{ importadas: number; errores: string[] }> {

  // Obtener temas de la convocatoria
  const temas = await this.temaRepo.find({
    where: { convocatoria: { id: convocatoriaId } },
  });

  let importadas = 0;
  const errores: string[] = [];

  for (const p of preguntas) {
    const tema = temas.find(t => t.numero === p.temaNumero);

    if (!tema) {
      errores.push(`Tema ${p.temaNumero} no encontrado en esta convocatoria`);
      continue;
    }

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

    // Vincular al tema
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

  // Obtener artículos de la versión de ley
  const articulos = await this.articuloRepo.find({
    where: {
      capitulo: {
        tituloRef: {
          versionLey: { id: versionLeyId }
        }
      }
    },
    relations: ['capitulo', 'capitulo.tituloRef', 'capitulo.tituloRef.versionLey'],
  });

  let importadas = 0;
  const errores: string[] = [];

  for (const p of preguntas) {
    const articulo = articulos.find(a => a.numero === p.articuloNumero);

    if (!articulo) {
      errores.push(`Artículo ${p.articuloNumero} no encontrado en esta versión de ley`);
      continue;
    }

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
