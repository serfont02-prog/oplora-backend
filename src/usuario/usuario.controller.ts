import { UsuarioService } from './usuario.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { resetearConsumosSiEsNuevoDia } from '../common/helpers/consumo.helper';
import { getSuscripcionLimits } from '../common/helpers/plan.helper';
import { NotFoundException } from '@nestjs/common';
import { ConfiguracionService } from '../config/configuracion.service';
import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PasswordResetService } from './password-reset.service';
import { Public } from '../auth/public.decorator';

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class UsuarioController {
  constructor(
    private readonly service: UsuarioService,
    private readonly configuracionService: ConfiguracionService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('mis-oposiciones')
@UseGuards(JwtAuthGuard)
getMisOposiciones(@Request() req: any) {
  return this.service.getMisOposiciones(req.user.id);
}

@Get('me')
getMe(@Request() req: any) {
  return this.service.findMe(req.user.id);
}

@Get('limites')
@UseGuards(JwtAuthGuard)
async getLimites(@Request() req: any) {
  const usuario = await this.service.findById(req.user.id);
  if (!usuario) throw new NotFoundException('Usuario no encontrado');

  const fechaOriginal = usuario.fechaResetConsumo;
  const rachaOriginal = usuario.rachaActual;
  const usuarioActualizado = resetearConsumosSiEsNuevoDia(usuario);

  if (usuarioActualizado.fechaResetConsumo !== fechaOriginal || usuarioActualizado.rachaActual !== rachaOriginal) {
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

@Post('onboarding-general/completado')
async marcarOnboardingGeneral(@Request() req) {
  return this.service.marcarOnboardingGeneral(req.user.id);
}

@Post('onboarding-entrenamiento/completado')
async marcarOnboardingEntrenamiento(@Request() req) {
  return this.service.marcarOnboardingEntrenamiento(req.user.id);
}

@Post('activar-oposicion/:oposicionId')
@UseGuards(JwtAuthGuard)
activarOposicion(@Param('oposicionId') oposicionId: string, @Request() req: any) {
  return this.service.activarOposicion(req.user.id, oposicionId);
}

@Delete('desactivar-oposicion/:oposicionId')
@UseGuards(JwtAuthGuard)
desactivarOposicion(@Param('oposicionId') oposicionId: string, @Request() req: any) {
  return this.service.desactivarOposicion(req.user.id, oposicionId);
}

@Public()
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
  estadisticas() {
  return this.service.getEstadisticas();
}

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('archivo', { storage: memoryStorage() }))
  async subirAvatar(@UploadedFile() archivo: Express.Multer.File, @Request() req: any) {
    return this.service.subirAvatar(req.user.id, archivo.buffer, archivo.mimetype);
  }

  @Patch('avatar/tipo')
  @UseGuards(JwtAuthGuard)
  async cambiarTipoAvatar(@Body('tipo') tipo: 'oplo' | 'foto', @Request() req: any) {
    return this.service.cambiarTipoAvatar(req.user.id, tipo);
  }

  @Patch(':id/suscripcion')
  cambiarSuscripcion(@Param('id') id: string, @Body('suscripcion') suscripcion: string) {
    console.log('PATCH SUSCRIPCION', id, suscripcion);
    return this.service.cambiarSuscripcion(id, suscripcion);
  }

  @Patch(':id/desactivar')
  desactivar(@Param('id') id: string) {
    return this.service.desactivar(id);
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
    nivel?: number;
  },
) {
  return this.service.actualizarObjetivo(
    req.user.id,
    body.objetivo,
    body.nivel,
  );
}

@Patch('nivel')
async actualizarNivel(
  @Request() req,
  @Body('nivel') nivel: number,
) {
  return this.service.actualizarNivel(req.user.id, nivel);
}

}
