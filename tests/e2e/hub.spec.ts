import { expect, type Page, test } from '@playwright/test';
import { collectErrors, LUMINANCE_MIN, openGame, shotPath } from './helpers';

/**
 * Fase 3 · Gate del hub: las compras persisten (recarga de página) y romper la
 * regla del Continental dispara el Excomunicado completo (multa, alarma, 3 oleadas, readmisión).
 */

async function enterHub(page: Page): Promise<void> {
  await openGame(page);
  await page.getByRole('button', { name: /Nueva partida|Continuar/ }).first().click();
  await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hub');
  await page.evaluate(() => {
    const q = window.__EXCOM__!;
    q.setManual(true);
    q.resetInvariants();
  });
}

test.describe('Fase 3 · El Continental', () => {
  test.beforeEach(async ({ page }) => {
    // Partida limpia en cada test (localStorage del origen del preview).
    await page.goto('/?qa=1');
    await page.evaluate(() => window.localStorage.clear());
  });

  test('título → hub: zona neutral, arma enfundada, prompts de NPC y el hub se ve bien', async ({ page }) => {
    const errors = collectErrors(page);
    await enterHub(page);
    const c = await page.evaluate(() => window.__EXCOM__!.combat()!);
    expect(c.holstered).toBe(true);
    const hud = await page.evaluate(() => window.__EXCOM__!.hud());
    expect(hud.zone).toContain('ZONA NEUTRAL');
    expect(hud.objective).toContain('Charon');
    // Frente al mostrador de Charon aparece el prompt con la tecla real.
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.checkpoint('desk');
      q.step(12, {});
    });
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.prompt())).toContain('Hablar con Charon');
    await page.evaluate(() => window.__EXCOM__!.measureFps(0.3));
    const lum = await page.evaluate(() => window.__EXCOM__!.luminance());
    console.log(`[hub] luminancia ${lum.toFixed(3)}`);
    expect(lum).toBeGreaterThan(LUMINANCE_MIN);
    await page.screenshot({ path: shotPath('fase3-hub-recepcion') });
    expect(errors).toEqual([]);
  });

  test('Charon: diálogo con E/Enter → tablero de contratos → aceptar el simulacro → volver en ascensor', async ({ page }) => {
    await enterHub(page);
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.checkpoint('desk');
      q.step(12, {});
      q.interact();
    });
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hubMenu');
    expect(await page.evaluate(() => window.__EXCOM__!.menu())).toBe('dialog');
    await expect(page.locator('.dialog-speaker')).toHaveText('Charon');
    // Avanza con Enter hasta el final: se abre el tablero.
    for (let i = 0; i < 4; i++) await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.menu())).toBe('contracts');
    await expect(page.locator('.contract[data-mission="practice"]')).toContainText('Simulacro de combate');
    await expect(page.locator('.contract[data-mission="nightclub"]')).toContainText('Completa "Simulacro de combate"');
    await expect(page.locator('.contract[data-mission="docks"]')).toContainText('Próximamente');
    expect((await page.evaluate(() => window.__EXCOM__!.profile())).flags.charonMet).toBe(true);
    await page.screenshot({ path: shotPath('fase3-contratos') });
    await page.locator('.contract[data-mission="practice"] button').click();
    // Briefing de 3 líneas → Enter → jugando con el primer objetivo y su baliza.
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('briefing');
    await expect(page.locator('.brief-lines li')).toHaveCount(3);
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('playing');
    expect(await page.evaluate(() => window.__EXCOM__!.level())).toBe('practice');
    const m0 = await page.evaluate(() => window.__EXCOM__!.mission()!);
    expect(m0.index).toBe(0);
    expect(m0.objective).toContain('patio');
    expect(m0.beacon).not.toBeNull();
    expect(m0.markersTotal).toBe(3);
    await expect(page.locator('#hud .beacon, #hud .beacon-arrow').locator('visible=true')).toHaveCount(1);
    // Llegar al patio activa el checkpoint y aparecen los 6 maniquíes.
    const before = (await page.evaluate(() => window.__EXCOM__!.profile())).coins;
    const m1 = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setManual(true);
      q.teleport(4, 0, -11, 0);
      q.step(10, {});
      return { m: q.mission()!, enemies: q.enemies().filter((e) => e.alive).length };
    });
    expect(m1.m.index).toBe(1);
    expect(m1.enemies).toBe(6);
    expect(m1.m.respawn.z).toBeCloseTo(-11, 0);
    await page.screenshot({ path: shotPath('fase4-practica-objetivo') });
    // Al caer el último, pantalla de resultados con rango, monedas y logros.
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.runDebug('killAll');
      q.step(5, {});
    });
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('results');
    const out = await page.evaluate(() => window.__EXCOM__!.outcome()!);
    expect(out.success).toBe(true);
    expect(['S', 'A', 'B', 'C', 'D']).toContain(out.rank);
    expect(out.coins).toBeGreaterThanOrEqual(5);
    expect(out.achievements).toContain('global.first');
    await expect(page.locator('.rank-letter')).toHaveText(out.rank);
    await page.screenshot({ path: shotPath('fase4-resultados') });
    const after = await page.evaluate(() => window.__EXCOM__!.profile());
    expect(after.coins).toBe(before + out.coins);
    expect(after.completed).toContain('practice');
    expect(after.best.practice?.rank).toBe(out.rank);
    await page.getByRole('button', { name: 'Volver al Continental' }).click();
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hub');
    expect(await page.evaluate(() => window.__EXCOM__!.level())).toBe('hub');
  });

  test('GATE · las compras persisten: comprar al Sommelier, recargar la página y seguir teniéndola', async ({ page }) => {
    await enterHub(page);
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.checkpoint('bar');
      q.step(12, {});
      q.interact();
    });
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.menu())).toBe('dialog');
    await page.evaluate(() => window.__EXCOM__!.advanceDialog());
    await page.evaluate(() => window.__EXCOM__!.advanceDialog());
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.menu())).toBe('shop');
    await expect(page.locator('.coin-count')).toHaveText('8');
    // Compensador (5 monedas) → quedan 3; Punta hueca (7) ya no alcanza.
    await page.locator('.shop-item[data-item="compensator"] button').click();
    await expect(page.locator('.coin-count')).toHaveText('3');
    await expect(page.locator('.shop-item[data-item="compensator"]')).toContainText('Comprado');
    await expect(page.locator('.shop-item[data-item="hollowPoint"]')).toContainText('Faltan 4 monedas');
    await expect(page.locator('.shop-item[data-item="suit2"]')).toContainText('Requiere Traje balístico I');
    // La mejora se aplica en caliente: el retroceso de la carabina baja un 35 %.
    const recoil = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.closeMenu();
      q.press('weapon1');
      q.step(2, {});
      return q.combat()!.recoil0;
    });
    expect(recoil).toBeCloseTo(0.9 * 0.65, 5);
    await page.screenshot({ path: shotPath('fase3-tienda') });

    // Recarga completa de la página: el perfil viene de localStorage.
    await page.reload();
    await page.waitForFunction(() => window.__EXCOM__?.ready === true, null, { timeout: 90_000 });
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeVisible();
    const p = await page.evaluate(() => window.__EXCOM__!.profile());
    expect(p.coins).toBe(3);
    expect(p.upgrades).toEqual(['compensator']);
    await page.getByRole('button', { name: 'Continuar' }).click();
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hub');
    // Al entrar se empuña la pistola (1,6° de retroceso base): con compensador, 1,6 × 0,65.
    const c2 = await page.evaluate(() => window.__EXCOM__!.combat()!);
    expect(c2.weapon).toBe('pistol');
    expect(c2.recoil0).toBeCloseTo(1.6 * 0.65, 5);
  });

  test('GATE · romper la regla: aviso al desenfundar, Excomunicado con multa, alarma, 3 oleadas y readmisión', async ({ page }) => {
    const errors = collectErrors(page);
    await enterHub(page);
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setCoins(20);
      q.setGod(true);
      q.teleport(0, 0, 2, 0);
      q.setLook(0, -0.05);
      q.step(5, {});
    });
    // 1) Primer disparo = aviso y arma desenfundada, sin consecuencias.
    const warn = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.press('fire');
      q.step(2, {});
      return { hub: q.hub()!, c: q.combat()!, hud: q.hud(), coins: q.profile().coins };
    });
    expect(warn.hub.state).toBe('armed');
    expect(warn.c.holstered).toBe(false);
    expect(warn.c.stats.shotsFired).toBe(0);
    expect(warn.hud.toast).toContain('Regla I');
    expect(warn.coins).toBe(20);
    // 2) Segundo disparo = Excomunicado: multa del 30 %, sirena, luces de alarma, oleada 1.
    const ex = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.press('fire');
      q.step(3, {});
      return { hub: q.hub()!, c: q.combat()!, hud: q.hud(), coins: q.profile().coins, excom: q.profile().excommunicados, enemies: q.enemies().filter((e) => e.alive).length };
    });
    expect(ex.c.stats.shotsFired).toBe(1);
    expect(ex.hub.state).toBe('excommunicado');
    expect(ex.hub.wave).toBe(1);
    expect(ex.coins).toBe(14);
    expect(ex.excom).toBe(1);
    expect(ex.hub.alarmIntensity).toBeGreaterThan(0);
    expect(ex.hud.zone).toContain('EXCOMUNICADO');
    expect(ex.hud.objective).toContain('oleada 1');
    expect(ex.enemies).toBe(3);
    await page.evaluate(() => window.__EXCOM__!.measureFps(0.3));
    const lum = await page.evaluate(() => window.__EXCOM__!.luminance());
    console.log(`[excomunicado] luminancia con alarma ${lum.toFixed(3)}`);
    expect(lum).toBeGreaterThan(LUMINANCE_MIN);
    await page.screenshot({ path: shotPath('fase3-excomunicado') });
    // 3) Las oleadas entran al hotel y, al caer la última, Winston readmite.
    const waves: number[] = [];
    for (let w = 1; w <= 3; w++) {
      const r = await page.evaluate(() => {
        const q = window.__EXCOM__!;
        // Los enemigos asaltan el hotel: deben entrar por las puertas hasta el vestíbulo.
        q.step(360, {});
        const inside = q.enemies().filter((e) => e.alive && e.z < 12 && e.x < 16).length;
        q.runDebug('killAll');
        q.step(2, {});
        // Pausa entre oleadas + aparición de la siguiente.
        q.step(Math.round(3 * 60), {});
        return { inside, hub: q.hub()!, alive: q.enemies().filter((e) => e.alive).length, menu: q.menu(), state: q.state() };
      });
      waves.push(r.inside);
      if (w < 3) {
        expect(r.hub.wave).toBe(w + 1);
        expect(r.alive).toBeGreaterThan(0);
      } else {
        expect(r.hub.state).toBe('readmitted');
        expect(r.state).toBe('hubMenu');
        expect(r.menu).toBe('dialog');
      }
    }
    console.log(`[excomunicado] enemigos que entraron al vestíbulo por oleada: ${waves.join(', ')}`);
    expect(waves.every((n) => n > 0)).toBe(true);
    await expect(page.locator('.dialog-speaker')).toHaveText('Winston');
    await page.evaluate(() => window.__EXCOM__!.advanceDialog());
    await page.evaluate(() => window.__EXCOM__!.advanceDialog());
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hub');
    // Vuelve la normalidad: sirena apagada, arma enfundada, zona neutral.
    const end = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.step(Math.round(4.5 * 60), {});
      return { hub: q.hub()!, c: q.combat()!, hud: q.hud(), enemies: q.enemies().length };
    });
    expect(end.hub.state).toBe('neutral');
    expect(end.hub.alarmIntensity).toBe(0);
    expect(end.c.holstered).toBe(true);
    expect(end.hud.zone).toContain('ZONA NEUTRAL');
    expect(end.enemies).toBe(0);
    expect(errors).toEqual([]);
  });

  test('morir durante el Excomunicado: readmisión igualmente y reaparición en el hub', async ({ page }) => {
    await enterHub(page);
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.teleport(0, 0, 2, 0);
      q.setLook(0, -0.05);
      q.step(5, {});
      q.press('fire');
      q.step(2, {});
      q.press('fire');
      q.step(3, {});
      for (let i = 0; i < 4; i++) q.spawnEnemy('escort', -4 + i * 2.5, 0, -2, true);
      for (let i = 0; i < 80 && !q.combat()!.dead; i++) q.step(30, {});
    });
    expect(await page.evaluate(() => window.__EXCOM__!.combat()!.dead)).toBe(true);
    expect(await page.evaluate(() => window.__EXCOM__!.state())).toBe('dead');
    expect(await page.evaluate(() => window.__EXCOM__!.hub()!.state)).toBe('readmitted');
    await page.evaluate(() => window.__EXCOM__!.respawn());
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hub');
    const r = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.step(Math.round(5 * 60), {});
      return { hub: q.hub()!, enemies: q.enemies().filter((e) => e.alive).length, health: q.combat()!.health };
    });
    expect(r.hub.state).toBe('neutral');
    expect(r.enemies).toBe(0);
    expect(r.health).toBe(100);
  });
});
