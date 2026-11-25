import { type BufferGeometry, Color } from 'three';
import { smooth } from '../rigMath';
import { shade } from './geometry';
import { bell01, MeshData, type Pt } from './loft';
import { ellipsoid, tubePath } from './shapes';
import { fromFront, frontK, gauss, hairline, skull, Y0 } from './skull';
import { hairOf, skinOf } from './surfaces';
import type { Features, RigOptions } from './types';

/**
 * El rostro: una malla de la cabeza entera, más densa por delante, con las cuencas, los pómulos, la nariz, la boca y la
 * mandíbula modelados, y encima los ojos, los párpados, las cejas y los labios. Los rasgos de cada uno (`Features`) cambian
 * la forma, así que dos personajes no comparten cara.
 */
const PI = Math.PI;
const _c = new Color();
const _d = new Color();

/** Altura de los ojos y de la boca sobre el hueso de la cabeza (m), y separación de los ojos al centro. */
const EYE_Y = 0.083;
const EYE_X = 0.0315;
const MOUTH_Y = 0.0085;

/** Columnas alrededor y cuánto se juntan por delante (1 = repartidas por igual). */
const COLS = 40;
const FRONT = 0.34;
/** Alturas de las filas: cada 4 o 5 mm en la cara, más separadas por arriba. */
const ROWS = [
  -0.042, -0.038, -0.032, -0.026, -0.019, -0.012, -0.006, -0.001, 0.004, 0.0085, 0.0135, 0.019, 0.025, 0.031, 0.0355, 0.0395, 0.044, 0.05, 0.057, 0.064, 0.071,
  0.078, 0.085, 0.092, 0.099, 0.106, 0.115, 0.127, 0.142, 0.158, 0.174, 0.188, 0.2, 0.2085, 0.2125, 0.2135,
];

function featuresOf(o: RigOptions): Features {
  return { jaw: 1, chin: 1, nose: 1, nostrils: 1, brow: 1, lips: 1, eyes: 1, cheeks: 1, soft: false, ...o.features };
}

/** Cuánto se hunde (+) o sobresale (−) la cara en un punto: a los lados (`u`) y en altura (`v`). */
function relief(u: number, v: number, k: Features): number {
  const au = Math.abs(u);
  let z = 0;
  // Cuencas, arco de las cejas y entrecejo.
  z += 0.0125 * gauss(au - EYE_X, 0.0175) * gauss(v - EYE_Y, 0.0125);
  z -= 0.0058 * k.brow * gauss(v - 0.104, 0.0085) * Math.exp(-((u / 0.055) ** 4));
  z -= 0.0018 * k.brow * gauss(u, 0.011) * gauss(v - 0.1, 0.01);
  // Nariz: el caballete baja del entrecejo a la punta, se ensancha y se corta debajo; a los lados, las aletas.
  const t = (0.094 - v) / 0.056;
  const ridge = t < 0 ? 0.0035 * gauss(t, 0.3) : t <= 1 ? 0.0035 + 0.0185 * Math.pow(t, 1.3) : 0.022 * gauss(t - 1, 0.1);
  const wide = (0.0064 + 0.0042 * Math.min(1, Math.max(0, t))) * (0.5 + 0.5 * k.nostrils);
  z -= ridge * k.nose * Math.exp(-((u / wide) ** 2));
  z -= 0.0095 * gauss(au - 0.0125 * k.nostrils, 0.0056) * gauss(v - 0.0415, 0.0058);
  // Pómulos, mejilla y surco hasta la comisura.
  z -= 0.0055 * k.cheeks * gauss(au - 0.048, 0.017) * gauss(v - 0.061, 0.014);
  z += 0.0045 * k.cheeks * gauss(au - 0.047, 0.016) * gauss(v - 0.02, 0.017);
  z += 0.0024 * gauss(au - (0.0205 + (0.04 - v) * 0.36), 0.005) * gauss(v - 0.026, 0.014);
  // Boca: el volumen de los dientes, los labios, la línea entre ellos, las comisuras y el hueco de debajo.
  z -= 0.004 * gauss(u, 0.03) * gauss(v - MOUTH_Y, 0.02);
  z -= 0.0032 * k.lips * gauss(u, 0.02) * gauss(v - 0.0145, 0.0052);
  z -= 0.0036 * k.lips * gauss(u, 0.017) * gauss(v - 0.002, 0.0058);
  z += 0.0028 * gauss(u, 0.024) * gauss(v - MOUTH_Y, 0.0032);
  z += 0.003 * gauss(au - 0.027, 0.006) * gauss(v - MOUTH_Y, 0.008);
  z += 0.0046 * gauss(u, 0.022) * gauss(v + 0.011, 0.006);
  // Mentón.
  z -= 0.0072 * k.chin * gauss(u, 0.019) * gauss(v + 0.027, 0.012);
  return z;
}

/** Ancho de la cara a esa altura: la mandíbula de cada uno y las sienes. */
function width(v: number, k: Features): number {
  return 1 + (k.jaw - 1) * smooth(0.05, -0.01, v);
}

/** Frente de la cara en un punto (z, en el espacio del personaje). */
function surface(u: number, v: number, k: Features): number {
  return skull.z(u / width(v, k), Y0 + v) + relief(u, v, k);
}

const angle = (j: number): number => {
  const t = j / COLS - 0.5;
  return PI + PI * 2 * (FRONT * t + (1 - FRONT) * 4 * t * t * t);
};

/** La cabeza con su cara. */
export function headMesh(o: RigOptions): BufferGeometry {
  const c = o.colors;
  const k = featuresOf(o);
  const skin = skinOf(c.skin);
  const m = new MeshData();
  const at = (j: number, v: number): Pt => {
    const a = angle(j);
    const p = skull.around(a, Y0 + v);
    const f = frontK(a);
    p.x *= width(v, k) * (1 - 0.035 * bell01((v - 0.126) / 0.03) * (1 - f));
    if (f > 0.02) p.z += relief(p.x, v, k) * Math.min(1, f * 2.2);
    return p;
  };
  const pts = ROWS.map((v) => Array.from({ length: COLS + 1 }, (_, j) => at(j, v)));
  const n: Pt = { x: 0, y: 0, z: 0 };
  const last = ROWS.length - 1;
  for (let i = 0; i <= last; i++) {
    const v = ROWS[i]!;
    for (let j = 0; j <= COLS; j++) {
      const p = pts[i]![j]!;
      const u0 = pts[i]![j === 0 ? COLS - 1 : j - 1]!;
      const u1 = pts[i]![j === COLS ? 1 : j + 1]!;
      const v0 = pts[Math.max(0, i - 1)]![j]!;
      const v1 = pts[Math.min(last, i + 1)]![j]!;
      const ux = u1.x - u0.x;
      const uy = u1.y - u0.y;
      const uz = u1.z - u0.z;
      const vx = v1.x - v0.x;
      const vy = v1.y - v0.y;
      const vz = v1.z - v0.z;
      n.x = uy * vz - uz * vy;
      n.y = uz * vx - ux * vz;
      n.z = ux * vy - uy * vx;
      const l = Math.hypot(n.x, n.y, n.z) || 1;
      const s = n.x * p.x + n.z * (p.z - 0.005) + n.y * (v - 0.08) < 0 ? -1 / l : 1 / l;
      n.x *= s;
      n.y *= s;
      n.z *= s;
      if (i === last) {
        n.x = n.z = 0;
        n.y = 1;
      }
      paint(_c.set(c.skin), p.x, v, angle(j), o, k);
      m.vertex(p, n, _c, skin, j / COLS, i / last);
    }
  }
  const W = COLS + 1;
  for (let i = 0; i < last; i++) {
    for (let j = 0; j < COLS; j++) {
      const a = i * W + j;
      m.idx.push(a, a + 1, a + W + 1, a, a + W + 1, a + W);
    }
  }
  return m.build();
}

/** Color de la piel en cada punto: mejillas, nariz, ojeras, barba y sombras de contacto. */
function paint(col: Color, u: number, v: number, a: number, o: RigOptions, k: Features): void {
  const c = o.colors;
  const f = fromFront(a);
  const au = Math.abs(u);
  if (f < 1.1) {
    const flush = 0.13 * gauss(au - 0.046, 0.02) * gauss(v - 0.045, 0.02) + 0.14 * gauss(u, 0.014) * gauss(v - 0.045, 0.012);
    col.lerp(_d.set(0xb0584a), flush);
    col.lerp(_d.set(shade(c.skin, 0.55)), 0.42 * gauss(au - EYE_X, 0.02) * gauss(v - 0.0855, 0.011) + 0.16 * gauss(au - 0.03, 0.016) * gauss(v - 0.068, 0.007));
    // Orificios de la nariz, sombra bajo ella y bajo el labio.
    col.lerp(_d.set(shade(c.skin, 0.3)), 0.75 * gauss(au - 0.0075, 0.0042) * gauss(v - 0.0345, 0.0034));
    col.lerp(_d.set(shade(c.skin, 0.6)), 0.3 * gauss(u, 0.016) * gauss(v - 0.0305, 0.004) + 0.28 * gauss(u, 0.02) * gauss(v + 0.0105, 0.005));
  }
  if (o.beard && v < 0.08 && f < 1.85) {
    // Barba corta: de la patilla baja por la mejilla hasta la comisura, cubre la mandíbula y sube al bigote.
    const line = 0.004 + 0.066 * Math.min(1, Math.max(0, (f - 0.42) / 1.05)) ** 1.35;
    const jaw = smooth(0.018, -0.01, v - line);
    const mouth = gauss(u, 0.021) * gauss(v - MOUTH_Y, 0.0095);
    const must = gauss(u, 0.026) * gauss(v - 0.0235, 0.0052);
    col.lerp(_d.set(c.hair), Math.min(0.88, Math.max(jaw * (1 - mouth), must * 0.85)));
  } else if (!k.soft && v < 0.034 && f < 1.6) {
    // Sombra de barba.
    col.lerp(_d.set(c.hair), 0.14 * smooth(0.034, 0.008, v) * (1 - 0.7 * gauss(u, 0.02) * gauss(v - MOUTH_Y, 0.009)));
  }
  // Debajo de la mandíbula, sombra de contacto; rapado, la sombra del pelo por encima de su nacimiento.
  if (v < -0.03) col.multiplyScalar(0.8);
  if (o.hair === 'bald') col.lerp(_d.set(c.hair), 0.22 * smooth(0, 0.02, v - hairline(0.146, 0.085, 0.004)(a)));
}

/** Ojos y párpados (también se ven con pasamontañas). */
export function eyes(o: RigOptions): BufferGeometry[] {
  const c = o.colors;
  const k = featuresOf(o);
  const out: BufferGeometry[] = [];
  const y = Y0 + EYE_Y;
  const e = k.eyes;
  const lid = skinOf(shade(c.skin, 0.88));
  for (const s of [-1, 1] as const) {
    const x = s * EYE_X;
    const z = surface(EYE_X, EYE_Y, k) + 0.0072;
    out.push(
      ellipsoid(0.0118, 0.0112, 0.0118, { c: 0xc6c1b6, r: 0.24, m: 0, w: 0 }, x, y, z, { segs: 12, rows: 8 }),
      ellipsoid(0.0062, 0.0062, 0.0016, { c: k.iris ?? 0x3c2b1d, r: 0.14, m: 0, w: 0 }, x - s * 0.0004, y - 0.0003, z - 0.0108, { segs: 10, rows: 3 }),
      ellipsoid(0.0028, 0.0028, 0.0012, { c: 0x050505, r: 0.1, m: 0, w: 0 }, x - s * 0.0004, y - 0.0003, z - 0.0119, { segs: 8, rows: 3 }),
      // Un brillo en cada ojo: sin él parecen de muñeco.
      ellipsoid(0.0009, 0.0009, 0.0005, { c: 0xffffff, r: 0.1, m: 0, w: 0 }, x - s * 0.0004 + 0.0018, y + 0.0018, z - 0.0126, { segs: 5, rows: 3 }),
    );
    // Párpados: pegados al globo, más caído el de arriba hacia fuera; y la línea de las pestañas.
    const arc = (h: number, r: number, depth: number, surf: typeof lid): BufferGeometry =>
      tubePath(
        [
          { x: x - s * 0.0142, y: y - 0.0012, z: z - 0.0035, a: r * 0.55 },
          { x: x - s * 0.0075, y: y + h * 0.82, z: z - depth * 0.86, a: r * 0.9 },
          { x, y: y + h, z: z - depth, a: r },
          { x: x + s * 0.008, y: y + h * 0.78, z: z - depth * 0.82, a: r * 0.9 },
          { x: x + s * 0.0148, y: y - 0.0008, z: z - 0.0025, a: r * 0.5 },
        ],
        surf,
        { segs: 6, steps: 2, up: { x: 0, y: 0, z: 1 } },
      );
    out.push(arc(0.0062 * e + 0.0024, 0.0034, 0.0116, lid));
    out.push(arc(-0.0062 * e - 0.0018, 0.0024, 0.0108, skinOf(shade(c.skin, 0.84))));
    out.push(arc(0.006 * e, k.soft ? 0.0014 : 0.001, 0.0132, hairOf(0x140f0c)));
  }
  return out;
}

/** Ojos, cejas, labios y, si lo lleva, el bigote. */
export function face(o: RigOptions): BufferGeometry[] {
  const c = o.colors;
  const k = featuresOf(o);
  const out: BufferGeometry[] = eyes(o);
  const stern = (o.face ?? 'stern') === 'stern';
  const on = (u: number, v: number, off = 0): Pt => ({ x: u, y: Y0 + v, z: surface(u, v, k) - off });
  // Cejas: del entrecejo a la sien; ceñudas, bajan hacia el centro.
  const thick = k.soft ? 0.62 : 1;
  for (const s of [-1, 1] as const) {
    const inner = stern ? 0.0975 : 0.1;
    const knot = (u: number, v: number, w: number): Pt & { a: number; b: number } => ({ ...on(s * u, v, 0.0004), a: 0.0014, b: w * thick });
    out.push(
      tubePath(
        [knot(0.0125, inner, 0.0034), knot(0.027, 0.1045, 0.0038), knot(0.043, 0.1048, 0.0029), knot(0.0555, 0.0985, 0.0014)],
        hairOf(shade(c.hair, 0.85)),
        {
          segs: 6,
          steps: 2,
          up: { x: 0, y: 1, z: 0 },
        },
      ),
    );
  }
  // Labios: el de arriba con su arco, el de abajo más lleno, y la línea oscura entre los dos.
  const tone = _c
    .set(shade(c.skin, 0.8))
    .lerp(_d.set(0x9a4038), k.soft ? 0.5 : 0.28)
    .getHex();
  const fat = k.lips;
  const up = { x: 0, y: 1, z: 0 };
  out.push(
    tubePath(
      [
        { ...on(-0.0245, 0.0085, -0.001), a: 0.0012, b: 0.0012 },
        { ...on(-0.0135, 0.0122, -0.0004), a: 0.0016, b: 0.0026 * fat },
        { ...on(-0.0045, 0.0142, 0), a: 0.0019, b: 0.0034 * fat },
        { ...on(0, 0.0135, 0), a: 0.0017, b: 0.0029 * fat },
        { ...on(0.0045, 0.0142, 0), a: 0.0019, b: 0.0034 * fat },
        { ...on(0.0135, 0.0122, -0.0004), a: 0.0016, b: 0.0026 * fat },
        { ...on(0.0245, 0.0085, -0.001), a: 0.0012, b: 0.0012 },
      ],
      { ...skinOf(shade(tone, 0.94)), r: 0.46 },
      { segs: 6, steps: 2, up },
    ),
    tubePath(
      [
        { ...on(-0.0225, 0.008, -0.001), a: 0.0012, b: 0.0012 },
        { ...on(-0.011, 0.0035, -0.0002), a: 0.0022, b: 0.0036 * fat },
        { ...on(0, 0.0022, 0), a: 0.0025, b: 0.0045 * fat },
        { ...on(0.011, 0.0035, -0.0002), a: 0.0022, b: 0.0036 * fat },
        { ...on(0.0225, 0.008, -0.001), a: 0.0012, b: 0.0012 },
      ],
      { ...skinOf(tone), r: 0.42 },
      { segs: 6, steps: 2, up },
    ),
    tubePath(
      [
        { ...on(-0.026, 0.0086, -0.0004), a: 0.0007 },
        { ...on(-0.012, 0.0086, 0.0022), a: 0.0011 },
        { ...on(0, 0.0078, 0.0028), a: 0.0011 },
        { ...on(0.012, 0.0086, 0.0022), a: 0.0011 },
        { ...on(0.026, 0.0086, -0.0004), a: 0.0007 },
      ],
      skinOf(shade(tone, 0.36)),
      { segs: 5, steps: 2, up },
    ),
  );
  if (o.outfit?.mustache) {
    for (const s of [-1, 1] as const) {
      out.push(
        tubePath(
          [
            { ...on(s * 0.003, 0.0255, 0.0015), a: 0.004, b: 0.005 },
            { ...on(s * 0.02, 0.0225, 0.001), a: 0.0038, b: 0.0046 },
            { ...on(s * 0.036, 0.028, 0.0005), a: 0.0026 },
            { ...on(s * 0.044, 0.039, 0.001), a: 0.0014 },
          ],
          hairOf(c.hair),
          { segs: 6, steps: 3, round: true, up },
        ),
      );
    }
  }
  return out;
}

/** Orejas: el borde en forma de C, el lóbulo y el hueco. */
export function ears(o: RigOptions): BufferGeometry[] {
  const c = o.colors;
  const out: BufferGeometry[] = [];
  for (const s of [-1, 1] as const) {
    out.push(
      ellipsoid(0.006, 0.025, 0.0145, skinOf(shade(c.skin, 0.8)), s * 0.0765, Y0 + 0.068, 0.014, { segs: 8, rows: 7 }),
      tubePath(
        [
          { x: s * 0.0755, y: Y0 + 0.079, z: 0.0, a: 0.003 },
          { x: s * 0.0785, y: Y0 + 0.0935, z: 0.008, a: 0.0038 },
          { x: s * 0.0845, y: Y0 + 0.092, z: 0.023, a: 0.0042 },
          { x: s * 0.086, y: Y0 + 0.074, z: 0.031, a: 0.004 },
          { x: s * 0.082, y: Y0 + 0.055, z: 0.023, a: 0.0038 },
          { x: s * 0.0775, y: Y0 + 0.043, z: 0.012, a: 0.0048 },
          { x: s * 0.0745, y: Y0 + 0.0445, z: 0.005, a: 0.003 },
        ],
        skinOf(shade(c.skin, 0.98)),
        { segs: 6, steps: 2, round: true, up: { x: s, y: 0, z: 0 } },
      ),
    );
  }
  return out;
}
