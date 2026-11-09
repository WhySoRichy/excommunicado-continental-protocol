import { expect, type Page, test } from '@playwright/test';
import { collectErrors, LUMINANCE_MIN, openGame, shotPath } from './helpers';

/**
 * Fase 2 · Gate de combate en el juego real: 1vN, IA sin atascos, feedback claro,
 * takedown, recarga perfecta, Foco y fuzz de estados de combate (checklist ítem 7).
 */

async function enterPractice(page: Page, drill: boolean): Promise<void> {
  await openGame(page);
  await page.evaluate((d) => window.__EXCOM__!.playLevel('practice', d), drill);
  await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('playing');
  await page.evaluate(() => {
    const q = window.__EXCOM__!;
    q.setManual(true);
    q.resetInvariants();
  });
}

test.describe('Fase 2 · combate', () => {
  test('1vN: el bot limpia el simulacro (6 enemigos) usando el pipeline real de disparo', async ({ page }) => {
    const errors = collectErrors(page);
    await enterPractice(page, true);
    const r = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setGod(true);
      q.teleport(4, 0, -11, 0);
      q.step(30, { crouch: false });
      let t = 0;
      while (t < 150 * 60) {
        const enemies = q.enemies().filter((e) => e.alive);
        if (enemies.length === 0) break;
        const me = q.player()!;
        enemies.sort((a, b) => Math.hypot(a.x - me.x, a.z - me.z) - Math.hypot(b.x - me.x, b.z - me.z));
        const tgt = enemies[0]!;
        const c = q.combat()!;
        if (c.mag === 0 && !c.reloading) q.press('reload');
        const dist = Math.hypot(tgt.x - me.x, tgt.z - me.z);
        // ¿Hay tiro limpio? (la mira cae sobre el enemigo y la boca del arma no está tapada)
        q.aimAt(tgt.x, tgt.headY - 0.05, tgt.z);
        q.step(1, { aim: true });
        q.aimAt(tgt.x, tgt.headY - 0.05, tgt.z);
        const now = q.combat()!;
        if (now.aimOverEnemy && !now.blocked && dist < 30) {
          q.press('fire');
          q.step(5, { aim: true });
        } else {
          // Sin tiro: se acerca por la ruta A* (como haría un jugador rodeando la cobertura).
          const path = q.pathTo(tgt.x, tgt.y, tgt.z);
          const wp = path[1] ?? path[0];
          if (wp) {
            q.setLook(Math.atan2(-(wp.x - me.x), -(wp.z - me.z)), -0.1);
            q.step(12, { moveY: 1 });
          } else q.step(5, {});
        }
        t += 6;
      }
      q.releaseAll();
      return { t, me: q.player()!, combat: q.combat()!, enemies: q.enemies(), ai: q.aiStats()!, inv: q.invariants(), bad: q.combatInconsistencies() };
    });
    console.log(
      `[1vN] t=${(r.t / 60).toFixed(1)} s jugador=(${r.me.x.toFixed(1)}, ${r.me.y.toFixed(1)}, ${r.me.z.toFixed(1)}) bloqueada=${r.combat.blocked} vivos=${JSON.stringify(
        r.enemies.filter((e) => e.alive).map((e) => `${e.type}@${e.x.toFixed(1)},${e.y.toFixed(1)},${e.z.toFixed(1)}:${e.state}:${Math.round(e.health)}`),
      )}`,
    );
    expect(r.enemies.filter((e) => e.alive)).toEqual([]);
    expect(r.combat.stats.kills).toBe(6);
    expect(r.combat.score).toBeGreaterThan(0);
    expect(r.combat.stats.shotsHit).toBeGreaterThan(5);
    expect(r.ai.maxNoProgress).toBeLessThan(3);
    expect(r.bad).toBe(0);
    expect(r.inv.penetrations).toBe(0);
    expect(r.inv.cameraInside).toBe(0);
    console.log(`[1vN] ${(r.t / 60).toFixed(1)} s simulados, disparos ${r.combat.stats.shotsFired}, impactos ${r.combat.stats.shotsHit}, headshots ${r.combat.stats.headshots}, puntos ${r.combat.score}`);
    expect(errors).toEqual([]);
  });

  test('IA sin atascos: 6 enemigos maniobran 60 s alrededor del jugador (god mode)', async ({ page }) => {
    await enterPractice(page, true);
    const r = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setGod(true);
      const start = q.enemies().map((e) => ({ id: e.id, x: e.x, z: e.z }));
      // El jugador se mueve por el patio y dispara al aire de vez en cuando (los enemigos lo persiguen).
      const route = [
        [4, -11],
        [-6, -12],
        [-6, -20],
        [6, -24],
        [12, -16],
        [4, -11],
      ];
      for (let lap = 0; lap < 2; lap++) {
        for (const [x, z] of route) {
          for (let k = 0; k < 150; k++) {
            const me = q.player()!;
            const dx = x! - me.x;
            const dz = z! - me.z;
            if (Math.hypot(dx, dz) < 0.8) break;
            q.setLook(Math.atan2(-dx, -dz), -0.1);
            if (k % 40 === 0) q.press('fire');
            q.step(2, { moveY: 1 });
          }
        }
      }
      const moved = q.enemies().filter((e) => {
        const s = start.find((p) => p.id === e.id)!;
        return Math.hypot(e.x - s.x, e.z - s.z) > 2;
      }).length;
      return { ai: q.aiStats()!, moved, states: q.enemies().map((e) => e.state) };
    });
    console.log(`[IA] estados finales ${JSON.stringify(r.ai.states)} atascos detectados ${r.ai.stuckEvents} máx sin avanzar ${r.ai.maxNoProgress.toFixed(2)} s`);
    expect(r.ai.maxNoProgress).toBeLessThan(3);
    // Los que pueden moverse (no el tirador fijo) se movieron.
    expect(r.moved).toBeGreaterThanOrEqual(4);
    expect(r.states.some((s) => s === 'combat' || s === 'cover' || s === 'flank' || s === 'search')).toBe(true);
  });

  test('feedback claro: hit marker cuerpo/cabeza/baja, daño direccional y causa de muerte', async ({ page }) => {
    const errors = collectErrors(page);
    await enterPractice(page, false);
    // Enemigo quieto a 8 m, sin alertar.
    const id = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.teleport(0, 0, 4, 0);
      q.step(5, {});
      return q.spawnEnemy('thug', 0, 0, -4, false);
    });
    expect(id).not.toBeNull();
    // Disparo al cuerpo → marcador "body" (el HUD se repinta en el mismo paso para leerlo sin carreras).
    const body = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.press('weapon2');
      q.step(20, { aim: true });
      const e = q.enemies().find((x) => x.alive)!;
      q.aimAt(e.x, e.y + 1.1, e.z);
      q.step(1, { aim: true });
      q.aimAt(e.x, e.y + 1.1, e.z);
      q.press('fire');
      q.step(1, { aim: true });
      return { hp: q.enemies().find((x) => x.alive)?.health ?? 0, hits: q.combat()!.stats.shotsHit, hud: q.hud() };
    });
    expect(body.hits).toBe(1);
    expect(body.hp).toBeLessThan(80);
    expect(body.hud.hitmark).toContain('body');
    // Headshot → baja de un tiro y marcador de baja + feed "Headshot".
    const head = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.step(30, { aim: true });
      const e = q.enemies().find((x) => x.alive)!;
      q.aimAt(e.x, e.headY, e.z);
      q.step(1, { aim: true });
      q.aimAt(e.x, e.headY, e.z);
      q.press('fire');
      q.step(1, { aim: true });
      return { alive: q.enemies().filter((x) => x.alive).length, kills: q.combat()!.stats.headshots, hud: q.hud() };
    });
    expect(head.alive).toBe(0);
    expect(head.kills).toBe(1);
    expect(head.hud.hitmark).toContain('kill');
    await expect(page.locator('#hud .feed')).toContainText('Headshot');
    await page.screenshot({ path: shotPath('fase2-headshot-feed') });

    // Daño al jugador: indicador direccional y bajada de integridad.
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.teleport(0, 0, 4, 0);
      q.spawnEnemy('escort', 6, 0, 0, true);
      q.step(240, {});
    });
    const hurt = await page.evaluate(() => window.__EXCOM__!.combat()!);
    expect(hurt.armor + hurt.health).toBeLessThan(160);
    const arcs = await page.locator('#hud .dmg-arc').evaluateAll((els) => els.map((e) => Number((e as HTMLElement).style.opacity || '0')));
    expect(Math.max(...arcs)).toBeGreaterThan(0);
    await page.screenshot({ path: shotPath('fase2-dano-direccional') });

    // Muerte → pantalla con causa explicada y cómo reaparecer.
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      for (let i = 0; i < 3; i++) q.spawnEnemy('escort', -5 + i * 5, 0, -2, true);
      for (let i = 0; i < 60 && !q.combat()!.dead; i++) q.step(30, {});
    });
    expect(await page.evaluate(() => window.__EXCOM__!.combat()!.dead)).toBe(true);
    await expect(page.locator('#hud .death')).toBeVisible();
    await expect(page.locator('#hud .death-cause')).toContainText('Te disparó un');
    await page.screenshot({ path: shotPath('fase2-muerte-causa') });
    await page.evaluate(() => window.__EXCOM__!.respawn());
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('playing');
    expect(await page.evaluate(() => window.__EXCOM__!.combat()!.health)).toBe(100);
    expect(errors).toEqual([]);
  });

  test('takedown con doble tap, recarga perfecta y Foco', async ({ page }) => {
    await enterPractice(page, false);
    const td = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.teleport(0, 0, 4, 0);
      q.setLook(0, -0.1);
      q.step(5, {});
      q.spawnEnemy('heavy', 0, 0, 2.7, false);
      q.step(3, {});
      const target = q.combat()!.takedownTarget;
      q.press('takedown');
      q.step(70, {});
      return { target, c: q.combat()!, alive: q.enemies().filter((e) => e.alive).length };
    });
    expect(td.target).not.toBeNull();
    expect(td.alive).toBe(0);
    expect(td.c.stats.takedowns).toBe(1);
    expect(td.c.takedown).toBe(false);
    await expect(page.locator('#hud .feed')).toContainText('Takedown');
    await expect(page.locator('#hud .feed')).toContainText('Doble tap');

    const pr = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.press('weapon2');
      q.step(20, {});
      q.press('fire');
      q.step(25, {});
      q.press('reload');
      q.step(1, {});
      // Ventana perfecta de la pistola: 45-62 % de 1,25 s → ~0,66 s.
      q.step(Math.round(0.66 * 60) - 1, {});
      q.press('reload');
      q.step(1, {});
      return q.combat()!;
    });
    expect(pr.stats.perfectReloads).toBe(1);
    expect(pr.reloading).toBe(false);
    await expect(page.locator('#hud .feed')).toContainText('Recarga perfecta');

    const fc = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setManual(false);
      q.runDebug('slowmo');
      return q.combat()!;
    });
    expect(fc.focusActive).toBe(true);
    const a = await page.evaluate(() => window.__EXCOM__!.info().steps);
    await page.evaluate(() => window.__EXCOM__!.measureFps(1));
    const b = await page.evaluate(() => window.__EXCOM__!.info().steps);
    // Cámara lenta ×0,35: en 1 s real hay ~21 pasos (60 × 0,35), no 60.
    expect(b - a).toBeLessThan(35);
    expect(b - a).toBeGreaterThan(8);
  });

  test('checklist ítem 7: 40 s de acciones de combate al azar + muerte a mitad de acción: sin estados inconsistentes', async ({ page }) => {
    await enterPractice(page, true);
    const r = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      let seed = 1234;
      const rnd = (): number => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      };
      // Sorteo ponderado: 50 % disparar, 15 % recargar, 10 % cambiar de arma, 25 % el resto.
      type A = Parameters<typeof q.press>[0];
      const weighted: Array<[A, number]> = [
        ['fire', 50],
        ['reload', 15],
        ['weapon1', 3],
        ['weapon2', 4],
        ['weapon3', 1],
        ['weaponNext', 2],
        ['takedown', 6],
        ['focus', 4],
        ['dodge', 6],
        ['jump', 5],
        ['crouch', 4],
      ];
      const total = weighted.reduce((s, [, w]) => s + w, 0);
      const pick = (): A => {
        let x = rnd() * total;
        for (const [a, w] of weighted) {
          x -= w;
          if (x <= 0) return a;
        }
        return 'fire';
      };
      let deaths = 0;
      for (let t = 0; t < 40 * 60; t += 4) {
        if (q.state() === 'dead') {
          deaths++;
          q.respawn();
        }
        // Mira hacia el patio la mayor parte del tiempo (dispara a enemigos reales).
        const enemies = q.enemies().filter((e) => e.alive);
        if (enemies.length && rnd() < 0.6) {
          const e = enemies[Math.floor(rnd() * enemies.length)]!;
          q.aimAt(e.x, e.headY - rnd() * 0.8, e.z);
        } else q.setLook(rnd() * Math.PI * 2, -0.5 + rnd());
        for (let k = 0; k < 2; k++) if (rnd() < 0.45) q.press(pick());
        q.step(4, { moveX: rnd() * 2 - 1, moveY: rnd() * 2 - 1, sprint: rnd() < 0.3, aim: rnd() < 0.6 });
      }
      return { deaths, bad: q.combatInconsistencies(), inv: q.invariants(), c: q.combat()! };
    });
    console.log(`[fuzz combate] muertes ${r.deaths}, inconsistencias ${r.bad}, disparos ${r.c.stats.shotsFired}, cambios de arma ${r.c.stats.switches}`);
    expect(r.bad).toBe(0);
    expect(r.inv.penetrations).toBe(0);
    expect(r.inv.nanResets).toBe(0);
    expect(r.c.stats.switches).toBeGreaterThan(10);
    expect(r.c.stats.shotsFired).toBeGreaterThan(30);
    expect(r.c.stats.reloads).toBeGreaterThan(3);
  });

  test('el campo de práctica se ve bien (luminancia) con enemigos y HUD de combate', async ({ page }) => {
    await enterPractice(page, true);
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setGod(true);
      q.teleport(4, 0, -9, 0);
      q.setLook(0.15, -0.08);
      q.step(90, {});
    });
    await page.evaluate(() => window.__EXCOM__!.measureFps(0.3));
    const lum = await page.evaluate(() => window.__EXCOM__!.luminance());
    console.log(`[práctica] luminancia ${lum.toFixed(3)}`);
    expect(lum).toBeGreaterThan(LUMINANCE_MIN);
    await page.screenshot({ path: shotPath('fase2-practica-combate') });
  });
});
