import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from '../usuario/usuario.service';
import * as bcrypt from 'bcrypt';

// ⭐ Hash de relleno: si la cuenta no existe se compara igualmente contra él, para que la respuesta
// tarde lo mismo y no se pueda averiguar qué emails o nicks están registrados midiendo el tiempo.
const HASH_RELLENO = bcrypt.hashSync('oplora-cuenta-inexistente', 10);

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
    const credencialesInvalidas = 'Email, nick o contraseña incorrectos';

    // Buscar por email o nick (normalizado, igual que al crear el usuario)
    const valorNormalizado = emailONick?.toLowerCase().trim();
    let usuario = await this.usuarioService.findByEmail(valorNormalizado);
    if (!usuario) {
      usuario = await this.usuarioService.findByNick(valorNormalizado);
    }

    // ⭐ Se compara siempre (aunque no exista la cuenta) y no se escribe el email en los logs.
    const valido = await bcrypt.compare(String(password ?? ''), usuario?.password || HASH_RELLENO);
    if (!usuario || !valido) {
      console.warn(`Login fallido${usuario ? ` (cuenta ${usuario.id})` : ' (cuenta inexistente)'}`);
      throw new UnauthorizedException(credencialesInvalidas);
    }

    // ⭐ Antes un usuario desactivado podía seguir iniciando sesión
    if (usuario.activo === false) {
      throw new UnauthorizedException('Tu cuenta está desactivada. Escríbenos a soporte si crees que es un error.');
    }

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
    estado: usuario.estado,
    onboardingGeneralCompletado: usuario.onboardingGeneralCompletado,
  };
}
}
