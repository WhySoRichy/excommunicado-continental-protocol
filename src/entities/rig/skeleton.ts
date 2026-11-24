/**
 * Medidas del esqueleto (m), compartidas por la geometría del cuerpo y la animación. En reposo el personaje mira a −Z, con
 * los pies en el origen y los brazos colgando.
 */
/** Altura del centro de masa (hueso `spin`) y de la articulación de la cadera sobre los pies. */
export const SPIN_Y = 0.9;
export const HIP_Y = 0.95;
/** Separación de las caderas al centro. */
export const HIP_X = 0.095;

/** Columna: de la cadera a la cintura, de ahí al pecho, al cuello y a la cabeza. */
const SPINE_Y = 0.09;
const CHEST_Y = 0.2;
const NECK_Y = 0.3;
const HEAD_Y = 0.11;

/** Clavícula (respecto al pecho) y hombro (respecto a la clavícula; a lo ancho se multiplica por la corpulencia). */
const CLAV_X = 0.03;
const CLAV_Y = 0.245;
const ARM_X = 0.164;
const ARM_Y = 0.02;
export const SHOULDER_X = CLAV_X + ARM_X;
/** Del pecho a la línea de los hombros. */
export const SHOULDER_Y = CLAV_Y + ARM_Y;

/** Brazo: del hombro al codo, del codo a la muñeca, de la muñeca al centro del puño y a los nudillos. */
export const UPPER_ARM = 0.305;
export const FOREARM = 0.262;
export const GRIP_Y = -0.062;
export const GRIP_Z = -0.028;
const KNUCKLE_Y = -0.082;

/** Pierna: del muslo a la rodilla, de la rodilla al tobillo, y altura del tobillo sobre la suela. */
export const THIGH = 0.46;
export const SHIN = 0.405;
export const ANKLE_H = 0.085;
/** Del tobillo al talón (detrás) y a la bola del pie (delante). */
export const HEEL_Z = 0.05;
export const BALL_Z = 0.128;

/** Alturas absolutas en reposo. */
export const WAIST_H = HIP_Y + SPINE_Y;
export const CHEST_H = WAIST_H + CHEST_Y;
export const SHOULDER_H = CHEST_H + SHOULDER_Y;
export const ELBOW_H = SHOULDER_H - UPPER_ARM;
export const WRIST_H = ELBOW_H - FOREARM;
export const NECK_H = CHEST_H + NECK_Y;
export const HEAD_H = NECK_H + HEAD_Y;
export const KNEE_H = HIP_Y - THIGH;

/** Altura de la cadera según la postura. */
export const HIP_STAND = 0.946;
export const HIP_CROUCH = 0.425;
export const HIP_SLIDE = 0.3;
export const HIP_KNEEL = 0.5;

/** Huesos, en el orden de la malla. */
export const BONE = {
  spin: 0,
  hips: 1,
  spine: 2,
  chest: 3,
  neck: 4,
  head: 5,
  clavL: 6,
  clavR: 7,
  armL: 8,
  armR: 9,
  foreL: 10,
  foreR: 11,
  handL: 12,
  handR: 13,
  fingL: 14,
  fingR: 15,
  thighL: 16,
  thighR: 17,
  shinL: 18,
  shinR: 19,
  footL: 20,
  footR: 21,
  toeL: 22,
  toeR: 23,
} as const;

export type BoneId = (typeof BONE)[keyof typeof BONE];
export type BoneName = keyof typeof BONE;
export const BONE_NAMES = Object.keys(BONE) as BoneName[];

export interface BoneRest {
  parent: BoneName | null;
  at: readonly [number, number, number];
}

/** Padre y posición de cada hueso respecto a él (a lo ancho, con la corpulencia `b`). */
export function boneLayout(b: number): Record<BoneName, BoneRest> {
  const out: Partial<Record<BoneName, BoneRest>> = {
    spin: { parent: null, at: [0, SPIN_Y, 0] },
    hips: { parent: 'spin', at: [0, HIP_Y - SPIN_Y, 0] },
    spine: { parent: 'hips', at: [0, SPINE_Y, 0] },
    chest: { parent: 'spine', at: [0, CHEST_Y, 0] },
    neck: { parent: 'chest', at: [0, NECK_Y, 0.004] },
    head: { parent: 'neck', at: [0, HEAD_Y, -0.004] },
  };
  for (const s of [-1, 1] as const) {
    const n = (k: string): BoneName => `${k}${s < 0 ? 'L' : 'R'}` as BoneName;
    out[n('clav')] = { parent: 'chest', at: [s * CLAV_X * b, CLAV_Y, -0.008] };
    out[n('arm')] = { parent: n('clav'), at: [s * ARM_X * b, ARM_Y, 0.008] };
    out[n('fore')] = { parent: n('arm'), at: [0, -UPPER_ARM, 0] };
    out[n('hand')] = { parent: n('fore'), at: [0, -FOREARM, 0] };
    out[n('fing')] = { parent: n('hand'), at: [0, KNUCKLE_Y, -0.008] };
    out[n('thigh')] = { parent: 'hips', at: [s * HIP_X * b, 0, 0] };
    out[n('shin')] = { parent: n('thigh'), at: [0, -THIGH, 0] };
    out[n('foot')] = { parent: n('shin'), at: [0, -SHIN, 0] };
    out[n('toe')] = { parent: n('foot'), at: [0, 0.025 - ANKLE_H, -BALL_Z] };
  }
  return out as Record<BoneName, BoneRest>;
}
