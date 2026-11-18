import { describe, expect, it } from 'vitest';
import { LEVEL_IDS, loadLevelData } from '../../src/levels/registry';
import { COVER_LOW_MIN, validateLevel } from '../../src/levels/validate';
import { CROUCH_HALF, MOVE, PLAYER_RADIUS } from '../../src/entities/PlayerController';

describe('datos de nivel', () => {
  it('una cobertura baja tapa a un personaje agachado y se puede saltar', () => {
    expect(2 * (CROUCH_HALF + PLAYER_RADIUS)).toBeLessThan(COVER_LOW_MIN);
    expect(COVER_LOW_MIN).toBeLessThanOrEqual(MOVE.vaultMaxH);
  });

  for (const id of LEVEL_IDS) {
    it(`${id}: pasa la validación (luz mínima, spawns libres, ids únicos)`, async () => {
      const data = await loadLevelData(id);
      expect(validateLevel(data)).toEqual([]);
    });
  }
});
