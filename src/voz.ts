import { idiomaActual } from './i18n';
import { sonidoActivo } from './sonido';

// Voz del sistema (Web Speech API): gratis y sin descargas.
// Más adelante se puede sustituir por voces grabadas sin cambiar quien la usa.

const NUMEROS = {
  es: ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince'],
  en: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen'],
};

const COLORES: { rgb: [number, number, number]; es: string; en: string }[] = [
  { rgb: [229, 72, 77], es: 'rojo', en: 'red' },
  { rgb: [255, 138, 61], es: 'naranja', en: 'orange' },
  { rgb: [255, 216, 77], es: 'amarillo', en: 'yellow' },
  { rgb: [255, 243, 168], es: 'amarillo clarito', en: 'light yellow' },
  { rgb: [124, 201, 107], es: 'verde', en: 'green' },
  { rgb: [63, 158, 77], es: 'verde', en: 'green' },
  { rgb: [143, 211, 244], es: 'azul clarito', en: 'light blue' },
  { rgb: [201, 236, 251], es: 'azul clarito', en: 'light blue' },
  { rgb: [79, 169, 230], es: 'azul', en: 'blue' },
  { rgb: [47, 52, 120], es: 'azul oscuro', en: 'dark blue' },
  { rgb: [167, 123, 216], es: 'morado', en: 'purple' },
  { rgb: [255, 143, 199], es: 'rosa', en: 'pink' },
  { rgb: [154, 100, 64], es: 'marrón', en: 'brown' },
  { rgb: [240, 216, 165], es: 'color arena', en: 'sand' },
  { rgb: [255, 255, 255], es: 'blanco', en: 'white' },
  { rgb: [154, 165, 177], es: 'gris', en: 'grey' },
  { rgb: [51, 54, 61], es: 'negro', en: 'black' },
];

export function nombreColor(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  let mejor = COLORES[0];
  let dist = Infinity;
  for (const ref of COLORES) {
    const d = ref.rgb.reduce((s, v, i) => s + (v - c[i]) ** 2, 0);
    if (d < dist) [mejor, dist] = [ref, d];
  }
  return mejor[idiomaActual()];
}

export const nombreNumero = (n: number) => NUMEROS[idiomaActual()][n] ?? String(n);

let vozElegida: SpeechSynthesisVoice | null | undefined;

function voz(): SpeechSynthesisVoice | null {
  const lang = idiomaActual();
  if (vozElegida?.lang.startsWith(lang)) return vozElegida;
  const voces = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith(lang));
  vozElegida = voces.find((v) => v.localService) ?? voces[0] ?? null;
  return vozElegida;
}

export function decir(texto: string) {
  if (!sonidoActivo() || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const frase = new SpeechSynthesisUtterance(texto);
    frase.lang = idiomaActual() === 'es' ? 'es-ES' : 'en-US';
    frase.voice = voz();
    frase.rate = 0.9;
    frase.pitch = 1.15;
    speechSynthesis.speak(frase);
  } catch {
    /* sin voz */
  }
}
