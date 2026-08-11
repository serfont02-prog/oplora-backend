import { Usuario } from '../../usuario/usuario.entity';

export function esNuevoDia(fecha?: string | Date | null): boolean {
  if (!fecha) return true;

  const hoy = new Date().toISOString().split('T')[0];
  const fechaStr = fecha instanceof Date
    ? fecha.toISOString().split('T')[0]
    : String(fecha).split('T')[0];

  return fechaStr !== hoy;
}

export function actualizarRacha(usuario: Usuario): Usuario {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const ultima = usuario.ultimaActividad ? new Date(usuario.ultimaActividad) : null;
  if (ultima) ultima.setHours(0, 0, 0, 0);

  if (!ultima) {
    usuario.rachaActual = 1;
  } else {
    const diffDias = Math.round((hoy.getTime() - ultima.getTime()) / 86400000);
    if (diffDias === 0) {
      // Ya hubo actividad hoy, no se toca
    } else if (diffDias === 1) {
      usuario.rachaActual = (usuario.rachaActual ?? 0) + 1;
    } else {
      usuario.rachaActual = 1; // se rompió la racha
    }
  }

  if (usuario.rachaActual > (usuario.rachaMaxima ?? 0)) {
    usuario.rachaMaxima = usuario.rachaActual;
  }

  return usuario;
}

export function resetearConsumosSiEsNuevoDia(usuario: Usuario): Usuario {
  const hoy = new Date().toISOString().split('T')[0];

  // ⭐ Actualizar racha ANTES de tocar ultimaActividad (usa el valor previo)
  actualizarRacha(usuario);

  if (esNuevoDia(usuario.fechaResetConsumo)) {
    usuario.preguntasTestHoy = 0;
    usuario.flashcardsHoy = 0;
    usuario.temasRevisadosHoy = 0;
    usuario.fechaResetConsumo = hoy as any;
  }

  usuario.ultimaActividad = new Date();

  return usuario;
}