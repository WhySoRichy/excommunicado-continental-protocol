import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

// En local se pide la GPU real (ANGLE/D3D11 en Windows) para que las medidas de FPS
// sean representativas. En CI (sin GPU) Chromium cae a SwiftShader y el FPS solo se registra.
// El audio se mide en los tests (gate de mezcla): sin esperar gesto para el AudioContext.
const audioArgs = ['--autoplay-policy=no-user-gesture-required'];
const gpuArgs = (isCI ? ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] : ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11']).concat(audioArgs);

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
    launchOptions: { args: gpuArgs },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 }, channel: 'chromium' },
    },
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
