import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { PreferenciaWidgetService } from './preferencia-widget.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('preferencias-widget')
@UseGuards(JwtAuthGuard)
export class PreferenciaWidgetController {
  constructor(private readonly service: PreferenciaWidgetService) {}

  @Get(':ubicacion')
  get(@Param('ubicacion') ubicacion: string, @Request() req: any) {
    return this.service.get(req.user.id, ubicacion);
  }

  @Post(':ubicacion')
  set(
    @Param('ubicacion') ubicacion: string,
    @Body('variante') variante: string,
    @Request() req: any,
  ) {
    return this.service.set(req.user.id, ubicacion, variante);
  }
}