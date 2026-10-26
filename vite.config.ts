import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Un único index.html autocontenido: funciona sin conexión, dentro de Capacitor
// y se puede publicar tal cual para probar en una tablet.
export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
});
