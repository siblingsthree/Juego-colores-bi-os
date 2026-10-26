import { escribir, leer } from './almacen';

// Sonidos sintetizados: no hace falta descargar ningún archivo.

let ctx: AudioContext | null = null;
let activo = leer('sonido', true);

export const sonidoActivo = () => activo;
export function alternarSonido() {
  activo = !activo;
  escribir('sonido', activo);
  return activo;
}

function audio(): AudioContext | null {
  if (!activo) return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function nota(frecuencia: number, inicio: number, duracion: number, tipo: OscillatorType, volumen: number, subida = 1) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime + inicio;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tipo;
  o.frequency.setValueAtTime(frecuencia, t);
  if (subida !== 1) o.frequency.exponentialRampToValueAtTime(frecuencia * subida, t + duracion * 0.6);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(volumen, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + duracion + 0.02);
}

const ESCALA = [0, 2, 4, 7, 9, 12, 14, 16];

/** "Pop" al pintar; sube por la escala para que pintar seguido suene a melodía. */
export function pop(paso: number) {
  const semitonos = ESCALA[paso % ESCALA.length];
  nota(440 * Math.pow(2, semitonos / 12), 0, 0.16, 'sine', 0.25, 1.5);
}

/** Toque suave cuando la zona no es la del color elegido. Nunca suena a castigo. */
export function boing() {
  nota(220, 0, 0.22, 'triangle', 0.15, 0.7);
}

export function colorCompleto() {
  nota(660, 0, 0.12, 'sine', 0.2);
  nota(880, 0.09, 0.18, 'sine', 0.2);
}

export function fanfarria() {
  [523, 659, 784, 1047].forEach((f, i) => nota(f, i * 0.13, 0.35, 'triangle', 0.22));
  nota(1319, 0.6, 0.6, 'sine', 0.18);
}

export function vibrar(ms = 12) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* no disponible */
  }
}
