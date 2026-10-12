import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Liga } from './liga.entity';
import { DivisionLiga } from './division-liga.entity';
import { MiembroLiga } from './miembro-liga.entity';
import { JornadaLiga } from './jornada-liga.entity';
import { ResultadoJornada } from './resultado-jornada.entity';
import { CierreMesLiga } from './cierre-mes-liga.entity';
import { CopaLiga } from './copa-liga.entity';
import { Convocatoria } from '../convocatoria/convocatoria.entity';
import { Tema } from '../tema/tema.entity';
import { PreguntaTest } from '../test/pregunta-test.entity';
import { PreguntaPsicotecnica } from '../psicotecnico/pregunta-psicotecnica.entity';
import { UsuarioOposicion } from '../usuario/usuario-oposicion.entity';
import { NotificacionModule } from '../notificacion/notificacion.module';
import { LigaService } from './liga.service';
import { LigaCronService } from './liga-cron.service';
import { LigaController, LigaAdminController } from './liga.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Liga,
      DivisionLiga,
      MiembroLiga,
      JornadaLiga,
      ResultadoJornada,
      CierreMesLiga,
      CopaLiga,
      Convocatoria,
      Tema,
      PreguntaTest,
      PreguntaPsicotecnica,
      UsuarioOposicion,
    ]),
    NotificacionModule,
  ],
  controllers: [LigaController, LigaAdminController],
  providers: [LigaService, LigaCronService],
  exports: [LigaService],
})
export class LigaModule {}
