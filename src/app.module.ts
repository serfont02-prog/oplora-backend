  import { Module } from '@nestjs/common';
  import { ConfigModule, ConfigService } from '@nestjs/config';
  import { TypeOrmModule } from '@nestjs/typeorm';
  import { ScheduleModule } from '@nestjs/schedule';
  import { OposicionModule } from './oposicion/oposicion.module';
  import { ConvocatoriaModule } from './convocatoria/convocatoria.module';
  import { LeyModule } from './ley/ley.module';
  import { IaModule } from './ia/ia.module';
  import { UsuarioModule } from './usuario/usuario.module';
  import { AuthModule } from './auth/auth.module';
  import { TestModule } from './test/test.module';
  import { TemaModule } from './tema/tema.module';
  import { NormativaModule } from './normativa/normativa.module';
  import { NotificacionModule } from './notificacion/notificacion.module';
  import { RetoModule } from './reto/reto.module';
  import { FlashcardModule } from './flashcard/flashcard.module';
  import { BoeModule } from './boe/boe.module';
  import { ConfiguracionModule } from './config/configuracion.module';
  import { ApunteOploraModule } from './apunte-oplora/apunte-oplora.module';
  import { ApunteUsuarioModule } from './apunte-usuario/apunte-usuario.module';
  import { SesionTemaModule } from './sesion-tema/sesion-tema.module';
  import { PreferenciaWidgetModule } from './preferencia-widget/preferencia-widget.module';


@Module({
  imports: [
    BoeModule,
    ConfiguracionModule,
    PreferenciaWidgetModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
        return {
      type: 'postgres',
      host: config.get('DB_HOST'),
      port: config.get<number>('DB_PORT'),
      username: config.get('DB_USERNAME'),
      password: config.get('DB_PASSWORD'),
      database: config.get('DB_NAME'),
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // solo en desarrollo
    };
  },
}),
OposicionModule,
ConvocatoriaModule,
LeyModule,
IaModule,
UsuarioModule,
AuthModule,
TestModule,
TemaModule,
NormativaModule,
NotificacionModule,
RetoModule,
FlashcardModule,
ApunteOploraModule,
ApunteUsuarioModule,
SesionTemaModule,
  ],
})
export class AppModule {} 