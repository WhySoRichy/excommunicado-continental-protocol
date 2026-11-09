import { ACTIONS, type Action, type Bindings, cloneBindings, codeLabel, DEFAULT_BINDINGS } from './actions';

export type InputDevice = 'kbm' | 'pad';

export interface Vec2 {
  x: number;
  y: number;
}

/** Zona muerta radial del gamepad. */
const PAD_DEADZONE = 0.16;
/** Umbral para considerar un gatillo analógico "pulsado". */
const PAD_TRIGGER = 0.35;
/** Teclas cuyo comportamiento por defecto del navegador se bloquea durante el juego. */
const BLOCKED_DEFAULTS = new Set(['Tab', 'Space', 'AltLeft', 'AltRight', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'F3', 'Backquote']);

export type InputEvent = 'blur' | 'hidden' | 'pointerlock-lost' | 'pointerlock-gained' | 'pad-connected' | 'pad-disconnected';

/**
 * Entrada unificada (teclado, ratón, gamepad y virtual para QA).
 *
 * Semántica de latches: `pressed(a)` es verdadero si la acción se pulsó desde el
 * último `endStep()`. El juego llama a `endStep()` al final de cada paso fijo, así que
 * una pulsación nunca se pierde (frames sin pasos) ni se duplica (frames con varios pasos).
 *
 * R6: `reset()` en blur / pestaña oculta / pérdida de pointer lock → ninguna tecla queda pegada.
 */
export class Input {
  /** Si es true, se bloquean los atajos del navegador de las teclas de juego. */
  capturing = false;
  /** Modo QA: no exige pointer lock para mirar con el ratón. */
  freeLook = false;
  lastDevice: InputDevice = 'kbm';

  private bindings: Bindings = cloneBindings(DEFAULT_BINDINGS);
  private codeToActions = new Map<string, Action[]>();
  private readonly down = new Set<string>();
  private readonly padDown = new Set<string>();
  private readonly virtualDown = new Set<string>();
  private readonly pressedLatch = new Set<string>();
  private readonly releasedLatch = new Set<string>();
  private readonly consumed = new Set<string>();
  private mouseDX = 0;
  private mouseDY = 0;
  private readonly padMove: Vec2 = { x: 0, y: 0 };
  private readonly padLook: Vec2 = { x: 0, y: 0 };
  private readonly virtualMove: Vec2 = { x: 0, y: 0 };
  private readonly listeners = new Set<(e: InputEvent) => void>();
  private readonly target: HTMLElement;
  private attached = false;
  private padIndex = -1;
  /** Pulsaciones de tecla "crudas" para el rebind en Ajustes. */
  private captureNext: ((code: string) => void) | null = null;

  constructor(target: HTMLElement) {
    this.target = target;
    this.rebuildMap();
  }

  attach(): void {
    if (this.attached) return;
    this.attached = true;
    window.addEventListener('keydown', this.onKeyDown, { capture: true });
    window.addEventListener('keyup', this.onKeyUp, { capture: true });
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.onMouseMove);
    this.target.addEventListener('wheel', this.onWheel, { passive: false });
    this.target.addEventListener('contextmenu', this.onContextMenu);
    window.addEventListener('blur', this.onBlur);
    document.addEventListener('visibilitychange', this.onVisibility);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    window.addEventListener('gamepadconnected', this.onPadConnected);
    window.addEventListener('gamepaddisconnected', this.onPadDisconnected);
  }

  detach(): void {
    if (!this.attached) return;
    this.attached = false;
    window.removeEventListener('keydown', this.onKeyDown, { capture: true });
    window.removeEventListener('keyup', this.onKeyUp, { capture: true });
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    this.target.removeEventListener('wheel', this.onWheel);
    this.target.removeEventListener('contextmenu', this.onContextMenu);
    window.removeEventListener('blur', this.onBlur);
    document.removeEventListener('visibilitychange', this.onVisibility);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    window.removeEventListener('gamepadconnected', this.onPadConnected);
    window.removeEventListener('gamepaddisconnected', this.onPadDisconnected);
  }

  on(fn: (e: InputEvent) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(e: InputEvent): void {
    for (const fn of this.listeners) fn(e);
  }

  // ---------- Bindings ----------

  getBindings(): Bindings {
    return cloneBindings(this.bindings);
  }

  setBindings(b: Bindings): void {
    this.bindings = cloneBindings(b);
    this.rebuildMap();
  }

  private rebuildMap(): void {
    this.codeToActions.clear();
    for (const a of ACTIONS) {
      for (const code of this.bindings[a]) {
        const list = this.codeToActions.get(code);
        if (list) list.push(a);
        else this.codeToActions.set(code, [a]);
      }
    }
  }

  /** Etiqueta de la tecla de una acción para el dispositivo activo ("E", "Clic izq.", "RT"). */
  label(a: Action, device: InputDevice = this.lastDevice): string {
    const codes = this.bindings[a];
    const pick = device === 'pad' ? codes.find((c) => c.startsWith('Pad')) : codes.find((c) => !c.startsWith('Pad'));
    return codeLabel(pick ?? codes[0] ?? '?');
  }

  /** Captura la siguiente tecla/botón pulsado (para reasignar controles). */
  captureNextCode(fn: ((code: string) => void) | null): void {
    this.captureNext = fn;
  }

  // ---------- Consultas ----------

  private codeActive(code: string): boolean {
    return this.down.has(code) || this.padDown.has(code) || this.virtualDown.has(code);
  }

  isDown(a: Action): boolean {
    for (const c of this.bindings[a]) if (this.codeActive(c)) return true;
    return false;
  }

  /** ¿Se pulsó desde el último paso fijo (y nadie la consumió)? */
  pressed(a: Action): boolean {
    for (const c of this.bindings[a]) if (this.pressedLatch.has(c) && !this.consumed.has(c)) return true;
    return false;
  }

  released(a: Action): boolean {
    for (const c of this.bindings[a]) if (this.releasedLatch.has(c)) return true;
    return false;
  }

  /** Marca la pulsación como usada: otra acción con el mismo botón (p. ej. A = saltar/interactuar) no la verá. */
  consume(a: Action): void {
    for (const c of this.bindings[a]) if (this.pressedLatch.has(c)) this.consumed.add(c);
  }

  /** Eje de movimiento combinado (x = derecha, y = adelante), longitud ≤ 1. */
  moveAxis(out: Vec2): Vec2 {
    let x = (this.isDown('moveRight') ? 1 : 0) - (this.isDown('moveLeft') ? 1 : 0);
    let y = (this.isDown('moveForward') ? 1 : 0) - (this.isDown('moveBack') ? 1 : 0);
    x += this.padMove.x + this.virtualMove.x;
    y += this.padMove.y + this.virtualMove.y;
    const l = Math.hypot(x, y);
    if (l > 1) {
      x /= l;
      y /= l;
    }
    out.x = x;
    out.y = y;
    return out;
  }

  /** Delta de ratón acumulado desde la última llamada (px). */
  consumeMouse(out: Vec2): Vec2 {
    out.x = this.mouseDX;
    out.y = this.mouseDY;
    this.mouseDX = 0;
    this.mouseDY = 0;
    return out;
  }

  /** Stick derecho actual (−1..1, con zona muerta y curva). */
  padLookAxis(out: Vec2): Vec2 {
    out.x = this.padLook.x;
    out.y = this.padLook.y;
    return out;
  }

  get pointerLocked(): boolean {
    return document.pointerLockElement === this.target;
  }

  /** Fin de paso fijo: se limpian los latches. */
  endStep(): void {
    this.pressedLatch.clear();
    this.releasedLatch.clear();
    this.consumed.clear();
  }

  /** Suelta TODO (R6). */
  reset(): void {
    this.down.clear();
    this.padDown.clear();
    this.virtualDown.clear();
    this.pressedLatch.clear();
    this.releasedLatch.clear();
    this.consumed.clear();
    this.mouseDX = 0;
    this.mouseDY = 0;
    this.padMove.x = this.padMove.y = 0;
    this.padLook.x = this.padLook.y = 0;
    this.virtualMove.x = this.virtualMove.y = 0;
  }

  /** Nº de entradas mantenidas (QA: debe ser 0 tras blur). */
  get heldCount(): number {
    return this.down.size + this.padDown.size + this.virtualDown.size + (this.virtualMove.x !== 0 || this.virtualMove.y !== 0 ? 1 : 0);
  }

  // ---------- Entrada virtual (QA y tests) ----------

  virtualHold(a: Action, on: boolean): void {
    const code = this.bindings[a][0];
    if (!code) return;
    if (on) {
      if (!this.virtualDown.has(code)) this.pressedLatch.add(code);
      this.virtualDown.add(code);
    } else if (this.virtualDown.delete(code)) {
      this.releasedLatch.add(code);
    }
  }

  virtualPress(a: Action): void {
    const code = this.bindings[a][0];
    if (code) this.pressedLatch.add(code);
  }

  setVirtualMove(x: number, y: number): void {
    this.virtualMove.x = x;
    this.virtualMove.y = y;
  }

  // ---------- Gamepad ----------

  /** Se llama una vez por frame (la Gamepad API es por sondeo). */
  pollGamepad(): void {
    const pads = typeof navigator.getGamepads === 'function' ? navigator.getGamepads() : [];
    let pad: Gamepad | null = null;
    if (this.padIndex >= 0) pad = pads[this.padIndex] ?? null;
    if (!pad) {
      for (const p of pads) {
        if (p && p.connected) {
          pad = p;
          this.padIndex = p.index;
          break;
        }
      }
    }
    if (!pad || !pad.connected) {
      if (this.padDown.size > 0) {
        for (const c of this.padDown) this.releasedLatch.add(c);
        this.padDown.clear();
      }
      this.padMove.x = this.padMove.y = 0;
      this.padLook.x = this.padLook.y = 0;
      return;
    }
    let any = false;
    for (let i = 0; i < pad.buttons.length && i < 17; i++) {
      const b = pad.buttons[i];
      if (!b) continue;
      const isTrigger = i === 6 || i === 7;
      const on = isTrigger ? b.value > PAD_TRIGGER : b.pressed;
      const code = PAD_CODES[i] ?? `Pad${i}`;
      if (on) {
        any = true;
        if (!this.padDown.has(code)) {
          this.padDown.add(code);
          this.pressedLatch.add(code);
        }
      } else if (this.padDown.delete(code)) {
        this.releasedLatch.add(code);
      }
    }
    radial(pad.axes[0] ?? 0, -(pad.axes[1] ?? 0), this.padMove, 1);
    radial(pad.axes[2] ?? 0, pad.axes[3] ?? 0, this.padLook, 1.6);
    if (any || Math.abs(this.padMove.x) + Math.abs(this.padMove.y) + Math.abs(this.padLook.x) + Math.abs(this.padLook.y) > 0) {
      this.lastDevice = 'pad';
    }
  }

  // ---------- Eventos DOM ----------

  private readonly onKeyDown = (e: KeyboardEvent): void => {
    if (this.captureNext) {
      e.preventDefault();
      const fn = this.captureNext;
      this.captureNext = null;
      fn(e.code);
      return;
    }
    if (this.capturing && (BLOCKED_DEFAULTS.has(e.code) || this.codeToActions.has(e.code))) e.preventDefault();
    this.lastDevice = 'kbm';
    if (e.repeat) return;
    if (!this.down.has(e.code)) this.pressedLatch.add(e.code);
    this.down.add(e.code);
  };

  private readonly onKeyUp = (e: KeyboardEvent): void => {
    // Alt suelto: evitar que el navegador enfoque su menú.
    if (this.capturing && (BLOCKED_DEFAULTS.has(e.code) || this.codeToActions.has(e.code))) e.preventDefault();
    if (this.down.delete(e.code)) this.releasedLatch.add(e.code);
  };

  private readonly onMouseDown = (e: MouseEvent): void => {
    if (this.captureNext && e.button !== 0) {
      e.preventDefault();
      const fn = this.captureNext;
      this.captureNext = null;
      fn(`Mouse${e.button}`);
      return;
    }
    const code = `Mouse${e.button}`;
    this.lastDevice = 'kbm';
    // Clics en la UI (botones de menú) no cuentan como disparo.
    if (!this.gameTarget(e)) return;
    if (!this.down.has(code)) this.pressedLatch.add(code);
    this.down.add(code);
  };

  private readonly onMouseUp = (e: MouseEvent): void => {
    const code = `Mouse${e.button}`;
    if (this.down.delete(code)) this.releasedLatch.add(code);
  };

  private gameTarget(e: MouseEvent): boolean {
    return this.pointerLocked || e.target === this.target;
  }

  private readonly onMouseMove = (e: MouseEvent): void => {
    if (!this.pointerLocked && !this.freeLook) return;
    // Descarta saltos espurios enormes (algunos navegadores al entrar en pointer lock).
    if (Math.abs(e.movementX) > 600 || Math.abs(e.movementY) > 600) return;
    this.mouseDX += e.movementX;
    this.mouseDY += e.movementY;
    this.lastDevice = 'kbm';
  };

  private readonly onWheel = (e: WheelEvent): void => {
    if (this.capturing) e.preventDefault();
    const code = e.deltaY < 0 ? 'WheelUp' : 'WheelDown';
    this.pressedLatch.add(code);
  };

  private readonly onContextMenu = (e: Event): void => {
    e.preventDefault();
  };

  private readonly onBlur = (): void => {
    this.reset();
    this.emit('blur');
  };

  private readonly onVisibility = (): void => {
    if (document.visibilityState === 'hidden') {
      this.reset();
      this.emit('hidden');
    }
  };

  private readonly onPointerLockChange = (): void => {
    if (this.pointerLocked) {
      this.mouseDX = 0;
      this.mouseDY = 0;
      this.emit('pointerlock-gained');
    } else {
      this.reset();
      this.emit('pointerlock-lost');
    }
  };

  private readonly onPadConnected = (e: GamepadEvent): void => {
    this.padIndex = e.gamepad.index;
    this.emit('pad-connected');
  };

  private readonly onPadDisconnected = (e: GamepadEvent): void => {
    if (e.gamepad.index === this.padIndex) {
      this.padIndex = -1;
      this.reset();
    }
    this.emit('pad-disconnected');
  };
}

const PAD_CODES: string[] = Array.from({ length: 17 }, (_, i) => `Pad${i}`);

/** Zona muerta radial con reescalado y curva de respuesta. */
function radial(x: number, y: number, out: Vec2, curve: number): void {
  const m = Math.hypot(x, y);
  if (m < PAD_DEADZONE) {
    out.x = 0;
    out.y = 0;
    return;
  }
  const n = Math.min(1, (m - PAD_DEADZONE) / (1 - PAD_DEADZONE));
  const scaled = Math.pow(n, curve);
  out.x = (x / m) * scaled;
  out.y = (y / m) * scaled;
}
