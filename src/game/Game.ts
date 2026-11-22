import { surfaceAt } from '../levels/surface';
import { Vector3 } from 'three';
import { AudioEngine } from '../audio/AudioEngine';
import { type IntensityInput, musicIntensity } from '../audio/music';
import { type CombatIntent, emptyCombatIntent, SWITCH_TIME } from '../combat/PlayerCombat';
import { type PlayerSlot, REMOTE_RESPAWN } from '../combat/PlayerRoster';
import { STYLE_RANKS } from '../combat/StyleMeter';
import type { UpgradeId } from '../combat/weapons';
import type { Action } from '../core/actions';
import { GameStateMachine, type GameStateId } from '../core/GameStateMachine';
import { Input, type InputEvent, type Vec2 } from '../core/Input';
import { AnimationLoop, FIXED_DT, FixedStepAccumulator } from '../core/Loop';
import { wrapAngle } from '../core/math';
import { Rng } from '../core/rng';
import {
  addPlaytime,
  BrowserStore,
  deleteProfile,
  type KeyValueStore,
  loadProfile,
  MAX_COINS,
  newProfile,
  type Profile,
  PROFILE_KEY,
  saveProfile,
  SETTINGS_KEY,
} from '../core/Save';
import { loadSettings, saveSettings, type Settings, suggestPreset } from '../core/Settings';
import { probeGpu } from '../render/gpu';
import { CollisionDebugView, DebugOverlay } from '../debug/DebugOverlay';
import { FrameStats } from '../debug/FrameStats';
import { idlePose, type RigPose, type WeaponModel } from '../entities/CharacterRig';
import { WEAPON_MODEL } from '../entities/PlayerViews';
import { type BodyYaw, bodyYaw, updateBodyYaw } from '../entities/rigMath';
import { emptyIntent, type PlayerIntent } from '../entities/PlayerController';
import { DIALOGUE, HUB_TEXT, rulesPlaque } from '../hub/dialogue';
import { buy } from '../hub/economy';
import { HubDirector } from '../hub/HubDirector';
import { loadLevelData } from '../levels/registry';
import type { InteractableDef, LevelId, MusicMood } from '../levels/types';
import { GAUNTLET_BLOCK } from '../missions/gauntlet';
import { formatObjective } from '../missions/tutorial';
import { MissionDirector, type MissionOutcome } from '../missions/MissionDirector';
import { type MissionId, MISSIONS } from '../missions/types';
import type { CoopResults, MissionNet } from '../net/protocol';
import { loadRapier, type Rapier } from '../physics/Physics';
import { GameRenderer, type QualityPreset } from '../render/Renderer';
import { type FatalText, hideBoot, setBootProgress, showFatal } from '../ui/boot';
import { button, h } from '../ui/dom';
import { Hud, type HudData, type TeamView } from '../ui/Hud';
import { type ResultsView, Screens } from '../ui/Screens';
import { COOP_TEXT, playerName } from '../text/coop';
import { CameraRig, DEFAULT_CAMERA } from './CameraRig';
import type { Coop, CoopMode } from './Coop';
import { coopScreenApi } from './coopScreenApi';
import { HiddenTicker } from './HiddenTicker';
import { buildIntelView, contextPrompt, fillHudData, type HudView, type PromptInput } from './hudModel';
import { checkCameraInvariants, checkCombatInvariants, checkPlayerInvariants, type QaInvariants } from './invariants';
import { LevelSession } from './LevelSession';

export interface GameOptions {
  qa: boolean;
  /** Preset forzado por la URL (`?preset=`); si falta, se usa el de Ajustes. */
  preset?: QualityPreset;
  startLevel: LevelId;
  /** Usar pointer lock real (por defecto: sí fuera de QA; `?lock=1` lo fuerza en QA). */
  pointerLock: boolean;
  /** Almacén del guardado (tests inyectan uno en memoria). */
  store?: KeyValueStore;
}

/** Contadores de invariantes de QA (deben quedar en 0). */

/** Nivel que se carga para cada contrato. */
const MISSION_LEVEL: Record<MissionId, LevelId> = { practice: 'practice', nightclub: 'nightclub', docks: 'docks', rooftop: 'rooftop', gauntlet: 'hub' };
const SUB_LABELS = { time: 'Tiempo', accuracy: 'Precisión', damage: 'Daño recibido', variety: 'Variedad', civilians: 'Civiles ilesos' } as const;
/** Margen (fracción de media pantalla) donde se pega la flecha de la baliza fuera de pantalla. */
const BEACON_EDGE = 0.88;
/** Tiempo mínimo en la pantalla de muerte antes de poder reaparecer. */
const DEATH_MIN = 1.2;
/** Autoguardado del tiempo de juego. */
const AUTOSAVE_SEC = 30;
/** Lo que se le dice al jugador cuando un nivel no llega a cargarse. */
const LEVEL_LOAD_FAILED: FatalText = {
  title: 'No se pudo cargar el nivel',
  hint: 'Puede ser un corte de conexión, o que el juego se haya actualizado mientras lo tenías abierto. Tu partida está guardada: recarga la página para seguir.',
  reload: true,
};

const _feet = new Vector3();
const _beacon = new Vector3();
const _orbitTarget = new Vector3(0, 1, 0);
const _attractFrom = new Vector3();
const _attractTo = new Vector3();
/** Órbita de respaldo de la cámara de título (niveles sin `attract`). */
const ORBIT_SPEED = 0.06;
const ORBIT_RADIUS = 30;
const ORBIT_HEIGHT = 16;

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
  settings: Settings;
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
  /** Partida cooperativa en red (null si se juega solo). Ver `Coop` y docs/ESCALABILIDAD.md, fase 3. */
  coop: Coop | null = null;
  /** Por qué terminó el último intento de cooperativo (lo muestra su menú). */
  coopError: string | null = null;
  /** La sesión cargada es de una partida en red (al salir del cooperativo hay que cargar otra). */
  private sessionCoop = false;
  /** Un nivel que pidió el anfitrión mientras se cargaba otro. */
  private coopPending: { level: LevelId; mission: MissionId | null } | null = null;
  /** Invitado: objetos que pidió usar hace un momento (no se le vuelven a ofrecer mientras el anfitrión contesta). */
  private readonly guestPending = new Map<string, number>();
  /** Invitado: la lista de usados que dijo el anfitrión la última vez (para copiarla solo cuando cambia). */
  private guestUsedRef: readonly string[] | null = null;
  /** Anfitrión con la pestaña oculta: la partida sigue para sus invitados. */
  private readonly hiddenTicker = new HiddenTicker((dt) => this.tickHidden(dt));

  private readonly intent: PlayerIntent = emptyIntent();
  private readonly idleIntent: PlayerIntent = emptyIntent();
  private readonly cIntent: CombatIntent = emptyCombatIntent();
  private readonly idleCIntent: CombatIntent = emptyCombatIntent();
  private readonly move: Vec2 = { x: 0, y: 0 };
  private readonly mouse: Vec2 = { x: 0, y: 0 };
  private readonly pad: Vec2 = { x: 0, y: 0 };
  private readonly pose: RigPose = idlePose();
  /** Giro visual del Huésped (la simulación gira a ritmo constante; el cuerpo, con muelle). */
  private readonly playerYaw: BodyYaw = bodyYaw();
  private readonly captureOverlay: HTMLDivElement;
  private readonly gpuOverlay: HTMLDivElement;
  /** Proveedor del texto del F3, creado una vez (pasar una flecha nueva en cada frame asignaba memoria). */
  private readonly debugTextFn = (): string => this.debugText();
  /** Etiqueta de tecla y entradas del HUD y del aviso contextual, creadas una vez (sin asignar por frame). */
  private readonly labelFn = (a: Action): string => this.input.label(a);
  private readonly hudView: HudView = { yaw: 0, fovDeg: 60, viewportHeight: 1, label: this.labelFn };
  private readonly promptIn: PromptInput = { near: null, holdT: 0, yaw: 0, moveX: 0, moveY: 0, label: this.labelFn };
  private readonly hudData: HudData;
  private peekTimer = 0;
  private orbit = 0;
  private lastCpuMs = 0;
  private deathTimer = 0;
  private deathSlowmo = 0;
  /** Metros recorridos desde la última pisada. */
  private stepDist = 0;
  private deathReturn: 'hub' | 'playing' = 'playing';
  private lastWeaponModel: WeaponModel = 'pistol';
  private loading = false;
  private autosaveT = 0;
  private nearInteractable: InteractableDef | null = null;
  /** Progreso de una interacción mantenida (s). */
  private holdT = 0;
  /** Apuntar en modo alternar (Ajustes): estado actual. */
  private aimLatched = false;
  /** Nivel cuyas pistas están en pantalla (se repintan al reasignar teclas). */
  private hintsFor: LevelId | null = null;
  private intelShown = false;
  /** QA: reparto del tiempo de CPU por sistema (ms acumulados; solo si `profiling`). */
  profiling = false;
  readonly prof = { frames: 0, steps: 0, sim: 0, player: 0, enemies: 0, civilians: 0, physics: 0, view: 0, render: 0 };
  private readonly musicIn: IntensityInput = { fighting: 0, searching: 0, boss: false, escape: false, hostile: false, onMission: false };

  constructor(gameRoot: HTMLElement, uiRoot: HTMLElement, opts: GameOptions) {
    this.opts = opts;
    this.currentLevel = opts.startLevel;
    this.store = opts.store ?? new BrowserStore();
    const loaded = loadProfile(this.store);
    this.profile = loaded.profile;
    if (loaded.status === 'reset-corrupt') console.warn('[save] la partida guardada estaba corrupta; se empezó una nueva (copia en localStorage).');
    this.settings = loadSettings(this.store);
    // Primera vez: si el sistema pide menos movimiento, la cámara no tiembla (se puede cambiar en Ajustes).
    const firstRun = this.store.get(SETTINGS_KEY) === null;
    if (firstRun && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) this.settings.shake = 0;
    // Primera vez y sin `?preset=`: el preset se elige por la GPU (integradas → Bajo).
    if (firstRun && !opts.preset) this.settings.preset = suggestPreset(probeGpu());
    this.renderer = new GameRenderer(gameRoot, opts.preset ?? this.settings.preset);
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
        settings: () => this.settings,
        onSettingsChange: (s) => this.applySettings(s),
        hasSave: () => this.store.get(PROFILE_KEY) !== null,
        inHub: () => this.currentLevel === 'hub',
        profile: () => this.profile,
        coop: coopScreenApi(this),
      },
      opts.qa,
    );
    this.captureOverlay = h('div', { class: 'capture-overlay', role: 'button', tabIndex: 0, ariaLabel: 'Haz clic para capturar el ratón' }, [
      h('div', { class: 'capture-box' }, [h('strong', { text: 'Haz clic para jugar' }), h('span', { text: 'El ratón controla la cámara. Esc para pausar.' })]),
    ]);
    this.captureOverlay.hidden = true;
    this.captureOverlay.addEventListener('click', () => this.requestLock());
    uiRoot.appendChild(this.captureOverlay);
    // Si la tarjeta gráfica pierde el contexto, la pantalla quedaba en negro sin explicación.
    this.gpuOverlay = h('div', { class: 'gpu-overlay', role: 'alert' }, [
      h('div', { class: 'capture-box' }, [
        h('strong', { text: 'Se perdió la imagen' }),
        h('span', { text: 'La tarjeta gráfica se ha reiniciado. El juego está en pausa y la imagen debería volver en unos segundos.' }),
        h('span', { text: 'Si no vuelve, recarga: tu partida está guardada.' }),
        button('Recargar', () => window.location.reload(), 'btn'),
      ]),
    ]);
    this.gpuOverlay.hidden = true;
    uiRoot.appendChild(this.gpuOverlay);
    this.renderer.onContextLost = () => {
      this.saveOnExit();
      this.pause();
      this.gpuOverlay.hidden = false;
    };
    this.renderer.onContextRestored = () => {
      this.gpuOverlay.hidden = true;
    };
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
    this.applySettings(this.settings, false);
    // El primer gesto del usuario desbloquea el audio (política de autoplay).
    const unlockAudio = (): void => this.audio.init();
    window.addEventListener('pointerdown', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    // Guardar al salir o al ocultar la pestaña.
    window.addEventListener('pagehide', () => this.saveOnExit());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.saveOnExit();
      this.updateHiddenTicker();
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
      net: this.coop?.sessionNet(),
    });
    this.sessionCoop = !!this.coop;
    this.currentLevel = id;
    this.renderer.setExposure(data.ambient.exposure);
    this.camera.setYawPitch(data.spawn.yaw, -0.12);
    this.camera.snap();
    this.renderer.prewarm();
    this.collisionView.refresh(this.session.physics);
    this.hud.clearTransient();
    this.intelShown = false;
    this.hud.setZone(data.name.toUpperCase());
    this.hud.setObjective('');
    this.hud.setMarkers(0, 0);
    this.hud.setCombatVisible(true);
    this.audio.ambience(data.ambience);
    this.lastWeaponModel = 'none';
  }

  /**
   * Carga un nivel con el juego ya en marcha. Si falla (corte de red, o una versión nueva publicada
   * con la pestaña abierta, que cambia los nombres de los archivos) se explica en pantalla y se
   * ofrece recargar: sin esto el juego se quedaba en "cargando", sin interfaz ni salida.
   */
  private async tryLoadSession(id: LevelId): Promise<boolean> {
    try {
      await this.loadSession(id);
      return true;
    } catch (err) {
      this.loading = false;
      if (document.pointerLockElement) document.exitPointerLock();
      showFatal(err, LEVEL_LOAD_FAILED);
      return false;
    }
  }

  // =========================================================== guardado
  saveNow(): void {
    this.autosaveT = addPlaytime(this.profile, this.autosaveT);
    saveProfile(this.store, this.profile);
  }

  /**
   * Guardado al cerrar u ocultar la pestaña. Quien abre el juego y se va sin empezar no deja partida:
   * antes se guardaba un perfil vacío y, a la vuelta, el título ofrecía "Continuar" a quien nunca jugó.
   */
  private saveOnExit(): void {
    const untouched = (this.fsm.state === 'boot' || this.fsm.state === 'title') && this.store.get(PROFILE_KEY) === null;
    if (!untouched) this.saveNow();
  }

  /** Aplica unos ajustes en caliente (y los guarda). El preset de la URL manda hasta que el jugador lo cambie. */
  applySettings(s: Settings, persist = true): void {
    const prev = this.settings;
    this.settings = s;
    const cs = this.camera.settings;
    cs.mouseSens = DEFAULT_CAMERA.mouseSens * s.mouseSens;
    cs.padSens = DEFAULT_CAMERA.padSens * s.padSens;
    cs.invertY = s.invertY;
    cs.fov = s.fov;
    cs.shake = s.shake;
    if (persist && s.preset !== prev.preset && s.preset !== this.renderer.preset) this.renderer.applyPreset(s.preset);
    this.renderer.dynamicResolution = s.dynamicResolution;
    if (!s.dynamicResolution) this.renderer.dyn.reset();
    this.renderer.setBrightness(s.brightness);
    this.audio.setVolumes({ master: s.master, music: s.music, sfx: s.sfx, ui: s.ui });
    this.input.setBindings(s.bindings);
    document.documentElement.style.setProperty('--ui-scale', String(s.uiScale));
    this.hud.setHintsEnabled(s.hints);
    if (!s.aimToggle) this.aimLatched = false;
    if (this.hintsFor) this.setHintsFor(this.hintsFor);
    this.mission?.refreshText();
    if (persist) saveSettings(this.store, s);
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
    if (!controlling) this.aimLatched = false;
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
    // Tras un contrato (o el Gauntlet sobre el propio hub) la sesión queda sucia: se recarga limpia.
    if ((this.currentLevel !== 'hub' || !this.session || this.mission || this.sessionStale) && !(await this.tryLoadSession('hub'))) return;
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
      alarm: s.alarm,
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
    // En cooperativo el nivel se carga siempre de nuevo: su sesión es la de la partida en red.
    if ((id !== this.currentLevel || !this.session || this.director || this.mission || this.coop || this.sessionStale) && !(await this.tryLoadSession(id)))
      return;
    const s = this.session;
    if (!s) {
      this.loading = false;
      return;
    }
    const sp = s.data.spawn;
    s.respawnAt(new Vector3(sp.pos[0], sp.pos[1] + 0.02, sp.pos[2]), sp.yaw);
    s.combat.respawnReset();
    if (o.drill) s.enemies.spawnEvent('drill');
    if (this.coop?.isHost) this.coop.levelStarted(s, id, null);
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
    if (!(await this.tryLoadSession(MISSION_LEVEL[id]))) return;
    const s = this.session;
    if (!s) {
      this.loading = false;
      return;
    }
    this.lastMission = id;
    this.outcome = null;
    this.mission = new MissionDirector({
      session: s,
      block: id === 'gauntlet' ? GAUNTLET_BLOCK : undefined,
      label: (a) => this.input.label(a),
      shoulderSwaps: () => this.camera.shoulderSwaps,
      hud: this.coop ? this.coop.hud(this.hud) : this.hud,
      audio: this.audio,
      profile: this.profile,
      save: () => this.saveNow(),
      onFinished: (o) => this.onMissionFinished(o),
    });
    this.hud.setMarkers(0, this.mission.markersTotal);
    // En el Gauntlet el hub es zona de combate: pistas de combate, no las de hablar o el ascensor.
    this.setHintsFor(id === 'gauntlet' ? 'practice' : s.data.id);
    if (this.coop?.isHost) {
      // En cooperativo no hay briefing ni tutorial: todos entran a la vez.
      this.coop.levelStarted(s, MISSION_LEVEL[id], id);
      this.fsm.go('briefing');
      this.beginContract();
      if (this.mission.current?.kind === 'learn') this.mission.skipLearn();
      this.loading = false;
      return;
    }
    this.fsm.go('briefing');
    const hasTutorial = this.mission.current?.kind === 'learn';
    this.screens.showBriefing(
      MISSIONS[id],
      () => this.beginContract(),
      () => void this.goToHub(),
      hasTutorial
        ? () => {
            this.beginContract();
            this.mission?.skipLearn();
          }
        : null,
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
    const coop = this.coop;
    coop?.host?.sendResults({
      mission: o.mission,
      success: o.success,
      failReason: o.failReason,
      rank: o.rank.rank,
      total: o.rank.total,
      timeSec: o.timeSec,
      kills: o.kills,
      coins: o.coinsReward,
    });
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
      gauntlet: o.gauntlet
        ? { waves: o.gauntlet.waves, position: o.gauntlet.position, top: o.gauntlet.top.map((g) => ({ waves: g.waves, score: g.score })) }
        : null,
      coop: coop ? { leave: COOP_TEXT.backToLobby, retry: true, note: null } : undefined,
    };
    this.audio.ui(o.success ? 'coin' : 'error');
    this.screens.showResults(
      view,
      () => (coop ? this.coopStart(o.mission) : void this.startContract(o.mission)),
      () => (coop ? this.coopBackToLobby() : void this.goToHub()),
    );
  }

  private setHintsFor(id: LevelId): void {
    this.hintsFor = id;
    const lab = (a: Action): string => this.input.label(a);
    // Siempre la tecla asignada de verdad (también las de movimiento y armas).
    const move = formatObjective('{move}', lab);
    const slots = `${lab('weapon1')} / ${lab('weapon2')} / ${lab('weapon3')}`;
    if (id === 'hub') {
      this.hud.setHints([
        { key: move, text: 'Mover' },
        { key: lab('interact'), text: 'Hablar · leer · usar el ascensor' },
        { key: lab('intel'), text: 'Intel (mantener)' },
        { key: lab('sprint'), text: 'Sprint' },
        { key: lab('help'), text: 'Controles' },
      ]);
    } else if (id === 'arena') {
      this.hud.setHints([
        { key: move, text: 'Mover' },
        { key: lab('sprint'), text: 'Sprint' },
        { key: lab('crouch'), text: 'Agacharse · deslizar (corriendo) · cubrirse (junto a pared)' },
        { key: lab('jump'), text: 'Saltar · vault sobre obstáculos bajos' },
        { key: `2× ${lab('jump')} / ${lab('dodge')}`, text: 'Esquiva (voltereta)' },
        { key: lab('aim'), text: 'Apuntar' },
        { key: lab('shoulder'), text: 'Cambiar de hombro' },
        { key: lab('intel'), text: 'Intel (mantener)' },
        { key: lab('help'), text: 'Controles' },
      ]);
    } else {
      this.hud.setHints([
        { key: lab('fire'), text: 'Disparar' },
        { key: lab('aim'), text: 'Apuntar' },
        { key: lab('reload'), text: 'Recargar (otra vez en la zona dorada = perfecta)' },
        { key: slots, text: 'Carabina · pistola · cuchillo' },
        { key: lab('takedown'), text: 'Takedown (cerca del enemigo)' },
        // En cooperativo no hay Foco: el tiempo del mundo es de todos.
        ...(this.coop ? [] : [{ key: lab('focus'), text: 'Foco: cámara lenta' }]),
        { key: lab('shoulder'), text: 'Cambiar de hombro' },
        { key: lab('intel'), text: 'Intel (mantener)' },
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
    if (this.coop) {
      this.coopLeave();
      return;
    }
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
    const guest = this.coop?.guest;
    if (guest) {
      // Invitado: se lo pide al anfitrión, que lo comprueba y lo ejecuta (la lista de usados vuelve con la instantánea).
      guest.requestInteract(it.id);
      this.guestPending.set(it.id, performance.now() + 1500);
      this.nearInteractable = null;
      this.audio.ui('click');
      return;
    }
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
            rulesPlaque({
              interact: lab('interact'),
              fire: lab('fire'),
              crouch: lab('crouch'),
              jump: lab('jump'),
              takedown: lab('takedown'),
              reload: lab('reload'),
              focus: lab('focus'),
              sprint: lab('sprint'),
            }),
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
    this.updateIntel();
    this.updateMusic();

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
      s.roster.frameUpdate(realDt);
      this.deathSlowmo = Math.max(0, this.deathSlowmo - realDt);
      // En cooperativo el tiempo del mundo es de todos: ni Foco, ni pausa de impacto, ni cámara lenta al morir.
      this.sim.timeScale = this.coop?.inMatch ? 1 : this.deathSlowmo > 0 ? 0.4 : s.combat.timeScale;
      this.audio.setMuffle(!this.coop?.inMatch && s.combat.focusActive ? 0.55 : 0);
    }
    const tSim = this.profiling ? performance.now() : 0;
    // Con la pestaña oculta simula el reloj del worker (`tickHidden`), nunca los dos a la vez.
    if (this.simulationRuns && s && !this.manual && !this.hiddenTicker.running) {
      const n = this.sim.advance(realDt);
      for (let i = 0; i < n; i++) this.fixedUpdate(FIXED_DT);
    }
    const tView = this.profiling ? performance.now() : 0;

    const alpha = this.manual ? 1 : this.sim.alpha;
    const scaledDt = realDt * this.sim.timeScale;
    const inWorld = controlling || this.fsm.state === 'paused' || this.fsm.state === 'dead' || this.fsm.state === 'hubMenu';
    if (s && inWorld) {
      this.updatePlayerView(alpha, realDt, scaledDt);
      s.enemyViews.update(s.enemies.enemies, alpha, scaledDt);
      s.civilianViews?.update(alpha, scaledDt);
      s.pickupViews.update(s.pickups.items, scaledDt);
      s.playerViews.update(s.roster.slots, alpha, scaledDt, this.renderer.camera.position);
      s.vfx.update(scaledDt);
      s.renderNpcs(scaledDt);
      s.alarm.update(scaledDt);
      if (controlling) this.updateBeacon();
    } else if (this.fsm.state === 'title' || this.fsm.state === 'boot') {
      this.updateAttractCamera(realDt);
    }
    if (s && (controlling || this.fsm.state === 'dead')) this.updateHud(realDt);
    this.audio.setListener(this.renderer.camera.position, this.camera.forward);

    this.debug.update(realDt, this.debugTextFn);
    if (this.collisionView.enabled && s) this.collisionView.refresh(s.physics);
    if (!this.fsm.simulating) this.input.endStep();
    const tRender = this.profiling ? performance.now() : 0;
    this.renderer.render();
    this.lastCpuMs = performance.now() - t0;
    if (this.profiling) {
      const p = this.prof;
      p.frames++;
      p.sim += tView - tSim;
      p.view += tRender - tView;
      p.render += performance.now() - tRender;
    }
    this.stats.push(realDt * 1000, this.lastCpuMs);
    this.renderer.updateDynamicResolution(this.stats.avgFrameMs(60), realDt);
    void now;
  }

  /** Música adaptativa: ambiente por nivel y modo; intensidad según lo que hacen los enemigos. */
  private updateMusic(): void {
    const s = this.session;
    const st = this.fsm.state;
    let mood: MusicMood | null = null;
    // En un invitado, lo que dice el anfitrión de su misión.
    const net = this.coop?.missionNet ?? null;
    const missionId = this.mission?.id ?? this.coop?.mission ?? null;
    if (st === 'title') mood = 'hub';
    else if (s && st !== 'boot' && st !== 'loading')
      mood = missionId === 'gauntlet' ? 'gauntlet' : this.director?.hostile || net?.hostile ? 'tension' : s.data.music;
    this.audio.setMusic(mood);
    const x = this.musicIn;
    x.fighting = 0;
    x.searching = 0;
    if (s && st !== 'title') {
      for (const e of s.enemies.enemies) {
        if (!e.alive) continue;
        const a = e.state;
        if (a === 'combat' || a === 'cover' || a === 'flank') x.fighting++;
        else if (a === 'search' || a === 'suspicious') x.searching++;
      }
    }
    const kind = net ? net.objective : this.mission?.current?.kind;
    x.boss = kind === 'boss';
    x.escape = kind === 'escape';
    x.hostile = net ? net.hostile : !!this.director?.hostile || (this.mission?.id === 'gauntlet' && this.mission.gauntletBreak <= 0);
    x.onMission = !!this.mission || !!this.coop?.inMatch || this.currentLevel === 'practice' || this.currentLevel === 'arena';
    const menu = st === 'paused' || st === 'results' || st === 'briefing' || st === 'hubMenu' || st === 'title';
    this.audio.setMusicIntensity(menu ? Math.min(0.2, musicIntensity(x)) : musicIntensity(x));
    this.audio.duckMusic(menu);
    this.audio.updateMusic();
  }

  /** Intel: visible mientras se mantiene su tecla y se controla al personaje. */
  private updateIntel(): void {
    const want = this.fsm.controlling && this.input.isDown('intel');
    if (want === this.intelShown) return;
    this.intelShown = want;
    this.hud.setIntel(want ? buildIntelView(this.session, this.mission, !!this.director?.hostile, this.currentLevel) : null);
  }

  /** Acciones de nivel de frame (pausa, ayuda, hombro, reaparecer). Se consumen para no repetirse. */
  private handleFrameActions(realDt: number): void {
    const inp = this.input;
    if (this.screens.current === 'controls' || this.screens.current === 'settings') {
      if (inp.pressed('pause') || (this.screens.current === 'controls' && inp.pressed('help'))) {
        inp.consume('pause');
        inp.consume('help');
        this.screens.closeSub();
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
      // En cooperativo se reaparece solo: el anfitrión a los 5 s; el invitado, cuando el anfitrión lo coloca.
      if (this.coop?.inMatch) {
        if (this.coop.isHost && this.deathTimer >= REMOTE_RESPAWN) this.respawn(true);
        return;
      }
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

  /** Apuntar: mantener el botón o, con el ajuste de alternar, el estado conmutado. */
  private aimHeld(): boolean {
    return this.settings.aimToggle ? this.aimLatched : this.input.isDown('aim');
  }

  private buildIntent(): PlayerIntent {
    const it = this.intent;
    const inp = this.input;
    inp.moveAxis(this.move);
    it.moveX = this.move.x;
    it.moveY = this.move.y;
    it.camYaw = this.camera.yaw;
    it.sprint = inp.isDown('sprint');
    if (this.settings.aimToggle && inp.pressed('aim')) this.aimLatched = !this.aimLatched;
    it.aim = this.aimHeld();
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
    c.aim = this.aimHeld();
    c.reloadPressed = inp.pressed('reload');
    c.takedownPressed = inp.pressed('takedown');
    c.focusPressed = inp.pressed('focus');
    if (c.focusPressed && this.coop?.inMatch) this.hud.showToast(COOP_TEXT.noFocus, 1.8);
    c.select = inp.pressed('weapon1') ? 'carbine' : inp.pressed('weapon2') ? 'pistol' : inp.pressed('weapon3') ? 'knife' : null;
    c.cycle = inp.pressed('weaponNext') ? 1 : inp.pressed('weaponPrev') ? -1 : 0;
    return c;
  }

  fixedUpdate(dt: number): void {
    const s = this.session;
    if (!s) return;
    const tStep = this.profiling ? performance.now() : 0;
    const guest = this.coop?.isGuest === true;
    // Invitado: lo que se ve del resto, al día, y la semilla de su disparo (la que usará el anfitrión).
    if (guest) this.coop!.guestPreStep();
    const controlling = this.fsm.controlling;
    // Interactuar (E) tiene prioridad sobre saltar cuando hay algo delante (comparten botón A en gamepad).
    const near = this.nearInteractable;
    if (controlling && near && this.interactionsAllowed) {
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
    // Pisadas: una por zancada recorrida, más largas y fuertes al esprintar.
    const pl = s.player;
    if (pl.grounded && pl.state === 'ground') {
      const v = pl.stepSpeed(dt);
      if (v > 0.6) {
        this.stepDist += v * dt;
        const crouched = pl.posture === 'crouch';
        if (this.stepDist >= (pl.sprinting ? 1.25 : crouched ? 0.7 : 0.95)) {
          this.stepDist = 0;
          const f = pl.feet;
          this.audio.footstep(crouched ? 0.35 : pl.sprinting ? 1 : 0.65, surfaceAt(s.data.boxes, f.x, f.y, f.z));
        }
      }
    }
    const ci = controlling ? this.buildCombatIntent() : this.idleCIntent;
    // El rayo de apuntado sale de la cámara del jugador local.
    ci.aimFrom.copy(this.camera.position);
    ci.aimDir.copy(this.camera.forward);
    if (s.infiniteAmmo) s.combat.weapon.mag = Math.max(s.combat.weapon.mag, 1);
    s.combat.fixedUpdate(dt, ci, s.ctx);
    if (guest) {
      this.guestFixedUpdate(s, ci);
      return;
    }
    // El resto de jugadores (si los hay) se simulan con lo que pide su intención y reaparecen en el último punto de
    // control de la misión.
    if (this.mission) {
      s.roster.respawn.pos.copy(this.mission.respawnPos);
      s.roster.respawn.yaw = this.mission.respawnYaw;
    }
    s.roster.step(dt);
    // Anfitrión: el paso de cada invitado (su movimiento y su combate).
    this.coop?.host?.step(dt);
    s.roster.updateLooks();
    const tE = this.profiling ? performance.now() : 0;
    s.enemies.fixedUpdate(dt, s.updateTargets(dt));
    const tC = this.profiling ? performance.now() : 0;
    s.civilians?.fixedUpdate(dt);
    const tP = this.profiling ? performance.now() : 0;
    s.pickups.update(dt);
    this.director?.fixedUpdate(dt);
    if (this.missionRuns) this.mission?.fixedUpdate(dt);
    const tPh = this.profiling ? performance.now() : 0;
    s.physics.step();
    const host = this.coop?.host;
    if (host) {
      this.fillMissionNet(s, host.missionNet);
      host.endStep();
    }
    if (this.profiling) {
      const p = this.prof;
      const end = performance.now();
      p.steps++;
      p.enemies += tC - tE;
      p.civilians += tP - tC;
      p.physics += end - tPh;
      p.player += tE - tStep + (tPh - tP);
    }
    this.steps++;
    if (this.opts.qa) {
      checkPlayerInvariants(s, this.invariants);
      this.combatInconsistencies += checkCombatInvariants(s, this.invariants);
    }
    if (s.combat.dead && this.fsm.controlling) this.onPlayerDeath();
    this.input.endStep();
  }

  /** Sin interacciones con un hub hostil: ni durante el Excomunicado ni durante el Gauntlet. */
  private get interactionsAllowed(): boolean {
    return !this.director?.hostile && this.mission?.id !== 'gauntlet' && this.coop?.mission !== 'gauntlet';
  }

  /** La misión avanza en partida y, en cooperativo, también con la pausa abierta o caído: los demás siguen jugando. */
  private get missionRuns(): boolean {
    const st = this.fsm.state;
    return st === 'playing' || (!!this.coop?.inMatch && (st === 'paused' || st === 'dead'));
  }

  /** Los objetos que no se ofrecen: los ya usados y, en un invitado, los que acaba de pedir al anfitrión. */
  private blockedInteractables(): ReadonlySet<string> {
    if (this.guestPending.size === 0) return this.usedInteractables;
    const now = performance.now();
    const out = new Set(this.usedInteractables);
    for (const [id, until] of this.guestPending) {
      if (until < now) this.guestPending.delete(id);
      else out.add(id);
    }
    return out;
  }

  /** La simulación avanza: en los estados de juego y, en cooperativo, también con la pausa abierta. */
  private get simulationRuns(): boolean {
    return this.fsm.simulating || (!!this.coop?.inMatch && this.fsm.state === 'paused');
  }

  private onPlayerDeath(): void {
    const s = this.session;
    if (!s) return;
    if (this.coop?.inMatch) {
      // En cooperativo no se espera a nadie: se reaparece solo y cada caída gasta un marcador del equipo.
      this.deathReturn = 'playing';
      this.fsm.go('dead');
      this.deathTimer = 0;
      if (this.coop.isHost && this.mission) {
        const canRespawn = this.mission.onPlayerDied();
        this.hud.setMarkers(this.mission.markersUsed, this.mission.markersTotal);
        if (!canRespawn) return;
      }
      this.hud.showDeath(s.combat.deathCause(this.camera.yaw), this.coop.isHost ? COOP_TEXT.respawnIn(REMOTE_RESPAWN) : COOP_TEXT.respawnHost);
      return;
    }
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
      this.hud.showDeath(
        s.combat.deathCause(this.camera.yaw),
        `Gastas un marcador de sangre (${left} restante${left === 1 ? '' : 's'}). Pulsa ${lab} o clic para volver al último punto de control.`,
      );
      return;
    }
    this.hud.showDeath(s.combat.deathCause(this.camera.yaw), `Pulsa ${lab} o clic para reaparecer`);
  }

  /** Reaparece en el último punto de control. En cooperativo (`keepWorld`) el mundo sigue como está: hay otros jugando. */
  private respawn(keepWorld = false): void {
    const s = this.session;
    if (!s || this.fsm.state !== 'dead') return;
    const m = this.mission;
    const pos = m ? m.respawnPos : new Vector3(s.data.spawn.pos[0], s.data.spawn.pos[1], s.data.spawn.pos[2]);
    const yaw = m ? m.respawnYaw : s.data.spawn.yaw;
    s.respawnAt(new Vector3(pos.x, pos.y + 0.02, pos.z), yaw);
    s.combat.respawnReset();
    if (!keepWorld) {
      s.enemies.resetAlive();
      m?.onPlayerRespawned();
    }
    this.aimLatched = false;
    this.camera.setYawPitch(yaw, -0.12);
    this.camera.snap();
    this.hud.hideDeath();
    this.fsm.go(this.deathReturn);
  }

  // =========================================================== cooperativo (fase 3)
  /** El anfitrión de una partida en red sigue simulando con la pestaña oculta (si no, se congela para todos). */
  updateHiddenTicker(): void {
    const want = document.visibilityState === 'hidden' && !!this.coop?.isHost && this.coop.inMatch;
    if (want) this.hiddenTicker.start();
    else this.hiddenTicker.stop();
  }

  private tickHidden(realDt: number): void {
    if (document.visibilityState !== 'hidden' || !this.coop?.isHost) {
      this.hiddenTicker.stop();
      return;
    }
    if (!this.session || !this.simulationRuns || this.manual) return;
    const n = this.sim.advance(realDt);
    for (let i = 0; i < n; i++) this.fixedUpdate(FIXED_DT);
  }

  /** La sesión cargada no es del modo en que se juega ahora (en red o solo): hay que cargar otra. */
  private get sessionStale(): boolean {
    return this.sessionCoop !== !!this.coop;
  }

  /** Invitado: el resto del paso. Lo demás lo simula el anfitrión: aquí se envía el paso y avanza la física. */
  private guestFixedUpdate(s: LevelSession, ci: CombatIntent): void {
    const coop = this.coop!;
    coop.guestPostStep(ci);
    const net = coop.missionNet;
    if (net) {
      s.alarm.set(net.alarm);
      if (net.used !== this.guestUsedRef) {
        this.guestUsedRef = net.used;
        this.usedInteractables.clear();
        for (const id of net.used) this.usedInteractables.add(id);
      }
    }
    s.physics.step();
    this.steps++;
    if (this.opts.qa) {
      checkPlayerInvariants(s, this.invariants);
      this.combatInconsistencies += checkCombatInvariants(s, this.invariants);
    }
    if (s.combat.dead && this.fsm.controlling) this.onPlayerDeath();
    this.input.endStep();
  }

  /** Anfitrión: lo que el invitado necesita de la misión para su pantalla y su música. */
  private fillMissionNet(s: LevelSession, mn: MissionNet): void {
    const m = this.mission;
    if (m && m.beacon(_beacon)) {
      const b = (mn.beacon ??= { x: 0, y: 0, z: 0 });
      b.x = _beacon.x;
      b.y = _beacon.y;
      b.z = _beacon.z;
    } else mn.beacon = null;
    mn.markersUsed = m?.markersUsed ?? 0;
    mn.markersTotal = m?.markersTotal ?? 0;
    mn.objective = m?.current?.kind ?? null;
    mn.hostile = !!this.director?.hostile || (m?.id === 'gauntlet' && m.gauntletBreak <= 0);
    mn.alarm = s.alarm.active;
    if (mn.used.length !== this.usedInteractables.size) mn.used = [...this.usedInteractables];
  }

  /** Anfitrión: un invitado quiere usar un objeto de la misión. Solo si existe, sigue sin usar y lo tiene al alcance. */
  coopGuestInteract(slot: PlayerSlot, id: string): void {
    const s = this.session;
    const m = this.mission;
    if (!s || !m || !this.missionRuns || this.usedInteractables.has(id)) return;
    const it = s.data.interactables.find((x) => x.id === id);
    if (!it || !it.action.startsWith('mission:')) return;
    const f = slot.controller.feet;
    // El mismo alcance que en su pantalla, con margen por lo que tarda en llegar la petición.
    if (Math.hypot(it.pos[0] - f.x, it.pos[2] - f.z) > it.radius + 1 || Math.abs(it.pos[1] - f.y) > 2) return;
    m.onInteract(it.id);
    this.usedInteractables.add(it.id);
    if (this.nearInteractable === it) this.nearInteractable = null;
    this.audio.ui('confirm');
  }

  /** El equipo para el HUD: cada jugador con su salud, y la latencia si se es invitado. */
  private teamView(s: LevelSession): TeamView {
    return {
      players: [...s.roster.slots]
        .sort((a, b) => a.id - b.id)
        .map((p) => ({
          name: playerName(p.id),
          you: p.local,
          health: p.local ? p.combat.vitals.health / Math.max(1, p.combat.vitals.maxHealth) : p.look.health,
          down: p.local ? p.combat.dead : p.look.dead,
        })),
      // Hasta la primera medida, sin latencia en pantalla.
      ping: this.coop?.isGuest && this.coop.rtt > 0 ? this.coop.rtt : null,
    };
  }

  /** Anfitrión: empieza lo elegido en la sala (todos los invitados lo cargan con él). */
  coopStart(mode: CoopMode): void {
    if (!this.coop?.isHost || this.loading) return;
    this.coopError = null;
    if (mode === 'arena') void this.playLevel('arena');
    else void this.startContract(mode);
  }

  /** Anfitrión: vuelve a la sala con todos. */
  coopBackToLobby(): void {
    if (!this.coop?.isHost) return;
    this.coop.backToLobby();
    this.coopToLobby();
  }

  /** Sale del cooperativo (el invitado se va; el anfitrión cierra la sala para todos). */
  coopLeave(): void {
    const c = this.coop;
    if (!c) return;
    this.coop = null;
    this.coopPending = null;
    c.close();
    this.leaveLevelScreens();
    if (this.fsm.state !== 'title') this.fsm.go('title');
    else this.screens.show('title');
  }

  /** Invitado: carga el nivel que eligió el anfitrión y entra en él. */
  async coopGuestStart(level: LevelId, mission: MissionId | null): Promise<void> {
    const c = this.coop;
    if (!c?.isGuest) return;
    if (this.loading) {
      // Se está cargando otro: este va después.
      this.coopPending = { level, mission };
      return;
    }
    this.loading = true;
    this.audio.init();
    this.screens.hide();
    this.hud.hideDeath();
    if (this.fsm.state === 'paused') this.fsm.go('playing');
    if (this.fsm.state !== 'loading') this.fsm.go('loading');
    if (!(await this.tryLoadSession(level))) return;
    const s = this.session;
    const pending = this.coopPending;
    this.coopPending = null;
    if (!s || this.coop !== c) {
      this.loading = false;
      return;
    }
    this.mission = null;
    this.outcome = null;
    const sp = s.data.spawn;
    s.respawnAt(new Vector3(sp.pos[0], sp.pos[1] + 0.02, sp.pos[2]), sp.yaw);
    s.combat.respawnReset();
    this.camera.setYawPitch(sp.yaw, -0.12);
    this.camera.snap();
    this.setHintsFor(mission === 'gauntlet' ? 'practice' : level);
    this.hud.setMarkers(0, 0);
    c.levelStarted(s, level, mission);
    this.fsm.go('playing');
    this.loading = false;
    if (pending && (pending.level !== level || pending.mission !== mission)) void this.coopGuestStart(pending.level, pending.mission);
  }

  /** De vuelta en la sala (el anfitrión volvió a ella). */
  coopToLobby(): void {
    this.leaveLevelScreens();
    if (this.fsm.state === 'paused') this.fsm.go('playing');
    if (this.fsm.state !== 'title') this.fsm.go('title');
    this.screens.show('coopLobby');
  }

  /** Invitado: el anfitrión lo colocó (al entrar o al reaparecer): la cámara va con él. */
  coopSpawned(revived: boolean): void {
    const s = this.session;
    if (!s) return;
    this.camera.setYawPitch(s.player.yaw, -0.12);
    this.camera.snap();
    if (revived && this.fsm.state === 'dead') {
      this.hud.hideDeath();
      this.aimLatched = false;
      this.fsm.go(this.deathReturn);
    }
  }

  /** Invitado: la misión terminó. Las monedas del contrato también van a su partida guardada. */
  coopResults(r: CoopResults): void {
    if (!this.coop?.isGuest) return;
    const coins = r.success ? Math.min(r.coins, MAX_COINS - this.profile.coins) : 0;
    if (coins > 0) {
      this.profile.coins += coins;
      this.saveNow();
    }
    const net = this.coop.missionNet;
    const view: ResultsView = {
      missionName: `${MISSIONS[r.mission].name} · ${COOP_TEXT.teamResult}`,
      success: r.success,
      failReason: r.failReason,
      rank: r.rank,
      total: r.total,
      capped: false,
      subs: [],
      timeSec: r.timeSec,
      kills: r.kills,
      markersUsed: net?.markersUsed ?? 0,
      markersTotal: net?.markersTotal ?? 0,
      coins,
      achievements: [],
      newBest: false,
      styleScore: this.session?.combat.style.score ?? 0,
      gauntlet: null,
      coop: { leave: COOP_TEXT.leaveGame, retry: false, note: COOP_TEXT.waitingNext },
    };
    this.hud.hideDeath();
    if (this.fsm.state === 'paused') this.fsm.go('playing');
    if (this.fsm.state === 'playing' || this.fsm.state === 'dead') this.fsm.go('results');
    this.audio.ui(r.success ? 'coin' : 'error');
    this.screens.showResults(
      view,
      () => undefined,
      () => this.coopLeave(),
    );
  }

  /** Anfitrión: cayó un invitado. Gasta un marcador del equipo; sin marcadores, el contrato termina. */
  coopGuestDied(): void {
    const m = this.mission;
    if (!m) return;
    m.onPlayerDied();
    this.hud.setMarkers(m.markersUsed, m.markersTotal);
  }

  /** Algo cambió en la sala: se repinta si está a la vista. */
  coopChanged(): void {
    if (this.screens.current === 'coopLobby') this.screens.refresh();
  }

  /** El cooperativo terminó sin que este jugador lo eligiera (versión distinta, sala llena, conexión perdida). */
  coopEnded(message: string): void {
    if (!this.coop) return;
    this.coop = null;
    this.coopPending = null;
    this.coopError = message;
    this.leaveLevelScreens();
    if (this.fsm.state === 'paused') this.fsm.go('playing');
    if (this.fsm.state !== 'title') this.fsm.go('title');
    this.screens.show('coop');
  }

  /** Al dejar un nivel del cooperativo: sin pantalla de muerte, sin equipo en el HUD y sin misión. */
  private leaveLevelScreens(): void {
    this.updateHiddenTicker();
    this.mission = null;
    this.hud.hideDeath();
    this.hud.setTeam(null);
    this.hud.setMarkers(0, 0);
  }

  /** Baliza del objetivo: proyecta el punto a pantalla; fuera de vista, flecha en el borde. */
  private updateBeacon(): void {
    const s = this.session;
    const m = this.mission;
    const net = this.coop?.missionNet;
    const b = net?.beacon;
    if (b) _beacon.set(b.x, b.y, b.z);
    if (!s || (net ? !b : !m || !m.beacon(_beacon))) {
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
    // Asomado por el borde de una cobertura, la cámara pasa al hombro de ese lado (sin contar como cambio del jugador).
    this.camera.shoulderOverride = p.state === 'cover' ? (p.cover?.peekSide ?? 0) : 0;
    this.camera.update({ feet: _feet, posture: p.posture, aiming: p.aiming, sprinting: p.sprinting, dt: realDt, zoom: s.combat.weapon.def.aimFov }, s.physics);
    if (this.opts.qa) checkCameraInvariants(s, this.camera, this.invariants);
    const rig = s.playerRig;
    rig.root.position.copy(_feet);
    const yaw = updateBodyYaw(this.playerYaw, p.renderYaw(alpha), p.aiming, scaledDt);
    rig.root.rotation.y = yaw;
    const c = s.combat;
    const model: WeaponModel = c.holstered ? 'none' : WEAPON_MODEL[c.current];
    // El modelo cambia a mitad del gesto, cuando la mano está en la cadera.
    const swapT = c.switchT > 0 ? 1 - c.switchT / SWITCH_TIME : 1;
    if (model !== this.lastWeaponModel && swapT >= 0.5) {
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
    pose.melee = c.grab;
    pose.slash = c.slashPhase;
    // La cabeza mira hacia donde apunta la cámara; con la cámara delante del personaje, al frente.
    pose.lookYaw = wrapAngle(this.camera.yaw - yaw);
    pose.look = 1;
    pose.swap = c.switchT > 0 ? Math.sin(swapT * Math.PI) : 0;
    pose.takedown = c.takedown ? c.takedown.t : -1;
    pose.vault = p.vaultProgress;
    pose.cover = p.state === 'cover' && p.cover ? p.cover.height : 'none';
    pose.peek = p.peekAmount;
    rig.update(pose, scaledDt);
    rig.setOpacity(this.camera.distanceToHead < 0.55 ? 0 : 1);
  }

  private updateAttractCamera(dt: number): void {
    this.orbit += dt;
    const cam = this.renderer.camera;
    const a = this.session?.data.attract;
    if (a) {
      // Ida y vuelta suave (coseno) entre los dos puntos del travelling.
      const u = 0.5 - 0.5 * Math.cos((2 * Math.PI * this.orbit) / a.period);
      _attractFrom.set(a.from[0], a.from[1], a.from[2]);
      _attractTo.set(a.to[0], a.to[1], a.to[2]);
      cam.position.lerpVectors(_attractFrom, _attractTo, u);
      cam.lookAt(a.look[0], a.look[1], a.look[2]);
      return;
    }
    const k = this.orbit * ORBIT_SPEED;
    cam.position.set(Math.sin(k) * ORBIT_RADIUS, ORBIT_HEIGHT, Math.cos(k) * ORBIT_RADIUS);
    cam.lookAt(_orbitTarget);
  }

  private updateHud(dt: number): void {
    const s = this.session;
    if (!s) return;
    const c = s.combat;
    const v = this.hudView;
    v.yaw = this.camera.yaw;
    v.fovDeg = this.renderer.camera.fov;
    v.viewportHeight = window.innerHeight;
    fillHudData(this.hudData, s, v);
    this.hud.update(this.hudData, dt);
    this.hud.setCrosshairVisible(!c.holstered);
    const net = this.coop?.missionNet;
    if (net) this.hud.setMarkers(net.markersUsed, net.markersTotal);
    this.peekTimer -= dt;
    if (this.peekTimer <= 0) {
      this.peekTimer = 0.1;
      const prev = this.nearInteractable;
      this.nearInteractable =
        this.fsm.controlling && this.interactionsAllowed ? s.nearestInteractable(this.camera.yaw, this.blockedInteractables(), !!this.coop?.isGuest) : null;
      if (this.nearInteractable !== prev) this.holdT = 0;
      const pi = this.promptIn;
      pi.near = this.nearInteractable;
      pi.holdT = this.holdT;
      pi.yaw = this.camera.yaw;
      pi.moveX = this.move.x;
      pi.moveY = this.move.y;
      this.hud.setPrompt(this.fsm.controlling ? contextPrompt(s, pi) : null);
      this.hud.setTeam(this.coop?.inMatch ? this.teamView(s) : null);
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
      s.enemyViews.update(s.enemies.enemies, 1, FIXED_DT);
      s.vfx.update(FIXED_DT);
      s.combat.frameUpdate(FIXED_DT, this.audio);
      s.alarm.update(FIXED_DT);
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
    if (!s || !this.fsm.controlling || !this.interactionsAllowed) return false;
    const it = s.nearestInteractable(this.camera.yaw, this.blockedInteractables(), !!this.coop?.isGuest);
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

  // =========================================================== debug
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
        `Enemigos vivos ${ai.alive}/${ai.total}  atascos ${ai.stuckEvents}  máx. sin avanzar ${ai.maxNoProgress.toFixed(1)} s  ${Object.entries(ai.states)
          .map(([k, v]) => `${k}:${v}`)
          .join(' ')}`,
        `Hub ${this.director ? `${this.director.state} oleada ${this.director.rules.wave}` : '—'}   cámara dist ${this.camera.distanceToHead.toFixed(2)}  yaw ${this.camera.yaw.toFixed(2)}`,
        `Input mantenidas ${this.input.heldCount}  pointer lock ${this.input.pointerLocked ? 'sí' : 'no'}  dispositivo ${this.input.lastDevice}`,
      );
    }
    if (this.opts.qa) {
      const v = this.invariants;
      lines.push(
        `QA penetraciones ${v.penetrations}  cámara dentro ${v.cameraInside}  tapada ${v.cameraOccluded}  fuera ${v.outOfBounds}  combate ${this.combatInconsistencies}`,
      );
    }
    lines.push(`GPU ${this.renderer.gpuInfo()}`);
    return lines.join('\n');
  }
}
