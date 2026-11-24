import type { PlayerLook } from '../combat/playerLook';
import { angleDelta, clamp, lerp } from '../core/math';
import type { CivilianNet } from '../entities/Civilian';
import type { EnemyNet } from '../entities/Enemy';
import { emptyCoverNet, type MoveNet } from '../entities/PlayerController';
import { SNAPSHOT_TICKS } from './protocol';

/**
 * Interpolación del invitado (fase 3 de docs/ESCALABILIDAD.md). Lo que llega del anfitrión se dibuja con un pequeño
 * retraso, entre las dos instantáneas que rodean al instante en pantalla: así el movimiento es continuo aunque lleguen
 * 20 por segundo, con variación y alguna perdida.
 */

/** Retraso de la pantalla respecto a la última instantánea (pasos): dos instantáneas, 100 ms. */
export const INTERP_DELAY = 2 * SNAPSHOT_TICKS;
/** Si la pantalla se aleja más que esto del retraso buscado, salta en vez de ajustarse poco a poco. */
const SNAP_ERROR = 30;
/** Cuánto puede acelerar o frenar la pantalla para recuperar el retraso buscado (sin que se note). */
const MAX_RATE_ADJUST = 0.08;

/**
 * El instante de la partida del anfitrión que tiene en pantalla el invitado (pasos con decimales). Avanza a su ritmo,
 * un paso por paso del invitado, y se acelera o frena un poco para mantener el retraso buscado respecto a la última
 * instantánea recibida.
 */
export class SnapshotClock {
  /** Instante en pantalla (−1 hasta la primera instantánea). */
  tick = -1;
  private newest = -1;

  received(tick: number): void {
    if (tick > this.newest) this.newest = tick;
    if (this.tick < 0) this.tick = tick - INTERP_DELAY;
  }

  /** Un paso del invitado. */
  advance(): void {
    if (this.tick < 0) return;
    const err = this.newest - INTERP_DELAY - this.tick;
    if (Math.abs(err) > SNAP_ERROR) this.tick = this.newest - INTERP_DELAY;
    else this.tick += 1 + clamp(err * 0.05, -MAX_RATE_ADJUST, MAX_RATE_ADJUST);
  }

  reset(): void {
    this.tick = -1;
    this.newest = -1;
  }
}

export function lerpMove(a: MoveNet, b: MoveNet, t: number, out: MoveNet): MoveNet {
  out.x = lerp(a.x, b.x, t);
  out.y = lerp(a.y, b.y, t);
  out.z = lerp(a.z, b.z, t);
  out.yaw = a.yaw + angleDelta(a.yaw, b.yaw) * t;
  // Lo discreto, del instante anterior; el tiempo en el estado sigue corriendo si el estado no cambia.
  out.state = a.state;
  out.posture = a.posture;
  out.grounded = a.grounded;
  out.stateTime = a.state === b.state ? lerp(a.stateTime, b.stateTime, t) : a.stateTime;
  out.aiming = a.aiming;
  out.sprinting = a.sprinting;
  out.invulnerable = a.invulnerable;
  out.vault = a.vault >= 0 && b.vault >= 0 ? lerp(a.vault, b.vault, t) : a.vault;
  out.dodges = a.dodges;
  if (a.cover) {
    const c = (out.cover ??= emptyCoverNet());
    c.nx = a.cover.nx;
    c.nz = a.cover.nz;
    c.height = a.cover.height;
    c.peekSide = a.cover.peekSide;
    c.peekOffset = b.cover ? lerp(a.cover.peekOffset, b.cover.peekOffset, t) : a.cover.peekOffset;
    c.edgeNear = a.cover.edgeNear;
    c.top = a.cover.top;
    c.impact = a.cover.impact;
  } else out.cover = null;
  return out;
}

export function lerpEnemy(a: EnemyNet, b: EnemyNet, t: number, out: EnemyNet): EnemyNet {
  out.uid = a.uid;
  out.type = a.type;
  lerpMove(a.move, b.move, t, out.move);
  out.ai = a.ai;
  out.aim = a.aim;
  out.health = a.health;
  out.alive = a.alive;
  out.hitFlash = lerp(a.hitFlash, b.hitFlash, t);
  out.recoilVis = lerp(a.recoilVis, b.recoilVis, t);
  out.flinch = lerp(a.flinch, b.flinch, t);
  out.flinchSide = a.flinchSide;
  out.flinchFront = a.flinchFront;
  out.hitPart = a.hitPart;
  out.stagger = lerp(a.stagger, b.stagger, t);
  out.limp = a.limp;
  out.reload = a.reload >= 0 && b.reload >= 0 ? lerp(a.reload, b.reload, t) : a.reload;
  out.hidden = a.hidden;
  out.lunge = a.lunge >= 0 && b.lunge >= 0 ? lerp(a.lunge, b.lunge, t) : a.lunge;
  out.shieldUp = a.shieldUp;
  out.shieldBroken = a.shieldBroken;
  out.deathStyle = a.deathStyle;
  out.deathFallStart = a.deathFallStart;
  out.thrownT = a.thrownT >= 0 && b.thrownT >= 0 ? lerp(a.thrownT, b.thrownT, t) : a.thrownT;
  out.targetRise = a.targetRise;
  out.icon = a.icon;
  out.detection = lerp(a.detection, b.detection, t);
  out.telegraph = lerp(a.telegraph, b.telegraph, t);
  out.hasLook = a.hasLook;
  out.lookX = lerp(a.lookX, b.lookX, t);
  out.lookY = lerp(a.lookY, b.lookY, t);
  out.lookZ = lerp(a.lookZ, b.lookZ, t);
  out.telegraphX = lerp(a.telegraphX, b.telegraphX, t);
  out.telegraphY = lerp(a.telegraphY, b.telegraphY, t);
  out.telegraphZ = lerp(a.telegraphZ, b.telegraphZ, t);
  out.dazed = a.dazed;
  return out;
}

export function lerpCivilian(a: CivilianNet, b: CivilianNet, t: number, out: CivilianNet): CivilianNet {
  lerpMove(a.move, b.move, t, out.move);
  out.state = a.state;
  out.alive = a.alive;
  return out;
}

export function lerpLook(a: PlayerLook, b: PlayerLook, t: number, out: PlayerLook): PlayerLook {
  out.weapon = a.weapon;
  out.aim = a.aim;
  out.aimPitch = lerp(a.aimPitch, b.aimPitch, t);
  out.reload = a.reload >= 0 && b.reload >= 0 ? lerp(a.reload, b.reload, t) : a.reload;
  out.recoil = lerp(a.recoil, b.recoil, t);
  out.melee = lerp(a.melee, b.melee, t);
  out.slash = a.slash >= 0 && b.slash >= 0 ? lerp(a.slash, b.slash, t) : a.slash;
  out.takedown = a.takedown >= 0 && b.takedown >= 0 ? lerp(a.takedown, b.takedown, t) : a.takedown;
  out.throw = a.throw >= 0 && b.throw >= 0 ? lerp(a.throw, b.throw, t) : a.throw;
  out.blind = a.blind;
  out.dead = a.dead;
  out.health = lerp(a.health, b.health, t);
  return out;
}
