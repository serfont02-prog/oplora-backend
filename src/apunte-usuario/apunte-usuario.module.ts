import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApunteUsuario } from './apunte-usuario.entity';
import { ApunteUsuarioService } from './apunte-usuario.service';
import { ApunteUsuarioController } from './apunte-usuario.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ApunteUsuario])],
  controllers: [ApunteUsuarioController],
  providers: [ApunteUsuarioService],
  exports: [ApunteUsuarioService],
})
export class ApunteUsuarioModule {}