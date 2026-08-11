import { Module } from '@nestjs/common';
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

import { IaModule } from '../ia/ia.module';
import { TemaModule } from '../tema/tema.module';
import { TemaNormativa } from '../tema/tema-normativa.entity';
import { ConfiguracionModule } from '../config/configuracion.module';

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
      Articulo
    ]),
   TemaModule,
  ],

  controllers: [TestController],

  providers: [TestService],

  exports: [TestService],

})
export class TestModule {}