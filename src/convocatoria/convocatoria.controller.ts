import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ConvocatoriaService } from './convocatoria.service';
import { CreateConvocatoriaDto, UpdateConvocatoriaDto } from './convocatoria.dto';
import { ScraperService } from './scraper.service';

@Controller('convocatorias')
export class ConvocatoriaController {
  constructor(
    private readonly service: ConvocatoriaService,
    private readonly scraperService: ScraperService,
  ) {}

  @Get('oposicion/:oposicionId')
  findByOposicion(@Param('oposicionId') oposicionId: string) {
    return this.service.findByOposicion(oposicionId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/documentos')
  findDocumentos(@Param('id') id: string) {
  return this.service.findDocumentosByConvocatoria(id);
  }

  @Get('oposicion/:oposicionId/noticias')
  getNoticias(
  @Param('oposicionId') oposicionId: string,
  @Query('limite') limite: string,
) {
  return this.service.getNoticiasByOposicion(oposicionId, limite ? Number(limite) : 3);
}

  @Get('oposicion/:oposicionId/documentos-completos')
  getDocumentosCompletos(@Param('oposicionId') oposicionId: string) {
    return this.service.getDocumentosCompletos(oposicionId);
  }

  @Patch(':id/url-inap')
  async actualizarUrlInap(
    @Param('id') id: string,
    @Body('urlInap') urlInap: string,
  ) {
    await this.service.reprocesarUrlInap(id, urlInap);
    await this.scraperService.scrapeConvocatoria(id, urlInap);
    return { mensaje: 'URL actualizada y documentos reprocesados' };
  }


  @Post(':id/copiar')
  copiar(@Param('id') id: string) {
  return this.service.copiarConvocatoria(id);
  }

  @Post('revisar-notificaciones-pendientes')
  revisarManual() {
    return this.service.revisarNotificacionesConvocatoriaPendientes();
  }

  @Post()
  create(@Body() dto: CreateConvocatoriaDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateConvocatoriaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // Endpoint para lanzar el scraper manualmente desde el panel de admin
 
  @Post(':id/scrape')
  async scrapeManual(@Param('id') id: string) {
    const convocatoria = await this.service.findOne(id);
    if (!convocatoria.urlInap) {
      return { mensaje: 'Esta convocatoria no tiene URL del INAP configurada' };
    }
    await this.scraperService.scrapeConvocatoria(id, convocatoria.urlInap);
  return { mensaje: 'Scraping ejecutado correctamente' };
}
}