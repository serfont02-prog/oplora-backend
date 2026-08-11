import { Module, forwardRef  } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApunteOplora } from './apunte-oplora.entity';
import { ApunteOploraService } from './apunte-oplora.service';
import { ApunteOploraController } from './apunte-oplora.controller';
import { ProgresoLectura } from './progreso-lectura.entity';
import { SubrayadoApunte } from './subrayado-apunte.entity';
import { NormativaModule } from '../normativa/normativa.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([ApunteOplora, ProgresoLectura, SubrayadoApunte]),
    MulterModule.register({ storage: memoryStorage() }),
    forwardRef(() => NormativaModule),
  ],
  controllers: [ApunteOploraController],
  providers: [ApunteOploraService],
  exports: [ApunteOploraService],
})
export class ApunteOploraModule {}