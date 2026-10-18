import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';

// ⭐ Antes el token se aceptaba sin mirar la BD: un usuario desactivado (o borrado) seguía
// entrando hasta que caducara su token, y un cambio de rol no se aplicaba. Ahora se
// comprueba en BD, con una caché corta para no hacer una consulta en cada petición.
const CACHE_MS = 30_000;
const cache = new Map<string, { activo: boolean; rol: string; email: string; passwordCambiadaEn: number; hasta: number }>();

/** Olvida lo cacheado de un usuario (al desactivarlo, reactivarlo, cambiarle el rol o la contraseña). */
export function invalidarCacheUsuario(id: string) {
  cache.delete(id);
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') as string,
    });
  }

  async validate(payload: any) {
    const id = payload?.sub;
    if (!id) throw new UnauthorizedException();

    const ahora = Date.now();
    let datos = cache.get(id);
    if (!datos || datos.hasta < ahora) {
      const u = await this.usuarioRepo.findOne({
        where: { id },
        select: { id: true, activo: true, rol: true, email: true, passwordCambiadaEn: true },
      });
      if (!u) {
        cache.delete(id);
        throw new UnauthorizedException('La cuenta no existe');
      }
      datos = {
        activo: u.activo !== false,
        rol: u.rol,
        email: u.email,
        passwordCambiadaEn: u.passwordCambiadaEn ? new Date(u.passwordCambiadaEn).getTime() : 0,
        hasta: ahora + CACHE_MS,
      };
      cache.set(id, datos);
      if (cache.size > 20_000) cache.clear();
    }
    if (!datos.activo) throw new UnauthorizedException('Tu cuenta está desactivada');

    // ⭐ Token emitido antes del último cambio de contraseña → sesión cerrada.
    // `iat` va en segundos; se compara al segundo para no tumbar el token del login inmediato.
    if (datos.passwordCambiadaEn && typeof payload.iat === 'number' && payload.iat < Math.floor(datos.passwordCambiadaEn / 1000)) {
      throw new UnauthorizedException('Tu contraseña ha cambiado. Vuelve a entrar con la nueva.');
    }

    return { id, email: datos.email, rol: datos.rol };
  }
}
