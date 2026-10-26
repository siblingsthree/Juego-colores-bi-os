// Todo se guarda en el propio dispositivo. Si el almacenamiento no está disponible
// (modo privado, vista previa), el juego funciona igual y simplemente no recuerda nada.

const PREFIJO = 'colorines:';

export function leer<T>(clave: string, porDefecto: T): T {
  try {
    const v = localStorage.getItem(PREFIJO + clave);
    return v === null ? porDefecto : (JSON.parse(v) as T);
  } catch {
    return porDefecto;
  }
}

export function escribir(clave: string, valor: unknown): void {
  try {
    localStorage.setItem(PREFIJO + clave, JSON.stringify(valor));
  } catch {
    /* sin almacenamiento */
  }
}

export function borrar(clave: string): void {
  try {
    localStorage.removeItem(PREFIJO + clave);
  } catch {
    /* sin almacenamiento */
  }
}
