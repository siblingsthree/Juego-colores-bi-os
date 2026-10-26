import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Versión visible al pie de la portada, para saber qué versión tiene cada dispositivo.
function version() {
  const commit = (process.env.GITHUB_SHA ?? (() => {
    try {
      return execSync('git rev-parse HEAD').toString();
    } catch {
      return 'local';
    }
  })()).trim().slice(0, 7);
  const fecha = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  return `${commit} · ${fecha}`;
}

// Un único index.html autocontenido: funciona sin conexión, dentro de Capacitor
// y se puede publicar tal cual para probar en una tablet.
export default defineConfig({
  base: './',
  define: { __VERSION__: JSON.stringify(version()) },
  plugins: [viteSingleFile()],
});
