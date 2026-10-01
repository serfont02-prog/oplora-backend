import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { BoeService } from './boe.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('boe')
@UseGuards(JwtAuthGuard)
export class BoeController {
  constructor(private readonly service: BoeService) {}

  @Get('consultar')
  consultar(@Query('fecha') fecha: string) {
    return this.service.consultarFecha(fecha);
  }

  @Get('tareas-pendientes')
  async tareasPendientes() {
  return this.service.getTareasPendientes();
}

@Post(':id/extraer-temario')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
extraerTemario(@Param('id') id: string) {
  return this.service.extraerTemarioYCaracteristicas(id);
}

@Post('comparar-temarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
compararTemarios(@Body() body: { temasNuevos: any[]; temasAnteriores: any[] }) {
  return this.service.compararTemarios(body.temasNuevos, body.temasAnteriores);
}

  @Post(':id/procesar')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
procesar(@Param('id') id: string, @Body('oposicionExistenteId') oposicionExistenteId?: string) {
  return this.service.procesarConvocatoria(id, oposicionExistenteId);
}

  @Post('guardar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  guardar(@Body() datos: any) {
    return this.service.guardarConvocatoria(datos);
  }

  @Post(':id/extraer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  extraerDatos(@Param('id') id: string) {
  return this.service.extraerDatosPDF(id);
  }

  @Get('pendientes')
  getPendientes() {
    return this.service.getPendientes();
  }

  @Get()
  getAll() {
    return this.service.getAll();
  }

  @Patch(':id/aprobar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  aprobar(@Param('id') id: string) {
    return this.service.aprobar(id);
  }

  @Patch(':id/rechazar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  rechazar(@Param('id') id: string, @Body('notas') notas: string) {
    return this.service.rechazar(id, notas);
  }

  @Patch(':id/datos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  guardarDatos(@Param('id') id: string, @Body() datos: any) {
    return this.service.guardarDatosExtraidos(id, datos);
  }
}