"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.esNuevoDia = esNuevoDia;
exports.resetearConsumosSiEsNuevoDia = resetearConsumosSiEsNuevoDia;
function esNuevoDia(fecha) {
    if (!fecha)
        return true;
    var hoy = new Date().toISOString().split('T')[0];
    return fecha !== hoy;
}
function resetearConsumosSiEsNuevoDia(usuario) {
    var hoy = new Date().toISOString().split('T')[0];
    if (esNuevoDia(usuario.fechaResetConsumo)) {
        usuario.preguntasTestHoy = 0;
        usuario.flashcardsHoy = 0;
        usuario.temasRevisadosHoy = 0;
        usuario.fechaResetConsumo = hoy;
    }
    usuario.ultimaActividad = new Date();
    return usuario;
}
