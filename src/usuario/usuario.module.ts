import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './usuario.entity';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { UsuarioOposicion } from './usuario-oposicion.entity';
import { Oposicion } from '../oposicion/oposicion.entity';
import { ConfiguracionModule } from '../config/configuracion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      UsuarioOposicion,
      Oposicion,
    ]),
    ConfiguracionModule,
  ],
  providers: [UsuarioService],
  exports: [UsuarioService],
  controllers: [UsuarioController],
})
export class UsuarioModule {}