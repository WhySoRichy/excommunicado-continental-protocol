import { defineConfig, devices } from '@playwright/test';

/**
 * Imágenes del README (`npm run media`). No forma parte de la suite: genera `docs/media/*.jpg` y los fotogramas de la
 * animación de juego con el build de pruebas.
 */
export default defineConfig({
  testDir: 'tests/media',
  timeout: 300_000,
  expect: { timeout: 30_000 },
  workers: 1,
  reporter: [['list']],
  outputDir: 'test-results/media',
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 1280, height: 720 },
    launchOptions: { args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11', '--autoplay-policy=no-user-gesture-required'] },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 }, channel: 'chromium' } }],
  webServer: { command: 'npm run preview:qa', url: 'http://localhost:4173', reuseExistingServer: true, timeout: 120_000 },
});
