import type { Dibujo, Zona } from '../tipos';
import { circulo, elipse, nube, poligono, poligonoRegular } from './formas';
import { flor } from './piezas';

// Placas del caparazón: islas dentro de la cúpula, sin tocarse entre ellas ni el borde.
const placas: [string, number, number, number][] = [
  ['placa-c', 200, 262, 22],
  ['placa-i', 146, 276, 16],
  ['placa-d', 254, 276, 16],
  ['placa-si', 160, 238, 14],
  ['placa-sd', 240, 238, 14],
];

export const tortuga: Dibujo = {
  id: 'tortuga',
  nombre: { es: 'La tortuga', en: 'The turtle' },
  categoria: 'animales',
  edad: 5,
  ancho: 400,
  alto: 400,
  //        cielo      sol        nube       hierba     piel       caparazón  placa      detalle    pétalo     ojo        mejilla    piedra
  paleta: ['#9fdcf7', '#ffd84d', '#ffffff', '#5fb85a', '#c5e17a', '#8d5a3b', '#d99a4e', '#f6d38a', '#ff8fc7', '#33363d', '#ff9fa8', '#b0b8c2'],
  zonas: [
    { id: 'cielo', d: 'M0 0H400V250H0Z', color: 0, nivel: 1, etiqueta: [200, 40] },
    { id: 'sol', d: circulo(62, 62, 34), color: 1, nivel: 1, etiqueta: [62, 62] },
    { id: 'nube1', d: nube(230, 92), color: 2, nivel: 2, etiqueta: [280, 78] },
    { id: 'nube2', d: nube(318, 150, 0.6), color: 2, nivel: 3, etiqueta: [345, 140], tam: 10 },
    { id: 'hierba', d: 'M0 245H400V400H0Z', color: 3, nivel: 1, etiqueta: [200, 372] },
    { id: 'piedra', d: elipse(300, 372, 30, 14), color: 11, nivel: 3, etiqueta: [300, 372], tam: 11 },
    ...flor('flor1', 50, 360, { petalo: 8, centro: 1 }, { petalos: 2, centro: 3 }),
    ...flor('flor2', 118, 372, { petalo: 8, centro: 1 }, { petalos: 3, centro: 4 }),
    ...flor('flor3', 362, 300, { petalo: 8, centro: 1 }, { petalos: 4, centro: 4 }),
    { id: 'cola', d: poligono([76, 300], [106, 286], [106, 306]), color: 4, nivel: 3, etiqueta: [96, 298], tam: 9 },
    { id: 'pata1', d: elipse(128, 318, 17, 20), color: 4, nivel: 2, etiqueta: [128, 328], tam: 11 },
    { id: 'pata2', d: elipse(168, 322, 17, 20), color: 4, nivel: 2, etiqueta: [168, 332], tam: 11 },
    { id: 'pata3', d: elipse(232, 322, 17, 20), color: 4, nivel: 2, etiqueta: [232, 332], tam: 11 },
    { id: 'pata4', d: elipse(272, 318, 17, 20), color: 4, nivel: 2, etiqueta: [272, 328], tam: 11 },
    { id: 'cupula', d: 'M100 300A100 85 0 0 1 300 300Z', color: 5, nivel: 1, etiqueta: [200, 292], tam: 11 },
    // Solo la placa central lleva dibujo dentro; en las pequeñas no cabría el número.
    ...placas.map(([id, x, y, r]): Zona => ({
      id, d: poligonoRegular(x, y, r, 6), color: 6, nivel: 2, etiqueta: id === 'placa-c' ? [x - r * 0.72, y] : [x, y], tam: id === 'placa-c' ? 10 : 11,
    })),
    { id: 'placa-c-in', d: poligonoRegular(200, 262, 10, 6), color: 7, nivel: 3, etiqueta: [200, 262], tam: 9 },
    { id: 'cabeza', d: circulo(300, 264, 28), color: 4, nivel: 1, etiqueta: [306, 283], tam: 10 },
    { id: 'ojo', d: circulo(311, 254, 6), color: 9, nivel: 3, etiqueta: [311, 254], tam: 7 },
    { id: 'mejilla', d: circulo(316, 274, 5), color: 10, nivel: 4, etiqueta: [316, 274], tam: 6 },
    { id: 'borde', d: 'M92 300H308Q306 316 294 318H106Q94 316 92 300Z', color: 7, nivel: 2, etiqueta: [200, 309], tam: 10 },
  ],
};
