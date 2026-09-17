import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PsicotecnicoController } from './psicotecnico.controller';
import { PsicotecnicoService } from './psicotecnico.service';
import { PsicotecnicoConfigOposicion } from './psicotecnico-config-oposicion.entity';
import { PreguntaPsicotecnica } from './pregunta-psicotecnica.entity';
import { ResultadoPsicotecnico } from './resultado-psicotecnico.entity';
import { UsuarioOposicion } from '../usuario/usuario-oposicion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PsicotecnicoConfigOposicion,
      PreguntaPsicotecnica,
      ResultadoPsicotecnico,
      UsuarioOposicion,
    ]),
  ],
  controllers: [PsicotecnicoController],
  providers: [PsicotecnicoService],
  exports: [PsicotecnicoService],
})
export class PsicotecnicoModule {}
