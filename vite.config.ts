import { defineConfig, type Plugin } from 'vite';

/**
 * Política de seguridad de contenido. GitHub Pages no permite cabeceras, así que va en un <meta> al principio
 * del <head>. Todo sale del propio origen; el wasm de Rapier viaja embebido y se instancia desde bytes
 * ('wasm-unsafe-eval'), y el CSS crítico de la pantalla de carga va en línea. Solo se aplica a los builds
 * (público y de pruebas): `npm run dev` necesita el cliente de recarga en caliente de Vite.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

function contentSecurityPolicy(): Plugin {
  return {
    name: 'content-security-policy',
    apply: 'build',
    transformIndexHtml: () => [{ tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP }, injectTo: 'head-prepend' }],
  };
}

// `base: './'` produce rutas relativas: el build funciona en GitHub Pages
// sin importar el nombre del repo (https://<usuario>.github.io/<repo>/).
export default defineConfig({
  base: './',
  plugins: [contentSecurityPolicy()],
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
