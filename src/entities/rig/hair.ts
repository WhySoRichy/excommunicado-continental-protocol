import { type BufferGeometry, Color } from 'three';
import { shade } from './geometry';
import { bell01, MeshData, type Pt, sides, type Surface } from './loft';
import { drape, fromFront, gauss, hairline, skull, Y0 } from './skull';
import { hairOf } from './surfaces';
import { smooth } from '../rigMath';
import type { RigOptions } from './types';

const PI = Math.PI;
const _c = new Color();

/** Mechones: crestas y valles a lo largo del pelo (−1..1), siempre los mismos en cada ángulo. */
const ridge = (a: number, t: number): number =>
  0.6 * Math.sin(a * 9 + 1.6 * Math.sin(a * 2 + 1) + t * 1.4) + 0.4 * Math.sin(a * 19 + 2 * Math.sin(a * 5) - t * 2.2);

/** Cómo es una melena: nacimiento en la frente, por dónde baja junto a la cara (rad desde el frente), su punta, vuelo y cuánto se mete al final. */
interface Mane {
  front: number;
  from: number;
  to: number;
  hem: (f: number) => number;
  off: number;
  tuck: number;
}

const TOP = 0.2128;
/** Por debajo de aquí el pelo ya no sigue al cráneo: cae. */
const FALL = 0.07;

/**
 * Melena de una sola superficie, del remolino a las puntas: pegada al cráneo arriba, con la raya al medio, y suelta desde lo
 * más ancho de la cabeza. Va en mechones, con la punta irregular, y por debajo se ve su cara de dentro.
 */
function mane(h: Mane, s: Surface): BufferGeometry {
  const cols = Math.max(22, sides(64));
  const rows = Math.max(8, sides(17));
  const m = new MeshData();
  const n: Pt = { x: 0, y: 0, z: 0 };
  const bottom = (a: number): number => {
    const f = fromFront(a);
    const tip = h.hem(f) + 0.015 * ridge(a * 1.2 + 2, 0);
    // Entradas en la frente y pico en el centro.
    const line = h.front - 0.006 * gauss(f, 0.16) + 0.004 * gauss(f - 0.45, 0.2) + 0.003 * ridge(a, 0);
    const k = smooth(h.from, h.to, f);
    return line + (tip - line) * k;
  };
  const at = (a: number, t: number, inner: number): Pt => {
    const f = fromFront(a);
    const y = TOP - (TOP - bottom(a)) * Math.pow(t, 1.35);
    const base = skull.around(a, Y0 + Math.max(FALL, y), 0);
    const l = Math.hypot(base.x, base.z - 0.01) || 1e-4;
    const low = y < FALL ? Math.min(1, (FALL - y) / 0.12) : 0;
    const up = smooth(0, 0.22, t);
    // Vuelo: poco arriba, más a los lados y por detrás; la raya hunde el centro y junto a la cara se afina.
    const part = gauss(Math.sin(a) * l, 0.011) * (f < 1.6 ? 1 : 0.3) * (1 - smooth(0.5, 1, t) * 0.4);
    const face = 1 - 0.55 * gauss(f - h.to, 0.22) * smooth(0.5, 0.9, t);
    const body = h.off * (0.55 + 0.45 * smooth(0.6, 1.8, f)) * face * up;
    const r = l + body + 0.0052 * ridge(a, t) * up * face * (0.6 + 0.4 * t) - 0.0045 * part - h.tuck * low * low + 0.35 * h.tuck * low * low * low - inner;
    const lift = (h.off * 0.75 + 0.002 * ridge(a, t) - 0.004 * part) * (1 - smooth(0.05, 0.5, t));
    return { x: (base.x / l) * r, y: Y0 + y + lift, z: 0.01 + ((base.z - 0.01) / l) * r };
  };
  for (const side of [1, -1] as const) {
    // Por dentro solo se ven las puntas.
    const i0 = side > 0 ? 0 : Math.floor(rows * 0.55);
    const pts: Pt[][] = [];
    for (let i = i0; i <= rows; i++) {
      const row: Pt[] = [];
      for (let j = 0; j < cols; j++) row.push(at((j / cols) * PI * 2, i / rows, side > 0 ? 0 : 0.006));
      pts.push(row);
    }
    const first = m.count;
    const R = pts.length - 1;
    for (let i = 0; i <= R; i++) {
      for (let j = 0; j <= cols; j++) {
        const jj = j % cols;
        const u0 = pts[i]![(jj + cols - 1) % cols]!;
        const u1 = pts[i]![(jj + 1) % cols]!;
        const v0 = pts[Math.min(R, i + 1)]![jj]!;
        const v1 = pts[Math.max(0, i - 1)]![jj]!;
        const ux = u1.x - u0.x;
        const uy = u1.y - u0.y;
        const uz = u1.z - u0.z;
        const vx = v1.x - v0.x;
        const vy = v1.y - v0.y;
        const vz = v1.z - v0.z;
        n.x = (uy * vz - uz * vy) * side;
        n.y = (uz * vx - ux * vz) * side;
        n.z = (ux * vy - uy * vx) * side;
        const l = Math.hypot(n.x, n.y, n.z);
        if (l < 1e-9 || i + i0 === 0) {
          n.x = n.z = 0;
          n.y = side;
        } else {
          n.x /= l;
          n.y /= l;
          n.z /= l;
        }
        const a = (jj / cols) * PI * 2;
        const t = (i + i0) / rows;
        // Las raíces y las puntas, más oscuras; los valles entre mechones, en sombra.
        _c.set(s.c).multiplyScalar((side < 0 ? 0.5 : 1) * (1 + 0.34 * ridge(a, t)) * (1 - 0.18 * smooth(0.7, 1, t)));
        m.vertex(pts[i]![jj]!, n, _c, s, j / cols, t);
      }
    }
    const W = cols + 1;
    for (let i = 0; i < R; i++) {
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

/** El pelo. */
export function hair(o: RigOptions): BufferGeometry[] {
  const c = o.colors;
  const fit = o.outfit ?? {};
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
    case 'parted':
      // Media melena hasta la nuca, por detrás de las sienes.
      out.push(mane({ front: 0.152, from: 0.95, to: 1.3, hem: (f) => 0.022 - 0.07 * smooth(1.2, 2.6, f), off: 0.012, tuck: 0.03 }, s));
      break;
    case 'long':
      out.push(mane({ front: 0.152, from: 0.8, to: 1.15, hem: (f) => -0.055 - 0.055 * smooth(1.1, 2.4, f), off: 0.016, tuck: 0.02 }, s));
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
