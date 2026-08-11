import { Controller, Get, Post, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { NotificacionService } from './notificacion.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { TipoNotificacion, PrioridadNotificacion } from './notificacion.entity';

@Controller('notificaciones')
export class NotificacionController {
  constructor(private readonly service: NotificacionService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req: any, @Query('noLeidas') noLeidas?: string) {
    return this.service.findByUsuario(req.user.id, noLeidas === 'true');
  }

    @Get('count')
  @UseGuards(JwtAuthGuard)
  count(@Request() req: any) {
    return this.service.countNoLeidas(req.user.id);
  }

  @Get('count')
countNoLeidas(@Request() req: any) {
  return this.service.countNoLeidas(req.user.id);
}

  @Patch(':id/leer')
  @UseGuards(JwtAuthGuard)
  marcarLeida(@Param('id') id: string, @Request() req: any) {
    return this.service.marcarLeida(id, req.user.id);
  }

  @Patch('leer-todas')
  @UseGuards(JwtAuthGuard)
  marcarTodasLeidas(@Request() req: any) {
    return this.service.marcarTodasLeidas(req.user.id);
  }

  @Post('seed/:usuarioId')
  async seed(@Param('usuarioId') usuarioId: string) {
    const tipos = [
      {
        tipo: TipoNotificacion.ADMITIDO,
        titulo: '¡Apareces en la lista de admitidos!',
        mensaje: 'Estás en la lista provisional de admitidos de Auxiliar Administrativo 2025. Acceso general.',
        prioridad: PrioridadNotificacion.ALTA,
      },
      {
        tipo: TipoNotificacion.CAMBIO_NORMATIVO,
        titulo: 'Cambio en normativa de tu temario',
        mensaje: 'Ley 39/2015 · Art. 14 modificado. Afecta a derechos digitales del ciudadano.',
        prioridad: PrioridadNotificacion.ALTA,
      },
      {
        tipo: TipoNotificacion.NUEVO_DOCUMENTO,
        titulo: 'Nuevo documento publicado',
        mensaje: 'Lista provisional de excluidos publicada en Auxiliar Administrativo 2025.',
        prioridad: PrioridadNotificacion.MEDIA,
      },
      {
        tipo: TipoNotificacion.RETO_RECIBIDO,
        titulo: 'María García te reta ⚡',
        mensaje: 'Te han enviado un reto de Auxiliar Administrativo. ¿Aceptas el desafío?',
        prioridad: PrioridadNotificacion.MEDIA,
      },
      {
        tipo: TipoNotificacion.RETO_DIARIO,
        titulo: 'Nuevo reto diario disponible ⚡',
        mensaje: 'Tu reto de hoy te está esperando. ¡No rompas la racha!',
        prioridad: PrioridadNotificacion.BAJA,
      },
      {
        tipo: TipoNotificacion.NUEVA_CONVOCATORIA,
        titulo: 'Nueva convocatoria publicada',
        mensaje: 'Administrativo · Estado 2025 publicada en el BOE. 5.440 plazas.',
        prioridad: PrioridadNotificacion.ALTA,
      },
      {
        tipo: TipoNotificacion.PLAZO_IMPORTANTE,
        titulo: 'Plazo de inscripción cerrando',
        mensaje: 'La inscripción para Auxiliar Administrativo 2025 cierra en 3 días.',
        prioridad: PrioridadNotificacion.ALTA,
      },
      {
        tipo: TipoNotificacion.LOGRO,
        titulo: 'Logro desbloqueado 🏆',
        mensaje: 'Has conseguido el logro "Constitucionalista" — superaste el 80% en la Constitución.',
        prioridad: PrioridadNotificacion.BAJA,
      },
    ];

    for (const t of tipos) {
      await this.service.crear({ usuarioId, ...t });
    }

    return { mensaje: `${tipos.length} notificaciones creadas` };
  }
}