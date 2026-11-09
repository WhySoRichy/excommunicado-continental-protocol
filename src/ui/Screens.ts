import { ACTION_LABELS, type Action } from '../core/actions';
import type { Input } from '../core/Input';
import { button, h, keycap } from './dom';

export type ScreenId = 'title' | 'pause' | 'controls';

export interface ScreenCallbacks {
  onPlayArena(): void;
  onPlayPractice(): void;
  onResume(): void;
  onQuitToTitle(): void;
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

/**
 * Pantallas modales (título, pausa, controles). Navegables con teclado:
 * el primer botón recibe el foco y Esc vuelve atrás en "controles".
 */
export class Screens {
  readonly root: HTMLDivElement;
  current: ScreenId | null = null;
  private back: ScreenId | null = null;
  private readonly cache = new Map<ScreenId, HTMLElement>();

  constructor(
    uiRoot: HTMLElement,
    private readonly input: Input,
    private readonly cb: ScreenCallbacks,
  ) {
    this.root = h('div', { id: 'screens' });
    this.root.hidden = true;
    uiRoot.appendChild(this.root);
  }

  show(id: ScreenId): void {
    if (id === 'controls') this.back = this.current;
    this.current = id;
    this.root.hidden = false;
    this.root.replaceChildren(this.build(id));
    this.root.dataset.screen = id;
    const first = this.root.querySelector<HTMLButtonElement>('button');
    first?.focus({ preventScroll: true });
  }

  hide(): void {
    this.current = null;
    this.root.hidden = true;
    this.root.replaceChildren();
    delete this.root.dataset.screen;
  }

  closeControls(): void {
    if (this.back) this.show(this.back);
    else this.hide();
    this.back = null;
  }

  private build(id: ScreenId): HTMLElement {
    // Controles se reconstruye siempre (refleja reasignaciones y el último dispositivo).
    if (id !== 'controls') {
      const hit = this.cache.get(id);
      if (hit) return hit;
    }
    let el: HTMLElement;
    switch (id) {
      case 'title':
        el = this.buildTitle();
        break;
      case 'pause':
        el = this.buildPause();
        break;
      case 'controls':
        el = this.buildControls();
        break;
    }
    if (id !== 'controls') this.cache.set(id, el);
    return el;
  }

  private buildTitle(): HTMLElement {
    return h('section', { class: 'screen screen-title', role: 'dialog', ariaLabel: 'Pantalla de título' }, [
      h('div', { class: 'title-block' }, [
        h('div', { class: 'title-main', text: 'EXCOMMUNICADO' }),
        h('div', { class: 'title-sub', text: 'CONTINENTAL PROTOCOL' }),
      ]),
      h('div', { class: 'menu' }, [
        button('Simulacro de combate', () => this.cb.onPlayPractice(), 'btn btn-primary'),
        button('Arena de pruebas (movimiento)', () => this.cb.onPlayArena()),
        button('Controles', () => this.show('controls')),
      ]),
      h('p', { class: 'fan-note', text: 'Proyecto de fans sin fines de lucro. No afiliado ni respaldado por los titulares de la franquicia John Wick.' }),
    ]);
  }

  private buildPause(): HTMLElement {
    return h('section', { class: 'screen screen-pause', role: 'dialog', ariaLabel: 'Pausa' }, [
      h('h2', { class: 'screen-heading', text: 'PAUSA' }),
      h('div', { class: 'menu' }, [
        button('Reanudar', () => this.cb.onResume(), 'btn btn-primary'),
        button('Controles', () => this.show('controls')),
        button('Salir al título', () => this.cb.onQuitToTitle()),
      ]),
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
}
