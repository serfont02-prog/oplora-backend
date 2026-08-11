import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Configuracion } from './configuracion.entity';

const DEFAULTS = {
  limites_planes: {
    gratuito: {
      preguntasPorTest: 5,
      preguntasPorTema: 5,
      preguntasTestDia: 20,
      flashcardsDia: 20,
      simulacros: false,
      oposiciones: 1,
      apuntes: false,
    },
    esencial: {
      preguntasPorTest: 50,
      preguntasPorTema: 25,
      preguntasTestDia: 200,
      flashcardsDia: 200,
      simulacros: true,
      oposiciones: 1,
      apuntes: true,
    },
    profesional: {
      preguntasPorTest: 200,
      preguntasPorTema: 100,
      preguntasTestDia: null,
      flashcardsDia: null,
      simulacros: true,
      oposiciones: null,
      apuntes: true,
    },
  },
  niveles_estudio: [
    { nivel: 1, nombre: 'Opositor', puntosMin: 0, puntosMax: 100, badge: '🌱' },
    { nivel: 2, nombre: 'Estudiante', puntosMin: 101, puntosMax: 300, badge: '📚' },
    { nivel: 3, nombre: 'Preparado', puntosMin: 301, puntosMax: 700, badge: '⚡' },
    { nivel: 4, nombre: 'Experto', puntosMin: 701, puntosMax: 1500, badge: '🎯' },
    { nivel: 5, nombre: 'Élite', puntosMin: 1501, puntosMax: null, badge: '🏆' },
  ],
  puntos_acciones: {
    preguntaCorrecta: 2,
    testCompletadoMas80: 10,
    testCompletadoMas60: 5,
    flashcardDominada: 5,
    rachaDiaria: 5,
    ganarReto: 20,
  },
};

@Injectable()
export class ConfiguracionService implements OnModuleInit {
  constructor(
    @InjectRepository(Configuracion)
    private readonly repo: Repository<Configuracion>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  private async seed() {
    for (const [clave, valor] of Object.entries(DEFAULTS)) {
      const existe = await this.repo.findOne({ where: { clave } });
      if (!existe) {
        await this.repo.save(this.repo.create({ clave, valor }));
      }
    }
  }

  async get(clave: string): Promise<any> {
    const config = await this.repo.findOne({ where: { clave } });
    return config?.valor ?? DEFAULTS[clave] ?? null;
  }

  async getAll(): Promise<Record<string, any>> {
    const configs = await this.repo.find();
    return Object.fromEntries(configs.map(c => [c.clave, c.valor]));
  }

  async set(clave: string, valor: any): Promise<Configuracion> {
    const config = await this.repo.findOne({ where: { clave } });
    if (config) {
      config.valor = valor;
      return this.repo.save(config);
    }
    return this.repo.save(this.repo.create({ clave, valor }));
  }

  async getLimitesPlanes() {
    return this.get('limites_planes');
  }

  async getNivelesEstudio() {
    return this.get('niveles_estudio');
  }

  async getPuntosAcciones() {
    return this.get('puntos_acciones');
  }

  async calcularNivelPorPuntos(puntos: number): Promise<number> {
    const niveles = await this.getNivelesEstudio();
    const nivel = niveles
      .slice()
      .reverse()
      .find((n: any) => puntos >= n.puntosMin);
    return nivel?.nivel ?? 1;
  }
}