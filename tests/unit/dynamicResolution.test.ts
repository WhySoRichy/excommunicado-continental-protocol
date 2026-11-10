import { describe, expect, it } from 'vitest';
import { DYN_DOWN_AFTER, DYN_MAX, DYN_MIN, DYN_UP_WAIT, DynamicResolution } from '../../src/render/dynamicResolution';

const DT = 1 / 60;
const VSYNC_60 = 1000 / 60;
const SLOW = 30;

function run(d: DynamicResolution, frameMs: number, seconds: number): number {
  let changes = 0;
  for (let t = 0; t < seconds; t += DT) if (d.update(frameMs, DT)) changes++;
  return changes;
}

describe('resolución dinámica', () => {
  it('un pico corto (< 2 s) no baja la resolución', () => {
    const d = new DynamicResolution();
    run(d, SLOW, DYN_DOWN_AFTER * 0.8);
    run(d, VSYNC_60, 1);
    expect(d.scale).toBe(DYN_MAX);
  });

  it('frames lentos sostenidos bajan por escalones hasta el mínimo y no más', () => {
    const d = new DynamicResolution();
    run(d, SLOW, 30);
    expect(d.scale).toBe(DYN_MIN);
  });

  it('con vsync a 60 Hz (16,7 ms) vuelve a subir: antes se quedaba reducida para siempre', () => {
    const d = new DynamicResolution();
    run(d, SLOW, DYN_DOWN_AFTER * 2 + 0.1);
    expect(d.scale).toBeLessThan(DYN_MAX);
    run(d, VSYNC_60, 60);
    expect(d.scale).toBe(DYN_MAX);
  });

  it('si una subida no se sostiene, la siguiente espera el doble (no oscila)', () => {
    const d = new DynamicResolution();
    run(d, SLOW, DYN_DOWN_AFTER + 0.1); // 1,0 → 0,9
    expect(d.scale).toBeCloseTo(0.9);
    run(d, VSYNC_60, DYN_UP_WAIT + 0.1); // sube a 1,0
    expect(d.scale).toBe(DYN_MAX);
    run(d, SLOW, DYN_DOWN_AFTER + 0.1); // vuelve a bajar: la subida era demasiado
    expect(d.upWait).toBe(DYN_UP_WAIT * 2);
    run(d, VSYNC_60, DYN_UP_WAIT + 0.1);
    expect(d.scale).toBeCloseTo(0.9); // todavía no sube
    run(d, VSYNC_60, DYN_UP_WAIT);
    expect(d.scale).toBe(DYN_MAX);
  });

  it('en la franja intermedia (ni lento ni cumpliendo) no cambia', () => {
    const d = new DynamicResolution();
    run(d, SLOW, DYN_DOWN_AFTER + 0.1);
    const s = d.scale;
    run(d, 17.8, 30);
    expect(d.scale).toBe(s);
  });
});
