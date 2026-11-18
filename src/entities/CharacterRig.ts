import {
  Bone,
  Box3,
  type BufferGeometry,
  Float32BufferAttribute,
  Group,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Skeleton,
  Quaternion,
  SkinnedMesh,
  Sphere,
  Uint16BufferAttribute,
  Vector3,
} from 'three';
import { clamp, damp, lerp } from '../core/math';
import { addRim, type RimUniforms } from '../render/materials';
import { forearmGeometry, footGeometry, headGeometry, shinGeometry, thighGeometry, torsoGeometry, upperArmGeometry } from './rig/body';
import { acquire, merge, release, type SharedGeometry } from './rig/geometry';
import { ANKLE_Y, ELBOW_Y, HAND_Y, HIP_CROUCH, HIP_KNEEL, HIP_SLIDE, HIP_STAND, NECK_Y, SHOULDER_Y, SPIN_Y } from './rig/skeleton';
import type { RigColors, RigOptions, RigPose, WeaponModel } from './rig/types';
import { GRIP, STOCK, weaponGeometry } from './rig/weapons';

export { idlePose } from './rig/types';
export type { HairStyle, Outfit, RigColors, RigOptions, RigPose, WeaponModel } from './rig/types';
import {
  type ArmReach,
  bell,
  cadence,
  footPitch,
  solveArm,
  type FootStep,
  footStep,
  type LegAngles,
  lookWeight,
  smooth,
  smoother,
  solveLeg,
  type Spring,
  spring,
} from './rigMath';

const _rootInv = new Matrix4();
const _local = new Matrix4();
const _grip = new Vector3();
const _hand = new Vector3();
const _ikQ = new Quaternion();
const _aim = new Vector3();
const _pocket = new Vector3();
const _zero = new Vector3();
const _up = new Vector3(0, 1, 0);
const _look = new Matrix4();
const _qGun = new Quaternion();
const _qFore = new Quaternion();
const _bounds = new Box3();
/** Esfera de recorte generosa (cubre volteretas, caídas y brazos extendidos). */
const CULL_CENTER = new Vector3(0, 0.9, 0);
const CULL_RADIUS = 1.6;
const bodyGeometries = new Map<string, SharedGeometry>();
const weaponGeometries = new Map<string, SharedGeometry>();

/**
 * Postura de perfil con armas largas (rad): el torso gira a la derecha para llevar el hombro izquierdo
 * hacia el objetivo y la culata al hombro derecho. La cadera gira algo más, pero solo en parado.
 */
const BLADE_TORSO = 0.45;
const BLADE_HIPS = 0.6;
/** Velocidad a partir de la cual el personaje esprinta (braceo en vez de arma en guardia). */
const SPRINT_SPEED = 5.6;
/** Rigidez del suavizado de articulaciones (1/s). */
const JOINT_K = 16;
const HALF_PI = Math.PI / 2;
/** Tajo del cuchillo: fin de la preparación y del corte (fracción del gesto) y rigidez del brazo mientras dura. */
const SLASH_WIND = 0.24;
const SLASH_CUT = 0.5;
const SLASH_K = 30;
/** Giro máximo de la cabeza sobre el torso al mirar algo (rad, unos 60°). */
const LOOK_YAW_MAX = 1.05;
/** Rigidez del muelle de la mirada (1/s): media vuelta de cabeza en algo menos de medio segundo. */
const LOOK_OMEGA = 8;

/** Todo lo que cambia la geometría del cuerpo (el material y el rim van aparte). */
function appearanceKey(o: RigOptions): string {
  const c = o.colors;
  return [
    c.jacket,
    c.shirt,
    c.tie,
    c.pants,
    c.shoes,
    c.skin,
    c.hair,
    c.accent,
    o.hair,
    o.bulk ?? 1,
    o.vest ? 1 : 0,
    o.beard ? 1 : 0,
    JSON.stringify(o.outfit ?? {}),
    o.face ?? 'stern',
  ].join('|');
}

const materialCache = new Map<string, { mat: MeshStandardMaterial; rim: RimUniforms }>();

/** Material por tipo de personaje (el rim es uniform por material). `unique` no se cachea. */
function rigMaterial(key: string, rimColor: number, rimStrength: number, unique: boolean): { mat: MeshStandardMaterial; rim: RimUniforms } {
  const hit = unique ? undefined : materialCache.get(key);
  if (hit) return hit;
  // Sombreado plano: las facetas son parte del diseño (low-poly deliberado, no realismo).
  const mat = new MeshStandardMaterial({ vertexColors: true, roughness: 0.78, metalness: 0.04, flatShading: true });
  mat.name = `rig:${key}`;
  const rim = addRim(mat, rimColor, rimStrength, 2.2);
  const entry = { mat, rim };
  if (!unique) materialCache.set(key, entry);
  return entry;
}

/**
 * Humanoide low-poly procedural con animación procedural.
 *
 * Huesos: root(pies, yaw) → spin(centro de masa: voltereta/caída) → hips → torso → cabeza y
 * brazos (hombro + codo); hips → piernas (cadera + rodilla). Todo el cuerpo es UNA SkinnedMesh
 * (cada pieza pesa 1 en su hueso): 1 draw call. El arma va aparte porque cambia de modelo.
 *
 * Convención: el personaje mira a −Z. En huesos que cuelgan (brazos, piernas) la rotación X
 * positiva los lleva hacia delante; en los que suben (torso, cabeza) positiva = hacia atrás.
 * Las piernas se resuelven con IK (`rigMath.solveLeg`) para que los pies pisen donde deben.
 * Las poses de brazos se definen en ángulos "de mundo" y se les resta la inclinación del torso,
 * así el arma apunta igual de pie, agachado o deslizándose.
 */
export class CharacterRig {
  readonly root = new Group();
  readonly material: MeshStandardMaterial;
  readonly rim: RimUniforms;
  /** Material propio (enemigos, por su rim individual) frente a uno compartido de la caché. */
  private readonly ownsMaterial: boolean;
  private readonly spin = new Bone();
  private readonly hips = new Bone();
  private readonly torso = new Bone();
  private readonly head = new Bone();
  private readonly armL = new Bone();
  private readonly armR = new Bone();
  private readonly foreL = new Bone();
  private readonly foreR = new Bone();
  private readonly thighL = new Bone();
  private readonly thighR = new Bone();
  private readonly shinL = new Bone();
  private readonly shinR = new Bone();
  private readonly footL = new Bone();
  private readonly footR = new Bone();
  /** Piezas pendientes de fusionar en la malla con skinning. */
  private readonly pieces: Array<{ bone: Bone; make: () => BufferGeometry }> = [];
  private skeleton: Skeleton | null = null;
  readonly weaponMount = new Group();
  private weaponMesh: Mesh | null = null;
  private weaponModel: WeaponModel = 'none';
  /** Claves de la geometría compartida que usa (cuerpo y arma). */
  private bodyKey = '';
  private weaponKey = '';
  private readonly meshes: Array<Mesh | SkinnedMesh> = [];
  private phase = 0;
  private time = 0;
  // Pesos de mezcla entre poses (0..1) con muelle crítico: ver `blend`.
  private readonly crouchS: Spring = { x: 0, v: 0 };
  private readonly bladeS: Spring = { x: 0, v: 0 };
  private readonly aimS: Spring = { x: 0, v: 0 };
  private readonly sprintS: Spring = { x: 0, v: 0 };
  private readonly kneelS: Spring = { x: 0, v: 0 };
  /** Girando sobre sí mismo sin desplazarse (pasos cortos en el sitio). */
  private readonly turnS: Spring = { x: 0, v: 0 };
  /** Amplitud de la zancada. */
  private readonly ampS: Spring = { x: 0, v: 0 };
  /** Giro e inclinación de la mirada de la cabeza sobre el torso (rad). */
  private readonly lookYawS: Spring = { x: 0, v: 0 };
  private readonly lookPitchS: Spring = { x: 0, v: 0 };
  /** Cadencia del último paso (pasos/s): al parar, el paso en curso se termina a ese ritmo. */
  private cadenceHz = 1.7;
  /** Dirección de la marcha respecto al frente (coseno y seno), suavizada. */
  private moveCos = 1;
  private moveSin = 0;
  private lastYaw = 0;
  /** 0..1 cuánto manda la IK sobre el brazo izquierdo (mano de apoyo en el arma). */
  private gripK = 0;
  private readonly armIk: ArmReach = { elbow: 0, hy: 0, hz: 0 };
  // Brazo izquierdo suavizado SIN la IK (la IK se mezcla encima cada frame).
  private lsxS = 0;
  private lszS = 0;
  private lelS = 0;
  // Brazo derecho y arma suavizados SIN la IK del encare (que se mezcla encima cada frame).
  private rsxS = 0;
  private rsyS = 0;
  private rszS = 0;
  private relS = 0;
  private wristS = -Math.PI / 2;
  /** 0..1 cuánto manda el encare (arma larga al hombro, mano derecha por IK). */
  private shoulderK = 0;
  private readonly armIkR: ArmReach = { elbow: 0, hy: 0, hz: 0 };
  private readonly bulk: number;
  private opacity = 1;
  // Reutilizados cada frame (sin asignaciones en el bucle).
  private readonly stepL: FootStep = { along: 0, lift: 0 };
  private readonly stepR: FootStep = { along: 0, lift: 0 };
  private readonly legL: LegAngles = { thigh: 0, shin: 0 };
  private readonly legR: LegAngles = { thigh: 0, shin: 0 };

  constructor(key: string, o: RigOptions) {
    const { mat, rim } = rigMaterial(key, o.rimColor, o.rimStrength, !!o.uniqueMaterial);
    this.material = mat;
    this.ownsMaterial = !!o.uniqueMaterial;
    this.rim = rim;
    const c = o.colors;
    const b = o.bulk ?? 1;
    this.bulk = b;

    // --- Torso en V: pelvis, faldón, pecho, hombros rectos, cuello de camisa, solapas y corbata ---
    this.addMesh(this.torso, () => torsoGeometry(o));

    // --- Cabeza facetada (hueso propio): cráneo, pómulos, mandíbula marcada y rasgos mínimos ---
    this.addMesh(this.head, () => headGeometry(o));
    this.head.position.set(0, NECK_Y, 0);
    // Primero gira sobre la columna (compensa el giro del torso) y después cabecea.
    this.head.rotation.order = 'YXZ';
    this.torso.add(this.head);

    // --- Brazos: hombrera, brazo y antebrazo que se afinan, puño de camisa y mano con pulgar ---
    const upperGeo = (): BufferGeometry => upperArmGeometry(o);
    const foreGeo = (): BufferGeometry => forearmGeometry(o);
    this.armL.position.set(-0.285 * b, SHOULDER_Y, 0);
    this.armR.position.set(0.285 * b, SHOULDER_Y, 0);
    // El giro vertical del hombro (perfil con arma larga) va antes que la elevación y la apertura.
    this.armR.rotation.order = 'YXZ';
    this.foreL.position.set(0, ELBOW_Y, 0);
    this.foreR.position.set(0, ELBOW_Y, 0);
    this.addMesh(this.armL, upperGeo);
    this.addMesh(this.armR, upperGeo);
    this.addMesh(this.foreL, foreGeo);
    this.addMesh(this.foreR, foreGeo);
    this.armL.add(this.foreL);
    this.armR.add(this.foreR);
    this.torso.add(this.armL, this.armR);
    // El arma va en la mano, con el cañón alineado con el antebrazo.
    this.weaponMount.position.set(0, HAND_Y - 0.01, -0.03);
    this.weaponMount.rotation.x = -HALF_PI;
    this.foreR.add(this.weaponMount);

    // --- Piernas: muslo y espinilla que se afinan; el zapato va en su propio hueso (tobillo) ---
    const thighGeo = (): BufferGeometry => thighGeometry(o);
    const shinGeo = (): BufferGeometry => shinGeometry(o);
    const footGeo = (): BufferGeometry => footGeometry(o);
    this.thighL.position.set(-0.1 * b, 0, 0);
    this.thighR.position.set(0.1 * b, 0, 0);
    this.shinL.position.set(0, -0.46, 0);
    this.shinR.position.set(0, -0.46, 0);
    this.footL.position.set(0, ANKLE_Y, 0);
    this.footR.position.set(0, ANKLE_Y, 0);
    this.addMesh(this.thighL, thighGeo);
    this.addMesh(this.thighR, thighGeo);
    this.addMesh(this.shinL, shinGeo);
    this.addMesh(this.shinR, shinGeo);
    this.addMesh(this.footL, footGeo);
    this.addMesh(this.footR, footGeo);
    this.shinL.add(this.footL);
    this.shinR.add(this.footR);
    this.thighL.add(this.shinL);
    this.thighR.add(this.shinR);

    this.hips.position.set(0, 0.05, 0);
    this.hips.add(this.torso, this.thighL, this.thighR);
    this.spin.position.set(0, SPIN_Y, 0);
    this.spin.add(this.hips);
    this.root.add(this.spin);
    this.buildSkin(appearanceKey(o));
    this.setWeapon(o.weapon, c.accent);
  }

  /** Registra una pieza; su geometría solo se construye si ese aspecto aún no existe (`buildSkin`). */
  private addMesh(bone: Bone, make: () => BufferGeometry): void {
    this.pieces.push({ bone, make });
  }

  /**
   * Fusiona las piezas en una SkinnedMesh: cada vértice va a su hueso con peso 1. Los personajes de
   * igual aspecto (todos los matones, los civiles con el mismo atuendo) comparten esta geometría:
   * solo se construye la primera vez. El esqueleto sí es de cada uno.
   */
  private buildSkin(key: string): void {
    const bones = [
      this.spin,
      this.hips,
      this.torso,
      this.head,
      this.armL,
      this.armR,
      this.foreL,
      this.foreR,
      this.thighL,
      this.thighR,
      this.shinL,
      this.shinR,
      this.footL,
      this.footR,
    ];
    this.root.updateMatrixWorld(true);
    const geo = acquire(bodyGeometries, key, () => {
      _rootInv.copy(this.root.matrixWorld).invert();
      const geos: BufferGeometry[] = [];
      for (const { bone, make } of this.pieces) {
        // Pose de reposo: la pieza pasa del espacio de su hueso al de la raíz.
        const g = make().applyMatrix4(_local.multiplyMatrices(_rootInv, bone.matrixWorld));
        const n = g.getAttribute('position').count;
        const idx = bones.indexOf(bone);
        const si = new Uint16Array(n * 4);
        const sw = new Float32Array(n * 4);
        for (let i = 0; i < n; i++) {
          si[i * 4] = idx;
          sw[i * 4] = 1;
        }
        g.setAttribute('skinIndex', new Uint16BufferAttribute(si, 4));
        g.setAttribute('skinWeight', new Float32BufferAttribute(sw, 4));
        geos.push(g);
      }
      return merge(geos);
    });
    this.bodyKey = key;
    this.pieces.length = 0;
    const mesh = new SkinnedMesh(geo, this.material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.boundingSphere = new Sphere(CULL_CENTER.clone(), CULL_RADIUS);
    this.root.add(mesh);
    this.root.updateMatrixWorld(true);
    this.skeleton = new Skeleton(bones);
    mesh.bind(this.skeleton);
    this.meshes.push(mesh);
  }

  /** Cambia el arma visible. La misma arma del mismo color se comparte entre personajes. */
  setWeapon(model: WeaponModel, accent = 0x888888): void {
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
      this.material,
    );
    this.weaponMesh.castShadow = true;
    this.weaponMount.add(this.weaponMesh);
  }

  /** Visibilidad (la cámara muy cerca transparenta al personaje en vez de meterse dentro). */
  setOpacity(v: number): void {
    const o = clamp(v, 0, 1);
    if (Math.abs(o - this.opacity) < 0.01) return;
    this.opacity = o;
    // Por debajo de 0,5 se oculta del todo (evita ordenar transparencias de personajes).
    this.root.visible = o >= 0.5;
  }

  /**
   * Peso de mezcla 0..1 con muelle crítico. Con un suavizado de primer orden, la velocidad del peso saltaba en el
   * instante del cambio (agacharse, apuntar, arrancar) y todo el cuerpo daba un tirón; así arranca y frena suave.
   */
  private blend(s: Spring, target: number, omega: number, dt: number): number {
    return clamp(spring(s, target, omega, dt), 0, 1);
  }

  /** Anima la pose. `dt` = tiempo de render (incluye la escala del Foco). */
  update(p: RigPose, dt: number): void {
    this.time += dt;
    const st = p.state;
    const model = this.weaponModel;
    const armed = model !== 'none';
    const long = model === 'rifle' || model === 'dmr' || model === 'smg' || model === 'shotgun' || model === 'shotgunTactical';
    const knife = model === 'knife';

    const onFeet = st === 'ground' || st === 'cover' || st === 'locked';
    const crouching = p.posture === 'crouch' && onFeet;
    const ck = this.blend(this.crouchS, crouching ? 1 : 0, 13, dt);
    const ak = this.blend(this.aimS, knife ? 0 : p.aim, 19, dt);
    const sk = this.blend(this.sprintS, onFeet && p.grounded && p.speed > SPRINT_SPEED ? 1 : 0, 10, dt);
    const kk = this.blend(this.kneelS, p.kneel, 10, dt);
    // Al esprintar el arma larga va cruzada y el cuerpo de frente.
    const bk = this.blend(this.bladeS, long && onFeet ? 1 : 0, 9, dt) * (1 - sk);
    // Giro en el sitio: se mide cuánto rota la raíz por segundo.
    let dYaw = this.root.rotation.y - this.lastYaw;
    this.lastYaw = this.root.rotation.y;
    dYaw -= Math.round(dYaw / (Math.PI * 2)) * Math.PI * 2;
    const turnRate = dt > 1e-5 ? Math.abs(dYaw) / dt : 0;

    // ------------------------------------------------------------- marcha
    const moving = p.grounded && p.speed > 0.25 && onFeet;
    const speedN = clamp(p.speed / 7, 0, 1);
    const tk = this.blend(this.turnS, !moving && onFeet && p.grounded && st !== 'locked' ? clamp((turnRate - 0.9) / 2.2, 0, 1) : 0, 12, dt);
    // Zancada con muelle: crece al arrancar y, al parar, el paso en curso se termina mientras se apaga (antes los
    // pies saltaban a la postura de reposo en el fotograma de la parada).
    const amp = this.blend(this.ampS, moving ? clamp(p.speed / 2.2, 0.3, 1) : 0, 11, dt);
    if (moving) {
      this.cadenceHz = cadence(p.speed);
      // Un cambio de sentido gira las piernas en unas décimas, no de un fotograma al siguiente.
      this.moveCos = damp(this.moveCos, Math.cos(p.moveAngle), 10, dt);
      this.moveSin = damp(this.moveSin, Math.sin(p.moveAngle), 10, dt);
    }
    this.phase += Math.PI * (this.cadenceHz * clamp(amp / 0.3, 0, 1) + 2.4 * tk) * dt;
    const ph = this.phase;
    // El esprint alarga la zancada y sube más las rodillas; girando en el sitio, pasitos sin avance.
    const half = amp * lerp(0.2, 0.36, speedN) * (1 - 0.35 * ck) * (1 + 0.28 * sk);
    const liftH = amp * lerp(0.06, 0.16, speedN) * (1 - 0.4 * ck) * (1 + 0.6 * sk) + 0.05 * tk;
    const cf = this.moveCos;
    const cr = -this.moveSin;
    const sL = footStep(ph, half, liftH, this.stepL);
    const sR = footStep(ph + Math.PI, half, liftH, this.stepR);
    const lead = Math.cos(ph) * amp;

    // Postura de combate: un pie adelantado al apuntar o agacharse (menos al caminar).
    const stance = (0.035 + 0.09 * ak + 0.13 * ck) * (1 - amp * 0.75);
    // La cadera baja al apoyar los dos pies y sube a mitad de paso (con coseno al cuadrado: sin pico arriba).
    const cph = Math.cos(ph);
    let hipY = lerp(HIP_STAND - 0.02 * ak, HIP_CROUCH, ck) - 0.03 * amp * cph * cph;
    let lF = sL.along * cf + stance;
    let rF = sR.along * cf - stance;
    let lSide = sL.along * cr;
    let rSide = sR.along * cr;
    let lDown = hipY - sL.lift;
    let rDown = hipY - sR.lift;
    let hipLocal = hipY - SPIN_Y;

    let torsoX = lerp(-0.04 - 0.08 * speedN - 0.24 * sk, -0.7, ck);
    let torsoZ = -cr * 0.07 * amp;
    let torsoY = lead * cf * 0.16 * (armed ? 0.35 + 0.65 * sk : 1);
    let hipsYaw = -lead * cf * 0.12;
    // Arma larga: de perfil. En marcha la cadera sigue el paso y solo gira el torso.
    torsoY -= BLADE_TORSO * bk;
    hipsYaw -= BLADE_HIPS * bk * (1 - amp);
    let headX = p.aimPitch * 0.55;
    let headLevel = 0.85;
    let spinX = 0;
    let spinZ = 0;
    let spinY = SPIN_Y;
    // Peso de las poses de arma (guardia/apuntado); los estados acrobáticos lo reducen.
    let armsFree = 0;
    let plantL = 0;
    let grip = 0;
    // Pies: cabeceo respecto al suelo (+ = punta arriba). `footWorld` = 0 los deja sueltos (volteretas, caídas).
    let lFootP = footPitch(ph) * amp;
    let rFootP = footPitch(ph + Math.PI) * amp;
    let footWorld = 1;
    // Agachado, el pie de atrás se apoya en la punta.
    const tiptoe = ck * (1 - amp);
    rFootP -= 0.55 * tiptoe;
    rDown -= 0.05 * tiptoe;

    // ------------------------------------------------------------- estados
    switch (st) {
      case 'air':
        lF = 0.24;
        lDown = 0.6;
        rF = -0.1;
        rDown = 0.8;
        lSide = rSide = 0;
        hipLocal = 0.03;
        torsoX = -0.12;
        lFootP = rFootP = -0.4;
        break;
      case 'roll': {
        const t = clamp(p.stateTime / 0.5, 0, 1);
        spinX = -Math.PI * 2 * t;
        spinY = lerp(SPIN_Y, 0.5, Math.sin(t * Math.PI));
        lF = 0.24;
        rF = 0.2;
        lDown = 0.34;
        rDown = 0.38;
        lSide = rSide = 0;
        hipLocal = 0;
        torsoX = -0.95;
        headX = -0.35;
        headLevel = 0;
        armsFree = 1;
        footWorld = 0;
        break;
      }
      case 'slide': {
        // Deslizamiento: cadera casi en el suelo, pierna derecha estirada al frente, izquierda
        // recogida con la rodilla arriba, torso reclinado y mano izquierda apoyada detrás.
        const settle = smooth(0, 0.18, p.stateTime);
        hipY = lerp(HIP_CROUCH, HIP_SLIDE, settle);
        hipLocal = hipY - SPIN_Y;
        rF = 0.84;
        rDown = hipY - 0.05;
        lF = 0.3;
        lDown = hipY - 0.03;
        lSide = -0.04;
        rSide = 0.04;
        torsoX = lerp(0.2, 0.78, settle);
        torsoZ = 0.1;
        torsoY = 0;
        hipsYaw = 0;
        plantL = settle;
        // La pierna estirada patina sobre el talón; la recogida apoya la suela entera.
        rFootP = 1.0;
        lFootP = 0;
        break;
      }
      case 'vault': {
        // Tres tiempos: apoyar la mano y recoger las piernas, pasarlas de lado y bajar a aterrizar.
        const u = p.vault >= 0 ? p.vault : 0.5;
        const tuck = smooth(0, 0.3, u);
        const over = smooth(0.25, 0.55, u) * (1 - smooth(0.8, 1, u));
        const land = smooth(0.72, 1, u);
        lF = lerp(lerp(0.12, 0.5, over), 0.2, land);
        rF = lerp(lerp(0.3, 0.62, over), -0.02, land);
        lDown = lerp(lerp(0.9, 0.52, tuck), 0.84, land) - 0.1 * over;
        rDown = lerp(lerp(0.9, 0.44, tuck), 0.88, land) - 0.06 * over;
        lSide = rSide = 0.28 * over;
        hipLocal = 0;
        torsoX = lerp(-0.28, -0.14, land) - 0.2 * over;
        torsoZ = 0.26 * over;
        plantL = tuck * (1 - land);
        lFootP = rFootP = -0.3 * (1 - land);
        break;
      }
      case 'dead': {
        const t = clamp(p.stateTime / 0.55, 0, 1);
        lSide = -0.08;
        rSide = 0.1;
        hipLocal = 0.02;
        headLevel = 0;
        armsFree = 1;
        footWorld = 0;
        if (p.death === 1) {
          // De espaldas: el impacto lo tumba hacia atrás con las piernas abiertas.
          spinX = HALF_PI * t * t;
          spinY = lerp(SPIN_Y, 0.15, t);
          lF = 0.2;
          rF = -0.02;
          lDown = 0.86;
          rDown = 0.92;
          lSide = -0.16;
          rSide = 0.2;
          torsoX = 0.12 * t;
          headX = 0.25 * t;
        } else if (p.death === 2) {
          // Desplomado: primero ceden las rodillas, luego cae de lado.
          const buckle = smooth(0, 0.45, t);
          const fall = smooth(0.3, 1, t);
          spinZ = HALF_PI * fall * fall;
          spinX = 0.25 * fall;
          spinY = lerp(SPIN_Y, 0.2, t);
          lF = 0.3;
          rF = 0.16;
          lDown = lerp(0.9, 0.5, buckle);
          rDown = lerp(0.9, 0.62, buckle);
          torsoX = -0.5 * buckle;
          headX = -0.3;
        } else {
          // De bruces (en huesos que suben, el giro negativo es hacia delante).
          spinX = -HALF_PI * t * t;
          spinY = lerp(SPIN_Y, 0.16, t);
          lF = 0.05;
          rF = 0.22;
          lDown = 0.9;
          rDown = 0.8;
          torsoX = 0.05;
          headX = 0.45;
        }
        break;
      }
      default:
        break;
    }

    // Arrodillado (aturdido): rodilla derecha en el suelo, torso vencido.
    if (kk > 0.001) {
      hipLocal = lerp(hipLocal, HIP_KNEEL - SPIN_Y, kk);
      lF = lerp(lF, 0.34, kk);
      lDown = lerp(lDown, HIP_KNEEL - 0.02, kk);
      torsoX = lerp(torsoX, -0.5, kk);
      headX = lerp(headX, -0.45, kk);
      rFootP = lerp(rFootP, -1.2, kk);
    }

    const legL = solveLeg(lF, lDown, this.legL);
    const legR = solveLeg(rF, rDown, this.legR);
    let thighR = legR.thigh;
    let shinR = legR.shin;
    if (kk > 0.001) {
      thighR = lerp(thighR, -0.05, kk);
      shinR = lerp(shinR, -1.62, kk);
    }

    // ------------------------------------------------------------- brazos
    // Base sin arma: braceo contrario a las piernas, codos más doblados al correr.
    const pump = 0.42 + 0.55 * sk;
    let lsx = -lead * cf * pump;
    let rsx = lead * cf * pump;
    let lel = 0.2 + 0.3 * amp + 0.95 * sk;
    let rel = lel;
    let lsz = -0.07;
    let rsz = 0.07;
    let wrist = 0;
    let rsy = 0;

    if (armed && armsFree < 1) {
      // Guardia (ángulos de mundo; se resta la inclinación del torso).
      let gRsx: number, gRel: number, gRsz: number, gLsx: number, gLel: number, gLsz: number;
      let aRsx: number, aRel: number, aRsz: number, aLsx: number, aLel: number, aLsz: number;
      const aimW = HALF_PI + p.aimPitch;
      if (long) {
        gRsx = 0.3;
        gRel = 0.9;
        gRsz = -0.32;
        gLsx = 0.78;
        gLel = 0.42;
        gLsz = 0.52;
        // Apuntando manda el encare (IK al final de update): estos ángulos solo guían la transición.
        aRsx = 0.95 + 0.5 * p.aimPitch;
        aRel = 0.62 + 0.5 * p.aimPitch;
        aRsz = -0.5;
        aLsx = 1.3 + 0.95 * p.aimPitch;
        aLel = 0.24;
        aLsz = 0.5;
      } else if (knife) {
        gRsx = 0.45;
        gRel = 1.25;
        gRsz = -0.12;
        gLsx = 0.4;
        gLel = 1.3;
        gLsz = 0.22;
        aRsx = gRsx;
        aRel = gRel;
        aRsz = gRsz;
        aLsx = gLsx;
        aLel = gLel;
        aLsz = gLsz;
      } else {
        // Pistola: guardia recogida al pecho a dos manos; al apuntar, brazos extendidos.
        gRsx = 0.2;
        gRel = 1.15;
        gRsz = -0.3;
        gLsx = 0.26;
        gLel = 1.08;
        gLsz = 0.44;
        aRsx = aimW - 0.03;
        aRel = 0.1;
        aRsz = -0.33;
        aLsx = aimW;
        aLel = 0.14;
        aLsz = 0.52;
      }
      // Al esprintar con pistola o cuchillo se bracea; el arma larga se lleva cruzada.
      const hold = (1 - armsFree) * (1 - sk * (long ? 0.2 : 0.85) * (1 - ak));
      const bob = Math.sin(ph * 2) * 0.03 * amp;
      rsx = lerp(rsx, lerp(gRsx, aRsx, ak) - torsoX + bob, hold);
      rel = lerp(rel, lerp(gRel, aRel, ak), hold);
      rsz = lerp(rsz, lerp(gRsz, aRsz, ak), hold);
      lsx = lerp(lsx, lerp(gLsx, aLsx, ak) - torsoX + bob, hold);
      lel = lerp(lel, lerp(gLel, aLel, ak), hold);
      lsz = lerp(lsz, lerp(gLsz, aLsz, ak), hold);
      grip = hold;
      // Con el torso de perfil, el brazo derecho gira de vuelta para que el cañón siga la línea de mira.
      if (long) {
        rsy = BLADE_TORSO * bk * hold;
      }

      // Retroceso: el arma salta y vuelve.
      rel += p.recoil * (long ? 0.1 : 0.26);
      rsx += p.recoil * 0.05;
      lel += p.recoil * (long ? 0.06 : 0.2);

      // Recarga: el arma sube inclinada, la mano izquierda baja al cinturón y vuelve.
      if (p.reload >= 0) {
        const up = bell(p.reload);
        const belt = smooth(0.15, 0.38, p.reload) * (1 - smooth(0.6, 0.85, p.reload));
        rsx = lerp(rsx, 0.5 - torsoX, up * 0.85);
        rel = lerp(rel, 1.5, up * 0.85);
        rsz = lerp(rsz, -0.25, up);
        wrist = lerp(wrist, -0.35, up);
        lsx = lerp(lerp(lsx, 0.62 - torsoX, up), 0.05 - torsoX, belt);
        lel = lerp(lerp(lel, 1.25, up), 1.05, belt);
        lsz = lerp(lerp(lsz, 0.5, up), 0.08, belt);
        grip *= 1 - smooth(0.04, 0.16, p.reload) * (1 - smooth(0.82, 0.96, p.reload));
      }
    }

    // Cambio de arma: la mano baja a la cadera (donde se cambia el modelo) y vuelve.
    if (p.swap > 0) {
      rsx = lerp(rsx, -0.3 - torsoX, p.swap);
      rel = lerp(rel, 0.85, p.swap);
      rsz = lerp(rsz, 0.04, p.swap);
      lsx = lerp(lsx, 0.1 - torsoX, p.swap * 0.7);
      lel = lerp(lel, 0.35, p.swap * 0.7);
      lsz = lerp(lsz, -0.05, p.swap * 0.7);
    }
    // Forcejeo al empezar el takedown: barrido cruzado con giro de torso.
    if (p.melee > 0) {
      rsx = lerp(rsx, 1.45 - torsoX, p.melee);
      rel = lerp(rel, 0.4, p.melee);
      rsz = lerp(rsz, -0.75, p.melee);
      torsoY += 0.45 * p.melee;
    }
    // Tajo del cuchillo en tres tiempos: el brazo se arma junto a la oreja derecha con el torso girado a la derecha,
    // corta en diagonal hacia la cadera izquierda mientras el torso gira y se vence, y vuelve a la guardia.
    // En el brazo derecho, `rsz` positivo lo abre hacia fuera y negativo lo cruza por delante del cuerpo.
    const slashing = p.slash >= 0 && armed && armsFree < 1;
    if (slashing) {
      const u = p.slash;
      const wind = smoother(0, SLASH_WIND, u) * (1 - smoother(SLASH_WIND, SLASH_CUT, u));
      const cut = smoother(SLASH_WIND, SLASH_CUT, u) * (1 - smoother(SLASH_CUT + 0.1, 1, u));
      rsx = lerp(rsx, 1.7 - torsoX, wind);
      rel = lerp(rel, 1.9, wind);
      rsz = lerp(rsz, 0.75, wind);
      wrist += 0.45 * wind - 0.3 * cut;
      torsoY -= 0.35 * wind;
      rsx = lerp(rsx, 0.9 - torsoX, cut);
      rel = lerp(rel, 0.3, cut);
      rsz = lerp(rsz, -0.55, cut);
      torsoY += 0.5 * cut;
      torsoX -= 0.14 * cut;
      // La izquierda se recoge al pecho para equilibrar el giro.
      lsx = lerp(lsx, 0.2 - torsoX, cut * 0.6);
      lel = lerp(lel, 1.55, cut * 0.6);
    }
    // Takedown: la izquierda agarra, el torso se vuelca para proyectar y la derecha remata hacia el suelo.
    if (p.takedown >= 0) {
      const t = p.takedown;
      const grab = smooth(0, 0.14, t) * (1 - smooth(0.3, 0.5, t));
      const thrw = smooth(0.2, 0.45, t) * (1 - smooth(0.82, 0.95, t));
      const exec = smooth(0.4, 0.54, t) * (1 - smooth(0.85, 0.95, t));
      torsoX -= 0.18 * grab + 0.4 * thrw;
      torsoY -= 0.5 * grab - 0.3 * thrw;
      headX -= 0.4 * exec;
      lsx = lerp(lsx, 1.3 - torsoX, grab);
      lel = lerp(lel, 0.3, grab);
      lsz = lerp(lsz, 0.2, grab);
      lsx = lerp(lsx, 0.35 - torsoX, thrw * (1 - grab));
      lel = lerp(lel, 0.5, thrw * (1 - grab));
      rsx = lerp(rsx, 0.85 - torsoX + p.recoil * 0.2, exec);
      rel = lerp(rel, 0.12, exec);
      rsz = lerp(rsz, -0.12, exec);
    }
    // Mano izquierda apoyada (deslizamiento: detrás, en el suelo; vault: sobre el obstáculo).
    if (plantL > 0) {
      const sliding = st === 'slide';
      lsx = lerp(lsx, (sliding ? -0.35 : 0.55) - torsoX, plantL);
      lel = lerp(lel, sliding ? 0.12 : 0.25, plantL);
      lsz = lerp(lsz, sliding ? -0.28 : -0.15, plantL);
    }
    if (st === 'roll') {
      lsx = rsx = 1.0;
      lel = rel = 1.9;
      lsz = 0.2;
      rsz = -0.2;
    } else if (st === 'dead') {
      lsx = rsx = p.death === 1 ? 0.5 : -0.25;
      lel = rel = p.death === 2 ? 0.9 : 0.35;
      lsz = p.death === 2 ? -0.3 : -0.95;
      rsz = p.death === 2 ? 0.5 : 0.95;
    }
    // Sacudida de impacto: el torso se vence hacia atrás y hacia el lado contrario al disparo.
    if (p.flinch > 0 && st !== 'dead') {
      torsoX += 0.34 * p.flinch;
      torsoZ += 0.26 * p.flinch * p.flinchSide;
      headX += 0.3 * p.flinch;
      lel += 0.25 * p.flinch;
      rel += 0.15 * p.flinch;
    }
    if (kk > 0.001) {
      lsx = lerp(lsx, 0.35 - torsoX, kk);
      lel = lerp(lel, 0.2, kk);
      lsz = lerp(lsz, -0.1, kk);
      rsx = lerp(rsx, 0.1 - torsoX, kk);
      rel = lerp(rel, 0.5, kk);
    }

    // Respiración en reposo (rotación mínima, sin escalar huesos).
    if (onFeet) torsoX += Math.sin(this.time * 1.7) * 0.012 * (1 - amp);
    torsoX += p.recoil * 0.025;

    // ------------------------------------------------------------- aplicación suavizada
    const exact = st === 'roll' || st === 'dead';
    const k = exact ? 40 : JOINT_K;
    const s = (cur: number, tgt: number): number => damp(cur, tgt, k, dt);
    this.thighL.rotation.x = s(this.thighL.rotation.x, legL.thigh);
    this.thighR.rotation.x = s(this.thighR.rotation.x, thighR);
    this.shinL.rotation.x = s(this.shinL.rotation.x, legL.shin);
    this.shinR.rotation.x = s(this.shinR.rotation.x, shinR);
    // El tobillo compensa el giro de la pierna para que la suela siga el suelo.
    const lAnkle = lerp(0.15, lFootP - (this.thighL.rotation.x + this.shinL.rotation.x), footWorld);
    const rAnkle = lerp(0.15, rFootP - (this.thighR.rotation.x + this.shinR.rotation.x), footWorld);
    this.footL.rotation.x = s(this.footL.rotation.x, clamp(lAnkle, -1.25, 0.95));
    this.footR.rotation.x = s(this.footR.rotation.x, clamp(rAnkle, -1.25, 0.95));
    this.thighL.rotation.z = s(this.thighL.rotation.z, clamp(Math.atan2(lSide, lDown), -0.5, 0.5));
    this.thighR.rotation.z = s(this.thighR.rotation.z, clamp(Math.atan2(rSide, rDown), -0.5, 0.5));
    this.hips.position.y = s(this.hips.position.y, hipLocal);
    this.hips.rotation.y = s(this.hips.rotation.y, hipsYaw);
    this.torso.rotation.x = s(this.torso.rotation.x, torsoX + ak * p.aimPitch * 0.2);
    // El tajo dura 0,3 s: con el suavizado normal el brazo no llegaría a armarse antes de cortar.
    const kArm = slashing ? SLASH_K : k;
    this.torso.rotation.y = damp(this.torso.rotation.y, torsoY - hipsYaw, kArm, dt);
    this.torso.rotation.z = s(this.torso.rotation.z, torsoZ);
    // Mirada: la cabeza se vuelve hacia lo que mira (el enemigo que vigila, el NPC que te sigue, el jugador
    // hacia la cámara). Se apaga en volteretas, caídas y de rodillas, y si el objetivo queda a la espalda.
    // Va con muelle propio: no sigue al ratón al instante ni vuelve al frente de golpe.
    const lookOn = headLevel > 0 && kk < 0.5 ? p.look : 0;
    const lookYawT = clamp(p.lookYaw, -LOOK_YAW_MAX, LOOK_YAW_MAX) * lookWeight(p.lookYaw) * lookOn * (1 - 0.5 * sk);
    const lookY = spring(this.lookYawS, lookYawT, LOOK_OMEGA, dt);
    headX += spring(this.lookPitchS, clamp(p.lookPitch, -0.6, 0.45) * lookOn * (1 - ak), LOOK_OMEGA, dt);
    this.head.rotation.x = s(this.head.rotation.x, clamp(headX - torsoX * headLevel, -0.9, 0.9));
    // La cabeza compensa el giro del torso: sin mirada, sigue al frente.
    this.head.rotation.y = s(this.head.rotation.y, clamp(-torsoY * headLevel + lookY, -1.3, 1.3));
    this.lsxS = s(this.lsxS, lsx);
    this.lszS = s(this.lszS, lsz);
    this.lelS = s(this.lelS, lel);
    this.armL.rotation.set(this.lsxS, 0, this.lszS);
    this.foreL.rotation.x = this.lelS;
    const free = st === 'roll' || st === 'dead' || p.takedown >= 0 ? 0 : (1 - p.swap) * (1 - p.melee) * (1 - plantL) * (1 - kk);
    this.rsxS = damp(this.rsxS, rsx, kArm, dt);
    this.rsyS = s(this.rsyS, rsy * free);
    this.rszS = damp(this.rszS, rsz, kArm, dt);
    this.relS = damp(this.relS, rel, kArm, dt);
    this.wristS = damp(this.wristS, -HALF_PI + wrist, kArm, dt);
    this.armR.rotation.set(this.rsxS, this.rsyS, this.rszS);
    this.foreR.rotation.set(this.relS, 0, 0);
    this.weaponMount.rotation.set(this.wristS, 0, 0);
    // Encare: con un arma larga apuntada manda el arma. La cantonera va al hueco del hombro derecho y el cañón
    // sigue la línea de mira sin ladearse; la mano derecha alcanza la empuñadura por IK.
    const stock = STOCK[model];
    this.shoulderK = damp(this.shoulderK, stock > 0 && p.reload < 0 ? ak * grip * free : 0, 14, dt);
    // Al cambiar de arma, las dos IK se apagan del todo justo cuando cambia el modelo (y con él, dónde se agarra):
    // con un resto de peso, las manos saltaban de un agarre al otro en ese fotograma.
    const swapOff = 1 - p.swap;
    const shoulderW = this.shoulderK * swapOff;
    if (shoulderW > 0.01) {
      this.root.updateWorldMatrix(true, true);
      const pitch = p.aimPitch + p.recoil * 0.06;
      _aim.set(0, Math.sin(pitch), -Math.cos(pitch)).transformDirection(this.root.matrixWorld);
      // Hueco del hombro (espacio del torso); la empuñadura queda una culata por delante, y el retroceso la empuja atrás.
      _pocket.set(0.17 * this.bulk, SHOULDER_Y + 0.02, -0.06);
      this.torso.localToWorld(_pocket).addScaledVector(_aim, stock - p.recoil * 0.03);
      this.torso.worldToLocal(_pocket).sub(this.armR.position);
      const ik = solveArm(_pocket.length(), -ELBOW_Y, -HAND_Y, this.armIkR);
      _ikQ.setFromUnitVectors(_hand.set(0, ik.hy, ik.hz).normalize(), _pocket.normalize());
      this.armR.quaternion.slerp(_ikQ, shoulderW);
      this.foreR.rotation.x = lerp(this.relS, ik.elbow, shoulderW);
      // El arma mira por donde se apunta: cañón (−Z del soporte) por la mira y su arriba hacia arriba.
      this.foreR.updateWorldMatrix(true, false);
      _qGun.setFromRotationMatrix(_look.lookAt(_zero, _aim, _up));
      this.foreR.getWorldQuaternion(_qFore).invert().multiply(_qGun);
      this.weaponMount.quaternion.slerp(_qFore, shoulderW);
    }
    // Mano de apoyo: con el brazo derecho ya colocado, la izquierda va por IK al arma.
    const gripAt = GRIP[model];
    this.gripK = damp(this.gripK, gripAt ? grip * free : 0, 14, dt);
    const gripW = this.gripK * swapOff;
    if (gripAt && gripW > 0.01) {
      this.torso.updateWorldMatrix(true, true);
      _grip.set(gripAt[0], gripAt[1], gripAt[2]);
      this.torso.worldToLocal(this.weaponMount.localToWorld(_grip)).sub(this.armL.position);
      const ik = solveArm(_grip.length(), -ELBOW_Y, -HAND_Y, this.armIk);
      // El hombro gira lo justo para llevar la mano (en reposo, en el plano YZ) hasta el agarre.
      _ikQ.setFromUnitVectors(_hand.set(0, ik.hy, ik.hz).normalize(), _grip.normalize());
      this.armL.quaternion.slerp(_ikQ, gripW);
      this.foreL.rotation.x = lerp(this.lelS, ik.elbow, gripW);
    }
    // La voltereta y la caída siguen el tiempo exacto del estado (no se suavizan).
    if (exact) {
      this.spin.rotation.x = spinX;
      this.spin.rotation.z = spinZ;
      this.spin.position.y = spinY;
    } else {
      this.spin.rotation.z = s(this.spin.rotation.z, 0);
      // Tras una voltereta completa el giro equivale a 0: no se "desenrolla".
      if (this.spin.rotation.x < -Math.PI) this.spin.rotation.x += Math.PI * 2;
      this.spin.rotation.x = s(this.spin.rotation.x, 0);
      this.spin.position.y = s(this.spin.position.y, spinY);
    }
  }

  /**
   * Altura de la silueta sobre los pies con la pose actual: la malla deformada por el esqueleto.
   * Es cara (recorre todos los vértices); la usan las pruebas para comprobar que el cuerpo cabe en su cápsula.
   */
  /**
   * Cómo apunta el arma respecto al frente del personaje (grados): desvío del cañón en horizontal, inclinación
   * del cañón y ladeo (giro sobre el propio cañón). La usan las pruebas del encare.
   */
  weaponAim(): { yaw: number; pitch: number; roll: number } {
    this.root.updateWorldMatrix(true, true);
    this.weaponMount.getWorldQuaternion(_qFore);
    const barrel = _aim.set(0, 0, -1).applyQuaternion(_qFore);
    const up = _pocket.set(0, 1, 0).applyQuaternion(_qFore);
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

  /**
   * Muestra del movimiento: ángulos de las articulaciones (rad) y posición de manos y cabeza respecto a los pies (m,
   * en el espacio del personaje). La usan las pruebas de fluidez para buscar tirones entre fotogramas.
   */
  motionSample(): Record<string, number> {
    this.root.updateWorldMatrix(true, true);
    const handR = this.root.worldToLocal(this.weaponMount.getWorldPosition(_grip));
    const out: Record<string, number> = {
      yaw: this.root.rotation.y,
      hipsY: this.hips.position.y,
      hipsYaw: this.hips.rotation.y,
      torsoX: this.torso.rotation.x,
      torsoY: this.torso.rotation.y,
      torsoZ: this.torso.rotation.z,
      headX: this.head.rotation.x,
      headY: this.head.rotation.y,
      thighL: this.thighL.rotation.x,
      thighR: this.thighR.rotation.x,
      shinL: this.shinL.rotation.x,
      shinR: this.shinR.rotation.x,
      handRx: handR.x,
      handRy: handR.y,
      handRz: handR.z,
    };
    const handL = this.root.worldToLocal(this.foreL.localToWorld(_grip.set(0, HAND_Y, 0)));
    out.handLx = handL.x;
    out.handLy = handL.y;
    out.handLz = handL.z;
    const head = this.root.worldToLocal(this.head.localToWorld(_grip.set(0, 0.12, -0.1)));
    out.noseX = head.x;
    out.noseY = head.y;
    out.noseZ = head.z;
    return out;
  }

  silhouetteHeight(): number {
    const body = this.meshes.find((m): m is SkinnedMesh => m instanceof SkinnedMesh);
    if (!body) return 0;
    this.root.updateWorldMatrix(true, true);
    body.skeleton.update();
    body.computeBoundingBox();
    if (!body.boundingBox) return 0;
    _bounds.copy(body.boundingBox).applyMatrix4(body.matrixWorld);
    return _bounds.max.y - this.root.getWorldPosition(_grip).y;
  }

  dispose(): void {
    // La geometría es compartida: se libera cuando la suelta el último personaje que la usa.
    release(bodyGeometries, this.bodyKey);
    this.bodyKey = '';
    this.setWeapon('none');
    this.skeleton?.dispose();
    // Un material compartido sigue en la caché para los demás personajes y el próximo nivel: solo se libera el propio.
    if (this.ownsMaterial) this.material.dispose();
    this.root.removeFromParent();
  }
}

/** Paleta del Huésped (jugador): traje negro, camisa y corbata negras, media melena y barba oscuras. */
export const PLAYER_COLORS: RigColors = {
  jacket: 0x1b1d23,
  shirt: 0x0c0d10,
  tie: 0x060608,
  pants: 0x17191e,
  shoes: 0x09090b,
  skin: 0xcca48b,
  hair: 0x1f1712,
  accent: 0xc9a227,
};

/**
 * Aspecto del Huésped: John Wick con los rasgos de Keanu Reeves, por bloques. Traje negro de tres
 * piezas sin pañuelo, media melena con raya al medio y barba corta.
 */
export const PLAYER_LOOK: RigOptions = {
  colors: PLAYER_COLORS,
  rimColor: 0xe8e2d0,
  rimStrength: 0.16,
  hair: 'parted',
  beard: true,
  face: 'wick',
  weapon: 'pistol',
  outfit: { waistcoat: 0x111216, pocketSquare: false },
};
