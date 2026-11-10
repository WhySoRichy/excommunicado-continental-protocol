import { expect, type Page, test } from '@playwright/test';
import { collectErrors, LUMINANCE_MIN, openGame, shotPath } from './helpers';

/**
 * GATE de claridad (Fase 5). En todos los contratos y en el hub:
 * - la luminancia en cada checkpoint supera el umbral (nada "casi negro");
 * - el objetivo actual está en el HUD con baliza en pantalla o flecha de borde;
 * - la consola no tiene errores.
 */
type MissionId = 'practice' | 'nightclub' | 'docks' | 'rooftop' | 'gauntlet';
const CONTRACTS: MissionId[] = ['practice', 'nightclub', 'docks', 'rooftop'];

async function lumAtCheckpoints(page: Page, label: string): Promise<Array<{ id: string; lum: number }>> {
  const ids = await page.evaluate(() => window.__EXCOM__!.checkpointIds());
  const out: Array<{ id: string; lum: number }> = [];
  for (const id of ids) {
    await page.evaluate((cp) => {
      const q = window.__EXCOM__!;
      q.checkpoint(cp);
      q.step(6, {});
    }, id);
    await page.evaluate(() => window.__EXCOM__!.measureFps(0.25));
    out.push({ id, lum: await page.evaluate(() => window.__EXCOM__!.luminance()) });
  }
  console.log(`[claridad] ${label}: ${out.map((o) => `${o.id} ${o.lum.toFixed(2)}`).join(' · ')}`);
  return out;
}

test.describe('GATE · claridad y visibilidad', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?qa=1');
    await page.evaluate(() => window.localStorage.clear());
  });

  test('todos los contratos: luminancia en cada checkpoint, objetivo y baliza siempre visibles', async ({ page }) => {
    const errors = collectErrors(page);
    await openGame(page);
    await page.getByRole('button', { name: /Nueva partida|Continuar/ }).first().click();
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hub');
    const hub = await lumAtCheckpoints(page, 'hub');
    for (const c of hub) expect(c.lum, `hub/${c.id}`).toBeGreaterThan(LUMINANCE_MIN);
    // En el hub el objetivo (hablar con Charon) también está en el HUD.
    await expect(page.locator('#hud .objective')).toBeVisible();

    for (const id of CONTRACTS) {
      await page.evaluate((m) => window.__EXCOM__!.startContract(m), id);
      await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('briefing');
      await page.evaluate(() => {
        const q = window.__EXCOM__!;
        q.beginContract();
        q.setManual(true);
        q.setGod(true);
        q.skipTutorial();
        q.step(4, {});
      });
      await page.evaluate(() => window.__EXCOM__!.measureFps(0.25));
      // Objetivo en el HUD con su texto, y la baliza (o su flecha) a la vista.
      await expect(page.locator('#hud .objective')).toBeVisible();
      await expect(page.locator('#hud .objective')).not.toHaveText('');
      // Nada del contrato anterior (toasts) se arrastra al nuevo nivel.
      const toast = await page.evaluate(() => window.__EXCOM__!.hud().toast);
      expect(toast, `toast heredado en ${id}`).not.toContain('maniquíes');
      await expect(page.locator('#hud .beacon, #hud .beacon-arrow').locator('visible=true')).toHaveCount(1);
      // Girando la cámara 180° la baliza sigue visible (pasa a flecha de borde o sigue en pantalla).
      await page.evaluate(() => {
        const q = window.__EXCOM__!;
        const c = q.camera();
        q.setLook(c.yaw + Math.PI, c.pitch);
        q.step(2, {});
      });
      await page.evaluate(() => window.__EXCOM__!.measureFps(0.2));
      await expect(page.locator('#hud .beacon, #hud .beacon-arrow').locator('visible=true')).toHaveCount(1);
      await page.screenshot({ path: shotPath(`fase5-claridad-${id}`) });
      const lums = await lumAtCheckpoints(page, id);
      for (const c of lums) expect(c.lum, `${id}/${c.id}`).toBeGreaterThan(LUMINANCE_MIN);
      await page.evaluate(() => window.__EXCOM__!.setManual(false));
    }
    expect(errors).toEqual([]);
  });
});
