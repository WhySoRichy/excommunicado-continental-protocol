import { describe, expect, it } from 'vitest';
import { LEVEL_IDS, loadLevelData } from '../../src/levels/registry';
import { validateLevel } from '../../src/levels/validate';

describe('datos de nivel', () => {
  for (const id of LEVEL_IDS) {
    it(`${id}: pasa la validación (luz mínima, spawns libres, ids únicos)`, async () => {
      const data = await loadLevelData(id);
      expect(validateLevel(data)).toEqual([]);
    });
  }
});
