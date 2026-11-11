/**
 * Matemática pura del rig de personajes (sin three): cinemática inversa de la pierna
 * y trayectoria del pie al caminar.
 *
 * Convención de ángulos (rotación en X de un hueso que cuelga hacia −Y, con el personaje
 * mirando a −Z): positivo = hacia delante. La rodilla humana flexiona al revés que la
 * cadera, así que la espinilla siempre lleva un ángulo relativo ≤ 0.
 */
export const THIGH_LEN = 0.46;
/** De la rodilla a la suela del zapato. */
export const SHIN_LEN = 0.475;
/** Margen para no estirar la pierna del todo (evita el "pop" de la rodilla). */
const REACH_MARGIN = 0.012;

export interface LegAngles {
  /** Rotación X del muslo (+ = hacia delante). */
  thigh: number;
  /** Rotación X de la espinilla relativa al muslo (≤ 0 = rodilla flexionada). */
  shin: number;
}

/**
 * IK de dos huesos en el plano sagital. El pie debe quedar a `forward` metros por delante
 * de la cadera y `down` metros por debajo. La rodilla siempre apunta hacia delante.
 * Si el objetivo está fuera de alcance, la pierna se estira hacia él.
 */
export function solveLeg(forward: number, down: number, out: LegAngles, l1 = THIGH_LEN, l2 = SHIN_LEN): LegAngles {
  const max = l1 + l2 - REACH_MARGIN;
  const min = Math.abs(l1 - l2) + REACH_MARGIN;
  const raw = Math.hypot(forward, down);
  const dist = Math.min(max, Math.max(min, raw));
  const base = raw > 1e-6 ? Math.atan2(forward, down) : 0;
  const cosHip = (l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist);
  const cosKnee = (l1 * l1 + l2 * l2 - dist * dist) / (2 * l1 * l2);
  out.thigh = base + Math.acos(Math.min(1, Math.max(-1, cosHip)));
  out.shin = -(Math.PI - Math.acos(Math.min(1, Math.max(-1, cosKnee))));
  return out;
}

/** Posición del pie (delante, abajo) que resulta de unos ángulos: sirve para comprobar la IK. */
export function legFoot(a: LegAngles, l1 = THIGH_LEN, l2 = SHIN_LEN): { forward: number; down: number } {
  const knee = a.thigh;
  const foot = a.thigh + a.shin;
  return { forward: l1 * Math.sin(knee) + l2 * Math.sin(foot), down: l1 * Math.cos(knee) + l2 * Math.cos(foot) };
}

export interface FootStep {
  /** Desplazamiento del pie a lo largo de la dirección de marcha (+ = por delante de la cadera). */
  along: number;
  /** Altura de la suela sobre el suelo. */
  lift: number;
}

/**
 * Trayectoria de un pie en el ciclo de marcha. Con la fase en [0, π) el pie está apoyado y
 * retrocede bajo el cuerpo; en [π, 2π) va por el aire hacia delante.
 */
export function footStep(phase: number, halfStride: number, liftHeight: number, out: FootStep): FootStep {
  out.along = halfStride * Math.cos(phase);
  out.lift = liftHeight * Math.max(0, -Math.sin(phase));
  return out;
}

/** Pasos por segundo según la velocidad: de un paseo (~1,8) a un sprint (~3,3). */
export function cadence(speed: number): number {
  return 1.7 + 1.6 * Math.min(1, Math.max(0, speed / 7));
}

/** Curva suave 0→1→0 para gestos de ida y vuelta (recarga, cambio de arma). */
export function bell(t: number): number {
  return Math.sin(Math.PI * Math.min(1, Math.max(0, t)));
}

/** Rampa suave entre dos bordes. */
export function smooth(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
