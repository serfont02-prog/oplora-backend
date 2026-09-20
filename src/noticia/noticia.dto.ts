import { TipoNoticia, OrigenNoticia, PrioridadNoticia } from './noticia.entity';

export class CreateNoticiaDto {
  tipo!: TipoNoticia;
  origen?: OrigenNoticia; // si se omite en creación manual desde admin, se asume MANUAL_ADMIN
  titulo!: string;
  resumen?: string;
  contenido?: string;
  urlOrigen?: string;
  convocatoriaId?: string;
  oposicionId?: string;
  leyId?: string;
  versionLeyId?: string;
  documentoConvocatoriaId?: string;
  destacada?: boolean;
  prioridad?: PrioridadNoticia;
  publicada?: boolean;
  fechaProgramada?: string;
  fechaPublicacion?: string;
  automatica?: boolean;
}

export class UpdateNoticiaDto {
  tipo?: TipoNoticia;
  titulo?: string;
  resumen?: string;
  contenido?: string;
  urlOrigen?: string;
  convocatoriaId?: string;
  oposicionId?: string;
  leyId?: string;
  versionLeyId?: string;
  destacada?: boolean;
  prioridad?: PrioridadNoticia;
  publicada?: boolean;
  fechaProgramada?: string;
  fechaPublicacion?: string;
}

export interface FiltrosNoticiaAdmin {
  tipo?: TipoNoticia;
  convocatoriaId?: string;
  oposicionId?: string;
  estado?: 'publicada' | 'borrador' | 'programada';
}

export interface FiltrosFeedNoticia {
  convocatoriaId?: string;
  oposicionId?: string;
  tipos?: TipoNoticia[];
  limite?: number;
}
