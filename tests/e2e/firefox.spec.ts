import { expect, test } from '@playwright/test';
import { collectErrors, LUMINANCE_MIN, openGame } from './helpers';

/**
 * Prueba de humo en Firefox (el resto de la suite corre en Chromium): ya hubo un fallo solo de Firefox,
 * el oyente del audio posicional, que este navegador implementa con la API antigua.
 */
test.describe('Firefox · humo', () => {
  test('arranca, se ve, se mueve y dispara sin errores ni bloqueos de la CSP', async ({ page }) => {
    const errors = collectErrors(page);
    await page.addInitScript(() => {
      const w = window as Window & { cspViolations?: string[] };
      w.cspViolations = [];
      document.addEventListener('securitypolicyviolation', (e) => w.cspViolations?.push(`${e.effectiveDirective} ${e.blockedURI}`));
    });
    await openGame(page, 'level=arena');
    expect(await page.evaluate(() => window.__EXCOM__!.luminance()), 'el título no debe verse negro').toBeGreaterThan(LUMINANCE_MIN);

    await page.evaluate(() => window.__EXCOM__!.playArena());
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('playing');
    const r = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setManual(true);
      q.teleport(0, 0, 8, 0);
      const before = q.player()!.z;
      q.step(60, { moveY: 1 });
      const moved = before - q.player()!.z;
      q.step(10, { aim: true });
      q.press('fire');
      q.step(20, { aim: true });
      return { moved, shots: q.combat()!.stats.shotsFired ?? 0 };
    });
    expect(r.moved, 'avanza al pulsar adelante').toBeGreaterThan(1.5);
    expect(r.shots, 'el disparo sale').toBeGreaterThan(0);
    await page.evaluate(() => window.__EXCOM__!.measureFps(0.5));
    expect(await page.evaluate(() => window.__EXCOM__!.luminance()), 'la arena se ve').toBeGreaterThan(LUMINANCE_MIN);

    expect(errors).toEqual([]);
    expect(await page.evaluate(() => (window as Window & { cspViolations?: string[] }).cspViolations)).toEqual([]);
  });
});
