import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TipoNoticia, OrigenNoticia, PrioridadNoticia } from './noticia.entity';

export class CreateNoticiaDto {
  @IsEnum(TipoNoticia)
  tipo: TipoNoticia;

  @IsOptional()
  @IsEnum(OrigenNoticia)
  origen?: OrigenNoticia; // si se omite en creación manual desde admin, se asume MANUAL_ADMIN

  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsOptional()
  @IsString()
  resumen?: string;

  @IsOptional()
  @IsString()
  contenido?: string;

  @IsOptional()
  @IsString()
  urlOrigen?: string;

  @IsOptional()
  @IsString()
  convocatoriaId?: string;

  @IsOptional()
  @IsString()
  oposicionId?: string;

  @IsOptional()
  @IsString()
  leyId?: string;

  @IsOptional()
  @IsString()
  versionLeyId?: string;

  @IsOptional()
  @IsString()
  documentoConvocatoriaId?: string;

  @IsOptional()
  @IsBoolean()
  destacada?: boolean;

  @IsOptional()
  @IsEnum(PrioridadNoticia)
  prioridad?: PrioridadNoticia;

  @IsOptional()
  @IsBoolean()
  publicada?: boolean;

  @IsOptional()
  @IsDateString()
  fechaProgramada?: string;

  @IsOptional()
  @IsDateString()
  fechaPublicacion?: string;

  @IsOptional()
  @IsBoolean()
  automatica?: boolean;
}

export class UpdateNoticiaDto {
  @IsOptional()
  @IsEnum(TipoNoticia)
  tipo?: TipoNoticia;

  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  resumen?: string;

  @IsOptional()
  @IsString()
  contenido?: string;

  @IsOptional()
  @IsString()
  urlOrigen?: string;

  @IsOptional()
  @IsString()
  convocatoriaId?: string;

  @IsOptional()
  @IsString()
  oposicionId?: string;

  @IsOptional()
  @IsString()
  leyId?: string;

  @IsOptional()
  @IsString()
  versionLeyId?: string;

  @IsOptional()
  @IsBoolean()
  destacada?: boolean;

  @IsOptional()
  @IsEnum(PrioridadNoticia)
  prioridad?: PrioridadNoticia;

  @IsOptional()
  @IsBoolean()
  publicada?: boolean;

  @IsOptional()
  @IsDateString()
  fechaProgramada?: string;

  @IsOptional()
  @IsDateString()
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
