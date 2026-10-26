const COLORES = ['#ff6b6b', '#ffd84d', '#4fd1a5', '#4fa9e6', '#b388ff', '#ff8fc7'];

export function lanzarConfeti(contenedor: HTMLElement, duracion = 2800) {
  const lienzo = document.createElement('canvas');
  lienzo.className = 'confeti';
  contenedor.appendChild(lienzo);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const ancho = contenedor.clientWidth;
  const alto = contenedor.clientHeight;
  lienzo.width = ancho * dpr;
  lienzo.height = alto * dpr;
  const c = lienzo.getContext('2d');
  if (!c) return;
  c.scale(dpr, dpr);

  const piezas = Array.from({ length: 140 }, () => ({
    x: ancho / 2 + (Math.random() - 0.5) * ancho * 0.3,
    y: alto * 0.45,
    vx: (Math.random() - 0.5) * 14,
    vy: -Math.random() * 16 - 6,
    giro: Math.random() * Math.PI,
    vg: (Math.random() - 0.5) * 0.4,
    tam: 6 + Math.random() * 8,
    color: COLORES[Math.floor(Math.random() * COLORES.length)],
  }));

  const inicio = performance.now();
  const paso = (ahora: number) => {
    const t = ahora - inicio;
    c.clearRect(0, 0, ancho, alto);
    c.globalAlpha = Math.max(0, 1 - Math.max(0, t - duracion * 0.7) / (duracion * 0.3));
    for (const p of piezas) {
      p.vy += 0.45;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.giro += p.vg;
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.giro);
      c.fillStyle = p.color;
      c.fillRect(-p.tam / 2, -p.tam / 4, p.tam, p.tam / 2);
      c.restore();
    }
    if (t < duracion) requestAnimationFrame(paso);
    else lienzo.remove();
  };
  requestAnimationFrame(paso);
}
