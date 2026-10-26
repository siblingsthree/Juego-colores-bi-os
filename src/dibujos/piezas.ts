import type { Nivel, Zona } from '../tipos';
import { circulo, polar } from './formas';

/** Flor de 5 pétalos redondos con su centro. Pensada para ir como isla dentro del césped. */
export function flor(
  id: string,
  cx: number,
  cy: number,
  colores: { petalo: number; centro: number },
  niveles: { petalos: Nivel; centro: Nivel },
): Zona[] {
  const petalos: Zona[] = [0, 1, 2, 3, 4].map((i) => {
    const [x, y] = polar(cx, cy, 12, -90 + i * 72);
    const [ex, ey] = polar(cx, cy, 15, -90 + i * 72);
    return { id: `${id}-p${i}`, d: circulo(x, y, 9), color: colores.petalo, nivel: niveles.petalos, etiqueta: [ex, ey], tam: 8 };
  });
  return [...petalos, { id: `${id}-c`, d: circulo(cx, cy, 7), color: colores.centro, nivel: niveles.centro, etiqueta: [cx, cy], tam: 8 }];
}
