import type { PlayerLook } from '../combat/playerLook';
import { FIXED_DT } from '../core/Loop';
import { clamp } from '../core/math';
import type { PlayerController } from './PlayerController';
import type { RigPose } from './rig/types';

/** Segundos que sigue en guardia después de lo último que hizo en combate. */
const GUARD_TIME = 5;
/** Sacudida al recibir daño: la de un rasguño, cuánto crece con la salud perdida y lo que tarda en pasar (1/s). */
const HURT_MIN = 0.3;
const HURT_GAIN = 2.6;
const HURT_DECAY = 3.4;

/**
 * Lo que el cuerpo de un jugador recuerda entre fotogramas: cuánto lleva sin combatir (para bajar el arma) y la sacudida
 * del último golpe. Solo es de la vista: la simulación no lo necesita.
 */
export class PlayerBody {
  private guard = 0;
  private health = Number.NaN;
  private hurt = 0;

  /** `threat`: hay enemigos peleando. Los golpes se notan en lo que baja su salud, así vale también para quien llega por la red. */
  update(pose: RigPose, p: PlayerController, look: PlayerLook, threat: boolean, dt: number): void {
    const busy =
      threat || look.aim || look.recoil > 0.05 || look.throw >= 0 || look.slash >= 0 || look.takedown >= 0 || p.state === 'cover' || p.posture === 'crouch';
    this.guard = busy ? GUARD_TIME : Math.max(0, this.guard - dt);
    pose.ready = this.guard > 0 ? 1 : 0;
    const lost = this.health - look.health;
    this.health = look.health;
    if (lost > 0.002 && !look.dead) {
      this.hurt = Math.max(this.hurt, clamp(HURT_MIN + lost * HURT_GAIN, 0, 1));
      pose.flinchSide = -pose.flinchSide || 1;
    }
    this.hurt = Math.max(0, this.hurt - HURT_DECAY * dt);
    pose.flinch = this.hurt * this.hurt;
  }
}

/** Lo que se ve de un jugador, en su postura: su movimiento y lo que hace (`look`). Vale para el local y para los demás. */
export function fillPlayerPose(pose: RigPose, p: PlayerController, look: PlayerLook, yaw: number): void {
  pose.speed = p.stepSpeed(FIXED_DT);
  const vx = p.feet.x - p.prevFeet.x;
  const vz = p.feet.z - p.prevFeet.z;
  pose.moveAngle = Math.hypot(vx, vz) > 1e-4 ? Math.atan2(-vx, -vz) - yaw : 0;
  pose.state = look.dead ? 'dead' : p.state;
  pose.posture = p.posture;
  pose.grounded = p.grounded;
  pose.aim = look.aim ? 1 : 0;
  pose.aimPitch = look.aimPitch;
  pose.stateTime = p.stateTime;
  pose.reload = look.reload;
  pose.recoil = look.recoil;
  pose.melee = look.melee;
  pose.slash = look.slash;
  pose.takedown = look.takedown;
  pose.throw = look.throw;
  pose.vault = p.vaultProgress;
  pose.blind = look.blind;
  pose.peek = p.peekAmount;
  const c = p.state === 'cover' ? p.cover : null;
  pose.cover = c ? c.height : 'none';
  pose.coverBack = c !== null;
  pose.coverSide = c ? c.edgeNear : 0;
  pose.brace = c ? c.impact : 0;
  pose.coverTop = c ? c.top : 1.2;
  pose.death = 1;
}
