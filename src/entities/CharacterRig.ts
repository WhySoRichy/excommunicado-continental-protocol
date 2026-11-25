import {
  Bone,
  Box3,
  type BufferGeometry,
  Euler,
  Group,
  Matrix4,
  Mesh,
  type MeshStandardMaterial,
  Quaternion,
  Skeleton,
  SkinnedMesh,
  Sphere,
  Vector3,
} from 'three';
import { clamp, damp, lerp } from '../core/math';
import type { RimUniforms } from '../render/materials';
import { weaponMaterial } from '../render/weaponMaterial';
import type { Occlusion } from './occlusion';
import { type ArmAngles, type Frame, type HandGoal, type LegFree, type LegGoal, newFrame, resetFrame } from './rig/frame';
import { ankleRoll, cycleRate, strideAt } from './rig/gait';
import { acquire, release, type SharedGeometry } from './rig/geometry';
import {
  type Acrobatics,
  acrobatics,
  actions,
  dazed,
  dying,
  executeAt,
  flinching,
  gesture,
  inCover,
  kneeling,
  landing,
  locomotion,
  newGait,
  ribsAt,
  staggering,
  type Gait,
  type Weights,
} from './rig/layers';
import { solveLimb } from './rig/limbs';
import { appearanceKey, bodyGeometry, rigMaterial } from './rig/resources';
import { BONE_NAMES, type BoneName, boneLayout, FOREARM, GRIP_Y, GRIP_Z, HIP_X, SHIN, SHOULDER_Y, SPIN_Y, THIGH, UPPER_ARM } from './rig/skeleton';
import type { RigColors, RigOptions, RigPose, WeaponModel } from './rig/types';
import { carryPose, copyPose, mixPose, weaponClass, type WeaponPose, weaponPose } from './rig/weaponPoses';
import { GRIP, gearGeometry, STOCK, weaponGeometry } from './rig/weapons';
import { bell, type LegAngles, lookWeight, smooth, solveLeg, type Spring, spring } from './rigMath';

export { idlePose } from './rig/types';
export type { Features, HairStyle, Outfit, RigColors, RigOptions, RigPose, WeaponModel } from './rig/types';

const HALF_PI = Math.PI / 2;
const _v = new Vector3();
const _t = new Vector3();
const _pole = new Vector3();
const _shoulders = new Vector3();
const _aim = new Vector3();
const _hand = new Vector3();
const _zero = new Vector3();
const _up = new Vector3(0, 1, 0);
const _look = new Matrix4();
const _bounds = new Box3();
const _e = new Euler();
const _q = new Quaternion();
const _q2 = new Quaternion();
const _qBody = new Quaternion();
const _qGun = new Quaternion();
const _qHand = new Quaternion();
const _qHips = new Quaternion();
const _ankle = { up: 0, ahead: 0 };
/** La mano que empuña, respecto al arma: el cañón sigue la línea del puño. */
const HAND_ON_GRIP = new Quaternion().setFromEuler(new Euler(HALF_PI, 0, 0));
/** La izquierda: envuelve el puño de un arma corta o sujeta el guardamanos por debajo. */
const HAND_ON_PISTOL = new Quaternion().setFromEuler(new Euler(1.2, 0, 0.15));
const HAND_ON_GUARD = new Quaternion().setFromEuler(new Euler(0, 0.62, HALF_PI, 'YZX'));
const GRIP_POINT = new Vector3(0, GRIP_Y, GRIP_Z);
/** Lo que dobla una muñeca (rad). */
const WRIST = 1.2;
/** Esfera de recorte generosa (cubre volteretas, caídas y brazos extendidos). */
const CULL_CENTER = new Vector3(0, 0.9, 0);
const CULL_RADIUS = 1.6;
const weaponGeometries = new Map<string, SharedGeometry>();
const GEAR_KEY = 'gear|stun';
const GEAR_ACCENT = 0xd4af37;
/** Cuándo se ve la granada en la mano (desde que la coge hasta que sale; fracción del gesto). */
const GEAR_IN_HAND: readonly [number, number] = [0.12, 0.535];
/** Velocidad a partir de la cual el personaje esprinta. */
const SPRINT_SPEED = 5.6;
/** Rigidez del suavizado (1/s): tronco y pelvis, brazos por ángulos, brazos en gestos rápidos y piernas sueltas. */
const BODY_K = 24;
const ARM_K = 16;
const QUICK_K = 30;
const LEG_K = 18;
/** Con cuánta fuerza encoge las piernas al aterrizar (m/s). */
const LAND_KICK = 4.2;
/** Giro máximo de la cabeza sobre el torso al mirar algo (rad, unos 60°) y rigidez de la mirada (1/s). */
const LOOK_YAW_MAX = 1.05;
const LOOK_OMEGA = 8;

/** Hasta cuántas veces la distancia de la malla de cerca proyecta sombra un personaje. */
const SHADOW_REACH = 2.2;

/** Desde dónde se mira y a qué distancia (m, corregida por el aumento de la cámara) se pasa a las mallas lejanas. */
export interface DetailView {
  readonly eye: Vector3;
  limit: number;
  /** A quién tapan las paredes (sin ella, se dibuja a todos). */
  occlusion?: Occlusion;
}

/** Los pesos de mezcla que llevan muelle crítico: con un suavizado de primer orden, cada cambio daba un tirón. */
const SPRINGS = [
  'crouch',
  'aim',
  'ready',
  'sprint',
  'kneel',
  'turning',
  'amp',
  'free',
  'daze',
  'stagger',
  'limp',
  'shield',
  'high',
  'low',
  'peek',
  'blind',
  'brace',
  'coverMove',
  'turn',
  'hips',
  'leanX',
  'leanZ',
  'lookYaw',
  'lookPitch',
  'gesture',
  'talk',
  'pace',
  'land',
  'long',
  'hold',
  'support',
] as const;
type SpringName = (typeof SPRINGS)[number];

/** Brazo y mano suavizados (por ángulos), antes de que mande el arma. */
interface ArmState extends ArmAngles {
  fing: number;
}

const armState = (): ArmState => ({ sx: 0, sy: 0, sz: 0, el: 0, hx: 0, hz: 0, fing: 0.35 });

/** Pierna suelta suavizada. */
interface LegState {
  readonly thigh: Quaternion;
  readonly foot: Quaternion;
  shin: number;
}

const legState = (): LegState => ({ thigh: new Quaternion(), foot: new Quaternion(), shin: -0.1 });

let nextSeed = 1;

/**
 * Personaje procedural con animación procedural.
 *
 * Huesos (`rig/skeleton.ts`): raíz (pies, giro) → `spin` (centro de masa: voltereta, caída, giro en cobertura) → cadera →
 * cintura → pecho → cuello → cabeza; del pecho salen clavículas y brazos hasta los dedos, y de la cadera, las piernas
 * hasta la punta del pie. Todo el cuerpo es UNA SkinnedMesh; el arma va aparte porque cambia de modelo.
 *
 * Cada fotograma: pesos con muelles → capas (`rig/layers.ts`) que componen la postura (`rig/frame.ts`) → huesos. Los pies
 * se plantan con cinemática inversa y avanzan sin patinar (`rig/gait.ts`); el arma manda sobre los brazos
 * (`rig/weaponPoses.ts`): se coloca el arma y las manos van a ella.
 *
 * Convención: el personaje mira a −Z. En huesos que cuelgan (brazos, piernas) la rotación X positiva los lleva hacia
 * delante; en los que suben (columna, cabeza) positiva = hacia atrás.
 */
export class CharacterRig {
  readonly root = new Group();
  readonly material: MeshStandardMaterial;
  readonly rim: RimUniforms;
  readonly weaponMount = new Group();
  /** Huesos por nombre. */
  readonly bones = {} as Record<BoneName, Bone>;
  /** Material propio (enemigos, por su rim individual) frente a uno compartido de la caché. */
  private readonly ownsMaterial: boolean;
  private skeleton: Skeleton | null = null;
  private skin: SkinnedMesh | null = null;
  private near: BufferGeometry | null = null;
  private far: BufferGeometry | null = null;
  private weaponMesh: Mesh | null = null;
  private weaponShadow = true;
  /** Color de acento del arma (el del tipo de enemigo; en el jugador, el suyo). */
  private accent = 0x888888;
  private weaponModel: WeaponModel = 'none';
  /** Clave de la geometría compartida del arma. */
  private weaponKey = '';
  /** La granada en la mano izquierda (se crea la primera vez que lanza). */
  private gearMesh: Mesh | null = null;
  private opacity = 1;
  private readonly bulk: number;

  // Reutilizados cada fotograma (sin asignaciones en el bucle).
  private readonly f: Frame = newFrame();
  private readonly gait: Gait = newGait();
  private readonly s = Object.fromEntries(SPRINGS.map((k) => [k, { x: 0, v: 0 }])) as Record<SpringName, Spring>;
  private readonly w: Weights;
  private readonly carry: WeaponPose = weaponPose();
  private readonly armL = armState();
  private readonly armR = armState();
  private readonly legL = legState();
  private readonly legR = legState();
  private readonly legTmp: LegAngles = { thigh: 0, shin: 0 };
  /** Tronco suavizado: pelvis, columna y cabeza (los mismos campos que el fotograma). */
  private readonly body = { hipX: 0, hipY: 0, hipZ: 0, pelvisX: 0, pelvisY: 0, pelvisZ: 0, torsoX: 0, torsoY: 0, torsoZ: 0, headX: 0, headY: 0, headZ: 0 };
  private readonly acro: Acrobatics = { state: 'air', time: 0, vault: -1 };
  private airTime = 0;
  private hipLocal = 0;
  private primed = false;
  private lastYaw = 0;
  private rate = 1;
  /** Velocidad suavizada en el frente del cuerpo: la diferencia con la real es la aceleración. */
  private velF = 0;
  private velR = 0;
  private flinch = 0;
  /** Hacia qué lado se asoma o se mueve en cobertura (+1 a su derecha mirando la pared). */
  private coverDir = 1;
  private blindSide = 1;
  private blindOver = 1;
  private push = 0;
  private gestureKind: RigPose['gesture'] = 'none';

  constructor(key: string, o: RigOptions) {
    const { mat, rim } = rigMaterial(key, o.rimColor, o.rimStrength, !!o.uniqueMaterial);
    this.material = mat;
    this.ownsMaterial = !!o.uniqueMaterial;
    this.rim = rim;
    this.bulk = o.bulk ?? 1;
    const layout = boneLayout(this.bulk);
    for (const n of BONE_NAMES) {
      const bone = new Bone();
      bone.name = n;
      this.bones[n] = bone;
      const { parent, at } = layout[n];
      bone.position.set(at[0], at[1], at[2]);
      (parent ? this.bones[parent] : this.root).add(bone);
    }
    const b = this.bones;
    // Primero gira sobre la vertical y después cabecea y se ladea.
    for (const n of ['spin', 'hips', 'spine', 'chest', 'neck', 'head'] as const) b[n].rotation.order = 'YXZ';
    // El giro vertical del hombro va antes que la elevación y la apertura.
    b.armL.rotation.order = b.armR.rotation.order = 'YXZ';
    // El arma va en el puño derecho, con el cañón siguiendo la línea de la mano.
    this.weaponMount.position.copy(GRIP_POINT);
    this.weaponMount.rotation.x = -HALF_PI;
    b.handR.add(this.weaponMount);
    this.w = {
      time: 0,
      seed: (nextSeed++ * 0.618) % 1,
      crouch: 0,
      aim: 0,
      ready: 0,
      sprint: 0,
      amp: 0,
      turning: 0,
      kneel: 0,
      daze: 0,
      stagger: 0,
      free: 0,
      limp: 0,
      shield: 0,
      high: 0,
      low: 0,
      peek: 0,
      blind: 0,
      coverMove: 0,
      brace: 0,
      turn: 0,
      leanX: 0,
      leanZ: 0,
      armed: false,
      long: 0,
      knife: false,
    };
    this.buildSkin(o);
    this.accent = o.colors.accent;
    this.setWeapon(o.weapon);
  }

  /**
   * La malla con skinning. Los personajes de igual aspecto (todos los matones, los civiles con el mismo atuendo)
   * comparten la geometría: solo se construye la primera vez. El esqueleto sí es de cada uno.
   */
  private buildSkin(o: RigOptions): void {
    this.root.updateMatrixWorld(true);
    const key = appearanceKey(o);
    const geo = bodyGeometry(key, o, 'near');
    this.near = geo;
    this.far = o.lod ? bodyGeometry(key, o, 'far') : geo;
    const mesh = new SkinnedMesh(geo, this.material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.boundingSphere = new Sphere(CULL_CENTER.clone(), CULL_RADIUS);
    this.root.add(mesh);
    this.root.updateMatrixWorld(true);
    this.skeleton = new Skeleton(BONE_NAMES.map((n) => this.bones[n]));
    mesh.bind(this.skeleton);
    this.skin = mesh;
  }

  /** Malla de cerca o de lejos según la distancia a la cámara, con un margen para no ir y venir en la frontera. `scale`: quien es público se conforma antes con la lejana. */
  updateDetail(v: DetailView, scale = 1): void {
    const mesh = this.skin;
    if (!mesh) return;
    const d = this.root.position.distanceTo(v.eye);
    const isFar = mesh.geometry === this.far;
    const limit = v.limit * scale;
    // A lo lejos tampoco hace falta su sombra: ocupa unos pocos píxeles y cuesta otra pasada del cuerpo.
    if (this.far) mesh.castShadow = d < limit * SHADOW_REACH + (mesh.castShadow ? 1 : -1);
    const want = d > limit + (isFar ? -1 : 1) ? this.far : this.near;
    if (!want || mesh.geometry === want) return;
    mesh.geometry = want;
    // De lejos, la sombra del arma no se distingue de la del cuerpo.
    this.weaponShadow = want === this.near;
    if (this.weaponMesh) this.weaponMesh.castShadow = this.weaponShadow;
  }

  /** Cambia el arma visible. La misma arma del mismo color se comparte entre personajes. */
  setWeapon(model: WeaponModel, accent = this.accent): void {
    if (this.weaponMesh) {
      this.weaponMount.remove(this.weaponMesh);
      release(weaponGeometries, this.weaponKey);
      this.weaponMesh = null;
    }
    this.weaponModel = model;
    if (model === 'none') return;
    this.weaponKey = `${model}|${accent}`;
    this.weaponMesh = new Mesh(
      acquire(weaponGeometries, this.weaponKey, () => weaponGeometry(model, accent)),
      weaponMaterial(),
    );
    this.weaponMesh.castShadow = this.weaponShadow;
    this.weaponMount.add(this.weaponMesh);
  }

  /** La granada en la mano izquierda mientras dura el gesto. */
  private showGear(on: boolean): void {
    if (on && !this.gearMesh) {
      const g = acquire(weaponGeometries, GEAR_KEY, () => gearGeometry('stun', GEAR_ACCENT));
      const m = new Mesh(g, weaponMaterial());
      m.castShadow = true;
      m.position.set(0, GRIP_Y - 0.035, GRIP_Z);
      m.rotation.x = HALF_PI;
      this.bones.handL.add(m);
      this.gearMesh = m;
    }
    if (this.gearMesh) this.gearMesh.visible = on;
  }

  /** Visibilidad (la cámara muy cerca transparenta al personaje en vez de meterse dentro). */
  setOpacity(v: number): void {
    const o = clamp(v, 0, 1);
    if (Math.abs(o - this.opacity) < 0.01) return;
    this.opacity = o;
    // Por debajo de 0,5 se oculta del todo (evita ordenar transparencias de personajes).
    this.root.visible = o >= 0.5;
  }

  /** Peso de mezcla 0..1 con muelle crítico. */
  private blend(k: SpringName, target: number, omega: number, dt: number): number {
    return clamp(spring(this.s[k], target, omega, dt), 0, 1);
  }

  /** Anima la postura. `dt` = tiempo de render (incluye la escala del Foco). */
  update(p: RigPose, dt: number): void {
    const f = this.f;
    const w = this.w;
    this.weigh(p, dt);
    resetFrame(f);
    this.walk(p, dt);
    locomotion(f, w, this.gait);
    if (p.state === 'dead') dying(f, p);
    else {
      if (w.free > 0.001) acrobatics(f, this.acro, w.free, p.state === 'roll');
      if (this.s.land.x > 0.0005) landing(f, this.s.land.x);
      kneeling(f, w.kneel);
      dazed(f, w);
      staggering(f, p, w.stagger);
      inCover(f, p, w);
      gesture(f, p, w, this.gestureKind, this.s.gesture.x, this.s.talk.x);
      actions(f, p, w);
      this.flinch = damp(this.flinch, p.flinch, 34, dt);
      if (this.flinch > 0.002) {
        const raw = p.flinch;
        p.flinch = this.flinch;
        flinching(f, p);
        p.flinch = raw;
      }
    }
    // Apuntando arriba o abajo, el tronco acompaña.
    f.torsoX += p.aimPitch * w.aim * 0.2 + p.recoil * 0.03;
    this.showGear(p.throw >= GEAR_IN_HAND[0] && p.throw < GEAR_IN_HAND[1] && p.state !== 'dead');
    this.blendCarry(p);
    f.torsoY += this.carry.blade * f.hold * (1 - w.crouch * 0.3);
    this.applyTrunk(p, dt);
    this.applyLeg(-1, f.legL, f.freeL, this.legL, dt);
    this.applyLeg(1, f.legR, f.freeR, this.legR, dt);
    this.applyArms(p, dt);
    this.primed = true;
  }

  // ======================================================== pesos
  private weigh(p: RigPose, dt: number): void {
    const w = this.w;
    const s = this.s;
    const st = p.state;
    const dead = st === 'dead';
    w.time += dt;
    const cls = weaponClass(this.weaponModel);
    w.armed = cls !== 'none';
    w.long = this.blend('long', cls === 'long' ? 1 : 0, 14, dt);
    w.knife = cls === 'knife';
    const onFeet = st === 'ground' || st === 'toCover' || st === 'cover' || st === 'locked' || st === 'fly';
    w.crouch = this.blend('crouch', p.posture === 'crouch' && onFeet ? 1 : 0, 13, dt);
    w.aim = this.blend('aim', w.knife || dead ? 0 : p.aim, 19, dt);
    w.ready = this.blend('ready', dead ? 0 : Math.max(p.ready, p.aim), 7, dt);
    w.sprint = this.blend('sprint', onFeet && p.grounded && p.speed > SPRINT_SPEED ? 1 : 0, 10, dt);
    w.kneel = this.blend('kneel', dead ? 0 : p.kneel, 10, dt);
    w.free = this.blend('free', dead || st === 'air' || st === 'roll' || st === 'slide' || st === 'vault' ? 1 : 0, st === 'roll' || dead ? 40 : 18, dt);
    if (st === 'air' || st === 'roll' || st === 'slide' || st === 'vault') {
      this.acro.state = st;
      this.acro.time = p.stateTime;
      this.acro.vault = p.vault;
    }
    // Al tocar suelo tras caer, un empujón hacia abajo que se amortigua: más cuanto más rato en el aire.
    if (st === 'air') this.airTime += dt;
    else {
      if (this.airTime > 0.2 && onFeet) this.s.land.v += LAND_KICK * clamp(this.airTime / 0.7, 0.3, 1);
      this.airTime = 0;
    }
    spring(this.s.land, 0, 12, dt);
    w.daze = this.blend('daze', dead ? 0 : p.daze, p.daze > 0.5 ? 18 : 7, dt);
    w.stagger = this.blend('stagger', dead ? 0 : clamp(p.stagger * 1.5, 0, 1), p.stagger > 0.6 ? 26 : 9, dt);
    w.limp = spring(s.limp, dead ? 0 : p.limp, 12, dt);
    w.shield = this.blend('shield', dead ? 0 : p.shield, 11, dt);
    w.high = this.blend('high', p.cover === 'high' ? 1 : 0, 10, dt);
    w.low = this.blend('low', p.cover === 'low' ? 1 : 0, 10, dt);
    w.peek = spring(s.peek, p.peek, 12, dt);
    if (p.blind !== 0) {
      this.blindOver = p.blind === 1 ? 1 : 0;
      if (p.blind === 2 && p.coverSide !== 0) this.blindSide = p.coverSide;
    }
    w.blind = this.blend('blind', p.blind !== 0 && w.armed && !w.knife ? 1 : 0, 18, dt);
    w.brace = this.blend('brace', st === 'cover' ? p.brace * (1 - smooth(0.16, 0.5, p.stateTime)) : 0, 24, dt);
    // Gesto: al cambiar, el anterior se apaga antes de que entre el nuevo.
    const other = p.gesture !== this.gestureKind;
    if (other && this.s.gesture.x < 0.05) this.gestureKind = p.gesture;
    this.blend('gesture', !dead && !other && p.gesture !== 'none' ? 1 : 0, 8, dt);
    this.blend('talk', p.talk, 5, dt);
    this.turnInCover(p, dt);
  }

  /**
   * Giro del cuerpo a cubierto: de espaldas a la pared, hacia el lado por el que asomaría (así, al asomarse, gira por
   * fuera de la esquina); recorriendo la baja, de perfil en la marcha; a ciegas por el borde, con el hombro en la pared.
   */
  private turnInCover(p: RigPose, dt: number): void {
    const w = this.w;
    const s = this.s.turn;
    const on = p.coverBack && p.cover !== 'none' && p.state !== 'dead';
    const right = -Math.sin(p.moveAngle) * p.speed;
    w.coverMove = spring(this.s.coverMove, on && p.aim < 0.5 ? clamp(right / 1.1, -1, 1) : 0, 11, dt);
    let dir = this.coverDir;
    if (on) {
      if (p.coverSide !== 0) dir = p.coverSide > 0 ? 1 : -1;
      else if (Math.abs(right) > 0.5) dir = right > 0 ? 1 : -1;
    }
    if (dir !== this.coverDir) {
      // De espaldas por un lado o por el otro es la misma postura: se cambia de cuenta sin girar.
      if (Math.abs(s.x) > HALF_PI) s.x -= Math.sign(s.x) * Math.PI * 2;
      this.coverDir = dir;
    }
    let target = 0;
    if (on && p.aim < 0.5 && Math.abs(p.peek) < 0.2) {
      const go = Math.min(1, Math.abs(w.coverMove));
      if (p.blind === 2) target = -this.blindSide * HALF_PI * 1.05;
      else if (p.blind === 1) target = 0;
      else if (p.cover === 'low') target = -dir * lerp(Math.PI, HALF_PI, go);
      else target = -dir * (Math.PI - 0.5 * go);
    }
    w.turn = spring(s, target, p.aim > 0.5 ? 15 : 10, dt);
  }

  // ======================================================== marcha
  private walk(p: RigPose, dt: number): void {
    const w = this.w;
    const g = this.gait;
    const st = p.state;
    const onFeet = st === 'ground' || st === 'toCover' || st === 'cover' || st === 'locked' || st === 'fly';
    const moving = p.grounded && p.speed > 0.2 && onFeet;
    // Giro en el sitio: cuánto rota la raíz por segundo.
    let dYaw = this.root.rotation.y - this.lastYaw;
    this.lastYaw = this.root.rotation.y;
    dYaw -= Math.round(dYaw / (Math.PI * 2)) * Math.PI * 2;
    const turnRate = dt > 1e-5 ? Math.abs(dYaw) / dt : 0;
    w.turning = this.blend('turning', !moving && onFeet && p.grounded && st !== 'locked' ? clamp((turnRate - 0.9) / 2.2, 0, 1) : 0, 12, dt);
    // La zancada crece al arrancar y, al parar, el paso en curso se termina mientras se apaga.
    w.amp = this.blend('amp', moving ? clamp(p.speed / 1.1, 0.4, 1) : 0, moving ? 12 : 9, dt);
    // La zancada se adapta a la velocidad poco a poco; el ritmo de los pasos, al momento, para no patinar.
    strideAt(spring(this.s.pace, moving ? p.speed : 0, 14, dt), w.crouch, g.stride, Math.abs(g.right), Math.max(0, -g.fwd));
    const a = p.moveAngle - w.turn;
    if (moving) {
      this.rate = cycleRate(p.speed, g.stride);
      g.fwd = damp(g.fwd, Math.cos(a), 11, dt);
      g.right = damp(g.right, -Math.sin(a), 11, dt);
    } else this.rate = damp(this.rate, Math.max(0.6, this.rate * 0.8), 6, dt);
    g.u += (this.rate * clamp(w.amp / 0.4, 0, 1) + 1.1 * w.turning) * dt;
    g.u -= Math.floor(g.u);
    // La cadera se gira hacia donde se va (o, hacia atrás, hacia de donde se viene) y el tronco sigue al frente.
    const side = g.fwd > -0.2 ? -Math.atan2(g.right, Math.max(0.12, g.fwd)) : Math.atan2(g.right, Math.max(0.12, -g.fwd));
    g.hips = spring(this.s.hips, clamp(side, -1.15, 1.15) * 0.62 * w.amp, 9, dt);
    // Se inclina hacia donde acelera y hacia dentro de las curvas.
    const vf = moving ? p.speed * Math.cos(a) : 0;
    const vr = moving ? -p.speed * Math.sin(a) : 0;
    this.velF = damp(this.velF, vf, 7, dt);
    this.velR = damp(this.velR, vr, 7, dt);
    const ground = onFeet ? 1 : 0;
    w.leanX = spring(this.s.leanX, clamp((this.velF - vf) * 0.055, -0.2, 0.2) * ground, 12, dt);
    w.leanZ = spring(this.s.leanZ, clamp((this.velR - vr) * 0.045, -0.16, 0.16) * ground, 12, dt);
  }

  // ======================================================== arma
  /** Mezcla las posturas del arma según lo que hace. */
  private blendCarry(p: RigPose): void {
    const w = this.w;
    const c = this.carry;
    const cls = weaponClass(this.weaponModel);
    copyPose(c, carryPose(cls, 'relaxed'));
    mixPose(c, carryPose(cls, 'ready'), w.ready);
    mixPose(c, carryPose(cls, 'sprint'), w.sprint * (1 - w.aim));
    mixPose(c, carryPose(cls, 'tuckHigh'), w.high * (1 - w.aim) * (1 - w.blind));
    mixPose(c, carryPose(cls, 'tuckLow'), w.low * (1 - w.aim) * (1 - w.blind));
    mixPose(c, carryPose(cls, 'aim'), w.aim);
    if (p.reload >= 0) mixPose(c, carryPose(cls, 'reload'), smooth(0.02, 0.2, p.reload) * (1 - smooth(0.82, 0.98, p.reload)));
    if (w.shield > 0 && cls === 'pistol') c.x += 0.17 * w.shield;
    if (p.takedown >= 0) {
      mixPose(c, carryPose(cls, 'ribs'), ribsAt(p.takedown));
      mixPose(c, carryPose(cls, 'execute'), executeAt(p.takedown));
    }
    if (p.swap > 0) mixPose(c, carryPose(cls, 'swap'), p.swap);
    if (p.throw >= 0) mixPose(c, carryPose(cls, 'ready'), bell(p.throw) * 0.6);
  }

  // ======================================================== tronco
  private applyTrunk(p: RigPose, dt: number): void {
    const f = this.f;
    const w = this.w;
    const b = this.bones;
    const m = this.body;
    const dead = p.state === 'dead';
    const k = this.primed ? (f.exact ? (dead ? lerp(10, 34, smooth(0, 0.28, p.stateTime)) : 40) : BODY_K) : 1e4;
    for (const key of ['hipX', 'hipY', 'hipZ', 'pelvisX', 'pelvisY', 'pelvisZ', 'torsoX', 'torsoY', 'torsoZ', 'headX', 'headZ'] as const)
      m[key] = damp(m[key], f[key], k, dt);

    // Cuerpo entero: la voltereta y la caída siguen el tiempo exacto del estado (no se suavizan).
    const spin = b.spin;
    this.push = damp(this.push, f.push, 14, dt);
    // Arrimarse a la pared es hacia el frente de la raíz, sea cual sea el giro del cuerpo.
    spin.position.z = -this.push;
    spin.rotation.y = w.turn;
    if (f.exact) {
      spin.rotation.x = f.spinX;
      spin.rotation.z = f.spinZ;
      spin.position.y = f.spinY;
    } else {
      // Tras una voltereta completa el giro equivale a 0: no se "desenrolla".
      if (spin.rotation.x < -Math.PI) spin.rotation.x += Math.PI * 2;
      spin.rotation.x = damp(spin.rotation.x, 0, 16, dt);
      spin.rotation.z = damp(spin.rotation.z, 0, 16, dt);
      spin.position.y = damp(spin.position.y, f.spinY, 16, dt);
    }
    // Con las piernas sueltas, la cadera pasa de un estado a otro (deslizarse y caer por un borde) sin saltar.
    this.hipLocal = f.free < 0.02 ? f.hipLocal : damp(this.hipLocal, f.hipLocal, f.exact ? 40 : 18, dt);
    b.hips.position.set(m.hipX, lerp(m.hipY - SPIN_Y, this.hipLocal, f.free), m.hipZ);
    b.hips.rotation.set(m.pelvisX, m.pelvisY, m.pelvisZ);
    // La columna reparte entre la cintura y el pecho lo que el tronco se separa de la pelvis.
    const dx = m.torsoX - m.pelvisX;
    const dy = m.torsoY - m.pelvisY;
    const dz = m.torsoZ - m.pelvisZ;
    b.spine.rotation.set(dx * 0.48, dy * 0.42, dz * 0.5);
    b.chest.rotation.set(dx * 0.52, dy * 0.58, dz * 0.5);
    for (const s of [-1, 1] as const) {
      const clav = s < 0 ? b.clavL : b.clavR;
      const up = s < 0 ? f.clavL : f.clavR;
      clav.rotation.z = damp(clav.rotation.z, s * up, 14, dt);
      clav.rotation.y = damp(clav.rotation.y, s * f.clavFwd, 14, dt);
    }
    this.applyHead(p, dt);
  }

  /**
   * La cabeza se mantiene nivelada y mira a lo que mira (el enemigo que vigila, el NPC que te sigue, el jugador hacia la
   * cámara), repartido entre el cuello y la cabeza. Se apaga en volteretas, caídas y de rodillas.
   */
  private applyHead(p: RigPose, dt: number): void {
    const f = this.f;
    const w = this.w;
    const m = this.body;
    const lookOn = f.headLevel > 0 && w.kneel < 0.5 && p.state !== 'dead' ? p.look : 0;
    const rel = p.lookYaw - w.turn;
    const yaw = Math.atan2(Math.sin(rel), Math.cos(rel));
    let lookYaw = clamp(yaw, -LOOK_YAW_MAX, LOOK_YAW_MAX) * lookWeight(yaw) * lookOn * (1 - 0.5 * w.sprint);
    // De espaldas a la pared vigila el lado por el que se asomaría o hacia el que va.
    const back = smooth(1.6, 2.7, Math.abs(w.turn)) * Math.max(w.high, w.low);
    if (back > 0.001) {
      const toward = this.coverDir * (p.coverSide !== 0 ? 0.95 : 0.35 + 0.5 * Math.min(1, Math.abs(w.coverMove)));
      lookYaw = lerp(lookYaw, toward, back);
    }
    const lookY = spring(this.s.lookYaw, lookYaw, LOOK_OMEGA, dt);
    const pitch = spring(this.s.lookPitch, clamp(p.lookPitch, -0.6, 0.45) * lookOn * (1 - w.aim), LOOK_OMEGA, dt);
    // Con un arma larga encarada, la mejilla baja a la culata.
    const cheek = w.long * w.aim;
    const hx = clamp(m.headX + p.aimPitch * 0.55 * f.headLevel * (1 - back) + pitch - m.torsoX * f.headLevel - 0.08 * cheek, -1, 1);
    const hy = clamp(-m.torsoY * f.headLevel + lookY, -1.3, 1.3);
    const hz = m.headZ - m.torsoZ * 0.6 * f.headLevel - 0.14 * cheek;
    m.headY = damp(m.headY, hy, this.primed ? 30 : 1e4, dt);
    this.bones.neck.rotation.set(hx * 0.4, m.headY * 0.42, hz * 0.4);
    this.bones.head.rotation.set(hx * 0.6, m.headY * 0.58, hz * 0.6);
  }

  // ======================================================== piernas
  private applyLeg(s: -1 | 1, goal: LegGoal, free: LegFree, state: LegState, dt: number): void {
    const f = this.f;
    const b = this.bones;
    const thigh = s < 0 ? b.thighL : b.thighR;
    const shin = s < 0 ? b.shinL : b.shinR;
    const foot = s < 0 ? b.footL : b.footR;
    const toe = s < 0 ? b.toeL : b.toeR;
    const spinY = b.spin.position.y;
    _qHips.copy(b.hips.quaternion);

    // Pie apoyado: el tobillo va a donde le toca (con el talón levantado gira sobre la bola) y la rodilla, hacia la punta.
    ankleRoll(goal.pitch, _ankle);
    const cy = Math.cos(goal.yaw);
    const sy = Math.sin(goal.yaw);
    const ahead = _ankle.ahead;
    _t.set(goal.x - sy * ahead, goal.y + _ankle.up - spinY, -goal.f - cy * ahead);
    _v.set(s * HIP_X * this.bulk, 0, 0)
      .applyQuaternion(_qHips)
      .add(b.hips.position);
    _t.sub(_v);
    _q2.copy(_qHips).invert();
    _t.applyQuaternion(_q2);
    const kneeYaw = goal.yaw * 0.7 + goal.knee;
    _pole.set(-Math.sin(kneeYaw), 0.02, -Math.cos(kneeYaw)).applyQuaternion(_q2);
    const bend = -solveLimb(
      _t,
      _pole,
      THIGH,
      SHIN,
      true,
      thigh.quaternion,
      lerp(0.008, lerp(0.014, 0.045, this.gait.stride.run), Math.max(this.w.amp, this.w.turning)),
    );
    shin.rotation.set(bend, 0, 0);
    // El pie, plano en el suelo con su giro y su cabeceo, por mucho que se mueva la pelvis.
    _q.copy(_qHips).multiply(thigh.quaternion).multiply(shin.quaternion).invert();
    foot.quaternion.setFromEuler(_e.set(goal.pitch, goal.yaw, 0, 'YXZ')).premultiply(_q);
    // En el aire cuelga de la espinilla, con la punta algo caída.
    if (goal.air > 0.001) foot.quaternion.slerp(_q.setFromEuler(_e.set(-0.32, 0, 0, 'XYZ')), goal.air);
    toe.rotation.x = goal.toe;

    const k = f.free;
    if (k <= 0.001) {
      state.thigh.copy(thigh.quaternion);
      state.foot.copy(foot.quaternion);
      state.shin = bend;
      return;
    }
    // Pierna suelta: el pie respecto a su cadera.
    const a = solveLeg(free.f, free.down, this.legTmp);
    let tx = a.thigh;
    let sh = a.shin;
    if (s > 0 && f.kneelR > 0) {
      tx = lerp(tx, -0.05, f.kneelR);
      sh = lerp(sh, -1.62, f.kneelR);
    }
    if (f.fold > 0) {
      tx = lerp(tx, s < 0 ? 0.06 : -0.06, f.fold);
      sh = lerp(sh, s < 0 ? -1.6 : -1.5, f.fold);
    }
    const tz = clamp(Math.atan2(free.side, free.down), -0.5, 0.5);
    const rate = !f.exact ? LEG_K : this.w.kneel > 0.5 ? LEG_K : 34;
    const kk = 1 - Math.exp(-rate * dt);
    state.thigh.slerp(_q.setFromEuler(_e.set(tx, 0, tz, 'XYZ')), kk);
    state.shin = damp(state.shin, sh, rate, dt);
    const ankle =
      free.loose || f.fold > 0 || (s > 0 && f.kneelR > 0.5) ? (s > 0 && f.kneelR > 0.5 ? -0.5 : -0.35) : clamp(free.pitch - (tx + state.shin), -1.1, 0.9);
    state.foot.slerp(_q.setFromEuler(_e.set(ankle, 0, 0, 'XYZ')), kk);
    thigh.quaternion.slerp(state.thigh, k);
    shin.rotation.x = lerp(bend, state.shin, k);
    foot.quaternion.slerp(state.foot, k);
    toe.rotation.x = lerp(goal.toe, s > 0 && f.kneelR > 0.5 ? 0.7 : 0, k);
  }

  // ======================================================== brazos
  private applyArms(p: RigPose, dt: number): void {
    const f = this.f;
    const w = this.w;
    const b = this.bones;
    const quick = (p.slash >= 0 && w.armed) || p.throw >= 0 || p.takedown >= 0;
    const k = this.primed ? (f.exact ? (p.state === 'dead' ? lerp(10, 34, smooth(0, 0.28, p.stateTime)) : 40) : quick ? QUICK_K : ARM_K) : 1e4;
    this.angleArm(-1, f.armL, f.fingL, this.armL, f.exact ? 0 : this.body.torsoX, k, dt);
    this.angleArm(1, f.armR, f.fingR, this.armR, f.exact ? 0 : this.body.torsoX, k, dt);
    const reaching = f.handL.w > 0.001 || f.handR.w > 0.001 || p.grab > 0.001;
    if (!reaching && !w.armed && this.s.hold.x < 0.01 && this.s.support.x < 0.01) return;
    // A partir de aquí, posiciones en el mundo: el tronco ya está colocado.
    b.chest.updateWorldMatrix(true, true);
    b.chest.localToWorld(_shoulders.set(0, SHOULDER_Y, 0));
    this.root.getWorldQuaternion(_qBody);
    // El frente del cuerpo: el de la raíz con el giro de la cobertura y, sin apuntar, parte del giro del pecho.
    const twist = w.turn + (this.body.torsoY - this.carry.blade * f.hold) * 0.75 * (1 - w.aim);
    _qBody.multiply(_q.setFromAxisAngle(_up, twist));
    this.reachHand(-1, f.handL);
    this.reachHand(1, f.handR);
    // Al soltar el arma (cae, rueda, cambia al cuchillo) los brazos dejan de seguirla poco a poco.
    const armed = w.armed && !w.knife && p.state !== 'dead';
    const hold = this.blend('hold', armed && p.state !== 'roll' ? clamp(this.carry.hold * f.hold, 0, 1) : 0, 22, dt);
    if (hold > 0.01) this.holdWeapon(p, hold);
    else this.weaponMount.quaternion.setFromEuler(_e.set(-HALF_PI, 0, 0, 'XYZ'));
    if (w.blind > 0.01 && armed && p.reload < 0) this.blindFire(p, w.blind * (1 - p.swap));
    const support = this.blend('support', armed ? clamp(this.carry.support * f.grip * Math.max(hold, w.blind), 0, 1) : 0, 24, dt);
    if (support > 0.01) this.supportWeapon(p, support);
    if (p.grab > 0.001) this.grabVictim(p);
  }

  /** Un brazo por ángulos, suavizado. La elevación es respecto a la vertical: se le quita la inclinación del pecho. */
  private angleArm(s: -1 | 1, to: ArmAngles, fing: number, a: ArmState, lean: number, k: number, dt: number): void {
    const b = this.bones;
    a.sx = damp(a.sx, to.sx - lean, k, dt);
    a.sy = damp(a.sy, to.sy, k, dt);
    a.sz = damp(a.sz, to.sz, k, dt);
    a.el = damp(a.el, to.el, k, dt);
    a.hx = damp(a.hx, to.hx, k, dt);
    a.hz = damp(a.hz, to.hz, k, dt);
    a.fing = damp(a.fing, fing, 14, dt);
    (s < 0 ? b.armL : b.armR).rotation.set(a.sx, a.sy, a.sz);
    (s < 0 ? b.foreL : b.foreR).rotation.set(a.el, 0, 0);
    (s < 0 ? b.handL : b.handR).rotation.set(a.hx, 0, a.hz);
    // La mano está modelada a medio cerrar: abrir y cerrar es girar los dedos por los nudillos.
    (s < 0 ? b.fingL : b.fingR).rotation.z = -s * (a.fing - 0.45) * 1.25;
  }

  /** Lleva la muñeca a un punto del mundo con el codo hacia `pole` (mundo). */
  private armTo(s: -1 | 1, wrist: Vector3, pole: Vector3, k: number): void {
    const b = this.bones;
    const clav = s < 0 ? b.clavL : b.clavR;
    const armB = s < 0 ? b.armL : b.armR;
    const fore = s < 0 ? b.foreL : b.foreR;
    _t.copy(wrist);
    clav.worldToLocal(_t).sub(armB.position);
    clav.getWorldQuaternion(_q2).invert();
    _pole.copy(pole).applyQuaternion(_q2);
    const el = solveLimb(_t, _pole, UPPER_ARM, FOREARM, false, _q);
    armB.quaternion.slerp(_q, k);
    fore.rotation.x = lerp(fore.rotation.x, el, k);
    armB.updateWorldMatrix(false, true);
  }

  /** Orienta la mano (mundo) sin pasar de lo que dobla una muñeca. */
  private handTo(s: -1 | 1, q: Quaternion, k: number): void {
    const b = this.bones;
    const fore = s < 0 ? b.foreL : b.foreR;
    const hand = s < 0 ? b.handL : b.handR;
    fore.getWorldQuaternion(_q2).invert().multiply(q);
    _q.identity().rotateTowards(_q2, WRIST);
    hand.quaternion.slerp(_q, k);
    hand.updateWorldMatrix(false, true);
  }

  /** Codo: entre pegado al cuerpo y abierto hacia fuera. */
  private pole(s: -1 | 1, open: number, out: Vector3): Vector3 {
    const a = open * 1.35;
    return out.set(s * Math.sin(a), -Math.cos(a), 0.3).applyQuaternion(_qBody);
  }

  /** Mano de un gesto: a un punto respecto a los hombros. */
  private reachHand(s: -1 | 1, h: HandGoal): void {
    if (h.w <= 0.001) return;
    const gk = h.w;
    _hand.set(h.x, h.y, h.z).applyQuaternion(_qBody).add(_shoulders);
    this.armTo(s, _hand, this.pole(s, h.elbow, _v), gk);
    const hand = s < 0 ? this.bones.handL : this.bones.handR;
    hand.quaternion.slerp(_q.setFromEuler(_e.set(0.1, s * h.palm, 0, 'YXZ')), gk);
    hand.updateWorldMatrix(false, true);
  }

  /** Coloca el arma y lleva a ella la mano derecha. */
  private holdWeapon(p: RigPose, hold: number): void {
    const w = this.w;
    const c = this.carry;
    const ak = w.aim;
    const recoil = p.recoil;
    const pitch = c.pitch + p.aimPitch * ak + recoil * lerp(0.17, 0.05, w.long);
    // Posición respecto a los hombros; apuntando, sube y baja con la mirada.
    _v.set(c.x * lerp(1, this.bulk, 0.5), c.y, c.z + recoil * 0.035);
    // Corriendo, el arma acompaña a los hombros y al rebote de cada paso.
    const g = this.gait;
    const step = w.amp * (1 - ak) * lerp(0.35, 1, g.stride.run);
    _v.x += 0.02 * g.sway.swing * step;
    _v.y -= 0.55 * g.sway.bounce * step;
    if (ak > 0) _v.applyQuaternion(_q.setFromAxisAngle(_t.set(1, 0, 0), p.aimPitch * ak));
    _hand.copy(_v).applyQuaternion(_qBody).add(_shoulders);
    _qGun.copy(_qBody).multiply(_q.setFromEuler(_e.set(pitch, (c.yaw + 0.09 * g.sway.swing * step) * (1 - ak), c.roll + 0.06 * g.sway.swing * step, 'YXZ')));
    const stock = STOCK[this.weaponModel];
    const shoulder = ak * (1 - p.swap);
    if (stock > 0 && shoulder > 0.001) {
      // Encare: la cantonera va al hueco del hombro derecho y el cañón sigue la línea de mira.
      this.root.getWorldQuaternion(_q2);
      _aim.set(0, Math.sin(pitch), -Math.cos(pitch)).applyQuaternion(_q2);
      this.bones.chest.localToWorld(_v.set(0.145 * this.bulk, SHOULDER_Y + 0.012, -0.075)).addScaledVector(_aim, stock - recoil * 0.03);
      _hand.lerp(_v, shoulder);
      _qGun.slerp(_q.setFromRotationMatrix(_look.lookAt(_zero, _aim, _up)), shoulder);
    }
    this.gripRight(hold, this.pole(1, c.elbowR, _aim));
  }

  /** La mano derecha al arma en `_hand` con la orientación `_qGun`. */
  private gripRight(k: number, pole: Vector3): void {
    _qHand.copy(_qGun).multiply(HAND_ON_GRIP);
    _v.copy(GRIP_POINT).applyQuaternion(_qHand);
    _hand.sub(_v);
    this.armTo(1, _hand, pole, k);
    this.handTo(1, _qHand, k);
    this.bones.fingR.rotation.z = lerp(this.bones.fingR.rotation.z, -0.85, k);
    // El arma mira por donde se apunta aunque la muñeca no dé más de sí.
    this.bones.handR.getWorldQuaternion(_q2).invert().multiply(_qGun);
    _q.setFromEuler(_e.set(-HALF_PI, 0, 0, 'XYZ'));
    this.weaponMount.quaternion.copy(_q).slerp(_q2, k);
    this.weaponMount.updateWorldMatrix(false, true);
  }

  /** A ciegas: el arma asoma por encima de la cobertura o tras su borde y mira hacia donde se apunta. */
  private blindFire(p: RigPose, k: number): void {
    const pitch = clamp(p.aimPitch, -0.6, 0.5) + p.recoil * 0.08;
    const yaw = clamp(p.lookYaw, -1.1, 1.1);
    const over = this.blindOver;
    const side = this.blindSide;
    this.root.getWorldQuaternion(_q2);
    _aim.set(-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)).applyQuaternion(_q2);
    // En el frente de la raíz: por encima del borde de la cobertura, justo pasada su cara, o tras la esquina.
    const top = clamp(p.coverTop, 0.8, 1.6);
    _hand.set(lerp(side > 0 ? 0.6 : -0.6, 0.15, over), lerp(1.26, top + 0.1, over), lerp(-0.3, -0.52, over));
    this.root.localToWorld(_hand);
    _qGun.setFromRotationMatrix(_look.lookAt(_zero, _aim, _up));
    _v.set(over ? 0.5 : side * 0.4, over ? 0.1 : -0.9, 0.5).applyQuaternion(_q2);
    this.gripRight(k, _v);
  }

  /** La mano izquierda al arma; al recargar, baja al cargador, al cinturón y vuelve. */
  private supportWeapon(p: RigPose, k0: number): void {
    const at = GRIP[this.weaponModel];
    if (!at) return;
    const long = weaponClass(this.weaponModel) === 'long';
    let k = k0;
    this.weaponMount.localToWorld(_hand.set(at[0], at[1], at[2]));
    this.weaponMount.getWorldQuaternion(_qHand).multiply(long ? HAND_ON_GUARD : HAND_ON_PISTOL);
    let fist = 1;
    if (p.reload >= 0) {
      const r = p.reload;
      const mag = smooth(0.05, 0.18, r) * (1 - smooth(0.86, 0.98, r));
      const belt = smooth(0.22, 0.42, r) * (1 - smooth(0.52, 0.72, r));
      this.weaponMount.localToWorld(_v.set(0, long ? -0.12 : -0.1, long ? -0.1 : 0.0));
      _hand.lerp(_v, mag);
      _t.set(-0.17, -0.5, -0.12).applyQuaternion(_qBody).add(_shoulders);
      _hand.lerp(_t, belt);
      fist = 1 - 0.5 * belt;
    }
    if (p.swap > 0) k *= 1 - p.swap;
    _v.copy(GRIP_POINT).applyQuaternion(_qHand);
    _hand.sub(_v);
    this.armTo(-1, _hand, this.pole(-1, this.carry.elbowL, _aim), k);
    this.handTo(-1, _qHand, k);
    this.bones.fingL.rotation.z = lerp(this.bones.fingL.rotation.z, (long ? 0.95 : 0.55) * fist, k);
  }

  /** Remate: la mano izquierda, cerrada sobre la ropa de la víctima. */
  private grabVictim(p: RigPose): void {
    _hand.set(p.grabX, p.grabY, p.grabZ);
    this.armTo(-1, _hand, this.pole(-1, 0.75, _v), p.grab);
    this.bones.fingL.rotation.z = lerp(this.bones.fingL.rotation.z, 0.7, p.grab);
  }

  // ======================================================== medidas
  /**
   * Cómo apunta el arma respecto al frente del personaje (grados): desvío del cañón en horizontal, inclinación
   * del cañón y ladeo (giro sobre el propio cañón). La usan las pruebas del encare.
   */
  weaponAim(): { yaw: number; pitch: number; roll: number } {
    this.root.updateWorldMatrix(true, true);
    this.weaponMount.getWorldQuaternion(_q);
    const barrel = _aim.set(0, 0, -1).applyQuaternion(_q);
    const up = _v.set(0, 1, 0).applyQuaternion(_q);
    const deg = 180 / Math.PI;
    // Frente del personaje: −Z de la raíz.
    const heading = Math.atan2(-barrel.x, -barrel.z) - this.root.rotation.y;
    const yaw = Math.atan2(Math.sin(heading), Math.cos(heading)) * deg;
    const pitch = Math.asin(clamp(barrel.y, -1, 1)) * deg;
    // Ladeo: lo que el "arriba" del arma se sale del plano vertical que contiene al cañón.
    const right = _hand.crossVectors(barrel, _up).normalize();
    const roll = Math.asin(clamp(up.dot(right), -1, 1)) * deg;
    return { yaw, pitch, roll };
  }

  /** Hacia dónde mira la cara respecto al frente del personaje (rad, + izquierda y + arriba). La usan las pruebas. */
  gaze(): { yaw: number; pitch: number } {
    this.root.updateWorldMatrix(true, true);
    this.bones.head.getWorldQuaternion(_q);
    _v.set(0, 0, -1).applyQuaternion(_q);
    const rel = Math.atan2(-_v.x, -_v.z) - this.root.rotation.y;
    return { yaw: Math.atan2(Math.sin(rel), Math.cos(rel)), pitch: Math.asin(clamp(_v.y, -1, 1)) };
  }

  /** Inclinación de un hueso que cuelga, hacia delante (rad). */
  private swing(bone: Bone): number {
    _v.set(0, -1, 0).applyQuaternion(bone.quaternion);
    return Math.atan2(-_v.z, -_v.y);
  }

  /**
   * Muestra del movimiento: ángulos de las articulaciones (rad) y posición de manos, cabeza y pies respecto a los pies (m,
   * en el espacio del personaje). La usan las pruebas de fluidez para buscar tirones entre fotogramas.
   */
  motionSample(): Record<string, number> {
    this.root.updateWorldMatrix(true, true);
    const b = this.bones;
    const at = (bone: Bone, x: number, y: number, z: number): Vector3 => this.root.worldToLocal(bone.localToWorld(_v.set(x, y, z)));
    const out: Record<string, number> = {
      yaw: this.root.rotation.y,
      hipsY: b.hips.position.y,
      hipsYaw: this.body.pelvisY,
      torsoX: this.body.torsoX,
      torsoY: this.body.torsoY,
      torsoZ: this.body.torsoZ,
      headX: b.neck.rotation.x + b.head.rotation.x,
      headY: b.neck.rotation.y + b.head.rotation.y,
      thighL: this.swing(b.thighL),
      thighR: this.swing(b.thighR),
      shinL: b.shinL.rotation.x,
      shinR: b.shinR.rotation.x,
    };
    const put = (name: string, v: Vector3): void => {
      out[`${name}x`] = v.x;
      out[`${name}y`] = v.y;
      out[`${name}z`] = v.z;
    };
    put('handR', at(b.handR, 0, GRIP_Y, GRIP_Z));
    put('handL', at(b.handL, 0, GRIP_Y, GRIP_Z));
    put('nose', at(b.head, 0, 0.12, -0.1));
    return out;
  }

  /** Dónde quedan las bolas de los pies en el mundo (alturas sobre el suelo del personaje): apoyadas no deben moverse. */
  footSample(): { left: Vector3; right: Vector3 } {
    this.root.updateWorldMatrix(true, true);
    const at = (bone: Bone): Vector3 => {
      const v = bone.getWorldPosition(new Vector3());
      v.y -= this.root.position.y;
      return v;
    };
    return { left: at(this.bones.toeL), right: at(this.bones.toeR) };
  }

  /**
   * Altura de la silueta sobre los pies con la pose actual: la malla deformada por el esqueleto.
   * Es cara (recorre todos los vértices); la usan las pruebas para comprobar que el cuerpo cabe en su cápsula.
   */
  silhouetteHeight(): number {
    const mesh = this.skin;
    if (!mesh) return 0;
    // Con `updateMatrixWorld` la malla actualiza también la inversa de su vínculo: sin ella, medía de más fuera de y = 0.
    this.root.updateMatrixWorld(true);
    mesh.skeleton.update();
    mesh.computeBoundingBox();
    if (!mesh.boundingBox) return 0;
    _bounds.copy(mesh.boundingBox).applyMatrix4(mesh.matrixWorld);
    return _bounds.max.y - this.root.getWorldPosition(_v).y;
  }

  dispose(): void {
    // La malla del cuerpo es compartida y se queda (`bodyGeometries`).
    this.skin = null;
    if (this.gearMesh) {
      release(weaponGeometries, GEAR_KEY);
      this.gearMesh = null;
    }
    this.setWeapon('none');
    this.skeleton?.dispose();
    // Un material compartido sigue en la caché para los demás personajes y el próximo nivel: solo se libera el propio.
    if (this.ownsMaterial) this.material.dispose();
    this.root.removeFromParent();
  }
}

/** Paleta del Huésped (jugador): traje negro, camisa y corbata negras, media melena y barba oscuras. */
export const PLAYER_COLORS: RigColors = {
  jacket: 0x22252d,
  shirt: 0x0c0d10,
  tie: 0x060608,
  pants: 0x1e2128,
  shoes: 0x09090b,
  skin: 0xcca48b,
  hair: 0x1f1712,
  accent: 0xc9a227,
};

/** Aspecto del Huésped: traje negro de tres piezas sin pañuelo, media melena con raya al medio y barba corta. */
export const PLAYER_LOOK: RigOptions = {
  colors: PLAYER_COLORS,
  rimColor: 0xe8e2d0,
  rimStrength: 0.16,
  hair: 'parted',
  beard: true,
  face: 'calm',
  features: { jaw: 1.02, chin: 1.1, nose: 1.02, cheeks: 1.15, lips: 0.9, brow: 1.1, eyes: 0.94, iris: 0x4a3524 },
  weapon: 'pistol',
  outfit: { waistcoat: 0x17181d, pocketSquare: false },
};
