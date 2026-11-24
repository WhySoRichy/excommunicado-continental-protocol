import { type BufferGeometry, Float32BufferAttribute, Uint16BufferAttribute } from 'three';
import { smooth } from '../rigMath';
import { ELBOW_Y, NECK_Y, SHOULDER_Y, SPIN_Y } from './skeleton';

/**
 * A qué huesos va cada vértice y con qué peso. Las articulaciones (codo, rodilla, cintura, cuello) se reparten entre los
 * dos huesos en un tramo: la manga o la pernera se dobla sin abrirse.
 */
export const BONE = {
  spin: 0,
  hips: 1,
  torso: 2,
  head: 3,
  armL: 4,
  armR: 5,
  foreL: 6,
  foreR: 7,
  thighL: 8,
  thighR: 9,
  shinL: 10,
  shinR: 11,
  footL: 12,
  footR: 13,
} as const;

export type BoneId = (typeof BONE)[keyof typeof BONE];

/** Alturas de las articulaciones en reposo (m sobre los pies). */
export const HIP_Y = SPIN_Y + 0.05;
export const SHOULDER_H = HIP_Y + SHOULDER_Y;
export const ELBOW_H = SHOULDER_H + ELBOW_Y;
export const NECK_H = HIP_Y + NECK_Y;
export const KNEE_H = HIP_Y - 0.46;

/** Pesos de un vértice: hasta dos huesos (el segundo con peso `t`). */
export interface Weight {
  a: BoneId;
  b: BoneId;
  t: number;
}

export type SkinFn = (x: number, y: number, z: number, out: Weight) => void;

const set = (o: Weight, a: BoneId, b: BoneId, t: number): void => {
  o.a = a;
  o.b = b;
  o.t = t;
};

/** Todo a un hueso. */
export const rigid =
  (bone: BoneId): SkinFn =>
  (_x, _y, _z, o) =>
    set(o, bone, bone, 0);

/** Tronco: la pelvis va con la cadera y la cintura se reparte. */
export const trunk: SkinFn = (_x, y, _z, o) => set(o, BONE.hips, BONE.torso, smooth(HIP_Y + 0.03, HIP_Y + 0.2, y));

/** Cuello: de los hombros a la cabeza. */
export const neck: SkinFn = (_x, y, _z, o) => set(o, BONE.torso, BONE.head, smooth(NECK_H - 0.075, NECK_H + 0.01, y));

/** Manga del lado `side` (−1 izquierda, +1 derecha): el codo se reparte y el hombro se funde con el tronco. */
export const sleeve =
  (side: -1 | 1): SkinFn =>
  (_x, y, _z, o) => {
    const arm = side < 0 ? BONE.armL : BONE.armR;
    if (y > ELBOW_H + 0.12) set(o, arm, BONE.torso, 0.85 * smooth(SHOULDER_H - 0.05, SHOULDER_H + 0.05, y));
    else set(o, arm, side < 0 ? BONE.foreL : BONE.foreR, 1 - smooth(ELBOW_H - 0.06, ELBOW_H + 0.06, y));
  };

/** Pernera: la rodilla se reparte; arriba, se funde con la cadera. */
export const leg =
  (side: -1 | 1): SkinFn =>
  (_x, y, _z, o) => {
    const thigh = side < 0 ? BONE.thighL : BONE.thighR;
    if (y > KNEE_H + 0.2) set(o, thigh, BONE.hips, 0.6 * smooth(HIP_Y - 0.06, HIP_Y + 0.02, y));
    else set(o, thigh, side < 0 ? BONE.shinL : BONE.shinR, 1 - smooth(KNEE_H - 0.075, KNEE_H + 0.075, y));
  };

/** Faldones de una chaqueta o un abrigo: arriba van con la cadera y, hacia abajo, los empuja la pierna de su lado. */
export const skirt =
  (top: number, bottom: number, max: number): SkinFn =>
  (x, y, _z, o) => {
    const t = max * (1 - smooth(bottom, top, y)) * Math.min(1, Math.abs(x) / 0.05);
    set(o, BONE.hips, x < 0 ? BONE.thighL : BONE.thighR, t);
  };

/** Escribe los pesos en la geometría. */
export function applySkin(g: BufferGeometry, fn: SkinFn): BufferGeometry {
  const pos = g.getAttribute('position');
  const n = pos.count;
  const si = new Uint16Array(n * 4);
  const sw = new Float32Array(n * 4);
  const w: Weight = { a: 0, b: 0, t: 0 };
  for (let i = 0; i < n; i++) {
    fn(pos.getX(i), pos.getY(i), pos.getZ(i), w);
    const t = Math.min(1, Math.max(0, w.t));
    si[i * 4] = w.a;
    sw[i * 4] = 1 - t;
    si[i * 4 + 1] = w.b;
    sw[i * 4 + 1] = t;
  }
  g.setAttribute('skinIndex', new Uint16BufferAttribute(si, 4));
  g.setAttribute('skinWeight', new Float32BufferAttribute(sw, 4));
  return g;
}
