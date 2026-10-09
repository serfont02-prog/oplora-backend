import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Resend } from 'resend';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

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

  async solicitarReset(email: string): Promise<void> {
    const usuario = await this.repo.findOne({ where: { email: email?.toLowerCase().trim() } });

    // Por seguridad, no revelamos si el email existe o no
    if (!usuario) return;

    const token = crypto.randomBytes(32).toString('hex');
    const expira = new Date();
    expira.setMinutes(expira.getMinutes() + 30);

    // Invalidar cualquier token de reset anterior (no usado y no expirado) antes de crear el nuevo,
    // así solo el último enlace enviado por email es válido.
    await this.repo.update(usuario.id, {
      resetPasswordToken: hashToken(token),
      resetPasswordExpira: expira,
    });

    const urlReset = `${process.env.FRONTEND_URL}/app/resetear-password?token=${token}`;

    await this.resend.emails.send({
      from: 'OPLORA <onboarding@resend.dev>',
      to: email,
      subject: 'Recupera tu contraseña de OPLORA',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #111827;">Recupera tu contraseña</h2>
          <p style="color: #6b7280; font-size: 14px;">
            Hemos recibido una solicitud para restablecer tu contraseña. Este enlace caduca en 30 minutos.
          </p>
          <a href="${urlReset}" style="display: inline-block; background: #111827; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 700; margin: 16px 0;">
            Restablecer contraseña
          </a>
          <p style="color: #9ca3af; font-size: 12px;">
            Si no solicitaste esto, puedes ignorar este email.
          </p>
        </div>
      `,
    });
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
    });
  }
}