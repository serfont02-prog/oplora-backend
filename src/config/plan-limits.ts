import { SuscripcionUsuario } from '../usuario/usuario.entity';

// ⭐ Planes de nov 2026: ya no hay cupos diarios (ver common/helpers/acceso.helper.ts).
// Solo queda el tamaño máximo de un test, que es igual para todos.
export const MAX_PREGUNTAS_POR_TEST = 100;

// (Antiguo, ya no se usa para limitar)

export const SUSCRIPCION_LIMITS = {
  [SuscripcionUsuario.GRATUITO]: {
    // Tests
    preguntasPorTest: 5,
    preguntasPorTema: 5,
    preguntasTestDia: 20,
    // Flashcards
    flashcardsDia: 20,
    // Simulacros
    simulacros: false,
    // Otros
    oposiciones: 1,
    temasPremium: false,
    estadisticas: false,
    iaAvanzada: false,
  },

  [SuscripcionUsuario.ESENCIAL]: {
    // Tests
    preguntasPorTest: 50,
    preguntasPorTema: 25,
    preguntasTestDia: 200,
    // Flashcards
    flashcardsDia: 200,
    // Simulacros
    simulacros: true,
    // Otros
    oposiciones: 1,
    temasPremium: true,
    estadisticas: true,
    iaAvanzada: false,
  },

  [SuscripcionUsuario.PROFESIONAL]: {
    // Tests
    preguntasPorTest: 200,
    preguntasPorTema: 100,
    preguntasTestDia: Infinity,
    // Flashcards
    flashcardsDia: Infinity,
    // Simulacros
    simulacros: true,
    // Otros
    oposiciones: Infinity,
    temasPremium: true,
    estadisticas: true,
    iaAvanzada: true,
  },
};