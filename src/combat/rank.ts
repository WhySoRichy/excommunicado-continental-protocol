import type { Rank } from '../missions/types';

/**
 * Rango del contrato D–S (lógica PURA). GAME_DESIGN §5.1:
 * cinco subnotas 0–100 (tiempo, precisión, daño recibido, variedad, civiles ilesos) con el
 * mismo peso; si el nivel no tiene civiles, el peso se reparte. Bonus de estilo hasta +10,
 * −15 por cada marcador gastado. Matar a un civil limita el rango a C.
 */
export interface MissionStats {
  timeSec: number;
  parTime: number;
  shotsFired: number;
  shotsHit: number;
  takedowns: number;
  knifeKills: number;
  damageTaken: number;
  /** Salud + integridad máximas (referencia del daño "soportable"). */
  healthPool: number;
  varietyCount: number;
  hasCivilians: boolean;
  civiliansHurt: number;
  civiliansKilled: number;
  markersUsed: number;
  /** Mejor multiplicador de estilo alcanzado (1..8). */
  styleBest: number;
}

export interface SubScores {
  time: number;
  accuracy: number;
  damage: number;
  variety: number;
  civilians: number | null;
}

export interface RankResult {
  subs: SubScores;
  styleBonus: number;
  markerPenalty: number;
  total: number;
  rank: Rank;
  /** El rango quedó limitado a C por matar a un civil. */
  capped: boolean;
}

export const RANK_THRESHOLDS: ReadonlyArray<[Rank, number]> = [
  ['S', 88],
  ['A', 74],
  ['B', 58],
  ['C', 40],
];
export const MARKER_PENALTY = 15;
export const STYLE_BONUS_MAX = 10;
export const VARIETY_FULL = 6;

const clamp100 = (v: number): number => Math.max(0, Math.min(100, v));

export function timeScore(timeSec: number, parTime: number): number {
  if (parTime <= 0) return 100;
  if (timeSec <= parTime) return 100;
  return clamp100(100 * (1 - (timeSec - parTime) / parTime));
}

export function accuracyScore(fired: number, hit: number, takedowns: number, knifeKills: number): number {
  if (fired <= 0) return takedowns + knifeKills > 0 ? 100 : 50;
  return clamp100((100 * hit) / fired);
}

export function damageScore(taken: number, pool: number): number {
  if (pool <= 0) return 100;
  return clamp100(100 * (1 - taken / (1.5 * pool)));
}

export function varietyScore(count: number): number {
  return clamp100((100 * count) / VARIETY_FULL);
}

export function civilianScore(hurt: number, killed: number): number {
  return clamp100(100 - 40 * hurt - 100 * killed);
}

export function rankFor(total: number): Rank {
  for (const [r, min] of RANK_THRESHOLDS) if (total >= min) return r;
  return 'D';
}

const RANK_ORDER: readonly Rank[] = ['D', 'C', 'B', 'A', 'S'];

export function computeRank(s: MissionStats): RankResult {
  const subs: SubScores = {
    time: timeScore(s.timeSec, s.parTime),
    accuracy: accuracyScore(s.shotsFired, s.shotsHit, s.takedowns, s.knifeKills),
    damage: damageScore(s.damageTaken, s.healthPool),
    variety: varietyScore(s.varietyCount),
    civilians: s.hasCivilians ? civilianScore(s.civiliansHurt, s.civiliansKilled) : null,
  };
  const parts = [subs.time, subs.accuracy, subs.damage, subs.variety, ...(subs.civilians === null ? [] : [subs.civilians])];
  const base = parts.reduce((a, b) => a + b, 0) / parts.length;
  const styleBonus = Math.min(STYLE_BONUS_MAX, Math.max(0, (s.styleBest - 1) * (STYLE_BONUS_MAX / 7)));
  const markerPenalty = MARKER_PENALTY * Math.max(0, s.markersUsed);
  const total = Math.round(clamp100(base + styleBonus - markerPenalty) * 10) / 10;
  let rank = rankFor(total);
  let capped = false;
  if (s.hasCivilians && s.civiliansKilled > 0 && RANK_ORDER.indexOf(rank) > RANK_ORDER.indexOf('C')) {
    rank = 'C';
    capped = true;
  }
  return { subs, styleBonus: Math.round(styleBonus * 10) / 10, markerPenalty, total, rank, capped };
}

export function rankIndex(r: Rank): number {
  return RANK_ORDER.indexOf(r);
}
