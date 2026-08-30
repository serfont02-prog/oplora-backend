import { EstadoConvocatoria, TipoEjercicio, TurnoEnum } from './convocatoria.entity';

export class CreateConvocatoriaDto {
  anyo!: number;
  plazas?: number;
  estado?: EstadoConvocatoria;
  turno?: TurnoEnum;
  fechaExamen?: Date;
  urlInap?: string;
  fechaConvocatoria?: string; 
  numeroSolicitudes?: number; 
  numeroPresentados?: number; 
  oposicionId!: string;
  ejercicios?: {
    numero: number;
    tipo: TipoEjercicio;
    numPreguntas?: number;
    tiempoMinutos?: number;
    descripcion?: string;
  }[];
  permiteBlancos?: boolean;
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
    tipo: 'fisica' | 'psicotecnico' | 'entrevista' | 'medico' | 'meritos' | 'otro';
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
  echaConvocatoria?: string; 
  numeroSolicitudes?: number; 
  numeroPresentados?: number; 
  referenciaBoe?: string;
  ejercicios?: {
    numero: number;
    tipo: TipoEjercicio;
    numPreguntas?: number;
    tiempoMinutos?: number;
    descripcion?: string;
  }[];
  permiteBlancos?: boolean;
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
    tipo: 'fisica' | 'psicotecnico' | 'entrevista' | 'medico' | 'meritos' | 'otro';
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