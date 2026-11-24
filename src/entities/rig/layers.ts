import { clamp, lerp } from '../../core/math';
import { bell, smooth, smoother } from '../rigMath';
import { type ArmAngles, type Frame, type LegGoal, reachTo, setArm } from './frame';
import { type BodySway, bodySway, type FootAt, footAt, stepAt, type Stride, swayAt } from './gait';
import { HIP_CROUCH, HIP_KNEEL, HIP_SLIDE, HIP_STAND, SPIN_Y } from './skeleton';
import type { RigPose } from './types';

/**
 * Las capas de la animación. Cada una modifica la postura (`Frame`) según lo que le pasa al personaje; ninguna toca los
 * huesos. Los pesos llegan ya suavizados con muelles, así que las capas entran y salen sin saltos.
 */
const HALF_PI = Math.PI / 2;

/** Pesos (0..1) y datos del fotograma que comparten las capas. */
export interface Weights {
  time: number;
  /** Desfase propio del personaje: dos que hacen lo mismo no se mueven a la vez. */
  seed: number;
  crouch: number;
  aim: number;
  /** En guardia (frente a relajado). */
  ready: number;
  sprint: number;
  /** Zancada, girando en el sitio. */
  amp: number;
  turning: number;
  kneel: number;
  daze: number;
  stagger: number;
  /** Piernas sueltas (en el aire, rodando, deslizándose, pasando por encima). */
  free: number;
  limp: number;
  shield: number;
  /** Cobertura alta y baja, asomado (con signo), a ciegas, recorriéndola (con signo: + a su derecha) y apoyo al llegar. */
  high: number;
  low: number;
  peek: number;
  blind: number;
  coverMove: number;
  brace: number;
  /** Cuerpo girado respecto al frente (de espaldas a la pared). */
  turn: number;
  /** Inclinación por acelerar o girar (− adelante; − derecha). */
  leanX: number;
  leanZ: number;
  armed: boolean;
  /** 0..1 lleva un arma larga (suavizado: cambiar de arma no da un tirón). */
  long: number;
  knife: boolean;
}

/** Estado de la marcha entre fotogramas. */
export interface Gait {
  /** Fase del ciclo (0..1, el pie izquierdo pisa en 0). */
  u: number;
  readonly stride: Stride;
  readonly sway: BodySway;
  readonly footL: FootAt;
  readonly footR: FootAt;
  /** Dirección de la marcha respecto al cuerpo (coseno y seno hacia la derecha) y giro de la cadera hacia ella. */
  fwd: number;
  right: number;
  hips: number;
}

export function newGait(): Gait {
  return {
    u: 0.25,
    stride: { length: 1, duty: 0.6, front: 0.3, back: 0.4, lift: 0.06, run: 0 },
    sway: bodySway(),
    footL: footAt(),
    footR: footAt(),
    fwd: 1,
    right: 0,
    hips: 0,
  };
}

// ------------------------------------------------------------------ de pie, agachado y en marcha
function placeFoot(leg: LegGoal, s: -1 | 1, foot: FootAt, g: Gait, w: Weights): void {
  const { amp, crouch: ck, aim: ak, ready: rk, sprint: sk } = w;
  const still = 1 - amp;
  const bladed = lerp(0.45, 1, w.long);
  // Parado: los pies algo abiertos y con un paso entre ellos, más cuanto más en guardia; agachado, uno adelantado.
  const stagger = -s * (0.012 + 0.05 * rk + 0.075 * ak * bladed + 0.16 * ck);
  const wide = 0.105 + 0.018 * rk + 0.02 * ak + 0.045 * ck;
  leg.f = stagger * still;
  leg.x = s * lerp(wide, lerp(lerp(0.085, 0.05, g.stride.run), 0.125, Math.abs(g.right)) + 0.05 * ck, amp);
  const limp = 1 - 0.5 * clamp(s * w.limp, 0, 1);
  const along = foot.along * amp * limp;
  leg.f += along * g.fwd;
  // De lado, un pie pasa por delante del otro.
  leg.x += along * g.right;
  leg.f -= s * 0.05 * Math.abs(g.right) * amp;
  const heel = Math.max(0, g.fwd) * amp;
  leg.y = foot.lift * amp * limp * (1 - 0.35 * Math.abs(g.right)) + 0.035 * w.turning * still * Math.max(0, Math.sin(w.time * 11 + (s > 0 ? Math.PI : 0)));
  leg.pitch = foot.pitch * heel;
  leg.toe = foot.toe * heel;
  // Hacia dónde apuntan: algo abiertos; el de atrás, más.
  const out = lerp(0.2, 0.07, amp) + 0.06 * ck;
  leg.yaw = -s * out - (s > 0 ? 0.28 * ak * bladed + 0.14 * rk * bladed : 0) * still + g.hips * 0.75;
  leg.knee = -s * (0.1 + 0.16 * ck * still);
  // Agachado y quieto, el pie de atrás se apoya en la bola.
  if (s > 0) {
    const tip = ck * still * (1 - 0.4 * sk);
    leg.pitch -= 0.62 * tip;
    leg.toe += 0.5 * tip;
  }
}

/** Marcha y reposo: pies, pelvis, columna y cabeza. */
export function locomotion(f: Frame, w: Weights, g: Gait): void {
  const { amp, crouch: ck, aim: ak, ready: rk, sprint: sk } = w;
  const still = 1 - amp;
  const s = g.stride;
  stepAt(g.u, s, g.footL);
  stepAt(g.u + 0.5, s, g.footR);
  const sway = swayAt(g.u, s, g.sway);
  placeFoot(f.legL, -1, g.footL, g, w);
  placeFoot(f.legR, 1, g.footR, g, w);

  // Reposo: el peso pasa despacio de un pie a otro y el pecho respira.
  const t = w.time + w.seed * 7.3;
  const shift = (Math.sin(t * 0.52) + 0.45 * Math.sin(t * 0.23 + 1.3 + w.seed)) * still * (1 - 0.75 * ak) * (1 - 0.45 * rk) * (1 - ck);
  const breath = Math.sin(t * (1.5 + 0.5 * rk));
  const fwd = g.fwd * amp;

  // Pelvis. Relajado, las piernas casi estiradas; en guardia, algo flexionadas.
  const stand = lerp(lerp(HIP_STAND, HIP_STAND - 0.012, rk), HIP_STAND - 0.02, ak);
  const going = lerp(0.927, 0.868, s.run);
  f.hipY = lerp(lerp(stand, going, amp), HIP_CROUCH + 0.07 * amp, ck) + sway.bounce * amp * (1 - 0.4 * ck);
  f.hipX = 0.024 * shift + sway.side * amp;
  f.hipZ = -0.012 * sk * amp;
  f.pelvisY = g.hips + sway.yaw * fwd - lerp(0.06 * ak, 0.3 * ak + 0.14 * rk, w.long) * still;
  f.pelvisZ = 0.042 * shift + sway.roll * amp * (1 - 0.5 * ck);
  f.pelvisX = -(0.02 + 0.05 * s.run + 0.06 * sk) * fwd - 0.3 * ck + 0.35 * w.leanX;

  // Columna: se inclina con la velocidad y al acelerar, y compensa a la pelvis.
  const tense = 0.035 * rk + 0.06 * ak;
  f.torsoX = -tense - (0.035 + 0.1 * s.run + 0.13 * sk) * fwd - (0.71 - 0.12 * ak + 0.1 * amp) * ck + w.leanX + 0.011 * breath * still;
  f.torsoY = sway.twist * fwd * (w.armed && w.ready > 0.5 && sk < 0.5 ? 0.45 : 1);
  f.torsoZ = -0.03 * shift + sway.tilt * amp + w.leanZ;
  f.headX = 0.02 * breath * still * 0.3;
  f.headZ = -0.02 * shift - 0.35 * w.leanZ;

  // Los hombros suben al respirar y se encogen en guardia.
  f.clavL = f.clavR = 0.022 * breath * still + 0.05 * rk * (w.armed ? 1 : 0) + 0.05 * ak;
  f.clavFwd = 0.07 * rk * (w.armed ? 1 : 0) + 0.12 * ak;

  // Cojea: el cuerpo se vence hacia la pierna herida cuando la carga.
  const hurt = Math.abs(w.limp) * amp;
  if (hurt > 0.001) {
    const load = w.limp < 0 ? g.footL.load : g.footR.load;
    f.hipY -= 0.06 * hurt * load;
    f.torsoZ += (w.limp < 0 ? 0.16 : -0.16) * hurt * load;
  }
  arms(f, w, g);
}

/** Brazos libres: cuelgan con el codo algo doblado y se balancean al contrario que las piernas. */
function arms(f: Frame, w: Weights, g: Gait): void {
  const run = g.stride.run;
  const { amp, sprint: sk, ready: rk } = w;
  const size = lerp(0.34, 0.52, run) + 0.2 * sk;
  const swing = g.sway.swing * amp * Math.max(-0.4, Math.abs(g.fwd) < 0.3 ? 0.3 * g.fwd : g.fwd);
  const el = lerp(lerp(0.2, 0.28, amp), 1.3 + 0.16 * sk, run * amp);
  const drift = Math.sin(w.time * 0.8 + w.seed * 5) * 0.02 * (1 - amp);
  const one = (a: ArmAngles, s: -1 | 1): void => {
    const k = s * swing;
    a.sx = k * size * (k > 0 ? 1 : 0.85) - 0.05 * amp + drift * s + 0.06 * run * amp;
    a.sz = s * (0.09 + 0.05 * run * amp);
    a.sy = s * (0.16 + 0.22 * run * amp);
    a.el = el + Math.max(0, k) * lerp(0.28, 0.14, run) - Math.max(0, -k) * lerp(0.06, 0.4, run);
    a.hx = 0.1 - 0.1 * k * (1 - run);
    a.hz = 0;
  };
  one(f.armL, -1);
  one(f.armR, 1);
  // Con un arma corta en la mano, ese brazo se balancea menos y se separa algo del cuerpo.
  if (w.armed && w.long < 0.5) {
    f.armR.sx *= 0.7 + 0.3 * sk;
    f.armR.sz += 0.05;
    f.fingR = 1;
  }
  f.fingL = 0.4 + 0.5 * run * amp;
  if (!w.armed) f.fingR = f.fingL;
  if (w.knife) {
    // Guardia de cuchillo: las dos manos por delante, la del arma atrás y el codo cubriendo.
    const k = (0.1 + 0.9 * rk) * (1 - 0.85 * sk);
    setArm(f.armR, 0.42, 0.04, 1.32, k);
    setArm(f.armL, 0.55, 0.05, 1.5, k);
    f.armL.sy = lerp(f.armL.sy, -0.5, k);
    f.armR.sy = lerp(f.armR.sy, 0.3, k);
    f.fingR = 1;
  }
}

// ------------------------------------------------------------------ acrobacias
/** Lo que hace con las piernas sueltas. Se queda apuntado al salir de ello: la postura se va apagando, no salta. */
export interface Acrobatics {
  state: 'air' | 'roll' | 'slide' | 'vault';
  time: number;
  vault: number;
}

/** En el aire, rodando, deslizándose o pasando por encima de algo, con peso `k`. `rolling`: sigue rodando. */
export function acrobatics(f: Frame, a: Acrobatics, k: number, rolling: boolean): void {
  const L = f.freeL;
  const R = f.freeR;
  f.free = Math.max(f.free, k);
  /** El tronco y la pelvis, hacia una postura. */
  const trunk = (torsoX: number, torsoY: number, torsoZ: number, pelvisX: number, pelvisZ: number): void => {
    f.torsoX = lerp(f.torsoX, torsoX, k);
    f.torsoY = lerp(f.torsoY, torsoY, k);
    f.torsoZ = lerp(f.torsoZ, torsoZ, k);
    f.pelvisX = lerp(f.pelvisX, pelvisX, k);
    f.pelvisY = lerp(f.pelvisY, 0, k);
    f.pelvisZ = lerp(f.pelvisZ, pelvisZ, k);
    f.hipX = lerp(f.hipX, 0, k);
  };
  switch (a.state) {
    case 'air':
      L.f = 0.26;
      L.down = 0.62;
      R.f = -0.12;
      R.down = 0.8;
      L.pitch = R.pitch = -0.4;
      f.hipLocal = 0.03;
      trunk(-0.14, f.torsoY * 0.3, f.torsoZ, f.pelvisX, f.pelvisZ);
      setArm(f.armL, 0.35, -0.5, 0.55, k);
      f.headLevel = lerp(f.headLevel, 0.7, k);
      break;
    case 'roll': {
      // Se hace un ovillo, rueda sobre el hombro y se abre al salir.
      const t = clamp(a.time / 0.5, 0, 1);
      const curl = smooth(0, 0.2, t) * (1 - smooth(0.72, 1, t));
      f.spinX = -Math.PI * 2 * t;
      f.spinY = lerp(SPIN_Y, 0.43, smooth(0, 0.3, t) * (1 - smooth(0.66, 1, t)));
      L.f = 0.24;
      R.f = 0.2;
      L.down = lerp(0.62, 0.34, curl);
      R.down = lerp(0.66, 0.38, curl);
      L.loose = R.loose = true;
      f.hipLocal = 0;
      trunk(-0.4 - 1.05 * curl, 0, 0, 0, 0);
      f.headX = lerp(f.headX, -0.75 * curl, k);
      f.headLevel = lerp(f.headLevel, 0, k);
      f.hold *= 1 - k;
      f.exact = rolling;
      setArm(f.armL, 1.0, 0.2, 1.9, k);
      setArm(f.armR, 1.0, -0.2, 1.9, k);
      f.armL.sy = f.armR.sy = 0;
      break;
    }
    case 'slide': {
      // La cadera casi en el suelo, la pierna derecha estirada al frente, la izquierda recogida y la mano detrás.
      const settle = smooth(0, 0.18, a.time);
      const hip = lerp(HIP_CROUCH, HIP_SLIDE, settle);
      f.hipLocal = hip - SPIN_Y;
      R.f = 0.84;
      R.down = hip - 0.05;
      L.f = 0.3;
      L.down = hip - 0.03;
      L.side = -0.04;
      R.side = 0.04;
      // La pierna estirada patina sobre el talón; la recogida apoya la suela entera.
      R.pitch = 1;
      L.pitch = 0;
      trunk(lerp(0.2, 0.62, settle), 0, 0.1, 0.2 * settle, 0);
      plantLeft(f, settle * k, -0.35, -0.32, 0.12);
      f.headLevel = lerp(f.headLevel, 0.9, k);
      break;
    }
    case 'vault': {
      // Tres tiempos: apoyar la mano y recoger las piernas, pasarlas de lado y bajar a aterrizar.
      const u = a.vault >= 0 ? a.vault : 0.5;
      const tuck = smooth(0, 0.3, u);
      const over = smooth(0.25, 0.55, u) * (1 - smooth(0.8, 1, u));
      const land = smooth(0.72, 1, u);
      L.f = lerp(lerp(0.12, 0.5, over), 0.2, land);
      R.f = lerp(lerp(0.3, 0.62, over), -0.02, land);
      L.down = lerp(lerp(0.9, 0.52, tuck), 0.84, land) - 0.1 * over;
      R.down = lerp(lerp(0.9, 0.44, tuck), 0.88, land) - 0.06 * over;
      L.side = R.side = 0.28 * over;
      L.pitch = R.pitch = -0.3 * (1 - land);
      f.hipLocal = 0;
      trunk(lerp(-0.34, -0.16, land) - 0.2 * over, 0.15 * over, 0.28 * over, 0, 0.22 * over);
      plantLeft(f, tuck * (1 - land) * k, 0.6, -0.18, 0.25);
      break;
    }
  }
}

/** Aterrizar: las piernas absorben el golpe y el tronco se vence. */
export function landing(f: Frame, k: number): void {
  f.hipY -= 0.8 * k;
  f.torsoX -= 1.1 * k;
  f.headX += 0.3 * k;
}

function plantLeft(f: Frame, k: number, sx: number, sz: number, el: number): void {
  if (k <= 0) return;
  setArm(f.armL, sx, sz, el, k);
  f.armL.hx = lerp(f.armL.hx, -0.9, k);
  f.grip *= 1 - k;
  f.fingL = lerp(f.fingL, 0, k);
}

// ------------------------------------------------------------------ caídas
/** Lo que dura cada forma de caer (s; ver `hitReaction.ts`). */
export const DEATH_TIME = [0.55, 0.55, 0.55, 0.7, 0.6, 1.15] as const;

/** Altura del centro del cuerpo al caer rígido un ángulo (con los pies en el suelo), hasta quedar tendido a `rest`. */
function fallHeight(angle: number, rest: number): number {
  return Math.max(rest, SPIN_Y * Math.cos(angle));
}

export function dying(f: Frame, p: RigPose): void {
  const t = clamp(p.stateTime / DEATH_TIME[p.death], 0, 1);
  const L = f.freeL;
  const R = f.freeR;
  f.free = 1;
  f.exact = true;
  f.hold = 0;
  f.headLevel = 0;
  f.hipLocal = 0.02;
  L.loose = R.loose = true;
  f.hipX = f.hipZ = f.pelvisX = f.pelvisY = f.pelvisZ = f.torsoX = f.torsoY = f.torsoZ = f.headX = f.headZ = 0;
  f.clavL = f.clavR = f.clavFwd = 0;
  L.side = -0.08;
  R.side = 0.1;
  f.fingL = f.fingR = 0.3;
  f.armL.sy = f.armR.sy = f.armL.hx = f.armR.hx = 0;
  switch (p.death) {
    case 1: {
      // De espaldas: el impacto lo tumba hacia atrás con las piernas abiertas.
      f.spinX = HALF_PI * t * t;
      f.spinY = fallHeight(f.spinX, 0.15);
      L.f = lerp(0.2, 0.02, t);
      R.f = lerp(0.08, -0.02, t);
      L.down = 0.86;
      R.down = 0.92;
      L.side = -0.16;
      R.side = 0.2;
      f.torsoX = 0.12 * t;
      f.headX = 0.25 * t;
      break;
    }
    case 2: {
      // Desplomado: primero ceden las rodillas, luego cae de lado.
      const buckle = smooth(0, 0.45, t);
      const fall = smooth(0.3, 1, t);
      f.spinZ = HALF_PI * fall * fall;
      f.spinX = 0.25 * fall;
      f.spinY = lerp(SPIN_Y, 0.2, t);
      L.f = 0.3;
      R.f = 0.16;
      L.down = lerp(0.9, lerp(0.5, 0.66, fall), buckle);
      R.down = lerp(0.9, lerp(0.62, 0.78, fall), buckle);
      f.torsoX = -0.5 * buckle + 0.15 * fall;
      f.headX = -0.3;
      f.headZ = 0.25 * fall;
      break;
    }
    case 3: {
      // En seco: se apagan las piernas, baja a plomo sobre los talones y cae hacia atrás con las rodillas dobladas.
      const drop = smooth(0, 0.55, t);
      const fall = smooth(0.42, 1, t);
      f.spinX = HALF_PI * fall * fall;
      f.spinZ = 0.14 * fall;
      f.spinY = lerp(lerp(SPIN_Y, 0.52, drop), 0.15, fall);
      L.f = lerp(0.1, lerp(0.3, 0.06, fall), drop);
      R.f = lerp(-0.05, lerp(0.38, 0, fall), drop);
      L.down = lerp(0.9, lerp(0.42, 0.74, fall), drop);
      R.down = lerp(0.9, lerp(0.36, 0.86, fall), drop);
      L.side = -0.14;
      R.side = 0.22 * fall;
      f.torsoX = -0.35 * drop * (1 - fall) + 0.1 * fall;
      f.headX = -0.5 * drop * (1 - fall) + 0.2 * fall;
      f.headZ = 0.3 * fall;
      break;
    }
    case 4: {
      // Despedido: el tronco sale hacia atrás, los brazos y las piernas se quedan por delante y aterriza de espaldas.
      const fly = smoother(0, 0.85, t);
      const trail = bell(clamp(t * 1.15, 0, 1));
      f.spinX = HALF_PI * fly;
      f.spinY = fallHeight(f.spinX, 0.15) + 0.07 * trail;
      L.f = lerp(0.1, 0.02, t) + 0.22 * trail;
      R.f = lerp(0.02, -0.02, t) + 0.3 * trail;
      L.down = 0.87 - 0.1 * trail;
      R.down = 0.91 - 0.06 * trail;
      L.side = -0.2;
      R.side = 0.24;
      f.torsoX = -0.5 * trail + 0.12 * t;
      f.headX = -0.5 * trail + 0.25 * t;
      break;
    }
    case 5: {
      // De rodillas: ceden las piernas, se queda un instante de rodillas y se va de bruces.
      const kneel = smooth(0, 0.4, t);
      const fall = smooth(0.52, 1, t);
      f.spinX = -HALF_PI * fall * fall;
      f.spinY = lerp(lerp(SPIN_Y, 0.53, kneel), 0.16, fall * fall);
      // Muslos a plomo y espinillas hacia atrás; al caer, las piernas se estiran.
      L.f = lerp(-0.02, 0, kneel);
      R.f = lerp(0.06, -0.02, kneel);
      L.down = lerp(0.9, lerp(0.54, 0.9, fall), kneel);
      R.down = lerp(0.9, lerp(0.5, 0.88, fall), kneel);
      f.torsoX = -0.3 * kneel * (1 - fall) + 0.05 * fall;
      f.headX = -0.45 * kneel * (1 - fall) + 0.4 * fall;
      f.fold = kneel * (1 - fall);
      break;
    }
    default: {
      // De bruces.
      f.spinX = -HALF_PI * t * t;
      f.spinY = fallHeight(f.spinX, 0.16);
      L.f = lerp(0.1, 0, t);
      R.f = lerp(0.02, -0.03, t);
      L.down = 0.91;
      R.down = 0.89;
      f.torsoX = 0.05;
      f.headX = 0.45;
      f.headZ = 0.3 * t;
    }
  }
  if (p.death === 4) {
    const out = 1 - smooth(0.45, 1, t);
    setArm(f.armL, lerp(0.04, 1.4, out), lerp(-1.05, -0.3, out), lerp(0.15, 0.35, out));
    setArm(f.armR, lerp(-0.02, 1.25, out), lerp(0.95, 0.35, out), lerp(0.15, 0.35, out));
  } else if (p.death === 3 || p.death === 5) {
    // Cuelgan sin fuerza hasta que el cuerpo cae.
    const down = smooth(0.5, 1, t);
    setArm(f.armL, lerp(0.12, p.death === 3 ? 0.05 : -0.2, down), lerp(-0.12, -0.8, down), lerp(0.12, 0.4, down));
    setArm(f.armR, lerp(0.05, p.death === 3 ? 0 : -0.25, down), lerp(0.12, 0.65, down), lerp(0.15, 0.2, down));
  } else if (p.death === 2) {
    const down = smooth(0.55, 1, t);
    setArm(f.armL, lerp(-0.1, 0.7, down), -0.2, lerp(0.7, 0.5, down));
    setArm(f.armR, lerp(-0.25, 0.75, down), lerp(0.3, -0.45, down), lerp(0.7, 0.35, down));
  } else {
    const down = smooth(0.45, 1, t);
    const back = p.death === 1;
    setArm(f.armL, back ? lerp(0.8, 0.05, down) : -0.2, -0.95, lerp(0.5, 0.25, down));
    setArm(f.armR, back ? lerp(0.6, -0.02, down) : -0.25, 0.95, lerp(0.5, 0.12, down));
  }
}

// ------------------------------------------------------------------ lo que le pasa
/** De rodillas (a merced): rodilla derecha en el suelo, torso vencido. */
export function kneeling(f: Frame, k: number): void {
  if (k <= 0.001) return;
  f.free = Math.max(f.free, k);
  f.hipLocal = lerp(f.hipLocal, HIP_KNEEL - SPIN_Y, k);
  f.freeL.f = lerp(f.freeL.f, 0.34, k);
  f.freeL.down = lerp(f.freeL.down, HIP_KNEEL - 0.02, k);
  f.kneelR = k;
  f.torsoX = lerp(f.torsoX, -0.5, k);
  f.headX = lerp(f.headX, -0.45, k);
  setArm(f.armL, 0.35, -0.1, 0.2, k);
  setArm(f.armR, 0.1, 0.1, 0.5, k);
  f.hold *= 1 - k;
}

/** Aturdido por un destello: piernas flojas y abiertas, torso que se balancea y el antebrazo tapando los ojos. */
export function dazed(f: Frame, w: Weights): void {
  const k = w.daze;
  if (k <= 0.001) return;
  const reel = w.time * 2.1;
  f.hipY -= 0.09 * k;
  f.hipX += 0.03 * Math.sin(reel) * k;
  f.legL.f += (0.1 + 0.05 * Math.sin(reel)) * k;
  f.legR.f -= (0.08 + 0.05 * Math.sin(reel + 1.3)) * k;
  f.legL.x -= 0.03 * k;
  f.legR.x += 0.03 * k;
  f.torsoX -= (0.42 + 0.06 * Math.sin(reel * 1.7)) * k;
  f.torsoZ += 0.13 * Math.sin(reel) * k;
  f.torsoY += (0.28 + 0.16 * Math.sin(reel * 0.8)) * k;
  f.headX -= (0.35 + 0.08 * Math.sin(reel * 1.3)) * k;
  reachTo(f.handL, k, 0.02, 0.15 + 0.02 * Math.sin(reel * 1.6), -0.15, 0.9, 0.6);
  setArm(f.armR, 0.2 + 0.12 * Math.sin(reel), 0.16, 0.35, k);
  f.hold *= 1 - k;
}

/** Descolocado por un impacto: se dobla sobre el golpe, con las rodillas flojas y la mano donde le dieron. */
export function staggering(f: Frame, p: RigPose, k: number): void {
  if (k <= 0.001) return;
  const back = p.flinchFront ? 1 : -1;
  f.hipY -= 0.08 * k;
  f.legL.f += 0.1 * k;
  f.legR.f -= 0.12 * k;
  if (p.hitPart === 'head') {
    f.torsoX += 0.2 * back * k;
    f.headX += 0.35 * back * k;
  } else if (p.hitPart === 'legL' || p.hitPart === 'legR') {
    f.torsoX -= 0.42 * k;
    f.torsoZ += (p.hitPart === 'legL' ? 0.2 : -0.2) * k;
  } else f.torsoX -= 0.4 * back * k;
  f.torsoY += 0.2 * p.flinchSide * k;
  const head = p.hitPart === 'head';
  reachTo(f.handL, k * 0.9, head ? -0.02 : 0.02, head ? 0.2 : -0.3, head ? -0.12 : -0.2, 0.7, 0.2);
  setArm(f.armR, 0.15, 0.05, 0.75, k * 0.8);
  f.hold *= 1 - k * 0.9;
}

/** Sacudida de un impacto: cada parte se mueve como le dieron, hacia atrás si vino de frente y al revés si de espaldas. */
export function flinching(f: Frame, p: RigPose): void {
  const k = p.flinch;
  if (k <= 0) return;
  const back = p.flinchFront ? 1 : -1;
  switch (p.hitPart) {
    case 'head':
      f.headX += 0.75 * back * k;
      f.torsoX += 0.24 * back * k;
      f.torsoZ += 0.2 * k * p.flinchSide;
      break;
    case 'armL':
    case 'armR': {
      // El hombro se va con la bala y la mano suelta lo que sujetaba.
      const right = p.hitPart === 'armR';
      f.torsoY += (right ? -0.5 : 0.5) * back * k;
      f.torsoX += 0.14 * back * k;
      if (right) {
        f.clavR += 0.25 * k;
        f.hold *= 1 - 0.7 * k;
      } else {
        f.armL.sx -= 0.7 * k;
        f.armL.sz -= 0.35 * k;
        f.clavL += 0.25 * k;
      }
      f.grip *= 1 - k;
      break;
    }
    case 'legL':
    case 'legR':
      f.torsoX -= 0.32 * k;
      f.torsoZ += (p.hitPart === 'legL' ? 0.22 : -0.22) * k;
      f.headX += 0.12 * k;
      f.hipY -= 0.05 * k;
      break;
    default:
      f.torsoX += 0.52 * back * k;
      f.torsoZ += 0.3 * k * p.flinchSide;
      f.torsoY += 0.25 * k * p.flinchSide;
      f.hipY -= 0.03 * k;
      f.hold *= 1 - 0.45 * k;
      f.headX += (back > 0 ? 0.3 : 0.22) * k;
      f.clavL += 0.15 * k;
      f.clavR += 0.15 * k;
  }
}

// ------------------------------------------------------------------ cobertura
/**
 * Pegado a una cobertura. Alta: la espalda contra la pared, las rodillas algo dobladas y el arma recogida al pecho;
 * recorriéndola, va de lado sin despegarse. Baja: en cuclillas con la espalda en ella; recorriéndola, agachado y de perfil.
 * El giro del cuerpo (`w.turn`) lo lleva `CharacterRig`; al apuntar vuelve al frente.
 */
export function inCover(f: Frame, p: RigPose, w: Weights): void {
  const { high: hk, low: lk } = w;
  const any = Math.max(hk, lk);
  if (any <= 0.001) return;
  const out = w.aim;
  const rest = any * (1 - out);
  const back = Math.abs(w.turn) / Math.PI;
  const go = Math.abs(w.coverMove);
  // De espaldas, las caderas y los hombros tocan la pared.
  if (p.state === 'cover') f.push += 0.2 * rest * smooth(0.35, 0.95, back) + 0.1 * rest * (1 - smooth(0.35, 0.95, back));
  if (hk > 0.001) {
    const k = hk * (1 - out);
    f.hipY -= 0.035 * k * (1 - go);
    f.torsoX += (0.07 * back - 0.02) * k;
    f.legL.f += 0.1 * k * back * (1 - go);
    f.legR.f += 0.1 * k * back * (1 - go);
    f.legL.x -= 0.02 * k;
    f.legR.x += 0.02 * k;
    f.headX += 0.02 * k;
  }
  if (lk > 0.001) {
    // Sentado sobre los talones, con las rodillas arriba y la espalda en la cobertura.
    const k = lk * (1 - out) * (1 - go) * smooth(0.4, 0.95, back);
    f.hipY = lerp(f.hipY, 0.33, k);
    f.hipZ = lerp(f.hipZ, 0.02, k);
    f.pelvisX = lerp(f.pelvisX, 0.02, k);
    f.torsoX = lerp(f.torsoX, -0.2, k);
    f.legL.f = lerp(f.legL.f, 0.3, k);
    f.legR.f = lerp(f.legR.f, 0.16, k);
    f.legL.x = lerp(f.legL.x, -0.12, k);
    f.legR.x = lerp(f.legR.x, 0.13, k);
    f.legL.pitch = lerp(f.legL.pitch, 0, k);
    f.legR.pitch = lerp(f.legR.pitch, -0.5, k);
    f.legR.toe = lerp(f.legR.toe, 0.45, k);
    f.headX -= 0.06 * lk * (1 - out);
  }
  // Asomado por un borde, el tronco se vence hacia ese lado; por encima de la baja, se apoya en ella.
  f.torsoZ -= 0.22 * w.peek;
  f.pelvisZ -= 0.08 * w.peek;
  f.torsoX -= 0.1 * lk * out;
  // Al llegar, el cuerpo se va contra la pared y rebota.
  const b = w.brace;
  if (b > 0.001) {
    f.torsoX += 0.12 * b * (back > 0.5 ? 1 : -1);
    f.hipY -= 0.04 * b;
    f.headX += 0.08 * b;
    f.clavL += 0.12 * b;
    f.clavR += 0.12 * b;
  }
  // A ciegas: la cabeza se esconde y el tronco se ladea hacia donde asoma el arma.
  if (w.blind > 0.001) {
    const over = p.blind === 1 || (p.blind === 0 && lk > hk) ? 1 : 0;
    // Por encima, en cuclillas y con la cabeza por debajo del borde.
    const k = w.blind * over;
    f.hipY = lerp(f.hipY, 0.34, k);
    f.hipZ = lerp(f.hipZ, 0.2, k);
    f.torsoX = lerp(f.torsoX, -0.78, k);
    f.headX -= 0.2 * k;
    f.grip *= 1 - w.blind * (1 - w.long) * (1 - over);
  }
}

// ------------------------------------------------------------------ lo que hace
/** Tajo del cuchillo: fin de la preparación y del corte (fracción del gesto). */
const SLASH_WIND = 0.24;
const SLASH_CUT = 0.5;

/** Forcejeo, tajo, takedown, lanzar y escudo. */
export function actions(f: Frame, p: RigPose, w: Weights): void {
  if (p.melee > 0) {
    // Barrido cruzado con giro de torso.
    setArm(f.armR, 1.45, -0.75, 0.4, p.melee);
    f.torsoY += 0.45 * p.melee;
    f.hold *= 1 - p.melee;
  }
  if (p.slash >= 0 && w.armed && !f.exact) slash(f, p.slash);
  if (p.throw >= 0 && !f.exact) throwing(f, p.throw);
  if (p.takedown >= 0) takedown(f, p.takedown, p.recoil);
  if (w.shield > 0.001) {
    // El brazo izquierdo sujeta el escudo por delante, con el codo pegado, y la derecha dispara a su lado.
    reachTo(f.handL, w.shield, -0.12, -0.36, -0.31, 0.3, 0.1);
    f.grip *= 1 - w.shield;
    f.fingL = 1;
  }
}

/**
 * El brazo se arma junto a la oreja derecha con el torso girado a la derecha, corta en diagonal hacia la cadera izquierda
 * mientras el torso gira y se vence, y vuelve a la guardia.
 */
function slash(f: Frame, u: number): void {
  const wind = smoother(0, SLASH_WIND, u) * (1 - smoother(SLASH_WIND, SLASH_CUT, u));
  const cut = smoother(SLASH_WIND, SLASH_CUT, u) * (1 - smoother(SLASH_CUT + 0.1, 1, u));
  setArm(f.armR, 1.75, 0.75, 1.9, wind);
  f.armR.sy = lerp(f.armR.sy, 0, Math.max(wind, cut));
  f.armR.hx += 0.45 * wind - 0.3 * cut;
  f.clavR += 0.3 * wind;
  f.torsoY -= 0.4 * wind;
  f.pelvisY -= 0.18 * wind;
  setArm(f.armR, 0.95, -0.6, 0.3, cut);
  f.torsoY += 0.55 * cut;
  f.pelvisY += 0.22 * cut;
  f.torsoX -= 0.16 * cut;
  f.hipZ -= 0.04 * cut;
  // La izquierda se recoge al pecho para equilibrar el giro.
  setArm(f.armL, 0.2, 0.1, 1.55, cut * 0.6);
}

/** Lanzar, en fracciones del gesto: brazo armado, suelta en alto, fin del acompañamiento y vuelta al arma. */
const THROW_WIND = 0.4;
const THROW_OUT = 0.5;
const THROW_LET = 0.55;
const THROW_FOLLOW = 0.68;
const THROW_DOWN = 0.76;

function throwing(f: Frame, u: number): void {
  const wind = smoother(0, THROW_WIND, u) * (1 - smoother(THROW_WIND, THROW_OUT, u));
  const out = smoother(THROW_WIND, THROW_OUT, u) * (1 - smoother(THROW_LET, THROW_FOLLOW, u));
  const follow = smoother(THROW_LET, THROW_FOLLOW, u) * (1 - smoother(THROW_DOWN, 1, u));
  const busy = smoother(0, 0.22, u) * (1 - smoother(0.8, 1, u));
  f.torsoY += 0.44 * wind - 0.2 * out - 0.5 * follow;
  f.pelvisY += 0.2 * wind - 0.2 * follow;
  f.torsoX += 0.12 * wind - 0.06 * out - 0.22 * follow;
  f.headX += 0.08 * wind;
  f.clavL += 0.25 * wind + 0.15 * out;
  // Armado: la mano atrás, junto a la oreja. Suelta: arriba y al frente. Acompaña: abajo y cruzado.
  setArm(f.armL, 1.85, -0.7, 1.95, wind);
  setArm(f.armL, 2.35, -0.12, 0.4, out);
  setArm(f.armL, 0.95, 0.3, 0.18, follow);
  f.armL.sy = lerp(f.armL.sy, 0, busy);
  f.grip *= 1 - busy;
  f.fingL = lerp(f.fingL, 1 - out, busy);
}

/** La izquierda agarra, el torso se vuelca para proyectar y la derecha remata hacia el suelo. */
function takedown(f: Frame, t: number, recoil: number): void {
  const grab = smooth(0, 0.14, t) * (1 - smooth(0.3, 0.5, t));
  const thrw = smooth(0.2, 0.45, t) * (1 - smooth(0.82, 0.95, t));
  const exec = smooth(0.4, 0.54, t) * (1 - smooth(0.85, 0.95, t));
  f.torsoX -= 0.18 * grab + 0.4 * thrw;
  f.torsoY -= 0.5 * grab - 0.3 * thrw;
  f.pelvisY -= 0.2 * grab - 0.15 * thrw;
  f.hipY -= 0.06 * thrw;
  f.legL.f += 0.12 * thrw;
  f.legR.f -= 0.12 * thrw;
  f.headX -= 0.4 * exec;
  setArm(f.armL, 1.3, 0.2, 0.3, grab);
  setArm(f.armL, 0.35, 0, 0.5, thrw * (1 - grab));
  setArm(f.armR, 0.85 + recoil * 0.2, -0.12, 0.12, exec);
  f.armR.sy = lerp(f.armR.sy, 0, exec);
  f.hold *= 1 - Math.max(grab, thrw, exec);
  f.fingL = lerp(f.fingL, 1, grab);
}

// ------------------------------------------------------------------ gestos de quien no pelea
/** Postura de un personaje desarmado: parado a su aire, atento, hablando, bailando, con miedo. */
export type Gesture = 'none' | 'formal' | 'behind' | 'pocket' | 'counter' | 'dance0' | 'dance1' | 'dance2' | 'panic' | 'cower';

export function gesture(f: Frame, p: RigPose, w: Weights, kind: Gesture, k: number, talk: number): void {
  if (kind === 'none' || k <= 0.001) return;
  const t = w.time + w.seed * 3.1;
  switch (kind) {
    case 'formal':
      // Manos cogidas por delante; al hablar, la derecha acompaña.
      reachTo(f.handL, k, -0.02, -0.42, -0.17, 0.35, 0.9);
      reachTo(
        f.handR,
        k,
        0.03 + 0.14 * talk,
        -0.4 + talk * (0.12 + 0.04 * Math.sin(t * 4.1)),
        -0.2 - talk * (0.08 + 0.03 * Math.sin(t * 2.7)),
        0.35,
        0.9 - 0.3 * talk,
      );
      f.torsoX += 0.02 * k;
      break;
    case 'behind':
      reachTo(f.handL, k * (1 - talk), -0.03, -0.45, 0.19, 0.7, 0);
      reachTo(f.handR, k, lerp(0.03, 0.2, talk), lerp(-0.46, -0.28 + 0.04 * Math.sin(t * 3.3), talk), lerp(0.2, -0.24, talk), 0.7, talk * 0.6);
      f.torsoX += 0.05 * k;
      f.clavFwd -= 0.1 * k;
      break;
    case 'pocket':
      reachTo(f.handR, k * (1 - talk), 0.2, -0.53, -0.06, 0.9, 0);
      reachTo(f.handR, k * talk, 0.18 + 0.04 * Math.sin(t * 2.3), -0.26 + 0.05 * Math.sin(t * 3.1), -0.24, 0.5, 0.7);
      f.hipX += 0.015 * k;
      break;
    case 'counter':
      // Las manos en la barra, el peso adelante.
      reachTo(f.handL, k, -0.24, -0.43, -0.26, 0.7, -0.6);
      reachTo(f.handR, k, 0.24, -0.43 + talk * (0.14 + 0.04 * Math.sin(t * 3.4)), -0.26 - 0.03 * talk, 0.7, -0.6 + talk);
      f.torsoX -= 0.07 * k;
      break;
    case 'dance0':
    case 'dance1':
    case 'dance2':
      dance(f, kind, p.beat, k);
      break;
    case 'panic':
      // Corre encogido con las manos en la cabeza.
      reachTo(f.handL, k * 0.85, -0.1, 0.22, -0.06, 0.9, 0.4);
      reachTo(f.handR, k * 0.85, 0.1, 0.22, -0.06, 0.9, 0.4);
      f.torsoX -= 0.14 * k;
      f.headX -= 0.2 * k;
      f.clavL += 0.25 * k;
      f.clavR += 0.25 * k;
      break;
    case 'cower':
      reachTo(f.handL, k, -0.06, 0.24, -0.02, 0.8, 0.5);
      reachTo(f.handR, k, 0.06, 0.24, -0.02, 0.8, 0.5);
      f.torsoX -= 0.3 * k;
      f.headX -= 0.5 * k;
      f.torsoZ += 0.03 * Math.sin(t * 13) * k;
      f.hipY -= 0.04 * k;
      f.clavL += 0.3 * k;
      f.clavR += 0.3 * k;
      break;
  }
}

/** Tres maneras de bailar al mismo compás (`beat` avanza 1 por golpe). */
function dance(f: Frame, kind: Gesture, beat: number, k: number): void {
  const b = beat * Math.PI * 2;
  const bounce = 0.5 - 0.5 * Math.cos(b);
  const half = Math.sin(b / 2);
  const slow = Math.sin(b / 4);
  f.hipY -= (0.03 + 0.045 * bounce) * k;
  f.legL.x -= 0.03 * k;
  f.legR.x += 0.03 * k;
  if (kind === 'dance0') {
    // De lado a lado, con los hombros al contrario y los brazos doblados.
    f.hipX += 0.055 * half * k;
    f.pelvisZ += 0.12 * half * k;
    f.torsoZ -= 0.12 * half * k;
    f.torsoY += 0.22 * slow * k;
    f.legL.y += 0.03 * Math.max(0, half) * k;
    f.legR.y += 0.03 * Math.max(0, -half) * k;
    setArm(f.armL, 0.35 + 0.25 * half, -0.3, 1.5 + 0.2 * bounce, k);
    setArm(f.armR, 0.35 - 0.25 * half, 0.3, 1.5 + 0.2 * bounce, k);
    f.headZ += 0.08 * half * k;
  } else if (kind === 'dance1') {
    // Un brazo arriba marcando el golpe y la cadera girando.
    f.pelvisY += 0.22 * half * k;
    f.torsoY -= 0.18 * half * k;
    f.hipX += 0.03 * slow * k;
    f.torsoX += (0.05 - 0.08 * bounce) * k;
    reachTo(f.handR, k, 0.24 + 0.04 * half, 0.3 + 0.08 * bounce, -0.14, 0.8, 0.6);
    setArm(f.armL, 0.3 - 0.3 * half, -0.28, 1.1, k);
    f.clavR += 0.35 * k;
    f.headX += (0.08 - 0.16 * bounce) * k;
  } else {
    // Cabeza y hombros: pequeño, con los pies quietos.
    f.torsoX -= 0.06 * bounce * k;
    f.torsoZ += 0.06 * slow * k;
    f.headX -= 0.2 * bounce * k;
    f.clavL += 0.16 * bounce * k;
    f.clavR += 0.16 * (1 - bounce) * k;
    setArm(f.armL, 0.15 + 0.1 * bounce, -0.14, 0.75, k);
    setArm(f.armR, 0.15 + 0.1 * (1 - bounce), 0.14, 0.75, k);
    f.legR.pitch += 0.28 * bounce * k;
  }
}
