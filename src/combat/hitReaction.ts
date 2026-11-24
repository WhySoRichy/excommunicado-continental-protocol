import type { Vector3 } from 'three';
import type { HitZone } from './damage';

/** Parte del cuerpo alcanzada: decide cómo se mueve quien la recibe y qué pierde. */
export type HitPart = 'torso' | 'head' | 'armL' | 'armR' | 'legL' | 'legR';

/** Lo que sobresale un brazo del tronco (m, a los lados del eje del cuerpo) y entre qué alturas cuelga (fracción). */
const ARM_SIDE = 0.2;
const ARM_LOW = 0.44;
const ARM_HIGH = 0.8;

/**
 * Qué parte alcanzó un disparo: `zone` por la altura y, dentro de ella, `lateral` (m a la derecha del enemigo, negativo a
 * la izquierda) y `height01` (altura del impacto, 0 en los pies y 1 en la coronilla).
 */
export function hitPart(zone: HitZone, lateral: number, height01: number): HitPart {
  if (zone === 'head') return 'head';
  if (zone === 'limb') return lateral < 0 ? 'legL' : 'legR';
  if (Math.abs(lateral) > ARM_SIDE && height01 > ARM_LOW && height01 < ARM_HIGH) return lateral < 0 ? 'armL' : 'armR';
  return 'torso';
}

/** Dónde dio un disparo y si fue un escopetazo a quemarropa. */
export interface HitInfo {
  readonly point: Vector3;
  blast: boolean;
}

/** Lo que pierde quien recibe el impacto (s): descolocado, sin puntería y cojeando. */
export interface Reaction {
  stagger: number;
  disarm: number;
  limp: number;
}

/** Aguante: se recupera a este ritmo (daño por segundo). */
export const POISE_RECOVERY = 40;
const STAGGER = 0.55;
const HEAD_STAGGER = 0.5;
const ARM_DISARM = 0.9;
const LEG_LIMP = 3;
/** Con un impacto así en la pierna, además tropieza. */
const LEG_STUMBLE = 26;

/**
 * Reacción a un impacto que no mata. `poise`: el daño acumulado que lleva encajado (con este incluido) frente a su
 * `limit`: al pasarlo se descoloca y empieza de cero (`reset`).
 */
export function reactTo(part: HitPart, amount: number, poise: number, limit: number, out: Reaction): { reset: boolean } {
  out.stagger = 0;
  out.disarm = 0;
  out.limp = 0;
  // Los que aguantan mucho (blindado, jefe) no pierden el paso por un solo impacto.
  const tough = limit > 100;
  if (part === 'head') out.stagger = tough ? 0.25 : HEAD_STAGGER;
  else if (part === 'armL' || part === 'armR') out.disarm = tough ? ARM_DISARM * 0.5 : ARM_DISARM;
  else if (part === 'legL' || part === 'legR') {
    out.limp = tough ? LEG_LIMP * 0.4 : LEG_LIMP;
    if (!tough && amount >= LEG_STUMBLE) out.stagger = STAGGER;
  }
  const reset = poise >= limit;
  if (reset) out.stagger = Math.max(out.stagger, STAGGER);
  return { reset };
}

/** Formas de caer: de bruces, de espaldas, de lado, en seco, despedido hacia atrás y de rodillas. */
export type DeathStyle = 0 | 1 | 2 | 3 | 4 | 5;

/** Un escopetazo a menos de esta distancia (m) despide hacia atrás a quien mata. */
export const BLAST_RANGE = 8;

/**
 * Cómo cae: por dónde le dieron (`front` > 0 de frente; `side`, lo que vino de lado), en qué parte y si fue un escopetazo
 * a quemarropa. `roll` (0..1) varía las caídas que tienen más de una.
 */
export function deathStyle(part: HitPart, front: number, side: number, blast: boolean, roll: number): DeathStyle {
  if (blast && front > 0) return 4;
  if (part === 'head') return front < 0 ? 0 : roll < 0.55 ? 3 : 1;
  if (part === 'legL' || part === 'legR') return 5;
  if (front < 0) return 0;
  if (Math.abs(side) < Math.abs(front) * 0.35) return roll < 0.35 ? 5 : 1;
  return 2;
}
