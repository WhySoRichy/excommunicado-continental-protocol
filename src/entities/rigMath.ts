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
/** Tramo final del alcance en el que la pierna se acerca a su tope con suavidad en vez de frenar en seco. */
const REACH_SOFT = 0.05;

export interface LegAngles {
  /** Rotación X del muslo (+ = hacia delante). */
  thigh: number;
  /** Rotación X de la espinilla relativa al muslo (≤ 0 = rodilla flexionada). */
  shin: number;
}

/**
 * IK de dos huesos en el plano sagital. El pie debe quedar a `forward` metros por delante
 * de la cadera y `down` metros por debajo. La rodilla siempre apunta hacia delante.
 * Si el objetivo está fuera de alcance, la pierna se estira hacia él. En los últimos `REACH_SOFT` m el alcance se
 * satura con suavidad: con un tope seco, la rodilla se estiraba deprisa y se paraba de golpe a cada paso.
 */
export function solveLeg(forward: number, down: number, out: LegAngles, l1 = THIGH_LEN, l2 = SHIN_LEN): LegAngles {
  const max = l1 + l2 - REACH_MARGIN;
  const min = Math.abs(l1 - l2) + REACH_MARGIN;
  const raw = Math.hypot(forward, down);
  const knee = max - REACH_SOFT;
  const reach = raw > knee ? max - REACH_SOFT * Math.exp((knee - raw) / REACH_SOFT) : raw;
  const dist = Math.max(min, reach);
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
 * retrocede bajo el cuerpo; en [π, 2π) va por el aire hacia delante. El pie despega y se posa
 * con velocidad vertical nula (con `max(0, −sin)` a secas, la pierna daba un tirón en cada despegue).
 */
export function footStep(phase: number, halfStride: number, liftHeight: number, out: FootStep): FootStep {
  out.along = halfStride * Math.cos(phase);
  const up = Math.max(0, -Math.sin(phase));
  out.lift = liftHeight * up * up * (3 - 2 * up);
  return out;
}

/**
 * Cabeceo del pie en el ciclo de marcha (rad, + = punta arriba), con la misma fase que
 * `footStep`: al final del apoyo se levanta el talón, en el aire la punta cuelga y antes
 * de pisar sube para entrar de talón.
 */
export function footPitch(phase: number): number {
  const tau = Math.PI * 2;
  const ph = ((phase % tau) + tau) % tau;
  if (ph < Math.PI) return -0.4 * smooth(0.7, 1, ph / Math.PI);
  const u = (ph - Math.PI) / Math.PI;
  return -0.4 * (1 - smooth(0, 0.45, u)) - 0.25 * Math.sin(Math.PI * u) * (1 - u) + 0.3 * smooth(0.5, 1, u) * (1 - smooth(0.9, 1, u));
}

export interface ArmReach {
  /** Flexión del codo (≥ 0). */
  elbow: number;
  /** Mano en el espacio del brazo con el hombro sin girar: componentes Y y Z (X = 0). */
  hy: number;
  hz: number;
}

/**
 * IK del brazo, parte plana: flexión del codo para que la mano quede a `dist` del hombro, y
 * dónde queda entonces la mano con el hombro sin girar (el brazo cuelga hacia −Y y el codo
 * flexiona hacia delante, −Z). El rig gira después el hombro para llevar ese vector al objetivo.
 * Fuera de alcance, el brazo se estira.
 */
export function solveArm(dist: number, l1: number, l2: number, out: ArmReach): ArmReach {
  const d = Math.min(l1 + l2 - 0.004, Math.max(Math.abs(l1 - l2) + 0.02, dist));
  const cosIn = (l1 * l1 + l2 * l2 - d * d) / (2 * l1 * l2);
  out.elbow = Math.PI - Math.acos(Math.min(1, Math.max(-1, cosIn)));
  out.hy = -l1 - l2 * Math.cos(out.elbow);
  out.hz = -l2 * Math.sin(out.elbow);
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

/** Como `smooth`, pero también sin saltos de aceleración en los bordes: para gestos rápidos (el tajo). */
export function smoother(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/** Estado de un muelle: valor y velocidad. */
export interface Spring {
  x: number;
  v: number;
}

/**
 * Muelle críticamente amortiguado: lleva `s.x` hacia `target` sin rebote y sin saltos de velocidad. Al cambiar
 * el objetivo arranca y frena con suavidad, al contrario que `damp`, cuya velocidad salta en el mismo fotograma.
 * `omega` es la rigidez (1/s): recorre el 90 % de un cambio en unos 3,9/omega segundos. Exacto para cualquier `dt`.
 */
export function spring(s: Spring, target: number, omega: number, dt: number): number {
  const x = s.x - target;
  const t = (s.v + omega * x) * dt;
  const e = Math.exp(-omega * dt);
  s.v = (s.v - omega * t) * e;
  s.x = target + (x + t) * e;
  return s.x;
}

export interface LookAngles {
  /** Giro respecto al frente del cuerpo (rad, + hacia la izquierda), entre −π y π. */
  yaw: number;
  /** Inclinación (rad, + hacia arriba). */
  pitch: number;
}

/**
 * Ángulos para mirar desde un punto a otro, relativos a un cuerpo cuyo frente es −Z girado `bodyYaw`
 * (el mismo convenio que el resto del rig). No recorta: eso lo decide quien los aplica.
 */
export function lookAngles(fromX: number, fromY: number, fromZ: number, bodyYaw: number, toX: number, toY: number, toZ: number, out: LookAngles): LookAngles {
  const dx = toX - fromX;
  const dz = toZ - fromZ;
  const rel = Math.atan2(-dx, -dz) - bodyYaw;
  out.yaw = Math.atan2(Math.sin(rel), Math.cos(rel));
  out.pitch = Math.atan2(toY - fromY, Math.hypot(dx, dz));
  return out;
}

/** Cuánto sigue la cabeza un punto: del todo hasta unos 90°, nada si queda a la espalda (no gira 180°). */
export function lookWeight(yaw: number): number {
  return 1 - smooth(1.6, 2.2, Math.abs(yaw));
}

/** Giro visual del cuerpo: muelle sobre el giro de la simulación (ver `updateBodyYaw`). */
export interface BodyYaw {
  /** Giro suavizado (rad, sin envolver) y su velocidad; `x` NaN = aún sin colocar. */
  readonly spring: Spring;
  /** 0..1 cuánto manda el giro exacto (apuntando). */
  exact: number;
  /** Giro de la simulación en el fotograma anterior (para detectar teletransportes). */
  last: number;
}

export function bodyYaw(): BodyYaw {
  return { spring: { x: Number.NaN, v: 0 }, exact: 0, last: 0 };
}

const wrapPi = (a: number): number => Math.atan2(Math.sin(a), Math.cos(a));

/**
 * Giro visual del cuerpo. La simulación gira a ritmo constante (hasta 14 rad/s) y arranca y frena en seco: al cambiar
 * de sentido, el cuerpo pasaba de quieto a girar a toda velocidad de un fotograma al siguiente. El cuerpo lo sigue con
 * un muelle; apuntando manda el giro exacto (el arma tiene que seguir a la mira). Un salto mayor de lo que se puede
 * girar en un fotograma (teletransporte, encarar un takedown) se aplica de golpe.
 */
export function updateBodyYaw(b: BodyYaw, simYaw: number, aiming: boolean, dt: number, omega = 18): number {
  const s = b.spring;
  if (Number.isNaN(s.x) || Math.abs(wrapPi(simYaw - b.last)) > Math.max(0.6, 32 * dt)) {
    s.x = simYaw;
    s.v = 0;
  }
  b.last = simYaw;
  // Sin envolver se acumularía con las vueltas: se recoloca cerca de cero sin cambiar el ángulo.
  if (Math.abs(s.x) > 64) s.x = wrapPi(s.x);
  spring(s, s.x + wrapPi(simYaw - s.x), omega, dt);
  b.exact += ((aiming ? 1 : 0) - b.exact) * (1 - Math.exp(-14 * dt));
  return s.x + wrapPi(simYaw - s.x) * b.exact;
}
