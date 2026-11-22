import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ImportacionTestService } from './importacion-test.service';

/**
 * ⭐ Importación masiva del banco de test (un archivo con todos los temas).
 * POST /test/importar/masivo/:oposicionId
 * Body: { preguntas: [...], borrar?: 'ninguno' | 'banco' | 'todo' | 'global', simular?: boolean, offset?: number,
 *         enlaceTema?: 'respaldo' (por defecto) | 'siempre' }
 * La pantalla /admin/importar-test manda el archivo por partes (el límite de cada petición es 5 MB).
 */
@Controller('test')
export class ImportacionTestController {
  constructor(private readonly service: ImportacionTestService) {}

  @Post('importar/masivo/:oposicionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  importarMasivo(
    @Param('oposicionId') oposicionId: string,
    @Body('preguntas') preguntas: any[],
    @Body('borrar') borrar?: string,
    @Body('simular') simular?: boolean,
    @Body('offset') offset?: number,
    @Body('enlaceTema') enlaceTema?: string,
  ) {
    return this.service.importarMasivo(oposicionId, preguntas, { borrar, simular: simular === true, offset, enlaceTema });
  }
}
