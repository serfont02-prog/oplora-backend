import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Resend } from 'resend';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { invalidarCacheUsuario } from '../auth/jwt.strategy';

const escaparHtml = (s: string) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

// ⭐ En BD solo se guarda el hash del token: si alguien llegara a leer la columna,
// no podría usarla para cambiar la contraseña.
const hashToken = (token: string) => crypto.createHash('sha256').update(token ?? '').digest('hex');

@Injectable()
export class PasswordResetService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  constructor(
    @InjectRepository(Usuario)
    private readonly repo: Repository<Usuario>,
  ) {}

  // ⭐ Responde al momento y hace el trabajo después: así tarda lo mismo exista o no la cuenta
  // (antes, si existía, la respuesta esperaba al envío del correo y eso delataba el email).
  async solicitarReset(email: string): Promise<void> {
    this.procesarReset(email).catch((e) => console.error('Error en la recuperación de contraseña:', e?.message ?? e));
  }

  private async procesarReset(email: string): Promise<void> {
    const emailNormalizado = typeof email === 'string' ? email.toLowerCase().trim() : '';
    if (!emailNormalizado) return;
    const usuario = await this.repo.findOne({ where: { email: emailNormalizado } });

    // Por seguridad, no revelamos si el email existe o no
    if (!usuario) return;
    // ⭐ Una cuenta desactivada no puede recuperar la contraseña para volver a entrar
    if (usuario.activo === false) return;

    const token = crypto.randomBytes(32).toString('hex');
    const expira = new Date();
    expira.setMinutes(expira.getMinutes() + 30);

    // Invalidar cualquier token de reset anterior (no usado y no expirado) antes de crear el nuevo,
    // así solo el último enlace enviado por email es válido.
    await this.repo.update(usuario.id, {
      resetPasswordToken: hashToken(token),
      resetPasswordExpira: expira,
    });

    // ⭐ Si FRONTEND_URL no está definida, el enlace salía como "undefined/app/…" y no funcionaba.
    const base = (process.env.FRONTEND_URL || 'https://oplora-frontend.vercel.app').replace(/\/+$/, '');
    const urlReset = `${base}/app/resetear-password?token=${token}`;

    // ⭐ Remitente configurable (MAIL_FROM), igual que las invitaciones: con el remitente de pruebas
    // de Resend (onboarding@resend.dev) los correos solo llegan al dueño de la cuenta de Resend.
    // Si el envío falla no se lanza el error al cliente (eso revelaría que el email existe).
    try {
      await this.resend.emails.send({
        from: process.env.MAIL_FROM ?? 'OPLORA <onboarding@resend.dev>',
        to: usuario.email,
        subject: 'Recupera tu contraseña de OPLORA',
        html: `
          <div style="font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #EAF0FF;">
            <div style="background: #ffffff; border-radius: 20px; padding: 28px 24px;">
              <div style="font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 18px;">Oplora</div>
              <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 8px;">Hola, ${escaparHtml(usuario.nombre || '')}</h2>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 18px;">
                Hemos recibido una solicitud para cambiar la contraseña de tu cuenta. El enlace caduca en 30 minutos y solo se puede usar una vez.
              </p>
              <a href="${urlReset}" style="display: inline-block; background: #0f172a; color: #ffffff; padding: 13px 24px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">
                Crear contraseña nueva
              </a>
              <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 20px 0 0;">
                Si no has sido tú, ignora este correo: tu contraseña no cambiará.
              </p>
            </div>
          </div>
        `,
      });
    } catch (e: any) {
      console.error('Error enviando el correo de recuperación de contraseña:', e?.message ?? e);
    }
  }

  async validarToken(token: string): Promise<boolean> {
    if (!token) return false;
    const usuario = await this.repo.findOne({
      where: { resetPasswordToken: hashToken(token) },
      select: { id: true, resetPasswordExpira: true },
    });
    if (!usuario || !usuario.resetPasswordExpira) return false;
    return new Date() < new Date(usuario.resetPasswordExpira);
  }

  async resetearPassword(token: string, nuevaPassword: string): Promise<void> {
    if (!token) throw new BadRequestException('Token inválido');
    if (typeof nuevaPassword !== 'string' || nuevaPassword.length < 6) {
      throw new BadRequestException('La contraseña debe tener al menos 6 caracteres');
    }
    if (nuevaPassword.length > 72) {
      throw new BadRequestException('La contraseña no puede tener más de 72 caracteres');
    }
    const usuario = await this.repo.findOne({
      where: { resetPasswordToken: hashToken(token) },
      select: { id: true, resetPasswordExpira: true },
    });
    if (!usuario) throw new BadRequestException('Token inválido');
    if (!usuario.resetPasswordExpira || new Date() > new Date(usuario.resetPasswordExpira)) {
      throw new BadRequestException('El enlace ha caducado, solicita uno nuevo');
    }

    const passwordHasheada = await bcrypt.hash(nuevaPassword, 10);

    await this.repo.update(usuario.id, {
      password: passwordHasheada,
      resetPasswordToken: null,
      resetPasswordExpira: null,
      passwordCambiadaEn: new Date(), // ⭐ cierra todas las sesiones abiertas con la contraseña anterior
    });
    invalidarCacheUsuario(usuario.id);
  }
}