import { describe, expect, it } from 'vitest';
import { applyUpgrades, DEFAULT_LOADOUT, loadoutFor, normalizeLoadout, type UpgradeId, WEAPONS, weaponsFor } from '../../src/combat/weapons';
import { ALL_UPGRADES, newProfile } from '../../src/core/Save';
import { buy, canBuy, SHOP } from '../../src/hub/economy';

describe('arsenal: revólver y rifle de tirador', () => {
  it('cada arma ocupa un hueco del equipo: se lleva una por hueco, la de serie si no se elige otra', () => {
    expect(weaponsFor('primary')).toEqual(['carbine', 'shotgun', 'dmr']);
    expect(weaponsFor('secondary')).toEqual(['pistol', 'revolver']);
    expect(weaponsFor('melee')).toEqual(['knife']);
    expect(loadoutFor(new Set())).toEqual(['carbine', 'pistol', 'knife']);
    const all = new Set<UpgradeId>(['shotgun', 'dmr', 'revolver']);
    expect(loadoutFor(all, { ...DEFAULT_LOADOUT, primary: 'dmr', secondary: 'revolver' })).toEqual(['dmr', 'revolver', 'knife']);
  });

  it('el equipo se sanea: sin comprar, fuera de su hueco o inventado vuelve a la de serie', () => {
    const none = new Set<UpgradeId>();
    // Elegir el rifle de tirador sin haberlo comprado no lo da.
    expect(normalizeLoadout({ primary: 'dmr', secondary: 'pistol', melee: 'knife', gear: null }, none).primary).toBe('carbine');
    // Un arma en el hueco de otro tipo, un id inventado o un valor sin forma: lo de serie.
    expect(normalizeLoadout({ primary: 'pistol', secondary: 'carbine', melee: 'x' }, none)).toEqual(DEFAULT_LOADOUT);
    expect(normalizeLoadout('basura', none)).toEqual(DEFAULT_LOADOUT);
    expect(normalizeLoadout(null, none)).toEqual(DEFAULT_LOADOUT);
    // El equipo que se lanza solo si se tiene.
    expect(normalizeLoadout({ gear: 'stun' }, none).gear).toBeNull();
    expect(normalizeLoadout({ gear: 'stun' }, new Set<UpgradeId>(['stunGrenade'])).gear).toBe('stun');
  });

  it('el revólver pega más y dispara menos que la pistola; el rifle de tirador tiene más alcance y aumento que la carabina', () => {
    const { revolver, pistol, dmr, carbine } = WEAPONS;
    expect(revolver.damage).toBeGreaterThan(pistol.damage * 2);
    expect(revolver.mag).toBeLessThan(pistol.mag);
    expect(revolver.rpm).toBeLessThan(pistol.rpm);
    expect(revolver.reserve).toBe(Number.POSITIVE_INFINITY);
    expect(dmr.range).toBeGreaterThan(carbine.range);
    expect(dmr.auto).toBe(false);
    expect(dmr.aimFov).toBeLessThan(0.7);
    expect(dmr.spreadAim).toBeLessThan(carbine.spreadAim);
    expect(dmr.spreadHip).toBeGreaterThan(carbine.spreadHip);
  });

  it('el cargador extendido amplía el rifle de tirador pero no el tambor del revólver', () => {
    const owned = new Set<UpgradeId>(['extMag']);
    expect(applyUpgrades(WEAPONS.dmr, owned).mag).toBe(WEAPONS.dmr.mag + 4);
    expect(applyUpgrades(WEAPONS.revolver, owned).mag).toBe(6);
  });

  it('se compran en la armería y el guardado los reconoce', () => {
    const p = newProfile(0);
    p.coins = 20;
    expect(SHOP.some((s) => s.id === 'revolver')).toBe(true);
    expect(canBuy(p, 'dmr')).toBe('ok');
    expect(buy(p, 'revolver')).toBe(true);
    expect(buy(p, 'dmr')).toBe(true);
    expect(p.coins).toBe(0);
    expect(ALL_UPGRADES).toContain('revolver');
    expect(ALL_UPGRADES).toContain('dmr');
  });
});
