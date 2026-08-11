import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PreferenciaWidget } from './preferencia-widget.entity';

@Injectable()
export class PreferenciaWidgetService {
  constructor(
    @InjectRepository(PreferenciaWidget)
    private readonly repo: Repository<PreferenciaWidget>,
  ) {}

  async get(usuarioId: string, ubicacion: string): Promise<string> {
    const pref = await this.repo.findOne({
      where: { usuario: { id: usuarioId }, ubicacion },
    });
    return pref?.variante ?? 'semana'; // valor por defecto
  }

  async set(usuarioId: string, ubicacion: string, variante: string): Promise<PreferenciaWidget> {
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