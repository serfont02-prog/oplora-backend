import { Usuario, EstadoUsuario } from '../../usuario/usuario.entity';
import { hanPasadoDias } from './fecha.helper';

export function actualizarEstadoUsuario(usuario: Usuario) {
  if (!usuario.ultimaActividad) {
    usuario.estado = EstadoUsuario.NUEVO;
    return usuario;
  }

  if (hanPasadoDias(usuario.ultimaActividad, 7)) {
    usuario.estado = EstadoUsuario.INACTIVO;
    return usuario;
  }

  usuario.estado = EstadoUsuario.ACTIVO;

  return usuario;
}