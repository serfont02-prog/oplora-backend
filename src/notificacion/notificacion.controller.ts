import { Controller, Get, Patch, Param, Query, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { NotificacionService } from './notificacion.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('notificaciones')
export class NotificacionController {
  constructor(private readonly service: NotificacionService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req: any, @Query('noLeidas') noLeidas?: string) {
    return this.service.findByUsuario(req.user.id, noLeidas === 'true');
  }

  @Get('count')
  @UseGuards(JwtAuthGuard)
  count(@Request() req: any) {
    return this.service.countNoLeidas(req.user.id);
  }

  @Patch(':id/leer')
  @UseGuards(JwtAuthGuard)
  marcarLeida(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.service.marcarLeida(id, req.user.id);
  }

  @Patch('leer-todas')
  @UseGuards(JwtAuthGuard)
  marcarTodasLeidas(@Request() req: any) {
    return this.service.marcarTodasLeidas(req.user.id);
  }

  // ⭐ Quitado POST /notificaciones/seed/:usuarioId (creaba notificaciones de prueba).
}