import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Convocatoria } from './convocatoria.entity';
import { DocumentoConvocatoria } from './documento-convocatoria.entity';
import { ConvocatoriaService } from './convocatoria.service';
import { ConvocatoriaController } from './convocatoria.controller';
import { ScraperService } from './scraper.service';
import { Oposicion } from 'src/oposicion/oposicion.entity';
import { Tema } from '../tema/tema.entity';
import { NotaArticulo } from '../normativa/nota-articulo.entity';
import { TemaNormativa } from '../tema/tema-normativa.entity';
import { UsuarioOposicion } from '../usuario/usuario-oposicion.entity';
import { NotificacionModule } from '../notificacion/notificacion.module';
import { TemaModule } from '../tema/tema.module';
import { Flashcard } from '../flashcard/flashcard.entity';
import { ApunteOplora } from '../apunte-oplora/apunte-oplora.entity';
import { PreguntaTest } from 'src/test/pregunta-test.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Convocatoria, Oposicion, DocumentoConvocatoria, Tema, TemaNormativa, NotaArticulo, UsuarioOposicion, Flashcard, ApunteOplora, PreguntaTest]),
    NotificacionModule,
    forwardRef(() => TemaModule),
  ],
  controllers: [ConvocatoriaController],
  providers: [ConvocatoriaService, ScraperService],
  exports: [ConvocatoriaService],
})
export class ConvocatoriaModule {}