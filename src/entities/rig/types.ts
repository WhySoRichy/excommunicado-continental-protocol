import type { CoverHeight, MoveState, Posture } from '../PlayerController';

/** Colores del personaje (van en los vértices: un solo material). */
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
/** Rostro: `stern`, ceñudo (el común); `calm`, sereno (el del Huésped). */
export type FaceStyle = 'stern' | 'calm';

/** Prendas y equipo opcionales. Sin `outfit`, el personaje lleva traje de chaqueta con corbata y pañuelo. */
export interface Outfit {
  /** Lo que lleva en el tronco: traje (por defecto), cazadora acolchada, abrigo largo o uniforme de faena. */
  top?: 'suit' | 'bomber' | 'coat' | 'fatigues';
  /** Chaqueta del traje (por defecto sí). Sin ella se ven el chaleco y las mangas de la camisa. */
  jacket?: boolean;
  /** Corbata (por defecto sí, salvo con pajarita). */
  tie?: boolean;
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
  /** Chaleco encima: portaplacas ligero o blindaje completo con hombreras y placas en las piernas. */
  vest?: 'carrier' | 'heavy';
  /** Brazaletes del color de acento. */
  armband?: boolean;
  /** Guantes: color. */
  gloves?: number;
  /** Botas en vez de zapatos. */
  boots?: boolean;
  /** Pistolera en el muslo derecho. */
  holster?: boolean;
  kneepads?: boolean;
  /** Capucha echada, con el cuello tapado: color. */
  hood?: number;
  /** Cara tapada, salvo los ojos. */
  mask?: 'balaclava';
  /** Visor de dos lentes: su color. */
  goggles?: number;
  /** Gafas de sol. */
  glasses?: boolean;
  /** Auricular con su cable. */
  earpiece?: boolean;
  /** Pantalla blindada delante de la cara (con casco). */
  visor?: boolean;
}

export interface RigOptions {
  colors: RigColors;
  rimColor: number;
  rimStrength: number;
  hair: HairStyle;
  /** Corpulencia (1 = normal, 1.25 = blindado). */
  bulk?: number;
  /** Barba cerrada (la mandíbula va del color del pelo). */
  beard?: boolean;
  /** Prendas que cambian la silueta además de los colores (traje de tres piezas, sumiller...). */
  outfit?: Outfit;
  /** Rostro (por defecto `stern`). */
  face?: FaceStyle;
  weapon: WeaponModel;
  /** Material propio (no cacheado): permite efectos por instancia (destello de impacto). */
  uniqueMaterial?: boolean;
  /** Con malla lejana (enemigos, civiles y aliados: los que se ven de cerca y de lejos). */
  lod?: boolean;
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
  /** Gesto de lanzar 0..1 (−1 = no lanza): hasta 0,4 arma el brazo izquierdo; después lanza y lo baja. */
  throw: number;
  /** 0..1 aturdido por un destello: se tambalea con la mano en la cara. */
  daze: number;
  /** Progreso del vault 0..1 (−1 = sin dato: pose intermedia). */
  vault: number;
  /** Cobertura en la que está ('none' fuera de ella). */
  cover: CoverHeight | 'none';
  /** Asomado por el borde de una cobertura alta: −1..1 (+ = por la derecha). */
  peek: number;
  /** Disparo a ciegas desde la cobertura: 1 por encima, 2 por el borde (el de `coverSide`), 0 no. */
  blind: 0 | 1 | 2;
  /** Borde de la cobertura alta al alcance (−1 izquierda, +1 derecha, 0 ninguno). */
  coverSide: number;
  /** Fuerza con la que llegó a la cobertura (0..1): al llegar, se apoya en la pared. */
  brace: number;
  /** Borde superior de la cobertura sobre los pies (m): a ciegas, el arma asoma justo por encima. */
  coverTop: number;
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
    throw: -1,
    daze: 0,
    vault: -1,
    cover: 'none',
    peek: 0,
    blind: 0,
    coverSide: 0,
    brace: 0,
    coverTop: 1.2,
  };
}
