import type { Dibujo, Nivel, Zona } from '../tipos';
import { circulo, estrella, petalo, polar } from './formas';

const C = 200;

/** Anillo: un círculo que tapa al anterior; lo que se ve es la corona entre los dos radios. */
const anillo = (id: string, r: number, color: number, etiquetaEn: number, grados: number, tam = 11): Zona => ({
  id, d: circulo(C, C, r), color, nivel: 1, etiqueta: polar(C, C, etiquetaEn, grados), tam,
});

/** `ladoEtiqueta` (grados) aparta el número del eje del pétalo, para dejar sitio a otro pétalo dentro. */
const petalos = (id: string, n: number, desde: number, hasta: number, ancho: number, giro: number, color: number, nivel: Nivel, tam: number, ladoEtiqueta = 0): Zona[] =>
  Array.from({ length: n }, (_, i) => {
    const g = giro + (360 * i) / n;
    return { id: `${id}${i}`, d: petalo(C, C, desde, hasta, g, ancho), color, nivel, etiqueta: polar(C, C, (desde + hasta) / 2, g + ladoEtiqueta), tam };
  });

const puntos = (id: string, n: number, r: number, radio: number, giro: number, color: number, nivel: Nivel, tam: number): Zona[] =>
  Array.from({ length: n }, (_, i) => {
    const [x, y] = polar(C, C, r, giro + (360 * i) / n);
    return { id: `${id}${i}`, d: circulo(x, y, radio), color, nivel, etiqueta: [x, y], tam };
  });

export const mandala: Dibujo = {
  id: 'mandala',
  nombre: { es: 'El mandala', en: 'The mandala' },
  categoria: 'mandalas',
  edad: 10,
  ancho: 400,
  alto: 400,
  //        crema      azul       amarillo   blanco     morado     rosa       verde      naranja    rojo       azul osc.
  paleta: ['#ffe7b3', '#4fa9e6', '#ffd84d', '#ffffff', '#a77bd8', '#ff8fc7', '#47b36b', '#ff8a3d', '#e5484d', '#2f3478'],
  zonas: [
    { id: 'fondo', d: 'M0 0H400V400H0Z', color: 0, nivel: 1, etiqueta: [352, 48], tam: 11 },
    ...[[28, 28], [372, 28], [28, 372], [372, 372]].map(([x, y], i): Zona => ({
      id: `esquina${i}`, d: circulo(x, y, 16), color: 5, nivel: 3, etiqueta: [x, y], tam: 10,
    })),
    anillo('anillo-a', 180, 1, 165, 7.5),
    ...petalos('petalo-a', 12, 156, 174, 22, 0, 2, 3, 9),
    ...puntos('punto-a', 12, 165, 5, 15, 3, 4, 6),
    anillo('anillo-b', 150, 4, 132, 22.5),
    ...petalos('petalo-b', 8, 121, 144, 30, 0, 5, 2, 8, 4.8),
    ...petalos('petalo-b-in', 8, 127, 138, 10, 0, 3, 4, 6),
    anillo('anillo-c', 115, 6, 100, 11.25, 10),
    ...puntos('circulo-c', 16, 100, 8, 0, 2, 3, 9),
    anillo('anillo-d', 85, 7, 70, 12.5, 8),
    ...petalos('petalo-d', 8, 61, 79, 20, 0, 8, 2, 9),
    ...puntos('punto-d', 8, 70, 5, 22.5, 3, 4, 6),
    anillo('anillo-e', 55, 9, 43, 30, 10),
    ...petalos('petalo-e', 6, 36, 49, 18, 0, 2, 3, 8),
    { id: 'centro', d: circulo(C, C, 30), color: 8, nivel: 1, etiqueta: [C, C + 21], tam: 9 },
    { id: 'estrella', d: estrella(C, C, 22, 10), color: 2, nivel: 2, etiqueta: [C, C], tam: 9 },
  ],
};
