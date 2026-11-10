/**
 * Resolución dinámica (lógica pura): baja la escala de render cuando los frames no llegan
 * al objetivo y la sube cuando lo cumplen de forma sostenida.
 *
 * Con vsync a 60 Hz el intervalo de frame nunca baja de ~16,7 ms, así que "ir sobrado" no
 * se puede medir: se sube cuando se CUMPLE el objetivo durante un rato. Si tras subir vuelve
 * a ir lento, la siguiente subida espera el doble (sin oscilar cada pocos segundos).
 */
export const DYN_MIN = 0.6;
export const DYN_MAX = 1;
export const DYN_STEP = 0.1;
/** Objetivo: 58 FPS (margen sobre 60 Hz). */
export const DYN_TARGET_MS = 1000 / 58;
/** Por encima de objetivo × este factor el frame cuenta como lento. */
export const DYN_SLOW_FACTOR = 1.08;
/** Segundos lentos seguidos antes de bajar un escalón. */
export const DYN_DOWN_AFTER = 2;
/** Segundos cumpliendo el objetivo antes de subir (base y tope tras oscilar). */
export const DYN_UP_WAIT = 4;
export const DYN_UP_WAIT_MAX = 32;

export class DynamicResolution {
  scale = DYN_MAX;
  /** Espera actual antes de subir (crece si una subida no se sostiene). */
  upWait = DYN_UP_WAIT;
  private slowT = 0;
  private okT = 0;
  private lastChange: 'up' | 'down' | null = null;

  reset(): void {
    this.scale = DYN_MAX;
    this.upWait = DYN_UP_WAIT;
    this.slowT = 0;
    this.okT = 0;
    this.lastChange = null;
  }

  /** Devuelve true si la escala cambió (hay que redimensionar). */
  update(avgFrameMs: number, dt: number): boolean {
    if (avgFrameMs > DYN_TARGET_MS * DYN_SLOW_FACTOR) {
      this.okT = 0;
      this.slowT += dt;
      if (this.slowT < DYN_DOWN_AFTER || this.scale <= DYN_MIN) return false;
      this.slowT = 0;
      if (this.lastChange === 'up') this.upWait = Math.min(DYN_UP_WAIT_MAX, this.upWait * 2);
      this.lastChange = 'down';
      this.scale = Math.max(DYN_MIN, round1(this.scale - DYN_STEP));
      return true;
    }
    this.slowT = 0;
    if (avgFrameMs > DYN_TARGET_MS || this.scale >= DYN_MAX) {
      this.okT = 0;
      if (this.scale >= DYN_MAX) this.upWait = DYN_UP_WAIT;
      return false;
    }
    this.okT += dt;
    if (this.okT < this.upWait) return false;
    this.okT = 0;
    this.lastChange = 'up';
    this.scale = Math.min(DYN_MAX, round1(this.scale + DYN_STEP));
    return true;
  }
}

/** Evita la deriva de coma flotante (0.7000000001) en los escalones. */
function round1(v: number): number {
  return Math.round(v * 10) / 10;
}
