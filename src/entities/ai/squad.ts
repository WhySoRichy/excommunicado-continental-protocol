import { clamp, wrapAngle } from '../../core/math';

/**
 * La escuadra (lógica pura): reparte entre los enemigos que pelean con un mismo jugador quién dispara y quién rodea. Con
 * muchos a la vez solo unos pocos tienen turno de disparo (los demás se mueven, se cubren o esperan), y cuando uno
 * flanquea los otros lo cubren con fuego. Así un grupo se lee y se juega como un grupo, no como una suma de tiradores.
 */
export interface SquadMember {
  /** Pelea ahora mismo (combate, cobertura o flanqueo), sin estar aturdido. */
  fighting: boolean;
  canSee: boolean;
  /** Avisa antes de cada disparo (láser, alzar la escopeta): no gasta turno. */
  telegraphs: boolean;
  /** Puede rodear ahora: se mueve y está en combate abierto. */
  canFlank: boolean;
  /** Le va lo de rodear (escolta). */
  flanker: boolean;
  flanking: boolean;
  distance: number;
  /** Dirección desde el jugador hacia él (rad). */
  angle: number;
  /** Segundos que lleva con turno (0 sin él) y esperándolo. */
  turnT: number;
  waitT: number;
}

export interface SquadOrder {
  mayFire: boolean;
  /** Rodear por un lado: −1 o +1 (0, ninguno). */
  flank: -1 | 0 | 1;
  /** Cubre a quien rodea: dispara aunque no vea, hacia donde vio al jugador. */
  covering: boolean;
}

/** Turnos de disparo para un grupo de `n`: hasta tres siempre, y uno más por cada dos de más, hasta seis. */
export function fireTurns(n: number): number {
  return clamp(3 + Math.floor(Math.max(0, n - 3) / 2), 1, 6);
}

/** Lo que dura un turno si otro lo espera (s). */
export const TURN_TIME = 2.4;
/** Con menos de estos, nadie rodea: no habría quien lo cubriera. */
export const FLANK_MIN = 3;
/** Como mucho, uno por cada lado. */
const MAX_FLANKERS = 2;

/**
 * Reparte las órdenes de un grupo. `flankReady`: ha pasado el tiempo desde el último que rodeó. Devuelve si alguien
 * recibió la orden de rodear.
 */
export function planSquad(members: readonly SquadMember[], flankReady: boolean, out: SquadOrder[]): boolean {
  out.length = members.length;
  let fighting = 0;
  let flanking = 0;
  let sx = 0;
  let sz = 0;
  for (let i = 0; i < members.length; i++) {
    const m = members[i]!;
    out[i] ??= { mayFire: false, flank: 0, covering: false };
    const o = out[i]!;
    o.mayFire = !m.fighting || m.telegraphs;
    o.flank = 0;
    o.covering = false;
    if (!m.fighting) continue;
    fighting++;
    if (m.flanking) flanking++;
    sx += Math.sin(m.angle);
    sz += Math.cos(m.angle);
  }
  // Turnos: los conserva quien los tiene hasta que le toca a otro; después, quien ve y lleva más esperando.
  let left = fireTurns(fighting);
  const score = (m: SquadMember): number => (m.canSee ? 4 : 0) + m.waitT - m.distance * 0.05 + (m.turnT > 0 && m.turnT < TURN_TIME ? 100 : 0);
  const order = members.map((_, i) => i).filter((i) => members[i]!.fighting && !members[i]!.telegraphs);
  order.sort((a, b) => score(members[b]!) - score(members[a]!) || a - b);
  for (const i of order) {
    if (left <= 0) break;
    out[i]!.mayFire = true;
    left--;
  }
  // Rodear: el que mejor se presta, por el lado hacia el que ya está.
  let ordered = false;
  if (flankReady && fighting >= FLANK_MIN && flanking < MAX_FLANKERS) {
    const mean = Math.atan2(sx, sz);
    let best = -1;
    let bestScore = -1;
    for (let i = 0; i < members.length; i++) {
      const m = members[i]!;
      if (!m.fighting || !m.canFlank || m.flanking) continue;
      const off = wrapAngle(m.angle - mean);
      const s = (m.flanker ? 2 : 0) + Math.min(1.5, Math.abs(off)) - m.distance * 0.03;
      if (s > bestScore) {
        bestScore = s;
        best = i;
      }
    }
    if (best >= 0) {
      out[best]!.flank = wrapAngle(members[best]!.angle - mean) >= 0 ? 1 : -1;
      flanking++;
      ordered = true;
    }
  }
  if (flanking > 0) {
    for (let i = 0; i < members.length; i++) {
      const m = members[i]!;
      out[i]!.covering = m.fighting && !m.flanking && out[i]!.flank === 0 && out[i]!.mayFire;
    }
  }
  return ordered;
}
