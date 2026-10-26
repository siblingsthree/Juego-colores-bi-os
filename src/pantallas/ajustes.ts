import { borrarTodo } from '../almacen';
import { creditos } from '../creditos';
import { dibujos } from '../dibujos';
import { el } from '../dom';
import { cambiarIdioma, idiomaActual, t } from '../i18n';
import { AVATARES, EDADES, actualizarPerfil, borrarPerfil, borrarProgreso, nivelPorEdad, type Perfil } from '../perfiles';
import { alternarSonido, sonidoActivo } from '../sonido';
import { NIVELES, type Idioma } from '../tipos';

/** Confirmación dentro de la página (los diálogos del navegador no sirven en todas partes). */
export function confirmar(raiz: HTMLElement, aviso: string, accion: string, alAceptar: () => void) {
  const cancelar = el('button', { class: 'boton', type: 'button' }, t('cancelar'));
  const aceptar = el('button', { class: 'boton peligro', type: 'button' }, accion);
  const capa = el('div', { class: 'velo' }, el('div', { class: 'dialogo' }, el('p', {}, aviso), el('div', { class: 'botones' }, cancelar, aceptar)));
  cancelar.addEventListener('click', () => capa.remove());
  aceptar.addEventListener('click', () => {
    capa.remove();
    alAceptar();
  });
  raiz.append(capa);
}

/** Fila de botones en la que uno está marcado como elegido. */
function opciones<T>(valores: T[], actual: T, texto: (v: T) => string, alElegir: (v: T) => void, clase = '') {
  const fila = el('div', { class: `opciones ${clase}` });
  for (const v of valores) {
    const b = el('button', { class: v === actual ? 'activo' : '', type: 'button' }, texto(v));
    b.addEventListener('click', () => alElegir(v));
    fila.append(b);
  }
  return fila;
}

const bloque = (titulo: string, ...hijos: HTMLElement[]) => el('section', { class: 'bloque' }, el('h3', {}, titulo), ...hijos);

export function pantallaEditarPerfil(raiz: HTMLElement, perfil: Perfil, alVolver: () => void) {
  const cambiar = (cambios: Partial<Perfil>) => {
    perfil = { ...perfil, ...cambios };
    actualizarPerfil(perfil);
    dibujar();
  };

  function dibujar() {
    const volver = el('button', { class: 'redondo esquina', type: 'button', ariaLabel: t('volver') }, '‹');
    volver.addEventListener('click', alVolver);
    const borrarDibujos = el('button', { class: 'boton', type: 'button' }, t('borrarDibujos'));
    borrarDibujos.addEventListener('click', () =>
      confirmar(raiz, t('avisoBorrarDibujos'), t('borrar'), () => borrarProgreso(perfil)),
    );
    const eliminar = el('button', { class: 'boton peligro', type: 'button' }, t('borrarPerfil'));
    eliminar.addEventListener('click', () =>
      confirmar(raiz, t('avisoBorrarPerfil'), t('borrar'), () => {
        borrarPerfil(perfil);
        alVolver();
      }),
    );
    const listo = el('button', { class: 'boton principal', type: 'button' }, t('listo'));
    listo.addEventListener('click', alVolver);

    raiz.replaceChildren(
      el(
        'main',
        { class: 'ajustes' },
        volver,
        el('div', { class: 'avatar grande' }, perfil.avatar),
        bloque(t('animal'), opciones(AVATARES, perfil.avatar, (a) => a, (avatar) => cambiar({ avatar }), 'avatares')),
        // Cambiar la edad vuelve a poner el nivel que le corresponde; después se puede ajustar a mano.
        bloque(t('edad'), opciones(EDADES, perfil.edad, String, (edad) => cambiar({ edad, nivel: nivelPorEdad(edad), racha: 0 }))),
        bloque(t('nivel'), opciones(NIVELES, perfil.nivel, (n) => '★'.repeat(n), (nivel) => cambiar({ nivel, racha: 0 }), 'niveles')),
        el('div', { class: 'botones' }, borrarDibujos, eliminar),
        listo,
      ),
    );
  }
  dibujar();
}

/** Ajustes generales, visibles en modo padres. Llama a `alCambiar` para que la portada se redibuje. */
export function bloqueAjustes(raiz: HTMLElement, alCambiar: () => void) {
  const restablecer = el('button', { class: 'boton peligro', type: 'button' }, t('restablecer'));
  restablecer.addEventListener('click', () =>
    confirmar(raiz, t('avisoRestablecer'), t('borrarTodo'), () => {
      borrarTodo();
      // Recargar devuelve también el idioma y el sonido a los del dispositivo.
      location.reload();
    }),
  );
  const verCreditos = el('button', { class: 'boton', type: 'button' }, t('creditos'));
  verCreditos.addEventListener('click', () => panelCreditos(raiz));
  return el(
    'div',
    { class: 'ajustes-generales' },
    bloque(
      t('idioma'),
      opciones<Idioma>(['es', 'en'], idiomaActual(), (i) => (i === 'es' ? 'Español' : 'English'), (i) => {
        cambiarIdioma(i);
        alCambiar();
      }),
    ),
    bloque(
      t('sonidoYVoz'),
      opciones([true, false], sonidoActivo(), (v) => (v ? t('activado') : t('desactivado')), (v) => {
        if (v !== sonidoActivo()) alternarSonido();
        alCambiar();
      }),
    ),
    verCreditos,
    restablecer,
  );
}

/** Autoría de los dibujos que salen de fuentes libres, con el texto de su licencia. */
function panelCreditos(raiz: HTMLElement) {
  const listo = el('button', { class: 'boton principal', type: 'button' }, t('listo'));
  const contenido = el('div', { class: 'creditos' }, el('h2', {}, t('creditos')), el('p', {}, t('creditosApp')));
  for (const { credito, ids, licencia } of creditos()) {
    const nombres = ids.map((id) => dibujos.find((d) => d.id === id)!.nombre[idiomaActual()]).join(', ');
    contenido.append(el('h3', {}, credito), el('p', {}, `${t('creditosDibujos')}: ${nombres}.`));
    if (licencia) contenido.append(el('pre', {}, licencia));
  }
  const capa = el('div', { class: 'velo' }, el('div', { class: 'dialogo panel-creditos' }, contenido, listo));
  listo.addEventListener('click', () => capa.remove());
  raiz.append(capa);
}
