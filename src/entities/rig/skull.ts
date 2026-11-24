import { type BufferGeometry, Color } from 'three';
import { MeshData, type Pt, type Ring, sides, type Surface } from './loft';
import { Shell } from './shapes';
import { HEAD_H } from './skeleton';

/** La forma de la cabeza y lo que va pegado a ella: la comparten la cara, el pelo y lo que lleve puesto. */
export const Y0 = HEAD_H;
const PI = Math.PI;
const _c = new Color();

/** Cráneo y cara: alturas relativas al hueso de la cabeza (barbilla en −0,042, coronilla en 0,213). */
export const SKULL: readonly Ring[] = [
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

export const skull = new Shell(SKULL);
export const gauss = (u: number, s: number): number => Math.exp(-((u / s) ** 2));

/** Cúpula pegada a la cabeza: de un borde inferior que depende del ángulo hasta la coronilla (pelo, gorro, casco). */
export function drape(
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

/** Cuánto mira un ángulo hacia delante (1 delante, 0 a los lados y detrás). */
export const frontK = (a: number): number => Math.max(0, -Math.cos(a));
/** Distancia angular al frente (0 delante, π detrás). */
export const fromFront = (a: number): number => Math.abs(((a - PI + PI * 3) % (PI * 2)) - PI);

/** Borde del pelo: nacimiento en la frente, sienes, por encima de la oreja y la nuca. */
export const hairline =
  (front: number, temple: number, nape: number) =>
  (a: number): number => {
    const f = fromFront(a);
    if (f < 0.75) return front + 0.006 * (f / 0.75);
    if (f < 1.45) return front + 0.006 + (temple - front - 0.006) * ((f - 0.75) / 0.7);
    if (f < 1.95) return temple + 0.018 * Math.sin(((f - 1.45) / 0.5) * PI);
    return temple + (nape - temple) * Math.min(1, (f - 1.95) / 0.7);
  };
