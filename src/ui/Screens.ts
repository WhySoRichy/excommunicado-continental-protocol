import type { UpgradeId } from '../combat/weapons';
import { ACTION_LABELS, type Action, codeLabel, REBINDABLE } from '../core/actions';
import type { Input } from '../core/Input';
import type { Profile } from '../core/Save';
import { defaultSettings, type NumericSetting, type QualityPresetId, rebind, SETTING_RANGES, type Settings } from '../core/Settings';
import { canBuy, SHOP } from '../hub/economy';
import type { Dialogue } from '../hub/dialogue';
import { MISSION_ORDER, type MissionDef, type MissionId, MISSIONS } from '../missions/types';
import { button, h, keycap } from './dom';

export type ScreenId = 'title' | 'confirmNew' | 'pause' | 'controls' | 'settings' | 'dialog' | 'shop' | 'contracts' | 'briefing' | 'results';

type SettingsTab = 'controls' | 'video' | 'access' | 'keys';
type BoolSetting = 'invertY' | 'aimToggle' | 'dynamicResolution' | 'hints';
const SETTINGS_TABS: ReadonlyArray<[SettingsTab, string]> = [
  ['controls', 'Controles'],
  ['video', 'Vídeo y audio'],
  ['access', 'Accesibilidad'],
  ['keys', 'Teclas'],
];
const PRESET_LABELS: ReadonlyArray<[QualityPresetId, string]> = [
  ['low', 'Bajo'],
  ['medium', 'Medio'],
  ['high', 'Alto'],
];
const pct = (v: number): string => `${Math.round(v * 100)} %`;
const times = (v: number): string => `×${v.toFixed(2)}`;

/** Datos que pinta la pantalla de resultados. */
export interface ResultsView {
  missionName: string;
  success: boolean;
  failReason: string;
  rank: string;
  total: number;
  capped: boolean;
  subs: Array<{ label: string; value: number | null }>;
  timeSec: number;
  kills: number;
  markersUsed: number;
  markersTotal: number;
  coins: number;
  achievements: Array<{ name: string; coins: number }>;
  newBest: boolean;
  styleScore: number;
  /** Gauntlet: oleadas, puesto en el top 10 (0 = fuera) y top actual. */
  gauntlet: { waves: number; position: number; top: Array<{ waves: number; score: number }> } | null;
}

export interface ScreenCallbacks {
  onContinue(): void;
  onNewGame(): void;
  onPlayArena(): void;
  onPlayPractice(): void;
  onResume(): void;
  onReturnToHub(): void;
  onQuitToTitle(): void;
  /** Cierra diálogo/tienda/contratos y devuelve el control al jugador. */
  onCloseMenu(): void;
  onBuy(id: UpgradeId): void;
  onStartMission(id: MissionId): void;
  settings(): Settings;
  onSettingsChange(s: Settings): void;
  hasSave(): boolean;
  inHub(): boolean;
  profile(): Profile;
}

/** Filas de la tabla de controles (acción → etiqueta). */
const CONTROL_ROWS: Array<{ label: string; actions: Action[] }> = [
  { label: 'Mover', actions: ['moveForward', 'moveLeft', 'moveBack', 'moveRight'] },
  { label: 'Mirar', actions: [] },
  { label: 'Disparar / Apuntar', actions: ['fire', 'aim'] },
  { label: 'Recargar', actions: ['reload'] },
  { label: 'Takedown / Melee', actions: ['takedown'] },
  { label: 'Interactuar', actions: ['interact'] },
  { label: 'Sprint', actions: ['sprint'] },
  { label: 'Agacharse · Deslizar (corriendo) · Cubrirse (junto a pared)', actions: ['crouch'] },
  { label: 'Saltar / Vault', actions: ['jump'] },
  { label: 'Esquiva (o doble Espacio)', actions: ['dodge'] },
  { label: 'Foco (cámara lenta)', actions: ['focus'] },
  { label: 'Armas', actions: ['weapon1', 'weapon2', 'weapon3'] },
  { label: 'Cambiar de hombro', actions: ['shoulder'] },
  { label: 'Contratos / Intel', actions: ['intel'] },
  { label: 'Pausa · Controles', actions: ['pause', 'help'] },
  { label: 'Debug', actions: ['debug'] },
];

const MENU_SCREENS: ReadonlySet<ScreenId> = new Set(['dialog', 'shop', 'contracts']);

/**
 * Pantallas modales (título, pausa, controles, diálogos, tienda, contratos).
 * Navegables con teclado: el primer botón recibe el foco; en diálogos E/Enter/Espacio avanzan.
 */
export class Screens {
  readonly root: HTMLDivElement;
  current: ScreenId | null = null;
  private back: ScreenId | null = null;
  private dialog: Dialogue | null = null;
  private dialogIndex = 0;
  private onDialogEnd: (() => void) | null = null;
  private settingsTab: SettingsTab = 'controls';
  /** Acción esperando tecla nueva (pestaña Teclas). */
  private rebinding: Action | null = null;
  private settingsNote = '';

  constructor(
    uiRoot: HTMLElement,
    private readonly input: Input,
    private readonly cb: ScreenCallbacks,
    private readonly devButtons: boolean,
  ) {
    this.root = h('div', { id: 'screens' });
    this.root.hidden = true;
    uiRoot.appendChild(this.root);
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      if (this.current === 'dialog' && (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        this.advanceDialog();
      } else if (this.current === 'briefing' && e.code === 'Enter' && this.briefing) {
        e.preventDefault();
        this.briefing.onStart();
      }
    });
  }

  get isMenu(): boolean {
    return this.current !== null && MENU_SCREENS.has(this.current);
  }

  show(id: ScreenId): void {
    // Controles y Ajustes son subpantallas: recuerdan desde dónde se abrieron (título o pausa).
    if ((id === 'controls' || id === 'settings') && this.current !== id) this.back = this.current;
    if (id !== 'settings') this.cancelRebind();
    this.current = id;
    this.root.hidden = false;
    this.root.replaceChildren(this.build(id));
    this.root.dataset.screen = id;
    const first = this.root.querySelector<HTMLButtonElement>('button.btn-primary') ?? this.root.querySelector<HTMLButtonElement>('button');
    first?.focus({ preventScroll: true });
  }

  hide(): void {
    this.cancelRebind();
    this.current = null;
    this.dialog = null;
    this.root.hidden = true;
    this.root.replaceChildren();
    delete this.root.dataset.screen;
  }

  /** Cierra Controles o Ajustes y vuelve a la pantalla de origen. */
  closeSub(): void {
    const back = this.back;
    this.back = null;
    if (back && back !== 'controls' && back !== 'settings') this.show(back);
    else this.hide();
  }

  private cancelRebind(): void {
    if (!this.rebinding) return;
    this.rebinding = null;
    this.input.captureNextCode(null);
  }

  /** Diálogo de NPC. `onEnd` se llama al pasar la última línea (p. ej. abrir la tienda). */
  showDialog(d: Dialogue, onEnd: (() => void) | null = null): void {
    this.dialog = d;
    this.dialogIndex = 0;
    this.onDialogEnd = onEnd;
    this.show('dialog');
  }

  advanceDialog(): void {
    if (!this.dialog) return;
    if (this.dialogIndex < this.dialog.lines.length - 1) {
      this.dialogIndex++;
      this.show('dialog');
      return;
    }
    const end = this.onDialogEnd;
    this.dialog = null;
    this.onDialogEnd = null;
    if (end) end();
    else this.cb.onCloseMenu();
  }

  /** Vuelve a pintar la pantalla actual (tras comprar, por ejemplo). */
  refresh(): void {
    if (this.current) this.show(this.current);
  }

  /** Briefing de 3 líneas: objetivo, regla especial, rango objetivo. */
  showBriefing(m: MissionDef, onStart: () => void, onBack: () => void, onSkip: (() => void) | null = null): void {
    this.briefing = { m, onStart, onBack, onSkip };
    this.show('briefing');
  }

  showResults(r: ResultsView, onRetry: () => void, onHub: () => void): void {
    this.results = { r, onRetry, onHub };
    this.show('results');
  }

  private briefing: { m: MissionDef; onStart: () => void; onBack: () => void; onSkip: (() => void) | null } | null = null;
  private results: { r: ResultsView; onRetry: () => void; onHub: () => void } | null = null;

  private build(id: ScreenId): HTMLElement {
    switch (id) {
      case 'title':
        return this.buildTitle();
      case 'confirmNew':
        return this.buildConfirmNew();
      case 'pause':
        return this.buildPause();
      case 'controls':
        return this.buildControls();
      case 'settings':
        return this.buildSettings();
      case 'dialog':
        return this.buildDialog();
      case 'shop':
        return this.buildShop();
      case 'contracts':
        return this.buildContracts();
      case 'briefing':
        return this.buildBriefing();
      case 'results':
        return this.buildResults();
    }
  }

  private buildBriefing(): HTMLElement {
    const b = this.briefing;
    if (!b) return h('section', { class: 'screen' });
    const [objective, rule, target] = b.m.briefing;
    return h('section', { class: 'screen screen-briefing', role: 'dialog', ariaLabel: `Briefing: ${b.m.name}` }, [
      h('div', { class: 'brief-kicker', text: 'CONTRATO' }),
      h('h2', { class: 'screen-heading', text: b.m.name.toUpperCase() }),
      h('div', { class: 'brief-place', text: b.m.place }),
      h('ol', { class: 'brief-lines' }, [
        h('li', {}, [h('b', { text: 'Objetivo. ' }), objective]),
        h('li', {}, [h('b', { text: 'Regla. ' }), rule]),
        h('li', {}, [h('b', { text: 'Meta. ' }), target]),
      ]),
      h('div', { class: 'menu menu-row' }, [button('Empezar', b.onStart, 'btn btn-primary'), ...(b.onSkip ? [button('Saltar tutorial', b.onSkip)] : []), button('Volver', b.onBack)]),
      h('p', { class: 'screen-hint' }, ['Pulsa ', keycap('Enter'), ' para empezar.']),
    ]);
  }

  private buildResults(): HTMLElement {
    const x = this.results;
    if (!x) return h('section', { class: 'screen' });
    const r = x.r;
    if (r.gauntlet) return this.buildGauntletResults(r, r.gauntlet, x.onRetry, x.onHub);
    const mm = Math.floor(r.timeSec / 60);
    const ss = Math.floor(r.timeSec % 60);
    const subs = r.subs.map((s) =>
      h('div', { class: 'sub' }, [
        h('span', { class: 'sub-label', text: s.label }),
        h('div', { class: 'sub-bar' }, [h('div', { class: 'sub-fill', style: { width: `${s.value ?? 0}%` } })]),
        h('span', { class: 'sub-value', text: s.value === null ? '—' : String(Math.round(s.value)) }),
      ]),
    );
    const extras: HTMLElement[] = [];
    if (r.success) {
      extras.push(h('div', { class: 'coins coins-big' }, [h('span', { class: 'coin-icon', text: '◉' }), h('b', { class: 'coin-count', text: `+${r.coins}` }), ' Monedas Continental']));
      if (r.newBest) extras.push(h('div', { class: 'results-best', text: 'Nuevo mejor resultado' }));
      if (r.achievements.length) {
        extras.push(h('div', { class: 'achv-title', text: 'Logros' }));
        for (const a of r.achievements) extras.push(h('div', { class: 'achv', text: `${a.name}${a.coins ? ` · +${a.coins}` : ''}` }));
      }
    } else {
      extras.push(h('p', { class: 'results-fail', text: r.failReason }));
    }
    return h('section', { class: `screen screen-results ${r.success ? 'ok' : 'fail'}`, role: 'dialog', ariaLabel: 'Resultados del contrato' }, [
      h('div', { class: 'brief-kicker', text: r.success ? 'CONTRATO CUMPLIDO' : 'CONTRATO FALLIDO' }),
      h('h2', { class: 'screen-heading', text: r.missionName.toUpperCase() }),
      h('div', { class: 'results-grid' }, [
        h('div', { class: 'rank-box', dataset: { rank: r.rank } }, [h('div', { class: 'rank-letter', text: r.success ? r.rank : '—' }), h('div', { class: 'rank-total', text: r.success ? `${Math.round(r.total)} / 100${r.capped ? ' · limitado a C' : ''}` : '' })]),
        h('div', { class: 'subs' }, subs),
      ]),
      h('div', { class: 'results-line', text: `Tiempo ${mm}:${String(ss).padStart(2, '0')} · Bajas ${r.kills} · Estilo ${r.styleScore.toLocaleString('es')} · Marcadores usados ${r.markersUsed}/${r.markersTotal}` }),
      ...extras,
      h('div', { class: 'menu menu-row' }, [button('Volver al Continental', x.onHub, 'btn btn-primary'), button(r.success ? 'Repetir contrato' : 'Reintentar', x.onRetry)]),
    ]);
  }

  private buildGauntletResults(r: ResultsView, g: NonNullable<ResultsView['gauntlet']>, onRetry: () => void, onHub: () => void): HTMLElement {
    const extras: HTMLElement[] = [h('div', { class: 'coins coins-big' }, [h('span', { class: 'coin-icon', text: '◉' }), h('b', { class: 'coin-count', text: `+${r.coins}` }), ' Monedas Continental'])];
    if (r.achievements.length) {
      extras.push(h('div', { class: 'achv-title', text: 'Logros' }));
      for (const a of r.achievements) extras.push(h('div', { class: 'achv', text: `${a.name}${a.coins ? ` · +${a.coins}` : ''}` }));
    }
    const place = g.position > 0 ? `Puesto ${g.position} del top 10${g.position === 1 ? ' · nuevo récord' : ''}` : g.waves > 0 ? 'Fuera del top 10' : 'Sin oleadas superadas';
    return h('section', { class: 'screen screen-results ok', role: 'dialog', ariaLabel: 'Resultados del Gauntlet' }, [
      h('div', { class: 'brief-kicker', text: 'GAUNTLET TERMINADO' }),
      h('h2', { class: 'screen-heading', text: r.missionName.toUpperCase() }),
      h('div', { class: 'results-grid' }, [
        h('div', { class: 'rank-box gauntlet-box' }, [h('div', { class: 'rank-letter gauntlet-waves', text: String(g.waves) }), h('div', { class: 'rank-total', text: g.waves === 1 ? 'oleada superada' : 'oleadas superadas' })]),
        this.gauntletTable(g.top, g.position),
      ]),
      h('div', { class: 'results-line gauntlet-place', text: `${place} · Bajas ${r.kills} · Estilo ${r.styleScore.toLocaleString('es')}` }),
      ...extras,
      h('div', { class: 'menu menu-row' }, [button('Volver al Continental', onHub, 'btn btn-primary'), button('Otra vez', onRetry)]),
    ]);
  }

  /** Top 10 local del Gauntlet (resalta el puesto recién conseguido). */
  private gauntletTable(top: ReadonlyArray<{ waves: number; score: number }>, highlight: number): HTMLElement {
    if (top.length === 0) return h('p', { class: 'gauntlet-empty', text: 'Aún no hay récords.' });
    return h(
      'ol',
      { class: 'gauntlet-top', ariaLabel: 'Top 10 del Gauntlet' },
      top.map((e, i) => h('li', { class: i + 1 === highlight ? 'me' : '' }, [h('span', { class: 'gt-waves', text: `${e.waves} oleadas` }), h('span', { class: 'gt-score', text: e.score.toLocaleString('es') })])),
    );
  }

  private buildTitle(): HTMLElement {
    const hasSave = this.cb.hasSave();
    const menu: HTMLElement[] = [];
    if (hasSave) menu.push(button('Continuar', () => this.cb.onContinue(), 'btn btn-primary'));
    menu.push(button('Nueva partida', () => (hasSave ? this.show('confirmNew') : this.cb.onNewGame()), hasSave ? 'btn' : 'btn btn-primary'));
    menu.push(button('Controles', () => this.show('controls')));
    menu.push(button('Ajustes', () => this.show('settings')));
    if (this.devButtons) {
      menu.push(button('Simulacro directo (QA)', () => this.cb.onPlayPractice(), 'btn btn-dev'));
      menu.push(button('Arena de pruebas (QA)', () => this.cb.onPlayArena(), 'btn btn-dev'));
    }
    return h('section', { class: 'screen screen-title', role: 'dialog', ariaLabel: 'Pantalla de título' }, [
      h('div', { class: 'title-block' }, [h('div', { class: 'title-main', text: 'EXCOMMUNICADO' }), h('div', { class: 'title-sub', text: 'CONTINENTAL PROTOCOL' })]),
      h('div', { class: 'menu' }, menu),
      h('p', { class: 'fan-note', text: 'Proyecto de fans sin fines de lucro. No afiliado ni respaldado por los titulares de la franquicia John Wick.' }),
    ]);
  }

  private buildConfirmNew(): HTMLElement {
    return h('section', { class: 'screen', role: 'alertdialog', ariaLabel: 'Confirmar nueva partida' }, [
      h('h2', { class: 'screen-heading', text: '¿NUEVA PARTIDA?' }),
      h('p', { class: 'screen-hint', text: 'Se borrará la partida guardada (monedas, mejoras y récords). Esta acción no se puede deshacer.' }),
      h('div', { class: 'menu' }, [button('Sí, borrar y empezar', () => this.cb.onNewGame(), 'btn btn-danger'), button('No, volver', () => this.show('title'), 'btn btn-primary')]),
    ]);
  }

  private buildPause(): HTMLElement {
    const menu = [button('Reanudar', () => this.cb.onResume(), 'btn btn-primary'), button('Controles', () => this.show('controls')), button('Ajustes', () => this.show('settings'))];
    if (!this.cb.inHub()) menu.push(button('Volver al Continental', () => this.cb.onReturnToHub()));
    menu.push(button('Salir al título', () => this.cb.onQuitToTitle()));
    return h('section', { class: 'screen screen-pause', role: 'dialog', ariaLabel: 'Pausa' }, [
      h('h2', { class: 'screen-heading', text: 'PAUSA' }),
      h('div', { class: 'menu' }, menu),
      h('p', { class: 'screen-hint', text: 'El juego se pausa solo al cambiar de ventana o pulsar Esc. Haz clic en Reanudar para volver.' }),
    ]);
  }

  private buildControls(): HTMLElement {
    const dev = this.input.lastDevice;
    const rows = CONTROL_ROWS.map((r) => {
      const keys = r.actions.length === 0 ? [keycap(dev === 'pad' ? 'Stick der.' : 'Ratón')] : r.actions.map((a) => keycap(this.input.label(a, dev)));
      return h('tr', {}, [h('th', { text: r.label }), h('td', {}, keys)]);
    });
    return h('section', { class: 'screen screen-controls', role: 'dialog', ariaLabel: 'Controles' }, [
      h('h2', { class: 'screen-heading', text: dev === 'pad' ? 'CONTROLES · GAMEPAD' : 'CONTROLES · TECLADO Y RATÓN' }),
      h('table', { class: 'controls-table' }, [h('tbody', {}, rows)]),
      h('p', { class: 'screen-hint', text: `${ACTION_LABELS.crouch}: C hace una cosa u otra según el contexto; el aviso en pantalla te dice cuál.` }),
      h('div', { class: 'menu' }, [button('Volver', () => this.closeSub(), 'btn btn-primary')]),
    ]);
  }

  // ------------------------------------------------------------ Ajustes
  private updateSettings(patch: Partial<Settings>): void {
    this.cb.onSettingsChange({ ...this.cb.settings(), ...patch });
  }

  /** Repinta Ajustes y devuelve el foco al control tocado (navegable con teclado). */
  private reshowSettings(focusSel: string): void {
    this.show('settings');
    this.root.querySelector<HTMLElement>(focusSel)?.focus({ preventScroll: true });
  }

  private buildSettings(): HTMLElement {
    const tabBar = h(
      'div',
      { class: 'tabs', role: 'tablist', ariaLabel: 'Secciones de ajustes' },
      SETTINGS_TABS.map(([id, label]) => {
        const b = button(
          label,
          () => {
            this.settingsTab = id;
            this.settingsNote = '';
            this.cancelRebind();
            this.reshowSettings(`[data-tab="${id}"]`);
          },
          `tab${id === this.settingsTab ? ' active' : ''}`,
        );
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-selected', String(id === this.settingsTab));
        b.dataset.tab = id;
        return b;
      }),
    );
    let body: HTMLElement[];
    switch (this.settingsTab) {
      case 'controls':
        body = [
          this.slider('Sensibilidad del ratón', 'mouseSens', 0.05, times),
          this.slider('Sensibilidad del mando', 'padSens', 0.05, times),
          this.toggle('Invertir eje Y', 'invertY'),
          this.toggle('Apuntar: pulsar para alternar (en vez de mantener)', 'aimToggle'),
          this.slider('Campo de visión', 'fov', 1, (v) => `${Math.round(v)}°`),
        ];
        break;
      case 'video':
        body = [
          this.presetRow(),
          this.toggle('Resolución dinámica', 'dynamicResolution'),
          this.slider('Brillo', 'brightness', 0.05, pct),
          this.slider('Volumen general', 'master', 0.05, pct),
          this.slider('Música', 'music', 0.05, pct),
          this.slider('Efectos', 'sfx', 0.05, pct),
          this.slider('Interfaz', 'ui', 0.05, pct),
        ];
        break;
      case 'access':
        body = [
          this.slider('Sacudida de cámara', 'shake', 0.05, pct),
          this.slider('Tamaño de la interfaz', 'uiScale', 0.05, pct),
          this.toggle('Mostrar pistas de teclas', 'hints'),
        ];
        break;
      case 'keys':
        body = [this.keysTable(), h('p', { class: 'screen-hint', text: 'Esc y F3 están reservadas. El clic izquierdo no se puede capturar: "Restablecer" lo devuelve a Disparar.' })];
        break;
    }
    return h('section', { class: 'screen screen-settings', role: 'dialog', ariaLabel: 'Ajustes' }, [
      h('h2', { class: 'screen-heading', text: 'AJUSTES' }),
      tabBar,
      h('div', { class: 'settings-body', role: 'tabpanel' }, body),
      h('p', { class: 'settings-note', text: this.settingsNote, role: 'status' }),
      h('div', { class: 'menu menu-row' }, [
        button('Volver', () => this.closeSub(), 'btn btn-primary'),
        button('Restablecer', () => {
          this.cb.onSettingsChange(defaultSettings());
          this.settingsNote = 'Ajustes de fábrica restaurados.';
          this.reshowSettings('[data-tab]');
        }),
      ]),
    ]);
  }

  private slider(label: string, key: NumericSetting, step: number, fmt: (v: number) => string): HTMLElement {
    const value = this.cb.settings()[key];
    const [lo, hi] = SETTING_RANGES[key];
    const input = h('input', { class: 'slider', ariaLabel: label, dataset: { setting: key } });
    input.type = 'range';
    input.min = String(lo);
    input.max = String(hi);
    input.step = String(step);
    input.value = String(value);
    const out = h('span', { class: 'setting-value', text: fmt(value) });
    input.addEventListener('input', () => {
      const v = Number(input.value);
      out.textContent = fmt(v);
      this.updateSettings({ [key]: v });
    });
    return h('label', { class: 'setting-row' }, [h('span', { class: 'setting-label', text: label }), input, out]);
  }

  private toggle(label: string, key: BoolSetting): HTMLElement {
    const on = this.cb.settings()[key];
    const b = button(
      on ? 'Sí' : 'No',
      () => {
        this.updateSettings({ [key]: !this.cb.settings()[key] });
        this.reshowSettings(`[data-setting="${key}"]`);
      },
      `btn btn-small toggle${on ? ' on' : ''}`,
    );
    b.setAttribute('aria-pressed', String(on));
    b.setAttribute('aria-label', label);
    b.dataset.setting = key;
    return h('div', { class: 'setting-row' }, [h('span', { class: 'setting-label', text: label }), b]);
  }

  private presetRow(): HTMLElement {
    const cur = this.cb.settings().preset;
    const group = h(
      'div',
      { class: 'segmented', role: 'radiogroup', ariaLabel: 'Calidad gráfica' },
      PRESET_LABELS.map(([id, label]) => {
        const b = button(
          label,
          () => {
            this.updateSettings({ preset: id });
            this.reshowSettings(`[data-preset="${id}"]`);
          },
          `btn btn-small${id === cur ? ' on' : ''}`,
        );
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-checked', String(id === cur));
        b.dataset.preset = id;
        return b;
      }),
    );
    return h('div', { class: 'setting-row' }, [h('span', { class: 'setting-label', text: 'Calidad gráfica' }), group]);
  }

  private keysTable(): HTMLElement {
    const s = this.cb.settings();
    const rows = REBINDABLE.map((a) => {
      const kbm = s.bindings[a].filter((c) => !c.startsWith('Pad'));
      const waiting = this.rebinding === a;
      const btn = button(waiting ? 'Pulsa una tecla…' : 'Cambiar', () => this.startRebind(a), `btn btn-small${waiting ? ' capturing' : ''}`);
      btn.dataset.rebind = a;
      return h('tr', { dataset: { action: a } }, [h('th', { text: ACTION_LABELS[a] }), h('td', { class: 'keys' }, [...new Set(kbm.map(codeLabel))].map((l) => keycap(l))), h('td', {}, [btn])]);
    });
    return h('table', { class: 'controls-table keys-table' }, [h('tbody', {}, rows)]);
  }

  private startRebind(a: Action): void {
    this.rebinding = a;
    this.settingsNote = `Pulsa la tecla nueva para «${ACTION_LABELS[a]}». Esc cancela.`;
    this.reshowSettings(`[data-rebind="${a}"]`);
    this.input.captureNextCode((code) => {
      this.rebinding = null;
      if (code === 'Escape') this.settingsNote = 'Cambio cancelado.';
      else {
        const r = rebind(this.cb.settings().bindings, a, code);
        if (!r.ok) this.settingsNote = r.reason === 'reserved' ? `${codeLabel(code)} está reservada.` : 'Esa acción no se puede reasignar.';
        else {
          this.updateSettings({ bindings: r.bindings });
          const moved = r.displaced ? r.bindings[r.displaced].find((c) => !c.startsWith('Pad')) : undefined;
          this.settingsNote =
            r.displaced && moved
              ? `${codeLabel(code)} → ${ACTION_LABELS[a]}. «${ACTION_LABELS[r.displaced]}» pasa a ${codeLabel(moved)}.`
              : `${codeLabel(code)} → ${ACTION_LABELS[a]}.`;
        }
      }
      this.reshowSettings(`[data-rebind="${a}"]`);
    });
  }

  private buildDialog(): HTMLElement {
    const d = this.dialog;
    if (!d) return h('section', { class: 'screen' });
    const last = this.dialogIndex >= d.lines.length - 1;
    const key = this.input.label('interact');
    return h('section', { class: 'screen screen-dialog', role: 'dialog', ariaLabel: `Diálogo con ${d.speaker}` }, [
      h('div', { class: 'dialog-speaker', text: d.speaker }),
      h('p', { class: 'dialog-line', text: d.lines[this.dialogIndex] ?? '' }),
      h('div', { class: 'dialog-footer' }, [
        h('span', { class: 'dialog-count', text: `${this.dialogIndex + 1} / ${d.lines.length}` }),
        button(last ? 'Cerrar' : 'Siguiente', () => this.advanceDialog(), 'btn btn-primary'),
        h('span', { class: 'dialog-hint' }, [keycap(key), ' o ', keycap('Enter')]),
      ]),
    ]);
  }

  private buildShop(): HTMLElement {
    const p = this.cb.profile();
    const rows = SHOP.map((item) => {
      const check = canBuy(p, item.id);
      const status =
        check === 'owned'
          ? h('span', { class: 'shop-status owned', text: 'Comprado' })
          : check === 'locked'
            ? h('span', { class: 'shop-status locked', text: `Requiere ${SHOP.find((s) => s.id === item.requires)?.name ?? '…'}` })
            : check === 'poor'
              ? h('span', { class: 'shop-status poor', text: `Faltan ${item.price - p.coins} monedas` })
              : button(`Comprar · ${item.price}`, () => this.cb.onBuy(item.id), 'btn btn-small btn-primary');
      const el = h('div', { class: `shop-item ${check}`, dataset: { item: item.id } }, [
        h('div', { class: 'shop-text' }, [h('div', { class: 'shop-name', text: item.name }), h('div', { class: 'shop-desc', text: item.desc })]),
        h('div', { class: 'shop-price', text: check === 'owned' ? '✓' : `${item.price} ◉` }),
        status,
      ]);
      return el;
    });
    return h('section', { class: 'screen screen-shop', role: 'dialog', ariaLabel: 'Armería del Sommelier' }, [
      h('h2', { class: 'screen-heading', text: 'ARMERÍA DEL SOMMELIER' }),
      h('div', { class: 'coins', ariaLabel: 'Monedas' }, [h('span', { class: 'coin-icon', text: '◉' }), h('b', { class: 'coin-count', text: String(p.coins) }), ' Monedas Continental']),
      h('div', { class: 'shop-list' }, rows),
      h('div', { class: 'menu' }, [button('Cerrar', () => this.cb.onCloseMenu(), 'btn')]),
    ]);
  }

  private buildContracts(): HTMLElement {
    const p = this.cb.profile();
    const rows = MISSION_ORDER.map((id) => {
      const m = MISSIONS[id];
      const best = p.best[id];
      const reqDone = !m.requires || p.completed.includes(m.requires);
      let action: HTMLElement;
      if (!m.available) action = h('span', { class: 'shop-status locked', text: 'Próximamente' });
      else if (!reqDone) action = h('span', { class: 'shop-status locked', text: `Completa "${MISSIONS[m.requires!].name}"` });
      else action = button(id === 'gauntlet' ? 'Entrar' : best ? 'Repetir' : 'Aceptar', () => this.cb.onStartMission(id), 'btn btn-small btn-primary');
      return h('div', { class: `contract ${m.available && reqDone ? 'open' : 'locked'}`, dataset: { mission: id } }, [
        h('div', { class: 'shop-text' }, [
          h('div', { class: 'shop-name', text: m.name }),
          h('div', { class: 'shop-desc', text: m.place }),
          h('div', { class: 'contract-brief', text: m.briefing[0] }),
        ]),
        h('div', { class: 'contract-best', text: id === 'gauntlet' ? (p.gauntlet[0] ? `Récord: ${p.gauntlet[0].waves}` : '—') : best ? `Mejor: ${best.rank}` : '—' }),
        action,
      ]);
    });
    return h('section', { class: 'screen screen-contracts', role: 'dialog', ariaLabel: 'Tablero de contratos' }, [
      h('h2', { class: 'screen-heading', text: 'CONTRATOS · RECEPCIÓN' }),
      h('div', { class: 'coins' }, [h('span', { class: 'coin-icon', text: '◉' }), h('b', { class: 'coin-count', text: String(p.coins) }), ' Monedas Continental']),
      h('div', { class: 'shop-list' }, rows),
      ...(p.gauntlet.length ? [h('div', { class: 'achv-title', text: 'Récords del Gauntlet' }), this.gauntletTable(p.gauntlet, 0)] : []),
      h('div', { class: 'menu' }, [button('Cerrar', () => this.cb.onCloseMenu(), 'btn')]),
    ]);
  }
}
