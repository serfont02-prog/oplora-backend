import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Articulo } from './articulo.entity';
import { Capitulo } from './capitulo.entity';
import { Titulo } from './titulo.entity';
import { VersionLey } from '../ley/version-ley.entity';
import { PreguntaCorta } from './pregunta-corta.entity';
import { Flashcard } from '../flashcard/flashcard.entity';
import { PreguntaBanco } from '../tema/pregunta-banco.entity';
import { NotaArticulo } from './nota-articulo.entity';
import { SubrayadoArticulo } from './subrayado-articulo.entity';

import { NotificacionService } from '../notificacion/notificacion.service';
import { TipoNotificacion, PrioridadNotificacion } from '../notificacion/notificacion.entity';

@Injectable()
export class NormativaService {
  constructor(
    @InjectRepository(Articulo)
    private readonly articuloRepo: Repository<Articulo>,
    @InjectRepository(Capitulo)
    private readonly capituloRepo: Repository<Capitulo>,
    @InjectRepository(Titulo)
    private readonly tituloRepo: Repository<Titulo>,
    @InjectRepository(VersionLey)
    private readonly versionLeyRepo: Repository<VersionLey>,
    @InjectRepository(PreguntaCorta)
    private readonly preguntaCortaRepo: Repository<PreguntaCorta>,
    @InjectRepository(Flashcard)
    private readonly flashcardRepo: Repository<Flashcard>,
    @InjectRepository(PreguntaBanco)
    private readonly preguntaBancoRepo: Repository<PreguntaBanco>,
    @InjectRepository(NotaArticulo)
    private readonly notaRepo: Repository<NotaArticulo>,
    @InjectRepository(SubrayadoArticulo)
    private readonly subrayadoRepo: Repository<SubrayadoArticulo>,
    private readonly notificacionService: NotificacionService,
  ) {}

  async importarEstructura(datos: {
    versionLeyId: string;
    titulos: {
      numero: string;
      nombre: string;
      orden: number;
      capitulos: {
        numero: string;
        nombre: string;
        orden: number;
        articulos: {
          numero: string;
          titulo?: string;
          contenido: string;
          orden: number;
        }[];
      }[];
    }[];
  }): Promise<{ titulos: number; capitulos: number; articulos: number }> {
    let totalTitulos = 0;
    let totalCapitulos = 0;
    let totalArticulos = 0;

    for (const tituloData of datos.titulos) {
      const titulo = await this.tituloRepo.save(
        this.tituloRepo.create({
          numero: tituloData.numero,
          nombre: tituloData.nombre,
          orden: tituloData.orden,
          versionLey: { id: datos.versionLeyId } as any,
        })
      );
      totalTitulos++;

      for (const capData of tituloData.capitulos) {
        const capitulo = await this.capituloRepo.save(
          this.capituloRepo.create({
            numero: capData.numero,
            nombre: capData.nombre,
            orden: capData.orden,
            tituloRef: { id: titulo.id } as any,
          })
        );
        totalCapitulos++;

        for (const artData of capData.articulos) {
          await this.articuloRepo.save(
            this.articuloRepo.create({
              numero: artData.numero,
              titulo: artData.titulo,
              contenido: artData.contenido,
              orden: artData.orden,
              vigente: true,
              capitulo: { id: capitulo.id } as any,
            })
          );
          totalArticulos++;
        }
      }
    }

    return { titulos: totalTitulos, capitulos: totalCapitulos, articulos: totalArticulos };
  }

  async importarArticulos(
    articulos: { numero: string; titulo?: string; contenido: string }[],
    capituloId: string,
  ): Promise<{ importados: number }> {
    for (let i = 0; i < articulos.length; i++) {
      const art = articulos[i];
      await this.articuloRepo.save(
        this.articuloRepo.create({
          numero: art.numero,
          titulo: art.titulo,
          contenido: art.contenido,
          orden: i + 1,
          vigente: true,
          capitulo: { id: capituloId } as any,
        })
      );
    }
    return { importados: articulos.length };
  }

 async importarContenidoIA(contenido: {
  numeroArticulo: string;
  versionLeyId: string;
  explicacion?: string;
  esquema?: string;
  ejemplo?: string;
  preguntas?: {
    enunciado: string;
    opciones: string[];
    correcta: number;
    explicacion?: string;
  }[];
  flashcards?: {
    tipo: string;
    nivel: string;
    pregunta: string;
    respuesta: string;
    explicacion?: string;
  }[];
  preguntasCortas?: {
    pregunta: string;
    respuesta: string;
  }[];
}[]): Promise<{ actualizados: number; preguntas: number; flashcards: number; preguntasCortas: number }> {
  let actualizados = 0;
  let totalPreguntas = 0;
  let totalFlashcards = 0;
  let totalPreguntasCortas = 0;

  for (const item of contenido) {
    // Buscar artículo
    const articulo = await this.articuloRepo
      .createQueryBuilder('a')
      .leftJoin('a.capitulo', 'c')
      .leftJoin('c.tituloRef', 't')
      .leftJoin('a.tituloRef', 'tr')
      .where('a.numero = :numero', { numero: item.numeroArticulo })
      .andWhere('(t.versionLey = :vId OR tr.versionLey = :vId)', { vId: item.versionLeyId })
      .getOne();

    if (!articulo) continue;

    // Actualizar campos del artículo
    await this.articuloRepo.update(articulo.id, {
      resumen: item.explicacion,
      esquema: item.esquema,
      ejemplo: item.ejemplo,
    });
    actualizados++;

    // Importar preguntas al banco
    if (item.preguntas?.length) {
      for (const p of item.preguntas) {
        await this.preguntaBancoRepo.save(
          this.preguntaBancoRepo.create({
            enunciado: p.enunciado,
            opciones: p.opciones,
            correcta: p.correcta,
            explicacion: p.explicacion,
            articulo: { id: articulo.id } as any,
          })
        );
        totalPreguntas++;
      }
    }

    // Importar flashcards
    if (item.flashcards?.length) {
      for (const fc of item.flashcards) {
        await this.flashcardRepo.save(
          this.flashcardRepo.create({
            tipo: fc.tipo as any,
            nivel: fc.nivel as any,
            pregunta: fc.pregunta,
            respuesta: fc.respuesta,
            explicacion: fc.explicacion,
            esParaDuelo: fc.tipo === 'vf' || fc.tipo === 'articulo',
            articulo: { id: articulo.id } as any,
            creadaPor: 'admin',
          })
        );
        totalFlashcards++;
      }
    }

    // Importar preguntas cortas
    if (item.preguntasCortas?.length) {
      for (const pc of item.preguntasCortas) {
        await this.preguntaCortaRepo.save(
          this.preguntaCortaRepo.create({
            pregunta: pc.pregunta,
            respuesta: pc.respuesta,
            articulo: { id: articulo.id } as any,
          })
        );
        totalPreguntasCortas++;
      }
    }
  }

  return { actualizados, preguntas: totalPreguntas, flashcards: totalFlashcards, preguntasCortas: totalPreguntasCortas };
}

  async importarArticulosEnTitulo(
  articulos: { numero: string; titulo?: string; contenido: string }[],
  tituloId: string,
): Promise<{ importados: number }> {
  for (let i = 0; i < articulos.length; i++) {
    const art = articulos[i];
    await this.articuloRepo.save(
      this.articuloRepo.create({
        numero: art.numero,
        titulo: art.titulo,
        contenido: art.contenido,
        orden: i + 1,
        vigente: true,
        tituloRef: { id: tituloId } as any,
      })
    );
  }
  return { importados: articulos.length };
}

async getNota(usuarioId: string, articuloId: string): Promise<NotaArticulo | null> {
  return this.notaRepo.findOne({
    where: { usuario: { id: usuarioId }, articulo: { id: articuloId } },
  });
}

async guardarNota(usuarioId: string, articuloId: string, contenido: string): Promise<NotaArticulo> {
  let nota = await this.notaRepo.findOne({
    where: { usuario: { id: usuarioId }, articulo: { id: articuloId } },
  });
  if (nota) {
    await this.notaRepo.update(nota.id, { contenido });
    return this.notaRepo.findOne({ where: { id: nota.id } }) as Promise<NotaArticulo>;
  }
  return this.notaRepo.save(this.notaRepo.create({
    contenido,
    usuario: { id: usuarioId } as any,
    articulo: { id: articuloId } as any,
  }));
}

async getSubrayados(usuarioId: string, articuloId: string): Promise<SubrayadoArticulo[]> {
  return this.subrayadoRepo.find({
    where: { usuario: { id: usuarioId }, articulo: { id: articuloId } },
    order: { inicio: 'ASC' },
  });
}

async crearSubrayado(
  usuarioId: string,
  articuloId: string,
  inicio: number,
  fin: number,
  textoSeleccionado: string,
  color: string = 'amarillo',
): Promise<SubrayadoArticulo> {
  return this.subrayadoRepo.save(this.subrayadoRepo.create({
    inicio,
    fin,
    textoSeleccionado,
    color,
    usuario: { id: usuarioId } as any,
    articulo: { id: articuloId } as any,
  }));
}

async borrarSubrayado(id: string, usuarioId: string): Promise<void> {
  await this.subrayadoRepo.delete({ id, usuario: { id: usuarioId } });
}

async buscarArticulos(versionLeyId: string, q: string): Promise<Articulo[]> {
  if (!q || q.trim().length < 1) return [];

  return this.articuloRepo
    .createQueryBuilder('a')
    .leftJoin('a.capitulo', 'c')
    .leftJoin('c.tituloRef', 't')
    .leftJoin('a.tituloRef', 'tr')
    .where('(t.versionLey = :vId OR tr.versionLey = :vId)', { vId: versionLeyId })
    .andWhere('a.vigente = true')
    .andWhere(
      '(a.numero ILIKE :q OR a.contenido ILIKE :qWild OR a.titulo ILIKE :qWild)',
      { q: q.trim(), qWild: `%${q.trim()}%` }
    )
    .orderBy(
      `CASE WHEN a.numero = :qExact THEN 0 ELSE 1 END`,
      'ASC'
    )
    .addOrderBy('a.orden', 'ASC')
    .setParameter('qExact', q.trim())
    .limit(20)
    .getMany();
}

async getNotaTema(usuarioId: string, temaId: string): Promise<NotaArticulo | null> {
  return this.notaRepo.findOne({
    where: { usuario: { id: usuarioId }, tema: { id: temaId } } as any,
  });
}

async guardarNotaTema(usuarioId: string, temaId: string, contenido: string): Promise<NotaArticulo> {
  let nota = await this.notaRepo.findOne({
    where: { usuario: { id: usuarioId }, tema: { id: temaId } } as any,
  });
  if (nota) {
    await this.notaRepo.update(nota.id, { contenido });
    return this.notaRepo.findOne({ where: { id: nota.id } }) as Promise<NotaArticulo>;
  }
  return this.notaRepo.save(this.notaRepo.create({
    contenido,
    usuario: { id: usuarioId } as any,
    tema: { id: temaId } as any,
  }));
}

async programarRepasoTema(usuarioId: string, temaId: string, fecha: Date): Promise<void> {
  let nota = await this.notaRepo.findOne({
    where: { usuario: { id: usuarioId }, tema: { id: temaId } } as any,
  });

  if (!nota) {
    nota = await this.notaRepo.save(this.notaRepo.create({
      usuario: { id: usuarioId } as any,
      tema: { id: temaId } as any,
      contenido: '',
    }));
  }

  await this.notaRepo.update(nota.id, { fechaRepaso: fecha });

  // Crear notificación programada
  await this.notificacionService.crear({
    usuarioId,
    tipo: TipoNotificacion.RETO_DIARIO,
    titulo: '📅 Repaso programado',
    mensaje: `Tienes programado repasar un tema hoy`,
    prioridad: PrioridadNotificacion.MEDIA,
    urlAccion: `/app/tema`,
  });
}

async getRepasosProgramados(usuarioId: string): Promise<any[]> {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);

  return this.notaRepo
    .createQueryBuilder('n')
    .leftJoinAndSelect('n.tema', 't')
    .where('n.usuario = :usuarioId', { usuarioId })
    .andWhere('n.fechaRepaso >= :hoy', { hoy })
    .andWhere('n.fechaRepaso < :manana', { manana })
    .getMany();
}

//Buscar numero articulo para los apuntes
async buscarArticuloPorNumero(versionLeyId: string, numero: string): Promise<Articulo | null> {
  return this.articuloRepo
    .createQueryBuilder('a')
    .leftJoin('a.capitulo', 'c')
    .leftJoin('c.tituloRef', 't')
    .leftJoin('a.tituloRef', 'tr')
    .where('a.numero = :numero', { numero })
    .andWhere('(t.versionLey = :vId OR tr.versionLey = :vId)', { vId: versionLeyId })
    .andWhere('a.vigente = true')
    .getOne();
}
}