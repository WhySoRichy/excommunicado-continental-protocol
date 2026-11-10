import { Vector3 } from 'three';
import { AudioEngine } from '../audio/AudioEngine';
import { type CombatIntent, emptyCombatIntent } from '../combat/PlayerCombat';
import { STYLE_RANKS } from '../combat/StyleMeter';
import type { UpgradeId, WeaponId } from '../combat/weapons';
import type { Action } from '../core/actions';
import { GameStateMachine, type GameStateId } from '../core/GameStateMachine';
import { Input, type InputEvent, type Vec2 } from '../core/Input';
import { AnimationLoop, FIXED_DT, FixedStepAccumulator } from '../core/Loop';
import { wrapAngle } from '../core/math';
import { Rng } from '../core/rng';
import { BrowserStore, deleteProfile, type KeyValueStore, loadProfile, newProfile, type Profile, PROFILE_KEY, saveProfile } from '../core/Save';
import { CollisionDebugView, DebugOverlay } from '../debug/DebugOverlay';
import { FrameStats } from '../debug/FrameStats';
import { idlePose, type RigPose, type WeaponModel } from '../entities/CharacterRig';
import { emptyIntent, type PlayerIntent } from '../entities/PlayerController';
import { DIALOGUE, HUB_TEXT, rulesPlaque } from '../hub/dialogue';
import { addCoins, buy } from '../hub/economy';
import { HubDirector } from '../hub/HubDirector';
import { loadLevelData } from '../levels/registry';
import type { EnemyType, InteractableDef, LevelId } from '../levels/types';
import { MissionDirector, type MissionOutcome } from '../missions/MissionDirector';
import { type MissionId, MISSIONS } from '../missions/types';
import { loadRapier, QueryGroups, type Rapier } from '../physics/Physics';
import { GameRenderer, type QualityPreset } from '../render/Renderer';
import { hideBoot, setBootProgress } from '../ui/boot';
import { h } from '../ui/dom';
import { Hud, type HudData, type PromptSpec } from '../ui/Hud';
import { type ResultsView, Screens } from '../ui/Screens';
import { CameraRig } from './CameraRig';
import { LevelSession } from './LevelSession';

export interface GameOptions {
  qa: boolean;
  preset: QualityPreset;
  startLevel: LevelId;
  /** Usar pointer lock real (por defecto: sí fuera de QA; `?lock=1` lo fuerza en QA). */
  pointerLock: boolean;
  /** Almacén del guardado (tests inyectan uno en memoria). */
  store?: KeyValueStore;
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
/** Nivel que se carga para cada contrato. */
const MISSION_LEVEL: Record<MissionId, LevelId> = { practice: 'practice', nightclub: 'nightclub', docks: 'docks', rooftop: 'rooftop', gauntlet: 'hub' };
const SUB_LABELS = { time: 'Tiempo', accuracy: 'Precisión', damage: 'Daño recibido', variety: 'Variedad', civilians: 'Civiles ilesos' } as const;
/** Margen (fracción de media pantalla) donde se pega la flecha de la baliza fuera de pantalla. */
const BEACON_EDGE = 0.88;
const SLOT_ACTIONS: Record<WeaponId, Action> = { carbine: 'weapon1', shotgun: 'weapon1', pistol: 'weapon2', knife: 'weapon3' };
/** Tiempo mínimo en la pantalla de muerte antes de poder reaparecer. */
const DEATH_MIN = 1.2;
/** Autoguardado del tiempo de juego. */
const AUTOSAVE_SEC = 30;

const _head = new Vector3();
const _feet = new Vector3();
const _beacon = new Vector3();
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
  readonly store: KeyValueStore;
  profile: Profile;
  R: Rapier | null = null;
  session: LevelSession | null = null;
  director: HubDirector | null = null;
  ready = false;
  steps = 0;
  /** QA: la simulación solo avanza con qa.step() (determinista, independiente del FPS). */
  manual = false;
  readonly invariants: QaInvariants = { steps: 0, penetrations: 0, cameraInside: 0, cameraOccluded: 0, outOfBounds: 0, lastViolation: '' };
  /** Milisegundos de "pico de lag" a simular en el próximo frame (QA). */
  pendingLagMs = 0;
  /** Inconsistencias de estado de combate detectadas por QA (deben quedar en 0). */
  combatInconsistencies = 0;
  currentLevel: LevelId;
  /** Contrato en curso (null en el hub y en la arena). */
  mission: MissionDirector | null = null;
  lastMission: MissionId | null = null;
  outcome: MissionOutcome | null = null;
  /** Interactivos de misión ya usados (no vuelven a mostrar prompt). */
  readonly usedInteractables = new Set<string>();

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
  private deathReturn: 'hub' | 'playing' = 'playing';
  private lastWeaponModel: WeaponModel = 'pistol';
  private loading = false;
  private autosaveT = 0;
  private nearInteractable: InteractableDef | null = null;
  /** Progreso de una interacción mantenida (s). */
  private holdT = 0;

  constructor(gameRoot: HTMLElement, uiRoot: HTMLElement, opts: GameOptions) {
    this.opts = opts;
    this.currentLevel = opts.startLevel;
    this.store = opts.store ?? new BrowserStore();
    const loaded = loadProfile(this.store);
    this.profile = loaded.profile;
    if (loaded.status === 'reset-corrupt') console.warn('[save] la partida guardada estaba corrupta; se empezó una nueva (copia en localStorage).');
    this.renderer = new GameRenderer(gameRoot, opts.preset);
    this.input = new Input(this.renderer.canvas);
    this.input.attach();
    this.input.on((e) => this.onInputEvent(e));
    this.camera = new CameraRig(this.renderer.camera, this.rng);
    this.hud = new Hud(uiRoot);
    this.screens = new Screens(
      uiRoot,
      this.input,
      {
        onContinue: () => void this.goToHub(),
        onNewGame: () => this.newGame(),
        onPlayArena: () => void this.playLevel('arena'),
        onPlayPractice: () => void this.playLevel('practice', { drill: true }),
        onResume: () => this.resume(),
        onReturnToHub: () => void this.goToHub(),
        onQuitToTitle: () => this.quitToTitle(),
        onCloseMenu: () => this.closeMenu(),
        onBuy: (id) => this.buyUpgrade(id),
        onStartMission: (id) => this.startMission(id),
        hasSave: () => this.store.get(PROFILE_KEY) !== null,
        inHub: () => this.currentLevel === 'hub',
        profile: () => this.profile,
      },
      opts.qa,
    );
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
      aimOverCivilian: false,
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
    // Guardar al salir o al ocultar la pestaña.
    window.addEventListener('pagehide', () => this.saveNow());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.saveNow();
    });
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
    setBootProgress(0.6, 'Preparando el Continental…');
    await this.loadSession(this.opts.startLevel);
    setBootProgress(1, 'Listo');
    hideBoot(this.opts.qa);
    this.loop.start();
    this.fsm.go('title');
    this.ready = true;
  }

  async loadSession(id: LevelId): Promise<void> {
    if (!this.R) throw new Error('loadSession antes de boot()');
    const data = await loadLevelData(id);
    this.director?.dispose();
    this.director = null;
    this.mission = null;
    this.usedInteractables.clear();
    this.holdT = 0;
    this.session?.dispose();
    this.session = new LevelSession(data, {
      R: this.R,
      scene: this.renderer.scene,
      quality: this.renderer.quality,
      audio: this.audio,
      rng: this.rng,
      camera: this.camera,
      upgrades: new Set(this.profile.upgrades),
      accuracyMult: 1,
      damageMult: 1,
      onEnemyAlert: (e) => this.mission?.onEnemyAlert(e),
      onCivilianHurt: (killed) => this.mission?.onCivilianHurt(killed),
    });
    this.currentLevel = id;
    this.renderer.setExposure(data.ambient.exposure);
    this.camera.setYawPitch(data.spawn.yaw, -0.12);
    this.camera.snap();
    this.renderer.prewarm();
    this.collisionView.refresh(this.session.physics);
    this.hud.setZone(data.name.toUpperCase());
    this.hud.setObjective('');
    this.hud.setMarkers(0, 0);
    this.hud.setCombatVisible(true);
    this.audio.ambience(data.ambience);
    this.cpIndex = 0;
    this.lastWeaponModel = 'none';
  }

  // =========================================================== guardado
  saveNow(): void {
    this.profile.playtimeSec += Math.floor(this.autosaveT);
    this.autosaveT = 0;
    saveProfile(this.store, this.profile);
  }

  private newGame(): void {
    deleteProfile(this.store);
    this.profile = newProfile();
    saveProfile(this.store, this.profile);
    void this.goToHub();
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
    else if (to !== 'hubMenu') this.screens.hide();
    if (to !== 'dead') this.hud.hideDeath();
    if (!controlling && document.pointerLockElement && to !== 'dead') document.exitPointerLock();
    this.updateCaptureOverlay();
    void from;
  }

  /** Entra (o vuelve) al Continental. */
  async goToHub(): Promise<void> {
    if (this.loading || !this.fsm.can('loading')) return;
    this.loading = true;
    this.audio.init();
    this.requestLock();
    this.fsm.go('loading');
    if (this.currentLevel !== 'hub' || !this.session) await this.loadSession('hub');
    const s = this.session;
    if (!s) {
      this.loading = false;
      return;
    }
    const sp = s.data.spawn;
    s.respawnAt(new Vector3(sp.pos[0], sp.pos[1] + 0.02, sp.pos[2]), sp.yaw);
    s.combat.respawnReset();
    this.camera.setYawPitch(sp.yaw, -0.12);
    this.camera.snap();
    this.director?.dispose();
    this.director = new HubDirector({
      session: s,
      hud: this.hud,
      audio: this.audio,
      profile: this.profile,
      save: () => this.saveNow(),
      dialog: (d) => this.openMenu(() => this.screens.showDialog(d)),
    });
    this.setHintsFor('hub');
    this.fsm.go('hub');
    this.loading = false;
  }

  /**
   * Carga un nivel como SANDBOX (sin contrato): la arena de pruebas y, en QA, el campo de
   * práctica con el simulacro ya en marcha (`drill`). Los contratos reales van por `startContract`.
   */
  async playLevel(id: LevelId, o: { drill?: boolean } = {}): Promise<void> {
    if (this.loading || !this.fsm.can('loading')) return;
    this.loading = true;
    this.audio.init();
    // El clic/tecla que llega aquí es un gesto del usuario: se pide el pointer lock antes del await.
    this.requestLock();
    this.fsm.go('loading');
    if (id !== this.currentLevel || !this.session || this.director || this.mission) await this.loadSession(id);
    const s = this.session;
    if (!s) {
      this.loading = false;
      return;
    }
    const sp = s.data.spawn;
    s.respawnAt(new Vector3(sp.pos[0], sp.pos[1] + 0.02, sp.pos[2]), sp.yaw);
    s.combat.respawnReset();
    if (o.drill) s.enemies.spawnEvent('drill');
    this.camera.setYawPitch(sp.yaw, -0.12);
    this.camera.snap();
    this.setHintsFor(id);
    this.fsm.go('playing');
    this.loading = false;
  }

  /** Atajo usado por la pantalla de título y por QA. */
  playArena(): void {
    void this.playLevel('arena');
  }

  private startMission(id: MissionId): void {
    if (MISSIONS[id].available) void this.startContract(id);
  }

  /** Contrato real: nivel nuevo, director de misión y briefing de 3 líneas antes de jugar. */
  async startContract(id: MissionId): Promise<void> {
    if (this.loading || !this.fsm.can('loading')) return;
    this.loading = true;
    this.audio.init();
    this.fsm.go('loading');
    await this.loadSession(MISSION_LEVEL[id]);
    const s = this.session;
    if (!s) {
      this.loading = false;
      return;
    }
    this.lastMission = id;
    this.outcome = null;
    this.mission = new MissionDirector({
      session: s,
      hud: this.hud,
      audio: this.audio,
      profile: this.profile,
      save: () => this.saveNow(),
      onFinished: (o) => this.onMissionFinished(o),
    });
    this.hud.setMarkers(0, this.mission.markersTotal);
    this.setHintsFor(s.data.id);
    this.fsm.go('briefing');
    this.screens.showBriefing(
      MISSIONS[id],
      () => this.beginContract(),
      () => void this.goToHub(),
    );
    this.loading = false;
  }

  /** "Empezar" en el briefing. */
  beginContract(): void {
    if (this.fsm.state !== 'briefing') return;
    this.screens.hide();
    this.requestLock();
    this.fsm.go('playing');
  }

  private onMissionFinished(o: MissionOutcome): void {
    this.outcome = o;
    if (this.fsm.state === 'playing' || this.fsm.state === 'dead') this.fsm.go('results');
    const subs: ResultsView['subs'] = [
      { label: SUB_LABELS.time, value: o.rank.subs.time },
      { label: SUB_LABELS.accuracy, value: o.rank.subs.accuracy },
      { label: SUB_LABELS.damage, value: o.rank.subs.damage },
      { label: SUB_LABELS.variety, value: o.rank.subs.variety },
    ];
    if (o.rank.subs.civilians !== null) subs.push({ label: SUB_LABELS.civilians, value: o.rank.subs.civilians });
    const view: ResultsView = {
      missionName: MISSIONS[o.mission].name,
      success: o.success,
      failReason: o.failReason,
      rank: o.rank.rank,
      total: o.rank.total,
      capped: o.rank.capped,
      subs,
      timeSec: o.timeSec,
      kills: o.kills,
      markersUsed: o.markersUsed,
      markersTotal: o.markersTotal,
      coins: o.coinsReward,
      achievements: o.achievements.map((a) => ({ name: a.name, coins: a.coins })),
      newBest: o.newBest,
      styleScore: this.session?.combat.style.score ?? 0,
    };
    this.audio.ui(o.success ? 'coin' : 'error');
    this.screens.showResults(
      view,
      () => void this.startContract(o.mission),
      () => void this.goToHub(),
    );
  }

  private setHintsFor(id: LevelId): void {
    const lab = (a: Action): string => this.input.label(a);
    if (id === 'hub') {
      this.hud.setHints([
        { key: 'WASD', text: 'Mover' },
        { key: lab('interact'), text: 'Hablar · leer · usar el ascensor' },
        { key: lab('sprint'), text: 'Sprint' },
        { key: lab('help'), text: 'Controles' },
      ]);
    } else if (id === 'arena') {
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
    if (this.fsm.state !== 'paused') return;
    this.saveNow();
    this.fsm.go('title');
  }

  // =========================================================== menús del hub
  private openMenu(show: () => void): void {
    if (this.fsm.state === 'hub') this.fsm.go('hubMenu');
    else if (this.fsm.state !== 'hubMenu') return;
    this.session?.player.haltOnPause();
    show();
  }

  closeMenu(): void {
    if (this.fsm.state !== 'hubMenu') return;
    this.screens.hide();
    this.requestLock();
    this.fsm.go('hub');
  }

  private buyUpgrade(id: UpgradeId): void {
    if (!buy(this.profile, id)) {
      this.audio.ui('error');
      return;
    }
    this.audio.ui('coin');
    this.saveNow();
    this.session?.combat.applyOwned(new Set(this.profile.upgrades));
    this.screens.refresh();
  }

  /** Acción de un interactivo (E). */
  private interact(it: InteractableDef): void {
    const p = this.profile;
    this.audio.ui('click');
    switch (it.action) {
      case 'talk:charon':
        if (!p.flags.charonMet) {
          this.openMenu(() =>
            this.screens.showDialog(DIALOGUE.charonFirst, () => {
              p.flags.charonMet = true;
              this.saveNow();
              this.hud.setObjective(HUB_TEXT.objectiveHub);
              this.screens.show('contracts');
            }),
          );
        } else this.openMenu(() => this.screens.showDialog(DIALOGUE.charonBoard, () => this.screens.show('contracts')));
        break;
      case 'talk:sommelier': {
        const first = !p.flags.sommelierMet;
        this.openMenu(() =>
          this.screens.showDialog(first ? DIALOGUE.sommelierFirst : DIALOGUE.sommelierRepeat, () => {
            p.flags.sommelierMet = true;
            this.screens.show('shop');
          }),
        );
        break;
      }
      case 'talk:winston': {
        const first = !p.flags.winstonMet;
        this.openMenu(() =>
          this.screens.showDialog(first ? DIALOGUE.winstonFirst : DIALOGUE.winstonRepeat, () => {
            p.flags.winstonMet = true;
            this.saveNow();
            this.closeMenu();
          }),
        );
        break;
      }
      case 'read:rules': {
        const lab = (a: Action): string => this.input.label(a);
        this.openMenu(() =>
          this.screens.showDialog(
            rulesPlaque({ interact: lab('interact'), fire: lab('fire'), crouch: lab('crouch'), jump: lab('jump'), takedown: lab('takedown'), reload: lab('reload'), focus: lab('focus'), sprint: lab('sprint') }),
          ),
        );
        break;
      }
      case 'goto:practice':
        void this.startContract('practice');
        break;
      case 'goto:hub':
        void this.goToHub();
        break;
      default:
        if (this.mission) {
          // Interactivo de misión (terminal, cargamento, panel de alarma).
          this.mission.onInteract(it.id);
          this.usedInteractables.add(it.id);
          this.nearInteractable = null;
          this.audio.ui('confirm');
        } else console.warn('[hub] acción desconocida', it.action);
    }
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
      this.autosaveT += realDt;
      if (this.autosaveT >= AUTOSAVE_SEC) this.saveNow();
    }

    if (s) {
      s.combat.frameUpdate(realDt, this.audio);
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
    const inWorld = controlling || this.fsm.state === 'paused' || this.fsm.state === 'dead' || this.fsm.state === 'hubMenu';
    if (s && inWorld) {
      this.updatePlayerView(alpha, realDt, scaledDt);
      s.enemies.renderUpdate(alpha, scaledDt);
      s.civilians?.renderUpdate(alpha, scaledDt);
      s.vfx.update(scaledDt);
      s.renderNpcs(scaledDt);
      this.director?.frameUpdate(scaledDt);
      if (controlling) this.updateBeacon();
    } else {
      this.updateAttractCamera(realDt);
    }
    if (s && (controlling || this.fsm.state === 'dead')) this.updateHud(realDt);
    this.audio.setListener(this.renderer.camera.position, this.camera.forward);

    this.debug.update(realDt, () => this.debugText());
    if (this.collisionView.enabled && s) this.collisionView.refresh(s.physics);
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
    if (this.fsm.state === 'hubMenu') {
      // Esc cierra tienda/contratos (el diálogo lo gestiona Screens con E/Enter).
      if (inp.pressed('pause') && this.screens.current !== 'dialog') {
        inp.consume('pause');
        this.closeMenu();
      }
      return;
    }
    if (this.fsm.state === 'briefing' || this.fsm.state === 'results') return;
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
    // Interactuar (E) tiene prioridad sobre saltar cuando hay algo delante (comparten botón A en gamepad).
    const near = this.nearInteractable;
    if (controlling && near && !this.director?.hostile) {
      const hold = near.hold ?? 0;
      if (hold > 0) {
        if (this.input.isDown('interact')) {
          this.input.consume('jump');
          this.holdT += dt;
          if (this.holdT >= hold) {
            this.holdT = 0;
            this.interact(near);
          }
        } else this.holdT = 0;
      } else if (this.input.pressed('interact')) {
        this.input.consume('interact');
        this.input.consume('jump');
        this.interact(near);
        if (!this.fsm.controlling) {
          this.input.endStep();
          return;
        }
      }
    } else this.holdT = 0;
    const it = controlling ? this.buildIntent() : this.idleIntent;
    s.player.fixedUpdate(dt, it);
    const ci = controlling ? this.buildCombatIntent() : this.idleCIntent;
    if (s.infiniteAmmo) s.combat.weapon.mag = Math.max(s.combat.weapon.mag, 1);
    s.combat.fixedUpdate(dt, ci, s.ctx);
    s.enemies.fixedUpdate(dt, s.updateTarget(dt));
    s.civilians?.fixedUpdate(dt);
    s.pickups.update(dt);
    this.director?.fixedUpdate(dt);
    if (this.fsm.state === 'playing') this.mission?.fixedUpdate(dt);
    s.physics.step();
    this.steps++;
    if (this.opts.qa) {
      this.checkPlayerInvariants();
      this.checkCombatInvariants();
    }
    if (s.combat.dead && this.fsm.controlling) this.onPlayerDeath();
    this.input.endStep();
  }

  private onPlayerDeath(): void {
    const s = this.session;
    if (!s) return;
    this.deathReturn = this.fsm.state === 'hub' ? 'hub' : 'playing';
    this.fsm.go('dead');
    this.deathTimer = 0;
    this.deathSlowmo = 0.9;
    this.director?.onPlayerDied();
    const lab = this.input.label('jump');
    if (this.mission) {
      const canRespawn = this.mission.onPlayerDied();
      this.hud.setMarkers(this.mission.markersUsed, this.mission.markersTotal);
      if (!canRespawn) return; // el director ya cerró el contrato: pantalla de resultados
      const left = this.mission.markersLeft;
      this.hud.showDeath(s.combat.deathCause(this.camera.yaw), `Gastas un marcador de sangre (${left} restante${left === 1 ? '' : 's'}). Pulsa ${lab} o clic para volver al último punto de control.`);
      return;
    }
    this.hud.showDeath(s.combat.deathCause(this.camera.yaw), `Pulsa ${lab} o clic para reaparecer`);
  }

  private respawn(): void {
    const s = this.session;
    if (!s || this.fsm.state !== 'dead') return;
    const m = this.mission;
    const pos = m ? m.respawnPos : new Vector3(s.data.spawn.pos[0], s.data.spawn.pos[1], s.data.spawn.pos[2]);
    const yaw = m ? m.respawnYaw : s.data.spawn.yaw;
    s.respawnAt(new Vector3(pos.x, pos.y + 0.02, pos.z), yaw);
    s.combat.respawnReset();
    s.enemies.resetAlive();
    this.camera.setYawPitch(yaw, -0.12);
    this.camera.snap();
    this.hud.hideDeath();
    this.fsm.go(this.deathReturn);
  }

  /** Baliza del objetivo: proyecta el punto a pantalla; fuera de vista, flecha en el borde. */
  private updateBeacon(): void {
    const s = this.session;
    const m = this.mission;
    if (!s || !m || !m.beacon(_beacon)) {
      this.hud.setBeacon(null);
      return;
    }
    const distance = _beacon.distanceTo(s.player.feet);
    const cam = this.renderer.camera;
    const w = this.renderer.canvas.clientWidth || window.innerWidth;
    const hgt = this.renderer.canvas.clientHeight || window.innerHeight;
    _beacon.project(cam);
    const behind = _beacon.z > 1;
    let nx = behind ? -_beacon.x : _beacon.x;
    let ny = behind ? -_beacon.y : _beacon.y;
    const onScreen = !behind && Math.abs(nx) <= BEACON_EDGE && Math.abs(ny) <= BEACON_EDGE;
    if (onScreen) {
      this.hud.setBeacon({ x: ((nx + 1) / 2) * w, y: ((1 - ny) / 2) * hgt, onScreen: true, angle: 0, distance });
      return;
    }
    // Pega la flecha al rectángulo de margen conservando la dirección desde el centro.
    const k = Math.max(Math.abs(nx), Math.abs(ny)) / BEACON_EDGE;
    if (k > 1e-6) {
      nx /= k;
      ny /= k;
    }
    const angle = (Math.atan2(nx, ny) * 180) / Math.PI;
    this.hud.setBeacon({ x: ((nx + 1) / 2) * w, y: ((1 - ny) / 2) * hgt, onScreen: false, angle, distance });
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
    const model: WeaponModel = c.holstered ? 'none' : WEAPON_MODEL[c.current];
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
    pose.aim = !c.holstered && (p.aiming || c.weapon.cooldown > 0) ? 1 : 0;
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
    const fov = (this.renderer.camera.fov * Math.PI) / 180;
    const pxPerRad = window.innerHeight / 2 / Math.tan(fov / 2);
    d.spreadPx = Math.max(4, Math.min(60, Math.tan((c.spreadDeg * Math.PI) / 180) * pxPerRad));
    d.blocked = c.blocked;
    d.aimOverEnemy = c.aimOver === 'enemy';
    d.aimOverCivilian = c.aimOver === 'civilian';
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
    this.hud.setCrosshairVisible(!c.holstered);
    this.peekTimer -= dt;
    if (this.peekTimer <= 0) {
      this.peekTimer = 0.1;
      const prev = this.nearInteractable;
      this.nearInteractable = this.fsm.controlling && !this.director?.hostile ? s.nearestInteractable(this.camera.yaw, this.usedInteractables) : null;
      if (this.nearInteractable !== prev) this.holdT = 0;
      this.hud.setPrompt(this.contextPrompt());
    }
  }

  private contextPrompt(): PromptSpec | null {
    const s = this.session;
    if (!s || !this.fsm.controlling) return null;
    const p = s.player;
    const lab = (a: Action): string => this.input.label(a);
    const near = this.nearInteractable;
    if (near) {
      const hold = near.hold ?? 0;
      if (hold > 0) return { key: `Mantén ${lab('interact')}`, text: this.holdT > 0 ? `${near.prompt} · ${Math.min(99, Math.round((this.holdT / hold) * 100))} %` : near.prompt };
      return { key: lab('interact'), text: near.prompt };
    }
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
      this.director?.frameUpdate(FIXED_DT);
      if (this.fsm.controlling || this.fsm.state === 'dead') {
        this.updateHud(FIXED_DT);
        this.updateBeacon();
      }
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

  /** QA: interactúa con lo que haya delante (como pulsar E, o mantenerla hasta el final). */
  qaInteract(): boolean {
    const s = this.session;
    if (!s || !this.fsm.controlling || this.director?.hostile) return false;
    const it = s.nearestInteractable(this.camera.yaw, this.usedInteractables);
    if (!it) return false;
    this.nearInteractable = it;
    this.interact(it);
    return true;
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
      'coins',
      '+10 monedas',
      () => {
        addCoins(this.profile, 10);
        this.saveNow();
        this.screens.refresh();
      },
      { hotkey: 'KeyI' },
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
      `Perfil: ${this.profile.coins} monedas   mejoras ${this.profile.upgrades.join(',') || '—'}   excomunicados ${this.profile.excommunicados}`,
    ];
    if (p && s) {
      const ai = s.enemies.qaStats();
      lines.push(
        `Jugador ${p.feet.x.toFixed(2)}, ${p.feet.y.toFixed(2)}, ${p.feet.z.toFixed(2)}  ${p.state}/${p.posture}  suelo=${p.grounded ? 'sí' : 'no'}  v=${p.stepSpeed(FIXED_DT).toFixed(2)} m/s`,
        `Salud ${Math.ceil(s.combat.vitals.health)}  armadura ${Math.ceil(s.combat.vitals.armor)}  arma ${s.combat.current} ${s.combat.weapon.mag}/${s.combat.weapon.reserve}  ${s.combat.holstered ? 'enfundada' : ''}`,
        `Enemigos vivos ${ai.alive}/${ai.total}  atascos ${ai.stuckEvents}  máx. sin avanzar ${ai.maxNoProgress.toFixed(1)} s  ${Object.entries(ai.states).map(([k, v]) => `${k}:${v}`).join(' ')}`,
        `Hub ${this.director ? `${this.director.state} oleada ${this.director.rules.wave}` : '—'}   cámara dist ${this.camera.distanceToHead.toFixed(2)}  yaw ${this.camera.yaw.toFixed(2)}`,
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
