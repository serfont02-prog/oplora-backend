import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, Delete } from '@nestjs/common';
import { RetoService } from './reto.service';
import { JwtAuthGuard } from '../auth/jwt.guard';


@Controller('retos')
@UseGuards(JwtAuthGuard)
export class RetoController {
  constructor(private readonly service: RetoService) {}

  @Get('diario/:oposicionId')
  getRetoDiario(@Param('oposicionId') oposicionId: string, @Request() req: any) {
    return this.service.getRetoDiario(req.user.id, oposicionId);
  }

  @Get('semanal/:oposicionId')
  getRetoSemanal(@Param('oposicionId') oposicionId: string, @Request() req: any) {
    return this.service.getRetoSemanal(req.user.id, oposicionId);
  }

  @Get('ranking/oposicion/:oposicionId')
getRankingOposicion(
  @Param('oposicionId') oposicionId: string,
  @Query('nivel') nivel: string,
) {
  return this.service.getRankingOposicion(oposicionId, nivel ? parseInt(nivel) : undefined);
}

@Get('estadisticas')
getEstadisticas(@Request() req: any) {
  return this.service.getEstadisticasUsuario(req.user.id);
}

@Get('ranking/retos/:oposicionId')
getRankingRetos(@Param('oposicionId') oposicionId: string) {
  return this.service.getRankingRetos(oposicionId);
}

@Post('revisar-expirados')
revisarExpirados() {
  return this.service.revisarRetosExpirados();
}

@Post('usuario')
crearRetoUsuario(
  @Body('retadoNickOEmail') retadoNickOEmail: string,
  @Body('oposicionId') oposicionId: string,
  @Body('numPreguntas') numPreguntas: number,
  @Body('temaId') temaId: string,
  @Body('versionLeyId') versionLeyId: string,
  @Body('mensaje') mensaje: string,
  @Body('horasPlazo') horasPlazo: number,
  @Request() req: any,
) {
  return this.service.crearRetoUsuario(
    req.user.id, retadoNickOEmail, oposicionId,
    numPreguntas ?? 10, temaId, versionLeyId, mensaje, horasPlazo
  );
}

  @Post(':id/completar')
  completarReto(
    @Param('id') id: string,
    @Body('respuestas') respuestas: { correcta: boolean }[],
    @Body('tiempoSegundos') tiempoSegundos: number,
    @Request() req: any,
  ) {
    return this.service.completarReto(id, req.user.id, respuestas, tiempoSegundos);
  }

  @Get('mis-retos')
  getMisRetos(@Request() req: any) {
    return this.service.getMisRetos(req.user.id);
  }

  @Get('contactos-recientes')
  getContactosRecientes(@Request() req: any) {
  return this.service.getContactosRecientes(req.user.id);
}

  @Get(':id')
  getReto(@Param('id') id: string) {
    return this.service.getReto(id);
  }

  @Get(':id/ranking')
  getRanking(@Param('id') id: string) {
    return this.service.getRanking(id);
  }

  @Delete(':id')
eliminarReto(@Param('id') id: string, @Request() req: any) {
  return this.service.eliminarRetoUsuario(id, req.user.id);
}
}
