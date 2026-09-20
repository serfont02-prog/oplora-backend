import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { SoporteService } from './soporte.service';
import { CreateTicketDto, ResponderTicketDto } from './soporte.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('soporte')
export class SoporteController {
  constructor(private readonly service: SoporteService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  crear(@Request() req: any, @Body() dto: CreateTicketDto) {
    // El usuarioId sale SIEMPRE del JWT, nunca del body: evita que un usuario
    // pueda crear tickets a nombre de otro.
    return this.service.crear(req.user.id, dto);
  }

  @Get('mis-tickets')
  @UseGuards(JwtAuthGuard)
  misTickets(@Request() req: any) {
    return this.service.findByUsuario(req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll(@Query('estado') estado?: 'abierto' | 'respondido' | 'cerrado') {
    return this.service.findAll({ estado });
  }

  @Patch(':id/responder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  responder(@Param('id') id: string, @Body() dto: ResponderTicketDto) {
    return this.service.responder(id, dto);
  }

  @Patch(':id/cerrar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  cerrar(@Param('id') id: string) {
    return this.service.cerrar(id);
  }
}
