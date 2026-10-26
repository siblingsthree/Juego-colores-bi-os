// Comprueba que cada zona de cada dibujo se ve como UN solo trozo y que ninguna queda tapada.
// Uso: npm run build && node scripts/comprobar-zonas.cjs   (necesita Playwright)
const { chromium } = require('playwright');
const path = require('path');

const LADO = 800;
const GROSOR = 2.6; // igual que GROSOR_LINEA en src/miniatura.ts
const MINIMO = 150; // píxeles (a 800 px de lado): trozos menores quedan bajo la línea negra

(async () => {
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage();
  await pagina.goto('file://' + path.resolve('dist/index.html'));
  const problemas = await pagina.evaluate(async ({ LADO, MINIMO, GROSOR }) => {
    const { dibujos } = window.__colorines;
    const salida = [];
    // Un dibujo con zonas ocultas se ve distinto en cada nivel: se comprueban los cuatro.
    const casos = dibujos.flatMap((d) =>
      d.zonas.some((z) => z.oculta) ? [1, 2, 3, 4].map((nivel) => ({ d, nivel })) : [{ d, nivel: 4 }],
    );
    for (const { d: dibujo, nivel } of casos) {
      const visibles = dibujo.zonas.filter((z) => !(z.oculta && z.nivel > nivel));
      const d = { ...dibujo, zonas: visibles, id: nivel === 4 && visibles.length === dibujo.zonas.length ? dibujo.id : `${dibujo.id}@nivel${nivel}` };
      const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="${LADO}" height="${LADO}" viewBox="0 0 ${d.ancho} ${d.alto}" shape-rendering="crispEdges">` +
        // Las líneas negras (r = g = 0) separan zonas igual que en el juego.
        d.zonas.map((z, i) => `<path d="${z.d}" fill="rgb(${((i + 1) % 28) * 9},${Math.floor((i + 1) / 28) * 9},0)" stroke="#000" stroke-width="${GROSOR}" stroke-linejoin="round"/>`).join('') +
        '</svg>';
      const img = new Image();
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      await img.decode();
      const lienzo = document.createElement('canvas');
      lienzo.width = lienzo.height = LADO;
      const c = lienzo.getContext('2d');
      c.drawImage(img, 0, 0);
      const px = c.getImageData(0, 0, LADO, LADO).data;
      const zona = new Int16Array(LADO * LADO).fill(-1);
      for (let p = 0; p < LADO * LADO; p++) {
        // Cada zona lleva su número en los canales rojo y verde (hasta 28 × 28 zonas).
        const r = px[p * 4], g = px[p * 4 + 1], b = px[p * 4 + 2];
        if (b === 0 && r % 9 === 0 && g % 9 === 0 && r + g > 0) zona[p] = r / 9 + (g / 9) * 28 - 1;
      }
      const visto = new Uint8Array(LADO * LADO);
      const trozos = d.zonas.map(() => []);
      for (let p = 0; p < LADO * LADO; p++) {
        if (visto[p] || zona[p] < 0) continue;
        const z = zona[p];
        let tam = 0;
        let [x0, y0, x1, y1] = [LADO, LADO, 0, 0];
        const pila = [p];
        visto[p] = 1;
        while (pila.length) {
          const q = pila.pop();
          tam++;
          const x = q % LADO, y = (q / LADO) | 0;
          [x0, y0, x1, y1] = [Math.min(x0, x), Math.min(y0, y), Math.max(x1, x), Math.max(y1, y)];
          for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
            if (nx < 0 || ny < 0 || nx >= LADO || ny >= LADO) continue;
            const n = ny * LADO + nx;
            if (!visto[n] && zona[n] === z) {
              visto[n] = 1;
              pila.push(n);
            }
          }
        }
        // Caja del trozo en coordenadas del dibujo, para poder localizarlo.
        const k = d.ancho / LADO;
        if (tam >= MINIMO) trozos[z].push(`(${Math.round(x0 * k)},${Math.round(y0 * k)})-(${Math.round(x1 * k)},${Math.round(y1 * k)})`);
      }
      d.zonas.forEach((z, i) => {
        const t = trozos[i];
        if (t.length !== 1) salida.push(`${d.id}/${z.id}: ${t.length === 0 ? 'no se ve' : `${t.length} trozos en ${t.join(' ')}`}`);
      });
    }
    return salida;
  }, { LADO, MINIMO, GROSOR });
  await navegador.close();
  if (problemas.length) {
    console.log('Zonas con problemas:\n  ' + problemas.join('\n  '));
    process.exit(1);
  }
  console.log('Todas las zonas se ven como un solo trozo.');
})();
