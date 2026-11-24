import { HIP_STAND, SPIN_Y } from './skeleton';

/**
 * La postura de un fotograma, antes de pasarla a los huesos. Cada capa de la animación (marcha, estados, cobertura,
 * golpes, gestos) la va modificando; al final, `CharacterRig` coloca los huesos. Ángulos en radianes: inclinación +
 * atrás, giro + izquierda, ladeo + izquierda.
 */

/** Pie apoyado: dónde pisa respecto al centro del cuerpo y cómo. */
export interface LegGoal {
  f: number;
  x: number;
  /** Altura de la suela y cabeceo (+ punta arriba), flexión de los dedos y hacia dónde apunta el pie. */
  y: number;
  pitch: number;
  toe: number;
  yaw: number;
  /** Cuánto se abre la rodilla. */
  knee: number;
}

/** Pierna suelta (en el aire, rodando, cayendo): el pie, respecto a su cadera. */
export interface LegFree {
  f: number;
  down: number;
  side: number;
  /** Cabeceo del pie respecto al suelo; suelto, sigue a la pierna. */
  pitch: number;
  loose: boolean;
}

/** Brazo por ángulos: elevación, giro, apertura, codo y muñeca. */
export interface ArmAngles {
  sx: number;
  sy: number;
  sz: number;
  el: number;
  hx: number;
  hz: number;
}

/** Mano a un punto (del centro de los hombros, en el frente del cuerpo): con qué peso y hacia dónde va el codo. */
export interface HandGoal {
  w: number;
  x: number;
  y: number;
  z: number;
  elbow: number;
  /** Giro de la mano: hacia dónde mira la palma (0 hacia dentro; + hacia arriba). */
  palm: number;
}

export interface Frame {
  hipX: number;
  hipY: number;
  hipZ: number;
  pelvisX: number;
  pelvisY: number;
  pelvisZ: number;
  torsoX: number;
  torsoY: number;
  torsoZ: number;
  headX: number;
  headY: number;
  headZ: number;
  /** Cuánto compensa la cabeza la inclinación del tronco. */
  headLevel: number;
  /** Cuerpo entero: altura, vuelco y giro (de espaldas a una cobertura), y lo que se arrima a la pared. */
  spinX: number;
  spinY: number;
  spinZ: number;
  push: number;
  legL: LegGoal;
  legR: LegGoal;
  freeL: LegFree;
  freeR: LegFree;
  /** 0 pies en el suelo, 1 piernas sueltas; con ellas sueltas, altura de la cadera sobre el centro de masa. */
  free: number;
  hipLocal: number;
  /** 0..1 la rodilla derecha en el suelo, y las dos dobladas (muerte de rodillas). */
  kneelR: number;
  fold: number;
  armL: ArmAngles;
  armR: ArmAngles;
  handL: HandGoal;
  handR: HandGoal;
  /** Hombros: subida y adelanto. */
  clavL: number;
  clavR: number;
  clavFwd: number;
  /** 0..1 lo que mandan las posturas del arma (los estados acrobáticos las quitan) y la mano izquierda en ella. */
  hold: number;
  grip: number;
  /** Dedos: 0 abiertos, 1 puño. */
  fingL: number;
  fingR: number;
  /** El cuerpo vuelca o rueda: los ángulos no se suavizan. */
  exact: boolean;
}

const legGoal = (): LegGoal => ({ f: 0, x: 0, y: 0, pitch: 0, toe: 0, yaw: 0, knee: 0 });
const legFree = (): LegFree => ({ f: 0, down: 0.9, side: 0, pitch: 0, loose: false });
const arm = (): ArmAngles => ({ sx: 0, sy: 0, sz: 0, el: 0, hx: 0, hz: 0 });
const hand = (): HandGoal => ({ w: 0, x: 0, y: 0, z: 0, elbow: 0.4, palm: 0 });

export function newFrame(): Frame {
  return {
    hipX: 0,
    hipY: HIP_STAND,
    hipZ: 0,
    pelvisX: 0,
    pelvisY: 0,
    pelvisZ: 0,
    torsoX: 0,
    torsoY: 0,
    torsoZ: 0,
    headX: 0,
    headY: 0,
    headZ: 0,
    headLevel: 0.85,
    spinX: 0,
    spinY: SPIN_Y,
    spinZ: 0,
    push: 0,
    legL: legGoal(),
    legR: legGoal(),
    freeL: legFree(),
    freeR: legFree(),
    free: 0,
    hipLocal: 0.02,
    kneelR: 0,
    fold: 0,
    armL: arm(),
    armR: arm(),
    handL: hand(),
    handR: hand(),
    clavL: 0,
    clavR: 0,
    clavFwd: 0,
    hold: 1,
    grip: 1,
    fingL: 0.35,
    fingR: 0.35,
    exact: false,
  };
}

/** Deja el fotograma como nuevo (sin asignar memoria). */
export function resetFrame(f: Frame): void {
  f.hipX = f.hipZ = 0;
  f.hipY = HIP_STAND;
  f.pelvisX = f.pelvisY = f.pelvisZ = 0;
  f.torsoX = f.torsoY = f.torsoZ = 0;
  f.headX = f.headY = f.headZ = 0;
  f.headLevel = 0.85;
  f.spinX = f.spinZ = 0;
  f.spinY = SPIN_Y;
  f.push = 0;
  for (const l of [f.legL, f.legR]) {
    l.f = l.x = l.y = l.pitch = l.toe = l.yaw = l.knee = 0;
  }
  for (const l of [f.freeL, f.freeR]) {
    l.f = l.side = l.pitch = 0;
    l.down = 0.9;
    l.loose = false;
  }
  f.free = 0;
  f.hipLocal = 0.02;
  f.kneelR = f.fold = 0;
  for (const a of [f.armL, f.armR]) {
    a.sx = a.sy = a.sz = a.el = a.hx = a.hz = 0;
  }
  f.handL.w = f.handR.w = 0;
  f.handL.elbow = f.handR.elbow = 0.4;
  f.handL.palm = f.handR.palm = 0;
  f.clavL = f.clavR = f.clavFwd = 0;
  f.hold = f.grip = 1;
  f.fingL = f.fingR = 0.35;
  f.exact = false;
}

/** Coloca un brazo. */
export function setArm(a: ArmAngles, sx: number, sz: number, el: number, w = 1): void {
  a.sx += (sx - a.sx) * w;
  a.sz += (sz - a.sz) * w;
  a.el += (el - a.el) * w;
}

/** Lleva una mano a un punto con un peso (se queda con el mayor). */
export function reachTo(h: HandGoal, w: number, x: number, y: number, z: number, elbow = 0.4, palm = 0): void {
  if (w <= 0.001) return;
  const k = h.w > 0 ? w / Math.max(w, h.w) : 1;
  h.x += (x - h.x) * k;
  h.y += (y - h.y) * k;
  h.z += (z - h.z) * k;
  h.elbow += (elbow - h.elbow) * k;
  h.palm += (palm - h.palm) * k;
  h.w = Math.max(h.w, w);
}
