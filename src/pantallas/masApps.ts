import { el } from '../dom';
import { idiomaActual, t } from '../i18n';
import { MAS_APPS } from '../masApps';

/** Lista de nuestras otras apps. Se abre siempre detrás de la puerta para padres. */
export function panelMasApps(raiz: HTMLElement) {
  const lista = el('div', { class: 'lista-apps' });
  for (const app of MAS_APPS) {
    const contenido = [
      el('span', { class: 'icono-app' }, app.icono),
      el('span', { class: 'texto-app' }, el('strong', {}, app.nombre), el('span', {}, app.descripcion[idiomaActual()])),
    ];
    lista.append(
      app.enlace
        ? el('a', { class: 'app', href: app.enlace, target: '_blank', rel: 'noopener' }, ...contenido, el('span', { class: 'ir' }, '›'))
        : el('div', { class: 'app' }, ...contenido, el('span', { class: 'pronto' }, t('pronto'))),
    );
  }
  const cerrar = el('button', { class: 'boton principal', type: 'button' }, t('listo'));
  const capa = el('div', { class: 'velo' }, el('div', { class: 'dialogo apps' }, el('h2', {}, t('masApps')), lista, cerrar));
  cerrar.addEventListener('click', () => capa.remove());
  raiz.append(capa);
}
