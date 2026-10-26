import type { Idioma } from './tipos';

export interface OtraApp {
  nombre: string;
  icono: string;
  descripcion: Record<Idioma, string>;
  /** Enlace a la tienda o a la web. Vacío mientras no esté publicada. */
  enlace: string;
}

export const MAS_APPS: OtraApp[] = [
  {
    nombre: 'Bosque de letras',
    icono: '🌳',
    descripcion: {
      es: 'Aprende las letras jugando en el bosque.',
      en: 'Learn letters by playing in the forest.',
    },
    enlace: '',
  },
];
