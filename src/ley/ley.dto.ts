export class CreateLeyDto {
  nombre: string;
  referenciaBoe?: string;
  tipoNorma?: string;
  fechaPublicacion?: string;
}

export class VincularLeyDto {
  leyId: string;
  oposicionId: string;
  obligatoria?: boolean;
}