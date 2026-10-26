import type { Dibujo } from '../tipos';
import { circulo, elipse, estrella } from './formas';

export const pez: Dibujo = {
  id: 'pez',
  nombre: { es: 'El pez', en: 'The fish' },
  categoria: 'animales',
  ancho: 400,
  alto: 400,
  //        mar        arena      alga       cola       cuerpo     blanco     pupila     burbuja    estrella
  paleta: ['#4fa9e6', '#f3dca2', '#47b36b', '#ff7a2f', '#ffc93c', '#ffffff', '#33363d', '#c9ecfb', '#ff8fa3'],
  zonas: [
    { id: 'mar', d: 'M0 0H400V400H0Z', color: 0, nivel: 1, etiqueta: [200, 50] },
    { id: 'arena', d: 'M0 340Q100 318 200 338T400 332V400H0Z', color: 1, nivel: 1, etiqueta: [110, 372] },
    { id: 'alga1', d: 'M48 345C30 300 70 270 52 225C88 258 72 300 80 345Z', color: 2, nivel: 2, etiqueta: [62, 305], tam: 13 },
    { id: 'alga2', d: 'M340 340C322 300 362 268 346 220C380 256 364 300 372 340Z', color: 2, nivel: 2, etiqueta: [355, 300], tam: 13 },
    { id: 'aleta-sup', d: 'M168 142Q208 80 262 142Z', color: 3, nivel: 2, etiqueta: [214, 122], tam: 13 },
    { id: 'aleta-inf', d: 'M196 262Q214 306 248 262Z', color: 3, nivel: 3, etiqueta: [220, 278], tam: 12 },
    { id: 'cola', d: 'M126 200L52 140Q74 200 52 260Z', color: 3, nivel: 1, etiqueta: [82, 200] },
    { id: 'cuerpo', d: elipse(212, 200, 106, 70), color: 4, nivel: 1, etiqueta: [150, 200] },
    { id: 'raya1', d: 'M176 137Q160 200 176 263L200 269Q184 200 200 131Z', color: 5, nivel: 2, etiqueta: [182, 200], tam: 13 },
    { id: 'raya2', d: 'M238 135Q222 200 238 265L260 262Q244 200 260 138Z', color: 5, nivel: 2, etiqueta: [244, 200], tam: 13 },
    { id: 'ojo', d: circulo(284, 182, 18), color: 5, nivel: 2, etiqueta: [276, 182], tam: 12 },
    { id: 'pupila', d: circulo(289, 182, 8), color: 6, nivel: 2, etiqueta: [289, 182], tam: 9 },
    { id: 'burbuja1', d: circulo(330, 110, 13), color: 7, nivel: 3, etiqueta: [330, 110], tam: 12 },
    { id: 'burbuja2', d: circulo(352, 72, 10), color: 7, nivel: 3, etiqueta: [352, 72], tam: 11 },
    { id: 'estrella', d: estrella(220, 368, 22, 10), color: 8, nivel: 3, etiqueta: [220, 370], tam: 12 },
  ],
};
