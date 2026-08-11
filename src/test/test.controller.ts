import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';

import { TestService } from './test.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

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
  generar(

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

    return this.testService.generarTest(
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
    );
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
@UseGuards(JwtAuthGuard)
importarPorConvocatoria(
  @Param('convocatoriaId') convocatoriaId: string,
  @Body('preguntas') preguntas: any[],
) {
  return this.testService.importarPorConvocatoria(convocatoriaId, preguntas);
}

@Post('importar/version-ley/:versionLeyId')
@UseGuards(JwtAuthGuard)
importarPorVersionLey(
  @Param('versionLeyId') versionLeyId: string,
  @Body('preguntas') preguntas: any[],
) {
  return this.testService.importarPorVersionLey(versionLeyId, preguntas);
}
}
