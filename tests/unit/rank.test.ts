import { describe, expect, it } from 'vitest';
import { accuracyScore, computeRank, damageScore, type MissionStats, RANK_THRESHOLDS, rankFor, timeScore, varietyScore } from '../../src/combat/rank';
import { Rng } from '../../src/core/rng';

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

  it('cada marcador gastado resta 15; el estilo suma hasta 10 (sin pasar de 100)', () => {
    // Base media (precisión 50 %) para que el tope de 100 no enmascare las diferencias.
    const mid: MissionStats = { ...base, shotsHit: 20 };
    const a = computeRank({ ...mid, styleBest: 1 });
    const b = computeRank({ ...mid, styleBest: 8 });
    expect(b.styleBonus).toBe(10);
    expect(a.styleBonus).toBe(0);
    expect(b.total - a.total).toBeCloseTo(10, 0);
    const m = computeRank({ ...mid, markersUsed: 1 });
    expect(m.markerPenalty).toBe(15);
    expect(computeRank(mid).total - m.total).toBeCloseTo(15, 0);
    // La nota nunca supera 100 aunque sobre bonus.
    expect(computeRank({ ...base, styleBest: 8 }).total).toBe(100);
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

  it('coherencia: mejorar cualquier estadística nunca baja la nota ni el rango (500 partidas al azar)', () => {
    const rng = new Rng(4242);
    const order = ['D', 'C', 'B', 'A', 'S'];
    const better: Array<(m: MissionStats) => MissionStats> = [
      (m) => ({ ...m, timeSec: m.timeSec * 0.8 }),
      (m) => ({ ...m, shotsHit: Math.min(m.shotsFired, m.shotsHit + 3) }),
      (m) => ({ ...m, damageTaken: m.damageTaken * 0.5 }),
      (m) => ({ ...m, varietyCount: m.varietyCount + 1 }),
      (m) => ({ ...m, markersUsed: Math.max(0, m.markersUsed - 1) }),
      (m) => ({ ...m, civiliansHurt: Math.max(0, m.civiliansHurt - 1) }),
      (m) => ({ ...m, civiliansKilled: 0 }),
      (m) => ({ ...m, styleBest: Math.min(8, m.styleBest + 1) }),
    ];
    for (let i = 0; i < 500; i++) {
      const shotsFired = rng.int(0, 120);
      const hasCivilians = rng.next() < 0.5;
      const m: MissionStats = {
        timeSec: rng.range(30, 900),
        parTime: rng.range(120, 360),
        shotsFired,
        shotsHit: rng.int(0, shotsFired),
        takedowns: rng.int(0, 6),
        knifeKills: rng.int(0, 4),
        damageTaken: rng.range(0, 600),
        healthPool: 160,
        varietyCount: rng.int(0, 9),
        hasCivilians,
        civiliansHurt: hasCivilians ? rng.int(0, 4) : 0,
        civiliansKilled: hasCivilians ? rng.int(0, 2) : 0,
        markersUsed: rng.int(0, 3),
        styleBest: rng.int(1, 8),
      };
      const r0 = computeRank(m);
      expect(r0.total).toBeGreaterThanOrEqual(0);
      expect(r0.total).toBeLessThanOrEqual(100);
      // El rango es exactamente el que marcan los umbrales para la nota (salvo el tope C por civiles).
      const byTotal = rankFor(r0.total);
      expect(r0.rank).toBe(r0.capped && order.indexOf(byTotal) > order.indexOf('C') ? 'C' : byTotal);
      for (const f of better) {
        const r1 = computeRank(f(m));
        expect(r1.total).toBeGreaterThanOrEqual(r0.total - 1e-9);
        expect(order.indexOf(r1.rank)).toBeGreaterThanOrEqual(order.indexOf(r0.rank));
      }
    }
    expect(RANK_THRESHOLDS.length).toBe(4);
  });
});
