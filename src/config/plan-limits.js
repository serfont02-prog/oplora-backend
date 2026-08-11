"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUSCRIPCION_LIMITS = void 0;
var usuario_entity_1 = require("../usuario/usuario.entity");
exports.SUSCRIPCION_LIMITS = (_a = {},
    _a[usuario_entity_1.SuscripcionUsuario.GRATUITO] = {
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
    _a[usuario_entity_1.SuscripcionUsuario.ESENCIAL] = {
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
    _a[usuario_entity_1.SuscripcionUsuario.PROFESIONAL] = {
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
    _a);
