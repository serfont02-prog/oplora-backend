import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InicioDuelo } from './inicio-duelo.entity';

export type TipoDuelo = 'test' | 'psico' | 'fc';
export const TIPOS_DUELO: TipoDuelo[] = ['test', 'psico', 'fc'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class InicioDueloService {
  constructor(@InjectRepository(InicioDuelo) private readonly repo: Repository<InicioDuelo>) {}

  /**
   * Marca el comienzo. Solo cuenta la PRIMERA vez: si sale y vuelve a entrar, el reloj sigue
   * corriendo (si no, bastaría con mirar las preguntas, salir y volver a empezar).
   */
  async empezar(tipo: TipoDuelo, retoId: string, usuarioId: string): Promise<{ iniciadoEn: Date }> {
    if (!TIPOS_DUELO.includes(tipo)) throw new BadRequestException('Tipo de duelo no válido');
    if (!UUID.test(String(retoId ?? ''))) throw new BadRequestException('Duelo no válido');
    await this.repo
      .createQueryBuilder()
      .insert()
      .into(InicioDuelo)
      .values({ tipo, retoId, usuarioId })
      .orIgnore()
      .execute();
    const fila = await this.repo.findOne({ where: { tipo, retoId, usuarioId } });
    return { iniciadoEn: fila!.iniciadoEn };
  }

  /**
   * Milisegundos desde que empezó. Si no consta el comienzo (versión antigua de la app o alguien
   * que se lo salta), se cuenta desde que se creó el duelo: se puede terminar, pero nunca sale a
   * cuenta para ganar un desempate.
   */
  async tiempoMs(tipo: TipoDuelo, retoId: string, usuarioId: string, creadoEn: Date | string | null | undefined): Promise<number> {
    const fila = await this.repo.findOne({ where: { tipo, retoId, usuarioId } });
    const desde = fila?.iniciadoEn ?? creadoEn ?? new Date();
    return Math.max(0, Date.now() - new Date(desde).getTime());
  }
}
