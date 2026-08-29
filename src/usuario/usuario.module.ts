import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './usuario.entity';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { UsuarioOposicion } from './usuario-oposicion.entity';
import { Oposicion } from '../oposicion/oposicion.entity';
import { ConfiguracionModule } from '../config/configuracion.module';
import { PasswordResetService } from './password-reset.service';
import { UsuarioConvocatoriaHistorial } from './usuario-convocatoria-historial.entity';
import { Convocatoria } from '../convocatoria/convocatoria.entity';
import { RepasoFC } from '../flashcard/repaso-fc.entity';
import { Flashcard } from '../flashcard/flashcard.entity';
import { ApunteOplora } from '../apunte-oplora/apunte-oplora.entity';
import { ProgresoLectura } from '../apunte-oplora/progreso-lectura.entity';
import { ApunteUsuario } from '../apunte-usuario/apunte-usuario.entity';
import { Tema } from '../tema/tema.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      UsuarioOposicion,
      Oposicion,
      UsuarioConvocatoriaHistorial,
      Convocatoria, RepasoFC, Flashcard, ApunteOplora, ProgresoLectura, ApunteUsuario, Tema, 
    ]),
    ConfiguracionModule,
  ],
 providers: [UsuarioService, PasswordResetService], 
  exports: [UsuarioService, PasswordResetService], 
  controllers: [UsuarioController],
})
export class UsuarioModule {}