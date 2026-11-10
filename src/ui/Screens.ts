import type { UpgradeId } from '../combat/weapons';
import { ACTION_LABELS, type Action } from '../core/actions';
import type { Input } from '../core/Input';
import type { Profile } from '../core/Save';
import { canBuy, SHOP } from '../hub/economy';
import type { Dialogue } from '../hub/dialogue';
import { MISSION_ORDER, type MissionId, MISSIONS } from '../missions/types';
import { button, h, keycap } from './dom';

export type ScreenId = 'title' | 'confirmNew' | 'pause' | 'controls' | 'dialog' | 'shop' | 'contracts';

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
      if (e.repeat || this.current !== 'dialog') return;
      if (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        this.advanceDialog();
      }
    });
  }

  get isMenu(): boolean {
    return this.current !== null && MENU_SCREENS.has(this.current);
  }

  show(id: ScreenId): void {
    if (id === 'controls') this.back = this.current;
    this.current = id;
    this.root.hidden = false;
    this.root.replaceChildren(this.build(id));
    this.root.dataset.screen = id;
    const first = this.root.querySelector<HTMLButtonElement>('button.btn-primary') ?? this.root.querySelector<HTMLButtonElement>('button');
    first?.focus({ preventScroll: true });
  }

  hide(): void {
    this.current = null;
    this.dialog = null;
    this.root.hidden = true;
    this.root.replaceChildren();
    delete this.root.dataset.screen;
  }

  closeControls(): void {
    if (this.back && this.back !== 'controls') this.show(this.back);
    else this.hide();
    this.back = null;
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
      case 'dialog':
        return this.buildDialog();
      case 'shop':
        return this.buildShop();
      case 'contracts':
        return this.buildContracts();
    }
  }

  private buildTitle(): HTMLElement {
    const hasSave = this.cb.hasSave();
    const menu: HTMLElement[] = [];
    if (hasSave) menu.push(button('Continuar', () => this.cb.onContinue(), 'btn btn-primary'));
    menu.push(button('Nueva partida', () => (hasSave ? this.show('confirmNew') : this.cb.onNewGame()), hasSave ? 'btn' : 'btn btn-primary'));
    menu.push(button('Controles', () => this.show('controls')));
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
    const menu = [button('Reanudar', () => this.cb.onResume(), 'btn btn-primary'), button('Controles', () => this.show('controls'))];
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
      h('div', { class: 'menu' }, [button('Volver', () => this.closeControls(), 'btn btn-primary')]),
    ]);
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
      else action = button(best ? 'Repetir' : 'Aceptar', () => this.cb.onStartMission(id), 'btn btn-small btn-primary');
      return h('div', { class: `contract ${m.available && reqDone ? 'open' : 'locked'}`, dataset: { mission: id } }, [
        h('div', { class: 'shop-text' }, [
          h('div', { class: 'shop-name', text: m.name }),
          h('div', { class: 'shop-desc', text: m.place }),
          h('div', { class: 'contract-brief', text: m.briefing[0] }),
        ]),
        h('div', { class: 'contract-best', text: best ? `Mejor: ${best.rank}` : '—' }),
        action,
      ]);
    });
    return h('section', { class: 'screen screen-contracts', role: 'dialog', ariaLabel: 'Tablero de contratos' }, [
      h('h2', { class: 'screen-heading', text: 'CONTRATOS · RECEPCIÓN' }),
      h('div', { class: 'coins' }, [h('span', { class: 'coin-icon', text: '◉' }), h('b', { class: 'coin-count', text: String(p.coins) }), ' Monedas Continental']),
      h('div', { class: 'shop-list' }, rows),
      h('div', { class: 'menu' }, [button('Cerrar', () => this.cb.onCloseMenu(), 'btn')]),
    ]);
  }
}
