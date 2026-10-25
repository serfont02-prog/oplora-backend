import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TemarioPapelService } from './temario-papel.service';

@Controller('temario-papel')
@UseGuards(JwtAuthGuard)
export class TemarioPapelController {
  constructor(private readonly service: TemarioPapelService) {}

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles('admin')
  resumen() {
    return this.service.resumenAdmin();
  }

  @Patch('admin/:oposicionId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  guardar(@Param('oposicionId', ParseUUIDPipe) oposicionId: string, @Body() datos: any) {
    return this.service.guardarFicha(oposicionId, datos);
  }

  @Get('admin/:oposicionId/interesados')
  @UseGuards(RolesGuard)
  @Roles('admin')
  interesados(@Param('oposicionId', ParseUUIDPipe) oposicionId: string) {
    return this.service.interesados(oposicionId);
  }

  @Get('oposicion/:oposicionId')
  ficha(@Param('oposicionId', ParseUUIDPipe) oposicionId: string, @Request() req: any) {
    return this.service.paraUsuario(req.user.id, oposicionId);
  }

  @Post('oposicion/:oposicionId/interes')
  apuntar(@Param('oposicionId', ParseUUIDPipe) oposicionId: string, @Request() req: any) {
    return this.service.apuntarInteres(req.user.id, oposicionId);
  }

  @Delete('oposicion/:oposicionId/interes')
  quitar(@Param('oposicionId', ParseUUIDPipe) oposicionId: string, @Request() req: any) {
    return this.service.quitarInteres(req.user.id, oposicionId);
  }
}
