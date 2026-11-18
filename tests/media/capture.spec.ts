import { expect, type Page, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

/** Capturas del README y fotogramas del GIF de juego (ver scripts/make-gif.mjs). */
const OUT = join(process.cwd(), 'docs', 'media');
const FRAMES = join(OUT, 'frames');
const GIF_FRAMES = 112;
/** 12 fotogramas por segundo de juego; el GIF los reproduce a 10 (algo más lento que el tiempo real). */
const STEPS_PER_FRAME = 5;
/** Puntería humana: fracción del giro pendiente por paso, espera antes del primer tiro y pausa entre tiros (pasos de 1/60 s). */
const AIM_EASE = 0.16;
const REACTION_STEPS = 10;
const SHOT_GAP_STEPS = 24;

async function ready(page: Page): Promise<void> {
  await page.goto('/?qa=1');
  await page.evaluate(() => window.localStorage.clear());
  await page.goto('/?qa=1');
  await page.waitForFunction(() => window.__EXCOM__?.ready === true, null, { timeout: 90_000 });
  await page.evaluate(() => window.__EXCOM__!.setSettings({ hints: false }));
}

async function settle(page: Page, s = 0.6): Promise<void> {
  await page.evaluate((sec) => window.__EXCOM__!.measureFps(sec), s);
}

async function shot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: join(OUT, `${name}.png`) });
}

async function contract(page: Page, id: 'practice' | 'nightclub' | 'docks' | 'rooftop'): Promise<void> {
  await page.evaluate((m) => window.__EXCOM__!.startContract(m), id);
  await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('briefing');
  await page.evaluate(() => {
    const q = window.__EXCOM__!;
    q.beginContract();
    q.setManual(true);
    q.setGod(true);
    q.skipTutorial();
  });
}

test('capturas del README', async ({ page }) => {
  mkdirSync(OUT, { recursive: true });
  await ready(page);
  await settle(page, 2.5);
  await shot(page, '01-titulo');
  await page
    .getByRole('button', { name: /Nueva partida|Continuar/ })
    .first()
    .click();
  await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hub');
  await page.evaluate(() => {
    const q = window.__EXCOM__!;
    q.setManual(true);
    q.teleport(-2.5, 0, -6.5, -0.35);
    q.setLook(-0.35, -0.05);
    q.step(10, {});
  });
  await settle(page, 1);
  await shot(page, '02-continental');

  await contract(page, 'nightclub');
  await page.evaluate(() => {
    const q = window.__EXCOM__!;
    q.teleport(-3, 0, 12, 0.25);
    q.setLook(0.25, 0.02);
    q.step(10, {});
  });
  await settle(page, 1);
  await shot(page, '03-club-kairos');
  await page.evaluate(() => window.__EXCOM__!.hold('intel', true));
  await settle(page, 0.4);
  await shot(page, '06-intel');
  await page.evaluate(() => window.__EXCOM__!.hold('intel', false));

  await contract(page, 'docks');
  await page.evaluate(() => {
    const q = window.__EXCOM__!;
    q.teleport(2, 0, 22, 0.15);
    q.setLook(0.15, 0.0);
    q.step(10, {});
  });
  await settle(page, 1);
  await shot(page, '04-muelle-9');

  await contract(page, 'rooftop');
  await page.evaluate(() => {
    const q = window.__EXCOM__!;
    q.teleport(6, 7.68, -14, -0.35);
    q.setLook(-0.35, 0.0);
    q.step(10, {});
  });
  await settle(page, 1);
  await shot(page, '05-torre-meridian');
});

test('fotogramas del GIF: el simulacro a tiros', async ({ page }) => {
  mkdirSync(FRAMES, { recursive: true });
  await ready(page);
  await page
    .getByRole('button', { name: /Nueva partida|Continuar/ })
    .first()
    .click();
  await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hub');
  await contract(page, 'practice');
  await page.evaluate(() => {
    const q = window.__EXCOM__!;
    q.teleport(4, 0, -11, 0);
    q.step(30, {});
  });
  await settle(page, 0.6);
  for (let i = 0; i < GIF_FRAMES; i++) {
    // Paso a paso: la cámara gira con suavidad hacia el objetivo (sin saltos), espera un instante al
    // tenerlo en la mira y no dispara más de un tiro cada 0,4 s. Si no lo ve, avanza por el camino sin dejar de mirarlo.
    await page.evaluate(
      ([n, ease, reaction, gap]) => {
        const q = window.__EXCOM__!;
        const w = window as unknown as { __gifAim?: { target: string; onTarget: number; hidden: number; sinceShot: number } };
        const st = (w.__gifAim ??= { target: '', onTarget: 0, hidden: 0, sinceShot: 99 });
        for (let k = 0; k < n!; k++) {
          st.sinceShot++;
          const enemies = q.enemies().filter((e) => e.alive);
          if (enemies.length === 0) {
            q.step(1, {});
            continue;
          }
          const me = q.player()!;
          enemies.sort((a, b) => Math.hypot(a.x - me.x, a.z - me.z) - Math.hypot(b.x - me.x, b.z - me.z));
          const t = enemies[0]!;
          if (t.id !== st.target) {
            st.target = t.id;
            st.onTarget = 0;
            st.hidden = 0;
          }
          const c = q.combat()!;
          if (c.mag === 0 && !c.reloading) q.press('reload');
          const cam = q.camera();
          const dx = t.x - cam.x;
          const dz = t.z - cam.z;
          const wantYaw = Math.atan2(-dx, -dz);
          const wantPitch = Math.atan2(t.headY - 0.05 - cam.y, Math.hypot(dx, dz));
          const dYaw = Math.atan2(Math.sin(wantYaw - cam.yaw), Math.cos(wantYaw - cam.yaw));
          const dPitch = wantPitch - cam.pitch;
          const yaw = cam.yaw + dYaw * ease!;
          q.setLook(yaw, cam.pitch + dPitch * ease!);
          const settled = Math.abs(dYaw) < 0.05 && Math.abs(dPitch) < 0.05;
          if (settled && c.aimOverEnemy && !c.blocked) {
            st.onTarget++;
            st.hidden = 0;
          } else {
            st.onTarget = 0;
            if (settled) st.hidden++;
          }
          if (st.hidden > 20) {
            // Sin línea de tiro: se desplaza hacia el siguiente punto del camino mirando al objetivo.
            const path = q.pathTo(t.x, t.y, t.z);
            const wp = path[1] ?? path[0];
            if (wp) {
              const mx = wp.x - me.x;
              const mz = wp.z - me.z;
              const l = Math.hypot(mx, mz) || 1;
              const moveY = (mx * -Math.sin(yaw) + mz * -Math.cos(yaw)) / l;
              const moveX = (mx * Math.cos(yaw) + mz * -Math.sin(yaw)) / l;
              q.step(1, { moveX, moveY });
              continue;
            }
          }
          if (st.onTarget >= reaction! && st.sinceShot >= gap!) {
            q.press('fire');
            st.sinceShot = 0;
          }
          q.step(1, { aim: true });
        }
      },
      [STEPS_PER_FRAME, AIM_EASE, REACTION_STEPS, SHOT_GAP_STEPS],
    );
    await settle(page, 0.05);
    await page.screenshot({ path: join(FRAMES, `frame-${String(i).padStart(3, '0')}.png`) });
  }
});
