import { EstadoConvocatoria, TipoEjercicio, TurnoEnum } from './convocatoria.entity';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateConvocatoriaDto {
  @IsNumber()
  anyo!: number;

  @IsOptional()
  @IsNumber()
  plazas?: number;

  @IsOptional()
  @IsEnum(EstadoConvocatoria)
  estado?: EstadoConvocatoria;

  @IsOptional()
  @IsEnum(TurnoEnum)
  turno?: TurnoEnum;

  @IsOptional()
  fechaExamen?: Date;

  @IsOptional()
  @IsString()
  urlOficial?: string;

  @IsOptional()
  @IsBoolean()
  urlOficialNoAplica?: boolean;

  @IsOptional()
  @IsString()
  fechaConvocatoria?: string;

  @IsOptional()
  @IsNumber()
  numeroSolicitudes?: number;

  @IsOptional()
  @IsNumber()
  numeroPresentados?: number;

  @IsString()
  oposicionId!: string;

  @IsOptional()
  @IsString()
  plazoInscripcionInicio?: string;

  @IsOptional()
  @IsString()
  plazoInscripcionFin?: string;

  @IsOptional()
  @IsArray()
  ejercicios?: {
    numero: number;
    tipo: TipoEjercicio;
    numPreguntas?: number;
    tiempoMinutos?: number;
    descripcion?: string;
  }[];

  @IsOptional()
  @IsBoolean()
  permiteBlancos?: boolean;

  @IsOptional()
  @IsString()
  fraccionPenalizacion?: string;

  @IsOptional()
  @IsString()
  fraccionPenalizacionBlanco?: string;

  @IsOptional()
  @IsNumber()
  notaMinimaAprobado?: number;

  @IsOptional()
  @IsString()
  diferenciasAnterior?: string;

  @IsOptional()
  @IsString()
  requisitos?: string;

  @IsOptional()
  @IsString()
  formacionPosterior?: string;

  @IsOptional()
  @IsString()
  descripcionAdicional?: string;

  @IsOptional()
  @IsBoolean()
  generaBolsaEmpleo?: boolean;

  @IsOptional()
  @IsString()
  bolsaEmpleoDescripcion?: string;

  @IsOptional()
  @IsObject()
  plazasDesglose?: {
    libres?: number;
    promocionInterna?: number;
    militares?: number;
    discapacidad?: number;
    otros?: number;
  };

  @IsOptional()
  @IsArray()
  fasesAdicionales?: {
    tipo: 'fisica' | 'psicotecnico' | 'entrevista' | 'medico' | 'meritos' | 'otro';
    nombre: string;
    descripcion?: string;
    criterios?: string[];
    puntuacionMax?: number;
    eliminatoria?: boolean;
    orden?: number;
  }[];

  @IsOptional()
  @IsArray()
  puestos?: {
    nombre: string;
    descripcion?: string;
    requisitosEspecificos?: string;
    plazas?: number;
  }[];

  @IsOptional()
  @IsArray()
  bloquesTemario?: {
    nombre: string;
    descripcion?: string;
  }[];

  @IsOptional()
  @IsNumber()
  numOpcionesTest?: number;

  @IsOptional()
  @IsNumber()
  numOpcionesPsicotecnico?: number;

  @IsOptional()
  @IsBoolean()
  tienePsicotecnicos?: boolean;
}

export class UpdateConvocatoriaDto {
  @IsOptional()
  @IsNumber()
  anyo?: number;

  @IsOptional()
  @IsNumber()
  plazas?: number;

  @IsOptional()
  @IsEnum(EstadoConvocatoria)
  estado?: EstadoConvocatoria;

  @IsOptional()
  @IsEnum(TurnoEnum)
  turno?: TurnoEnum;

  @IsOptional()
  fechaExamen?: Date;

  @IsOptional()
  @IsString()
  urlOficial?: string;

  @IsOptional()
  @IsBoolean()
  urlOficialNoAplica?: boolean;

  @IsOptional()
  @IsString()
  fechaConvocatoria?: string;

  @IsOptional()
  @IsNumber()
  numeroSolicitudes?: number;

  @IsOptional()
  @IsNumber()
  numeroPresentados?: number;

  @IsOptional()
  @IsString()
  referenciaBoe?: string;

  @IsOptional()
  @IsArray()
  ejercicios?: {
    numero: number;
    tipo: TipoEjercicio;
    numPreguntas?: number;
    tiempoMinutos?: number;
    descripcion?: string;
  }[];

  @IsOptional()
  @IsString()
  plazoInscripcionInicio?: string;

  @IsOptional()
  @IsString()
  plazoInscripcionFin?: string;

  @IsOptional()
  @IsBoolean()
  permiteBlancos?: boolean;

  @IsOptional()
  @IsString()
  fraccionPenalizacion?: string;

  @IsOptional()
  @IsString()
  fraccionPenalizacionBlanco?: string;

  @IsOptional()
  @IsNumber()
  notaMinimaAprobado?: number;

  @IsOptional()
  @IsString()
  diferenciasAnterior?: string;

  @IsOptional()
  @IsString()
  requisitos?: string;

  @IsOptional()
  @IsString()
  formacionPosterior?: string;

  @IsOptional()
  @IsString()
  descripcionAdicional?: string;

  @IsOptional()
  @IsBoolean()
  generaBolsaEmpleo?: boolean;

  @IsOptional()
  @IsString()
  bolsaEmpleoDescripcion?: string;

  @IsOptional()
  @IsObject()
  plazasDesglose?: {
    libres?: number;
    promocionInterna?: number;
    militares?: number;
    discapacidad?: number;
    otros?: number;
  };

  @IsOptional()
  @IsArray()
  fasesAdicionales?: {
    tipo: 'fisica' | 'psicotecnico' | 'entrevista' | 'medico' | 'meritos' | 'otro';
    nombre: string;
    descripcion?: string;
    criterios?: string[];
    puntuacionMax?: number;
    eliminatoria?: boolean;
    orden?: number;
  }[];

  @IsOptional()
  @IsArray()
  puestos?: {
    nombre: string;
    descripcion?: string;
    requisitosEspecificos?: string;
    plazas?: number;
  }[];

  @IsOptional()
  @IsArray()
  bloquesTemario?: {
    nombre: string;
    descripcion?: string;
  }[];

  @IsOptional()
  @IsNumber()
  numOpcionesTest?: number;

  @IsOptional()
  @IsNumber()
  numOpcionesPsicotecnico?: number;

  @IsOptional()
  @IsBoolean()
  tienePsicotecnicos?: boolean;
}
