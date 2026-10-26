import { escribir, leer } from './almacen';
import type { Idioma } from './tipos';

const textos = {
  es: {
    titulo: 'Colorines',
    quienJuega: '¿Quién juega?',
    nuevo: 'Nuevo',
    elegirAnimal: 'Elige tu animal',
    cuantosAnos: '¿Cuántos años tienes?',
    listo: '¡Listo!',
    volver: 'Volver',
    pista: 'Ayuda',
    nivel: 'Nivel',
    muyBien: '¡Lo has conseguido!',
    verComo: 'Ver cómo lo pinté',
    otro: 'Otro dibujo',
    subeNivel: '¡Subes de nivel!',
    sonido: 'Sonido',
    borrarPerfil: 'Borrar perfil',
    paraPadres: 'Para padres',
    preguntaPadres: 'Para adultos: ¿cuánto es',
    cancelar: 'Cancelar',
    masApps: 'Más apps gratis',
    pronto: 'Muy pronto',
  },
  en: {
    titulo: 'Colorines',
    quienJuega: "Who's playing?",
    nuevo: 'New',
    elegirAnimal: 'Pick your animal',
    cuantosAnos: 'How old are you?',
    listo: 'Ready!',
    volver: 'Back',
    pista: 'Help',
    nivel: 'Level',
    muyBien: 'You did it!',
    verComo: 'Watch how I painted it',
    otro: 'Another picture',
    subeNivel: 'Level up!',
    sonido: 'Sound',
    borrarPerfil: 'Delete profile',
    paraPadres: 'For parents',
    preguntaPadres: 'For grown-ups: what is',
    cancelar: 'Cancel',
    masApps: 'More free apps',
    pronto: 'Coming soon',
  },
} satisfies Record<Idioma, Record<string, string>>;

export type ClaveTexto = keyof (typeof textos)['es'];

function idiomaInicial(): Idioma {
  const guardado = leer<Idioma | null>('idioma', null);
  if (guardado) return guardado;
  return navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en';
}

let idioma: Idioma = idiomaInicial();

export const idiomaActual = () => idioma;

export function cambiarIdioma(nuevo: Idioma) {
  idioma = nuevo;
  escribir('idioma', nuevo);
  document.documentElement.lang = nuevo;
}

export const t = (clave: ClaveTexto) => textos[idioma][clave];
