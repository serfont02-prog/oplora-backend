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
      UsuarioOposicion
    ]),
    forwardRef(() => TemaModule), 
  ],

  controllers: [TestController],
  providers: [TestService],
  exports: [TestService],
})
export class TestModule {}