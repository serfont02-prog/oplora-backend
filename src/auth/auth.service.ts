import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from '../usuario/usuario.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
  ) {}

  async registro(datos: {
    email: string;
    nombre: string;
    apellidos?: string;
    nick?: string;
    password: string;
    dni?: string;
    notificacionesListas?: boolean;
  }) {
    const usuario = await this.usuarioService.crear(datos);
    const token = this.generarToken(usuario);
    return { usuario: this.sanitizar(usuario), token };
  }

  async login(emailONick: string, password: string): Promise<{ usuario: any; token: string }> {
    // Buscar por email o nick
    let usuario = await this.usuarioService.findByEmail(emailONick);
    if (!usuario) {
      usuario = await this.usuarioService.findByNick(emailONick);
    }

    if (!usuario) throw new UnauthorizedException('Usuario no encontrado');

    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) throw new UnauthorizedException('Contraseña incorrecta');

    const token = this.generarToken(usuario);

    return {
      usuario: this.sanitizar(usuario),
      token,
    };
  }

  async perfil(id: string) {
    const usuario = await this.usuarioService.findById(id);
    if (!usuario) throw new UnauthorizedException();
    return this.sanitizar(usuario);
  }

  private generarToken(usuario: any) {
    return this.jwtService.sign({
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });
  }

  private sanitizar(usuario: any) {
  return {
    id: usuario.id,
    email: usuario.email,
    nombre: usuario.nombre,
    apellidos: usuario.apellidos,
    nick: usuario.nick,
    rol: usuario.rol,
    puntos: usuario.puntos,
    nivel: usuario.nivel,
    estado: usuario.estado,
    onboardingGeneralCompletado: usuario.onboardingGeneralCompletado,
  };
}
}
