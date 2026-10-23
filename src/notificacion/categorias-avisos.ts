import { TipoNotificacion } from './notificacion.entity';

/**
 * ⭐ Categorías de avisos que el usuario puede activar o desactivar en "Notificaciones y avisos".
 * Todas vienen activadas por defecto. Lo que no está aquí llega siempre
 * (respuestas de soporte, logros) o tiene sus propios ajustes (Liga Oplora).
 */
export const CATEGORIAS_AVISOS = ['retos', 'repasos', 'noticias', 'convocatoria', 'normativa'] as const;
export type CategoriaAviso = (typeof CATEGORIAS_AVISOS)[number];

const CATEGORIA_POR_TIPO: Partial<Record<TipoNotificacion, CategoriaAviso>> = {
  [TipoNotificacion.RETO_RECIBIDO]: 'retos',
  [TipoNotificacion.RETO_RESULTADO]: 'retos',
  // RETO_DIARIO se usa hoy para los recordatorios de repaso (temas y flashcards programados)
  [TipoNotificacion.RETO_DIARIO]: 'repasos',
  [TipoNotificacion.RACHA_PELIGRO]: 'repasos',
  [TipoNotificacion.NUEVA_NOTICIA]: 'noticias',
  [TipoNotificacion.NUEVA_CONVOCATORIA]: 'convocatoria',
  [TipoNotificacion.NUEVO_DOCUMENTO]: 'convocatoria',
  [TipoNotificacion.ADMITIDO]: 'convocatoria',
  [TipoNotificacion.EXCLUIDO]: 'convocatoria',
  [TipoNotificacion.PLAZO_IMPORTANTE]: 'convocatoria',
  [TipoNotificacion.CAMBIO_NORMATIVO]: 'normativa',
};

export function categoriaDeTipo(tipo: TipoNotificacion | string): CategoriaAviso | null {
  return CATEGORIA_POR_TIPO[tipo as TipoNotificacion] ?? null;
}

/** Preferencias completas: lo que no se haya tocado cuenta como activado. */
export function normalizarAvisos(guardadas?: Record<string, any> | null): Record<CategoriaAviso, boolean> {
  const res = {} as Record<CategoriaAviso, boolean>;
  for (const c of CATEGORIAS_AVISOS) res[c] = guardadas?.[c] !== false;
  return res;
}
