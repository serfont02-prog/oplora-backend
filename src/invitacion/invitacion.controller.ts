import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { InvitacionService } from './invitacion.service';

@Controller('invitaciones')
@UseGuards(JwtAuthGuard)
export class InvitacionController {
  constructor(private readonly service: InvitacionService) {}

  @Get('estado')
  estado(@Query('destino') destino: string, @Query('oposicionId') oposicionId: string, @Request() req: any) {
    return this.service.estado(req.user.id, destino, oposicionId);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post()
  enviar(
    @Body('destino') destino: string,
    @Body('oposicionId') oposicionId: string,
    @Body('motivo') motivo: string,
    @Body('mensaje') mensaje: string,
    @Request() req: any,
  ) {
    return this.service.enviar(req.user.id, { destino, oposicionId, motivo, mensaje });
  }

  @Get('mias')
  mias(@Request() req: any) {
    return this.service.misInvitaciones(req.user.id);
  }
}
