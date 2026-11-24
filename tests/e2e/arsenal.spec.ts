import { expect, type Page, test } from '@playwright/test';
import { collectErrors, openGame } from './helpers';
import { mockLobby } from './lobbyMock';

/** Abre el juego con una partida guardada que ya tiene estas mejoras y este equipo. */
async function openWith(page: Page, upgrades: string[], loadout: Record<string, string | null>): Promise<void> {
  await page.addInitScript(
    (p) => {
      // Solo al empezar: al recargar manda lo que haya guardado el juego.
      if (window.sessionStorage.getItem('perfil-puesto')) return;
      window.sessionStorage.setItem('perfil-puesto', '1');
      window.localStorage.setItem('excom.profile', JSON.stringify(p));
    },
    { version: 1, coins: 20, upgrades, loadout },
  );
  await openGame(page);
}

/**
 * Arsenal e inventario: las armas se compran en la armería y se equipan en su hueco (una de cada tipo), cada tecla saca
 * la de su hueco, disparan y el rifle de tirador tiene más aumento al apuntar. El equipo se guarda.
 */
test.describe('Arsenal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?qa=1');
    await page.evaluate(() => window.localStorage.clear());
  });

  test('revólver y rifle de tirador: se compran y equipan en la armería, salen con 2 y 1, disparan y el rifle amplía la mira', async ({ page }) => {
    const errors = collectErrors(page);
    await openGame(page);
    await page
      .getByRole('button', { name: /Nueva partida|Continuar/ })
      .first()
      .click();
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hub');
    // Armería del Sommelier: diálogo y armería.
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setManual(true);
      q.setCoins(30);
      q.checkpoint('bar');
      q.step(4, {});
      q.interact();
    });
    for (let i = 0; i < 5 && (await page.evaluate(() => window.__EXCOM__!.menu())) === 'dialog'; i++)
      await page.evaluate(() => window.__EXCOM__!.advanceDialog());
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.menu())).toBe('shop');
    // Los cuatro huecos del equipo, con la vista previa del arma que se mira.
    await expect(page.locator('.armory-slot')).toHaveCount(4);
    await expect(page.locator('.armory-detail .weapon-preview')).toBeVisible();
    // Lo comprado se equipa en su hueco: el rifle de tirador en la principal, el revólver en la secundaria.
    expect(await page.evaluate(() => window.__EXCOM__!.buy('revolver'))).toBe(true);
    expect(await page.evaluate(() => window.__EXCOM__!.buy('dmr'))).toBe(true);
    await expect(page.locator('.armory-item[data-item="dmr"]')).toHaveClass(/equipped/);
    await expect(page.locator('.armory-item[data-item="carbine"]')).not.toHaveClass(/equipped/);
    expect(await page.evaluate(() => window.__EXCOM__!.loadout())).toEqual({ primary: 'dmr', secondary: 'revolver', melee: 'knife', gear: null });
    await page.screenshot({ path: 'qa-screenshots/armeria-equipo.png' });
    await page.evaluate(() => window.__EXCOM__!.closeMenu());
    // En la arena, con lo equipado.
    await page.evaluate(() => window.__EXCOM__!.playLevel('arena'));
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('playing');
    const r = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setManual(true);
      q.setGod(true);
      const loadout = q.combat()!.loadout;
      // Se empieza con la secundaria: el revólver. Un disparo gasta una bala del tambor.
      const start = q.combat()!.weapon;
      q.press('weapon2');
      q.step(30, {});
      const rev = q.combat()!;
      q.press('fire');
      q.step(1, {});
      const fxShot = q.vfx();
      q.step(9, {});
      const afterShot = q.combat()!.mag;
      // Tecla 1: la principal, el rifle de tirador.
      q.press('weapon1');
      q.step(30, {});
      const dmr = q.combat()!;
      q.step(40, { aim: true });
      const fovDmr = q.camera().fov;
      q.step(20, {});
      // Con la carabina equipada (también en mitad de la arena), la tecla 1 la saca a ella.
      q.equip('primary', 'carbine');
      q.press('weapon1');
      q.step(30, {});
      const carbine = q.combat()!;
      q.step(40, { aim: true });
      const fovCarbine = q.camera().fov;
      // Pasados unos segundos sin disparar no queda ningún efecto vivo (las trazadoras se quedaban flotando).
      q.step(150, {});
      const fxEnd = q.vfx();
      return {
        loadout,
        start,
        rev: { weapon: rev.weapon, mag: rev.mag, magMax: rev.magMax },
        afterShot,
        dmr: { weapon: dmr.weapon, magMax: dmr.magMax },
        carbine: { weapon: carbine.weapon, loadout: carbine.loadout },
        fovDmr,
        fovCarbine,
        fxShot,
        fxEnd,
      };
    });
    expect(r.fxShot.tracers).toBeGreaterThanOrEqual(1);
    expect(r.fxShot.casings).toBeGreaterThanOrEqual(1);
    expect(r.fxEnd).toEqual({ tracers: 0, casings: 0 });
    expect(r.loadout).toEqual(['dmr', 'revolver', 'knife']);
    expect(r.start).toBe('revolver');
    expect(r.rev).toEqual({ weapon: 'revolver', mag: 6, magMax: 6 });
    expect(r.afterShot).toBe(5);
    expect(r.dmr).toEqual({ weapon: 'dmr', magMax: 10 });
    expect(r.carbine).toEqual({ weapon: 'carbine', loadout: ['carbine', 'revolver', 'knife'] });
    expect(r.fovDmr).toBeLessThan(r.fovCarbine - 8);
    // El equipo se guarda: al recargar la página sigue ahí.
    await page.reload();
    await page.waitForFunction(() => window.__EXCOM__?.ready === true, null, { timeout: 90_000 });
    expect(await page.evaluate(() => window.__EXCOM__!.loadout())).toEqual({ primary: 'carbine', secondary: 'revolver', melee: 'knife', gear: null });
    expect(errors).toEqual([]);
  });

  test('aturdidora: con G mantenida se ve el arco, al soltar vuela, estalla, aturde y deslumbra; gastadas las dos, no hay más', async ({ page }) => {
    const errors = collectErrors(page);
    await openWith(page, ['stunGrenade'], { primary: 'carbine', secondary: 'pistol', melee: 'knife', gear: 'stun' });
    await page.evaluate(() => window.__EXCOM__!.playLevel('arena'));
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('playing');
    const held = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setManual(true);
      q.setGod(true);
      q.teleport(9, 0, 20, 0);
      q.setLook(0, -0.14);
      q.step(10, {});
      for (const x of [8, 10]) q.spawnEnemy('thug', x, 0, 10, true);
      q.step(5, {});
      q.press('gear');
      q.hold('gear', true);
      q.step(40, {});
      return { c: q.combat()!, flying: q.grenades().length };
    });
    expect(held.c.gear).toBe('stun');
    expect(held.c.throwPhase, 'espera con el brazo armado').toBeCloseTo(0.4, 2);
    expect(held.flying).toBe(0);
    await expect(page.locator('.prompt')).toContainText('Suelta G');
    await expect(page.locator('.gear-slot')).toContainText('Aturdidora');
    await expect(page.locator('.gear-left')).toHaveText('×2');
    await page.screenshot({ path: 'qa-screenshots/aturdidora-arco.png' });

    const after = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.hold('gear', false);
      q.step(12, {});
      const flying = q.grenades().length;
      // Hasta que estalla (la mecha son 96 pasos).
      let n = 0;
      while (q.grenades().length > 0 && n++ < 140) q.step(1, {});
      const enemies = q.enemies().filter((e) => e.alive);
      q.step(20, {});
      return { flying, n, states: enemies.map((e) => e.state), c: q.combat()! };
    });
    expect(after.flying).toBe(1);
    expect(after.n).toBeGreaterThan(60);
    expect(after.states, 'los dos, aturdidos').toEqual(['stunned', 'stunned']);
    expect(after.c.stats.stunned).toBe(2);
    expect(after.c.gearLeft).toBe(1);
    expect(after.c.throwPhase).toBe(-1);
    await page.screenshot({ path: 'qa-screenshots/aturdidora-estallido.png' });

    const spent = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      // La segunda, de un toque y cerca: deslumbra a quien la mira y se le pasa. La tercera ya no existe.
      q.setLook(0, -0.6);
      q.step(20, {});
      q.press('gear');
      q.step(60, {});
      const second = q.grenades().length;
      for (let i = 0; i < 100 && q.grenades().length > 0; i++) q.step(1, {});
      const flash = q.flashLevel();
      q.step(120, {});
      const flashEnd = q.flashLevel();
      q.press('gear');
      q.step(30, {});
      return { second, flash, flashEnd, third: q.grenades().length, c: q.combat()! };
    });
    expect(spent.second).toBe(1);
    expect(spent.flash, 'deslumbra a quien la mira de cerca').toBeGreaterThan(0.2);
    expect(spent.flash, 'sin tapar del todo la pantalla').toBeLessThan(0.85);
    expect(spent.flashEnd, 'y se apaga').toBe(0);
    expect(spent.third).toBe(0);
    expect(spent.c.gearLeft).toBe(0);
    expect(spent.c.throwPhase).toBe(-1);
    await expect(page.locator('.gear-slot')).toHaveClass(/empty/);
    expect(errors).toEqual([]);
  });

  test('el equipo se cambia en el briefing y en la sala del cooperativo, sin perder el foco, y se guarda', async ({ page, context }) => {
    await mockLobby(context);
    const errors = collectErrors(page);
    await openWith(page, ['dmr', 'revolver', 'stunGrenade'], { primary: 'carbine', secondary: 'pistol', melee: 'knife', gear: null });
    await page.evaluate(() => window.__EXCOM__!.startContract('nightclub'));
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('briefing');
    const pick = (slot: string) => page.locator(`.loadout-pick[data-slot="${slot}"]`);
    await expect(page.locator('.loadout-pick')).toHaveCount(4);
    await expect(pick('melee').locator('button').first(), 'con una sola pieza no hay nada que elegir').toBeDisabled();
    // Al otro lado de la carabina, dando la vuelta: el rifle de tirador.
    await pick('primary').locator('button').first().click();
    await expect(pick('primary')).toContainText('Meridian');
    expect(await page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.focus), 'el foco sigue en su sitio').toBe('pick:primary:prev');
    await pick('gear').locator('button').nth(1).click();
    await expect(pick('gear')).toContainText('Aturdidoras');
    // Nada se sale del panel.
    const overflow = await page.evaluate(() => {
      const panel = document.querySelector('#screens .screen')!.getBoundingClientRect();
      return [...document.querySelectorAll('.loadout-pick button')].filter((b) => b.getBoundingClientRect().right > panel.right - 8).length;
    });
    expect(overflow).toBe(0);
    await page.screenshot({ path: 'qa-screenshots/equipo-briefing.png' });
    await page.evaluate(() => window.__EXCOM__!.beginContract());
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('playing');
    const c = await page.evaluate(() => window.__EXCOM__!.combat()!);
    expect(c.loadout).toEqual(['dmr', 'pistol', 'knife']);
    expect(c.gear).toBe('stun');
    expect(c.gearLeft).toBe(2);

    // En la sala del cooperativo, el mismo selector.
    await page.reload();
    await page.waitForFunction(() => window.__EXCOM__?.ready === true, null, { timeout: 90_000 });
    await page.evaluate(() => window.__EXCOM__!.coopHost());
    await expect(page.locator('.loadout-pick')).toHaveCount(4);
    await expect(pick('primary'), 'lo del briefing se guardó').toContainText('Meridian');
    await pick('secondary').locator('button').nth(1).click();
    await expect(pick('secondary')).toContainText('Juez');
    await page.screenshot({ path: 'qa-screenshots/equipo-sala.png' });
    expect(await page.evaluate(() => window.__EXCOM__!.loadout())).toEqual({ primary: 'dmr', secondary: 'revolver', melee: 'knife', gear: 'stun' });
    expect(errors).toEqual([]);
  });
});
