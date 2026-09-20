import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketSoporte } from './ticket-soporte.entity';
import { SoporteService } from './soporte.service';
import { SoporteController } from './soporte.controller';
import { NotificacionModule } from '../notificacion/notificacion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TicketSoporte]),
    forwardRef(() => NotificacionModule),
  ],
  controllers: [SoporteController],
  providers: [SoporteService],
  exports: [SoporteService],
})
export class SoporteModule {}
