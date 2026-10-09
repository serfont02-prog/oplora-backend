import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query,
  UploadedFile, UseInterceptors, UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { LeyService } from './ley.service';
import { TipoCambio } from './version-ley.entity';
import { ParseoService } from './parseo.service';
import { SincronizacionTextoService } from './sincronizacion-texto.service';
import type { EstructuraJson } from './sincronizacion-texto.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('leyes')
export class LeyController {
  constructor(
  private readonly service: LeyService,
  private readonly parseoService: ParseoService,
  private readonly sincronizacionTexto: SincronizacionTextoService,
) {}
  

  // ─── LEYES ───────────────────────────────────────────────

  @Get()
  findAll(@Query('search') search?: string) {
    return this.service.findAll(search);
  }

  @Get('oposicion/:oposicionId/noticias-legislacion')
getNoticiasLegislacion(
  @Param('oposicionId') oposicionId: string,
  @Query('limite') limite: string,
) {
  return this.service.getNoticiasLegislacion(oposicionId, limite ? Number(limite) : undefined);
}

  @Get('oposicion/:oposicionId')
  findByOposicion(@Param('oposicionId') oposicionId: string) {
    return this.service.findByOposicion(oposicionId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body('nombre') nombre: string, @Body('descripcion') descripcion?: string) {
    return this.service.create(nombre, descripcion);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() datos: Partial<{ nombre: string; descripcion: string }>,
  ) {
    return this.service.update(id, datos);
  }

  @Get(':id/oposiciones')
  findOposiciones(@Param('id') id: string) {
    return this.service.findOposicionesByLey(id);
  }

  // ─── VERSIONES ───────────────────────────────────────────

  @Get(':id/versiones')
  findVersiones(@Param('id') id: string) {
    return this.service.findVersiones(id);
  }

  @Post(':id/versiones/subir')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('archivo'))
  async subirVersion(
    @Param('id') leyId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('version') version: string,
    @Body('referenciaBoe') referenciaBoe: string,
    @Body('tipoNorma') tipoNorma: string,
    @Body('fechaPublicacion') fechaPublicacion: string,
    @Body('fechaVigencia') fechaVigencia: string,
    @Body('tipoCambio') tipoCambio: TipoCambio,
    @Body('notas') notas: string,
    @Body('versionAnteriorId') versionAnteriorId: string,
  ) {
    const ext = extname(file.originalname).toLowerCase();
    const texto = await this.service.procesarArchivo(file.path, ext);

    const nuevaVersion = await this.service.crearVersion(
      leyId,
      { version, referenciaBoe, tipoNorma, fechaPublicacion, fechaVigencia, tipoCambio, notas },
      texto,
    );

    // Crear diff automáticamente si hay versión anterior
    if (versionAnteriorId) {
      await this.service.crearDiff(nuevaVersion.id, versionAnteriorId);
    }

    return {
      version: nuevaVersion,
      textoExtraido: texto.substring(0, 500),
      totalCaracteres: texto.length,
    };
  }

  @Patch(':id/versiones/:versionId/activar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  activarVersion(
    @Param('id') _leyId: string,
    @Param('versionId') versionId: string,
  ) {
    return this.service.activarVersion(versionId);
  }

    @Patch('versiones/:versionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async editarVersion(
    @Param('versionId') versionId: string,
    @Body() datos: {
      referenciaBoe?: string;
      tipoNorma?: string;
      fechaPublicacion?: string;
      fechaVigencia?: string;
      notas?: string;
    },
  ) {
    return this.service.editarVersion(versionId, datos);
  }

  // ─── SUBIR LEY NUEVA (crea ley + primera versión) ────────

 @Post('subir')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@UseInterceptors(FileInterceptor('archivo'))
async subirLeyNueva(
  @UploadedFile() file: Express.Multer.File,
  @Body('nombre') nombre: string,
  @Body('siglas') siglas: string, 
  @Body('descripcion') descripcion: string,
  @Body('referenciaBoe') referenciaBoe: string,
  @Body('tipoNorma') tipoNorma: string,
  @Body('fechaPublicacion') fechaPublicacion: string,
  @Body('fechaVigencia') fechaVigencia: string,
  @Body('oposicionIds') oposicionIdsRaw: string,
) {
  const ext = extname(file.originalname).toLowerCase();
  const texto = await this.service.procesarArchivo(file.path, ext);

  const ley = await this.service.create(nombre, siglas || undefined, descripcion || undefined); // ⭐ corregido orden

  const version = await this.service.crearVersion(
    ley.id,
    {
      version: '1.0',
      referenciaBoe: referenciaBoe || undefined,
      tipoNorma: tipoNorma || undefined,
      fechaPublicacion: fechaPublicacion || undefined,
      fechaVigencia: fechaVigencia || undefined,
      tipoCambio: TipoCambio.INICIAL,
    },
    texto,
  );

  const oposicionIds: string[] = oposicionIdsRaw ? JSON.parse(oposicionIdsRaw) : [];
  for (const oposicionId of oposicionIds) {
    await this.service.vincular(ley.id, oposicionId, version.id); 
  }

  return { ley, version, textoExtraido: texto.substring(0, 500), totalCaracteres: texto.length };
}

  // ─── VINCULACIÓN ─────────────────────────────────────────

  @Post('vincular')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  vincular(
    @Body('leyId') leyId: string,
    @Body('oposicionId') oposicionId: string,
    @Body('versionLeyId') versionLeyId?: string,
  ) {
    return this.service.vincular(leyId, oposicionId, versionLeyId);
  }

  @Delete(':leyId/oposicion/:oposicionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  desvincular(
    @Param('leyId') leyId: string,
    @Param('oposicionId') oposicionId: string,
  ) {
    return this.service.desvincular(leyId, oposicionId);
  }

  // ─── DIFFS ───────────────────────────────────────────────

  @Get(':id/diffs')
  findDiffs(@Param('id') id: string) {
    return this.service.findDiffs(id);
  }

  @Post(':id/versiones/:versionId/parsear')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  parsearVersion(
  @Param('id') _leyId: string,
  @Param('versionId') versionId: string,
  ) {
  return this.parseoService.parsearVersion(versionId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  eliminar(@Param('id') id: string) {
  return this.service.eliminar(id);
  }

  @Post(':id/versiones/:versionId/importar-json')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
importarJson(
  @Param('versionId') versionId: string,
  @Body('estructura') estructura: { libros?: any[]; titulos?: any[]; disposiciones?: any[] },
  @Body('forzar') forzar?: boolean,
) {
  return this.parseoService.importarEstructuraJson(versionId, estructura, forzar === true);
}

// ⭐ Lo que está vinculado a los artículos de una versión (lo que se perdería
// al reimportar con "Importar JSON"). El admin lo consulta antes de importar.
@Get('versiones/:versionId/dependencias')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
dependencias(@Param('versionId') versionId: string) {
  return this.parseoService.contarDependencias(versionId);
}

@Post('versiones/:versionId/copiar')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
copiarVersion(
  @Param('versionId') versionId: string,
  @Body() datos: { version: string; referenciaBoe?: string; tipoNorma?: string; fechaVigencia?: string; notas?: string },
) {
  return this.parseoService.copiarVersion(versionId, datos);
}

// ⭐ "Actualizar desde JSON": aplica un JSON corregido a una versión ya subida
// sin borrar artículos (conserva preguntas, flashcards, notas, subrayados y
// vínculos con temas). Por defecto simula; con { aplicar: true } guarda.
@Post('versiones/:versionId/actualizar-json')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
actualizarDesdeJson(
  @Param('versionId') versionId: string,
  @Body() body: { estructura: EstructuraJson; aplicar?: boolean },
) {
  return this.sincronizacionTexto.actualizarDesdeJson(versionId, body?.estructura, body?.aplicar === true);
}
}
