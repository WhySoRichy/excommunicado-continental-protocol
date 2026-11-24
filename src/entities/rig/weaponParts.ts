import {
  BoxGeometry,
  type BufferGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  LatheGeometry,
  Path,
  Shape,
  TorusGeometry,
  Vector2,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { paint } from './geometry';

/**
 * Piezas de las armas (`weapons.ts`). Todo en el espacio del arma: el cañón apunta a −Z, arriba es +Y y la mano que la
 * empuña está en el origen. Cada pieza lleva en sus vértices su color, su rugosidad y su metalicidad (atributo `pbr`):
 * así el acero pulido, el pavonado, el latón, la madera y la goma se ven distintos con un solo material y una sola
 * draw call por arma, y un acabado (las futuras skins) solo cambia esos valores.
 */
export interface Surf {
  /** Color. */
  c: number;
  /** Rugosidad (0 espejo, 1 mate) y metalicidad (0 no metal, 1 metal). */
  r: number;
  m: number;
}

/** Punto de un contorno en el plano lateral del arma: [z, y] y, opcional, el radio con que se redondea esa esquina. */
export type P = readonly [number, number] | readonly [number, number, number];

function finish(g: BufferGeometry, s: Surf): BufferGeometry {
  const flat = g.index ? g.toNonIndexed() : g;
  if (flat !== g) g.dispose();
  paint(flat, s.c);
  const n = flat.getAttribute('position').count;
  const pbr = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    pbr[i * 2] = s.r;
    pbr[i * 2 + 1] = s.m;
  }
  flat.setAttribute('pbr', new Float32BufferAttribute(pbr, 2));
  return flat;
}

/** Traza un contorno cerrado redondeando las esquinas que lo piden (el radio se limita a media arista). */
function trace(path: Path, pts: readonly P[]): void {
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const [x, y, r = 0] = pts[i]!;
    const [px, py] = pts[(i - 1 + n) % n]!;
    const [nx, ny] = pts[(i + 1) % n]!;
    if (r <= 0) {
      if (i === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
      continue;
    }
    const d1 = Math.hypot(px - x, py - y) || 1;
    const d2 = Math.hypot(nx - x, ny - y) || 1;
    const k1 = Math.min(r, d1 / 2) / d1;
    const k2 = Math.min(r, d2 / 2) / d2;
    const ax = x + (px - x) * k1;
    const ay = y + (py - y) * k1;
    if (i === 0) path.moveTo(ax, ay);
    else path.lineTo(ax, ay);
    path.quadraticCurveTo(x, y, x + (nx - x) * k2, y + (ny - y) * k2);
  }
  path.closePath();
}

export function outline(pts: readonly P[], holes: ReadonlyArray<readonly P[]> = []): Shape {
  const s = new Shape();
  trace(s, pts);
  for (const h of holes) {
    const p = new Path();
    trace(p, h);
    s.holes.push(p);
  }
  return s;
}

export interface ProfileOpts {
  /** Desplazamiento lateral del centro (+X a la derecha del arma). */
  x?: number;
  /** Bisel de los cantos (m). */
  bevel?: number;
  /** Segmentos de cada curva del contorno. */
  curve?: number;
  /** Agujeros del contorno (el del guardamonte). */
  holes?: ReadonlyArray<readonly P[]>;
}

/**
 * Perfil lateral extruido a lo ancho: el contorno se dibuja en (z, y) y se le da grosor `width` centrado en `x`, con
 * los cantos biselados sin que el bisel cambie la silueta.
 */
export function side(pts: readonly P[], width: number, s: Surf, o: ProfileOpts = {}): BufferGeometry {
  const b = Math.min(o.bevel ?? 0.0015, width * 0.3);
  const depth = Math.max(1e-4, width - 2 * b);
  const g = new ExtrudeGeometry(outline(pts, o.holes ?? []), {
    depth,
    curveSegments: o.curve ?? 4,
    bevelEnabled: b > 0,
    bevelThickness: b,
    bevelSize: b,
    bevelOffset: -b,
    bevelSegments: 1,
  });
  // De (contorno x, contorno y, extrusión z) a (z, y, −x) del arma, centrado en x.
  g.rotateY(-Math.PI / 2);
  g.translate(depth / 2 + (o.x ?? 0), 0, 0);
  return finish(g, s);
}

/**
 * Bloque de cantos biselados y esquinas redondeadas: `w` de ancho (X), `h` de alto y `d` de largo (Z), centrado en
 * (x, y, z) e inclinado `rx` sobre X (positivo: la cara delantera sube).
 */
export function block(w: number, h: number, d: number, s: Surf, x = 0, y = 0, z = 0, r = 0.0015, rx = 0): BufferGeometry {
  const hz = d / 2;
  const hy = h / 2;
  const rr = Math.min(r, hz * 0.5, hy * 0.5);
  const g = side(
    [
      [-hz, -hy, rr],
      [hz, -hy, rr],
      [hz, hy, rr],
      [-hz, hy, rr],
    ],
    w,
    s,
    { bevel: Math.min(rr, w * 0.25), curve: 2 },
  );
  if (rx !== 0) g.rotateX(rx);
  g.translate(x, y, z);
  return g;
}

/**
 * Caja simple (12 triángulos) para piezas diminutas y repetidas: dientes de raíl, estrías, puertos, ranuras. A ese tamaño
 * el bisel no se ve y un raíl con cuarenta dientes redondeados costaba más que el resto del arma.
 */
export function cube(w: number, h: number, d: number, s: Surf, x = 0, y = 0, z = 0): BufferGeometry {
  const g = new BoxGeometry(w, h, d);
  g.translate(x, y, z);
  return finish(g, s);
}

/** Cilindro a lo largo de Z entre z0 y z1, centrado en (x, y). `twist` gira la sección (caras planas arriba). */
export function tube(r: number, z0: number, z1: number, s: Surf, x = 0, y = 0, segs = 12, twist = 0): BufferGeometry {
  const g = new CylinderGeometry(r, r, Math.abs(z1 - z0), segs);
  if (twist !== 0) g.rotateY(twist);
  g.rotateX(Math.PI / 2);
  g.translate(x, y, (z0 + z1) / 2);
  return finish(g, s);
}

/** Cilindro vertical (eje Y) de radio r y altura h centrado en (x, y, z): torretas, tornillos, cartuchos de pie. */
export function post(r: number, h: number, s: Surf, x = 0, y = 0, z = 0, segs = 8): BufferGeometry {
  const g = new CylinderGeometry(r, r, h, segs);
  g.translate(x, y, z);
  return finish(g, s);
}

/** Cilindro lateral (eje X) de radio r y ancho w centrado en (x, y, z): el tambor de la mira, botones, medallones. */
export function knob(r: number, w: number, s: Surf, x = 0, y = 0, z = 0, segs = 10): BufferGeometry {
  const g = new CylinderGeometry(r, r, w, segs);
  g.rotateZ(Math.PI / 2);
  g.translate(x, y, z);
  return finish(g, s);
}

/**
 * Pieza de revolución alrededor de un eje paralelo a Z que pasa por (x, y). Perfil de [radio, z] ordenado de atrás
 * adelante (z decreciente): bocachas, miras, el bombeo de madera de la escopeta.
 */
export function lathe(pts: ReadonlyArray<readonly [number, number]>, s: Surf, x = 0, y = 0, segs = 12): BufferGeometry {
  const g = new LatheGeometry(
    pts.map(([r, z]) => new Vector2(Math.max(r, 1e-5), -z)),
    segs,
  );
  g.rotateX(-Math.PI / 2);
  g.translate(x, y, 0);
  return finish(g, s);
}

/** Sección (en el plano x, y, relativa a su eje) extruida a lo largo de Z entre z0 y z1: el tambor estriado, raíles. */
export function along(section: Shape, z0: number, z1: number, s: Surf, x = 0, y = 0, bevel = 0.001, curve = 3): BufferGeometry {
  const len = Math.abs(z1 - z0);
  const b = Math.min(bevel, len * 0.3);
  const g = new ExtrudeGeometry(section, {
    depth: Math.max(1e-4, len - 2 * b),
    curveSegments: curve,
    bevelEnabled: b > 0,
    bevelThickness: b,
    bevelSize: b,
    bevelOffset: -b,
    bevelSegments: 1,
  });
  g.translate(x, y, Math.min(z0, z1) + b);
  return finish(g, s);
}

/** Anillo (toro) en el plano XY centrado en (x, y, z): la anilla de una granada. */
export function ring(r: number, tube: number, s: Surf, x = 0, y = 0, z = 0): BufferGeometry {
  const g = new TorusGeometry(r, tube, 6, 14);
  g.translate(x, y, z);
  return finish(g, s);
}

/** `n` piezas a lo largo de Z desde z0, separadas `dz` (estrías, ranuras, nervios). */
export function repeat(n: number, z0: number, dz: number, make: (z: number) => BufferGeometry): BufferGeometry[] {
  return Array.from({ length: n }, (_, i) => make(z0 + i * dz));
}

/** Une las piezas en una sola geometría (posición, normal, uv, color y `pbr`). */
export function assemble(parts: readonly BufferGeometry[]): BufferGeometry {
  for (const g of parts) {
    if (!g.getAttribute('uv') || !g.getAttribute('pbr')) throw new Error('arma: pieza sin uv o sin pbr');
  }
  const all = mergeGeometries([...parts], false);
  if (!all) throw new Error('arma: no se pudieron fusionar las piezas');
  for (const g of parts) g.dispose();
  all.computeBoundingSphere();
  return all;
}
