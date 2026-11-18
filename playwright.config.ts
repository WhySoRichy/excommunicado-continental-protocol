import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

// En local se pide la GPU real (ANGLE/D3D11 en Windows) para que las medidas de FPS
// sean representativas. En CI (sin GPU) Chromium cae a SwiftShader y el FPS solo se registra.
// El audio se mide en los tests (gate de mezcla): sin esperar gesto para el AudioContext.
const audioArgs = ['--autoplay-policy=no-user-gesture-required'];
const gpuArgs = (isCI ? ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] : ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11']).concat(
  audioArgs,
);

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 180_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  outputDir: 'test-results',
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 1280, height: 720 },
    trace: 'off',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: /firefox.spec.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 }, channel: 'chromium', launchOptions: { args: gpuArgs } },
    },
    // Prueba de humo en Firefox: ya hubo un fallo exclusivo de este navegador (el audio posicional).
    {
      name: 'firefox',
      testMatch: /firefox.spec.ts/,
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
        launchOptions: { firefoxUserPrefs: { 'media.autoplay.default': 0, 'webgl.force-enabled': true } },
      },
    },
  ],
  webServer: {
    command: 'npm run preview:qa',
    url: 'http://localhost:4173',
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
