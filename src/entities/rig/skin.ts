import { type BufferGeometry, Float32BufferAttribute, Uint16BufferAttribute } from 'three';
import { smooth } from '../rigMath';
import { BALL_Z, BONE, type BoneId, CHEST_H, ELBOW_H, HIP_Y, KNEE_H, NECK_H, SHOULDER_H, WAIST_H, WRIST_H } from './skeleton';

/**
 * A qué huesos va cada vértice y con qué peso. Las articulaciones se reparten entre los huesos vecinos en un tramo: la
 * ropa se dobla sin abrirse y el hombro sube y gira con la clavícula.
 */

/** Pesos de un vértice: hasta tres huesos (el segundo pesa `t`, el tercero `u`, el primero lo que queda). */
export interface Weight {
  a: BoneId;
  b: BoneId;
  t: number;
  c: BoneId;
  u: number;
}

export type SkinFn = (x: number, y: number, z: number, out: Weight) => void;

const set = (o: Weight, a: BoneId, b: BoneId, t: number, c: BoneId = a, u = 0): void => {
  o.a = a;
  o.b = b;
  o.t = t;
  o.c = c;
  o.u = u;
};

/** Todo a un hueso. */
export const rigid =
  (bone: BoneId): SkinFn =>
  (_x, _y, _z, o) =>
    set(o, bone, bone, 0);

/** Tronco: pelvis, cintura, pecho y, arriba, las clavículas y el cuello. */
export const trunk: SkinFn = (x, y, _z, o) => {
  if (y < WAIST_H + 0.07) return set(o, BONE.hips, BONE.spine, smooth(HIP_Y - 0.01, WAIST_H + 0.07, y));
  if (y < CHEST_H + 0.13) return set(o, BONE.spine, BONE.chest, smooth(WAIST_H + 0.07, CHEST_H + 0.1, y));
  const ax = Math.abs(x);
  const shoulder = 0.85 * smooth(0.075, 0.17, ax) * smooth(SHOULDER_H - 0.15, SHOULDER_H - 0.01, y);
  const collar = smooth(NECK_H - 0.02, NECK_H + 0.07, y) * (1 - smooth(0.05, 0.11, ax));
  set(o, BONE.chest, x < 0 ? BONE.clavL : BONE.clavR, shoulder * (1 - collar), BONE.neck, 0.75 * collar);
};

/** Cuello: del pecho a la cabeza. */
export const neck: SkinFn = (_x, y, _z, o) => {
  const low = smooth(NECK_H - 0.03, NECK_H + 0.03, y);
  const high = smooth(NECK_H + 0.06, NECK_H + 0.12, y);
  set(o, BONE.chest, BONE.neck, low * (1 - high), BONE.head, high);
};

/** Manga del lado `side` (−1 izquierda, +1 derecha): el codo se reparte y arriba se funde con la clavícula y el pecho. */
export const sleeve =
  (side: -1 | 1): SkinFn =>
  (x, y, _z, o) => {
    const arm = side < 0 ? BONE.armL : BONE.armR;
    if (y > ELBOW_H + 0.12) {
      const up = smooth(SHOULDER_H - 0.09, SHOULDER_H + 0.045, y);
      // Por dentro (la axila) cuenta también el pecho.
      const inner = smooth(0.2, 0.15, side * x) * smooth(SHOULDER_H - 0.2, SHOULDER_H - 0.08, y);
      set(o, arm, side < 0 ? BONE.clavL : BONE.clavR, 0.72 * up * (1 - inner), BONE.chest, 0.4 * inner);
    } else set(o, arm, side < 0 ? BONE.foreL : BONE.foreR, 1 - smooth(ELBOW_H - 0.06, ELBOW_H + 0.06, y));
  };

/** Pernera: la rodilla se reparte; arriba, se funde con la cadera. */
export const leg =
  (side: -1 | 1): SkinFn =>
  (_x, y, _z, o) => {
    const thigh = side < 0 ? BONE.thighL : BONE.thighR;
    if (y > KNEE_H + 0.2) set(o, thigh, BONE.hips, 0.6 * smooth(HIP_Y - 0.07, HIP_Y + 0.02, y));
    else set(o, thigh, side < 0 ? BONE.shinL : BONE.shinR, 1 - smooth(KNEE_H - 0.075, KNEE_H + 0.075, y));
  };

/** Mano: la muñeca se reparte con el antebrazo. */
export const hand =
  (side: -1 | 1): SkinFn =>
  (_x, y, _z, o) =>
    set(o, side < 0 ? BONE.handL : BONE.handR, side < 0 ? BONE.foreL : BONE.foreR, smooth(WRIST_H - 0.03, WRIST_H + 0.018, y));

/** Zapato: la puntera se dobla con los dedos. */
export const shoe =
  (side: -1 | 1): SkinFn =>
  (_x, _y, z, o) =>
    set(o, side < 0 ? BONE.footL : BONE.footR, side < 0 ? BONE.toeL : BONE.toeR, smooth(-BALL_Z + 0.022, -BALL_Z - 0.03, z));

/**
 * Faldones de una chaqueta o un abrigo: arriba van con la cadera y, hacia abajo, los empuja la pierna de su lado. Por delante
 * más que por detrás (`max` y `back`): el muslo que sube levanta el faldón de delante y el de atrás sigue colgando.
 */
export const skirt =
  (top: number, bottom: number, max: number, back = max): SkinFn =>
  (x, y, z, o) => {
    const k = back + (max - back) * smooth(0.06, -0.06, z);
    const t = k * (1 - smooth(bottom, top, y)) * Math.min(1, Math.abs(x) / 0.06);
    set(o, BONE.hips, x < 0 ? BONE.thighL : BONE.thighR, t);
  };

/** Escribe los pesos en la geometría. */
export function applySkin(g: BufferGeometry, fn: SkinFn): BufferGeometry {
  const pos = g.getAttribute('position');
  const n = pos.count;
  const si = new Uint16Array(n * 4);
  const sw = new Float32Array(n * 4);
  const w: Weight = { a: 0, b: 0, t: 0, c: 0, u: 0 };
  for (let i = 0; i < n; i++) {
    fn(pos.getX(i), pos.getY(i), pos.getZ(i), w);
    const u = Math.min(1, Math.max(0, w.u));
    const t = Math.min(1 - u, Math.max(0, w.t));
    si[i * 4] = w.a;
    sw[i * 4] = 1 - t - u;
    si[i * 4 + 1] = w.b;
    sw[i * 4 + 1] = t;
    si[i * 4 + 2] = w.c;
    sw[i * 4 + 2] = u;
  }
  g.setAttribute('skinIndex', new Uint16BufferAttribute(si, 4));
  g.setAttribute('skinWeight', new Float32BufferAttribute(sw, 4));
  return g;
}
