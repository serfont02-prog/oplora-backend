import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ExamenOficialService } from './examen-oficial.service';

/** ⭐ Gestión (solo admin) de exámenes oficiales creados directamente con sus preguntas. */
@Controller('examenes-oficiales')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ExamenOficialController {
  constructor(private readonly service: ExamenOficialService) {}

  @Get('convocatoria/:convocatoriaId')
  resumen(@Param('convocatoriaId') convocatoriaId: string) {
    return this.service.resumenConvocatoria(convocatoriaId);
  }

  /** Crea el examen con sus preguntas. Con { simular: true } solo devuelve la vista previa. */
  @Post('convocatoria/:convocatoriaId')
  crear(@Param('convocatoriaId') convocatoriaId: string, @Body() body: any) {
    return this.service.crearConPreguntas(convocatoriaId, {
      nombre: body?.nombre,
      parte: body?.parte,
      temarioConvocatoriaId: body?.temarioConvocatoriaId || undefined,
      preguntas: body?.preguntas,
      simular: !!body?.simular,
    });
  }

  @Get(':examenId/preguntas')
  listar(@Param('examenId') examenId: string) {
    return this.service.listarPreguntas(examenId);
  }

  @Post(':examenId/preguntas')
  anadir(@Param('examenId') examenId: string, @Body() body: any) {
    return this.service.anadirPreguntas(examenId, {
      temarioConvocatoriaId: body?.temarioConvocatoriaId || undefined,
      preguntas: body?.preguntas,
      simular: !!body?.simular,
    });
  }

  @Patch(':examenId')
  renombrar(@Param('examenId') examenId: string, @Body() body: any) {
    return this.service.renombrarExamen(examenId, { nombre: body?.nombre, parte: body?.parte });
  }

  @Patch('preguntas/:preguntaId')
  actualizar(@Param('preguntaId') preguntaId: string, @Body() body: any) {
    return this.service.actualizarPregunta(preguntaId, {
      estado: body?.estado,
      notaActualizacion: body?.notaActualizacion,
      clasificacion: body?.clasificacion,
    });
  }

  @Post('preguntas/:preguntaId/copia-actualizada')
  copiaActualizada(@Param('preguntaId') preguntaId: string, @Body() body: any) {
    return this.service.crearCopiaActualizada(preguntaId, body ?? {});
  }
}
