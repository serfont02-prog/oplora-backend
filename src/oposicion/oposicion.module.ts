import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Oposicion } from './oposicion.entity';
import { OposicionService } from './oposicion.service';
import { OposicionController } from './oposicion.controller';
import { Convocatoria } from '../convocatoria/convocatoria.entity';
import { DocumentoConvocatoria } from 'src/convocatoria/documento-convocatoria.entity';
import { Tema } from '../tema/tema.entity';
import { NotaArticulo } from '../normativa/nota-articulo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Oposicion, Convocatoria, DocumentoConvocatoria, Tema, NotaArticulo])],
  controllers: [OposicionController],
  providers: [OposicionService],
  exports: [OposicionService],
})
export class OposicionModule {}