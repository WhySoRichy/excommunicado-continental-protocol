import { expect, type Page, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

/** Capturas del README y fotogramas del GIF de juego (ver scripts/make-gif.mjs). */
const OUT = join(process.cwd(), 'docs', 'media');
const FRAMES = join(OUT, 'frames');
const GIF_FRAMES = 84;
const STEPS_PER_FRAME = 5; // 12 FPS de tiempo de juego

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
  await page.getByRole('button', { name: /Nueva partida|Continuar/ }).first().click();
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

  // Ajustes (teclas) desde la pausa.
  await page.evaluate(() => window.__EXCOM__!.setManual(false));
  await page.keyboard.press('Escape');
  await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('paused');
  await page.getByRole('button', { name: 'Ajustes' }).click();
  await page.getByRole('tab', { name: 'Teclas' }).click();
  await shot(page, '07-ajustes');
});

test('fotogramas del GIF: el simulacro a tiros', async ({ page }) => {
  mkdirSync(FRAMES, { recursive: true });
  await ready(page);
  await page.getByRole('button', { name: /Nueva partida|Continuar/ }).first().click();
  await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hub');
  await contract(page, 'practice');
  await page.evaluate(() => {
    const q = window.__EXCOM__!;
    q.teleport(4, 0, -11, 0);
    q.step(30, {});
  });
  await settle(page, 0.6);
  for (let i = 0; i < GIF_FRAMES; i++) {
    await page.evaluate((n) => {
      const q = window.__EXCOM__!;
      const enemies = q.enemies().filter((e) => e.alive);
      if (enemies.length === 0) {
        q.step(n, {});
        return;
      }
      const me = q.player()!;
      enemies.sort((a, b) => Math.hypot(a.x - me.x, a.z - me.z) - Math.hypot(b.x - me.x, b.z - me.z));
      const t = enemies[0]!;
      const c = q.combat()!;
      if (c.mag === 0 && !c.reloading) q.press('reload');
      q.aimAt(t.x, t.headY - 0.05, t.z);
      q.step(1, { aim: true });
      q.aimAt(t.x, t.headY - 0.05, t.z);
      const now = q.combat()!;
      if (now.aimOverEnemy && !now.blocked) {
        q.press('fire');
        q.step(n - 1, { aim: true });
      } else {
        const path = q.pathTo(t.x, t.y, t.z);
        const wp = path[1] ?? path[0];
        if (wp) q.setLook(Math.atan2(-(wp.x - me.x), -(wp.z - me.z)), -0.1);
        q.step(n - 1, { moveY: 1, sprint: true });
      }
    }, STEPS_PER_FRAME);
    await settle(page, 0.05);
    await page.screenshot({ path: join(FRAMES, `frame-${String(i).padStart(3, '0')}.png`) });
  }
});
