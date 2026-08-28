import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tema } from './tema.entity';
import { TemaNormativa } from './tema-normativa.entity';
import { Articulo } from '../normativa/articulo.entity';
import { ExamenAnterior } from './examen-anterior.entity';
import { PreguntaTest } from '../test/pregunta-test.entity';
import { NivelNormativa } from './tema-normativa.entity';
import { ApunteOploraService } from '../apunte-oplora/apunte-oplora.service';
import { FlashcardService } from '../flashcard/flashcard.service';
import { TestService } from '../test/test.service';
import { ApunteOplora } from '../apunte-oplora/apunte-oplora.entity'; // ajusta la ruta si tu archivo está en otra carpeta

@Injectable()
export class TemaService {
  constructor(
    @InjectRepository(Tema)
    private readonly temaRepo: Repository<Tema>,
    @InjectRepository(TemaNormativa)
    private readonly temaNormativaRepo: Repository<TemaNormativa>,
    @InjectRepository(Articulo)
    private readonly articuloRepo: Repository<Articulo>,
    @InjectRepository(ExamenAnterior)
    private readonly examenRepo: Repository<ExamenAnterior>,
    @InjectRepository(PreguntaTest)
    private readonly preguntaTestRepo: Repository<PreguntaTest>,
    private readonly apunteOploraService: ApunteOploraService,
    private readonly flashcardService: FlashcardService,
    private readonly testService: TestService,
    @InjectRepository(ApunteOplora)
    private readonly apunteOploraRepo: Repository<ApunteOplora>,
  ) {}

  async findByConvocatoria(convocatoriaId: string): Promise<Tema[]> {
  return this.temaRepo.find({
    where: { convocatoria: { id: convocatoriaId } },
    order: { numero: 'ASC' },
    relations: [
      'normativas',
      'normativas.articulo',
      'normativas.articulo.capitulo',
      'normativas.articulo.capitulo.tituloRef',
      'normativas.articulo.capitulo.tituloRef.versionLey',
      'normativas.articulo.capitulo.tituloRef.versionLey.ley',
    ],
  });
  }

  async findByOposicion(oposicionId: string): Promise<Tema[]> {
    return this.temaRepo
      .createQueryBuilder('tema')
      .leftJoin('tema.convocatoria', 'conv')
      .leftJoin('conv.oposicion', 'op')
      .where('op.id = :oposicionId', { oposicionId })
      .orderBy('tema.numero', 'ASC')
      .getMany();
  }

  async findOne(id: string): Promise<Tema> {
    const tema = await this.temaRepo.findOne({ where: { id } });
    if (!tema) throw new NotFoundException('Tema no encontrado');
    return tema;
  }

    async create(body: any): Promise<Tema> {
      const { convocatoriaId, ...resto } = body;

      const tema = this.temaRepo.create({
        ...resto,
        convocatoria: convocatoriaId ? { id: convocatoriaId } as any : undefined,
      } as Partial<Tema>); 

      return this.temaRepo.save(tema);
    }

  async update(id: string, body: any): Promise<Tema> {
    await this.temaRepo.update(id, body);
    const actualizado = await this.temaRepo.findOne({ where: { id } });
    if (!actualizado) throw new NotFoundException('Tema no encontrado');
    return actualizado;
  }

  async remove(id: string) {
  await this.temaNormativaRepo.delete({ tema: { id } as any });
  await this.apunteOploraRepo.delete({ tema: { id } as any });
  return this.temaRepo.delete(id);
}

  async getNormativa(temaId: string): Promise<TemaNormativa[]> {
    return this.temaNormativaRepo.find({
      where: { tema: { id: temaId } },
      relations: [
        'articulo',
        'articulo.capitulo',
        'articulo.capitulo.tituloRef',
        'articulo.capitulo.tituloRef.versionLey',
        'articulo.capitulo.tituloRef.versionLey.ley',
        'articulo.tituloRef',
        'articulo.tituloRef.versionLey',
        'articulo.tituloRef.versionLey.ley',
      ],
    });
  }

  async vincularArticulo(temaId: string, articuloId: string) {
    const existing = await this.temaNormativaRepo.findOne({
      where: {
        tema: { id: temaId },
        articulo: { id: articuloId },
      },
    });
    if (existing) return existing;

    const vinculo = this.temaNormativaRepo.create({
      tema: { id: temaId } as any,
      articulo: { id: articuloId } as any,
    });
    return this.temaNormativaRepo.save(vinculo);
  }

  async desvincularArticulo(temaId: string, articuloId: string) {
    const vinculo = await this.temaNormativaRepo.findOne({
      where: {
        tema: { id: temaId },
        articulo: { id: articuloId },
      },
    });
    if (!vinculo) throw new NotFoundException('Vínculo no encontrado');
    return this.temaNormativaRepo.remove(vinculo);
  }

  
  async desvincularNormativa(temaNormativaId: string) {
    await this.temaNormativaRepo.delete(temaNormativaId);
  }
  


  

  async getExamenesByConvocatoria(convocatoriaId: string) {
    return this.examenRepo.find({
      where: { convocatoria: { id: convocatoriaId } } as any,
      order: { anyo: 'DESC', creadoEn: 'DESC' },
    });
  }

  async getExamenesByTema(temaId: string) {
    const tema = await this.temaRepo.findOne({
      where: { id: temaId },
      relations: ['convocatoria'],
    });
    if (!tema?.convocatoria) return [];
    return this.examenRepo.find({
      where: { convocatoria: { id: tema.convocatoria.id } } as any,
      order: { anyo: 'DESC' },
    });
  }

  async programarRepasoArticulo(
    usuarioId: string,
    articuloId: string,
    cuando: 'hoy' | 'manana' | 'semana',
  ) {
    const dias = cuando === 'hoy' ? 0 : cuando === 'manana' ? 1 : 7;
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);

    return {
      programado: true,
      fecha,
      articuloId,
      usuarioId,
    };
  }

  async sugerirRepasoArticulo(
    usuarioId: string,
    articuloId: string,
    oposicionId: string,
  ) {
    return {
      sugerencia: 'manana',
      articuloId,
      usuarioId,
      oposicionId,
    };
  }
  
    async vincularNormativa(temaId: string, datos: {
    nivel: string;
    articuloId?: string;
    capituloId?: string;
    tituloId?: string;
    versionLeyId?: string;
  }) {
    // Verificar si ya existe el mismo vínculo
    if (datos.articuloId) {
      const existing = await this.temaNormativaRepo.findOne({
        where: { tema: { id: temaId }, articulo: { id: datos.articuloId } },
      });
      if (existing) return existing;
    }

    const tn = this.temaNormativaRepo.create({
      tema: { id: temaId } as any,
      nivel: datos.nivel as any,
      articulo: datos.articuloId ? { id: datos.articuloId } as any : undefined,
      capitulo: datos.capituloId ? { id: datos.capituloId } as any : undefined,
      titulo: datos.tituloId ? { id: datos.tituloId } as any : undefined,
      versionLey: datos.versionLeyId ? { id: datos.versionLeyId } as any : undefined,
    });
    return this.temaNormativaRepo.save(tn);
  }

  async getProgresoCompleto(usuarioId: string, temaId: string, oposicionId: string) {
  // 1. LECTURA (50%) — promedio del % leído de apuntes OPLORA del tema
  const apuntesOplora = await this.apunteOploraService.findByTema(temaId);

  let porcentajeLectura = 0;
  if (apuntesOplora.length > 0) {
    const progresos = await Promise.all(
      apuntesOplora.map(async (ap) => {
        const prog = await this.apunteOploraService.getProgreso(usuarioId, ap.id);
        return prog?.porcentaje ?? 0;
      })
    );
    porcentajeLectura = Math.round(progresos.reduce((a, b) => a + b, 0) / progresos.length);
  }
  const puntosLectura = Math.round((porcentajeLectura / 100) * 50);

  // 2. TEST (25%) — % preguntas hechas + % acierto
  const progresoTest = await this.testService.getProgresoTema(usuarioId, oposicionId, temaId);
  const totalPreguntasTema = await this.getTotalPreguntasDelTema(temaId);

  const pctPreguntasHechas = totalPreguntasTema > 0
    ? (progresoTest.total / totalPreguntasTema) * 100
    : 0;
  const pctAcierto = progresoTest.porcentajeAcierto ?? 0;

  let puntosTest = 0;
  if (pctPreguntasHechas >= 75) {
    puntosTest = pctAcierto >= 80 ? 25 : pctAcierto >= 60 ? 18 : 10;
  } else if (pctPreguntasHechas >= 50) {
    puntosTest = pctAcierto >= 80 ? 20 : pctAcierto >= 60 ? 15 : 8;
  } else if (pctPreguntasHechas >= 25) {
    puntosTest = pctAcierto >= 80 ? 12 : pctAcierto >= 60 ? 8 : 4;
  }

  // 3. FLASHCARDS (25%) — % dominadas
  const statsFC = await this.flashcardService.getEstadisticasFCTema(usuarioId, oposicionId, temaId);
  const pctDominadas = statsFC.total > 0 ? (statsFC.dominadas / statsFC.total) * 100 : 0;

  let puntosFlashcards = 0;
  if (pctDominadas >= 80) puntosFlashcards = 25;
  else if (pctDominadas >= 70) puntosFlashcards = 20;
  else if (pctDominadas >= 60) puntosFlashcards = 15;
  else if (pctDominadas >= 40) puntosFlashcards = 8;

  const porcentajeTotal = puntosLectura + puntosTest + puntosFlashcards;

  return {
    porcentajeTotal,
    desglose: {
      lectura: { porcentaje: porcentajeLectura, puntos: puntosLectura },
      test: {
        pctPreguntasHechas: Math.round(pctPreguntasHechas),
        pctAcierto: Math.round(pctAcierto),
        puntos: puntosTest,
      },
      flashcards: {
        pctDominadas: Math.round(pctDominadas),
        puntos: puntosFlashcards,
      },
    },
  };
}

async getTotalPreguntasDelTema(temaId: string): Promise<number> {
  const temaNormativas = await this.temaNormativaRepo.find({
    where: { tema: { id: temaId }, nivel: NivelNormativa.ARTICULO },
    relations: ['articulo'],
  });

  const articuloIds = temaNormativas
    .map((tn) => tn.articulo?.id)
    .filter((id): id is string => !!id);

  if (articuloIds.length === 0) return 0;

  return this.preguntaTestRepo
    .createQueryBuilder('p')
    .leftJoin('p.articulos', 'art')
    .where('art.id IN (:...articuloIds)', { articuloIds })
    .andWhere('p.activa = true')
    .getCount();
}

  async getProgresoOposicion(usuarioId: string, oposicionId: string, convocatoriaId: string) {
  const temas = await this.temaRepo.find({
    where: { convocatoria: { id: convocatoriaId } },
  });

  if (temas.length === 0) {
    return { porcentajeGlobal: 0, temasCompletados: 0, totalTemas: 0 };
  }

  const progresos = await Promise.all(
    temas.map((t) => this.getProgresoCompleto(usuarioId, t.id, oposicionId))
  );

  const porcentajeGlobal = Math.round(
    progresos.reduce((acc, p) => acc + p.porcentajeTotal, 0) / temas.length
  );

  const temasCompletados = progresos.filter((p) => p.porcentajeTotal >= 80).length;

  return {
    porcentajeGlobal,
    temasCompletados,
    totalTemas: temas.length,
  };
}

async getProgresoCompletoConvocatoria(usuarioId: string, convocatoriaId: string, oposicionId: string) {
  const temas = await this.temaRepo.find({
    where: { convocatoria: { id: convocatoriaId } },
    order: { numero: 'ASC' },
  });

  const resultados = await Promise.all(
    temas.map(async (t) => {
      const progreso = await this.getProgresoCompleto(usuarioId, t.id, oposicionId);
      return { temaId: t.id, numero: t.numero, titulo: t.titulo, ...progreso };
    })
  );

  return resultados;
}



}