import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { Pago } from './pago.entity';
import { PagoService } from './pago.service';
import { PagoController } from './pago.controller';
import { AvisosCaducidadService } from './avisos-caducidad.service';
import { NotificacionModule } from '../notificacion/notificacion.module';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Pago]), NotificacionModule],
  providers: [PagoService, AvisosCaducidadService],
  controllers: [PagoController],
})
export class PagoModule {}
