import type { Collider } from '@dimforge/rapier3d-compat';
import { type Scene, Vector3 } from 'three';
import { applyDamage, makeVitals, type Vitals } from '../combat/damage';
import { FIXED_DT } from '../core/Loop';
import type { Rng } from '../core/rng';
import type { NavGrid } from '../levels/nav/NavGrid';
import type { CivilianDef } from '../levels/types';
import { Groups, type PhysicsWorld } from '../physics/Physics';
import { CharacterRig, type HairStyle, idlePose, type RigColors, type RigPose } from './CharacterRig';
import { emptyIntent, PlayerController, yawFromDir } from './PlayerController';

/** Rim verde azulado: los civiles se distinguen de los enemigos a simple vista. */
export const CIVILIAN_COLOR = 0x5ee6c8;
const FLEE_SPEED = 0.95;
const PANIC_RADIUS = 14;

const OUTFITS: ReadonlyArray<{ colors: RigColors; hair: HairStyle }> = [
  { colors: { jacket: 0xb33a5a, shirt: 0xf0e6e0, tie: 0xb33a5a, pants: 0x2b2b30, shoes: 0x111, skin: 0xd9b08c, hair: 0x3b2a1e, accent: 0xff2e88 }, hair: 'long' },
  { colors: { jacket: 0x2d6cb5, shirt: 0xf5f5f5, tie: 0x2d6cb5, pants: 0x1f2a3a, shoes: 0x111, skin: 0x8c5a3c, hair: 0x1a1512, accent: 0x19e3ff }, hair: 'short' },
  { colors: { jacket: 0xe8c04a, shirt: 0x141414, tie: 0xe8c04a, pants: 0x3a3a3a, shoes: 0x111, skin: 0xf0c8a8, hair: 0xc9a46a, accent: 0xffd23f }, hair: 'long' },
  { colors: { jacket: 0x6a3cff, shirt: 0xe9e9f2, tie: 0x6a3cff, pants: 0x202030, shoes: 0x111, skin: 0xb98a6a, hair: 0x2a1e18, accent: 0x7a3cff }, hair: 'cap' },
];

type CivState = 'calm' | 'flee' | 'hide' | 'dead';

/**
 * Civil: no lleva armas, no bloquea al jugador ni a los enemigos (grupo CIVILIAN) y huye
 * del ruido. Herirlo o matarlo penaliza el rango (lo cuenta el director de misión).
 */
export class Civilian {
  readonly id: string;
  readonly mover: PlayerController;
  readonly rig: CharacterRig;
  readonly vitals: Vitals = makeVitals({ maxHealth: 60 });
  state: CivState = 'calm';
  private readonly home: Vector3;
  private readonly goal = new Vector3();
  private readonly intent = emptyIntent();
  private readonly pose: RigPose = idlePose();
  private dancePhase: number;
  private hideTimer = 0;
  private deathTime = -1;
  private stuckT = 0;
  private readonly progressFrom = new Vector3();

  constructor(
    def: CivilianDef,
    private readonly physics: PhysicsWorld,
    private readonly nav: NavGrid,
    scene: Scene,
    private readonly rng: Rng,
    index: number,
  ) {
    this.id = def.id;
    this.home = new Vector3(def.pos[0], def.pos[1], def.pos[2]);
    this.mover = new PlayerController(physics, new Vector3(def.pos[0], def.pos[1] + 0.02, def.pos[2]), def.yaw, Groups.CIVILIAN);
    const outfit = OUTFITS[index % OUTFITS.length]!;
    this.rig = new CharacterRig(`civ:${def.id}`, { colors: outfit.colors, rimColor: CIVILIAN_COLOR, rimStrength: 0.9, hair: outfit.hair, weapon: 'none', uniqueMaterial: true });
    scene.add(this.rig.root);
    this.dancePhase = rng.range(0, Math.PI * 2);
    this.behavior = def.behavior;
  }

  private readonly behavior: CivilianDef['behavior'];

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
      this.deathTime = performance.now();
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

  renderUpdate(alpha: number, dt: number): void {
    const m = this.mover;
    m.renderFeet(alpha, this.rig.root.position);
    this.rig.root.rotation.y = m.renderYaw(alpha);
    const pose = this.pose;
    pose.speed = m.stepSpeed(FIXED_DT);
    pose.state = this.alive ? m.state : 'dead';
    pose.posture = m.posture;
    pose.grounded = m.grounded;
    pose.aim = 0;
    pose.stateTime = this.alive ? m.stateTime : (performance.now() - this.deathTime) / 1000;
    this.rig.update(pose, dt);
    if (this.alive && this.state === 'calm' && this.behavior === 'dance') {
      this.dancePhase += dt * 6.5;
      this.rig.root.position.y += Math.abs(Math.sin(this.dancePhase)) * 0.08;
      this.rig.root.rotation.y += Math.sin(this.dancePhase * 0.5) * 0.35;
    }
  }

  dispose(): void {
    this.rig.dispose();
    this.rig.material.dispose();
    this.physics.removeCharacter(this.mover.char);
  }
}

export class CivilianManager {
  readonly list: Civilian[] = [];
  private readonly byHandle = new Map<number, Civilian>();
  onHurt: ((c: Civilian, killed: boolean) => void) | null = null;

  constructor(
    defs: readonly CivilianDef[],
    physics: PhysicsWorld,
    nav: NavGrid,
    scene: Scene,
    rng: Rng,
  ) {
    defs.forEach((d, i) => {
      const c = new Civilian(d, physics, nav, scene, rng, i);
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

  renderUpdate(alpha: number, dt: number): void {
    for (const c of this.list) c.renderUpdate(alpha, dt);
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
