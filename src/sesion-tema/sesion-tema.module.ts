import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SesionTema } from './sesion-tema.entity';
import { SesionTemaService } from './sesion-tema.service';
import { SesionTemaController } from './sesion-tema.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SesionTema])],
  controllers: [SesionTemaController],
  providers: [SesionTemaService],
  exports: [SesionTemaService],
})
export class SesionTemaModule {}