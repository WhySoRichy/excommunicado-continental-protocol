import { Vector3 } from 'three';
import { GameStateMachine, type GameStateId } from '../core/GameStateMachine';
import { Input, type InputEvent, type Vec2 } from '../core/Input';
import { AnimationLoop, FIXED_DT, FixedStepAccumulator } from '../core/Loop';
import { Rng } from '../core/rng';
import { CollisionDebugView, DebugOverlay } from '../debug/DebugOverlay';
import { FrameStats } from '../debug/FrameStats';
import { idlePose, type RigPose } from '../entities/CharacterRig';
import { emptyIntent, type PlayerIntent } from '../entities/PlayerController';
import { loadLevelData } from '../levels/registry';
import type { LevelId } from '../levels/types';
import { loadRapier, QueryGroups, type Rapier } from '../physics/Physics';
import { GameRenderer, type QualityPreset } from '../render/Renderer';
import { hideBoot, setBootProgress } from '../ui/boot';
import { h } from '../ui/dom';
import { Hud, type PromptSpec } from '../ui/Hud';
import { Screens } from '../ui/Screens';
import { CameraRig } from './CameraRig';
import { LevelSession } from './LevelSession';

export interface GameOptions {
  qa: boolean;
  preset: QualityPreset;
  startLevel: LevelId;
  /** Usar pointer lock real (por defecto: sí fuera de QA; `?lock=1` lo fuerza en QA). */
  pointerLock: boolean;
}

/** Contadores de invariantes de QA (deben quedar en 0). */
export interface QaInvariants {
  steps: number;
  penetrations: number;
  cameraInside: number;
  cameraOccluded: number;
  outOfBounds: number;
  lastViolation: string;
}

const _head = new Vector3();
const _feet = new Vector3();
const _orbitTarget = new Vector3(0, 1, 0);

export class Game {
  readonly renderer: GameRenderer;
  readonly stats = new FrameStats();
  readonly debug: DebugOverlay;
  readonly collisionView: CollisionDebugView;
  readonly sim = new FixedStepAccumulator();
  readonly loop: AnimationLoop;
  readonly opts: GameOptions;
  readonly input: Input;
  readonly fsm = new GameStateMachine();
  readonly screens: Screens;
  readonly hud: Hud;
  readonly camera: CameraRig;
  readonly rng = new Rng(7);
  R: Rapier | null = null;
  session: LevelSession | null = null;
  ready = false;
  steps = 0;
  /** QA: la simulación solo avanza con qa.step() (determinista, independiente del FPS). */
  manual = false;
  readonly invariants: QaInvariants = { steps: 0, penetrations: 0, cameraInside: 0, cameraOccluded: 0, outOfBounds: 0, lastViolation: '' };
  /** Milisegundos de "pico de lag" a simular en el próximo frame (QA). */
  pendingLagMs = 0;

  private readonly intent: PlayerIntent = emptyIntent();
  private readonly idleIntent: PlayerIntent = emptyIntent();
  private readonly move: Vec2 = { x: 0, y: 0 };
  private readonly mouse: Vec2 = { x: 0, y: 0 };
  private readonly pad: Vec2 = { x: 0, y: 0 };
  private readonly pose: RigPose = idlePose();
  private readonly captureOverlay: HTMLDivElement;
  private peekTimer = 0;
  private orbit = 0;
  private lastCpuMs = 0;

  constructor(gameRoot: HTMLElement, uiRoot: HTMLElement, opts: GameOptions) {
    this.opts = opts;
    this.renderer = new GameRenderer(gameRoot, opts.preset);
    this.input = new Input(this.renderer.canvas);
    this.input.attach();
    this.input.on((e) => this.onInputEvent(e));
    this.camera = new CameraRig(this.renderer.camera, this.rng);
    this.hud = new Hud(uiRoot);
    this.screens = new Screens(uiRoot, this.input, {
      onPlayArena: () => this.playArena(),
      onResume: () => this.resume(),
      onQuitToTitle: () => this.quitToTitle(),
    });
    this.captureOverlay = h('div', { class: 'capture-overlay', role: 'button', tabIndex: 0, ariaLabel: 'Haz clic para capturar el ratón' }, [
      h('div', { class: 'capture-box' }, [h('strong', { text: 'Haz clic para jugar' }), h('span', { text: 'El ratón controla la cámara. Esc para pausar.' })]),
    ]);
    this.captureOverlay.hidden = true;
    this.captureOverlay.addEventListener('click', () => this.requestLock());
    uiRoot.appendChild(this.captureOverlay);
    this.debug = new DebugOverlay(uiRoot);
    this.collisionView = new CollisionDebugView(this.renderer.scene);
    this.loop = new AnimationLoop({ frame: (dt, now) => this.frame(dt, now) });
    this.fsm.on((to, from) => this.onStateChange(to, from));
    this.registerDebugCommands();
    // F3 y teclas rápidas de debug (solo con el overlay abierto) fuera del mapa de acciones.
    window.addEventListener('keydown', (e) => {
      if (e.code === 'F3') {
        e.preventDefault();
        this.debug.toggle();
        return;
      }
      if (!e.repeat) this.debug.handleHotkey(e.code);
    });
  }

  // =========================================================== arranque
  async boot(): Promise<void> {
    setBootProgress(0.15, 'Cargando motor de física…');
    this.R = await loadRapier();
    setBootProgress(0.6, 'Preparando la arena…');
    await this.loadSession(this.opts.startLevel);
    setBootProgress(1, 'Listo');
    hideBoot();
    this.loop.start();
    this.fsm.go('title');
    this.ready = true;
  }

  async loadSession(id: LevelId): Promise<void> {
    if (!this.R) throw new Error('loadSession antes de boot()');
    const data = await loadLevelData(id);
    this.session?.dispose();
    this.session = new LevelSession(this.R, data, this.renderer.scene, this.renderer.quality);
    this.renderer.setExposure(data.ambient.exposure);
    this.camera.setYawPitch(data.spawn.yaw, -0.12);
    this.camera.snap();
    this.renderer.prewarm();
    this.collisionView.refresh(this.session.physics);
    this.hud.setZone(data.name.toUpperCase());
  }

  // =========================================================== estados
  private onStateChange(to: GameStateId, from: GameStateId): void {
    const controlling = to === 'hub' || to === 'playing';
    this.input.capturing = controlling;
    this.input.endStep();
    this.sim.reset();
    this.hud.setVisible(controlling || to === 'paused' || to === 'dead');
    if (to === 'title') this.screens.show('title');
    else if (to === 'paused') this.screens.show('pause');
    else this.screens.hide();
    if (!controlling && document.pointerLockElement) document.exitPointerLock();
    this.updateCaptureOverlay();
    void from;
  }

  playArena(): void {
    const s = this.session;
    if (!s) return;
    const sp = s.data.spawn;
    s.respawnAt(new Vector3(sp.pos[0], sp.pos[1] + 0.02, sp.pos[2]), sp.yaw);
    this.camera.setYawPitch(sp.yaw, -0.12);
    this.camera.snap();
    this.hud.setHints([
      { key: 'WASD', text: 'Mover' },
      { key: 'Shift', text: 'Sprint' },
      { key: 'C', text: 'Agacharse · deslizar (corriendo) · cubrirse (junto a pared)' },
      { key: 'Espacio', text: 'Saltar · vault sobre obstáculos bajos' },
      { key: '2× Espacio / Alt', text: 'Esquiva (voltereta)' },
      { key: 'Clic der.', text: 'Apuntar' },
      { key: 'V', text: 'Cambiar de hombro' },
      { key: 'H', text: 'Controles' },
    ]);
    // El clic que llega aquí es un gesto del usuario: se puede pedir el pointer lock.
    this.requestLock();
    this.fsm.go('loading');
    this.fsm.go('playing');
  }

  pause(): void {
    if (this.fsm.state === 'playing' || this.fsm.state === 'hub') {
      this.session?.player.haltOnPause();
      this.fsm.go('paused');
    }
  }

  resume(): void {
    if (this.fsm.state !== 'paused') return;
    this.requestLock();
    this.fsm.go(this.fsm.resumeTo);
  }

  private quitToTitle(): void {
    if (this.fsm.state === 'paused') this.fsm.go('title');
  }

  /** Pointer lock (solo fuera de QA). Si el navegador lo rechaza, queda el aviso "Haz clic para jugar". */
  requestLock(): void {
    if (!this.opts.pointerLock) return;
    const canvas = this.renderer.canvas;
    if (document.pointerLockElement === canvas) return;
    const onFail = (err: unknown): void => {
      // Ocurre p. ej. si se pide < 1 s después de salir con Esc: el aviso de captura sigue visible.
      console.warn('[pointer lock] rechazado:', err instanceof Error ? err.message : err);
      this.updateCaptureOverlay();
    };
    canvas.requestPointerLock({ unadjustedMovement: true }).catch((err: unknown) => {
      // Algunos sistemas no soportan movimiento sin aceleración: se reintenta sin la opción.
      if (err instanceof DOMException && err.name === 'NotSupportedError') canvas.requestPointerLock().catch(onFail);
      else onFail(err);
    });
  }

  private updateCaptureOverlay(): void {
    const need = this.opts.pointerLock && this.fsm.controlling && !this.input.pointerLocked;
    this.captureOverlay.hidden = !need;
  }

  private onInputEvent(e: InputEvent): void {
    switch (e) {
      case 'blur':
      case 'hidden':
        // R6: el input ya se reseteó; el juego se pausa para que nada siga "pulsado".
        this.pause();
        break;
      case 'pointerlock-lost':
        if (this.opts.pointerLock) this.pause();
        this.updateCaptureOverlay();
        break;
      case 'pointerlock-gained':
        this.updateCaptureOverlay();
        break;
      case 'pad-connected':
      case 'pad-disconnected':
        break;
    }
  }

  // =========================================================== bucle
  private frame(realDt: number, now: number): void {
    if (this.pendingLagMs > 0) {
      // QA: pico de lag real (bloquea el hilo) para verificar el clamp de dt y el anti-túnel.
      const until = performance.now() + this.pendingLagMs;
      this.pendingLagMs = 0;
      while (performance.now() < until) {
        /* espera activa intencionada: simula un frame congelado */
      }
    }
    const t0 = performance.now();
    this.renderer.checkResize();
    this.input.pollGamepad();
    this.handleFrameActions();

    const s = this.session;
    const controlling = this.fsm.controlling;
    if (controlling) {
      this.input.consumeMouse(this.mouse);
      this.input.padLookAxis(this.pad);
      this.camera.look(this.mouse.x, this.mouse.y, this.pad.x, this.pad.y, realDt);
    } else {
      this.input.consumeMouse(this.mouse);
    }

    if (this.fsm.simulating && s && !this.manual) {
      const n = this.sim.advance(realDt);
      for (let i = 0; i < n; i++) this.fixedUpdate(FIXED_DT);
    }

    const alpha = this.manual ? 1 : this.sim.alpha;
    if (s && (controlling || this.fsm.state === 'paused' || this.fsm.state === 'dead')) {
      this.updatePlayerView(alpha, realDt);
    } else {
      this.updateAttractCamera(realDt);
    }
    if (s && controlling) this.updateHud(realDt);

    this.debug.update(realDt, () => this.debugText());
    if (this.collisionView.enabled && s) this.collisionView.refresh(s.physics);
    // Sin simulación (menús) no hay pasos que limpien los latches: se limpian por frame.
    if (!this.fsm.simulating) this.input.endStep();
    this.renderer.render();
    this.lastCpuMs = performance.now() - t0;
    this.stats.push(realDt * 1000, this.lastCpuMs);
    this.renderer.updateDynamicResolution(this.stats.avgFrameMs(60), realDt);
    void now;
  }

  /** Acciones de nivel de frame (pausa, ayuda, hombro). Se consumen para no repetirse. */
  private handleFrameActions(): void {
    const inp = this.input;
    // Con la tabla de controles abierta, Esc/H solo la cierran.
    if (this.screens.current === 'controls') {
      if (inp.pressed('pause') || inp.pressed('help')) {
        inp.consume('pause');
        inp.consume('help');
        this.screens.closeControls();
      }
      return;
    }
    if (inp.pressed('pause')) {
      inp.consume('pause');
      if (this.fsm.state === 'paused') this.resume();
      // Con pointer lock, Esc lo libera el navegador y la pausa llega por 'pointerlock-lost'.
      else if (!inp.pointerLocked) this.pause();
    }
    if (inp.pressed('help')) {
      inp.consume('help');
      if (this.fsm.controlling) this.pause();
      if (this.fsm.state === 'paused' || this.fsm.state === 'title') this.screens.show('controls');
    }
    if (this.fsm.controlling && inp.pressed('shoulder')) {
      inp.consume('shoulder');
      this.camera.toggleShoulder();
    }
  }

  private buildIntent(): PlayerIntent {
    const it = this.intent;
    const inp = this.input;
    inp.moveAxis(this.move);
    it.moveX = this.move.x;
    it.moveY = this.move.y;
    it.camYaw = this.camera.yaw;
    it.sprint = inp.isDown('sprint');
    it.aim = inp.isDown('aim');
    it.crouchPressed = inp.pressed('crouch');
    it.jumpPressed = inp.pressed('jump');
    it.dodgePressed = inp.pressed('dodge');
    return it;
  }

  fixedUpdate(dt: number): void {
    const s = this.session;
    if (!s) return;
    const it = this.fsm.controlling ? this.buildIntent() : this.idleIntent;
    s.player.fixedUpdate(dt, it);
    s.physics.step();
    this.steps++;
    if (this.opts.qa) this.checkPlayerInvariants();
    this.input.endStep();
  }

  // =========================================================== vista
  private updatePlayerView(alpha: number, realDt: number): void {
    const s = this.session;
    if (!s) return;
    const p = s.player;
    p.renderFeet(alpha, _feet);
    this.camera.update({ feet: _feet, posture: p.posture, aiming: p.aiming, sprinting: p.sprinting, dt: realDt }, s.physics);
    if (this.opts.qa) this.checkCameraInvariants();
    // Pose del personaje.
    const rig = s.playerRig;
    rig.root.position.copy(_feet);
    const yaw = p.renderYaw(alpha);
    rig.root.rotation.y = yaw;
    const pose = this.pose;
    pose.speed = p.stepSpeed(FIXED_DT);
    const vx = p.feet.x - p.prevFeet.x;
    const vz = p.feet.z - p.prevFeet.z;
    pose.moveAngle = Math.hypot(vx, vz) > 1e-4 ? Math.atan2(-vx, -vz) - yaw : 0;
    pose.state = p.state;
    pose.posture = p.posture;
    pose.grounded = p.grounded;
    pose.aim = p.aiming ? 1 : 0;
    pose.aimPitch = this.camera.pitch;
    pose.stateTime = p.stateTime;
    rig.update(pose, realDt * this.sim.timeScale);
    rig.setOpacity(this.camera.distanceToHead < 0.55 ? 0 : 1);
  }

  private updateAttractCamera(dt: number): void {
    this.orbit += dt * 0.06;
    const cam = this.renderer.camera;
    cam.position.set(Math.sin(this.orbit) * 30, 16, Math.cos(this.orbit) * 30);
    cam.lookAt(_orbitTarget);
  }

  private updateHud(dt: number): void {
    const s = this.session;
    if (!s) return;
    const p = s.player;
    this.peekTimer -= dt;
    if (this.peekTimer <= 0) {
      this.peekTimer = 0.1;
      this.hud.setPrompt(this.contextPrompt());
    }
    this.hud.setSpread(p.aiming ? 4 : p.state === 'ground' && p.horizontalSpeed > 1 ? 14 : 9);
  }

  private contextPrompt(): PromptSpec | null {
    const s = this.session;
    if (!s) return null;
    const p = s.player;
    const lab = (a: Parameters<Input['label']>[0]): string => this.input.label(a);
    if (p.state === 'cover' && p.cover) {
      return p.cover.height === 'low'
        ? { key: `${lab('aim')} / ${lab('jump')}`, text: 'Asomarse · saltar por encima  ·  C: salir' }
        : { key: lab('aim'), text: 'Asomarse  ·  C: salir de cobertura' };
    }
    const ctx = p.peekContext(this.camera.yaw, this.move.x, this.move.y);
    if (ctx.vault) return { key: lab('jump'), text: ctx.vault === 'vault' ? 'Saltar por encima' : 'Subir' };
    if (ctx.cover) return { key: lab('crouch'), text: ctx.cover === 'low' ? 'Cubrirse (cobertura baja)' : 'Cubrirse' };
    return null;
  }

  // =========================================================== QA
  private checkPlayerInvariants(): void {
    const s = this.session;
    if (!s) return;
    const inv = this.invariants;
    inv.steps++;
    const p = s.player;
    if (p.penetration()) {
      inv.penetrations++;
      inv.lastViolation = `penetración en ${p.feet.x.toFixed(2)},${p.feet.y.toFixed(2)},${p.feet.z.toFixed(2)} (${p.state})`;
    }
    const b = s.data.bounds;
    const f = p.feet;
    if (f.x < b.min[0] - 0.5 || f.x > b.max[0] + 0.5 || f.z < b.min[2] - 0.5 || f.z > b.max[2] + 0.5 || f.y > b.max[1] + 2) {
      inv.outOfBounds++;
      inv.lastViolation = `fuera de límites en ${f.x.toFixed(2)},${f.y.toFixed(2)},${f.z.toFixed(2)}`;
    }
  }

  private checkCameraInvariants(): void {
    const s = this.session;
    if (!s) return;
    const inv = this.invariants;
    const cam = this.camera.position;
    if (s.physics.overlapsBall(cam, 0.1, QueryGroups.STATIC)) {
      inv.cameraInside++;
      inv.lastViolation = `cámara dentro de geometría en ${cam.x.toFixed(2)},${cam.y.toFixed(2)},${cam.z.toFixed(2)}`;
    }
    _head.copy(this.camera.pivot);
    if (!s.physics.lineOfSight(cam, _head, QueryGroups.STATIC)) {
      inv.cameraOccluded++;
      inv.lastViolation = `jugador tapado desde la cámara en ${cam.x.toFixed(2)},${cam.y.toFixed(2)},${cam.z.toFixed(2)}`;
    }
  }

  /** QA: avanza `n` pasos fijos de forma determinista (actualiza la cámara en cada paso). */
  stepManual(n: number): void {
    const s = this.session;
    if (!s) return;
    for (let i = 0; i < n; i++) {
      this.camera.look(0, 0, 0, 0, FIXED_DT);
      this.fixedUpdate(FIXED_DT);
      this.updatePlayerView(1, FIXED_DT);
    }
  }

  resetInvariants(): void {
    const inv = this.invariants;
    inv.steps = inv.penetrations = inv.cameraInside = inv.cameraOccluded = inv.outOfBounds = 0;
    inv.lastViolation = '';
    if (this.session) {
      const p = this.session.player;
      p.nanResets = 0;
      p.killPlaneResets = 0;
      p.maxHorizontalSpeed = 0;
    }
  }

  // =========================================================== debug
  private registerDebugCommands(): void {
    const d = this.debug;
    d.addCommand(
      'collisions',
      'Colisiones',
      () => {
        this.collisionView.setEnabled(!this.collisionView.enabled);
        if (this.session) this.collisionView.refresh(this.session.physics);
      },
      { hotkey: 'KeyU', isOn: () => this.collisionView.enabled },
    );
    d.addCommand(
      'nextCheckpoint',
      'Siguiente checkpoint',
      () => {
        const s = this.session;
        if (!s || s.data.checkpoints.length === 0) return;
        this.cpIndex = (this.cpIndex + 1) % s.data.checkpoints.length;
        const cp = s.data.checkpoints[this.cpIndex];
        if (!cp) return;
        s.respawnAt(new Vector3(cp.pos[0], cp.pos[1] + 0.02, cp.pos[2]), cp.yaw);
        this.camera.setYawPitch(cp.yaw, -0.12);
        this.camera.snap();
      },
      { hotkey: 'KeyN' },
    );
    d.addCommand(
      'speed',
      'Velocidad ×3 (estrés)',
      () => {
        const p = this.session?.player;
        if (p) p.speedMultiplier = p.speedMultiplier === 1 ? 3 : 1;
      },
      { hotkey: 'KeyP', isOn: () => (this.session?.player.speedMultiplier ?? 1) !== 1 },
    );
    d.addCommand(
      'slowmo',
      'Cámara lenta',
      () => {
        this.sim.timeScale = this.sim.timeScale === 1 ? 0.25 : 1;
      },
      { hotkey: 'KeyO', isOn: () => this.sim.timeScale !== 1 },
    );
  }

  private cpIndex = 0;

  debugText(): string {
    const info = this.renderer.renderer.info;
    const s = this.session;
    const p = s?.player;
    const lines = [
      `FPS ${this.stats.fps(60).toFixed(0)}  (${this.stats.avgFrameMs(60).toFixed(2)} ms, peor ${this.stats.worstFrameMs(120).toFixed(1)} ms)`,
      `CPU ${this.stats.avgCpuMs(60).toFixed(2)} ms   pasos ${this.steps}   escala de tiempo ×${this.sim.timeScale}`,
      `Draw calls ${info.render.calls}   triángulos ${info.render.triangles}   programas ${info.programs?.length ?? 0}`,
      `Geometrías ${info.memory.geometries}   texturas ${info.memory.textures}`,
      `Resolución ×${this.renderer.pixelRatio.toFixed(2)}  (dinámica ×${this.renderer.dynamicScale.toFixed(1)})  preset ${this.renderer.preset}`,
      `Estado ${this.fsm.state}   nivel ${s?.data.name ?? '—'}   colliders ${s?.physics.colliderCount ?? 0}`,
    ];
    if (p) {
      lines.push(
        `Jugador ${p.feet.x.toFixed(2)}, ${p.feet.y.toFixed(2)}, ${p.feet.z.toFixed(2)}  ${p.state}/${p.posture}  suelo=${p.grounded ? 'sí' : 'no'}  v=${p.stepSpeed(FIXED_DT).toFixed(2)} m/s`,
        `Cámara dist ${this.camera.distanceToHead.toFixed(2)}  yaw ${this.camera.yaw.toFixed(2)}  pitch ${this.camera.pitch.toFixed(2)}`,
        `Input mantenidas ${this.input.heldCount}  pointer lock ${this.input.pointerLocked ? 'sí' : 'no'}  dispositivo ${this.input.lastDevice}`,
      );
    }
    if (this.opts.qa) {
      const v = this.invariants;
      lines.push(`QA penetraciones ${v.penetrations}  cámara dentro ${v.cameraInside}  cámara tapada ${v.cameraOccluded}  fuera ${v.outOfBounds}`);
    }
    lines.push(`GPU ${this.renderer.gpuInfo()}`);
    return lines.join('\n');
  }
}
