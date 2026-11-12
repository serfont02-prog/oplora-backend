import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { FlashcardService } from './flashcard.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('flashcards')
@UseGuards(JwtAuthGuard)
export class FlashcardController {
  constructor(private readonly service: FlashcardService) {}

  @Post('importar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  importar(@Body('flashcards') flashcards: any[]) {
    return this.service.importar(flashcards);
  }

  // ─── ADMIN: gestionar flashcards (antes solo se podían importar) ───
  @Get('admin/lista')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  listarAdmin(
    @Query('oposicionId') oposicionId?: string,
    @Query('q') q?: string,
    @Query('tipo') tipo?: string,
    @Query('estado') estado?: string,
    @Query('pagina') pagina?: string,
    @Query('temaId') temaId?: string,
  ) {
    return this.service.listarAdmin({ oposicionId, temaId, q, tipo, estado, pagina: Number(pagina) || 1 });
  }

  /** Temas de una oposición que tienen flashcards oficiales, con cuántas tiene cada uno. */
  @Get('admin/temas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  temasAdmin(@Query('oposicionId') oposicionId: string) {
    return this.service.temasConFlashcards(oposicionId);
  }

  /** Borrar de golpe las flashcards oficiales de una oposición (o solo de uno de sus temas). */
  @Delete('admin/masivo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  borrarMasivo(@Query('oposicionId') oposicionId: string, @Query('temaId') temaId?: string) {
    return this.service.borrarMasivo(oposicionId, temaId);
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  editarAdmin(@Param('id') id: string, @Body() body: any) {
    return this.service.editarAdmin(id, body ?? {});
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  borrarAdmin(@Param('id') id: string) {
    return this.service.borrarAdmin(id);
  }

  @Get('mis-retos')
  getMisRetos(@Request() req: any) {
    return this.service.getMisRetosFC(req.user.id);
  }

  @Get('stats/:oposicionId/:temaId')
  getStatsTema(
  @Param('oposicionId') oposicionId: string,
  @Param('temaId') temaId: string,
  @Request() req: any,
) {
  return this.service.getEstadisticasFCTema(req.user.id, oposicionId, temaId);
}

  @Get('articulo/:articuloId')
  findByArticulo(@Param('articuloId') articuloId: string) {
    return this.service.findByArticulo(articuloId);
  }

  @Get('tema/:temaId')
  findByTema(@Param('temaId') temaId: string) {
    return this.service.findByTema(temaId);
  }

  @Get('oposicion/:oposicionId')
  findByOposicion(@Param('oposicionId') oposicionId: string) {
    return this.service.findByOposicion(oposicionId);
  }

  @Get('stats-periodo/:oposicionId')
  getStatsPeriodo(@Param('oposicionId') oposicionId: string, @Request() req: any) {
  return this.service.getEstadisticasFCPorPeriodo(req.user.id, oposicionId);
}

  // ⭐ Solo repasos que tocan hoy (opcionalmente de un tema). Las nuevas van por tema.
  @Get('pendientes/:oposicionId')
getPendientes(
  @Param('oposicionId') oposicionId: string,
  @Query('limite') limite: string,
  @Query('temaId') temaId: string,
  @Request() req: any
) {
  return this.service.getPendientesRepaso(req.user.id, oposicionId, limite ? Number(limite) : 10, temaId || undefined);
}

  /** Resumen por tema de la convocatoria: total, vistas, dominadas, por repasar; y nuevas de hoy. */
  @Get('resumen-temas/:convocatoriaId')
  resumenTemas(@Param('convocatoriaId') convocatoriaId: string, @Request() req: any) {
    return this.service.resumenTemas(req.user.id, convocatoriaId);
  }

  /** Las N primeras tarjetas sin ver de un tema. */
  @Get('tema/:temaId/nuevas')
  nuevasDeTema(@Param('temaId') temaId: string, @Query('limite') limite: string, @Request() req: any) {
    return this.service.nuevasDeTema(req.user.id, temaId, limite ? Number(limite) : 10);
  }

  @Post('respuesta')
  registrarRespuesta(
  @Body('flashcardId') flashcardId: string,
  @Body('calificacion') calificacion: number, // ⭐ 0-5 en lugar de correcta/conDuda
  @Body('tiempoMs') tiempoMs: number,
  @Request() req: any,
) {
  return this.service.registrarRespuesta(req.user.id, flashcardId, calificacion, tiempoMs);
}

  @Post('programar-repaso')
  programarRepaso(
    @Body('articuloId') articuloId: string,
    @Body('cuando') cuando: string,
    @Body('oposicionId') oposicionId: string,
    @Request() req: any,
  ) {
    return this.service.programarRepasoArticulo(req.user.id, articuloId, cuando as any);
  }

  @Post('sugerir-repaso')
  sugerirRepaso(
    @Body('articuloId') articuloId: string,
    @Body('oposicionId') oposicionId: string,
    @Request() req: any,
  ) {
    return this.service.sugerirRepasoArticulo(req.user.id, articuloId, oposicionId);
  }

  @Post('duelo')
  crearDuelo(
    @Body('retadoNickOEmail') retadoNickOEmail: string,
    @Body('oposicionId') oposicionId: string,
    @Body('numFC') numFC: number,
    @Body('temaId') temaId: string,
    @Body('versionLeyId') versionLeyId: string,
    @Body('mensaje') mensaje: string,
    @Body('horasPlazo') horasPlazo: number,
    @Request() req: any,
  ) {
    return this.service.crearDueloFC(req.user.id, retadoNickOEmail, oposicionId, numFC ?? 5, temaId, versionLeyId, mensaje, horasPlazo);
  }

  @Delete('duelo/:id')
  eliminarDuelo(@Param('id') id: string, @Request() req: any) {
    return this.service.eliminarDueloFC(id, req.user.id);
  }

  // ⭐ POST /flashcards/enviar eliminado: la app no lo usaba y permitía mandar notificaciones con
  // texto libre a cualquier usuario (spam).

  @Post('reto/:id/completar')
  completarReto(
    @Param('id') id: string,
    @Body('respuestas') respuestas: any[],
    @Request() req: any,
  ) {
    return this.service.completarRetoFC(id, req.user.id, respuestas);
  }

  @Get('stats/:oposicionId')
  getStats(@Param('oposicionId') oposicionId: string, @Request() req: any) {
    return this.service.getEstadisticasFC(req.user.id, oposicionId);
  }
}