import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Titulo } from './titulo.entity';
import { Capitulo } from './capitulo.entity';
import { Articulo } from './articulo.entity';
import { PreguntaCorta } from './pregunta-corta.entity';
import { NotaArticulo } from './nota-articulo.entity';
import { SubrayadoArticulo } from './subrayado-articulo.entity';
import { VersionLey } from '../ley/version-ley.entity';
import { Flashcard } from '../flashcard/flashcard.entity';
import { PreguntaBanco } from '../tema/pregunta-banco.entity';
import { NormativaController } from './normativa.controller';
import { NormativaService } from './normativa.service';
import { NotificacionModule } from '../notificacion/notificacion.module';
import { Seccion } from './seccion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Titulo, Capitulo, Articulo, PreguntaCorta,
      NotaArticulo, SubrayadoArticulo,
      VersionLey, Flashcard, PreguntaBanco, Seccion
    ]),
    NotificacionModule,
  ],
  controllers: [NormativaController],
  providers: [NormativaService],
  exports: [NormativaService],
})
export class NormativaModule {}