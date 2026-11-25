import { expect, type Page, test } from '@playwright/test';
import { collectErrors, LUMINANCE_MIN, openGame, shotPath } from './helpers';

/**
 * Fase 4 · Contratos completables de inicio a fin con el guion real de misión:
 * objetivos en orden, checkpoints, civiles, alarma, refuerzos, marcadores y resultados.
 */
type MissionId = 'practice' | 'nightclub' | 'docks' | 'rooftop' | 'gauntlet';

async function enterContract(page: Page, id: MissionId): Promise<void> {
  await openGame(page);
  await page
    .getByRole('button', { name: /Nueva partida|Continuar/ })
    .first()
    .click();
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
    expect(start.civ).toHaveLength(14);
    expect(start.civ.every((c) => c.alive)).toBe(true);
    expect(start.enemies).toBe(13);
    await page.evaluate(() => window.__EXCOM__!.measureFps(0.3));
    const lumAlley = await page.evaluate(() => window.__EXCOM__!.luminance());
    expect(lumAlley).toBeGreaterThan(LUMINANCE_MIN);

    // Objetivo 1: entrar en el club → checkpoint "Pista".
    const o1 = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setGod(true);
      q.teleport(0, 0, 15.6, 0);
      q.step(8, {});
      return q.mission()!;
    });
    expect(o1.index).toBe(1);
    expect(o1.respawn.z).toBeCloseTo(16, 0);
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

    // El disparo alerta a los matones: suena la alarma y salen refuerzos de los camerinos.
    const alarm = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      for (let i = 0; i < 40 && !q.mission()!.alarmSounded; i++) q.step(15, {});
      return { m: q.mission()!, alarmEnemies: q.enemies().filter((e) => e.id.startsWith('alarm-')).length };
    });
    expect(alarm.m.alarmSounded).toBe(true);
    expect(alarm.alarmEnemies).toBe(3);

    // Objetivo 2: la lista de invitados, en el despacho → gente en las galerías.
    const o2 = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.teleport(-24.4, 0, 22.4, Math.PI / 2);
      q.setLook(Math.PI / 2, -0.2);
      q.step(8, {});
      const prompt = q.prompt();
      q.hold('interact', true);
      q.step(100, {});
      q.hold('interact', false);
      q.step(4, {});
      return { prompt, m: q.mission()!, gallery: q.enemies().filter((e) => e.id.startsWith('g-') && e.alive).length };
    });
    expect(o2.prompt).toContain('lista de invitados');
    expect(o2.m.index).toBe(2);
    expect(o2.m.objective).toContain('VIP');
    expect(o2.gallery).toBe(3);
    // Objetivo 3: subir al VIP → checkpoint. Objetivo 4: Vance.
    const o3 = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.teleport(0, 3.2, -8.6, 0);
      q.step(8, {});
      return q.mission()!;
    });
    expect(o3.index).toBe(3);
    expect(o3.objective).toContain('Vance');
    expect(o3.beacon).not.toBeNull();
    const o4 = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.runDebug('killAll');
      q.step(5, {});
      return { m: q.mission()!, reinforce: q.enemies().filter((e) => e.id.startsWith('r-') && e.alive).length };
    });
    expect(o4.m.index).toBe(4);
    expect(o4.m.objective).toContain('muelle de carga');
    expect(o4.reinforce).toBe(4);

    // Objetivos 5 y 6: el muelle de carga, y aguantar hasta que arranque el coche.
    const o5 = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.teleport(24, 0, -18.4, 0);
      q.step(8, {});
      return { m: q.mission()!, last: q.enemies().filter((e) => e.id.startsWith('k-') && e.alive).length, hud: q.hud().objective };
    });
    expect(o5.m.index).toBe(5);
    expect(o5.m.respawn.z).toBeCloseTo(-18, 0);
    expect(o5.last).toBe(4);
    expect(o5.hud).toMatch(/\d+ s/);
    const o6 = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.step(31 * 60, {});
      return q.mission()!;
    });
    expect(o6.index).toBe(6);

    // Objetivo 7: el coche → resultados con rango y recompensa.
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.teleport(27, 0, -31.4, 0);
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
    // Panel de alarma: interacción mantenida 2 s (antes, los dos guardias de la entrada caen en silencio).
    const panel = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setGod(true);
      q.killEnemy('e-door');
      q.killEnemy('e-lobby');
      q.teleport(5.2, 0, 20.6, -Math.PI / 2);
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
      q.teleport(0, 0, 15.6, 0);
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
        expect(p.z).toBeCloseTo(16, 0);
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

  test('Muelle 9: cargas con interacción mantenida, radio, bodega, aguantar hasta el bote y resultados', async ({ page }) => {
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
    const plant = async (x: number, z: number, px: number, pz: number, y = 0): Promise<{ index: number; prompt: string }> =>
      page.evaluate(
        ([cx, cz, ox, oz, oy]) => {
          const q = window.__EXCOM__!;
          q.setGod(true);
          const yaw = Math.atan2(-(cx! - ox!), -(cz! - oz!));
          q.teleport(ox!, oy!, oz!, yaw);
          q.setLook(yaw, -0.2);
          q.step(8, {});
          const prompt = q.prompt();
          q.hold('interact', true);
          q.step(160, {});
          q.hold('interact', false);
          q.step(4, {});
          return { index: q.mission()!.index, prompt };
        },
        [x, z, px, pz, y],
      );
    const alive = (prefix: string): Promise<number> =>
      page.evaluate((p) => window.__EXCOM__!.enemies().filter((e) => e.id.startsWith(p) && e.alive).length, prefix);
    const c1 = await plant(-35.5, -13.2, -35.5, -11.6);
    expect(c1.prompt).toContain('Colocar carga explosiva');
    expect(c1.index).toBe(0);
    const c2 = await plant(40, 25, 38.4, 25);
    expect(c2.index).toBe(1);
    const m1 = await page.evaluate(() => window.__EXCOM__!.mission()!);
    expect(m1.respawn.z).toBeCloseTo(8, 0);
    expect(await alive('w-'), 'la bodega aún está vacía').toBe(0);
    const radio = await plant(35, -9, 35, -7.2, 3.2);
    expect(radio.prompt).toContain('Cortar la radio');
    expect(radio.index).toBe(2);
    expect(await alive('w-')).toBe(6);
    expect(await alive('m-catwalk')).toBe(1);
    const c3 = await plant(-19, -50, -19, -48.4);
    expect(c3.index).toBe(2);
    const c4 = await plant(-36.6, -58.6, -35, -58.6, 3.84);
    expect(c4.index).toBe(3);
    const o3 = await page.evaluate(() => window.__EXCOM__!.mission()!);
    expect(o3.objective).toContain('embarcadero');
    expect(await alive('a-')).toBe(4);
    // El embarcadero: dos tandas de refuerzos hasta que llega el bote.
    const hold = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      const left = (p: string): number => q.enemies().filter((e) => e.id.startsWith(p) && e.alive).length;
      q.teleport(14, 0, -42, 0);
      q.step(8, {});
      const first = { index: q.mission()!.index, n: left('b-'), hud: q.hud().objective };
      q.step(31 * 60, {});
      const second = { index: q.mission()!.index, n: left('f-') };
      q.step(26 * 60, {});
      return { first, second, index: q.mission()!.index };
    });
    expect(hold.first.index).toBe(4);
    expect(hold.first.n).toBe(4);
    expect(hold.first.hud).toMatch(/\d+ s/);
    expect(hold.second.index).toBe(5);
    expect(hold.second.n).toBe(4);
    expect(hold.index).toBe(6);
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.teleport(11, 0, -57.6, 0);
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
    // Por la escalera de la terraza y por la de las oficinas hasta B, caminando (0,32 m por peldaño sin saltar).
    const climb = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      const walk = (x: number, y: number, z: number, yaw: number, steps: number): number => {
        q.teleport(x, y, z, yaw);
        q.setLook(yaw, -0.1);
        q.step(steps, { moveY: 1, sprint: true });
        return q.player()!.y;
      };
      q.setGod(true);
      return { terrace: walk(-30, 0, 6.4, 0, 150), offices: walk(36.4, 0, -11.8, 0, 100) };
    });
    expect(climb.terrace).toBeGreaterThan(3.7);
    expect(climb.offices).toBeGreaterThan(3.7);
    // Los ascensores: al bloquearlos llega gente a la segunda azotea.
    const o0 = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.teleport(23, 0, -8.4, 0);
      q.setLook(0, -0.1);
      q.step(8, {});
      const prompt = q.prompt();
      q.hold('interact', true);
      q.step(130, {});
      q.hold('interact', false);
      q.step(4, {});
      return { prompt, m: q.mission()!, roof: q.enemies().filter((e) => e.id.startsWith('b-') && e.alive).length };
    });
    expect(o0.prompt).toContain('Bloquear los ascensores');
    expect(o0.m.index).toBe(1);
    expect(o0.roof).toBe(5);
    const o1 = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.teleport(-13, 3.84, -12, 0);
      q.step(8, {});
      return q.mission()!;
    });
    expect(o1.index).toBe(2);
    expect(o1.objective).toContain('tiradores');
    // Los tres tiradores → llega la guardia del Juez; al helipuerto, por la rampa o por la escalera de la azotea este.
    const o2 = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      for (const id of ['m-roofB', 'm-roofC', 'm-tower']) q.killEnemy(id);
      q.step(5, {});
      const afterKill = q.mission()!.index;
      const guard = q.enemies().filter((e) => e.id.startsWith('c-') && e.alive).length;
      const walk = (x: number, z: number, yaw: number): number => {
        q.teleport(x, 3.84, z, yaw);
        q.setLook(yaw, -0.1);
        q.step(160, { moveY: 1, sprint: true });
        return q.player()!.y;
      };
      return { afterKill, guard, ramp: walk(-33, -44, -Math.PI / 2), stairs: walk(16, -17.6, 0) };
    });
    expect(o2.afterKill).toBe(3);
    expect(o2.guard).toBe(3);
    expect(o2.ramp).toBeGreaterThan(7.5);
    expect(o2.stairs).toBeGreaterThan(7.5);
    const o3 = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.teleport(10, 7.68, -27, 0);
      q.step(8, {});
      return q.mission()!;
    });
    expect(o3.index).toBe(4);
    expect(o3.kind).toBe('boss');
    await page.screenshot({ path: shotPath('fase4-torre-helipuerto') });
    // El Juez: a disparos de pistola a la cabeza; al cruzar el 50 % se arrodilla y llegan escoltas.
    const boss = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.press('weapon2');
      for (const e of q.enemies()) if (e.alive && e.id.startsWith('c-')) q.killEnemy(e.id);
      // De pie, el Juez no admite takedown (no hay remate gratis).
      const j0 = q.enemies().find((e) => e.id === 'judge')!;
      q.teleport(j0.x, 7.68, j0.z + 1.2, 0);
      q.setLook(0, -0.2);
      q.step(3, {});
      q.press('takedown');
      q.step(3, {});
      const j1 = q.enemies().find((e) => e.id === 'judge')!;
      const standingTakedown = j1.state === 'stunned' || !j1.alive;
      q.teleport(12, 7.68, -31, 0);
      q.step(20, { aim: true });
      let kneel = false;
      let finisher = false;
      let phaseSpawn = 0;
      for (let i = 0; i < 80; i++) {
        const j = q.enemies().find((e) => e.id === 'judge');
        if (!j || !j.alive) break;
        phaseSpawn = Math.max(phaseSpawn, q.enemies().filter((e) => e.id.startsWith('p1-') || e.id.startsWith('p2-')).length);
        if (j.state === 'stunned') {
          // Arrodillado: ahora sí, takedown de remate.
          kneel = true;
          q.teleport(j.x, 7.68, j.z + 1.2, 0);
          q.setLook(0, -0.2);
          q.step(2, {});
          q.press('takedown');
          q.step(90, {});
          finisher = !q.enemies().find((e) => e.id === 'judge')!.alive;
          continue;
        }
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
      return { kneel, finisher, standingTakedown, phaseSpawn, m: q.mission()!, judge: q.enemies().find((e) => e.id === 'judge')! };
    });
    expect(boss.standingTakedown).toBe(false);
    expect(boss.judge.alive).toBe(false);
    expect(boss.kneel).toBe(true);
    expect(boss.finisher).toBe(true);
    expect(boss.phaseSpawn).toBeGreaterThanOrEqual(2);
    expect(boss.m.index).toBe(5);
    expect(boss.m.kind).toBe('escape');
    expect(boss.m.escapeLeft).toBeGreaterThan(55);
    const hudObj = await page.evaluate(() => window.__EXCOM__!.hud().objective);
    expect(hudObj).toMatch(/\d+ s/);
    // Escape: refuerzos en A y la tirolina antes de que acabe el tiempo.
    const esc = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.step(120, {});
      const left = q.mission()!.escapeLeft;
      q.teleport(37, 0, 22.4, Math.PI);
      q.step(8, {});
      return { left, escapers: q.enemies().filter((e) => e.id.startsWith('esc-')).length };
    });
    expect(esc.escapers).toBe(5);
    expect(esc.left).toBeLessThan(59);
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
      q.teleport(23, 0, -8.4, 0);
      q.setLook(0, -0.1);
      q.step(8, {});
      q.hold('interact', true);
      q.step(130, {});
      q.hold('interact', false);
      q.teleport(-13, 3.84, -12, 0);
      q.step(8, {});
      for (const id of ['m-roofB', 'm-roofC', 'm-tower']) q.killEnemy(id);
      q.step(5, {});
      for (const e of q.enemies()) if (e.alive && e.id.startsWith('c-')) q.killEnemy(e.id);
      q.teleport(10, 7.68, -27, 0);
      q.step(8, {});
      q.killEnemy('judge');
      q.step(5, {});
    });
    const m = await page.evaluate(() => window.__EXCOM__!.mission()!);
    expect(m.kind).toBe('escape');
    await page.evaluate(() => window.__EXCOM__!.step(61 * 60, {}));
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('results');
    const out = await page.evaluate(() => window.__EXCOM__!.outcome()!);
    expect(out.success).toBe(false);
    expect(out.failReason).toContain('tiempo');
  });

  test('Torre Meridian: morir contra el Juez reinicia el combate (fases y refuerzos)', async ({ page }) => {
    await enterContract(page, 'rooftop');
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setGod(true);
      q.teleport(23, 0, -8.4, 0);
      q.setLook(0, -0.1);
      q.step(8, {});
      q.hold('interact', true);
      q.step(130, {});
      q.hold('interact', false);
      q.teleport(-13, 3.84, -12, 0);
      q.step(8, {});
      for (const id of ['m-roofB', 'm-roofC', 'm-tower']) q.killEnemy(id);
      q.step(5, {});
      for (const e of q.enemies()) if (e.alive && e.id.startsWith('c-')) q.killEnemy(e.id);
      q.teleport(10, 7.68, -27, 0);
      q.step(8, {});
      q.press('weapon2');
      q.teleport(12, 7.68, -31, 0);
      q.step(20, { aim: true });
    });
    // Disparos a la cabeza sin rematarlo: cuenta las veces que se arrodilla hasta dejarlo casi sin salud.
    const fight = (): Promise<{ kneels: number; adds: number }> =>
      page.evaluate(() => {
        const q = window.__EXCOM__!;
        let kneels = 0;
        let wasStunned = false;
        for (let i = 0; i < 160; i++) {
          const j = q.enemies().find((e) => e.id === 'judge')!;
          const stunned = j.state === 'stunned';
          if (stunned && !wasStunned) kneels++;
          wasStunned = stunned;
          if (stunned) {
            q.step(30, {});
            continue;
          }
          if (!j.alive || j.health <= 20) break;
          const c = q.combat()!;
          if (c.mag === 0 && !c.reloading) q.press('reload');
          q.aimAt(j.x, j.headY, j.z);
          q.step(1, { aim: true });
          q.aimAt(j.x, j.headY, j.z);
          if (!q.combat()!.blocked) q.press('fire');
          q.step(12, { aim: true });
        }
        return { kneels, adds: q.enemies().filter((e) => e.id.startsWith('p1-') || e.id.startsWith('p2-')).length };
      });
    const first = await fight();
    expect(first.kneels).toBe(2);
    expect(first.adds).toBe(6);
    // Sin modo dios el jugador cae, gasta un marcador y reaparece en el helipuerto.
    const back = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setGod(false);
      for (let i = 0; i < 400 && !q.combat()!.dead; i++) q.step(30, {});
      const died = q.combat()!.dead;
      q.respawn();
      q.step(4, {});
      q.setGod(true);
      q.teleport(12, 7.68, -31, 0);
      q.step(20, { aim: true });
      const all = q.enemies();
      return {
        died,
        state: q.state(),
        markers: q.mission()!.markersUsed,
        health: all.find((e) => e.id === 'judge')!.health,
        adds: all.filter((e) => e.id.startsWith('p1-') || e.id.startsWith('p2-')).length,
      };
    });
    expect(back.died).toBe(true);
    expect(back.state).toBe('playing');
    expect(back.markers).toBe(1);
    expect(back.health).toBe(420);
    expect(back.adds).toBe(0);
    // El combate empieza de nuevo: vuelve a arrodillarse en cada umbral y los refuerzos regresan.
    const second = await fight();
    expect(second.kneels).toBe(2);
    expect(second.adds).toBe(6);
  });
});

test.describe('Fase 4 · Gauntlet', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?qa=1');
    await page.evaluate(() => window.localStorage.clear());
  });

  test('Gauntlet: oleadas crecientes en el hub hostil, una vida, top 10 y monedas', async ({ page }) => {
    const errors = collectErrors(page);
    await enterContract(page, 'gauntlet');
    const start = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      return { m: q.mission()!, hud: q.hud(), prompt: q.prompt(), enemies: q.enemies().length };
    });
    expect(start.m.kind).toBe('waves');
    expect(start.m.markersTotal).toBe(1);
    expect(start.m.wave).toBe(0);
    expect(start.enemies).toBe(0);
    expect(start.hud.objective).toMatch(/Oleada 1 en \d s/);
    // Cerca de Charon no hay diálogo: el hub está en modo hostil.
    const noTalk = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setGod(true);
      q.teleport(0, 0, -9.3, 0);
      q.setLook(0, -0.1);
      q.step(12, {});
      q.resetInvariants();
      return q.prompt();
    });
    expect(noTalk).not.toContain('Charon');
    // Cinco oleadas: aparecen escalonadas por las entradas, crecen y mezclan tipos.
    const sizes: number[] = [];
    const types = new Set<string>();
    for (let w = 1; w <= 5; w++) {
      const r = await page.evaluate((wave) => {
        const q = window.__EXCOM__!;
        // Respiro de 5 s y aparición escalonada (0,5 s entre enemigos) hasta vaciar la cola.
        for (let i = 0; i < 80 && (q.mission()!.wave < wave || q.mission()!.wavePending > 0); i++) q.step(15, {});
        const list = q.enemies().filter((e) => e.id.startsWith(`g${wave}-`));
        const inv = q.invariants();
        q.runDebug('killAll');
        q.step(6, {});
        return { wave: q.mission()!.wave, cleared: q.mission()!.wavesCleared, n: list.length, types: list.map((e) => e.type), pen: inv.penetrations };
      }, w);
      expect(r.wave).toBe(w);
      expect(r.cleared).toBe(w);
      expect(r.pen).toBe(0);
      sizes.push(r.n);
      for (const t of r.types) types.add(t);
    }
    console.log(`[gauntlet] tamaños de oleada ${sizes.join(', ')} · tipos ${[...types].join(', ')}`);
    expect(sizes[0]).toBe(3);
    for (let i = 1; i < sizes.length; i++) expect(sizes[i]!).toBeGreaterThanOrEqual(sizes[i - 1]!);
    expect(types.has('heavy')).toBe(true);
    expect(types.has('marksman')).toBe(true);
    // Oleada 6 en curso: el jugador muere → fin del Gauntlet (una sola vida).
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      for (let i = 0; i < 40 && q.mission()!.wave < 6; i++) q.step(15, {});
      q.step(120, {});
      // Deja correr el bucle real antes de la captura.
      return q.measureFps(0.2);
    });
    await page.screenshot({ path: shotPath('fase4-gauntlet-oleada') });
    const lum = await page.evaluate(() => window.__EXCOM__!.luminance());
    console.log(`[gauntlet] luminancia ${lum.toFixed(3)}`);
    expect(lum).toBeGreaterThan(LUMINANCE_MIN);
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setGod(false);
      for (let i = 0; i < 200 && !q.combat()!.dead; i++) q.step(30, {});
    });
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('results');
    const out = await page.evaluate(() => window.__EXCOM__!.outcome()!);
    expect(out.mission).toBe('gauntlet');
    expect(out.gauntlet).toEqual({ waves: 5, position: 1 });
    expect(out.achievements).toContain('gauntlet.w5');
    expect(out.achievements).not.toContain('global.first');
    // 5 oleadas → 2 monedas + logro "Oleada 5" (2).
    expect(out.coins).toBe(4);
    await expect(page.locator('.brief-kicker')).toHaveText('GAUNTLET TERMINADO');
    await expect(page.locator('.gauntlet-waves')).toHaveText('5');
    await expect(page.locator('.gauntlet-top li.me')).toContainText('5 oleadas');
    await page.screenshot({ path: shotPath('fase4-gauntlet-resultados') });
    const prof = await page.evaluate(() => window.__EXCOM__!.profile());
    expect(prof.gauntlet[0]?.waves).toBe(5);
    // Volver al Continental: hub limpio y neutral otra vez.
    await page.getByRole('button', { name: 'Volver al Continental' }).click();
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hub');
    const hub = await page.evaluate(() => ({
      enemies: window.__EXCOM__!.enemies().length,
      zone: window.__EXCOM__!.hud().zone,
      mission: window.__EXCOM__!.mission(),
    }));
    expect(hub.enemies).toBe(0);
    expect(hub.zone).toContain('ZONA NEUTRAL');
    expect(hub.mission).toBeNull();
    expect(errors).toEqual([]);
  });
});
