import type { Dibujo } from '../tipos';
import { circulo, estrella } from './formas';

export const cohete: Dibujo = {
  id: 'cohete',
  nombre: { es: 'El cohete', en: 'The rocket' },
  categoria: 'vehiculos',
  ancho: 400,
  alto: 400,
  //        espacio    planeta    manchas    estrella   llama      rojo       cuerpo     cristal    marco
  paleta: ['#2f3478', '#a77bd8', '#7e55b5', '#ffd84d', '#ff8a3d', '#e5484d', '#eef1f5', '#8fd3f4', '#9aa5b1'],
  zonas: [
    { id: 'espacio', d: 'M0 0H400V400H0Z', color: 0, nivel: 1, etiqueta: [320, 200] },
    { id: 'planeta', d: circulo(78, 322, 62), color: 1, nivel: 1, etiqueta: [90, 315] },
    { id: 'mancha1', d: circulo(60, 296, 13), color: 2, nivel: 3, etiqueta: [60, 296], tam: 12 },
    { id: 'mancha2', d: circulo(104, 348, 10), color: 2, nivel: 3, etiqueta: [104, 348], tam: 11 },
    { id: 'estrella1', d: estrella(62, 72, 24, 11), color: 3, nivel: 2, etiqueta: [62, 75], tam: 13 },
    { id: 'estrella2', d: estrella(338, 330, 22, 10), color: 3, nivel: 2, etiqueta: [338, 333], tam: 12 },
    { id: 'estrella3', d: estrella(330, 62, 18, 8), color: 3, nivel: 3, etiqueta: [330, 65], tam: 11 },
    { id: 'llama', d: 'M172 292Q200 390 228 292Z', color: 4, nivel: 1, etiqueta: [200, 335] },
    { id: 'llama-int', d: 'M186 292Q200 345 214 292Z', color: 3, nivel: 2, etiqueta: [200, 308], tam: 12 },
    { id: 'aleta-izq', d: 'M166 230L126 302L170 290Z', color: 5, nivel: 1, etiqueta: [152, 282], tam: 13 },
    { id: 'aleta-der', d: 'M234 230L274 302L230 290Z', color: 5, nivel: 1, etiqueta: [248, 282], tam: 13 },
    { id: 'cuerpo1', d: 'M163 135L237 135Q244 195 240 250L160 250Q156 195 163 135Z', color: 6, nivel: 1, etiqueta: [200, 232] },
    { id: 'cuerpo2', d: 'M162 268L238 268Q237 282 235 295L165 295Q163 282 162 268Z', color: 6, nivel: 1, etiqueta: [200, 282], tam: 12 },
    { id: 'punta', d: 'M200 62C224 84 234 108 237 135L163 135C166 108 176 84 200 62Z', color: 5, nivel: 2, etiqueta: [200, 112] },
    { id: 'banda', d: 'M160 250L240 250L238 268L162 268Z', color: 5, nivel: 3, etiqueta: [200, 259], tam: 12 },
    { id: 'marco', d: circulo(200, 185, 31), color: 8, nivel: 3, etiqueta: [200, 162], tam: 11 },
    { id: 'ventana', d: circulo(200, 185, 22), color: 7, nivel: 1, etiqueta: [200, 185] },
  ],
};
