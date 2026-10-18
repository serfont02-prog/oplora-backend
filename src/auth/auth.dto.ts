import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

// ⭐ Las reglas que antes solo comprobaba el formulario ahora también las exige el servidor:
// quien llamara a la API directamente podía crear nicks de 1 carácter o con espacios,
// nombres de cualquier longitud o contraseñas de más de 72 bytes (bcrypt las trunca).
const recortar = ({ value }: { value: any }) => (typeof value === 'string' ? value.trim() : value);
const recortarMinusculas = ({ value }: { value: any }) => (typeof value === 'string' ? value.trim().toLowerCase() : value);

export class LoginDto {
  // Email o nick
  @Transform(recortarMinusculas)
  @IsString()
  @IsNotEmpty({ message: 'Escribe tu email o tu nick' })
  @MaxLength(254)
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Escribe tu contraseña' })
  @MaxLength(72)
  password: string;
}

export class RegistroDto {
  @Transform(recortarMinusculas)
  @IsEmail({}, { message: 'El email no es válido' })
  @MaxLength(254)
  email: string;

  @Transform(recortar)
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(30, { message: 'El nombre no puede tener más de 30 caracteres' })
  nombre: string;

  @Transform(recortar)
  @IsOptional()
  @IsString()
  @MaxLength(30, { message: 'Los apellidos no pueden tener más de 30 caracteres' })
  apellidos?: string;

  @Transform(recortarMinusculas)
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9_]{3,10}$/, { message: 'El nick debe tener de 3 a 10 caracteres: letras, números o _' })
  nick?: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(72, { message: 'La contraseña no puede tener más de 72 caracteres' })
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  dni?: string;
}
