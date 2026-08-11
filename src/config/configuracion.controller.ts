import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ConfiguracionService } from './configuracion.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('configuracion')
@UseGuards(JwtAuthGuard)
export class ConfiguracionController {
  constructor(private readonly service: ConfiguracionService) {}

  @Get()
  getAll() {
    return this.service.getAll();
  }

  @Get(':clave')
  get(@Param('clave') clave: string) {
    return this.service.get(clave);
  }

  @Patch(':clave')
  set(@Param('clave') clave: string, @Body('valor') valor: any) {
    return this.service.set(clave, valor);
  }
}