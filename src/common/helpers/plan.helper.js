"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSuscripcionLimits = getSuscripcionLimits;
exports.puedeAcceder = puedeAcceder;
exports.obtenerLimite = obtenerLimite;
exports.haSuperadoLimite = haSuperadoLimite;
var plan_limits_1 = require("../../config/plan-limits");
var usuario_entity_1 = require("../../usuario/usuario.entity");
/* =========================================================
   OBTENER LIMITES DE LA SUSCRIPCION
========================================================= */
function getSuscripcionLimits(suscripcion) {
    return (plan_limits_1.SUSCRIPCION_LIMITS[suscripcion || usuario_entity_1.SuscripcionUsuario.GRATUITO] ||
        plan_limits_1.SUSCRIPCION_LIMITS[usuario_entity_1.SuscripcionUsuario.GRATUITO]);
}
/* =========================================================
   FEATURES BOOLEANAS
========================================================= */
function puedeAcceder(suscripcion, feature) {
    var limits = getSuscripcionLimits(suscripcion);
    return Boolean(limits[feature]);
}
/* =========================================================
   LIMITES NUMERICOS
========================================================= */
function obtenerLimite(suscripcion, feature) {
    var _a;
    var limits = getSuscripcionLimits(suscripcion);
    return (_a = limits[feature]) !== null && _a !== void 0 ? _a : 0;
}
/* =========================================================
   VALIDAR LIMITE
========================================================= */
function haSuperadoLimite(suscripcion, feature, valorActual) {
    var limite = obtenerLimite(suscripcion, feature);
    if (limite === Infinity) {
        return false;
    }
    return valorActual >= limite;
}
