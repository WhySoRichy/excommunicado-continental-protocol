import { expect, test } from '@playwright/test';
import { collectErrors, openGame } from './helpers';

/**
 * Robustez ante lo que el jugador no controla (la red y el cierre de la pestaña) y frente a
 * herramientas de prueba que no deben estar a su alcance.
 */
test.describe('Robustez', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?qa=1');
    await page.evaluate(() => window.localStorage.clear());
  });

  test('si un nivel no se puede descargar, se explica en pantalla y recargar devuelve al juego', async ({ page }) => {
    await openGame(page);
    await page
      .getByRole('button', { name: /Nueva partida|Continuar/ })
      .first()
      .click();
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hub');
    // El archivo del nivel deja de estar disponible: sin red, o un despliegue nuevo con otros nombres.
    await page.route('**/assets/nightclub-*.js', (route) => route.abort('failed'));
    await page.evaluate(() => window.__EXCOM__!.startContract('nightclub'));
    await expect(page.locator('.fatal h1')).toHaveText('No se pudo cargar el nivel');
    await expect(page.locator('.fatal')).toContainText('Tu partida está guardada');
    // Recargar (ya con el archivo disponible) devuelve al juego con la partida intacta.
    await page.unroute('**/assets/nightclub-*.js');
    await page.getByRole('button', { name: 'Recargar' }).click();
    await page.waitForFunction(() => window.__EXCOM__?.ready === true, null, { timeout: 90_000 });
    await page.getByRole('button', { name: 'Continuar' }).click();
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hub');
    await page.evaluate(() => window.__EXCOM__!.startContract('nightclub'));
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('briefing');
  });

  test('abrir el juego y salir sin empezar no deja una partida guardada', async ({ page }) => {
    await openGame(page);
    await expect(page.getByRole('button', { name: 'Nueva partida' })).toBeVisible();
    await page.reload();
    await page.waitForFunction(() => window.__EXCOM__?.ready === true, null, { timeout: 90_000 });
    expect(await page.evaluate(() => window.localStorage.getItem('excom.profile'))).toBeNull();
    await expect(page.getByRole('button', { name: 'Continuar' })).toHaveCount(0);
    // En cuanto se empieza una partida, sí queda guardada.
    await page.getByRole('button', { name: 'Nueva partida' }).click();
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hub');
    await page.reload();
    await page.waitForFunction(() => window.__EXCOM__?.ready === true, null, { timeout: 90_000 });
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeVisible();
  });

  test('si la tarjeta gráfica pierde el contexto, se avisa y pausa; al volver, la luz es la de antes', async ({ page }) => {
    const errors = collectErrors(page);
    await openGame(page);
    await page
      .getByRole('button', { name: /Nueva partida|Continuar/ })
      .first()
      .click();
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hub');
    const luminance = () =>
      page.evaluate(async () => {
        await window.__EXCOM__!.measureFps(0.6);
        return window.__EXCOM__!.luminance();
      });
    const before = await luminance();
    await page.evaluate(() => {
      const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
      const ext = canvas.getContext('webgl2')?.getExtension('WEBGL_lose_context');
      (window as Window & { loseContext?: WEBGL_lose_context | null }).loseContext = ext;
      ext?.loseContext();
    });
    await expect(page.locator('.gpu-overlay')).toBeVisible();
    await expect(page.locator('.gpu-overlay')).toContainText('tu partida está guardada');
    expect(await page.evaluate(() => window.__EXCOM__!.state())).toBe('paused');
    await page.evaluate(() => (window as Window & { loseContext?: WEBGL_lose_context | null }).loseContext?.restoreContext());
    await expect(page.locator('.gpu-overlay')).toBeHidden();
    // El entorno (IBL) se regenera: sin eso la escena volvía más oscura.
    const after = await luminance();
    console.log(`[contexto] luminancia antes ${before.toFixed(3)} · después ${after.toFixed(3)}`);
    expect(after).toBeGreaterThan(before * 0.97);
    // Chrome avisa en la consola de la pérdida provocada; el resto debe estar limpio.
    expect(errors.filter((e) => !/context|contexto/i.test(e))).toEqual([]);
  });

  test('sin ?qa=1 no hay API de pruebas ni comandos de depuración en el F3', async ({ page }) => {
    // Así funciona la versión publicada, que además no incluye la API (lo comprueba perf.spec.ts).
    const errors = collectErrors(page);
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Nueva partida' })).toBeVisible({ timeout: 90_000 });
    expect(await page.evaluate(() => window.__EXCOM__ === undefined)).toBe(true);
    await page.keyboard.press('F3');
    await expect(page.locator('#debug-text')).toContainText('FPS');
    await expect(page.locator('#debug-overlay .debug-btn')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});
