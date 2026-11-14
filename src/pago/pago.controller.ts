import { Body, Controller, Get, Headers, HttpCode, Post, Req, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PagoService } from './pago.service';
import { PLANES } from './planes';

@Controller('pagos')
export class PagoController {
  constructor(private readonly service: PagoService) {}

  /** Planes y precios (público) y si los pagos están activados. */
  @Get('planes')
  planes() {
    return { activos: this.service.pagosActivos(), planes: Object.values(PLANES) };
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  checkout(@Body('plan') plan: string, @Request() req: any) {
    return this.service.crearCheckout(req.user.id, plan);
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard)
  portal(@Request() req: any) {
    return this.service.crearPortal(req.user.id);
  }

  @Get('mios')
  @UseGuards(JwtAuthGuard)
  mios(@Request() req: any) {
    return this.service.misPagos(req.user.id);
  }

  /** Avisos de Stripe. Sin token: se valida la firma con STRIPE_WEBHOOK_SECRET. */
  @Post('webhook')
  @HttpCode(200)
  async webhook(@Req() req: any, @Headers('stripe-signature') firma: string) {
    const evento = this.service.verificarFirma(req.rawBody, firma);
    await this.service.procesarEvento(evento);
    return { recibido: true };
  }
}
