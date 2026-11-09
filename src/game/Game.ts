import { Vector3 } from 'three';
import { AudioEngine } from '../audio/AudioEngine';
import { type CombatIntent, emptyCombatIntent } from '../combat/PlayerCombat';
import { STYLE_RANKS } from '../combat/StyleMeter';
import type { WeaponId } from '../combat/weapons';
import type { Action } from '../core/actions';
import { GameStateMachine, type GameStateId } from '../core/GameStateMachine';
import { Input, type InputEvent, type Vec2 } from '../core/Input';
import { AnimationLoop, FIXED_DT, FixedStepAccumulator } from '../core/Loop';
import { wrapAngle } from '../core/math';
import { Rng } from '../core/rng';
import { CollisionDebugView, DebugOverlay } from '../debug/DebugOverlay';
import { FrameStats } from '../debug/FrameStats';
import type { EnemyType } from '../levels/types';
import { idlePose, type RigPose, type WeaponModel } from '../entities/CharacterRig';
import { emptyIntent, type PlayerIntent } from '../entities/PlayerController';
import { loadLevelData } from '../levels/registry';
import type { LevelId } from '../levels/types';
import { loadRapier, QueryGroups, type Rapier } from '../physics/Physics';
import { GameRenderer, type QualityPreset } from '../render/Renderer';
import { hideBoot, setBootProgress } from '../ui/boot';
import { h } from '../ui/dom';
import { Hud, type HudData, type PromptSpec } from '../ui/Hud';
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

const WEAPON_MODEL: Record<WeaponId, WeaponModel> = { carbine: 'rifle', shotgun: 'shotgun', pistol: 'pistol', knife: 'knife' };
const SLOT_ACTIONS: Record<WeaponId, Action> = { carbine: 'weapon1', shotgun: 'weapon1', pistol: 'weapon2', knife: 'weapon3' };
/** Tiempo mínimo en la pantalla de muerte antes de poder reaparecer. */
const DEATH_MIN = 1.2;

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
  readonly audio = new AudioEngine();
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
  /** Inconsistencias de estado de combate detectadas por QA (deben quedar en 0). */
  combatInconsistencies = 0;

  private readonly intent: PlayerIntent = emptyIntent();
  private readonly idleIntent: PlayerIntent = emptyIntent();
  private readonly cIntent: CombatIntent = emptyCombatIntent();
  private readonly idleCIntent: CombatIntent = emptyCombatIntent();
  private readonly move: Vec2 = { x: 0, y: 0 };
  private readonly mouse: Vec2 = { x: 0, y: 0 };
  private readonly pad: Vec2 = { x: 0, y: 0 };
  private readonly pose: RigPose = idlePose();
  private readonly captureOverlay: HTMLDivElement;
  private readonly hudData: HudData;
  private peekTimer = 0;
  private orbit = 0;
  private lastCpuMs = 0;
  private cpIndex = 0;
  private deathTimer = 0;
  private deathSlowmo = 0;
  private lastWeaponModel: WeaponModel = 'pistol';
  private currentLevel: LevelId;

  constructor(gameRoot: HTMLElement, uiRoot: HTMLElement, opts: GameOptions) {
    this.opts = opts;
    this.currentLevel = opts.startLevel;
    this.renderer = new GameRenderer(gameRoot, opts.preset);
    this.input = new Input(this.renderer.canvas);
    this.input.attach();
    this.input.on((e) => this.onInputEvent(e));
    this.camera = new CameraRig(this.renderer.camera, this.rng);
    this.hud = new Hud(uiRoot);
    this.screens = new Screens(uiRoot, this.input, {
      onPlayArena: () => void this.playLevel('arena'),
      onPlayPractice: () => void this.playLevel('practice', { drill: true }),
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
    this.hudData = {
      health: 100,
      maxHealth: 100,
      armor: 60,
      maxArmor: 60,
      weaponName: '',
      mag: 0,
      magMax: 0,
      reserve: 0,
      isGun: true,
      slots: [],
      reload: -1,
      perfect: null,
      spreadPx: 9,
      blocked: false,
      aimOverEnemy: false,
      hitKind: 'none',
      hitT: 0,
      damage: Array.from({ length: 6 }, () => ({ angle: 0, k: 0 })),
      multiplier: 1,
      rankName: STYLE_RANKS[0],
      gauge: 0,
      score: 0,
      feed: [],
      focus: 0,
      focusActive: false,
      focusReady: false,
      focusKey: 'Q',
    };
    this.registerDebugCommands();
    // El primer gesto del usuario desbloquea el audio (política de autoplay).
    const unlockAudio = (): void => this.audio.init();
    window.addEventListener('pointerdown', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
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
    setBootProgress(0.6, 'Preparando el escenario…');
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
    this.session = new LevelSession(data, {
      R: this.R,
      scene: this.renderer.scene,
      quality: this.renderer.quality,
      audio: this.audio,
      rng: this.rng,
      camera: this.camera,
      upgrades: new Set(),
      loadout: ['carbine', 'pistol', 'knife'],
      accuracyMult: 1,
      damageMult: 1,
    });
    this.currentLevel = id;
    this.renderer.setExposure(data.ambient.exposure);
    this.camera.setYawPitch(data.spawn.yaw, -0.12);
    this.camera.snap();
    this.renderer.prewarm();
    this.collisionView.refresh(this.session.physics);
    this.hud.setZone(data.name.toUpperCase());
    this.cpIndex = 0;
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
    if (to !== 'dead') this.hud.hideDeath();
    if (!controlling && document.pointerLockElement && to !== 'dead') document.exitPointerLock();
    this.updateCaptureOverlay();
    void from;
  }

  /** Carga (si hace falta) y empieza a jugar un nivel. */
  async playLevel(id: LevelId, o: { drill?: boolean } = {}): Promise<void> {
    if (this.fsm.state !== 'title' && this.fsm.state !== 'paused') return;
    this.audio.init();
    // El clic que llega aquí es un gesto del usuario: se pide el pointer lock antes del await.
    this.requestLock();
    this.fsm.go('loading');
    if (id !== this.currentLevel || !this.session) await this.loadSession(id);
    const s = this.session;
    if (!s) return;
    const sp = s.data.spawn;
    s.respawnAt(new Vector3(sp.pos[0], sp.pos[1] + 0.02, sp.pos[2]), sp.yaw);
    s.combat.respawnReset();
    if (o.drill) s.enemies.spawnEvent('drill');
    this.camera.setYawPitch(sp.yaw, -0.12);
    this.camera.snap();
    this.setHintsFor(id);
    this.fsm.go('playing');
  }

  /** Atajo usado por la pantalla de título y por QA. */
  playArena(): void {
    void this.playLevel('arena');
  }

  private setHintsFor(id: LevelId): void {
    const lab = (a: Action): string => this.input.label(a);
    if (id === 'arena') {
      this.hud.setHints([
        { key: 'WASD', text: 'Mover' },
        { key: lab('sprint'), text: 'Sprint' },
        { key: lab('crouch'), text: 'Agacharse · deslizar (corriendo) · cubrirse (junto a pared)' },
        { key: lab('jump'), text: 'Saltar · vault sobre obstáculos bajos' },
        { key: `2× ${lab('jump')} / ${lab('dodge')}`, text: 'Esquiva (voltereta)' },
        { key: lab('aim'), text: 'Apuntar' },
        { key: lab('shoulder'), text: 'Cambiar de hombro' },
        { key: lab('help'), text: 'Controles' },
      ]);
    } else {
      this.hud.setHints([
        { key: lab('fire'), text: 'Disparar' },
        { key: lab('aim'), text: 'Apuntar' },
        { key: lab('reload'), text: 'Recargar (otra vez en la zona dorada = perfecta)' },
        { key: '1 / 2 / 3', text: 'Carabina · pistola · cuchillo' },
        { key: lab('takedown'), text: 'Takedown (cerca del enemigo)' },
        { key: lab('focus'), text: 'Foco: cámara lenta' },
        { key: lab('help'), text: 'Controles' },
      ]);
    }
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

  /** Pointer lock. Si el navegador lo rechaza, queda el aviso "Haz clic para jugar". */
  requestLock(): void {
    if (!this.opts.pointerLock) return;
    const canvas = this.renderer.canvas;
    if (document.pointerLockElement === canvas) return;
    const onFail = (err: unknown): void => {
      console.warn('[pointer lock] rechazado:', err instanceof Error ? err.message : err);
      this.updateCaptureOverlay();
    };
    canvas.requestPointerLock({ unadjustedMovement: true }).catch((err: unknown) => {
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
        this.hud.showToast('Gamepad conectado');
        break;
      case 'pad-disconnected':
        this.hud.showToast('Gamepad desconectado');
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
    this.handleFrameActions(realDt);

    const s = this.session;
    const controlling = this.fsm.controlling;
    this.input.consumeMouse(this.mouse);
    if (controlling) {
      this.input.padLookAxis(this.pad);
      this.camera.look(this.mouse.x, this.mouse.y, this.pad.x, this.pad.y, realDt);
    }

    if (s) {
      s.combat.frameUpdate(realDt, this.audio);
      // Foco: cámara lenta; muerte: breve cámara lenta dramática.
      this.deathSlowmo = Math.max(0, this.deathSlowmo - realDt);
      this.sim.timeScale = this.deathSlowmo > 0 ? 0.4 : s.combat.timeScale;
      this.audio.setMuffle(s.combat.focusActive ? 0.55 : 0);
    }
    if (this.fsm.simulating && s && !this.manual) {
      const n = this.sim.advance(realDt);
      for (let i = 0; i < n; i++) this.fixedUpdate(FIXED_DT);
    }

    const alpha = this.manual ? 1 : this.sim.alpha;
    const scaledDt = realDt * this.sim.timeScale;
    if (s && (controlling || this.fsm.state === 'paused' || this.fsm.state === 'dead')) {
      this.updatePlayerView(alpha, realDt, scaledDt);
      s.enemies.renderUpdate(alpha, scaledDt);
      s.vfx.update(scaledDt);
    } else {
      this.updateAttractCamera(realDt);
    }
    if (s && (controlling || this.fsm.state === 'dead')) this.updateHud(realDt);
    this.audio.setListener(this.renderer.camera.position, this.camera.forward);

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

  /** Acciones de nivel de frame (pausa, ayuda, hombro, reaparecer). Se consumen para no repetirse. */
  private handleFrameActions(realDt: number): void {
    const inp = this.input;
    if (this.screens.current === 'controls') {
      if (inp.pressed('pause') || inp.pressed('help')) {
        inp.consume('pause');
        inp.consume('help');
        this.screens.closeControls();
      }
      return;
    }
    if (this.fsm.state === 'dead') {
      this.deathTimer += realDt;
      if (this.deathTimer >= DEATH_MIN && (inp.pressed('jump') || inp.pressed('fire') || inp.pressed('interact'))) {
        inp.consume('jump');
        inp.consume('fire');
        inp.consume('interact');
        this.respawn();
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

  private buildCombatIntent(): CombatIntent {
    const c = this.cIntent;
    const inp = this.input;
    c.fireHeld = inp.isDown('fire');
    c.firePressed = inp.pressed('fire');
    c.aim = inp.isDown('aim');
    c.reloadPressed = inp.pressed('reload');
    c.takedownPressed = inp.pressed('takedown');
    c.focusPressed = inp.pressed('focus');
    c.select = inp.pressed('weapon1') ? 'carbine' : inp.pressed('weapon2') ? 'pistol' : inp.pressed('weapon3') ? 'knife' : null;
    c.cycle = inp.pressed('weaponNext') ? 1 : inp.pressed('weaponPrev') ? -1 : 0;
    return c;
  }

  fixedUpdate(dt: number): void {
    const s = this.session;
    if (!s) return;
    const controlling = this.fsm.controlling;
    const it = controlling ? this.buildIntent() : this.idleIntent;
    s.player.fixedUpdate(dt, it);
    const ci = controlling ? this.buildCombatIntent() : this.idleCIntent;
    if (s.infiniteAmmo) s.combat.weapon.mag = Math.max(s.combat.weapon.mag, 1);
    s.combat.fixedUpdate(dt, ci, s.ctx);
    s.enemies.fixedUpdate(dt, s.updateTarget(dt));
    s.pickups.update(dt);
    s.physics.step();
    this.steps++;
    if (this.opts.qa) {
      this.checkPlayerInvariants();
      this.checkCombatInvariants();
    }
    if (s.combat.dead && this.fsm.state === 'playing') this.onPlayerDeath();
    this.input.endStep();
  }

  private onPlayerDeath(): void {
    const s = this.session;
    if (!s) return;
    this.fsm.go('dead');
    this.deathTimer = 0;
    this.deathSlowmo = 0.9;
    const lab = this.input.label('jump');
    this.hud.showDeath(s.combat.deathCause(this.camera.yaw), `Pulsa ${lab} o clic para reaparecer`);
  }

  private respawn(): void {
    const s = this.session;
    if (!s || this.fsm.state !== 'dead') return;
    const sp = s.data.spawn;
    s.respawnAt(new Vector3(sp.pos[0], sp.pos[1] + 0.02, sp.pos[2]), sp.yaw);
    s.combat.respawnReset();
    s.enemies.resetAlive();
    this.camera.setYawPitch(sp.yaw, -0.12);
    this.camera.snap();
    this.hud.hideDeath();
    this.fsm.go('playing');
  }

  // =========================================================== vista
  private updatePlayerView(alpha: number, realDt: number, scaledDt: number): void {
    const s = this.session;
    if (!s) return;
    const p = s.player;
    p.renderFeet(alpha, _feet);
    this.camera.update({ feet: _feet, posture: p.posture, aiming: p.aiming, sprinting: p.sprinting, dt: realDt }, s.physics);
    if (this.opts.qa) this.checkCameraInvariants();
    const rig = s.playerRig;
    rig.root.position.copy(_feet);
    const yaw = p.renderYaw(alpha);
    rig.root.rotation.y = yaw;
    const c = s.combat;
    const model = WEAPON_MODEL[c.current];
    if (model !== this.lastWeaponModel) {
      this.lastWeaponModel = model;
      rig.setWeapon(model);
    }
    const pose = this.pose;
    pose.speed = p.stepSpeed(FIXED_DT);
    const vx = p.feet.x - p.prevFeet.x;
    const vz = p.feet.z - p.prevFeet.z;
    pose.moveAngle = Math.hypot(vx, vz) > 1e-4 ? Math.atan2(-vx, -vz) - yaw : 0;
    pose.state = p.state;
    pose.posture = p.posture;
    pose.grounded = p.grounded;
    pose.aim = p.aiming || c.weapon.cooldown > 0 ? 1 : 0;
    pose.aimPitch = this.camera.pitch;
    pose.stateTime = p.stateTime;
    pose.reload = c.weapon.reloadProgress;
    pose.recoil = c.recoilVis;
    pose.melee = c.meleeT > 0 ? Math.sin((1 - c.meleeT / 0.45) * Math.PI) : 0;
    rig.update(pose, scaledDt);
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
    const c = s.combat;
    const w = c.weapon;
    const d = this.hudData;
    d.health = c.vitals.health;
    d.maxHealth = c.vitals.maxHealth;
    d.armor = c.vitals.armor;
    d.maxArmor = c.vitals.maxArmor;
    d.weaponName = w.def.name;
    d.isGun = w.isGun;
    d.mag = w.mag;
    d.magMax = w.def.mag;
    d.reserve = w.reserve;
    if (d.slots.length !== c.loadout.length) d.slots = c.loadout.map(() => ({ key: '', name: '', active: false }));
    c.loadout.forEach((id, i) => {
      const slot = d.slots[i]!;
      slot.key = this.input.label(SLOT_ACTIONS[id]);
      slot.name = id === 'carbine' ? 'Carabina' : id === 'shotgun' ? 'Escopeta' : id === 'pistol' ? 'Pistola' : 'Cuchillo';
      slot.active = id === c.current;
    });
    d.reload = w.reloadProgress;
    d.perfect = w.perfectAvailable ? w.perfectWindow : null;
    // Spread (grados) → px en pantalla según el FOV actual.
    const fov = (this.renderer.camera.fov * Math.PI) / 180;
    const pxPerRad = window.innerHeight / 2 / Math.tan(fov / 2);
    d.spreadPx = Math.max(4, Math.min(60, Math.tan((c.spreadDeg * Math.PI) / 180) * pxPerRad));
    d.blocked = c.blocked;
    d.aimOverEnemy = c.aimOver === 'enemy';
    d.hitKind = c.hitMarker.kind;
    d.hitT = c.hitMarker.t;
    for (let i = 0; i < d.damage.length; i++) {
      const src = c.damageDirs[i]!;
      const slot = d.damage[i]!;
      slot.k = src.t > 0 ? Math.min(1, src.t / 0.6) : 0;
      if (slot.k > 0) slot.angle = wrapAngle(Math.atan2(-(src.from.x - s.player.feet.x), -(src.from.z - s.player.feet.z)) - this.camera.yaw);
    }
    d.multiplier = c.style.multiplier;
    d.rankName = c.style.rankName;
    d.gauge = c.style.gauge;
    d.score = c.style.score;
    d.feed = c.feed;
    d.focus = c.focus;
    d.focusActive = c.focusActive;
    d.focusReady = c.focus >= 30;
    d.focusKey = this.input.label('focus');
    this.hud.update(d, dt);
    this.peekTimer -= dt;
    if (this.peekTimer <= 0) {
      this.peekTimer = 0.1;
      this.hud.setPrompt(this.contextPrompt());
    }
  }

  private contextPrompt(): PromptSpec | null {
    const s = this.session;
    if (!s || this.fsm.state !== 'playing') return null;
    const p = s.player;
    const lab = (a: Action): string => this.input.label(a);
    if (s.combat.takedownCandidate(s.ctx)) return { key: lab('takedown'), text: 'Takedown' };
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

  /** Checklist ítem 7: ningún estado de combate inconsistente tras cualquier secuencia de acciones. */
  private checkCombatInvariants(): void {
    const s = this.session;
    if (!s) return;
    const c = s.combat;
    const p = s.player;
    for (const w of c.weapons.values()) {
      const bad = w.mag < 0 || w.mag > w.def.mag || w.reserve < 0 || Number.isNaN(w.reserve) || (w.reloading && !w.isGun) || (w.reloading && w.reloadT > w.reloadDur + 0.05);
      if (bad) {
        this.combatInconsistencies++;
        this.invariants.lastViolation = `arma ${w.def.id} inconsistente: mag=${w.mag} reserva=${w.reserve} recargando=${w.reloading}`;
      }
    }
    if (c.takedown && p.state !== 'locked' && !c.dead) {
      this.combatInconsistencies++;
      this.invariants.lastViolation = 'takedown activo sin jugador bloqueado';
    }
    if (!c.takedown && p.state === 'locked') {
      this.combatInconsistencies++;
      this.invariants.lastViolation = 'jugador bloqueado sin takedown';
    }
    if (c.dead !== (p.state === 'dead')) {
      this.combatInconsistencies++;
      this.invariants.lastViolation = `muerte desincronizada: combate=${c.dead} jugador=${p.state}`;
    }
    if (c.vitals.health < 0 || c.vitals.armor < 0 || c.vitals.health > c.vitals.maxHealth) {
      this.combatInconsistencies++;
      this.invariants.lastViolation = 'vitales fuera de rango';
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
      this.updatePlayerView(1, FIXED_DT, FIXED_DT);
      s.enemies.renderUpdate(1, FIXED_DT);
      s.vfx.update(FIXED_DT);
      s.combat.frameUpdate(FIXED_DT, this.audio);
    }
  }

  /** QA: recoloca la cámara para el yaw/pitch actual sin avanzar la simulación. */
  stepManualCameraOnly(): void {
    const s = this.session;
    if (!s) return;
    s.player.renderFeet(1, _feet);
    this.camera.update({ feet: _feet, posture: s.player.posture, aiming: s.player.aiming, sprinting: s.player.sprinting, dt: 0 }, s.physics);
  }

  /** QA: repinta el HUD ya (sin esperar al frame; los marcadores duran décimas de segundo). */
  qaRefreshHud(): void {
    this.updateHud(0);
  }

  /** QA: reaparecer sin esperar la pantalla de muerte. */
  qaRespawn(): void {
    if (this.fsm.state === 'dead') this.respawn();
  }

  resetInvariants(): void {
    const inv = this.invariants;
    inv.steps = inv.penetrations = inv.cameraInside = inv.cameraOccluded = inv.outOfBounds = 0;
    inv.lastViolation = '';
    this.combatInconsistencies = 0;
    if (this.session) {
      const p = this.session.player;
      p.nanResets = 0;
      p.killPlaneResets = 0;
      p.maxHorizontalSpeed = 0;
    }
  }

  /** QA/debug: aparece un enemigo alertado delante del jugador. */
  spawnEnemyAhead(type: EnemyType, dist = 10): void {
    const s = this.session;
    if (!s) return;
    const f = s.player.feet;
    const yaw = this.camera.yaw;
    const x = f.x - Math.sin(yaw) * dist;
    const z = f.z - Math.cos(yaw) * dist;
    const n = s.nav.nearestNode(x, f.y, z, 4);
    if (n < 0) return;
    const pos = s.nav.pos(n, new Vector3());
    s.enemies.spawnAt(type, pos, yaw + Math.PI, f.clone());
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
      'god',
      'God mode',
      () => {
        if (this.session) this.session.god = !this.session.god;
      },
      { hotkey: 'KeyG', isOn: () => !!this.session?.god },
    );
    d.addCommand(
      'ammo',
      'Munición infinita',
      () => {
        if (this.session) this.session.infiniteAmmo = !this.session.infiniteAmmo;
      },
      { hotkey: 'KeyM', isOn: () => !!this.session?.infiniteAmmo },
    );
    d.addCommand('spawn', 'Spawn enemigo', () => this.spawnEnemyAhead(this.rng.pick(['thug', 'escort', 'heavy'] as const)), { hotkey: 'KeyJ' });
    d.addCommand(
      'killAll',
      'Matar enemigos',
      () => {
        const s = this.session;
        if (!s) return;
        for (const e of s.enemies.enemies) if (e.alive) e.applyHit(9999, 'body', s.player.feet, 1, true);
      },
      { hotkey: 'KeyK' },
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
        const c = this.session?.combat;
        if (c) {
          c.focus = 100;
          c.focusActive = !c.focusActive;
        }
      },
      { hotkey: 'KeyO', isOn: () => !!this.session?.combat.focusActive },
    );
  }

  debugText(): string {
    const info = this.renderer.renderer.info;
    const s = this.session;
    const p = s?.player;
    const lines = [
      `FPS ${this.stats.fps(60).toFixed(0)}  (${this.stats.avgFrameMs(60).toFixed(2)} ms, peor ${this.stats.worstFrameMs(120).toFixed(1)} ms)`,
      `CPU ${this.stats.avgCpuMs(60).toFixed(2)} ms   pasos ${this.steps}   escala de tiempo ×${this.sim.timeScale.toFixed(2)}`,
      `Draw calls ${info.render.calls}   triángulos ${info.render.triangles}   programas ${info.programs?.length ?? 0}`,
      `Geometrías ${info.memory.geometries}   texturas ${info.memory.textures}`,
      `Resolución ×${this.renderer.pixelRatio.toFixed(2)}  (dinámica ×${this.renderer.dynamicScale.toFixed(1)})  preset ${this.renderer.preset}`,
      `Estado ${this.fsm.state}   nivel ${s?.data.name ?? '—'}   colliders ${s?.physics.colliderCount ?? 0}   nav ${s?.nav.nodeCount ?? 0} nodos`,
    ];
    if (p && s) {
      const ai = s.enemies.qaStats();
      lines.push(
        `Jugador ${p.feet.x.toFixed(2)}, ${p.feet.y.toFixed(2)}, ${p.feet.z.toFixed(2)}  ${p.state}/${p.posture}  suelo=${p.grounded ? 'sí' : 'no'}  v=${p.stepSpeed(FIXED_DT).toFixed(2)} m/s`,
        `Salud ${Math.ceil(s.combat.vitals.health)}  armadura ${Math.ceil(s.combat.vitals.armor)}  arma ${s.combat.current} ${s.combat.weapon.mag}/${s.combat.weapon.reserve}`,
        `Enemigos vivos ${ai.alive}/${ai.total}  atascos ${ai.stuckEvents}  máx. sin avanzar ${ai.maxNoProgress.toFixed(1)} s  ${Object.entries(ai.states).map(([k, v]) => `${k}:${v}`).join(' ')}`,
        `Cámara dist ${this.camera.distanceToHead.toFixed(2)}  yaw ${this.camera.yaw.toFixed(2)}  pitch ${this.camera.pitch.toFixed(2)}`,
        `Input mantenidas ${this.input.heldCount}  pointer lock ${this.input.pointerLocked ? 'sí' : 'no'}  dispositivo ${this.input.lastDevice}`,
      );
    }
    if (this.opts.qa) {
      const v = this.invariants;
      lines.push(`QA penetraciones ${v.penetrations}  cámara dentro ${v.cameraInside}  tapada ${v.cameraOccluded}  fuera ${v.outOfBounds}  combate ${this.combatInconsistencies}`);
    }
    lines.push(`GPU ${this.renderer.gpuInfo()}`);
    return lines.join('\n');
  }
}
