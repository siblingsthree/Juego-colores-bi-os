import { dibujos } from '../dibujos';
import { el } from '../dom';
import { cambiarIdioma, idiomaActual, t } from '../i18n';
import { marca } from '../marca';
import { miniatura } from '../miniatura';
import type { Perfil } from '../perfiles';
import { cargarProgreso, zonasJugables } from '../progreso';
import { alternarSonido, sonidoActivo } from '../sonido';
import { NIVEL_MAXIMO, type Dibujo } from '../tipos';

export function pantallaBiblioteca(
  raiz: HTMLElement,
  perfil: Perfil,
  alElegir: (d: Dibujo) => void,
  alCambiarPerfil: () => void,
) {
  const quien = el('button', { class: 'redondo avatar-boton', type: 'button' }, perfil.avatar);
  quien.addEventListener('click', alCambiarPerfil);

  const sonido = el('button', { class: 'redondo', type: 'button', ariaLabel: t('sonido') }, sonidoActivo() ? '🔊' : '🔈');
  sonido.addEventListener('click', () => (sonido.textContent = alternarSonido() ? '🔊' : '🔈'));

  const idioma = el('button', { class: 'redondo idioma', type: 'button' }, idiomaActual() === 'es' ? 'EN' : 'ES');
  idioma.addEventListener('click', () => {
    cambiarIdioma(idiomaActual() === 'es' ? 'en' : 'es');
    pantallaBiblioteca(raiz, perfil, alElegir, alCambiarPerfil);
  });

  const rejilla = el('div', { class: 'rejilla' });
  for (const d of dibujos) {
    const progreso = cargarProgreso(perfil.id, d, perfil.nivel);
    const tarjeta = el(
      'button',
      { class: 'tarjeta', type: 'button' },
      miniatura(d, perfil.nivel, progreso.orden),
      zonasJugables(d, perfil.nivel).every((z) => progreso.orden.includes(z.id)) ? el('span', { class: 'sello' }, '⭐') : null,
      el('span', { class: 'nombre' }, d.nombre[idiomaActual()], el('span', { class: 'edad-dibujo' }, `${d.edad}+`)),
    );
    tarjeta.addEventListener('click', () => alElegir(d));
    rejilla.append(tarjeta);
  }

  raiz.replaceChildren(
    el(
      'main',
      { class: 'biblioteca' },
      el(
        'header',
        { class: 'barra' },
        quien,
        marca(true),
        el('span', { class: 'nivel', ariaLabel: `${t('nivel')} ${perfil.nivel}` }, '★'.repeat(perfil.nivel) + '☆'.repeat(NIVEL_MAXIMO - perfil.nivel)),
        idioma,
        sonido,
      ),
      rejilla,
    ),
  );
}
