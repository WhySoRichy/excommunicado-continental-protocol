import { type Scene, Vector3 } from 'three';
import type { AudioEngine } from '../audio/AudioEngine';
import { EnemyManager } from '../combat/EnemyManager';
import { Grenades } from '../combat/Grenades';
import { EnemyViews } from '../entities/EnemyView';
import { Pickups } from '../combat/Pickups';
import { PlayerRoster, type PlayerSlot, type SlotPorts } from '../combat/PlayerRoster';
import type { CombatAudio, CombatVfx } from '../combat/ports';
import type { FxRecorder } from '../net/fx';
import type { HostWorld } from '../net/NetHost';
import type { GuestWorld } from '../net/NetGuest';
import { LevelAlarm } from '../render/LevelAlarm';
import { CoverMarker } from '../render/CoverMarker';
import { GrenadeViews } from '../render/GrenadeViews';
import { Rain } from '../render/Rain';
import { ThrowArc } from '../render/ThrowArc';
import { PickupViews } from '../render/PickupViews';
import { PlayerViews } from '../entities/PlayerViews';
import { type CombatCtx, PlayerCombat } from '../combat/PlayerCombat';
import { gearFor, type Loadout, loadoutFor, type UpgradeId } from '../combat/weapons';
import type { Rng } from '../core/rng';
import type { MoveNet } from '../entities/PlayerController';
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
  /** El equipo que lleva el jugador local (se sanea con sus mejoras). */
  loadout: Loadout;
  accuracyMult: number;
  damageMult: number;
  /** Un enemigo dio la voz de alarma (misiones con panel de alarma). */
  onEnemyAlert?(e: Enemy): void;
  /** Un civil fue herido o abatido por el jugador. */
  onCivilianHurt?(killed: boolean): void;
  /**
   * Partida en red (fase 3 de docs/ESCALABILIDAD.md). En el anfitrión, los efectos del mundo y del jugador local pasan
   * por el registro que se envía a los invitados. En un invitado, todo menos su jugador son réplicas: no aparecen
   * enemigos ni objetos propios, y su jugador tiene el id que le dio el anfitrión y su propia semilla de disparo.
   */
  net?: { role: 'host'; recorder: FxRecorder } | { role: 'guest'; localId: number; shotRng: Rng };
}

/**
 * Todo lo que vive mientras un nivel está cargado. Se crea entero al entrar y se
 * libera entero al salir (mundo Rapier nuevo por nivel: sin fugas ni colliders viejos).
 */
export class LevelSession implements HostWorld, GuestWorld {
  readonly physics: PhysicsWorld;
  /** Los puertos de verdad de este equipo (sonido y efectos), sin el registro de la red. */
  readonly ports: { vfx: CombatVfx; audio: CombatAudio };
  /** En un invitado: lo que no es su jugador llega del anfitrión (no se simula aquí). */
  readonly replica: boolean;
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
  readonly grenades: Grenades;
  /** Lo que se ve de las granadas; `grenades` no sabe que existe. */
  readonly grenadeViews: GrenadeViews;
  /** El arco de lo que se lanzaría. */
  readonly throwArc: ThrowArc;
  /** Lluvia, si el nivel la tiene. */
  readonly rain: Rain | null;
  /** Marca de la cobertura a la que iría C. */
  readonly coverMarker: CoverMarker;
  /** Lo que se ve de los jugadores que no son el local. */
  readonly playerViews: PlayerViews;
  readonly enemies: EnemyManager;
  /** Lo que se ve de los enemigos; la simulación (`enemies`) no sabe que existe. */
  readonly enemyViews: EnemyViews;
  readonly combat: PlayerCombat;
  readonly ctx: CombatCtx;
  readonly target: PlayerTarget;
  readonly npcs: Npc[] = [];
  readonly civilians: CivilianManager | null;
  /** Lo que se ve de los civiles; la simulación (`civilians`) no sabe que existe. */
  readonly civilianViews: CivilianViews | null;
  /** Los jugadores de la partida; el local es la plaza 0 (`player`, `combat`, `target` y `ctx` son los suyos). */
  readonly roster: PlayerRoster;
  readonly local: PlayerSlot;
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
    this.ports = { vfx: this.vfx, audio: deps.audio };
    const net = deps.net;
    this.replica = net?.role === 'guest';
    // En el anfitrión, lo que pasa en el mundo se apunta para los invitados (autor −1: el mundo).
    const world = net?.role === 'host' ? net.recorder.tee(-1, this.vfx, deps.audio) : this.ports;
    this.pickups = new Pickups();
    this.pickupViews = new PickupViews(scene);
    this.coverMarker = new CoverMarker(scene);
    this.grenadeViews = new GrenadeViews(scene);
    this.throwArc = new ThrowArc(scene);
    this.rain = data.weather === 'rain' ? new Rain(scene, this.physics, data, deps.quality.particles) : null;
    if (!this.replica) for (const p of data.pickups) this.pickups.add(p.kind, new Vector3(p.pos[0], p.pos[1], p.pos[2]));
    this.combat = new PlayerCombat(deps.upgrades, loadoutFor(deps.upgrades, deps.loadout), gearFor(deps.upgrades, deps.loadout));
    this.enemies = new EnemyManager({
      level: data,
      physics: this.physics,
      nav: this.nav,
      vfx: world.vfx,
      audio: world.audio,
      rng: deps.rng,
      accuracyMult: deps.accuracyMult,
      damageMult: deps.damageMult,
      onShotAtPlayer: (enemy, target, hit, dmg) => this.roster.shotAt(enemy, target, hit, dmg),
      onEnemyAlert: (e) => deps.onEnemyAlert?.(e),
    });
    this.civilians = data.civilians.length > 0 ? new CivilianManager(data.civilians, this.physics, this.nav, deps.rng) : null;
    this.civilianViews = this.civilians ? new CivilianViews(this.civilians.list, scene) : null;
    if (this.civilians) this.civilians.onHurt = (_c, killed) => deps.onCivilianHurt?.(killed);
    this.grenades = new Grenades({ physics: this.physics, enemies: this.enemies, civilians: this.civilians, vfx: world.vfx, audio: world.audio });
    this.roster = new PlayerRoster({
      physics: this.physics,
      enemies: this.enemies,
      civilians: this.civilians,
      vfx: world.vfx,
      audio: world.audio,
      rng: deps.rng,
      pickups: this.pickups,
      grenades: this.grenades,
    });
    let localPorts: SlotPorts | undefined;
    if (net?.role === 'host') {
      // Su disparo suena en primera persona aquí; para los invitados, desde su cabeza.
      const head = new Vector3();
      const p = this.player;
      localPorts = net.recorder.tee(0, this.vfx, deps.audio, () => head.set(p.feet.x, p.feet.y + 1.5, p.feet.z));
    } else if (net?.role === 'guest') localPorts = { rng: net.shotRng };
    this.local = this.roster.add(this.player, this.combat, {
      local: true,
      camera: deps.camera,
      id: net?.role === 'guest' ? net.localId : 0,
      ports: localPorts,
    });
    this.roster.respawn.pos.set(s[0], s[1], s[2]);
    this.roster.respawn.yaw = data.spawn.yaw;
    this.playerViews = new PlayerViews(scene);
    this.ctx = this.local.ctx;
    this.target = this.local.target;
    for (const it of data.interactables) {
      if (it.kind !== 'npc') continue;
      const look = NPC_LOOKS[it.id as keyof typeof NPC_LOOKS];
      if (!look) continue;
      const box = data.boxes.find((b) => b.tag === `npc:${it.id}`);
      const yaw = box?.rotY ?? npcYawTowardRoom(it);
      this.npcs.push(new Npc({ id: it.id, pos: new Vector3(it.pos[0], it.pos[1], it.pos[2]), yaw, ...look }, scene));
    }
    if (!this.replica) this.enemies.spawnInitial();
    // Vistas creadas ya, antes de precompilar los shaders del nivel (no en mitad de la partida).
    this.enemyViews = new EnemyViews(scene);
    this.enemyViews.sync(this.enemies.enemies);
    this.physics.step();
  }

  /** Todos los jugadores de la partida (el local es el primero). */
  get players(): readonly PlayerSlot[] {
    return this.roster.slots;
  }

  /** Añade a la partida un jugador que no es el local (lo mueve su intención; QA y, en la fase 3, la red). */
  addPlayer(x: number, y: number, z: number, yaw: number): PlayerSlot {
    const controller = new PlayerController(this.physics, new Vector3(x, y + 0.02, z), yaw);
    controller.killY = this.data.killY;
    const { upgrades, loadout } = this.deps;
    return this.roster.add(controller, new PlayerCombat(upgrades, loadoutFor(upgrades, loadout), gearFor(upgrades, loadout)));
  }

  // ======================================================== red (fase 3)
  /** El cuerpo y el combate de un invitado, con sus mejoras y su equipo (el anfitrión lo añade al registro). */
  createPlayer(at: Vector3, yaw: number, upgrades: ReadonlySet<UpgradeId>, loadout: Loadout): { controller: PlayerController; combat: PlayerCombat } {
    const controller = new PlayerController(this.physics, new Vector3(at.x, at.y + 0.02, at.z), yaw);
    controller.killY = this.data.killY;
    return { controller, combat: new PlayerCombat(upgrades, loadoutFor(upgrades, loadout), gearFor(upgrades, loadout)) };
  }

  /** Punto libre cerca de `base` para el jugador `index`: a un lado y a otro, sobre la rejilla de navegación. */
  spawnNear(base: Vector3, yaw: number, index: number, out: Vector3): Vector3 {
    const rx = Math.cos(yaw);
    const rz = -Math.sin(yaw);
    const side = index % 2 === 1 ? 1 : -1;
    const d = 1.3 * Math.ceil(index / 2);
    for (const k of [1, 0.6, -1]) {
      const x = base.x + rx * side * d * k;
      const z = base.z + rz * side * d * k;
      const n = this.nav.nearestNode(x, base.y, z, 1.2);
      if (n >= 0) return this.nav.pos(n, out);
    }
    return out.copy(base);
  }

  /** Plaza para dibujar a otro jugador en un invitado (lo mueve lo que llega del anfitrión). */
  createReplica(id: number, at: MoveNet): PlayerSlot {
    const controller = new PlayerController(this.physics, new Vector3(at.x, at.y, at.z), at.yaw);
    return this.roster.add(controller, new PlayerCombat(new Set()), { drive: 'replica', id });
  }

  /** God mode de debug: los disparos enemigos no hacen daño. */
  get god(): boolean {
    return this.roster.god;
  }

  set god(on: boolean) {
    this.roster.god = on;
  }

  /** Actualiza lo que los enemigos ven de cada jugador (sin asignaciones). */
  updateTargets(dt: number): readonly PlayerTarget[] {
    return this.roster.updateTargets(dt);
  }

  /** Interactivo más cercano al alcance y delante del jugador (según el yaw de la cámara). */
  /** `missionOnly`: solo los objetos de la misión (un invitado no habla con los NPC ni usa el ascensor). */
  nearestInteractable(camYaw: number, used?: ReadonlySet<string>, missionOnly = false): InteractableDef | null {
    const f = this.player.feet;
    const fx = -Math.sin(camYaw);
    const fz = -Math.cos(camYaw);
    let best: InteractableDef | null = null;
    let bestD = Number.POSITIVE_INFINITY;
    for (const it of this.data.interactables) {
      if (used?.has(it.id)) continue;
      if (missionOnly && !it.action.startsWith('mission:')) continue;
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
    this.coverMarker.dispose();
    this.grenadeViews.dispose();
    this.throwArc.dispose();
    this.rain?.dispose();
    this.grenades.clear();
    this.playerViews.dispose();
    this.pickups.dispose();
    this.vfx.dispose();
    this.playerRig.dispose();
    this.roster.dispose();
    this.level.dispose();
    this.physics.dispose();
    void this.deps;
  }
}

/** Un NPC detrás de un mostrador mira hacia el centro de la sala. */
function npcYawTowardRoom(it: InteractableDef): number {
  return Math.atan2(-(0 - it.pos[0]), -(0 - it.pos[2]));
}
