import type { Dibujo } from '../tipos';
import { casa } from './casa';
import { cohete } from './cohete';
import { mandala } from './mandala';
import { mariposa } from './mariposa';
import { pez } from './pez';
import { tortuga } from './tortuga';

// Todo lo que genere scripts/generar.cjs entra solo en la biblioteca.
const generados = Object.values(import.meta.glob<Record<string, Dibujo>>('./generados/*.ts', { eager: true })).flatMap(
  (modulo) => Object.values(modulo),
);

const hechosAMano: Dibujo[] = [pez, casa, cohete, tortuga, mariposa, mandala];

/** Ordenados por edad recomendada: lo más sencillo primero. */
export const dibujos: Dibujo[] = [...hechosAMano, ...generados].sort((a, b) => a.edad - b.edad);
