import { el } from '../dom';
import { t } from '../i18n';
import { AVATARES, EDADES, crearPerfil, listarPerfiles, type Perfil } from '../perfiles';
import { bloqueAjustes, pantallaEditarPerfil } from './ajustes';
import { panelMasApps } from './masApps';
import { puertaPadres } from './padres';

export function pantallaPerfiles(raiz: HTMLElement, alElegir: (p: Perfil) => void) {
  let modoPadres = false;

  function dibujar() {
    const perfiles = listarPerfiles();
    const lista = el('div', { class: 'perfiles' });
    for (const p of perfiles) {
      const boton = el('button', { class: 'perfil', type: 'button' }, el('span', { class: 'avatar' }, p.avatar), el('span', { class: 'estrellas' }, '★'.repeat(p.nivel)));
      // En modo padres, tocar un perfil abre su edición en lugar de empezar a jugar.
      boton.addEventListener('click', () => (modoPadres ? pantallaEditarPerfil(raiz, p, dibujar) : alElegir(p)));
      const tarjeta = el('div', { class: 'tarjeta-perfil' }, boton);
      if (modoPadres) tarjeta.append(el('span', { class: 'lapiz', ariaLabel: t('editar') }, '✎'));
      lista.append(tarjeta);
    }
    const nuevo = el('button', { class: 'perfil nuevo', type: 'button' }, el('span', { class: 'avatar' }, '+'), el('span', {}, t('nuevo')));
    nuevo.addEventListener('click', () => pantallaNuevoPerfil(raiz, alElegir, () => pantallaPerfiles(raiz, alElegir)));
    lista.append(nuevo);

    const padres = el('button', { class: 'enlace-padres', type: 'button' }, modoPadres ? t('listo') : t('paraPadres'));
    padres.addEventListener('click', () => {
      if (modoPadres) {
        modoPadres = false;
        return dibujar();
      }
      puertaPadres(raiz, () => {
        modoPadres = true;
        dibujar();
      });
    });

    const masApps = el('button', { class: 'enlace-padres', type: 'button' }, t('masApps'));
    masApps.addEventListener('click', () => puertaPadres(raiz, () => panelMasApps(raiz)));

    raiz.replaceChildren(
      el(
        'main',
        { class: 'portada' },
        el('h1', { class: 'logo' }, t('titulo')),
        el('h2', {}, t('quienJuega')),
        lista,
        modoPadres ? bloqueAjustes(raiz, dibujar) : null,
        el('div', { class: 'pie' }, padres, masApps),
      ),
    );
  }

  if (listarPerfiles().length === 0) pantallaNuevoPerfil(raiz, alElegir, null);
  else dibujar();
}

function pantallaNuevoPerfil(raiz: HTMLElement, alElegir: (p: Perfil) => void, alVolver: (() => void) | null) {
  let avatar = '';
  const volver = alVolver ? el('button', { class: 'redondo esquina', type: 'button', ariaLabel: t('volver') }, '‹') : null;
  volver?.addEventListener('click', () => alVolver?.());

  const animales = el('div', { class: 'rejilla-avatares' });
  for (const a of AVATARES) {
    const b = el('button', { class: 'perfil', type: 'button' }, el('span', { class: 'avatar' }, a));
    b.addEventListener('click', () => {
      avatar = a;
      pasoEdad();
    });
    animales.append(b);
  }
  raiz.replaceChildren(el('main', { class: 'portada' }, volver, el('h1', { class: 'logo' }, t('titulo')), el('h2', {}, t('elegirAnimal')), animales));

  function pasoEdad() {
    const edades = el('div', { class: 'rejilla-edades' });
    for (const e of EDADES) {
      const b = el('button', { class: 'edad', type: 'button' }, String(e));
      b.addEventListener('click', () => alElegir(crearPerfil(avatar, e)));
      edades.append(b);
    }
    raiz.replaceChildren(
      el('main', { class: 'portada' }, volver, el('div', { class: 'avatar grande' }, avatar), el('h2', {}, t('cuantosAnos')), edades),
    );
  }
}
