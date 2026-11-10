import { Vector3 } from 'three';
import type { Rng } from '../../core/rng';
import type { EnemyTypeDef } from './enemyTypes';

/**
 * Cerebro de enemigo: máquina de estados PURA (testeable sin física ni render).
 * patrulla → sospecha → combate → cobertura → flanqueo → búsqueda (+ aturdido, muerto).
 * Recibe una percepción ya calculada por el cuerpo y devuelve órdenes.
 */
export type AiState = 'patrol' | 'suspicious' | 'combat' | 'cover' | 'flank' | 'search' | 'stunned' | 'dead';

export type PathStatus = 'idle' | 'moving' | 'arrived' | 'stuck' | 'failed';

export interface Perception {
  /** Ve al jugador (FOV + alcance + línea de visión). */
  canSee: boolean;
  /** 0..1: rapidez de detección (distancia, postura, iluminación). */
  seeFactor: number;
  playerPos: Vector3;
  distance: number;
  /** Línea de tiro libre desde el arma hasta el jugador. */
  canShoot: boolean;
  heard: boolean;
  heardPos: Vector3;
  allyAlert: boolean;
  allyAlertPos: Vector3;
  damaged: boolean;
  damageFrom: Vector3;
  path: PathStatus;
  selfPos: Vector3;
}

export function emptyPerception(): Perception {
  return {
    canSee: false,
    seeFactor: 0,
    playerPos: new Vector3(),
    distance: 999,
    canShoot: false,
    heard: false,
    heardPos: new Vector3(),
    allyAlert: false,
    allyAlertPos: new Vector3(),
    damaged: false,
    damageFrom: new Vector3(),
    path: 'idle',
    selfPos: new Vector3(),
  };
}

/** Consultas tácticas que resuelve el cuerpo (navegación + física). */
export interface Tactics {
  findCover(self: Vector3, threat: Vector3, out: Vector3): boolean;
  findFlank(self: Vector3, threat: Vector3, side: number, out: Vector3): boolean;
  randomNear(pos: Vector3, radius: number, out: Vector3): boolean;
}

export interface BrainCommand {
  hasMove: boolean;
  moveTo: Vector3;
  run: boolean;
  crouch: boolean;
  hasLook: boolean;
  lookAt: Vector3;
  /** Dispara ESTE paso. */
  fire: boolean;
  /** Progreso del telégrafo 0..1 (láser del tirador, alzar escopeta). */
  telegraph: number;
  /** Medidor de detección 0..1 (icono ? → !). */
  detection: number;
  icon: 'none' | 'suspicious' | 'alert';
  /** Evento de un paso: alerta a los aliados cercanos. */
  shout: boolean;
}

export function emptyCommand(): BrainCommand {
  return {
    hasMove: false,
    moveTo: new Vector3(),
    run: false,
    crouch: false,
    hasLook: false,
    lookAt: new Vector3(),
    fire: false,
    telegraph: 0,
    detection: 0,
    icon: 'none',
    shout: false,
  };
}

const LOSE_SIGHT_TO_SEARCH = 1.6;
const SEARCH_LOOK_TIME = 5;
const SUSPICIOUS_TIMEOUT = 7;
const PATROL_WAIT = 1.5;

export class EnemyBrain {
  state: AiState = 'patrol';
  stateTime = 0;
  detection = 0;
  readonly lastKnown = new Vector3();
  hasLastKnown = false;
  /** Segundos sin ver al jugador. */
  unseen = 99;
  private reactionLeft = 0;
  private burstLeft = 0;
  private shotCooldown = 0;
  private telegraphT = 0;
  private patrolIndex = 0;
  private patrolWait = 0;
  private repositionIn = 3;
  private peekTimer = 0;
  private peekUp = false;
  private flankSide = 1;
  private readonly goal = new Vector3();
  private hasGoal = false;
  private stuckCount = 0;
  /** Conciencia elevada tras una búsqueda (detecta más rápido). */
  private vigilant = 0;
  /** Asalto (oleadas del Excomunicado): se acerca en vez de disparar desde lejos. */
  aggressive = false;
  /** Distancia máxima de combate cuando el enemigo asalta. */
  static readonly ASSAULT_RANGE = 8;

  constructor(
    readonly def: EnemyTypeDef,
    readonly patrol: readonly Vector3[],
    readonly home: Vector3,
    readonly stationary: boolean,
    private readonly rng: Rng,
  ) {
    this.burstLeft = def.weapon.burst;
    this.flankSide = rng.sign();
    this.repositionIn = rng.range(2.5, 4.5);
  }

  private go(s: AiState): void {
    if (this.state === s || this.state === 'dead') return;
    this.state = s;
    this.stateTime = 0;
    this.hasGoal = false;
    this.stuckCount = 0;
    this.telegraphT = 0;
    this.searchLook = 0;
    this.retreatIn = 0;
    if (s === 'combat') this.repositionIn = this.rng.range(2, 4);
    if (s === 'cover') this.coverFor = this.rng.range(8, 12);
    if (s === 'search') this.detection = Math.min(this.detection, 0.7);
  }

  private searchLook = 0;
  private coverFor = 10;
  private retreatIn = 0;

  stun(): void {
    if (this.state === 'dead') return;
    this.state = 'stunned';
    this.stateTime = 0;
  }

  /** Sale del aturdimiento (takedown cancelado) directo a combate. */
  unstun(): void {
    if (this.state !== 'stunned') return;
    this.state = 'combat';
    this.stateTime = 0;
    this.reactionLeft = this.def.reaction;
  }

  kill(): void {
    this.state = 'dead';
    this.stateTime = 0;
  }

  /** Entra en combate de inmediato (disparo recibido, alarma, aliado). */
  alert(at: Vector3): void {
    if (this.state === 'dead' || this.state === 'stunned') return;
    this.lastKnown.copy(at);
    this.hasLastKnown = true;
    this.detection = 1;
    // La posición de la alerta cuenta como información fresca: primero va a por ella.
    this.unseen = 0;
    if (this.state !== 'combat' && this.state !== 'cover' && this.state !== 'flank') {
      this.reactionLeft = this.def.reaction;
      this.go('combat');
    }
  }

  update(dt: number, p: Perception, t: Tactics, cmd: BrainCommand): void {
    this.stateTime += dt;
    cmd.fire = false;
    cmd.shout = false;
    cmd.hasMove = false;
    cmd.hasLook = false;
    cmd.crouch = false;
    cmd.run = false;
    if (this.state === 'dead' || this.state === 'stunned') {
      cmd.telegraph = 0;
      cmd.icon = 'none';
      cmd.detection = 0;
      return;
    }
    this.vigilant = Math.max(0, this.vigilant - dt);
    this.shotCooldown = Math.max(0, this.shotCooldown - dt);

    // ---------- Percepción → detección ----------
    if (p.canSee) {
      this.unseen = 0;
      this.lastKnown.copy(p.playerPos);
      this.hasLastKnown = true;
      const near = p.distance < 5 ? 3 : 1;
      const rate = (p.seeFactor * near * (this.vigilant > 0 ? 2 : 1)) / this.def.detectTime;
      this.detection = Math.min(1, this.detection + rate * dt);
    } else {
      this.unseen += dt;
      if (this.state === 'patrol' || this.state === 'suspicious') this.detection = Math.max(0, this.detection - 0.2 * dt);
    }
    if (p.damaged) {
      this.alert(p.damageFrom);
      cmd.shout = true;
    } else if (p.allyAlert && this.state !== 'combat' && this.state !== 'cover' && this.state !== 'flank') {
      this.alert(p.allyAlertPos);
    } else if (p.heard && (this.state === 'patrol' || this.state === 'suspicious' || this.state === 'search')) {
      this.lastKnown.copy(p.heardPos);
      this.hasLastKnown = true;
      if (p.heardPos.distanceTo(p.selfPos) < 8) this.alert(p.heardPos);
      else {
        this.detection = Math.max(this.detection, 0.55);
        this.go('suspicious');
      }
    }
    // Pasar a combate por detección exige VER al jugador (evita el bucle combate ⇄ búsqueda).
    if (this.detection >= 1 && p.canSee && (this.state === 'patrol' || this.state === 'suspicious' || this.state === 'search')) {
      this.reactionLeft = this.def.reaction;
      this.go('combat');
      cmd.shout = true;
    } else if (this.detection > 0.3 && this.state === 'patrol' && this.hasLastKnown) {
      this.go('suspicious');
    }

    // ---------- Estados ----------
    switch (this.state) {
      case 'patrol':
        this.tickPatrol(dt, p, t, cmd);
        break;
      case 'suspicious':
        cmd.hasLook = true;
        cmd.lookAt.copy(this.lastKnown);
        if (!this.stationary) this.moveTo(this.lastKnown, false, cmd, p, t);
        if (this.stateTime > SUSPICIOUS_TIMEOUT && this.detection < 0.3) this.go('patrol');
        break;
      case 'combat':
        this.tickCombat(dt, p, t, cmd);
        break;
      case 'cover':
        this.tickCover(dt, p, t, cmd);
        break;
      case 'flank':
        this.tickFlank(dt, p, t, cmd);
        break;
      case 'search':
        this.tickSearch(dt, p, t, cmd);
        break;
      default:
        break;
    }
    cmd.detection = this.detection;
    cmd.icon = this.state === 'patrol' ? (this.detection > 0.05 ? 'suspicious' : 'none') : this.state === 'suspicious' || this.state === 'search' ? 'suspicious' : 'alert';
  }

  private moveTo(target: Vector3, run: boolean, cmd: BrainCommand, p: Perception, t: Tactics): void {
    if (p.path === 'stuck' || p.path === 'failed') {
      // Replanificación: meta alternativa cercana (nunca se queda empujando contra algo).
      this.stuckCount++;
      if (t.randomNear(p.selfPos, 3 + this.stuckCount, this.goal)) this.hasGoal = true;
      else this.hasGoal = false;
    } else if (!this.hasGoal || this.goal.distanceToSquared(target) > 1) {
      this.goal.copy(target);
      this.hasGoal = true;
    }
    if (!this.hasGoal) return;
    cmd.hasMove = true;
    cmd.moveTo.copy(this.goal);
    cmd.run = run;
  }

  private tickPatrol(dt: number, p: Perception, t: Tactics, cmd: BrainCommand): void {
    if (this.stationary || this.patrol.length === 0) {
      if (!this.stationary && p.selfPos.distanceTo(this.home) > 1) this.moveTo(this.home, false, cmd, p, t);
      return;
    }
    const target = this.patrol[this.patrolIndex % this.patrol.length]!;
    if (p.selfPos.distanceTo(target) < 0.9 || p.path === 'arrived') {
      this.patrolWait += dt;
      if (this.patrolWait > PATROL_WAIT) {
        this.patrolWait = 0;
        this.patrolIndex = (this.patrolIndex + 1) % this.patrol.length;
        this.hasGoal = false;
      }
      return;
    }
    if (p.path === 'stuck' || p.path === 'failed') {
      // Punto de patrulla inalcanzable: se salta al siguiente.
      this.patrolIndex = (this.patrolIndex + 1) % this.patrol.length;
      this.hasGoal = false;
      return;
    }
    this.moveTo(target, false, cmd, p, t);
  }

  /** Lógica de disparo común: reacción, telégrafo y ráfagas. */
  private tickFire(dt: number, p: Perception, cmd: BrainCommand): void {
    const w = this.def.weapon;
    if (!p.canSee || !p.canShoot || p.distance > w.range * 1.15) {
      // Sin línea de tiro: el telégrafo se cancela (romper la línea de visión funciona).
      this.telegraphT = Math.max(0, this.telegraphT - dt * 3);
      cmd.telegraph = w.telegraph > 0 ? this.telegraphT / w.telegraph : 0;
      if (this.unseen > 0.8) this.reactionLeft = Math.max(this.reactionLeft, this.def.reaction * 0.6);
      return;
    }
    if (this.reactionLeft > 0) {
      this.reactionLeft -= dt;
      cmd.telegraph = 0;
      return;
    }
    if (w.telegraph > 0) {
      if (this.shotCooldown > 0) {
        cmd.telegraph = 0;
        return;
      }
      this.telegraphT += dt;
      cmd.telegraph = Math.min(1, this.telegraphT / w.telegraph);
      if (this.telegraphT >= w.telegraph) {
        this.telegraphT = 0;
        cmd.fire = true;
        this.burstLeft--;
        if (this.burstLeft <= 0) {
          this.burstLeft = w.burst;
          this.shotCooldown = w.burstPause + 60 / w.rpm + this.rng.range(0, 0.4);
        } else this.shotCooldown = 60 / w.rpm;
      }
      return;
    }
    cmd.telegraph = 0;
    if (this.shotCooldown > 0) return;
    cmd.fire = true;
    this.burstLeft--;
    if (this.burstLeft <= 0) {
      this.burstLeft = w.burst;
      this.shotCooldown = w.burstPause + this.rng.range(0, 0.5);
    } else this.shotCooldown = 60 / w.rpm;
  }

  private tickCombat(dt: number, p: Perception, t: Tactics, cmd: BrainCommand): void {
    cmd.hasLook = true;
    cmd.lookAt.copy(p.canSee ? p.playerPos : this.lastKnown);
    this.tickFire(dt, p, cmd);
    if (this.stationary) return;
    if (this.unseen > LOSE_SIGHT_TO_SEARCH) {
      this.go('search');
      return;
    }
    this.repositionIn -= dt;
    if (this.repositionIn <= 0) {
      this.repositionIn = this.rng.range(3, 5.5);
      if (this.def.flanker && this.rng.chance(0.65)) {
        this.flankSide = -this.flankSide;
        if (t.findFlank(p.selfPos, this.lastKnown, this.flankSide, this.goal)) {
          this.go('flank');
          this.hasGoal = true;
          return;
        }
      }
      if (this.rng.chance(this.def.prefersCover) && t.findCover(p.selfPos, this.lastKnown, this.goal)) {
        this.go('cover');
        this.hasGoal = true;
        return;
      }
    }
    // Mantener la distancia preferida.
    const [mn, engageMax] = this.def.engage;
    const mx = this.aggressive ? Math.min(engageMax, EnemyBrain.ASSAULT_RANGE) : engageMax;
    this.retreatIn -= dt;
    if (p.distance > mx || !p.canSee) {
      this.moveTo(this.lastKnown, true, cmd, p, t);
    } else if (p.distance < mn) {
      // Retrocede a un punto cercano (se elige como mucho una vez por segundo).
      if ((!this.hasGoal || this.retreatIn <= 0) && t.randomNear(p.selfPos, 3, this.goal)) {
        this.hasGoal = true;
        this.retreatIn = 1;
      }
      if (this.hasGoal) {
        cmd.hasMove = true;
        cmd.moveTo.copy(this.goal);
        cmd.run = true;
      }
    } else {
      this.hasGoal = false;
    }
  }

  private tickCover(dt: number, p: Perception, _t: Tactics, cmd: BrainCommand): void {
    cmd.hasLook = true;
    cmd.lookAt.copy(p.canSee ? p.playerPos : this.lastKnown);
    const arrived = p.path === 'arrived' || p.selfPos.distanceTo(this.goal) < 0.7;
    if (!arrived) {
      if (p.path === 'stuck' || p.path === 'failed') {
        this.go('combat');
        return;
      }
      cmd.hasMove = true;
      cmd.moveTo.copy(this.goal);
      cmd.run = true;
      this.tickFire(dt, p, cmd);
      return;
    }
    // Ciclo asomarse / esconderse.
    this.peekTimer -= dt;
    if (this.peekTimer <= 0) {
      this.peekUp = !this.peekUp;
      this.peekTimer = this.peekUp ? this.rng.range(1.2, 2) : this.rng.range(1, 1.8);
    }
    cmd.crouch = !this.peekUp;
    if (this.peekUp) this.tickFire(dt, p, cmd);
    // Cobertura comprometida (jugador muy cerca) o demasiado tiempo quieto: reubicarse.
    if ((p.canSee && p.distance < 4.5) || this.stateTime > this.coverFor) this.go('combat');
  }

  private tickFlank(dt: number, p: Perception, t: Tactics, cmd: BrainCommand): void {
    cmd.hasLook = true;
    cmd.lookAt.copy(p.canSee ? p.playerPos : this.lastKnown);
    this.tickFire(dt, p, cmd);
    const arrived = p.path === 'arrived' || p.selfPos.distanceTo(this.goal) < 0.8;
    if (arrived || this.stateTime > 6 || p.path === 'stuck' || p.path === 'failed') {
      this.go('combat');
      return;
    }
    cmd.hasMove = true;
    cmd.moveTo.copy(this.goal);
    cmd.run = true;
    void t;
  }

  private tickSearch(dt: number, p: Perception, t: Tactics, cmd: BrainCommand): void {
    if (p.canSee && this.detection > 0.5) {
      this.reactionLeft = this.def.reaction * 0.5;
      this.go('combat');
      return;
    }
    const atLast = p.selfPos.distanceTo(this.lastKnown) < 1.2 || p.path === 'arrived';
    if (!atLast && this.stateTime < 12) {
      this.moveTo(this.lastKnown, this.stateTime < 4, cmd, p, t);
      if (p.path === 'stuck' && this.stuckCount > 3) this.go('patrol');
      return;
    }
    // Mira alrededor en el último punto conocido.
    cmd.hasLook = true;
    const a = this.stateTime * 1.3;
    cmd.lookAt.set(p.selfPos.x + Math.sin(a) * 5, p.selfPos.y + 1.4, p.selfPos.z + Math.cos(a) * 5);
    if (atLast) this.searchLook += dt;
    if (this.stateTime > 12 || this.searchLook > SEARCH_LOOK_TIME) {
      this.vigilant = 20;
      this.detection = 0.25;
      this.go('patrol');
    }
  }
}
