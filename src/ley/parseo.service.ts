import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VersionLey } from './version-ley.entity';
import { Titulo } from '../normativa/titulo.entity';
import { Capitulo } from '../normativa/capitulo.entity';
import { Articulo } from '../normativa/articulo.entity';
import { Seccion } from '../normativa/seccion.entity';
import { Libro } from '../normativa/libro.entity';
import { Disposicion } from '../normativa/disposicion.entity';
import { TipoCambio } from '../ley/version-ley.entity'; // ajusta la ruta si el enum está en otro archivo
import { NoticiaService } from '../noticia/noticia.service';
import { PreguntaTest } from '../test/pregunta-test.entity';

interface NodoParseado {
  tipo: 'libro' | 'titulo' | 'capitulo' | 'seccion' | 'articulo';
  numero?: string;
  nombre?: string;
  numeroArticulo?: string;
  tituloArticulo?: string;
  contenido?: string;
}

// Patrones típicos de textos legales españoles (mayúsculas, con o sin tildes)
const REGEX_LIBRO = /^LIBRO\s+([IVXLCDM]+|PRELIMINAR|\d+)\.?\s*[-–—]?\s*(.*)$/i;
const REGEX_TITULO = /^T[ÍI]TULO\s+([IVXLCDM]+|PRELIMINAR|\d+)\.?\s*[-–—]?\s*(.*)$/i;
const REGEX_CAPITULO = /^CAP[ÍI]TULO\s+([IVXLCDM]+|\d+)\.?\s*[-–—]?\s*(.*)$/i;
const REGEX_SECCION = /^SECCI[ÓO]N\s+([IVXLCDMª\d]+)\.?\s*[-–—]?\s*(.*)$/i;
const REGEX_ARTICULO = /^Art[íi]culo\s+(\d+(?:\.\d+)?)\.?\s*[-–—]?\s*(.*)$/i;

@Injectable()
export class ParseoService {
  private readonly logger = new Logger(ParseoService.name);

  constructor(
    @InjectRepository(VersionLey)
    private readonly versionRepo: Repository<VersionLey>,
    @InjectRepository(Titulo)
    private readonly tituloRepo: Repository<Titulo>,
    @InjectRepository(Capitulo)
    private readonly capituloRepo: Repository<Capitulo>,
    @InjectRepository(Articulo)
    private readonly articuloRepo: Repository<Articulo>,
    @InjectRepository(Seccion)
    private readonly seccionRepo: Repository<Seccion>,
    @InjectRepository(Libro)
    private readonly libroRepo: Repository<Libro>,
    @InjectRepository(Disposicion)
    private readonly disposicionRepo: Repository<Disposicion>,
    @InjectRepository(PreguntaTest)
    private readonly preguntaRepo: Repository<PreguntaTest>,
    private readonly noticiaService: NoticiaService,
  ) {}

  /**
   * ⭐ Copia el vínculo pregunta↔artículo (tabla intermedia M2M) del artículo
   * origen al artículo nuevo, SIN duplicar la fila de PreguntaTest — el mismo
   * patrón que usa Convocatoria al copiarse para vincular temas a preguntas ya
   * existentes. Así, al crear una nueva versión de una ley (ej. una reforma de
   * la CE), las preguntas ya redactadas para el artículo siguen sirviendo para
   * la nueva versión salvo que alguien las edite/retire manualmente.
   */
  private async copiarPreguntasDeArticulo(articuloOrigenId: string, articuloNuevoId: string): Promise<void> {
    // Vinculamos por SQL directo sobre la tabla intermedia real, igual que ya
    // hace convocatoria.service.ts con preguntas_test_temas_temas.
    const filas = await this.preguntaRepo.query(
      `SELECT "preguntasTestId" FROM preguntas_test_articulos_articulos WHERE "articulosId" = $1`,
      [articuloOrigenId],
    );
    for (const fila of filas) {
      await this.preguntaRepo.query(
        `INSERT INTO preguntas_test_articulos_articulos ("articulosId", "preguntasTestId") VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [articuloNuevoId, fila.preguntasTestId],
      );
    }
  }

  async parsearVersion(versionId: string): Promise<{ ok: boolean; resumen: any }> {
    const version = await this.versionRepo.findOne({
      where: { id: versionId },
      relations: ['ley'],
    });
    if (!version) throw new NotFoundException(`Versión ${versionId} no encontrada`);
    if (!version.textoCompleto) throw new Error('La versión no tiene texto extraído');

    this.logger.log(`Iniciando parseo (sin IA) de ${version.ley.nombre} v${version.version}`);

    // Limpiar estructura previa por si se reparsea
    await this.limpiarEstructuraAnterior(versionId);

    const nodos = this.parsearTextoARegex(version.textoCompleto);
    this.logger.log(`Detectados ${nodos.length} nodos estructurales`);

    const resumen = await this.guardarNodos(versionId, nodos);

    this.logger.log(`Parseo completado: ${JSON.stringify(resumen)}`);
    return { ok: true, resumen };
  }

private async limpiarEstructuraAnterior(versionId: string): Promise<void> {
  const titulos = await this.tituloRepo.find({ where: { versionLey: { id: versionId } as any } });
  for (const t of titulos) {
    // ⭐ borrar artículos que cuelgan directamente del título (sin capítulo)
    await this.articuloRepo.delete({ tituloRef: { id: t.id } as any });

    const capitulos = await this.capituloRepo.find({ where: { tituloRef: { id: t.id } as any } });
    for (const c of capitulos) {
      await this.articuloRepo.delete({ capitulo: { id: c.id } as any });

      const secciones = await this.seccionRepo.find({ where: { capitulo: { id: c.id } as any } });
      for (const s of secciones) {
        await this.articuloRepo.delete({ seccion: { id: s.id } as any });
      }

      await this.seccionRepo.delete({ capitulo: { id: c.id } as any });
    }
    await this.capituloRepo.delete({ tituloRef: { id: t.id } as any });
  }
  await this.tituloRepo.delete({ versionLey: { id: versionId } as any });
  // ⭐ borrar también los libros de esta versión (antes quedaban huérfanos al re-parsear)
  await this.libroRepo.delete({ versionLey: { id: versionId } as any });
  await this.disposicionRepo.delete({ versionLey: { id: versionId } as any });
}

  /**
   * Recorre el texto línea a línea detectando la jerarquía legal
   * (Libro > Título > Capítulo > Sección > Artículo) mediante patrones.
   */
  private parsearTextoARegex(texto: string): NodoParseado[] {
    const lineas = texto.split('\n').map((l) => l.trim()).filter(Boolean);
    const nodos: NodoParseado[] = [];

    let articuloActual: { numero: string; titulo?: string; lineas: string[] } | null = null;

    const flushArticulo = () => {
      if (!articuloActual) return;
      nodos.push({
        tipo: 'articulo',
        numeroArticulo: articuloActual.numero,
        tituloArticulo: articuloActual.titulo,
        contenido: articuloActual.lineas.join(' ').replace(/\s+/g, ' ').trim(),
      });
      articuloActual = null;
    };

    for (const linea of lineas) {
      const mLibro = linea.match(REGEX_LIBRO);
      if (mLibro) {
        flushArticulo();
        nodos.push({ tipo: 'libro', numero: mLibro[1], nombre: mLibro[2] || undefined });
        continue;
      }

      const mTitulo = linea.match(REGEX_TITULO);
      if (mTitulo) {
        flushArticulo();
        nodos.push({ tipo: 'titulo', numero: mTitulo[1], nombre: mTitulo[2] || undefined });
        continue;
      }

      const mCapitulo = linea.match(REGEX_CAPITULO);
      if (mCapitulo) {
        flushArticulo();
        nodos.push({ tipo: 'capitulo', numero: mCapitulo[1], nombre: mCapitulo[2] || undefined });
        continue;
      }

      const mSeccion = linea.match(REGEX_SECCION);
      if (mSeccion) {
        flushArticulo();
        nodos.push({ tipo: 'seccion', numero: mSeccion[1], nombre: mSeccion[2] || undefined });
        continue;
      }

      const mArticulo = linea.match(REGEX_ARTICULO);
      if (mArticulo) {
        flushArticulo();
        articuloActual = { numero: mArticulo[1], titulo: mArticulo[2] || undefined, lineas: [] };
        continue;
      }

      // Línea de contenido: se acumula en el artículo actual, si lo hay
      if (articuloActual) {
        articuloActual.lineas.push(linea);
      }
    }

    flushArticulo();
    return nodos;
  }

  /**
   * Recorre la lista lineal de nodos y va creando la jerarquía en BD,
   * manteniendo referencias al libro/título/capítulo/sección "actuales".
   */
  private async guardarNodos(versionId: string, nodos: NodoParseado[]): Promise<any> {
    let totalLibros = 0, totalTitulos = 0, totalCapitulos = 0, totalSecciones = 0, totalArticulos = 0;

    let libroActualId: string | null = null;
    let tituloActualId: string | null = null;
    let capituloActualId: string | null = null;
    let seccionActualId: string | null = null;

    let ordenLibro = 0, ordenTitulo = 0, ordenCapitulo = 0, ordenSeccion = 0, ordenArticulo = 0;

    for (const nodo of nodos) {
      if (nodo.tipo === 'libro') {
        const libro = this.libroRepo.create({
          orden: ++ordenLibro,
          numero: nodo.numero,
          nombre: nodo.nombre || `Libro ${nodo.numero}`,
          versionLey: { id: versionId } as any,
        } as any);
        const guardado = await this.libroRepo.save(libro);
        libroActualId = (guardado as any).id;
        tituloActualId = null;
        capituloActualId = null;
        seccionActualId = null;
        totalLibros++;
        continue;
      }

      if (nodo.tipo === 'titulo') {
        const titulo = this.tituloRepo.create({
          orden: ++ordenTitulo,
          numero: nodo.numero,
          nombre: nodo.nombre || `Título ${nodo.numero}`,
          versionLey: { id: versionId } as any,
          libro: libroActualId ? ({ id: libroActualId } as any) : undefined,
        });
        const guardado = await this.tituloRepo.save(titulo);
        tituloActualId = guardado.id;
        capituloActualId = null;
        seccionActualId = null;
        totalTitulos++;
        continue;
      }

      if (nodo.tipo === 'capitulo') {
        const capitulo = this.capituloRepo.create({
          orden: ++ordenCapitulo,
          numero: nodo.numero,
          nombre: nodo.nombre || `Capítulo ${nodo.numero}`,
          tituloRef: tituloActualId ? ({ id: tituloActualId } as any) : undefined,
        });
        const guardado = await this.capituloRepo.save(capitulo);
        capituloActualId = guardado.id;
        seccionActualId = null;
        totalCapitulos++;
        continue;
      }

      if (nodo.tipo === 'seccion') {
        const seccion = this.seccionRepo.create({
          orden: ++ordenSeccion,
          numero: nodo.numero,
          nombre: nodo.nombre || `Sección ${nodo.numero}`,
          capitulo: capituloActualId ? ({ id: capituloActualId } as any) : undefined,
        });
        const guardado = await this.seccionRepo.save(seccion);
        seccionActualId = guardado.id;
        totalSecciones++;
        continue;
      }

      if (nodo.tipo === 'articulo') {
        const articulo = this.articuloRepo.create({
          orden: ++ordenArticulo,
          numero: nodo.numeroArticulo,
          titulo: nodo.tituloArticulo || undefined,
          contenido: nodo.contenido || '',
          vigente: true,
          pesoExamen: 1,
          seccion: seccionActualId ? ({ id: seccionActualId } as any) : undefined,
          capitulo: !seccionActualId && capituloActualId ? ({ id: capituloActualId } as any) : undefined,
          tituloRef: !seccionActualId && !capituloActualId && tituloActualId ? ({ id: tituloActualId } as any) : undefined,
        } as any);
        await this.articuloRepo.save(articulo);
        totalArticulos++;
        continue;
      }
    }

    return { totalLibros, totalTitulos, totalCapitulos, totalSecciones, totalArticulos };
  }

    async importarEstructuraJson(versionId: string, estructura: { libros?: any[]; titulos?: any[]; disposiciones?: any[] }): Promise<any> {
    await this.limpiarEstructuraAnterior(versionId);

    let totalLibros = 0, totalTitulos = 0, totalCapitulos = 0, totalSecciones = 0, totalArticulos = 0, totalDisposiciones = 0;

    // Soporte opcional de libros (p.ej. Código Civil: Libro > Título > ...).
    // Si `estructura.libros` no viene, se mantiene el comportamiento anterior
    // (títulos colgando directamente de la versión, sin libro) para no romper
    // leyes ya importadas sin esta estructura (LOFCS, Ley 4/2015, LOPDGDD...).
    const gruposDeTitulos: { titulos: any[]; libroId?: string }[] = [];

    for (let li = 0; li < (estructura.libros ?? []).length; li++) {
      const lData = estructura.libros![li];
      // ⭐ El "as any" en el objeto de create() hace que TS no pueda inferir si save()
      // devuelve una entidad o un array (ambigüedad de sobrecarga), así que forzamos
      // el tipo del resultado explícitamente para poder acceder a `.id`.
      const libro = (await this.libroRepo.save(this.libroRepo.create({
        orden: li + 1,
        numero: lData.numero,
        nombre: lData.nombre,
        versionLey: { id: versionId } as any,
      } as any))) as unknown as Libro;
      totalLibros++;
      gruposDeTitulos.push({ titulos: lData.titulos ?? [], libroId: libro.id });
    }

    if (estructura.titulos && estructura.titulos.length > 0) {
      gruposDeTitulos.push({ titulos: estructura.titulos });
    }

    let ordenTituloGlobal = 0;
    for (const grupo of gruposDeTitulos) {
    for (let ti = 0; ti < grupo.titulos.length; ti++) {
      const tData = grupo.titulos[ti];
      const titulo = await this.tituloRepo.save(this.tituloRepo.create({
        orden: ++ordenTituloGlobal,
        numero: tData.numero,
        nombre: tData.nombre,
        versionLey: { id: versionId } as any,
        libro: grupo.libroId ? ({ id: grupo.libroId } as any) : undefined,
      }));
      totalTitulos++;

      // Artículos directos del título (sin capítulo)
      for (let ai = 0; ai < (tData.articulos ?? []).length; ai++) {
        const aData = tData.articulos[ai];
        await this.articuloRepo.save(this.articuloRepo.create({
          orden: ai + 1,
          numero: aData.numero,
          titulo: aData.titulo || undefined,
          contenido: aData.contenido,
          vigente: true,
          pesoExamen: 1,
          tituloRef: { id: titulo.id } as any,
        } as any));
        totalArticulos++;
      }

      for (let ci = 0; ci < (tData.capitulos ?? []).length; ci++) {
        const cData = tData.capitulos[ci];
        const capitulo = await this.capituloRepo.save(this.capituloRepo.create({
          orden: ci + 1,
          numero: cData.numero,
          nombre: cData.nombre,
          tituloRef: { id: titulo.id } as any,
        }));
        totalCapitulos++;

        for (let ai = 0; ai < (cData.articulos ?? []).length; ai++) {
          const aData = cData.articulos[ai];
          await this.articuloRepo.save(this.articuloRepo.create({
            orden: ai + 1,
            numero: aData.numero,
            titulo: aData.titulo || undefined,
            contenido: aData.contenido,
            vigente: true,
            pesoExamen: 1,
            capitulo: { id: capitulo.id } as any,
          } as any));
          totalArticulos++;
        }

        for (let si = 0; si < (cData.secciones ?? []).length; si++) {
          const sData = cData.secciones[si];
          const seccion = await this.seccionRepo.save(this.seccionRepo.create({
            orden: si + 1,
            numero: sData.numero,
            nombre: sData.nombre,
            capitulo: { id: capitulo.id } as any,
          }));
          totalSecciones++;

          for (let ai = 0; ai < (sData.articulos ?? []).length; ai++) {
            const aData = sData.articulos[ai];
            await this.articuloRepo.save(this.articuloRepo.create({
              orden: ai + 1,
              numero: aData.numero,
              titulo: aData.titulo || undefined,
              contenido: aData.contenido,
              vigente: true,
              pesoExamen: 1,
              seccion: { id: seccion.id } as any,
            } as any));
            totalArticulos++;
          }
        }
      }


    }
    }

    for (let di = 0; di < (estructura.disposiciones ?? []).length; di++) {
            const dData = estructura.disposiciones?.[di];
            await this.disposicionRepo.save(this.disposicionRepo.create({
              orden: di + 1,
              categoria: dData.categoria,
              etiqueta: dData.etiqueta || undefined,
              contenido: dData.contenido,
              versionLey: { id: versionId } as any,
            }));
            totalDisposiciones++;
          }
    return { totalLibros, totalTitulos, totalCapitulos, totalSecciones, totalArticulos, totalDisposiciones };
  }

  async copiarVersion(versionOrigenId: string, datosNuevaVersion: {
  version: string;
  referenciaBoe?: string;
  tipoNorma?: string;
  fechaPublicacion?: string;
  fechaVigencia?: string;
  notas?: string;
}): Promise<VersionLey> {
  const origen = await this.versionRepo.findOne({
    where: { id: versionOrigenId },
    relations: ['ley'],
  });
  if (!origen) throw new NotFoundException('Versión origen no encontrada');

  // Desactivar la versión actual (la nueva pasará a ser la activa)
  await this.versionRepo.update({ ley: { id: origen.ley.id } as any, activa: true }, { activa: false });

  const nuevaVersion = await this.versionRepo.save(this.versionRepo.create({
    version: datosNuevaVersion.version,
    referenciaBoe: datosNuevaVersion.referenciaBoe || undefined,
    tipoNorma: datosNuevaVersion.tipoNorma || origen.tipoNorma,
    fechaPublicacion: origen.fechaPublicacion, // se mantiene la fecha original de la ley
    fechaVigencia: datosNuevaVersion.fechaVigencia ? new Date(datosNuevaVersion.fechaVigencia) : undefined,
    tipoCambio: TipoCambio.MODIFICACION_PARCIAL,
    notas: datosNuevaVersion.notas || undefined,
    activa: true,
    textoCompleto: origen.textoCompleto, // se conserva el texto plano original
    ley: { id: origen.ley.id } as any,
  }));

  // Copiar libros (si los hay) creando copias propias de la nueva versión,
  // no referencias a los libros de la versión origen.
  const librosOrigen = await this.libroRepo.find({
    where: { versionLey: { id: versionOrigenId } as any },
    order: { orden: 'ASC' },
  });
  const mapaLibroOrigenANuevo = new Map<string, string>();
  for (const libroOrigen of librosOrigen) {
    const nuevoLibro = (await this.libroRepo.save(this.libroRepo.create({
      orden: libroOrigen.orden,
      numero: libroOrigen.numero,
      nombre: libroOrigen.nombre,
      versionLey: { id: nuevaVersion.id } as any,
    } as any))) as unknown as Libro;
    mapaLibroOrigenANuevo.set(libroOrigen.id, nuevoLibro.id);
  }

  // Copiar toda la jerarquía: títulos -> capítulos -> secciones -> artículos
  const titulosOrigen = await this.tituloRepo.find({
    where: { versionLey: { id: versionOrigenId } },
    order: { orden: 'ASC' },
    relations: ['libro'],
  });

  for (const tituloOrigen of titulosOrigen) {
    const libroOrigenId = tituloOrigen.libro ? (tituloOrigen.libro as any).id : undefined;
    const nuevoLibroId = libroOrigenId ? mapaLibroOrigenANuevo.get(libroOrigenId) : undefined;
    const nuevoTitulo = await this.tituloRepo.save(this.tituloRepo.create({
      orden: tituloOrigen.orden,
      numero: tituloOrigen.numero,
      nombre: tituloOrigen.nombre,
      versionLey: { id: nuevaVersion.id } as any,
      libro: nuevoLibroId ? { id: nuevoLibroId } as any : undefined,
    }));

    // Artículos directos del título (sin capítulo)
    const articulosDelTitulo = await this.articuloRepo.find({ where: { tituloRef: { id: tituloOrigen.id } } });
    for (const art of articulosDelTitulo) {
      const nuevoArt = await this.articuloRepo.save(this.articuloRepo.create({
        orden: art.orden,
        numero: art.numero,
        titulo: art.titulo,
        contenido: art.contenido,
        vigente: art.vigente,
        pesoExamen: art.pesoExamen,
        tituloRef: { id: nuevoTitulo.id } as any,
      } as any)) as Articulo;
      await this.copiarPreguntasDeArticulo(art.id, nuevoArt.id);
    }

    const capitulosOrigen = await this.capituloRepo.find({
      where: { tituloRef: { id: tituloOrigen.id } },
      order: { orden: 'ASC' },
    });

    for (const capOrigen of capitulosOrigen) {
      const nuevoCapitulo = await this.capituloRepo.save(this.capituloRepo.create({
        orden: capOrigen.orden,
        numero: capOrigen.numero,
        nombre: capOrigen.nombre,
        tituloRef: { id: nuevoTitulo.id } as any,
      }));

      const articulosDelCapitulo = await this.articuloRepo.find({ where: { capitulo: { id: capOrigen.id } } });
      for (const art of articulosDelCapitulo) {
        const nuevoArt = await this.articuloRepo.save(this.articuloRepo.create({
          orden: art.orden,
          numero: art.numero,
          titulo: art.titulo,
          contenido: art.contenido,
          vigente: art.vigente,
          pesoExamen: art.pesoExamen,
          capitulo: { id: nuevoCapitulo.id } as any,
        } as any)) as Articulo;
        await this.copiarPreguntasDeArticulo(art.id, nuevoArt.id);
      }

      const seccionesOrigen = await this.seccionRepo.find({
        where: { capitulo: { id: capOrigen.id } },
        order: { orden: 'ASC' },
      });

      for (const secOrigen of seccionesOrigen) {
        const nuevaSeccion = await this.seccionRepo.save(this.seccionRepo.create({
          orden: secOrigen.orden,
          numero: secOrigen.numero,
          nombre: secOrigen.nombre,
          capitulo: { id: nuevoCapitulo.id } as any,
        }));

        const articulosDeSeccion = await this.articuloRepo.find({ where: { seccion: { id: secOrigen.id } } });
        for (const art of articulosDeSeccion) {
          const nuevoArt = await this.articuloRepo.save(this.articuloRepo.create({
            orden: art.orden,
            numero: art.numero,
            titulo: art.titulo,
            contenido: art.contenido,
            vigente: art.vigente,
            pesoExamen: art.pesoExamen,
            seccion: { id: nuevaSeccion.id } as any,
          } as any)) as Articulo;
          await this.copiarPreguntasDeArticulo(art.id, nuevoArt.id);
        }
      }
    }
  }

  // Copiar disposiciones
  const disposicionesOrigen = await this.disposicionRepo.find({
    where: { versionLey: { id: versionOrigenId } },
    order: { orden: 'ASC' },
  });
  for (const disp of disposicionesOrigen) {
    await this.disposicionRepo.save(this.disposicionRepo.create({
      orden: disp.orden,
      categoria: disp.categoria,
      etiqueta: disp.etiqueta,
      contenido: disp.contenido,
      versionLey: { id: nuevaVersion.id } as any,
    }));
  }

  const versionConLey = await this.versionRepo.findOne({
    where: { id: nuevaVersion.id },
    relations: ['ley'],
  });
  if (versionConLey) {
    // No dejar que un fallo generando noticias (efecto secundario) tumbe la
    // copia de versión (efecto principal, ya persistido con toda su jerarquía).
    try {
      await this.noticiaService.generarNoticiasLegislativasDesdeVersion(versionConLey);
    } catch (e: any) {
      this.logger.error(`Error generando noticias legislativas para versión copiada ${nuevaVersion.id}: ${e.message}`);
    }
  }

  return nuevaVersion;
}
}