import { clamp } from './math';

/** Paso fijo de simulación: 60 Hz. */
export const FIXED_DT = 1 / 60;
/** Un frame real nunca aporta más de 0,25 s (pestaña en segundo plano, breakpoint, pico de lag). */
export const MAX_FRAME_DT = 0.25;
/** Tope de subpasos por frame para evitar la "espiral de la muerte". */
export const MAX_STEPS_PER_FRAME = 5;

/**
 * Acumulador de paso fijo (lógica pura y testeable).
 * `timeScale` (<1 en el Foco) escala el tiempo de juego, no el tamaño del paso:
 * la física siempre avanza en bloques de FIXED_DT.
 */
export class FixedStepAccumulator {
  accumulator = 0;
  timeScale = 1;
  /** Tiempo de juego total simulado (s). */
  simTime = 0;
  /** Tiempo descartado por superar MAX_STEPS_PER_FRAME (diagnóstico). */
  droppedTime = 0;

  /** Devuelve cuántos pasos fijos hay que ejecutar para este frame. */
  advance(realDt: number): number {
    const dt = clamp(Number.isFinite(realDt) ? realDt : 0, 0, MAX_FRAME_DT) * this.timeScale;
    this.accumulator += dt;
    let steps = 0;
    while (this.accumulator >= FIXED_DT && steps < MAX_STEPS_PER_FRAME) {
      this.accumulator -= FIXED_DT;
      steps++;
    }
    if (this.accumulator >= FIXED_DT) {
      // Más trabajo del que cabe en un frame: se descarta el exceso entero de pasos
      // y se conserva la fracción para que la interpolación siga siendo continua.
      const excess = Math.floor(this.accumulator / FIXED_DT) * FIXED_DT;
      this.droppedTime += excess;
      this.accumulator -= excess;
    }
    this.simTime += steps * FIXED_DT;
    return steps;
  }

  /** Factor de interpolación de render en [0, 1). */
  get alpha(): number {
    return this.accumulator / FIXED_DT;
  }

  reset(): void {
    this.accumulator = 0;
  }
}

export interface LoopHandlers {
  /** Se llama una vez por frame real con el dt real (s) en clamp y la marca de tiempo. */
  frame(realDt: number, now: number): void;
}

/** Bucle de requestAnimationFrame. El reparto en pasos fijos lo hace el juego. */
export class AnimationLoop {
  private handle = 0;
  private last = -1;
  private running = false;

  constructor(private readonly handlers: LoopHandlers) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = -1;
    this.handle = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.handle);
  }

  private readonly tick = (now: number): void => {
    if (!this.running) return;
    this.handle = requestAnimationFrame(this.tick);
    const realDt = this.last < 0 ? 0 : Math.min((now - this.last) / 1000, MAX_FRAME_DT);
    this.last = now;
    this.handlers.frame(realDt, now);
  };
}
