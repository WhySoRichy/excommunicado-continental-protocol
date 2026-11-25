import type { BufferGeometry } from 'three';
import { eyes } from './face';
import { shade } from './geometry';
import { bell01, far, loft } from './loft';
import { ellipsoid, type Knot, softBox, tubePath } from './shapes';
import { drape, fromFront, gauss, SKULL, Y0 } from './skull';
import { cloth, leather, plastic, steel } from './surfaces';
import type { Outfit, RigOptions } from './types';

/** Gorras, cascos, capuchas, gafas y pasamontañas. */
export function headwear(o: RigOptions): BufferGeometry[] {
  const c = o.colors;
  const fit: Outfit = o.outfit ?? {};
  const out: BufferGeometry[] = [];
  if (fit.mask === 'balaclava') {
    // Pasamontañas: todo menos la franja de los ojos.
    const fabric = cloth(0x17191d, 1.2);
    out.push(
      drape(
        (a) => (fromFront(a) < 0.95 ? 0.098 : -0.03),
        () => 0.005,
        fabric,
        { segs: 34, rows: 12 },
      ),
    );
    out.push(
      loft(
        SKULL.filter((r) => r.y < Y0 + 0.07).map((r) => ({ ...r, rx: r.rx + 0.004, rz: r.rz + 0.005, rb: (r.rb ?? r.rz) + 0.004 })),
        fabric,
        10,
        { segs: 28, capStart: true },
      ),
    );
    if (!far()) out.push(...eyes(o));
  }
  if (o.hair === 'cap') {
    const k = cloth(c.accent, 0.9, 0.75);
    out.push(
      drape(
        (a) => (fromFront(a) < 1.2 ? 0.132 : 0.1),
        (_a, t) => 0.014 + 0.008 * bell01((t - 0.4) / 0.5),
        k,
        { segs: 30, rows: 9 },
      ),
    );
    // Visera curva.
    out.push(
      tubePath(
        [-1, -0.6, 0, 0.6, 1].map((t): Knot => ({ x: t * 0.062, y: Y0 + 0.136 - 0.012 * t * t, z: -0.105 - 0.028 * (1 - t * t), a: 0.005, b: 0.034 })),
        cloth(shade(c.accent, 0.72), 0.9, 0.75),
        { segs: 8, steps: 3, up: { x: 0, y: 0.22, z: -1 } },
      ),
    );
  }
  if (o.hair === 'helmet') {
    const shell = plastic(fit.helmet ?? c.accent, 0.4);
    out.push(
      drape(
        (a) => (fromFront(a) < 1.05 ? 0.126 : fromFront(a) < 1.9 ? 0.03 : 0.0),
        (a, t) => 0.026 + 0.006 * bell01((t - 0.35) / 0.5) + 0.004 * gauss(fromFront(a) - 1.57, 0.35),
        shell,
        { segs: 32, rows: 11 },
      ),
    );
    // Ribete, raíles laterales y barboquejo.
    for (const s of [-1, 1] as const) {
      out.push(softBox(0.012, 0.028, 0.085, plastic(0x14161a), { x: s * 0.105, y: Y0 + 0.11, z: 0.006 }, 0.004));
      out.push(
        tubePath(
          [
            { x: s * 0.088, y: Y0 + 0.05, z: -0.01, a: 0.004, b: 0.009 },
            { x: s * 0.068, y: Y0 - 0.01, z: -0.034, a: 0.004, b: 0.009 },
            { x: s * 0.03, y: Y0 - 0.046, z: -0.062, a: 0.004, b: 0.009 },
            { x: 0, y: Y0 - 0.05, z: -0.07, a: 0.004, b: 0.009 },
          ],
          leather(0x14161a),
          { segs: 6, steps: 3, up: { x: 0, y: 0, z: 1 } },
        ),
      );
    }
    if (fit.visor) {
      // Pantalla blindada, tintada, delante de la cara.
      out.push(
        loft(
          [
            { y: Y0 + 0.016, rx: 0.088, rz: 0.114, rb: 0.02, e: 2.2 },
            { y: Y0 + 0.07, rx: 0.094, rz: 0.122, rb: 0.02, e: 2.2 },
            { y: Y0 + 0.135, rx: 0.098, rz: 0.12, rb: 0.02, e: 2.2 },
          ],
          { c: 0x0b1018, r: 0.12, m: 0.35, w: 0 },
          4,
          { segs: 28 },
        ),
      );
    }
  }
  if (fit.hood !== undefined) {
    // Capucha echada y pañuelo al cuello.
    const k = cloth(fit.hood, 1.2);
    out.push(
      drape(
        (a) => (fromFront(a) < 1 ? 0.15 - 0.02 * gauss(fromFront(a), 0.5) : fromFront(a) < 1.35 ? 0.15 - 0.2 * ((fromFront(a) - 1) / 0.35) : -0.06),
        (a, t) => 0.024 + 0.02 * bell01((fromFront(a) - 2.6) / 1.1) * (1 - t) + 0.012 * gauss(fromFront(a) - 1.1, 0.3),
        k,
        { segs: 36, rows: 12 },
      ),
    );
    out.push(
      loft(
        [
          { y: Y0 - 0.1, rx: 0.1, rz: 0.1, rb: 0.1 },
          { y: Y0 - 0.05, rx: 0.094, rz: 0.1, rb: 0.092 },
          { y: Y0 + 0.012, rx: 0.084, rz: 0.104, rb: 0.084, z: -0.006 },
          { y: Y0 + 0.03, rx: 0.074, rz: 0.094, rb: 0.078, z: -0.004, k: 0.7 },
        ],
        cloth(shade(fit.hood, 0.8), 1.4),
        9,
        {
          segs: 26,
          mod: (p, a, y) => {
            const q = 1 + 0.03 * Math.sin(y * 120 + Math.sin(a * 3) * 2);
            p.x *= q;
            p.z *= q;
          },
        },
      ),
    );
  }
  if (fit.goggles !== undefined) {
    // Visor de tirador: cinta y dos lentes de su color.
    out.push(
      loft(
        [
          { y: Y0 + 0.06, rx: 0.079, rz: 0.1, rb: 0.099, e: 2.2, z: 0.002 },
          { y: Y0 + 0.094, rx: 0.08, rz: 0.102, rb: 0.102, e: 2.2, z: 0.002 },
        ],
        plastic(0x16181c, 0.6),
        2,
        { segs: 26 },
      ),
    );
    for (const s of [-1, 1] as const) {
      const b = tubePath(
        [
          { x: s * 0.031, y: Y0 + 0.077, z: -0.088, a: 0.021 },
          { x: s * 0.031, y: Y0 + 0.077, z: -0.118, a: 0.02 },
        ],
        plastic(0x1b1d22, 0.45),
        { segs: 14, up: { x: 0, y: 1, z: 0 } },
      );
      out.push(b, ellipsoid(0.0165, 0.0165, 0.006, { c: fit.goggles, r: 0.1, m: 0.2, w: 0 }, s * 0.031, Y0 + 0.077, -0.119, { segs: 12, rows: 6 }));
    }
  }
  if (fit.earpiece) {
    out.push(ellipsoid(0.007, 0.01, 0.008, plastic(0x0f1012), 0.084, Y0 + 0.066, -0.004, { segs: 8, rows: 6 }));
    out.push(
      tubePath(
        [
          { x: 0.085, y: Y0 + 0.056, z: 0.004, a: 0.0022 },
          { x: 0.074, y: Y0 + 0.01, z: 0.026, a: 0.0022 },
          { x: 0.066, y: Y0 - 0.04, z: 0.034, a: 0.0022 },
        ],
        plastic(0xd8d4c8, 0.5),
        { segs: 5, steps: 4 },
      ),
    );
  }
  if (fit.glasses) {
    for (const s of [-1, 1] as const) {
      out.push(softBox(0.046, 0.024, 0.004, { c: 0x0a0c10, r: 0.1, m: 0.2, w: 0 }, { x: s * 0.0315, y: Y0 + 0.077, z: -0.1 }, 0.004, { y: s * 0.24 }));
      out.push(softBox(0.004, 0.005, 0.095, steel(0x2a2a2c, 0.4), { x: s * 0.07, y: Y0 + 0.081, z: -0.045 }, 0.001, { y: s * 0.1 }));
    }
    out.push(softBox(0.02, 0.004, 0.004, steel(0x2a2a2c, 0.4), { x: 0, y: Y0 + 0.081, z: -0.105 }, 0.001));
  }
  return out;
}
