import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestController } from './test.controller';
import { TestService } from './test.service';
import { Articulo } from '../normativa/articulo.entity';
import { OposicionLey } from '../ley/oposicion-ley.entity';
import { PreguntaBanco } from '../tema/pregunta-banco.entity';
import { Tema } from '../tema/tema.entity';
import { ResultadoTest } from './resultado-test.entity';
import { PreguntaTest } from './pregunta-test.entity';
import { Usuario } from '../usuario/usuario.entity';
import { TemaModule } from '../tema/tema.module';
import { TemaNormativa } from '../tema/tema-normativa.entity';
import { ConfiguracionModule } from '../config/configuracion.module';
import { UsuarioOposicion } from '../usuario/usuario-oposicion.entity';
import { SesionTest } from './sesion-test.entity';
import { ExamenAnterior } from '../tema/examen-anterior.entity';
import { Convocatoria } from '../convocatoria/convocatoria.entity';
import { VersionLey } from '../ley/version-ley.entity';
import { ExamenOficialService } from './examen-oficial.service';
import { ExamenOficialController } from './examen-oficial.controller';

@Module({
  imports: [
    ConfiguracionModule,
    TypeOrmModule.forFeature([
      Articulo,
      OposicionLey,
      PreguntaBanco,
      Tema,
      ResultadoTest,
      Usuario,
      PreguntaTest,
      TemaNormativa,
      Tema,
      Articulo,
      UsuarioOposicion,
      SesionTest,
      ExamenAnterior,
      Convocatoria,
      VersionLey,
    ]),
    forwardRef(() => TemaModule), 
  ],

  controllers: [TestController, ExamenOficialController],
  providers: [TestService, ExamenOficialService],
  exports: [TestService],
})
export class TestModule {}