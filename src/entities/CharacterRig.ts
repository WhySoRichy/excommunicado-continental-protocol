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
import { GRIP, weaponGeometry } from './rig/weapons';

export { idlePose } from './rig/types';
export type { HairStyle, Outfit, RigColors, RigOptions, RigPose, WeaponModel } from './rig/types';
import { type ArmReach, bell, cadence, footPitch, solveArm, type FootStep, footStep, type LegAngles, smooth, solveLeg } from './rigMath';

const _rootInv = new Matrix4();
const _local = new Matrix4();
const _grip = new Vector3();
const _hand = new Vector3();
const _ikQ = new Quaternion();
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
  private crouchK = 0;
  private bladeK = 0;
  private aimK = 0;
  private sprintK = 0;
  private kneelK = 0;
  /** 0..1 girando sobre sí mismo sin desplazarse (pasos cortos en el sitio). */
  private turnK = 0;
  private lastYaw = 0;
  /** 0..1 cuánto manda la IK sobre el brazo izquierdo (mano de apoyo en el arma). */
  private gripK = 0;
  private readonly armIk: ArmReach = { elbow: 0, hy: 0, hz: 0 };
  // Brazo izquierdo suavizado SIN la IK (la IK se mezcla encima cada frame).
  private lsxS = 0;
  private lszS = 0;
  private lelS = 0;
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
    this.crouchK = damp(this.crouchK, crouching ? 1 : 0, 12, dt);
    this.aimK = damp(this.aimK, knife ? 0 : p.aim, 18, dt);
    this.sprintK = damp(this.sprintK, onFeet && p.grounded && p.speed > SPRINT_SPEED ? 1 : 0, 9, dt);
    this.kneelK = damp(this.kneelK, p.kneel, 9, dt);
    this.bladeK = damp(this.bladeK, long && onFeet ? 1 : 0, 8, dt);
    const ck = this.crouchK;
    const ak = this.aimK;
    const sk = this.sprintK;
    const kk = this.kneelK;
    // Al esprintar el arma larga va cruzada y el cuerpo de frente.
    const bk = this.bladeK * (1 - sk);
    // Giro en el sitio: se mide cuánto rota la raíz por segundo.
    let dYaw = this.root.rotation.y - this.lastYaw;
    this.lastYaw = this.root.rotation.y;
    dYaw -= Math.round(dYaw / (Math.PI * 2)) * Math.PI * 2;
    const turnRate = dt > 1e-5 ? Math.abs(dYaw) / dt : 0;

    // ------------------------------------------------------------- marcha
    const moving = p.grounded && p.speed > 0.25 && onFeet;
    const speedN = clamp(p.speed / 7, 0, 1);
    this.turnK = damp(this.turnK, !moving && onFeet && p.grounded && st !== 'locked' ? clamp((turnRate - 0.9) / 2.2, 0, 1) : 0, 10, dt);
    const tk = this.turnK;
    if (moving) this.phase += Math.PI * cadence(p.speed) * dt;
    else if (tk > 0.02) this.phase += Math.PI * 2.4 * tk * dt;
    const ph = this.phase;
    const amp = moving ? clamp(p.speed / 2.2, 0.3, 1) : 0;
    // El esprint alarga la zancada y sube más las rodillas; girando en el sitio, pasitos sin avance.
    const half = amp * lerp(0.2, 0.36, speedN) * (1 - 0.35 * ck) * (1 + 0.28 * sk);
    const liftH = amp * lerp(0.06, 0.16, speedN) * (1 - 0.4 * ck) * (1 + 0.6 * sk) + 0.05 * tk;
    const cf = Math.cos(p.moveAngle);
    const cr = -Math.sin(p.moveAngle);
    const sL = footStep(ph, half, liftH, this.stepL);
    const sR = footStep(ph + Math.PI, half, liftH, this.stepR);
    const lead = Math.cos(ph) * amp;

    // Postura de combate: un pie adelantado al apuntar o agacharse (menos al caminar).
    const stance = (0.035 + 0.09 * ak + 0.13 * ck) * (1 - amp * 0.75);
    let hipY = lerp(HIP_STAND - 0.02 * ak, HIP_CROUCH, ck) - 0.03 * amp * Math.abs(Math.cos(ph));
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
        // Al hombro: codo abajo y abierto, el antebrazo sube hacia la empuñadura (la muñeca nivela el arma).
        aRsx = 0.45 + 0.4 * p.aimPitch;
        aRel = 2.15 + 0.6 * p.aimPitch;
        // Apuntando, el codo derecho se abre: la culata queda en el hueco del hombro.
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
        // La muñeca compensa lo que el antebrazo sube: el arma queda en la línea de mira.
        wrist -= ak * hold * (aRsx + aRel - aimW);
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
    // Golpe cuerpo a cuerpo: barrido cruzado con giro de torso.
    if (p.melee > 0) {
      rsx = lerp(rsx, 1.45 - torsoX, p.melee);
      rel = lerp(rel, 0.4, p.melee);
      rsz = lerp(rsz, -0.75, p.melee);
      torsoY += 0.45 * p.melee;
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
    if (!moving && onFeet) torsoX += Math.sin(this.time * 1.7) * 0.012;
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
    this.torso.rotation.y = s(this.torso.rotation.y, torsoY - hipsYaw);
    this.torso.rotation.z = s(this.torso.rotation.z, torsoZ);
    this.head.rotation.x = s(this.head.rotation.x, clamp(headX - torsoX * headLevel, -0.9, 0.9));
    // La cabeza compensa el giro del torso y sigue mirando al frente.
    this.head.rotation.y = s(this.head.rotation.y, clamp(-torsoY * headLevel, -0.8, 0.8));
    this.lsxS = s(this.lsxS, lsx);
    this.lszS = s(this.lszS, lsz);
    this.lelS = s(this.lelS, lel);
    this.armL.rotation.set(this.lsxS, 0, this.lszS);
    this.foreL.rotation.x = this.lelS;
    this.armR.rotation.x = s(this.armR.rotation.x, rsx);
    this.armR.rotation.z = s(this.armR.rotation.z, rsz);
    this.foreR.rotation.x = s(this.foreR.rotation.x, rel);
    this.weaponMount.rotation.x = s(this.weaponMount.rotation.x, -HALF_PI + wrist);
    // Mano de apoyo: con el brazo derecho ya colocado, la izquierda va por IK al arma.
    const gripAt = GRIP[model];
    const free = st === 'roll' || st === 'dead' || p.takedown >= 0 ? 0 : (1 - p.swap) * (1 - p.melee) * (1 - plantL) * (1 - kk);
    this.armR.rotation.y = s(this.armR.rotation.y, rsy * free);
    this.gripK = damp(this.gripK, gripAt ? grip * free : 0, 14, dt);
    if (gripAt && this.gripK > 0.01) {
      this.torso.updateWorldMatrix(true, true);
      _grip.set(gripAt[0], gripAt[1], gripAt[2]);
      this.torso.worldToLocal(this.weaponMount.localToWorld(_grip)).sub(this.armL.position);
      const ik = solveArm(_grip.length(), -ELBOW_Y, -HAND_Y, this.armIk);
      // El hombro gira lo justo para llevar la mano (en reposo, en el plano YZ) hasta el agarre.
      _ikQ.setFromUnitVectors(_hand.set(0, ik.hy, ik.hz).normalize(), _grip.normalize());
      this.armL.quaternion.slerp(_ikQ, this.gripK);
      this.foreL.rotation.x = lerp(this.lelS, ik.elbow, this.gripK);
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
