import { type Scene, Vector3 } from 'three';
import type { AudioEngine } from '../audio/AudioEngine';
import { EnemyManager } from '../combat/EnemyManager';
import { Pickups } from '../combat/Pickups';
import { type CombatCtx, PlayerCombat } from '../combat/PlayerCombat';
import type { UpgradeId, WeaponId } from '../combat/weapons';
import type { Rng } from '../core/rng';
import type { PlayerTarget } from '../entities/Enemy';
import { CharacterRig, PLAYER_COLORS } from '../entities/CharacterRig';
import { PlayerController } from '../entities/PlayerController';
import { buildLevel, type LevelRuntime } from '../levels/LevelBuilder';
import { NavGrid } from '../levels/nav/NavGrid';
import type { LevelData } from '../levels/types';
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
  loadout: WeaponId[];
  accuracyMult: number;
  damageMult: number;
}

/**
 * Todo lo que vive mientras un nivel está cargado. Se crea entero al entrar y se
 * libera entero al salir (mundo Rapier nuevo por nivel: sin fugas ni colliders viejos).
 */
export class LevelSession {
  readonly physics: PhysicsWorld;
  readonly level: LevelRuntime;
  readonly nav: NavGrid;
  readonly player: PlayerController;
  readonly playerRig: CharacterRig;
  readonly vfx: Vfx;
  readonly pickups: Pickups;
  readonly enemies: EnemyManager;
  readonly combat: PlayerCombat;
  readonly ctx: CombatCtx;
  readonly target: PlayerTarget;
  /** God mode de debug (el daño se ignora). */
  god = false;
  infiniteAmmo = false;

  constructor(
    readonly data: LevelData,
    private readonly deps: SessionDeps,
  ) {
    const scene = deps.scene;
    this.physics = new PhysicsWorld(deps.R);
    this.level = buildLevel(data, scene, this.physics, { shadows: deps.quality.shadows, shadowMapSize: deps.quality.shadowMapSize });
    this.physics.step();
    this.nav = NavGrid.build(data);
    const s = data.spawn.pos;
    this.player = new PlayerController(this.physics, new Vector3(s[0], s[1] + 0.02, s[2]), data.spawn.yaw);
    this.player.killY = data.killY;
    this.playerRig = new CharacterRig('player', {
      colors: PLAYER_COLORS,
      rimColor: 0xe8e2d0,
      rimStrength: 0.35,
      hair: 'long',
      weapon: 'pistol',
    });
    this.playerRig.setShadows(deps.quality.shadows);
    scene.add(this.playerRig.root);
    this.vfx = new Vfx(scene, deps.quality.particles);
    this.pickups = new Pickups(scene);
    for (const p of data.pickups) this.pickups.add(p.kind, new Vector3(p.pos[0], p.pos[1], p.pos[2]));
    this.combat = new PlayerCombat(deps.upgrades, deps.loadout);
    this.enemies = new EnemyManager({
      level: data,
      physics: this.physics,
      nav: this.nav,
      vfx: this.vfx,
      audio: deps.audio,
      rng: deps.rng,
      scene,
      accuracyMult: deps.accuracyMult,
      damageMult: deps.damageMult,
      onShotAtPlayer: (enemy, hit, dmg) => {
        if (hit && !this.god) this.combat.takeHit(enemy, dmg, this.ctx);
      },
    });
    this.ctx = {
      physics: this.physics,
      camera: deps.camera,
      player: this.player,
      enemies: this.enemies,
      vfx: this.vfx,
      audio: deps.audio,
      rng: deps.rng,
      pickups: this.pickups,
    };
    this.target = {
      feet: this.player.feet,
      head: new Vector3(),
      chest: new Vector3(),
      crouched: false,
      speed: 0,
      invulnerable: false,
      alive: true,
      collider: this.player.collider,
    };
    this.enemies.spawnInitial();
    this.physics.step();
  }

  /** Actualiza la instantánea del jugador que leen los enemigos (sin asignaciones). */
  updateTarget(dt: number): PlayerTarget {
    const p = this.player;
    const t = this.target;
    const crouch = p.posture === 'crouch';
    t.head.set(p.feet.x, p.feet.y + (crouch ? 1.0 : 1.6), p.feet.z);
    t.chest.set(p.feet.x, p.feet.y + (crouch ? 0.7 : 1.15), p.feet.z);
    t.crouched = crouch;
    t.speed = p.stepSpeed(dt);
    t.invulnerable = p.invulnerable || this.god;
    t.alive = !this.combat.dead;
    return t;
  }

  respawnAt(feet: Vector3, yaw: number): void {
    this.player.revive(feet, yaw);
    this.physics.step();
  }

  dispose(): void {
    this.enemies.dispose();
    this.pickups.dispose();
    this.vfx.dispose();
    this.playerRig.dispose();
    this.player.dispose();
    this.level.dispose();
    this.physics.dispose();
    void this.deps;
  }
}
