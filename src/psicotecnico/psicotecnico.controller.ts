import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Request, UseGuards } from '@nestjs/common';
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

  @Get('preguntas/:id/correcta')
  @UseGuards(JwtAuthGuard)
  getRespuestaCorrecta(@Param('id') id: string) {
    return this.service.getRespuestaCorrecta(id);
  }

  @Get('progreso-periodo/:oposicionId')
  @UseGuards(JwtAuthGuard)
  getProgresoPorPeriodo(@Param('oposicionId') oposicionId: string, @Request() req: any) {
    return this.service.getProgresoPorPeriodo(req.user.id, oposicionId);
  }

  /* =========================================================
     DUELOS PSICOTÉCNICOS 1 vs 1
  ========================================================= */

  @Post('duelo')
  @UseGuards(JwtAuthGuard)
  crearDuelo(
    @Body('retadoNickOEmail') retadoNickOEmail: string,
    @Body('oposicionId') oposicionId: string,
    @Body('tipo') tipo: PsicotecnicoTipo,
    @Body('numPreguntas') numPreguntas: number,
    @Body('convocatoriaId') convocatoriaId: string,
    @Request() req: any,
  ) {
    return this.service.crearDueloPsicotecnico(
      req.user.id,
      retadoNickOEmail,
      oposicionId,
      tipo,
      numPreguntas,
      convocatoriaId,
    );
  }

  @Post('reto/:id/completar')
  @UseGuards(JwtAuthGuard)
  completarReto(
    @Param('id') id: string,
    @Body('respuestas') respuestas: { preguntaId: string; respuestaTexto: string; tiempoRespuesta: number }[],
    @Request() req: any,
  ) {
    return this.service.completarRetoPsicotecnico(id, req.user.id, respuestas);
  }

  @Get('mis-retos')
  @UseGuards(JwtAuthGuard)
  getMisRetos(@Request() req: any) {
    return this.service.getMisRetosPsicotecnico(req.user.id);
  }

  @Get('disponibles/:oposicionId')
  @UseGuards(JwtAuthGuard)
  contarDisponibles(
    @Param('oposicionId') oposicionId: string,
    @Query('tipo') tipo: PsicotecnicoTipo,
    @Query('dificultad') dificultad?: PsicotecnicoDificultad,
  ) {
    return this.service.contarPreguntasDisponibles(oposicionId, tipo, dificultad);
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

  /* =========================================================
     ADMIN — banco de preguntas global (catálogo, sin scope de oposición)
  ========================================================= */

  @Get('admin/preguntas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  listarPreguntasAdmin(
    @Query('tipo') tipo?: PsicotecnicoTipo,
    @Query('subtipo') subtipo?: string,
    @Query('dificultad') dificultad?: PsicotecnicoDificultad,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.listarPreguntasAdmin({
      tipo,
      subtipo,
      dificultad,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post('admin/preguntas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  crearPreguntaAdmin(@Body() body: any) {
    return this.service.crearPreguntaAdmin(body);
  }

  @Patch('admin/preguntas/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  actualizarPreguntaAdmin(@Param('id') id: string, @Body() body: any) {
    return this.service.actualizarPreguntaAdmin(id, body);
  }

  @Delete('admin/preguntas/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  eliminarPreguntaAdmin(@Param('id') id: string) {
    return this.service.eliminarPreguntaAdmin(id);
  }

  @Get('admin/subtipos/:tipo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getSubtiposAdmin(@Param('tipo') tipo: PsicotecnicoTipo) {
    return this.service.getSubtiposAdmin(tipo);
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
