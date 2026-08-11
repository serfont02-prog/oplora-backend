import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { SesionTemaService } from './sesion-tema.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('sesiones-tema')
@UseGuards(JwtAuthGuard)
export class SesionTemaController {
  constructor(private readonly service: SesionTemaService) {}

  @Post(':temaId')
  registrar(@Param('temaId') temaId: string, @Request() req: any) {
    return this.service.registrar(req.user.id, temaId);
  }

  @Get(':temaId')
  getPorTema(@Param('temaId') temaId: string, @Request() req: any) {
    return this.service.getPorTema(req.user.id, temaId);
  }

  @Get(':temaId/progreso')
  getProgreso(@Param('temaId') temaId: string, @Request() req: any) {
    return this.service.getProgreso(req.user.id, temaId);
  }

  @Get('ultimo/:oposicionId')
  getUltimoTema(@Param('oposicionId') oposicionId: string, @Request() req: any) {
  return this.service.getUltimoTemaEstudiado(req.user.id, oposicionId);
  }
}