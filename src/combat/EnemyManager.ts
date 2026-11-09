import type { Collider } from '@dimforge/rapier3d-compat';
import { type Scene, Vector3 } from 'three';
import type { AudioEngine } from '../audio/AudioEngine';
import type { Rng } from '../core/rng';
import type { Tactics } from '../entities/ai/EnemyBrain';
import { Enemy, type EnemyWorld, type PlayerTarget } from '../entities/Enemy';
import { boxToOriented } from '../levels/levelPhysics';
import type { NavGrid } from '../levels/nav/NavGrid';
import type { EnemySpawnDef, EnemyType, LevelData } from '../levels/types';
import { type PhysicsWorld, QueryGroups } from '../physics/Physics';
import type { Vfx } from '../render/vfx';

interface CoverPoint {
  pos: Vector3;
  normal: Vector3;
  claimedBy: string | null;
}

export interface EnemyManagerDeps {
  level: LevelData;
  physics: PhysicsWorld;
  nav: NavGrid;
  vfx: Vfx;
  audio: AudioEngine;
  rng: Rng;
  scene: Scene;
  accuracyMult: number;
  damageMult: number;
  onShotAtPlayer(enemy: Enemy, hit: boolean, damage: number): void;
  onEnemyAlert?(enemy: Enemy): void;
}

const _v = new Vector3();
const _a = new Vector3();
const _b = new Vector3();
const SHOUT_RADIUS = 18;

/**
 * Gestor de enemigos + consultas tácticas (implementa `Tactics` para los cerebros).
 */
export class EnemyManager implements Tactics {
  readonly enemies: Enemy[] = [];
  private readonly byHandle = new Map<number, Enemy>();
  private readonly cover: CoverPoint[] = [];
  private readonly world: EnemyWorld;
  private readonly deps: EnemyManagerDeps;
  private mainComp = -1;
  private currentId = '';
  private spawnCounter = 0;

  constructor(deps: EnemyManagerDeps) {
    this.deps = deps;
    this.world = {
      physics: deps.physics,
      nav: deps.nav,
      vfx: deps.vfx,
      audio: deps.audio,
      rng: deps.rng,
      scene: deps.scene,
      tactics: this,
      accuracyMult: deps.accuracyMult,
      damageMult: deps.damageMult,
      onShotAtPlayer: deps.onShotAtPlayer,
    };
    const s = deps.level.spawn.pos;
    const sn = deps.nav.nearestNode(s[0], s[1], s[2], 3);
    this.mainComp = sn >= 0 ? deps.nav.comp[sn]! : -1;
    this.buildCoverPoints();
  }

  /** Aparecen los enemigos sin evento de aparición. */
  spawnInitial(): void {
    for (const d of this.deps.level.enemies) if (!d.spawnOn) this.spawn(d);
  }

  /** Aparecen los enemigos asociados a un evento (refuerzos, oleadas). Devuelve cuántos. */
  spawnEvent(event: string): number {
    let n = 0;
    for (const d of this.deps.level.enemies) {
      if (d.spawnOn === event) {
        this.spawn({ ...d, id: `${d.id}#${++this.spawnCounter}` });
        n++;
      }
    }
    return n;
  }

  spawn(def: EnemySpawnDef): Enemy {
    const e = new Enemy(def, this.world, this.enemies.length);
    this.enemies.push(e);
    this.byHandle.set(e.collider.handle, e);
    return e;
  }

  /** Aparece un enemigo en una posición (debug / oleadas). */
  spawnAt(type: EnemyType, pos: Vector3, yaw: number, alertAt?: Vector3): Enemy {
    const e = this.spawn({ id: `dbg-${type}-${++this.spawnCounter}`, type, pos: [pos.x, pos.y, pos.z], yaw });
    if (alertAt) e.brain.alert(alertAt);
    return e;
  }

  enemyFromCollider(c: Collider | null): Enemy | null {
    if (!c) return null;
    return this.byHandle.get(c.handle) ?? null;
  }

  get aliveCount(): number {
    let n = 0;
    for (const e of this.enemies) if (e.alive) n++;
    return n;
  }

  /** Ruido de un disparo del jugador: los enemigos dentro del radio lo oyen. */
  noise(pos: Vector3, radius: number): void {
    const r2 = radius * radius;
    for (const e of this.enemies) if (e.alive && e.feet.distanceToSquared(pos) <= r2) e.hear(pos);
  }

  /** Alerta a todos (alarma). */
  alertAll(at: Vector3): void {
    for (const e of this.enemies) if (e.alive) e.brain.alert(at);
  }

  fixedUpdate(dt: number, target: PlayerTarget): void {
    for (const e of this.enemies) {
      this.currentId = e.id;
      const wasAlert = e.state === 'combat' || e.state === 'cover' || e.state === 'flank';
      e.fixedUpdate(dt, target);
      if (e.cmd.shout) this.shout(e, target.feet);
      const isAlert = e.state === 'combat' || e.state === 'cover' || e.state === 'flank';
      if (!wasAlert && isAlert && e.alive) {
        this.deps.audio.alert(e.feet);
        this.deps.onEnemyAlert?.(e);
      }
      // Libera la cobertura reservada al salir del estado.
      if (e.state !== 'cover') this.releaseCover(e.id);
    }
    this.currentId = '';
  }

  private shout(from: Enemy, playerPos: Vector3): void {
    const r2 = SHOUT_RADIUS * SHOUT_RADIUS;
    for (const e of this.enemies) {
      if (e === from || !e.alive) continue;
      if (e.feet.distanceToSquared(from.feet) <= r2) e.allyAlert(playerPos);
    }
  }

  renderUpdate(alpha: number, dt: number): void {
    for (const e of this.enemies) e.renderUpdate(alpha, dt);
  }

  /** Reaparición del jugador: los vivos vuelven a su punto con salud completa. */
  resetAlive(): void {
    for (const e of this.enemies) e.reset();
    for (const c of this.cover) c.claimedBy = null;
  }

  qaStats(): { alive: number; total: number; maxNoProgress: number; stuckEvents: number; states: Record<string, number> } {
    let maxNoProgress = 0;
    let stuckEvents = 0;
    const states: Record<string, number> = {};
    for (const e of this.enemies) {
      maxNoProgress = Math.max(maxNoProgress, e.maxNoProgress);
      stuckEvents += e.stuckEvents;
      states[e.state] = (states[e.state] ?? 0) + 1;
    }
    return { alive: this.aliveCount, total: this.enemies.length, maxNoProgress, stuckEvents, states };
  }

  dispose(): void {
    for (const e of this.enemies) e.dispose();
    this.enemies.length = 0;
    this.byHandle.clear();
  }

  // ===================================================== tácticas
  private buildCoverPoints(): void {
    const nav = this.deps.nav;
    for (const b of this.deps.level.boxes) {
      if (!b.cover || b.collide === false) continue;
      const ob = boxToOriented(b);
      // Cuatro caras verticales: normal local ±X / ±Z.
      const faces: Array<[number, number, number]> = [
        [1, 0, ob.half.x],
        [-1, 0, ob.half.x],
        [0, 1, ob.half.z],
        [0, -1, ob.half.z],
      ];
      for (const [nx, nz, h] of faces) {
        _a.set(nx, 0, nz).applyQuaternion(ob.quat);
        const tangentHalf = nx !== 0 ? ob.half.z : ob.half.x;
        _b.set(-_a.z, 0, _a.x);
        const steps = Math.max(1, Math.floor((tangentHalf * 2) / 1.0));
        for (let i = 0; i < steps; i++) {
          const s = steps === 1 ? 0 : -tangentHalf + 0.4 + ((tangentHalf * 2 - 0.8) * i) / (steps - 1);
          const pos = new Vector3(ob.center.x + _a.x * (h + 0.75) + _b.x * s, ob.center.y - ob.half.y, ob.center.z + _a.z * (h + 0.75) + _b.z * s);
          const n = nav.nearestNode(pos.x, pos.y, pos.z, 0.6);
          if (n < 0 || nav.comp[n] !== this.mainComp) continue;
          nav.pos(n, pos);
          this.cover.push({ pos, normal: _a.clone(), claimedBy: null });
        }
      }
    }
  }

  get coverPointCount(): number {
    return this.cover.length;
  }

  private releaseCover(id: string): void {
    for (const c of this.cover) if (c.claimedBy === id) c.claimedBy = null;
  }

  findCover(self: Vector3, threat: Vector3, out: Vector3): boolean {
    const ph = this.deps.physics;
    let checks = 0;
    let best: CoverPoint | null = null;
    let bestD = Number.POSITIVE_INFINITY;
    // Candidatos ordenados por distancia (sin ordenar el array: búsqueda incremental de los 6 mejores).
    for (const c of this.cover) {
      if (c.claimedBy && c.claimedBy !== this.currentId) continue;
      const d = c.pos.distanceTo(self);
      if (d > 16 || c.pos.distanceTo(threat) < 4) continue;
      _v.subVectors(threat, c.pos).setY(0).normalize();
      if (_v.dot(c.normal) > -0.35) continue; // la caja no queda entre la cobertura y la amenaza
      if (d < bestD) {
        // Verificación real: agachado tapado, de pie con línea de tiro.
        if (checks++ > 6) break;
        _a.set(c.pos.x, c.pos.y + 0.85, c.pos.z);
        _b.set(threat.x, threat.y + 1.4, threat.z);
        if (ph.lineOfSight(_a, _b, QueryGroups.STATIC)) continue;
        best = c;
        bestD = d;
      }
    }
    if (!best) return false;
    best.claimedBy = this.currentId;
    out.copy(best.pos);
    return true;
  }

  findFlank(self: Vector3, threat: Vector3, side: number, out: Vector3): boolean {
    const nav = this.deps.nav;
    const base = Math.atan2(self.x - threat.x, self.z - threat.z);
    for (const deg of [75, 60, 90, 45]) {
      const ang = base + side * ((deg * Math.PI) / 180);
      const dist = 9;
      const x = threat.x + Math.sin(ang) * dist;
      const z = threat.z + Math.cos(ang) * dist;
      const n = nav.nearestNode(x, self.y, z, 2.5);
      if (n >= 0 && nav.comp[n] === this.mainComp) {
        nav.pos(n, out);
        return true;
      }
    }
    return false;
  }

  randomNear(pos: Vector3, radius: number, out: Vector3): boolean {
    const nav = this.deps.nav;
    const rng = this.deps.rng;
    for (let i = 0; i < 10; i++) {
      const a = rng.range(0, Math.PI * 2);
      const r = rng.range(1, Math.max(1.2, radius));
      const n = nav.nearestNode(pos.x + Math.sin(a) * r, pos.y, pos.z + Math.cos(a) * r, 1.5);
      if (n >= 0 && nav.comp[n] === this.mainComp) {
        nav.pos(n, out);
        return true;
      }
    }
    return false;
  }
}
