import type { CharacterCollision, Collider } from '@dimforge/rapier3d-compat';
import { Vector3 } from 'three';
import { angleDelta, clamp, lerp, moveTowardsAngle } from '../core/math';
import { createRayHit, DEFAULT_KCC, Groups, type CharacterBody, type PhysicsWorld, QueryGroups } from '../physics/Physics';

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
  cover: 1.9,
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
  coverGap: 0.06,
  coverProbe: 0.95,
} as const;

export type MoveState = 'ground' | 'air' | 'roll' | 'slide' | 'vault' | 'cover' | 'locked' | 'dead';
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
  jumpPressed: boolean;
  dodgePressed: boolean;
}

export function emptyIntent(): PlayerIntent {
  return { moveX: 0, moveY: 0, camYaw: 0, sprint: false, aim: false, crouchPressed: false, jumpPressed: false, dodgePressed: false };
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
}

export interface PlayerMoveStats {
  jumps: number;
  vaults: number;
  mantles: number;
  rolls: number;
  dives: number;
  slides: number;
  coverEnters: number;
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
  readonly stats: PlayerMoveStats = { jumps: 0, vaults: 0, mantles: 0, rolls: 0, dives: 0, slides: 0, coverEnters: 0, sprintTime: 0, distance: 0 };
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

  /** Grupos de colisión del personaje (jugador o enemigo: el mismo motor robusto para ambos). */
  readonly groups: number;

  constructor(physics: PhysicsWorld, spawn: Vector3, yaw: number, groups: number = Groups.PLAYER) {
    this.physics = physics;
    this.groups = groups;
    this.center.set(spawn.x, spawn.y + STAND_HALF + PLAYER_RADIUS, spawn.z);
    this.char = physics.createCharacter(this.center, PLAYER_RADIUS, STAND_HALF, groups);
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
      this.setPosture(this.posture === 'stand' ? 'crouch' : 'stand');
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
    this.velocity.y = -1;
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
      t < MOVE.rollFastPhase ? MOVE.rollSpeed : lerp(MOVE.rollSpeed, MOVE.rollEndSpeed, clamp((t - MOVE.rollFastPhase) / (MOVE.rollTime - MOVE.rollFastPhase), 0, 1));
    this.velocity.x = this.rollDir.x * speed * this.speedMultiplier;
    this.velocity.z = this.rollDir.z * speed * this.speedMultiplier;
    if (this.grounded && this.velocity.y <= 0) this.velocity.y = -1;
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
    this.velocity.y = -1;
    this.move(dt, true);
    // Bloqueado = el desplazamiento REAL de este paso es pequeño (la velocidad no se recorta contra paredes).
    const blocked = this.stateTime > 0.12 && this.stepSpeed(dt) < 1.5;
    if (!this.grounded) {
      this.slideCooldown = MOVE.slideCooldown;
      this.velocity.y = 0;
      this.setState('air');
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

  /**
   * Consulta para el HUD (sin efectos): qué haría Espacio y C ahora mismo.
   * `camYaw` y el eje de movimiento definen la dirección que se sondea.
   */
  peekContext(camYaw: number, moveX: number, moveY: number): { vault: 'vault' | 'mantle' | null; cover: CoverHeight | null } {
    const out = this.peekOut;
    out.vault = null;
    out.cover = null;
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
    if (this.probeCover(_tmp2, MOVE.coverProbe)) out.cover = this.coverProbe.height;
    return out;
  }

  private readonly peekOut: { vault: 'vault' | 'mantle' | null; cover: CoverHeight | null } = { vault: null, cover: null };

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
  /**
   * Sondea una superficie de cobertura en `dir` desde los pies. Rellena `this.coverProbe`
   * (reutilizable, sin asignaciones) y devuelve si hay cobertura válida.
   * Requiere pared a 0,45 m y 0,8 m (cobertura de al menos ~0,85 m); a 1,5 m decide baja/alta.
   */
  private probeCover(dir: Vector3, maxDist: number): boolean {
    const ph = this.physics;
    const h = this.hit;
    const out = this.coverProbe;
    _probe.set(this.feet.x, this.feet.y + 0.45, this.feet.z);
    if (!ph.raycast(_probe, dir, maxDist, QueryGroups.STATIC, h, this.char.collider)) return false;
    if (Math.abs(h.normal.y) > 0.35 || h.normal.x * dir.x + h.normal.z * dir.z > -0.5) return false;
    const nl = Math.hypot(h.normal.x, h.normal.z) || 1;
    out.dist = h.distance;
    out.nx = h.normal.x / nl;
    out.nz = h.normal.z / nl;
    _probe.set(this.feet.x, this.feet.y + 0.8, this.feet.z);
    if (!ph.raycast(_probe, dir, out.dist + 0.35, QueryGroups.STATIC, h, this.char.collider)) return false; // demasiado bajo
    _probe.set(this.feet.x, this.feet.y + 1.5, this.feet.z);
    out.height = ph.raycast(_probe, dir, out.dist + 0.4, QueryGroups.STATIC, h, this.char.collider) ? 'high' : 'low';
    return true;
  }

  private readonly coverProbe: { dist: number; nx: number; nz: number; height: CoverHeight } = { dist: 0, nx: 0, nz: 1, height: 'low' };

  tryEnterCover(it: PlayerIntent, wishLen: number): boolean {
    if (!this.grounded) return false;
    const dir = wishLen > 0.3 ? _tmp2.copy(_wish) : yawForward(it.camYaw, _tmp2);
    if (!this.probeCover(dir, MOVE.coverProbe)) return false;
    const p = this.coverProbe;
    this.cover = { normal: new Vector3(p.nx, 0, p.nz), height: p.height, edge: 0 };
    if (p.height === 'low') this.setPosture('crouch');
    this.velocity.set(0, 0, 0);
    this.stats.coverEnters++;
    this.setState('cover');
    return true;
  }

  exitCover(): void {
    if (!this.cover) return;
    this.cover = null;
    if (this.state === 'cover') {
      this.setPosture('stand');
      this.setState('ground');
    }
  }

  private stepCover(dt: number, it: PlayerIntent, wishLen: number): void {
    const c = this.cover;
    if (!c) {
      this.setState('ground');
      return;
    }
    const n = c.normal;
    // Tangente de la pared.
    const tx = n.z;
    const tz = -n.x;
    const along = (_wish.x * tx + _wish.z * tz) * wishLen;
    const away = (_wish.x * n.x + _wish.z * n.z) * wishLen;

    if (it.crouchPressed || (it.sprint && wishLen > 0.5) || away > 0.65) {
      this.exitCover();
      this.stepGround(dt, { ...it, crouchPressed: false }, wishLen);
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

    // ¿Sigue habiendo pared aquí?
    _tmp2.set(-n.x, 0, -n.z);
    if (!this.probeCover(_tmp2, MOVE.coverProbe + 0.2)) {
      this.exitCover();
      return;
    }
    const here = this.coverProbe;
    // Sigue paredes ligeramente curvas.
    n.set(n.x * 0.7 + here.nx * 0.3, 0, n.z * 0.7 + here.nz * 0.3).normalize();
    c.height = here.height;

    // Borde: mira por delante en la dirección del movimiento lateral.
    let vt = along * MOVE.cover * this.speedMultiplier;
    c.edge = 0;
    if (Math.abs(along) > 0.1) {
      const s = Math.sign(along);
      const look = PLAYER_RADIUS * 0.9 + Math.abs(vt) * dt;
      const ph = this.physics;
      _probe.set(this.feet.x + tx * s * look, this.feet.y + 0.45, this.feet.z + tz * s * look);
      if (!ph.raycast(_probe, _tmp2, here.dist + 0.35, QueryGroups.STATIC, this.hit, this.char.collider)) {
        vt = 0;
        c.edge = s;
      }
    }
    // Pegado a la pared a distancia constante.
    const gap = here.dist - PLAYER_RADIUS - MOVE.coverGap;
    const vn = clamp(gap * 12, -2, 3);
    this.velocity.x = tx * vt - n.x * vn;
    this.velocity.z = tz * vt - n.z * vn;
    this.velocity.y = -1;

    // Postura: cobertura baja = agachado, salvo al apuntar (asoma por encima).
    if (c.height === 'low') this.setPosture(this.aiming ? 'stand' : 'crouch');
    else this.setPosture('stand');

    this.move(dt, true);
    if (!this.grounded) {
      this.exitCover();
      this.setState('air');
    }
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
      target = yawFromDir(-this.cover.normal.x, -this.cover.normal.z);
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
