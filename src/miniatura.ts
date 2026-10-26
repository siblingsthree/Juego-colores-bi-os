import { svg } from './dom';
import type { Dibujo, Nivel } from './tipos';

export const COLOR_LINEA = '#2b2b33';
export const GROSOR_LINEA = 2.6;

/** Dibujo estático: zonas ya pintadas (o fijas en este nivel) en color, el resto en blanco. */
export function miniatura(dibujo: Dibujo, nivel: Nivel, pintadas: Iterable<string>) {
  const hechas = new Set(pintadas);
  return svg(
    'svg',
    { viewBox: `0 0 ${dibujo.ancho} ${dibujo.alto}`, class: 'miniatura', 'aria-hidden': 'true' },
    ...dibujo.zonas.map((z) =>
      svg('path', {
        d: z.d,
        fill: z.nivel > nivel || hechas.has(z.id) ? dibujo.paleta[z.color] : '#ffffff',
        stroke: COLOR_LINEA,
        'stroke-width': GROSOR_LINEA,
        'stroke-linejoin': 'round',
      }),
    ),
  );
}
