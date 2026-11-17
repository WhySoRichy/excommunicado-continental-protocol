import { describe, expect, it } from 'vitest';
import { type TracerSpan, tracerSpan } from '../../src/render/tracerPath';

const SPEED = 420;
const LEN = 1.6;

describe('trazadoras: tramo visible a lo largo del recorrido', () => {
  it('sale de la boca, avanza y termina cuando la cola llega al impacto', () => {
    const s: TracerSpan = { head: 0, tail: 0, done: false };
    expect(tracerSpan(0, 20, SPEED, LEN, s)).toEqual({ head: 0, tail: 0, done: false });
    tracerSpan(0.02, 20, SPEED, LEN, s);
    expect(s.head).toBeCloseTo(8.4);
    expect(s.tail).toBeCloseTo(6.8);
    expect(s.done).toBe(false);
    // La cabeza se queda en el impacto mientras la cola la alcanza.
    tracerSpan(0.0485, 20, SPEED, LEN, s);
    expect(s.head).toBe(20);
    expect(s.done).toBe(false);
    tracerSpan((20 + LEN) / SPEED + 1e-4, 20, SPEED, LEN, s);
    expect(s.done).toBe(true);
  });

  it('cualquier disparo termina a tiempo y el tramo nunca se sale del recorrido', () => {
    const s: TracerSpan = { head: 0, tail: 0, done: false };
    for (const dist of [0.3, 2, 15, 60, 200]) {
      let age = 0;
      while (!tracerSpan(age, dist, SPEED, LEN, s).done) {
        expect(s.tail).toBeGreaterThanOrEqual(0);
        expect(s.tail).toBeLessThanOrEqual(s.head);
        expect(s.head).toBeLessThanOrEqual(dist);
        age += 1 / 60;
        expect(age, `distancia ${dist}`).toBeLessThan((dist + LEN) / SPEED + 0.05);
      }
    }
  });
});
