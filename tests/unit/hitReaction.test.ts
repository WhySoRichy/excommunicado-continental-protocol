import { describe, expect, it } from 'vitest';
import { deathStyle, hitPart, reactTo, type Reaction } from '../../src/combat/hitReaction';
import { ENEMY_TYPES } from '../../src/entities/ai/enemyTypes';

const out = (): Reaction => ({ stagger: 9, disarm: 9, limp: 9 });

describe('reacciones a los impactos', () => {
  it('la parte sale de la altura y de lo que se desvía del eje del cuerpo', () => {
    expect(hitPart('head', 0.15, 0.9)).toBe('head');
    expect(hitPart('limb', -0.1, 0.2)).toBe('legL');
    expect(hitPart('limb', 0.1, 0.2)).toBe('legR');
    expect(hitPart('body', 0.05, 0.6)).toBe('torso');
    expect(hitPart('body', 0.27, 0.6)).toBe('armR');
    expect(hitPart('body', -0.27, 0.6)).toBe('armL');
    // Por debajo de donde cuelga la mano es cadera; por encima del hombro, cuello.
    expect(hitPart('body', 0.27, 0.43)).toBe('torso');
  });

  it('cabeza descoloca, brazo baja el arma, pierna cojea (y tropieza si es fuerte)', () => {
    const r = out();
    reactTo('head', 20, 20, 45, r);
    expect(r).toEqual({ stagger: 0.5, disarm: 0, limp: 0 });
    reactTo('armR', 20, 20, 45, r);
    expect(r.disarm).toBeGreaterThan(0.5);
    expect(r.stagger).toBe(0);
    reactTo('legL', 12, 12, 45, r);
    expect(r.limp).toBeGreaterThan(2);
    expect(r.stagger).toBe(0);
    reactTo('legL', 40, 40, 45, r);
    expect(r.stagger).toBeGreaterThan(0.4);
    reactTo('torso', 10, 10, 45, r);
    expect(r).toEqual({ stagger: 0, disarm: 0, limp: 0 });
  });

  it('el daño seguido descoloca al pasar el aguante, y empieza de cero', () => {
    const r = out();
    expect(reactTo('torso', 22, 44, 45, r).reset).toBe(false);
    expect(r.stagger).toBe(0);
    expect(reactTo('torso', 22, 66, 45, r).reset).toBe(true);
    expect(r.stagger).toBeGreaterThan(0.4);
  });

  it('el blindado y el jefe aguantan más que los demás', () => {
    const normal = out();
    const tough = out();
    for (const part of ['head', 'armL', 'legR'] as const) {
      reactTo(part, 30, 30, ENEMY_TYPES.thug.poise, normal);
      reactTo(part, 30, 30, ENEMY_TYPES.heavy.poise, tough);
      expect(tough.stagger + tough.disarm + tough.limp, part).toBeLessThan(normal.stagger + normal.disarm + normal.limp);
    }
    expect(ENEMY_TYPES.boss.poise).toBeGreaterThan(ENEMY_TYPES.heavy.poise);
  });

  it('cada muerte cae como le dieron', () => {
    expect(deathStyle('torso', -1, 0, false, 0.5), 'por la espalda, de bruces').toBe(0);
    expect(deathStyle('torso', 1, 0.1, false, 0.9), 'de frente, de espaldas').toBe(1);
    expect(deathStyle('torso', 0.4, 1, false, 0.5), 'de lado, desplomado').toBe(2);
    expect(deathStyle('head', 1, 0, false, 0.2), 'a la cabeza, en seco').toBe(3);
    expect(deathStyle('head', -1, 0, false, 0.2)).toBe(0);
    expect(deathStyle('torso', 1, 0, true, 0.5), 'un escopetazo lo despide').toBe(4);
    expect(deathStyle('torso', -1, 0, true, 0.5), 'por la espalda no sale hacia atrás').toBe(0);
    expect(deathStyle('legR', 1, 0, false, 0.5), 'a la pierna, de rodillas').toBe(5);
    expect(deathStyle('torso', 1, 0, false, 0.1), 'y a veces también de frente').toBe(5);
  });
});
