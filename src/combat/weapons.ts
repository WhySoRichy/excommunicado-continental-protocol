import type { WeaponModel } from '../entities/CharacterRig';

/** Definiciones de armas (datos). Valores en grados, metros, segundos. DISENO §4.1. */
export type WeaponId = 'carbine' | 'shotgun' | 'dmr' | 'pistol' | 'revolver' | 'knife';

/**
 * Los huecos del equipo (DISENO §4): al contrato se lleva un arma de cada tipo. Principal (fusiles, subfusiles,
 * escopetas y tirador compiten por el mismo hueco), secundaria (armas cortas) y cuerpo a cuerpo; el cuarto, el equipo
 * (granadas y aturdidoras), no es un arma que se empuñe: se lanza con su propia tecla.
 */
export const WEAPON_SLOTS = ['primary', 'secondary', 'melee'] as const;
export type WeaponSlot = (typeof WEAPON_SLOTS)[number];
export type LoadoutSlot = WeaponSlot | 'gear';

export interface WeaponDef {
  id: WeaponId;
  name: string;
  slot: WeaponSlot;
  kind: 'gun' | 'melee';
  damage: number;
  headMult: number;
  pellets: number;
  /** Disparos por minuto. */
  rpm: number;
  auto: boolean;
  mag: number;
  /** Reserva inicial (Infinity = infinita). */
  reserve: number;
  reloadTime: number;
  /** Ventana de recarga perfecta como fracción del tiempo de recarga. */
  perfectStart: number;
  perfectEnd: number;
  /** Penalización por fallar la recarga perfecta (s). */
  jamPenalty: number;
  spreadHip: number;
  spreadAim: number;
  /** Spread extra a velocidad de trote (escala lineal). */
  spreadMove: number;
  bloomPerShot: number;
  bloomDecay: number;
  maxBloom: number;
  /** Patrón de retroceso fijo [subida, lateral] en grados por disparo (aprendible). */
  recoil: ReadonlyArray<readonly [number, number]>;
  /** Tiempo sin disparar tras el que el patrón vuelve a empezar. */
  recoilReset: number;
  range: number;
  falloffStart: number;
  falloffEnd: number;
  /** Radio de alerta de los enemigos al disparar (m). */
  noise: number;
  model: WeaponModel;
  meleeRange?: number;
  meleeArcDeg?: number;
  /** Fracción del campo de visión al apuntar (por defecto la de la cámara; el rifle de tirador tiene más aumento). */
  aimFov?: number;
}

const CARBINE_RECOIL: Array<[number, number]> = [
  [0.9, 0.05],
  [1.0, 0.1],
  [1.1, 0.1],
  [1.1, 0.15],
  [1.0, 0.2],
  [0.9, 0.25],
  [0.8, 0.3],
  [0.7, 0.35],
  [0.6, 0.35],
  [0.5, 0.3],
  [0.5, 0.2],
  [0.45, 0.0],
  [0.45, -0.2],
  [0.45, -0.35],
  [0.4, -0.45],
  [0.4, -0.5],
  [0.35, -0.45],
  [0.35, -0.3],
  [0.35, -0.1],
  [0.35, 0.1],
  [0.35, 0.25],
  [0.35, 0.35],
  [0.35, 0.3],
  [0.35, 0.2],
];

export const WEAPONS: Record<WeaponId, WeaponDef> = {
  carbine: {
    id: 'carbine',
    name: 'Carabina TR-4',
    slot: 'primary',
    kind: 'gun',
    damage: 30,
    headMult: 3,
    pellets: 1,
    rpm: 540,
    auto: true,
    mag: 24,
    reserve: 96,
    reloadTime: 1.9,
    perfectStart: 0.42,
    perfectEnd: 0.56,
    jamPenalty: 0.35,
    spreadHip: 3.0,
    spreadAim: 0.35,
    spreadMove: 1.6,
    bloomPerShot: 0.35,
    bloomDecay: 5,
    maxBloom: 3,
    recoil: CARBINE_RECOIL,
    recoilReset: 0.35,
    range: 120,
    falloffStart: 35,
    falloffEnd: 80,
    noise: 32,
    model: 'rifle',
  },
  shotgun: {
    id: 'shotgun',
    name: 'Escopeta "Sommelier"',
    slot: 'primary',
    kind: 'gun',
    damage: 14,
    headMult: 1.5,
    pellets: 8,
    rpm: 70,
    auto: false,
    mag: 6,
    reserve: 30,
    reloadTime: 2.4,
    perfectStart: 0.4,
    perfectEnd: 0.55,
    jamPenalty: 0.4,
    spreadHip: 5.5,
    spreadAim: 3.2,
    spreadMove: 1,
    bloomPerShot: 0,
    bloomDecay: 5,
    maxBloom: 0,
    recoil: [[4.0, 0.3]],
    recoilReset: 0.5,
    range: 40,
    falloffStart: 8,
    falloffEnd: 22,
    noise: 35,
    model: 'shotgun',
  },
  dmr: {
    id: 'dmr',
    name: 'Rifle de tirador "Meridian"',
    slot: 'primary',
    kind: 'gun',
    damage: 75,
    headMult: 2.5,
    pellets: 1,
    rpm: 150,
    auto: false,
    mag: 10,
    reserve: 40,
    reloadTime: 2.3,
    perfectStart: 0.45,
    perfectEnd: 0.58,
    jamPenalty: 0.4,
    spreadHip: 4.5,
    spreadAim: 0.12,
    spreadMove: 2.2,
    bloomPerShot: 0.9,
    bloomDecay: 4,
    maxBloom: 3,
    recoil: [
      [2.6, 0.2],
      [2.8, -0.25],
      [3.0, 0.3],
    ],
    recoilReset: 0.5,
    range: 200,
    falloffStart: 80,
    falloffEnd: 160,
    noise: 45,
    model: 'dmr',
    aimFov: 0.45,
  },
  pistol: {
    id: 'pistol',
    name: 'Pistola P-45',
    slot: 'secondary',
    kind: 'gun',
    damage: 34,
    headMult: 3,
    pellets: 1,
    rpm: 360,
    auto: false,
    mag: 12,
    reserve: Number.POSITIVE_INFINITY,
    reloadTime: 1.25,
    perfectStart: 0.45,
    perfectEnd: 0.62,
    jamPenalty: 0.3,
    spreadHip: 2.2,
    spreadAim: 0.45,
    spreadMove: 1.2,
    bloomPerShot: 0.5,
    bloomDecay: 6,
    maxBloom: 2.5,
    recoil: [
      [1.6, 0.1],
      [1.7, -0.15],
      [1.8, 0.2],
      [1.8, -0.2],
    ],
    recoilReset: 0.3,
    range: 80,
    falloffStart: 20,
    falloffEnd: 45,
    noise: 28,
    model: 'pistol',
  },
  revolver: {
    id: 'revolver',
    name: 'Revólver "Juez"',
    slot: 'secondary',
    kind: 'gun',
    damage: 70,
    headMult: 3,
    pellets: 1,
    rpm: 120,
    auto: false,
    mag: 6,
    reserve: Number.POSITIVE_INFINITY,
    reloadTime: 2.1,
    perfectStart: 0.5,
    perfectEnd: 0.64,
    jamPenalty: 0.4,
    spreadHip: 2.6,
    spreadAim: 0.3,
    spreadMove: 1.4,
    bloomPerShot: 1.1,
    bloomDecay: 4,
    maxBloom: 3,
    recoil: [
      [3.4, 0.3],
      [3.6, -0.35],
      [3.8, 0.4],
    ],
    recoilReset: 0.45,
    range: 90,
    falloffStart: 25,
    falloffEnd: 55,
    noise: 40,
    model: 'revolver',
  },
  knife: {
    id: 'knife',
    name: 'Cuchillo',
    slot: 'melee',
    kind: 'melee',
    damage: 120,
    headMult: 1,
    pellets: 0,
    rpm: 110,
    auto: false,
    mag: 0,
    reserve: 0,
    reloadTime: 0,
    perfectStart: 0,
    perfectEnd: 0,
    jamPenalty: 0,
    spreadHip: 0,
    spreadAim: 0,
    spreadMove: 0,
    bloomPerShot: 0,
    bloomDecay: 0,
    maxBloom: 0,
    recoil: [[0, 0]],
    recoilReset: 0,
    range: 1.7,
    falloffStart: 99,
    falloffEnd: 99,
    noise: 2,
    model: 'knife',
    meleeRange: 1.7,
    meleeArcDeg: 70,
  },
};

/** Mejoras de la armería (DISENO §5.2). */
export type UpgradeId =
  | 'extMag'
  | 'suppressor'
  | 'hollowPoint'
  | 'compensator'
  | 'suit1'
  | 'suit2'
  | 'suit3'
  | 'tacticalKnife'
  | 'shotgun'
  | 'revolver'
  | 'dmr'
  | 'extraMarker'
  | 'stunGrenade';

/** Aplica las mejoras compradas a una definición (pura: devuelve una copia). */
export function applyUpgrades(base: WeaponDef, owned: ReadonlySet<UpgradeId>): WeaponDef {
  const d: WeaponDef = { ...base, recoil: base.recoil };
  if (d.kind === 'gun') {
    if (owned.has('extMag')) {
      if (d.id === 'carbine') d.mag += 8;
      if (d.id === 'dmr' || d.id === 'pistol') d.mag += 4;
    }
    if (owned.has('hollowPoint')) d.damage = Math.round(d.damage * 1.15 * 10) / 10;
    if (owned.has('compensator')) d.recoil = d.recoil.map(([p, y]) => [p * 0.65, y * 0.65] as const);
    if (owned.has('suppressor') && d.id === 'pistol') d.noise = 8;
  } else if (owned.has('tacticalKnife')) {
    d.meleeRange = 2.2;
    d.range = 2.2;
    d.rpm = 150;
  }
  return d;
}

/** Armadura máxima del traje según mejoras. */
export function suitArmor(owned: ReadonlySet<UpgradeId>): number {
  return 60 + (owned.has('suit1') ? 20 : 0) + (owned.has('suit2') ? 20 : 0) + (owned.has('suit3') ? 20 : 0);
}

/** Marcadores de sangre (vidas) por contrato. */
export function markersPerContract(owned: ReadonlySet<UpgradeId>): number {
  return owned.has('extraMarker') ? 4 : 3;
}

/** Equipo que se lanza (el cuarto hueco). */
export type GearId = 'stun';
export const GEAR_IDS: readonly GearId[] = ['stun'];

export interface GearDef {
  /** Nombre corto (HUD). */
  name: string;
  /** Cuántas se llevan al contrato. */
  count: number;
  /** Mecha desde que sale de la mano (s). */
  fuse: number;
}

export const GEAR: Record<GearId, GearDef> = {
  stun: { name: 'Aturdidora', count: 2, fuse: 1.6 },
};

/** Lo que el jugador lleva al contrato: un arma por hueco y, si tiene, un equipo. */
export interface Loadout {
  primary: WeaponId;
  secondary: WeaponId;
  melee: WeaponId;
  gear: GearId | null;
}

/** El equipo de serie: carabina, pistola y cuchillo, sin equipo que lanzar. */
export const DEFAULT_LOADOUT: Readonly<Loadout> = { primary: 'carbine', secondary: 'pistol', melee: 'knife', gear: null };

export const WEAPON_IDS: readonly WeaponId[] = ['carbine', 'shotgun', 'dmr', 'pistol', 'revolver', 'knife'];

/** La mejora de la armería que desbloquea cada arma que no es de serie, y la de cada equipo. */
const WEAPON_UNLOCK: Partial<Record<WeaponId, UpgradeId>> = { shotgun: 'shotgun', dmr: 'dmr', revolver: 'revolver' };
const GEAR_UNLOCK: Record<GearId, UpgradeId> = { stun: 'stunGrenade' };

/** La mejora que desbloquea un arma (null: es de serie) o un equipo. */
export function weaponUnlock(id: WeaponId): UpgradeId | null {
  return WEAPON_UNLOCK[id] ?? null;
}

export function gearUnlock(id: GearId): UpgradeId {
  return GEAR_UNLOCK[id];
}

/** ¿Tiene el jugador esta arma? Las de serie siempre; las demás, si las compró. */
export function ownsWeapon(owned: ReadonlySet<UpgradeId>, id: WeaponId): boolean {
  const unlock = WEAPON_UNLOCK[id];
  return unlock === undefined || owned.has(unlock);
}

export function ownsGear(owned: ReadonlySet<UpgradeId>, id: GearId): boolean {
  return owned.has(GEAR_UNLOCK[id]);
}

/** Las armas de un hueco, en el orden de la armería. */
export function weaponsFor(slot: WeaponSlot): WeaponId[] {
  return WEAPON_IDS.filter((id) => WEAPONS[id].slot === slot);
}

/**
 * Sanea un equipo (de la partida guardada o de un invitado): cada hueco con un arma de ese tipo que se tenga y, si no,
 * la de serie; el equipo, si se tiene. Nunca falla.
 */
export function normalizeLoadout(x: unknown, owned: ReadonlySet<UpgradeId>): Loadout {
  const o = typeof x === 'object' && x !== null ? (x as Record<string, unknown>) : {};
  const pick = (slot: WeaponSlot): WeaponId => {
    const v = o[slot];
    const id = WEAPON_IDS.find((w) => w === v);
    return id && WEAPONS[id].slot === slot && ownsWeapon(owned, id) ? id : DEFAULT_LOADOUT[slot];
  };
  const gear = GEAR_IDS.find((g) => g === o.gear) ?? null;
  return { primary: pick('primary'), secondary: pick('secondary'), melee: pick('melee'), gear: gear && ownsGear(owned, gear) ? gear : null };
}

/** El equipo que se lanza con un inventario, si lo tiene. */
export function gearFor(owned: ReadonlySet<UpgradeId>, chosen: Readonly<Loadout> = DEFAULT_LOADOUT): GearId | null {
  return normalizeLoadout(chosen, owned).gear;
}

/** Las armas que se empuñan con un equipo (en el orden de sus teclas: principal, secundaria, cuerpo a cuerpo). */
export function loadoutFor(owned: ReadonlySet<UpgradeId>, chosen: Readonly<Loadout> = DEFAULT_LOADOUT): WeaponId[] {
  const l = normalizeLoadout(chosen, owned);
  return [l.primary, l.secondary, l.melee];
}
