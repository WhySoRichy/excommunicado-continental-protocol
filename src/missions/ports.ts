import type { Vec3Like } from '../physics/Physics';

/**
 * Puertos de los directores (misión y vestíbulo): lo que necesitan de la interfaz y del sonido. Los implementan `Hud`
 * y `AudioEngine`; los directores no importan ninguno de los dos. Ver docs/ESCALABILIDAD.md.
 */
export interface MissionHud {
  showToast(text: string, seconds?: number): void;
  setObjective(text: string): void;
  setZone(text: string): void;
  setCombatVisible(v: boolean): void;
}

export interface MissionAudio {
  ui(kind: 'click' | 'coin' | 'error' | 'confirm'): void;
  alert(pos?: Vec3Like): void;
  siren(on: boolean): void;
}
