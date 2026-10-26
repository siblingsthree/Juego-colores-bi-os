import { dibujos } from './dibujos';
import { idiomaActual } from './i18n';
import { pantallaBiblioteca } from './pantallas/biblioteca';
import { pantallaPerfiles } from './pantallas/perfiles';
import { pantallaPintar } from './pantallas/pintar';
import type { Perfil } from './perfiles';
import './estilos.css';

const raiz = document.getElementById('app')!;
document.documentElement.lang = idiomaActual();

function inicio() {
  pantallaPerfiles(raiz, biblioteca);
}

function biblioteca(perfil: Perfil) {
  pantallaBiblioteca(raiz, perfil, (d) => pantallaPintar(raiz, perfil, d, () => biblioteca(perfil)), inicio);
}

// Acceso para scripts/comprobar-zonas.cjs.
(window as unknown as { __colorines: unknown }).__colorines = { dibujos };

inicio();
