import { expect, type Page, test } from '@playwright/test';
import { collectErrors, openGame, shotPath } from './helpers';

/** Fase 5 · Ajustes: se aplican en caliente, persisten al recargar y los prompts usan la tecla real. */

async function openSettings(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Ajustes' }).click();
  await expect(page.locator('#screens')).toHaveAttribute('data-screen', 'settings');
}

async function tab(page: Page, name: string): Promise<void> {
  await page.getByRole('tab', { name }).click();
  await expect(page.getByRole('tab', { name })).toHaveAttribute('aria-selected', 'true');
}

test.describe('Fase 5 · ajustes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?qa=1');
    await page.evaluate(() => window.localStorage.clear());
  });

  test('se aplican en caliente, persisten tras recargar y la reasignación cambia los prompts', async ({ page }) => {
    const errors = collectErrors(page);
    await openGame(page);
    await openSettings(page);

    // Controles: FOV y sensibilidad.
    await page.locator('input[data-setting="fov"]').fill('80');
    await page.locator('input[data-setting="mouseSens"]').fill('1.5');
    let st = await page.evaluate(() => window.__EXCOM__!.settings());
    expect(st.cameraFov).toBe(80);
    expect(st.mouseSens).toBeCloseTo(0.0022 * 1.5, 6);
    await page.locator('[data-setting="invertY"]').click();
    await expect(page.locator('[data-setting="invertY"]')).toHaveAttribute('aria-pressed', 'true');

    // Vídeo y audio: preset, brillo y música.
    await tab(page, 'Vídeo y audio');
    await page.locator('[data-preset="low"]').click();
    await page.locator('input[data-setting="brightness"]').fill('1.2');
    await page.locator('input[data-setting="music"]').fill('0.2');
    st = await page.evaluate(() => window.__EXCOM__!.settings());
    expect(st.preset).toBe('low');
    expect(st.brightness).toBe('brightness(1.2)');
    expect(st.volumes.music).toBeCloseTo(0.2, 5);

    // Accesibilidad: escala de UI y pistas.
    await tab(page, 'Accesibilidad');
    await page.locator('input[data-setting="uiScale"]').fill('1.2');
    await page.locator('[data-setting="hints"]').click();
    st = await page.evaluate(() => window.__EXCOM__!.settings());
    expect(st.uiScale).toBe('1.2');
    expect(st.settings.hints).toBe(false);

    // Teclas: Interactuar → G; luego Recargar → G intercambia (Interactuar pasa a R).
    await tab(page, 'Teclas');
    await page.locator('[data-rebind="interact"]').click();
    await expect(page.locator('[data-rebind="interact"]')).toHaveText('Pulsa una tecla…');
    await page.keyboard.press('g');
    await expect(page.locator('tr[data-action="interact"] .keys')).toHaveText('G');
    await page.locator('[data-rebind="reload"]').click();
    await page.keyboard.press('g');
    await expect(page.locator('.settings-note')).toContainText('«Interactuar» pasa a R');
    await expect(page.locator('tr[data-action="reload"] .keys')).toHaveText('G');
    await expect(page.locator('tr[data-action="interact"] .keys')).toHaveText('R');
    // Esc durante la captura cancela y NO cierra la pantalla.
    await page.locator('[data-rebind="jump"]').click();
    await page.keyboard.press('Escape');
    await expect(page.locator('.settings-note')).toHaveText('Cambio cancelado.');
    await expect(page.locator('#screens')).toHaveAttribute('data-screen', 'settings');
    await page.screenshot({ path: shotPath('fase5-ajustes-teclas') });
    // Esc fuera de la captura vuelve al título.
    await page.keyboard.press('Escape');
    await expect(page.locator('#screens')).toHaveAttribute('data-screen', 'title');

    // Recarga: todo sigue igual.
    await page.reload();
    await page.waitForFunction(() => window.__EXCOM__?.ready === true);
    st = await page.evaluate(() => window.__EXCOM__!.settings());
    expect(st.cameraFov).toBe(80);
    expect(st.preset).toBe('low');
    expect(st.uiScale).toBe('1.2');
    expect(st.settings.invertY).toBe(true);
    expect(st.settings.bindings.interact[0]).toBe('KeyR');
    expect(st.settings.bindings.reload[0]).toBe('KeyG');

    // En el hub, el prompt de Charon muestra la tecla real (R) y las pistas están ocultas.
    await page.getByRole('button', { name: /Nueva partida|Continuar/ }).first().click();
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hub');
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setManual(true);
      q.checkpoint('desk');
      q.step(12, {});
    });
    await expect(page.locator('#hud .prompt .keycap')).toHaveText('R');
    await expect(page.locator('#hud .prompt-text')).toContainText('Charon');
    await expect(page.locator('#hud .hints')).toBeHidden();
    // Pulsar la tecla nueva (R) abre el diálogo de verdad.
    await page.keyboard.press('r');
    await page.evaluate(() => window.__EXCOM__!.step(2, {}));
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.menu())).toBe('dialog');
    expect(errors).toEqual([]);
  });

  test('apuntar en modo alternar y restablecer de fábrica', async ({ page }) => {
    await openGame(page, 'level=arena');
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setSettings({ aimToggle: true });
    });
    await page.getByRole('button', { name: 'Arena de pruebas (QA)' }).click();
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('playing');
    const r = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setManual(true);
      q.step(4, {});
      q.press('aim');
      q.step(30, {});
      const on = q.player()!.aiming;
      q.step(30, {});
      const still = q.player()!.aiming;
      q.press('aim');
      q.step(10, {});
      const off = q.player()!.aiming;
      return { on, still, off };
    });
    expect(r).toEqual({ on: true, still: true, off: false });
    // Restablecer devuelve todo a fábrica (y las teclas).
    await page.evaluate(() => window.__EXCOM__!.setSettings({ fov: 90, bindings: { ...window.__EXCOM__!.settings().settings.bindings, interact: ['KeyZ', 'Pad0'] } }));
    await page.keyboard.press('Escape');
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('paused');
    await openSettings(page);
    await page.getByRole('button', { name: 'Restablecer' }).click();
    const st = await page.evaluate(() => window.__EXCOM__!.settings());
    expect(st.cameraFov).toBe(68);
    expect(st.settings.aimToggle).toBe(false);
    expect(st.settings.bindings.interact[0]).toBe('KeyE');
    // Volver regresa a la pausa (de donde se abrió).
    await page.getByRole('button', { name: 'Volver' }).click();
    await expect(page.locator('#screens')).toHaveAttribute('data-screen', 'pause');
  });
});
