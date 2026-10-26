import { el } from '../dom';
import { t } from '../i18n';

/** Pregunta que un niño pequeño no sabe responder y un adulto sí. */
export function puertaPadres(raiz: HTMLElement, alAcertar: () => void) {
  const a = 3 + Math.floor(Math.random() * 6);
  const b = 3 + Math.floor(Math.random() * 6);
  const correcta = a * b;
  const opciones = new Set([correcta]);
  while (opciones.size < 4) opciones.add(correcta + Math.floor(Math.random() * 13) - 6);
  const botones = el('div', { class: 'botones' });
  const capa = el(
    'div',
    { class: 'velo' },
    el('div', { class: 'dialogo' }, el('p', {}, `${t('preguntaPadres')} ${a} × ${b}?`), botones),
  );
  for (const n of [...opciones].sort(() => Math.random() - 0.5)) {
    const boton = el('button', { class: 'boton', type: 'button' }, String(n));
    boton.addEventListener('click', () => {
      capa.remove();
      if (n === correcta) alAcertar();
    });
    botones.append(boton);
  }
  const cancelar = el('button', { class: 'enlace-padres', type: 'button' }, t('cancelar'));
  cancelar.addEventListener('click', () => capa.remove());
  capa.firstElementChild!.append(cancelar);
  raiz.append(capa);
}
