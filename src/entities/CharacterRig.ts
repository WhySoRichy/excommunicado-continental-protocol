import {
  Bone,
  BoxGeometry,
  type BufferGeometry,
  Color,
  CylinderGeometry,
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
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { clamp, damp, lerp } from '../core/math';
import { addRim, type RimUniforms } from '../render/materials';
import type { MoveState, Posture } from './PlayerController';
import { type ArmReach, bell, cadence, footPitch, solveArm, type FootStep, footStep, type LegAngles, smooth, solveLeg } from './rigMath';

/** Colores del personaje (low-poly con colores por vértice: 1 material por tipo). */
export interface RigColors {
  jacket: number;
  shirt: number;
  tie: number;
  pants: number;
  shoes: number;
  skin: number;
  hair: number;
  accent: number;
}

export type HairStyle = 'long' | 'short' | 'bald' | 'helmet' | 'cap';
export type WeaponModel = 'pistol' | 'rifle' | 'smg' | 'shotgun' | 'knife' | 'none';

export interface RigOptions {
  colors: RigColors;
  rimColor: number;
  rimStrength: number;
  hair: HairStyle;
  /** Corpulencia (1 = normal, 1.25 = blindado). */
  bulk?: number;
  /** Chaleco/placas (blindado, escolta). */
  vest?: boolean;
  /** Barba cerrada (la mandíbula va del color del pelo). */
  beard?: boolean;
  weapon: WeaponModel;
  /** Material propio (no cacheado): permite efectos por instancia (destello de impacto). */
  uniqueMaterial?: boolean;
}

export interface RigPose {
  /** Velocidad horizontal REAL (m/s). */
  speed: number;
  /** Dirección local del movimiento respecto a la cara (rad, 0 = adelante). */
  moveAngle: number;
  state: MoveState;
  posture: Posture;
  grounded: boolean;
  /** 0..1 apuntando. */
  aim: number;
  /** Pitch de la mirada (rad, + arriba). */
  aimPitch: number;
  /** Tiempo en el estado actual (s). */
  stateTime: number;
  /** Fase de recarga 0..1 (−1 = no recarga). */
  reload: number;
  /** Retroceso visual 0..1 (decae). */
  recoil: number;
  /** Golpe/forcejeo de melee 0..1. */
  melee: number;
  /** Cambio de arma 0..1 (0 = sin cambio; sube y baja durante el gesto). */
  swap: number;
  /** 0..1 arrodillado (enemigo aturdido o jefe entre fases). */
  kneel: number;
  /** Sacudida al recibir un impacto, 0..1 (decae). */
  flinch: number;
  /** Lado del que vino el impacto (−1 izquierda, +1 derecha): ladea el torso. */
  flinchSide: number;
  /** Forma de caer al morir: 0 de bruces, 1 de espaldas, 2 desplomado de lado. */
  death: 0 | 1 | 2;
  /** Tiempo dentro del takedown (s) de quien lo ejecuta; −1 si no hay. */
  takedown: number;
  /** Progreso del vault 0..1 (−1 = sin dato: pose intermedia). */
  vault: number;
}

export function idlePose(): RigPose {
  return { speed: 0, moveAngle: 0, state: 'ground', posture: 'stand', grounded: true, aim: 0, aimPitch: 0, stateTime: 0, reload: -1, recoil: 0, melee: 0, swap: 0, kneel: 0, flinch: 0, flinchSide: 0, death: 0, takedown: -1, vault: -1 };
}

const tmpColor = new Color();
const _rootInv = new Matrix4();
const _local = new Matrix4();
const _grip = new Vector3();
const _hand = new Vector3();
const _ikQ = new Quaternion();
/** Dónde agarra la mano izquierda cada arma, en el espacio del arma (cañón a −Z, arriba +Y). */
const GRIP: Record<WeaponModel, readonly [number, number, number] | null> = {
  pistol: [-0.045, -0.035, -0.005],
  rifle: [0, -0.04, -0.4],
  smg: [0, -0.045, -0.26],
  shotgun: [0, -0.02, -0.44],
  knife: null,
  none: null,
};
/** Esfera de recorte generosa (cubre volteretas, caídas y brazos extendidos). */
const CULL_CENTER = new Vector3(0, 0.9, 0);
const CULL_RADIUS = 1.6;

// --- Medidas del esqueleto (m) ---
/** Altura del centro de masa (hueso `spin`) sobre los pies. */
const SPIN_Y = 0.9;
/** Altura de la articulación de la cadera de pie (piernas casi estiradas). */
const HIP_STAND = 0.935;
const HIP_CROUCH = 0.58;
const HIP_SLIDE = 0.3;
const HIP_KNEEL = 0.5;
const SHOULDER_Y = 0.56;
const NECK_Y = 0.7;
const ELBOW_Y = -0.32;
const HAND_Y = -0.315;
/** Tobillo respecto a la rodilla, y distancia del tobillo a la suela (suman la espinilla de la IK). */
const ANKLE_Y = -0.405;
const FOOT_DROP = 0.07;
/** Velocidad a partir de la cual el personaje esprinta (braceo en vez de arma en guardia). */
const SPRINT_SPEED = 5.6;
/** Rigidez del suavizado de articulaciones (1/s). */
const JOINT_K = 16;
const HALF_PI = Math.PI / 2;

/** Pinta toda la geometría de un color (atributo por vértice). */
function paint(g: BufferGeometry, color: number): BufferGeometry {
  tmpColor.set(color);
  const n = g.getAttribute('position').count;
  const cols = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    cols[i * 3] = tmpColor.r;
    cols[i * 3 + 1] = tmpColor.g;
    cols[i * 3 + 2] = tmpColor.b;
  }
  g.setAttribute('color', new Float32BufferAttribute(cols, 3));
  return g;
}

/** Caja con color por vértice, desplazada. `rz` la inclina antes de colocarla. */
function cbox(w: number, h: number, d: number, color: number, x = 0, y = 0, z = 0, rz = 0): BufferGeometry {
  const g = new BoxGeometry(w, h, d);
  if (rz !== 0) g.rotateZ(rz);
  g.translate(x, y, z);
  return paint(g, color);
}

/** Tronco de cono elíptico (miembros y torso): `taper` es el radio inferior respecto al superior. */
function ccyl(rx: number, rz: number, h: number, color: number, x = 0, y = 0, z = 0, taper = 1, seg = 8): BufferGeometry {
  const g = new CylinderGeometry(1, taper, h, seg);
  g.scale(rx, 1, rz);
  g.translate(x, y, z);
  return paint(g, color);
}

/**
 * Prisma: caja cuya cara superior e inferior tienen medidas distintas. Es la pieza base del
 * diseño facetado (torso en V, mandíbula, miembros que se afinan).
 */
function cprism(wTop: number, dTop: number, wBot: number, dBot: number, h: number, color: number, x = 0, y = 0, z = 0): BufferGeometry {
  const g = new BoxGeometry(1, h, 1);
  const pos = g.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    const top = pos.getY(i) > 0;
    pos.setX(i, pos.getX(i) * (top ? wTop : wBot));
    pos.setZ(i, pos.getZ(i) * (top ? dTop : dBot));
  }
  g.computeVertexNormals();
  g.translate(x, y, z);
  return paint(g, color);
}

/** Color de contraste para ribetes: aclara los tonos muy oscuros y oscurece el resto. */
function trim(color: number): number {
  tmpColor.set(color);
  const lum = 0.2126 * tmpColor.r + 0.7152 * tmpColor.g + 0.0722 * tmpColor.b;
  return lum < 0.05 ? tmpColor.multiplyScalar(1.9).addScalar(0.012).getHex() : tmpColor.multiplyScalar(0.68).getHex();
}

/** Mismo color, más oscuro o más claro. */
function shade(color: number, k: number): number {
  return tmpColor.set(color).multiplyScalar(k).getHex();
}

function merge(parts: BufferGeometry[]): BufferGeometry {
  const g = mergeGeometries(parts, false);
  if (!g) throw new Error('CharacterRig: no se pudo fusionar la geometría');
  for (const p of parts) p.dispose();
  g.computeBoundingSphere();
  return g;
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
  private readonly pieces: Array<{ bone: Bone; geo: BufferGeometry }> = [];
  private skeleton: Skeleton | null = null;
  readonly weaponMount = new Group();
  private weaponMesh: Mesh | null = null;
  private weaponModel: WeaponModel = 'none';
  private readonly meshes: Array<Mesh | SkinnedMesh> = [];
  private phase = 0;
  private time = 0;
  private crouchK = 0;
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
    this.rim = rim;
    const c = o.colors;
    const b = o.bulk ?? 1;

    // --- Torso en V: pelvis, faldón, pecho, hombros rectos, cuello de camisa, solapas y corbata ---
    const edge = trim(c.jacket);
    const zf = -0.118 * b; // plano frontal del pecho
    const torsoParts: BufferGeometry[] = [
      cprism(0.33 * b, 0.19 * b, 0.3 * b, 0.17 * b, 0.16, c.pants, 0, 0, 0),
      cprism(0.335 * b, 0.2 * b, 0.375 * b, 0.225 * b, 0.2, c.jacket, 0, 0.06, 0), // faldón
      cprism(0.48 * b, 0.235 * b, 0.335 * b, 0.2 * b, 0.42, c.jacket, 0, 0.37, 0), // pecho
      cprism(0.4 * b, 0.19 * b, 0.5 * b, 0.245 * b, 0.07, c.jacket, 0, 0.615, 0), // hombros
      cprism(0.17, 0.15, 0.21, 0.18, 0.045, edge, 0, 0.652, 0.005), // cuello de la chaqueta
      cprism(0.12, 0.125, 0.14, 0.14, 0.04, c.shirt, 0, 0.68, -0.002), // cuello de la camisa
      ccyl(0.047, 0.05, 0.1, c.skin, 0, 0.7, 0, 1, 6),
      cprism(0.15, 0.02, 0.03, 0.02, 0.27, c.shirt, 0, 0.485, zf), // pechera en V
      cprism(0.036, 0.02, 0.052, 0.02, 0.22, c.tie, 0, 0.47, zf - 0.008),
      cbox(0.046, 0.034, 0.024, c.tie, 0, 0.595, zf - 0.008), // nudo
      cbox(0.045, 0.3, 0.02, edge, -0.07, 0.49, zf - 0.004, 0.27), // solapas
      cbox(0.045, 0.3, 0.02, edge, 0.07, 0.49, zf - 0.004, -0.27),
      cbox(0.055, 0.024, 0.02, c.accent, -0.15 * b, 0.5, zf + 0.002), // pañuelo de bolsillo
      cbox(0.02, 0.02, 0.012, edge, 0, 0.3, -0.108 * b), // botón
      cbox(0.012, 0.17, 0.012, edge, 0, 0.055, 0.108 * b), // abertura trasera
      cbox(0.008, 0.4, 0.01, edge, 0, 0.37, 0.108 * b), // costura de la espalda
    ];
    if (o.vest) {
      const plate = shade(c.accent, 0.62);
      torsoParts.push(
        cprism(0.45 * b, 0.3 * b, 0.37 * b, 0.27 * b, 0.33, c.accent, 0, 0.385, 0), // portaplacas
        cbox(0.07, 0.1, 0.03, plate, -0.09, 0.3, -0.15 * b), // portacargadores
        cbox(0.07, 0.1, 0.03, plate, 0, 0.3, -0.15 * b),
        cbox(0.07, 0.1, 0.03, plate, 0.09, 0.3, -0.15 * b),
        cbox(0.06, 0.1, 0.27 * b, plate, -0.14 * b, 0.6, 0), // tirantes
        cbox(0.06, 0.1, 0.27 * b, plate, 0.14 * b, 0.6, 0),
      );
    }
    this.addMesh(this.torso, merge(torsoParts));

    // --- Cabeza facetada (hueso propio): cráneo, pómulos, mandíbula marcada y rasgos mínimos ---
    const hy = -NECK_Y;
    const dark = 0x0c0d10;
    const jawColor = o.beard ? shade(c.hair, 1.1) : c.skin;
    const headParts: BufferGeometry[] = [
      cprism(0.15, 0.17, 0.186, 0.2, 0.12, c.skin, 0, 0.875 + hy, 0), // cráneo
      cprism(0.186, 0.2, 0.172, 0.186, 0.07, c.skin, 0, 0.78 + hy, 0), // pómulos
      cprism(0.172, 0.186, 0.105, 0.12, 0.08, jawColor, 0, 0.705 + hy, -0.008), // mandíbula
      cbox(0.062, 0.016, 0.024, c.hair, -0.046, 0.824 + hy, -0.092, -0.16), // cejas fruncidas
      cbox(0.062, 0.016, 0.024, c.hair, 0.046, 0.824 + hy, -0.092, 0.16),
      cbox(0.036, 0.013, 0.012, dark, -0.046, 0.803 + hy, -0.096), // ojos
      cbox(0.036, 0.013, 0.012, dark, 0.046, 0.803 + hy, -0.096),
      cprism(0.026, 0.02, 0.042, 0.046, 0.062, shade(c.skin, 0.9), 0, 0.776 + hy, -0.106), // nariz
      cbox(0.02, 0.05, 0.035, shade(c.skin, 0.9), -0.097, 0.79 + hy, 0.005), // orejas
      cbox(0.02, 0.05, 0.035, shade(c.skin, 0.9), 0.097, 0.79 + hy, 0.005),
    ];
    if (o.beard) headParts.push(cbox(0.06, 0.012, 0.012, shade(c.skin, 0.6), 0, 0.726 + hy, -0.098), cbox(0.09, 0.02, 0.014, jawColor, 0, 0.745 + hy, -0.096));
    else headParts.push(cbox(0.056, 0.01, 0.012, shade(c.skin, 0.55), 0, 0.722 + hy, -0.092));
    switch (o.hair) {
      case 'long':
        // Melena peinada hacia atrás hasta el cuello, con dos mechones que enmarcan la cara.
        headParts.push(
          cprism(0.165, 0.19, 0.2, 0.215, 0.07, c.hair, 0, 0.9 + hy, 0.006),
          cprism(0.1, 0.13, 0.165, 0.19, 0.025, c.hair, 0, 0.947 + hy, 0.012), // coronilla
          cprism(0.2, 0.1, 0.13, 0.04, 0.26, c.hair, 0, 0.77 + hy, 0.085),
          cbox(0.022, 0.19, 0.1, c.hair, -0.1, 0.8 + hy, 0.05),
          cbox(0.022, 0.19, 0.1, c.hair, 0.1, 0.8 + hy, 0.05),
          cbox(0.02, 0.13, 0.03, c.hair, -0.092, 0.825 + hy, -0.066, 0.1),
          cbox(0.02, 0.13, 0.03, c.hair, 0.092, 0.825 + hy, -0.066, -0.1),
        );
        break;
      case 'short':
        headParts.push(
          cprism(0.16, 0.185, 0.196, 0.212, 0.07, c.hair, 0, 0.905 + hy, 0.004),
          cprism(0.196, 0.06, 0.18, 0.04, 0.12, c.hair, 0, 0.83 + hy, 0.085),
          cbox(0.018, 0.07, 0.11, c.hair, -0.097, 0.845 + hy, 0.03),
          cbox(0.018, 0.07, 0.11, c.hair, 0.097, 0.845 + hy, 0.03),
        );
        break;
      case 'helmet':
        headParts.push(
          cprism(0.18, 0.2, 0.225, 0.245, 0.12, c.accent, 0, 0.895 + hy, 0.004),
          cprism(0.225, 0.13, 0.21, 0.1, 0.09, c.accent, 0, 0.8 + hy, 0.06),
          cbox(0.2, 0.04, 0.024, 0x0e1116, 0, 0.805 + hy, -0.1), // visor
          cbox(0.012, 0.11, 0.014, 0x0e1116, -0.094, 0.755 + hy, -0.03), // barboquejo
          cbox(0.012, 0.11, 0.014, 0x0e1116, 0.094, 0.755 + hy, -0.03),
        );
        break;
      case 'cap':
        headParts.push(
          cprism(0.165, 0.19, 0.202, 0.218, 0.075, c.accent, 0, 0.9 + hy, 0.004),
          cbox(0.17, 0.014, 0.11, shade(c.accent, 0.75), 0, 0.868 + hy, -0.15),
          cprism(0.196, 0.05, 0.18, 0.04, 0.07, c.hair, 0, 0.83 + hy, 0.088),
        );
        break;
      case 'bald':
        break;
    }
    this.head.position.set(0, NECK_Y, 0);
    this.addMesh(this.head, merge(headParts));
    this.torso.add(this.head);

    // --- Brazos: hombrera, brazo y antebrazo que se afinan, puño de camisa y mano con pulgar ---
    const upperGeo = (): BufferGeometry =>
      merge([cprism(0.12 * b, 0.14 * b, 0.13 * b, 0.145 * b, 0.09, c.jacket, 0, 0.005, 0), cprism(0.125 * b, 0.135 * b, 0.098 * b, 0.105 * b, 0.3, c.jacket, 0, -0.185, 0)]);
    const foreGeo = (): BufferGeometry =>
      merge([
        cprism(0.102 * b, 0.108 * b, 0.08 * b, 0.086 * b, 0.26, c.jacket, 0, -0.125, -0.004),
        cprism(0.07, 0.076, 0.066, 0.072, 0.026, c.shirt, 0, -0.264, -0.004),
        cprism(0.046, 0.076, 0.038, 0.086, 0.095, c.skin, 0, HAND_Y - 0.008, -0.01),
        cbox(0.02, 0.045, 0.026, c.skin, 0, HAND_Y + 0.012, -0.062),
      ]);
    this.armL.position.set(-0.285 * b, SHOULDER_Y, 0);
    this.armR.position.set(0.285 * b, SHOULDER_Y, 0);
    this.foreL.position.set(0, ELBOW_Y, 0);
    this.foreR.position.set(0, ELBOW_Y, 0);
    this.addMesh(this.armL, upperGeo());
    this.addMesh(this.armR, upperGeo());
    this.addMesh(this.foreL, foreGeo());
    this.addMesh(this.foreR, foreGeo());
    this.armL.add(this.foreL);
    this.armR.add(this.foreR);
    this.torso.add(this.armL, this.armR);
    // El arma va en la mano, con el cañón alineado con el antebrazo.
    this.weaponMount.position.set(0, HAND_Y - 0.01, -0.03);
    this.weaponMount.rotation.x = -HALF_PI;
    this.foreR.add(this.weaponMount);

    // --- Piernas: muslo y espinilla que se afinan; el zapato va en su propio hueso (tobillo) ---
    const thighGeo = (): BufferGeometry => cprism(0.168 * b, 0.185 * b, 0.128 * b, 0.14 * b, 0.48, c.pants, 0, -0.225, 0);
    const shinGeo = (): BufferGeometry => cprism(0.128 * b, 0.14 * b, 0.104 * b, 0.114 * b, 0.42, c.pants, 0, -0.2, 0);
    const footGeo = (): BufferGeometry =>
      merge([
        cbox(0.1 * b, 0.07, 0.11, c.shoes, 0, -FOOT_DROP + 0.035, 0.005), // talón
        cprism(0.094 * b, 0.13, 0.1 * b, 0.17, 0.05, c.shoes, 0, -FOOT_DROP + 0.036, -0.125), // empeine
        cprism(0.07 * b, 0.05, 0.09 * b, 0.07, 0.03, c.shoes, 0, -FOOT_DROP + 0.026, -0.235), // puntera
        cbox(0.108 * b, 0.012, 0.325, 0x08080a, 0, -FOOT_DROP + 0.006, -0.1), // suela
      ]);
    this.thighL.position.set(-0.1 * b, 0, 0);
    this.thighR.position.set(0.1 * b, 0, 0);
    this.shinL.position.set(0, -0.46, 0);
    this.shinR.position.set(0, -0.46, 0);
    this.footL.position.set(0, ANKLE_Y, 0);
    this.footR.position.set(0, ANKLE_Y, 0);
    this.addMesh(this.thighL, thighGeo());
    this.addMesh(this.thighR, thighGeo());
    this.addMesh(this.shinL, shinGeo());
    this.addMesh(this.shinR, shinGeo());
    this.addMesh(this.footL, footGeo());
    this.addMesh(this.footR, footGeo());
    this.shinL.add(this.footL);
    this.shinR.add(this.footR);
    this.thighL.add(this.shinL);
    this.thighR.add(this.shinR);

    this.hips.position.set(0, 0.05, 0);
    this.hips.add(this.torso, this.thighL, this.thighR);
    this.spin.position.set(0, SPIN_Y, 0);
    this.spin.add(this.hips);
    this.root.add(this.spin);
    this.buildSkin();
    this.setWeapon(o.weapon, c.accent);
  }

  private addMesh(bone: Bone, geo: BufferGeometry): void {
    this.pieces.push({ bone, geo });
  }

  /** Fusiona las piezas en una SkinnedMesh: cada vértice va a su hueso con peso 1. */
  private buildSkin(): void {
    const bones = [this.spin, this.hips, this.torso, this.head, this.armL, this.armR, this.foreL, this.foreR, this.thighL, this.thighR, this.shinL, this.shinR, this.footL, this.footR];
    this.root.updateMatrixWorld(true);
    _rootInv.copy(this.root.matrixWorld).invert();
    const geos: BufferGeometry[] = [];
    for (const { bone, geo } of this.pieces) {
      // Pose de reposo: la pieza pasa del espacio de su hueso al de la raíz.
      geo.applyMatrix4(_local.multiplyMatrices(_rootInv, bone.matrixWorld));
      const n = geo.getAttribute('position').count;
      const idx = bones.indexOf(bone);
      const si = new Uint16Array(n * 4);
      const sw = new Float32Array(n * 4);
      for (let i = 0; i < n; i++) {
        si[i * 4] = idx;
        sw[i * 4] = 1;
      }
      geo.setAttribute('skinIndex', new Uint16BufferAttribute(si, 4));
      geo.setAttribute('skinWeight', new Float32BufferAttribute(sw, 4));
      geos.push(geo);
    }
    this.pieces.length = 0;
    const mesh = new SkinnedMesh(merge(geos), this.material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.boundingSphere = new Sphere(CULL_CENTER.clone(), CULL_RADIUS);
    this.root.add(mesh);
    this.root.updateMatrixWorld(true);
    this.skeleton = new Skeleton(bones);
    mesh.bind(this.skeleton);
    this.meshes.push(mesh);
  }

  /** Cambia el arma visible (geometría propia por modelo). El cañón apunta a −Z del soporte. */
  setWeapon(model: WeaponModel, accent = 0x888888): void {
    if (this.weaponMesh) {
      this.weaponMount.remove(this.weaponMesh);
      this.weaponMesh.geometry.dispose();
      this.weaponMesh = null;
    }
    this.weaponModel = model;
    const dark = 0x1d1f23;
    let geo: BufferGeometry | null = null;
    switch (model) {
      case 'pistol':
        geo = merge([cbox(0.04, 0.06, 0.2, dark, 0, 0.03, -0.08), cbox(0.035, 0.1, 0.05, dark, 0, -0.03, -0.01)]);
        break;
      case 'rifle':
        geo = merge([cbox(0.05, 0.08, 0.72, dark, 0, 0.03, -0.2), cbox(0.04, 0.14, 0.05, dark, 0, -0.06, -0.02), cbox(0.05, 0.04, 0.2, accent, 0, 0.09, -0.2), cbox(0.045, 0.1, 0.16, dark, 0, 0.01, 0.2)]);
        break;
      case 'smg':
        geo = merge([cbox(0.05, 0.08, 0.42, dark, 0, 0.03, -0.13), cbox(0.04, 0.16, 0.05, dark, 0, -0.07, -0.02), cbox(0.04, 0.06, 0.12, dark, 0, 0.02, 0.12)]);
        break;
      case 'shotgun':
        geo = merge([cbox(0.06, 0.08, 0.8, 0x3a2a1c, 0, 0.03, -0.25), cbox(0.05, 0.05, 0.6, dark, 0, 0.08, -0.32), cbox(0.05, 0.1, 0.18, 0x3a2a1c, 0, 0.0, 0.2)]);
        break;
      case 'knife':
        geo = merge([cbox(0.02, 0.03, 0.18, 0xc8ccd2, 0, 0, -0.13), cbox(0.03, 0.04, 0.08, dark, 0, 0, -0.01)]);
        break;
      case 'none':
        break;
    }
    if (geo) {
      this.weaponMesh = new Mesh(geo, this.material);
      this.weaponMesh.castShadow = true;
      this.weaponMount.add(this.weaponMesh);
    }
  }

  setShadows(on: boolean): void {
    for (const m of this.meshes) m.castShadow = on;
    if (this.weaponMesh) this.weaponMesh.castShadow = on;
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
    const long = model === 'rifle' || model === 'smg' || model === 'shotgun';
    const knife = model === 'knife';

    const onFeet = st === 'ground' || st === 'cover' || st === 'locked';
    const crouching = p.posture === 'crouch' && onFeet;
    this.crouchK = damp(this.crouchK, crouching ? 1 : 0, 12, dt);
    this.aimK = damp(this.aimK, knife ? 0 : p.aim, 18, dt);
    this.sprintK = damp(this.sprintK, onFeet && p.grounded && p.speed > SPRINT_SPEED ? 1 : 0, 9, dt);
    this.kneelK = damp(this.kneelK, p.kneel, 9, dt);
    const ck = this.crouchK;
    const ak = this.aimK;
    const sk = this.sprintK;
    const kk = this.kneelK;
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

    let torsoX = lerp(-0.04 - 0.08 * speedN - 0.24 * sk, -0.42, ck);
    let torsoZ = -cr * 0.07 * amp;
    let torsoY = lead * cf * 0.16 * (armed ? 0.35 + 0.65 * sk : 1);
    let hipsYaw = -lead * cf * 0.12;
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

    if (armed && armsFree < 1) {
      // Guardia (ángulos de mundo; se resta la inclinación del torso).
      let gRsx: number, gRel: number, gRsz: number, gLsx: number, gLel: number, gLsz: number;
      let aRsx: number, aRel: number, aRsz: number, aLsx: number, aLel: number, aLsz: number;
      const aimW = HALF_PI + p.aimPitch;
      if (long) {
        gRsx = 0.3;
        gRel = 0.9;
        gRsz = -0.2;
        gLsx = 0.78;
        gLel = 0.42;
        gLsz = 0.52;
        aRsx = 0.95 + 0.5 * p.aimPitch;
        aRel = 0.62 + 0.5 * p.aimPitch;
        aRsz = -0.2;
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
        wrist = -0.35 * up;
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

  dispose(): void {
    for (const m of this.meshes) m.geometry.dispose();
    this.skeleton?.dispose();
    this.weaponMesh?.geometry.dispose();
    this.root.removeFromParent();
  }
}

/** Paleta del Huésped (jugador): traje negro, camisa y corbata negras, pañuelo dorado, melena y barba oscuras. */
export const PLAYER_COLORS: RigColors = {
  jacket: 0x1b1d23,
  shirt: 0x0c0d10,
  tie: 0x060608,
  pants: 0x17191e,
  shoes: 0x09090b,
  skin: 0xc99b7e,
  hair: 0x1f1712,
  accent: 0xc9a227,
};
