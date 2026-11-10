import { expect, type Page, test } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { isCI, openGame } from './helpers';

/**
 * Fase 6 · Presupuesto de rendimiento. Sin GPU integrada a mano, se mide lo que la limita:
 * draw calls, triángulos y programas por nivel (preset medio), la CPU por frame con la CPU
 * frenada (portátil modesto) y el tamaño del bundle. Metodología en docs/ARQUITECTURA.md.
 */
const BUDGET = {
  calls: 260,
  triangles: 120_000,
  /** Programas de shader compilados en TODA la sesión (la caché es acumulativa). */
  programsSession: 64,
  /** CPU por frame (simulación + envío de render) sin freno, en ms. */
  cpuMs: 4,
  /** CPU por frame con la CPU frenada 2× (portátil con gráfica integrada): deja ~6,7 ms a la GPU. */
  cpuMsThrottled: 10,
  /** JS inicial del juego (gzip) y del motor de física (gzip), en KB. */
  appGzKb: 300,
  rapierGzKb: 1800,
};

type MissionId = 'practice' | 'nightclub' | 'docks' | 'rooftop';
const LEVELS: MissionId[] = ['practice', 'nightclub', 'docks', 'rooftop'];

interface Sample {
  level: string;
  cp: string;
  fps: number;
  cpuMs: number;
  calls: number;
  triangles: number;
  programs: number;
}

async function sampleCheckpoints(page: Page, level: string, seconds: number): Promise<Sample[]> {
  const ids = await page.evaluate(() => window.__EXCOM__!.checkpointIds());
  const out: Sample[] = [];
  for (const cp of ids) {
    await page.evaluate((id) => {
      const q = window.__EXCOM__!;
      q.checkpoint(id);
      q.step(4, {});
    }, cp);
    // Primero se dejan correr unos frames (compilación de shaders y subida de geometría).
    await page.evaluate(() => window.__EXCOM__!.measureFps(0.3));
    const f = await page.evaluate((s) => window.__EXCOM__!.measureFps(s), seconds);
    const i = await page.evaluate(() => window.__EXCOM__!.info());
    out.push({ level, cp, fps: f.fps, cpuMs: f.cpuMs, calls: i.calls, triangles: i.triangles, programs: i.programs });
  }
  return out;
}

test.describe('Fase 6 · rendimiento', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?qa=1');
    await page.evaluate(() => window.localStorage.clear());
  });

  test('presupuesto por nivel: draw calls, triángulos, programas y CPU por frame', async ({ page }) => {
    await openGame(page);
    await page.getByRole('button', { name: /Nueva partida|Continuar/ }).first().click();
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hub');
    const samples = await sampleCheckpoints(page, 'hub', 1);
    for (const id of LEVELS) {
      await page.evaluate((m) => window.__EXCOM__!.startContract(m), id);
      await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('briefing');
      await page.evaluate(() => {
        const q = window.__EXCOM__!;
        q.beginContract();
        q.setGod(true);
        q.skipTutorial();
      });
      samples.push(...(await sampleCheckpoints(page, id, 1)));
    }
    for (const s of samples) console.log(`[perf] ${s.level}/${s.cp}: ${s.fps.toFixed(0)} FPS · CPU ${s.cpuMs.toFixed(2)} ms · ${s.calls} calls · ${(s.triangles / 1000).toFixed(1)}k tris · ${s.programs} programas`);
    const worst = (k: 'calls' | 'triangles' | 'programs' | 'cpuMs'): Sample => samples.reduce((a, b) => (b[k] > a[k] ? b : a));
    console.log(`[perf] peor: calls ${worst('calls').calls} (${worst('calls').level}) · tris ${worst('triangles').triangles} (${worst('triangles').level}) · programas ${worst('programs').programs} · CPU ${worst('cpuMs').cpuMs.toFixed(2)} ms (${worst('cpuMs').level})`);
    expect(worst('programs').programs, 'programas en la sesión').toBeLessThanOrEqual(BUDGET.programsSession);
    for (const s of samples) {
      const where = `${s.level}/${s.cp}`;
      expect(s.calls, where).toBeLessThanOrEqual(BUDGET.calls);
      expect(s.triangles, where).toBeLessThanOrEqual(BUDGET.triangles);
      if (!isCI) {
        expect(s.cpuMs, where).toBeLessThanOrEqual(BUDGET.cpuMs);
        expect(s.fps, where).toBeGreaterThan(55);
      }
    }
  });

  test('CPU frenada (portátil con gráfica integrada): ×2 cabe en 60 FPS; ×4 se registra', async ({ page }) => {
    test.skip(isCI, 'En CI el render es por software: la medida de CPU no es representativa.');
    await openGame(page);
    await page.getByRole('button', { name: /Nueva partida|Continuar/ }).first().click();
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hub');
    const cdp = await page.context().newCDPSession(page);
    const rows: string[] = [];
    for (const id of ['nightclub', 'docks'] as const) {
      // El nivel se carga sin freno (la carga no es lo que se mide) y con combate real alrededor.
      await page.evaluate((m) => window.__EXCOM__!.startContract(m), id);
      await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('briefing');
      await page.evaluate(() => {
        const q = window.__EXCOM__!;
        q.beginContract();
        q.setGod(true);
        q.runDebug('nextCheckpoint');
        const p = q.player()!;
        for (let i = 0; i < 4; i++) q.spawnEnemy(i % 2 ? 'escort' : 'thug', p.x - 4 + i * 2.5, p.y, p.z - 6, true);
      });
      await page.evaluate(() => window.__EXCOM__!.measureFps(1));
      for (const rate of [2, 4]) {
        await cdp.send('Emulation.setCPUThrottlingRate', { rate });
        await page.evaluate(() => window.__EXCOM__!.measureFps(1));
        const f = await page.evaluate(() => window.__EXCOM__!.measureFps(3));
        const split = await page.evaluate(() => window.__EXCOM__!.cpuProfile(2));
        rows.push(
          `${id} ×${rate}: ${f.fps.toFixed(0)} FPS · CPU ${f.cpuMs.toFixed(2)} ms (sim ${split.simPerFrame!.toFixed(1)} · vista ${split.viewPerFrame!.toFixed(1)} · render ${split.renderPerFrame!.toFixed(1)}) · peor ${f.worstMs.toFixed(1)} ms`,
        );
        if (rate === 2) expect(f.cpuMs, `${id} ×2`).toBeLessThanOrEqual(BUDGET.cpuMsThrottled);
      }
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    }
    console.log(`[perf frenada] ${rows.join(' | ')}`);
  });

  test('bundle: JS del juego y del motor de física dentro de presupuesto', async () => {
    const dir = join(process.cwd(), 'dist', 'assets');
    const files = readdirSync(dir).filter((f) => f.endsWith('.js'));
    let app = 0;
    let rapier = 0;
    for (const f of files) {
      const gz = gzipSync(readFileSync(join(dir, f))).length / 1024;
      if (f.startsWith('rapier')) rapier += gz;
      else app += gz;
    }
    console.log(`[bundle] juego ${app.toFixed(0)} KB gzip · física ${rapier.toFixed(0)} KB gzip (carga perezosa con la pantalla de arranque)`);
    expect(app).toBeLessThanOrEqual(BUDGET.appGzKb);
    expect(rapier).toBeLessThanOrEqual(BUDGET.rapierGzKb);
  });
});
