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
