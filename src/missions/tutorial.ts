import { ACTIONS, type Action } from '../core/actions';
import type { SkillId } from '../levels/types';

/**
 * Tutorial jugable (lógica pura): cada paso `learn` se valida con contadores que ya llevan
 * el jugador y el combate. Los textos usan la tecla real asignada (`{sprint}` → "Shift").
 */
export interface SkillCounters {
  distance: number;
  sprintTime: number;
  vaults: number;
  mantles: number;
  slides: number;
  rolls: number;
  dives: number;
  coverEnters: number;
  shotsFired: number;
  reloads: number;
  switches: number;
  focusUses: number;
  takedowns: number;
}

export function emptyCounters(): SkillCounters {
  return { distance: 0, sprintTime: 0, vaults: 0, mantles: 0, slides: 0, rolls: 0, dives: 0, coverEnters: 0, shotsFired: 0, reloads: 0, switches: 0, focusUses: 0, takedowns: 0 };
}

export function copyCounters(from: SkillCounters, to: SkillCounters): SkillCounters {
  to.distance = from.distance;
  to.sprintTime = from.sprintTime;
  to.vaults = from.vaults;
  to.mantles = from.mantles;
  to.slides = from.slides;
  to.rolls = from.rolls;
  to.dives = from.dives;
  to.coverEnters = from.coverEnters;
  to.shotsFired = from.shotsFired;
  to.reloads = from.reloads;
  to.switches = from.switches;
  to.focusUses = from.focusUses;
  to.takedowns = from.takedowns;
  return to;
}

/** Cuánto hay que hacer de cada habilidad (metros, segundos o veces). */
export const SKILL_GOAL: Record<SkillId, number> = {
  move: 4,
  sprint: 1.2,
  vault: 1,
  slide: 1,
  dodge: 1,
  cover: 1,
  shoot: 3,
  reload: 1,
  switch: 1,
  focus: 1,
  takedown: 1,
};

export function skillCount(skill: SkillId, c: SkillCounters): number {
  switch (skill) {
    case 'move':
      return c.distance;
    case 'sprint':
      return c.sprintTime;
    case 'vault':
      return c.vaults + c.mantles;
    case 'slide':
      return c.slides;
    case 'dodge':
      return c.rolls + c.dives;
    case 'cover':
      return c.coverEnters;
    case 'shoot':
      return c.shotsFired;
    case 'reload':
      return c.reloads;
    case 'switch':
      return c.switches;
    case 'focus':
      return c.focusUses;
    case 'takedown':
      return c.takedowns;
  }
}

/** Progreso 0..1 del paso desde que empezó (`base`). */
export function skillProgress(skill: SkillId, base: SkillCounters, now: SkillCounters): number {
  const done = skillCount(skill, now) - skillCount(skill, base);
  return Math.max(0, Math.min(1, done / SKILL_GOAL[skill]));
}

/** Pasos con más de una repetición muestran "n/N" en el HUD; el resto, nada. */
export function skillTally(skill: SkillId, base: SkillCounters, now: SkillCounters): number | null {
  const goal = SKILL_GOAL[skill];
  if (goal <= 1 || skill === 'move' || skill === 'sprint') return null;
  return Math.min(goal, Math.floor(skillCount(skill, now) - skillCount(skill, base)));
}

const MOVE_ACTIONS: readonly Action[] = ['moveForward', 'moveLeft', 'moveBack', 'moveRight'];
const ACTION_SET: ReadonlySet<string> = new Set(ACTIONS);

/** Sustituye `{accion}` por su tecla real y `{move}` por las cuatro de movimiento ("WASD"). */
export function formatObjective(text: string, label: (a: Action) => string): string {
  return text.replace(/\{(\w+)\}/g, (whole, token: string) => {
    if (token === 'move') {
      const keys = MOVE_ACTIONS.map((a) => label(a));
      return keys.every((k) => /^[A-Z0-9]$/.test(k)) ? keys.join('') : keys.join(' / ');
    }
    return ACTION_SET.has(token) ? label(token as Action) : whole;
  });
}
