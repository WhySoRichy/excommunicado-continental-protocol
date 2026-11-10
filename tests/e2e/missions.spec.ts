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

test.describe('Fase 4 · contratos 2 y 3', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?qa=1');
    await page.evaluate(() => window.localStorage.clear());
  });

  test('Muelle 9: tres cargas con interacción mantenida, bodega, refuerzos del bote y resultados', async ({ page }) => {
    const errors = collectErrors(page);
    await enterContract(page, 'docks');
    const start = await page.evaluate(() => ({ m: window.__EXCOM__!.mission()!, enemies: window.__EXCOM__!.enemies().length }));
    expect(start.m.kind).toBe('interact');
    expect(start.m.beacon).not.toBeNull();
    expect(start.enemies).toBe(11);
    await page.evaluate(() => window.__EXCOM__!.measureFps(0.3));
    const lum = await page.evaluate(() => window.__EXCOM__!.luminance());
    console.log(`[muelle] luminancia ${lum.toFixed(3)}`);
    expect(lum).toBeGreaterThan(LUMINANCE_MIN);
    await page.screenshot({ path: shotPath('fase4-muelle-patio') });
    // Carga a carga: colocarse junto al palé, mirarlo y mantener E 2,5 s.
    const plant = async (x: number, z: number, px: number, pz: number): Promise<{ index: number; prompt: string }> =>
      page.evaluate(
        ([cx, cz, ox, oz]) => {
          const q = window.__EXCOM__!;
          q.setGod(true);
          const yaw = Math.atan2(-(cx! - ox!), -(cz! - oz!));
          q.teleport(ox!, 0, oz!, yaw);
          q.setLook(yaw, -0.2);
          q.step(8, {});
          const prompt = q.prompt();
          q.hold('interact', true);
          q.step(160, {});
          q.hold('interact', false);
          q.step(4, {});
          return { index: q.mission()!.index, prompt };
        },
        [x, z, px, pz],
      );
    const c1 = await plant(-22, 20, -20.5, 20);
    expect(c1.prompt).toContain('Colocar carga explosiva');
    expect(c1.index).toBe(0);
    const c2 = await plant(14, -4, 14, -2.5);
    expect(c2.index).toBe(1);
    const m1 = await page.evaluate(() => window.__EXCOM__!.mission()!);
    expect(m1.respawn.z).toBeCloseTo(4, 0);
    const c3 = await plant(-20, -24, -20, -22.5);
    expect(c3.index).toBe(2);
    const o3 = await page.evaluate(() => ({ m: window.__EXCOM__!.mission()!, boat: window.__EXCOM__!.enemies().filter((e) => e.id.startsWith('b-') && e.alive).length }));
    expect(o3.m.objective).toContain('bote');
    expect(o3.boat).toBe(3);
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.teleport(20, 0, -36, 0);
      q.step(8, {});
    });
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('results');
    const out = await page.evaluate(() => window.__EXCOM__!.outcome()!);
    expect(out.success).toBe(true);
    expect(out.achievements).toContain('docks.fast');
    expect(out.achievements).toContain('docks.untouched');
    await page.screenshot({ path: shotPath('fase4-muelle-resultados') });
    expect(errors).toEqual([]);
  });

  test('Torre Meridian: azoteas, tiradores, el Juez se arrodilla por fases y escape cronometrado', async ({ page }) => {
    const errors = collectErrors(page);
    await enterContract(page, 'rooftop');
    await page.evaluate(() => window.__EXCOM__!.measureFps(0.3));
    const lum = await page.evaluate(() => window.__EXCOM__!.luminance());
    console.log(`[torre] luminancia ${lum.toFixed(3)}`);
    expect(lum).toBeGreaterThan(LUMINANCE_MIN);
    // Por la escalera hasta B caminando (el personaje sube 0,32 m por peldaño sin saltar).
    const climb = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setGod(true);
      q.teleport(-20, 0, 2, 0);
      q.setLook(0, -0.1);
      q.step(240, { moveY: 1, sprint: true });
      return { p: q.player()!, m: q.mission()! };
    });
    expect(climb.p.y).toBeGreaterThan(3.7);
    const o1 = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.teleport(-16, 3.84, -12, 0);
      q.step(8, {});
      return q.mission()!;
    });
    expect(o1.index).toBe(1);
    expect(o1.objective).toContain('tiradores');
    // Los dos tiradores (uno en B, otro en C) → objetivo cumplido; luego el helipuerto por la rampa.
    const o2 = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.killEnemy('m-roofB');
      q.killEnemy('m-roofC');
      q.step(5, {});
      const afterKill = q.mission()!.index;
      q.teleport(-9, 3.84, -12, -Math.PI / 2);
      q.setLook(-Math.PI / 2, -0.1);
      q.step(200, { moveY: 1, sprint: true });
      return { afterKill, p: q.player()!, m: q.mission()! };
    });
    expect(o2.afterKill).toBe(2);
    expect(o2.p.y).toBeGreaterThan(7.5);
    const o3 = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.teleport(4, 7.68, -14, 0);
      q.step(8, {});
      return q.mission()!;
    });
    expect(o3.index).toBe(3);
    expect(o3.kind).toBe('boss');
    await page.screenshot({ path: shotPath('fase4-torre-helipuerto') });
    // El Juez: a disparos de pistola a la cabeza; al cruzar el 50 % se arrodilla y llegan escoltas.
    const boss = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.press('weapon2');
      q.teleport(12, 7.68, -16, 0);
      q.step(20, { aim: true });
      let kneel = false;
      let phaseSpawn = 0;
      for (let i = 0; i < 80; i++) {
        const j = q.enemies().find((e) => e.id === 'judge');
        if (!j || !j.alive) break;
        if (j.state === 'stunned') kneel = true;
        phaseSpawn = Math.max(phaseSpawn, q.enemies().filter((e) => e.id.startsWith('p1-') || e.id.startsWith('p2-')).length);
        const c = q.combat()!;
        if (c.mag === 0 && !c.reloading) q.press('reload');
        q.aimAt(j.x, j.headY, j.z);
        q.step(1, { aim: true });
        q.aimAt(j.x, j.headY, j.z);
        if (!q.combat()!.blocked) q.press('fire');
        q.step(12, { aim: true });
      }
      q.step(5, {});
      return { kneel, phaseSpawn, m: q.mission()!, judge: q.enemies().find((e) => e.id === 'judge')! };
    });
    expect(boss.judge.alive).toBe(false);
    expect(boss.kneel).toBe(true);
    expect(boss.phaseSpawn).toBeGreaterThanOrEqual(2);
    expect(boss.m.index).toBe(4);
    expect(boss.m.kind).toBe('escape');
    expect(boss.m.escapeLeft).toBeGreaterThan(40);
    const hudObj = await page.evaluate(() => window.__EXCOM__!.hud().objective);
    expect(hudObj).toMatch(/\d+ s/);
    // Escape: refuerzos en A y la tirolina antes de que acabe el tiempo.
    const esc = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.step(120, {});
      const left = q.mission()!.escapeLeft;
      q.teleport(24, 0, 12.4, Math.PI);
      q.step(8, {});
      return { left, escapers: q.enemies().filter((e) => e.id.startsWith('esc-')).length };
    });
    expect(esc.escapers).toBe(3);
    expect(esc.left).toBeLessThan(44);
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('results');
    const out = await page.evaluate(() => window.__EXCOM__!.outcome()!);
    expect(out.success).toBe(true);
    expect(out.achievements).toContain('rooftop.punctual');
    await page.screenshot({ path: shotPath('fase4-torre-resultados') });
    expect(errors).toEqual([]);
  });

  test('Torre Meridian: si se acaba el tiempo de escape, el contrato falla', async ({ page }) => {
    await enterContract(page, 'rooftop');
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setGod(true);
      q.teleport(-16, 3.84, -12, 0);
      q.step(8, {});
      q.killEnemy('m-roofB');
      q.killEnemy('m-roofC');
      q.step(5, {});
      q.teleport(4, 7.68, -14, 0);
      q.step(8, {});
      q.killEnemy('judge');
      q.step(5, {});
    });
    const m = await page.evaluate(() => window.__EXCOM__!.mission()!);
    expect(m.kind).toBe('escape');
    await page.evaluate(() => window.__EXCOM__!.step(46 * 60, {}));
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('results');
    const out = await page.evaluate(() => window.__EXCOM__!.outcome()!);
    expect(out.success).toBe(false);
    expect(out.failReason).toContain('tiempo');
  });
});
