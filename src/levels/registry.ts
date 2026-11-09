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
    default:
      throw new Error(`Nivel no disponible todavía: ${id}`);
  }
}

export const LEVEL_IDS: readonly LevelId[] = ['arena', 'practice'];
