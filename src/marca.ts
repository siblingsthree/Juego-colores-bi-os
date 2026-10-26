import logo from '../recursos/logo.svg?raw';
import { el } from './dom';
import { t } from './i18n';

/** Logo (paleta) y nombre de la app. `pequena` para la barra de la biblioteca. */
export function marca(pequena = false) {
  const icono = el('span', { class: 'logo-icono', innerHTML: logo });
  icono.setAttribute('aria-hidden', 'true');
  return el('h1', { class: `marca${pequena ? ' pequena' : ''}` }, icono, el('span', { class: 'logo' }, t('titulo')));
}
