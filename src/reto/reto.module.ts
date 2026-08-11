import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reto } from './reto.entity';
import { ParticipacionReto } from './participacion-reto.entity';
import { RetoService } from './reto.service';
import { RetoController } from './reto.controller';
import { Usuario } from '../usuario/usuario.entity';
import { Tema } from '../tema/tema.entity';
import { TestModule } from '../test/test.module';
import { NotificacionModule } from '../notificacion/notificacion.module';
import { ContactoReciente } from './contacto-reciente.entity';
import { Convocatoria } from '../convocatoria/convocatoria.entity';
import { ConfiguracionModule } from '../config/configuracion.module'; // ⭐ añadir

@Module({
  imports: [
    TypeOrmModule.forFeature([Reto, ParticipacionReto, Usuario, Tema, ContactoReciente, Convocatoria]),
    TestModule,
    NotificacionModule,
    ConfiguracionModule, // ⭐ añadir
  ],
  controllers: [RetoController],
  providers: [RetoService],
  exports: [RetoService],
})
export class RetoModule {}