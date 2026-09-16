import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { TemaService } from './tema.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';

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

    @Get('examenes/mi-convocatoria/:oposicionId')
  @UseGuards(JwtAuthGuard)
  getExamenesByOposicionUsuario(
    @Param('oposicionId') oposicionId: string,
    @Request() req: any,
  ) {
    return this.service.getExamenesByOposicionUsuario(req.user.id, oposicionId);
  }

  @Get(':id/normativa')
  getNormativa(@Param('id') id: string) {
    return this.service.getNormativa(id);
  }

  @Get('simulacro-oplora/:oposicionId/:ejercicioNumero')
@UseGuards(JwtAuthGuard)
generarSimulacroOplora(
  @Param('oposicionId') oposicionId: string,
  @Param('ejercicioNumero') ejercicioNumero: string,
  @Request() req: any,
) {
  return this.service.generarSimulacroOplora(req.user.id, oposicionId, Number(ejercicioNumero));
}

@Post('simulacro-oplora/:oposicionId/corregir')
@UseGuards(JwtAuthGuard)
corregirSimulacroGenerado(
  @Param('oposicionId') oposicionId: string,
  @Body('preguntaIds') preguntaIds: string[],
  @Body('respuestas') respuestas: any[],
  @Request() req: any,
) {
  return this.service.corregirSimulacroGenerado(req.user.id, oposicionId, preguntaIds, respuestas);
}

  @Get('examenes/:id/preguntas')
  getPreguntasDeExamen(@Param('id') id: string) {
    return this.service.getPreguntasDeExamen(id);
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

  @Post('examenes/convocatoria/:convocatoriaId')
  @UseInterceptors(FileInterceptor('archivo'))
  async crearExamen(
    @Param('convocatoriaId') convocatoriaId: string,
    @UploadedFile() archivo: Express.Multer.File,
    @Body('nombre') nombre: string,
    @Body('anyo') anyo: string,
    @Body('mes') mes: string,
    @Body('tipo') tipo: string,
    @Body('parte') parte: string,
  ) {
    return this.service.crearExamen({
      convocatoriaId,
      nombre,
      anyo: parseInt(anyo),
      mes,
      tipo,
      parte: parseInt(parte) || 1,
      archivo,
    });
  }

    @Post('examenes/:id/corregir')
  @UseGuards(JwtAuthGuard)
  corregirSimulacro(
    @Param('id') id: string,
    @Body('respuestas') respuestas: any[],
    @Request() req: any,
  ) {
    return this.service.corregirSimulacro(req.user.id, id, respuestas);
  }

  @Delete('examenes/:id')
  eliminarExamen(@Param('id') id: string) {
    return this.service.eliminarExamen(id);
  }

  @Get('examenes/:id')
  getExamenConPreguntas(@Param('id') id: string) {
    return this.service.getExamenConPreguntas(id);
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