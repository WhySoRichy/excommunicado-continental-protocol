import type { Collider } from '@dimforge/rapier3d-compat';
import { Vector3 } from 'three';
import { applyDamage, makeVitals, type Vitals } from '../combat/damage';
import type { Rng } from '../core/rng';
import type { NavGrid } from '../levels/nav/NavGrid';
import type { CivilianDef } from '../levels/types';
import { Groups, type PhysicsWorld } from '../physics/Physics';
import { emptyIntent, PlayerController, yawFromDir } from './PlayerController';

const FLEE_SPEED = 0.95;
const PANIC_RADIUS = 14;

type CivState = 'calm' | 'flee' | 'hide' | 'dead';

/**
 * Civil, solo simulación: no lleva armas, no bloquea al jugador ni a los enemigos (grupo CIVILIAN) y huye del ruido.
 * Herirlo o matarlo penaliza el rango (lo cuenta el director de misión). Lo que se ve es `CivilianView`.
 */
export class Civilian {
  readonly id: string;
  /** Orden en el nivel: elige su ropa en la vista. */
  readonly index: number;
  readonly mover: PlayerController;
  readonly vitals: Vitals = makeVitals({ maxHealth: 60 });
  readonly behavior: CivilianDef['behavior'];
  /**
   * Fase inicial de su baile. Se sortea aquí, con el azar de la partida, aunque solo la use la vista: sacarlo de la
   * simulación cambiaría toda la secuencia de azar posterior.
   */
  readonly dancePhase0: number;
  state: CivState = 'calm';
  private readonly home: Vector3;
  private readonly goal = new Vector3();
  private readonly intent = emptyIntent();
  private hideTimer = 0;
  private stuckT = 0;
  private readonly progressFrom = new Vector3();

  constructor(
    def: CivilianDef,
    private readonly physics: PhysicsWorld,
    private readonly nav: NavGrid,
    private readonly rng: Rng,
    index: number,
  ) {
    this.id = def.id;
    this.index = index;
    this.home = new Vector3(def.pos[0], def.pos[1], def.pos[2]);
    this.mover = new PlayerController(physics, new Vector3(def.pos[0], def.pos[1] + 0.02, def.pos[2]), def.yaw, Groups.CIVILIAN);
    this.dancePhase0 = rng.range(0, Math.PI * 2);
    this.behavior = def.behavior;
  }

  get alive(): boolean {
    return !this.vitals.dead;
  }

  get collider(): Collider {
    return this.mover.collider;
  }

  get feet(): Vector3 {
    return this.mover.feet;
  }

  get height(): number {
    return this.mover.height;
  }

  /** Ruido o disparo cerca: huye lejos del origen. */
  panic(from: Vector3): void {
    if (!this.alive) return;
    if (this.state === 'hide') return;
    if (this.feet.distanceTo(from) > PANIC_RADIUS && this.state === 'calm') return;
    this.pickFleeGoal(from);
    this.state = 'flee';
    this.hideTimer = this.rng.range(4, 7);
  }

  private pickFleeGoal(from: Vector3): void {
    const f = this.feet;
    let best = -1;
    let bestScore = -Infinity;
    for (let i = 0; i < 12; i++) {
      const a = this.rng.range(0, Math.PI * 2);
      const r = this.rng.range(6, 14);
      const n = this.nav.nearestNode(f.x + Math.sin(a) * r, f.y, f.z + Math.cos(a) * r, 2);
      if (n < 0) continue;
      const dx = this.nav.nodeX[n]! - from.x;
      const dz = this.nav.nodeZ[n]! - from.z;
      const score = dx * dx + dz * dz;
      if (score > bestScore) {
        bestScore = score;
        best = n;
      }
    }
    if (best >= 0) this.nav.pos(best, this.goal);
    else this.goal.copy(f);
    this.progressFrom.copy(f);
    this.stuckT = 0;
  }

  /** Daño recibido. Devuelve si murió con este impacto. */
  applyHit(amount: number): { killed: boolean; dealt: number } {
    const r = applyDamage(this.vitals, amount);
    if (r.dealt <= 0) return { killed: false, dealt: 0 };
    if (r.killed) {
      this.state = 'dead';
      this.mover.kill();
      this.mover.collider.setEnabled(false);
    } else this.panic(this.feet);
    return { killed: r.killed, dealt: r.dealt };
  }

  fixedUpdate(dt: number): void {
    const it = this.intent;
    it.moveX = 0;
    it.moveY = 0;
    it.sprint = false;
    if (this.state === 'flee') {
      const f = this.feet;
      const dx = this.goal.x - f.x;
      const dz = this.goal.z - f.z;
      const d = Math.hypot(dx, dz);
      this.stuckT += dt;
      if (this.stuckT > 1) {
        if (f.distanceTo(this.progressFrom) < 0.3) this.pickFleeGoal(f);
        this.progressFrom.copy(f);
        this.stuckT = 0;
      }
      if (d < 0.6) {
        this.state = 'hide';
        this.mover.setPosture('crouch');
      } else {
        it.camYaw = yawFromDir(dx, dz);
        it.moveY = FLEE_SPEED;
        it.sprint = true;
      }
    } else if (this.state === 'hide') {
      this.hideTimer -= dt;
      if (this.hideTimer <= 0) {
        this.state = 'calm';
        this.mover.setPosture('stand');
      }
    } else if (this.state === 'calm' && this.behavior !== 'dance') {
      // Vuelve despacio a su sitio.
      const f = this.feet;
      const dx = this.home.x - f.x;
      const dz = this.home.z - f.z;
      if (Math.hypot(dx, dz) > 1) {
        it.camYaw = yawFromDir(dx, dz);
        it.moveY = 0.4;
      }
    }
    this.mover.fixedUpdate(dt, it);
  }

  /** Suelta su cuerpo físico (la vista se suelta aparte, en `CivilianViews`). */
  dispose(): void {
    this.physics.removeCharacter(this.mover.char);
  }
}

export class CivilianManager {
  readonly list: Civilian[] = [];
  private readonly byHandle = new Map<number, Civilian>();
  onHurt: ((c: Civilian, killed: boolean) => void) | null = null;

  constructor(defs: readonly CivilianDef[], physics: PhysicsWorld, nav: NavGrid, rng: Rng) {
    defs.forEach((d, i) => {
      const c = new Civilian(d, physics, nav, rng, i);
      this.list.push(c);
      this.byHandle.set(c.collider.handle, c);
    });
  }

  fromCollider(c: Collider | null): Civilian | null {
    return c ? (this.byHandle.get(c.handle) ?? null) : null;
  }

  /** Disparo o alarma: los civiles cercanos huyen. */
  noise(from: Vector3, radius: number): void {
    const r2 = radius * radius;
    for (const c of this.list) if (c.alive && c.feet.distanceToSquared(from) <= r2) c.panic(from);
  }

  hit(c: Civilian, amount: number): void {
    const r = c.applyHit(amount);
    if (r.dealt > 0) this.onHurt?.(c, r.killed);
  }

  fixedUpdate(dt: number): void {
    for (const c of this.list) c.fixedUpdate(dt);
  }

  get aliveCount(): number {
    return this.list.filter((c) => c.alive).length;
  }

  dispose(): void {
    for (const c of this.list) c.dispose();
    this.list.length = 0;
    this.byHandle.clear();
  }
}
