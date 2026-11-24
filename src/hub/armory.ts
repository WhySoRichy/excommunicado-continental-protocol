import { STUN } from '../combat/Grenades';
import {
  GEAR,
  GEAR_IDS,
  type GearId,
  gearUnlock,
  type LoadoutSlot,
  ownsGear,
  ownsWeapon,
  type UpgradeId,
  WEAPONS,
  type WeaponId,
  type WeaponSlot,
  weaponsFor,
  weaponUnlock,
} from '../combat/weapons';
import type { Profile } from '../core/Save';
import { canBuy, SHOP, type ShopItem, shopItem } from './economy';

/**
 * La armería (lógica pura): qué hay en cada hueco del equipo, en qué estado está cada pieza para el jugador (equipada,
 * suya, a la venta...), las barras de cada arma y cómo se pasa de una a otra en los selectores compactos.
 */
export const LOADOUT_SLOTS: readonly LoadoutSlot[] = ['primary', 'secondary', 'melee', 'gear'];

/** Una pieza de la armería: un arma de un hueco o un equipo. */
export type ArmoryItem = { readonly slot: WeaponSlot; readonly weapon: WeaponId } | { readonly slot: 'gear'; readonly gear: GearId };

export function armoryItems(slot: LoadoutSlot): ArmoryItem[] {
  if (slot === 'gear') return GEAR_IDS.map((gear) => ({ slot, gear }));
  return weaponsFor(slot).map((weapon) => ({ slot, weapon }));
}

export function itemId(item: ArmoryItem): WeaponId | GearId {
  return 'weapon' in item ? item.weapon : item.gear;
}

/** La mejora que lo desbloquea, o null si es de serie. */
export function itemUnlock(item: ArmoryItem): UpgradeId | null {
  return 'weapon' in item ? weaponUnlock(item.weapon) : gearUnlock(item.gear);
}

function owns(p: Profile, item: ArmoryItem): boolean {
  const owned = new Set(p.upgrades);
  return 'weapon' in item ? ownsWeapon(owned, item.weapon) : ownsGear(owned, item.gear);
}

/** `equipped`: la lleva; `owned`: es suya; `buy`: puede comprarla; `poor`: le faltan monedas; `locked`: requiere otra. */
export type ItemState = 'equipped' | 'owned' | 'buy' | 'poor' | 'locked';

export function itemState(p: Profile, item: ArmoryItem): ItemState {
  if (p.loadout[item.slot] === itemId(item)) return 'equipped';
  if (owns(p, item)) return 'owned';
  const unlock = itemUnlock(item);
  const check = unlock ? canBuy(p, unlock) : 'owned';
  return check === 'ok' ? 'buy' : check === 'poor' ? 'poor' : 'locked';
}

/** El artículo de la tienda que desbloquea la pieza (precio, nombre), si no es de serie. */
export function itemShop(item: ArmoryItem): ShopItem | null {
  const unlock = itemUnlock(item);
  return unlock ? (shopItem(unlock) ?? null) : null;
}

/** Lo que se vende en la pestaña de mejoras: todo menos las armas y el equipo, que están en la de equipo. */
export const UPGRADE_ITEMS: readonly ShopItem[] = (() => {
  const unlocks = new Set<UpgradeId>();
  for (const slot of LOADOUT_SLOTS) {
    for (const item of armoryItems(slot)) {
      const u = itemUnlock(item);
      if (u) unlocks.add(u);
    }
  }
  return SHOP.filter((s) => !unlocks.has(s.id));
})();

export interface StatBar {
  label: string;
  /** 0..1 para la barra. */
  value: number;
  /** El dato real, para leerlo. */
  text: string;
}

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
/** Con coma decimal, como en el resto de los textos. */
const num = (v: number, digits: number): string => v.toFixed(digits).replace('.', ',');

/** Las barras de un arma: daño por disparo, cadencia, alcance, precisión y cargador (el cuchillo, daño y alcance). */
export function weaponStats(id: WeaponId): StatBar[] {
  const d = WEAPONS[id];
  if (d.kind === 'melee') {
    return [
      { label: 'Daño', value: clamp01(d.damage / 120), text: String(d.damage) },
      { label: 'Alcance', value: clamp01((d.meleeRange ?? d.range) / 2.5), text: `${num(d.meleeRange ?? d.range, 1)} m` },
      { label: 'Velocidad', value: clamp01(d.rpm / 160), text: `${d.rpm} golpes/min` },
    ];
  }
  const perShot = d.damage * Math.max(1, d.pellets);
  return [
    { label: 'Daño', value: clamp01(perShot / 120), text: d.pellets > 1 ? `${d.pellets} × ${d.damage}` : String(d.damage) },
    { label: 'Cadencia', value: clamp01(d.rpm / 600), text: `${d.rpm} disparos/min` },
    { label: 'Alcance', value: clamp01(d.range / 200), text: `${d.range} m` },
    { label: 'Precisión', value: clamp01(1 - d.spreadAim / 3.5), text: `${num(d.spreadAim, 2)}° apuntando` },
    { label: 'Cargador', value: clamp01(d.mag / 30), text: `${d.mag}` },
  ];
}

/** Las barras de un equipo que se lanza: cuántas se llevan, hasta dónde alcanza, cuánto aturde y la mecha. */
export function gearStats(id: GearId): StatBar[] {
  const g = GEAR[id];
  return [
    { label: 'Cantidad', value: clamp01(g.count / 4), text: `${g.count} por contrato` },
    { label: 'Radio', value: clamp01(STUN.radius / 12), text: `${STUN.radius} m` },
    { label: 'Aturde', value: clamp01(STUN.near / 6), text: `hasta ${num(STUN.near, 1)} s` },
    { label: 'Mecha', value: clamp01(g.fuse / 3), text: `${num(g.fuse, 1)} s` },
  ];
}

/**
 * El siguiente (o anterior) de lo que el jugador tiene para un hueco, empezando por lo equipado: lo usan los selectores
 * compactos del briefing y de la sala. En el equipo, «ninguno» también es una opción.
 */
export function cycleOwned(p: Profile, slot: LoadoutSlot, dir: 1 | -1): WeaponId | GearId | null {
  const options: Array<WeaponId | GearId | null> = armoryItems(slot)
    .filter((item) => owns(p, item))
    .map(itemId);
  if (slot === 'gear') options.unshift(null);
  if (options.length === 0) return p.loadout[slot];
  const i = options.indexOf(p.loadout[slot]);
  return options[(i + dir + options.length) % options.length] ?? null;
}

/** Cuántas opciones tiene el jugador en un hueco (con una sola, el selector no cambia nada). */
export function ownedCount(p: Profile, slot: LoadoutSlot): number {
  return armoryItems(slot).filter((item) => owns(p, item)).length + (slot === 'gear' ? 1 : 0);
}
