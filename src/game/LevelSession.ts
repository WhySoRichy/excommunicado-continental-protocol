import { type Scene, Vector3 } from 'three';
import type { AudioEngine } from '../audio/AudioEngine';
import { EnemyManager } from '../combat/EnemyManager';
import { EnemyViews } from '../entities/EnemyView';
import { Pickups } from '../combat/Pickups';
import { makePlayerTarget, updatePlayerTarget } from '../combat/playerTarget';
import { LevelAlarm } from '../render/LevelAlarm';
import { PickupViews } from '../render/PickupViews';
import { type CombatCtx, PlayerCombat } from '../combat/PlayerCombat';
import { loadoutFor, type UpgradeId } from '../combat/weapons';
import type { Rng } from '../core/rng';
import type { Enemy, PlayerTarget } from '../entities/Enemy';
import { CharacterRig, PLAYER_LOOK } from '../entities/CharacterRig';
import { CivilianManager } from '../entities/Civilian';
import { CivilianViews } from '../entities/CivilianView';
import { Npc, NPC_LOOKS } from '../entities/Npc';
import { PlayerController } from '../entities/PlayerController';
import { buildLevel, type LevelRuntime } from '../levels/LevelBuilder';
import { NavGrid } from '../levels/nav/NavGrid';
import type { InteractableDef, LevelData } from '../levels/types';
import { PhysicsWorld, type Rapier } from '../physics/Physics';
import type { QualitySettings } from '../render/Renderer';
import { Vfx } from '../render/vfx';
import type { CameraRig } from './CameraRig';

export interface SessionDeps {
  R: Rapier;
  scene: Scene;
  quality: QualitySettings;
  audio: AudioEngine;
  rng: Rng;
  camera: CameraRig;
  upgrades: ReadonlySet<UpgradeId>;
  accuracyMult: number;
  damageMult: number;
  /** Un enemigo dio la voz de alarma (misiones con panel de alarma). */
  onEnemyAlert?(e: Enemy): void;
  /** Un civil fue herido o abatido por el jugador. */
  onCivilianHurt?(killed: boolean): void;
}

/**
 * Todo lo que vive mientras un nivel está cargado. Se crea entero al entrar y se
 * libera entero al salir (mundo Rapier nuevo por nivel: sin fugas ni colliders viejos).
 */
export class LevelSession {
  readonly physics: PhysicsWorld;
  readonly level: LevelRuntime;
  /** Cómo se ve la alarma del Continental (la activa el director del vestíbulo por su puerto). */
  readonly alarm: LevelAlarm;
  readonly nav: NavGrid;
  readonly player: PlayerController;
  readonly playerRig: CharacterRig;
  readonly vfx: Vfx;
  readonly pickups: Pickups;
  /** Lo que se ve de los objetos recogibles; `pickups` no sabe que existe. */
  readonly pickupViews: PickupViews;
  readonly enemies: EnemyManager;
  /** Lo que se ve de los enemigos; la simulación (`enemies`) no sabe que existe. */
  readonly enemyViews: EnemyViews;
  readonly combat: PlayerCombat;
  readonly ctx: CombatCtx;
  readonly target: PlayerTarget;
  /** Un objetivo por jugador, en el orden de sus plazas (los enemigos eligen entre ellos). */
  readonly targets: readonly PlayerTarget[];
  readonly npcs: Npc[] = [];
  readonly civilians: CivilianManager | null;
  /** Lo que se ve de los civiles; la simulación (`civilians`) no sabe que existe. */
  readonly civilianViews: CivilianViews | null;
  /** God mode de debug (el daño se ignora). */
  god = false;
  infiniteAmmo = false;

  constructor(
    readonly data: LevelData,
    private readonly deps: SessionDeps,
  ) {
    const scene = deps.scene;
    this.physics = new PhysicsWorld(deps.R);
    this.level = buildLevel(data, scene, this.physics, { shadowMapSize: deps.quality.shadowMapSize });
    this.alarm = new LevelAlarm(this.level);
    this.physics.step();
    this.nav = NavGrid.build(data);
    const s = data.spawn.pos;
    this.player = new PlayerController(this.physics, new Vector3(s[0], s[1] + 0.02, s[2]), data.spawn.yaw);
    this.player.killY = data.killY;
    this.playerRig = new CharacterRig('player', PLAYER_LOOK);

    scene.add(this.playerRig.root);
    this.vfx = new Vfx(scene, deps.quality.particles);
    this.pickups = new Pickups();
    this.pickupViews = new PickupViews(scene);
    for (const p of data.pickups) this.pickups.add(p.kind, new Vector3(p.pos[0], p.pos[1], p.pos[2]));
    this.combat = new PlayerCombat(deps.upgrades, loadoutFor(deps.upgrades));
    this.enemies = new EnemyManager({
      level: data,
      physics: this.physics,
      nav: this.nav,
      vfx: this.vfx,
      audio: deps.audio,
      rng: deps.rng,
      accuracyMult: deps.accuracyMult,
      damageMult: deps.damageMult,
      onShotAtPlayer: (enemy, _target, hit, dmg) => {
        if (hit && !this.god) this.combat.takeHit(enemy, dmg, this.ctx);
      },
      onEnemyAlert: (e) => deps.onEnemyAlert?.(e),
    });
    this.civilians = data.civilians.length > 0 ? new CivilianManager(data.civilians, this.physics, this.nav, deps.rng) : null;
    this.civilianViews = this.civilians ? new CivilianViews(this.civilians.list, scene) : null;
    if (this.civilians) this.civilians.onHurt = (_c, killed) => deps.onCivilianHurt?.(killed);
    this.ctx = {
      physics: this.physics,
      camera: deps.camera,
      player: this.player,
      enemies: this.enemies,
      civilians: this.civilians,
      vfx: this.vfx,
      audio: deps.audio,
      rng: deps.rng,
      pickups: this.pickups,
    };
    this.target = makePlayerTarget(0, this.player);
    this.targets = [this.target];
    for (const it of data.interactables) {
      if (it.kind !== 'npc') continue;
      const look = NPC_LOOKS[it.id as keyof typeof NPC_LOOKS];
      if (!look) continue;
      const box = data.boxes.find((b) => b.tag === `npc:${it.id}`);
      const yaw = box?.rotY ?? npcYawTowardRoom(it);
      this.npcs.push(new Npc({ id: it.id, pos: new Vector3(it.pos[0], it.pos[1], it.pos[2]), yaw, ...look }, scene));
    }
    this.enemies.spawnInitial();
    // Vistas creadas ya, antes de precompilar los shaders del nivel (no en mitad de la partida).
    this.enemyViews = new EnemyViews(scene);
    this.enemyViews.sync(this.enemies.enemies);
    this.physics.step();
  }

  /** Actualiza la instantánea de cada jugador que leen los enemigos (sin asignaciones). Hoy, solo el local. */
  updateTargets(dt: number): readonly PlayerTarget[] {
    updatePlayerTarget(this.target, this.player, this.combat, dt, this.god);
    return this.targets;
  }

  /** Interactivo más cercano al alcance y delante del jugador (según el yaw de la cámara). */
  nearestInteractable(camYaw: number, used?: ReadonlySet<string>): InteractableDef | null {
    const f = this.player.feet;
    const fx = -Math.sin(camYaw);
    const fz = -Math.cos(camYaw);
    let best: InteractableDef | null = null;
    let bestD = Number.POSITIVE_INFINITY;
    for (const it of this.data.interactables) {
      if (used?.has(it.id)) continue;
      const dx = it.pos[0] - f.x;
      const dz = it.pos[2] - f.z;
      const d = Math.hypot(dx, dz);
      if (d > it.radius || Math.abs(it.pos[1] - f.y) > 1.5) continue;
      // Hay que mirar hacia el objeto (salvo que esté encima).
      if (d > 0.8 && (dx * fx + dz * fz) / d < 0.2) continue;
      if (d < bestD) {
        bestD = d;
        best = it;
      }
    }
    return best;
  }

  renderNpcs(dt: number): void {
    for (const n of this.npcs) n.update(dt, this.player.feet);
  }

  respawnAt(feet: Vector3, yaw: number): void {
    this.player.revive(feet, yaw);
    this.physics.step();
  }

  dispose(): void {
    for (const n of this.npcs) n.dispose();
    this.civilianViews?.dispose();
    this.civilians?.dispose();
    this.enemyViews.dispose();
    this.enemies.dispose();
    this.pickupViews.dispose();
    this.pickups.dispose();
    this.vfx.dispose();
    this.playerRig.dispose();
    this.player.dispose();
    this.level.dispose();
    this.physics.dispose();
    void this.deps;
  }
}

/** Un NPC detrás de un mostrador mira hacia el centro de la sala. */
function npcYawTowardRoom(it: InteractableDef): number {
  return Math.atan2(-(0 - it.pos[0]), -(0 - it.pos[2]));
}
