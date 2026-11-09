import { describe, expect, it } from 'vitest';
import { applyDamage, falloff, makeVitals, restoreVitals, tickVitals, zoneFromHeight } from '../../src/combat/damage';

describe('daño', () => {
  it('la armadura absorbe primero y luego la salud', () => {
    const v = makeVitals({ maxHealth: 100, maxArmor: 60 });
    const r = applyDamage(v, 80);
    expect(r.toArmor).toBe(60);
    expect(r.toHealth).toBe(20);
    expect(v.armor).toBe(0);
    expect(v.health).toBe(80);
    expect(r.killed).toBe(false);
  });

  it('headshot multiplica y mata de un tiro a enemigos normales (pistola 34 × 3)', () => {
    for (const hp of [70, 80, 90]) {
      const v = makeVitals({ maxHealth: hp });
      const r = applyDamage(v, 34, { zone: 'head', headMult: 3 });
      expect(r.killed, `salud ${hp}`).toBe(true);
    }
  });

  it('cuerpo: 3 tiros de pistola matan a un matón (80)', () => {
    const v = makeVitals({ maxHealth: 80 });
    applyDamage(v, 34);
    applyDamage(v, 34);
    expect(v.dead).toBe(false);
    applyDamage(v, 34);
    expect(v.dead).toBe(true);
  });

  it('blindado: el cuerpo recibe solo el 20 % mientras dura la armadura pesada; el headshot la ignora', () => {
    const v = makeVitals({ maxHealth: 120, maxHeavyArmor: 150 });
    const body = applyDamage(v, 30);
    expect(body.toHealth).toBeCloseTo(6, 5);
    expect(body.toHeavyArmor).toBeCloseTo(24, 5);
    const head = applyDamage(v, 30, { zone: 'head', headMult: 3 });
    expect(head.toHeavyArmor).toBe(0);
    expect(head.toHealth).toBeCloseTo(90, 5);
  });

  it('takedown (pierce) ignora cualquier armadura', () => {
    const v = makeVitals({ maxHealth: 120, maxHeavyArmor: 150, maxArmor: 50 });
    const r = applyDamage(v, 999, { pierce: true });
    expect(r.killed).toBe(true);
    expect(r.toArmor).toBe(0);
  });

  it('no se aplica daño a un muerto ni daño no positivo / NaN', () => {
    const v = makeVitals({ maxHealth: 10 });
    applyDamage(v, 50);
    expect(applyDamage(v, 50).dealt).toBe(0);
    const w = makeVitals({ maxHealth: 10 });
    expect(applyDamage(w, Number.NaN).dealt).toBe(0);
    expect(applyDamage(w, -5).dealt).toBe(0);
    expect(w.health).toBe(10);
  });

  it('la armadura se regenera tras el retardo; la salud no', () => {
    const v = makeVitals({ maxHealth: 100, maxArmor: 60, regenDelay: 4, regenRate: 20 });
    applyDamage(v, 90);
    expect(v.armor).toBe(0);
    tickVitals(v, 3.9);
    expect(v.armor).toBe(0);
    // Este tick cruza el retardo (4,0 s) y ya regenera 0,1 s × 20 = 2.
    tickVitals(v, 0.1);
    expect(v.armor).toBeCloseTo(2, 5);
    tickVitals(v, 1);
    expect(v.armor).toBeCloseTo(22, 5);
    tickVitals(v, 10);
    expect(v.armor).toBe(60);
    expect(v.health).toBe(70);
    restoreVitals(v);
    expect(v.health).toBe(100);
  });

  it('falloff y zonas por altura', () => {
    expect(falloff(5, 20, 45)).toBe(1);
    expect(falloff(45, 20, 45)).toBeCloseTo(0.6);
    expect(falloff(32.5, 20, 45)).toBeCloseTo(0.8);
    expect(zoneFromHeight(1.7, 0, 1.8)).toBe('head');
    expect(zoneFromHeight(1.1, 0, 1.8)).toBe('body');
    expect(zoneFromHeight(0.4, 0, 1.8)).toBe('limb');
    // Agachado (1,14 m): la cabeza está más baja.
    expect(zoneFromHeight(1.0, 0, 1.14)).toBe('head');
  });
});
