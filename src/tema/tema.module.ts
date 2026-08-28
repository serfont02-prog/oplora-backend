import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tema } from './tema.entity';
import { TemaNormativa } from './tema-normativa.entity';
import { PreguntaBanco } from './pregunta-banco.entity';
import { ExamenAnterior } from './examen-anterior.entity';
import { TemaService } from './tema.service';
import { TemaController } from './tema.controller';
import { IaModule } from '../ia/ia.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Articulo } from '../normativa/articulo.entity';
import { Capitulo } from '../normativa/capitulo.entity';
import { Titulo } from '../normativa/titulo.entity';
import { Convocatoria } from '../convocatoria/convocatoria.entity';
import { Usuario } from '../usuario/usuario.entity';
import { TestModule } from '../test/test.module';
import { FlashcardModule } from '../flashcard/flashcard.module';
import { ApunteOploraModule } from '../apunte-oplora/apunte-oplora.module';
import { PreguntaTest } from 'src/test/pregunta-test.entity';
import { ApunteOplora } from '../apunte-oplora/apunte-oplora.entity'; 
import { Flashcard } from '../flashcard/flashcard.entity'; 
import { RepasoFC } from '../flashcard/repaso-fc.entity'; 
import { ApunteUsuario } from '../apunte-usuario/apunte-usuario.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tema, TemaNormativa, PreguntaBanco,
      ExamenAnterior,
      Articulo, Capitulo, Titulo, Convocatoria, Usuario, PreguntaTest, ApunteOplora, Flashcard, RepasoFC, ApunteUsuario
    ]),
    IaModule, ApunteOploraModule,
    forwardRef(() => TestModule),
    forwardRef(() => FlashcardModule),
    forwardRef(() => ApunteOploraModule),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  ],
  controllers: [TemaController],
  providers: [TemaService],
  exports: [TemaService],
})
export class TemaModule {}