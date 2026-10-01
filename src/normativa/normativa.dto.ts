import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class EditarArticuloDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  contenido?: string;

  @IsOptional()
  @IsBoolean()
  vigente?: boolean;
}

export class EditarDisposicionDto {
  @IsOptional()
  @IsString()
  contenido?: string;

  @IsOptional()
  @IsString()
  etiqueta?: string;
}
