import { lanzarConfeti } from '../confeti';
import { el, svg, textoSobre } from '../dom';
import { t } from '../i18n';
import { COLOR_LINEA, GROSOR_LINEA } from '../miniatura';
import { registrarDibujoTerminado, type Perfil } from '../perfiles';
import { cargarProgreso, guardarProgreso, zonasJugables } from '../progreso';
import { boing, colorCompleto, fanfarria, pop, vibrar } from '../sonido';
import type { Dibujo, Zona } from '../tipos';

const ICONO_VOLVER =
  '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICONO_VARITA =
  '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M4 20L14 10" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M16 2l1.2 3.3L20.5 6.5l-3.3 1.2L16 11l-1.2-3.3L11.5 6.5l3.3-1.2z" fill="#ffc531" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>';

/** Distancia (en píxeles de pantalla) a la que un toque todavía cuenta para una zona. */
const TOLERANCIA = [8, 16, 24];
const MOVIMIENTO_MAX_TOQUE = 12;
const ZOOM_MAX = 4;

export function pantallaPintar(raiz: HTMLElement, perfil: Perfil, dibujo: Dibujo, alSalir: () => void) {
  const nivel = perfil.nivel;
  const modoPuntos = nivel === 1;
  const jugables = zonasJugables(dibujo, nivel);
  const colores = [...new Set(jugables.map((z) => z.color))].sort((a, b) => a - b);
  const numero = new Map(colores.map((c, i) => [c, i + 1]));
  const tamBase = Math.round(dibujo.ancho / 24);

  const progreso = cargarProgreso(perfil.id, dibujo, nivel);
  const pintadas = new Set(progreso.orden);
  const restantes = (color: number) => jugables.filter((z) => z.color === color && !pintadas.has(z.id));
  const totalDe = (color: number) => jugables.filter((z) => z.color === color).length;

  let seleccionado = colores.find((c) => restantes(c).length > 0) ?? colores[0];

  // ---------- Dibujo ----------
  const rayaTrama = svg('rect', { width: 5, height: 12 });
  const trama = svg(
    'pattern',
    { id: 'trama', width: 12, height: 12, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' },
    svg('rect', { width: 12, height: 12, fill: '#ffffff' }),
    rayaTrama,
  );
  const defs = svg('defs', {}, trama);
  const capaZonas = svg('g');
  const capaEtiquetas = svg('g', { class: 'etiquetas' });
  const camara = svg('g', {}, capaZonas, capaEtiquetas);
  const lamina = svg('svg', { viewBox: `0 0 ${dibujo.ancho} ${dibujo.alto}`, class: 'lamina' }, defs, camara);

  const caminos = new Map<string, SVGPathElement>();
  const etiquetas = new Map<string, SVGElement>();
  const zonaDeCamino = new Map<Element, Zona>();

  for (const z of dibujo.zonas) {
    const camino = svg('path', {
      d: z.d,
      stroke: COLOR_LINEA,
      'stroke-width': GROSOR_LINEA,
      'stroke-linejoin': 'round',
      class: 'zona',
    });
    caminos.set(z.id, camino);
    zonaDeCamino.set(camino, z);
    capaZonas.append(camino);
    if (z.nivel <= nivel) {
      const [x, y] = z.etiqueta;
      const tam = z.tam ?? tamBase;
      const etiqueta = modoPuntos
        ? svg('circle', { cx: x, cy: y, r: tam * 0.55, fill: dibujo.paleta[z.color], stroke: COLOR_LINEA, 'stroke-width': 1.5 })
        : svg('text', { x, y, 'font-size': tam, 'text-anchor': 'middle', 'dominant-baseline': 'central' });
      if (!modoPuntos) etiqueta.textContent = String(numero.get(z.color));
      etiquetas.set(z.id, etiqueta);
      capaEtiquetas.append(etiqueta);
    }
  }

  function colorearZona(z: Zona) {
    const camino = caminos.get(z.id)!;
    const fija = z.nivel > nivel;
    if (fija || pintadas.has(z.id)) camino.setAttribute('fill', dibujo.paleta[z.color]);
    else camino.setAttribute('fill', z.color === seleccionado ? 'url(#trama)' : '#ffffff');
    etiquetas.get(z.id)?.classList.toggle('oculta', pintadas.has(z.id));
  }

  function refrescarDibujo() {
    rayaTrama.setAttribute('fill', dibujo.paleta[seleccionado]);
    rayaTrama.setAttribute('fill-opacity', dibujo.paleta[seleccionado] === '#ffffff' ? '0' : '0.4');
    trama.firstElementChild!.setAttribute('fill', dibujo.paleta[seleccionado] === '#ffffff' ? '#e3e7ee' : '#ffffff');
    dibujo.zonas.forEach(colorearZona);
  }

  // ---------- Paleta ----------
  const fichas = new Map<number, HTMLButtonElement>();
  const paleta = el('nav', { class: 'paleta' });
  for (const c of colores) {
    const hex = dibujo.paleta[c];
    const ficha = el('button', { class: 'ficha', type: 'button' });
    ficha.style.setProperty('--color', hex);
    ficha.style.setProperty('--texto', textoSobre(hex));
    ficha.setAttribute('aria-label', `${t('nivel')} ${numero.get(c)}`);
    ficha.innerHTML =
      `<svg class="anillo" viewBox="0 0 44 44"><circle cx="22" cy="22" r="20" pathLength="100"/></svg>` +
      `<span class="numero">${modoPuntos ? '' : numero.get(c)}</span><span class="hecho">✓</span>`;
    ficha.addEventListener('click', () => seleccionar(c));
    fichas.set(c, ficha);
    paleta.append(ficha);
  }

  function refrescarPaleta() {
    for (const [c, ficha] of fichas) {
      const total = totalDe(c);
      const hechas = total - restantes(c).length;
      ficha.classList.toggle('activa', c === seleccionado);
      ficha.classList.toggle('completa', hechas === total);
      ficha.querySelector<SVGCircleElement>('.anillo circle')!.style.strokeDasharray = `${(100 * hechas) / total} 100`;
    }
  }

  function seleccionar(c: number) {
    seleccionado = c;
    refrescarDibujo();
    refrescarPaleta();
    fichas.get(c)?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }

  // ---------- Pantalla ----------
  lamina.style.setProperty('--proporcion', String(dibujo.ancho / dibujo.alto));
  const lienzo = el('div', { class: 'lienzo' }, lamina);
  const botonVolver = el('button', { class: 'redondo', type: 'button', innerHTML: ICONO_VOLVER, ariaLabel: t('volver') });
  const botonPista = el('button', { class: 'redondo pista', type: 'button', innerHTML: ICONO_VARITA, ariaLabel: t('pista') });
  const cabecera = el('header', { class: 'barra' }, botonVolver, el('span', { class: 'avatar-mini' }, perfil.avatar), botonPista);
  const pantalla = el('main', { class: 'pintar' }, cabecera, lienzo, paleta);
  raiz.replaceChildren(pantalla);

  botonVolver.addEventListener('click', alSalir);
  botonPista.addEventListener('click', pista);

  refrescarDibujo();
  refrescarPaleta();
  if (progreso.terminado) setTimeout(() => celebrar(false), 300);

  // ---------- Pintar ----------
  const sinPintar = (z: Zona | undefined): z is Zona => !!z && z.nivel <= nivel && !pintadas.has(z.id);
  const esCandidata = (z: Zona | undefined): z is Zona => sinPintar(z) && z.color === seleccionado;

  function zonaEn(x: number, y: number) {
    const e = document.elementFromPoint(x, y);
    return e ? zonaDeCamino.get(e) : undefined;
  }

  function tocar(x: number, y: number) {
    if (progreso.terminado) return;
    const tocada = zonaEn(x, y);
    if (esCandidata(tocada)) return pintar(tocada, x, y);
    // Los dedos pequeños fallan por poco: probamos alrededor del toque.
    for (const r of TOLERANCIA) {
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const z = zonaEn(x + r * Math.cos(a), y + r * Math.sin(a));
        if (esCandidata(z)) return pintar(z, x, y);
      }
    }
    if (sinPintar(tocada)) fallo();
  }

  function pintar(z: Zona, x: number, y: number) {
    pintadas.add(z.id);
    progreso.orden.push(z.id);
    guardarProgreso(perfil.id, dibujo, nivel, progreso);
    onda(z, x, y);
    etiquetas.get(z.id)?.classList.add('oculta');
    pop(progreso.orden.length);
    vibrar();
    refrescarPaleta();

    if (restantes(z.color).length === 0) {
      colorCompleto();
      const siguiente = colores.find((c) => restantes(c).length > 0);
      if (siguiente === undefined) return terminar();
      setTimeout(() => seleccionar(siguiente), 350);
    }
  }

  /** Relleno en forma de onda que sale del dedo. */
  function onda(z: Zona, x: number, y: number) {
    const camino = caminos.get(z.id)!;
    const ctm = camino.getScreenCTM();
    const local = ctm ? new DOMPoint(x, y).matrixTransform(ctm.inverse()) : new DOMPoint(...z.etiqueta);
    const caja = camino.getBBox();
    const rMax = Math.hypot(Math.max(local.x - caja.x, caja.x + caja.width - local.x), Math.max(local.y - caja.y, caja.y + caja.height - local.y));
    const idClip = `clip-${z.id}`;
    const clip = svg('clipPath', { id: idClip }, svg('path', { d: z.d }));
    defs.append(clip);
    const circulo = svg('circle', { cx: local.x, cy: local.y, r: 0, fill: dibujo.paleta[z.color], 'clip-path': `url(#${idClip})`, 'pointer-events': 'none' });
    camino.after(circulo);
    const inicio = performance.now();
    const duracion = 320;
    const paso = (ahora: number) => {
      const k = Math.min(1, Math.max(0, (ahora - inicio) / duracion));
      circulo.setAttribute('r', String(rMax * (1 - Math.pow(1 - k, 3))));
      if (k < 1) return requestAnimationFrame(paso);
      colorearZona(z);
      circulo.remove();
      clip.remove();
    };
    requestAnimationFrame(paso);
  }

  function fallo() {
    progreso.fallos++;
    guardarProgreso(perfil.id, dibujo, nivel, progreso);
    boing();
    destacar();
    const ficha = fichas.get(seleccionado)!;
    ficha.classList.remove('meneo');
    void ficha.offsetWidth;
    ficha.classList.add('meneo');
  }

  /** Hace latir las zonas que faltan del color elegido. */
  function destacar() {
    for (const z of restantes(seleccionado)) {
      const camino = caminos.get(z.id)!;
      camino.classList.remove('latido');
      void camino.getBoundingClientRect();
      camino.classList.add('latido');
    }
  }

  function pista() {
    if (progreso.terminado) return;
    if (restantes(seleccionado).length === 0) {
      const siguiente = colores.find((c) => restantes(c).length > 0);
      if (siguiente !== undefined) seleccionar(siguiente);
    }
    if (escala > 1) restablecerCamara();
    destacar();
  }

  function terminar() {
    progreso.terminado = true;
    guardarProgreso(perfil.id, dibujo, nivel, progreso);
    const sube = registrarDibujoTerminado(perfil, progreso.fallos);
    setTimeout(() => celebrar(true, sube), 450);
  }

  function celebrar(conFiesta: boolean, sube = false) {
    restablecerCamara();
    capaEtiquetas.classList.add('oculta');
    if (conFiesta) {
      fanfarria();
      lanzarConfeti(pantalla);
    }
    const repetir = el('button', { class: 'boton', type: 'button' }, t('verComo'));
    const otro = el('button', { class: 'boton principal', type: 'button' }, t('otro'));
    const tarjeta = el(
      'div',
      { class: 'final' },
      el('div', { class: 'estrella-final' }, '⭐'),
      el('h2', {}, t('muyBien')),
      sube ? el('p', { class: 'sube' }, `${t('subeNivel')} ${'★'.repeat(perfil.nivel)}`) : null,
      el('div', { class: 'botones' }, repetir, otro),
    );
    pantalla.append(tarjeta);
    otro.addEventListener('click', alSalir);
    repetir.addEventListener('click', () => {
      tarjeta.remove();
      repeticion().then(() => pantalla.append(tarjeta));
    });
  }

  /** Vuelve a pintar el dibujo, rápido, en el orden en que lo pintó el niño. */
  function repeticion() {
    for (const z of jugables) caminos.get(z.id)!.setAttribute('fill', '#ffffff');
    const intervalo = Math.max(60, Math.min(220, 3000 / progreso.orden.length));
    return new Promise<void>((fin) => {
      progreso.orden.forEach((id, i) =>
        setTimeout(() => {
          const z = dibujo.zonas.find((zz) => zz.id === id)!;
          caminos.get(id)!.setAttribute('fill', dibujo.paleta[z.color]);
          caminos.get(id)!.classList.add('aparece');
          pop(i);
          if (i === progreso.orden.length - 1) setTimeout(fin, 600);
        }, 300 + i * intervalo),
      );
    });
  }

  // ---------- Zoom y desplazamiento (opcional) ----------
  let escala = 1;
  let tx = 0;
  let ty = 0;

  function aplicarCamara() {
    tx = Math.min(0, Math.max(dibujo.ancho * (1 - escala), tx));
    ty = Math.min(0, Math.max(dibujo.alto * (1 - escala), ty));
    camara.setAttribute('transform', `translate(${tx} ${ty}) scale(${escala})`);
    capaEtiquetas.classList.toggle('grande', escala > 1.5);
  }

  function restablecerCamara() {
    escala = 1;
    tx = ty = 0;
    aplicarCamara();
  }

  function aLamina(x: number, y: number) {
    const ctm = lamina.getScreenCTM();
    return ctm ? new DOMPoint(x, y).matrixTransform(ctm.inverse()) : new DOMPoint(x, y);
  }

  function zoomEn(x: number, y: number, nuevaEscala: number) {
    const p = aLamina(x, y);
    const e = Math.min(ZOOM_MAX, Math.max(1, nuevaEscala));
    tx = p.x - (p.x - tx) * (e / escala);
    ty = p.y - (p.y - ty) * (e / escala);
    escala = e;
    aplicarCamara();
  }

  const punteros = new Map<number, { x: number; y: number }>();
  let gesto: { x: number; y: number; movido: boolean; multitoque: boolean; dist: number } | null = null;

  lienzo.addEventListener('pointerdown', (ev) => {
    lienzo.setPointerCapture(ev.pointerId);
    punteros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (punteros.size === 1) gesto = { x: ev.clientX, y: ev.clientY, movido: false, multitoque: false, dist: 0 };
    else if (gesto) {
      gesto.multitoque = true;
      gesto.dist = distanciaPunteros();
    }
  });

  lienzo.addEventListener('pointermove', (ev) => {
    const anterior = punteros.get(ev.pointerId);
    if (!anterior || !gesto) return;
    punteros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (punteros.size >= 2) {
      const d = distanciaPunteros();
      const [a, b] = [...punteros.values()];
      if (gesto.dist > 0) zoomEn((a.x + b.x) / 2, (a.y + b.y) / 2, escala * (d / gesto.dist));
      gesto.dist = d;
      desplazar(ev.clientX - anterior.x, ev.clientY - anterior.y, 2);
      return;
    }
    if (Math.hypot(ev.clientX - gesto.x, ev.clientY - gesto.y) > MOVIMIENTO_MAX_TOQUE) gesto.movido = true;
    if (gesto.movido && escala > 1) desplazar(ev.clientX - anterior.x, ev.clientY - anterior.y, 1);
  });

  const soltar = (ev: PointerEvent) => {
    if (!punteros.delete(ev.pointerId)) return;
    if (punteros.size === 0 && gesto) {
      if (!gesto.movido && !gesto.multitoque && ev.type === 'pointerup') tocar(ev.clientX, ev.clientY);
      gesto = null;
    }
  };
  lienzo.addEventListener('pointerup', soltar);
  lienzo.addEventListener('pointercancel', soltar);

  lienzo.addEventListener(
    'wheel',
    (ev) => {
      ev.preventDefault();
      zoomEn(ev.clientX, ev.clientY, escala * Math.exp(-ev.deltaY / 300));
    },
    { passive: false },
  );

  function distanciaPunteros() {
    const [a, b] = [...punteros.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function desplazar(dx: number, dy: number, dedos: number) {
    const ctm = lamina.getScreenCTM();
    if (!ctm) return;
    tx += dx / ctm.a / dedos;
    ty += dy / ctm.d / dedos;
    aplicarCamara();
  }
}
