import type { Collider } from '@dimforge/rapier3d-compat';
import { Vector3 } from 'three';

import type { Rng } from '../core/rng';
import type { CoverChoice, Tactics } from '../entities/ai/EnemyBrain';
import { planSquad, type SquadMember, type SquadOrder } from '../entities/ai/squad';
import { Enemy, type EnemyWorld, type PlayerTarget } from '../entities/Enemy';
import type { MoveNet } from '../entities/PlayerController';
import { boxToOriented } from '../levels/levelPhysics';
import type { NavGrid } from '../levels/nav/NavGrid';
import type { EnemySpawnDef, EnemyType, LevelData } from '../levels/types';
import { type PhysicsWorld, QueryGroups } from '../physics/Physics';
import { STUN, stunSeconds } from './Grenades';
import type { CombatAudio, CombatVfx } from './ports';

interface CoverPoint {
  pos: Vector3;
  normal: Vector3;
  /** Alta: tapa de pie y se asoma de lado, por `peek`. Baja: se asoma poniéndose de pie donde está. */
  high: boolean;
  peek: Vector3;
  claimedBy: string | null;
}

export interface EnemyManagerDeps {
  level: LevelData;
  physics: PhysicsWorld;
  nav: NavGrid;
  vfx: CombatVfx;
  audio: CombatAudio;
  rng: Rng;

  accuracyMult: number;
  damageMult: number;
  onShotAtPlayer: (enemy: Enemy, target: PlayerTarget, hit: boolean, damage: number) => void;
  onEnemyAlert?(enemy: Enemy): void;
}

const _v = new Vector3();
const _a = new Vector3();
const _b = new Vector3();
const SHOUT_RADIUS = 18;
/** Cada cuánto reparte órdenes la escuadra y cuánto pasa entre un rodeo y el siguiente (s). */
const SQUAD_PERIOD = 0.25;
const FLANK_COOLDOWN = 6;
/** Un disparo del jugador que pasa a menos de esto (m) pone nervioso; cuánto, por disparo. */
const NEAR_MISS = 1.5;
const SUPPRESS_SHOT = 0.28;
/** A esta distancia de una granada se aparta, si le da tiempo a verla: cuánto tarda en verla (s) y con qué probabilidad. */
const GRENADE_FEAR = 5;
const GRENADE_NOTICE = 0.35;
const GRENADE_EVADE = 0.6;
/** Cada cuánto miran las patrullas si hay un compañero caído, y desde dónde lo ven (m). */
const BODY_PERIOD = 0.5;
const BODY_SIGHT = 12;
/** Coberturas que comprueba con rayos en cada búsqueda. */
const COVER_CHECKS = 8;
/** De pie, la altura de los ojos y la del pecho; agachado, la de la cabeza (m). */
const EYE = 1.5;
const CHEST = 1.3;
const DUCK = 0.85;
/** Altura mínima de una cobertura baja y de una que tapa de pie (m). */
const LOW_MIN = 0.8;
const HIGH_MIN = 1.75;
/** Cuánto sale de la esquina quien se asoma por un lado, y lo que se puede desviar ese sitio (m). */
const PEEK_OUT = 0.6;
const PEEK_SLACK = 0.45;

interface Squad {
  flankCooldown: number;
  readonly enemies: Enemy[];
}

function member(): SquadMember {
  return { fighting: false, canSee: false, telegraphs: false, canFlank: false, flanker: false, flanking: false, distance: 0, angle: 0, turnT: 0, waitT: 0 };
}

/**
 * Gestor de enemigos + consultas tácticas (implementa `Tactics` para los cerebros).
 */
export class EnemyManager implements Tactics {
  readonly enemies: Enemy[] = [];
  private readonly byHandle = new Map<number, Enemy>();
  private readonly byUid = new Map<number, Enemy>();
  /** Siguiente id de red: nunca se reutiliza en la partida, aunque se retiren enemigos. */
  private nextUid = 1;
  private readonly cover: CoverPoint[] = [];
  private readonly candidates: Array<{ c: CoverPoint; score: number }> = [];
  private readonly world: EnemyWorld;
  private readonly deps: EnemyManagerDeps;
  private mainComp = -1;
  private currentId = '';
  private spawnCounter = 0;
  /** Escuadras: los que pelean con un mismo jugador (por su plaza). */
  private readonly squads = new Map<number, Squad>();
  private squadT = 0;
  private bodyT = 0;
  private readonly members: SquadMember[] = [];
  private readonly orders: SquadOrder[] = [];
  /** Caídos que ya encontró alguien. */
  private readonly foundBodies = new WeakSet<Enemy>();
  /** Quién ha visto cada granada y cuánto lleva viéndola (s); −1, ya decidió. */
  private readonly grenadeSeen = new Map<number, Map<number, number>>();

  constructor(deps: EnemyManagerDeps) {
    this.deps = deps;
    this.world = {
      physics: deps.physics,
      nav: deps.nav,
      vfx: deps.vfx,
      audio: deps.audio,
      rng: deps.rng,

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

  /**
   * Aparecen los enemigos asociados a un evento (refuerzos, oleadas). Devuelve cuántos.
   * `aggressive`: asaltan (se acercan a 8 m en vez de disparar desde la puerta).
   */
  spawnEvent(event: string, aggressive = false): number {
    let n = 0;
    for (const d of this.deps.level.enemies) {
      if (d.spawnOn === event) {
        const e = this.spawn({ ...d, id: `${d.id}#${++this.spawnCounter}` });
        e.brain.aggressive = aggressive;
        n++;
      }
    }
    return n;
  }

  spawn(def: EnemySpawnDef, uid = this.nextUid++): Enemy {
    const e = new Enemy(def, this.world, this.enemies.length, uid);
    this.enemies.push(e);
    this.byHandle.set(e.collider.handle, e);
    this.byUid.set(uid, e);
    return e;
  }

  /** El enemigo con ese id de red, si sigue en la partida. */
  byNetId(uid: number): Enemy | null {
    return this.byUid.get(uid) ?? null;
  }

  /**
   * Réplica de un enemigo del anfitrión (fase 3): aparece con su id de red donde está y no piensa; lo mueve lo que
   * llega por la red. Su cuerpo sí cuenta para chocar con él y para los disparos de este equipo.
   */
  spawnReplica(uid: number, type: EnemyType, at: MoveNet): Enemy {
    return this.spawn({ id: `net-${uid}`, type, pos: [at.x, at.y, at.z], yaw: at.yaw, stationary: true }, uid);
  }

  /** Retira un enemigo concreto (la réplica de uno que el anfitrión ya retiró). */
  remove(e: Enemy): void {
    this.despawnWhere((x) => x === e);
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

  /**
   * Destello de una aturdidora en `at`: aturde a los enemigos del radio que lo ven (a la cara o al pecho), más cuanto
   * más cerca y menos a quien le pilla de espaldas. Devuelve a cuántos.
   */
  stunBlast(at: Vector3): number {
    const ph = this.deps.physics;
    let n = 0;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const f = e.feet;
      const d = Math.hypot(f.x - at.x, f.y + e.height * 0.55 - at.y, f.z - at.z);
      if (d > STUN.radius) continue;
      _a.set(f.x, f.y + e.height * 0.88, f.z);
      _b.set(f.x, f.y + e.height * 0.55, f.z);
      if (!ph.lineOfSight(at, _a, QueryGroups.STATIC) && !ph.lineOfSight(at, _b, QueryGroups.STATIC)) continue;
      const l = Math.hypot(at.x - f.x, at.z - f.z) || 1;
      const yaw = e.mover.yaw;
      const facing = (-Math.sin(yaw) * (at.x - f.x) - Math.cos(yaw) * (at.z - f.z)) / l;
      if (e.daze(stunSeconds(d, facing), at)) n++;
    }
    return n;
  }

  /**
   * Un disparo del jugador (de `from` en la dirección unitaria `dir`, hasta `length`): a quien le pasa cerca lo pone a
   * cubierto y le estropea la puntería. `hit`: a quién dio (ese ya tiene bastante).
   */
  nearShot(from: Vector3, dir: Vector3, length: number, hit: Enemy | null): void {
    for (const e of this.enemies) {
      if (e === hit || !e.alive) continue;
      const f = e.feet;
      const x = f.x - from.x;
      const y = f.y + e.height * 0.6 - from.y;
      const z = f.z - from.z;
      const along = x * dir.x + y * dir.y + z * dir.z;
      if (along < 0 || along > length + 0.5) continue;
      const d2 = x * x + y * y + z * z - along * along;
      if (d2 < NEAR_MISS * NEAR_MISS) e.brain.suppress(e.def.poise > 100 ? SUPPRESS_SHOT * 0.4 : SUPPRESS_SHOT);
    }
  }

  /** Una granada en juego, en cada paso: quien la ve cerca se aparta, si le da tiempo. */
  grenadeNear(id: number, at: Vector3, dt: number): void {
    let seen = this.grenadeSeen.get(id);
    for (const e of this.enemies) {
      if (!e.alive || e.feet.distanceToSquared(at) > GRENADE_FEAR * GRENADE_FEAR) continue;
      const t = seen?.get(e.uid) ?? 0;
      if (t < 0) continue;
      _a.set(e.feet.x, e.feet.y + e.eyeHeight, e.feet.z);
      _b.set(at.x, at.y + 0.12, at.z);
      if (!this.deps.physics.lineOfSight(_a, _b, QueryGroups.STATIC)) continue;
      if (!seen) this.grenadeSeen.set(id, (seen = new Map()));
      if (t + dt < GRENADE_NOTICE) {
        seen.set(e.uid, t + dt);
        continue;
      }
      seen.set(e.uid, -1);
      if (this.deps.rng.chance(GRENADE_EVADE)) e.brain.evade(at, e.feet, this);
    }
  }

  /** Una granada que ya no está. */
  grenadeGone(id: number): void {
    this.grenadeSeen.delete(id);
  }

  /** Alerta a todos (alarma). */
  alertAll(at: Vector3): void {
    for (const e of this.enemies) if (e.alive) e.brain.alert(at);
  }

  /** Un paso de todos los enemigos; cada uno elige a quién atacar entre `targets` (uno por jugador). */
  fixedUpdate(dt: number, targets: readonly PlayerTarget[]): void {
    this.updateSquads(dt);
    this.findBodies(dt);
    for (const e of this.enemies) {
      this.currentId = e.id;
      const wasAlert = e.state === 'combat' || e.state === 'cover' || e.state === 'flank';
      e.fixedUpdate(dt, targets);
      if (e.cmd.shout && e.target) this.shout(e, e.target.feet);
      const isAlert = e.state === 'combat' || e.state === 'cover' || e.state === 'flank';
      if (!wasAlert && isAlert && e.alive) {
        this.deps.audio.alert(e.feet);
        this.deps.onEnemyAlert?.(e);
      }
      if (e.brain.callout) {
        e.brain.callout = false;
        this.deps.audio.alert(e.feet);
      }
      // Libera la cobertura reservada al salir del estado.
      if (e.state !== 'cover') this.releaseCover(e.id);
    }
    this.currentId = '';
  }

  /** Reparte turnos de disparo y rodeos entre los que pelean con cada jugador. */
  private updateSquads(dt: number): void {
    for (const s of this.squads.values()) s.flankCooldown = Math.max(0, s.flankCooldown - dt);
    for (const e of this.enemies) {
      if (e.brain.mayFire) {
        e.squadTurnT += dt;
        e.squadWaitT = 0;
      } else {
        e.squadTurnT = 0;
        e.squadWaitT += dt;
      }
    }
    this.squadT -= dt;
    if (this.squadT > 0) return;
    this.squadT = SQUAD_PERIOD;
    for (const s of this.squads.values()) s.enemies.length = 0;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const id = e.target?.id ?? 0;
      let s = this.squads.get(id);
      // Empieza con el rodeo en espera: primero se planta cara.
      if (!s) this.squads.set(id, (s = { flankCooldown: FLANK_COOLDOWN * 0.5, enemies: [] }));
      s.enemies.push(e);
    }
    for (const s of this.squads.values()) {
      const n = s.enemies.length;
      if (n === 0) continue;
      while (this.members.length < n) this.members.push(member());
      this.members.length = n;
      for (let i = 0; i < n; i++) s.enemies[i]!.squadInfo(this.members[i]!);
      if (planSquad(this.members, s.flankCooldown <= 0, this.orders)) s.flankCooldown = FLANK_COOLDOWN;
      for (let i = 0; i < n; i++) {
        const b = s.enemies[i]!.brain;
        const o = this.orders[i]!;
        b.mayFire = o.mayFire;
        b.covering = o.covering;
        b.flankOrder = o.flank;
      }
    }
  }

  /** Una patrulla que ve a un compañero caído registra la zona. Cada cuerpo se encuentra una vez. */
  private findBodies(dt: number): void {
    this.bodyT -= dt;
    if (this.bodyT > 0) return;
    this.bodyT = BODY_PERIOD;
    for (const body of this.enemies) {
      if (body.alive || this.foundBodies.has(body)) continue;
      for (const e of this.enemies) {
        if (!e.alive || (e.state !== 'patrol' && e.state !== 'suspicious')) continue;
        const dx = body.feet.x - e.feet.x;
        const dz = body.feet.z - e.feet.z;
        const d = Math.hypot(dx, dz);
        if (d > BODY_SIGHT || Math.abs(body.feet.y - e.feet.y) > 3.5) continue;
        const yaw = e.mover.yaw;
        if (d > 2 && (-Math.sin(yaw) * dx - Math.cos(yaw) * dz) / d < 0.35) continue;
        _a.set(e.feet.x, e.feet.y + e.eyeHeight, e.feet.z);
        _b.set(body.feet.x, body.feet.y + 0.35, body.feet.z);
        if (!this.deps.physics.lineOfSight(_a, _b, QueryGroups.STATIC)) continue;
        this.foundBodies.add(body);
        e.brain.findBody(body.feet);
        break;
      }
    }
  }

  private shout(from: Enemy, playerPos: Vector3): void {
    const r2 = SHOUT_RADIUS * SHOUT_RADIUS;
    for (const e of this.enemies) {
      if (e === from || !e.alive) continue;
      if (e.feet.distanceToSquared(from.feet) <= r2) e.allyAlert(playerPos);
    }
  }

  /** Retira a todos los enemigos (vivos y caídos): fin del Excomunicado. */
  despawnAll(): void {
    for (const e of this.enemies) e.dispose();
    this.enemies.length = 0;
    this.byHandle.clear();
    this.byUid.clear();
    this.squads.clear();
    for (const c of this.cover) c.claimedBy = null;
  }

  /** Retira (sin cadáver) a los enemigos de un grupo: el maniquí del tutorial al saltarlo. */
  despawnGroup(group: string): number {
    return this.despawnWhere((e) => e.spawnDef.group === group);
  }

  /** Retira a los enemigos que llegaron con un evento de aparición (refuerzos), vivos o caídos. */
  despawnEvent(event: string): number {
    return this.despawnWhere((e) => e.spawnDef.spawnOn === event);
  }

  /** Retira los cuerpos caídos (entre oleadas del Gauntlet: si no, se acumulan sin límite). */
  despawnDead(): number {
    return this.despawnWhere((e) => !e.alive);
  }

  private despawnWhere(match: (e: Enemy) => boolean): number {
    let n = 0;
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i]!;
      if (!match(e)) continue;
      for (const c of this.cover) if (c.claimedBy === e.id) c.claimedBy = null;
      this.byHandle.delete(e.collider.handle);
      this.byUid.delete(e.uid);
      e.dispose();
      this.enemies.splice(i, 1);
      n++;
    }
    return n;
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
    this.byUid.clear();
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
          const top = ob.center.y + ob.half.y - pos.y;
          if (top < LOW_MIN) continue;
          if (top < HIGH_MIN) {
            this.cover.push({ pos, normal: _a.clone(), high: false, peek: pos, claimedBy: null });
            continue;
          }
          // Alta: solo sirven los extremos de la cara, con sitio para asomarse más allá de la esquina.
          for (const side of [-1, 1]) {
            if ((side < 0 && i > 0) || (side > 0 && i < steps - 1)) continue;
            const t = (tangentHalf + PEEK_OUT) * side;
            _v.set(ob.center.x + _a.x * (h + 0.75) + _b.x * t, pos.y, ob.center.z + _a.z * (h + 0.75) + _b.z * t);
            const pn = nav.nearestNode(_v.x, _v.y, _v.z, 0.6, this.mainComp);
            if (pn < 0) continue;
            const peek = nav.pos(pn, new Vector3());
            if (Math.hypot(peek.x - _v.x, peek.z - _v.z) > PEEK_SLACK || Math.abs(peek.y - pos.y) > 0.4) continue;
            this.cover.push({ pos, normal: _a.clone(), high: true, peek, claimedBy: null });
          }
        }
      }
    }
  }

  private releaseCover(id: string): void {
    for (const c of this.cover) if (c.claimedBy === id) c.claimedBy = null;
  }

  /**
   * La mejor cobertura: cerca, con la caja entre ella y la amenaza y, comprobado con rayos, que tape de verdad a quien
   * se esconde y que deje disparar a quien se asoma. Mejor si no obliga a acercarse al jugador.
   */
  findCover(self: Vector3, threat: Vector3, out: CoverChoice): boolean {
    const ph = this.deps.physics;
    const list = this.candidates;
    list.length = 0;
    const dt = self.distanceTo(threat);
    for (const c of this.cover) {
      if (c.claimedBy && c.claimedBy !== this.currentId) continue;
      const d = c.pos.distanceTo(self);
      const away = c.pos.distanceTo(threat);
      if (d > 16 || away < 4) continue;
      _v.subVectors(threat, c.pos).setY(0).normalize();
      const face = -_v.dot(c.normal);
      if (face < 0.35) continue; // la caja no queda entre la cobertura y la amenaza
      list.push({ c, score: -d - Math.max(0, dt - away) * 0.6 + face * 2 });
    }
    list.sort((a, b) => b.score - a.score);
    _b.set(threat.x, threat.y + CHEST, threat.z);
    for (let i = 0; i < list.length && i < COVER_CHECKS; i++) {
      const c = list[i]!.c;
      _a.set(c.pos.x, c.pos.y + (c.high ? CHEST : DUCK), c.pos.z);
      if (ph.lineOfSight(_a, _b, QueryGroups.STATIC)) continue;
      _a.set(c.peek.x, c.peek.y + EYE, c.peek.z);
      if (!ph.lineOfSight(_a, _b, QueryGroups.STATIC)) continue;
      this.releaseCover(this.currentId);
      // Los dos extremos de una cara estrecha comparten sitio: se reservan juntos.
      for (const o of this.cover) if (o.pos === c.pos) o.claimedBy = this.currentId;
      out.pos.copy(c.pos);
      out.peek.copy(c.peek);
      out.high = c.high;
      return true;
    }
    return false;
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
