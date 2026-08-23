import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ley } from './ley.entity';
import { VersionLey } from './version-ley.entity';
import { DiffVersion } from './diff-version.entity';
import { OposicionLey } from './oposicion-ley.entity';
import { LeyService } from './ley.service';
import { LeyController } from './ley.controller';
import { ParseoService } from './parseo.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Titulo } from '../normativa/titulo.entity';
import { Capitulo } from '../normativa/capitulo.entity';
import { Articulo } from '../normativa/articulo.entity';
import { Seccion } from '../normativa/seccion.entity';
import { Libro } from '../normativa/libro.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ley, VersionLey, DiffVersion, OposicionLey,
      Titulo, Capitulo, Articulo, Seccion, Libro,
    ]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
      fileFilter: (_, file, cb) => {
        const allowed = ['.pdf', '.txt'];
        const ext = extname(file.originalname).toLowerCase();
        cb(null, allowed.includes(ext));
      },
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  ],
  controllers: [LeyController],
  providers: [LeyService, ParseoService],
  exports: [LeyService, ParseoService],
})
export class LeyModule {}