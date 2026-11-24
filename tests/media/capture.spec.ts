import { expect, type Page, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

/** Imágenes del README (JPEG, sin interfaz) y fotogramas de la animación de juego (ver scripts/make-clip.mjs). */
const OUT = join(process.cwd(), 'docs', 'media');
const FRAMES = join(OUT, 'frames');
const CLIP_FRAMES = 96;
/** 15 fotogramas por segundo de juego. */
const STEPS_PER_FRAME = 4;
const CLIP_SIZE = { width: 1280, height: 720 };
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
  await page.screenshot({ path: join(OUT, `${name}.jpg`), type: 'jpeg', quality: 80 });
}

/** Sin interfaz: solo lo que se ve en el juego. */
async function bare(page: Page, on: boolean): Promise<void> {
  await page.evaluate((v) => {
    const id = 'sin-interfaz';
    document.getElementById(id)?.remove();
    if (!v) return;
    const css = document.createElement('style');
    css.id = id;
    css.textContent = '#hud { visibility: hidden !important; }';
    document.head.append(css);
  }, on);
}

/** Coloca al jugador y la cámara, deja pasar unos pasos y hace la foto. */
async function scene(
  page: Page,
  name: string,
  o: { at: [number, number, number, number]; look: [number, number]; weapon?: string; steps?: number; move?: { moveY: number; sprint?: boolean } },
): Promise<void> {
  await page.evaluate((v) => {
    const q = window.__EXCOM__!;
    q.setManual(true);
    q.releaseAll();
    q.teleport(...v.at);
    q.setLook(...v.look);
    if (v.weapon) q.press(v.weapon as 'weapon1');
    q.step(v.steps ?? 60, v.move ?? {});
  }, o);
  await settle(page, 0.8);
  await shot(page, name);
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

test('imágenes del README', async ({ page }) => {
  mkdirSync(OUT, { recursive: true });
  await ready(page);
  await page
    .getByRole('button', { name: /Nueva partida|Continuar/ })
    .first()
    .click();
  await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hub');
  await bare(page, true);
  await scene(page, 'continental', { at: [2.4, 0, 2, 0.15], look: [0.12, -0.06], steps: 44, move: { moveY: 0.35 } });

  // Armería: con su interfaz.
  await bare(page, false);
  await page.evaluate(() => {
    const q = window.__EXCOM__!;
    q.setCoins(30);
    q.checkpoint('bar');
    q.step(4, {});
    q.interact();
  });
  for (let i = 0; i < 5 && (await page.evaluate(() => window.__EXCOM__!.menu())) === 'dialog'; i++)
    await page.evaluate(() => window.__EXCOM__!.advanceDialog());
  await expect.poll(() => page.evaluate(() => window.__EXCOM__!.menu())).toBe('shop');
  await settle(page, 1.2);
  await shot(page, 'armeria');
  await page.evaluate(() => window.__EXCOM__!.closeMenu());
  await bare(page, true);

  await contract(page, 'nightclub');
  await scene(page, 'club', { at: [-3, 0, 12, 0.25], look: [0.25, 0] });

  await contract(page, 'docks');
  await scene(page, 'muelle', { at: [2, 0, 22, 0.15], look: [0.15, 0], weapon: 'weapon1', steps: 22, move: { moveY: 1 } });
  // A cubierto contra un contenedor: en medio de la pared y, de portada, en su esquina.
  const cover = async (weapon: string, walk: number, look: [number, number]): Promise<void> => {
    await page.evaluate(
      ([w, n, yaw, pitch]) => {
        const q = window.__EXCOM__!;
        q.releaseAll();
        q.teleport(5.5, 0, 20.5, 0);
        q.setLook(0.1, -0.08);
        q.press(w as 'weapon1');
        q.step(30, {});
        q.step(1, { crouch: true });
        q.step(40, {});
        if (n) q.step(n as number, { moveX: -1 });
        q.setLook(yaw as number, pitch as number);
        q.step(40, {});
      },
      [weapon, walk, ...look],
    );
    await settle(page, 0.8);
  };
  await cover('weapon1', 0, [-0.5, -0.06]);
  await shot(page, 'cobertura');
  await cover('weapon2', 90, [0.35, -0.05]);
  await page.setViewportSize({ width: 1600, height: 640 });
  await settle(page, 1);
  await shot(page, 'portada');
  await page.setViewportSize({ width: 1280, height: 720 });

  await contract(page, 'rooftop');
  await scene(page, 'torre', { at: [0, 0, 15, 0], look: [0.1, -0.05], weapon: 'weapon1', steps: 30, move: { moveY: 1, sprint: true } });
});

test('fotogramas de la animación: el simulacro a tiros', async ({ page }) => {
  mkdirSync(FRAMES, { recursive: true });
  await page.setViewportSize(CLIP_SIZE);
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
  for (let i = 0; i < CLIP_FRAMES; i++) {
    // Paso a paso: la cámara gira con suavidad hacia el objetivo (sin saltos), espera un instante al
    // tenerlo en la mira y no dispara más de un tiro cada 0,4 s. Si no lo ve, avanza por el camino sin dejar de mirarlo.
    await page.evaluate(
      ([n, ease, reaction, gap]) => {
        const q = window.__EXCOM__!;
        const w = window as unknown as { __clipAim?: { target: string; onTarget: number; hidden: number; sinceShot: number } };
        const st = (w.__clipAim ??= { target: '', onTarget: 0, hidden: 0, sinceShot: 99 });
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
    await page.screenshot({ path: join(FRAMES, `frame-${String(i).padStart(3, '0')}.jpg`), type: 'jpeg', quality: 92 });
  }
});
