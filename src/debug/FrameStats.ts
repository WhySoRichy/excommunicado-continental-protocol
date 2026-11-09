/**
 * Estadísticas de frame en un buffer circular (sin asignaciones por frame).
 * Alimenta el overlay F3, la resolución dinámica y la API de QA.
 */
export class FrameStats {
  private readonly frames: Float64Array;
  private readonly cpu: Float64Array;
  private idx = 0;
  private count = 0;
  /** Totales de sesión para medidas de QA. */
  totalFrames = 0;
  private windowStart = 0;
  private windowFrames = 0;
  private windowMs = 0;

  constructor(private readonly capacity = 240) {
    this.frames = new Float64Array(capacity);
    this.cpu = new Float64Array(capacity);
  }

  push(frameMs: number, cpuMs: number): void {
    this.frames[this.idx] = frameMs;
    this.cpu[this.idx] = cpuMs;
    this.idx = (this.idx + 1) % this.capacity;
    if (this.count < this.capacity) this.count++;
    this.totalFrames++;
    this.windowFrames++;
    this.windowMs += frameMs;
  }

  /** Frame medio (ms) de los últimos `n` frames. */
  avgFrameMs(n = 60): number {
    const k = Math.min(n, this.count);
    if (k === 0) return 0;
    let s = 0;
    for (let i = 0; i < k; i++) s += this.frames[(this.idx - 1 - i + this.capacity) % this.capacity] ?? 0;
    return s / k;
  }

  avgCpuMs(n = 60): number {
    const k = Math.min(n, this.count);
    if (k === 0) return 0;
    let s = 0;
    for (let i = 0; i < k; i++) s += this.cpu[(this.idx - 1 - i + this.capacity) % this.capacity] ?? 0;
    return s / k;
  }

  fps(n = 60): number {
    const ms = this.avgFrameMs(n);
    return ms > 0 ? 1000 / ms : 0;
  }

  /** Peor frame (ms) de los últimos `n`. */
  worstFrameMs(n = 120): number {
    const k = Math.min(n, this.count);
    let w = 0;
    for (let i = 0; i < k; i++) w = Math.max(w, this.frames[(this.idx - 1 - i + this.capacity) % this.capacity] ?? 0);
    return w;
  }

  /** Inicia una ventana de medida (QA): FPS medio desde este punto. */
  beginWindow(now: number): void {
    this.windowStart = now;
    this.windowFrames = 0;
    this.windowMs = 0;
  }

  windowResult(now: number): { frames: number; seconds: number; fps: number; avgMs: number } {
    const seconds = (now - this.windowStart) / 1000;
    return {
      frames: this.windowFrames,
      seconds,
      fps: seconds > 0 ? this.windowFrames / seconds : 0,
      avgMs: this.windowFrames > 0 ? this.windowMs / this.windowFrames : 0,
    };
  }
}
