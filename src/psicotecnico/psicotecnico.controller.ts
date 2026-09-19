import { Controller, Get, Post, Delete, Param, Body, Query, Request, UseGuards } from '@nestjs/common';
import { PsicotecnicoService } from './psicotecnico.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PsicotecnicoTipo, PsicotecnicoDificultad } from './psicotecnico-tipo.enum';

@Controller('psicotecnicos')
export class PsicotecnicoController {
  constructor(private readonly service: PsicotecnicoService) {}

  /* =========================================================
     CATÁLOGO (público — usado por el admin para dar de alta config)
  ========================================================= */

  @Get('catalogo')
  getCatalogo() {
    return this.service.getCatalogo();
  }

  /* =========================================================
     USUARIO — qué modalidades tiene disponibles + sus stats
  ========================================================= */

  @Get('config/:oposicionId')
  @UseGuards(JwtAuthGuard)
  getConfigParaUsuario(
    @Param('oposicionId') oposicionId: string,
    @Query('convocatoriaId') convocatoriaId: string,
    @Request() req: any,
  ) {
    return this.service.getConfigParaUsuario(req.user.id, oposicionId, convocatoriaId);
  }

  @Post('generar')
  @UseGuards(JwtAuthGuard)
  generar(
    @Body('oposicionId') oposicionId: string,
    @Body('convocatoriaId') convocatoriaId: string,
    @Body('tipo') tipo: PsicotecnicoTipo,
    @Body('subtipo') subtipo: string,
    @Body('dificultad') dificultad: PsicotecnicoDificultad,
    @Body('numPreguntas') numPreguntas: number,
    @Request() req: any,
  ) {
    return this.service.generarPreguntas({
      usuarioId: req.user.id,
      oposicionId,
      convocatoriaId,
      tipo,
      subtipo,
      dificultad,
      numPreguntas,
    });
  }

  @Post('resultado')
  @UseGuards(JwtAuthGuard)
  guardarResultado(@Body() body: any, @Request() req: any) {
    return this.service.guardarResultado({ ...body, usuarioId: req.user.id });
  }

  @Get('progreso-periodo/:oposicionId')
  @UseGuards(JwtAuthGuard)
  getProgresoPorPeriodo(@Param('oposicionId') oposicionId: string, @Request() req: any) {
    return this.service.getProgresoPorPeriodo(req.user.id, oposicionId);
  }

  /* =========================================================
     ADMIN — configuración por oposición/convocatoria
  ========================================================= */

  @Get('admin/config/:oposicionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getConfigAdmin(@Param('oposicionId') oposicionId: string) {
    return this.service.getConfigAdmin(oposicionId);
  }

  @Post('admin/config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  upsertConfig(@Body() body: any) {
    return this.service.upsertConfig(body);
  }

  @Delete('admin/config/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  eliminarConfig(@Param('id') id: string) {
    return this.service.eliminarConfig(id);
  }

  @Post('admin/preguntas/importar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  importarPreguntas(
    @Body('oposicionId') oposicionId: string,
    @Body('convocatoriaId') convocatoriaId: string,
    @Body('preguntas') preguntas: any[],
  ) {
    return this.service.importarPreguntas(oposicionId, preguntas, convocatoriaId);
  }
}
