import { describe, expect, it } from 'vitest';
import { aabb, rampSlopeDeg, ramp, roomShell, stairs, wallX, wallZ } from '../../src/levels/helpers';
import { pointInBox } from '../../src/levels/validate';

describe('helpers de nivel', () => {
  it('aabb rechaza cajas invertidas', () => {
    expect(() => aabb(1, 0, 0, 0, 1, 1, 'concrete')).toThrow();
  });

  it('roomShell deja el interior libre y abre el hueco de la puerta', () => {
    const boxes = roomShell({
      minX: -5,
      minZ: -5,
      maxX: 5,
      maxZ: 5,
      height: 3,
      wallMat: 'plaster',
      floorMat: 'concrete',
      doors: [{ side: 'south', at: 0, width: 2, height: 2.2 }],
    });
    // Ninguna pared invade el interior.
    const walls = boxes.filter((b) => b.mat === 'plaster');
    for (const p of [
      [0, 1, 0],
      [4.9, 1, 4.9],
      [-4.9, 1, -4.9],
    ] as const) {
      expect(walls.some((w) => pointInBox(p, w))).toBe(false);
    }
    // El hueco de la puerta (z = 5.2, x = 0, y = 1) está libre; a 1,5 m del centro hay pared.
    expect(walls.some((w) => pointInBox([0, 1, 5.2], w))).toBe(false);
    expect(walls.some((w) => pointInBox([1.5, 1, 5.2], w))).toBe(true);
    // El dintel tapa por encima de 2,2 m.
    expect(walls.some((w) => pointInBox([0, 2.6, 5.2], w))).toBe(true);
  });

  it('roomShell detecta puertas fuera de la pared', () => {
    expect(() =>
      roomShell({ minX: 0, minZ: 0, maxX: 4, maxZ: 4, height: 3, wallMat: 'plaster', doors: [{ side: 'east', at: 10, width: 2, height: 2 }] }),
    ).toThrow();
  });

  it('los muros dejan libres sus puertas y ventanas a cualquier altura', () => {
    const inAny = (boxes: ReturnType<typeof wallX>, p: readonly [number, number, number]): boolean => boxes.some((b) => pointInBox(p, b));
    const x = wallX(10, -8, 8, 0, 6, 'brick', [
      { at: 4, w: 2, from: 3.2, to: 5.6 },
      { at: -4, w: 2, to: 2.4 },
    ]);
    expect(inAny(x, [-4, 1, 10]), 'puerta a ras de suelo').toBe(false);
    expect(inAny(x, [-4, 3, 10]), 'su dintel').toBe(true);
    expect(inAny(x, [4, 4, 10]), 'puerta de la planta alta').toBe(false);
    expect(inAny(x, [4, 1, 10]), 'el muro de debajo').toBe(true);
    expect(inAny(x, [4, 5.8, 10]), 'el dintel de arriba').toBe(true);
    expect(inAny(x, [0, 1, 10])).toBe(true);
    const z = wallZ(2, 0, 10, 0, 4, 'brick', [{ at: 5, w: 1.6, to: 2.4 }]);
    expect(inAny(z, [2, 1, 5])).toBe(false);
    expect(inAny(z, [2, 1, 8])).toBe(true);
    expect(() => wallX(0, 0, 4, 0, 3, 'brick', [{ at: 3.5, w: 2, to: 2 }]), 'un hueco que se sale').toThrow();
    expect(
      () =>
        wallX(0, 0, 8, 0, 3, 'brick', [
          { at: 2, w: 2, to: 2 },
          { at: 3, w: 2, to: 2 },
        ]),
      'dos huecos que se pisan',
    ).toThrow();
  });

  it('stairs genera peldaños macizos con la contrahuella pedida', () => {
    const s = stairs({ start: [0, 0, 0], dir: 'z-', steps: 5, rise: 0.3, run: 0.4, width: 2, mat: 'concrete' });
    expect(s).toHaveLength(5);
    const tops = s.map((b) => b.c[1] + b.s[1] / 2);
    tops.forEach((t, i) => expect(t).toBeCloseTo(0.3 * (i + 1), 6));
    // Macizos: todos empiezan en la base.
    s.forEach((b) => expect(b.c[1] - b.s[1] / 2).toBeCloseTo(0, 6));
  });

  it('rampSlopeDeg calcula la pendiente', () => {
    expect(rampSlopeDeg(ramp([0, 0, 0], [0, 1, -1], 2, 'metal'))).toBeCloseTo(45, 5);
    expect(rampSlopeDeg(ramp([0, 0, 0], [0, 1.6, -5.97], 2, 'metal'))).toBeCloseTo(15, 0);
  });
});
