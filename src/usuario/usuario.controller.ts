import { UsuarioService } from './usuario.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { resetearConsumosSiEsNuevoDia } from '../common/helpers/consumo.helper';
import { getSuscripcionLimits } from '../common/helpers/plan.helper';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfiguracionService } from '../config/configuracion.service';
import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile, Delete, Res } from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PasswordResetService } from './password-reset.service';
import { Public } from '../auth/public.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class UsuarioController {
  constructor(
    private readonly service: UsuarioService,
    private readonly configuracionService: ConfiguracionService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAll() {
    return this.service.listarParaAdmin();
  }

  @Get('mis-oposiciones')
getMisOposiciones(@Request() req: any) {
  return this.service.getMisOposiciones(req.user.id);
}

@Get('me')
getMe(@Request() req: any) {
  return this.service.findMe(req.user.id);
}

@Get('limites')
async getLimites(@Request() req: any) {
  const usuario = await this.service.findById(req.user.id);
  if (!usuario) throw new NotFoundException('Usuario no encontrado');

  // ⭐ Solo pone a cero los contadores si es otro día; abrir la app ya no cuenta como estudiar.
  const fechaOriginal = usuario.fechaResetConsumo;
  const usuarioActualizado = resetearConsumosSiEsNuevoDia(usuario);

  if (usuarioActualizado.fechaResetConsumo !== fechaOriginal) {
  await this.service.guardarConsumo(usuarioActualizado);
}

  const limitesPlanes = await this.configuracionService.getLimitesPlanes();
  const limits = limitesPlanes[usuarioActualizado.suscripcion ?? 'gratuito'];

  return {
    suscripcion: usuarioActualizado.suscripcion,
    consumo: {
      preguntasTestHoy: usuarioActualizado.preguntasTestHoy,
      flashcardsHoy: usuarioActualizado.flashcardsHoy,
    },
    limites: {
      preguntasPorTest: limits.preguntasPorTest,
      preguntasPorTema: limits.preguntasPorTema,
      preguntasTestDia: limits.preguntasTestDia,
      flashcardsDia: limits.flashcardsDia,
      simulacros: limits.simulacros,
    },
  };
}

// ⭐ Notificaciones y avisos (Perfil)
@Patch('preferencias')
actualizarPreferencias(@Body() body: any, @Request() req: any) {
  return this.service.actualizarPreferencias(req.user.id, body ?? {});
}

@Post('onboarding-general/completado')
async marcarOnboardingGeneral(@Request() req) {
  return this.service.marcarOnboardingGeneral(req.user.id);
}

@Post('onboarding-entrenamiento/completado')
async marcarOnboardingEntrenamiento(@Request() req) {
  return this.service.marcarOnboardingEntrenamiento(req.user.id);
}

@Post('activar-oposicion/:oposicionId')
activarOposicion(@Param('oposicionId') oposicionId: string, @Request() req: any) {
  return this.service.activarOposicion(req.user.id, oposicionId);
}

@Get('exportar-progreso/:oposicionId')
async exportarProgreso(@Param('oposicionId') oposicionId: string, @Request() req: any, @Res() res: Response) {
  const csv = await this.service.exportarProgreso(req.user.id, oposicionId);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="progreso-oplora.csv"');
  res.send(csv);
}

// ⭐ Borrar mi cuenta (RGPD). Pide la contraseña para que no se pueda hacer con un móvil desbloqueado
// ajeno o un token robado sin más.
@Delete('me')
@Throttle({ default: { limit: 5, ttl: 60000 } })
eliminarMiCuenta(@Body('password') password: string, @Request() req: any) {
  return this.service.eliminarCuenta(req.user.id, password);
}

@Delete('desactivar-oposicion/:oposicionId')
desactivarOposicion(@Param('oposicionId') oposicionId: string, @Request() req: any) {
  return this.service.desactivarOposicion(req.user.id, oposicionId);
}

@Public()
@Throttle({ default: { limit: 3, ttl: 60000 } })
@Post('solicitar-reset-password')
solicitarReset(@Body('email') email: string) {
  return this.passwordResetService.solicitarReset(email);
}

@Public()
@Get('validar-token-reset/:token')
validarToken(@Param('token') token: string) {
  return this.passwordResetService.validarToken(token);
}

@Public()
@Post('resetear-password')
resetearPassword(@Body('token') token: string, @Body('password') password: string) {
  return this.passwordResetService.resetearPassword(token, password);
}
  @Get('estadisticas')
  @UseGuards(RolesGuard)
  @Roles('admin')
  estadisticas() {
  return this.service.getEstadisticas();
}

@Get('convocatorias-disponibles/:oposicionId')
getConvocatoriasDisponibles(@Param('oposicionId') oposicionId: string, @Request() req: any) {
  return this.service.getConvocatoriasDisponibles(req.user.id, oposicionId);
}

@Post('cambiar-convocatoria')
cambiarConvocatoria(
  @Body('oposicionId') oposicionId: string,
  @Body('convocatoriaId') convocatoriaId: string,
  @Request() req: any,
) {
  return this.service.cambiarConvocatoria(req.user.id, oposicionId, convocatoriaId);
}

@Post('resetear-progreso')
resetearProgreso(
  @Body('oposicionId') oposicionId: string,
  @Body('conservar') conservar: any,
  @Request() req: any,
) {
  return this.service.resetearProgreso(req.user.id, oposicionId, conservar ?? {});
}

  // ⭐ Antes se aceptaba cualquier archivo de cualquier tamaño. Ahora: solo JPG, PNG o WEBP de hasta 5 MB,
  // y se comprueba el contenido real del archivo (no solo lo que dice el navegador).
  @Post('avatar')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseInterceptors(FileInterceptor('archivo', {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, cb) => {
      if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) cb(null, true);
      else cb(new BadRequestException('La foto tiene que ser JPG, PNG o WEBP'), false);
    },
  }))
  async subirAvatar(@UploadedFile() archivo: Express.Multer.File, @Request() req: any) {
    if (!archivo?.buffer?.length) throw new BadRequestException('No se ha recibido ninguna imagen');
    return this.service.subirAvatar(req.user.id, archivo.buffer, archivo.mimetype);
  }

  @Patch('avatar/tipo')
  async cambiarTipoAvatar(@Body('tipo') tipo: 'oplo' | 'foto', @Request() req: any) {
    return this.service.cambiarTipoAvatar(req.user.id, tipo);
  }

  @Patch(':id/suscripcion')
  @UseGuards(RolesGuard)
  @Roles('admin')
  cambiarSuscripcion(@Param('id') id: string, @Body('suscripcion') suscripcion: string) {
    // ⭐ Antes aceptaba cualquier texto (el botón "Ninguno" mandaba '' y fallaba en la BD)
    if (!['gratuito', 'esencial', 'profesional'].includes(suscripcion)) {
      throw new BadRequestException('Suscripción no válida');
    }
    return this.service.cambiarSuscripcion(id, suscripcion);
  }

  @Patch(':id/desactivar')
  @UseGuards(RolesGuard)
  @Roles('admin')
  desactivar(@Param('id') id: string) {
    return this.service.desactivar(id);
  }

  @Patch(':id/activar')
  @UseGuards(RolesGuard)
  @Roles('admin')
  reactivar(@Param('id') id: string) {
    return this.service.reactivar(id);
  }

  @Patch('compromiso')
  async actualizarCompromiso(
  @Request() req,
  @Body('compromiso') compromiso: boolean,
) {
  return this.service.actualizarCompromiso(req.user.id, compromiso);
}


  @Patch('objetivo')
async actualizarObjetivo(
  @Request() req,
  @Body()
  body: {
    objetivo: string;
  },
) {
  return this.service.actualizarObjetivo(
    req.user.id,
    body.objetivo,
  );
}

@Patch('tiempo-disponible')
async actualizarTiempoDisponible(
  @Request() req,
  @Body('tiempoDisponible') tiempoDisponible: string,
) {
  return this.service.actualizarTiempoDisponible(req.user.id, tiempoDisponible);
}

@Patch('nivel-experiencia')
async actualizarNivelExperiencia(
  @Request() req,
  @Body('nivelExperiencia') nivelExperiencia: number,
  @Body('oposicionId') oposicionId: string,
) {
  return this.service.actualizarNivelExperiencia(req.user.id, oposicionId, nivelExperiencia);
}

// ⭐ PATCH /usuarios/nivel eliminado: el nivel sale solo de los puntos y nadie debe poder fijarlo a mano.


}


