import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notificacion } from './notificacion.entity';
import { Usuario } from '../usuario/usuario.entity';
import { NotificacionService } from './notificacion.service';
import { NotificacionController } from './notificacion.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Notificacion, Usuario])],
  controllers: [NotificacionController],
  providers: [NotificacionService],
  exports: [NotificacionService],
})
export class NotificacionModule {}