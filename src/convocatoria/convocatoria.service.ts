import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Convocatoria, EstadoConvocatoria } from './convocatoria.entity';
import { DocumentoConvocatoria } from './documento-convocatoria.entity';
import { CreateConvocatoriaDto, UpdateConvocatoriaDto } from './convocatoria.dto';
import { Oposicion } from '../oposicion/oposicion.entity';
import { Tema } from '../tema/tema.entity';
import { NotaArticulo } from '../normativa/nota-articulo.entity';


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
  ) {}

  findByOposicion(oposicionId: string): Promise<Convocatoria[]> {
    return this.convocatoriaRepo.find({
      where: { oposicion: { id: oposicionId } },
      relations: ['documentos'],
      order: { anyo: 'DESC' },
    });
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
    referenciaBoe: dto.referenciaBoe,
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
  await this.convocatoriaRepo.update(id, dto);
  const convocatoria = await this.findOne(id);
  await this.actualizarEstadoOposicion((convocatoria.oposicion as any).id);
  return convocatoria;
  }

  async remove(id: string): Promise<void> {
  // Borrar documentos asociados
  await this.documentoRepo.delete({ convocatoria: { id } as any });

  // Borrar temas asociados (si los hay)
  await this.temaRepo.delete({ convocatoria: { id } as any });

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

  // Crear nueva convocatoria con los mismos datos
  const nueva = await this.convocatoriaRepo.save(this.convocatoriaRepo.create({
    anyo: original.anyo + 1,
    plazas: original.plazas,
    estado: 'borrador' as any,
    urlInap: original.urlInap,
    numEjercicios: original.numEjercicios,
    tipoEjercicio: original.tipoEjercicio,
    numPreguntas: original.numPreguntas,
    tiempoMinutos: original.tiempoMinutos,
    penalizacion: original.penalizacion,
    fraccionPenalizacion: original.fraccionPenalizacion,
    notaMinimaAprobado: original.notaMinimaAprobado,
    oposicion: { id: original.oposicion.id } as any,
  }));

  // Copiar temas
  const temas = await this.temaRepo.find({
    where: { convocatoria: { id } },
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
    }));
    mapaTemasViejoNuevo[tema.id] = nuevoTema.id;
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
}