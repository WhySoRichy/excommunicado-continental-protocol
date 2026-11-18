import type { CoverHeight, MoveState, Posture } from '../PlayerController';

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

export type HairStyle = 'long' | 'short' | 'bald' | 'helmet' | 'cap' | 'parted' | 'slick';
export type WeaponModel = 'pistol' | 'revolver' | 'rifle' | 'dmr' | 'smg' | 'shotgun' | 'shotgunTactical' | 'knife' | 'none';
/** Rostro: `stern` es el común (cejas fruncidas); `wick`, el de Keanu Reeves como John Wick. */
export type FaceStyle = 'stern' | 'wick';

/** Prendas opcionales. Sin `outfit`, el personaje lleva traje de chaqueta con corbata y pañuelo. */
export interface Outfit {
  /** Chaqueta (por defecto sí). Sin ella se ven el chaleco y las mangas de la camisa. */
  jacket?: boolean;
  /** Chaleco de vestir: color. */
  waistcoat?: number;
  /** Pañuelo de bolsillo en el color de acento (por defecto sí). */
  pocketSquare?: boolean;
  /** Pajarita en lugar de corbata. */
  bowTie?: boolean;
  /** Delantal largo de sumiller: color. */
  apron?: number;
  /** Catavinos de plata colgado del cuello. */
  tastevin?: boolean;
  /** Bigote encerado (solo sin barba). */
  mustache?: boolean;
}

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
  /** Prendas que cambian la silueta además de los colores (traje de tres piezas, sumiller...). */
  outfit?: Outfit;
  /** Rostro (por defecto `stern`). */
  face?: FaceStyle;
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
  /** Forcejeo al empezar un takedown 0..1. */
  melee: number;
  /** Fase del tajo del cuchillo 0..1 (−1 = sin tajo): preparación, corte y vuelta a la guardia. */
  slash: number;
  /** Hacia dónde mira la cabeza respecto al cuerpo (rad, + izquierda). */
  lookYaw: number;
  /** Inclinación de esa mirada (rad, + arriba); se suma a la de `aimPitch` mientras no apunta. */
  lookPitch: number;
  /** 0..1 cuánto manda la mirada (0 = la cabeza sigue al cuerpo). */
  look: number;
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
  /** Cobertura en la que está ('none' fuera de ella). */
  cover: CoverHeight | 'none';
  /** Asomado por el borde de una cobertura alta: −1..1 (+ = por la derecha). */
  peek: number;
}

export function idlePose(): RigPose {
  return {
    speed: 0,
    moveAngle: 0,
    state: 'ground',
    posture: 'stand',
    grounded: true,
    aim: 0,
    aimPitch: 0,
    stateTime: 0,
    reload: -1,
    recoil: 0,
    melee: 0,
    slash: -1,
    lookYaw: 0,
    lookPitch: 0,
    look: 0,
    swap: 0,
    kneel: 0,
    flinch: 0,
    flinchSide: 0,
    death: 0,
    takedown: -1,
    vault: -1,
    cover: 'none',
    peek: 0,
  };
}
