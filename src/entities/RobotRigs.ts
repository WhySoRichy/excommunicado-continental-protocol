import { Bone, type BufferGeometry, Group, type MeshStandardMaterial, Skeleton, SkinnedMesh, Sphere, Vector3 } from 'three';
import { clamp, damp, lerp } from '../core/math';
import type { RimUniforms } from '../render/materials';
import { createRigMaterial } from '../render/rigMaterial';
import type { DetailView } from './CharacterRig';
import { DRONE, DRONE_BONE, droneGeometry, HOUND, HOUND_BONE, houndGeometry, type RobotColors } from './rig/robots';
import type { RigPose } from './rig/types';
import { bell, footStep, type FootStep, type LegAngles, smooth, solveLeg, type Spring, spring } from './rigMath';

/** Lo que la vista de un enemigo necesita de su cuerpo: lo cumplen el personaje y las máquinas. */
export interface EnemyBody {
  readonly root: Group;
  readonly rim: RimUniforms;
  update(p: RigPose, dt: number): void;
  updateDetail(v: DetailView): void;
  motionSample(): Record<string, number>;
  dispose(): void;
}

export interface RobotLook {
  colors: RobotColors;
  rimColor: number;
  rimStrength: number;
}

const geometries = new Map<string, BufferGeometry>();

/** Mallas compartidas por aspecto (como las de los personajes: se construyen una vez y se quedan). */
function geometry(key: string, build: () => BufferGeometry): BufferGeometry {
  let g = geometries.get(key);
  if (!g) geometries.set(key, (g = build()));
  return g;
}

/** Cuerpo rígido por piezas con esqueleto: malla de cerca y de lejos, material propio y huesos en reposo. */
abstract class RobotRig implements EnemyBody {
  readonly root = new Group();
  readonly rim: RimUniforms;
  protected time = 0;
  protected readonly bones: Bone[] = [];
  private readonly material: MeshStandardMaterial;
  private readonly mesh: SkinnedMesh;
  private readonly skeleton: Skeleton;

  constructor(
    key: string,
    look: RobotLook,
    layout: ReadonlyArray<{ parent: number; at: readonly [number, number, number] }>,
    private readonly near: BufferGeometry,
    private readonly far: BufferGeometry,
    cull: Sphere,
  ) {
    const { mat, rim } = createRigMaterial(look.rimColor, look.rimStrength);
    mat.name = `rig:${key}`;
    this.material = mat;
    this.rim = rim;
    const abs: Vector3[] = [];
    for (const l of layout) {
      const b = new Bone();
      const at = new Vector3(...l.at);
      abs.push(at);
      if (l.parent < 0) {
        b.position.copy(at);
        this.root.add(b);
      } else {
        b.position.copy(at).sub(abs[l.parent]!);
        this.bones[l.parent]!.add(b);
      }
      this.bones.push(b);
    }
    this.mesh = new SkinnedMesh(near, mat);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.boundingSphere = cull;
    this.root.add(this.mesh);
    this.root.updateMatrixWorld(true);
    this.skeleton = new Skeleton(this.bones);
    this.mesh.bind(this.skeleton);
  }

  abstract update(p: RigPose, dt: number): void;

  updateDetail(v: DetailView): void {
    const d = this.root.position.distanceTo(v.eye);
    const isFar = this.mesh.geometry === this.far;
    const want = d > v.limit + (isFar ? -1 : 1) ? this.far : this.near;
    if (this.mesh.geometry !== want) this.mesh.geometry = want;
  }

  motionSample(): Record<string, number> {
    const out: Record<string, number> = { yaw: this.root.rotation.y };
    this.bones.forEach((b, i) => {
      out[`b${i}x`] = b.rotation.x;
      out[`b${i}z`] = b.rotation.z;
      if (i === 0) out.bodyY = b.position.y;
    });
    return out;
  }

  dispose(): void {
    this.skeleton.dispose();
    this.material.dispose();
    this.root.removeFromParent();
  }
}

const HOUND_LEGS = [
  { up: HOUND_BONE.upFL, lo: HOUND_BONE.loFL, front: 1, side: -1 },
  { up: HOUND_BONE.upFR, lo: HOUND_BONE.loFR, front: 1, side: 1 },
  { up: HOUND_BONE.upBL, lo: HOUND_BONE.loBL, front: -1, side: -1 },
  { up: HOUND_BONE.upBR, lo: HOUND_BONE.loBR, front: -1, side: 1 },
] as const;
/** Desfase de cada pata al trote (en diagonal) y al galope (delanteras y traseras casi a la vez). */
const TROT = [0, Math.PI, Math.PI, 0] as const;
const GALLOP = [0, 0.5, Math.PI + 0.4, Math.PI + 0.9] as const;
/** Altura de la cadera en marcha, agazapado y tumbado (m sobre el suelo), con las patas algo dobladas. */
const STAND_Y = 0.49;
const CROUCH_Y = 0.33;
const DOWN_Y = 0.17;
const BODY_DROP = HOUND.bodyY - HOUND.hipY;

/** El sabueso: cuadrúpedo con marcha al trote y al galope, acecho, salto, tambaleo y caída. */
export class HoundRig extends RobotRig {
  private phase = 0;
  private readonly speedS: Spring = { x: 0, v: 0 };
  private readonly crouchS: Spring = { x: 0, v: 0 };
  private readonly leapS: Spring = { x: 0, v: 0 };
  /** Cabeceo del salto (arriba al salir, abajo al caer): vuelve a cero sin saltar al terminar. */
  private readonly arcS: Spring = { x: 0, v: 0 };
  private readonly dazeS: Spring = { x: 0, v: 0 };
  private readonly downS: Spring = { x: 0, v: 0 };
  private readonly alertS: Spring = { x: 0, v: 0 };
  private readonly step: FootStep = { along: 0, lift: 0 };
  private readonly leg: LegAngles = { thigh: 0, shin: 0 };
  private moveCos = 1;
  private moveSin = 0;

  constructor(key: string, look: RobotLook) {
    const H = HOUND;
    const hip = (s: number, z: number): { parent: number; at: [number, number, number] } => ({ parent: 0, at: [s * H.hipX, H.hipY, z] });
    const knee = (parent: number, s: number, z: number): { parent: number; at: [number, number, number] } => ({
      parent,
      at: [s * H.hipX, H.hipY - H.upper, z],
    });
    const id = `${look.colors.shell}|${look.colors.dark}|${look.colors.accent}`;
    super(
      key,
      look,
      [
        { parent: -1, at: [0, H.bodyY, 0] },
        { parent: 0, at: [0, H.headY, H.headZ] },
        { parent: 1, at: [0, H.jawY, H.jawZ] },
        { parent: 0, at: [0, H.tailY, H.tailZ] },
        hip(-1, H.frontZ),
        knee(4, -1, H.frontZ),
        hip(1, H.frontZ),
        knee(6, 1, H.frontZ),
        hip(-1, H.backZ),
        knee(8, -1, H.backZ),
        hip(1, H.backZ),
        knee(10, 1, H.backZ),
      ],
      geometry(`hound|near|${id}`, () => houndGeometry(look.colors, 'near')),
      geometry(`hound|far|${id}`, () => houndGeometry(look.colors, 'far')),
      new Sphere(new Vector3(0, 0.45, 0), 1.1),
    );
    this.bones[0]!.rotation.order = 'YXZ';
    this.bones[1]!.rotation.order = 'YXZ';
  }

  /**
   * `p.melee`: agazapado antes de saltar (0..1). `p.slash`: avance del salto (0..1, −1 si no salta). `p.daze`: apagado a
   * ratos por un destello. `p.death`: 2 y 4 caen de lado; el resto, sobre el vientre.
   */
  update(p: RigPose, dt: number): void {
    this.time += dt;
    const dead = p.state === 'dead';
    const speed = spring(this.speedS, dead ? 0 : p.speed, 12, dt);
    const moving = clamp(speed / 1.2, 0, 1);
    const gallop = smooth(3.6, 5.6, speed);
    if (p.speed > 0.2) {
      this.moveCos = damp(this.moveCos, Math.cos(p.moveAngle), 10, dt);
      this.moveSin = damp(this.moveSin, Math.sin(p.moveAngle), 10, dt);
    }
    const crouch = clamp(spring(this.crouchS, dead ? 0 : Math.max(p.melee, p.stagger * 0.5), 14, dt), 0, 1);
    const leaping = p.slash >= 0 && !dead;
    const leap = clamp(spring(this.leapS, leaping ? 1 : 0, leaping ? 22 : 12, dt), 0, 1);
    const daze = clamp(spring(this.dazeS, dead ? 0 : p.daze, p.daze > 0.5 ? 18 : 6, dt), 0, 1);
    const down = clamp(spring(this.downS, dead ? 1 : 0, 9, dt), 0, 1);
    const alert = clamp(spring(this.alertS, p.aim, 8, dt), 0, 1);

    // Cadencia: con la velocidad crece la zancada y, menos, el ritmo.
    this.phase += dt * Math.PI * 2 * (1.4 + speed * 0.26) * moving;
    const ph = this.phase;
    const stride = moving * lerp(0.1, 0.27, clamp(speed / 6.5, 0, 1));
    const liftH = moving * lerp(0.07, 0.15, clamp(speed / 6.5, 0, 1));

    // Tronco.
    const breathe = Math.sin(this.time * 2.1) * 0.006 * (1 - moving);
    const bounce = (0.5 + 0.5 * Math.cos(ph * 2)) * 0.018 * moving * (1 - gallop) + Math.sin(ph) * 0.045 * gallop;
    const twitch = daze * (Math.sin(this.time * 31) * 0.03 + Math.sin(this.time * 17.3) * 0.04);
    let y = lerp(lerp(STAND_Y, CROUCH_Y, crouch), STAND_Y + 0.06, leap) + breathe + bounce - daze * 0.14;
    y = lerp(y, DOWN_Y, down);
    // El galope cabecea; agazapado carga los cuartos traseros; en el salto apunta arriba y luego abajo.
    const arc = spring(this.arcS, leaping ? lerp(0.42, -0.3, smooth(0.15, 0.95, p.slash)) : 0, 18, dt);
    let pitch = Math.sin(ph + 0.6) * 0.11 * gallop * (1 - leap) + crouch * 0.14 * (1 - leap) + arc + twitch * 0.6;
    const flinch = p.flinch * (dead ? 0 : 1);
    pitch += (p.flinchFront ? 0.22 : -0.22) * flinch;
    let roll = Math.sin(ph) * 0.035 * moving * (1 - gallop) + 0.18 * flinch * p.flinchSide + twitch;
    const side = p.death === 2 || p.death === 4 ? 1 : 0;
    const t = dead ? clamp(p.stateTime / 0.5, 0, 1) : 0;
    roll = lerp(roll, side * 1.35 * (t * t), down);
    pitch = lerp(pitch, p.death === 0 ? 0.12 : -0.06, down);
    const body = this.bones[HOUND_BONE.body]!;
    body.position.y = y + BODY_DROP;
    body.rotation.set(pitch, 0, roll);

    // Patas: cada una va a donde le toca pisar (en el plano de su cadera), con la rodilla hacia atrás.
    for (let i = 0; i < 4; i++) {
      const l = HOUND_LEGS[i]!;
      const offset = lerp(TROT[i]!, GALLOP[i]!, gallop);
      const s = footStep(ph + offset, stride * (1 + 0.35 * gallop), liftH, this.step);
      const hipZ = l.front > 0 ? HOUND.frontZ : HOUND.backZ;
      // Con el tronco inclinado, la cadera de delante y la de detrás no están a la misma altura.
      const hipY = y - Math.sin(pitch) * hipZ - Math.sin(roll) * l.side * HOUND.hipX * (1 - down);
      let f = s.along * this.moveCos + (l.front > 0 ? 0.03 : -0.05);
      let d = hipY - s.lift;
      const sideways = -s.along * this.moveSin;
      // Agazapado, abre las patas delanteras; en el salto, delanteras al frente y traseras atrás; apagado, flojas.
      f += crouch * (1 - leap) * (l.front > 0 ? 0.12 : 0.03);
      f = lerp(f, l.front > 0 ? 0.3 : -0.34, leap);
      d = lerp(d, l.front > 0 ? 0.3 : 0.34, leap);
      f += daze * (l.front > 0 ? 0.1 : -0.08) + twitch * 0.5;
      // Caído: recogidas si queda sobre el vientre, estiradas a un lado si cae de costado.
      f = lerp(f, l.front > 0 ? 0.44 : -0.42, down);
      d = lerp(d, side ? 0.3 - 0.05 * i : 0.15, down);
      // La rodilla va hacia atrás: se resuelve en espejo.
      const a = solveLeg(-f, d, this.leg, HOUND.upper, HOUND.lower);
      const up = this.bones[l.up]!;
      const lo = this.bones[l.lo]!;
      const k = dead ? 14 : 20;
      up.rotation.x = damp(up.rotation.x, -a.thigh - pitch, k, dt);
      lo.rotation.x = damp(lo.rotation.x, -a.shin, k, dt);
      const spread = Math.atan2(sideways, Math.max(0.2, d)) + l.side * (0.05 + 0.1 * crouch + 0.2 * daze + (side ? 0 : 0.5 * down));
      up.rotation.z = damp(up.rotation.z, clamp(spread, -0.8, 0.8) - roll * (1 - down), k, dt);
    }

    // Cabeza: mira a su presa, baja al acechar y cuelga apagada.
    const head = this.bones[HOUND_BONE.head]!;
    const scan = (1 - alert) * Math.sin(this.time * 0.9) * 0.5 * (1 - moving);
    const lookYaw = clamp(p.lookYaw, -1.1, 1.1) * p.look * (1 - down) * (1 - daze);
    head.rotation.y = damp(head.rotation.y, lookYaw + scan * (1 - down), 9, dt);
    const headX =
      clamp(p.aimPitch + p.lookPitch, -0.5, 0.6) - pitch * 0.7 - crouch * 0.28 + leap * 0.25 - daze * 0.5 + Math.sin(ph * 2) * 0.03 * moving + 0.4 * flinch;
    head.rotation.x = damp(head.rotation.x, lerp(headX, -0.35, down), 14, dt);
    head.rotation.z = damp(head.rotation.z, -roll * 0.6 * (1 - down) + twitch * 1.5, 14, dt);
    // Mandíbula: se abre en el salto y la cierra al morder.
    const jaw = this.bones[HOUND_BONE.jaw]!;
    const open = leaping ? bell(clamp(p.slash * 1.2, 0, 1)) * 0.75 : crouch * 0.22;
    jaw.rotation.x = damp(jaw.rotation.x, -open - down * 0.2, 24, dt);
    const tail = this.bones[HOUND_BONE.tail]!;
    tail.rotation.x = damp(tail.rotation.x, -0.2 * alert + 0.6 * down - pitch + 0.25 * moving, 8, dt);
    tail.rotation.z = Math.sin(this.time * (3 + 5 * alert)) * 0.1 * (1 - down);
  }
}

/** El dron: se inclina hacia donde vuela, flota, apunta su arma y, apagado o muerto, cae dando vueltas. */
export class DroneRig extends RobotRig {
  private readonly tiltX: Spring = { x: 0, v: 0 };
  private readonly tiltZ: Spring = { x: 0, v: 0 };
  private readonly gimbalX: Spring = { x: 0, v: 0 };
  private spinRate = 46;
  private fall = 0;

  constructor(key: string, look: RobotLook) {
    const D = DRONE;
    const id = `${look.colors.shell}|${look.colors.dark}|${look.colors.accent}`;
    super(
      key,
      look,
      [
        { parent: -1, at: [0, D.bodyY, 0] },
        { parent: 0, at: [0, D.gimbalY, D.gimbalZ] },
        { parent: 0, at: [-D.rotorX, D.rotorY, -D.rotorZ] },
        { parent: 0, at: [D.rotorX, D.rotorY, -D.rotorZ] },
        { parent: 0, at: [-D.rotorX, D.rotorY, D.rotorZ] },
        { parent: 0, at: [D.rotorX, D.rotorY, D.rotorZ] },
      ],
      geometry(`drone|near|${id}`, () => droneGeometry(look.colors, 'near')),
      geometry(`drone|far|${id}`, () => droneGeometry(look.colors, 'far')),
      new Sphere(new Vector3(0, DRONE.bodyY, 0), 0.8),
    );
  }

  update(p: RigPose, dt: number): void {
    this.time += dt;
    const dead = p.state === 'dead';
    const off = dead || p.daze > 0.5;
    // Los rotores se paran al apagarse.
    this.spinRate = damp(this.spinRate, off ? (dead ? 0 : 5) : 46, off ? 2.2 : 4, dt);
    for (let i = 0; i < 4; i++) this.bones[DRONE_BONE.rotor0 + i]!.rotation.y += this.spinRate * dt * (i === 0 || i === 3 ? 1 : -1);
    const body = this.bones[DRONE_BONE.body]!;
    const lean = clamp(p.speed * 0.075, 0, 0.42);
    const hover = Math.sin(this.time * 2.3) * 0.035 + Math.sin(this.time * 3.7) * 0.015;
    const tx = -Math.cos(p.moveAngle) * lean + p.recoil * 0.1 + (p.flinchFront ? 0.5 : -0.5) * p.flinch;
    const tz = -Math.sin(p.moveAngle) * lean * -1 + 0.6 * p.flinch * p.flinchSide + Math.sin(this.time * 1.3) * 0.03;
    if (off) {
      // Cae dando vueltas y, en el suelo, queda ladeado.
      this.fall = Math.min(1, this.fall + dt * 1.6);
      const spun = p.grounded ? 0 : 1;
      body.rotation.y += dt * 7 * spun * (1 - 0.5 * this.fall);
      body.rotation.x = damp(body.rotation.x, p.grounded ? 0.16 : 0.75, p.grounded ? 14 : 5, dt);
      body.rotation.z = damp(body.rotation.z, p.grounded ? 0.34 : 0.9, p.grounded ? 14 : 5, dt);
      body.position.y = damp(body.position.y, p.grounded ? 0.16 : DRONE.bodyY, 10, dt);
      this.tiltX.x = body.rotation.x;
      this.tiltZ.x = body.rotation.z;
      this.tiltX.v = this.tiltZ.v = 0;
    } else {
      this.fall = 0;
      body.rotation.x = spring(this.tiltX, tx, 8, dt);
      body.rotation.z = spring(this.tiltZ, tz, 8, dt);
      body.rotation.y = damp(body.rotation.y - Math.round(body.rotation.y / (Math.PI * 2)) * Math.PI * 2, 0, 5, dt);
      body.position.y = damp(body.position.y, DRONE.bodyY + hover, 8, dt);
    }
    // El arma compensa la inclinación del cuerpo y mira al objetivo.
    const gimbal = this.bones[DRONE_BONE.gimbal]!;
    gimbal.rotation.x = spring(this.gimbalX, off ? -0.7 : clamp(p.aimPitch, -1.2, 0.5) - body.rotation.x, 12, dt);
    gimbal.rotation.z = damp(gimbal.rotation.z, off ? 0 : -body.rotation.z, 12, dt);
  }
}
