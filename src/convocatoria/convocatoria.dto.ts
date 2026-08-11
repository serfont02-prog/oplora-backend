import { EstadoConvocatoria } from './convocatoria.entity';

export class CreateConvocatoriaDto {
  anyo: number;
  plazas?: number;
  estado?: EstadoConvocatoria;
  fechaExamen?: Date;
  urlInap?: string;
  referenciaBoe?: string;
  oposicionId: string;
}

export class UpdateConvocatoriaDto {
  anyo?: number;
  plazas?: number;
  estado?: EstadoConvocatoria;
  fechaExamen?: Date;
  urlInap?: string;
  referenciaBoe?: string;
}