import { borrar, escribir, leer } from './almacen';
import type { Nivel } from './tipos';

// Perfiles locales: solo un animal y la edad. Nada sale del dispositivo.

export interface Perfil {
  id: string;
  avatar: string;
  edad: number;
  nivel: Nivel;
  /** Dibujos seguidos terminados con pocos fallos; al llegar a 3 se sube de nivel. */
  racha: number;
}

export const AVATARES = ['🐱', '🐶', '🐰', '🦊', '🐼', '🐸', '🦁', '🐵'];
export const EDADES = [3, 4, 5, 6, 7, 8, 9, 10];

const FALLOS_PERMITIDOS = 2;
const RACHA_PARA_SUBIR = 3;

/** Nivel inicial; los padres pueden cambiarlo y el juego lo sube solo. */
export const nivelPorEdad = (edad: number): Nivel => (edad <= 4 ? 1 : edad <= 6 ? 2 : 3);

export const listarPerfiles = () => leer<Perfil[]>('perfiles', []);

function guardarPerfiles(perfiles: Perfil[]) {
  escribir('perfiles', perfiles);
}

export function crearPerfil(avatar: string, edad: number): Perfil {
  const perfil: Perfil = { id: Date.now().toString(36), avatar, edad, nivel: nivelPorEdad(edad), racha: 0 };
  guardarPerfiles([...listarPerfiles(), perfil]);
  return perfil;
}

export function actualizarPerfil(perfil: Perfil) {
  guardarPerfiles(listarPerfiles().map((p) => (p.id === perfil.id ? perfil : p)));
}

export function borrarPerfil(perfil: Perfil) {
  guardarPerfiles(listarPerfiles().filter((p) => p.id !== perfil.id));
  borrar(`progreso:${perfil.id}`);
}

/** Devuelve true si el niño sube de nivel. */
export function registrarDibujoTerminado(perfil: Perfil, fallos: number): boolean {
  perfil.racha = fallos <= FALLOS_PERMITIDOS ? perfil.racha + 1 : 0;
  let sube = false;
  if (perfil.racha >= RACHA_PARA_SUBIR && perfil.nivel < 3) {
    perfil.nivel = (perfil.nivel + 1) as Nivel;
    perfil.racha = 0;
    sube = true;
  }
  actualizarPerfil(perfil);
  return sube;
}
