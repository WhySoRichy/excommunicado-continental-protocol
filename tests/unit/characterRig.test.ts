import { describe, expect, it } from 'vitest';
import { CharacterRig, PLAYER_LOOK } from '../../src/entities/CharacterRig';

describe('material de los personajes', () => {
  it('uno compartido sobrevive a quien lo suelta; uno propio se libera con su personaje', () => {
    // Antes, al salir del vestíbulo cada NPC liberaba el material compartido que la caché seguía entregando.
    const a = new CharacterRig('npc:prueba', { ...PLAYER_LOOK });
    const b = new CharacterRig('npc:prueba', { ...PLAYER_LOOK });
    expect(b.material).toBe(a.material);
    let shared = 0;
    a.material.addEventListener('dispose', () => shared++);
    a.dispose();
    b.dispose();
    expect(shared, 'la caché conserva el material compartido').toBe(0);
    expect(new CharacterRig('npc:prueba', { ...PLAYER_LOOK }).material).toBe(a.material);

    const own = new CharacterRig('enemigo:prueba', { ...PLAYER_LOOK, uniqueMaterial: true });
    let owned = 0;
    own.material.addEventListener('dispose', () => owned++);
    own.dispose();
    expect(owned, 'el material propio se libera con el personaje').toBe(1);
  });
});
