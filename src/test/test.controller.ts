import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  Request,
  Param,
  Query,
} from '@nestjs/common';

import { TestService } from './test.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('test')
export class TestController {

  constructor(
    private readonly testService: TestService,
  ) {}

  /* =========================================================
     GENERAR TEST
  ========================================================= */

  @Post('generar')
  @UseGuards(JwtAuthGuard)
  async generar(

    @Body('oposicionId')
    oposicionId: string,

    @Body('numPreguntas')
    numPreguntas: number,

    @Body('temasIds') temasIds?: string[],

    @Body('modo')
    modo?: string,               

    @Body('nivel')
    nivel?: number,              

    @Body('dificultad')
    dificultad?: string,         

    @Body('temaId')
    temaId?: string,

    @Body('versionLeyId')
    versionLeyId?: string,

    @Body('capituloId')
    capituloId?: string,

    @Body('tituloId')
    tituloId?: string,

    @Request() req?: any,

  ) {

    // ⭐ Cada test servido queda registrado como sesión (ver SesionTest).
    const preguntas = await this.testService.generarTest(
      oposicionId,
      numPreguntas ?? 5,
      temaId,
      versionLeyId,
      capituloId,
      tituloId,
      modo,
      nivel,
      dificultad,
      req?.user?.id,
      temasIds,
    );
    return this.testService.registrarSesion(req.user.id, oposicionId, modo ?? null, preguntas);
  }

  /* =========================================================
     ⭐ DISPONIBILIDAD (cuántas preguntas hay para una combinación de
     filtros, SIN generar el test). Usado por la pantalla de selección
     de test para avisar antes de empezar si esa combinación (tema,
     ley, capítulo, título o general) no tiene preguntas.
  ========================================================= */

  @Get('disponibles/:oposicionId')
  @UseGuards(JwtAuthGuard)
  contarDisponibles(
    @Param('oposicionId') oposicionId: string,
    @Query('temaId') temaId?: string,
    @Query('temasIds') temasIds?: string,
    @Query('versionLeyId') versionLeyId?: string,
    @Query('capituloId') capituloId?: string,
    @Query('tituloId') tituloId?: string,
    @Request() req?: any,
  ) {
    return this.testService.contarPreguntasDisponibles(
      oposicionId,
      temaId,
      versionLeyId,
      capituloId,
      tituloId,
      req?.user?.id,
      temasIds ? temasIds.split(',') : undefined,
    );
  }

  @Get('disponibles-por-tema/:oposicionId')
  @UseGuards(JwtAuthGuard)
  contarDisponiblesPorTema(
    @Param('oposicionId') oposicionId: string,
    @Query('temasIds') temasIds: string,
    @Request() req?: any,
  ) {
    const ids = temasIds ? temasIds.split(',').filter(Boolean) : [];
    return this.testService.contarPreguntasPorTemas(oposicionId, ids, req?.user?.id);
  }

  /* =========================================================
     REPASO INTELIGENTE
  ========================================================= */

  @Post('repaso-inteligente')
  @UseGuards(JwtAuthGuard)
  async repasoInteligente(
    @Body('oposicionId') oposicionId: string,
    @Body('numPreguntas') numPreguntas: number,
    @Request() req: any,
  ) {
    const repaso = await this.testService.generarRepasoInteligente(
      req.user.id,
      oposicionId,
      numPreguntas ?? 10,
    );
    await this.testService.registrarSesion(req.user.id, oposicionId, 'repaso', repaso.preguntas);
    return { ...repaso, sesionId: repaso.preguntas?.[0]?.sesionId ?? null };
  }

  /* =========================================================
     GUARDAR RESULTADO
  ========================================================= */

  @Post('resultado')
  @UseGuards(JwtAuthGuard)
  guardarResultado(

    @Body()
    body: any,

    @Request()
    req: any,

  ) {

    return this.testService.guardarResultado({

      ...body,

      usuarioId: req.user.id,
    });
  }

  /* =========================================================
     PROGRESO
  ========================================================= */
    @Get('progreso/:oposicionId/:temaId')
    @UseGuards(JwtAuthGuard)
    getProgresoTema(
      @Param('oposicionId') oposicionId: string,
      @Param('temaId') temaId: string,
      @Request() req: any,
    ) {
      return this.testService.getProgresoTema(
        req.user.id,
        oposicionId,
        temaId,
      );
    }


  @Get('ultimo-resultado')
  @UseGuards(JwtAuthGuard)
  getUltimoResultado(@Request() req: any) {
    return this.testService.getUltimoResultado(req.user.id);
  }

  @Get('progreso-periodo/:oposicionId')
  @UseGuards(JwtAuthGuard)
  getProgresoPeriodo(@Param('oposicionId') oposicionId: string, @Request() req: any) {
    return this.testService.getProgresoPorPeriodo(req.user.id, oposicionId);
  }

  @Get('progreso/:oposicionId')
  @UseGuards(JwtAuthGuard)
  getProgreso(

    @Param('oposicionId')
    oposicionId: string,

    @Request()
    req: any,

  ) {

    return this.testService.getProgreso(
      req.user.id,
      oposicionId,
    );
  }

  @Post('importar/convocatoria/:convocatoriaId')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
importarPorConvocatoria(
  @Param('convocatoriaId') convocatoriaId: string,
  @Body('preguntas') preguntas: any[],
  @Body('examenAnteriorId') examenAnteriorId: string,
) {
  return this.testService.importarPorConvocatoria(convocatoriaId, preguntas, examenAnteriorId);
}

@Post('importar/version-ley/:versionLeyId')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
importarPorVersionLey(
  @Param('versionLeyId') versionLeyId: string,
  @Body('preguntas') preguntas: any[],
) {
  return this.testService.importarPorVersionLey(versionLeyId, preguntas);
}

  /* =========================================================
     GESTIÓN DEL BANCO DE PREGUNTAS (listar / editar / eliminar)
  ========================================================= */

  // ⭐ Solo admin: devuelve las preguntas CON la respuesta correcta y la explicación.
  // Antes cualquier usuario (incluso gratuito) podía descargarse el banco entero.
  @Get('banco/:convocatoriaId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  listarBanco(
    @Param('convocatoriaId') convocatoriaId: string,
    @Query('temaId') temaId?: string,
    @Query('pagina') pagina?: string,
    @Query('porPagina') porPagina?: string,
    @Query('examenAnteriorId') examenAnteriorId?: string,
  ) {
    return this.testService.listarPreguntasBanco(
      convocatoriaId,
      temaId,
      pagina ? Number(pagina) : 1,
      porPagina ? Number(porPagina) : 30,
      examenAnteriorId,
    );
  }

  @Get('banco-ley/:versionLeyId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  listarBancoLey(
    @Param('versionLeyId') versionLeyId: string,
    @Query('articuloId') articuloId?: string,
    @Query('pagina') pagina?: string,
    @Query('porPagina') porPagina?: string,
  ) {
    return this.testService.listarPreguntasPorVersionLey(
      versionLeyId,
      articuloId,
      pagina ? Number(pagina) : 1,
      porPagina ? Number(porPagina) : 30,
    );
  }

  @Patch('banco/:preguntaId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  actualizarBanco(
    @Param('preguntaId') preguntaId: string,
    @Body() cambios: any,
  ) {
    return this.testService.actualizarPreguntaBanco(preguntaId, cambios);
  }

  @Delete('banco/:preguntaId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  eliminarBanco(@Param('preguntaId') preguntaId: string) {
    return this.testService.eliminarPreguntaBanco(preguntaId);
  }
}
