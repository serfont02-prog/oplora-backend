import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Configuracion } from '../config/configuracion.entity';
import { Oposicion } from '../oposicion/oposicion.entity';
import { InteresTemarioPapel } from './interes-temario-papel.entity';
import { TemarioPapelService } from './temario-papel.service';
import { TemarioPapelController } from './temario-papel.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Configuracion, Oposicion, InteresTemarioPapel])],
  controllers: [TemarioPapelController],
  providers: [TemarioPapelService],
})
export class TemarioPapelModule {}
