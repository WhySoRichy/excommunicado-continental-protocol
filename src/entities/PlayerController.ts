import type { CharacterCollision, Collider } from '@dimforge/rapier3d-compat';
import { Vector3 } from 'three';
import { angleDelta, clamp, lerp, moveTowardsAngle } from '../core/math';
import { createRayHit, DEFAULT_KCC, Groups, type CharacterBody, type PhysicsWorld, QueryGroups, type Vec3Like } from '../physics/Physics';
import {
  CHEST_Y,
  COVER,
  copyProbe,
  CoverSensor,
  type CoverSpot,
  emptyProbe,
  emptySpot,
  emptyWrap,
  LOW_Y,
  type WallProbe,
  wrapPoint,
  wrapTurn,
} from './coverSensor';

/** Dimensiones de la cápsula (total = 2·half + 2·radio). */
export const PLAYER_RADIUS = 0.32;
export const STAND_HALF = 0.58; // 1,80 m
export const CROUCH_HALF = 0.25; // 1,14 m

/** Parámetros de movimiento (DISENO §3). Todo en m, s, rad. */
export const MOVE = {
  run: 4.6,
  sprint: 7.0,
  aimWalk: 2.6,
  crouch: 2.2,
  accelGround: 38,
  decelGround: 30,
  accelAir: 9,
  gravity: 22,
  jumpSpeed: 6.5,
  maxFall: 30,
  coyote: 0.12,
  jumpBuffer: 0.12,
  doubleTapWindow: 0.3,
  rollTime: 0.5,
  rollSpeed: 7.6,
  rollEndSpeed: 3.0,
  rollFastPhase: 0.34,
  rollIFrameStart: 0.05,
  rollIFrameEnd: 0.36,
  rollCooldown: 0.35,
  diveUp: 2.4,
  slideTime: 0.7,
  slideStartSpeed: 8.6,
  slideEndSpeed: 3.0,
  slideMinSpeed: 5.0,
  slideCooldown: 0.5,
  slideSteer: 1.6,
  /** Tope duro de velocidad horizontal (diagnóstico de "física rota"). */
  maxHorizontal: 9.5,
  turnRate: 14,
  aimTurnRate: 28,
  vaultMinH: 0.42,
  vaultMaxH: 1.28,
  vaultReach: 1.0,
  vaultMaxDepth: 1.6,
  vaultRiseBase: 0.12,
  vaultRisePerM: 0.12,
  vaultOverSpeed: 4.5,
  vaultExitSpeed: 3.5,
  /** Desviación máxima del plan de vault antes de abortar (m). */
  vaultAbortDev: 0.35,
} as const;

/** `toCover`: corriendo hasta una cobertura para pegarse a ella. */
export type MoveState = 'ground' | 'air' | 'roll' | 'slide' | 'vault' | 'toCover' | 'cover' | 'locked' | 'dead';
export type Posture = 'stand' | 'crouch';
export type CoverHeight = 'low' | 'high';

/** Entrada de un paso fijo, ya traducida desde el Input (testeable sin DOM). */
export interface PlayerIntent {
  moveX: number;
  moveY: number;
  camYaw: number;
  sprint: boolean;
  aim: boolean;
  crouchPressed: boolean;
  /** C mantenida: con una cobertura a la vista, correr a ella. */
  crouchHeld: boolean;
  jumpPressed: boolean;
  dodgePressed: boolean;
  /** Rayo de la mirada (la cámara): elige la cobertura a la que correr. Dirección nula si no hay cámara. */
  lookFrom: Vec3Like;
  lookDir: Vec3Like;
}

export function emptyIntent(): PlayerIntent {
  return {
    moveX: 0,
    moveY: 0,
    camYaw: 0,
    sprint: false,
    aim: false,
    crouchPressed: false,
    crouchHeld: false,
    jumpPressed: false,
    dodgePressed: false,
    lookFrom: { x: 0, y: 0, z: 0 },
    lookDir: { x: 0, y: 0, z: 0 },
  };
}

/** Lo que muestra el HUD sobre lo que harían Espacio y C ahora mismo (`peekContext`). */
export interface MoveHint {
  vault: 'vault' | 'mantle' | null;
  /** C pulsada: cobertura al alcance (su altura). */
  cover: CoverHeight | null;
  /** Adónde iría con C (pulsada si hay `cover`; mantenida si no), o null. */
  spot: CoverSpot | null;
  /** En la alta, lejos de un borde: el más cercano al que iría solo al apuntar (−1/+1), o 0. */
  edge: number;
}

interface VaultPlan {
  start: Vector3;
  p1: Vector3;
  p2: Vector3;
  dir: Vector3;
  dur1: number;
  dur2: number;
  mantle: boolean;
}

function newPlan(): VaultPlan {
  return { start: new Vector3(), p1: new Vector3(), p2: new Vector3(), dir: new Vector3(), dur1: 0, dur2: 0, mantle: false };
}

function copyPlan(a: VaultPlan, b: VaultPlan): void {
  b.start.copy(a.start);
  b.p1.copy(a.p1);
  b.p2.copy(a.p2);
  b.dir.copy(a.dir);
  b.dur1 = a.dur1;
  b.dur2 = a.dur2;
  b.mantle = a.mantle;
}

export interface CoverInfo {
  normal: Vector3;
  height: CoverHeight;
  /** −1/0/+1: en qué borde está detenido (0 = ninguno). */
  edge: number;
  /** −1/0/+1: borde de una cobertura alta al alcance para asomarse (según se mira la pared: −1 izquierda). */
  edgeNear: number;
  /** Lado por el que está asomado (−1/+1) o 0; se mantiene mientras vuelve a la pared. */
  peekSide: number;
  /** Cuánto ha salido de lado al asomarse (m, con signo: + derecha). */
  peekOffset: number;
  /** Borde superior sobre los pies (m): por encima se dispara a ciegas en la baja. */
  top: number;
  /** Con qué fuerza llegó (0..1): la animación apoya la mano y el cuerpo en la pared. */
  impact: number;
  /** Al apuntar en la alta lejos de un borde, el lado del borde al que va solo (−1/+1), o 0. */
  seek: number;
  /** Rodeando una esquina: avance 0..1, o −1. */
  wrap: number;
}

function emptyCover(): CoverInfo {
  return { normal: new Vector3(0, 0, 1), height: 'low', edge: 0, edgeNear: 0, peekSide: 0, peekOffset: 0, top: 1.2, impact: 0, seek: 0, wrap: -1 };
}

/** La misma intención sin la pulsación de C (la consumió la cobertura). */
function noCrouch(it: PlayerIntent): PlayerIntent {
  return { ...it, crouchPressed: false, crouchHeld: false };
}

/**
 * El movimiento de un personaje como objeto plano (fase 3 de docs/ESCALABILIDAD.md): lo que viaja por la red y lo
 * que basta para dibujarlo y para que el combate y los enemigos lo traten igual que a uno simulado aquí.
 */
export interface MoveNet {
  x: number;
  y: number;
  z: number;
  yaw: number;
  state: MoveState;
  posture: Posture;
  grounded: boolean;
  stateTime: number;
  aiming: boolean;
  sprinting: boolean;
  invulnerable: boolean;
  /** Avance del vault 0..1, o −1 sin vault. */
  vault: number;
  /** En cobertura: hacia dónde mira la pared, su altura, el asomado, el borde al alcance, la altura de su borde superior y la llegada; null fuera de ella. */
  cover: CoverNet | null;
  /** Volteretas y planchas hechas (el combate lo usa para saber cuándo esquivó). */
  dodges: number;
}

export interface CoverNet {
  nx: number;
  nz: number;
  height: CoverHeight;
  peekSide: number;
  peekOffset: number;
  edgeNear: number;
  top: number;
  impact: number;
}

export function emptyCoverNet(): CoverNet {
  return { nx: 0, nz: 0, height: 'low', peekSide: 0, peekOffset: 0, edgeNear: 0, top: 1.2, impact: 0 };
}

export function emptyMoveNet(): MoveNet {
  return {
    x: 0,
    y: 0,
    z: 0,
    yaw: 0,
    state: 'ground',
    posture: 'stand',
    grounded: true,
    stateTime: 0,
    aiming: false,
    sprinting: false,
    invulnerable: false,
    vault: -1,
    cover: null,
    dodges: 0,
  };
}

/**
 * Asomarse por el borde de una cobertura alta: cuánto sale de lado (m) y a qué velocidad máxima (m/s). Por la
 * izquierda sale más porque el arma va en la mano derecha y tiene que despejar la esquina.
 */
const PEEK_OUT_RIGHT = 0.55;
const PEEK_OUT_LEFT = 0.75;
const PEEK_SPEED = 4;
/** C pulsada busca la pared en un abanico de ±25° alrededor de la marcha o de la mirada. */
const NEAR_FAN = 0.44;
/** Un borde de la alta está al alcance para asomarse si la pared se acaba a esta distancia del centro (m). */
const EDGE_REACH = PLAYER_RADIUS * 0.9 + 0.12;

export interface PlayerMoveStats {
  jumps: number;
  vaults: number;
  mantles: number;
  rolls: number;
  dives: number;
  slides: number;
  coverEnters: number;
  /** Esquinas exteriores rodeadas sin soltarse de la cobertura. */
  coverWraps: number;
  sprintTime: number;
  distance: number;
}

/** Forward horizontal a partir de un yaw (yaw = 0 mira a −Z). */
export function yawForward(yaw: number, out: Vector3): Vector3 {
  return out.set(-Math.sin(yaw), 0, -Math.cos(yaw));
}

export function yawFromDir(x: number, z: number): number {
  return Math.atan2(-x, -z);
}

/** Contactos cuya normal apunta hacia abajo más que esto son techo. */
const CEILING_NORMAL_Y = 0.5;

const _wish = new Vector3();
const _tmp = new Vector3();
const _tmp2 = new Vector3();
const _fwd = new Vector3();
const _probe = new Vector3();
const _down = new Vector3(0, -1, 0);

/**
 * Controlador de movimiento del jugador (solo simulación, sin render).
 * Toda la colisión pasa por el KinematicCharacterController de Rapier (R5):
 * shape casts → no hay túnel a ninguna velocidad.
 */
export class PlayerController {
  readonly physics: PhysicsWorld;
  readonly char: CharacterBody;
  readonly feet = new Vector3();
  readonly prevFeet = new Vector3();
  readonly velocity = new Vector3();
  yaw = 0;
  prevYaw = 0;
  state: MoveState = 'ground';
  posture: Posture = 'stand';
  grounded = true;
  stateTime = 0;
  sprinting = false;
  aiming = false;
  invulnerable = false;
  cover: CoverInfo | null = null;
  /** Multiplicador de velocidad (solo debug/QA de estrés). */
  speedMultiplier = 1;
  killY = -50;
  readonly stats: PlayerMoveStats = {
    jumps: 0,
    vaults: 0,
    mantles: 0,
    rolls: 0,
    dives: 0,
    slides: 0,
    coverEnters: 0,
    coverWraps: 0,
    sprintTime: 0,
    distance: 0,
  };
  /** Diagnósticos de QA (deben quedar en 0). */
  nanResets = 0;
  killPlaneResets = 0;
  maxHorizontalSpeed = 0;
  /** Último suelo firme (red de seguridad). */
  readonly lastSafe = new Vector3();
  lastSafeYaw = 0;

  private time = 0;
  private coyote = 0;
  private jumpBuffer = 0;
  private lastJumpTime = -10;
  private airDiveUsed = false;
  private rollCooldown = 0;
  private slideCooldown = 0;
  private slideSpeed0 = 0;
  private readonly rollDir = new Vector3();
  private readonly slideDir = new Vector3();
  private vault: VaultPlan | null = null;
  private snapOn = true;
  private safeTimer = 0;
  private readonly kccOut = { x: 0, y: 0, z: 0 };
  private readonly colOut: CharacterCollision;
  private readonly desired = { x: 0, y: 0, z: 0 };
  private readonly hit = createRayHit();
  private readonly center = new Vector3();
  /** Avance del vault recibido por red (null si este personaje se simula aquí). */
  private netVault: number | null = null;
  /** Consultas de la cobertura contra el escenario. */
  private readonly sensor: CoverSensor;
  /** Los datos de la cobertura (se reutilizan: `cover` apunta aquí o es null). */
  private readonly coverInfo = emptyCover();
  /** La pared en la que se está, sondeada en cada paso. */
  private readonly here = emptyProbe();
  private readonly corner = emptyProbe();
  /** Adónde corre (estado `toCover`), y las coberturas candidatas de este paso. */
  private readonly run = emptySpot();
  private readonly nearSpot = emptySpot();
  private readonly lookSpot = emptySpot();
  private readonly hintSpot = emptySpot();
  private runPeak = 0;
  private runMaxT = 0;
  /** C pulsada con una cobertura a la vista: se decide al soltar (agacharse o salir) o al cumplir el tiempo (correr). */
  private holding = false;
  private holdT = 0;
  /** Empuje contra un borde para rodear la esquina (negativo: espera tras un intento fallido). */
  private edgePush = 0;
  private readonly wrapPlan = emptyWrap();
  private wrapT = 0;
  /** Tras doblar una esquina, la dirección se mantiene mientras no cambie la tecla. */
  private readonly latch = { on: false, x: 0, y: 0, s: 0 };
  private seekTried = false;
  private readonly hint: MoveHint = { vault: null, cover: null, spot: null, edge: 0 };

  /** Grupos de colisión del personaje (jugador o enemigo: el mismo motor robusto para ambos). */
  readonly groups: number;

  constructor(physics: PhysicsWorld, spawn: Vector3, yaw: number, groups: number = Groups.PLAYER) {
    this.physics = physics;
    this.groups = groups;
    this.center.set(spawn.x, spawn.y + STAND_HALF + PLAYER_RADIUS, spawn.z);
    this.char = physics.createCharacter(this.center, PLAYER_RADIUS, STAND_HALF, groups);
    this.sensor = new CoverSensor(physics, this.char.collider, PLAYER_RADIUS, CROUCH_HALF);
    this.colOut = new physics.R.CharacterCollision();
    this.feet.copy(spawn);
    this.prevFeet.copy(spawn);
    this.yaw = this.prevYaw = yaw;
    this.lastSafe.copy(spawn);
    this.lastSafeYaw = yaw;
  }

  get collider(): Collider {
    return this.char.collider;
  }

  get halfHeight(): number {
    return this.posture === 'stand' ? STAND_HALF : CROUCH_HALF;
  }

  /** Altura total actual de la cápsula. */
  get height(): number {
    return 2 * (this.halfHeight + PLAYER_RADIUS);
  }

  /** Centro de la cápsula en mundo. */
  centerOf(out: Vector3): Vector3 {
    return out.set(this.feet.x, this.feet.y + this.halfHeight + PLAYER_RADIUS, this.feet.z);
  }

  /** Velocidad horizontal pretendida (m/s). */
  get horizontalSpeed(): number {
    return Math.hypot(this.velocity.x, this.velocity.z);
  }

  /** Velocidad horizontal REAL del último paso (desplazamiento / dt): la usan animación y slide. */
  stepSpeed(dt: number): number {
    return dt > 0 ? Math.hypot(this.feet.x - this.prevFeet.x, this.feet.z - this.prevFeet.z) / dt : 0;
  }

  teleport(feet: Vector3, yaw: number): void {
    if (this.posture === 'crouch' && !this.setPosture('stand')) {
      // Sin espacio para estar de pie en el destino: se mantiene agachado.
    }
    this.feet.copy(feet);
    this.prevFeet.copy(feet);
    this.velocity.set(0, 0, 0);
    this.yaw = this.prevYaw = yaw;
    this.state = 'ground';
    this.stateTime = 0;
    this.vault = null;
    this.cover = null;
    this.holding = false;
    this.invulnerable = false;
    this.syncCollider();
  }

  /**
   * Al pausar por pérdida de foco/pointer lock: se anula la inercia horizontal en el suelo
   * para que al reanudar el personaje no siga deslizándose (la intención se reseteó).
   */
  haltOnPause(): void {
    if (this.state === 'ground' || this.state === 'cover') {
      this.velocity.x = 0;
      this.velocity.z = 0;
    }
  }

  /** Bloquea el control (takedown, cinemática). */
  setLocked(on: boolean): void {
    if (on) {
      this.exitCover();
      this.state = 'locked';
      this.velocity.set(0, this.velocity.y, 0);
    } else if (this.state === 'locked') {
      this.state = this.grounded ? 'ground' : 'air';
    }
    this.stateTime = 0;
  }

  kill(): void {
    this.exitCover();
    this.vault = null;
    this.state = 'dead';
    this.stateTime = 0;
    this.invulnerable = false;
  }

  revive(feet: Vector3, yaw: number): void {
    this.state = 'ground';
    this.teleport(feet, yaw);
  }

  private syncCollider(): void {
    this.centerOf(this.center);
    this.char.collider.setTranslation(this.center);
  }

  /** Cambia de postura. Ponerse de pie exige espacio libre (nunca te traba en el techo). */
  setPosture(p: Posture): boolean {
    if (p === this.posture) return true;
    if (p === 'stand' && !this.hasStandRoom()) return false;
    this.posture = p;
    this.char.collider.setHalfHeight(this.halfHeight);
    this.syncCollider();
    return true;
  }

  hasStandRoom(at: Vector3 = this.feet): boolean {
    _tmp.set(at.x, at.y + STAND_HALF + PLAYER_RADIUS + 0.03, at.z);
    return this.physics.overlapsCapsule(_tmp, PLAYER_RADIUS - 0.02, STAND_HALF, QueryGroups.STATIC_AND_ENEMIES, this.char.collider) === null;
  }

  private setSnap(on: boolean): void {
    if (on === this.snapOn) return;
    this.snapOn = on;
    if (on) this.char.controller.enableSnapToGround(DEFAULT_KCC.snapToGround);
    else this.char.controller.disableSnapToGround();
  }

  private setState(s: MoveState): void {
    if (s === this.state) return;
    this.state = s;
    this.stateTime = 0;
    if (s !== 'ground' && s !== 'cover') this.holding = false;
  }

  // =====================================================================
  fixedUpdate(dt: number, it: PlayerIntent): void {
    this.time += dt;
    this.prevFeet.copy(this.feet);
    this.prevYaw = this.yaw;
    this.stateTime += dt;
    this.rollCooldown = Math.max(0, this.rollCooldown - dt);
    this.slideCooldown = Math.max(0, this.slideCooldown - dt);
    this.coyote = Math.max(0, this.coyote - dt);
    this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);
    if (it.jumpPressed) this.jumpBuffer = MOVE.jumpBuffer;
    this.aiming = it.aim && this.state !== 'dead' && this.state !== 'locked';

    // Dirección deseada relativa a la cámara.
    const fx = -Math.sin(it.camYaw);
    const fz = -Math.cos(it.camYaw);
    const rx = Math.cos(it.camYaw);
    const rz = -Math.sin(it.camYaw);
    _wish.set(fx * it.moveY + rx * it.moveX, 0, fz * it.moveY + rz * it.moveX);
    const wishLen = Math.min(1, _wish.length());
    if (wishLen > 1e-4) _wish.multiplyScalar(1 / _wish.length());

    switch (this.state) {
      case 'ground':
        this.stepGround(dt, it, wishLen);
        break;
      case 'air':
        this.stepAir(dt, it, wishLen);
        break;
      case 'roll':
        this.stepRoll(dt);
        break;
      case 'slide':
        this.stepSlide(dt, it, wishLen);
        break;
      case 'vault':
        this.stepVault(dt);
        break;
      case 'toCover':
        this.stepToCover(dt, it, wishLen);
        break;
      case 'cover':
        this.stepCover(dt, it, wishLen);
        break;
      case 'locked':
        this.velocity.x = 0;
        this.velocity.z = 0;
        this.applyGravity(dt);
        this.move(dt, true);
        break;
      case 'dead':
        this.velocity.x *= 0.85;
        this.velocity.z *= 0.85;
        this.applyGravity(dt);
        this.move(dt, true);
        break;
    }

    this.updateFacing(dt, it);
    this.afterStep(dt);
  }

  // ---------------------------------------------------------------------
  private stepGround(dt: number, it: PlayerIntent, wishLen: number): void {
    const hs = this.horizontalSpeed;
    yawForward(it.camYaw, _fwd);
    const forwardness = wishLen > 0 ? _wish.dot(_fwd) : 0;
    this.sprinting = it.sprint && !this.aiming && wishLen > 0.5 && forwardness > 0.45 && this.posture === 'stand';

    if (it.crouchPressed) {
      if (hs > MOVE.slideMinSpeed && this.slideCooldown <= 0) {
        this.startSlide(wishLen);
        this.stepSlide(dt, it, wishLen);
        return;
      }
      // La misma pulsación de C no debe sacarlo de la cobertura: el paso de cobertura empieza en el siguiente tick.
      if (this.tryEnterCover(it, wishLen)) return;
      // Con una cobertura a la vista, C se decide al soltarla (agacharse) o al mantenerla (correr a ella).
      if (this.lookCover(it.lookFrom, it.lookDir, null)) this.beginHold();
      else this.togglePosture();
    } else if (this.holding) {
      const go = this.stepHold(dt, it, null);
      if (go === 'tap') this.togglePosture();
      else if (go === 'run') {
        this.startRun(this.lookSpot);
        if (this.state === 'toCover') this.stepToCover(dt, it, wishLen);
        return;
      }
    }

    if (it.dodgePressed && this.rollCooldown <= 0) {
      this.startRoll(wishLen, false);
      this.stepRoll(dt);
      return;
    }

    if (this.jumpBuffer > 0) {
      this.jumpBuffer = 0;
      const dir = wishLen > 0.3 ? _tmp2.copy(_wish) : yawForward(this.yaw, _tmp2);
      if (this.time - this.lastJumpTime < MOVE.doubleTapWindow && this.rollCooldown <= 0) {
        this.startRoll(wishLen, false);
        this.stepRoll(dt);
        return;
      }
      if (this.tryVault(dir)) {
        this.stepVault(dt);
        return;
      }
      if (this.posture === 'stand' || this.setPosture('stand')) {
        this.doJump();
        this.stepAir(dt, it, wishLen);
        return;
      }
    }

    const maxSpeed = this.posture === 'crouch' ? MOVE.crouch : this.aiming ? MOVE.aimWalk : this.sprinting ? MOVE.sprint : MOVE.run;
    this.accelerate(dt, maxSpeed * wishLen * this.speedMultiplier, MOVE.accelGround, MOVE.decelGround);
    // En el suelo no se empuja hacia abajo: lo mantiene pegado `snapToGround`. Con un empuje de −1 m/s, Rapier daba
    // por bloqueados pasos sueltos en llano (los pies quedaban dentro de su margen de separación) y el personaje
    // perdía uno de cada 20 o 30 pasos al correr: un tirón del cuerpo y de la cámara. Igual al rodar, deslizarse y en cobertura.
    this.velocity.y = 0;
    this.move(dt, true);
    if (this.sprinting) this.stats.sprintTime += dt;
    if (!this.grounded) {
      this.coyote = MOVE.coyote;
      this.velocity.y = 0;
      this.setState('air');
    }
  }

  private doJump(): void {
    this.velocity.y = MOVE.jumpSpeed;
    this.lastJumpTime = this.time;
    this.airDiveUsed = false;
    this.coyote = 0;
    this.grounded = false;
    this.stats.jumps++;
    this.setState('air');
  }

  private stepAir(dt: number, it: PlayerIntent, wishLen: number): void {
    this.sprinting = false;
    if (this.jumpBuffer > 0) {
      if (this.coyote > 0) {
        this.jumpBuffer = 0;
        this.doJump();
      } else if (this.time - this.lastJumpTime < MOVE.doubleTapWindow && !this.airDiveUsed && this.rollCooldown <= 0) {
        this.jumpBuffer = 0;
        this.startRoll(wishLen, true);
        this.stepRoll(dt);
        return;
      }
    }
    if (it.dodgePressed && !this.airDiveUsed && this.rollCooldown <= 0) {
      this.startRoll(wishLen, true);
      this.stepRoll(dt);
      return;
    }
    const target = Math.max(MOVE.run, this.horizontalSpeed) * wishLen * this.speedMultiplier;
    this.accelerate(dt, target, MOVE.accelAir, MOVE.accelAir * 0.3);
    this.applyGravity(dt);
    this.move(dt, false);
    if (this.grounded && this.velocity.y <= 0) {
      this.velocity.y = 0;
      this.setState('ground');
    }
  }

  private applyGravity(dt: number): void {
    this.velocity.y = Math.max(-MOVE.maxFall, this.velocity.y - MOVE.gravity * dt);
  }

  /** Acelera la velocidad horizontal hacia `_wish * targetSpeed`. */
  private accelerate(dt: number, targetSpeed: number, accel: number, decel: number): void {
    const tx = _wish.x * targetSpeed;
    const tz = _wish.z * targetSpeed;
    const dx = tx - this.velocity.x;
    const dz = tz - this.velocity.z;
    const dl = Math.hypot(dx, dz);
    if (dl < 1e-6) return;
    const speeding = targetSpeed * targetSpeed > this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z;
    const maxD = (speeding ? accel : decel) * dt;
    const k = dl > maxD ? maxD / dl : 1;
    this.velocity.x += dx * k;
    this.velocity.z += dz * k;
  }

  // ---------------------------------------------------------------------
  private startRoll(wishLen: number, dive: boolean): void {
    this.exitCover();
    if (wishLen > 0.2) this.rollDir.copy(_wish);
    else yawForward(this.yaw, this.rollDir);
    this.setPosture('crouch');
    if (dive) {
      this.airDiveUsed = true;
      this.velocity.y = Math.max(this.velocity.y, MOVE.diveUp);
      this.stats.dives++;
    } else {
      this.stats.rolls++;
    }
    this.vault = null;
    this.setState('roll');
  }

  private stepRoll(dt: number): void {
    const t = this.stateTime;
    this.invulnerable = t >= MOVE.rollIFrameStart && t <= MOVE.rollIFrameEnd;
    const speed =
      t < MOVE.rollFastPhase
        ? MOVE.rollSpeed
        : lerp(MOVE.rollSpeed, MOVE.rollEndSpeed, clamp((t - MOVE.rollFastPhase) / (MOVE.rollTime - MOVE.rollFastPhase), 0, 1));
    this.velocity.x = this.rollDir.x * speed * this.speedMultiplier;
    this.velocity.z = this.rollDir.z * speed * this.speedMultiplier;
    if (this.grounded && this.velocity.y <= 0) this.velocity.y = 0;
    else this.applyGravity(dt);
    this.move(dt, this.grounded && this.velocity.y <= 0);
    if (t >= MOVE.rollTime) {
      this.invulnerable = false;
      this.rollCooldown = MOVE.rollCooldown;
      this.clampHorizontal(MOVE.run);
      this.setPosture('stand');
      this.setState(this.grounded ? 'ground' : 'air');
    }
  }

  private startSlide(wishLen: number): void {
    const hs = this.horizontalSpeed;
    if (hs > 0.5) this.slideDir.set(this.velocity.x / hs, 0, this.velocity.z / hs);
    else if (wishLen > 0.2) this.slideDir.copy(_wish);
    else yawForward(this.yaw, this.slideDir);
    this.slideSpeed0 = Math.max(hs, MOVE.slideStartSpeed);
    this.setPosture('crouch');
    this.stats.slides++;
    this.setState('slide');
  }

  private stepSlide(dt: number, it: PlayerIntent, wishLen: number): void {
    const k = clamp(this.stateTime / MOVE.slideTime, 0, 1);
    const ease = 1 - (1 - k) * (1 - k);
    const speed = lerp(this.slideSpeed0, MOVE.slideEndSpeed, ease);
    if (wishLen > 0.2) {
      // Giro limitado hacia la dirección deseada.
      const cur = yawFromDir(this.slideDir.x, this.slideDir.z);
      const tgt = yawFromDir(_wish.x, _wish.z);
      yawForward(moveTowardsAngle(cur, tgt, MOVE.slideSteer * dt), this.slideDir);
    }
    if (it.dodgePressed && this.rollCooldown <= 0) {
      this.startRoll(wishLen, false);
      return;
    }
    if (this.jumpBuffer > 0 && this.setPosture('stand')) {
      this.jumpBuffer = 0;
      this.clampHorizontal(MOVE.sprint);
      this.slideCooldown = MOVE.slideCooldown;
      this.doJump();
      return;
    }
    this.velocity.x = this.slideDir.x * speed * this.speedMultiplier;
    this.velocity.z = this.slideDir.z * speed * this.speedMultiplier;
    this.velocity.y = 0;
    this.move(dt, true);
    // Bloqueado = el desplazamiento REAL de este paso es pequeño (la velocidad no se recorta contra paredes).
    const blocked = this.stateTime > 0.12 && this.stepSpeed(dt) < 1.5;
    if (!this.grounded) {
      this.slideCooldown = MOVE.slideCooldown;
      this.velocity.y = 0;
      this.setState('air');
      return;
    }
    // Deslizándose contra una pared que cubre, termina a cubierto.
    if (this.sensor.probe(this.feet, this.slideDir.x, this.slideDir.z, PLAYER_RADIUS + 0.2, this.here)) {
      this.slideCooldown = MOVE.slideCooldown;
      this.enterCover(this.here, clamp(speed / MOVE.slideStartSpeed, 0.5, 1));
      return;
    }
    if (k >= 1 || blocked) {
      this.slideCooldown = MOVE.slideCooldown;
      // Si sigue corriendo y hay espacio, se levanta; si no, queda agachado.
      if (it.sprint || it.moveY > 0.3) this.setPosture('stand');
      this.setState('ground');
    }
  }

  private clampHorizontal(max: number): void {
    const hs = this.horizontalSpeed;
    if (hs > max) {
      this.velocity.x *= max / hs;
      this.velocity.z *= max / hs;
    }
  }

  // ---------------------------------------------------------------------
  /** Vault/mantle: plan validado contra la geometría antes de empezar. */
  tryVault(dir: Vector3): boolean {
    const plan = this.planVault(dir);
    if (!plan) return false;
    this.exitCover();
    this.setPosture('crouch');
    copyPlan(plan, this.activePlan);
    this.vault = this.activePlan;
    if (plan.mantle) this.stats.mantles++;
    else this.stats.vaults++;
    this.velocity.set(0, 0, 0);
    this.setState('vault');
    return true;
  }

  /** Consulta pura (sin efectos): ¿hay vault/mantle posible en `dir`? Usada también por el HUD. */
  planVault(dir: Vector3): VaultPlan | null {
    if (!this.grounded) return null;
    const ph = this.physics;
    const h = this.hit;
    _probe.set(this.feet.x, this.feet.y + 0.3, this.feet.z);
    if (!ph.raycast(_probe, dir, MOVE.vaultReach, QueryGroups.STATIC, h, this.char.collider)) return null;
    if (Math.abs(h.normal.y) > 0.3 || h.normal.x * dir.x + h.normal.z * dir.z > -0.5) return null;
    const faceDist = h.distance;
    const hx = h.point.x;
    const hz = h.point.z;
    // Altura de la parte superior.
    _probe.set(hx + dir.x * 0.25, this.feet.y + MOVE.vaultMaxH + 0.45, hz + dir.z * 0.25);
    if (!ph.raycast(_probe, _down, MOVE.vaultMaxH + 0.45, QueryGroups.STATIC, h, this.char.collider)) return null;
    if (h.normal.y < 0.8) return null;
    const topY = h.point.y;
    const height = topY - this.feet.y;
    if (height < MOVE.vaultMinH || height > MOVE.vaultMaxH) return null;
    // Espacio para pasar encogido por encima.
    const overFeetY = topY + 0.1;
    _tmp.set(hx + dir.x * 0.3, overFeetY + CROUCH_HALF + PLAYER_RADIUS, hz + dir.z * 0.3);
    if (ph.overlapsCapsule(_tmp, PLAYER_RADIUS - 0.02, CROUCH_HALF, QueryGroups.STATIC, this.char.collider)) return null;

    // Borde lejano: primer punto donde ya no hay techo de caja debajo.
    let far = -1;
    for (let s = 0.35; s <= MOVE.vaultMaxDepth + 0.01; s += 0.35) {
      _probe.set(hx + dir.x * s, topY + 0.3, hz + dir.z * s);
      if (!ph.raycast(_probe, _down, 0.45, QueryGroups.STATIC, h, this.char.collider)) {
        far = s;
        break;
      }
    }
    const plan = this.scratchPlan;
    plan.start.copy(this.feet);
    const approach = Math.max(0, faceDist - PLAYER_RADIUS - 0.08);
    plan.p1.set(this.feet.x + dir.x * approach, overFeetY, this.feet.z + dir.z * approach);
    plan.mantle = false;
    if (far > 0) {
      // ¿Hay suelo y espacio al otro lado?
      const lx = hx + dir.x * (far + PLAYER_RADIUS + 0.12);
      const lz = hz + dir.z * (far + PLAYER_RADIUS + 0.12);
      _probe.set(lx, topY + 0.3, lz);
      const ground = ph.raycast(_probe, _down, height + 2.5, QueryGroups.STATIC, h, this.char.collider);
      const landY = ground ? h.point.y : -Infinity;
      _tmp.set(lx, overFeetY + CROUCH_HALF + PLAYER_RADIUS, lz);
      const clear = ph.overlapsCapsule(_tmp, PLAYER_RADIUS - 0.02, CROUCH_HALF, QueryGroups.STATIC, this.char.collider) === null;
      if (ground && clear && landY > this.feet.y - 3) plan.p2.set(lx, overFeetY, lz);
      else far = -1;
    }
    if (far < 0) {
      // Mantle: subirse encima (necesita espacio agachado arriba).
      plan.mantle = true;
      const mx = hx + dir.x * 0.55;
      const mz = hz + dir.z * 0.55;
      plan.p2.set(mx, topY + 0.02, mz);
      _tmp.set(mx, topY + 0.04 + CROUCH_HALF + PLAYER_RADIUS, mz);
      if (ph.overlapsCapsule(_tmp, PLAYER_RADIUS - 0.02, CROUCH_HALF, QueryGroups.STATIC, this.char.collider)) return null;
    }
    plan.dir.copy(dir);
    plan.dur1 = MOVE.vaultRiseBase + MOVE.vaultRisePerM * height;
    plan.dur2 = Math.max(0.12, Math.hypot(plan.p2.x - plan.p1.x, plan.p2.z - plan.p1.z) / MOVE.vaultOverSpeed);
    return plan;
  }

  private readonly scratchPlan: VaultPlan = newPlan();
  private readonly activePlan: VaultPlan = newPlan();

  /** El último resultado de `peekContext` (la marca de la cobertura lo lee sin repetir la consulta). */
  get moveHint(): MoveHint {
    return this.hint;
  }

  /**
   * Consulta para el HUD (sin efectos): qué haría Espacio y C ahora mismo. `camYaw` y el eje de movimiento definen la
   * dirección que se sondea; el rayo de la mirada, la cobertura a la que correría.
   */
  peekContext(camYaw: number, moveX: number, moveY: number, lookFrom: Vec3Like, lookDir: Vec3Like): MoveHint {
    const out = this.hint;
    out.vault = null;
    out.cover = null;
    out.spot = null;
    out.edge = 0;
    if (this.state === 'cover' && this.cover) {
      const c = this.cover;
      if (c.wrap < 0 && this.lookCover(lookFrom, lookDir, this.here, this.hintSpot)) out.spot = this.hintSpot;
      if (c.height === 'high' && c.edgeNear === 0 && c.peekSide === 0 && c.wrap < 0) out.edge = this.nearestEdge(camYaw);
      return out;
    }
    if (this.state !== 'ground' || !this.grounded) return out;
    const fx = -Math.sin(camYaw);
    const fz = -Math.cos(camYaw);
    const rx = Math.cos(camYaw);
    const rz = -Math.sin(camYaw);
    _tmp2.set(fx * moveY + rx * moveX, 0, fz * moveY + rz * moveX);
    if (_tmp2.lengthSq() < 0.09) yawForward(camYaw, _tmp2);
    else _tmp2.normalize();
    const plan = this.planVault(_tmp2);
    if (plan) out.vault = plan.mantle ? 'mantle' : 'vault';
    if (this.sensor.find(this.feet, _tmp2.x, _tmp2.z, COVER.near, NEAR_FAN, 5, this.hintSpot)) {
      out.cover = this.hintSpot.height;
      out.spot = this.hintSpot;
    } else if (this.lookCover(lookFrom, lookDir, null, this.hintSpot)) out.spot = this.hintSpot;
    return out;
  }

  /** Progreso del vault en curso (0..1), o −1 si no hay. */
  get vaultProgress(): number {
    if (this.netVault !== null) return this.netVault;
    const v = this.vault;
    if (this.state !== 'vault' || !v) return -1;
    return Math.min(1, this.stateTime / Math.max(1e-3, v.dur1 + v.dur2));
  }

  private stepVault(dt: number): void {
    const v = this.vault;
    if (!v) {
      this.setState('air');
      return;
    }
    const t = this.stateTime;
    const target = _tmp;
    if (t <= v.dur1) target.lerpVectors(v.start, v.p1, t / v.dur1);
    else target.lerpVectors(v.p1, v.p2, Math.min(1, (t - v.dur1) / v.dur2));
    this.velocity.set((target.x - this.feet.x) / dt, (target.y - this.feet.y) / dt, (target.z - this.feet.z) / dt);
    this.move(dt, false, false);
    const dev = this.feet.distanceTo(target);
    if (dev > MOVE.vaultAbortDev) {
      // Algo inesperado bloqueó el plan: se aborta a caída libre (nunca atascado).
      this.vault = null;
      this.velocity.set(0, 0, 0);
      this.setPosture('stand');
      this.setState('air');
      return;
    }
    if (t >= v.dur1 + v.dur2) {
      const mantle = v.mantle;
      const dir = v.dir;
      this.vault = null;
      this.setPosture('stand');
      if (mantle) {
        this.velocity.set(0, -1, 0);
        this.setState('ground');
      } else {
        this.velocity.set(dir.x * MOVE.vaultExitSpeed, 0, dir.z * MOVE.vaultExitSpeed);
        this.setState('air');
      }
    }
  }

  // ---------------------------------------------------------------------
  // Cobertura (DISENO §3): entrar desde cerca o corriendo a la que se mira, recorrerla doblando rincones y esquinas,
  // pasar de una a otra y disparar asomado o a ciegas. Las consultas al escenario están en `coverSensor.ts`.

  /** C pulsada: la pared más cercana hacia donde se anda (o se mira) a menos de `COVER.near`. Corre a ella si no está pegado. */
  tryEnterCover(it: PlayerIntent, wishLen: number): boolean {
    if (!this.grounded) return false;
    const dir = wishLen > 0.3 ? _tmp2.copy(_wish) : yawForward(it.camYaw, _tmp2);
    if (!this.sensor.find(this.feet, dir.x, dir.z, COVER.near, NEAR_FAN, 5, this.nearSpot)) return false;
    this.startRun(this.nearSpot);
    return true;
  }

  /** La cobertura que se mira (a menos de `COVER.far`), fuera de la pared `avoid`. La escribe en `out`. */
  private lookCover(from: Vec3Like, dir: Vec3Like, avoid: WallProbe | null, out: CoverSpot = this.lookSpot): boolean {
    if (!this.grounded || (dir.x === 0 && dir.y === 0 && dir.z === 0)) return false;
    return this.sensor.look(from, dir, this.feet, COVER.far, out, avoid);
  }

  private beginHold(): void {
    this.holding = true;
    this.holdT = 0;
  }

  /** C sigue pulsada con una cobertura a la vista: 'tap' si se soltó antes de tiempo, 'run' si toca correr. */
  private stepHold(dt: number, it: PlayerIntent, avoid: WallProbe | null): 'wait' | 'tap' | 'run' | 'lost' {
    if (!it.crouchHeld) {
      this.holding = false;
      return 'tap';
    }
    this.holdT += dt;
    if (this.holdT < COVER.hold) return 'wait';
    this.holding = false;
    return this.lookCover(it.lookFrom, it.lookDir, avoid) ? 'run' : 'lost';
  }

  private togglePosture(): void {
    this.setPosture(this.posture === 'stand' ? 'crouch' : 'stand');
  }

  /** Empieza a correr hacia una cobertura (o se pega a ella si ya está ahí). */
  private startRun(s: CoverSpot): void {
    const d = Math.hypot(s.x - this.feet.x, s.z - this.feet.z);
    if (d < 0.12 && this.sensor.probe(this.feet, -s.nx, -s.nz, COVER.probe, this.here)) {
      this.enterCover(this.here, 0);
      return;
    }
    const r = this.run;
    copyProbe(s, r);
    r.x = s.x;
    r.y = s.y;
    r.z = s.z;
    this.cover = null;
    this.runPeak = this.horizontalSpeed;
    this.runMaxT = d / COVER.run + 0.6;
    if (this.posture === 'crouch' && (s.height === 'high' || d > 1)) this.setPosture('stand');
    this.setState('toCover');
  }

  private stepToCover(dt: number, it: PlayerIntent, wishLen: number): void {
    const r = this.run;
    if (it.dodgePressed && this.rollCooldown <= 0) {
      this.startRoll(wishLen, false);
      this.stepRoll(dt);
      return;
    }
    // Otra pulsación de C o apuntar: se queda donde está.
    if (it.crouchPressed || this.aiming) {
      this.setState('ground');
      this.stepGround(dt, noCrouch(it), wishLen);
      return;
    }
    const dx = r.x - this.feet.x;
    const dz = r.z - this.feet.z;
    const d = Math.hypot(dx, dz);
    if (d > 0.02) {
      const ux = dx / d;
      const uz = dz / d;
      // Echarse atrás cancela la carrera.
      if (wishLen > 0.5 && _wish.x * ux + _wish.z * uz < -0.5) {
        this.setState('ground');
        this.stepGround(dt, it, wishLen);
        return;
      }
      // Arranca fuerte y frena justo antes de la pared.
      const want = Math.min(COVER.run, Math.sqrt(2 * COVER.runBrake * d)) * this.speedMultiplier;
      _wish.set(ux, 0, uz);
      this.accelerate(dt, want, COVER.runAccel, COVER.runBrake * 2);
      const hs = this.horizontalSpeed;
      if (hs * dt > d) {
        this.velocity.x *= d / (hs * dt);
        this.velocity.z *= d / (hs * dt);
      }
    } else {
      this.velocity.x = 0;
      this.velocity.z = 0;
    }
    this.velocity.y = 0;
    if (r.height === 'low' && d < 0.9) this.setPosture('crouch');
    this.move(dt, true);
    this.runPeak = Math.max(this.runPeak, this.stepSpeed(dt));
    if (!this.grounded) {
      this.coyote = MOVE.coyote;
      this.setState('air');
      return;
    }
    const left = Math.hypot(r.x - this.feet.x, r.z - this.feet.z);
    if (left < 0.03 || (this.stateTime > 0.15 && this.stepSpeed(dt) < 0.25) || this.stateTime > this.runMaxT) this.arriveCover();
  }

  /** Llegó (o se detuvo): se pega a la pared si sigue delante; si no, queda de pie. */
  private arriveCover(): void {
    const r = this.run;
    const impact = clamp((this.runPeak - 1.5) / (COVER.run - 1.5), 0, 1);
    if (this.sensor.probe(this.feet, -r.nx, -r.nz, COVER.probe + 0.3, this.here)) this.enterCover(this.here, impact);
    else this.setState('ground');
  }

  private enterCover(p: WallProbe, impact: number): void {
    const c = this.coverInfo;
    c.normal.set(p.nx, 0, p.nz);
    c.height = p.height;
    c.top = p.top;
    c.edge = 0;
    c.edgeNear = 0;
    c.peekSide = 0;
    c.peekOffset = 0;
    c.seek = 0;
    c.wrap = -1;
    c.impact = impact;
    copyProbe(p, this.here);
    this.cover = c;
    this.setPosture(p.height === 'low' ? 'crouch' : 'stand');
    this.velocity.set(0, 0, 0);
    this.stats.coverEnters++;
    this.edgePush = 0;
    this.latch.on = false;
    this.seekTried = false;
    this.setState('cover');
  }

  exitCover(): void {
    if (!this.cover) return;
    this.cover = null;
    this.holding = false;
    this.latch.on = false;
    if (this.state === 'cover') {
      this.setPosture('stand');
      this.setState('ground');
    }
  }

  private latchTo(it: PlayerIntent, s: number): void {
    const l = this.latch;
    l.on = true;
    l.x = it.moveX;
    l.y = it.moveY;
    l.s = s;
  }

  private stepCover(dt: number, it: PlayerIntent, wishLen: number): void {
    const c = this.cover;
    if (!c) {
      this.setState('ground');
      return;
    }
    if (c.wrap >= 0) {
      this.stepWrap(dt, it, wishLen);
      return;
    }
    const n = c.normal;
    // Tangente de la pared.
    let tx = n.z;
    let tz = -n.x;
    let along = (_wish.x * tx + _wish.z * tz) * wishLen;
    let away = (_wish.x * n.x + _wish.z * n.z) * wishLen;
    // Tras doblar una esquina la cámara no ha girado: se sigue en la misma dirección mientras no cambie la tecla.
    const l = this.latch;
    if (l.on) {
      if (wishLen > 0.3 && Math.abs(it.moveX - l.x) < 0.35 && Math.abs(it.moveY - l.y) < 0.35) {
        along = l.s * wishLen;
        away = 0;
      } else l.on = false;
    }

    // C: salir; mantenida con otra cobertura a la vista, correr a ella.
    if (this.holding) {
      const go = this.stepHold(dt, it, this.here);
      if (go === 'tap') {
        this.exitCover();
        this.stepGround(dt, noCrouch(it), wishLen);
        return;
      }
      if (go === 'run') {
        this.startRun(this.lookSpot);
        if (this.state === 'toCover') this.stepToCover(dt, noCrouch(it), wishLen);
        return;
      }
    } else if (it.crouchPressed) {
      if (this.lookCover(it.lookFrom, it.lookDir, this.here)) this.beginHold();
      else {
        this.exitCover();
        this.stepGround(dt, noCrouch(it), wishLen);
        return;
      }
    }
    // Esprintar sale corriendo, salvo empujando contra la pared (se llega a ella esprintando o deslizándose con la
    // tecla aún pulsada); echarse atrás también sale.
    if ((it.sprint && wishLen > 0.5 && away > -0.5 && this.stateTime > 0.25) || away > 0.65) {
      this.exitCover();
      this.stepGround(dt, noCrouch(it), wishLen);
      return;
    }
    if (it.dodgePressed && this.rollCooldown <= 0) {
      this.exitCover();
      this.startRoll(wishLen, false);
      return;
    }
    if (this.jumpBuffer > 0) {
      this.jumpBuffer = 0;
      _tmp2.set(-n.x, 0, -n.z);
      // Cobertura baja + Espacio = saltar por encima (vault). En alta, sale y salta.
      if (c.height === 'low' && this.tryVault(_tmp2)) return;
      this.exitCover();
      if (this.posture === 'stand') {
        this.doJump();
        return;
      }
    }

    let vt = 0;
    let vn = 0;
    // Asomado, la pared queda a un lado: se sigue en cobertura hasta volver a ella.
    if (c.peekSide === 0) {
      const here = this.here;
      // ¿Sigue habiendo pared aquí?
      if (!this.sensor.probe(this.feet, -n.x, -n.z, COVER.probe + 0.2, here)) {
        this.exitCover();
        return;
      }
      // Sigue paredes ligeramente curvas.
      n.set(n.x * 0.7 + here.nx * 0.3, 0, n.z * 0.7 + here.nz * 0.3).normalize();
      tx = n.z;
      tz = -n.x;
      c.height = here.height;
      c.top = here.top;

      // Al apuntar en la alta lejos de un borde, va solo al más cercano.
      if (!this.aiming) {
        c.seek = 0;
        this.seekTried = false;
      } else if (c.height === 'high' && c.edgeNear === 0 && c.seek === 0 && !this.seekTried) {
        this.seekTried = true;
        c.seek = this.nearestEdge(it.camYaw);
      }
      const move = c.seek !== 0 ? c.seek : along;
      vt = move * (c.seek !== 0 ? COVER.seekSpeed : COVER.speed) * this.speedMultiplier;
      c.edge = 0;
      if (Math.abs(move) > 0.1) {
        const s = Math.sign(move);
        if (c.seek === 0 && this.sensor.innerCorner(this.feet, n.x, n.z, s, this.corner)) {
          // Rincón: pasa a la otra pared sin soltarse; el cuerpo gira con suavidad (`updateFacing`).
          n.set(this.corner.nx, 0, this.corner.nz);
          copyProbe(this.corner, here);
          tx = n.z;
          tz = -n.x;
          c.height = here.height;
          c.top = here.top;
          this.latchTo(it, s);
        } else {
          // Borde: mira por delante en la dirección del movimiento lateral.
          const look = PLAYER_RADIUS * 0.9 + Math.abs(vt) * dt;
          if (this.sensor.endsAt(this.feet, tx * s * look, tz * s * look, LOW_Y, n.x, n.z, here.dist)) {
            vt = 0;
            c.edge = s;
          }
        }
      }
      c.edgeNear = c.height === 'high' ? this.coverEdgeNear(it.camYaw) : 0;
      if (c.seek !== 0 && (c.edgeNear === c.seek || c.edge === c.seek)) c.seek = 0;
      // Pegado a la pared a distancia constante.
      const gap = here.dist - PLAYER_RADIUS - COVER.gap;
      vn = clamp(gap * 12, -2, 3);

      // Empujar contra un borde rodea la esquina (si la cara lateral también cubre).
      if (c.edge !== 0 && !this.aiming && Math.abs(along) > 0.5 && Math.sign(along) === c.edge) {
        this.edgePush += dt;
        if (this.edgePush >= COVER.wrapHold) {
          if (this.sensor.planWrap(this.feet, n.x, n.z, here.dist, c.edge, this.wrapPlan)) {
            this.edgePush = 0;
            this.wrapT = 0;
            c.wrap = 0;
            c.edge = 0;
            this.stats.coverWraps++;
            this.stepWrap(dt, it, wishLen);
            return;
          }
          this.edgePush = -0.6;
        }
      } else this.edgePush = this.edgePush < 0 ? Math.min(0, this.edgePush + dt) : 0;
    }

    // Asomarse por el borde (cobertura alta): al apuntar junto a un borde sale de lado lo justo para despejar la
    // esquina y queda expuesto; al soltar, vuelve a la pared.
    if (c.peekSide === 0 && this.aiming && c.edgeNear !== 0) c.peekSide = c.edgeNear;
    if (c.peekSide !== 0) {
      const out = this.aiming ? c.peekSide * (c.peekSide < 0 ? PEEK_OUT_LEFT : PEEK_OUT_RIGHT) : 0;
      vt = clamp((out - c.peekOffset) * 14, -PEEK_SPEED, PEEK_SPEED);
      vn = 0;
    }
    this.velocity.x = tx * vt - n.x * vn;
    this.velocity.z = tz * vt - n.z * vn;
    this.velocity.y = 0;

    // Postura: cobertura baja = agachado, salvo al apuntar (asoma por encima).
    if (c.height === 'low') this.setPosture(this.aiming ? 'stand' : 'crouch');
    else this.setPosture('stand');

    this.move(dt, true);
    if (!this.grounded) {
      this.exitCover();
      this.setState('air');
      return;
    }
    if (c.peekSide !== 0) {
      c.peekOffset += (this.feet.x - this.prevFeet.x) * tx + (this.feet.z - this.prevFeet.z) * tz;
      if (!this.aiming && Math.abs(c.peekOffset) < 0.01) {
        c.peekSide = 0;
        c.peekOffset = 0;
      }
    }
  }

  /** Rodeando una esquina exterior: recorre el plan (tramo, arco y tramo) y al final la pared lateral es la cobertura. */
  private stepWrap(dt: number, it: PlayerIntent, wishLen: number): void {
    const c = this.cover;
    if (!c) return;
    const w = this.wrapPlan;
    if (it.dodgePressed && this.rollCooldown <= 0) {
      this.exitCover();
      this.startRoll(wishLen, false);
      return;
    }
    this.wrapT += dt;
    const k = Math.min(1, this.wrapT / COVER.wrapTime);
    const u = k * k * (3 - 2 * k);
    c.wrap = u;
    wrapPoint(w, u, _tmp);
    this.velocity.set((_tmp.x - this.feet.x) / dt, 0, (_tmp.z - this.feet.z) / dt);
    this.setPosture(c.height === 'low' || w.height === 'low' ? 'crouch' : 'stand');
    this.move(dt, true);
    if (!this.grounded) {
      this.exitCover();
      this.setState('air');
      return;
    }
    if (Math.hypot(_tmp.x - this.feet.x, _tmp.z - this.feet.z) > 0.3) {
      // Algo inesperado cortó el camino: suelta la cobertura (nunca atascado).
      this.exitCover();
      return;
    }
    if (k >= 1) {
      c.normal.set(w.tx, 0, w.tz);
      c.height = w.height;
      c.top = w.top;
      c.wrap = -1;
      c.edge = 0;
      c.edgeNear = 0;
      this.latchTo(it, w.side);
    }
  }

  /**
   * Borde de una cobertura alta al alcance para asomarse: a cada lado, un poco más allá del hombro y a la altura del
   * pecho, ¿sigue la pared? Si se acaba por los dos lados (una columna), gana el lado hacia el que mira la cámara.
   */
  private coverEdgeNear(camYaw: number): number {
    const n = this.coverInfo.normal;
    const tx = n.z;
    const tz = -n.x;
    const dist = this.here.dist;
    const right = this.sensor.endsAt(this.feet, tx * EDGE_REACH, tz * EDGE_REACH, CHEST_Y, n.x, n.z, dist);
    const left = this.sensor.endsAt(this.feet, -tx * EDGE_REACH, -tz * EDGE_REACH, CHEST_Y, n.x, n.z, dist);
    if (right && left) return -Math.sin(camYaw) * tx - Math.cos(camYaw) * tz >= 0 ? 1 : -1;
    return right ? 1 : left ? -1 : 0;
  }

  /** El borde de la alta más cercano a menos de `COVER.seekEdge` (−1/+1), o 0. A igual distancia, el lado de la cámara. */
  private nearestEdge(camYaw: number): number {
    const n = this.coverInfo.normal;
    const max = COVER.seekEdge + EDGE_REACH;
    const right = this.sensor.edgeDistance(this.feet, n.x, n.z, this.here.dist, 1, max);
    const left = this.sensor.edgeDistance(this.feet, n.x, n.z, this.here.dist, -1, max);
    if (right < 0 && left < 0) return 0;
    if (right < 0) return -1;
    if (left < 0) return 1;
    if (Math.abs(right - left) < 0.05) return -Math.sin(camYaw) * n.z + Math.cos(camYaw) * n.x >= 0 ? 1 : -1;
    return right < left ? 1 : -1;
  }

  /** Cuánto está asomado por el borde de una cobertura: −1..1 (+ = por la derecha). Lo usa la animación. */
  get peekAmount(): number {
    const c = this.state === 'cover' ? this.cover : null;
    if (!c || c.peekOffset === 0) return 0;
    return clamp(c.peekOffset / (c.peekOffset < 0 ? PEEK_OUT_LEFT : PEEK_OUT_RIGHT), -1, 1);
  }

  // ---------------------------------------------------------------------
  private updateFacing(dt: number, it: PlayerIntent): void {
    let target = this.yaw;
    let rate: number = MOVE.turnRate;
    if (this.state === 'dead' || this.state === 'locked') return;
    if (this.state === 'vault' && this.vault) {
      target = yawFromDir(this.vault.dir.x, this.vault.dir.z);
    } else if (this.aiming) {
      target = it.camYaw;
      rate = MOVE.aimTurnRate;
    } else if (this.state === 'cover' && this.cover) {
      const c = this.cover;
      if (c.wrap >= 0) {
        // Rodeando una esquina: el cuerpo gira con el arco, de una pared a la otra.
        const w = this.wrapPlan;
        const y0 = yawFromDir(-w.nx, -w.nz);
        target = y0 + angleDelta(y0, yawFromDir(-w.tx, -w.tz)) * wrapTurn(w, c.wrap);
        rate = 22;
      } else {
        target = yawFromDir(-c.normal.x, -c.normal.z);
        rate = 11;
      }
    } else if (this.state === 'toCover') {
      const r = this.run;
      const dx = r.x - this.feet.x;
      const dz = r.z - this.feet.z;
      target = Math.hypot(dx, dz) > 0.7 ? yawFromDir(dx, dz) : yawFromDir(-r.nx, -r.nz);
    } else if (this.state === 'roll') {
      target = yawFromDir(this.rollDir.x, this.rollDir.z);
      rate = MOVE.aimTurnRate;
    } else if (this.state === 'slide') {
      target = yawFromDir(this.slideDir.x, this.slideDir.z);
    } else if (this.horizontalSpeed > 0.6) {
      target = yawFromDir(this.velocity.x, this.velocity.z);
    }
    this.yaw = moveTowardsAngle(this.yaw, this.yaw + angleDelta(this.yaw, target), rate * dt);
  }

  /**
   * Mueve la cápsula con el KCC. La velocidad horizontal NO se recorta contra paredes: el KCC
   * ya desliza sin penetrar y el autostep de Rapier necesita translación horizontal restante
   * para subir escalones (recortarla dejaba al personaje frenado ante cada peldaño). Solo se
   * anula la velocidad vertical al tocar un techo (evita quedarse "pegado" al saltar).
   */
  private move(dt: number, snap: boolean, correctVelocity = true): void {
    this.setSnap(snap);
    const d = this.desired;
    d.x = this.velocity.x * dt;
    d.y = this.velocity.y * dt;
    d.z = this.velocity.z * dt;
    const ctrl = this.char.controller;
    ctrl.computeColliderMovement(this.char.collider, d, undefined, this.groups);
    const m = ctrl.computedMovement(this.kccOut);
    this.grounded = ctrl.computedGrounded();
    if (correctVelocity) this.clipVelocityAgainstContacts();
    this.feet.x += m.x;
    this.feet.y += m.y;
    this.feet.z += m.z;
    this.syncCollider();
  }

  /** Anula la velocidad vertical si en este movimiento se tocó un techo. */
  private clipVelocityAgainstContacts(): void {
    if (this.velocity.y <= 0) return;
    const ctrl = this.char.controller;
    const n = ctrl.numComputedCollisions();
    for (let i = 0; i < n; i++) {
      const col = ctrl.computedCollision(i, this.colOut);
      if (col && col.normal1.y < -CEILING_NORMAL_Y) {
        this.velocity.y = 0;
        return;
      }
    }
  }

  private afterStep(dt: number): void {
    const f = this.feet;
    if (!Number.isFinite(f.x) || !Number.isFinite(f.y) || !Number.isFinite(f.z)) {
      this.nanResets++;
      console.error('[PlayerController] posición no finita: restaurando último suelo seguro');
      this.teleport(this.lastSafe, this.lastSafeYaw);
      return;
    }
    if (f.y < this.killY) {
      this.killPlaneResets++;
      this.teleport(this.lastSafe, this.lastSafeYaw);
      return;
    }
    if (dt > 0) {
      const hs = Math.hypot(f.x - this.prevFeet.x, f.z - this.prevFeet.z) / dt;
      this.stats.distance += hs * dt;
      if (this.speedMultiplier === 1 && hs > this.maxHorizontalSpeed) this.maxHorizontalSpeed = hs;
    }
    if (this.state === 'ground' && this.grounded && this.stateTime > 0.3) {
      this.safeTimer += dt;
      if (this.safeTimer > 0.5) {
        this.safeTimer = 0;
        this.lastSafe.copy(f);
        this.lastSafeYaw = this.yaw;
      }
    }
  }

  // ===================================================================== red
  /** Copia el movimiento a un objeto plano (lo que se envía de este personaje). */
  writeNet(out: MoveNet): MoveNet {
    out.x = this.feet.x;
    out.y = this.feet.y;
    out.z = this.feet.z;
    out.yaw = this.yaw;
    out.state = this.state;
    out.posture = this.posture;
    out.grounded = this.grounded;
    out.stateTime = this.stateTime;
    out.aiming = this.aiming;
    out.sprinting = this.sprinting;
    out.invulnerable = this.invulnerable;
    out.vault = this.vaultProgress;
    const c = this.state === 'cover' ? this.cover : null;
    if (c) {
      const o = (out.cover ??= emptyCoverNet());
      o.nx = c.normal.x;
      o.nz = c.normal.z;
      o.height = c.height;
      o.peekSide = c.peekSide;
      o.peekOffset = c.peekOffset;
      o.edgeNear = c.edgeNear;
      o.top = c.top;
      o.impact = c.impact;
    } else out.cover = null;
    out.dodges = this.stats.rolls + this.stats.dives;
    return out;
  }

  /**
   * Coloca al personaje según un movimiento recibido, sin simularlo: el de otro equipo (lo mueve su dueño) o el que
   * dibuja este equipo de la partida del anfitrión. `snap` lo coloca sin transición (aparición, reaparición).
   */
  applyNet(s: MoveNet, snap = false): void {
    if (snap) {
      this.prevFeet.set(s.x, s.y, s.z);
      this.prevYaw = s.yaw;
    } else {
      this.prevFeet.copy(this.feet);
      this.prevYaw = this.yaw;
    }
    this.feet.set(s.x, s.y, s.z);
    this.yaw = s.yaw;
    if (s.posture !== this.posture) {
      // Su dueño ya comprobó que cabía: aquí solo se ajusta la cápsula.
      this.posture = s.posture;
      this.char.collider.setHalfHeight(this.halfHeight);
    }
    this.state = s.state;
    this.grounded = s.grounded;
    this.stateTime = s.stateTime;
    this.aiming = s.aiming;
    this.sprinting = s.sprinting;
    this.invulnerable = s.invulnerable;
    this.netVault = s.vault;
    if (s.cover) {
      const c = (this.cover = this.coverInfo);
      c.normal.set(s.cover.nx, 0, s.cover.nz);
      c.height = s.cover.height;
      c.peekSide = s.cover.peekSide;
      c.peekOffset = s.cover.peekOffset;
      c.edgeNear = s.cover.edgeNear;
      c.top = s.cover.top;
      c.impact = s.cover.impact;
      c.wrap = -1;
    } else this.cover = null;
    this.stats.rolls = s.dodges;
    this.stats.dives = 0;
    this.syncCollider();
  }

  /** Posición de render interpolada. */
  renderFeet(alpha: number, out: Vector3): Vector3 {
    return out.lerpVectors(this.prevFeet, this.feet, alpha);
  }

  renderYaw(alpha: number): number {
    return this.prevYaw + angleDelta(this.prevYaw, this.yaw) * alpha;
  }

  /** Penetración de la cápsula en geometría estática (QA: debe ser siempre null). */
  penetration(): Collider | null {
    this.centerOf(_tmp);
    return this.physics.overlapsCapsule(_tmp, PLAYER_RADIUS - 0.03, this.halfHeight - 0.01, QueryGroups.STATIC, this.char.collider);
  }

  dispose(): void {
    this.physics.removeCharacter(this.char);
  }
}
