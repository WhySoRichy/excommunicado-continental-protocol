import type { Collider } from '@dimforge/rapier3d-compat';
import { type PhysicsWorld, QueryGroups, type RayHit, type Vec3Like, createRayHit } from '../physics/Physics';
import type { CoverHeight } from './PlayerController';

/** Ajustes de la cobertura (DISENO §3). Todo en m, s y m/s. */
export const COVER = {
  /** Alcance de C pulsada: la pared más cercana hacia donde se anda o se mira. */
  near: 1.6,
  /** Alcance de C mantenida: la cobertura que se mira. */
  far: 9,
  /** Cuánto hay que mantener C para correr a la cobertura que se mira. */
  hold: 0.2,
  /** Carrera hasta la cobertura: velocidad, aceleración y frenada al llegar (m/s²). */
  run: 6.2,
  runAccel: 40,
  runBrake: 26,
  /** Separación entre la cápsula y la pared, y alcance de la sonda que mantiene en cobertura. */
  gap: 0.06,
  probe: 0.95,
  /** Velocidad al recorrer la pared. */
  speed: 2.1,
  /** Rodear una esquina: cuánto hay que empujar contra el borde y cuánto tarda. */
  wrapHold: 0.22,
  wrapTime: 0.45,
  /** Al apuntar en la alta lejos de un borde, el borde más cercano a esta distancia como mucho y la velocidad para llegar. */
  seekEdge: 1.3,
  seekSpeed: 3.2,
} as const;

/** Alturas de las sondas sobre los pies: la pared existe, cubre al menos agachado, es alta. */
export const LOW_Y = 0.45;
const MID_Y = 0.8;
const HIGH_Y = 1.5;
/** A la altura del pecho se decide si se puede asomar por un borde. */
export const CHEST_Y = 1.3;
/** A la altura de la rodilla no puede haber nada entre el jugador y la cobertura a la que corre. */
const KNEE_Y = 0.25;
/** Hasta dónde se busca el borde superior de una cobertura. */
export const TOP_MAX = 2.4;
/** Cuánto entra en la pared la sonda que busca su borde superior. */
const TOP_INSET = 0.08;
/** Altura que se supone a una cobertura baja cuyo borde no se encuentra (una pared muy fina). */
const LOW_TOP = 1.2;
/** Al elegir dónde cubrirse, la pared tiene que seguir al menos esto a cada lado de los pies (m); si no, se mete hacia dentro. */
const INSET = 0.3;
/** Una esquina solo se rodea si la cara lateral tiene al menos esta profundidad (los cantos de los muros finos no). */
const WRAP_DEPTH = 0.85;
/** La pared tiene que mirar al jugador: coseno mínimo entre su normal y la dirección contraria a la sonda. */
const FACING = 0.5;

/** Una pared que sirve de cobertura vista desde los pies: distancia, normal, punto tocado, altura y borde superior. */
export interface WallProbe {
  dist: number;
  nx: number;
  nz: number;
  px: number;
  pz: number;
  height: CoverHeight;
  /** Borde superior sobre los pies (TOP_MAX si es más alta). */
  top: number;
}

/** Dónde cubrirse: la pared y dónde quedarían los pies, pegados a ella. */
export interface CoverSpot extends WallProbe {
  x: number;
  y: number;
  z: number;
}

/** Cómo rodear una esquina exterior: un tramo recto hasta ella, un arco y otro tramo por la cara lateral. */
export interface WrapPlan {
  x0: number;
  z0: number;
  y: number;
  /** Esquina (en el plano de la pared, a la altura de los pies). */
  kx: number;
  kz: number;
  /** Normal de la pared de partida y de la cara lateral (que es la dirección hacia el borde). */
  nx: number;
  nz: number;
  tx: number;
  tz: number;
  /** Lado del borde (−1/+1) según se mira la pared de partida. */
  side: number;
  /** Radio del arco, lo que se adentra por la cara lateral y longitud de cada tramo. */
  off: number;
  back: number;
  l1: number;
  arc: number;
  total: number;
  height: CoverHeight;
  top: number;
}

export function emptyProbe(): WallProbe {
  return { dist: 0, nx: 0, nz: 1, px: 0, pz: 0, height: 'low', top: LOW_TOP };
}

export function emptySpot(): CoverSpot {
  return { ...emptyProbe(), x: 0, y: 0, z: 0 };
}

export function emptyWrap(): WrapPlan {
  return { x0: 0, z0: 0, y: 0, kx: 0, kz: 0, nx: 0, nz: 1, tx: 1, tz: 0, side: 1, off: 0, back: 0, l1: 0, arc: 0, total: 0, height: 'low', top: LOW_TOP };
}

export function copyProbe(a: WallProbe, b: WallProbe): void {
  b.dist = a.dist;
  b.nx = a.nx;
  b.nz = a.nz;
  b.px = a.px;
  b.pz = a.pz;
  b.height = a.height;
  b.top = a.top;
}

function copySpot(a: CoverSpot, b: CoverSpot): void {
  copyProbe(a, b);
  b.x = a.x;
  b.y = a.y;
  b.z = a.z;
}

/** ¿Son la misma pared? Misma orientación y mismo plano. */
function sameWall(a: WallProbe, b: WallProbe): boolean {
  if (a.nx * b.nx + a.nz * b.nz < 0.9) return false;
  return Math.abs((a.px - b.px) * b.nx + (a.pz - b.pz) * b.nz) < 0.3;
}

/** Punto del recorrido al rodear una esquina, con `u` de 0 a 1 a lo largo del camino. Escribe x y z en `out`. */
export function wrapPoint(w: WrapPlan, u: number, out: Vec3Like): Vec3Like {
  const s = Math.max(0, Math.min(1, u)) * w.total;
  const ax = w.kx + w.nx * w.off;
  const az = w.kz + w.nz * w.off;
  if (s <= w.l1) {
    const k = w.l1 > 1e-6 ? s / w.l1 : 1;
    out.x = w.x0 + (ax - w.x0) * k;
    out.z = w.z0 + (az - w.z0) * k;
  } else if (s <= w.l1 + w.arc) {
    const th = (s - w.l1) / w.off;
    out.x = w.kx + w.off * (Math.cos(th) * w.nx + Math.sin(th) * w.tx);
    out.z = w.kz + w.off * (Math.cos(th) * w.nz + Math.sin(th) * w.tz);
  } else {
    const k = s - w.l1 - w.arc;
    out.x = w.kx + w.tx * w.off - w.nx * k;
    out.z = w.kz + w.tz * w.off - w.nz * k;
  }
  out.y = w.y;
  return out;
}

/** Cuánto ha girado ya el cuerpo al rodear la esquina (0 de cara a la pared de partida, 1 a la lateral). */
export function wrapTurn(w: WrapPlan, u: number): number {
  const s = Math.max(0, Math.min(1, u)) * w.total;
  return w.arc > 1e-6 ? Math.max(0, Math.min(1, (s - w.l1) / w.arc)) : 1;
}

/**
 * Las consultas de la cobertura contra el escenario: encontrar una pared que cubra hacia donde se anda o se mira,
 * comprobar que se puede llegar y que hay sitio, buscar sus bordes y planear cómo rodear una esquina. Sin
 * asignaciones: todo se escribe en objetos que se pasan o en los propios del sensor.
 */
export class CoverSensor {
  private readonly hit: RayHit = createRayHit();
  private readonly o = { x: 0, y: 0, z: 0 };
  private readonly d = { x: 0, y: 0, z: 0 };
  /** Punto desde el que se sondea algo que no son los pies (no puede ser `o`: lo reescribe cada rayo). */
  private readonly at = { x: 0, y: 0, z: 0 };
  private readonly p: WallProbe = emptyProbe();
  private readonly c: CoverSpot = emptySpot();

  constructor(
    private readonly ph: PhysicsWorld,
    private readonly exclude: Collider,
    private readonly radius: number,
    private readonly crouchHalf: number,
  ) {}

  private ray(x: number, y: number, z: number, dx: number, dy: number, dz: number, max: number): boolean {
    this.o.x = x;
    this.o.y = y;
    this.o.z = z;
    this.d.x = dx;
    this.d.y = dy;
    this.d.z = dz;
    return this.ph.raycast(this.o, this.d, max, QueryGroups.STATIC, this.hit, this.exclude);
  }

  /**
   * Sondea una pared en la dirección (dx, dz), normalizada, desde los pies: tiene que existir a 0,45 m de altura,
   * mirar hacia el jugador y seguir a 0,8 m (cubre al menos agachado); a 1,5 m decide si es alta o baja.
   */
  probe(feet: Vec3Like, dx: number, dz: number, maxDist: number, out: WallProbe): boolean {
    const h = this.hit;
    if (!this.ray(feet.x, feet.y + LOW_Y, feet.z, dx, 0, dz, maxDist)) return false;
    if (Math.abs(h.normal.y) > 0.35 || h.normal.x * dx + h.normal.z * dz > -FACING) return false;
    const nl = Math.hypot(h.normal.x, h.normal.z) || 1;
    const dist = h.distance;
    const nx = h.normal.x / nl;
    const nz = h.normal.z / nl;
    const px = h.point.x;
    const pz = h.point.z;
    if (!this.ray(feet.x, feet.y + MID_Y, feet.z, dx, 0, dz, dist + 0.35)) return false;
    const high = this.ray(feet.x, feet.y + HIGH_Y, feet.z, dx, 0, dz, dist + 0.4);
    out.dist = dist;
    out.nx = nx;
    out.nz = nz;
    out.px = px;
    out.pz = pz;
    out.height = high ? 'high' : 'low';
    out.top = high ? TOP_MAX : this.topOf(feet.y, px, pz, nx, nz);
    return true;
  }

  /** Borde superior de una cobertura baja sobre los pies, buscado desde arriba un poco dentro de la pared. */
  private topOf(feetY: number, px: number, pz: number, nx: number, nz: number): number {
    const h = this.hit;
    if (!this.ray(px - nx * TOP_INSET, feetY + TOP_MAX, pz - nz * TOP_INSET, 0, -1, 0, TOP_MAX - LOW_Y)) return LOW_TOP;
    if (h.distance < 1e-3) return TOP_MAX;
    return h.normal.y > 0.7 ? h.point.y - feetY : LOW_TOP;
  }

  /**
   * Cuánto desplazar a lo largo de la pared (normal n) unos pies en (x, z) para que la pared siga `INSET` a cada lado
   * (+ hacia la derecha según se la mira). 0 si ya cubre o si es tan estrecha que se acaba por los dos lados.
   */
  private inset(x: number, y: number, z: number, nx: number, nz: number): number {
    const tx = nz;
    const tz = -nx;
    const reach = this.radius + COVER.gap + 0.35;
    const covered = (cx: number, cz: number): boolean => this.ray(cx, y + LOW_Y, cz, -nx, 0, -nz, reach);
    const right = covered(x + tx * INSET, z + tz * INSET);
    const left = covered(x - tx * INSET, z - tz * INSET);
    if (right === left) return 0;
    // Se acaba por un lado: hacia el otro hasta que ese lado quede cubierto (como mucho medio metro).
    const end = right ? -1 : 1;
    for (let k = 0.1; k <= 0.5 + 1e-6; k += 0.1) {
      const cx = x - tx * end * k;
      const cz = z - tz * end * k;
      if (covered(cx + tx * end * INSET, cz + tz * end * INSET)) return -end * k;
    }
    return 0;
  }

  /** Suelo bajo (x, z) cerca de la altura `y0` (misma planta), o null. */
  private groundAt(x: number, z: number, y0: number): number | null {
    const h = this.hit;
    if (!this.ray(x, y0 + 0.5, z, 0, -1, 0, 1)) return null;
    if (h.normal.y < 0.7 || Math.abs(h.point.y - y0) > 0.4) return null;
    return h.point.y;
  }

  /** ¿Cabe agachado con los pies en (x, y, z)? */
  private fits(x: number, y: number, z: number): boolean {
    this.o.x = x;
    this.o.y = y + this.crouchHalf + this.radius + 0.03;
    this.o.z = z;
    return this.ph.overlapsCapsule(this.o, this.radius - 0.02, this.crouchHalf, QueryGroups.STATIC, this.exclude) === null;
  }

  /**
   * Busca dónde cubrirse en un abanico de `rays` sondas (±`halfFan` rad) alrededor de (dx, dz), hasta `reach`. Gana la
   * pared más cercana y más de frente con sitio delante, suelo a la misma altura y, si está lejos, sin nada en medio
   * a la altura de la rodilla. `avoid` descarta la pared en la que ya se está.
   */
  find(feet: Vec3Like, dx: number, dz: number, reach: number, halfFan: number, rays: number, out: CoverSpot, avoid: WallProbe | null = null): boolean {
    const p = this.p;
    const c = this.c;
    const gap = this.radius + COVER.gap;
    let best = Infinity;
    for (let i = 0; i < rays; i++) {
      const a = rays > 1 ? ((i / (rays - 1)) * 2 - 1) * halfFan : 0;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const rx = dx * ca - dz * sa;
      const rz = dx * sa + dz * ca;
      if (!this.probe(feet, rx, rz, reach, p)) continue;
      if (avoid && sameWall(p, avoid)) continue;
      const score = p.dist * (1 + (halfFan > 0 ? (0.5 * Math.abs(a)) / halfFan : 0));
      if (score >= best) continue;
      if (p.dist > 1 && this.ray(feet.x, feet.y + KNEE_Y, feet.z, rx, 0, rz, p.dist - 0.4)) continue;
      // Que la pared cubra a los dos lados: cerca de su final, un poco hacia dentro.
      const shift = this.inset(p.px + p.nx * gap, feet.y, p.pz + p.nz * gap, p.nx, p.nz);
      const x = p.px + p.nx * gap + p.nz * shift;
      const z = p.pz + p.nz * gap - p.nx * shift;
      const y = this.groundAt(x, z, feet.y);
      if (y === null || !this.fits(x, y, z)) continue;
      copyProbe(p, c);
      c.px += p.nz * shift;
      c.pz -= p.nx * shift;
      c.x = x;
      c.y = y;
      c.z = z;
      best = score;
    }
    if (best === Infinity) return false;
    copySpot(c, out);
    return true;
  }

  /**
   * La cobertura que se mira: lo que toca el rayo de la cámara (desde la altura del jugador, para no contar lo que haya
   * entre la cámara y él) y, hacia ese punto, la pared que cubra. Si se mira el suelo o lo alto de una caja, la pared
   * está un poco más allá.
   */
  look(from: Vec3Like, dir: Vec3Like, feet: Vec3Like, reach: number, out: CoverSpot, avoid: WallProbe | null = null): boolean {
    const h = this.hit;
    const depth = Math.max(0, (feet.x - from.x) * dir.x + (feet.y + 1 - from.y) * dir.y + (feet.z - from.z) * dir.z);
    if (!this.ray(from.x + dir.x * depth, from.y + dir.y * depth, from.z + dir.z * depth, dir.x, dir.y, dir.z, reach + 3)) return false;
    const hx = h.point.x - feet.x;
    const hz = h.point.z - feet.z;
    const d = Math.hypot(hx, hz);
    if (d < 0.4) return false;
    const extra = Math.abs(h.normal.y) > 0.7 ? 1.2 : 0.5;
    return this.find(feet, hx / d, hz / d, Math.min(reach, d + extra), 0.07, 3, out, avoid);
  }

  /** ¿Se acaba la pared (normal n, a `dist`) desplazándose (ox, oz) desde los pies, a la altura `y`? */
  endsAt(feet: Vec3Like, ox: number, oz: number, y: number, nx: number, nz: number, dist: number): boolean {
    return !this.ray(feet.x + ox, feet.y + y, feet.z + oz, -nx, 0, -nz, dist + 0.35);
  }

  /**
   * Distancia lateral hasta donde se acaba la pared a la altura del pecho por el lado `side` (−1/+1, según se mira la
   * pared), o −1 si no se acaba antes de `max`.
   */
  edgeDistance(feet: Vec3Like, nx: number, nz: number, dist: number, side: number, max: number): number {
    const tx = nz * side;
    const tz = -nx * side;
    for (let off = 0.15; off <= max + 1e-6; off += 0.15) {
      if (this.endsAt(feet, tx * off, tz * off, CHEST_Y, nx, nz, dist)) return off;
    }
    return -1;
  }

  /**
   * Rincón: delante, en la dirección del movimiento por la pared, otra pared que también cubre y que mira al jugador.
   * La escribe en `out`.
   */
  innerCorner(feet: Vec3Like, nx: number, nz: number, side: number, out: WallProbe): boolean {
    const tx = nz * side;
    const tz = -nx * side;
    if (!this.probe(feet, tx, tz, this.radius + 0.25, out)) return false;
    return out.nx * nx + out.nz * nz < 0.5;
  }

  /**
   * Plan para rodear la esquina exterior del lado `side`: dónde se acaba la pared (a la altura de los pies), que la
   * cara lateral también cubra y que haya sitio en el arco y al final. `dist` es la distancia actual a la pared.
   */
  planWrap(feet: Vec3Like, nx: number, nz: number, dist: number, side: number, out: WrapPlan): boolean {
    const tx = nz * side;
    const tz = -nx * side;
    // Dónde se acaba la pared: entre los pies (hay pared) y 0,9 m más allá.
    let a = 0;
    let b = 0.9;
    if (!this.endsAt(feet, tx * b, tz * b, LOW_Y, nx, nz, dist)) return false;
    for (let i = 0; i < 7; i++) {
      const m = (a + b) / 2;
      if (this.endsAt(feet, tx * m, tz * m, LOW_Y, nx, nz, dist)) b = m;
      else a = m;
    }
    const kx = feet.x - nx * dist + tx * b;
    const kz = feet.z - nz * dist + tz * b;
    const off = this.radius + COVER.gap;
    const back = this.radius + 0.14;
    const ex = kx + tx * off - nx * back;
    const ez = kz + tz * off - nz * back;
    // La cara lateral tiene que cubrir desde el final del recorrido.
    const p = this.p;
    const at = this.at;
    at.x = ex;
    at.y = feet.y;
    at.z = ez;
    if (!this.probe(at, -tx, -tz, COVER.probe, p) || p.dist > off + 0.2) return false;
    if (p.nx * tx + p.nz * tz < 0.8) return false;
    // Y tiene que ser una cara de verdad, no el canto de un muro fino: sigue a `WRAP_DEPTH` de la esquina.
    at.x = kx + tx * off - nx * WRAP_DEPTH;
    at.z = kz + tz * off - nz * WRAP_DEPTH;
    if (!this.ray(at.x, feet.y + LOW_Y, at.z, -tx, 0, -tz, off + 0.2)) return false;
    const y = this.groundAt(ex, ez, feet.y);
    if (y === null || !this.fits(ex, y, ez)) return false;
    // Sitio en mitad del arco.
    const mx = kx + off * Math.SQRT1_2 * (nx + tx);
    const mz = kz + off * Math.SQRT1_2 * (nz + tz);
    if (!this.fits(mx, feet.y, mz)) return false;
    out.x0 = feet.x;
    out.z0 = feet.z;
    out.y = feet.y;
    out.kx = kx;
    out.kz = kz;
    out.nx = nx;
    out.nz = nz;
    out.tx = tx;
    out.tz = tz;
    out.side = side;
    out.off = off;
    out.back = back;
    out.l1 = Math.hypot(kx + nx * off - feet.x, kz + nz * off - feet.z);
    out.arc = (off * Math.PI) / 2;
    out.total = out.l1 + out.arc + back;
    out.height = p.height;
    out.top = p.top;
    return true;
  }
}
