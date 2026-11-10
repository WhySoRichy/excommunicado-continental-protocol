import type { LevelData, LevelId } from './types';

/**
 * Carga perezosa de datos de nivel: cada nivel es su propio chunk (división de código por nivel).
 */
export async function loadLevelData(id: LevelId): Promise<LevelData> {
  switch (id) {
    case 'arena':
      return (await import('./data/arena')).arena;
    case 'practice':
      return (await import('./data/practice')).practice;
    case 'hub':
      return (await import('./data/hub')).hub;
    case 'nightclub':
      return (await import('./data/nightclub')).nightclub;
    case 'docks':
      return (await import('./data/docks')).docks;
    case 'rooftop':
      return (await import('./data/rooftop')).rooftop;
    default:
      throw new Error(`Nivel no disponible todavía: ${id}`);
  }
}

export const LEVEL_IDS: readonly LevelId[] = ['arena', 'practice', 'hub', 'nightclub', 'docks', 'rooftop'];
