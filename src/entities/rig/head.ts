import { type BufferGeometry, Color } from 'three';
import { cloth, hairOf, leather, plastic, skinOf, steel } from './body';
import { bell01, far, loft, MeshData, type Pt, type Ring, sides, type Surface } from './loft';
import { ellipsoid, type Knot, Shell, softBox, tubePath } from './shapes';
import { NECK_H } from './skin';
import { shade } from './geometry';
import type { Outfit, RigOptions } from './types';

/**
 * Cabeza: cráneo y cara de una pieza con las cuencas, los pómulos y los labios modelados, nariz, orejas y ojos, y
 * encima el pelo o lo que lleve puesto. Todo va al hueso de la cabeza.
 */
const Y0 = NECK_H;
const PI = Math.PI;
const _c = new Color();
const _d = new Color();

/** Cráneo y cara: alturas relativas al hueso de la cabeza (barbilla en −0,042, coronilla en 0,213). */
const SKULL: readonly Ring[] = [
  { y: -0.042, z: -0.05, rz: 0.02, rb: 0.02, rx: 0.02, e: 2.2 },
  { y: -0.036, z: -0.046, rz: 0.035, rb: 0.034, rx: 0.033, e: 2.3 },
  { y: -0.022, z: -0.037, rz: 0.049, rb: 0.048, rx: 0.0455, e: 2.4 },
  { y: -0.004, z: -0.023, rz: 0.064, rb: 0.062, rx: 0.0555, e: 2.4 },
  { y: 0.018, z: -0.011, rz: 0.077, rb: 0.074, rx: 0.063, e: 2.3 },
  { y: 0.042, z: -0.003, rz: 0.0855, rb: 0.084, rx: 0.0695, e: 2.2 },
  { y: 0.066, z: 0.002, rz: 0.089, rb: 0.09, rx: 0.0735, e: 2.2 },
  { y: 0.09, z: 0.004, rz: 0.091, rb: 0.094, rx: 0.0748, e: 2.15 },
  { y: 0.115, z: 0.006, rz: 0.091, rb: 0.097, rx: 0.0748, e: 2.1 },
  { y: 0.14, z: 0.007, rz: 0.088, rb: 0.096, rx: 0.0728, e: 2.1 },
  { y: 0.163, z: 0.008, rz: 0.08, rb: 0.091, rx: 0.068, e: 2.05 },
  { y: 0.184, z: 0.009, rz: 0.066, rb: 0.078, rx: 0.058, e: 2 },
  { y: 0.2, z: 0.01, rz: 0.046, rb: 0.056, rx: 0.042, e: 2 },
  { y: 0.21, z: 0.01, rz: 0.022, rb: 0.028, rx: 0.021, e: 2 },
  { y: 0.2135, z: 0.01, rz: 0.003, rb: 0.004, rx: 0.003, e: 2 },
].map((r) => ({ ...r, y: r.y + Y0 }));

const skull = new Shell(SKULL);
const gauss = (u: number, s: number): number => Math.exp(-((u / s) ** 2));

/** Cúpula pegada a la cabeza: de un borde inferior que depende del ángulo hasta la coronilla (pelo, gorro, casco). */
function drape(
  bottom: (a: number) => number,
  off: (a: number, t: number) => number,
  s: Surface,
  o: { segs?: number; rows?: number; top?: number; tint?: (a: number, t: number, c: Color) => void } = {},
): BufferGeometry {
  const segs = sides((o.segs ?? 30) * 0.8);
  const rows = Math.max(4, sides((o.rows ?? 12) * 0.75));
  const top = Y0 + (o.top ?? 0.2125);
  const m = new MeshData();
  const pts: Pt[][] = [];
  for (let i = 0; i <= rows; i++) {
    const t = i / rows;
    const row: Pt[] = [];
    for (let j = 0; j < segs; j++) {
      const a = (j / segs) * PI * 2;
      // Más filas cerca de la coronilla, donde la curva es mayor.
      const y = Y0 + bottom(a) + (top - Y0 - bottom(a)) * Math.sin((t * PI) / 2);
      const p = skull.around(a, Math.min(y, top), off(a, t));
      // Hacia la coronilla se levanta lo que sobresale y la última fila se cierra en un punto.
      p.y += off(a, t) * Math.max(0, (t - 0.7) / 0.3);
      if (i === rows) {
        p.x = 0;
        p.z = 0.01;
      }
      row.push(p);
    }
    pts.push(row);
  }
  const n: Pt = { x: 0, y: 0, z: 0 };
  for (let i = 0; i <= rows; i++) {
    for (let j = 0; j <= segs; j++) {
      const jj = j % segs;
      const u0 = pts[i]![(jj + segs - 1) % segs]!;
      const u1 = pts[i]![(jj + 1) % segs]!;
      const v0 = pts[Math.max(0, i - 1)]![jj]!;
      const v1 = pts[Math.min(rows, i + 1)]![jj]!;
      const ux = u1.x - u0.x;
      const uy = u1.y - u0.y;
      const uz = u1.z - u0.z;
      const vx = v1.x - v0.x;
      const vy = v1.y - v0.y;
      const vz = v1.z - v0.z;
      n.x = uy * vz - uz * vy;
      n.y = uz * vx - ux * vz;
      n.z = ux * vy - uy * vx;
      if (i === rows) {
        n.x = 0;
        n.y = 1;
        n.z = 0;
      }
      const l = Math.hypot(n.x, n.y, n.z) || 1;
      n.x /= l;
      n.y /= l;
      n.z /= l;
      _c.set(s.c);
      o.tint?.((jj / segs) * PI * 2, i / rows, _c);
      m.vertex(pts[i]![jj]!, n, _c, s, j / segs, i / rows);
    }
  }
  const W = segs + 1;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < segs; j++) {
      const a = i * W + j;
      m.idx.push(a, a + 1, a + W + 1, a, a + W + 1, a + W);
    }
  }
  // Canto interior del borde, para que no se vea hueco desde abajo; mira hacia donde se abre.
  _c.set(s.c).multiplyScalar(0.55);
  for (let j = 0; j < segs; j++) {
    const p0 = pts[0]![j]!;
    const p1 = pts[0]![(j + 1) % segs]!;
    const a = (j / segs) * PI * 2;
    const a1 = ((j + 1) / segs) * PI * 2;
    const q0 = skull.around(a, p0.y, -0.004);
    const q1 = skull.around(a1, p1.y, -0.004);
    const ex = p1.x - p0.x;
    const ey = p1.y - p0.y;
    const ez = p1.z - p0.z;
    const fx = q0.x - p0.x;
    const fy = q0.y - p0.y;
    const fz = q0.z - p0.z;
    const edge: Pt = { x: ey * fz - ez * fy, y: ez * fx - ex * fz, z: ex * fy - ey * fx };
    const up = pts[1]![j]!;
    const sign = edge.x * (up.x - p0.x) + edge.y * (up.y - p0.y) + edge.z * (up.z - p0.z) > 0 ? -1 : 1;
    const l = (Math.hypot(edge.x, edge.y, edge.z) || 1) * sign;
    edge.x /= l;
    edge.y /= l;
    edge.z /= l;
    const i0 = m.vertex(p0, edge, _c, s, 0, 0);
    const i1 = m.vertex(p1, edge, _c, s, 0, 0);
    const i2 = m.vertex(q1, edge, _c, s, 0, 0);
    const i3 = m.vertex(q0, edge, _c, s, 0, 0);
    m.idx.push(i0, i2, i1, i0, i3, i2, i0, i1, i2, i0, i2, i3);
  }
  return m.build();
}

/**
 * Cortina de pelo: de las sienes hacia atrás (`from`, rad desde el frente) y de media cabeza a `hem` (m respecto al hueso),
 * con vetas y la punta irregular. Tiene grosor: se ve por dentro y por fuera.
 */
function curtain(from: number, hem: number, off: number, s: Surface, tint: (a: number, t: number, c: Color) => void): BufferGeometry {
  const cols = Math.max(12, sides(28));
  const rows = Math.max(4, sides(6));
  const m = new MeshData();
  const n: Pt = { x: 0, y: 0, z: 0 };
  for (const side of [1, -1]) {
    const pts: Pt[][] = [];
    for (let i = 0; i <= rows; i++) {
      const t = i / rows;
      const row: Pt[] = [];
      for (let j = 0; j <= cols; j++) {
        // De la sien derecha a la izquierda, pasando por la nuca.
        const f = -1 + (2 * j) / cols;
        const a = f * (PI - from);
        const end = hem + 0.012 * Math.sin(a * 11) + 0.01 * Math.abs(Math.sin(a * 17 + 1)) + 0.012 * (1 - Math.abs(Math.cos(a)));
        const y = 0.13 + (end - 0.13) * t;
        // Cae recta desde lo más ancho de la cabeza y se mete un poco hacia la nuca.
        const base = skull.around(a, Y0 + Math.max(0.075, y), 0);
        const l = Math.hypot(base.x, base.z) || 1;
        const r = l + off * (0.7 + 0.45 * Math.sin(t * 2.2)) + 0.0034 * Math.sin(a * 31 + t * 2) - 0.02 * t * t * t - (side < 0 ? 0.006 * (1 - t) : 0);
        row.push({ x: (base.x / l) * r, y: Y0 + y, z: (base.z / l) * r });
      }
      pts.push(row);
    }
    const first = m.count;
    for (let i = 0; i <= rows; i++) {
      for (let j = 0; j <= cols; j++) {
        const u0 = pts[i]![Math.max(0, j - 1)]!;
        const u1 = pts[i]![Math.min(cols, j + 1)]!;
        const v0 = pts[Math.min(rows, i + 1)]![j]!;
        const v1 = pts[Math.max(0, i - 1)]![j]!;
        const ux = u1.x - u0.x;
        const uy = u1.y - u0.y;
        const uz = u1.z - u0.z;
        const vx = v1.x - v0.x;
        const vy = v1.y - v0.y;
        const vz = v1.z - v0.z;
        n.x = (uy * vz - uz * vy) * side;
        n.y = (uz * vx - ux * vz) * side;
        n.z = (ux * vy - uy * vx) * side;
        const l = Math.hypot(n.x, n.y, n.z) || 1;
        n.x /= l;
        n.y /= l;
        n.z /= l;
        const a = (-1 + (2 * j) / cols) * (PI - from);
        _c.set(s.c).multiplyScalar(side < 0 ? 0.6 : 1);
        tint(a, i / rows, _c);
        m.vertex(pts[i]![j]!, n, _c, s, j / cols, i / rows);
      }
    }
    const W = cols + 1;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const a = first + i * W + j;
        // Las filas bajan: el sentido de las caras es el contrario al de un tubo que sube.
        if (side > 0) m.idx.push(a, a + W + 1, a + 1, a, a + W, a + W + 1);
        else m.idx.push(a, a + 1, a + W + 1, a, a + W + 1, a + W);
      }
    }
  }
  return m.build();
}

/** Cuánto mira un ángulo hacia delante (1 delante, 0 a los lados y detrás). */
const frontK = (a: number): number => Math.max(0, -Math.cos(a));
/** Distancia angular al frente (0 delante, π detrás). */
const fromFront = (a: number): number => Math.abs(((a - PI + PI * 3) % (PI * 2)) - PI);

/** Borde del pelo: nacimiento en la frente, sienes, por encima de la oreja y la nuca. */
const hairline =
  (front: number, temple: number, nape: number) =>
  (a: number): number => {
    const f = fromFront(a);
    if (f < 0.75) return front + 0.006 * (f / 0.75);
    if (f < 1.45) return front + 0.006 + (temple - front - 0.006) * ((f - 0.75) / 0.7);
    if (f < 1.95) return temple + 0.018 * Math.sin(((f - 1.45) / 0.5) * PI);
    return temple + (nape - temple) * Math.min(1, (f - 1.95) / 0.7);
  };

export function headParts(o: RigOptions): BufferGeometry[] {
  const c = o.colors;
  const fit: Outfit = o.outfit ?? {};
  const out: BufferGeometry[] = [];
  const masked = fit.mask !== undefined;
  const beard = !!o.beard;
  const skin = skinOf(c.skin);
  const lip = shade(c.skin, 0.72);
  out.push(
    loft(SKULL, skin, 26, {
      segs: 28,
      mod: (p, a) => {
        const f = frontK(a);
        if (f <= 0.02) return;
        const u = p.x;
        const v = p.y - Y0;
        // Cuencas, arco de las cejas, pómulos, labios, mentón y sienes.
        const au = Math.abs(u);
        p.z += 0.0115 * gauss(au - 0.031, 0.0165) * gauss(v - 0.076, 0.0115) * f;
        p.z -= 0.005 * gauss(v - 0.099, 0.0085) * Math.exp(-((u / 0.052) ** 4)) * f;
        p.z -= 0.004 * gauss(au - 0.046, 0.016) * gauss(v - 0.05, 0.014) * f;
        p.z -= 0.005 * gauss(u, 0.021) * (gauss(v - 0.0155, 0.0058) + 1.1 * gauss(v - 0.0025, 0.0062)) * f;
        p.z += 0.004 * gauss(u, 0.026) * gauss(v - 0.009, 0.0026) * f;
        p.z -= 0.006 * gauss(u, 0.02) * gauss(v + 0.026, 0.012) * f;
        // Raíz de la nariz y surcos hasta las comisuras.
        p.z -= 0.006 * gauss(u, 0.009) * gauss(v - 0.07, 0.022) * f;
        p.z += 0.003 * gauss(au - 0.033, 0.006) * gauss(v - 0.022, 0.016) * f;
        if (v > 0.1 && v < 0.15) p.x *= 1 - 0.035 * bell01((v - 0.125) / 0.03) * (1 - f);
      },
      tint: (p, a, _y, k) => {
        const f = fromFront(a);
        const u = Math.abs(p.x);
        const v = p.y - Y0;
        if (f < 1) {
          // Labios, mejillas y la sombra de las cuencas.
          const l = gauss(p.x, 0.022) * (gauss(v - 0.0145, 0.0055) + gauss(v - 0.003, 0.0055));
          k.lerp(_d.set(lip).lerp(_c.set(0x9a4b42), 0.35), Math.min(0.75, l * 0.8));
          k.lerp(_d.set(0x7a3328), 0.5 * gauss(p.x, 0.02) * gauss(v - 0.0088, 0.0022));
          k.lerp(_d.set(0xb0584a), 0.12 * gauss(u - 0.045, 0.02) * gauss(v - 0.04, 0.02));
          k.lerp(_d.set(shade(c.skin, 0.55)), 0.35 * gauss(u - 0.031, 0.018) * gauss(v - 0.078, 0.011));
        }
        if (beard && v < 0.075 && f < 1.85) {
          // Barba corta: de la patilla baja por la mejilla hasta la comisura, cubre la mandíbula y sube al bigote.
          const line = 0.004 + 0.062 * Math.min(1, Math.max(0, (f - 0.42) / 1.05)) ** 1.4;
          const jaw = Math.min(1, Math.max(0, (line + 0.006 - v) / 0.02));
          const mouth = gauss(p.x, 0.019) * gauss(v - 0.0085, 0.0085);
          const must = gauss(p.x, 0.026) * gauss(v - 0.0235, 0.0048);
          k.lerp(_d.set(c.hair), Math.min(0.9, Math.max(jaw * (1 - mouth), must * 0.85) * 0.9));
        } else if (!masked && v < 0.03 && f < 1.6) {
          // Sombra de barba.
          k.lerp(_d.set(c.hair), 0.12 * Math.min(1, (0.03 - v) / 0.02));
        }
        // Debajo de la mandíbula, sombra de contacto; rapado, la sombra del pelo por encima de su nacimiento.
        if (v < -0.03) k.multiplyScalar(0.82);
        if (o.hair === 'bald') k.lerp(_d.set(c.hair), 0.22 * Math.min(1, Math.max(0, (v - hairline(0.146, 0.085, 0.004)(a)) / 0.02)));
      },
    }),
  );
  if (!masked && !far()) out.push(...face(o));
  // Orejas (la melena las tapa).
  if (o.hair !== 'helmet' && o.hair !== 'parted' && o.hair !== 'long' && fit.hood === undefined) {
    for (const s of [-1, 1] as const) {
      out.push(ellipsoid(0.0095, 0.029, 0.018, skin, s * 0.0765, Y0 + 0.066, 0.014, { segs: 8, rows: 7 }));
      out.push(ellipsoid(0.004, 0.018, 0.0105, skinOf(shade(c.skin, 0.7)), s * 0.0835, Y0 + 0.068, 0.01, { segs: 7, rows: 5 }));
    }
  }
  out.push(...hair(o));
  out.push(...headwear(o));
  return out;
}

/** Ojos, cejas y nariz. */
function face(o: RigOptions): BufferGeometry[] {
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
          { x: s * 0.013, y: Y0 + inner, z: zb(0.013, inner) + 0.001, a: 0.0026, b: 0.0042 },
          { x: s * 0.028, y: Y0 + 0.103, z: zb(0.028, 0.103) + 0.001, a: 0.0028, b: 0.0048 },
          { x: s * 0.044, y: Y0 + 0.1025, z: zb(0.044, 0.1025) + 0.002, a: 0.0024, b: 0.0038 },
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
        { x: 0, y: Y0 + 0.094, z: zn + 0.004, a: 0.007, b: 0.008 },
        { x: 0, y: Y0 + 0.076, z: zn - 0.004, a: 0.0082, b: 0.0105 },
        { x: 0, y: Y0 + 0.058, z: zn - 0.011, a: 0.0098, b: 0.0125 },
        { x: 0, y: Y0 + 0.044, z: zn - 0.0155, a: 0.0122, b: 0.0125 },
        { x: 0, y: Y0 + 0.0345, z: zn - 0.0105, a: 0.0105, b: 0.0085 },
        { x: 0, y: Y0 + 0.03, z: zn + 0.004, a: 0.007, b: 0.006 },
      ],
      skinOf(shade(c.skin, 0.97)),
      { segs: 9, steps: 2, up: { x: 0, y: 0, z: 1 } },
    ),
  );
  for (const s of [-1, 1] as const)
    out.push(ellipsoid(0.0066, 0.0058, 0.0085, skinOf(shade(c.skin, 0.95)), s * 0.0112, Y0 + 0.0375, zn - 0.0015, { segs: 8, rows: 6 }));
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

/** Mechones por un recorrido: se afinan hacia la punta. */
const lock = (pts: ReadonlyArray<readonly [number, number, number]>, w: number, h: number, color: number): BufferGeometry =>
  tubePath(
    pts.map(([x, y, z], i): Knot => {
      const t = i / (pts.length - 1);
      const k = t < 0.25 ? 0.75 + t : 1 - 0.85 * ((t - 0.25) / 0.75) ** 2;
      return { x, y: Y0 + y, z, a: w * k, b: h * k };
    }),
    hairOf(color),
    { segs: 6, steps: 2, up: { x: 0, y: 0.2, z: 1 }, round: true },
  );

function hair(o: RigOptions): BufferGeometry[] {
  const c = o.colors;
  const fit: Outfit = o.outfit ?? {};
  const out: BufferGeometry[] = [];
  const s = hairOf(c.hair);
  const dark = shade(c.hair, 0.7);
  if (fit.hood !== undefined || fit.mask === 'balaclava') return out;
  /** Vetas: aclara y oscurece por mechones. */
  const strands =
    (n: number, k: number) =>
    (a: number, _t: number, col: Color): void =>
      void col.multiplyScalar(1 + k * Math.sin(a * n + Math.sin(a * 5) * 2));
  switch (o.hair) {
    case 'parted': {
      // Media melena con raya al medio: un casco de pelo hasta la nuca y mechones a distinto largo.
      out.push(
        drape(
          hairline(0.146, 0.075, -0.03),
          (a, t) => 0.011 + 0.003 * Math.sin(a * 13 + t * 3) + 0.004 * bell01((fromFront(a) - 2.2) / 1.1) - 0.006 * gauss(fromFront(a), 0.1) * t,
          s,
          {
            segs: 40,
            rows: 14,
            tint: strands(17, 0.14),
          },
        ),
      );
      out.push(curtain(1.0, -0.062, 0.014, s, strands(23, 0.16)));
      for (const k of [-1, 1] as const) {
        out.push(
          lock(
            [
              [k * 0.01, 0.206, -0.05],
              [k * 0.032, 0.19, -0.088],
              [k * 0.056, 0.15, -0.096],
              [k * 0.073, 0.1, -0.079],
              [k * 0.08, 0.05, -0.056],
              [k * 0.077, 0.012, -0.044],
            ],
            0.013,
            0.007,
            c.hair,
          ),
          lock(
            [
              [k * 0.018, 0.208, -0.03],
              [k * 0.05, 0.186, -0.06],
              [k * 0.074, 0.14, -0.064],
              [k * 0.084, 0.08, -0.044],
              [k * 0.084, 0.02, -0.026],
              [k * 0.079, -0.022, -0.016],
            ],
            0.016,
            0.008,
            shade(c.hair, 1.15),
          ),
          lock(
            [
              [k * 0.03, 0.206, -0.008],
              [k * 0.068, 0.172, -0.014],
              [k * 0.086, 0.112, -0.01],
              [k * 0.091, 0.045, 0.002],
              [k * 0.087, -0.02, 0.012],
              [k * 0.08, -0.05, 0.018],
            ],
            0.017,
            0.008,
            shade(c.hair, 0.9),
          ),
        );
      }
      break;
    }
    case 'long':
      out.push(
        drape(hairline(0.15, 0.07, -0.04), (a, t) => 0.012 + 0.0025 * Math.sin(a * 11 + t * 2) + 0.006 * bell01((fromFront(a) - 2.4) / 1), s, {
          segs: 36,
          rows: 12,
          tint: strands(14, 0.12),
        }),
      );
      for (const k of [-1, 1] as const) {
        out.push(
          lock(
            [
              [k * 0.03, 0.2, -0.056],
              [k * 0.062, 0.165, -0.07],
              [k * 0.08, 0.1, -0.05],
              [k * 0.086, 0.02, -0.03],
              [k * 0.083, -0.055, -0.02],
            ],
            0.015,
            0.008,
            c.hair,
          ),
          lock(
            [
              [k * 0.04, 0.2, -0.02],
              [k * 0.076, 0.15, -0.026],
              [k * 0.089, 0.08, -0.008],
              [k * 0.09, -0.01, 0.006],
              [k * 0.084, -0.08, 0.012],
            ],
            0.018,
            0.009,
            shade(c.hair, 1.1),
          ),
        );
      }
      out.push(curtain(1.05, -0.105, 0.016, s, strands(19, 0.13)));
      break;
    case 'slick':
      out.push(
        drape(
          hairline(0.158, 0.09, 0.0),
          (a, t) => 0.006 + 0.0016 * Math.sin(a * 30) + 0.012 * gauss(fromFront(a), 0.6) * bell01((t - 0.45) / 0.5),
          { ...s, r: 0.36 },
          { segs: 44, rows: 12, tint: strands(30, 0.1) },
        ),
      );
      break;
    case 'short':
      out.push(
        drape(
          hairline(0.152, 0.088, 0.004),
          (a, t) => 0.007 + 0.0022 * Math.sin(a * 19 + t * 14) + 0.005 * gauss(fromFront(a), 0.7) * bell01((t - 0.5) / 0.5),
          s,
          { segs: 38, rows: 11, tint: strands(19, 0.16) },
        ),
      );
      break;
    case 'bald':
      // Rapado: la sombra del pelo va pintada en la cabeza.
      break;
    case 'cap':
      // Bajo la gorra asoma la nuca.
      out.push(
        drape(
          (a) => (fromFront(a) > 1.5 ? 0.02 : 0.12),
          () => 0.004,
          { ...s, c: dark },
          { segs: 28, rows: 6, top: 0.16 },
        ),
      );
      break;
    case 'helmet':
      break;
  }
  return out;
}

/** Gorras, cascos, capuchas, gafas y pasamontañas. */
function headwear(o: RigOptions): BufferGeometry[] {
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
    out.push(...face({ ...o, outfit: {} }).slice(0, 8));
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
    const shell = plastic(c.accent, 0.4);
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
