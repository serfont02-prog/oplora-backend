import { SubgrupoEnum, TipoAdministracionEnum, CategoriaEstadoEnum } from './oposicion.entity';
import { IsEnum, IsOptional, IsString, IsBoolean, IsNotEmpty, MaxLength } from 'class-validator';

// ⭐ Antes exigía `turno` (que vive en la convocatoria, no en la oposición) y no declaraba
// `tipoAdministracion` ni `categoria`: con whitelist el ValidationPipe los borraba y el alta
// fallaba siempre (tipoAdministracion es obligatorio en la tabla).

export class CreateOposicionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nombre: string;

  @IsOptional()
  @IsString()
  cuerpo?: string;

  @IsOptional()
  @IsString()
  administracion?: string;

  @IsOptional()
  @IsString()
  ministerio?: string;

  @IsEnum(TipoAdministracionEnum)
  tipoAdministracion: TipoAdministracionEnum;

  @IsOptional()
  @IsEnum(CategoriaEstadoEnum)
  categoria?: CategoriaEstadoEnum;

  @IsOptional()
  @IsEnum(SubgrupoEnum)
  subgrupo?: SubgrupoEnum;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}

export class UpdateOposicionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nombre?: string;

  @IsOptional()
  @IsString()
  cuerpo?: string;

  @IsOptional()
  @IsString()
  administracion?: string;

  @IsOptional()
  @IsString()
  ministerio?: string;

  @IsOptional()
  @IsEnum(TipoAdministracionEnum)
  tipoAdministracion?: TipoAdministracionEnum;

  @IsOptional()
  @IsEnum(CategoriaEstadoEnum)
  categoria?: CategoriaEstadoEnum;

  @IsOptional()
  @IsEnum(SubgrupoEnum)
  subgrupo?: SubgrupoEnum;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}
