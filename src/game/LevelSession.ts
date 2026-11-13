import { type Scene, Vector3 } from 'three';
import type { AudioEngine } from '../audio/AudioEngine';
import { EnemyManager } from '../combat/EnemyManager';
import { Pickups } from '../combat/Pickups';
import { type CombatCtx, PlayerCombat } from '../combat/PlayerCombat';
import { loadoutFor, type UpgradeId } from '../combat/weapons';
import type { Rng } from '../core/rng';
import type { Enemy, PlayerTarget } from '../entities/Enemy';
import { CharacterRig, PLAYER_COLORS } from '../entities/CharacterRig';
import { CivilianManager } from '../entities/Civilian';
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
  readonly nav: NavGrid;
  readonly player: PlayerController;
  readonly playerRig: CharacterRig;
  readonly vfx: Vfx;
  readonly pickups: Pickups;
  readonly enemies: EnemyManager;
  readonly combat: PlayerCombat;
  readonly ctx: CombatCtx;
  readonly target: PlayerTarget;
  readonly npcs: Npc[] = [];
  readonly civilians: CivilianManager | null;
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
      rimStrength: 0.16,
      hair: 'long',
      beard: true,
      weapon: 'pistol',
    });
    this.playerRig.setShadows(deps.quality.shadows);
    scene.add(this.playerRig.root);
    this.vfx = new Vfx(scene, deps.quality.particles);
    this.pickups = new Pickups(scene);
    for (const p of data.pickups) this.pickups.add(p.kind, new Vector3(p.pos[0], p.pos[1], p.pos[2]));
    this.combat = new PlayerCombat(deps.upgrades, loadoutFor(deps.upgrades));
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
      onEnemyAlert: (e) => deps.onEnemyAlert?.(e),
    });
    this.civilians = data.civilians.length > 0 ? new CivilianManager(data.civilians, this.physics, this.nav, scene, deps.rng) : null;
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
    for (const it of data.interactables) {
      if (it.kind !== 'npc') continue;
      const look = NPC_LOOKS[it.id as keyof typeof NPC_LOOKS];
      if (!look) continue;
      const box = data.boxes.find((b) => b.tag === `npc:${it.id}`);
      const yaw = box?.rotY ?? npcYawTowardRoom(it);
      this.npcs.push(new Npc({ id: it.id, pos: new Vector3(it.pos[0], it.pos[1], it.pos[2]), yaw, ...look }, scene));
    }
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
    this.civilians?.dispose();
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

/** Un NPC detrás de un mostrador mira hacia el centro de la sala. */
function npcYawTowardRoom(it: InteractableDef): number {
  return Math.atan2(-(0 - it.pos[0]), -(0 - it.pos[2]));
}
