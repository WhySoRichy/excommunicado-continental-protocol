import type { Game } from '../game/Game';

/**
 * API de QA expuesta en `window.__EXCOM__` (solo con ?qa=1 o en dev).
 * Los tests de Playwright la usan para verificar gates corriendo el juego real.
 */
export interface QaApi {
  readonly ready: boolean;
  luminance(): number;
  fps(): number;
  measureFps(seconds: number): Promise<{ frames: number; seconds: number; fps: number; avgMs: number }>;
  gpu(): string;
  debugText(): string;
  setDebug(visible: boolean): void;
  runDebug(id: string): boolean;
  info(): { calls: number; triangles: number; programs: number; pixelRatio: number; preset: string; steps: number };
}

declare global {
  interface Window {
    __EXCOM__?: QaApi;
  }
}

export function installQa(game: Game): void {
  const api: QaApi = {
    get ready() {
      return game.ready;
    },
    luminance: () => game.renderer.sampleLuminance(),
    fps: () => game.stats.fps(60),
    measureFps: (seconds: number) =>
      new Promise((resolve) => {
        game.stats.beginWindow(performance.now());
        const end = performance.now() + seconds * 1000;
        const tick = (): void => {
          if (performance.now() >= end) resolve(game.stats.windowResult(performance.now()));
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    gpu: () => game.renderer.gpuInfo(),
    debugText: () => game.debugText(),
    setDebug: (v: boolean) => game.debug.setVisible(v),
    runDebug: (id: string) => game.debug.run(id),
    info: () => {
      const i = game.renderer.renderer.info;
      return {
        calls: i.render.calls,
        triangles: i.render.triangles,
        programs: i.programs?.length ?? 0,
        pixelRatio: game.renderer.pixelRatio,
        preset: game.renderer.preset,
        steps: game.steps,
      };
    },
  };
  window.__EXCOM__ = api;
}
