import { describe, expect, it } from 'vitest';
import { PlayerCombat } from '../../src/combat/PlayerCombat';
import { GEAR, type Loadout, loadoutFor, type UpgradeId, WEAPON_IDS } from '../../src/combat/weapons';
import { newProfile, type Profile } from '../../src/core/Save';
import {
  armoryItems,
  cycleOwned,
  gearStats,
  itemId,
  itemShop,
  itemState,
  itemUnlock,
  LOADOUT_SLOTS,
  ownedCount,
  UPGRADE_ITEMS,
  weaponStats,
} from '../../src/hub/armory';
import { SHOP } from '../../src/hub/economy';
import { ITEM_DESC, ITEM_NAMES } from '../../src/text/loadout';

function profile(upgrades: UpgradeId[] = [], coins = 0): Profile {
  const p = newProfile(0);
  p.upgrades.push(...upgrades);
  p.coins = coins;
  return p;
}

const item = (id: string) => LOADOUT_SLOTS.flatMap((s) => armoryItems(s)).find((x) => itemId(x) === id)!;

describe('armería: qué hay en cada hueco y en qué estado', () => {
  it('cuatro huecos con todas las armas y el equipo, cada pieza una vez, con su nombre y su descripción', () => {
    const ids = LOADOUT_SLOTS.flatMap((s) => armoryItems(s).map(itemId));
    expect(new Set(ids).size).toBe(ids.length);
    for (const w of WEAPON_IDS) expect(ids).toContain(w);
    for (const g of Object.keys(GEAR)) expect(ids).toContain(g);
    for (const id of ids) {
      expect(ITEM_NAMES[id].length).toBeGreaterThan(0);
      expect(ITEM_DESC[id].length).toBeGreaterThan(0);
    }
  });

  it('la tienda se reparte sin que falte ni se repita nada: piezas en equipo, el resto en mejoras', () => {
    const unlocks = LOADOUT_SLOTS.flatMap((s) => armoryItems(s))
      .map(itemUnlock)
      .filter((u) => u !== null);
    expect([...unlocks, ...UPGRADE_ITEMS.map((u) => u.id)].sort()).toEqual(SHOP.map((s) => s.id).sort());
    // Lo que se desbloquea tiene su precio en la tienda; lo de serie no está a la venta.
    expect(itemShop(item('dmr'))?.price).toBeGreaterThan(0);
    expect(itemShop(item('carbine'))).toBeNull();
  });

  it('estado de cada pieza: equipada, suya, a la venta o sin monedas', () => {
    const p = profile(['dmr'], 6);
    expect(itemState(p, item('carbine'))).toBe('equipped');
    expect(itemState(p, item('dmr'))).toBe('owned');
    expect(itemState(p, item('stun'))).toBe('buy');
    expect(itemState(p, item('shotgun'))).toBe('poor');
    p.loadout = { ...p.loadout, primary: 'dmr' };
    expect(itemState(p, item('dmr'))).toBe('equipped');
    expect(itemState(p, item('carbine'))).toBe('owned');
  });

  it('el selector compacto recorre lo que se tiene y en el equipo también «ninguno»', () => {
    const p = profile(['dmr', 'shotgun', 'stunGrenade']);
    expect(ownedCount(p, 'primary')).toBe(3);
    expect(ownedCount(p, 'secondary')).toBe(1);
    expect(cycleOwned(p, 'primary', 1)).toBe('shotgun');
    expect(cycleOwned(p, 'primary', -1)).toBe('dmr');
    expect(cycleOwned(p, 'secondary', 1), 'con una sola, se queda').toBe('pistol');
    expect(cycleOwned(p, 'gear', 1)).toBe('stun');
    p.loadout = { ...p.loadout, gear: 'stun' };
    expect(cycleOwned(p, 'gear', 1)).toBeNull();
  });

  it('las barras salen de las armas de verdad y caben en 0..1', () => {
    for (const id of WEAPON_IDS) {
      for (const b of weaponStats(id)) {
        expect(b.value, `${id} ${b.label}`).toBeGreaterThanOrEqual(0);
        expect(b.value).toBeLessThanOrEqual(1);
        expect(b.text.length).toBeGreaterThan(0);
      }
    }
    for (const b of gearStats('stun')) {
      expect(b.value, b.label).toBeGreaterThan(0);
      expect(b.value).toBeLessThanOrEqual(1);
    }
    const bar = (id: 'dmr' | 'carbine' | 'shotgun', label: string) => weaponStats(id).find((b) => b.label === label)!.value;
    expect(bar('dmr', 'Daño')).toBeGreaterThan(bar('carbine', 'Daño'));
    expect(bar('carbine', 'Cadencia')).toBeGreaterThan(bar('shotgun', 'Cadencia'));
  });
});

describe('cambiar de equipo en el vestíbulo', () => {
  const all = new Set<UpgradeId>(['dmr', 'revolver', 'stunGrenade', 'extMag']);
  const base: Loadout = { primary: 'carbine', secondary: 'pistol', melee: 'knife', gear: null };

  it('las armas que salen se guardan, las que entran llegan llenas y la que se empuñaba pasa a la de su hueco', () => {
    const c = new PlayerCombat(all, loadoutFor(all, base));
    expect(c.current).toBe('pistol');
    c.weapons.get('pistol')!.mag = 2;
    c.applyLoadout(all, loadoutFor(all, { ...base, secondary: 'revolver' }));
    expect(c.current, 'en el mismo hueco').toBe('revolver');
    expect([...c.weapons.keys()].sort()).toEqual(['carbine', 'knife', 'revolver']);
    expect(c.weapon.mag).toBe(c.weapon.def.mag);
    // Cambiar otro hueco no toca lo que se empuña ni su munición.
    c.weapon.mag = 1;
    c.applyLoadout(all, loadoutFor(all, { ...base, primary: 'dmr', secondary: 'revolver' }));
    expect(c.current).toBe('revolver');
    expect(c.weapon.mag).toBe(1);
    expect(c.loadout).toEqual(['dmr', 'revolver', 'knife']);
  });

  it('el equipo que se lanza se llena al equiparlo y no se rellena por volver a aplicar lo mismo', () => {
    const c = new PlayerCombat(all, loadoutFor(all, base));
    expect(c.gearLeft).toBe(0);
    c.applyLoadout(all, loadoutFor(all, base), 'stun');
    expect(c.gearLeft).toBe(GEAR.stun.count);
    c.gearLeft = 1;
    c.applyLoadout(all, loadoutFor(all, { ...base, primary: 'dmr' }), 'stun');
    expect(c.gearLeft, 'ya gastada').toBe(1);
    c.addGear(5);
    expect(c.gearLeft, 'sin pasar de lo que se lleva').toBe(GEAR.stun.count);
    c.applyLoadout(all, loadoutFor(all, base), null);
    expect(c.gear).toBeNull();
    expect(c.gearLeft).toBe(0);
  });
});
