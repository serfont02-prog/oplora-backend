// ⭐ Liga Oplora — constantes y valores por defecto (ver doc "Liga Oplora — diseño").
// Todo lo que aquí son valores por defecto se puede cambiar por liga desde admin.

export enum EstadoLiga {
  ACTIVA = 'activa',
  PAUSADA = 'pausada',
  CERRADA = 'cerrada',
}

export enum ModoDivision {
  TEMAS = 'temas', // N temas seguidos, avanzando en orden
  BLOQUE = 'bloque', // un bloque del temario, rotando
  TEMARIO = 'temario', // todo el temario
}

export enum TipoJornada {
  TEMAS = 'temas',
  BLOQUE = 'bloque',
  TEMARIO = 'temario',
  PSICOTECNICO = 'psicotecnico',
}

export enum EstadoJornada {
  PROGRAMADA = 'programada', // publicada el lunes, aún sin preguntas
  ABIERTA = 'abierta',
  CERRADA = 'cerrada',
  CANCELADA = 'cancelada', // p. ej. sin preguntas suficientes
}

export enum TipoCopa {
  MENSUAL = 'mensual',
  TEMPORADA = 'temporada',
}

// 1 = Primera … 5 = Quinta
export const NOMBRE_DIVISION: Record<number, string> = {
  1: 'Primera',
  2: 'Segunda',
  3: 'Tercera',
  4: 'Cuarta',
  5: 'Quinta',
};

export const DIVISION_INICIAL = 5;

// Peso de cada división en la clasificación general.
export const COEFICIENTE_DIVISION: Record<number, number> = {
  1: 1.5,
  2: 1.3,
  3: 1.2,
  4: 1.1,
  5: 1.0,
};

export const COLOR_COPA: Record<number, string> = {
  1: 'oro',
  2: 'plata',
  3: 'bronce',
  4: 'azul',
  5: 'verde',
};

export const DIVISIONES_POR_DEFECTO: {
  division: number;
  modo: ModoDivision;
  temasPorJornada: number;
  numPreguntas: number;
  bloqueMensual: boolean;
}[] = [
  { division: 5, modo: ModoDivision.TEMAS, temasPorJornada: 2, numPreguntas: 20, bloqueMensual: false },
  { division: 4, modo: ModoDivision.TEMAS, temasPorJornada: 4, numPreguntas: 24, bloqueMensual: false },
  { division: 3, modo: ModoDivision.TEMAS, temasPorJornada: 8, numPreguntas: 24, bloqueMensual: false },
  { division: 2, modo: ModoDivision.BLOQUE, temasPorJornada: 0, numPreguntas: 30, bloqueMensual: false },
  { division: 1, modo: ModoDivision.TEMARIO, temasPorJornada: 0, numPreguntas: 30, bloqueMensual: true },
];

export const LIGA_POR_DEFECTO = {
  porcentajeAscenso: 20,
  bonusParticipacion: 10,
  segundosPorPregunta: 30,
  horaAviso: '10:00', // lunes
  horaApertura: '18:00', // viernes
  horaUltimaLlamada: '18:00', // domingo
  horaCierre: '22:00', // domingo
};

// Margen para envíos que llegan justo al agotarse el tiempo (latencia de red).
export const MARGEN_ENVIO_MS = 30_000;
