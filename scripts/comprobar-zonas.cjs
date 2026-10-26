// Comprueba que cada zona de cada dibujo se ve como UN solo trozo y que ninguna queda tapada.
// Uso: npm run build && node scripts/comprobar-zonas.cjs   (necesita Playwright)
const { chromium } = require('playwright');
const path = require('path');

const LADO = 800;
const GROSOR = 2.6; // igual que GROSOR_LINEA en src/miniatura.ts
const MINIMO = 40; // píxeles: trozos menores son restos del suavizado de bordes

(async () => {
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage();
  await pagina.goto('file://' + path.resolve('dist/index.html'));
  const problemas = await pagina.evaluate(async ({ LADO, MINIMO, GROSOR }) => {
    const { dibujos } = window.__colorines;
    const salida = [];
    for (const d of dibujos) {
      const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="${LADO}" height="${LADO}" viewBox="0 0 ${d.ancho} ${d.alto}" shape-rendering="crispEdges">` +
        // Las líneas negras (r = 0) separan zonas igual que en el juego.
        d.zonas.map((z, i) => `<path d="${z.d}" fill="rgb(${(i + 1) * 9},0,0)" stroke="#000" stroke-width="${GROSOR}" stroke-linejoin="round"/>`).join('') +
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
        const r = px[p * 4];
        if (r % 9 === 0 && r > 0) zona[p] = r / 9 - 1;
      }
      const visto = new Uint8Array(LADO * LADO);
      const trozos = d.zonas.map(() => 0);
      for (let p = 0; p < LADO * LADO; p++) {
        if (visto[p] || zona[p] < 0) continue;
        const z = zona[p];
        let tam = 0;
        const pila = [p];
        visto[p] = 1;
        while (pila.length) {
          const q = pila.pop();
          tam++;
          const x = q % LADO, y = (q / LADO) | 0;
          for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
            if (nx < 0 || ny < 0 || nx >= LADO || ny >= LADO) continue;
            const n = ny * LADO + nx;
            if (!visto[n] && zona[n] === z) {
              visto[n] = 1;
              pila.push(n);
            }
          }
        }
        if (tam >= MINIMO) trozos[z]++;
      }
      d.zonas.forEach((z, i) => {
        if (trozos[i] !== 1) salida.push(`${d.id}/${z.id}: ${trozos[i] === 0 ? 'no se ve' : trozos[i] + ' trozos'}`);
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
