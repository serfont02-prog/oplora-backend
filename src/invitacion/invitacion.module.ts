import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invitacion } from './invitacion.entity';
import { InvitacionService } from './invitacion.service';
import { InvitacionController } from './invitacion.controller';
import { Usuario } from '../usuario/usuario.entity';
import { UsuarioOposicion } from '../usuario/usuario-oposicion.entity';
import { Oposicion } from '../oposicion/oposicion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invitacion, Usuario, UsuarioOposicion, Oposicion])],
  controllers: [InvitacionController],
  providers: [InvitacionService],
})
export class InvitacionModule {}
