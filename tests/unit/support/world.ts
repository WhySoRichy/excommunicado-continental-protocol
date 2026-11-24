import { Vector3 } from 'three';
import { EnemyManager } from '../../../src/combat/EnemyManager';
import { Grenades } from '../../../src/combat/Grenades';
import { Pickups } from '../../../src/combat/Pickups';
import { PlayerCombat } from '../../../src/combat/PlayerCombat';
import { PlayerRoster, type PlayerSlot } from '../../../src/combat/PlayerRoster';
import { type CombatAudio, type CombatVfx, NO_VFX, SILENT_AUDIO } from '../../../src/combat/ports';
import type { GearId, WeaponId } from '../../../src/combat/weapons';
import { FIXED_DT } from '../../../src/core/Loop';
import { Rng } from '../../../src/core/rng';
import type { Enemy, PlayerTarget } from '../../../src/entities/Enemy';
import { PlayerController } from '../../../src/entities/PlayerController';
import { arena } from '../../../src/levels/data/arena';
import { buildLevelPhysics } from '../../../src/levels/levelPhysics';
import { NavGrid } from '../../../src/levels/nav/NavGrid';
import type { LevelData } from '../../../src/levels/types';
import { PhysicsWorld, type Rapier } from '../../../src/physics/Physics';

export interface WorldOptions {
  level?: LevelData;
  seed?: number;
  audio?: CombatAudio;
  /** Audio de los enemigos, si no es el mismo. */
  enemyAudio?: CombatAudio;
  vfx?: CombatVfx;
  /** Aparecen los enemigos del nivel. */
  initial?: boolean;
  onShot?: (enemy: Enemy, target: PlayerTarget, hit: boolean, damage: number) => void;
}

export interface JoinOptions {
  y?: number;
  yaw?: number;
  local?: boolean;
  loadout?: WeaponId[];
  gear?: GearId | null;
  /** Con los puertos del mundo (si no, sin vista ni audio propios). */
  ports?: boolean;
}

/**
 * El mundo de las pruebas sin pantalla: física, navegación, enemigos, granadas y jugadores, conectados como en la sesión
 * del juego, sin vista ni audio (salvo el que se pase).
 */
export function simWorld(R: Rapier, o: WorldOptions = {}) {
  const level = o.level ?? arena;
  const audio = o.audio ?? SILENT_AUDIO;
  const vfx = o.vfx ?? NO_VFX;
  const physics = new PhysicsWorld(R);
  buildLevelPhysics(level, physics);
  physics.step();
  const rng = new Rng(o.seed ?? 4);
  let shotAt: PlayerRoster['shotAt'] | null = null;
  const enemies = new EnemyManager({
    level,
    physics,
    nav: NavGrid.build(level),
    vfx,
    audio: o.enemyAudio ?? audio,
    rng,
    accuracyMult: 1,
    damageMult: 1,
    onShotAtPlayer: (enemy, target, hit, damage) => {
      o.onShot?.(enemy, target, hit, damage);
      shotAt?.(enemy, target, hit, damage);
    },
  });
  if (o.initial) enemies.spawnInitial();
  const grenades = new Grenades({ physics, enemies, civilians: null, vfx, audio });
  const roster = new PlayerRoster({ physics, enemies, civilians: null, vfx, audio, rng, pickups: new Pickups(), grenades });
  shotAt = (...a) => roster.shotAt(...a);
  const join = (x: number, z: number, j: JoinOptions = {}): PlayerSlot => {
    return roster.add(new PlayerController(physics, new Vector3(x, (j.y ?? 0) + 0.02, z), j.yaw ?? 0), new PlayerCombat(new Set(), j.loadout, j.gear), {
      local: j.local ?? true,
      ...(j.ports ? { ports: { audio, vfx } } : {}),
    });
  };
  /** Un paso de todo: jugadores (con su intención), granadas, enemigos y física. */
  const step = (n = 1): void => {
    for (let i = 0; i < n; i++) {
      roster.step(FIXED_DT, true);
      grenades.fixedUpdate(FIXED_DT);
      roster.updateLooks();
      enemies.fixedUpdate(FIXED_DT, roster.updateTargets(FIXED_DT));
      physics.step();
    }
  };
  return { physics, rng, enemies, grenades, roster, join, step };
}
