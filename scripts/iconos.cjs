// Genera los iconos de la app a partir de recursos/logo.svg.
// Uso: node scripts/iconos.cjs   (necesita Playwright)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const logo = fs.readFileSync(path.join(raiz, 'recursos', 'logo.svg'), 'utf8');
const FONDO = '#fff6ee';

// [archivo, lado en px, fracción del lado que ocupa el logo]
const ICONOS = [
  ['public/icono-192.png', 192, 0.84],
  ['public/icono-512.png', 512, 0.84],
  // Android recorta el icono "maskable" en círculo o gota: el logo debe caber en el 80 % central.
  ['public/icono-maskable-512.png', 512, 0.64],
  ['public/apple-touch-icon.png', 180, 0.84],
  ['public/favicon-32.png', 32, 0.96],
  // Para las tiendas (fase 4): Capacitor y las fichas parten de un PNG de 1024 px.
  ['recursos/icono-1024.png', 1024, 0.84],
];

(async () => {
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage();
  for (const [archivo, lado, k] of ICONOS) {
    await pagina.setViewportSize({ width: lado, height: lado });
    const t = Math.round(lado * k);
    await pagina.setContent(
      `<body style="margin:0;width:${lado}px;height:${lado}px;display:grid;place-items:center;background:${FONDO}">` +
        logo.replace('<svg ', `<svg width="${t}" height="${t}" `) +
        '</body>',
    );
    await pagina.screenshot({ path: path.join(raiz, archivo) });
    console.log(`${archivo} (${lado} px)`);
  }
  await navegador.close();
  fs.copyFileSync(path.join(raiz, 'recursos', 'logo.svg'), path.join(raiz, 'public', 'favicon.svg'));
  console.log('public/favicon.svg');
})();
