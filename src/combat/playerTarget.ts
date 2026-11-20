import { Vector3 } from 'three';
import type { PlayerTarget } from '../entities/Enemy';
import type { PlayerController } from '../entities/PlayerController';
import type { PlayerCombat } from './PlayerCombat';

/** El objetivo que ven los enemigos de un jugador; se rellena en cada paso con `updatePlayerTarget`. */
export function makePlayerTarget(id: number, player: PlayerController): PlayerTarget {
  return {
    id,
    feet: player.feet,
    head: new Vector3(),
    chest: new Vector3(),
    crouched: false,
    speed: 0,
    invulnerable: false,
    alive: true,
    collider: player.collider,
  };
}

/** Copia a su objetivo el estado del jugador que leen los enemigos (sin asignaciones). `god` = modo dios de QA. */
export function updatePlayerTarget(t: PlayerTarget, p: PlayerController, combat: PlayerCombat, dt: number, god = false): void {
  const crouch = p.posture === 'crouch';
  t.head.set(p.feet.x, p.feet.y + (crouch ? 1.0 : 1.6), p.feet.z);
  t.chest.set(p.feet.x, p.feet.y + (crouch ? 0.7 : 1.15), p.feet.z);
  t.crouched = crouch;
  t.speed = p.stepSpeed(dt);
  t.invulnerable = p.invulnerable || god;
  t.alive = !combat.dead;
}
