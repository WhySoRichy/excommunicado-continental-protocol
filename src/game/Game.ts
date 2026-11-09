import { Vector3 } from 'three';
import { AnimationLoop, FIXED_DT, FixedStepAccumulator } from '../core/Loop';
import { CollisionDebugView, DebugOverlay } from '../debug/DebugOverlay';
import { FrameStats } from '../debug/FrameStats';
import { buildLevel, type LevelRuntime } from '../levels/LevelBuilder';
import { loadLevelData } from '../levels/registry';
import type { LevelId } from '../levels/types';
import { loadRapier, PhysicsWorld, type Rapier } from '../physics/Physics';
import { GameRenderer, type QualityPreset } from '../render/Renderer';
import { hideBoot, setBootProgress } from '../ui/boot';

export interface GameOptions {
  qa: boolean;
  preset: QualityPreset;
  startLevel: LevelId;
}

const ORBIT_CENTER = new Vector3(0, 1, 0);

export class Game {
  readonly renderer: GameRenderer;
  readonly stats = new FrameStats();
  readonly debug: DebugOverlay;
  readonly collisionView: CollisionDebugView;
  readonly sim = new FixedStepAccumulator();
  readonly loop: AnimationLoop;
  readonly opts: GameOptions;
  R: Rapier | null = null;
  physics: PhysicsWorld | null = null;
  level: LevelRuntime | null = null;
  ready = false;
  /** Pasos fijos ejecutados (diagnóstico y tests). */
  steps = 0;
  private orbit = 0;
  private lastCpuMs = 0;

  constructor(gameRoot: HTMLElement, uiRoot: HTMLElement, opts: GameOptions) {
    this.opts = opts;
    this.renderer = new GameRenderer(gameRoot, opts.preset);
    this.debug = new DebugOverlay(uiRoot);
    this.collisionView = new CollisionDebugView(this.renderer.scene);
    this.loop = new AnimationLoop({ frame: (dt, now) => this.frame(dt, now) });
    this.registerDebugCommands();
    window.addEventListener('keydown', (e) => {
      if (e.code === 'F3') {
        e.preventDefault();
        this.debug.toggle();
        return;
      }
      this.debug.handleHotkey(e.code);
    });
  }

  async boot(): Promise<void> {
    setBootProgress(0.15, 'Cargando motor de física…');
    this.R = await loadRapier();
    setBootProgress(0.6, 'Construyendo el nivel…');
    await this.loadLevel(this.opts.startLevel);
    setBootProgress(1, 'Listo');
    hideBoot();
    this.loop.start();
    this.ready = true;
  }

  async loadLevel(id: LevelId): Promise<void> {
    if (!this.R) throw new Error('loadLevel antes de boot()');
    const data = await loadLevelData(id);
    this.level?.dispose();
    this.physics?.dispose();
    this.physics = new PhysicsWorld(this.R);
    const q = this.renderer.quality;
    this.level = buildLevel(data, this.renderer.scene, this.physics, { shadows: q.shadows, shadowMapSize: q.shadowMapSize });
    this.renderer.setExposure(data.ambient.exposure);
    this.physics.step();
    this.placeOrbitCamera();
    this.renderer.prewarm();
    this.collisionView.refresh(this.physics);
  }

  private registerDebugCommands(): void {
    this.debug.addCommand(
      'collisions',
      'Colisiones',
      () => {
        this.collisionView.setEnabled(!this.collisionView.enabled);
        if (this.physics) this.collisionView.refresh(this.physics);
      },
      { hotkey: 'KeyC', isOn: () => this.collisionView.enabled },
    );
  }

  private placeOrbitCamera(): void {
    const cam = this.renderer.camera;
    cam.position.set(Math.sin(this.orbit) * 30, 15, Math.cos(this.orbit) * 30);
    cam.lookAt(ORBIT_CENTER);
  }

  private fixedUpdate(dt: number): void {
    this.orbit += dt * 0.08;
    this.physics?.step();
    this.steps++;
  }

  private frame(realDt: number, now: number): void {
    const t0 = performance.now();
    const n = this.sim.advance(realDt);
    for (let i = 0; i < n; i++) this.fixedUpdate(FIXED_DT);
    this.placeOrbitCamera();
    this.debug.update(realDt, () => this.debugText());
    this.renderer.render();
    this.lastCpuMs = performance.now() - t0;
    this.stats.push(realDt * 1000, this.lastCpuMs);
    this.renderer.updateDynamicResolution(this.stats.avgFrameMs(60), realDt);
    void now;
  }

  debugText(): string {
    const info = this.renderer.renderer.info;
    const fps = this.stats.fps(60);
    const lines = [
      `FPS ${fps.toFixed(0)}  (${this.stats.avgFrameMs(60).toFixed(2)} ms, peor ${this.stats.worstFrameMs(120).toFixed(1)} ms)`,
      `CPU ${this.stats.avgCpuMs(60).toFixed(2)} ms   pasos fijos ${this.steps}`,
      `Draw calls ${info.render.calls}   triángulos ${info.render.triangles}`,
      `Geometrías ${info.memory.geometries}   texturas ${info.memory.textures}   programas ${info.programs?.length ?? 0}`,
      `Resolución ×${(this.renderer.pixelRatio).toFixed(2)}  (dinámica ×${this.renderer.dynamicScale.toFixed(1)})  preset ${this.renderer.preset}`,
      `Nivel ${this.level?.data.name ?? '—'}   colliders ${this.physics?.colliderCount ?? 0}`,
      `GPU ${this.renderer.gpuInfo()}`,
    ];
    return lines.join('\n');
  }
}
