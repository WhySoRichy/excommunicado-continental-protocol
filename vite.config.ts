import { defineConfig } from 'vite';

// `base: './'` produce rutas relativas: el build funciona en GitHub Pages
// sin importar el nombre del repo (https://<usuario>.github.io/<repo>/).
export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    sourcemap: false,
    // Rapier compat incluye su wasm en base64 (~4 MB sin comprimir); se carga
    // en un chunk propio vía import() dinámico detrás de la pantalla de título.
    chunkSizeWarningLimit: 4600,
  },
  server: { port: 5173 },
  preview: { port: 4173, strictPort: true },
});
