import type { Collider } from '@dimforge/rapier3d-compat';
import { AdditiveBlending, BoxGeometry, Color, Mesh, MeshBasicMaterial, type Scene, Sprite, Vector3 } from 'three';
import type { AudioEngine, ShotSound } from '../audio/AudioEngine';
import { applyDamage, type DamageResult, type HitZone, makeVitals, restoreVitals, type Vitals } from '../combat/damage';
import { FIXED_DT } from '../core/Loop';
import { clamp, wrapAngle } from '../core/math';
import type { Rng } from '../core/rng';
import type { NavGrid } from '../levels/nav/NavGrid';
import type { EnemySpawnDef } from '../levels/types';
import { Groups, type PhysicsWorld, QueryGroups } from '../physics/Physics';
import { alertIconMaterial, type Vfx } from '../render/vfx';
import { type AiState, EnemyBrain, emptyCommand, emptyPerception, type Tactics } from './ai/EnemyBrain';
import { ENEMY_TYPES, type EnemyTypeDef } from './ai/enemyTypes';
import { CharacterRig, idlePose, type RigPose } from './CharacterRig';
import { emptyIntent, PlayerController, yawFromDir } from './PlayerController';

/** Lo que el enemigo necesita saber del jugador en cada paso. */
export interface PlayerTarget {
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
  vfx: Vfx;
  audio: AudioEngine;
  rng: Rng;
  scene: Scene;
  tactics: Tactics;
  /** Multiplicadores de dificultad. */
  accuracyMult: number;
  damageMult: number;
  /** Llamado cuando un disparo enemigo impacta (o falla) al jugador. */
  onShotAtPlayer(enemy: Enemy, hit: boolean, damage: number): void;
}

const ENEMY_SHOT_SOUND: Record<string, ShotSound> = {
  pistol: 'enemyPistol',
  smg: 'enemySmg',
  rifle: 'enemyRifle',
  shotgun: 'enemyShotgun',
};

/** Segundos sin progreso antes de replanificar; nº de replanes antes de avisar "atascado" al cerebro. */
const STUCK_WINDOW = 1.0;
const STUCK_MIN_PROGRESS = 0.3;
const STUCK_REPLANS = 2;

const _v = new Vector3();
const _w = new Vector3();
const _eye = new Vector3();
const _muzzle = new Vector3();
const _dir = new Vector3();
const _hitPt = new Vector3();
/** Lo que tarda el agarre del takedown en tumbar al enemigo (s). */
const THROW_DELAY = 0.1;
/** Grosor del rim en reposo: por debajo del umbral del bloom, para que solo brillen el impacto y el telégrafo. */
const RIM_BASE = 0.8;
/**
 * Haz del láser: se afila hacia el extremo del objetivo (+Z tras `lookAt`), que es el que
 * queda junto a la cámara; con grosor constante se veía como una banda.
 */
const laserGeo = new BoxGeometry(1, 1, 1);
{
  const p = laserGeo.getAttribute('position');
  for (let i = 0; i < p.count; i++) if (p.getZ(i) > 0) p.setXY(i, p.getX(i) * 0.3, p.getY(i) * 0.3);
}
const RED = new Color(0xff2233);

export class Enemy {
  readonly id: string;
  readonly def: EnemyTypeDef;
  readonly spawnDef: EnemySpawnDef;
  readonly brain: EnemyBrain;
  readonly mover: PlayerController;
  readonly rig: CharacterRig;
  readonly vitals: Vitals;
  readonly perception = emptyPerception();
  readonly cmd = emptyCommand();
  readonly home = new Vector3();
  private readonly w: EnemyWorld;
  private readonly intent = emptyIntent();
  private readonly pose: RigPose = idlePose();
  private readonly icon: Sprite;
  private readonly laser: Mesh | null;
  private readonly laserMat: MeshBasicMaterial | null;
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
  private hitFlash = 0;
  private laserBeepT = 0;
  private recoilVis = 0;
  private faceTargetT = 0;
  private readonly baseRim: Color;
  /** Diagnóstico QA: tiempo continuo con orden de moverse y sin avanzar. */
  noProgressTime = 0;
  maxNoProgress = 0;
  stuckEvents = 0;
  /** Último atacante conocido (para la causa de muerte del jugador). */
  lastHitWasHead = false;
  /** Segundos de juego desde la muerte (para la animación de caída). */
  private deadFor = 0;
  /** Sacudida visual al recibir un impacto (0..1) y lado del que vino. */
  private flinch = 0;
  private flinchSide = 0;
  private deathStyle: 0 | 1 | 2 = 0;
  /** Tiempo desde que el jugador lo agarró en un takedown (s); −1 si no lo están proyectando. */
  private thrownT = -1;

  constructor(def: EnemySpawnDef, w: EnemyWorld, index: number) {
    this.id = def.id;
    this.spawnDef = def;
    this.def = ENEMY_TYPES[def.type];
    this.w = w;
    this.home.set(def.pos[0], def.pos[1], def.pos[2]);
    const patrol = (def.patrol ?? []).map((p) => new Vector3(p[0], p[1], p[2]));
    this.brain = new EnemyBrain(this.def, patrol, this.home, !!def.stationary, w.rng);
    this.mover = new PlayerController(w.physics, new Vector3(def.pos[0], def.pos[1] + 0.02, def.pos[2]), def.yaw, Groups.ENEMY);
    this.vitals = makeVitals({ maxHealth: this.def.health, maxHeavyArmor: this.def.heavyArmor });
    // Material propio por enemigo (mismo programa): el destello de impacto es individual.
    this.rig = new CharacterRig(`enemy:${def.id}`, {
      colors: this.def.colors,
      rimColor: this.def.color,
      rimStrength: RIM_BASE,
      hair: this.def.hair,
      bulk: this.def.bulk,
      vest: this.def.vest,
      weapon: this.def.weapon.model,
      uniqueMaterial: true,
    });
    this.baseRim = new Color(this.def.color);
    w.scene.add(this.rig.root);
    this.icon = new Sprite(alertIconMaterial('suspicious'));
    this.icon.scale.set(0.45, 0.45, 0.45);
    this.icon.visible = false;
    this.icon.renderOrder = 20;
    w.scene.add(this.icon);
    if (this.def.weapon.telegraph > 0 && this.def.type === 'marksman') {
      this.laserMat = new MeshBasicMaterial({ color: RED, blending: AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false });
      this.laser = new Mesh(laserGeo, this.laserMat);
      this.laser.visible = false;
      this.laser.frustumCulled = false;
      w.scene.add(this.laser);
    } else {
      this.laser = null;
      this.laserMat = null;
    }
    this.perceiveTimer = (index % 6) * FIXED_DT;
  }

  get alive(): boolean {
    return !this.vitals.dead;
  }

  get state(): AiState {
    return this.brain.state;
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
  fixedUpdate(dt: number, target: PlayerTarget): void {
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    this.recoilVis = Math.max(0, this.recoilVis - dt * 6);
    if (!this.alive) {
      this.mover.fixedUpdate(dt, this.intent);
      return;
    }
    this.perceive(dt, target);
    const p = this.perception;
    p.path = this.pathEvent ?? (this.hasPath ? 'moving' : 'idle');
    this.pathEvent = null;
    p.selfPos.copy(this.mover.feet);
    this.brain.update(dt, p, this.w.tactics, this.cmd);
    // Los eventos de un paso ya se consumieron.
    p.heard = false;
    p.damaged = false;
    p.allyAlert = false;

    this.drive(dt);
    this.mover.fixedUpdate(dt, this.intent);
    this.trackProgress(dt);
    if (this.cmd.fire && target.alive) this.shoot(target);
    this.updateTelegraph(dt, target);
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

  private muzzlePos(out: Vector3): Vector3 {
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
    const engaged = this.brain.state === 'combat' || this.brain.state === 'cover' || this.brain.state === 'flank' || this.brain.state === 'suspicious' || this.brain.state === 'search';
    it.aim = c.hasLook && engaged && (!c.hasMove || !c.run || this.faceTargetT > 0);
    it.camYaw = lookYaw;
    this.mover.setPosture(c.crouch ? 'crouch' : 'stand');
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
    const speed = c.run ? this.def.runScale : this.def.walkScale;
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
    const b = a >= 0 ? nav.nearestNode(goal.x, goal.y, goal.z, 3, nav.comp[a]!) : -1;
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
    const chance = wd.accuracy * this.w.accuracyMult * aimK * distK * moveK * crouchK;
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
    this.w.onShotAtPlayer(this, anyHit, dmg);
  }

  private updateTelegraph(dt: number, t: PlayerTarget): void {
    const k = this.cmd.telegraph;
    if (this.laser && this.laserMat) {
      if (k > 0.01 && this.alive) {
        this.muzzlePos(_muzzle);
        _w.copy(t.chest);
        _dir.subVectors(_w, _muzzle);
        const len = _dir.length();
        this.laser.position.addVectors(_muzzle, _w).multiplyScalar(0.5);
        this.laser.lookAt(_w);
        this.laser.scale.set(0.02 + k * 0.02, 0.02 + k * 0.02, len);
        this.laserMat.color.copy(RED).multiplyScalar(0.6 + k * 1.6);
        this.laser.visible = true;
        this.laserBeepT -= dt;
        if (this.laserBeepT <= 0) {
          this.laserBeepT = 0.32 - k * 0.24;
          this.w.audio.laserBeep(k, _muzzle);
        }
      } else {
        this.laser.visible = false;
        this.laserBeepT = 0;
      }
    }
  }

  // ======================================================== daño
  /** Aplica un impacto. `pierce` = takedown/ejecución. */
  applyHit(amount: number, zone: HitZone, from: Vector3, headMult: number, pierce = false): DamageResult {
    const r = applyDamage(this.vitals, amount, { zone, headMult, pierce });
    if (r.dealt <= 0) return r;
    this.hitFlash = 0.12;
    this.lastHitWasHead = zone === 'head';
    this.perception.damaged = true;
    this.perception.damageFrom.copy(from);
    // Dirección del impacto respecto a la cara (el personaje mira a −Z girado por yaw).
    const dx = from.x - this.mover.feet.x;
    const dz = from.z - this.mover.feet.z;
    const yaw = this.mover.yaw;
    const front = -Math.sin(yaw) * dx - Math.cos(yaw) * dz;
    const right = Math.cos(yaw) * dx - Math.sin(yaw) * dz;
    this.flinch = 1;
    this.flinchSide = right > 0 ? -1 : 1;
    if (r.killed) {
      // Por la espalda cae de bruces; de frente, de espaldas (siempre si fue a la cabeza) o desplomado.
      this.deathStyle = this.thrownT >= 0 ? 1 : front < 0 ? 0 : zone === 'head' || Math.abs(right) < Math.abs(front) * 0.35 ? 1 : 2;
      this.die();
    }
    return r;
  }

  private die(): void {
    this.brain.kill();
    this.mover.kill();
    // Si lo estaban proyectando, la caída sigue donde iba en vez de empezar de pie.
    this.deadFor = this.thrownT >= 0 ? Math.max(0, this.thrownT - THROW_DELAY) : 0;
    this.thrownT = -1;
    // El cuerpo deja de bloquear y de recibir disparos.
    this.mover.collider.setEnabled(false);
    this.icon.visible = false;
    if (this.laser) this.laser.visible = false;
  }

  stun(): void {
    this.brain.stun();
    this.mover.setLocked(true);
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
    this.brain.state = 'patrol';
    this.brain.detection = 0;
    this.brain.hasLastKnown = false;
    this.mover.setLocked(false);
    this.mover.revive(this.home, this.spawnDef.yaw);
    this.hasPath = false;
    this.aimIn = 0;
  }

  // ======================================================== render
  renderUpdate(alpha: number, dt: number): void {
    const m = this.mover;
    m.renderFeet(alpha, this.rig.root.position);
    this.rig.root.rotation.y = m.renderYaw(alpha);
    const pose = this.pose;
    pose.speed = m.stepSpeed(FIXED_DT);
    const vx = m.feet.x - m.prevFeet.x;
    const vz = m.feet.z - m.prevFeet.z;
    pose.moveAngle = Math.hypot(vx, vz) > 1e-4 ? Math.atan2(-vx, -vz) - m.yaw : 0;
    const stunned = this.alive && this.brain.state === 'stunned';
    const thrown = this.alive && this.thrownT >= 0;
    if (thrown) this.thrownT += dt;
    pose.state = this.alive && !thrown ? (stunned ? 'locked' : m.state) : 'dead';
    pose.kneel = stunned && !thrown ? 1 : 0;
    pose.posture = m.posture;
    pose.grounded = m.grounded;
    pose.aim = this.intent.aim ? 1 : 0;
    pose.aimPitch = 0;
    if (!this.alive) this.deadFor += dt;
    pose.stateTime = thrown ? Math.max(0, this.thrownT - THROW_DELAY) : this.alive ? m.stateTime : this.deadFor;
    pose.recoil = this.recoilVis;
    pose.melee = 0;
    this.flinch = Math.max(0, this.flinch - dt * 4.5);
    pose.flinch = this.flinch * this.flinch;
    pose.flinchSide = this.flinchSide;
    pose.death = thrown ? 1 : this.deathStyle;
    this.rig.update(pose, dt);
    // Feedback de impacto y telégrafo del blindado/jefe: el rim se enciende.
    const rim = this.rig.rim;
    if (this.hitFlash > 0) {
      rim.rimColor.value.setRGB(1, 1, 1);
      rim.rimStrength.value = 2.4;
    } else if (this.cmd.telegraph > 0 && !this.laser && this.alive) {
      rim.rimColor.value.copy(this.baseRim).lerp(RED, this.cmd.telegraph);
      rim.rimStrength.value = RIM_BASE + this.cmd.telegraph * 1.6;
    } else {
      rim.rimColor.value.copy(this.baseRim);
      rim.rimStrength.value = this.alive ? RIM_BASE : 0.25;
    }
    // Icono de alerta (? / !) sobre la cabeza.
    if (this.alive && this.cmd.icon !== 'none') {
      this.icon.visible = true;
      this.icon.material = alertIconMaterial(this.cmd.icon === 'alert' ? 'alert' : 'suspicious');
      this.icon.position.set(this.rig.root.position.x, this.rig.root.position.y + (m.posture === 'crouch' ? 1.55 : 2.2), this.rig.root.position.z);
      const s = this.cmd.icon === 'alert' ? 0.5 : 0.32 + this.cmd.detection * 0.16;
      this.icon.scale.set(s, s, s);
    } else {
      this.icon.visible = false;
    }
  }

  dispose(): void {
    this.rig.dispose();
    this.w.scene.remove(this.icon);
    if (this.laser) this.w.scene.remove(this.laser);
    this.laserMat?.dispose();
    this.rig.material.dispose();
    this.w.physics.removeCharacter(this.mover.char);
  }
}
