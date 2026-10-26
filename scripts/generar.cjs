// Genera un dibujo del juego a partir de una imagen.
//
//   node scripts/generar.cjs vidriera <imagen.svg|png> <id> "<nombre es>" "<nombre en>" <categoria> <edad> [opciones]
//   node scripts/generar.cjs foto     <imagen.png|jpg> <id> "<nombre es>" "<nombre en>" <categoria> <edad> [opciones]
//
// vidriera: cada mancha de color de la imagen se trocea en "cristales" (celdas) cada vez más pequeños.
//           Los cristales pequeños solo existen en los niveles altos (zonas ocultas).
// foto:     la imagen se reduce a K colores y cada mancha de color es una zona; las manchas
//           pequeñas se reparten entre los niveles altos (ya pintadas en los bajos).
//
// Opciones: --fondo=#rrggbb  --colores=12 (solo foto)  --densidad=1 (solo vidriera)  --credito="texto"  --salida=ruta.ts
// Escribe src/dibujos/generados/<id>.ts. Necesita Playwright (ya instalado en el entorno).

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const R = 800; // píxeles del lado mayor al rasterizar; el dibujo final mide R / ESCALA unidades
const ESCALA = 2;
const TOLERANCIA_SIMPLIFICAR = 1.2; // píxeles: cuánto se puede desviar el contorno simplificado

// Área (en píxeles) por celda de cada nivel en modo vidriera.
const AREA_CELDA = { 1: 36000, 2: 14000, 3: 6500, 4: 3200 };
// --densidad: 1 = normal (~200 cristales en el nivel 4); 0,5 = la mitad de cristales en cada nivel.
let DENSIDAD = 1;
const MAX_HIJOS = 6;
// Zonas más pequeñas que esto se funden con una vecina.
const AREA_MINIMA = 600;
const RADIO_MINIMO = 6;
// La línea negra del juego mide 2,6 unidades = 5,2 px a esta escala: se come unos 3 px de cada borde.
const MEDIA_LINEA = 4; // 3 px de línea + 1 px que puede desviarse el contorno simplificado
// Restos más pequeños que esto quedan escondidos bajo la línea y no cuentan como trozo.
const RESTO_MINIMO = 25;
// Lo que se ve de una pieza tras la línea negra debe medir al menos esto (igual que en
// scripts/comprobar-zonas.cjs, que lo comprueba a la misma escala de 800 px).
const VISIBLE_MINIMO = 150;

// ---------- utilidades de color ----------

const hex = (r, g, b) => '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const deHex = (h) => {
  if (h.length === 4) h = '#' + [...h.slice(1)].map((c) => c + c).join('');
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const dist2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

/** Aclara (k > 0) u oscurece (k < 0) un color, mezclándolo con blanco o negro. */
function matiz(h, k) {
  const [r, g, b] = deHex(h);
  const m = k > 0 ? 255 : 0;
  const f = Math.abs(k);
  return hex(r + (m - r) * f, g + (m - g) * f, b + (m - b) * f);
}

// ---------- rasterizar con el navegador ----------

async function rasterizar(ruta, modo, fondo) {
  let datos = fs.readFileSync(ruta);
  const ext = path.extname(ruta).toLowerCase();
  let mime = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }[ext];
  if (!mime) throw new Error(`Formato no admitido: ${ext}`);
  if (ext === '.svg') {
    // Sin width/height el navegador no sabe el tamaño natural del SVG.
    let s = datos.toString();
    const vb = s.match(/viewBox="([^"]+)"/);
    if (vb && !/<svg[^>]*\swidth=/.test(s)) {
      const [, , w, h] = vb[1].trim().split(/[\s,]+/);
      s = s.replace('<svg', `<svg width="${w}" height="${h}"`);
    }
    datos = Buffer.from(s);
  }
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage();
  const res = await pagina.evaluate(
    async ({ data, R, modo, fondo }) => {
      const img = new Image();
      img.src = data;
      await img.decode();
      const iw = img.naturalWidth, ih = img.naturalHeight;
      let W, H, dx, dy, dw, dh;
      if (modo === 'vidriera') {
        W = H = R;
        const s = Math.min((R * 0.84) / iw, (R * 0.84) / ih);
        dw = iw * s; dh = ih * s; dx = (R - dw) / 2; dy = (R - dh) / 2;
      } else {
        const s = R / Math.max(iw, ih);
        W = Math.round(iw * s); H = Math.round(ih * s); dx = dy = 0; dw = W; dh = H;
      }
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const g = c.getContext('2d');
      if (modo === 'foto') { g.fillStyle = fondo; g.fillRect(0, 0, W, H); }
      g.drawImage(img, dx, dy, dw, dh);
      const d = g.getImageData(0, 0, W, H).data;
      let s = '';
      for (let i = 0; i < d.length; i += 8192) s += String.fromCharCode(...d.subarray(i, i + 8192));
      return { W, H, b64: btoa(s) };
    },
    { data: `data:${mime};base64,${datos.toString('base64')}`, R, modo, fondo },
  );
  await navegador.close();
  return { W: res.W, H: res.H, px: Buffer.from(res.b64, 'base64') };
}

// ---------- operaciones sobre la rejilla de píxeles ----------

let W = 0, H = 0, N = 0;
const vecinos = (p, f) => {
  const x = p % W;
  if (x > 0) f(p - 1);
  if (x < W - 1) f(p + 1);
  if (p >= W) f(p - W);
  if (p + W < N) f(p + W);
};

/** Componentes conexas (4 vecinos) de una etiqueta. Devuelve comp[p] y la lista de componentes. */
function componentes(etiqueta) {
  const comp = new Int32Array(N).fill(-1);
  const lista = [];
  const pila = [];
  for (let p0 = 0; p0 < N; p0++) {
    if (comp[p0] !== -1) continue;
    const id = lista.length;
    const pixeles = [];
    comp[p0] = id;
    pila.push(p0);
    while (pila.length) {
      const p = pila.pop();
      pixeles.push(p);
      vecinos(p, (q) => {
        if (comp[q] === -1 && etiqueta[q] === etiqueta[p0]) { comp[q] = id; pila.push(q); }
      });
    }
    lista.push({ id, etiqueta: etiqueta[p0], pixeles });
  }
  return { comp, lista };
}

/** Distancia (en pasos) de cada píxel del conjunto al exterior del conjunto. */
function distanciaAlBorde(pixeles, dentro) {
  const dist = new Map();
  const cola = [];
  for (const p of pixeles) {
    let borde = p % W === 0 || p % W === W - 1 || p < W || p + W >= N;
    if (!borde) vecinos(p, (q) => { if (!dentro(q)) borde = true; });
    if (borde) { dist.set(p, 1); cola.push(p); }
  }
  for (let i = 0; i < cola.length; i++) {
    const p = cola[i];
    vecinos(p, (q) => { if (dentro(q) && !dist.has(q)) { dist.set(q, dist.get(p) + 1); cola.push(q); } });
  }
  return dist;
}

function masInterior(pixeles, dentro) {
  const dist = distanciaAlBorde(pixeles, dentro);
  let mejor = pixeles[0], d = -1;
  for (const p of pixeles) if (dist.get(p) > d) { d = dist.get(p); mejor = p; }
  return { p: mejor, radio: d };
}

/** Reparte los píxeles del conjunto entre las semillas (frente de onda desde cada semilla). */
function repartir(pixeles, dentro, semillas, destino) {
  const cola = [];
  for (const p of pixeles) destino[p] = -1;
  for (const s of semillas) { destino[s.p] = s.id; cola.push(s.p); }
  for (let i = 0; i < cola.length; i++) {
    const p = cola[i];
    vecinos(p, (q) => { if (dentro(q) && destino[q] === -1) { destino[q] = destino[p]; cola.push(q); } });
  }
}

/**
 * Reparte el conjunto entre las semillas fijas y las candidatas, quitando candidatas hasta que
 * ningún trozo sea más fino que la línea negra del juego. Devuelve las semillas que quedan.
 */
/**
 * Lo que queda de una pieza cuando la línea negra del juego se come su borde: debe ser un solo
 * trozo. Si la pieza tiene un cuello más estrecho que la línea, queda partida en dos.
 */
function seVeEntera(pixeles, dentro) {
  const dist = distanciaAlBorde(pixeles, dentro);
  const nucleo = new Set(pixeles.filter((p) => dist.get(p) > MEDIA_LINEA));
  if (!nucleo.size) return false;
  let trozos = 0, mayor = 0;
  const visto = new Set();
  for (const p0 of nucleo) {
    if (visto.has(p0)) continue;
    let tam = 0;
    const pila = [p0];
    visto.add(p0);
    while (pila.length) {
      const p = pila.pop();
      tam++;
      vecinos(p, (q) => { if (nucleo.has(q) && !visto.has(q)) { visto.add(q); pila.push(q); } });
    }
    if (tam >= RESTO_MINIMO) trozos++;
    mayor = Math.max(mayor, tam);
  }
  return trozos === 1 && mayor >= VISIBLE_MINIMO;
}

function repartirSinFinos(pixeles, dentro, fijas, candidatas, destino) {
  const umbral = RADIO_MINIMO + 1;
  for (;;) {
    const semillas = [...fijas, ...candidatas];
    repartir(pixeles, dentro, semillas, destino);
    const porSemilla = new Map(semillas.map((s) => [s.id, []]));
    for (const p of pixeles) porSemilla.get(destino[p]).push(p);
    // La peor pieza: primero las que la línea negra partiría; si no hay, la más estrecha.
    let fina = null, radioMin = Infinity;
    for (const s of semillas) {
      const dentroDe = (q) => destino[q] === s.id;
      const pieza = porSemilla.get(s.id);
      const { radio } = masInterior(pieza, dentroDe);
      const nota = seVeEntera(pieza, dentroDe) ? radio : -1;
      if (nota < radioMin) { radioMin = nota; fina = s; }
    }
    if (radioMin >= umbral || !candidatas.length) return semillas;
    if (candidatas.includes(fina)) candidatas = candidatas.filter((s) => s !== fina);
    else {
      // El trozo fino es de una semilla fija: quitamos la candidata más cercana a ella.
      const d = (s) => ((s.p % W) - (fina.p % W)) ** 2 + (((s.p / W) | 0) - ((fina.p / W) | 0)) ** 2;
      candidatas = candidatas.filter((s) => s !== candidatas.reduce((a, b) => (d(a) <= d(b) ? a : b)));
    }
  }
}

/** Elige k semillas bien repartidas dentro del conjunto (la primera es la más interior). */
function elegirSemillas(pixeles, dentro, k, fijas = []) {
  const semillas = [...fijas];
  if (!semillas.length) semillas.push(masInterior(pixeles, dentro).p);
  const dist = new Map();
  while (semillas.length < k) {
    dist.clear();
    const cola = [];
    for (const s of semillas) { dist.set(s, 0); cola.push(s); }
    for (let i = 0; i < cola.length; i++) {
      const p = cola[i];
      vecinos(p, (q) => { if (dentro(q) && !dist.has(q)) { dist.set(q, dist.get(p) + 1); cola.push(q); } });
    }
    let mejor = -1, d = -1;
    for (const p of pixeles) if ((dist.get(p) ?? 0) > d) { d = dist.get(p); mejor = p; }
    if (mejor < 0 || d < 4) break;
    semillas.push(mejor);
  }
  return semillas;
}

/** Funde las componentes demasiado pequeñas o demasiado finas con su vecina más frecuente. */
function fusionarPequenas(etiqueta, esPequena) {
  for (let vuelta = 0; vuelta < 10; vuelta++) {
    const { comp, lista } = componentes(etiqueta);
    const pequenas = lista.filter((c) => esPequena(c, comp)).sort((a, b) => a.pixeles.length - b.pixeles.length);
    if (!pequenas.length) return;
    for (const c of pequenas) {
      const cuenta = new Map();
      for (const p of c.pixeles) vecinos(p, (q) => { if (comp[q] !== c.id) cuenta.set(etiqueta[q], (cuenta.get(etiqueta[q]) ?? 0) + 1); });
      if (!cuenta.size) continue;
      const [nueva] = [...cuenta.entries()].sort((a, b) => b[1] - a[1])[0];
      for (const p of c.pixeles) etiqueta[p] = nueva;
    }
  }
}

/**
 * Quita las partes más finas que 2·r píxeles de cada mancha (hilos y puntas), porque la línea
 * negra del juego las taparía y dejarían la mancha partida. Los píxeles quitados pasan a la vecina.
 */
function abrir(etiqueta, r) {
  const { comp, lista } = componentes(etiqueta);
  const quitar = [];
  for (const c of lista) {
    const dentro = (q) => comp[q] === c.id;
    const dist = distanciaAlBorde(c.pixeles, dentro);
    const nucleo = c.pixeles.filter((p) => dist.get(p) > r);
    if (!nucleo.length) continue; // toda la mancha es fina: la fusionará fusionarPequenas
    const alcance = new Map(nucleo.map((p) => [p, 0]));
    const cola = [...nucleo];
    for (let i = 0; i < cola.length; i++) {
      const p = cola[i];
      if (alcance.get(p) >= r) continue;
      vecinos(p, (q) => { if (dentro(q) && !alcance.has(q)) { alcance.set(q, alcance.get(p) + 1); cola.push(q); } });
    }
    for (const p of c.pixeles) if (!alcance.has(p)) quitar.push(p);
  }
  if (!quitar.length) return;
  for (const p of quitar) etiqueta[p] = -1;
  // Los píxeles quitados toman la etiqueta de la mancha asignada más cercana.
  const vista = new Set();
  const cola = [];
  for (const p of quitar) vecinos(p, (q) => { if (etiqueta[q] !== -1 && !vista.has(q)) { vista.add(q); cola.push(q); } });
  for (let i = 0; i < cola.length; i++) {
    const p = cola[i];
    vecinos(p, (q) => { if (etiqueta[q] === -1 && !vista.has(q)) { etiqueta[q] = etiqueta[p]; vista.add(q); cola.push(q); } });
  }
}

// ---------- contorno vectorial ----------

/** Contornos (exterior y agujeros) de un conjunto de píxeles, como lista de polígonos. */
function contornos(pixeles, dentro) {
  const V = W + 1;
  const salida = new Map(); // vértice -> vértices destino
  const arista = (a, b) => { (salida.get(a) ?? salida.set(a, []).get(a)).push(b); };
  for (const p of pixeles) {
    const x = p % W, y = (p / W) | 0;
    const v = (xx, yy) => yy * V + xx;
    // Recorrido en el sentido de las agujas del reloj (en pantalla): el interior queda a la derecha.
    if (y === 0 || !dentro(p - W)) arista(v(x, y), v(x + 1, y));
    if (x === W - 1 || !dentro(p + 1)) arista(v(x + 1, y), v(x + 1, y + 1));
    if (y === H - 1 || !dentro(p + W)) arista(v(x + 1, y + 1), v(x, y + 1));
    if (x === 0 || !dentro(p - 1)) arista(v(x, y + 1), v(x, y));
  }
  const bucles = [];
  for (const inicio of [...salida.keys()]) {
    while (salida.get(inicio)?.length) {
      const bucle = [inicio];
      let actual = inicio, anterior = -1;
      for (;;) {
        const opciones = salida.get(actual);
        if (!opciones?.length) break;
        let elegido = 0;
        if (opciones.length > 1 && anterior >= 0) {
          // En un vértice donde dos píxeles se tocan en diagonal, giramos hacia el interior.
          const dx0 = (actual % V) - (anterior % V), dy0 = ((actual / V) | 0) - ((anterior / V) | 0);
          let mejor = -Infinity;
          opciones.forEach((o, i) => {
            const dx1 = (o % V) - (actual % V), dy1 = ((o / V) | 0) - ((actual / V) | 0);
            const giro = dx0 * dy1 - dy0 * dx1;
            if (giro > mejor) { mejor = giro; elegido = i; }
          });
        }
        const siguiente = opciones.splice(elegido, 1)[0];
        anterior = actual;
        actual = siguiente;
        if (actual === inicio) break;
        bucle.push(actual);
      }
      bucles.push(bucle.map((v) => [v % V, (v / V) | 0]));
    }
  }
  return bucles;
}

function simplificar(puntos, tol) {
  const cerrado = [...puntos, puntos[0]];
  const conservar = new Uint8Array(cerrado.length);
  conservar[0] = conservar[cerrado.length - 1] = 1;
  const pila = [[0, cerrado.length - 1]];
  while (pila.length) {
    const [a, b] = pila.pop();
    const [ax, ay] = cerrado[a], [bx, by] = cerrado[b];
    const L = Math.hypot(bx - ax, by - ay) || 1;
    let mejor = -1, dmax = 0;
    for (let i = a + 1; i < b; i++) {
      const [x, y] = cerrado[i];
      const d = L === 1 && ax === bx && ay === by ? Math.hypot(x - ax, y - ay) : Math.abs((bx - ax) * (ay - y) - (ax - x) * (by - ay)) / L;
      if (d > dmax) { dmax = d; mejor = i; }
    }
    if (dmax > tol) { conservar[mejor] = 1; pila.push([a, mejor], [mejor, b]); }
  }
  const res = cerrado.filter((_, i) => conservar[i]);
  res.pop();
  return res;
}

function trazado(pixeles, dentro) {
  return contornos(pixeles, dentro)
    .map((b) => simplificar(b, TOLERANCIA_SIMPLIFICAR))
    .filter((b) => b.length >= 3)
    .map((b) => 'M' + b.map(([x, y]) => `${(x / ESCALA).toFixed(1)} ${(y / ESCALA).toFixed(1)}`).join('L') + 'Z')
    .join('');
}

/** Punto para el número y tamaño de letra, según el hueco más ancho de la parte visible. */
function etiquetaDe(pixeles, dentro) {
  const { p, radio } = masInterior(pixeles, dentro);
  const r = radio / ESCALA;
  return { etiqueta: [+((p % W) / ESCALA).toFixed(1), +(((p / W) | 0) / ESCALA).toFixed(1)], tam: Math.max(5, Math.min(16, Math.round(r * 1.3))), radio: r };
}

// ---------- modo vidriera ----------

function generarVidriera(px, fills, fondo) {
  const colores = [fondo, ...fills].map(deHex);
  const etiqueta = new Int32Array(N);
  for (let p = 0; p < N; p++) {
    const a = px[p * 4 + 3];
    if (a < 128) { etiqueta[p] = 0; continue; }
    const c = [px[p * 4], px[p * 4 + 1], px[p * 4 + 2]];
    let mejor = 1, d = Infinity;
    for (let i = 1; i < colores.length; i++) { const dd = dist2(c, colores[i]); if (dd < d) { d = dd; mejor = i; } }
    etiqueta[p] = mejor;
  }
  fusionarPequenas(etiqueta, (c) => c.pixeles.length < AREA_MINIMA);
  // Quita cuellos e hilos de las manchas de color, que la línea negra partiría.
  abrir(etiqueta, RADIO_MINIMO);
  fusionarPequenas(etiqueta, (c) => c.pixeles.length < AREA_MINIMA);

  const { comp, lista } = componentes(etiqueta);
  const semillas = []; // { id, p, nivel, padre, color }
  let siguienteId = 0; // los ids no se reutilizan aunque se descarten semillas
  const porId = new Map();
  const registrar = (lista) => { for (const s of lista) { semillas.push(s); porId.set(s.id, s); } };
  const niveles = [null, new Int32Array(N), new Int32Array(N), new Int32Array(N), new Int32Array(N)];
  const pertenece = new Int32Array(N); // conjunto en el que se reparte ahora
  let marca = 0;

  // Nivel 1: celdas grandes dentro de cada mancha de color.
  for (const c of lista) {
    marca++;
    for (const p of c.pixeles) pertenece[p] = marca;
    const dentro = (q) => pertenece[q] === marca;
    const k = Math.max(1, Math.min(8, Math.round((c.pixeles.length * DENSIDAD) / AREA_CELDA[1])));
    const puntos = elegirSemillas(c.pixeles, dentro, k);
    const primera = { id: siguienteId++, p: puntos[0], nivel: 1, padre: -1, color: c.etiqueta };
    const otras = puntos.slice(1).map((p) => ({ id: siguienteId++, p, nivel: 1, padre: -1, color: c.etiqueta }));
    registrar(repartirSinFinos(c.pixeles, dentro, [primera], otras, niveles[1]));
  }
  // Niveles 2–4: cada celda se trocea en hijas; la semilla madre conserva un trozo.
  for (let nivel = 2; nivel <= 4; nivel++) {
    const celdas = componentes(niveles[nivel - 1]).lista;
    for (const c of celdas) {
      const madre = porId.get(c.etiqueta);
      marca++;
      for (const p of c.pixeles) pertenece[p] = marca;
      const dentro = (q) => pertenece[q] === marca;
      const k = Math.max(1, Math.min(MAX_HIJOS, Math.round((c.pixeles.length * DENSIDAD) / AREA_CELDA[nivel])));
      const puntos = elegirSemillas(c.pixeles, dentro, k, [madre.p]);
      const hijas = puntos.slice(1).map((p) => ({ id: siguienteId++, p, nivel, padre: madre.id, color: madre.color }));
      registrar(repartirSinFinos(c.pixeles, dentro, [madre], hijas, niveles[nivel]).slice(1));
    }
  }

  // Tras quitar semillas, los ids dejan de ser consecutivos: se renumeran en todas las capas.
  const nuevoId = new Map(semillas.map((s, i) => [s.id, i]));
  for (const capa of niveles.slice(1)) for (let p = 0; p < N; p++) capa[p] = nuevoId.get(capa[p]);
  semillas.forEach((s, i) => { s.id = i; s.padre = s.padre < 0 ? -1 : nuevoId.get(s.padre); });

  // Paleta: cada color base en hasta 3 tonos.
  const bases = [...new Set(semillas.map((s) => s.color))];
  const tonos = bases.length * 3 <= 12 ? 3 : bases.length * 2 <= 12 ? 2 : 1;
  const paleta = [];
  const indice = new Map();
  for (const b of bases) {
    const base = b === 0 ? fondo : fills[b - 1];
    const variantes = [base, matiz(base, 0.28), matiz(base, -0.22)].slice(0, tonos);
    variantes.forEach((v, i) => { indice.set(`${b}:${i}`, paleta.length); paleta.push(v); });
  }

  const porNivel = [null, componentes(niveles[1]).lista, componentes(niveles[2]).lista, componentes(niveles[3]).lista, componentes(niveles[4]).lista];
  const zonas = [];
  for (const s of semillas) {
    const union = porNivel[s.nivel].find((c) => c.etiqueta === s.id);
    const propia = porNivel[4].find((c) => c.etiqueta === s.id);
    const d = trazado(union.pixeles, (q) => niveles[s.nivel][q] === s.id);
    const { etiqueta: et, tam, radio } = etiquetaDe(propia.pixeles, (q) => niveles[4][q] === s.id);
    if (radio < 2.5) console.warn(`  aviso: la zona ${s.id} es muy estrecha (radio ${radio.toFixed(1)})`);
    const zona = { id: `z${s.id}`, d, color: indice.get(`${s.color}:${(s.id * 7) % tonos}`), nivel: s.nivel, etiqueta: et, tam, area: union.pixeles.length };
    if (s.nivel > 1) zona.oculta = true;
    zonas.push(zona);
  }
  zonas.sort((a, b) => a.nivel - b.nivel || b.area - a.area);
  return { paleta, zonas };
}

// ---------- modo foto ----------

function generarFoto(px, K, fondo) {
  // Si la imagen tiene transparencia (un PNG recortado), el fondo es un color aparte
  // y los K colores se reparten solo entre el sujeto.
  let transparentes = 0;
  for (let p = 0; p < N; p++) if (px[p * 4 + 3] < 128) transparentes++;
  const conFondo = transparentes > N * 0.05;
  const esFondo = (p) => conFondo && px[p * 4 + 3] < 128;
  // Suavizado 3×3 para quitar ruido.
  const rgb = new Float32Array(N * 3);
  for (let p = 0; p < N; p++) {
    const x = p % W, y = (p / W) | 0;
    let r = 0, g = 0, b = 0, n = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
      const q = (yy * W + xx) * 4;
      if (px[q + 3] < 128) continue;
      r += px[q]; g += px[q + 1]; b += px[q + 2]; n++;
    }
    if (n) { rgb[p * 3] = r / n; rgb[p * 3 + 1] = g / n; rgb[p * 3 + 2] = b / n; }
  }
  // K medias sobre una muestra.
  const muestra = [];
  for (let p = 0; p < N; p += 7) if (!esFondo(p)) muestra.push([rgb[p * 3], rgb[p * 3 + 1], rgb[p * 3 + 2]]);
  const centros = [muestra[0]];
  while (centros.length < K) {
    let mejor = null, dmax = -1;
    for (const m of muestra) { const d = Math.min(...centros.map((c) => dist2(m, c))); if (d > dmax) { dmax = d; mejor = m; } }
    centros.push(mejor);
  }
  for (let it = 0; it < 12; it++) {
    const suma = centros.map(() => [0, 0, 0, 0]);
    for (const m of muestra) {
      let k = 0, d = Infinity;
      centros.forEach((c, i) => { const dd = dist2(m, c); if (dd < d) { d = dd; k = i; } });
      suma[k][0] += m[0]; suma[k][1] += m[1]; suma[k][2] += m[2]; suma[k][3]++;
    }
    suma.forEach((s, i) => { if (s[3]) centros[i] = [s[0] / s[3], s[1] / s[3], s[2] / s[3]]; });
  }
  const etiqueta = new Int32Array(N);
  for (let p = 0; p < N; p++) {
    if (esFondo(p)) { etiqueta[p] = K; continue; }
    const c = [rgb[p * 3], rgb[p * 3 + 1], rgb[p * 3 + 2]];
    let k = 0, d = Infinity;
    centros.forEach((cc, i) => { const dd = dist2(c, cc); if (dd < d) { d = dd; k = i; } });
    etiqueta[p] = k;
  }
  const esPequena = (c, comp) => c.pixeles.length < AREA_MINIMA || masInterior(c.pixeles, (q) => comp[q] === c.id).radio < RADIO_MINIMO;
  fusionarPequenas(etiqueta, esPequena);
  abrir(etiqueta, RADIO_MINIMO);
  fusionarPequenas(etiqueta, esPequena);

  const { comp, lista } = componentes(etiqueta);
  const ordenadas = [...lista].sort((a, b) => b.pixeles.length - a.pixeles.length);
  const zonas = ordenadas.map((c, i) => {
    const frac = c.pixeles.length / N;
    const nivel = frac >= 0.05 || i < 6 ? 1 : frac >= 0.012 ? 2 : frac >= 0.003 ? 3 : 4;
    const dentro = (q) => comp[q] === c.id;
    const { etiqueta: et, tam } = etiquetaDe(c.pixeles, dentro);
    return { id: `z${i}`, d: trazado(c.pixeles, dentro), color: c.etiqueta, nivel, etiqueta: et, tam };
  });
  const usados = [...new Set(zonas.map((z) => z.color))];
  for (const z of zonas) z.color = usados.indexOf(z.color);
  return { paleta: usados.map((k) => (k === K ? fondo : hex(...centros[k]))), zonas };
}

// ---------- principal ----------

async function principal() {
  const [modo, entrada, id, nombreEs, nombreEn, categoria, edad, ...resto] = process.argv.slice(2);
  if (!['vidriera', 'foto'].includes(modo) || !edad) {
    console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(0, 14).join('\n'));
    process.exit(1);
  }
  const op = Object.fromEntries(resto.map((a) => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.join('=')]; }));
  const fondo = op.fondo ?? (modo === 'vidriera' ? '#dbeeff' : '#ffffff');
  if (op.densidad) DENSIDAD = +op.densidad;

  const r = await rasterizar(entrada, modo, fondo);
  W = r.W; H = r.H; N = W * H;
  let resultado;
  if (modo === 'vidriera') {
    const fills = [...new Set((fs.readFileSync(entrada, 'utf8').match(/fill="(#[0-9a-fA-F]{3,6})"/g) ?? []).map((m) => m.slice(6, -1)))].map((h) => (h.length === 4 ? '#' + [...h.slice(1)].map((c) => c + c).join('') : h.toLowerCase()));
    if (!fills.length) throw new Error('El modo vidriera necesita un SVG con atributos fill="#rrggbb".');
    resultado = generarVidriera(r.px, fills, fondo);
  } else {
    resultado = generarFoto(r.px, +(op.colores ?? 12), fondo);
  }

  const nombreExport = id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  const lineas = resultado.zonas.map(({ area, ...z }) => '    ' + JSON.stringify(z).replace(/"([a-z]+)":/g, '$1: ').replace(/,/g, ', ').replace(/"/g, "'"));
  const ts = `import type { Dibujo } from '../../tipos';

// Generado por scripts/generar.cjs (modo ${modo}) a partir de ${path.basename(entrada)}. No editar a mano.
export const ${nombreExport}: Dibujo = {
  id: '${id}',
  nombre: { es: '${nombreEs}', en: '${nombreEn}' },
  categoria: '${categoria}',
  edad: ${edad},${op.credito ? `\n  credito: '${op.credito}',` : ''}
  ancho: ${W / ESCALA},
  alto: ${H / ESCALA},
  paleta: [${resultado.paleta.map((c) => `'${c}'`).join(', ')}],
  zonas: [
${lineas.join(',\n')},
  ],
};
`;
  const salida = op.salida ?? path.join(__dirname, '..', 'src', 'dibujos', 'generados', `${id}.ts`);
  fs.mkdirSync(path.dirname(salida), { recursive: true });
  fs.writeFileSync(salida, ts);
  const porNivel = [1, 2, 3, 4].map((n) => resultado.zonas.filter((z) => z.nivel <= n).length);
  console.log(`${salida}: ${resultado.zonas.length} zonas, ${resultado.paleta.length} colores. Zonas jugables por nivel: ${porNivel.join(' / ')}`);
}

principal().catch((e) => { console.error(e); process.exit(1); });
