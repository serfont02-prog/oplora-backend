import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PreferenciaWidget } from './preferencia-widget.entity';

// ⭐ Ubicación y variante con formato y longitud limitados (antes cualquier texto, sin tope)
const VALOR_VALIDO = /^[a-z0-9_-]{1,40}$/i;
function comprobar(valor: string, que: string) {
  if (typeof valor !== 'string' || !VALOR_VALIDO.test(valor)) throw new BadRequestException(`${que} no válida`);
}

@Injectable()
export class PreferenciaWidgetService {
  constructor(
    @InjectRepository(PreferenciaWidget)
    private readonly repo: Repository<PreferenciaWidget>,
  ) {}

  async get(usuarioId: string, ubicacion: string): Promise<string> {
    comprobar(ubicacion, 'Ubicación');
    const pref = await this.repo.findOne({
      where: { usuario: { id: usuarioId }, ubicacion },
    });
    return pref?.variante ?? 'semana'; // valor por defecto
  }

  async set(usuarioId: string, ubicacion: string, variante: string): Promise<PreferenciaWidget> {
    comprobar(ubicacion, 'Ubicación');
    comprobar(variante, 'Variante');
    let pref = await this.repo.findOne({
      where: { usuario: { id: usuarioId }, ubicacion },
    });

    if (pref) {
      pref.variante = variante;
      return this.repo.save(pref);
    }

    pref = this.repo.create({
      ubicacion,
      variante,
      usuario: { id: usuarioId } as any,
    });
    return this.repo.save(pref);
  }
}