// Catálogo general de tipos de psicotécnicos disponibles en el motor de Oplora.
// Una oposición concreta solo activa un subconjunto vía PsicotecnicoConfigOposicion.
export enum PsicotecnicoTipo {
  NUMERICO = 'numerico',
  VERBAL = 'verbal',
  LOGICO = 'logico',
  ESPACIAL = 'espacial',
  ATENCION = 'atencion',
  MEMORIA = 'memoria',
  MECANICO = 'mecanico',
  VELOCIDAD_PRECISION = 'velocidad_precision',
  PERSONALIDAD = 'personalidad',
  MIXTO = 'mixto',
}

export enum PsicotecnicoDificultad {
  FACIL = 'facil',
  MEDIO = 'medio',
  DIFICIL = 'dificil',
  EXPERTO = 'experto',
}

// Subtipos sugeridos por tipo. Es solo un catálogo de referencia (no restringe en BD):
// el campo `subtipo` de PreguntaPsicotecnica es un string libre para poder ampliar
// sin migraciones. Se usa para poblar selects en el admin y para validar de forma
// blanda (aviso, no bloqueo) al importar preguntas.
export const SUBTIPOS_SUGERIDOS: Record<PsicotecnicoTipo, string[]> = {
  [PsicotecnicoTipo.NUMERICO]: ['operaciones', 'porcentajes', 'fracciones', 'reglas_de_tres', 'series_numericas', 'problemas_numericos', 'estimacion'],
  [PsicotecnicoTipo.VERBAL]: ['sinonimos', 'antonimos', 'analogias', 'comprension_verbal', 'vocabulario', 'relaciones_palabras'],
  [PsicotecnicoTipo.LOGICO]: ['series_figuras', 'matrices', 'analogias_abstractas', 'secuencias', 'relaciones_logicas', 'patrones'],
  [PsicotecnicoTipo.ESPACIAL]: ['rotacion_figuras', 'cubos', 'plegado', 'vistas', 'orientacion_espacial', 'desarrollo_figuras'],
  [PsicotecnicoTipo.ATENCION]: ['comparacion_simbolos', 'busqueda_elementos', 'deteccion_diferencias', 'codigos', 'identificacion_rapida', 'atencion_selectiva'],
  [PsicotecnicoTipo.MEMORIA]: ['memoria_visual', 'memoria_numerica', 'memoria_verbal', 'memoria_posiciones', 'memoria_secuencias'],
  [PsicotecnicoTipo.MECANICO]: ['palancas', 'engranajes', 'poleas', 'fuerzas', 'movimiento', 'principios_mecanicos'],
  [PsicotecnicoTipo.VELOCIDAD_PRECISION]: ['discriminacion_rapida', 'comparacion', 'codificacion', 'busqueda_visual'],
  [PsicotecnicoTipo.PERSONALIDAD]: ['preguntas_personalidad', 'escalas_respuesta', 'consistencia', 'perfiles'],
  [PsicotecnicoTipo.MIXTO]: [],
};

export const PSICOTECNICO_TIPO_META: Record<PsicotecnicoTipo, { nombre: string; descripcion: string; icono: string }> = {
  [PsicotecnicoTipo.NUMERICO]: { nombre: 'Numérico', descripcion: 'Entrena cálculo, series y razonamiento numérico.', icono: '🧮' },
  [PsicotecnicoTipo.VERBAL]: { nombre: 'Verbal', descripcion: 'Sinónimos, antónimos, comprensión y razonamiento verbal.', icono: '🔤' },
  [PsicotecnicoTipo.LOGICO]: { nombre: 'Lógico', descripcion: 'Series, matrices, relaciones y razonamiento abstracto.', icono: '🧩' },
  [PsicotecnicoTipo.ESPACIAL]: { nombre: 'Espacial', descripcion: 'Rotaciones, figuras, cubos y orientación espacial.', icono: '📐' },
  [PsicotecnicoTipo.ATENCION]: { nombre: 'Atención', descripcion: 'Comparación, detección de errores y velocidad perceptiva.', icono: '👁️' },
  [PsicotecnicoTipo.MEMORIA]: { nombre: 'Memoria', descripcion: 'Memorización y recuperación de información.', icono: '🧠' },
  [PsicotecnicoTipo.MECANICO]: { nombre: 'Mecánico', descripcion: 'Palancas, engranajes, poleas y principios físicos.', icono: '⚙️' },
  [PsicotecnicoTipo.VELOCIDAD_PRECISION]: { nombre: 'Velocidad y precisión', descripcion: 'Discriminación y codificación rápida de estímulos.', icono: '⚡' },
  [PsicotecnicoTipo.PERSONALIDAD]: { nombre: 'Personalidad', descripcion: 'Cuestionarios de personalidad y consistencia de respuesta.', icono: '🧭' },
  [PsicotecnicoTipo.MIXTO]: { nombre: 'Mixto', descripcion: 'Combinación de varias aptitudes en un mismo bloque.', icono: '🎯' },
};

export const DIFICULTADES_DEFECTO = [
  PsicotecnicoDificultad.FACIL,
  PsicotecnicoDificultad.MEDIO,
  PsicotecnicoDificultad.DIFICIL,
];
