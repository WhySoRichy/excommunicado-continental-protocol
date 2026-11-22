/**
 * Mantiene viva la simulación con la pestaña oculta (fase 3 de docs/ESCALABILIDAD.md): un worker marca el paso del
 * tiempo y aquí se convierte en el `dt` real de cada aviso. Solo lo usa el anfitrión de una partida en red.
 */
export class HiddenTicker {
  private worker: Worker | null = null;
  private last = 0;

  constructor(private readonly tick: (realDt: number) => void) {}

  get running(): boolean {
    return this.worker !== null;
  }

  start(): void {
    if (this.worker || typeof Worker === 'undefined') return;
    try {
      this.worker = new Worker(new URL('./ticker.worker.ts', import.meta.url), { type: 'module' });
    } catch {
      return;
    }
    this.last = performance.now();
    this.worker.onmessage = () => {
      const now = performance.now();
      const dt = (now - this.last) / 1000;
      this.last = now;
      this.tick(dt);
    };
  }

  stop(): void {
    this.worker?.terminate();
    this.worker = null;
  }
}
