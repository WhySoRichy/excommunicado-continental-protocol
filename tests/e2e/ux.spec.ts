import { expect, test } from '@playwright/test';
import { collectErrors, openGame, shotPath } from './helpers';

/** Fase 5 · Intel (mantener Tab) y gate de mezcla de audio con la salida real. */
test.describe('Fase 5 · UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?qa=1');
    await page.evaluate(() => window.localStorage.clear());
  });

  test('Intel: contrato, objetivo, marcadores y leyenda de enemigos con glifo; en el hub, las reglas', async ({ page }) => {
    const errors = collectErrors(page);
    await openGame(page);
    await page.getByRole('button', { name: /Nueva partida|Continuar/ }).first().click();
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hub');
    // Hub neutral.
    await page.evaluate(() => window.__EXCOM__!.hold('intel', true));
    await expect(page.locator('#hud .intel')).toBeVisible();
    await expect(page.locator('#hud .intel')).toContainText('Zona neutral');
    await page.evaluate(() => window.__EXCOM__!.hold('intel', false));
    await expect(page.locator('#hud .intel')).toHaveCount(0);
    // Club Kairos.
    await page.evaluate(() => window.__EXCOM__!.startContract('nightclub'));
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('briefing');
    await page.evaluate(() => window.__EXCOM__!.beginContract());
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('playing');
    await page.evaluate(() => window.__EXCOM__!.hold('intel', true));
    const intel = page.locator('#hud .intel');
    await expect(intel).toBeVisible();
    await expect(intel.locator('.intel-title')).toHaveText('CLUB KAIROS');
    await expect(intel).toContainText('Objetivo: Entra en el club');
    await expect(intel).toContainText('Marcadores 3/3');
    for (const name of ['Matón', 'Escolta', 'Blindado', 'Civil']) await expect(intel.locator('.intel-name', { hasText: name })).toHaveCount(1);
    // Cada enemigo lleva glifo (no solo color): accesible para daltonismo.
    const glyphs = await intel.locator('.intel-glyph').allTextContents();
    expect(glyphs.every((g) => g.trim().length > 0)).toBe(true);
    await expect(intel).toContainText('alarma');
    await page.screenshot({ path: shotPath('fase5-intel') });
    await page.evaluate(() => window.__EXCOM__!.hold('intel', false));
    await expect(page.locator('#hud .intel')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('GATE · mezcla de audio: música presente sin saturar, sube con el combate y los disparos destacan', async ({ page }) => {
    await openGame(page);
    await page.getByRole('button', { name: /Nueva partida|Continuar/ }).first().click();
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hub');
    // Se deja que terminen los fundidos de entrada (música 1,2 s y ambiente 1,5 s) antes de medir.
    await page.evaluate(() => window.__EXCOM__!.audioMeter(2.5));
    const hub = await page.evaluate(() => window.__EXCOM__!.audioMeter(2));
    expect(hub.running).toBe(true);
    expect(hub.mood).toBe('hub');
    // Sin música (pero con ambiente) se oye menos: el volumen de música funciona.
    await page.evaluate(() => window.__EXCOM__!.setSettings({ music: 0 }));
    await page.evaluate(() => window.__EXCOM__!.audioMeter(1));
    const noMusic = await page.evaluate(() => window.__EXCOM__!.audioMeter(2));
    await page.evaluate(() => window.__EXCOM__!.setSettings({ music: 0.55 }));

    // Arena con enemigos alerta (god mode): la intensidad sube y cambian las capas.
    await page.keyboard.press('Escape');
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('paused');
    await page.getByRole('button', { name: 'Salir al título' }).click();
    await page.getByRole('button', { name: 'Arena de pruebas (QA)' }).click();
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('playing');
    const calm = await page.evaluate(() => window.__EXCOM__!.audioMeter(1.5));
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setGod(true);
      for (let i = 0; i < 3; i++) q.spawnEnemy('thug', -3 + i * 3, 0, -8, true);
    });
    const fight = await page.evaluate(() => window.__EXCOM__!.audioMeter(3));
    // Disparos: pico claramente por encima de la música, sin pasar de 1,0 (sin clipping).
    const shots = await page.evaluate(async () => {
      const q = window.__EXCOM__!;
      const meter = q.audioMeter(1.6);
      for (let i = 0; i < 6; i++) {
        q.press('fire');
        await new Promise((r) => setTimeout(r, 220));
      }
      return meter;
    });
    console.log(
      `[mezcla] hub rms=${hub.rmsMean.toFixed(4)} pico=${hub.peakMax.toFixed(3)} · sin música rms=${noMusic.rmsMean.toFixed(4)} · arena calma k=${calm.intensity.toFixed(2)} rms=${calm.rmsMean.toFixed(4)} · combate k=${fight.intensity.toFixed(2)} rms=${fight.rmsMean.toFixed(4)} · disparos pico=${shots.peakMax.toFixed(3)}`,
    );
    expect(hub.rmsMean).toBeGreaterThan(0.004);
    expect(hub.rmsMean).toBeLessThan(0.2);
    expect(hub.peakMax).toBeLessThan(1);
    // Energía de la música sola (la salida es música + ambiente): audible pero de fondo.
    const musicRms = Math.sqrt(Math.max(0, hub.rmsMean ** 2 - noMusic.rmsMean ** 2));
    console.log(`[mezcla] música sola en el hub ≈ ${musicRms.toFixed(4)} rms`);
    expect(musicRms).toBeGreaterThan(0.012);
    expect(musicRms).toBeLessThan(0.12);
    expect(calm.mood).toBe('practice');
    expect(fight.intensity).toBeGreaterThan(calm.intensity);
    expect(fight.intensity).toBeGreaterThanOrEqual(0.55);
    expect(shots.peakMax).toBeGreaterThan(fight.rmsMean * 3);
    expect(shots.peakMax).toBeLessThanOrEqual(1);
  });
});
