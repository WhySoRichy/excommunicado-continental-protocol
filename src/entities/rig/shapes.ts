import { type BufferGeometry, Color } from 'three';
import { far, MeshData, type Pt, type Ring, sides, type Surface } from './loft';

/**
 * Formas sueltas de los personajes: tubos por un recorrido (dedos, mechones, correas), elipsoides (ojos, orejas,
 * hombreras), bloques de esquinas suaves (hebillas, cargadores) y parches pegados a la superficie de un cuerpo
 * (solapas, corbata, bolsillos, placas).
 */
const _c = new Color();

const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const cross = (a: Pt, b: Pt): Pt => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x });
const norm = (a: Pt): Pt => {
  const l = Math.hypot(a.x, a.y, a.z) || 1;
  return { x: a.x / l, y: a.y / l, z: a.z / l };
};

/** Punto de un recorrido: posición, grosor (ancho y alto de la sección) y, opcional, color. */
export interface Knot {
  x: number;
  y: number;
  z: number;
  /** Semiancho de la sección (perpendicular a `up`) y semialto (a lo largo de `up`). */
  a: number;
  b?: number;
  c?: number;
}

export interface TubeOpts {
  segs?: number;
  /** Hacia dónde mira el alto de la sección. */
  up?: Pt;
  /** Puntas redondeadas en cada extremo. */
  round?: boolean;
  /** Puntos intermedios entre nudos (curva suave). */
  steps?: number;
}

function curve(knots: readonly Knot[], steps: number): Knot[] {
  if (steps <= 1 || knots.length < 3) return knots.slice();
  const out: Knot[] = [];
  const n = knots.length;
  const at = (i: number): Knot => knots[Math.max(0, Math.min(n - 1, i))]!;
  for (let i = 0; i < n - 1; i++) {
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const cr = (f: (k: Knot) => number): number => {
        const p0 = f(at(i - 1));
        const p1 = f(at(i));
        const p2 = f(at(i + 1));
        const p3 = f(at(i + 2));
        return 0.5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (3 * p1 - p0 - 3 * p2 + p3) * t * t * t);
      };
      const k: Knot = {
        x: cr((q) => q.x),
        y: cr((q) => q.y),
        z: cr((q) => q.z),
        a: Math.max(
          1e-4,
          cr((q) => q.a),
        ),
        b: Math.max(
          1e-4,
          cr((q) => q.b ?? q.a),
        ),
      };
      const c0 = at(i).c;
      if (c0 !== undefined) k.c = c0;
      out.push(k);
    }
  }
  out.push({ ...at(n - 1) });
  return out;
}

/** Tubo a lo largo de un recorrido. */
export function tubePath(knots: readonly Knot[], s: Surface, o: TubeOpts = {}): BufferGeometry {
  const list = curve(knots, far() ? 1 : (o.steps ?? 1));
  const segs = sides(o.segs ?? 8);
  const m = new MeshData();
  const up0 = norm(o.up ?? { x: 0, y: 0, z: 1 });
  const rows: Array<{ center: Pt; pts: Pt[]; nor: Pt[]; tan: Pt; c: number | undefined }> = [];
  list.forEach((k, i) => {
    const p: Pt = k;
    const tan = norm(sub(list[Math.min(list.length - 1, i + 1)]!, list[Math.max(0, i - 1)]!));
    let side = cross(tan, up0);
    if (Math.hypot(side.x, side.y, side.z) < 1e-3) side = cross(tan, { x: 1, y: 0, z: 0.01 });
    side = norm(side);
    const up = norm(cross(side, tan));
    const pts: Pt[] = [];
    const nor: Pt[] = [];
    const b = k.b ?? k.a;
    for (let j = 0; j < segs; j++) {
      const a = (j / segs) * Math.PI * 2;
      const cs = Math.cos(a);
      const sn = Math.sin(a);
      pts.push({
        x: p.x + side.x * cs * k.a + up.x * sn * b,
        y: p.y + side.y * cs * k.a + up.y * sn * b,
        z: p.z + side.z * cs * k.a + up.z * sn * b,
      });
      nor.push(norm({ x: side.x * cs * b + up.x * sn * k.a, y: side.y * cs * b + up.y * sn * k.a, z: side.z * cs * b + up.z * sn * k.a }));
    }
    rows.push({ center: p, pts, nor, tan, c: k.c });
  });
  const W = segs + 1;
  let v = 0;
  rows.forEach((r, i) => {
    if (i > 0) {
      const d = sub(r.center, rows[i - 1]!.center);
      v += Math.hypot(d.x, d.y, d.z);
    }
    _c.set(r.c ?? s.c);
    for (let j = 0; j <= segs; j++) m.vertex(r.pts[j % segs]!, r.nor[j % segs]!, _c, s, j / segs, v);
  });
  for (let i = 0; i < rows.length - 1; i++) {
    for (let j = 0; j < segs; j++) {
      const a = i * W + j;
      m.idx.push(a, a + W + 1, a + 1, a, a + W, a + W + 1);
    }
  }
  // Puntas: un vértice en el centro (redondeadas, algo por fuera).
  for (const end of [0, rows.length - 1]) {
    const r = rows[end]!;
    const dir = end === 0 ? -1 : 1;
    const k = list[end]!;
    const out = o.round ? Math.min(k.a, k.b ?? k.a) * 0.7 : 0;
    const tip: Pt = { x: r.center.x + r.tan.x * dir * out, y: r.center.y + r.tan.y * dir * out, z: r.center.z + r.tan.z * dir * out };
    const n: Pt = { x: r.tan.x * dir, y: r.tan.y * dir, z: r.tan.z * dir };
    _c.set(r.c ?? s.c);
    const ti = m.vertex(tip, n, _c, s, 0, 0);
    const first = m.count;
    for (let j = 0; j < segs; j++) {
      const q = r.nor[j]!;
      // Redondeada: la normal del borde se mezcla con la de la punta.
      const nn = o.round ? norm({ x: q.x + n.x, y: q.y + n.y, z: q.z + n.z }) : n;
      m.vertex(r.pts[j]!, nn, _c, s, 0, 0);
    }
    for (let j = 0; j < segs; j++) {
      const a = first + j;
      const b = first + ((j + 1) % segs);
      if (end === 0) m.idx.push(ti, a, b);
      else m.idx.push(ti, b, a);
    }
  }
  return m.build();
}

/** Elipsoide (media esfera si `cut` > 0: solo la parte con y mayor que esa fracción). */
export function ellipsoid(
  rx: number,
  ry: number,
  rz: number,
  s: Surface,
  x = 0,
  y = 0,
  z = 0,
  o: { segs?: number; rows?: number; cut?: number; tint?: (p: Pt, c: Color) => void } = {},
): BufferGeometry {
  const segs = sides(o.segs ?? 12);
  const rows = Math.max(3, sides(o.rows ?? 8));
  const m = new MeshData();
  const top = Math.PI;
  const start = o.cut === undefined ? 0 : Math.acos(Math.max(-1, Math.min(1, -o.cut)));
  for (let i = 0; i <= rows; i++) {
    // De abajo (−1) a arriba (+1).
    const t = start + (i / rows) * (top - start);
    const cy = -Math.cos(t);
    const sy = Math.sin(t);
    for (let j = 0; j <= segs; j++) {
      const a = (j / segs) * Math.PI * 2;
      const nx = Math.sin(a) * sy;
      const nz = Math.cos(a) * sy;
      const p: Pt = { x: x + nx * rx, y: y + cy * ry, z: z + nz * rz };
      _c.set(s.c);
      o.tint?.(p, _c);
      m.vertex(p, norm({ x: nx / rx, y: cy / ry, z: nz / rz }), _c, s, j / segs, i / rows);
    }
  }
  const W = segs + 1;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < segs; j++) {
      const a = i * W + j;
      m.idx.push(a, a + 1, a + W + 1, a, a + W + 1, a + W);
    }
  }
  return m.build();
}

/** Bloque de cantos achaflanados, centrado y girado (`ry`, `rx`, `rz`, en ese orden). */
export function softBox(w: number, h: number, d: number, s: Surface, at: Pt, bevel = 0.006, rot: { x?: number; y?: number; z?: number } = {}): BufferGeometry {
  const b = Math.min(bevel, w * 0.45, h * 0.45, d * 0.45);
  const m = new MeshData();
  _c.set(s.c);
  const X = w / 2;
  const Y = h / 2;
  const Z = d / 2;
  const turn = (p: Pt): Pt => {
    let { x, y, z } = p;
    if (rot.x) {
      const c = Math.cos(rot.x);
      const n = Math.sin(rot.x);
      [y, z] = [y * c - z * n, y * n + z * c];
    }
    if (rot.y) {
      const c = Math.cos(rot.y);
      const n = Math.sin(rot.y);
      [x, z] = [x * c + z * n, -x * n + z * c];
    }
    if (rot.z) {
      const c = Math.cos(rot.z);
      const n = Math.sin(rot.z);
      [x, y] = [x * c - y * n, x * n + y * c];
    }
    return { x, y, z };
  };
  const quad = (a: Pt, bb: Pt, c: Pt, dd: Pt): void => {
    const n = turn(norm(cross(sub(bb, a), sub(c, a))));
    const put = (p: Pt): number => {
      const q = turn(p);
      return m.vertex({ x: q.x + at.x, y: q.y + at.y, z: q.z + at.z }, n, _c, s, p.x + p.z, p.y);
    };
    const i0 = put(a);
    const i1 = put(bb);
    const i2 = put(c);
    const i3 = put(dd);
    m.idx.push(i0, i1, i2, i0, i2, i3);
  };
  const x = X - b;
  const y = Y - b;
  const z = Z - b;
  const P = (px: number, py: number, pz: number): Pt => ({ x: px, y: py, z: pz });
  // Caras.
  quad(P(-x, -y, Z), P(x, -y, Z), P(x, y, Z), P(-x, y, Z));
  quad(P(x, -y, -Z), P(-x, -y, -Z), P(-x, y, -Z), P(x, y, -Z));
  quad(P(X, -y, z), P(X, -y, -z), P(X, y, -z), P(X, y, z));
  quad(P(-X, -y, -z), P(-X, -y, z), P(-X, y, z), P(-X, y, -z));
  quad(P(-x, Y, z), P(x, Y, z), P(x, Y, -z), P(-x, Y, -z));
  quad(P(-x, -Y, -z), P(x, -Y, -z), P(x, -Y, z), P(-x, -Y, z));
  // Chaflanes de las aristas.
  quad(P(x, -y, Z), P(X, -y, z), P(X, y, z), P(x, y, Z));
  quad(P(-X, -y, z), P(-x, -y, Z), P(-x, y, Z), P(-X, y, z));
  quad(P(X, -y, -z), P(x, -y, -Z), P(x, y, -Z), P(X, y, -z));
  quad(P(-x, -y, -Z), P(-X, -y, -z), P(-X, y, -z), P(-x, y, -Z));
  quad(P(-x, y, Z), P(x, y, Z), P(x, Y, z), P(-x, Y, z));
  quad(P(x, y, -Z), P(-x, y, -Z), P(-x, Y, -z), P(x, Y, -z));
  quad(P(-x, -Y, z), P(x, -Y, z), P(x, -y, Z), P(-x, -y, Z));
  quad(P(x, -Y, -z), P(-x, -Y, -z), P(-x, -y, -Z), P(x, -y, -Z));
  quad(P(x, Y, z), P(X, y, z), P(X, y, -z), P(x, Y, -z));
  quad(P(-X, y, z), P(-x, Y, z), P(-x, Y, -z), P(-X, y, -z));
  quad(P(X, -y, z), P(x, -Y, z), P(x, -Y, -z), P(X, -y, -z));
  quad(P(-x, -Y, z), P(-X, -y, z), P(-X, -y, -z), P(-x, -Y, -z));
  return m.build();
}

/**
 * La superficie de un cuerpo hecho de anillos: dónde está su frente o su espalda a una altura y a un lado. Con ella se
 * pegan las prendas que van encima.
 */
export class Shell {
  private readonly rings: Ring[];

  constructor(rings: readonly Ring[]) {
    this.rings = rings.slice().sort((a, b) => a.y - b.y);
  }

  /** El anillo a esa altura (interpolado). */
  at(y: number): Ring {
    const r = this.rings;
    if (y <= r[0]!.y) return r[0]!;
    for (let i = 1; i < r.length; i++) {
      const b = r[i]!;
      if (y > b.y) continue;
      const a = r[i - 1]!;
      const t = (y - a.y) / (b.y - a.y || 1);
      const mix = (p: number, q: number): number => p + (q - p) * t;
      return {
        y,
        rx: mix(a.rx, b.rx),
        rz: mix(a.rz, b.rz),
        rb: mix(a.rb ?? a.rz, b.rb ?? b.rz),
        x: mix(a.x ?? 0, b.x ?? 0),
        z: mix(a.z ?? 0, b.z ?? 0),
        e: mix(a.e ?? 2, b.e ?? 2),
      };
    }
    return r[r.length - 1]!;
  }

  /** Z del frente (`back`: de la espalda) en (x, y), separada `off` metros de la superficie. */
  z(x: number, y: number, off = 0, back = false): number {
    const r = this.at(y);
    const e = r.e ?? 2;
    const k = Math.min(0.995, Math.abs((x - (r.x ?? 0)) / r.rx));
    const d = Math.pow(1 - Math.pow(k, e), 1 / e);
    const c = r.z ?? 0;
    return back ? c + (r.rb ?? r.rz) * d + off : c - r.rz * d - off;
  }

  /** Punto a un ángulo del cuerpo (0 detrás, π delante), separado `off`. */
  around(a: number, y: number, off = 0): Pt {
    const r = this.at(y);
    const e = 2 / (r.e ?? 2);
    const s = Math.sin(a);
    const c = Math.cos(a);
    const px = Math.sign(s) * Math.pow(Math.abs(s), e) * (r.rx + off);
    const pz = Math.sign(c) * Math.pow(Math.abs(c), e) * ((c > 0 ? (r.rb ?? r.rz) : r.rz) + off);
    return { x: (r.x ?? 0) + px, y, z: (r.z ?? 0) + pz };
  }

  /**
   * Parche pegado al frente (o a la espalda): entre los bordes `x0(y)` y `x1(y)`, de `y0` a `y1`, con un grosor `off`
   * sobre la superficie. Lleva canto, así que se ve con volumen.
   */
  patch(
    y0: number,
    y1: number,
    x0: (y: number) => number,
    x1: (y: number) => number,
    off: number,
    s: Surface,
    o: { cols?: number; rows?: number; back?: boolean; tint?: (x: number, y: number, c: Color) => void } = {},
  ): BufferGeometry {
    const cols = Math.max(1, Math.round(sides(o.cols ?? 6)));
    const rows = Math.max(1, Math.round(sides(o.rows ?? 8)));
    const m = new MeshData();
    const back = !!o.back;
    const pts: Pt[][] = [];
    for (let i = 0; i <= rows; i++) {
      const y = y0 + ((y1 - y0) * i) / rows;
      const a = x0(y);
      const b = x1(y);
      const row: Pt[] = [];
      for (let j = 0; j <= cols; j++) {
        const x = a + ((b - a) * j) / cols;
        row.push({ x, y, z: this.z(x, y, off, back) });
      }
      pts.push(row);
    }
    const W = cols + 1;
    for (let i = 0; i <= rows; i++) {
      for (let j = 0; j <= cols; j++) {
        const p = pts[i]![j]!;
        const u0 = pts[i]![Math.max(0, j - 1)]!;
        const u1 = pts[i]![Math.min(cols, j + 1)]!;
        const v0 = pts[Math.max(0, i - 1)]![j]!;
        const v1 = pts[Math.min(rows, i + 1)]![j]!;
        let n = norm(cross(sub(u1, u0), sub(v1, v0)));
        // Hacia fuera: −Z delante, +Z detrás.
        if (back ? n.z < 0 : n.z > 0) n = { x: -n.x, y: -n.y, z: -n.z };
        _c.set(s.c);
        o.tint?.(p.x, p.y, _c);
        m.vertex(p, n, _c, s, p.x, p.y);
      }
    }
    // El sentido de las caras depende de hacia dónde crecen las columnas y las filas y de si va delante o detrás.
    const midY = (y0 + y1) / 2;
    const flip = (y1 > y0 === x1(midY) > x0(midY)) === back;
    const tri = (a: number, b: number, c: number): void => {
      if (flip) m.idx.push(a, b, c);
      else m.idx.push(a, c, b);
    };
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const a = i * W + j;
        tri(a, a + 1, a + W + 1);
        tri(a, a + W + 1, a + W);
      }
    }
    // Canto: una tira alrededor, hasta la superficie.
    const loop: Array<[number, number]> = [];
    for (let j = 0; j <= cols; j++) loop.push([0, j]);
    for (let i = 1; i <= rows; i++) loop.push([i, cols]);
    for (let j = cols - 1; j >= 0; j--) loop.push([rows, j]);
    for (let i = rows - 1; i >= 1; i--) loop.push([i, 0]);
    _c.set(s.c).multiplyScalar(0.8);
    const L = loop.length;
    const mid = pts[rows >> 1]![cols >> 1]!;
    for (let k = 0; k < L; k++) {
      const [i0, j0] = loop[k]!;
      const [i1, j1] = loop[(k + 1) % L]!;
      const p0 = pts[i0]![j0]!;
      const p1 = pts[i1]![j1]!;
      const q0: Pt = { x: p0.x, y: p0.y, z: this.z(p0.x, p0.y, -0.004, back) };
      const q1: Pt = { x: p1.x, y: p1.y, z: this.z(p1.x, p1.y, -0.004, back) };
      let n = norm(cross(sub(p1, p0), sub(q0, p0)));
      // Hacia fuera del parche, sea cual sea el sentido del contorno.
      const out = n.x * ((p0.x + p1.x) / 2 - mid.x) + n.y * ((p0.y + p1.y) / 2 - mid.y) >= 0;
      if (!out) n = { x: -n.x, y: -n.y, z: -n.z };
      const a = m.vertex(p0, n, _c, s, p0.x, p0.y);
      const b = m.vertex(p1, n, _c, s, p1.x, p1.y);
      const c = m.vertex(q1, n, _c, s, q1.x, q1.y);
      const d = m.vertex(q0, n, _c, s, q0.x, q0.y);
      if (out) m.idx.push(a, b, c, a, c, d);
      else m.idx.push(a, c, b, a, d, c);
    }
    return m.build();
  }
}
