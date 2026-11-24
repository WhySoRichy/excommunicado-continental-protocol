import type { GearId, LoadoutSlot, WeaponId } from '../combat/weapons';

/** Textos del inventario, el equipo y la armería. */
export const LOADOUT_TEXT = {
  armory: 'ARMERÍA DEL SOMMELIER',
  tabLoadout: 'Equipo',
  tabUpgrades: 'Mejoras',
  loadoutTitle: 'Equipo',
  loadoutHint: 'Un arma de cada tipo y, si tienes, un equipo para lanzar. Se guarda para los próximos contratos.',
  equipped: 'En uso',
  equip: 'Equipar',
  owned: 'Disponible',
  buy: (price: number): string => `Comprar · ${price}`,
  poor: (missing: number): string => `Faltan ${missing} monedas`,
  locked: 'No disponible',
  none: 'Ninguno',
  previewUnavailable: 'Vista previa no disponible',
  slots: {
    primary: 'Principal',
    secondary: 'Secundaria',
    melee: 'Cuerpo a cuerpo',
    gear: 'Equipo',
  } satisfies Record<LoadoutSlot, string>,
  /** Qué hace cada tecla, para el selector compacto. */
  slotKeys: {
    primary: 'weapon1',
    secondary: 'weapon2',
    melee: 'weapon3',
    gear: 'gear',
  } as const satisfies Record<LoadoutSlot, string>,
};

/** Nombre corto de cada arma y equipo (selectores, HUD de la sala). */
export const ITEM_NAMES: Record<WeaponId | GearId, string> = {
  carbine: 'Carabina TR-4',
  shotgun: 'Escopeta «Sommelier»',
  dmr: 'Rifle «Meridian»',
  pistol: 'Pistola P-45',
  revolver: 'Revólver «Juez»',
  knife: 'Cuchillo',
  stun: 'Aturdidoras',
};

/** Una línea sobre cómo se juega cada pieza. */
export const ITEM_DESC: Record<WeaponId | GearId, string> = {
  carbine: 'Automática y equilibrada: sirve en cualquier contrato.',
  shotgun: 'Ocho perdigones por disparo: demoledora de cerca, inútil de lejos.',
  dmr: 'Mira de aumento y daño alto. Sin apuntar, poco precisa.',
  pistol: 'Rápida y fiable. Con silenciador, apenas alerta.',
  revolver: 'Seis tiros que tumban casi a cualquiera; la recarga es lenta.',
  knife: 'Silencioso. El takedown y los tajos no alertan a nadie.',
  stun: 'Dos por contrato. Aturden unos segundos a los enemigos cercanos que la ven estallar.',
};
