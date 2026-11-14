import { BadRequestException, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Usuario } from '../usuario/usuario.entity';
import { Pago } from './pago.entity';
import { IdPlan, PLANES } from './planes';

/**
 * ⭐ Cobro con Stripe (tarjeta y Bizum). Sin librería: llamadas directas a la API de Stripe.
 * Variables de entorno:
 *   STRIPE_SECRET_KEY      clave secreta (sk_test_… en pruebas, sk_live_… en real)
 *   STRIPE_WEBHOOK_SECRET  secreto del webhook (whsec_…)
 *   FRONTEND_URL           para volver a la app tras pagar
 * Bizum y la tarjeta se activan en el panel de Stripe (Ajustes → Métodos de pago); aquí no se
 * fija el método, así que Stripe ofrece los que estén activos y valgan para cada caso
 * (Bizum solo en pagos únicos; la suscripción mensual, con tarjeta).
 */
@Injectable()
export class PagoService {
  private readonly logger = new Logger(PagoService.name);

  constructor(
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Pago) private readonly pagoRepo: Repository<Pago>,
  ) {}

  private get clave(): string {
    const k = process.env.STRIPE_SECRET_KEY;
    if (!k) throw new ServiceUnavailableException('Los pagos aún no están activados');
    return k;
  }

  private get frontend(): string {
    return (process.env.FRONTEND_URL || 'https://oplora-frontend.vercel.app').replace(/\/+$/, '');
  }

  pagosActivos(): boolean {
    return !!process.env.STRIPE_SECRET_KEY;
  }

  /** Llamada a la API de Stripe (application/x-www-form-urlencoded). */
  private async stripe(metodo: 'GET' | 'POST', ruta: string, params?: Record<string, string | number | undefined>): Promise<any> {
    const cuerpo = params
      ? new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()
      : undefined;
    const url = `https://api.stripe.com/v1/${ruta}${metodo === 'GET' && cuerpo ? `?${cuerpo}` : ''}`;
    const res = await fetch(url, {
      method: metodo,
      headers: { Authorization: `Bearer ${this.clave}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: metodo === 'POST' ? cuerpo : undefined,
    });
    const datos: any = await res.json().catch(() => ({}));
    if (!res.ok) {
      this.logger.error(`Stripe ${ruta}: ${datos?.error?.message ?? res.status}`);
      throw new BadRequestException('No se ha podido iniciar el pago. Inténtalo de nuevo en unos minutos.');
    }
    return datos;
  }

  /** Crea la página de pago de Stripe y devuelve su URL. */
  async crearCheckout(usuarioId: string, idPlan: string): Promise<{ url: string }> {
    const plan = PLANES[idPlan as IdPlan];
    if (!plan) throw new BadRequestException('Plan no válido');
    const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    if (plan.renovacion && usuario.renovacionAutomatica && usuario.stripeSubscriptionId) {
      throw new BadRequestException('Ya tienes la suscripción mensual activa');
    }

    const params: Record<string, string | number | undefined> = {
      mode: plan.renovacion ? 'subscription' : 'payment',
      locale: 'es',
      client_reference_id: usuario.id,
      'metadata[usuarioId]': usuario.id,
      'metadata[plan]': plan.id,
      'metadata[meses]': plan.meses,
      'line_items[0][quantity]': 1,
      'line_items[0][price_data][currency]': 'eur',
      'line_items[0][price_data][unit_amount]': plan.importeCentimos,
      'line_items[0][price_data][product_data][name]': plan.nombre,
      success_url: `${this.frontend}/app/suscripciones?pago=ok`,
      cancel_url: `${this.frontend}/app/suscripciones?pago=cancelado`,
    };
    if (plan.renovacion) {
      params['line_items[0][price_data][recurring][interval]'] = 'month';
      params['subscription_data[metadata][usuarioId]'] = usuario.id;
    } else {
      params['payment_intent_data[metadata][usuarioId]'] = usuario.id;
    }
    if (usuario.stripeCustomerId) {
      params.customer = usuario.stripeCustomerId;
    } else {
      params.customer_email = usuario.email;
      if (!plan.renovacion) params.customer_creation = 'always';
    }
    const sesion = await this.stripe('POST', 'checkout/sessions', params);
    return { url: sesion.url };
  }

  /** Portal de cliente de Stripe: cancelar la suscripción, cambiar tarjeta, ver facturas. */
  async crearPortal(usuarioId: string): Promise<{ url: string }> {
    const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
    if (!usuario?.stripeCustomerId) throw new BadRequestException('Aún no tienes pagos con tarjeta o Bizum');
    const sesion = await this.stripe('POST', 'billing_portal/sessions', {
      customer: usuario.stripeCustomerId,
      return_url: `${this.frontend}/app/suscripciones`,
    });
    return { url: sesion.url };
  }

  // ─── Webhook ───────────────────────────────────────────────────────────────────────────

  /** Comprueba la firma de Stripe (cabecera Stripe-Signature) sobre el cuerpo tal cual llegó. */
  verificarFirma(cuerpo: Buffer | undefined, cabecera: string | undefined): any {
    const secreto = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secreto) throw new ServiceUnavailableException('Webhook sin configurar');
    if (!cuerpo || !cabecera) throw new BadRequestException('Falta la firma');
    const partes = Object.fromEntries(cabecera.split(',').map((p) => p.split('=') as [string, string]).filter((p) => p.length === 2));
    const t = partes['t'];
    const firmas = cabecera.split(',').filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));
    if (!t || !firmas.length) throw new BadRequestException('Firma no válida');
    if (Math.abs(Date.now() / 1000 - Number(t)) > 300) throw new BadRequestException('Firma caducada');
    const esperada = crypto.createHmac('sha256', secreto).update(`${t}.${cuerpo.toString('utf8')}`).digest('hex');
    const ok = firmas.some((f) => f.length === esperada.length && crypto.timingSafeEqual(Buffer.from(f), Buffer.from(esperada)));
    if (!ok) throw new BadRequestException('Firma no válida');
    return JSON.parse(cuerpo.toString('utf8'));
  }

  async procesarEvento(evento: any): Promise<void> {
    const obj = evento?.data?.object ?? {};
    switch (evento?.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        await this.alCompletarCheckout(obj);
        break;
      case 'invoice.paid':
        await this.alPagarFactura(obj);
        break;
      case 'customer.subscription.updated':
        await this.usuarioRepo.update(
          { stripeSubscriptionId: obj.id },
          { renovacionAutomatica: obj.status === 'active' && !obj.cancel_at_period_end },
        );
        break;
      case 'customer.subscription.deleted':
        await this.usuarioRepo.update({ stripeSubscriptionId: obj.id }, { renovacionAutomatica: false, stripeSubscriptionId: null });
        break;
      default:
        break; // el resto de avisos no hacen falta
    }
  }

  private async alCompletarCheckout(sesion: any): Promise<void> {
    const usuarioId: string | undefined = sesion.client_reference_id ?? sesion.metadata?.usuarioId;
    if (!usuarioId) return;
    const cambios: Partial<Usuario> = {};
    if (sesion.customer) cambios.stripeCustomerId = String(sesion.customer);
    if (sesion.mode === 'subscription') {
      // El acceso de la suscripción lo da cada factura pagada (invoice.paid)
      if (sesion.subscription) cambios.stripeSubscriptionId = String(sesion.subscription);
      cambios.renovacionAutomatica = true;
      await this.usuarioRepo.update(usuarioId, cambios);
      return;
    }
    if (Object.keys(cambios).length) await this.usuarioRepo.update(usuarioId, cambios);
    // Pago único: solo cuando está cobrado (Bizum y tarjeta llegan ya pagados; otros métodos,
    // con async_payment_succeeded)
    if (sesion.payment_status !== 'paid') return;
    const meses = Math.max(1, Math.min(24, Number(sesion.metadata?.meses) || 1));
    await this.registrarPago(usuarioId, `cs:${sesion.id}`, 'unico', sesion.amount_total ?? 0, (hasta) => sumarMeses(hasta, meses), meses);
  }

  private async alPagarFactura(factura: any): Promise<void> {
    const suscripcionId = factura.subscription ?? factura.parent?.subscription_details?.subscription;
    if (!suscripcionId) return;
    let usuarioId: string | undefined =
      factura.subscription_details?.metadata?.usuarioId ?? factura.parent?.subscription_details?.metadata?.usuarioId;
    if (!usuarioId) {
      const u = await this.usuarioRepo.findOne({ where: [{ stripeSubscriptionId: String(suscripcionId) }, { stripeCustomerId: String(factura.customer) }] });
      usuarioId = u?.id;
    }
    if (!usuarioId) return;
    const linea = factura.lines?.data?.[0];
    const finPeriodo = linea?.period?.end ? new Date(linea.period.end * 1000) : null;
    await this.usuarioRepo.update(usuarioId, {
      stripeSubscriptionId: String(suscripcionId),
      stripeCustomerId: factura.customer ? String(factura.customer) : undefined,
      renovacionAutomatica: true,
    } as any);
    // Hasta el fin del periodo pagado + 1 día de margen mientras Stripe cobra el siguiente
    await this.registrarPago(usuarioId, `in:${factura.id}`, 'suscripcion', factura.amount_paid ?? 0, (hasta) => {
      const fin = finPeriodo ? new Date(finPeriodo.getTime() + 24 * 60 * 60 * 1000) : sumarMeses(hasta, 1);
      return fin > hasta ? fin : hasta;
    }, 1);
  }

  /**
   * Registra el pago una sola vez (stripeId único) y alarga el acceso desde lo que ya tenía
   * pagado (si aún no había caducado) o desde hoy.
   */
  private async registrarPago(
    usuarioId: string,
    stripeId: string,
    tipo: 'unico' | 'suscripcion',
    importeCentimos: number,
    nuevoHasta: (desde: Date) => Date,
    meses: number,
  ): Promise<void> {
    await this.pagoRepo.manager.transaction(async (m) => {
      const insertado = await m.query(
        `INSERT INTO pagos (id, "usuarioId", "stripeId", tipo, meses, "importeCentimos", "creadoEn")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, now())
         ON CONFLICT ("stripeId") DO NOTHING RETURNING id`,
        [usuarioId, stripeId, tipo, meses, importeCentimos],
      );
      if (!insertado.length) return; // ya procesado
      const [u] = await m.query(`SELECT "accesoHasta" FROM usuarios WHERE id = $1 FOR UPDATE`, [usuarioId]);
      if (!u) return;
      const ahora = new Date();
      const desde = u.accesoHasta && new Date(u.accesoHasta) > ahora ? new Date(u.accesoHasta) : ahora;
      const hasta = nuevoHasta(desde);
      await m.query(`UPDATE usuarios SET "accesoHasta" = $1 WHERE id = $2`, [hasta, usuarioId]);
      await m.query(`UPDATE pagos SET "accesoHastaResultante" = $1 WHERE id = $2`, [hasta, insertado[0].id]);
    });
  }

  /** Historial de pagos del usuario (para la pantalla de suscripción). */
  async misPagos(usuarioId: string) {
    return this.pagoRepo.find({
      where: { usuario: { id: usuarioId } },
      order: { creadoEn: 'DESC' },
      take: 24,
      select: { id: true, tipo: true, meses: true, importeCentimos: true, creadoEn: true, accesoHastaResultante: true },
    });
  }
}

/** Suma meses de calendario (31 ene + 1 mes = 28/29 feb). */
export function sumarMeses(desde: Date, meses: number): Date {
  const d = new Date(desde.getTime());
  const dia = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + meses);
  const ultimo = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(dia, ultimo));
  return d;
}
