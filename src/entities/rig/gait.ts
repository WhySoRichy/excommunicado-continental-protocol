import { clamp, lerp } from '../../core/math';
import { smooth, smoother } from '../rigMath';
import { ANKLE_H, BALL_Z, HEEL_Z } from './skeleton';

/**
 * El ciclo de marcha (matemática pura). Un ciclo son dos pasos; la fase va de 0 a 1 y en 0 el pie izquierdo pisa. Mientras
 * un pie está apoyado retrocede justo a la velocidad a la que avanza el cuerpo: no patina.
 */
const TAU = Math.PI * 2;

/** Cómo es la zancada a una velocidad. */
export interface Stride {
  /** Metros que se avanzan en un ciclo y parte del ciclo que cada pie pasa en el suelo. */
  length: number;
  duty: number;
  /** Cuánto queda el pie por delante de la cadera al pisar y por detrás al despegar (m). */
  front: number;
  back: number;
  /** Altura del pie en el aire (m) y 0..1 cuánto hay de carrera (frente a andar). */
  lift: number;
  run: number;
}

/**
 * Zancada según la velocidad (m/s), lo agachado (0..1) y hacia dónde va: de lado (`across`, 0..1) y hacia atrás (`back`, 0..1)
 * los pasos son más cortos y más seguidos.
 */
export function strideAt(speed: number, crouch: number, out: Stride, across = 0, back = 0): Stride {
  const v = Math.max(0.25, speed);
  const run = smooth(2.2, 4.2, v);
  const fast = smooth(4.4, 7, v);
  const short = (1 - 0.36 * across) * (1 - 0.14 * back);
  out.length = (0.75 + 0.5 * v - 0.007 * v * v) * (1 - 0.5 * Math.exp(-2.2 * v)) * (1 - 0.24 * crouch) * short;
  // Lo que recorre el pie en el suelo: lo que da de sí la pierna; lo demás se vuela.
  const travel =
    Math.min(lerp(0.82, 0.7, run) * (1 - Math.exp(-2.6 * v)) + 0.06 * fast, out.length * 0.66) * (1 - 0.12 * crouch) * (1 - 0.4 * across) * (1 - 0.1 * back);
  out.duty = travel / out.length;
  const ahead = lerp(lerp(0.41, 0.32, run), 0.33, fast);
  out.front = travel * ahead;
  out.back = travel * (1 - ahead);
  out.lift = lerp(lerp(0.065, 0.27, run), 0.38, fast) * (1 - 0.4 * crouch) * (1 - 0.5 * across);
  out.run = run * (1 - 0.6 * across);
  return out;
}

/** Un pie en un instante del ciclo. */
export interface FootAt {
  /** Adelantado respecto a la cadera en la dirección de la marcha (m) y altura de la suela (m). */
  along: number;
  lift: number;
  /** Cabeceo (rad, + punta arriba) y flexión de los dedos (rad, + hacia arriba). */
  pitch: number;
  toe: number;
  /** 0..1 cuánto peso lleva y cuánto va suelto (en el aire, el pie sigue a la pierna). */
  load: number;
  air: number;
}

export const footAt = (): FootAt => ({ along: 0, lift: 0, pitch: 0, toe: 0, load: 0, air: 0 });

/** El pie en la fase `u` de su ciclo (0 al pisar). */
export function stepAt(u0: number, s: Stride, out: FootAt): FootAt {
  const u = u0 - Math.floor(u0);
  const walk = 1 - s.run;
  const strike = 0.3 * walk + 0.02 * s.run;
  const push = -0.72 + 0.1 * s.run;
  const rise = lerp(0.5, 0.38, s.run);
  if (u < s.duty) {
    const k = u / s.duty;
    out.along = lerp(s.front, -s.back, k);
    out.lift = 0;
    // Entra de talón, se asienta, y al final levanta el talón sobre la bola del pie.
    out.pitch = strike * (1 - smooth(0, 0.22, k)) + push * smoother(rise, 1.12, k) * 1.18;
    out.toe = Math.max(0, -out.pitch) * 0.85;
    out.load = smooth(0, 0.2, k) * (1 - smooth(0.82, 1, k));
    out.air = 0;
    return out;
  }
  const t = (u - s.duty) / (1 - s.duty);
  // Del despegue al apoyo. Enlaza con la velocidad del suelo en los dos extremos: al despegar el pie se queda un instante
  // atrás y al llegar se pasa un poco y vuelve, sin alargar la pierna más de lo que da.
  const m = (-(s.front + s.back) / s.duty) * (1 - s.duty);
  const r = 1 - t;
  out.along = -s.back + (s.front + s.back) * smoother(0, 1, t) + m * (t * Math.pow(r, 7) - r * Math.pow(t, 6));
  // Corriendo, el talón sube pronto, por detrás, y el pie pasa hacia delante ya bajando.
  const peak = Math.sin(Math.PI * t * (1 + lerp(0.05, 0.4, s.run) * r));
  out.lift = s.lift * peak * peak;
  const off = push * smoother(rise, 1.12, 1) * 1.18;
  const tuck = -0.35 - 0.75 * s.run;
  out.pitch = lerp(off, strike, smooth(0.1, 0.95, t)) + tuck * Math.sin(Math.PI * Math.min(1, t * 1.15)) * (1 - t) * 0.9;
  out.toe = Math.max(0, -off) * 0.85 * (1 - smooth(0, 0.4, t));
  out.load = 0;
  out.air = lerp(0.45, 0.95, s.run) * smooth(0, 0.24, t) * (1 - smooth(0.66, 0.96, t));
  return out;
}

/**
 * Dónde queda el tobillo con el pie a ras de suelo y ese cabeceo: con el talón levantado gira sobre la bola del pie y con
 * la punta arriba, sobre el talón. Devuelve altura y adelanto respecto al tobillo con el pie plano.
 */
export function ankleRoll(pitch: number, out: { up: number; ahead: number }): { up: number; ahead: number } {
  if (pitch < 0) {
    const c = Math.cos(-pitch);
    const s = Math.sin(-pitch);
    out.up = ANKLE_H * c + BALL_Z * s;
    out.ahead = BALL_Z - (BALL_Z * c - ANKLE_H * s);
  } else {
    const c = Math.cos(pitch);
    const s = Math.sin(pitch);
    out.up = ANKLE_H * c + HEEL_Z * s;
    out.ahead = HEEL_Z * c - ANKLE_H * s - HEEL_Z;
  }
  return out;
}

/** Cómo acompaña el cuerpo a las piernas en la fase `u` del pie izquierdo. */
export interface BodySway {
  /** Pelvis: arriba y abajo, a los lados (m), caída del lado del pie en el aire y giro (rad). */
  bounce: number;
  side: number;
  roll: number;
  yaw: number;
  /** Tronco: giro y ladeo contrarios a los de la pelvis (rad). */
  twist: number;
  tilt: number;
  /** Balanceo de los brazos (−1..1): + el derecho delante. */
  swing: number;
}

export const bodySway = (): BodySway => ({ bounce: 0, side: 0, roll: 0, yaw: 0, twist: 0, tilt: 0, swing: 0 });

export function swayAt(u: number, s: Stride, out: BodySway): BodySway {
  const run = s.run;
  const mid = s.duty / 2;
  const a = TAU * u;
  // Andando, lo más bajo es cuando los dos pies tocan; corriendo, a mitad del apoyo (y lo más alto, en el aire).
  out.bounce = -lerp(0.019, 0, run) * Math.cos(2 * a) - lerp(0, 0.03, run) * Math.cos(2 * (a - TAU * mid));
  const over = Math.cos(a - TAU * mid);
  out.side = -lerp(0.024, 0.014, run) * over;
  out.roll = -lerp(0.062, 0.05, run) * over;
  out.yaw = -lerp(0.1, 0.13, run) * Math.cos(a);
  out.twist = lerp(0.12, 0.25, run) * Math.cos(a - 0.15);
  out.tilt = lerp(0.03, 0.04, run) * over;
  out.swing = Math.cos(a - 0.22);
  return out;
}

/** Ciclos por segundo a una velocidad. */
export function cycleRate(speed: number, s: Stride): number {
  return clamp(speed / s.length, 0, 2.2);
}
