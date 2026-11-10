import { Vector3 } from 'three';
import type { UpgradeId } from '../combat/weapons';
import type { Action } from '../core/actions';
import { FIXED_DT } from '../core/Loop';
import { deleteProfile, type Profile } from '../core/Save';
import { addCoins } from '../hub/economy';
import type { Game, QaInvariants } from '../game/Game';
import type { MissionId } from '../missions/types';
import type { Settings } from '../core/Settings';

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
  aiming: boolean;
  cover: string | null;
  edge: number;
  stats: Record<string, number>;
}

export interface CombatSnapshot {
  health: number;
  armor: number;
  maxArmor: number;
  weapon: string;
  loadout: string[];
  mag: number;
  magMax: number;
  reserve: number;
  reloading: boolean;
  multiplier: number;
  score: number;
  focus: number;
  focusActive: boolean;
  dead: boolean;
  takedown: boolean;
  holstered: boolean;
  stats: Record<string, number>;
  varietyCount: number;
  takedownTarget: string | null;
  blocked: boolean;
  hitKind: string;
  aimOverEnemy: boolean;
  recoil0: number;
}

export interface EnemySnapshot {
  id: string;
  type: string;
  state: string;
  alive: boolean;
  x: number;
  y: number;
  z: number;
  health: number;
  headY: number;
}

export interface HubSnapshot {
  state: string;
  wave: number;
  hostile: boolean;
  lostCoins: number;
  sirenOn: boolean;
  alarmIntensity: number;
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
  level(): string;
  playArena(): void;
  playLevel(id: 'arena' | 'practice', drill?: boolean): Promise<void>;
  goToHub(): Promise<void>;
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
  combat(): CombatSnapshot | null;
  enemies(): EnemySnapshot[];
  aiStats(): { alive: number; total: number; maxNoProgress: number; stuckEvents: number; states: Record<string, number> } | null;
  /** Orienta la cámara para apuntar a un punto del mundo. */
  aimAt(x: number, y: number, z: number): void;
  spawnEnemy(type: 'thug' | 'escort' | 'marksman' | 'heavy' | 'boss', x: number, y: number, z: number, alert: boolean): string | null;
  setGod(on: boolean): void;
  /** Ruta A* (suavizada) desde el jugador hasta un punto: lista de waypoints. */
  pathTo(x: number, y: number, z: number): Array<{ x: number; y: number; z: number }>;
  combatInconsistencies(): number;
  respawn(): void;
  hud(): { deathVisible: boolean; reloadVisible: boolean; hitmark: string; style: string; ammo: string; objective: string; zone: string; toast: string };
  // --- Hub, perfil y menús ---
  profile(): Profile;
  setCoins(n: number): void;
  resetSave(): void;
  hub(): HubSnapshot | null;
  /** Interactúa con lo que haya delante (como pulsar E). */
  interact(): boolean;
  nearestInteractable(): string | null;
  menu(): string | null;
  dialogLine(): string;
  advanceDialog(): void;
  closeMenu(): void;
  buy(id: UpgradeId): boolean;
  // --- Contratos ---
  startContract(id: MissionId): Promise<void>;
  /** "Empezar" en el briefing. */
  beginContract(): void;
  mission(): MissionSnapshot | null;
  /** Último resultado de contrato (tras la pantalla de resultados). */
  outcome(): {
    mission: string;
    success: boolean;
    rank: string;
    total: number;
    coins: number;
    achievements: string[];
    failReason: string;
    timeSec: number;
    shotsFired: number;
    gauntlet: { waves: number; position: number } | null;
  } | null;
  /** Pulsa un botón de la pantalla actual por su texto. */
  clickButton(label: string): boolean;
  civilians(): Array<{ id: string; alive: boolean; state: string; x: number; z: number; health: number }>;
  /** Mata a un enemigo en silencio (sin ruido ni alerta): prepara escenarios. */
  killEnemy(id: string): boolean;
  /** Ajustes actuales y estado derivado (cámara, render, audio). */
  settings(): { settings: Settings; cameraFov: number; mouseSens: number; brightness: string; preset: string; uiScale: string; volumes: { master: number; music: number } };
  setSettings(patch: Partial<Settings>): void;
  /** "Saltar tutorial" del contrato en curso. */
  skipTutorial(): void;
}

export interface MissionSnapshot {
  id: string;
  index: number;
  total: number;
  objective: string;
  kind: string;
  finished: boolean;
  markersUsed: number;
  markersTotal: number;
  time: number;
  alarmSounded: boolean;
  alarmDisabled: boolean;
  civiliansHurt: number;
  civiliansKilled: number;
  escapeLeft: number;
  /** Gauntlet: oleada en curso, oleadas superadas y segundos de respiro. */
  wave: number;
  wavesCleared: number;
  waveBreak: number;
  /** Enemigos de la oleada que aún no han aparecido. */
  wavePending: number;
  beacon: { x: number; y: number; z: number } | null;
  respawn: { x: number; y: number; z: number };
}

declare global {
  interface Window {
    __EXCOM__?: QaApi;
  }
}

export function installQa(game: Game): void {
  const holds: Action[] = ['sprint', 'aim'];
  const readHud = (): ReturnType<QaApi['hud']> => ({
    deathVisible: !(document.querySelector('#hud .death') as HTMLElement | null)?.hidden,
    reloadVisible: !(document.querySelector('#hud .reload') as HTMLElement | null)?.hidden,
    hitmark: (document.querySelector('#hud .hitmark') as HTMLElement | null)?.className ?? '',
    style: document.querySelector('#hud .style-mult')?.textContent ?? '',
    ammo: `${document.querySelector('#hud .ammo-mag')?.textContent ?? ''}${document.querySelector('#hud .ammo-res')?.textContent ?? ''}`,
    objective: document.querySelector('#hud .objective')?.textContent ?? '',
    zone: document.querySelector('#hud .zone-label')?.textContent ?? '',
    toast: (document.querySelector('#hud .toast') as HTMLElement | null)?.hidden ? '' : (document.querySelector('#hud .toast')?.textContent ?? ''),
  });
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
    level: () => game.currentLevel,
    playArena: () => game.playArena(),
    playLevel: (id, drill = false) => game.playLevel(id, { drill }),
    goToHub: () => game.goToHub(),
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
        aiming: p.aiming,
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
    combat: () => {
      const s = game.session;
      if (!s) return null;
      const c = s.combat;
      const w = c.weapon;
      return {
        health: c.vitals.health,
        armor: c.vitals.armor,
        maxArmor: c.vitals.maxArmor,
        weapon: c.current,
        loadout: [...c.loadout],
        mag: w.mag,
        magMax: w.def.mag,
        reserve: w.reserve,
        reloading: w.reloading,
        multiplier: c.style.multiplier,
        score: c.style.score,
        focus: c.focus,
        focusActive: c.focusActive,
        dead: c.dead,
        takedown: !!c.takedown,
        holstered: c.holstered,
        stats: { ...c.stats },
        varietyCount: c.style.varietyCount,
        takedownTarget: c.takedownCandidate(s.ctx)?.id ?? null,
        blocked: c.blocked,
        hitKind: c.hitMarker.t > 0 ? c.hitMarker.kind : 'none',
        aimOverEnemy: c.aimOver === 'enemy',
        recoil0: w.def.recoil[0]?.[0] ?? 0,
      };
    },
    enemies: () =>
      (game.session?.enemies.enemies ?? []).map((e) => ({
        id: e.id,
        type: e.def.type,
        state: e.state,
        alive: e.alive,
        x: e.feet.x,
        y: e.feet.y,
        z: e.feet.z,
        health: e.vitals.health,
        headY: e.feet.y + e.height - 0.15,
      })),
    aiStats: () => game.session?.enemies.qaStats() ?? null,
    aimAt: (x, y, z) => {
      const c = game.camera;
      for (let i = 0; i < 4; i++) {
        const dx = x - c.position.x;
        const dy = y - c.position.y;
        const dz = z - c.position.z;
        c.setYawPitch(Math.atan2(-dx, -dz), Math.atan2(dy, Math.hypot(dx, dz)));
        game.stepManualCameraOnly();
      }
    },
    spawnEnemy: (type, x, y, z, alert) => {
      const s = game.session;
      if (!s) return null;
      const e = s.enemies.spawnAt(type, new Vector3(x, y, z), 0, alert ? s.player.feet.clone() : undefined);
      return e.id;
    },
    setGod: (on) => {
      if (game.session) game.session.god = on;
    },
    pathTo: (x, y, z) => {
      const s = game.session;
      if (!s) return [];
      const f = s.player.feet;
      const a = s.nav.nearestNode(f.x, f.y, f.z, 2);
      const b = s.nav.nearestNode(x, y, z, 3);
      const raw = s.nav.findPath(a, b);
      if (!raw) return [];
      const v = new Vector3();
      return s.nav.smooth(raw).map((n) => {
        s.nav.pos(n, v);
        return { x: v.x, y: v.y, z: v.z };
      });
    },
    combatInconsistencies: () => game.combatInconsistencies,
    respawn: () => game.qaRespawn(),
    hud: () => {
      game.qaRefreshHud();
      return readHud();
    },
    profile: () => JSON.parse(JSON.stringify(game.profile)) as Profile,
    setCoins: (n) => {
      game.profile.coins = 0;
      addCoins(game.profile, n);
      game.saveNow();
      game.screens.refresh();
    },
    resetSave: () => deleteProfile(game.store),
    hub: () => {
      const d = game.director;
      if (!d) return null;
      const lights = game.session?.level.alarmLights ?? [];
      return {
        state: d.state,
        wave: d.rules.wave,
        hostile: d.hostile,
        lostCoins: d.lostCoins,
        sirenOn: game.audio.sirenOn,
        alarmIntensity: lights.reduce((m, l) => Math.max(m, l.intensity), 0),
      };
    },
    interact: () => game.qaInteract(),
    nearestInteractable: () => game.session?.nearestInteractable(game.camera.yaw)?.id ?? null,
    menu: () => game.screens.current,
    dialogLine: () => document.querySelector('#screens .dialog-line')?.textContent ?? '',
    advanceDialog: () => game.screens.advanceDialog(),
    closeMenu: () => game.closeMenu(),
    buy: (id) => {
      const before = game.profile.coins;
      const btn = document.querySelector<HTMLButtonElement>(`#screens .shop-item[data-item="${id}"] button`);
      btn?.click();
      return game.profile.coins < before;
    },
    startContract: (id) => game.startContract(id),
    beginContract: () => game.beginContract(),
    mission: () => {
      const m = game.mission;
      if (!m) return null;
      const o = m.current;
      const b = m.beacon(new Vector3());
      return {
        id: m.id,
        index: m.index,
        total: m.objectives.length,
        objective: m.currentText,
        kind: o?.kind ?? '',
        finished: m.finished,
        markersUsed: m.markersUsed,
        markersTotal: m.markersTotal,
        time: m.time,
        alarmSounded: m.alarmSounded,
        alarmDisabled: m.alarmDisabled,
        civiliansHurt: m.civiliansHurt,
        civiliansKilled: m.civiliansKilled,
        escapeLeft: m.escapeLeft,
        wave: m.gauntletWave,
        wavesCleared: m.gauntletWaves,
        waveBreak: m.gauntletBreak,
        wavePending: m.gauntletPending,
        beacon: b ? { x: b.x, y: b.y, z: b.z } : null,
        respawn: { x: m.respawnPos.x, y: m.respawnPos.y, z: m.respawnPos.z },
      };
    },
    outcome: () => {
      const o = game.outcome;
      if (!o) return null;
      return {
        mission: o.mission,
        success: o.success,
        rank: o.rank.rank,
        total: o.rank.total,
        coins: o.coinsReward,
        achievements: o.achievements.map((a) => a.id),
        failReason: o.failReason,
        timeSec: o.timeSec,
        shotsFired: o.stats.shotsFired,
        gauntlet: o.gauntlet ? { waves: o.gauntlet.waves, position: o.gauntlet.position } : null,
      };
    },
    clickButton: (label) => {
      const btn = [...document.querySelectorAll<HTMLButtonElement>('#screens button')].find((b) => b.textContent?.trim() === label);
      btn?.click();
      return !!btn;
    },
    settings: () => ({
      settings: game.settings,
      cameraFov: game.camera.settings.fov,
      mouseSens: game.camera.settings.mouseSens,
      brightness: game.renderer.canvas.style.filter,
      preset: game.renderer.preset,
      uiScale: document.documentElement.style.getPropertyValue('--ui-scale'),
      volumes: game.audio.getVolumes(),
    }),
    setSettings: (patch) => game.applySettings({ ...game.settings, ...patch }),
    skipTutorial: () => game.mission?.skipLearn(),
    killEnemy: (id) => {
      const s = game.session;
      const e = s?.enemies.enemies.find((x) => x.id === id || x.id.startsWith(`${id}#`));
      if (!s || !e || !e.alive) return false;
      e.applyHit(9999, 'body', s.player.feet, 1, true);
      return true;
    },
    civilians: () => (game.session?.civilians?.list ?? []).map((c) => ({ id: c.id, alive: c.alive, state: c.state, x: c.feet.x, z: c.feet.z, health: c.vitals.health })),
  };
  window.__EXCOM__ = api;
}
