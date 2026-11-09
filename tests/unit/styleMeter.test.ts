import { describe, expect, it } from 'vitest';
import { MAX_MULTIPLIER, StyleMeter } from '../../src/combat/StyleMeter';

describe('Style Meter', () => {
  it('encadenar acciones VARIADAS sube el multiplicador', () => {
    const s = new StyleMeter();
    s.register('headshot');
    s.register('takedown');
    expect(s.multiplier).toBe(2);
    s.register('dodgeKill');
    s.register('perfectReload');
    s.register('coverKill');
    expect(s.multiplier).toBeGreaterThanOrEqual(3);
  });

  it('spamear la misma acción rinde cada vez menos (×1 → ×0,5 → ×0,25)', () => {
    const s = new StyleMeter();
    expect(s.register('kill').variety).toBe(1);
    expect(s.register('kill').variety).toBe(0.5);
    expect(s.register('kill').variety).toBe(0.25);
    expect(s.register('kill').variety).toBe(0.25);
    // Variar recupera el valor completo.
    expect(s.register('headshot').variety).toBe(1);
  });

  it('variedad > spam: el mismo número de acciones da más puntos si son distintas', () => {
    const spam = new StyleMeter();
    const varied = new StyleMeter();
    for (let i = 0; i < 12; i++) spam.register('headshot');
    const seq = ['headshot', 'takedown', 'perfectReload', 'dodgeKill'] as const;
    for (let i = 0; i < 12; i++) varied.register(seq[i % seq.length]!);
    expect(varied.score).toBeGreaterThan(spam.score * 2);
    expect(varied.multiplier).toBeGreaterThan(spam.multiplier);
  });

  it('el multiplicador nunca pasa de ×8', () => {
    const s = new StyleMeter();
    const seq = ['headshot', 'takedown', 'perfectReload', 'dodgeKill', 'knifeKill', 'coverKill'] as const;
    for (let i = 0; i < 200; i++) s.register(seq[i % seq.length]!);
    expect(s.multiplier).toBe(MAX_MULTIPLIER);
    expect(s.gauge).toBeLessThanOrEqual(1);
    expect(s.rankName).toBe('Leyenda');
  });

  it('decae tras 2,5 s sin acciones y baja de nivel', () => {
    const s = new StyleMeter();
    s.register('takedown');
    s.register('headshot');
    expect(s.multiplier).toBe(2);
    s.update(2.4);
    expect(s.multiplier).toBe(2);
    for (let i = 0; i < 100; i++) s.update(0.1);
    expect(s.multiplier).toBe(1);
  });

  it('recibir daño resta medidor y puede bajar un nivel', () => {
    const s = new StyleMeter();
    s.register('takedown');
    s.register('headshot');
    const g = s.gauge;
    s.onDamage(10);
    expect(s.gauge).toBeLessThan(g);
    s.onDamage(100);
    s.onDamage(100);
    expect(s.multiplier).toBe(1);
  });

  it('registra variedad y conteos para el rango final', () => {
    const s = new StyleMeter();
    s.register('headshot');
    s.register('headshot');
    s.register('takedown');
    expect(s.varietyCount).toBe(2);
    expect(s.counts.headshot).toBe(2);
    s.reset();
    expect(s.score).toBe(0);
    expect(s.varietyCount).toBe(0);
  });
});
