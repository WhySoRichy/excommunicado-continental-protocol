import type { EnemyManager } from '../combat/EnemyManager';
import type { PlayerCombat } from '../combat/PlayerCombat';
import type { PlayerSlot } from '../combat/PlayerRoster';
import type { PlayerController } from '../entities/PlayerController';
import type { LevelData } from '../levels/types';
import type { Vec3Like } from '../physics/Physics';

/**
 * Puertos de los directores (misión y vestíbulo): lo que necesitan de la interfaz y del sonido. Los implementan `Hud`
 * y `AudioEngine`; los directores no importan ninguno de los dos. Ver docs/ESCALABILIDAD.md.
 */
export interface MissionHud {
  showToast(text: string, seconds?: number): void;
  setObjective(text: string): void;
  setZone(text: string): void;
  setCombatVisible(v: boolean): void;
}

/**
 * Lo que los directores necesitan de la partida: los datos del nivel y la simulación (jugador, combate, enemigos).
 * La `LevelSession` lo cumple, pero los directores no ven su escena ni su vista.
 */
export interface MissionWorld {
  readonly data: LevelData;
  readonly player: PlayerController;
  readonly combat: PlayerCombat;
  readonly enemies: EnemyManager;
  /** Todos los jugadores, si hay más de uno (los objetivos de alcanzar una zona cuentan con cualquiera). */
  readonly players?: readonly PlayerSlot[];
}

/** La alarma del Continental: el director decide cuándo suena; cómo se ve (luces rojas que laten) es cosa de la vista. */
export interface AlarmPort {
  set(on: boolean): void;
}

export interface MissionAudio {
  ui(kind: 'click' | 'coin' | 'error' | 'confirm'): void;
  alert(pos?: Vec3Like): void;
  siren(on: boolean): void;
}
