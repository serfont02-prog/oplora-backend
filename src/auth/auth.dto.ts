import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegistroDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsString()
  apellidos?: string;

  @IsOptional()
  @IsString()
  nick?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  dni?: string;
}
