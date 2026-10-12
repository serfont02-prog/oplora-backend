import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LigaService } from './liga.service';

/**
 * ⭐ Una sola tarea cada 5 minutos que revisa cada liga y hace lo que toque
 * (publicar el lunes, abrir el viernes, última llamada y cierre el domingo),
 * comparando con las horas de cada liga en hora de Madrid. Así los horarios se
 * pueden cambiar desde admin sin tocar código. Todos los pasos son idempotentes.
 */
@Injectable()
export class LigaCronService {
  private readonly logger = new Logger('LigaCron');
  private ejecutando = false;

  constructor(private readonly ligaService: LigaService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async revisarLigas() {
    if (this.ejecutando) return;
    this.ejecutando = true;
    try {
      await this.ligaService.tick(new Date());
    } catch (e: any) {
      this.logger.error(e?.message ?? e);
    } finally {
      this.ejecutando = false;
    }
  }
}
