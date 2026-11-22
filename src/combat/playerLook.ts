import type { PlayerController } from '../entities/PlayerController';
import type { PlayerCombat } from './PlayerCombat';
import type { WeaponId } from './weapons';

/**
 * Lo que se ve de un jugador además de su movimiento (arma, apuntado, recarga, golpes), como objeto plano. Quien lo
 * simula lo calcula de su combate; quien lo dibuja en otro equipo lo recibe por la red y no necesita su combate
 * (fase 3 de docs/ESCALABILIDAD.md).
 */
export interface PlayerLook {
  weapon: WeaponId | 'none';
  /** Arma levantada (apuntando o recién disparada). */
  aim: boolean;
  /** Inclinación del apuntado (rad, + arriba). */
  aimPitch: number;
  /** Recarga 0..1, o −1 sin recarga. */
  reload: number;
  recoil: number;
  /** Forcejeo del takedown 0..1..0. */
  melee: number;
  /** Tajo del cuchillo 0..1, o −1 sin tajo. */
  slash: number;
  /** Tiempo del takedown en curso (s), o −1. */
  takedown: number;
  dead: boolean;
  /** Salud 0..1 (su etiqueta en pantalla). */
  health: number;
}

export function emptyPlayerLook(): PlayerLook {
  return { weapon: 'pistol', aim: false, aimPitch: 0, reload: -1, recoil: 0, melee: 0, slash: -1, takedown: -1, dead: false, health: 1 };
}

/** Rellena lo que se ve de un jugador a partir de su simulación (sin asignaciones). */
export function fillPlayerLook(out: PlayerLook, p: PlayerController, c: PlayerCombat): void {
  out.weapon = c.holstered ? 'none' : c.current;
  out.aim = !c.holstered && (p.aiming || c.weapon.cooldown > 0);
  out.aimPitch = c.aimPitch;
  out.reload = c.weapon.reloadProgress;
  out.recoil = c.recoilVis;
  out.melee = c.grab;
  out.slash = c.slashPhase;
  out.takedown = c.takedown ? c.takedown.t : -1;
  out.dead = c.dead;
  out.health = c.vitals.maxHealth > 0 ? c.vitals.health / c.vitals.maxHealth : 0;
}
