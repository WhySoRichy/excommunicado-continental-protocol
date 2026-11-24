import { Vector3 } from 'three';
import { clamp } from '../core/math';
import type { CivilianManager } from '../entities/Civilian';
import { createRayHit, type PhysicsWorld, QueryGroups, type Vec3Like } from '../physics/Physics';
import type { EnemyManager } from './EnemyManager';
import type { CombatAudio, CombatVfx } from './ports';
import { GEAR, type GearId } from './weapons';

/** Vuelo de una granada (m, s, rad). La gravedad es mayor que la real: el arco se lee mejor y cae antes. */
export const FLIGHT = {
  radius: 0.05,
  gravity: 13,
  speed: 14.5,
  /** Lo que se levanta el lanzamiento respecto a la mirada. */
  lift: 0.27,
  /** A esta distancia por delante del jugador, el arco pasa por el centro de la mira. */
  converge: 12,
  /** Velocidad que conserva al rebotar: contra la superficie y a lo largo de ella. */
  bounce: 0.3,
  grip: 0.45,
  /** Con un golpe más flojo que este (m/s) no rebota: rueda, se frena (1/s) y se para. */
  settle: 0.9,
  roll: 4,
  rest: 0.25,
} as const;

/** La aturdidora: hasta dónde alcanza, cuánto aturde según la distancia y la postura y a qué distancia se oye. */
export const STUN = {
  radius: 9,
  /** Segundos aturdido pegado a ella y en el borde. */
  near: 4.6,
  far: 2.4,
  /** A quien le pilla de espaldas, el destello le afecta menos. */
  backMult: 0.6,
  noise: 26,
} as const;

/**
 * Segundos que aturde a esa distancia (m) a quien mira hacia ella (`facing`: 1 de frente, −1 de espaldas). Fuera del
 * radio, nada.
 */
export function stunSeconds(distance: number, facing: number): number {
  if (distance > STUN.radius) return 0;
  const k = clamp(distance / STUN.radius, 0, 1);
  return (STUN.near + (STUN.far - STUN.near) * k) * (facing < -0.2 ? STUN.backMult : 1);
}

/** Lo que vuela: posición y velocidad. Parada, deja de simularse. */
export interface GrenadeBody {
  readonly pos: Vector3;
  readonly vel: Vector3;
  resting: boolean;
}

export interface Grenade extends GrenadeBody {
  /** Id de red: único en la partida. */
  readonly id: number;
  readonly kind: GearId;
  /** Plaza de quien la lanzó. */
  readonly owner: number;
  /** Posición del paso anterior (para dibujarla entre pasos). */
  readonly prev: Vector3;
  fuse: number;
  /** Réplica de una del anfitrión (un invitado solo la dibuja). */
  readonly replica: boolean;
}

/** Lo que las granadas necesitan de la partida. */
export interface GrenadeWorld {
  physics: PhysicsWorld;
  enemies: EnemyManager;
  civilians: CivilianManager | null;
  vfx: CombatVfx;
  audio: CombatAudio;
}

const DOWN: Vec3Like = { x: 0, y: -1, z: 0 };
/** Por debajo de esta velocidad de golpe (m/s) el rebote no suena. */
const QUIET = 1.2;
/** Más abajo que esto ya se cayó del nivel: se retira sin estallar. */
const LOST_Y = -60;
/** El destello se mide algo por encima del suelo: si no, el propio bordillo lo taparía. */
const BURST_RISE = 0.15;
/** Margen del redondeo al contar los pasos de la mecha: el arco y la granada cuentan los mismos. */
const FUSE_EPS = 1e-5;

const hit = createRayHit();
const _dir = new Vector3();
const _n = new Vector3();
const _at = new Vector3();
const _pt = new Vector3();

/** Velocidad de un lanzamiento desde la mano (`from`) hacia donde se mira: pasa por la mira a media distancia. */
export function throwVelocity(from: Vec3Like, aimFrom: Vec3Like, aimDir: Vec3Like, out: Vector3): Vector3 {
  const depth = Math.max(0, (from.x - aimFrom.x) * aimDir.x + (from.y - aimFrom.y) * aimDir.y + (from.z - aimFrom.z) * aimDir.z) + FLIGHT.converge;
  let dx = aimFrom.x + aimDir.x * depth - from.x;
  let dz = aimFrom.z + aimDir.z * depth - from.z;
  const flat = Math.hypot(dx, dz);
  if (flat < 1e-3) {
    dx = aimDir.x;
    dz = aimDir.z;
  }
  const l = Math.hypot(dx, dz) || 1;
  const pitch = clamp(Math.asin(clamp(aimDir.y, -1, 1)) + FLIGHT.lift, -1.2, 1.35);
  const h = Math.cos(pitch) * FLIGHT.speed;
  return out.set((dx / l) * h, Math.sin(pitch) * FLIGHT.speed, (dz / l) * h);
}

/**
 * Un paso de vuelo: gravedad, rebotes contra el escenario y rodadura por el suelo. Devuelve la velocidad del golpe
 * (m/s) si tocó algo en este paso, o 0. Es determinista: la vista previa del arco usa este mismo paso.
 */
export function stepGrenade(g: GrenadeBody, dt: number, physics: PhysicsWorld): number {
  if (g.resting) return 0;
  const { pos, vel } = g;
  const R = FLIGHT.radius;
  let impact = 0;
  vel.y -= FLIGHT.gravity * dt;
  let left = dt;
  // Como mucho tres tramos por paso (un rincón son dos rebotes).
  for (let i = 0; i < 3 && left > 1e-6; i++) {
    const speed = vel.length();
    if (speed < 1e-4) break;
    _dir.copy(vel).multiplyScalar(1 / speed);
    const travel = speed * left;
    if (!physics.raycast(pos, _dir, travel + R, QueryGroups.STATIC, hit)) {
      pos.addScaledVector(_dir, travel);
      break;
    }
    _n.set(hit.normal.x, hit.normal.y, hit.normal.z);
    const vn = vel.dot(_n);
    // Se aleja de la superficie (o empezó dentro de ella): sigue su camino.
    if (vn >= -1e-6) {
      pos.addScaledVector(_dir, travel);
      break;
    }
    // Hasta que su superficie toca: el centro se queda a un radio de la pared.
    const free = Math.max(0, hit.distance - R / Math.max(0.2, -vn / speed));
    if (free >= travel) {
      pos.addScaledVector(_dir, travel);
      break;
    }
    pos.addScaledVector(_dir, free);
    left -= free / speed;
    impact = Math.max(impact, -vn);
    bounce(vel, _n, vn);
  }
  // Suelo: se mira siempre hacia abajo (rodando, la velocidad casi no baja y el rayo del recorrido no lo vería).
  if (vel.y < 0.6 && physics.raycast(pos, DOWN, R + 0.02, QueryGroups.STATIC, hit) && hit.normal.y > 0.5) {
    pos.y = hit.point.y + R;
    if (vel.y < -FLIGHT.settle) {
      impact = Math.max(impact, -vel.y);
      bounce(vel, _n.set(0, 1, 0), vel.y);
    } else {
      vel.y = 0;
      const k = Math.exp(-FLIGHT.roll * dt);
      vel.x *= k;
      vel.z *= k;
      if (Math.hypot(vel.x, vel.z) < FLIGHT.rest) {
        vel.set(0, 0, 0);
        g.resting = true;
      }
    }
  }
  return impact;
}

/** Rebote contra una superficie de normal `n` con velocidad `vn` (negativa) contra ella. */
function bounce(vel: Vector3, n: Vector3, vn: number): void {
  const e = -vn > FLIGHT.settle ? FLIGHT.bounce : 0;
  // Lo que va a lo largo de la superficie se frena; lo que va contra ella, vuelve.
  vel
    .addScaledVector(n, -vn)
    .multiplyScalar(FLIGHT.grip)
    .addScaledVector(n, -vn * e);
}

const ghost = { pos: new Vector3(), vel: new Vector3(), resting: false };

/**
 * El recorrido que haría un lanzamiento hasta estallar: rellena `out` con un punto cada `every` pasos y devuelve cuántos
 * puso; el último es donde estalla.
 */
export function simulateThrow(physics: PhysicsWorld, from: Vec3Like, vel: Vec3Like, fuse: number, dt: number, every: number, out: Vector3[]): number {
  ghost.pos.set(from.x, from.y, from.z);
  ghost.vel.set(vel.x, vel.y, vel.z);
  ghost.resting = false;
  let n = 0;
  const steps = Math.ceil(fuse / dt - FUSE_EPS);
  for (let i = 1; i <= steps; i++) {
    stepGrenade(ghost, dt, physics);
    if ((i % every === 0 || i === steps) && n < out.length) out[n++]!.copy(ghost.pos);
    if (ghost.resting) break;
  }
  if (n > 0) out[n - 1]!.copy(ghost.pos);
  return n;
}

/**
 * Las granadas en juego, solo simulación: vuelan, rebotan y estallan. La vista (`GrenadeViews`) lee esta lista. En un
 * invitado (`authority` = false) las suyas vuelan solo para verse al lanzarlas y las de los demás son réplicas: el
 * estallido y a quién aturde lo decide el anfitrión.
 */
export class Grenades {
  private readonly list: Grenade[] = [];
  private nextId = 1;
  authority = true;
  /** Estalló una: quién la lanzó y a cuántos aturdió. */
  onBurst: ((owner: number, stunned: number) => void) | null = null;

  constructor(private readonly w: GrenadeWorld) {}

  get items(): readonly Grenade[] {
    return this.list;
  }

  /** Sale de la mano: `vel` en m/s. */
  throw(kind: GearId, owner: number, from: Vec3Like, vel: Vec3Like): Grenade {
    const g = this.make(this.nextId++, kind, owner, from, false);
    g.vel.set(vel.x, vel.y, vel.z);
    g.fuse = GEAR[kind].fuse;
    return g;
  }

  private make(id: number, kind: GearId, owner: number, at: Vec3Like, replica: boolean): Grenade {
    const pos = new Vector3(at.x, at.y, at.z);
    const g: Grenade = { id, kind, owner, pos, prev: pos.clone(), vel: new Vector3(), fuse: 0, resting: false, replica };
    this.list.push(g);
    return g;
  }

  fixedUpdate(dt: number): void {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const g = this.list[i]!;
      if (g.replica) continue;
      g.prev.copy(g.pos);
      const impact = stepGrenade(g, dt, this.w.physics);
      // En un invitado, los rebotes se oyen cuando llegan del anfitrión (los suyos, si no, sonarían dos veces).
      if (impact > QUIET && this.authority) this.w.audio.grenade('bounce', g.pos);
      g.fuse -= dt;
      const lost = g.pos.y < LOST_Y;
      if (g.fuse > FUSE_EPS && !lost) continue;
      this.list.splice(i, 1);
      if (this.authority && !lost) this.burst(g);
    }
  }

  /** Estalla: destello y estampido para todos; aturde a los enemigos que la ven y la oyen los demás. */
  private burst(g: Grenade): void {
    _at.copy(g.pos);
    _at.y += BURST_RISE;
    const w = this.w;
    w.vfx.burst(_at);
    w.audio.grenade('burst', _at);
    const stunned = w.enemies.stunBlast(_at);
    w.enemies.noise(_at, STUN.noise);
    w.civilians?.noise(_at, STUN.noise);
    this.onBurst?.(g.owner, stunned);
  }

  /**
   * Réplicas (fase 3): deja las del anfitrión como llegan. Las propias (`localId`) no: en este equipo ya vuelan desde
   * que salieron de la mano.
   */
  applyNet(items: ReadonlyArray<{ id: number; kind: GearId; owner: number; x: number; y: number; z: number }>, localId: number): void {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const g = this.list[i]!;
      if (g.replica && !items.some((it) => it.id === g.id)) this.list.splice(i, 1);
    }
    for (const it of items) {
      if (it.owner === localId) continue;
      const g = this.list.find((x) => x.replica && x.id === it.id) ?? this.make(it.id, it.kind, it.owner, it, true);
      g.prev.copy(g.pos);
      g.pos.copy(_pt.set(it.x, it.y, it.z));
    }
  }

  /** Las quita todas sin estallar (reaparición, cambio de nivel). */
  clear(): void {
    this.list.length = 0;
  }
}
