import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * ⭐ Filtro global de respuestas (seguridad / RGPD).
 *
 * Muchas consultas cargan la relación `usuario` / `retador` / `retado` / `creador`
 * completa y la devuelven tal cual: así salían al navegador el email, el DNI y el
 * token de recuperar contraseña de OTROS usuarios (rankings, retos, duelos...), lo
 * que permitía secuestrar cuentas.
 *
 * Este interceptor recorre cada respuesta y:
 *  1. Elimina SIEMPRE los campos secretos, sea quien sea el usuario.
 *  2. En objetos que son un Usuario distinto del que hace la petición, elimina
 *     también los datos privados (email, DNI, plan, contadores...). De otros solo
 *     quedan los públicos: id, nick, nombre, avatar, racha, nivel...
 *  Los administradores (rol 'admin') siguen viendo los datos privados de otros
 *  (panel de usuarios, soporte), pero nunca los secretos.
 */
const CAMPOS_SECRETOS = new Set(['password', 'resetPasswordToken', 'resetPasswordExpira']);

const CAMPOS_PRIVADOS_DE_OTROS = new Set([
  'email',
  'dni',
  'apellidos',
  'tiempoDisponible',
  'objetivo',
  'compromiso',
  'suscripcion',
  'fechaResetConsumo',
  'simulacrosHoy',
  'preguntasTestHoy',
  'flashcardsHoy',
  'temasRevisadosHoy',
  'ultimaActividad',
  'notificacionesListas',
  'emailVerificado',
  'rol',
  'estado',
  'activo',
  'onboardingGeneralCompletado',
]);

// Un objeto "parece un Usuario" si tiene id y email (las relaciones a Usuario
// siempre cargan el email salvo que se haya hecho un select explícito).
function esUsuario(obj: Record<string, any>): boolean {
  return typeof obj.id === 'string' && 'email' in obj && ('nick' in obj || 'nombre' in obj);
}

function limpiar(valor: any, yoId: string | null, esAdmin: boolean, vistos: WeakSet<object>): void {
  if (valor === null || typeof valor !== 'object') return;
  if (valor instanceof Date || Buffer.isBuffer(valor) || valor instanceof StreamableFile) return;
  if (vistos.has(valor)) return;
  vistos.add(valor);

  if (Array.isArray(valor)) {
    for (const item of valor) limpiar(item, yoId, esAdmin, vistos);
    return;
  }

  for (const campo of CAMPOS_SECRETOS) {
    if (campo in valor) delete valor[campo];
  }

  if (yoId && !esAdmin && esUsuario(valor) && valor.id !== yoId) {
    for (const campo of CAMPOS_PRIVADOS_DE_OTROS) {
      if (campo in valor) delete valor[campo];
    }
  }

  for (const clave of Object.keys(valor)) {
    limpiar(valor[clave], yoId, esAdmin, vistos);
  }
}

@Injectable()
export class SanitizarRespuestaInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    // Sin sesión (login, registro, endpoints públicos) solo se quitan los secretos.
    const yoId: string | null = req?.user?.id ?? null;
    const esAdmin = req?.user?.rol === 'admin';

    return next.handle().pipe(
      map((datos) => {
        limpiar(datos, yoId, esAdmin, new WeakSet());
        return datos;
      }),
    );
  }
}
