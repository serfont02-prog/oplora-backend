import { EstadoConvocatoria, TipoEjercicio, TurnoEnum } from './convocatoria.entity';

export class CreateConvocatoriaDto {
  anyo: number;
  plazas?: number;
  estado?: EstadoConvocatoria;
  turno?: TurnoEnum;
  fechaExamen?: Date;
  urlInap?: string;
  referenciaBoe?: string;
  oposicionId: string;
  numEjercicios?: number;
  tipoEjercicio?: TipoEjercicio;
  numPreguntas?: number;
  tiempoMinutos?: number;
  permiteBlancos?: boolean;
  penalizacion?: boolean;
  fraccionPenalizacion?: string;
  notaMinimaAprobado?: number;
  diferenciasAnterior?: string;
  requisitos?: string;
  formacionPosterior?: string;
  descripcionAdicional?: string;
  generaBolsaEmpleo?: boolean;
  bolsaEmpleoDescripcion?: string;
  plazasDesglose?: {
    libres?: number;
    promocionInterna?: number;
    militares?: number;
    discapacidad?: number;
    otros?: number;
  };
  fasesAdicionales?: {
    tipo: string;
    nombre: string;
    descripcion?: string;
    criterios?: string[];
    puntuacionMax?: number;
    eliminatoria?: boolean;
    orden?: number;
  }[];
  puestos?: {
    nombre: string;
    descripcion?: string;
    requisitosEspecificos?: string;
    plazas?: number;
  }[];
  bloquesTemario?: {
    nombre: string;
    descripcion?: string;
  }[];
}

export class UpdateConvocatoriaDto {
  anyo?: number;
  plazas?: number;
  estado?: EstadoConvocatoria;
  turno?: TurnoEnum;
  fechaExamen?: Date;
  urlInap?: string;
  referenciaBoe?: string;
  numEjercicios?: number;
  tipoEjercicio?: TipoEjercicio;
  numPreguntas?: number;
  tiempoMinutos?: number;
  permiteBlancos?: boolean;
  penalizacion?: boolean;
  fraccionPenalizacion?: string;
  notaMinimaAprobado?: number;
  diferenciasAnterior?: string;
  requisitos?: string;
  formacionPosterior?: string;
  descripcionAdicional?: string;
  generaBolsaEmpleo?: boolean;
  bolsaEmpleoDescripcion?: string;
  plazasDesglose?: {
    libres?: number;
    promocionInterna?: number;
    militares?: number;
    discapacidad?: number;
    otros?: number;
  };
  fasesAdicionales?: {
    tipo: string;
    nombre: string;
    descripcion?: string;
    criterios?: string[];
    puntuacionMax?: number;
    eliminatoria?: boolean;
    orden?: number;
  }[];
  puestos?: {
    nombre: string;
    descripcion?: string;
    requisitosEspecificos?: string;
    plazas?: number;
  }[];
  bloquesTemario?: {
    nombre: string;
    descripcion?: string;
  }[];
}