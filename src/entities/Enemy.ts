import type { Collider } from '@dimforge/rapier3d-compat';
import { Vector3 } from 'three';
import type { CombatAudio, CombatVfx, ShotSound } from '../combat/ports';
import { applyDamage, type DamageResult, type HitZone, makeVitals, restoreVitals, type Vitals } from '../combat/damage';
import { type DeathStyle, deathStyle, type HitInfo, type HitPart, hitPart, POISE_RECOVERY, type Reaction, reactTo } from '../combat/hitReaction';
import type { SquadMember } from './ai/squad';
import { FIXED_DT } from '../core/Loop';
import { clamp, wrapAngle } from '../core/math';
import type { Rng } from '../core/rng';
import type { NavGrid } from '../levels/nav/NavGrid';
import type { EnemySpawnDef, EnemyType } from '../levels/types';
import { createRayHit, Groups, type PhysicsWorld, QueryGroups } from '../physics/Physics';

import { type AiState, EnemyBrain, emptyCommand, emptyPerception, type Tactics } from './ai/EnemyBrain';
import { ENEMY_TYPES, type EnemyTypeDef } from './ai/enemyTypes';

import { emptyIntent, emptyMoveNet, type MoveNet, PlayerController, yawFromDir } from './PlayerController';

/**
 * Un enemigo como objeto plano (fase 3 de docs/ESCALABILIDAD.md): lo que el anfitrión envía de cada uno y lo que basta
 * para dibujarlo en otro equipo y para que sus disparos le alcancen allí.
 */
export interface EnemyNet {
  /** Id de red: estable mientras exista y único en la partida. */
  uid: number;
  type: EnemyType;
  move: MoveNet;
  ai: AiState;
  aim: boolean;
  health: number;
  alive: boolean;
  hitFlash: number;
  recoilVis: number;
  flinch: number;
  flinchSide: number;
  /** El impacto vino de frente (o de espaldas) y en qué parte. */
  flinchFront: boolean;
  hitPart: HitPart;
  /** Descolocado (0..1) y cojeando (−1 pierna izquierda, +1 derecha, 0 no). */
  stagger: number;
  limp: number;
  /** Recarga 0..1 (−1: no recarga). */
  reload: number;
  /** Escondido tras una cobertura. */
  hidden: boolean;
  deathStyle: DeathStyle;
  deathFallStart: number;
  thrownT: number;
  targetRise: number;
  icon: 'none' | 'suspicious' | 'alert' | 'flank';
  detection: number;
  telegraph: number;
  hasLook: boolean;
  lookX: number;
  lookY: number;
  lookZ: number;
  telegraphX: number;
  telegraphY: number;
  telegraphZ: number;
  /** Aturdido por un destello (se tambalea; el otro aturdimiento lo deja de rodillas). */
  dazed: boolean;
}

export function emptyEnemyNet(): EnemyNet {
  return {
    uid: 0,
    type: 'thug',
    move: emptyMoveNet(),
    ai: 'patrol',
    aim: false,
    health: 0,
    alive: true,
    hitFlash: 0,
    recoilVis: 0,
    flinch: 0,
    flinchSide: 0,
    flinchFront: true,
    hitPart: 'torso',
    stagger: 0,
    limp: 0,
    reload: -1,
    hidden: false,
    deathStyle: 0,
    deathFallStart: 0,
    thrownT: -1,
    targetRise: 1.2,
    icon: 'none',
    detection: 0,
    telegraph: 0,
    hasLook: false,
    lookX: 0,
    lookY: 0,
    lookZ: 0,
    telegraphX: 0,
    telegraphY: 0,
    telegraphZ: 0,
    dazed: false,
  };
}

/** Lo que el enemigo necesita saber de un jugador en cada paso. */
export interface PlayerTarget {
  /** Plaza del jugador en la partida (0 = el jugador local). */
  readonly id: number;
  feet: Vector3;
  head: Vector3;
  chest: Vector3;
  crouched: boolean;
  speed: number;
  invulnerable: boolean;
  alive: boolean;
  collider: Collider;
}

export interface EnemyWorld {
  physics: PhysicsWorld;
  nav: NavGrid;
  vfx: CombatVfx;
  audio: CombatAudio;
  rng: Rng;
  tactics: Tactics;
  /** Multiplicadores de dificultad. */
  accuracyMult: number;
  damageMult: number;
  /** Llamado cuando un disparo enemigo impacta (o falla) a un jugador. */
  onShotAtPlayer(enemy: Enemy, target: PlayerTarget, hit: boolean, damage: number): void;
}

/** Para cambiar de objetivo, otro jugador tiene que estar claramente más cerca: así no duda entre dos. */
const RETARGET_RATIO = 0.6;
/** Tras recibir un disparo se queda con quien se lo hizo este tiempo (s), aunque otro esté más cerca. */
const PROVOKED_LOCK = 3;

/** El jugador vivo más cercano a un punto (o null si no queda ninguno). */
function nearestAlive(targets: readonly PlayerTarget[], to: Vector3): PlayerTarget | null {
  let best: PlayerTarget | null = null;
  let bestD = Number.POSITIVE_INFINITY;
  for (const t of targets) {
    if (!t.alive) continue;
    const d = t.feet.distanceToSquared(to);
    if (d < bestD) {
      bestD = d;
      best = t;
    }
  }
  return best;
}

const ENEMY_SHOT_SOUND: Record<string, ShotSound> = {
  pistol: 'enemyPistol',
  smg: 'enemySmg',
  rifle: 'enemyRifle',
  dmr: 'enemyRifle',
  revolver: 'enemyRifle',
  shotgun: 'enemyShotgun',
  shotgunTactical: 'enemyShotgun',
};

/** Segundos sin progreso antes de replanificar; nº de replanes antes de avisar "atascado" al cerebro. */
const STUCK_WINDOW = 1.0;
const STUCK_MIN_PROGRESS = 0.3;
const STUCK_REPLANS = 2;

const _v = new Vector3();

const _eye = new Vector3();
const _muzzle = new Vector3();
const _dir = new Vector3();
const _hitPt = new Vector3();
const _ray = createRayHit();
/** Lo que tarda el agarre del takedown en tumbar al enemigo (s). */
export const THROW_DELAY = 0.1;
/** Lo que un destello le corta el disparo a quien no se aturde (s). */
const DAZZLE = 1.2;
/** Lo que se tambalea hacia atrás (fracción de su marcha) y lo que frena una pierna herida. */
const STAGGER_STEP = 0.42;
const LIMP_SPEED = 0.55;
/** Velocidad con la que sale despedido quien muere de un escopetazo (m/s). */
const BLAST_SPEED = 5.5;
const _react: Reaction = { stagger: 0, disarm: 0, limp: 0 };
/** Tiempo tras la muerte en el que el cuerpo termina de caer; después ni se simula ni se anima (s). */
export const CORPSE_SETTLE = 3;

/**
 * Un enemigo, solo simulación: percepción, IA, movimiento, disparo y daño. Lo que se ve (personaje animado, icono de
 * alerta, láser) es `EnemyView`, que lee este estado sin cambiarlo; así el enemigo corre igual sin pantalla.
 */
export class Enemy {
  readonly id: string;
  /** Id de red: único en la partida (el anfitrión lo asigna; en otro equipo, el suyo). */
  readonly uid: number;
  readonly def: EnemyTypeDef;
  readonly spawnDef: EnemySpawnDef;
  readonly brain: EnemyBrain;
  readonly mover: PlayerController;
  readonly vitals: Vitals;
  /** Orden de aparición: escalona la percepción entre enemigos y desfasa su animación. */
  readonly index: number;
  readonly perception = emptyPerception();
  readonly cmd = emptyCommand();
  readonly home = new Vector3();
  private readonly w: EnemyWorld;
  private readonly intent = emptyIntent();
  private path: number[] = [];
  private pathIdx = 0;
  private readonly pathGoal = new Vector3();
  private hasPath = false;
  private replanCooldown = 0;
  private stuckTimer = 0;
  private stuckReplans = 0;
  private readonly progressFrom = new Vector3();
  private pathEvent: 'stuck' | 'failed' | 'arrived' | null = null;
  private perceiveTimer: number;
  private aimIn = 0;
  private lastSee = false;
  private lastShoot = false;
  private laserBeepT = 0;
  private faceTargetT = 0;
  /** Diagnóstico QA: tiempo continuo con orden de moverse y sin avanzar. */
  noProgressTime = 0;
  maxNoProgress = 0;
  stuckEvents = 0;
  /** Último atacante conocido (para la causa de muerte del jugador). */
  lastHitWasHead = false;
  /** Segundos de simulación desde la muerte (hasta que el cuerpo se asienta). */
  private deadSim = 0;
  // Estado que la vista muestra (lo lee `EnemyView`; solo lo cambia la simulación).
  /** Destello del rim al recibir un impacto (s que quedan). */
  hitFlash = 0;
  /** Retroceso del arma al disparar, 0..1 (decae). */
  recoilVis = 0;
  /** Sacudida al recibir un impacto (0..1) y lado del que vino. */
  flinch = 0;
  flinchSide = 0;
  /** El impacto vino de frente y en qué parte del cuerpo dio. */
  flinchFront = true;
  hitPart: HitPart = 'torso';
  /** Descolocado, 0..1 (decae con el tiempo que le queda). */
  stagger = 0;
  /** Cojea: lado de la pierna herida y lo que le queda (s). */
  limpSide: -1 | 0 | 1 = 0;
  private limpT = 0;
  /** Daño encajado seguido: al pasar de su aguante se descoloca. */
  private poiseHit = 0;
  /** Hacia dónde lo empuja el último impacto (horizontal, unitario). */
  private readonly push = new Vector3();
  /** Lo que la escuadra lleva en cuenta de él. */
  squadTurnT = 0;
  squadWaitT = 0;
  /** Forma de caer al morir (ver `hitReaction.ts`). */
  deathStyle: DeathStyle = 0;
  /** Al morir proyectado en un takedown, lo que ya llevaba de caída (s). */
  deathFallStart = 0;
  /** Murió aturdido por un destello (puntúa distinto). */
  diedDazed = false;
  /** Tiempo desde que el jugador lo agarró en un takedown (s); −1 si no lo están proyectando. */
  thrownT = -1;
  /** Altura del pecho del objetivo sobre sus pies (se mira y se apunta ahí). */
  targetRise = 1.2;
  /** Punto al que apunta el láser mientras telegrafía el disparo. */
  readonly telegraphAt = new Vector3();
  /** A quién ataca (uno de los jugadores); null hasta el primer paso. */
  private focus: PlayerTarget | null = null;
  /** Le acaban de herir: en el siguiente paso se vuelve hacia quien le disparó. */
  private provoked = false;
  /** Segundos que le quedan sin cambiar de objetivo por distancia. */
  private lockT = 0;

  constructor(def: EnemySpawnDef, w: EnemyWorld, index: number, uid = index + 1) {
    this.id = def.id;
    this.uid = uid;
    this.spawnDef = def;
    this.def = ENEMY_TYPES[def.type];
    this.w = w;
    this.index = index;
    this.home.set(def.pos[0], def.pos[1], def.pos[2]);
    const patrol = (def.patrol ?? []).map((p) => new Vector3(p[0], p[1], p[2]));
    this.brain = new EnemyBrain(this.def, patrol, this.home, !!def.stationary, w.rng);
    this.mover = new PlayerController(w.physics, new Vector3(def.pos[0], def.pos[1] + 0.02, def.pos[2]), def.yaw, Groups.ENEMY);
    this.vitals = makeVitals({ maxHealth: this.def.health, maxHeavyArmor: this.def.heavyArmor });
    this.perceiveTimer = (index % 6) * FIXED_DT;
  }

  /** El jugador al que ataca. */
  get target(): PlayerTarget | null {
    return this.focus;
  }

  /** ¿Apunta ahora mismo? (su postura de apuntado; escondido, herido en el brazo o descolocado, baja el arma). */
  get aiming(): boolean {
    return this.intent.aim && !this.cmd.hidden && !this.brain.disarmed && this.stagger <= 0.35;
  }

  /** Cojea (−1 pierna izquierda, +1 derecha, 0 no). */
  get limping(): number {
    return this.limpT > 0 ? this.limpSide : 0;
  }

  /** Lo que la escuadra necesita saber de él (ver `squad.ts`). */
  squadInfo(out: SquadMember): SquadMember {
    const s = this.brain.state;
    const t = this.focus;
    const f = this.mover.feet;
    out.fighting = this.alive && (s === 'combat' || s === 'cover' || s === 'flank');
    out.canSee = this.perception.canSee;
    out.telegraphs = this.def.weapon.telegraph > 0;
    out.canFlank = s === 'combat' && !this.spawnDef.stationary && this.def.canFlank && !this.brain.reloading && !this.brain.staggered;
    out.flanker = this.def.flanker;
    out.flanking = s === 'flank';
    out.distance = this.perception.distance;
    out.angle = t ? Math.atan2(f.x - t.feet.x, f.z - t.feet.z) : 0;
    out.turnT = this.squadTurnT;
    out.waitT = this.squadWaitT;
    return out;
  }

  /** El tirador avisa con un láser antes de disparar. */
  get hasLaser(): boolean {
    return this.def.weapon.telegraph > 0 && this.def.type === 'marksman';
  }

  get alive(): boolean {
    return !this.vitals.dead;
  }

  get state(): AiState {
    return this.brain.state;
  }

  /** Aturdido por un destello: se tambalea y se le pasa solo. */
  get dazed(): boolean {
    return this.alive && this.brain.dazed;
  }

  get collider(): Collider {
    return this.mover.collider;
  }

  get feet(): Vector3 {
    return this.mover.feet;
  }

  /** Altura actual del cuerpo (para zonas de impacto). */
  get height(): number {
    return this.mover.height;
  }

  // ======================================================== simulación
  fixedUpdate(dt: number, targets: readonly PlayerTarget[]): void {
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    this.recoilVis = Math.max(0, this.recoilVis - dt * 6);
    this.flinch = Math.max(0, this.flinch - dt * 4.5);
    this.stagger = Math.max(0, this.stagger - dt * 1.9);
    this.limpT = Math.max(0, this.limpT - dt);
    this.poiseHit = Math.max(0, this.poiseHit - dt * POISE_RECOVERY);
    if (this.alive && this.thrownT >= 0) this.thrownT += dt;
    if (!this.alive) {
      // El cuerpo cae y se asienta; después ya no hace falta moverlo.
      if (this.deadSim < CORPSE_SETTLE) {
        this.deadSim += dt;
        this.mover.fixedUpdate(dt, this.intent);
      }
      return;
    }
    const target = this.chooseTarget(targets, dt);
    if (!target) {
      this.mover.fixedUpdate(dt, this.intent);
      return;
    }
    this.perceive(dt, target);
    this.targetRise = target.chest.y - target.feet.y;
    const p = this.perception;
    p.path = this.pathEvent ?? (this.hasPath ? 'moving' : 'idle');
    this.pathEvent = null;
    p.selfPos.copy(this.mover.feet);
    this.brain.update(dt, p, this.w.tactics, this.cmd);
    // Se le pasó el aturdimiento: vuelve a moverse.
    if (this.mover.state === 'locked' && this.brain.state !== 'stunned' && this.thrownT < 0) this.mover.setLocked(false);
    // Los eventos de un paso ya se consumieron.
    p.heard = false;
    p.damaged = false;
    p.allyAlert = false;

    this.drive(dt);
    this.mover.fixedUpdate(dt, this.intent);
    this.trackProgress(dt);
    if (this.cmd.fire && target.alive) this.shoot(target);
    else if (this.cmd.suppress) this.suppressFire();
    this.updateTelegraph(dt, target);
  }

  /**
   * Elige a quién atacar entre los jugadores: sigue con el mismo mientras viva y no haya otro claramente más cerca. Si
   * le acaban de herir, se vuelve hacia el jugador más cercano al origen del disparo y no lo suelta en un rato (si no,
   * la regla de la distancia lo devolvería enseguida al más cercano y dudaría entre los dos).
   */
  private chooseTarget(targets: readonly PlayerTarget[], dt: number): PlayerTarget | null {
    if (targets.length <= 1) {
      this.provoked = false;
      this.focus = targets[0] ?? null;
      return this.focus;
    }
    this.lockT = Math.max(0, this.lockT - dt);
    if (this.provoked) {
      this.provoked = false;
      const attacker = nearestAlive(targets, this.perception.damageFrom);
      if (attacker) {
        this.focus = attacker;
        this.lockT = PROVOKED_LOCK;
      }
    }
    const f = this.mover.feet;
    const best = nearestAlive(targets, f);
    const cur = this.focus && this.focus.alive && targets.includes(this.focus) ? this.focus : null;
    if (!cur) this.focus = best ?? targets[0]!;
    else if (this.lockT <= 0 && best && best !== cur && best.feet.distanceToSquared(f) < cur.feet.distanceToSquared(f) * RETARGET_RATIO * RETARGET_RATIO)
      this.focus = best;
    return this.focus;
  }

  /** Percepción (raycasts a 10 Hz, escalonados entre enemigos). */
  private perceive(dt: number, t: PlayerTarget): void {
    const p = this.perception;
    p.playerPos.copy(t.feet);
    const f = this.mover.feet;
    p.distance = Math.hypot(t.feet.x - f.x, t.feet.z - f.z);
    this.perceiveTimer -= dt;
    if (this.perceiveTimer <= 0) {
      this.perceiveTimer = 0.1;
      this.lastSee = false;
      this.lastShoot = false;
      if (t.alive) {
        let range = this.def.sightRange * (t.crouched && p.distance > 5 ? 0.6 : 1);
        if (this.brain.state !== 'patrol') range *= 1.3;
        if (p.distance <= range) {
          // Cono de visión (a < 4 m se percibe en 360°).
          const toYaw = yawFromDir(t.feet.x - f.x, t.feet.z - f.z);
          const off = Math.abs(wrapAngle(toYaw - this.mover.yaw));
          const inFov = p.distance < 4 || off <= ((this.def.fovDeg / 2) * Math.PI) / 180 || this.brain.state !== 'patrol';
          if (inFov) {
            _eye.set(f.x, f.y + (this.mover.posture === 'crouch' ? 1.0 : 1.6), f.z);
            const ph = this.w.physics;
            this.lastSee = ph.lineOfSight(_eye, t.head, QueryGroups.STATIC) || ph.lineOfSight(_eye, t.chest, QueryGroups.STATIC);
            if (this.lastSee) {
              this.muzzlePos(_muzzle);
              this.lastShoot = ph.lineOfSight(_muzzle, t.chest, QueryGroups.STATIC) || ph.lineOfSight(_muzzle, t.head, QueryGroups.STATIC);
            }
          }
        }
      }
    }
    p.canSee = this.lastSee;
    p.canShoot = this.lastShoot;
    p.seeFactor = clamp(1.25 - p.distance / (this.def.sightRange * 1.1), 0.3, 1) * (t.crouched ? 0.65 : 1);
    this.aimIn = p.canSee ? Math.min(2, this.aimIn + dt) : Math.max(0, this.aimIn - dt * 2);
  }

  hear(pos: Vector3): void {
    if (!this.alive) return;
    this.perception.heard = true;
    this.perception.heardPos.copy(pos);
  }

  allyAlert(pos: Vector3): void {
    if (!this.alive) return;
    this.perception.allyAlert = true;
    this.perception.allyAlertPos.copy(pos);
  }

  /** Boca del arma (de ahí salen sus disparos y el láser). */
  muzzlePos(out: Vector3): Vector3 {
    const f = this.mover.feet;
    const y = this.mover.yaw;
    const fx = -Math.sin(y);
    const fz = -Math.cos(y);
    const crouch = this.mover.posture === 'crouch';
    return out.set(f.x + fx * 0.45 + Math.cos(y) * 0.2, f.y + (crouch ? 0.95 : 1.4), f.z + fz * 0.45 - Math.sin(y) * 0.2);
  }

  /** Convierte la orden del cerebro en intención de movimiento siguiendo la ruta A*. */
  private drive(dt: number): void {
    const c = this.cmd;
    const it = this.intent;
    const f = this.mover.feet;
    this.replanCooldown -= dt;
    // Mirada.
    let lookYaw = this.mover.yaw;
    if (c.hasLook) lookYaw = yawFromDir(c.lookAt.x - f.x, c.lookAt.z - f.z);
    it.moveX = 0;
    it.moveY = 0;
    this.faceTargetT = Math.max(0, this.faceTargetT - dt);
    if (c.fire || c.telegraph > 0) this.faceTargetT = 0.6;
    // Corriendo mira hacia donde va (velocidad completa); al disparar o quieto, encara al objetivo.
    const engaged =
      this.brain.state === 'combat' ||
      this.brain.state === 'cover' ||
      this.brain.state === 'flank' ||
      this.brain.state === 'suspicious' ||
      this.brain.state === 'search';
    it.aim = c.hasLook && engaged && (!c.hasMove || !c.run || this.faceTargetT > 0);
    it.camYaw = lookYaw;
    this.mover.setPosture(c.crouch ? 'crouch' : 'stand');
    // Descolocado: da unos pasos hacia donde lo empuja el impacto, sin perderlo de vista.
    if (this.brain.staggered && this.push.lengthSq() > 0.5) {
      this.hasPath = false;
      const k = STAGGER_STEP * clamp(this.stagger * 1.6, 0, 1) * this.def.walkScale;
      const sy = Math.sin(it.camYaw);
      const cy = Math.cos(it.camYaw);
      it.moveY = (-sy * this.push.x - cy * this.push.z) * k;
      it.moveX = (cy * this.push.x - sy * this.push.z) * k;
      return;
    }
    if (!c.hasMove) {
      this.hasPath = false;
      return;
    }
    // ¿Replanificar?
    if (!this.hasPath || this.pathGoal.distanceToSquared(c.moveTo) > 0.64) {
      if (this.replanCooldown <= 0) this.plan(c.moveTo);
      if (!this.hasPath) return;
    }
    // Siguiente waypoint.
    const nav = this.w.nav;
    let wp = this.path[this.pathIdx];
    while (wp !== undefined) {
      nav.pos(wp, _v);
      if (Math.hypot(_v.x - f.x, _v.z - f.z) > 0.45) break;
      this.pathIdx++;
      wp = this.path[this.pathIdx];
    }
    if (wp === undefined) {
      // Tramo final directo a la meta exacta.
      _v.copy(this.pathGoal);
      if (Math.hypot(_v.x - f.x, _v.z - f.z) < 0.4) {
        this.hasPath = false;
        this.pathEvent = 'arrived';
        return;
      }
    }
    const dx = _v.x - f.x;
    const dz = _v.z - f.z;
    const l = Math.hypot(dx, dz) || 1;
    const speed = (c.run ? this.def.runScale : this.def.walkScale) * (this.limpT > 0 ? LIMP_SPEED : 1);
    // Dirección de movimiento expresada relativa al yaw de la mirada (permite moverse y apuntar a la vez).
    if (!it.aim) it.camYaw = yawFromDir(dx, dz);
    const yaw = it.camYaw;
    const fx = -Math.sin(yaw);
    const fz = -Math.cos(yaw);
    const rx = Math.cos(yaw);
    const rz = -Math.sin(yaw);
    it.moveY = ((dx / l) * fx + (dz / l) * fz) * speed;
    it.moveX = ((dx / l) * rx + (dz / l) * rz) * speed;
  }

  private plan(goal: Vector3): void {
    const nav = this.w.nav;
    const f = this.mover.feet;
    this.replanCooldown = 0.35;
    const a = nav.nearestNode(f.x, f.y, f.z, 2);
    // La meta se busca en la MISMA componente que el enemigo: nunca apunta a una isla inalcanzable.
    const comp = nav.comp[a];
    const b = comp !== undefined ? nav.nearestNode(goal.x, goal.y, goal.z, 3, comp) : -1;
    const raw = a >= 0 && b >= 0 ? nav.findPath(a, b) : null;
    this.pathGoal.copy(goal);
    if (!raw) {
      this.hasPath = false;
      this.pathEvent = 'failed';
      return;
    }
    this.path = nav.smooth(raw);
    this.pathIdx = 0;
    this.hasPath = true;
    // La meta exacta se ajusta al nodo alcanzable.
    nav.pos(raw[raw.length - 1]!, this.pathGoal);
    this.progressFrom.copy(f);
    this.stuckTimer = 0;
  }

  /** Detección de atasco: sin progreso → replanifica; si persiste, avisa al cerebro. */
  private trackProgress(dt: number): void {
    if (!this.hasPath || !this.cmd.hasMove) {
      this.stuckTimer = 0;
      this.noProgressTime = 0;
      this.progressFrom.copy(this.mover.feet);
      return;
    }
    this.stuckTimer += dt;
    const moved = this.mover.feet.distanceTo(this.progressFrom);
    if (moved > STUCK_MIN_PROGRESS) {
      this.progressFrom.copy(this.mover.feet);
      this.stuckTimer = 0;
      this.noProgressTime = 0;
      this.stuckReplans = 0;
      return;
    }
    this.noProgressTime += dt;
    this.maxNoProgress = Math.max(this.maxNoProgress, this.noProgressTime);
    if (this.stuckTimer > STUCK_WINDOW) {
      this.stuckTimer = 0;
      this.stuckEvents++;
      this.stuckReplans++;
      if (this.stuckReplans > STUCK_REPLANS) {
        this.stuckReplans = 0;
        this.hasPath = false;
        this.pathEvent = 'stuck';
      } else {
        this.replanCooldown = 0;
        this.plan(this.pathGoal);
      }
    }
  }

  private shoot(t: PlayerTarget): void {
    const wd = this.def.weapon;
    this.muzzlePos(_muzzle);
    const dist = _muzzle.distanceTo(t.chest);
    const aimK = clamp(0.4 + (this.aimIn / 2) * 0.6, 0.4, 1);
    const distK = clamp(12 / Math.max(1, dist), 0.35, 1.3);
    const moveK = t.speed > 5 ? 0.6 : t.speed > 2 ? 0.82 : 1;
    const crouchK = t.crouched ? 0.85 : 1;
    const chance = wd.accuracy * this.w.accuracyMult * aimK * distK * moveK * crouchK * (1 - this.brain.shaken);
    const rng = this.w.rng;
    let anyHit = false;
    let dmg = 0;
    for (let i = 0; i < Math.max(1, wd.pellets); i++) {
      const hit = !t.invulnerable && rng.next() < chance;
      if (hit) {
        anyHit = true;
        dmg += wd.damage * this.w.damageMult;
      }
    }
    // Trazadora: al pecho si acierta; si falla, a un punto cercano al jugador (falla visible).
    if (anyHit) _hitPt.copy(t.chest);
    else _hitPt.set(t.chest.x + rng.range(-0.9, 0.9), t.chest.y + rng.range(-0.4, 0.9), t.chest.z + rng.range(-0.9, 0.9));
    _dir.subVectors(_hitPt, _muzzle).normalize();
    this.w.vfx.tracer(_muzzle, _hitPt, this.def.type === 'marksman' ? 0xff5040 : 0xffb070, this.def.type === 'marksman' ? 0.035 : 0.022);
    this.w.vfx.muzzle(_muzzle, _dir, false);
    this.w.audio.shot(ENEMY_SHOT_SOUND[wd.model] ?? 'enemyPistol', _muzzle);
    this.recoilVis = 1;
    this.w.onShotAtPlayer(this, t, anyHit, dmg);
  }

  /** Fuego de cobertura: una bala hacia donde vio al jugador, que da en lo que haya delante. */
  private suppressFire(): void {
    const at = this.brain.lastKnown;
    const rng = this.w.rng;
    this.muzzlePos(_muzzle);
    _hitPt.set(at.x + rng.range(-0.7, 0.7), at.y + rng.range(0.7, 1.7), at.z + rng.range(-0.7, 0.7));
    _dir.subVectors(_hitPt, _muzzle).normalize();
    if (this.w.physics.raycast(_muzzle, _dir, this.def.weapon.range, QueryGroups.STATIC, _ray)) {
      _hitPt.copy(_ray.point);
      this.w.vfx.impact(_hitPt, _ray.normal, 'spark', 4);
    } else _hitPt.copy(_muzzle).addScaledVector(_dir, this.def.weapon.range);
    this.w.vfx.tracer(_muzzle, _hitPt, 0xffb070, 0.022);
    this.w.vfx.muzzle(_muzzle, _dir, false);
    this.w.audio.shot(ENEMY_SHOT_SOUND[this.def.weapon.model] ?? 'enemyPistol', _muzzle);
    this.recoilVis = 1;
    this.faceTargetT = 0.6;
  }

  /** Telégrafo del tirador: fija dónde apunta el láser y pita cada vez más deprisa. */
  private updateTelegraph(dt: number, t: PlayerTarget): void {
    if (!this.hasLaser) return;
    const k = this.cmd.telegraph;
    if (k > 0.01 && this.alive) {
      this.telegraphAt.copy(t.chest);
      this.laserBeepT -= dt;
      if (this.laserBeepT <= 0) {
        this.laserBeepT = 0.32 - k * 0.24;
        this.w.audio.laserBeep(k, this.muzzlePos(_muzzle));
      }
    } else {
      this.laserBeepT = 0;
    }
  }

  // ======================================================== daño
  /** Aplica un impacto. `pierce` = takedown/ejecución. `hit`: dónde dio (decide cómo reacciona). */
  applyHit(amount: number, zone: HitZone, from: Vector3, headMult: number, pierce = false, hit: HitInfo | null = null): DamageResult {
    const r = applyDamage(this.vitals, amount, { zone, headMult, pierce });
    if (r.dealt <= 0) return r;
    this.hitFlash = 0.12;
    this.lastHitWasHead = zone === 'head';
    this.perception.damaged = true;
    this.perception.damageFrom.copy(from);
    this.provoked = true;
    // Dirección del impacto respecto a la cara (el personaje mira a −Z girado por yaw).
    const dx = from.x - this.mover.feet.x;
    const dz = from.z - this.mover.feet.z;
    const yaw = this.mover.yaw;
    const front = -Math.sin(yaw) * dx - Math.cos(yaw) * dz;
    const right = Math.cos(yaw) * dx - Math.sin(yaw) * dz;
    this.flinch = 1;
    this.flinchSide = right > 0 ? -1 : 1;
    this.flinchFront = front >= 0;
    const point = hit?.point;
    const lateral = point ? Math.cos(yaw) * (point.x - this.mover.feet.x) - Math.sin(yaw) * (point.z - this.mover.feet.z) : 0;
    const part = hitPart(zone, lateral, point ? (point.y - this.mover.feet.y) / this.mover.height : 0.6);
    this.hitPart = part;
    const l = Math.hypot(dx, dz);
    if (l > 1e-3) this.push.set(-dx / l, 0, -dz / l);
    if (r.killed) {
      this.deathStyle = this.thrownT >= 0 ? 1 : deathStyle(part, front, right, hit?.blast ?? false, this.w.rng.next());
      const blast = this.thrownT < 0 && this.deathStyle === 4;
      this.die();
      if (blast) this.mover.shove(this.push.x * BLAST_SPEED, this.push.z * BLAST_SPEED);
      return r;
    }
    this.react(part, r.dealt);
    return r;
  }

  /** Reacción a un impacto que no lo mata: se descoloca, baja el arma o cojea según dónde le dieron. */
  private react(part: HitPart, amount: number): void {
    if (this.thrownT >= 0 || this.brain.state === 'stunned') return;
    this.poiseHit += amount;
    const { reset } = reactTo(part, amount, this.poiseHit, this.def.poise, _react);
    if (reset) this.poiseHit = 0;
    if (_react.disarm > 0) {
      this.brain.disarm(_react.disarm);
      this.aimIn = 0;
    }
    if (_react.limp > 0) {
      this.limpT = Math.max(this.limpT, _react.limp);
      this.limpSide = part === 'legL' ? -1 : 1;
    }
    if (_react.stagger > 0) {
      this.brain.stagger(_react.stagger);
      this.stagger = 1;
      this.aimIn = 0;
    }
  }

  private die(): void {
    this.diedDazed = this.brain.dazed;
    this.brain.kill();
    this.mover.kill();
    // Si lo estaban proyectando, la caída sigue donde iba en vez de empezar de pie.
    this.deathFallStart = this.thrownT >= 0 ? Math.max(0, this.thrownT - THROW_DELAY) : 0;
    this.thrownT = -1;
    // El cuerpo deja de bloquear y de recibir disparos.
    this.mover.collider.setEnabled(false);
  }

  stun(): void {
    this.brain.stun();
    this.mover.setLocked(true);
  }

  /** Un destello en `at` (aturdidora). Devuelve si lo aturdió. */
  daze(seconds: number, at: Vector3): boolean {
    if (!this.alive || this.thrownT >= 0 || seconds <= 0) return false;
    // Arrodillado o agarrado: ya no puede hacer nada.
    if (this.brain.state === 'stunned' && !this.brain.dazed) return false;
    const yaw = this.mover.yaw;
    const f = this.mover.feet;
    this.flinch = 1;
    this.flinchSide = Math.cos(yaw) * (at.x - f.x) - Math.sin(yaw) * (at.z - f.z) > 0 ? -1 : 1;
    const k = this.def.stun ?? 1;
    if (k <= 0) {
      this.brain.dazzle(DAZZLE);
      return false;
    }
    this.brain.daze(seconds * k, at);
    this.mover.setLocked(true);
    return true;
  }

  /** El jugador lo agarra para un takedown: tras un instante cae de espaldas, aún vivo. */
  beginThrow(from: Vector3): void {
    this.thrownT = 0;
    // Encara a quien lo agarra: así cae alejándose de él y no entre sus pies.
    this.mover.yaw = Math.atan2(-(from.x - this.mover.feet.x), -(from.z - this.mover.feet.z));
  }

  /** El takedown terminó o se canceló sin matarlo: se reincorpora. */
  endThrow(): void {
    this.thrownT = -1;
  }

  /** Vuelve al punto de aparición con salud completa (reaparición del jugador / reinicio). */
  reset(): void {
    if (!this.alive) return;
    restoreVitals(this.vitals);
    this.brain.reset();
    this.stagger = 0;
    this.limpT = 0;
    this.poiseHit = 0;
    this.mover.setLocked(false);
    this.mover.revive(this.home, this.spawnDef.yaw);
    this.hasPath = false;
    this.aimIn = 0;
  }

  // ======================================================== red
  /** Copia su estado a un objeto plano (lo que el anfitrión envía de él). */
  writeNet(out: EnemyNet): EnemyNet {
    out.uid = this.uid;
    out.type = this.def.type;
    this.mover.writeNet(out.move);
    out.ai = this.brain.state;
    out.aim = this.aiming;
    out.health = this.vitals.health;
    out.alive = this.alive;
    out.hitFlash = this.hitFlash;
    out.recoilVis = this.recoilVis;
    out.flinch = this.flinch;
    out.flinchSide = this.flinchSide;
    out.flinchFront = this.flinchFront;
    out.hitPart = this.hitPart;
    out.stagger = this.stagger;
    out.limp = this.limping;
    out.reload = this.cmd.reload;
    out.hidden = this.cmd.hidden;
    out.deathStyle = this.deathStyle;
    out.deathFallStart = this.deathFallStart;
    out.thrownT = this.thrownT;
    out.targetRise = this.targetRise;
    const c = this.cmd;
    out.icon = c.icon;
    out.detection = c.detection;
    out.telegraph = c.telegraph;
    out.hasLook = c.hasLook;
    out.lookX = c.lookAt.x;
    out.lookY = c.lookAt.y;
    out.lookZ = c.lookAt.z;
    out.telegraphX = this.telegraphAt.x;
    out.telegraphY = this.telegraphAt.y;
    out.telegraphZ = this.telegraphAt.z;
    out.dazed = this.dazed;
    return out;
  }

  /**
   * Toma el estado recibido del anfitrión (este enemigo es una réplica: no piensa ni se mueve solo). Al morir o volver
   * a la vida su cuerpo deja o vuelve a recibir disparos, como en el anfitrión.
   */
  applyNet(s: EnemyNet, snap = false): void {
    this.mover.applyNet(s.move, snap);
    this.brain.state = s.ai;
    this.brain.stunLeft = s.dazed ? 1 : Number.POSITIVE_INFINITY;
    this.intent.aim = s.aim;
    this.vitals.health = s.health;
    if (this.vitals.dead === s.alive) {
      this.vitals.dead = !s.alive;
      this.mover.collider.setEnabled(s.alive);
    }
    this.hitFlash = s.hitFlash;
    this.recoilVis = s.recoilVis;
    this.flinch = s.flinch;
    this.flinchSide = s.flinchSide;
    this.flinchFront = s.flinchFront;
    this.hitPart = s.hitPart;
    this.stagger = s.stagger;
    this.limpSide = s.limp < 0 ? -1 : s.limp > 0 ? 1 : 0;
    this.limpT = s.limp !== 0 ? 1 : 0;
    this.deathStyle = s.deathStyle;
    this.deathFallStart = s.deathFallStart;
    this.thrownT = s.thrownT;
    this.targetRise = s.targetRise;
    const c = this.cmd;
    c.reload = s.reload;
    c.hidden = s.hidden;
    c.icon = s.icon;
    c.detection = s.detection;
    c.telegraph = s.telegraph;
    c.hasLook = s.hasLook;
    c.lookAt.set(s.lookX, s.lookY, s.lookZ);
    this.telegraphAt.set(s.telegraphX, s.telegraphY, s.telegraphZ);
  }

  /** Suelta su cuerpo físico (la vista se suelta aparte, en `EnemyViews`). */
  dispose(): void {
    this.w.physics.removeCharacter(this.mover.char);
  }
}
