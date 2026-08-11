import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SesionTema } from './sesion-tema.entity';

@Injectable()
export class SesionTemaService {
  constructor(
    @InjectRepository(SesionTema)
    private readonly repo: Repository<SesionTema>,
  ) {}

async registrar(usuarioId: string, temaId: string) {
  console.log('=== REGISTRAR SESIÓN ===', 'usuario:', usuarioId, 'tema:', temaId);

  const inicioHoy = new Date();
  inicioHoy.setHours(0, 0, 0, 0);
  const finHoy = new Date();
  finHoy.setHours(23, 59, 59, 999);

  const sesionHoy = await this.repo
    .createQueryBuilder('s')
    .where('s.usuario = :usuarioId', { usuarioId })
    .andWhere('s.tema = :temaId', { temaId })
    .andWhere('s.creadoEn BETWEEN :inicio AND :fin', { inicio: inicioHoy, fin: finHoy })
    .getOne();

  console.log('¿Sesión hoy encontrada?', sesionHoy?.id ?? 'NO');

  if (sesionHoy) {
  sesionHoy.ultimaVisita = new Date(); // ⭐ forzar el cambio para que TypeORM sí actualice
  const actualizada = await this.repo.save(sesionHoy);
  console.log('Sesión actualizada:', actualizada.id, actualizada.ultimaVisita);
  return actualizada;
}

  try {
    const sesion = this.repo.create({
      usuario: { id: usuarioId } as any,
      tema: { id: temaId } as any,
    });
    const guardada = await this.repo.save(sesion);
    console.log('NUEVA sesión guardada:', guardada.id, guardada.tema, guardada.ultimaVisita);
    return guardada;
  } catch (error: any) {
    console.error('ERROR guardando sesión:', error.message);
    throw error;
  }
}
  async getPorTema(usuarioId: string, temaId: string) {
    return this.repo.find({
      where: { usuario: { id: usuarioId }, tema: { id: temaId } },
      order: { creadoEn: 'DESC' },
    });
  }

  async getProgreso(usuarioId: string, temaId: string) {
    const sesiones = await this.getPorTema(usuarioId, temaId);

    const diasUnicos = new Set(
      sesiones.map((s) => s.creadoEn.toISOString().slice(0, 10)),
    );

    return {
      totalSesiones: sesiones.length,
      diasEstudiados: diasUnicos.size,
      ultimaSesion: sesiones[0]?.creadoEn ?? null,
    };
  }
 
async getUltimoTemaEstudiado(usuarioId: string, oposicionId: string) {
  const sesion = await this.repo
    .createQueryBuilder('s')
    .leftJoinAndSelect('s.tema', 'tema')
    .leftJoinAndSelect('tema.convocatoria', 'conv')
    .leftJoin('conv.oposicion', 'op')
    .where('s.usuario = :usuarioId', { usuarioId })
    .andWhere('op.id = :oposicionId', { oposicionId })
    .orderBy('s.ultimaVisita', 'DESC') 
    .getOne();

  if (!sesion) return null;

  return {
    temaId: sesion.tema.id,
    numeroTema: sesion.tema.numero,
    tituloTema: sesion.tema.titulo,
    ultimaVez: sesion.ultimaVisita,
  };
}
}