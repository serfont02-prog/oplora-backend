import { SuscripcionUsuario } from '../usuario/usuario.entity';

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