import { Vector3 } from 'three';
import type { Action } from '../core/actions';
import { FIXED_DT } from '../core/Loop';
import type { Game, QaInvariants } from '../game/Game';

/**
 * API de QA expuesta en `window.__EXCOM__` (solo con ?qa=1 o en dev).
 * Los tests de Playwright la usan para verificar gates corriendo el juego REAL.
 */
export interface QaStepIntent {
  moveX: number;
  moveY: number;
  sprint: boolean;
  aim: boolean;
  crouch: boolean;
  jump: boolean;
  dodge: boolean;
}

export interface PlayerSnapshot {
  x: number;
  y: number;
  z: number;
  state: string;
  posture: string;
  grounded: boolean;
  speed: number;
  yaw: number;
  invulnerable: boolean;
  cover: string | null;
  edge: number;
  stats: Record<string, number>;
}

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
  state(): string;
  playArena(): void;
  pause(): void;
  resume(): void;
  setManual(on: boolean): void;
  step(n: number, intent?: Partial<QaStepIntent>): void;
  player(): PlayerSnapshot | null;
  teleport(x: number, y: number, z: number, yaw: number): void;
  checkpoint(id: string): boolean;
  setLook(yaw: number, pitch: number): void;
  hold(action: Action, on: boolean): void;
  press(action: Action): void;
  move(x: number, y: number): void;
  releaseAll(): void;
  invariants(): QaInvariants & { nanResets: number; killPlaneResets: number; maxHorizontalSpeed: number };
  resetInvariants(): void;
  input(): { held: number; locked: boolean; capturing: boolean };
  lagSpike(ms: number): void;
  camera(): { x: number; y: number; z: number; dist: number; fov: number; yaw: number; pitch: number };
  canvas(): { cssW: number; cssH: number; bufW: number; bufH: number; pixelRatio: number };
  prompt(): string;
}

declare global {
  interface Window {
    __EXCOM__?: QaApi;
  }
}

export function installQa(game: Game): void {
  const holds: Action[] = ['sprint', 'aim'];
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
    state: () => game.fsm.state,
    playArena: () => {
      if (game.fsm.state === 'title') game.playArena();
    },
    pause: () => game.pause(),
    resume: () => game.resume(),
    setManual: (on: boolean) => {
      game.manual = on;
    },
    step: (n: number, intent: Partial<QaStepIntent> = {}) => {
      const inp = game.input;
      inp.setVirtualMove(intent.moveX ?? 0, intent.moveY ?? 0);
      inp.virtualHold('sprint', intent.sprint ?? false);
      inp.virtualHold('aim', intent.aim ?? false);
      if (intent.crouch) inp.virtualPress('crouch');
      if (intent.jump) inp.virtualPress('jump');
      if (intent.dodge) inp.virtualPress('dodge');
      game.stepManual(Math.max(0, Math.floor(n)));
    },
    player: () => {
      const p = game.session?.player;
      if (!p) return null;
      return {
        x: p.feet.x,
        y: p.feet.y,
        z: p.feet.z,
        state: p.state,
        posture: p.posture,
        grounded: p.grounded,
        speed: p.stepSpeed(FIXED_DT),
        yaw: p.yaw,
        invulnerable: p.invulnerable,
        cover: p.cover?.height ?? null,
        edge: p.cover?.edge ?? 0,
        stats: { ...p.stats },
      };
    },
    teleport: (x, y, z, yaw) => {
      const s = game.session;
      if (!s) return;
      s.respawnAt(new Vector3(x, y + 0.02, z), yaw);
      game.camera.setYawPitch(yaw, game.camera.pitch);
      game.camera.snap();
    },
    checkpoint: (id: string) => {
      const s = game.session;
      const cp = s?.data.checkpoints.find((c) => c.id === id);
      if (!s || !cp) return false;
      s.respawnAt(new Vector3(cp.pos[0], cp.pos[1] + 0.02, cp.pos[2]), cp.yaw);
      game.camera.setYawPitch(cp.yaw, -0.12);
      game.camera.snap();
      return true;
    },
    setLook: (yaw, pitch) => game.camera.setYawPitch(yaw, pitch),
    hold: (a, on) => game.input.virtualHold(a, on),
    press: (a) => game.input.virtualPress(a),
    move: (x, y) => game.input.setVirtualMove(x, y),
    releaseAll: () => {
      game.input.setVirtualMove(0, 0);
      for (const a of holds) game.input.virtualHold(a, false);
    },
    invariants: () => {
      const p = game.session?.player;
      return { ...game.invariants, nanResets: p?.nanResets ?? 0, killPlaneResets: p?.killPlaneResets ?? 0, maxHorizontalSpeed: p?.maxHorizontalSpeed ?? 0 };
    },
    resetInvariants: () => game.resetInvariants(),
    input: () => ({ held: game.input.heldCount, locked: game.input.pointerLocked, capturing: game.input.capturing }),
    lagSpike: (ms: number) => {
      game.pendingLagMs = ms;
    },
    camera: () => {
      const c = game.camera;
      return { x: c.position.x, y: c.position.y, z: c.position.z, dist: c.distanceToHead, fov: game.renderer.camera.fov, yaw: c.yaw, pitch: c.pitch };
    },
    canvas: () => {
      const cv = game.renderer.canvas;
      return { cssW: cv.clientWidth, cssH: cv.clientHeight, bufW: cv.width, bufH: cv.height, pixelRatio: game.renderer.pixelRatio };
    },
    prompt: () => document.querySelector('#hud .prompt:not([hidden]) .prompt-text')?.textContent ?? '',
  };
  window.__EXCOM__ = api;
}
