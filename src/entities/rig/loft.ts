import { BufferGeometry, Color, Float32BufferAttribute } from 'three';

/**
 * Piezas de los personajes: superficies suaves hechas de anillos (tubos de sección variable), parches pegados a una de
 * esas superficies y formas sueltas. Todo en el espacio del personaje en reposo: pies en el origen, mirando a −Z, brazos
 * colgando. Cada vértice lleva su color, su rugosidad, su metalicidad y cuánta trama de tela tiene (atributo `pbr`), así
 * un solo material dibuja tela, cuero, piel, pelo y metal.
 */
export interface Surface {
  /** Color. */
  c: number;
  /** Rugosidad, metalicidad y trama de tela (0 lisa, 1 tela gruesa). */
  r: number;
  m: number;
  w: number;
}

/** Un anillo: su altura, sus semiejes (delante y detrás pueden ser distintos), su centro y su forma. */
export interface Ring {
  y: number;
  rx: number;
  /** Semieje hacia delante (−Z) y hacia detrás (+Z); si falta, igual que delante. */
  rz: number;
  rb?: number;
  x?: number;
  z?: number;
  /** Exponente de la superelipse: 2 redonda, 3 o 4 más cuadrada. */
  e?: number;
  /** Color propio y cuánto se oscurece (pliegues, sombras de contacto). */
  c?: number;
  k?: number;
}

export interface LoftOpts {
  /** Lados del tubo. */
  segs?: number;
  /** Tapas en el primer y el último anillo. */
  capStart?: boolean;
  capEnd?: boolean;
  /** Deforma cada punto: ángulo (0 detrás, π delante, π/2 a la derecha), altura y posición. */
  mod?: (p: Pt, a: number, y: number) => void;
  /** Color de cada punto (por defecto, el del anillo o el de la superficie). */
  tint?: (p: Pt, a: number, y: number, base: Color) => void;
  /** Escala de la coordenada de la tela (m por repetición: 1 = un metro). */
  uv?: number;
}

export interface Pt {
  x: number;
  y: number;
  z: number;
}

const _c = new Color();
const _base = new Color();

/** Joroba suave: 1 en el centro y 0 a partir de ±1. */
export function bell01(u: number): number {
  const k = 1 - u * u;
  return k > 0 ? k * k : 0;
}

/** Punto de un anillo en el ángulo `a` (0 detrás, crece hacia +X). */
export function ringPoint(r: Ring, a: number, out: Pt): Pt {
  const e = 2 / (r.e ?? 2);
  const s = Math.sin(a);
  const c = Math.cos(a);
  const px = Math.sign(s) * Math.pow(Math.abs(s), e);
  const pz = Math.sign(c) * Math.pow(Math.abs(c), e);
  out.x = (r.x ?? 0) + px * r.rx;
  out.y = r.y;
  out.z = (r.z ?? 0) + pz * (c > 0 ? (r.rb ?? r.rz) : r.rz);
  return out;
}

/** Geometría vacía con los atributos de los personajes. */
export class MeshData {
  readonly pos: number[] = [];
  readonly nor: number[] = [];
  readonly col: number[] = [];
  readonly pbr: number[] = [];
  readonly uv: number[] = [];
  readonly idx: number[] = [];

  get count(): number {
    return this.pos.length / 3;
  }

  vertex(p: Pt, n: Pt, c: Color, s: Surface, u: number, v: number): number {
    this.pos.push(p.x, p.y, p.z);
    this.nor.push(n.x, n.y, n.z);
    this.col.push(c.r, c.g, c.b);
    this.pbr.push(s.r, s.m, s.w);
    this.uv.push(u, v);
    return this.count - 1;
  }

  build(): BufferGeometry {
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    g.setAttribute('color', new Float32BufferAttribute(this.col, 3));
    g.setAttribute('pbr', new Float32BufferAttribute(this.pbr, 3));
    g.setAttribute('uv', new Float32BufferAttribute(this.uv, 2));
    g.setIndex(this.idx);
    return g;
  }
}

/** Detalle de las mallas: multiplica los lados y las filas (1 cerca; menos, de lejos). */
let detail = 1;

/** ¿Se está construyendo la malla lejana? Lo que no se ve de lejos (ojos, cordones, botones) se salta. */
export const far = (): boolean => detail < 0.7;

export function withDetail<T>(k: number, build: () => T): T {
  const prev = detail;
  detail = k;
  try {
    return build();
  } finally {
    detail = prev;
  }
}

export const sides = (n: number): number => Math.max(5, Math.round(n * detail));

/** Interpolación suave (Catmull-Rom) entre anillos para un número de filas dado. */
function resample(rings: readonly Ring[], rows: number): Ring[] {
  const out: Ring[] = [];
  const n = rings.length;
  const get = (i: number): Ring => rings[Math.max(0, Math.min(n - 1, i))]!;
  const num = (f: (r: Ring) => number, i: number, t: number): number => {
    const p0 = f(get(i - 1));
    const p1 = f(get(i));
    const p2 = f(get(i + 1));
    const p3 = f(get(i + 2));
    // Tangentes limitadas (monótonas): sin sobrepasos entre anillos muy distintos.
    const d = p2 - p1;
    let m1 = (p2 - p0) / 2;
    let m2 = (p3 - p1) / 2;
    if (d === 0) m1 = m2 = 0;
    else {
      if (m1 / d < 0) m1 = 0;
      if (m2 / d < 0) m2 = 0;
      const a = m1 / d;
      const b = m2 / d;
      const l = Math.hypot(a, b);
      if (l > 3) {
        m1 = (3 * a * d) / l;
        m2 = (3 * b * d) / l;
      }
    }
    const t2 = t * t;
    const t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * p1 + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2 + (t3 - t2) * m2;
  };
  for (let row = 0; row <= rows; row++) {
    const f = (row / rows) * (n - 1);
    const i = Math.min(n - 2, Math.floor(f));
    const t = f - i;
    const a = get(i);
    const b = get(i + 1);
    const ring: Ring = {
      y: num((r) => r.y, i, t),
      rx: num((r) => r.rx, i, t),
      rz: num((r) => r.rz, i, t),
      rb: num((r) => r.rb ?? r.rz, i, t),
      x: num((r) => r.x ?? 0, i, t),
      z: num((r) => r.z ?? 0, i, t),
      e: num((r) => r.e ?? 2, i, t),
      k: num((r) => r.k ?? 1, i, t),
    };
    if (a.c !== undefined || b.c !== undefined)
      ring.c = _c
        .set(a.c ?? b.c!)
        .lerp(_base.set(b.c ?? a.c!), t)
        .getHex();
    out.push(ring);
  }
  return out;
}

/** Tubo de anillos con normales suaves. `rows`: filas tras suavizar (0: los anillos tal cual). */
export function loft(rings: readonly Ring[], s: Surface, rows = 0, o: LoftOpts = {}): BufferGeometry {
  const segs = sides(o.segs ?? 16);
  const list = rows > 0 ? resample(rings, Math.max(4, Math.round(rows * detail))) : rings.slice();
  const R = list.length;
  const m = new MeshData();
  const P: Pt[][] = [];
  for (const r of list) {
    const row: Pt[] = [];
    for (let j = 0; j < segs; j++) {
      const a = (j / segs) * Math.PI * 2;
      const p = ringPoint(r, a, { x: 0, y: 0, z: 0 });
      o.mod?.(p, a, r.y);
      row.push(p);
    }
    P.push(row);
  }
  const uvK = o.uv ?? 1;
  const n: Pt = { x: 0, y: 0, z: 0 };
  let v = 0;
  for (let i = 0; i < R; i++) {
    const r = list[i]!;
    if (i > 0) v += Math.hypot(r.y - list[i - 1]!.y, (r.x ?? 0) - (list[i - 1]!.x ?? 0), (r.z ?? 0) - (list[i - 1]!.z ?? 0));
    for (let j = 0; j <= segs; j++) {
      const jj = j % segs;
      const p = P[i]![jj]!;
      const a = (j / segs) * Math.PI * 2;
      const pu0 = P[i]![(jj + segs - 1) % segs]!;
      const pu1 = P[i]![(jj + 1) % segs]!;
      const pv0 = P[Math.max(0, i - 1)]![jj]!;
      const pv1 = P[Math.min(R - 1, i + 1)]![jj]!;
      normal(pu0, pu1, pv0, pv1, n);
      _base.set(r.c ?? s.c).multiplyScalar(r.k ?? 1);
      o.tint?.(p, a, r.y, _base);
      m.vertex(p, n, _base, s, ((j / segs) * perimeter(r)) / uvK, v / uvK);
    }
  }
  // Los anillos van de abajo arriba o de arriba abajo: el orden de las caras sale hacia fuera en los dos casos.
  const up = list[R - 1]!.y >= list[0]!.y;
  const W = segs + 1;
  for (let i = 0; i < R - 1; i++) {
    for (let j = 0; j < segs; j++) {
      const a = i * W + j;
      const b = a + 1;
      const c = a + W;
      const d = c + 1;
      if (up) m.idx.push(a, b, d, a, d, c);
      else m.idx.push(a, d, b, a, c, d);
    }
  }
  if (!up) for (let i = 0; i < m.nor.length; i++) m.nor[i] = -m.nor[i]!;
  if (o.capStart) cap(m, P[0]!, list[0]!, s, !up);
  if (o.capEnd) cap(m, P[R - 1]!, list[R - 1]!, s, up);
  return m.build();
}

function perimeter(r: Ring): number {
  return Math.PI * (r.rx + (r.rz + (r.rb ?? r.rz)) / 2);
}

/** Normal hacia fuera con anillos que suben: (tangente del anillo) × (tangente vertical). */
function normal(u0: Pt, u1: Pt, v0: Pt, v1: Pt, out: Pt): void {
  const ux = u1.x - u0.x;
  const uy = u1.y - u0.y;
  const uz = u1.z - u0.z;
  const vx = v1.x - v0.x;
  const vy = v1.y - v0.y;
  const vz = v1.z - v0.z;
  const x = uy * vz - uz * vy;
  const y = uz * vx - ux * vz;
  const z = ux * vy - uy * vx;
  const l = Math.hypot(x, y, z) || 1;
  out.x = x / l;
  out.y = y / l;
  out.z = z / l;
}

/** Tapa plana de un anillo, mirando hacia arriba o hacia abajo. */
function cap(m: MeshData, row: readonly Pt[], r: Ring, s: Surface, up: boolean): void {
  const n: Pt = { x: 0, y: up ? 1 : -1, z: 0 };
  _base.set(r.c ?? s.c).multiplyScalar(r.k ?? 1);
  const center: Pt = { x: 0, y: 0, z: 0 };
  for (const p of row) {
    center.x += p.x / row.length;
    center.y += p.y / row.length;
    center.z += p.z / row.length;
  }
  const ci = m.vertex(center, n, _base, s, 0, 0);
  const first = m.count;
  for (const p of row) m.vertex(p, n, _base, s, p.x - center.x, p.z - center.z);
  for (let j = 0; j < row.length; j++) {
    const a = first + j;
    const b = first + ((j + 1) % row.length);
    if (up) m.idx.push(ci, a, b);
    else m.idx.push(ci, b, a);
  }
}
