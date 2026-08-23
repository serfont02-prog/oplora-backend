import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query,
  UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { LeyService } from './ley.service';
import { TipoCambio } from './version-ley.entity';
import { ParseoService } from './parseo.service';

@Controller('leyes')
export class LeyController {
  constructor(
  private readonly service: LeyService,
  private readonly parseoService: ParseoService,
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
  create(@Body('nombre') nombre: string, @Body('descripcion') descripcion?: string) {
    return this.service.create(nombre, descripcion);
  }

  @Patch(':id')
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
  activarVersion(
    @Param('id') _leyId: string,
    @Param('versionId') versionId: string,
  ) {
    return this.service.activarVersion(versionId);
  }

  // ─── SUBIR LEY NUEVA (crea ley + primera versión) ────────

    @Post('subir')
    @UseInterceptors(FileInterceptor('archivo'))
    async subirLeyNueva(
      @UploadedFile() file: Express.Multer.File,
      @Body('nombre') nombre: string,
      @Body('siglas') siglas: string, 
      @Body('descripcion') descripcion: string,
      @Body('referenciaBoe') referenciaBoe: string,
      @Body('tipoNorma') tipoNorma: string,
      @Body('fechaPublicacion') fechaPublicacion: string,
      @Body('oposicionIds') oposicionIdsRaw: string,
    ) {
      const ext = extname(file.originalname).toLowerCase();
      const texto = await this.service.procesarArchivo(file.path, ext);

      // Crear la ley
      const ley = await this.service.create(nombre, siglas || undefined, descripcion || undefined); // ⭐ añadido siglas

      // Crear la primera versión
      const version = await this.service.crearVersion(
        ley.id,
        {
          version: '1.0',
          referenciaBoe: referenciaBoe || undefined,
          tipoNorma: tipoNorma || undefined,
          fechaPublicacion: fechaPublicacion || undefined,
          tipoCambio: TipoCambio.INICIAL,
        },
        texto,
      );

    // Vincular a oposiciones si se indicaron
    const oposicionIds: string[] = oposicionIdsRaw
      ? JSON.parse(oposicionIdsRaw)
      : [];

    for (const oposicionId of oposicionIds) {
      await this.service.vincular(ley.id, oposicionId, version.id);
    }

    return {
      ley,
      version,
      textoExtraido: texto.substring(0, 500),
      totalCaracteres: texto.length,
    };
  }

  // ─── VINCULACIÓN ─────────────────────────────────────────

  @Post('vincular')
  vincular(
    @Body('leyId') leyId: string,
    @Body('oposicionId') oposicionId: string,
    @Body('versionLeyId') versionLeyId?: string,
  ) {
    return this.service.vincular(leyId, oposicionId, versionLeyId);
  }

  @Delete(':leyId/oposicion/:oposicionId')
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
  parsearVersion(
  @Param('id') _leyId: string,
  @Param('versionId') versionId: string,
  ) {
  return this.parseoService.parsearVersion(versionId);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
  return this.service.eliminar(id);
  }
}