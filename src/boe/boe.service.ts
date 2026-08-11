import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoeConvocatoria, EstadoBOE } from './boe.entity';
import { Oposicion } from '../oposicion/oposicion.entity';
import { Convocatoria } from '../convocatoria/convocatoria.entity';
import axios from 'axios';
import { ClaudeService } from '../ia/claude.service';
import { Tema } from '../tema/tema.entity';

@Injectable()
export class BoeService {
  constructor(
    @InjectRepository(BoeConvocatoria)
    private readonly boeRepo: Repository<BoeConvocatoria>,
    @InjectRepository(Oposicion)
    private readonly oposicionRepo: Repository<Oposicion>,
    @InjectRepository(Convocatoria)
    private readonly convocatoriaRepo: Repository<Convocatoria>,
    private readonly claudeService: ClaudeService,
    @InjectRepository(Tema)
    private readonly temaRepo: Repository<Tema>,
  ) {}

async consultarFecha(fecha: string): Promise<any[]> {
  try {
    const url = `https://www.boe.es/datosabiertos/api/boe/sumario/${fecha}`;
    const res = await axios.get(url, {
      headers: { Accept: 'application/json' },
    });

    const diario = res.data?.data?.sumario?.diario;
    if (!diario) return [];

    const dias = Array.isArray(diario) ? diario : [diario];
    const convocatorias: any[] = [];

    for (const dia of dias) {
      const secciones = Array.isArray(dia.seccion) ? dia.seccion : [dia.seccion];

      // Buscar sección II — código '2'
      const seccionII = secciones.find((s: any) => s?.codigo === '2B');
      
      if (!seccionII) continue;

      const departamentos = Array.isArray(seccionII.departamento)
        ? seccionII.departamento
        : [seccionII.departamento];

      for (const dep of departamentos) {
  if (!dep) continue;

  // Filtrar administración local
  const nombreDep = dep.nombre?.toLowerCase() ?? '';
  if (nombreDep.includes('administración local') || nombreDep.includes('administracion local')) continue;

  const epigrafes = Array.isArray(dep.epigrafe) ? dep.epigrafe : [dep.epigrafe];

  for (const epigrafe of epigrafes) {
    if (!epigrafe) continue;

    // Filtrar epígrafes que contengan "concurso"
    const nombreEpigrafe = epigrafe.nombre?.toLowerCase() ?? '';
    if (nombreEpigrafe.includes('concurso') || nombreEpigrafe.includes('libre designación') || nombreEpigrafe.includes('libre designacion')) continue;

    const items = Array.isArray(epigrafe.item) ? epigrafe.item : [epigrafe.item];
    for (const item of items) {
      if (!item) continue;
     // Filtrar títulos con "relación"
       const tituloItem = item.titulo?.toLowerCase() ?? '';
  if (tituloItem.includes('relación') || tituloItem.includes('relacion') || tituloItem.includes('concurso') || tituloItem.includes('universidad')) continue;
      convocatorias.push({
        referenciaBOE: item.identificador ?? '',
        titulo: item.titulo ?? '',
        urlPdf: item.url_pdf?.texto ?? '',
        urlHtml: item.url_html ?? '',
        departamento: dep.nombre ?? '',
        epigrafe: epigrafe.nombre ?? '',
        fechaBOE: fecha,
      });
    }
  }
}
    }

    return convocatorias;
  } catch (e) {
    throw new HttpException(`Error consultando BOE: ${e.message}`, 500);
  }
}

  async guardarConvocatoria(datos: {
    fechaBOE: string;
    referenciaBOE: string;
    titulo: string;
    urlPdf: string;
    urlHtml: string;
    departamento: string;
  }): Promise<BoeConvocatoria> {
    // Verificar si ya existe
    const existente = await this.boeRepo.findOne({
      where: { referenciaBOE: datos.referenciaBOE },
    });
    if (existente) return existente;

    return this.boeRepo.save(this.boeRepo.create({
      ...datos,
      estado: EstadoBOE.PENDIENTE,
    }));
  }

  async getPendientes(): Promise<BoeConvocatoria[]> {
    return this.boeRepo.find({
      where: { estado: EstadoBOE.PENDIENTE },
      order: { creadoEn: 'DESC' },
    });
  }

  async aprobar(id: string): Promise<BoeConvocatoria> {
  await this.boeRepo.update(id, { estado: EstadoBOE.APROBADA });
  return this.boeRepo.findOne({ where: { id } }) as Promise<BoeConvocatoria>;
}

  async rechazar(id: string, notas?: string): Promise<BoeConvocatoria> {
  await this.boeRepo.update(id, { estado: EstadoBOE.RECHAZADA, notas });
  return this.boeRepo.findOne({ where: { id } }) as Promise<BoeConvocatoria>;
}

  async guardarDatosExtraidos(id: string, datos: any): Promise<BoeConvocatoria> {
  await this.boeRepo.update(id, { datosExtraidos: datos });
  return this.boeRepo.findOne({ where: { id } }) as Promise<BoeConvocatoria>;
}

  async getAll(): Promise<BoeConvocatoria[]> {
    return this.boeRepo.find({ order: { creadoEn: 'DESC' } });
  }

  //EXTRAERDATOSPDFBOE
async extraerDatosPDF(id: string): Promise<any> {
  console.log('Extrayendo datos PDF para:', id);
  const convocatoria = await this.boeRepo.findOne({ where: { id } });
  if (!convocatoria) throw new HttpException('Convocatoria no encontrada', 404);
try {
  const pdfRes = await axios.get(convocatoria.urlPdf, { responseType: 'arraybuffer' });
  console.log('PDF descargado, tamaño:', pdfRes.data.byteLength);
  const pdfBuffer = Buffer.from(pdfRes.data);
  const pdfParse = require('pdf-parse');
  const pdfData = await pdfParse(pdfBuffer);
  console.log('PDF parseado, texto:', pdfData.text.slice(0, 100));
  const texto = pdfData.text.slice(0, 5000);

  const prompt = `Del siguiente texto de una resolución del BOE español extrae los datos de TODOS los cuerpos convocados.
  
Devuelve SOLO un JSON array con este formato:
[
  {
    "nombreOposicion": "nombre completo del cuerpo",
    "subgrupo": "A1|A2|C1|C2|E",
    "turno": "libre|promocion_interna",
    "plazas": número o null,
    "administracion": "AGE|CCAA|Local",
    "ministerio": "nombre del ministerio"
  }
]

Si solo hay un cuerpo devuelve un array con un solo elemento.
No incluyas texto adicional, solo el JSON.

TEXTO:
${texto}`;

  const cuerpos = await this.claudeService.chatJson<any[]>(prompt);
  console.log('Cuerpos detectados:', cuerpos);
  // Guardar el primer cuerpo como datos extraídos por defecto
  const datosPrincipales = cuerpos[0] ?? {};
  await this.boeRepo.update(id, { 
    datosExtraidos: { ...datosPrincipales, cuerpos } 
  });

   return { cuerpos, datos: datosPrincipales };
} catch (e) {
    console.error('Error en extraerDatosPDF:', e.message);
    throw new HttpException(`Error: ${e.message}`, 500);
    
  }
 
}

//TAREAS PENDIENTES PARA EL ADMIN
async getTareasPendientes(): Promise<any> {
  const boesPendientes = await this.boeRepo.count({
    where: { estado: EstadoBOE.PENDIENTE },
  });

  const convocatoriasSinInap = await this.convocatoriaRepo
    .createQueryBuilder('c')
    .leftJoinAndSelect('c.oposicion', 'o')
    .where('(c.urlInap IS NULL OR c.urlInap = :empty)', { empty: '' })
    .andWhere('c.estado = :estado', { estado: 'activa' })
    .getMany();

  const oposicionesSinTemas = await this.oposicionRepo
    .createQueryBuilder('o')
    .leftJoin('o.convocatorias', 'c')
    .leftJoin('c.temas', 't')
    .where('o.activa = true')
    .andWhere('t.id IS NULL')
    .select(['o.id', 'o.nombre'])
    .getMany();

  return {
    boesPendientes,
    convocatoriasSinInap: convocatoriasSinInap.map((c) => ({
      id: c.id,
      anyo: c.anyo,
      oposicionId: (c.oposicion as any)?.id,
      oposicionNombre: (c.oposicion as any)?.nombre,
    })),
    oposicionesSinTemas: oposicionesSinTemas.map((o) => ({
      id: o.id,
      nombre: o.nombre,
    })),
    total: boesPendientes + convocatoriasSinInap.length + oposicionesSinTemas.length,
  };
}

async extraerTemarioYCaracteristicas(urlPdf: string): Promise<{
  temas: { numero: number; titulo: string }[];
  caracteristicas: {
    numEjercicios?: number;
    tipoEjercicio?: string;
    numPreguntas?: number;
    tiempoMinutos?: number;
    penalizacion?: boolean;
    fraccionPenalizacion?: string;
    notaMinimaAprobado?: number;
  };
}> {
  const pdfRes = await axios.get(urlPdf, { responseType: 'arraybuffer' });
  const pdfBuffer = Buffer.from(pdfRes.data);
  const pdfParse = require('pdf-parse');
  const pdfData = await pdfParse(pdfBuffer);
  const texto = pdfData.text.slice(0, 12000);

  const prompt = `Del siguiente texto de una resolución de convocatoria de oposiciones del BOE español extrae:

1. El programa/temario completo si existe
2. Las características del proceso selectivo

Devuelve SOLO este JSON:
{
  "temas": [
    { "numero": 1, "titulo": "Título exacto del tema 1" },
    { "numero": 2, "titulo": "Título exacto del tema 2" }
  ],
  "caracteristicas": {
    "numEjercicios": 1,
    "tipoEjercicio": "test|desarrollo|oral|practico|mixto",
    "numPreguntas": 100,
    "tiempoMinutos": 90,
    "penalizacion": true,
    "fraccionPenalizacion": "1/3",
    "notaMinimaAprobado": 5.0
  }
}

Si no encuentras temario devuelve "temas": [].
Si no encuentras alguna característica devuelve null para ese campo.
No incluyas texto adicional, solo el JSON.

TEXTO:
${texto}`;

  return await this.claudeService.chatJson<any>(prompt);
}

async compararTemarios(
  temasNuevos: { numero: number; titulo: string }[],
  temasAnteriores: { numero: number; titulo: string }[],
): Promise<{
  porcentajeCoincidencia: number;
  temasNuevos: string[];
  temasEliminados: string[];
  temasModificados: { anterior: string; nuevo: string }[];
  sonIguales: boolean;
}> {
  if (temasAnteriores.length === 0) {
    return {
      porcentajeCoincidencia: 0,
      temasNuevos: temasNuevos.map((t) => t.titulo),
      temasEliminados: [],
      temasModificados: [],
      sonIguales: false,
    };
  }

  const prompt = `Compara estos dos temarios de oposiciones españolas y devuelve SOLO un JSON con este formato:
{
  "porcentajeCoincidencia": 95,
  "temasNuevos": ["título de tema que aparece en nuevo pero no en anterior"],
  "temasEliminados": ["título de tema que aparece en anterior pero no en nuevo"],
  "temasModificados": [{ "anterior": "título anterior", "nuevo": "título nuevo" }]
}

Considera que dos temas son el mismo aunque tengan pequeñas diferencias de redacción.
Solo marca como modificado si el contenido ha cambiado significativamente.

TEMARIO ANTERIOR:
${temasAnteriores.map((t) => `${t.numero}. ${t.titulo}`).join('\n')}

TEMARIO NUEVO:
${temasNuevos.map((t) => `${t.numero}. ${t.titulo}`).join('\n')}`;

  const resultado = await this.claudeService.chatJson<any>(prompt);
  return {
    ...resultado,
    sonIguales: resultado.porcentajeCoincidencia >= 95 && resultado.temasNuevos.length === 0 && resultado.temasEliminados.length === 0,
  };
}


//PROCESAR CONVOCATORIA EXTRAIDA DEL BOE
async procesarConvocatoria(id: string, oposicionExistenteId?: string): Promise<{
  accion: string;
  oposicionId?: string;
  convocatoriaId?: string;
}> {
  const boe = await this.boeRepo.findOne({ where: { id } });
  if (!boe) throw new HttpException('No encontrada', 404);

  const datos = boe.datosExtraidos ?? {};
  let oposicion: Oposicion | null = null;

  if (oposicionExistenteId) {
    oposicion = await this.oposicionRepo.findOne({ where: { id: oposicionExistenteId } });
  }

  let convocatoria: Convocatoria | null = null;
  if (oposicion) {
    convocatoria = await this.convocatoriaRepo.save(this.convocatoriaRepo.create({
      anyo: datos.anyo ? parseInt(datos.anyo.toString()) : new Date().getFullYear(),
      plazas: datos.plazas,
      estado: 'borrador' as any,
      referenciaBoe: boe.referenciaBOE,
      oposicion: { id: oposicion.id } as any,
    }));
    await this.oposicionRepo.update(oposicion.id, { activa: true });
  }

  await this.boeRepo.update(id, { estado: EstadoBOE.PROCESADA });

  return {
    accion: oposicion ? 'convocatoria_creada' : 'solo_aprobada',
    oposicionId: oposicion?.id,
    convocatoriaId: convocatoria?.id,
  };
}
}