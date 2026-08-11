import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { FlashcardService } from './flashcard.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('flashcards')
@UseGuards(JwtAuthGuard)
export class FlashcardController {
  constructor(private readonly service: FlashcardService) {}

  @Post('importar')
  importar(@Body('flashcards') flashcards: any[]) {
    return this.service.importar(flashcards);
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

  @Get('pendientes/:oposicionId')
getPendientes(
  @Param('oposicionId') oposicionId: string,
  @Query('limite') limite: string,
  @Request() req: any
) {
  return this.service.getPendientesRepaso(req.user.id, oposicionId, limite ? Number(limite) : 10);
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
    @Request() req: any,
  ) {
    return this.service.crearDueloFC(req.user.id, retadoNickOEmail, oposicionId, numFC ?? 5);
  }

  @Post('enviar')
  enviarFC(
    @Body('destinatarioId') destinatarioId: string,
    @Body('flashcardId') flashcardId: string,
    @Body('mensaje') mensaje: string,
    @Request() req: any,
  ) {
    return this.service.enviarFCPersonal(req.user.id, destinatarioId, flashcardId, mensaje);
  }

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