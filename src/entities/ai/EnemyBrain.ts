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

/** Una cobertura elegida: dónde se esconde y, si es alta, desde dónde se asoma (de lado). */
export interface CoverChoice {
  readonly pos: Vector3;
  readonly peek: Vector3;
  high: boolean;
}

/** Consultas tácticas que resuelve el cuerpo (navegación + física). */
export interface Tactics {
  findCover(self: Vector3, threat: Vector3, out: CoverChoice): boolean;
  findFlank(self: Vector3, threat: Vector3, side: number, out: Vector3): boolean;
  randomNear(pos: Vector3, radius: number, out: Vector3): boolean;
}

export interface BrainCommand {
  hasMove: boolean;
  moveTo: Vector3;
  run: boolean;
  crouch: boolean;
  /** Escondido tras una cobertura: con el arma recogida. */
  hidden: boolean;
  hasLook: boolean;
  /** Punto que mira, a la altura de los pies (la cabeza y el arma buscan el pecho de quien esté ahí). */
  lookAt: Vector3;
  /** Dispara ESTE paso. */
  fire: boolean;
  /** Dispara ESTE paso hacia donde vio al jugador, sin verlo (cubre a un compañero). */
  suppress: boolean;
  /** Recarga 0..1 (−1: no recarga). */
  reload: number;
  /** Embestida 0..1 (−1: no embiste); `pounce` es el paso en que salta. */
  lunge: number;
  pounce: boolean;
  /** Progreso del telégrafo 0..1 (láser del tirador, alzar escopeta). */
  telegraph: number;
  /** Medidor de detección 0..1 (icono ? → !). */
  detection: number;
  icon: 'none' | 'suspicious' | 'alert' | 'flank';
  /** Evento de un paso: alerta a los aliados cercanos. */
  shout: boolean;
}

export function emptyCommand(): BrainCommand {
  return {
    hasMove: false,
    moveTo: new Vector3(),
    run: false,
    crouch: false,
    hidden: false,
    hasLook: false,
    lookAt: new Vector3(),
    fire: false,
    suppress: false,
    reload: -1,
    lunge: -1,
    pounce: false,
    telegraph: 0,
    detection: 0,
    icon: 'none',
    shout: false,
  };
}

const _away = new Vector3();
const LOSE_SIGHT_TO_SEARCH = 1.6;
const SEARCH_LOOK_TIME = 5;
const SUSPICIOUS_TIMEOUT = 7;
const PATROL_WAIT = 1.5;
/** Cubriendo a un compañero, cuánto se sigue disparando a donde se vio al jugador (s). */
const SUPPRESS_TIME = 2.6;
/** A cubierto y a la vista del jugador más de este tiempo: la cobertura ya no sirve. */
const COVER_BROKEN = 0.5;
/** Fuego encima (0..1,5) a partir del cual no se asoma y, en campo abierto, busca dónde meterse. */
const PINNED = 0.6;
const BREAK = 1;
/** Tiempo que huye de una granada (s). */
const EVADE_TIME = 1.3;
/** Sitios que registra alrededor de donde vio al jugador. */
const SEARCH_POINTS = 3;

export class EnemyBrain {
  /** Distancia máxima de combate cuando el enemigo asalta. */
  static readonly ASSAULT_RANGE = 8;

  state: AiState = 'patrol';
  stateTime = 0;
  detection = 0;
  readonly lastKnown = new Vector3();
  hasLastKnown = false;
  /** Segundos sin ver al jugador. */
  unseen = 99;
  /** Conciencia elevada tras una búsqueda (detecta más rápido). */
  private vigilant = 0;
  /** Asalto (oleadas del Excomunicado): se acerca en vez de disparar desde lejos. */
  aggressive = false;

  // Órdenes de la escuadra (ver `squad.ts`; sueltas, sin escuadra, dispara cuando puede).
  mayFire = true;
  covering = false;
  /** Rodear por un lado (−1, +1); se consume al empezar. */
  flankOrder: -1 | 0 | 1 = 0;
  /** Acaba de empezar a rodear (lo avisa el cuerpo y se apaga). */
  callout = false;

  // A dónde va.
  private readonly goal = new Vector3();
  private hasGoal = false;
  private stuckCount = 0;
  private patrolIndex = 0;
  private patrolWait = 0;
  private repositionIn = 3;
  private retreatIn = 0;
  private strafeIn = 0;
  private evadeT = 0;

  // Disparo.
  private reactionLeft = 0;
  private burstLeft = 0;
  private shotCooldown = 0;
  private telegraphT = 0;
  private shotsLeft: number;
  private reloadT = -1;

  // Cobertura.
  private readonly spot: CoverChoice = { pos: new Vector3(), peek: new Vector3(), high: false };
  private inCover = false;
  private hadTurn = true;
  private exposed = 0;
  private peekTimer = 0;
  private peekUp = false;
  private coverTry = 0;
  private coverFor = 10;

  // Cuerpo a cuerpo.
  private lungeT = -1;
  private recoverT = 0;
  private backOff = false;

  // Búsqueda: dónde lo perdió (los sitios que registra salen de ahí) y cuál toca.
  private readonly searchFrom = new Vector3();
  private readonly searchAt = new Vector3();
  private searchLeft = 0;
  private searchLook = 0;

  // Lo que le pasa encima.
  /** Fuego cercano (0..1,5): no se asoma y apunta peor. */
  suppression = 0;
  private staggerT = 0;
  private disarmT = 0;
  /** Lo que le queda aturdido (s); infinito si no se le pasa solo (un takedown, el jefe arrodillado). */
  stunLeft = 0;
  /** Lo que hacía cuando lo aturdieron. */
  private stunFrom: AiState = 'patrol';

  constructor(
    readonly def: EnemyTypeDef,
    readonly patrol: readonly Vector3[],
    readonly home: Vector3,
    readonly stationary: boolean,
    private readonly rng: Rng,
  ) {
    this.burstLeft = def.weapon.burst;
    this.shotsLeft = def.weapon.mag;
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
    if (s === 'search' || s === 'patrol') this.topUp();
    if (s === 'search') {
      this.detection = Math.min(this.detection, 0.7);
      this.searchLeft = SEARCH_POINTS;
      this.searchFrom.copy(this.lastKnown);
    }
  }

  /** Sin nadie a quien disparar, recarga lo gastado. */
  private topUp(): void {
    if (this.reloadT < 0) this.shotsLeft = this.def.weapon.mag;
  }

  /** Va a cubrirse si hay dónde. */
  private takeCover(p: Perception, t: Tactics): boolean {
    if (this.stationary || !t.findCover(p.selfPos, this.lastKnown, this.spot)) return false;
    this.go('cover');
    // También si ya estaba en otra: empieza de nuevo el camino y el ciclo de asomarse.
    this.stateTime = 0;
    this.coverFor = this.rng.range(8, 12);
    this.inCover = false;
    this.exposed = 0;
    this.peekUp = false;
    this.peekTimer = this.rng.range(0.4, 0.9);
    this.goal.copy(this.spot.pos);
    this.hasGoal = true;
    return true;
  }

  get reloading(): boolean {
    return this.reloadT >= 0;
  }

  /** Descolocado por un impacto: ni dispara ni se mueve. */
  get staggered(): boolean {
    return this.staggerT > 0;
  }

  /** Con un impacto en el brazo: baja el arma. */
  get disarmed(): boolean {
    return this.disarmT > 0;
  }

  /** Cuánto le falla la puntería por el fuego que tiene encima (0..0,35). */
  get shaken(): number {
    return 0.35 * Math.min(1, this.suppression);
  }

  stagger(seconds: number): void {
    if (seconds <= 0 || this.state === 'dead') return;
    this.staggerT = Math.max(this.staggerT, seconds);
    this.telegraphT = 0;
    this.lungeT = -1;
    this.reactionLeft = Math.max(this.reactionLeft, seconds + 0.15);
  }

  disarm(seconds: number): void {
    if (seconds <= 0) return;
    this.disarmT = Math.max(this.disarmT, seconds);
    this.reactionLeft = Math.max(this.reactionLeft, 0.25);
  }

  /** Le pasan balas cerca. */
  suppress(k: number): void {
    this.suppression = Math.min(1.5, this.suppression + k);
  }

  /** Hay una granada en `at`: se aparta. */
  evade(at: Vector3, self: Vector3, t: Tactics): void {
    if (this.stationary || this.evadeT > 0 || this.state === 'dead' || this.state === 'stunned') return;
    // Un punto al otro lado, a unos metros.
    const l = Math.hypot(self.x - at.x, self.z - at.z) || 1;
    _away.set(self.x + ((self.x - at.x) / l) * 4.5, self.y, self.z + ((self.z - at.z) / l) * 4.5);
    if (!t.randomNear(_away, 1.2, this.goal)) return;
    this.evadeT = EVADE_TIME;
    this.hasGoal = true;
    this.telegraphT = 0;
    this.inCover = false;
  }

  stun(): void {
    if (this.state === 'dead') return;
    if (this.state !== 'stunned') this.stunFrom = this.state;
    this.state = 'stunned';
    this.stateTime = 0;
    this.stunLeft = Number.POSITIVE_INFINITY;
  }

  /** Aturdido por un destello: se le pasa solo. */
  get dazed(): boolean {
    return this.state === 'stunned' && Number.isFinite(this.stunLeft);
  }

  /** Un destello en `at` lo deja sin ver `seconds` segundos (otro destello solo lo alarga). */
  daze(seconds: number, at: Vector3): void {
    if (this.state === 'dead') return;
    if (this.state === 'stunned') {
      if (this.dazed) this.stunLeft = Math.max(this.stunLeft, seconds);
      return;
    }
    this.stunFrom = this.state;
    if (!this.hasLastKnown) {
      this.lastKnown.copy(at);
      this.hasLastKnown = true;
    }
    this.state = 'stunned';
    this.stateTime = 0;
    this.stunLeft = seconds;
    this.telegraphT = 0;
    this.lungeT = -1;
  }

  /** Un destello que no lo aturde (el jefe): pierde el disparo que preparaba y tarda en volver a apuntar. */
  dazzle(seconds: number): void {
    this.telegraphT = 0;
    this.reactionLeft = Math.max(this.reactionLeft, seconds);
  }

  /** Se le pasa: si ya peleaba, sigue, tardando en volver a apuntar; si no sabía de nadie, registra la zona. */
  private recover(): void {
    const fighting = this.stunFrom === 'combat' || this.stunFrom === 'cover' || this.stunFrom === 'flank';
    this.stunLeft = 0;
    this.go(fighting ? 'combat' : 'search');
    this.unseen = 0;
    this.vigilant = Math.max(this.vigilant, 12);
    this.reactionLeft = this.def.reaction * 1.4;
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

  /** Vuelve a empezar (reaparición del jugador): de patrulla, con el cargador lleno y sin nada encima. */
  reset(): void {
    this.state = 'patrol';
    this.stateTime = 0;
    this.detection = 0;
    this.hasLastKnown = false;
    this.hasGoal = false;
    this.stunLeft = 0;
    this.shotsLeft = this.def.weapon.mag;
    this.burstLeft = this.def.weapon.burst;
    this.reloadT = -1;
    this.staggerT = 0;
    this.disarmT = 0;
    this.evadeT = 0;
    this.suppression = 0;
    this.telegraphT = 0;
    this.lungeT = -1;
    this.recoverT = 0;
    this.flankOrder = 0;
    this.covering = false;
    this.mayFire = true;
  }

  /** Encuentra a un compañero caído: registra la zona, alerta. */
  findBody(at: Vector3): void {
    if (this.state !== 'patrol' && this.state !== 'suspicious') return;
    this.lastKnown.copy(at);
    this.hasLastKnown = true;
    this.detection = Math.max(this.detection, 0.6);
    this.vigilant = 20;
    this.go('search');
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
    cmd.suppress = false;
    cmd.reload = -1;
    cmd.lunge = -1;
    cmd.pounce = false;
    cmd.shout = false;
    cmd.hasMove = false;
    cmd.hasLook = false;
    cmd.crouch = false;
    cmd.hidden = false;
    cmd.run = false;
    if (this.state === 'stunned') {
      this.stunLeft -= dt;
      if (this.stunLeft <= 0) this.recover();
    }
    if (this.state === 'dead' || this.state === 'stunned') {
      cmd.telegraph = 0;
      cmd.icon = 'none';
      cmd.detection = 0;
      return;
    }
    this.vigilant = Math.max(0, this.vigilant - dt);
    this.shotCooldown = Math.max(0, this.shotCooldown - dt);
    this.disarmT = Math.max(0, this.disarmT - dt);
    this.suppression = Math.max(0, this.suppression - dt * 0.5);
    if (this.reloadT >= 0) {
      this.reloadT += dt;
      if (this.reloadT >= this.def.weapon.reload) {
        this.reloadT = -1;
        this.shotsLeft = this.def.weapon.mag;
      }
    }
    cmd.reload = this.reloadT >= 0 ? this.reloadT / this.def.weapon.reload : -1;

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

    // Descolocado: se queda donde está hasta recuperarse. Con una granada cerca, lo primero es apartarse.
    if (this.staggerT > 0) {
      this.staggerT -= dt;
      cmd.hasLook = this.hasLastKnown;
      cmd.lookAt.copy(this.lastKnown);
      cmd.telegraph = 0;
      this.report(cmd);
      return;
    }
    if (this.evadeT > 0) {
      this.evadeT -= dt;
      cmd.hasMove = true;
      cmd.moveTo.copy(this.goal);
      cmd.run = true;
      cmd.telegraph = 0;
      if (this.evadeT <= 0) this.hasGoal = false;
      this.report(cmd);
      return;
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
        if (this.def.lunge) this.tickMelee(dt, p, t, cmd);
        else this.tickCombat(dt, p, t, cmd);
        break;
      case 'cover':
        this.tickCover(dt, p, t, cmd);
        break;
      case 'flank':
        this.tickFlank(dt, p, cmd);
        break;
      case 'search':
        this.tickSearch(dt, p, t, cmd);
        break;
      default:
        break;
    }
    this.report(cmd);
  }

  /** Lo que se ve de él sobre su cabeza. */
  private report(cmd: BrainCommand): void {
    cmd.detection = this.detection;
    cmd.icon =
      this.state === 'flank'
        ? 'flank'
        : this.state === 'patrol'
          ? this.detection > 0.05
            ? 'suspicious'
            : 'none'
          : this.state === 'suspicious' || this.state === 'search'
            ? 'suspicious'
            : 'alert';
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
    if (this.reloadT >= 0 || this.disarmT > 0) {
      this.telegraphT = 0;
      cmd.telegraph = 0;
      return;
    }
    if (!p.canSee || !p.canShoot || p.distance > w.range * 1.15) {
      // Sin línea de tiro: el telégrafo se cancela (romper la línea de visión funciona).
      this.telegraphT = Math.max(0, this.telegraphT - dt * 3);
      cmd.telegraph = w.telegraph > 0 ? this.telegraphT / w.telegraph : 0;
      // Cubre a quien rodea: ráfagas hacia donde vio al jugador.
      if (this.covering && w.telegraph === 0 && this.hasLastKnown && this.unseen < SUPPRESS_TIME && p.distance < w.range) {
        if (this.shotCooldown <= 0) {
          cmd.suppress = true;
          this.spendShot();
          this.nextShot(w.burstPause * 0.7);
        }
        return;
      }
      if (this.unseen > 0.8) this.reactionLeft = Math.max(this.reactionLeft, this.def.reaction * 0.6);
      return;
    }
    if (this.reactionLeft > 0) {
      this.reactionLeft -= dt;
      cmd.telegraph = 0;
      return;
    }
    if (w.telegraph > 0 && !(w.burstTelegraph && this.burstLeft < w.burst)) {
      if (this.shotCooldown > 0) {
        cmd.telegraph = 0;
        return;
      }
      this.telegraphT += dt;
      cmd.telegraph = Math.min(1, this.telegraphT / w.telegraph);
      if (this.telegraphT >= w.telegraph) {
        this.telegraphT = 0;
        cmd.fire = true;
        this.spendShot();
        this.nextShot(w.burstPause + 60 / w.rpm);
      }
      return;
    }
    cmd.telegraph = 0;
    // Sin turno solo se termina la ráfaga empezada.
    if (!this.mayFire && this.burstLeft === w.burst) return;
    if (this.shotCooldown > 0) return;
    cmd.fire = true;
    this.spendShot();
    this.nextShot(this.covering ? w.burstPause * 0.7 : w.burstPause);
  }

  /** Cadencia: dentro de la ráfaga, la del arma; entre ráfagas, la pausa. */
  private nextShot(pause: number): void {
    const w = this.def.weapon;
    this.burstLeft--;
    if (this.burstLeft <= 0) {
      this.burstLeft = w.burst;
      this.shotCooldown = pause + this.rng.range(0, 0.45);
    } else this.shotCooldown = 60 / w.rpm;
  }

  private spendShot(): void {
    this.shotsLeft--;
    if (this.shotsLeft <= 0) {
      this.reloadT = 0;
      this.burstLeft = this.def.weapon.burst;
    }
  }

  private tickCombat(dt: number, p: Perception, t: Tactics, cmd: BrainCommand): void {
    cmd.hasLook = true;
    cmd.lookAt.copy(p.canSee ? p.playerPos : this.lastKnown);
    this.tickFire(dt, p, cmd);
    if (this.stationary) return;
    // La escuadra le manda rodear: lo avisa y va.
    if (this.flankOrder !== 0) {
      const side = this.flankOrder;
      this.flankOrder = 0;
      if (t.findFlank(p.selfPos, this.lastKnown, side, this.goal)) {
        this.go('flank');
        this.hasGoal = true;
        this.callout = true;
        return;
      }
    }
    if (this.unseen > (this.covering ? SUPPRESS_TIME : LOSE_SIGHT_TO_SEARCH)) {
      this.go('search');
      return;
    }
    // Recargando o con fuego encima, a cubierto; si no hay dónde, al menos se agacha.
    const wantsCover = (this.reloadT >= 0 || this.suppression > BREAK) && this.def.prefersCover > 0 && !this.aggressive;
    this.repositionIn -= dt;
    if (wantsCover && this.coverTry <= 0) {
      this.coverTry = 1;
      if (this.takeCover(p, t)) return;
    }
    this.coverTry -= dt;
    if (wantsCover) cmd.crouch = true;
    if (this.repositionIn <= 0) {
      this.repositionIn = this.rng.range(3, 5.5);
      if (this.rng.chance(this.mayFire ? this.def.prefersCover : Math.max(this.def.prefersCover, 0.6)) && this.takeCover(p, t)) return;
    }
    // Mantener la distancia preferida.
    const [mn, engageMax] = this.def.engage;
    const mx = this.aggressive ? Math.min(engageMax, EnemyBrain.ASSAULT_RANGE) : engageMax;
    this.retreatIn -= dt;
    if (this.covering && !p.canSee && this.unseen < SUPPRESS_TIME && this.def.weapon.telegraph === 0) {
      // Cubriendo a quien rodea: desde donde está.
      this.hasGoal = false;
    } else if (p.distance > mx || !p.canSee) {
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
    } else if (this.def.fly) {
      // El dron no se queda quieto: cambia de sitio a su alrededor.
      this.strafeIn -= dt;
      if (this.strafeIn <= 0) {
        this.strafeIn = this.rng.range(1.6, 3);
        this.hasGoal = t.randomNear(p.selfPos, 5, this.goal);
      }
      if (this.hasGoal) {
        cmd.hasMove = true;
        cmd.moveTo.copy(this.goal);
      }
    } else {
      this.hasGoal = false;
    }
  }

  /** Cuerpo a cuerpo: corre hacia su presa, se agazapa, salta y tarda en recolocarse. */
  private tickMelee(dt: number, p: Perception, t: Tactics, cmd: BrainCommand): void {
    const L = this.def.lunge!;
    const wind = this.def.weapon.telegraph;
    cmd.hasLook = true;
    cmd.lookAt.copy(p.canSee ? p.playerPos : this.lastKnown);
    cmd.telegraph = 0;
    if (this.lungeT >= 0) {
      this.lungeT += dt / L.time;
      if (this.lungeT < 1) cmd.lunge = this.lungeT;
      else {
        this.lungeT = -1;
        this.recoverT = L.recover;
        this.backOff = true;
        this.hasGoal = false;
      }
      return;
    }
    this.recoverT = Math.max(0, this.recoverT - dt);
    this.reactionLeft = Math.max(0, this.reactionLeft - dt);
    const ready = this.recoverT <= 0 && this.reactionLeft <= 0 && p.canSee && p.distance < L.range;
    if (this.telegraphT > 0 || ready) {
      // Si la presa se aparta a tiempo, deja de agazaparse y la persigue.
      if (!p.canSee || p.distance > L.range * 1.7) this.telegraphT = 0;
      else {
        this.telegraphT += dt;
        cmd.telegraph = Math.min(1, this.telegraphT / wind);
        if (this.telegraphT >= wind) {
          this.telegraphT = 0;
          this.lungeT = 0;
          cmd.telegraph = 0;
          cmd.lunge = 0;
          cmd.pounce = true;
        }
        return;
      }
    }
    if (this.unseen > LOSE_SIGHT_TO_SEARCH * 2) {
      this.go('search');
      return;
    }
    if (this.recoverT > 0) {
      // Tras saltar, si se queda pegado a su presa, se aparta unos pasos sin perderla de vista.
      if (this.backOff && p.distance < L.range * 0.6) {
        if (!this.hasGoal) {
          const l = Math.hypot(p.selfPos.x - p.playerPos.x, p.selfPos.z - p.playerPos.z) || 1;
          const k = (L.range * 0.65) / l;
          _away.set(p.selfPos.x + (p.selfPos.x - p.playerPos.x) * k, p.selfPos.y, p.selfPos.z + (p.selfPos.z - p.playerPos.z) * k);
          this.hasGoal = t.randomNear(_away, 1.2, this.goal);
          if (!this.hasGoal) this.backOff = false;
        }
        if (this.hasGoal) {
          cmd.hasMove = true;
          cmd.moveTo.copy(this.goal);
        }
      }
      return;
    }
    if (p.canSee && p.distance < L.reach) return;
    this.moveTo(p.canSee ? p.playerPos : this.lastKnown, true, cmd, p, t);
  }

  private tickCover(dt: number, p: Perception, t: Tactics, cmd: BrainCommand): void {
    cmd.hasLook = true;
    cmd.lookAt.copy(p.canSee ? p.playerPos : this.lastKnown);
    const c = this.spot;
    if (!this.inCover) {
      if (p.path === 'arrived' || p.selfPos.distanceTo(c.pos) < 0.7) this.inCover = true;
      else {
        if (p.path === 'stuck' || p.path === 'failed') {
          this.go('combat');
          return;
        }
        // De camino corre; solo dispara si lo tiene claro y no está recargando.
        cmd.hasMove = true;
        cmd.moveTo.copy(c.pos);
        cmd.run = true;
        this.tickFire(dt, p, cmd);
        return;
      }
    }
    // Ciclo asomarse / esconderse. Con fuego encima, recargando o sin turno, se queda dentro.
    const turn = this.mayFire || this.covering;
    const pinned = this.suppression > PINNED || this.reloadT >= 0 || !turn;
    if (turn && !this.hadTurn && !this.peekUp) this.peekTimer = Math.min(this.peekTimer, 0.35);
    this.hadTurn = turn;
    this.peekTimer -= dt;
    if (this.peekUp && pinned && this.burstLeft === this.def.weapon.burst) this.peekTimer = 0;
    if (this.peekTimer <= 0 && !(pinned && !this.peekUp)) {
      this.peekUp = !this.peekUp;
      this.peekTimer = this.peekUp ? this.rng.range(1.4, 2.2) : this.rng.range(0.9, 1.7);
    }
    if (c.high) {
      // Alta: sale de lado para disparar y vuelve a meterse.
      const target = this.peekUp ? c.peek : c.pos;
      const there = p.selfPos.distanceTo(target) < 0.45;
      if (!there) {
        cmd.hasMove = true;
        cmd.moveTo.copy(target);
        cmd.run = !this.peekUp;
      }
    } else cmd.crouch = !this.peekUp;
    cmd.hidden = !this.peekUp && !cmd.hasMove;
    if (this.peekUp) this.tickFire(dt, p, cmd);
    // Escondido y aun así a la vista: el jugador la ha rodeado.
    this.exposed = !this.peekUp && p.canSee ? this.exposed + dt : Math.max(0, this.exposed - dt);
    if (this.exposed > COVER_BROKEN && this.takeCover(p, t)) return;
    // Cobertura comprometida (jugador muy cerca) o demasiado tiempo quieto: reubicarse.
    if (this.exposed > COVER_BROKEN * 2 || (p.canSee && p.distance < 4) || this.stateTime > this.coverFor) this.go('combat');
  }

  private tickFlank(dt: number, p: Perception, cmd: BrainCommand): void {
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
    // Registra unos cuantos sitios alrededor antes de darlo por perdido.
    if (atLast && this.searchLeft > 0 && this.searchLook > SEARCH_LOOK_TIME * 0.3) {
      this.searchLeft--;
      this.searchLook = 0;
      if (t.randomNear(this.searchFrom, 6, this.searchAt)) {
        this.lastKnown.copy(this.searchAt);
        this.hasGoal = false;
        this.stateTime = Math.min(this.stateTime, 6);
        return;
      }
    }
    // Mira alrededor en el último punto conocido.
    cmd.hasLook = true;
    const a = this.stateTime * 1.3;
    cmd.lookAt.set(p.selfPos.x + Math.sin(a) * 5, p.selfPos.y, p.selfPos.z + Math.cos(a) * 5);
    if (atLast) this.searchLook += dt;
    if (this.stateTime > 12 || this.searchLook > SEARCH_LOOK_TIME) {
      this.vigilant = 20;
      this.detection = 0.25;
      this.go('patrol');
    }
  }
}
