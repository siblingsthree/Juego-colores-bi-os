// Ayudas para escribir dibujos a mano como trazados SVG.

export const rect = (x: number, y: number, w: number, h: number) =>
  `M${x} ${y}h${w}v${h}h${-w}Z`;

export const elipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;

export const circulo = (cx: number, cy: number, r: number) => elipse(cx, cy, r, r);

export const poligono = (...p: [number, number][]) =>
  'M' + p.map(([x, y]) => `${x} ${y}`).join('L') + 'Z';

export function estrella(cx: number, cy: number, rExt: number, rInt: number, puntas = 5) {
  const p: [number, number][] = [];
  for (let i = 0; i < puntas * 2; i++) {
    const r = i % 2 ? rInt : rExt;
    const a = (Math.PI * i) / puntas - Math.PI / 2;
    p.push([+(cx + r * Math.cos(a)).toFixed(1), +(cy + r * Math.sin(a)).toFixed(1)]);
  }
  return poligono(...p);
}

/** Alturas (arriba y abajo) del contorno de una elipse en la vertical x. */
export function bordeElipse(cx: number, cy: number, rx: number, ry: number, x: number): [number, number] {
  const dy = ry * Math.sqrt(1 - ((x - cx) / rx) ** 2);
  return [+(cy - dy).toFixed(1), +(cy + dy).toFixed(1)];
}

export const nube = (x: number, y: number, e = 1) =>
  `M${x} ${y}a${22 * e} ${22 * e} 0 0 1 ${30 * e} ${-26 * e}a${30 * e} ${30 * e} 0 0 1 ${54 * e} ${-4 * e}` +
  `a${22 * e} ${22 * e} 0 0 1 ${16 * e} ${40 * e}Z`;

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Punto a una distancia y un ángulo (en grados, 0 = derecha) de un centro. */
export function polar(cx: number, cy: number, r: number, grados: number): [number, number] {
  const a = (grados * Math.PI) / 180;
  return [r1(cx + r * Math.cos(a)), r1(cy + r * Math.sin(a))];
}

/** Pétalo en dirección radial, entre las distancias r1 y r2 del centro. */
export function petalo(cx: number, cy: number, desde: number, hasta: number, grados: number, ancho: number) {
  const [x1, y1] = polar(cx, cy, desde, grados);
  const [x2, y2] = polar(cx, cy, hasta, grados);
  const medio = (desde + hasta) / 2;
  const abre = (Math.atan2(ancho, medio) * 180) / Math.PI;
  const [ax, ay] = polar(cx, cy, Math.hypot(medio, ancho), grados + abre);
  const [bx, by] = polar(cx, cy, Math.hypot(medio, ancho), grados - abre);
  return `M${x1} ${y1}Q${ax} ${ay} ${x2} ${y2}Q${bx} ${by} ${x1} ${y1}Z`;
}

export function poligonoRegular(cx: number, cy: number, r: number, lados: number, giro = 0) {
  return poligono(...Array.from({ length: lados }, (_, i) => polar(cx, cy, r, giro + (360 * i) / lados)));
}

/** Transforma cada punto de un trazado hecho solo con comandos absolutos M, L, Q, C y Z. */
function transformar(d: string, f: (x: number, y: number) => [number, number]) {
  const partes = d.match(/[A-Za-z]|-?\d*\.?\d+/g) ?? [];
  let salida = '';
  for (let i = 0; i < partes.length; i++) {
    const p = partes[i];
    if (/[A-Za-z]/.test(p)) {
      if (!'MLQCZ'.includes(p)) throw new Error(`Comando no admitido: ${p}`);
      salida += p;
      continue;
    }
    const [x, y] = f(+p, +partes[++i]);
    salida += `${r1(x)} ${r1(y)} `;
  }
  return salida.trim();
}

/** Reflejo horizontal respecto a la vertical x = eje. */
export const espejo = (d: string, eje: number) => transformar(d, (x, y) => [2 * eje - x, y]);

/** Copia reducida (o ampliada) de un trazado respecto a un punto. */
export const escalar = (d: string, cx: number, cy: number, k: number) =>
  transformar(d, (x, y) => [cx + (x - cx) * k, cy + (y - cy) * k]);
