import { BoxGeometry, type BufferGeometry, Color, Float32BufferAttribute, Group, Mesh, MeshStandardMaterial } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { clamp, damp, lerp } from '../core/math';
import { addRim, type RimUniforms } from '../render/materials';
import type { MoveState, Posture } from './PlayerController';

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
  weapon: WeaponModel;
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
}

export function idlePose(): RigPose {
  return { speed: 0, moveAngle: 0, state: 'ground', posture: 'stand', grounded: true, aim: 0, aimPitch: 0, stateTime: 0, reload: -1, recoil: 0, melee: 0 };
}

const tmpColor = new Color();

/** Caja con color por vértice, desplazada. */
function cbox(w: number, h: number, d: number, color: number, x = 0, y = 0, z = 0): BufferGeometry {
  const g = new BoxGeometry(w, h, d);
  g.translate(x, y, z);
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

function merge(parts: BufferGeometry[]): BufferGeometry {
  const g = mergeGeometries(parts, false);
  if (!g) throw new Error('CharacterRig: no se pudo fusionar la geometría');
  for (const p of parts) p.dispose();
  g.computeBoundingSphere();
  return g;
}

const materialCache = new Map<string, { mat: MeshStandardMaterial; rim: RimUniforms }>();

/** Material compartido por tipo de personaje (el rim es uniform por material). */
function rigMaterial(key: string, rimColor: number, rimStrength: number): { mat: MeshStandardMaterial; rim: RimUniforms } {
  const hit = materialCache.get(key);
  if (hit) return hit;
  const mat = new MeshStandardMaterial({ vertexColors: true, roughness: 0.72, metalness: 0.05 });
  mat.name = `rig:${key}`;
  const rim = addRim(mat, rimColor, rimStrength, 2.2);
  const entry = { mat, rim };
  materialCache.set(key, entry);
  return entry;
}

/**
 * Humanoide low-poly procedural (8 meshes) con animación procedural.
 * Jerarquía: root(pies, yaw) → spin(centro de masa: voltereta/caída) → hips → torso/piernas.
 */
export class CharacterRig {
  readonly root = new Group();
  readonly material: MeshStandardMaterial;
  readonly rim: RimUniforms;
  private readonly spin = new Group();
  private readonly hips = new Group();
  private readonly torso = new Group();
  private readonly armL = new Group();
  private readonly armR = new Group();
  private readonly thighL = new Group();
  private readonly thighR = new Group();
  private readonly shinL = new Group();
  private readonly shinR = new Group();
  readonly weaponMount = new Group();
  private weaponMesh: Mesh | null = null;
  private readonly meshes: Mesh[] = [];
  private phase = 0;
  private crouchK = 0;
  private aimK = 0;
  private readonly bulk: number;
  private opacity = 1;

  constructor(key: string, o: RigOptions) {
    const { mat, rim } = rigMaterial(key, o.rimColor, o.rimStrength);
    this.material = mat;
    this.rim = rim;
    const c = o.colors;
    const b = (this.bulk = o.bulk ?? 1);

    // --- Torso + cabeza + pelo (un solo mesh) ---
    const torsoParts: BufferGeometry[] = [
      cbox(0.36 * b, 0.2, 0.22 * b, c.pants, 0, 0.02, 0), // pelvis
      cbox(0.44 * b, 0.52, 0.26 * b, c.jacket, 0, 0.36, 0), // chaqueta
      cbox(0.13, 0.36, 0.02, c.shirt, 0, 0.42, -0.135 * b), // camisa (V)
      cbox(0.045, 0.3, 0.025, c.tie, 0, 0.42, -0.142 * b), // corbata
      cbox(0.1, 0.08, 0.1, c.skin, 0, 0.66, 0), // cuello
      cbox(0.2, 0.24, 0.22, c.skin, 0, 0.82, -0.01), // cabeza
      cbox(0.06, 0.025, 0.02, c.accent, 0, 0.84, -0.12), // ojos (franja)
    ];
    if (o.vest) torsoParts.push(cbox(0.48 * b, 0.4, 0.3 * b, c.accent, 0, 0.36, 0.0));
    switch (o.hair) {
      case 'long':
        torsoParts.push(cbox(0.23, 0.07, 0.25, c.hair, 0, 0.955, 0.0), cbox(0.235, 0.34, 0.09, c.hair, 0, 0.78, 0.09), cbox(0.03, 0.26, 0.2, c.hair, 0.115, 0.82, 0.0), cbox(0.03, 0.26, 0.2, c.hair, -0.115, 0.82, 0.0));
        break;
      case 'short':
        torsoParts.push(cbox(0.215, 0.06, 0.235, c.hair, 0, 0.95, 0.0), cbox(0.215, 0.12, 0.05, c.hair, 0, 0.88, 0.1));
        break;
      case 'helmet':
        torsoParts.push(cbox(0.25, 0.14, 0.27, c.accent, 0, 0.93, 0.0), cbox(0.22, 0.05, 0.03, 0x101418, 0, 0.84, -0.125));
        break;
      case 'cap':
        torsoParts.push(cbox(0.22, 0.07, 0.24, c.accent, 0, 0.955, 0.0), cbox(0.2, 0.02, 0.1, c.accent, 0, 0.925, -0.15));
        break;
      case 'bald':
        break;
    }
    this.addMesh(this.torso, merge(torsoParts));

    // --- Brazos (pivote en el hombro, apuntan hacia −Y) ---
    const armGeo = (): BufferGeometry =>
      merge([cbox(0.12 * b, 0.32, 0.13 * b, c.jacket, 0, -0.16, 0), cbox(0.11 * b, 0.28, 0.12 * b, c.jacket, 0, -0.45, -0.02), cbox(0.08, 0.09, 0.09, c.skin, 0, -0.63, -0.03)]);
    this.armL.position.set(-0.285 * b, 0.56, 0);
    this.armR.position.set(0.285 * b, 0.56, 0);
    this.addMesh(this.armL, armGeo());
    this.addMesh(this.armR, armGeo());
    this.torso.add(this.armL, this.armR);
    this.weaponMount.position.set(0, -0.63, -0.04);
    this.armR.add(this.weaponMount);

    // --- Piernas (muslo con pivote en cadera, espinilla con pivote en rodilla) ---
    const thighGeo = (): BufferGeometry => cbox(0.16 * b, 0.46, 0.17 * b, c.pants, 0, -0.23, 0);
    const shinGeo = (): BufferGeometry => merge([cbox(0.14 * b, 0.42, 0.15 * b, c.pants, 0, -0.21, 0), cbox(0.15 * b, 0.07, 0.27, c.shoes, 0, -0.44, -0.05)]);
    this.thighL.position.set(-0.1 * b, 0, 0);
    this.thighR.position.set(0.1 * b, 0, 0);
    this.shinL.position.set(0, -0.46, 0);
    this.shinR.position.set(0, -0.46, 0);
    this.addMesh(this.thighL, thighGeo());
    this.addMesh(this.thighR, thighGeo());
    this.addMesh(this.shinL, shinGeo());
    this.addMesh(this.shinR, shinGeo());
    this.thighL.add(this.shinL);
    this.thighR.add(this.shinR);

    this.hips.position.set(0, 0.05, 0);
    this.hips.add(this.torso, this.thighL, this.thighR);
    this.spin.position.set(0, 0.9, 0);
    this.spin.add(this.hips);
    this.root.add(this.spin);
    this.setWeapon(o.weapon, c.accent);
  }

  private addMesh(parent: Group, geo: BufferGeometry): Mesh {
    const m = new Mesh(geo, this.material);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    this.meshes.push(m);
    return m;
  }

  /** Cambia el arma visible (geometría propia por modelo). */
  setWeapon(model: WeaponModel, accent = 0x888888): void {
    if (this.weaponMesh) {
      this.weaponMount.remove(this.weaponMesh);
      this.weaponMesh.geometry.dispose();
      this.weaponMesh = null;
    }
    const dark = 0x1d1f23;
    let geo: BufferGeometry | null = null;
    switch (model) {
      case 'pistol':
        geo = merge([cbox(0.04, 0.06, 0.2, dark, 0, 0, -0.08), cbox(0.035, 0.1, 0.05, dark, 0, -0.06, -0.01)]);
        break;
      case 'rifle':
        geo = merge([cbox(0.05, 0.08, 0.72, dark, 0, 0.0, -0.22), cbox(0.04, 0.14, 0.05, dark, 0, -0.09, -0.12), cbox(0.05, 0.04, 0.2, accent, 0, 0.06, -0.2)]);
        break;
      case 'smg':
        geo = merge([cbox(0.05, 0.08, 0.42, dark, 0, 0.0, -0.13), cbox(0.04, 0.16, 0.05, dark, 0, -0.1, -0.08)]);
        break;
      case 'shotgun':
        geo = merge([cbox(0.06, 0.08, 0.8, 0x3a2a1c, 0, 0.0, -0.25), cbox(0.05, 0.05, 0.6, dark, 0, 0.05, -0.32)]);
        break;
      case 'knife':
        geo = merge([cbox(0.02, 0.03, 0.18, 0xc8ccd2, 0, 0, -0.1), cbox(0.03, 0.04, 0.08, dark, 0, 0, 0.01)]);
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
    const k = 16;
    const crouchTarget = p.posture === 'crouch' || p.state === 'slide' || p.state === 'roll' ? 1 : 0;
    this.crouchK = damp(this.crouchK, crouchTarget, 14, dt);
    this.aimK = damp(this.aimK, p.aim, 18, dt);
    const ck = this.crouchK;
    const ak = this.aimK;

    // Ciclo de marcha.
    const moving = p.grounded && p.speed > 0.25 && (p.state === 'ground' || p.state === 'cover' || p.state === 'locked');
    const stride = lerp(1.25, 1.6, clamp(p.speed / 7, 0, 1));
    if (moving) this.phase += (p.speed / stride) * Math.PI * dt;
    const amp = moving ? clamp(p.speed / 6.5, 0.25, 1) * (1 - ck * 0.5) : 0;
    const back = Math.cos(p.moveAngle) < -0.3 ? -1 : 1;
    const swing = Math.sin(this.phase) * 0.75 * amp * back;
    const kneeL = Math.max(0, Math.sin(this.phase + Math.PI / 2)) * 1.0 * amp;
    const kneeR = Math.max(0, Math.sin(this.phase - Math.PI / 2)) * 1.0 * amp;

    let thighL = -swing;
    let thighR = swing;
    let shinL = kneeL;
    let shinR = kneeR;
    let hipsY = 0.05 - Math.abs(Math.sin(this.phase)) * 0.035 * amp;
    let torsoX = -0.08 * clamp(p.speed / 7, 0, 1);
    let spinX = 0;
    let spinY = 0.9;

    // Agachado.
    thighL = lerp(thighL, -1.25 + swing * 0.4, ck);
    thighR = lerp(thighR, -1.05 - swing * 0.4, ck);
    shinL = lerp(shinL, 1.95, ck);
    shinR = lerp(shinR, 1.75, ck);
    hipsY = lerp(hipsY, -0.36, ck);
    torsoX = lerp(torsoX, -0.28, ck);

    switch (p.state) {
      case 'air':
        thighL = lerp(thighL, -0.6, 0.8);
        thighR = lerp(thighR, -0.2, 0.8);
        shinL = lerp(shinL, 0.9, 0.8);
        shinR = lerp(shinR, 0.5, 0.8);
        break;
      case 'roll': {
        const t = clamp(p.stateTime / 0.5, 0, 1);
        spinX = -Math.PI * 2 * t;
        spinY = lerp(0.9, 0.5, Math.sin(t * Math.PI));
        thighL = thighR = -1.6;
        shinL = shinR = 2.2;
        torsoX = -0.7;
        break;
      }
      case 'slide':
        torsoX = 0.55;
        thighR = -1.3;
        shinR = 0.15;
        thighL = -0.4;
        shinL = 1.6;
        hipsY = -0.42;
        break;
      case 'vault':
        torsoX = -0.45;
        thighL = -1.4;
        thighR = -0.9;
        shinL = 1.8;
        shinR = 1.2;
        break;
      case 'dead': {
        const t = clamp(p.stateTime / 0.55, 0, 1);
        spinX = (Math.PI / 2) * t * t;
        spinY = lerp(0.9, 0.2, t);
        thighL = -0.2;
        thighR = 0.1;
        shinL = shinR = 0.2;
        break;
      }
      default:
        break;
    }

    // Brazos: balanceo al correr o pose de apuntado.
    let armLX = swing * 0.8;
    let armRX = -swing * 0.8;
    let armLZ = 0.06;
    let armRZ = -0.06;
    let armLY = 0;
    let armRY = 0;
    const aimArm = -Math.PI / 2 - p.aimPitch;
    const ready = p.state === 'ground' || p.state === 'cover' || p.state === 'air' || p.state === 'locked';
    if (ready) {
      // Siempre con el arma algo levantada (lectura clara de "listo para disparar").
      armRX = lerp(lerp(armRX, -0.55, 0.6), aimArm, ak);
      armLX = lerp(armLX, aimArm + 0.15, ak);
      armLY = lerp(0, 0.55, ak);
      armRY = lerp(0, 0.05, ak);
      armLZ = lerp(armLZ, 0.35, ak);
    }
    if (p.reload >= 0) {
      const r = Math.sin(clamp(p.reload, 0, 1) * Math.PI);
      armLX = lerp(armLX, -1.1, r);
      armLZ = lerp(armLZ, 0.6, r);
    }
    if (p.melee > 0) {
      armRX = lerp(armRX, -2.2, p.melee);
      armRZ = lerp(armRZ, -0.5, p.melee);
    }
    armRX -= p.recoil * 0.18;

    // Aplicación suavizada.
    const s = (cur: number, tgt: number): number => damp(cur, tgt, k, dt);
    this.thighL.rotation.x = s(this.thighL.rotation.x, thighL);
    this.thighR.rotation.x = s(this.thighR.rotation.x, thighR);
    this.shinL.rotation.x = s(this.shinL.rotation.x, shinL);
    this.shinR.rotation.x = s(this.shinR.rotation.x, shinR);
    this.hips.position.y = s(this.hips.position.y, hipsY);
    this.torso.rotation.x = s(this.torso.rotation.x, torsoX + (ak > 0.5 ? -p.aimPitch * 0.25 : 0));
    this.armL.rotation.x = s(this.armL.rotation.x, armLX);
    this.armR.rotation.x = s(this.armR.rotation.x, armRX);
    this.armL.rotation.y = s(this.armL.rotation.y, armLY);
    this.armR.rotation.y = s(this.armR.rotation.y, armRY);
    this.armL.rotation.z = s(this.armL.rotation.z, armLZ);
    this.armR.rotation.z = s(this.armR.rotation.z, armRZ);
    // La voltereta y la caída no se suavizan (deben seguir el tiempo exacto).
    if (p.state === 'roll' || p.state === 'dead') {
      this.spin.rotation.x = spinX;
      this.spin.position.y = spinY;
    } else {
      this.spin.rotation.x = s(this.spin.rotation.x, 0);
      this.spin.position.y = s(this.spin.position.y, spinY);
    }
    // Respiración en reposo.
    if (!moving && p.state === 'ground') this.torso.scale.y = 1 + Math.sin(performance.now() * 0.0025) * 0.006 * this.bulk;
  }

  dispose(): void {
    for (const m of this.meshes) m.geometry.dispose();
    this.weaponMesh?.geometry.dispose();
    this.root.removeFromParent();
  }
}

/** Paleta del Huésped (jugador): traje carbón, camisa y corbata negras, pelo largo oscuro. */
export const PLAYER_COLORS: RigColors = {
  jacket: 0x2a2e36,
  shirt: 0x101115,
  tie: 0x07080a,
  pants: 0x24272e,
  shoes: 0x0b0b0d,
  skin: 0xc99b7e,
  hair: 0x2b1f17,
  accent: 0x1a1c20,
};
