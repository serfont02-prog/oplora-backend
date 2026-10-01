import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLeyDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsString()
  referenciaBoe?: string;

  @IsOptional()
  @IsString()
  tipoNorma?: string;

  @IsOptional()
  @IsString()
  fechaPublicacion?: string;
}

export class VincularLeyDto {
  @IsString()
  @IsNotEmpty()
  leyId: string;

  @IsString()
  @IsNotEmpty()
  oposicionId: string;

  @IsOptional()
  @IsBoolean()
  obligatoria?: boolean;
}
