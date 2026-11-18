import type { ObjectiveDef } from '../levels/types';

/**
 * Reglas de los objetivos de un contrato, sin three ni entidades: el director observa el mundo,
 * rellena `ObjectiveFacts` y aplica lo que diga `evaluateObjective`. El tutorial (`tutorial.ts`) y las
 * oleadas del Gauntlet (`gauntlet.ts`) tienen sus propias reglas puras.
 */
export interface ObjectiveFacts {
  /** Segundos desde que empezó el objetivo. */
  elapsed: number;
  /** Enemigos que cuentan para el objetivo (su grupo o, si es un jefe, el jefe): vistos y vivos. */
  seen: number;
  alive: number;
  /** Vida del jefe en tanto por uno. */
  bossHealth: number;
  /** ¿El jugador está en la zona del objetivo? */
  inZone: boolean;
  /** Interactivos del objetivo que ya se usaron. */
  targetsDone: number;
}

export function emptyFacts(): ObjectiveFacts {
  return { elapsed: 0, seen: 0, alive: 0, bossHealth: 1, inZone: false, targetsDone: 0 };
}

/** Contador que acompaña al texto del objetivo en el HUD. */
export type ObjectiveCounter = 'seconds' | 'remaining' | 'fraction' | 'percent';

export interface ObjectiveVerdict {
  status: 'pending' | 'complete' | 'failed';
  counter: ObjectiveCounter | null;
  count: number;
  /** Total del contador `fraction` (n de total). */
  total: number;
}

export function emptyVerdict(): ObjectiveVerdict {
  return { status: 'pending', counter: null, count: 0, total: 0 };
}

/** Duración por defecto de los objetivos con reloj (s). */
export const ESCAPE_SECONDS = 45;
export const SURVIVE_SECONDS = 30;

/** Segundos que le quedan a un objetivo con reloj (escapar o sobrevivir). */
export function objectiveTimeLeft(o: ObjectiveDef, elapsed: number): number {
  const total = o.seconds ?? (o.kind === 'escape' ? ESCAPE_SECONDS : SURVIVE_SECONDS);
  return Math.max(0, total - elapsed);
}

/** Evalúa el objetivo en curso. Escribe en `out` (se reutiliza: no asigna en cada paso) y lo devuelve. */
export function evaluateObjective(o: ObjectiveDef, f: ObjectiveFacts, out: ObjectiveVerdict): ObjectiveVerdict {
  out.status = 'pending';
  out.counter = null;
  out.count = 0;
  out.total = 0;
  switch (o.kind) {
    case 'escape': {
      // El reloj manda: si se agota, se falla aunque se llegue en ese mismo paso.
      const left = objectiveTimeLeft(o, f.elapsed);
      out.counter = 'seconds';
      out.count = Math.ceil(left);
      if (left <= 0) out.status = 'failed';
      else if (o.at && f.inZone) out.status = 'complete';
      break;
    }
    case 'reach':
      if (o.at && f.inZone) out.status = 'complete';
      break;
    case 'eliminate':
      if (f.seen > 0 && f.alive === 0) out.status = 'complete';
      else if (f.alive > 0 && f.elapsed > 0.5) {
        out.counter = 'remaining';
        out.count = f.alive;
      }
      break;
    case 'interact': {
      const total = o.targets?.length ?? 0;
      if (f.targetsDone >= total) out.status = 'complete';
      else if (total > 1) {
        out.counter = 'fraction';
        out.count = f.targetsDone;
        out.total = total;
      }
      break;
    }
    case 'survive': {
      const left = objectiveTimeLeft(o, f.elapsed);
      out.counter = 'seconds';
      out.count = Math.ceil(left);
      if (left <= 0) out.status = 'complete';
      break;
    }
    case 'boss':
      if (f.seen > 0 && f.alive === 0) out.status = 'complete';
      else if (f.alive > 0) {
        out.counter = 'percent';
        out.count = Math.ceil(f.bossHealth * 100);
      }
      break;
    case 'learn':
    case 'waves':
      break;
  }
  return out;
}
