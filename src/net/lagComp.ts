import type { Collider } from '@dimforge/rapier3d-compat';
import { clamp } from '../core/math';
import type { Civilian } from '../entities/Civilian';
import type { Enemy } from '../entities/Enemy';
import { PLAYER_RADIUS, type PlayerController } from '../entities/PlayerController';
import { type PhysicsWorld, QueryGroups, type RayHit, type Vec3Like } from '../physics/Physics';

/**
 * Compensación de latencia (fase 3 de docs/ESCALABILIDAD.md). Un invitado dispara a lo que ve, que es la partida de
 * hace un instante (lo que tarda en llegarle más la interpolación). El anfitrión guarda dónde estuvo cada personaje al
 * que se puede disparar en los últimos pasos y resuelve el disparo de cada invitado contra ese pasado: si en su
 * pantalla le dio, le dio.
 *
 * El rebobinado no mueve los cuerpos de la física (sus consultas usan el árbol que refresca `world.step()`): el
 * escenario se consulta a la física y los personajes se prueban a mano, cápsula a cápsula, en su posición de entonces.
 */

/** Pasos que se puede rebobinar como mucho: medio segundo. Más atrás sería disparar a fantasmas. */
export const MAX_REWIND = 30;
const HISTORY = MAX_REWIND + 4;

interface Sample {
  collider: Collider;
  x: number;
  y: number;
  z: number;
  height: number;
  alive: boolean;
}

interface Frame {
  tick: number;
  n: number;
  samples: Sample[];
}

/** Un cuerpo al que se puede disparar: enemigo o civil (los dos se mueven con un `PlayerController`). */
type Body = Pick<Enemy | Civilian, 'collider' | 'mover' | 'alive'>;

export class ShotHistory {
  private readonly ring: Frame[] = Array.from({ length: HISTORY }, () => ({ tick: -1, n: 0, samples: [] }));
  private head = -1;
  private readonly hitTmp: RayHit = { hit: false, distance: 0, point: { x: 0, y: 0, z: 0 }, normal: { x: 0, y: 1, z: 0 }, collider: null };

  /** Último paso guardado (−1 sin historial). */
  get latest(): number {
    return this.head < 0 ? -1 : this.ring[this.head]!.tick;
  }

  /** Guarda dónde está cada cuerpo al terminar el paso `tick` (sin asignaciones una vez llena). */
  record(tick: number, enemies: readonly Body[], civilians: readonly Body[] | null): void {
    this.head = (this.head + 1) % HISTORY;
    const f = this.ring[this.head]!;
    f.tick = tick;
    f.n = 0;
    const add = (b: Body): void => {
      const m = b.mover;
      let s = f.samples[f.n];
      if (!s) {
        s = { collider: b.collider, x: 0, y: 0, z: 0, height: 0, alive: false };
        f.samples.push(s);
      }
      s.collider = b.collider;
      s.x = m.feet.x;
      s.y = m.feet.y;
      s.z = m.feet.z;
      s.height = m.height;
      s.alive = b.alive;
      f.n++;
    };
    for (const e of enemies) add(e);
    if (civilians) for (const c of civilians) add(c);
  }

  /** Olvida el historial (nivel nuevo). */
  clear(): void {
    this.head = -1;
    for (const f of this.ring) {
      f.tick = -1;
      f.n = 0;
    }
  }

  /**
   * Rayo de un disparo tal como lo vio quien estaba en `view` (pasos con decimales): el escenario, ahora (no se mueve);
   * los personajes, donde estaban entonces. Los que ya han muerto desde entonces no cuentan: no se mata dos veces.
   */
  cast(physics: PhysicsWorld, view: number, origin: Vec3Like, dir: Vec3Like, range: number, out: RayHit, exclude: PlayerController): boolean {
    const wall = physics.raycast(origin, dir, range, QueryGroups.STATIC, this.hitTmp, exclude.collider);
    let best = wall ? this.hitTmp.distance : range;
    let bestSample: Sample | null = null;
    let bx = 0;
    let by = 0;
    let bz = 0;
    const latest = this.latest;
    if (latest >= 0) {
      const t = clamp(view, latest - MAX_REWIND, latest);
      const a = this.frameAt(Math.floor(t));
      const b = this.frameAt(Math.ceil(t));
      const k = a && b && b.tick > a.tick ? (t - a.tick) / (b.tick - a.tick) : 0;
      const base = a ?? b;
      if (base) {
        for (let i = 0; i < base.n; i++) {
          const s = base.samples[i]!;
          if (!s.alive || !s.collider.isEnabled()) continue;
          const o = b && b !== base ? findSample(b, s.collider) : null;
          const x = o ? s.x + (o.x - s.x) * k : s.x;
          const y = o ? s.y + (o.y - s.y) * k : s.y;
          const z = o ? s.z + (o.z - s.z) * k : s.z;
          const d = rayCapsule(origin, dir, x, y + PLAYER_RADIUS, z, s.height - 2 * PLAYER_RADIUS, PLAYER_RADIUS);
          if (d >= 0 && d < best) {
            best = d;
            bestSample = s;
            bx = x;
            by = y;
            bz = z;
          }
        }
      }
    }
    if (bestSample) {
      out.hit = true;
      out.distance = best;
      const px = origin.x + dir.x * best;
      const py = origin.y + dir.y * best;
      const pz = origin.z + dir.z * best;
      out.point.x = px;
      out.point.y = py;
      out.point.z = pz;
      // Normal de la cápsula en el punto (horizontal salvo en las tapas).
      const cy = clamp(py, by + PLAYER_RADIUS, by + bestSample.height - PLAYER_RADIUS);
      const nx = px - bx;
      const ny = py - cy;
      const nz = pz - bz;
      const nl = Math.hypot(nx, ny, nz) || 1;
      out.normal.x = nx / nl;
      out.normal.y = ny / nl;
      out.normal.z = nz / nl;
      out.collider = bestSample.collider;
      return true;
    }
    if (wall) {
      out.hit = true;
      out.distance = this.hitTmp.distance;
      out.point.x = this.hitTmp.point.x;
      out.point.y = this.hitTmp.point.y;
      out.point.z = this.hitTmp.point.z;
      out.normal.x = this.hitTmp.normal.x;
      out.normal.y = this.hitTmp.normal.y;
      out.normal.z = this.hitTmp.normal.z;
      out.collider = this.hitTmp.collider;
      return true;
    }
    out.hit = false;
    out.distance = range;
    out.collider = null;
    return false;
  }

  private frameAt(tick: number): Frame | null {
    for (const f of this.ring) if (f.tick === tick) return f;
    return null;
  }
}

function findSample(f: Frame, c: Collider): Sample | null {
  for (let i = 0; i < f.n; i++) if (f.samples[i]!.collider === c) return f.samples[i]!;
  return null;
}

/**
 * Distancia a la que un rayo (dirección unitaria) entra en una cápsula vertical: base de su segmento en (x, y, z),
 * segmento de `len` hacia arriba y radio `r`. 0 si el origen ya está dentro (como el raycast sólido de la física);
 * −1 si no la toca.
 */
export function rayCapsule(o: Vec3Like, d: Vec3Like, x: number, y: number, z: number, len: number, r: number): number {
  const oax = o.x - x;
  const oay = o.y - y;
  const oaz = o.z - z;
  // Dentro: el punto más cercano del eje está a menos del radio.
  const cy = clamp(oay, 0, len);
  if (oax * oax + (oay - cy) * (oay - cy) + oaz * oaz <= r * r) return 0;
  // Cuerpo cilíndrico (método de Íñigo Quílez con el eje vertical: ba = (0, len, 0)).
  const baba = len * len;
  const bard = len * d.y;
  const baoa = len * oay;
  const rdoa = d.x * oax + d.y * oay + d.z * oaz;
  const oaoa = oax * oax + oay * oay + oaz * oaz;
  const a = baba - bard * bard;
  let cap: number;
  if (a > 1e-9) {
    const b = baba * rdoa - baoa * bard;
    const c = baba * oaoa - baoa * baoa - r * r * baba;
    const h = b * b - a * c;
    if (h < 0) return -1;
    const t = (-b - Math.sqrt(h)) / a;
    const yy = baoa + t * bard;
    if (yy > 0 && yy < baba) return t >= 0 ? t : -1;
    cap = yy <= 0 ? 0 : len;
  } else {
    // Rayo paralelo al eje (o cápsula sin cuerpo, una esfera): entra por la tapa que tiene delante.
    cap = d.y > 0 ? 0 : len;
  }
  // Tapa: la semiesfera de abajo o la de arriba.
  const ocy = oay - cap;
  const b = d.x * oax + d.y * ocy + d.z * oaz;
  const c = oax * oax + ocy * ocy + oaz * oaz - r * r;
  const h = b * b - c;
  if (h <= 0) return -1;
  const t = -b - Math.sqrt(h);
  return t >= 0 ? t : -1;
}
