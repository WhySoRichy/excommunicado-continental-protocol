import type { EnemyType, LevelData, MissionBlock, Vec3 } from '../levels/types';

/**
 * Gauntlet "Excomunicado": oleadas infinitas en el vestíbulo del Continental (lógica pura).
 * Cada oleada crece en número y mezcla; entre oleadas hay un respiro con curación parcial.
 */

/** Primera oleada: tres matones. */
export const GAUNTLET_FIRST_WAVE = 3;
/** Enemigos extra por oleada (se redondea hacia abajo). */
export const GAUNTLET_GROWTH = 1.5;
/** Tope de enemigos por oleada (legibilidad y rendimiento). */
export const GAUNTLET_MAX_PER_WAVE = 10;
/** Oleada desde la que aparecen escoltas, pesados, tiradores, sabuesos, escudos y drones. */
export const GAUNTLET_ESCORTS_FROM = 2;
export const GAUNTLET_HEAVY_FROM = 3;
export const GAUNTLET_MARKSMEN_FROM = 5;
export const GAUNTLET_HOUNDS_FROM = 4;
export const GAUNTLET_SHIELDS_FROM = 5;
export const GAUNTLET_DRONES_FROM = 6;
/** Como mucho, de cada uno de los nuevos. */
export const GAUNTLET_MAX_SPECIAL = 2;
/** Enemigos ligeros que lleva siempre una oleada. */
export const GAUNTLET_MIN_LIGHT = 2;
export const GAUNTLET_MAX_HEAVY = 3;
export const GAUNTLET_MAX_MARKSMEN = 2;
/** Fracción máxima de escoltas entre los enemigos "ligeros" de la oleada. */
export const GAUNTLET_ESCORT_SHARE_MAX = 0.7;
export const GAUNTLET_ESCORT_SHARE_PER_WAVE = 0.15;
/** Respiro entre oleadas (s) y salud que se recupera al superar una. */
export const GAUNTLET_BREAK = 5;
export const GAUNTLET_HEAL = 30;
/** Separación mínima para aparecer en un punto (que no se solapen cápsulas) y cadencia (s). */
export const GAUNTLET_SPAWN_CLEARANCE = 1.2;
export const GAUNTLET_SPAWN_INTERVAL = 0.5;
/** En el Gauntlet no hay marcadores: una sola vida. */
export const GAUNTLET_LIVES = 1;

export interface WavePlan {
  thug: number;
  escort: number;
  heavy: number;
  marksman: number;
  shield: number;
  hound: number;
  drone: number;
  total: number;
}

/** Composición de la oleada `n` (1, 2, 3…). */
export function gauntletWave(n: number): WavePlan {
  const w = Math.max(1, Math.floor(n));
  const total = Math.min(GAUNTLET_MAX_PER_WAVE, GAUNTLET_FIRST_WAVE + Math.floor((w - 1) * GAUNTLET_GROWTH));
  // Los especiales caben hasta dejar los ligeros de siempre: los que llevan menos oleadas apareciendo se quedan sin sitio.
  let room = total - GAUNTLET_MIN_LIGHT;
  const take = (n: number): number => {
    const k = Math.max(0, Math.min(room, n));
    room -= k;
    return k;
  };
  const since = (from: number, every: number, max: number): number => (w >= from ? Math.min(max, Math.floor((w - from) / every) + 1) : 0);
  const heavy = take(w >= GAUNTLET_HEAVY_FROM ? Math.min(GAUNTLET_MAX_HEAVY, Math.floor(w / GAUNTLET_HEAVY_FROM)) : 0);
  const marksman = take(since(GAUNTLET_MARKSMEN_FROM, 2, GAUNTLET_MAX_MARKSMEN));
  const hound = take(since(GAUNTLET_HOUNDS_FROM, 3, GAUNTLET_MAX_SPECIAL));
  const shield = take(since(GAUNTLET_SHIELDS_FROM, 4, GAUNTLET_MAX_SPECIAL));
  const drone = take(since(GAUNTLET_DRONES_FROM, 4, GAUNTLET_MAX_SPECIAL));
  const light = total - heavy - marksman - hound - shield - drone;
  const share = w >= GAUNTLET_ESCORTS_FROM ? Math.min(GAUNTLET_ESCORT_SHARE_MAX, GAUNTLET_ESCORT_SHARE_PER_WAVE * w) : 0;
  const escort = Math.round(light * share);
  return { thug: light - escort, escort, heavy, marksman, shield, hound, drone, total };
}

/** Orden de aparición: primero los ligeros (llegan antes) y al final los pesados y tiradores. */
export function waveQueue(plan: WavePlan): EnemyType[] {
  const q: EnemyType[] = [];
  for (let i = 0; i < plan.thug; i++) q.push('thug');
  for (let i = 0; i < plan.escort; i++) q.push('escort');
  for (let i = 0; i < plan.hound; i++) q.push('hound');
  for (let i = 0; i < plan.drone; i++) q.push('drone');
  for (let i = 0; i < plan.marksman; i++) q.push('marksman');
  for (let i = 0; i < plan.shield; i++) q.push('shield');
  for (let i = 0; i < plan.heavy; i++) q.push('heavy');
  return q;
}

/** Puntos de entrada de las oleadas: los de las oleadas del Excomunicado del propio nivel (sin repetir). */
export function gauntletSpawnPoints(level: LevelData): Vec3[] {
  const out: Vec3[] = [];
  for (const e of level.enemies) {
    if (!e.spawnOn?.startsWith('excom-')) continue;
    if (out.some((p) => Math.hypot(p[0] - e.pos[0], p[2] - e.pos[2]) < 0.5)) continue;
    out.push(e.pos);
  }
  return out;
}

/** Guion del Gauntlet (no vive en los datos del hub: el hub es zona neutral). */
export const GAUNTLET_BLOCK: MissionBlock = {
  id: 'gauntlet',
  lives: GAUNTLET_LIVES,
  objectives: [{ id: 'waves', kind: 'waves', text: 'Sobrevive' }],
};
