import { expect, test } from '@playwright/test';
import { openGame } from './helpers';

/**
 * Gamepad API con un mando simulado (navigator.getGamepads sustituido antes de cargar).
 * Verifica: stick izquierdo mueve, stick derecho gira la cámara, A salta, desconexión suelta todo.
 */
test('gamepad: sticks, botón A y desconexión sin entradas pegadas', async ({ page }) => {
  await page.addInitScript(() => {
    const state = {
      connected: true,
      axes: [0, 0, 0, 0],
      buttons: Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 })),
    };
    (window as unknown as { __pad: typeof state }).__pad = state;
    const pad = {
      id: 'Mando simulado (STANDARD GAMEPAD)',
      index: 0,
      mapping: 'standard',
      timestamp: 0,
      get connected() {
        return state.connected;
      },
      get axes() {
        return state.axes;
      },
      get buttons() {
        return state.buttons;
      },
    };
    Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [state.connected ? pad : null, null, null, null] });
  });
  await openGame(page);
  await page.evaluate(() => window.__EXCOM__!.playArena());
  await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('playing');
  await page.evaluate(() => {
    const q = window.__EXCOM__!;
    q.teleport(0, 0, 8, 0);
    q.setLook(0, -0.1);
  });

  // Stick izquierdo hacia adelante → avanza hacia −Z.
  await page.evaluate(() => {
    (window as unknown as { __pad: { axes: number[] } }).__pad.axes[1] = -1;
  });
  await page.evaluate(() => window.__EXCOM__!.measureFps(0.5));
  const moved = await page.evaluate(() => window.__EXCOM__!.player()!);
  expect(moved.z).toBeLessThan(7);

  // Stick derecho a la derecha → la cámara gira (yaw disminuye).
  const yaw0 = await page.evaluate(() => window.__EXCOM__!.camera().yaw);
  await page.evaluate(() => {
    const p = (window as unknown as { __pad: { axes: number[] } }).__pad;
    p.axes[1] = 0;
    p.axes[2] = 1;
  });
  await page.evaluate(() => window.__EXCOM__!.measureFps(0.3));
  const yaw1 = await page.evaluate(() => window.__EXCOM__!.camera().yaw);
  expect(yaw1).toBeLessThan(yaw0 - 0.3);

  // Botón A → salto.
  await page.evaluate(() => {
    const p = (window as unknown as { __pad: { axes: number[]; buttons: Array<{ pressed: boolean; value: number }> } }).__pad;
    p.axes[2] = 0;
    p.buttons[0]!.pressed = true;
    p.buttons[0]!.value = 1;
  });
  await expect.poll(() => page.evaluate(() => window.__EXCOM__!.player()!.stats.jumps)).toBeGreaterThan(0);

  // Desconexión con el botón pulsado → nada queda mantenido.
  await page.evaluate(() => {
    (window as unknown as { __pad: { connected: boolean } }).__pad.connected = false;
  });
  await page.evaluate(() => window.__EXCOM__!.measureFps(0.2));
  expect(await page.evaluate(() => window.__EXCOM__!.input().held)).toBe(0);
  expect(await page.evaluate(() => window.__EXCOM__!.state())).toBe('playing');
});
