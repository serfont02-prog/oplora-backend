"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerFechaHoy = obtenerFechaHoy;
exports.hanPasadoDias = hanPasadoDias;
exports.esMismoDia = esMismoDia;
function obtenerFechaHoy() {
    return new Date().toISOString().split('T')[0];
}
function hanPasadoDias(fecha, dias) {
    var ahora = new Date();
    var diferencia = ahora.getTime() - new Date(fecha).getTime();
    var diasPasados = diferencia / (1000 * 60 * 60 * 24);
    return diasPasados >= dias;
}
function esMismoDia(fecha1, fecha2) {
    if (!fecha1 || !fecha2)
        return false;
    return (new Date(fecha1).toISOString().split('T')[0] ===
        new Date(fecha2).toISOString().split('T')[0]);
}
