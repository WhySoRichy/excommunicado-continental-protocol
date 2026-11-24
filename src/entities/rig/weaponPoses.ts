import type { WeaponModel } from './types';

/**
 * Cómo se lleva cada arma. Manda el arma: se dice dónde va y hacia dónde mira, y los dos brazos la alcanzan por cinemática
 * inversa. Así las manos siempre están en su sitio y pasar de una postura a otra es mover el arma.
 */
export type WeaponClass = 'pistol' | 'long' | 'knife' | 'none';

export function weaponClass(m: WeaponModel): WeaponClass {
  if (m === 'none' || m === 'knife') return m;
  return m === 'pistol' || m === 'revolver' ? 'pistol' : 'long';
}

/**
 * Una postura del arma. Posición de la empuñadura respecto al centro de los hombros (m: derecha, arriba, atrás) y hacia
 * dónde mira (rad: inclinación + arriba, giro + izquierda, ladeo), con el frente del cuerpo como referencia.
 */
export interface WeaponPose {
  x: number;
  y: number;
  z: number;
  pitch: number;
  yaw: number;
  roll: number;
  /** Giro del pecho (+ izquierda): de perfil, el hombro izquierdo por delante. */
  blade: number;
  /** 0..1 el arma manda sobre el brazo derecho y la mano izquierda va a su agarre. */
  hold: number;
  support: number;
  /** Cuánto se abren los codos (0 pegados, 1 hacia fuera). */
  elbowR: number;
  elbowL: number;
}

const pose = (x: number, y: number, z: number, pitch: number, o: Partial<WeaponPose> = {}): WeaponPose => ({
  x,
  y,
  z,
  pitch,
  yaw: 0,
  roll: 0,
  blade: 0,
  hold: 1,
  support: 1,
  elbowR: 0.4,
  elbowL: 0.4,
  ...o,
});

export type Carry = 'relaxed' | 'ready' | 'aim' | 'sprint' | 'tuckHigh' | 'tuckLow' | 'swap' | 'reload';

/** Arma corta: suelta junto al muslo, recogida al pecho a dos manos, extendida a la altura de los ojos. */
const PISTOL: Record<Carry, WeaponPose> = {
  relaxed: pose(0.26, -0.52, -0.06, -1.3, { hold: 0, support: 0 }),
  ready: pose(0.05, -0.2, -0.3, -0.42, { yaw: 0.12, blade: -0.1, elbowR: 0.55, elbowL: 0.5 }),
  aim: pose(0.02, 0.085, -0.5, 0, { blade: -0.08, elbowR: 0.45, elbowL: 0.45 }),
  sprint: pose(0.2, -0.3, -0.25, -0.5, { hold: 0, support: 0 }),
  tuckHigh: pose(0.1, -0.12, -0.22, 1.1, { yaw: 0.2, elbowR: 0.5, elbowL: 0.45 }),
  tuckLow: pose(0.09, -0.2, -0.25, 0.75, { yaw: 0.15, elbowR: 0.45, elbowL: 0.45 }),
  swap: pose(0.22, -0.46, 0.0, -1.4, { support: 0, elbowR: 0.3 }),
  reload: pose(0.06, -0.12, -0.27, 0.35, { yaw: 0.35, roll: -0.35, elbowR: 0.6, elbowL: 0.4 }),
};

/** Arma larga: cruzada y baja, culata cerca del hombro, encarada (la coloca la culata), cruzada en alto al correr. */
const LONG: Record<Carry, WeaponPose> = {
  relaxed: pose(0.15, -0.36, -0.17, -0.42, { yaw: 0.85, blade: -0.06, elbowR: 0.35, elbowL: 0.35 }),
  ready: pose(0.13, -0.21, -0.2, -0.5, { yaw: 0.4, blade: -0.24, elbowR: 0.55, elbowL: 0.4 }),
  aim: pose(0.12, 0.0, -0.3, 0, { blade: -0.52, elbowR: 0.75, elbowL: 0.25 }),
  sprint: pose(0.16, -0.25, -0.22, 0.55, { yaw: 0.8, elbowR: 0.5, elbowL: 0.4 }),
  tuckHigh: pose(0.14, -0.28, -0.18, 1.12, { yaw: 0.3, elbowR: 0.35, elbowL: 0.35 }),
  tuckLow: pose(0.14, -0.22, -0.22, 0.7, { yaw: 0.35, elbowR: 0.4, elbowL: 0.4 }),
  swap: pose(0.22, -0.42, -0.02, -1.1, { support: 0, elbowR: 0.3 }),
  reload: pose(0.12, -0.17, -0.22, 0.25, { yaw: 0.3, roll: -0.3, blade: -0.15, elbowR: 0.6, elbowL: 0.4 }),
};

/** El cuchillo y las manos vacías se llevan por ángulos: aquí, solo lo que hace falta para mezclar. */
const FREE: WeaponPose = pose(0.24, -0.42, -0.12, -0.6, { hold: 0, support: 0 });

export function carryPose(c: WeaponClass, k: Carry): WeaponPose {
  return c === 'pistol' ? PISTOL[k] : c === 'long' ? LONG[k] : FREE;
}

const KEYS = ['x', 'y', 'z', 'pitch', 'yaw', 'roll', 'blade', 'hold', 'support', 'elbowR', 'elbowL'] as const;

export const weaponPose = (): WeaponPose => pose(0, 0, 0, 0);

/** Lleva `out` hacia `to` (0 nada, 1 del todo). */
export function mixPose(out: WeaponPose, to: WeaponPose, t: number): WeaponPose {
  if (t <= 0) return out;
  for (const k of KEYS) out[k] += (to[k] - out[k]) * t;
  return out;
}

export function copyPose(out: WeaponPose, from: WeaponPose): WeaponPose {
  for (const k of KEYS) out[k] = from[k];
  return out;
}
