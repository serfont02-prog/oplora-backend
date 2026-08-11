import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { TemaService } from './tema.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('temas')
@UseGuards(JwtAuthGuard)
export class TemaController {
  constructor(private readonly service: TemaService) {}

  @Get('convocatoria/:convocatoriaId')
  findByConvocatoria(@Param('convocatoriaId') convocatoriaId: string) {
    return this.service.findByConvocatoria(convocatoriaId);
  }

  @Get('oposicion/:oposicionId/progreso-completo')
getProgresoOposicion(
  @Param('oposicionId') oposicionId: string,
  @Query('convocatoriaId') convocatoriaId: string,
  @Request() req: any,
) {
  return this.service.getProgresoOposicion(req.user.id, oposicionId, convocatoriaId);
}

  @Get('oposicion/:oposicionId')
  findByOposicion(@Param('oposicionId') oposicionId: string) {
    return this.service.findByOposicion(oposicionId);
  }

  @Get(':id/normativa')
  getNormativa(@Param('id') id: string) {
    return this.service.getNormativa(id);
  }

  @Get('convocatoria/:convocatoriaId/progreso-completo')
getProgresoCompletoConvocatoria(
  @Param('convocatoriaId') convocatoriaId: string,
  @Query('oposicionId') oposicionId: string,
  @Request() req: any,
) {
  return this.service.getProgresoCompletoConvocatoria(req.user.id, convocatoriaId, oposicionId);
}

    @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/progreso-completo')
  getProgresoCompleto(
  @Param('id') temaId: string,
  @Query('oposicionId') oposicionId: string,
  @Request() req: any,
) {
  return this.service.getProgresoCompleto(req.user.id, temaId, oposicionId);
}



  @Post(':id/normativa')
  vincularNormativa(@Param('id') id: string, @Body() body: any) {
  return this.service.vincularNormativa(id, body);
  }
  
   @Post(':id/articulos')
  vincularArticulo(@Param('id') id: string, @Body('articuloId') articuloId: string) {
    return this.service.vincularArticulo(id, articuloId);
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

    @Delete('normativa/:temaNormativaId')
  desvincularNormativa(@Param('temaNormativaId') id: string) {
    return this.service.desvincularNormativa(id);
  }
  @Delete(':id/articulos/:articuloId')
  desvincularArticulo(@Param('id') id: string, @Param('articuloId') articuloId: string) {
    return this.service.desvincularArticulo(id, articuloId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}