import { escribir, leer } from './almacen';
import type { Dibujo, Nivel } from './tipos';

export interface Progreso {
  /** Zonas pintadas, en el orden en que se pintaron (sirve para la repetición final). */
  orden: string[];
  fallos: number;
  terminado: boolean;
}

type ProgresoPerfil = Record<string, Progreso>;

const clave = (dibujo: Dibujo, nivel: Nivel) => `${dibujo.id}:${nivel}`;

export function cargarProgreso(perfilId: string, dibujo: Dibujo, nivel: Nivel): Progreso {
  const todo = leer<ProgresoPerfil>(`progreso:${perfilId}`, {});
  return todo[clave(dibujo, nivel)] ?? { orden: [], fallos: 0, terminado: false };
}

export function guardarProgreso(perfilId: string, dibujo: Dibujo, nivel: Nivel, progreso: Progreso) {
  const todo = leer<ProgresoPerfil>(`progreso:${perfilId}`, {});
  todo[clave(dibujo, nivel)] = progreso;
  escribir(`progreso:${perfilId}`, todo);
}

export const zonasJugables = (dibujo: Dibujo, nivel: Nivel) => dibujo.zonas.filter((z) => z.nivel <= nivel);
