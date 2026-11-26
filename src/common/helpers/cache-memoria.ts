/**
 * ⭐ Caché en memoria con caducidad, para datos que son iguales para todos y cambian poco
 * (recuentos por tema). Guarda la promesa, así varias peticiones a la vez hacen una sola
 * consulta. Si la consulta falla, no se guarda.
 */
export class CacheMemoria<T> {
  private readonly datos = new Map<string, { valor: Promise<T>; caduca: number }>();

  constructor(private readonly ttlMs: number, private readonly maximo = 5000) {}

  obtener(clave: string, cargar: () => Promise<T>): Promise<T> {
    const ahora = Date.now();
    const guardado = this.datos.get(clave);
    if (guardado && guardado.caduca > ahora) return guardado.valor;
    if (this.datos.size >= this.maximo) this.datos.clear();
    const valor = cargar().catch((e) => {
      this.datos.delete(clave);
      throw e;
    });
    this.datos.set(clave, { valor, caduca: ahora + this.ttlMs });
    return valor;
  }
}
