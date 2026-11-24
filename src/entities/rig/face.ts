import type { BufferGeometry } from 'three';
import { hairOf, skinOf } from './surfaces';
import { ellipsoid, tubePath } from './shapes';
import { shade } from './geometry';
import { skull, Y0 } from './skull';
import type { RigOptions } from './types';

/** Ojos, cejas y nariz. */
export function face(o: RigOptions): BufferGeometry[] {
  const c = o.colors;
  const out: BufferGeometry[] = [];
  const stern = (o.face ?? 'stern') === 'stern';
  for (const s of [-1, 1] as const) {
    const x = s * 0.031;
    const z = skull.z(0.031, Y0 + 0.076) + 0.0125;
    // Globo, iris y pupila.
    out.push(
      ellipsoid(0.0118, 0.0112, 0.0118, { c: 0xcfcbc2, r: 0.22, m: 0, w: 0 }, x, Y0 + 0.076, z, { segs: 10, rows: 6 }),
      ellipsoid(0.0058, 0.0058, 0.0016, { c: 0x3c2b1d, r: 0.16, m: 0, w: 0 }, x - s * 0.0006, Y0 + 0.0755, z - 0.0108, { segs: 8, rows: 3 }),
      ellipsoid(0.0026, 0.0026, 0.0012, { c: 0x050505, r: 0.1, m: 0, w: 0 }, x - s * 0.0006, Y0 + 0.0755, z - 0.0118, { segs: 6, rows: 3 }),
    );
    // Párpado de arriba, algo caído, y el de abajo.
    out.push(
      tubePath(
        [
          { x: x - 0.0145, y: Y0 + 0.0765, z: z - 0.004, a: 0.0026 },
          { x: x - 0.007, y: Y0 + 0.0828, z: z - 0.0108, a: 0.0044 },
          { x, y: Y0 + 0.0842, z: z - 0.0122, a: 0.005 },
          { x: x + 0.007, y: Y0 + 0.0828, z: z - 0.0108, a: 0.0044 },
          { x: x + 0.0145, y: Y0 + 0.0765, z: z - 0.004, a: 0.0026 },
        ],
        skinOf(shade(c.skin, 0.9)),
        { segs: 6, steps: 2, up: { x: 0, y: 0, z: 1 } },
      ),
      tubePath(
        [
          { x: x - 0.0135, y: Y0 + 0.0745, z: z - 0.005, a: 0.0024 },
          { x, y: Y0 + 0.067, z: z - 0.0118, a: 0.0032 },
          { x: x + 0.0135, y: Y0 + 0.0745, z: z - 0.005, a: 0.0024 },
        ],
        skinOf(shade(c.skin, 0.86)),
        { segs: 6, steps: 3, up: { x: 0, y: 0, z: 1 } },
      ),
    );
    // Ceja: del entrecejo a la sien; ceñuda, baja hacia el centro.
    const inner = stern ? 0.0955 : 0.0985;
    const zb = (u: number, v: number): number => skull.z(u, Y0 + v) - 0.0055;
    out.push(
      tubePath(
        [
          { x: s * 0.013, y: Y0 + inner, z: zb(0.013, inner) + 0.001, a: 0.0024, b: 0.0036 },
          { x: s * 0.028, y: Y0 + 0.103, z: zb(0.028, 0.103) + 0.001, a: 0.0026, b: 0.004 },
          { x: s * 0.044, y: Y0 + 0.1025, z: zb(0.044, 0.1025) + 0.002, a: 0.0022, b: 0.0032 },
          { x: s * 0.055, y: Y0 + 0.095, z: zb(0.055, 0.095) + 0.0035, a: 0.0018, b: 0.002 },
        ],
        hairOf(shade(c.hair, 0.9)),
        { segs: 6, steps: 2, up: { x: 0, y: 1, z: 0 } },
      ),
    );
  }
  // Nariz: puente, punta y aletas.
  const zn = skull.z(0, Y0 + 0.07);
  out.push(
    tubePath(
      [
        { x: 0, y: Y0 + 0.094, z: zn + 0.0045, a: 0.0066, b: 0.0075 },
        { x: 0, y: Y0 + 0.076, z: zn - 0.0018, a: 0.0076, b: 0.0098 },
        { x: 0, y: Y0 + 0.058, z: zn - 0.0068, a: 0.0092, b: 0.0112 },
        { x: 0, y: Y0 + 0.0455, z: zn - 0.0098, a: 0.0116, b: 0.0108 },
        { x: 0, y: Y0 + 0.0375, z: zn - 0.0068, a: 0.0106, b: 0.0076 },
        { x: 0, y: Y0 + 0.0335, z: zn + 0.005, a: 0.0072, b: 0.005 },
      ],
      skinOf(shade(c.skin, 0.97)),
      { segs: 9, steps: 2, up: { x: 0, y: 0, z: 1 } },
    ),
  );
  for (const s of [-1, 1] as const)
    out.push(ellipsoid(0.0068, 0.0056, 0.0082, skinOf(shade(c.skin, 0.95)), s * 0.0114, Y0 + 0.0395, zn + 0.0005, { segs: 8, rows: 6 }));
  if (o.outfit?.mustache) {
    for (const s of [-1, 1] as const) {
      out.push(
        tubePath(
          [
            { x: s * 0.003, y: Y0 + 0.0255, z: zn - 0.004, a: 0.005, b: 0.0055 },
            { x: s * 0.02, y: Y0 + 0.0235, z: zn + 0.001, a: 0.0045, b: 0.005 },
            { x: s * 0.036, y: Y0 + 0.029, z: zn + 0.011, a: 0.003 },
            { x: s * 0.043, y: Y0 + 0.04, z: zn + 0.018, a: 0.0015 },
          ],
          hairOf(c.hair),
          { segs: 6, steps: 3, round: true, up: { x: 0, y: 1, z: 0 } },
        ),
      );
    }
  }
  return out;
}
