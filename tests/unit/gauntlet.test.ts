import { describe, expect, it } from 'vitest';
import { hub } from '../../src/levels/data/hub';
import {
  GAUNTLET_FIRST_WAVE,
  GAUNTLET_HEAVY_FROM,
  GAUNTLET_MARKSMEN_FROM,
  GAUNTLET_MAX_HEAVY,
  GAUNTLET_MAX_MARKSMEN,
  GAUNTLET_MAX_PER_WAVE,
  gauntletSpawnPoints,
  gauntletWave,
  waveQueue,
} from '../../src/missions/gauntlet';

describe('Gauntlet', () => {
  it('la primera oleada son 3 matones', () => {
    expect(gauntletWave(1)).toEqual({ thug: GAUNTLET_FIRST_WAVE, escort: 0, heavy: 0, marksman: 0, total: GAUNTLET_FIRST_WAVE });
  });

  it('las oleadas crecen sin bajar nunca y respetan el tope', () => {
    let prev = 0;
    for (let n = 1; n <= 60; n++) {
      const w = gauntletWave(n);
      expect(w.thug + w.escort + w.heavy + w.marksman).toBe(w.total);
      expect(w.total).toBeGreaterThanOrEqual(prev);
      expect(w.total).toBeLessThanOrEqual(GAUNTLET_MAX_PER_WAVE);
      expect(w.heavy).toBeLessThanOrEqual(GAUNTLET_MAX_HEAVY);
      expect(w.marksman).toBeLessThanOrEqual(GAUNTLET_MAX_MARKSMEN);
      expect(Math.min(w.thug, w.escort, w.heavy, w.marksman)).toBeGreaterThanOrEqual(0);
      prev = w.total;
    }
    expect(gauntletWave(60).total).toBe(GAUNTLET_MAX_PER_WAVE);
  });

  it('la mezcla se endurece: escoltas desde la 2, pesados desde la 3, tiradores desde la 5', () => {
    expect(gauntletWave(2).escort).toBeGreaterThan(0);
    expect(gauntletWave(GAUNTLET_HEAVY_FROM - 1).heavy).toBe(0);
    expect(gauntletWave(GAUNTLET_HEAVY_FROM).heavy).toBe(1);
    expect(gauntletWave(GAUNTLET_MARKSMEN_FROM - 1).marksman).toBe(0);
    expect(gauntletWave(GAUNTLET_MARKSMEN_FROM).marksman).toBe(1);
    // A partir de cierto punto los escoltas superan a los matones.
    const late = gauntletWave(12);
    expect(late.escort).toBeGreaterThan(late.thug);
  });

  it('la cola de aparición pone a los pesados al final', () => {
    const q = waveQueue(gauntletWave(6));
    expect(q).toHaveLength(gauntletWave(6).total);
    expect(q[0]).toBe('thug');
    expect(q[q.length - 1]).toBe('heavy');
  });

  it('usa los puntos de entrada de las oleadas del hub, sin repetir', () => {
    const pts = gauntletSpawnPoints(hub);
    expect(pts.length).toBeGreaterThanOrEqual(4);
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++) expect(Math.hypot(pts[i]![0] - pts[j]![0], pts[i]![2] - pts[j]![2])).toBeGreaterThanOrEqual(0.5);
  });
});
