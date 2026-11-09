import fs from 'node:fs';
import path from 'node:path';
import type { Page } from '@playwright/test';
// Tipos de la API de QA (import solo de tipos: se borra al transpilar).
import type {} from '../../src/debug/qa';

export const isCI = !!process.env.CI;

/** Umbral de luminancia media percibida (0..1) para considerar un frame "visible". */
export const LUMINANCE_MIN = 0.16;

export const SHOTS_DIR = path.resolve('qa-screenshots');

export function shotPath(name: string): string {
  fs.mkdirSync(SHOTS_DIR, { recursive: true });
  return path.join(SHOTS_DIR, `${name}.png`);
}

/** Recolecta errores de consola y excepciones de página. */
export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  return errors;
}

/** Abre el juego en modo QA y espera a que esté listo. */
export async function openGame(page: Page, query = ''): Promise<void> {
  await page.goto(`/?qa=1${query ? `&${query}` : ''}`);
  await page.waitForFunction(() => window.__EXCOM__?.ready === true, null, { timeout: 90_000 });
}
