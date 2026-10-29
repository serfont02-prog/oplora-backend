import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InicioDuelo } from './inicio-duelo.entity';
import { InicioDueloService } from './inicio-duelo.service';
import { InicioDueloController } from './inicio-duelo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InicioDuelo])],
  providers: [InicioDueloService],
  controllers: [InicioDueloController],
  exports: [InicioDueloService],
})
export class InicioDueloModule {}
