import { describe, expect, it } from 'vitest';
import { FIXED_DT, FixedStepAccumulator, MAX_FRAME_DT, MAX_STEPS_PER_FRAME } from '../../src/core/Loop';

describe('FixedStepAccumulator', () => {
  it('ejecuta un paso por frame a 60 Hz', () => {
    const a = new FixedStepAccumulator();
    let steps = 0;
    for (let i = 0; i < 600; i++) steps += a.advance(FIXED_DT);
    expect(steps).toBe(600);
    expect(a.simTime).toBeCloseTo(10, 6);
  });

  it('a 144 Hz reparte los pasos y la interpolación queda en [0,1)', () => {
    const a = new FixedStepAccumulator();
    let steps = 0;
    for (let i = 0; i < 1440; i++) {
      steps += a.advance(1 / 144);
      expect(a.alpha).toBeGreaterThanOrEqual(0);
      expect(a.alpha).toBeLessThan(1);
    }
    // 10 s reales → 600 pasos (±1 por redondeo del acumulador).
    expect(Math.abs(steps - 600)).toBeLessThanOrEqual(1);
  });

  it('un pico de lag nunca ejecuta más de MAX_STEPS_PER_FRAME pasos (sin espiral de la muerte)', () => {
    const a = new FixedStepAccumulator();
    const steps = a.advance(3.0);
    expect(steps).toBe(MAX_STEPS_PER_FRAME);
    expect(a.accumulator).toBeLessThan(FIXED_DT);
    expect(a.droppedTime).toBeGreaterThan(0);
    // El dt se recorta a MAX_FRAME_DT antes de acumular.
    expect(MAX_FRAME_DT * 60).toBeGreaterThan(MAX_STEPS_PER_FRAME);
  });

  it('ignora dt no finitos o negativos', () => {
    const a = new FixedStepAccumulator();
    expect(a.advance(Number.NaN)).toBe(0);
    expect(a.advance(-1)).toBe(0);
    expect(a.advance(Number.POSITIVE_INFINITY)).toBe(0);
    expect(a.accumulator).toBe(0);
  });

  it('timeScale (Foco) ralentiza el tiempo de juego sin cambiar el tamaño del paso', () => {
    const a = new FixedStepAccumulator();
    a.timeScale = 0.35;
    let steps = 0;
    for (let i = 0; i < 600; i++) steps += a.advance(FIXED_DT);
    // 600 frames × 1/60 s × 0,35 = 3,5 s de juego = 210 pasos (±1 por redondeo flotante).
    expect(Math.abs(steps - 210)).toBeLessThanOrEqual(1);
    expect(Math.abs(a.simTime - 3.5)).toBeLessThanOrEqual(FIXED_DT + 1e-9);
    // Lo que no se simuló sigue en el acumulador (no se pierde tiempo).
    expect(a.simTime + a.accumulator).toBeCloseTo(3.5, 6);
  });
});
