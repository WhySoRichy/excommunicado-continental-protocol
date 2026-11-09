/**
 * Generador pseudoaleatorio con semilla (mulberry32). Toda la aleatoriedad de
 * gameplay (spread, decisiones de IA, oleadas) pasa por aquí para que los tests
 * y las repeticiones sean reproducibles.
 */
export class Rng {
  private s: number;

  constructor(seed = 0x9e3779b9) {
    this.s = seed >>> 0;
  }

  setSeed(seed: number): void {
    this.s = seed >>> 0;
  }

  /** Flotante uniforme en [0, 1). */
  next(): number {
    let t = (this.s = (this.s + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  range(min: number, max: number): number {
    return min + (max - min) * this.next();
  }

  int(minInclusive: number, maxInclusive: number): number {
    return Math.floor(this.range(minInclusive, maxInclusive + 1));
  }

  chance(p: number): boolean {
    return this.next() < p;
  }

  pick<T>(items: readonly T[]): T {
    if (items.length === 0) throw new Error('Rng.pick: lista vacía');
    return items[Math.floor(this.next() * items.length)] as T;
  }

  /** Signo aleatorio (+1 / -1). */
  sign(): number {
    return this.next() < 0.5 ? -1 : 1;
  }
}

/** RNG global de gameplay. Los niveles lo resiembran al cargar. */
export const gameRng = new Rng(1337);
