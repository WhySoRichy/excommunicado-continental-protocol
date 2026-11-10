import type { MissionStats } from '../combat/rank';
import type { Profile } from '../core/Save';
import type { MissionId, Rank } from './types';

/** Logros y desafíos (DISENO §5.3). Dan monedas una sola vez. */
export interface MissionRunSummary {
  mission: MissionId;
  rank: Rank;
  stats: MissionStats;
  alarmSounded: boolean;
  /** Salud mínima registrada durante el contrato. */
  minHealth: number;
  reloads: number;
  /** Tiradores abatidos con headshot / total de tiradores. */
  marksmenHeadshots: number;
  marksmenTotal: number;
  escapeSecondsLeft: number;
  gauntletWaves: number;
  styleBest: number;
}

export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  coins: number;
  /** Misión a la que pertenece (null = global). */
  mission: MissionId | null;
  check(run: MissionRunSummary, profile: Profile): boolean;
}

export const ACHIEVEMENTS: readonly AchievementDef[] = [
  // Simulacro
  { id: 'practice.clean', name: 'Calentamiento', desc: 'Completa el simulacro sin gastar marcadores.', coins: 1, mission: 'practice', check: (r) => r.stats.markersUsed === 0 },
  // Club Kairos
  { id: 'nightclub.noCivs', name: 'Nadie más', desc: 'Ningún civil herido.', coins: 2, mission: 'nightclub', check: (r) => r.stats.civiliansHurt === 0 && r.stats.civiliansKilled === 0 },
  { id: 'nightclub.ghost', name: 'Fantasma', desc: 'Sin disparar la alarma.', coins: 2, mission: 'nightclub', check: (r) => !r.alarmSounded },
  { id: 'nightclub.gunfu', name: 'Gun-fu', desc: '3 takedowns en el club.', coins: 2, mission: 'nightclub', check: (r) => r.stats.takedowns >= 3 },
  // Muelle 9
  { id: 'docks.fast', name: 'Demolición', desc: 'Menos de 4 minutos.', coins: 2, mission: 'docks', check: (r) => r.stats.timeSec < 240 },
  { id: 'docks.knife', name: 'Filo', desc: '5 bajas con cuchillo.', coins: 2, mission: 'docks', check: (r) => r.stats.knifeKills >= 5 },
  { id: 'docks.untouched', name: 'Intocable', desc: 'La salud nunca bajó de 100.', coins: 3, mission: 'docks', check: (r) => r.minHealth >= 100 },
  // Torre Meridian
  { id: 'rooftop.marksmen', name: 'Cazatiradores', desc: 'Todos los tiradores con headshot.', coins: 2, mission: 'rooftop', check: (r) => r.marksmenTotal > 0 && r.marksmenHeadshots >= r.marksmenTotal },
  { id: 'rooftop.punctual', name: 'Puntual', desc: 'Escapa con más de 20 s.', coins: 2, mission: 'rooftop', check: (r) => r.escapeSecondsLeft > 20 },
  { id: 'rooftop.economy', name: 'Economía de movimiento', desc: 'Máximo 2 recargas.', coins: 3, mission: 'rooftop', check: (r) => r.reloads <= 2 },
  // Gauntlet
  { id: 'gauntlet.w5', name: 'Oleada 5', desc: 'Supera la oleada 5.', coins: 2, mission: 'gauntlet', check: (r) => r.gauntletWaves >= 5 },
  { id: 'gauntlet.w10', name: 'Oleada 10', desc: 'Supera la oleada 10.', coins: 4, mission: 'gauntlet', check: (r) => r.gauntletWaves >= 10 },
  { id: 'gauntlet.x8', name: '×8', desc: 'Alcanza el multiplicador ×8 en el Gauntlet.', coins: 2, mission: 'gauntlet', check: (r) => r.styleBest >= 8 },
  // Globales
  { id: 'global.first', name: 'Primer contrato', desc: 'Completa tu primer contrato.', coins: 1, mission: null, check: (r) => r.mission !== 'gauntlet' },
  { id: 'global.rankS', name: 'Rango S', desc: 'Consigue un rango S.', coins: 3, mission: null, check: (r) => r.rank === 'S' },
  { id: 'global.collector', name: 'Coleccionista', desc: 'Compra 5 mejoras.', coins: 2, mission: null, check: (_r, p) => p.upgrades.length >= 5 },
];

export interface UnlockedAchievement {
  id: string;
  name: string;
  coins: number;
}

/** Evalúa los logros al terminar un contrato (muta `profile.achievements`). Devuelve los nuevos. */
export function evaluateAchievements(run: MissionRunSummary, profile: Profile): UnlockedAchievement[] {
  const out: UnlockedAchievement[] = [];
  for (const a of ACHIEVEMENTS) {
    if (a.mission !== null && a.mission !== run.mission) continue;
    if (profile.achievements.includes(a.id)) continue;
    if (!a.check(run, profile)) continue;
    profile.achievements.push(a.id);
    out.push({ id: a.id, name: a.name, coins: a.coins });
  }
  return out;
}

/** Logro "Excomunicado" (se concede desde el hub). */
export const EXCOM_ACHIEVEMENT: UnlockedAchievement = { id: 'global.excommunicado', name: 'Excomunicado', coins: 0 };
