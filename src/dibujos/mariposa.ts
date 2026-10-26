import type { Dibujo, Nivel, Zona } from '../tipos';
import { circulo, elipse, escalar, espejo, nube } from './formas';
import { flor } from './piezas';

const EJE = 200;

// Ala izquierda; la derecha es su reflejo.
const alaSup = 'M195 165C150 90 100 50 60 70C30 90 35 150 70 185C110 205 160 200 195 190Z';
const alaInf = 'M195 200C160 205 110 215 85 250C65 285 90 320 125 315C160 305 185 260 196 225Z';
const bandaSup = escalar(alaSup, 115, 132, 0.6);
const bandaInf = escalar(alaInf, 135, 258, 0.58);
const antena = 'M195 132Q182 100 168 90Q173 87 176 92Q188 104 200 131Z';

type Pieza = Zona & { circulo?: [number, number, number] };

const circ = (id: string, x: number, y: number, r: number, color: number, nivel: Nivel): Pieza => ({
  id, d: circulo(x, y, r), color, nivel, etiqueta: [x, y], tam: Math.max(6, Math.round(r * 1.2)), circulo: [x, y, r],
});

const ladoIzquierdo: Pieza[] = [
  { id: 'ala-inf', d: alaInf, color: 4, nivel: 1, etiqueta: [93, 262], tam: 10 },
  { id: 'banda-inf', d: bandaInf, color: 5, nivel: 2, etiqueta: [138, 256], tam: 10 },
  circ('mancha-inf1', 120, 270, 7, 6, 3),
  circ('mancha-inf2', 152, 242, 6, 6, 3),
  circ('punto-inf1', 99, 288, 5, 3, 4),
  { id: 'ala-sup', d: alaSup, color: 7, nivel: 1, etiqueta: [70, 84], tam: 10 },
  { id: 'banda-sup', d: bandaSup, color: 1, nivel: 2, etiqueta: [128, 156], tam: 10 },
  circ('mancha-sup1', 106, 118, 9, 6, 3),
  circ('mancha-sup2', 141, 136, 7, 6, 3),
  circ('mancha-sup3', 98, 146, 5, 6, 3),
  circ('punto-sup1', 125, 92, 5, 3, 4),
  circ('punto-sup2', 55, 123, 5, 3, 4),
  circ('punto-sup3', 130, 186, 5, 3, 4),
];

// Los círculos se rehacen con el centro reflejado; el resto se refleja punto a punto.
const reflejar = ({ circulo: c, ...p }: Pieza): Zona => ({
  ...p,
  id: `${p.id}-d`,
  d: c ? circulo(2 * EJE - c[0], c[1], c[2]) : espejo(p.d, EJE),
  etiqueta: [2 * EJE - p.etiqueta[0], p.etiqueta[1]],
});

export const mariposa: Dibujo = {
  id: 'mariposa',
  nombre: { es: 'La mariposa', en: 'The butterfly' },
  categoria: 'animales',
  edad: 7,
  ancho: 400,
  alto: 400,
  //        cielo      amarillo   nube       hierba     morado     rosa       rojo       naranja    cuerpo     pétalo     raya       blanco
  paleta: ['#a7dcf5', '#ffd84d', '#ffffff', '#5fb85a', '#a77bd8', '#ff8fc7', '#e5484d', '#ff9f43', '#5b3a8e', '#ff6fa5', '#c9a6f0', '#fffdf5'],
  zonas: [
    { id: 'cielo', d: 'M0 0H400V400H0Z', color: 0, nivel: 1, etiqueta: [200, 40] },
    { id: 'nube-i', d: nube(16, 52, 0.7), color: 2, nivel: 2, etiqueta: [50, 40], tam: 10 },
    { id: 'nube-d', d: nube(318, 48, 0.7), color: 2, nivel: 2, etiqueta: [352, 36], tam: 10 },
    { id: 'hierba', d: 'M0 340Q100 320 200 335T400 330V400H0Z', color: 3, nivel: 1, etiqueta: [200, 375] },
    ...flor('flor1', 55, 368, { petalo: 9, centro: 1 }, { petalos: 2, centro: 3 }),
    ...flor('flor2', 345, 370, { petalo: 9, centro: 1 }, { petalos: 3, centro: 4 }),
    ...ladoIzquierdo,
    ...ladoIzquierdo.map(reflejar),
    { id: 'antena', d: antena, color: 8, nivel: 4, etiqueta: [186, 112], tam: 5 },
    { id: 'antena-d', d: espejo(antena, EJE), color: 8, nivel: 4, etiqueta: [214, 112], tam: 5 },
    circ('punta', 168, 86, 7, 6, 3),
    circ('punta-d', 232, 86, 7, 6, 3),
    { id: 'cuerpo', d: elipse(200, 220, 13, 62), color: 8, nivel: 1, etiqueta: [200, 266], tam: 10 },
    { id: 'raya1', d: elipse(200, 196, 7, 6), color: 10, nivel: 4, etiqueta: [200, 196], tam: 7 },
    { id: 'raya2', d: elipse(200, 220, 7, 6), color: 10, nivel: 4, etiqueta: [200, 220], tam: 7 },
    { id: 'raya3', d: elipse(200, 244, 7, 6), color: 10, nivel: 4, etiqueta: [200, 244], tam: 7 },
    { id: 'cabeza', d: circulo(200, 145, 17), color: 8, nivel: 1, etiqueta: [200, 154], tam: 9 },
    circ('ojo', 193, 141, 4, 11, 4),
    circ('ojo-d', 207, 141, 4, 11, 4),
  ],
};
