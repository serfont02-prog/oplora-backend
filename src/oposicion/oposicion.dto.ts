import { SubgrupoEnum, TurnoEnum } from './oposicion.entity';
import { IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';


export class CreateOposicionDto {
  @IsString()
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

  @IsEnum(SubgrupoEnum)
  subgrupo: SubgrupoEnum; // 🔥 OBLIGATORIO y tipado

  @IsOptional()
  @IsBoolean()
  activa?: boolean;

  @IsEnum(TurnoEnum)
  turno: TurnoEnum; // 🔥 OBLIGATORIO y tipado
}

export class UpdateOposicionDto {
  @IsOptional()
  @IsString()
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
  @IsEnum(SubgrupoEnum)
  subgrupo?: SubgrupoEnum;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;

  @IsOptional()
  @IsEnum(TurnoEnum)
  turno?: TurnoEnum;
}