import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  asunto: string;

  @IsString()
  @IsNotEmpty()
  mensaje: string;
}

export class ResponderTicketDto {
  @IsString()
  @IsNotEmpty()
  respuesta: string;
}

export interface FiltrosTicketSoporte {
  estado?: 'abierto' | 'respondido' | 'cerrado';
}
