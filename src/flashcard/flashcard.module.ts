import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flashcard } from './flashcard.entity';
import { RepasoFC } from './repaso-fc.entity';
import { RetoFC } from './reto-fc.entity';
import { ResultadoRetoFC } from './resultado-reto-fc.entity';
import { FlashcardService } from './flashcard.service';
import { FlashcardController } from './flashcard.controller';
import { Articulo } from '../normativa/articulo.entity';
import { Tema } from '../tema/tema.entity';
import { Usuario } from '../usuario/usuario.entity';
import { NotificacionModule } from '../notificacion/notificacion.module';
import { ConfiguracionModule } from '../config/configuracion.module';




@Module({
  imports: [
    TypeOrmModule.forFeature([Flashcard, RepasoFC, RetoFC, ResultadoRetoFC, Articulo, Tema, Usuario]),
    NotificacionModule,
    ConfiguracionModule, // ⭐ aquí, fuera de forFeature
  ],
  controllers: [FlashcardController],
  providers: [FlashcardService],
  exports: [FlashcardService],
})
export class FlashcardModule {}