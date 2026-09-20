export class CreateTicketDto {
  asunto!: string;
  mensaje!: string;
}

export class ResponderTicketDto {
  respuesta!: string;
}

export interface FiltrosTicketSoporte {
  estado?: 'abierto' | 'respondido' | 'cerrado';
}
