type Hijo = Node | string | null | undefined | false;

export function el<K extends keyof HTMLElementTagNameMap>(
  etiqueta: K,
  props: Partial<HTMLElementTagNameMap[K]> & { class?: string } = {},
  ...hijos: Hijo[]
): HTMLElementTagNameMap[K] {
  const e = document.createElement(etiqueta);
  const { class: clase, ...resto } = props;
  if (clase) e.className = clase;
  Object.assign(e, resto);
  for (const h of hijos) if (h) e.append(h);
  return e;
}

const NS = 'http://www.w3.org/2000/svg';

export function svg<K extends keyof SVGElementTagNameMap>(
  etiqueta: K,
  attrs: Record<string, string | number> = {},
  ...hijos: (SVGElement | null)[]
): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, etiqueta);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  for (const h of hijos) if (h) e.append(h);
  return e;
}

/** Color del texto (oscuro o claro) que se lee mejor sobre un fondo. */
export function textoSobre(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#2b2b33' : '#ffffff';
}

/** Mezcla un color con blanco: 0 lo deja igual, 1 lo vuelve blanco. */
export function aclarar(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const canal = (v: number) => Math.round(v + (255 - v) * k).toString(16).padStart(2, '0');
  return '#' + canal((n >> 16) & 255) + canal((n >> 8) & 255) + canal(n & 255);
}
