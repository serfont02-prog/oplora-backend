"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actualizarEstadoUsuario = actualizarEstadoUsuario;
var usuario_entity_1 = require("../../usuario/usuario.entity");
var fecha_helper_1 = require("./fecha.helper");
function actualizarEstadoUsuario(usuario) {
    if (!usuario.ultimaActividad) {
        usuario.estado = usuario_entity_1.EstadoUsuario.NUEVO;
        return usuario;
    }
    if ((0, fecha_helper_1.hanPasadoDias)(usuario.ultimaActividad, 7)) {
        usuario.estado = usuario_entity_1.EstadoUsuario.INACTIVO;
        return usuario;
    }
    usuario.estado = usuario_entity_1.EstadoUsuario.ACTIVO;
    return usuario;
}
