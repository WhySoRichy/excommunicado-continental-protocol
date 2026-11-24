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
  // Subió de 120.000 con los personajes de mallas suaves (bloque 2, entrega 4): unos 8.000 triángulos de cerca y 3.000 de
  // lejos cada uno, dos veces por fotograma (sombra y escena). El peor caso es la pista del club, con todos sus civiles.
  triangles: 230_000,
  /** Programas de shader compilados en TODA la sesión (la caché es acumulativa). */
  // Incluye la cadena de posprocesado (bloom y salida), que aporta unos nueve programas propios.
  programsSession: 76,
  /** CPU por frame (simulación + envío de render) sin freno, en ms. */
  cpuMs: 4,
  /** CPU por frame con la CPU frenada 2× (portátil con gráfica integrada): deja ~6,7 ms a la GPU. */
  cpuMsThrottled: 10,
  /**
   * JS inicial del juego (gzip) y del motor de física (gzip), en KB. El del juego subió de 300 a 320 con las armas de
   * piezas reales (bloque 2): las extrusiones, los torneados y la triangulación de contornos de three, unos 8 KB; y a 340
   * con los personajes de mallas suaves, unos 10 KB de código en lugar de megas de modelos descargados.
   */
  appGzKb: 340,
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
    await page
      .getByRole('button', { name: /Nueva partida|Continuar/ })
      .first()
      .click();
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
    for (const s of samples)
      console.log(
        `[perf] ${s.level}/${s.cp}: ${s.fps.toFixed(0)} FPS · CPU ${s.cpuMs.toFixed(2)} ms · ${s.calls} calls · ${(s.triangles / 1000).toFixed(1)}k tris · ${s.programs} programas`,
      );
    const worst = (k: 'calls' | 'triangles' | 'programs' | 'cpuMs'): Sample => samples.reduce((a, b) => (b[k] > a[k] ? b : a));
    console.log(
      `[perf] peor: calls ${worst('calls').calls} (${worst('calls').level}) · tris ${worst('triangles').triangles} (${worst('triangles').level}) · programas ${worst('programs').programs} · CPU ${worst('cpuMs').cpuMs.toFixed(2)} ms (${worst('cpuMs').level})`,
    );
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
    await page
      .getByRole('button', { name: /Nueva partida|Continuar/ })
      .first()
      .click();
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

  test('cambiar de nivel no acumula texturas ni geometrías en la GPU', async ({ page }) => {
    // Preset medio forzado: con sombras (en CI el preset automático es Bajo y no habría mapa de sombras).
    await openGame(page, 'preset=medium');
    await page
      .getByRole('button', { name: /Nueva partida|Continuar/ })
      .first()
      .click();
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hub');
    const round = async (): Promise<{ textures: number; geometries: number }> => {
      for (const id of LEVELS) {
        await page.evaluate((m) => window.__EXCOM__!.startContract(m), id);
        await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('briefing');
        // Un render completo: el mapa de sombras del nivel se crea al dibujarlo.
        await page.evaluate(() => window.__EXCOM__!.luminance());
        await page.evaluate(() => window.__EXCOM__!.goToHub());
        await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hub');
        await page.evaluate(() => window.__EXCOM__!.luminance());
      }
      return page.evaluate(() => {
        const i = window.__EXCOM__!.info();
        return { textures: i.textures, geometries: i.geometries };
      });
    };
    // La primera vuelta crea lo que se comparte entre niveles (texturas de materiales); la segunda no debe sumar nada.
    const first = await round();
    const second = await round();
    console.log(
      `[perf] recursos tras recorrer los niveles: ${first.textures} → ${second.textures} texturas · ${first.geometries} → ${second.geometries} geometrías`,
    );
    expect(second.textures, 'texturas').toBeLessThanOrEqual(first.textures);
    expect(second.geometries, 'geometrías').toBeLessThanOrEqual(first.geometries);
  });

  test('Gauntlet: tras doce oleadas la escena sigue dentro del presupuesto (los caídos se retiran)', async ({ page }) => {
    await openGame(page, 'preset=medium');
    await page
      .getByRole('button', { name: /Nueva partida|Continuar/ })
      .first()
      .click();
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hub');
    await page.evaluate(() => window.__EXCOM__!.startContract('gauntlet'));
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('briefing');
    const waves = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.beginContract();
      q.setManual(true);
      q.setGod(true);
      // Desde recepción mirando al sur se ve todo el vestíbulo y las dos entradas.
      q.teleport(0, 0, -9.3, Math.PI);
      q.setLook(Math.PI, -0.12);
      for (let w = 1; w <= 12; w++) {
        for (let i = 0; i < 200 && (q.mission()!.wave < w || q.mission()!.wavePending > 0); i++) q.step(15, {});
        q.step(150, {});
        q.runDebug('killAll');
        q.step(90, {});
      }
      q.setLook(Math.PI, -0.12);
      q.setManual(false);
      return q.mission()!.wavesCleared;
    });
    expect(waves).toBe(12);
    // En el respiro: sin enemigos vivos, solo quedan los caídos de la última oleada.
    await page.evaluate(() => window.__EXCOM__!.measureFps(0.4));
    const s = await page.evaluate(() => ({ info: window.__EXCOM__!.info(), bodies: window.__EXCOM__!.enemies().length }));
    console.log(`[perf] gauntlet oleada 12: ${s.bodies} cuerpos · ${s.info.calls} calls · ${(s.info.triangles / 1000).toFixed(1)}k tris`);
    expect(s.bodies).toBeLessThanOrEqual(10);
    expect(s.info.calls).toBeLessThanOrEqual(BUDGET.calls);
    expect(s.info.triangles).toBeLessThanOrEqual(BUDGET.triangles);
  });

  test('los enemigos del mismo tipo comparten la geometría', async ({ page }) => {
    await openGame(page);
    await page.evaluate(() => window.__EXCOM__!.playLevel('arena'));
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('playing');
    // Delante de la cámara: la geometría se sube a la GPU la primera vez que se dibuja.
    const spawn = (count: number, z: number): Promise<number> =>
      page.evaluate(
        ([n, rowZ]) => {
          const q = window.__EXCOM__!;
          q.setManual(true);
          q.setGod(true);
          q.teleport(0, 0, 14, 0);
          q.setLook(0, -0.1);
          for (let i = 0; i < n!; i++) q.spawnEnemy('thug', -3 + i * 1.5, 0, rowZ!, false);
          q.step(2, {});
          q.luminance();
          return q.info().geometries;
        },
        [count, z],
      );
    const one = await spawn(1, 8);
    const six = await spawn(5, 6);
    expect(six, 'geometrías con seis matones frente a uno').toBe(one);
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

  test('cambiar de calidad en caliente libera el bloom y rehace el mapa de sombras', async ({ page }) => {
    await openGame(page, 'preset=high');
    await page
      .getByRole('button', { name: /Nueva partida|Continuar/ })
      .first()
      .click();
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hub');
    // Unos frames reales para que cada cambio se dibuje (el mapa de sombras se crea al renderizar).
    const read = () =>
      page.evaluate(async () => {
        await window.__EXCOM__!.measureFps(0.4);
        return window.__EXCOM__!.info();
      });
    const high = await read();
    expect(high.shadowMap).toBe(2048);
    await page.evaluate(() => window.__EXCOM__!.setSettings({ preset: 'low' }));
    const low = await read();
    expect(low.shadowMap, 'sin sombras no queda mapa').toBe(0);
    // Antes, el compositor del bloom (una docena de destinos del tamaño de la pantalla) seguía en la GPU.
    expect(low.textures, 'texturas en Bajo frente a Alto').toBeLessThanOrEqual(high.textures - 10);
    await page.evaluate(() => window.__EXCOM__!.setSettings({ preset: 'medium' }));
    const medium = await read();
    expect(medium.shadowMap, 'las sombras vuelven sin esperar a otro nivel').toBe(1024);
  });

  test('build público: sin la API de QA ni los comandos de depuración', async () => {
    // `dist` es lo que se publica en Pages; las e2e corren sobre `dist-qa` (npm run build:qa).
    const dir = join(process.cwd(), 'dist', 'assets');
    const code = readdirSync(dir)
      .filter((f) => f.endsWith('.js'))
      .map((f) => readFileSync(join(dir, f), 'utf8'));
    for (const marker of ['__EXCOM__', 'God mode']) {
      expect(
        code.some((js) => js.includes(marker)),
        `"${marker}" no debe llegar al build público`,
      ).toBe(false);
    }
  });

  test('build público: con política de seguridad de contenido', async () => {
    const html = readFileSync(join(process.cwd(), 'dist', 'index.html'), 'utf8');
    // Vite escribe las comillas simples del atributo como entidades.
    const csp = (/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/.exec(html)?.[1] ?? '').replaceAll('&#39;', "'");
    expect(csp, 'la CSP va en un <meta> del build público').toContain("script-src 'self' 'wasm-unsafe-eval'");
    expect(csp).toContain("object-src 'none'");
  });
});
