import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoeConvocatoria } from './boe.entity';
import { Oposicion } from '../oposicion/oposicion.entity';
import { Convocatoria } from '../convocatoria/convocatoria.entity';
import { BoeService } from './boe.service';
import { BoeController } from './boe.controller';
import { IaModule } from '../ia/ia.module';
import { Tema } from '../tema/tema.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BoeConvocatoria, Oposicion, Convocatoria, Tema]),
    IaModule,
  ],
  controllers: [BoeController],
  providers: [BoeService],
  exports: [BoeService],
})
export class BoeModule {}