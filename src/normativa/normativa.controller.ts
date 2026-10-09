import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request, Query, Patch } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Titulo } from './titulo.entity';
import { Capitulo } from './capitulo.entity';
import { Articulo } from './articulo.entity';
import { NormativaService } from './normativa.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Seccion } from './seccion.entity';
import { Disposicion } from './disposicion.entity';
import { In } from 'typeorm';
import { EditarArticuloDto, EditarDisposicionDto } from './normativa.dto';

@Controller('normativa')
@UseGuards(JwtAuthGuard)
export class NormativaController {
  constructor(
    @InjectRepository(Titulo)
    private readonly tituloRepo: Repository<Titulo>,
    @InjectRepository(Capitulo)
    private readonly capituloRepo: Repository<Capitulo>,
    @InjectRepository(Articulo)
    private readonly articuloRepo: Repository<Articulo>,
    @InjectRepository(Seccion) 
    private readonly seccionRepo: Repository<Seccion>,
    @InjectRepository(Disposicion) 
    private readonly disposicionRepo: Repository<Disposicion>,
    private readonly normativaService: NormativaService,
    
  ) {}

  
  @Get('estadisticas/:versionLeyId')
  async getEstadisticas(@Param('versionLeyId') versionLeyId: string) {
    const titulos = await this.tituloRepo.count({ where: { versionLey: { id: versionLeyId } } });
    const tituloIds = (await this.tituloRepo.find({ where: { versionLey: { id: versionLeyId } }, select: ['id'] })).map((t) => t.id);

    const capitulos = tituloIds.length ? await this.capituloRepo.count({ where: { tituloRef: { id: In(tituloIds) } } }) : 0;
    const capituloIds = tituloIds.length
      ? (await this.capituloRepo.find({ where: { tituloRef: { id: In(tituloIds) } }, select: ['id'] })).map((c) => c.id)
      : [];

    const secciones = capituloIds.length ? await this.seccionRepo.count({ where: { capitulo: { id: In(capituloIds) } } }) : 0;
    const seccionIds = secciones
      ? (await this.seccionRepo.find({ where: { capitulo: { id: In(capituloIds) } }, select: ['id'] })).map((s) => s.id)
      : [];

    const articulosDirectosTitulo = tituloIds.length ? await this.articuloRepo.count({ where: { tituloRef: { id: In(tituloIds) } } }) : 0;
    const articulosDirectosCapitulo = capituloIds.length ? await this.articuloRepo.count({ where: { capitulo: { id: In(capituloIds) } } }) : 0;
    const articulosEnSecciones = seccionIds.length ? await this.articuloRepo.count({ where: { seccion: { id: In(seccionIds) } } }) : 0;

    const disposiciones = await this.disposicionRepo.count({ where: { versionLey: { id: versionLeyId } } });

    return {
      titulos,
      capitulos,
      secciones,
      articulos: articulosDirectosTitulo + articulosDirectosCapitulo + articulosEnSecciones,
      disposiciones,
    };
  }

  @Get('nota/:articuloId')
getNota(@Param('articuloId') articuloId: string, @Request() req: any) {
  return this.normativaService.getNota(req.user.id, articuloId);
}

@Get('buscar/:versionLeyId')
buscarArticulos(
  @Param('versionLeyId') versionLeyId: string,
  @Query('q') q: string,
) {
  return this.normativaService.buscarArticulos(versionLeyId, q);
}

@Get('nota-tema/:temaId')
getNotaTema(@Param('temaId') temaId: string, @Request() req: any) {
  return this.normativaService.getNotaTema(req.user.id, temaId);
}

@Get('articulo-por-numero/:versionLeyId/:numero')
buscarPorNumero(@Param('versionLeyId') versionLeyId: string, @Param('numero') numero: string) {
  return this.normativaService.buscarArticuloPorNumero(versionLeyId, numero);
}

@Post('nota-tema/:temaId')
guardarNotaTema(
  @Param('temaId') temaId: string,
  @Body('contenido') contenido: string,
  @Request() req: any,
) {
  return this.normativaService.guardarNotaTema(req.user.id, temaId, contenido);
}

@Post('nota-tema/:temaId/programar')
programarRepaso(
  @Param('temaId') temaId: string,
  @Body('fecha') fecha: string,
  @Request() req: any,
) {
  return this.normativaService.programarRepasoTema(req.user.id, temaId, new Date(fecha));
}

@Post('nota/:articuloId')
guardarNota(
  @Param('articuloId') articuloId: string,
  @Body('contenido') contenido: string,
  @Request() req: any,
) {
  return this.normativaService.guardarNota(req.user.id, articuloId, contenido);
}

@Get('subrayados/:articuloId')
getSubrayados(@Param('articuloId') articuloId: string, @Request() req: any) {
  return this.normativaService.getSubrayados(req.user.id, articuloId);
}

@Post('subrayados/:articuloId')
crearSubrayado(
  @Param('articuloId') articuloId: string,
  @Body('inicio') inicio: number,
  @Body('fin') fin: number,
  @Body('textoSeleccionado') textoSeleccionado: string,
  @Body('color') color: string,
  @Request() req: any,
) {
  return this.normativaService.crearSubrayado(req.user.id, articuloId, inicio, fin, textoSeleccionado, color);
}

@Delete('subrayados/:id')
borrarSubrayado(@Param('id') id: string, @Request() req: any) {
  return this.normativaService.borrarSubrayado(id, req.user.id);
}

  @Get('titulos/:versionLeyId')
  getTitulos(@Param('versionLeyId') versionLeyId: string) {
    return this.tituloRepo.find({
      where: { versionLey: { id: versionLeyId } },
      order: { orden: 'ASC' },
      relations: ['libro'], // ⭐ leyes con libros (Código Penal, Código Civil)
    });
  }

  @Get('capitulos/:tituloId')
  getCapitulos(@Param('tituloId') tituloId: string) {
    return this.capituloRepo.find({
      where: { tituloRef: { id: tituloId } },
      order: { orden: 'ASC' },
    });
  }

  @Get('secciones/:capituloId')
getSecciones(@Param('capituloId') capituloId: string) {
  return this.seccionRepo.find({
    where: { capitulo: { id: capituloId } },
    order: { orden: 'ASC' },
  });
}

@Get('disposiciones/:versionLeyId')
getDisposiciones(@Param('versionLeyId') versionLeyId: string) {
  return this.disposicionRepo.find({
    where: { versionLey: { id: versionLeyId } },
    order: { orden: 'ASC' },
  });
}

    @Get('articulos-seccion/:seccionId')
    getArticulosSeccion(@Param('seccionId') seccionId: string) {
      return this.articuloRepo.find({
        where: { seccion: { id: seccionId } },
        order: { orden: 'ASC' },
      });
    }

    @Get('articulo/:id')
    getArticulo(@Param('id') id: string) {
      return this.articuloRepo.findOne({
        where: { id },
        relations: [
          'capitulo',
          'capitulo.tituloRef',
          'capitulo.tituloRef.versionLey',
          'capitulo.tituloRef.versionLey.ley',
          'tituloRef',
          'tituloRef.versionLey',
          'tituloRef.versionLey.ley',
          'seccion', // ⭐ añadir
          'seccion.capitulo', // ⭐ añadir
          'seccion.capitulo.tituloRef', // ⭐ añadir
          'seccion.capitulo.tituloRef.versionLey', // ⭐ añadir
          'seccion.capitulo.tituloRef.versionLey.ley', // ⭐ añadir
        ],
      });
    }

// ⭐ Antes: hasta 6-8 queries secuenciales encadenadas (capítulo actual →
// capítulo anterior/siguiente → título anterior/siguiente → ...).
// Ahora: 1 sola consulta SQL con CTE calcula de un tirón el id de "anterior"
// y "siguiente" en el orden real del documento (título → capítulo → artículo,
// tratando los artículos directos de un título como anteriores a sus
// capítulos, e incluyendo los artículos que cuelgan de una sección bajo el
// orden de su capítulo), saltando los artículos no vigentes. Solo quedan 2
// queries más (opcionales) para cargar las entidades completas de anterior/
// siguiente si existen.
@Get('articulo/:id/anterior-siguiente')
async anteriorSiguiente(@Param('id') id: string) {
  const rows = await this.articuloRepo.query(
    `
    WITH chain AS (
      SELECT
        a.id,
        a.orden AS art_orden,
        a.vigente,
        COALESCE(tdirect."versionLeyId", tcap."versionLeyId", tsec."versionLeyId") AS version_ley_id,
        COALESCE(tdirect.orden, tcap.orden, tsec.orden) AS titulo_orden,
        CASE
          WHEN cap.id IS NOT NULL THEN cap.orden
          WHEN capsec.id IS NOT NULL THEN capsec.orden
          ELSE -1
        END AS capitulo_orden
      FROM articulos a
      LEFT JOIN capitulos cap ON a."capituloId" = cap.id
      LEFT JOIN secciones sec ON a."seccionId" = sec.id
      LEFT JOIN capitulos capsec ON sec."capituloId" = capsec.id
      LEFT JOIN titulos tdirect ON a."tituloRefId" = tdirect.id
      LEFT JOIN titulos tcap ON cap."tituloRefId" = tcap.id
      LEFT JOIN titulos tsec ON capsec."tituloRefId" = tsec.id
    ),
    cur AS (
      SELECT * FROM chain WHERE id = $1
    )
    SELECT
      (
        SELECT c.id FROM chain c, cur
        WHERE c.vigente = true
          AND c.version_ley_id IS NOT DISTINCT FROM cur.version_ley_id
          AND (c.titulo_orden, c.capitulo_orden, c.art_orden) < (cur.titulo_orden, cur.capitulo_orden, cur.art_orden)
        ORDER BY c.titulo_orden DESC, c.capitulo_orden DESC, c.art_orden DESC
        LIMIT 1
      ) AS anterior_id,
      (
        SELECT c.id FROM chain c, cur
        WHERE c.vigente = true
          AND c.version_ley_id IS NOT DISTINCT FROM cur.version_ley_id
          AND (c.titulo_orden, c.capitulo_orden, c.art_orden) > (cur.titulo_orden, cur.capitulo_orden, cur.art_orden)
        ORDER BY c.titulo_orden ASC, c.capitulo_orden ASC, c.art_orden ASC
        LIMIT 1
      ) AS siguiente_id
    `,
    [id],
  );

  const { anterior_id, siguiente_id } = rows[0] ?? {};

  const [anterior, siguiente] = await Promise.all([
    anterior_id ? this.articuloRepo.findOne({ where: { id: anterior_id } }) : Promise.resolve(null),
    siguiente_id ? this.articuloRepo.findOne({ where: { id: siguiente_id } }) : Promise.resolve(null),
  ]);

  return { anterior, siguiente };
}

  @Get('articulos-titulo/:tituloId')
  getArticulosTitulo(@Param('tituloId') tituloId: string) {
  return this.articuloRepo.find({
    where: { tituloRef: { id: tituloId }, vigente: true },
    order: { orden: 'ASC' },
  });
  }

  // ⭐ Antes solo devolvía los artículos colgados DIRECTAMENTE del capítulo.
  // Si el capítulo está dividido en Secciones (p. ej. Ley 40/2015), sus
  // artículos cuelgan de la Sección, no del Capítulo, y quedaban invisibles
  // aquí — el selector "Capítulo → Artículos" del modal de vincular (admin)
  // no tenía forma de llegar a ellos. Mismo criterio que ya usa la
  // navegación anterior/siguiente: un artículo de una Sección de este
  // capítulo cuenta como artículo de este capítulo.
  @Get('articulos/:capituloId')
  getArticulos(@Param('capituloId') capituloId: string) {
    return this.articuloRepo
      .createQueryBuilder('articulo')
      .leftJoin('articulo.seccion', 'seccion')
      .where(
        new Brackets((qb) => {
          qb.where('articulo.capitulo = :capituloId', { capituloId })
            .orWhere('seccion.capitulo = :capituloId', { capituloId });
        }),
      )
      .andWhere('articulo.vigente = true')
      .orderBy('articulo.orden', 'ASC')
      .getMany();
  }

  @Post('importar-contenido-ia')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
importarContenidoIA(@Body() body: { contenido: any[] }) {
  return this.normativaService.importarContenidoIA(body.contenido);
}

  @Post('importar-estructura')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  importarEstructura(@Body() datos: any) {
    return this.normativaService.importarEstructura(datos);
  }

  @Post('importar-articulos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  importarArticulos(
    @Body('articulos') articulos: any[],
    @Body('capituloId') capituloId: string,
  ) {
    return this.normativaService.importarArticulos(articulos, capituloId);
  }

  @Post('importar-articulos-titulo')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
importarArticulosTitulo(
  @Body('articulos') articulos: any[],
  @Body('tituloId') tituloId: string,
) {
  return this.normativaService.importarArticulosEnTitulo(articulos, tituloId);
}

// En normativa.service.ts o directamente en el controller si sigues ese patrón
@Patch('articulo/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
async editarArticulo(
  @Param('id') id: string,
  @Body() dto: EditarArticuloDto,
) {
  await this.articuloRepo.update(id, dto);
  return this.articuloRepo.findOne({ where: { id } });
}

  @Patch('disposicion/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async editarDisposicion(
    @Param('id') id: string,
    @Body() dto: EditarDisposicionDto,
  ) {
    await this.disposicionRepo.update(id, dto);
    return this.disposicionRepo.findOne({ where: { id } });
  }
}