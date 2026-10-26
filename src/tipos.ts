export type Nivel = 1 | 2 | 3;
export type Idioma = 'es' | 'en';

export interface Zona {
  id: string;
  /** Contorno en formato de trazado SVG, en coordenadas del dibujo. */
  d: string;
  /** Índice en la paleta del dibujo. */
  color: number;
  /** Nivel mínimo en el que la zona se pinta; en niveles inferiores aparece ya pintada. */
  nivel: Nivel;
  /** Punto donde se dibuja el número o el punto de color. */
  etiqueta: [number, number];
  /** Tamaño del número; por defecto el del dibujo. */
  tam?: number;
}

export interface Dibujo {
  id: string;
  nombre: Record<Idioma, string>;
  categoria: string;
  ancho: number;
  alto: number;
  paleta: string[];
  /** En orden de pintado: las zonas posteriores tapan a las anteriores. */
  zonas: Zona[];
}
