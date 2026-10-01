export function sanitizarNombreArchivo(nombre: string): string {
  return nombre
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // quita tildes
    .replace(/[^a-zA-Z0-9.\-_]/g, '_'); // sustituye cualquier otro carácter raro por "_"
}
