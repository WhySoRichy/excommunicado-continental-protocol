import { describe, expect, it } from 'vitest';
import { accuracyScore, computeRank, damageScore, type MissionStats, rankFor, timeScore, varietyScore } from '../../src/combat/rank';

const base: MissionStats = {
  timeSec: 100,
  parTime: 120,
  shotsFired: 40,
  shotsHit: 36,
  takedowns: 2,
  knifeKills: 1,
  damageTaken: 30,
  healthPool: 160,
  varietyCount: 7,
  hasCivilians: false,
  civiliansHurt: 0,
  civiliansKilled: 0,
  markersUsed: 0,
  styleBest: 6,
};

describe('rango del contrato', () => {
  it('una partida limpia y rápida es S; una lenta, imprecisa y dañada es D', () => {
    const s = computeRank(base);
    expect(s.rank).toBe('S');
    expect(s.total).toBeGreaterThanOrEqual(88);
    const d = computeRank({ ...base, timeSec: 300, shotsFired: 60, shotsHit: 9, damageTaken: 300, varietyCount: 1, styleBest: 1, markersUsed: 2 });
    expect(d.rank).toBe('D');
  });

  it('los umbrales D/C/B/A/S son los del diseño', () => {
    expect(rankFor(88)).toBe('S');
    expect(rankFor(87.9)).toBe('A');
    expect(rankFor(74)).toBe('A');
    expect(rankFor(58)).toBe('B');
    expect(rankFor(40)).toBe('C');
    expect(rankFor(39.9)).toBe('D');
  });

  it('subnotas: tiempo, precisión, daño y variedad', () => {
    expect(timeScore(90, 120)).toBe(100);
    expect(timeScore(180, 120)).toBe(50);
    expect(timeScore(400, 120)).toBe(0);
    expect(accuracyScore(10, 5, 0, 0)).toBe(50);
    expect(accuracyScore(0, 0, 3, 0)).toBe(100); // solo takedowns = precisión perfecta
    expect(accuracyScore(0, 0, 0, 0)).toBe(50);
    expect(damageScore(0, 160)).toBe(100);
    expect(damageScore(240, 160)).toBe(0);
    expect(varietyScore(3)).toBe(50);
    expect(varietyScore(9)).toBe(100);
  });

  it('cada marcador gastado resta 15; el estilo suma hasta 10', () => {
    const a = computeRank({ ...base, styleBest: 1 });
    const b = computeRank({ ...base, styleBest: 8 });
    expect(b.styleBonus).toBe(10);
    expect(a.styleBonus).toBe(0);
    expect(b.total - a.total).toBeCloseTo(10, 0);
    const m = computeRank({ ...base, markersUsed: 1 });
    expect(m.markerPenalty).toBe(15);
    expect(base.markersUsed).toBe(0);
    expect(computeRank(base).total - m.total).toBeCloseTo(15, 0);
  });

  it('civiles: sin civiles el peso se reparte; herir baja la nota; matar limita a C', () => {
    const none = computeRank(base);
    expect(none.subs.civilians).toBeNull();
    const clean = computeRank({ ...base, hasCivilians: true });
    expect(clean.subs.civilians).toBe(100);
    expect(clean.rank).toBe('S');
    const hurt = computeRank({ ...base, hasCivilians: true, civiliansHurt: 1 });
    expect(hurt.subs.civilians).toBe(60);
    expect(hurt.total).toBeLessThan(clean.total);
    const killed = computeRank({ ...base, hasCivilians: true, civiliansKilled: 1 });
    expect(killed.rank).toBe('C');
    expect(killed.capped).toBe(true);
    // Si ya era D, la limitación no lo sube.
    const bad = computeRank({ ...base, hasCivilians: true, civiliansKilled: 1, timeSec: 400, shotsHit: 0, damageTaken: 400, varietyCount: 0, styleBest: 1, markersUsed: 3 });
    expect(bad.rank).toBe('D');
    expect(bad.capped).toBe(false);
  });
});
