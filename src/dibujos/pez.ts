import type { Dibujo } from '../tipos';
import { bordeElipse, circulo, estrella } from './formas';

// Cuerpo: elipse cortada en 5 franjas que no se solapan (3 de cuerpo y 2 rayas),
// para que cada trozo que ve el niño sea una zona con su propio número.
const [CX, CY, RX, RY] = [212, 200, 106, 70];
const arco = `${RX} ${RY} 0 0`;
const corte = (x: number, curva: number) => {
  const [arriba, abajo] = bordeElipse(CX, CY, RX, RY, x);
  return { x, arriba, abajo, curva };
};
// Cada corte es una línea curva de arriba abajo; `curva` es el punto de control.
const [c1, c2, c3, c4] = [corte(176, 160), corte(200, 184), corte(238, 222), corte(260, 244)];
const bajar = (c: typeof c1) => `Q${c.curva} ${CY} ${c.x} ${c.abajo}`;
const subir = (c: typeof c1) => `Q${c.curva} ${CY} ${c.x} ${c.arriba}`;
const franja = (a: typeof c1, b: typeof c1) =>
  `M${a.x} ${a.arriba}${bajar(a)}A${arco} 0 ${b.x} ${b.abajo}${subir(b)}A${arco} 0 ${a.x} ${a.arriba}Z`;
const cuerpoIzq = `M${c1.x} ${c1.arriba}${bajar(c1)}A${arco} 1 ${c1.x} ${c1.arriba}Z`;
const cuerpoDer = `M${c4.x} ${c4.arriba}${bajar(c4)}A${arco} 0 ${c4.x} ${c4.arriba}Z`;

export const pez: Dibujo = {
  id: 'pez',
  nombre: { es: 'El pez', en: 'The fish' },
  categoria: 'animales',
  edad: 3,
  ancho: 400,
  alto: 400,
  //        mar        arena      alga       cola       cuerpo     blanco     pupila     burbuja    estrella
  paleta: ['#4fa9e6', '#f3dca2', '#47b36b', '#ff7a2f', '#ffc93c', '#ffffff', '#33363d', '#c9ecfb', '#ff8fa3'],
  zonas: [
    { id: 'mar', d: 'M0 0H400V400H0Z', color: 0, nivel: 1, etiqueta: [200, 50] },
    { id: 'arena', d: 'M0 340Q100 318 200 338T400 332V400H0Z', color: 1, nivel: 1, etiqueta: [110, 372] },
    { id: 'alga1', d: 'M48 345C32 315 66 300 56 272C86 296 72 320 80 345Z', color: 2, nivel: 2, etiqueta: [64, 318], tam: 13 },
    { id: 'alga2', d: 'M340 340C322 300 362 268 346 220C380 256 364 300 372 340Z', color: 2, nivel: 2, etiqueta: [355, 300], tam: 13 },
    { id: 'aleta-sup', d: 'M168 142Q208 80 262 142Z', color: 3, nivel: 2, etiqueta: [214, 122], tam: 13 },
    { id: 'aleta-inf', d: 'M196 262Q214 306 248 262Z', color: 3, nivel: 3, etiqueta: [220, 278], tam: 12 },
    { id: 'cola', d: 'M126 200L52 140Q74 200 52 260Z', color: 3, nivel: 1, etiqueta: [82, 200] },
    { id: 'cuerpo1', d: cuerpoIzq, color: 4, nivel: 1, etiqueta: [140, 200] },
    { id: 'raya1', d: franja(c1, c2), color: 5, nivel: 2, etiqueta: [182, 200], tam: 13 },
    { id: 'cuerpo2', d: franja(c2, c3), color: 4, nivel: 1, etiqueta: [211, 200] },
    { id: 'raya2', d: franja(c3, c4), color: 5, nivel: 2, etiqueta: [244, 200], tam: 13 },
    { id: 'cuerpo3', d: cuerpoDer, color: 4, nivel: 1, etiqueta: [290, 225], tam: 14 },
    { id: 'ojo', d: circulo(284, 182, 18), color: 5, nivel: 2, etiqueta: [276, 182], tam: 12 },
    { id: 'pupila', d: circulo(289, 182, 8), color: 6, nivel: 2, etiqueta: [289, 182], tam: 9 },
    { id: 'burbuja1', d: circulo(330, 110, 13), color: 7, nivel: 3, etiqueta: [330, 110], tam: 12 },
    { id: 'burbuja2', d: circulo(352, 72, 10), color: 7, nivel: 3, etiqueta: [352, 72], tam: 11 },
    { id: 'estrella', d: estrella(220, 368, 22, 10), color: 8, nivel: 3, etiqueta: [220, 370], tam: 12 },
  ],
};
