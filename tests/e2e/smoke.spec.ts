import { expect, test } from '@playwright/test';
import { collectErrors, isCI, LUMINANCE_MIN, openGame, shotPath } from './helpers';

test.describe('Fase 0 · smoke', () => {
  test('el build arranca sin errores, la escena es visible y F3 muestra FPS', async ({ page }) => {
    const errors = collectErrors(page);
    await openGame(page);

    // Deja correr el bucle real ~1,5 s y mide FPS.
    const fps = await page.evaluate(() => window.__EXCOM__!.measureFps(1.5));
    const gpu = await page.evaluate(() => window.__EXCOM__!.gpu());
    const lum = await page.evaluate(() => window.__EXCOM__!.luminance());
    console.log(`[smoke] GPU="${gpu}" fps=${fps.fps.toFixed(1)} luminancia=${lum.toFixed(3)}`);

    expect(lum, 'la escena no debe ser negra').toBeGreaterThan(LUMINANCE_MIN);
    expect(fps.frames).toBeGreaterThan(5);
    if (!isCI) expect(fps.fps).toBeGreaterThan(30);

    await page.keyboard.press('F3');
    await expect(page.locator('#debug-overlay')).toBeVisible();
    await expect(page.locator('#debug-text')).toContainText('FPS');
    await expect(page.locator('#debug-text')).toContainText('Draw calls');
    await page.screenshot({ path: shotPath('fase0-arena-f3') });

    expect(errors).toEqual([]);
  });
});
