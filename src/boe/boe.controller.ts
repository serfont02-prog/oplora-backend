import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { BoeService } from './boe.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

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
extraerTemario(@Param('id') id: string) {
  return this.service.extraerTemarioYCaracteristicas(id);
}

@Post('comparar-temarios')
compararTemarios(@Body() body: { temasNuevos: any[]; temasAnteriores: any[] }) {
  return this.service.compararTemarios(body.temasNuevos, body.temasAnteriores);
}

  @Post(':id/procesar')
procesar(@Param('id') id: string, @Body('oposicionExistenteId') oposicionExistenteId?: string) {
  return this.service.procesarConvocatoria(id, oposicionExistenteId);
}

  @Post('guardar')
  guardar(@Body() datos: any) {
    return this.service.guardarConvocatoria(datos);
  }

  @Post(':id/extraer')
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
  aprobar(@Param('id') id: string) {
    return this.service.aprobar(id);
  }

  @Patch(':id/rechazar')
  rechazar(@Param('id') id: string, @Body('notas') notas: string) {
    return this.service.rechazar(id, notas);
  }

  @Patch(':id/datos')
  guardarDatos(@Param('id') id: string, @Body() datos: any) {
    return this.service.guardarDatosExtraidos(id, datos);
  }
}