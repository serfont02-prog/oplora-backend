import { Usuario } from '../../usuario/usuario.entity';
import { diaMadrid, sumarDiasMadrid } from './dia.helper';

// ⭐ Todo por día de España (antes UTC: entre medianoche y la 1-2 h contaba como el día anterior).

export function esNuevoDia(fecha?: string | Date | null): boolean {
  if (!fecha) return true;
  const fechaStr = fecha instanceof Date ? diaMadrid(fecha) : String(fecha).split('T')[0];
  return fechaStr !== diaMadrid();
}

/**
 * Pone a cero los contadores del día (preguntas, flashcards…) si ha empezado otro día.
 * ⭐ Ya NO toca la racha ni la última actividad: antes, solo con abrir la app (pantalla de límites)
 * se apuntaba actividad y la racha subía sin estudiar; y al revés, si se estudiaba sin pasar por
 * esa pantalla, la racha no subía. La racha la lleva registrarDiaDeEstudio().
 */
export function resetearConsumosSiEsNuevoDia(usuario: Usuario): Usuario {
  if (esNuevoDia(usuario.fechaResetConsumo)) {
    usuario.preguntasTestHoy = 0;
    usuario.flashcardsHoy = 0;
    usuario.temasRevisadosHoy = 0;
    usuario.fechaResetConsumo = diaMadrid() as any;
  }
  return usuario;
}

/** Último día de España en que estudió (el guardado o, para cuentas antiguas, el de su última actividad). */
function ultimoDiaEstudio(usuario: Partial<Usuario>): string | null {
  const guardado = (usuario as any).ultimoDiaRacha as string | null | undefined;
  if (guardado) return String(guardado).split('T')[0];
  return usuario.ultimaActividad ? diaMadrid(usuario.ultimaActividad) : null;
}

/**
 * Racha que hay que ENSEÑAR: si el último día de estudio no es hoy ni ayer, la racha ya se ha roto
 * aunque en la base de datos siga el número viejo (se corrige al volver a estudiar).
 */
export function rachaVigente(usuario: Partial<Usuario>): number {
  const ultimo = ultimoDiaEstudio(usuario);
  if (!ultimo) return 0;
  const hoy = diaMadrid();
  if (ultimo === hoy || ultimo === sumarDiasMadrid(hoy, -1)) return usuario.rachaActual ?? 0;
  return 0;
}

/**
 * ⭐ Apunta que hoy ha estudiado (test, flashcards, psicotécnicos, duelos, liga) y actualiza la racha
 * en una sola sentencia (sin carreras entre dos peticiones a la vez):
 * - ya estudió hoy → igual; estudió ayer → +1; si no → empieza en 1.
 */
export async function registrarDiaDeEstudio(manager: { query: (sql: string, params?: any[]) => Promise<any> }, usuarioId: string): Promise<void> {
  const hoy = diaMadrid();
  const ayer = sumarDiasMadrid(hoy, -1);
  const ultimo = `COALESCE("ultimoDiaRacha", ((("ultimaActividad" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Madrid')::date))`;
  const nueva = `CASE WHEN ${ultimo} = $2::date THEN COALESCE("rachaActual", 0)
                      WHEN ${ultimo} = $3::date THEN COALESCE("rachaActual", 0) + 1
                      ELSE 1 END`;
  await manager.query(
    `UPDATE usuarios SET
       "rachaActual" = ${nueva},
       "rachaMaxima" = GREATEST(COALESCE("rachaMaxima", 0), ${nueva}),
       "ultimoDiaRacha" = $2::date,
       "ultimaActividad" = $4
     WHERE id = $1`,
    [usuarioId, hoy, ayer, new Date()],
  );
}
