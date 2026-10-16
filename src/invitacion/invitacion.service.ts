import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Resend } from 'resend';
import { Invitacion } from './invitacion.entity';
import { Usuario } from '../usuario/usuario.entity';
import { UsuarioOposicion } from '../usuario/usuario-oposicion.entity';
import { Oposicion } from '../oposicion/oposicion.entity';

const MAX_DIA = 10;
const DIAS_ENTRE_REPETIDAS = 7;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const esc = (s: any) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

@Injectable()
export class InvitacionService {
  private readonly logger = new Logger('InvitacionService');
  private resend = new Resend(process.env.RESEND_API_KEY);

  constructor(
    @InjectRepository(Invitacion) private readonly repo: Repository<Invitacion>,
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(UsuarioOposicion) private readonly uoRepo: Repository<UsuarioOposicion>,
    @InjectRepository(Oposicion) private readonly oposicionRepo: Repository<Oposicion>,
  ) {}

  /**
   * Qué tipo de invitación corresponde a `destino` (nick o email) para la oposición dada, sin
   * enviar nada. No devuelve el email de nadie.
   */
  async estado(remitenteId: string, destino: string, oposicionId?: string) {
    const d = (destino ?? '').trim().toLowerCase();
    if (!d) return { puedeInvitar: false, motivo: 'vacio' };
    let usuario = await this.usuarioRepo.findOne({ where: { nick: d } });
    if (!usuario) usuario = await this.usuarioRepo.findOne({ where: { email: d } });

    if (!usuario) {
      return EMAIL_RE.test(d)
        ? { puedeInvitar: true, tipo: 'app' }
        : { puedeInvitar: false, motivo: 'nick_desconocido' }; // un nick inexistente no tiene a quién escribir
    }
    if (usuario.id === remitenteId) return { puedeInvitar: false, motivo: 'tu_mismo' };
    if (!oposicionId) return { puedeInvitar: false, motivo: 'ya_tiene_cuenta' };

    const suyo = await this.uoRepo.findOne({ where: { usuario: { id: usuario.id } as any, oposicion: { id: oposicionId } as any }, relations: ['convocatoriaActiva'] });
    if (!suyo) return { puedeInvitar: true, tipo: 'oposicion', nombre: usuario.nick ?? usuario.nombre };
    const mio = await this.uoRepo.findOne({ where: { usuario: { id: remitenteId } as any, oposicion: { id: oposicionId } as any }, relations: ['convocatoriaActiva'] });
    if (mio?.convocatoriaActiva?.id && suyo.convocatoriaActiva?.id !== mio.convocatoriaActiva.id) {
      return { puedeInvitar: true, tipo: 'convocatoria', nombre: usuario.nick ?? usuario.nombre };
    }
    return { puedeInvitar: false, motivo: 'ya_esta', nombre: usuario.nick ?? usuario.nombre };
  }

  async enviar(remitenteId: string, datos: { destino: string; oposicionId?: string; motivo?: string; mensaje?: string }) {
    const destino = (datos.destino ?? '').trim().toLowerCase();
    const est: any = await this.estado(remitenteId, destino, datos.oposicionId);
    if (!est.puedeInvitar) {
      const textos: Record<string, string> = {
        vacio: 'Escribe un email.',
        nick_desconocido: 'No hay nadie con ese nick. Escribe su email para invitarle.',
        tu_mismo: 'No puedes invitarte a ti mismo.',
        ya_tiene_cuenta: 'Esa persona ya usa OPLORA.',
        ya_esta: 'Esa persona ya prepara tu misma oposición y convocatoria: ¡rétale directamente!',
      };
      throw new BadRequestException(textos[est.motivo] ?? 'No se puede enviar la invitación.');
    }

    const remitente = await this.usuarioRepo.findOne({ where: { id: remitenteId } });
    if (!remitente) throw new BadRequestException('Usuario no encontrado');

    // Email real del destinatario (si tiene cuenta se busca en servidor; nunca se envía al cliente)
    let emailDestino = destino;
    if (est.tipo !== 'app') {
      const u = (await this.usuarioRepo.findOne({ where: { nick: destino } })) ?? (await this.usuarioRepo.findOne({ where: { email: destino } }));
      if (!u?.email) throw new BadRequestException('No se puede enviar la invitación.');
      emailDestino = u.email.toLowerCase();
    }

    // Límites anti-spam
    const hace24h = new Date(Date.now() - 24 * 3600 * 1000);
    const enviadasHoy = await this.repo.count({ where: { remitente: { id: remitenteId } as any, creadoEn: MoreThan(hace24h) } as any });
    if (enviadasHoy >= MAX_DIA) throw new BadRequestException(`Has enviado ${MAX_DIA} invitaciones hoy. Vuelve a intentarlo mañana.`);
    const haceN = new Date(Date.now() - DIAS_ENTRE_REPETIDAS * 24 * 3600 * 1000);
    const repetida = await this.repo.findOne({ where: { remitente: { id: remitenteId } as any, emailDestino, creadoEn: MoreThan(haceN) } as any });
    if (repetida) throw new BadRequestException('Ya invitaste a esta persona hace poco. Espera unos días antes de volver a hacerlo.');

    const oposicion = datos.oposicionId ? await this.oposicionRepo.findOne({ where: { id: datos.oposicionId } }) : null;
    const mio = datos.oposicionId
      ? await this.uoRepo.findOne({ where: { usuario: { id: remitenteId } as any, oposicion: { id: datos.oposicionId } as any }, relations: ['convocatoriaActiva'] })
      : null;
    const conv: any = mio?.convocatoriaActiva;
    const nombreRemitente = remitente.nick ? `@${remitente.nick}` : (remitente.nombre ?? 'Un opositor');
    const base = process.env.FRONTEND_URL ?? 'https://oplora.app';
    const mensaje = (datos.mensaje ?? '').slice(0, 300).trim();
    const esReto = datos.motivo === 'reto';

    let asunto: string;
    let titulo: string;
    let cuerpo: string;
    let boton: string;
    let url: string;
    if (est.tipo === 'app') {
      asunto = esReto ? `${nombreRemitente} quiere retarte en OPLORA` : `${nombreRemitente} te invita a OPLORA`;
      titulo = esReto ? 'Te han retado' : 'Te invitan a OPLORA';
      cuerpo = `${esc(nombreRemitente)} está preparando ${oposicion ? `<strong>${esc(oposicion.nombre)}</strong>` : 'su oposición'} con OPLORA y quiere que ${esReto ? 'os midáis en un duelo de test' : 'prepares la oposición con él o ella'}. Crea tu cuenta gratis para empezar.`;
      boton = 'Crear mi cuenta';
      url = `${base}/app/registro${remitente.nick ? `?ref=${encodeURIComponent(remitente.nick)}` : ''}`;
    } else if (est.tipo === 'oposicion') {
      asunto = `${nombreRemitente} te invita a preparar ${oposicion?.nombre ?? 'su oposición'}`;
      titulo = 'Una oposición nueva para ti';
      cuerpo = `${esc(nombreRemitente)} prepara <strong>${esc(oposicion?.nombre ?? '')}</strong> en OPLORA y te invita a unirte${esReto ? ' para poder retaros' : ''}. Puedes añadirla desde tu perfil, en "Cambiar de oposición".`;
      boton = 'Abrir OPLORA';
      url = `${base}/app/onboarding/oposicion?modo=cambiar`;
    } else {
      asunto = `${nombreRemitente} te espera en la convocatoria ${conv?.anyo ?? ''}`.trim();
      titulo = 'Pásate a su convocatoria';
      cuerpo = `${esc(nombreRemitente)} prepara la convocatoria <strong>${esc(conv?.anyo ?? '')}</strong> de ${esc(oposicion?.nombre ?? 'tu oposición')}. Para ${esReto ? 'poder retaros' : 'estudiar lo mismo'}, cambia tu convocatoria en los ajustes de la oposición.`;
      boton = 'Ir a mis ajustes';
      url = `${base}/app/oposicion/${datos.oposicionId}/cambiar-convocatoria`;
    }

    const html = `
      <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #F7F8FA;">
        <div style="background: #ffffff; border-radius: 18px; padding: 24px;">
          <div style="font-size: 12px; font-weight: 700; color: #C2410C; letter-spacing: .06em; text-transform: uppercase;">OPLORA</div>
          <h2 style="color: #111827; margin: 8px 0 10px; font-size: 20px;">${esc(titulo)}</h2>
          <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0 0 14px;">${cuerpo}</p>
          ${mensaje ? `<p style="color: #374151; font-size: 14px; line-height: 1.5; font-style: italic; background: #FBF7F5; border-radius: 12px; padding: 10px 12px; margin: 0 0 14px;">“${esc(mensaje)}”</p>` : ''}
          <a href="${url}" style="display: inline-block; background: #0f172a; color: #ffffff; padding: 12px 22px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">${esc(boton)}</a>
          <p style="color: #9CA3AF; font-size: 12px; margin: 18px 0 0;">Te escribimos porque ${esc(nombreRemitente)} nos dio tu dirección. Si no te interesa, ignora este email.</p>
        </div>
      </div>`;

    try {
      await this.resend.emails.send({
        from: process.env.MAIL_FROM ?? 'OPLORA <onboarding@resend.dev>',
        to: emailDestino,
        subject: asunto,
        html,
      });
    } catch (e: any) {
      this.logger.error(`Invitación a ${emailDestino}: ${e?.message}`);
      throw new BadRequestException('No se ha podido enviar el email ahora. Inténtalo más tarde.');
    }

    await this.repo.save(this.repo.create({
      emailDestino,
      tipo: est.tipo,
      motivo: esReto ? 'reto' : 'amigo',
      remitente: { id: remitenteId } as any,
      oposicion: datos.oposicionId ? ({ id: datos.oposicionId } as any) : null,
    }));

    return { enviada: true, tipo: est.tipo };
  }

  async misInvitaciones(remitenteId: string) {
    const lista = await this.repo.find({ where: { remitente: { id: remitenteId } as any }, order: { creadoEn: 'DESC' }, take: 20 });
    // Email parcialmente oculto: j***@gmail.com
    return lista.map((i) => ({
      id: i.id,
      email: i.emailDestino.replace(/^(.).*(@.*)$/, '$1***$2'),
      tipo: i.tipo,
      creadoEn: i.creadoEn,
    }));
  }
}
