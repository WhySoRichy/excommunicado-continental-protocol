import { expect, type Page, test } from '@playwright/test';
import { collectErrors, LUMINANCE_MIN, openGame, shotPath } from './helpers';

/**
 * Fase 4 · Contratos completables de inicio a fin con el guion real de misión:
 * objetivos en orden, checkpoints, civiles, alarma, refuerzos, marcadores y resultados.
 */
type MissionId = 'practice' | 'nightclub' | 'docks' | 'rooftop' | 'gauntlet';

async function enterContract(page: Page, id: MissionId): Promise<void> {
  await openGame(page);
  await page.getByRole('button', { name: /Nueva partida|Continuar/ }).first().click();
  await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hub');
  await page.evaluate((m) => window.__EXCOM__!.startContract(m), id);
  await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('briefing');
  await page.evaluate(() => window.__EXCOM__!.beginContract());
  await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('playing');
  await page.evaluate(() => {
    const q = window.__EXCOM__!;
    q.setManual(true);
    q.resetInvariants();
  });
}

test.describe('Fase 4 · contratos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?qa=1');
    await page.evaluate(() => window.localStorage.clear());
  });

  test('Club Kairos: completable de inicio a fin (civiles, alarma por detección, refuerzos, resultados)', async ({ page }) => {
    const errors = collectErrors(page);
    await enterContract(page, 'nightclub');
    const start = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      return { m: q.mission()!, civ: q.civilians(), enemies: q.enemies().length };
    });
    expect(start.m.index).toBe(0);
    expect(start.m.objective).toContain('Entra');
    expect(start.civ).toHaveLength(12);
    expect(start.civ.every((c) => c.alive)).toBe(true);
    expect(start.enemies).toBe(8);
    await page.evaluate(() => window.__EXCOM__!.measureFps(0.3));
    const lumAlley = await page.evaluate(() => window.__EXCOM__!.luminance());
    expect(lumAlley).toBeGreaterThan(LUMINANCE_MIN);

    // Objetivo 1: entrar en el club → checkpoint "Pista".
    const o1 = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setGod(true);
      q.teleport(0, 0, 12.5, 0);
      q.step(8, {});
      return q.mission()!;
    });
    expect(o1.index).toBe(1);
    expect(o1.respawn.z).toBeCloseTo(12, 0);
    await page.evaluate(() => window.__EXCOM__!.measureFps(0.3));
    const lumFloor = await page.evaluate(() => window.__EXCOM__!.luminance());
    console.log(`[kairos] luminancia callejón ${lumAlley.toFixed(3)} · pista ${lumFloor.toFixed(3)}`);
    expect(lumFloor).toBeGreaterThan(LUMINANCE_MIN);
    await page.screenshot({ path: shotPath('fase4-kairos-pista') });

    // Civiles: la mira avisa "NO DISPARAR" y herir a uno cuenta en la misión.
    const civ = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.press('weapon2');
      q.teleport(0, 0, 9, 0);
      // La cámara de apuntado se asienta antes de alinear la mira con el civil.
      q.step(20, { aim: true });
      const c = q.civilians().find((x) => x.alive && x.id === 'c2')!;
      q.aimAt(c.x, 1.0, c.z);
      q.step(2, { aim: true });
      q.aimAt(c.x, 1.0, c.z);
      q.step(4, { aim: true });
      return { overCiv: document.querySelector('#hud .crosshair')?.classList.contains('civilian') ?? false, c: q.combat()! };
    });
    expect(civ.overCiv).toBe(true);
    const hurt = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      const c = q.civilians().find((x) => x.alive && x.id === 'c2')!;
      q.aimAt(c.x, 1.0, c.z);
      q.press('fire');
      q.step(3, { aim: true });
      return { m: q.mission()!, civ: q.civilians().filter((c) => c.state === 'flee' || c.health < 60).length };
    });
    expect(hurt.m.civiliansHurt).toBe(1);
    expect(hurt.civ).toBeGreaterThan(0);

    // El disparo alerta a los matones: suena la alarma y entran refuerzos por la entrada.
    const alarm = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      for (let i = 0; i < 40 && !q.mission()!.alarmSounded; i++) q.step(15, {});
      return { m: q.mission()!, alarmEnemies: q.enemies().filter((e) => e.id.startsWith('alarm-')).length };
    });
    expect(alarm.m.alarmSounded).toBe(true);
    expect(alarm.alarmEnemies).toBe(3);

    // Objetivo 2: subir al VIP → checkpoint. Objetivo 3: Vance.
    const o2 = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.teleport(12.5, 3.2, -6, Math.PI / 2);
      q.step(8, {});
      return q.mission()!;
    });
    expect(o2.index).toBe(2);
    expect(o2.objective).toContain('Vance');
    expect(o2.beacon).not.toBeNull();
    const o3 = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.runDebug('killAll');
      q.step(5, {});
      return { m: q.mission()!, reinforce: q.enemies().filter((e) => e.id.startsWith('r-') && e.alive).length };
    });
    expect(o3.m.index).toBe(3);
    expect(o3.m.objective).toContain('trasera');
    expect(o3.reinforce).toBe(3);

    // Objetivo 4: salida trasera → resultados con rango y recompensa.
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.teleport(10, 0, -16.5, 0);
      q.step(8, {});
    });
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('results');
    const out = await page.evaluate(() => window.__EXCOM__!.outcome()!);
    expect(out.success).toBe(true);
    expect(out.mission).toBe('nightclub');
    expect(out.coins).toBeGreaterThanOrEqual(6);
    expect(out.achievements).toContain('global.first');
    expect(out.achievements).not.toContain('nightclub.ghost');
    expect(out.achievements).not.toContain('nightclub.noCivs');
    await expect(page.locator('.subs .sub')).toHaveCount(5);
    await page.screenshot({ path: shotPath('fase4-kairos-resultados') });
    const inv = await page.evaluate(() => window.__EXCOM__!.invariants());
    expect(inv.penetrations).toBe(0);
    expect(inv.cameraInside).toBe(0);
    expect(errors).toEqual([]);
  });

  test('Club Kairos: desactivar la alarma evita refuerzos; sin marcadores el contrato falla y se reintenta', async ({ page }) => {
    await enterContract(page, 'nightclub');
    // Panel de alarma: interacción mantenida 2 s (antes, el guardia de la puerta cae en silencio).
    const panel = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setGod(true);
      q.killEnemy('e-door');
      q.teleport(3.2, 0, 16, -Math.PI / 2);
      q.setLook(-Math.PI / 2, -0.1);
      q.step(8, {});
      const prompt = q.prompt();
      q.hold('interact', true);
      q.step(70, {});
      const mid = q.prompt();
      q.step(70, {});
      q.hold('interact', false);
      return { prompt, mid, m: q.mission()! };
    });
    expect(panel.prompt).toContain('Desactivar la alarma');
    expect(panel.mid).toMatch(/\d+ %/);
    expect(panel.m.alarmDisabled).toBe(true);
    // Un matón te ve: hay combate pero NO alarma ni refuerzos.
    const seen = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.teleport(0, 0, 15, 0);
      let alerted = 0;
      for (let i = 0; i < 40 && alerted === 0; i++) {
        q.step(15, {});
        alerted = q.enemies().filter((e) => e.state === 'combat').length;
      }
      q.step(60, {});
      return { alerted, m: q.mission()!, alarmEnemies: q.enemies().filter((e) => e.id.startsWith('alarm-')).length };
    });
    expect(seen.alerted).toBeGreaterThan(0);
    expect(seen.m.alarmSounded).toBe(false);
    expect(seen.alarmEnemies).toBe(0);

    // Tres muertes = tres marcadores: las dos primeras reaparecen en el checkpoint, la tercera falla.
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.teleport(0, 0, 12.5, 0);
      q.step(8, {});
      q.setGod(false);
    });
    expect((await page.evaluate(() => window.__EXCOM__!.mission()!)).index).toBe(1);
    for (let death = 1; death <= 3; death++) {
      const r = await page.evaluate(() => {
        const q = window.__EXCOM__!;
        for (let i = 0; i < 4; i++) q.spawnEnemy('escort', -3 + i * 2, 0, 8, true);
        for (let i = 0; i < 80 && !q.combat()!.dead; i++) q.step(30, {});
        return { dead: q.combat()!.dead, state: q.state(), m: q.mission()! };
      });
      expect(r.dead).toBe(true);
      expect(r.m.markersUsed).toBe(death);
      if (death < 3) {
        expect(r.state).toBe('dead');
        await expect(page.locator('#hud .death-hint')).toContainText('marcador');
        await page.evaluate(() => window.__EXCOM__!.respawn());
        const p = await page.evaluate(() => window.__EXCOM__!.player()!);
        expect(p.z).toBeCloseTo(12, 0);
        expect(await page.evaluate(() => window.__EXCOM__!.state())).toBe('playing');
      } else {
        await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('results');
      }
    }
    const out = await page.evaluate(() => window.__EXCOM__!.outcome()!);
    expect(out.success).toBe(false);
    expect(out.failReason).toContain('marcadores');
    await expect(page.locator('.brief-kicker')).toHaveText('CONTRATO FALLIDO');
    await page.screenshot({ path: shotPath('fase4-kairos-fallido') });
    // Reintentar recarga el contrato desde el briefing.
    await page.getByRole('button', { name: 'Reintentar' }).click();
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('briefing');
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('playing');
    const m = await page.evaluate(() => window.__EXCOM__!.mission()!);
    expect(m.index).toBe(0);
    expect(m.markersUsed).toBe(0);
  });
});
