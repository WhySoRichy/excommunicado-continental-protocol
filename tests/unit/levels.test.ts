import { describe, expect, it } from 'vitest';
import { LEVEL_IDS, loadLevelData } from '../../src/levels/registry';
import { COVER_LOW_MIN, validateLevel } from '../../src/levels/validate';
import { CROUCH_HALF, MOVE, PLAYER_RADIUS } from '../../src/entities/PlayerController';

describe('datos de nivel', () => {
  it('el guion de la misión solo nombra enemigos, grupos, checkpoints e interactivos que existen', async () => {
    const data = structuredClone(await loadLevelData('nightclub'));
    const objectives = data.mission?.objectives ?? [];
    const eliminate = objectives.find((o) => o.kind === 'eliminate' && o.group);
    expect(eliminate, 'el Club Kairos tiene un objetivo de eliminar un grupo').toBeDefined();
    if (eliminate) eliminate.group = 'grupo-mal-escrito';
    objectives.push({ id: 'roto', kind: 'boss', text: 'Jefe', enemyId: 'nadie', checkpoint: 'tampoco' });
    const errs = validateLevel(data).join('\n');
    expect(errs).toContain('grupo grupo-mal-escrito');
    expect(errs).toContain('no existe el jefe nadie');
    expect(errs).toContain('no existe el checkpoint tampoco');
  });

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
