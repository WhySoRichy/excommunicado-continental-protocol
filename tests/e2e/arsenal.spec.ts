import { expect, test } from '@playwright/test';
import { collectErrors, openGame } from './helpers';

/**
 * Arsenal: el revólver y el rifle de tirador se compran en la armería, entran en la rotación de
 * su tecla y disparan; el rifle de tirador tiene más aumento al apuntar.
 */
test.describe('Arsenal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?qa=1');
    await page.evaluate(() => window.localStorage.clear());
  });

  test('revólver y rifle de tirador: se compran, se eligen con 2 y 1, disparan y el rifle amplía la mira', async ({ page }) => {
    const errors = collectErrors(page);
    await openGame(page);
    await page.getByRole('button', { name: /Nueva partida|Continuar/ }).first().click();
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hub');
    // Armería del Sommelier: diálogo y tienda.
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setManual(true);
      q.setCoins(30);
      q.checkpoint('bar');
      q.step(4, {});
      q.interact();
    });
    for (let i = 0; i < 5 && (await page.evaluate(() => window.__EXCOM__!.menu())) === 'dialog'; i++) await page.evaluate(() => window.__EXCOM__!.advanceDialog());
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.menu())).toBe('shop');
    expect(await page.evaluate(() => window.__EXCOM__!.buy('revolver'))).toBe(true);
    expect(await page.evaluate(() => window.__EXCOM__!.buy('dmr'))).toBe(true);
    await expect(page.locator('.shop-item[data-item="dmr"]')).toContainText('Comprado');
    await page.evaluate(() => window.__EXCOM__!.closeMenu());
    // En la arena, con lo comprado.
    await page.evaluate(() => window.__EXCOM__!.playLevel('arena'));
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('playing');
    const r = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setManual(true);
      q.setGod(true);
      const loadout = q.combat()!.loadout;
      // Tecla 2: de la pistola al revólver; un disparo gasta una bala del tambor.
      q.press('weapon2');
      q.step(30, {});
      const rev = q.combat()!;
      q.press('fire');
      q.step(10, {});
      const afterShot = q.combat()!.mag;
      // Tecla 1 dos veces: la carabina y después el rifle de tirador.
      q.press('weapon1');
      q.step(30, {});
      const first = q.combat()!.weapon;
      q.press('weapon1');
      q.step(30, {});
      const dmr = q.combat()!;
      q.step(40, { aim: true });
      const fovDmr = q.camera().fov;
      q.step(20, {});
      q.press('weapon1');
      q.step(30, {});
      q.step(40, { aim: true });
      const fovCarbine = q.camera().fov;
      return { loadout, rev: { weapon: rev.weapon, mag: rev.mag, magMax: rev.magMax }, afterShot, first, dmr: { weapon: dmr.weapon, magMax: dmr.magMax }, fovDmr, fovCarbine };
    });
    expect(r.loadout).toEqual(['carbine', 'dmr', 'pistol', 'revolver', 'knife']);
    expect(r.rev).toEqual({ weapon: 'revolver', mag: 6, magMax: 6 });
    expect(r.afterShot).toBe(5);
    expect(r.first).toBe('carbine');
    expect(r.dmr).toEqual({ weapon: 'dmr', magMax: 10 });
    expect(r.fovDmr).toBeLessThan(r.fovCarbine - 8);
    expect(errors).toEqual([]);
  });
});
