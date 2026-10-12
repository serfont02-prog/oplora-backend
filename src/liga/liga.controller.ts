import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { LigaService } from './liga.service';

/** Liga Oplora — rutas del jugador. */
@Controller('liga')
@UseGuards(JwtAuthGuard)
export class LigaController {
  constructor(private readonly service: LigaService) {}

  // Resumen: mi división, jornada actual y mi resultado (alta automática)
  @Get('mia')
  miLiga(@Request() req: any) {
    return this.service.miLiga(req.user.id);
  }

  @Patch('avisos')
  avisos(@Body() body: any, @Request() req: any) {
    return this.service.actualizarAvisos(req.user.id, body);
  }

  @Post('jornadas/:id/empezar')
  empezar(@Param('id') id: string, @Request() req: any) {
    return this.service.empezar(req.user.id, id);
  }

  @Post('jornadas/:id/progreso')
  progreso(@Param('id') id: string, @Body('respuestas') respuestas: any, @Request() req: any) {
    return this.service.guardarProgreso(req.user.id, id, respuestas);
  }

  @Post('jornadas/:id/enviar')
  enviar(@Param('id') id: string, @Body('respuestas') respuestas: any, @Request() req: any) {
    return this.service.enviar(req.user.id, id, respuestas);
  }

  @Get('jornadas/:id/clasificacion')
  clasificacion(@Param('id') id: string, @Request() req: any) {
    return this.service.clasificacionJornada(req.user.id, id);
  }

  @Get('jornadas/:id/revision')
  revision(@Param('id') id: string, @Request() req: any) {
    return this.service.revision(req.user.id, id);
  }

  // ?mes=AAAA-MM&division=1..5 (por defecto, el mes en curso y tu división)
  @Get('clasificacion/mensual')
  clasificacionMensual(@Query('mes') mes: string, @Query('division') division: string, @Request() req: any) {
    return this.service.clasificacionMensual(req.user.id, mes, division ? Number(division) : undefined);
  }

  @Get('clasificacion/general')
  clasificacionGeneral(@Request() req: any) {
    return this.service.clasificacionGeneral(req.user.id);
  }

  // Palmarés público (copas) de cualquier usuario; sin id, el tuyo
  @Get('palmares')
  miPalmares(@Request() req: any) {
    return this.service.palmares(req.user.id);
  }

  @Get('palmares/:usuarioId')
  palmares(@Param('usuarioId') usuarioId: string) {
    return this.service.palmares(usuarioId);
  }
}

/** Liga Oplora — rutas de administración (base; el módulo completo es la fase C). */
@Controller('liga/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class LigaAdminController {
  constructor(private readonly service: LigaService) {}

  @Get()
  listar() {
    return this.service.listarLigas();
  }

  // body: { convocatoriaId }
  @Post()
  crear(@Body('convocatoriaId') convocatoriaId: string) {
    return this.service.crearLiga(convocatoriaId);
  }

  @Get(':id')
  detalle(@Param('id') id: string) {
    return this.service.detalleLiga(id);
  }

  // body: { estado?, porcentajeAscenso?, bonusParticipacion?, horaAviso?, horaApertura?, horaUltimaLlamada?, horaCierre? }
  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() body: any) {
    return this.service.actualizarLiga(id, body);
  }

  // body: { modo?, temasPorJornada?, numPreguntas?, segundosPorPregunta?, bloqueMensual?, cursorTema?, cursorBloque? }
  @Patch(':id/divisiones/:division')
  actualizarDivision(
    @Param('id') id: string,
    @Param('division', ParseIntPipe) division: number,
    @Body() body: any,
  ) {
    return this.service.actualizarDivision(id, division, body);
  }

  @Get(':id/jornadas')
  jornadas(@Param('id') id: string) {
    return this.service.listarJornadas(id);
  }

  // body: { division, viernes: 'AAAA-MM-DD', tipo, temaIds?, bloque?, numPreguntas?, segundosPorPregunta? }
  @Post(':id/jornadas')
  fijarJornada(@Param('id') id: string, @Body() body: any) {
    return this.service.fijarJornada(id, body);
  }

  // Para pruebas: ejecuta ya la tarea periódica de esta liga
  @Post(':id/ejecutar')
  ejecutar(@Param('id') id: string) {
    return this.service.ejecutarAhora(id);
  }

  @Post('jornadas/:jornadaId/abrir')
  abrir(@Param('jornadaId') jornadaId: string) {
    return this.service.forzarApertura(jornadaId);
  }

  @Post('jornadas/:jornadaId/cerrar')
  cerrar(@Param('jornadaId') jornadaId: string) {
    return this.service.forzarCierre(jornadaId);
  }

  // Para pruebas: cierra ya un mes (body: { mes: 'AAAA-MM' })
  @Post(':id/cerrar-mes')
  cerrarMes(@Param('id') id: string, @Body('mes') mes: string) {
    return this.service.forzarCierreMes(id, mes);
  }

  // Recalcula la copa que se muestra en el avatar de todos los usuarios con copas
  @Post('refrescar-copas')
  refrescarCopas() {
    return this.service.refrescarTodasLasCopas();
  }
}
