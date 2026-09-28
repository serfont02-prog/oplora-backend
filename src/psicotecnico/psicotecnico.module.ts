import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PsicotecnicoController } from './psicotecnico.controller';
import { PsicotecnicoService } from './psicotecnico.service';
import { PsicotecnicoConfigOposicion } from './psicotecnico-config-oposicion.entity';
import { PreguntaPsicotecnica } from './pregunta-psicotecnica.entity';
import { ResultadoPsicotecnico } from './resultado-psicotecnico.entity';
import { UsuarioOposicion } from '../usuario/usuario-oposicion.entity';
import { Convocatoria } from '../convocatoria/convocatoria.entity';
import { RetoPsicotecnico } from './reto-psicotecnico.entity';
import { ResultadoRetoPsicotecnico } from './resultado-reto-psicotecnico.entity';
import { NotificacionModule } from '../notificacion/notificacion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PsicotecnicoConfigOposicion,
      PreguntaPsicotecnica,
      ResultadoPsicotecnico,
      UsuarioOposicion,
      Convocatoria,
      RetoPsicotecnico,
      ResultadoRetoPsicotecnico,
    ]),
    NotificacionModule,
  ],
  controllers: [PsicotecnicoController],
  providers: [PsicotecnicoService],
  exports: [PsicotecnicoService],
})
export class PsicotecnicoModule {}
