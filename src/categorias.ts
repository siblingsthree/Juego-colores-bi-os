import { idiomaActual } from './i18n';

/** Categorías de la biblioteca, en el orden de las pestañas. */
const CATEGORIAS: Record<string, { es: string; en: string }> = {
  animales: { es: 'Animales', en: 'Animals' },
  naturaleza: { es: 'Naturaleza', en: 'Nature' },
  fantasia: { es: 'Fantasía', en: 'Fantasy' },
  vehiculos: { es: 'Vehículos', en: 'Vehicles' },
  lugares: { es: 'Lugares', en: 'Places' },
  mandalas: { es: 'Mandalas', en: 'Mandalas' },
};

export const TODAS = 'todas';

export const nombreCategoria = (c: string) =>
  c === TODAS ? (idiomaActual() === 'es' ? 'Todo' : 'All') : (CATEGORIAS[c]?.[idiomaActual()] ?? c);

/** Las categorías que tienen algún dibujo, en el orden de la lista. */
export function categoriasPresentes(usadas: Iterable<string>) {
  const conjunto = new Set(usadas);
  return [...Object.keys(CATEGORIAS).filter((c) => conjunto.has(c)), ...[...conjunto].filter((c) => !(c in CATEGORIAS))];
}
