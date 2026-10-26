import type { Dibujo } from '../tipos';
import { circulo, poligono, rect } from './formas';

const nube = (x: number, y: number, e = 1) =>
  `M${x} ${y}a${22 * e} ${22 * e} 0 0 1 ${30 * e} ${-26 * e}a${30 * e} ${30 * e} 0 0 1 ${54 * e} ${-4 * e}` +
  `a${22 * e} ${22 * e} 0 0 1 ${16 * e} ${40 * e}Z`;

export const casa: Dibujo = {
  id: 'casa',
  nombre: { es: 'La casita', en: 'Little house' },
  categoria: 'lugares',
  ancho: 400,
  alto: 400,
  //        cielo      sol        blanco     césped     camino     pared      tejado     marrón     ventana    hojas      flor
  paleta: ['#8fd3f4', '#ffd84d', '#ffffff', '#7cc96b', '#ecd6a8', '#f6a96b', '#e5584f', '#9a6440', '#fff3a8', '#3f9e4d', '#ff8fc7'],
  zonas: [
    { id: 'cielo', d: rect(0, 0, 400, 290), color: 0, nivel: 1, etiqueta: [200, 60] },
    { id: 'sol', d: circulo(352, 56, 34), color: 1, nivel: 1, etiqueta: [352, 56] },
    { id: 'nube', d: nube(40, 110), color: 2, nivel: 2, etiqueta: [90, 95] },
    { id: 'humo', d: nube(232, 74, 0.55), color: 2, nivel: 3, etiqueta: [259, 66], tam: 12 },
    { id: 'cesped1', d: 'M0 285H100V330H178L138 400H0Z', color: 3, nivel: 1, etiqueta: [60, 365] },
    { id: 'cesped2', d: 'M300 285H400V400H262L222 330H300Z', color: 3, nivel: 1, etiqueta: [345, 375] },
    { id: 'camino', d: poligono([178, 330], [222, 330], [262, 400], [138, 400]), color: 4, nivel: 3, etiqueta: [200, 375] },
    { id: 'chimenea', d: rect(245, 100, 30, 70), color: 7, nivel: 2, etiqueta: [260, 118], tam: 13 },
    { id: 'pared', d: rect(100, 180, 200, 150), color: 5, nivel: 1, etiqueta: [140, 300] },
    { id: 'tejado', d: poligono([82, 188], [200, 98], [318, 188]), color: 6, nivel: 1, etiqueta: [200, 160] },
    { id: 'puerta', d: 'M178 330V268a22 22 0 0 1 44 0V330Z', color: 7, nivel: 1, etiqueta: [200, 290] },
    { id: 'pomo', d: circulo(210, 304, 7), color: 1, nivel: 3, etiqueta: [210, 304], tam: 9 },
    { id: 'ventana1', d: rect(118, 208, 46, 46), color: 8, nivel: 2, etiqueta: [141, 231] },
    { id: 'ventana2', d: rect(236, 208, 46, 46), color: 8, nivel: 2, etiqueta: [259, 231] },
    { id: 'tronco', d: rect(351, 222, 22, 80), color: 7, nivel: 2, etiqueta: [362, 282], tam: 13 },
    { id: 'copa', d: circulo(362, 196, 34), color: 9, nivel: 2, etiqueta: [362, 191] },
    { id: 'flor1', d: circulo(40, 320, 11), color: 10, nivel: 3, etiqueta: [40, 320], tam: 12 },
    { id: 'flor2', d: circulo(85, 335, 11), color: 10, nivel: 3, etiqueta: [85, 335], tam: 12 },
    { id: 'flor3', d: circulo(310, 345, 11), color: 10, nivel: 3, etiqueta: [310, 345], tam: 12 },
  ],
};
