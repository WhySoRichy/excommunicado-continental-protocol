import type { WeaponModel } from '../entities/CharacterRig';

/** Definiciones de armas (datos). Valores en grados, metros, segundos. GAME_DESIGN §4.1. */
export type WeaponId = 'carbine' | 'shotgun' | 'pistol' | 'knife';

export interface WeaponDef {
  id: WeaponId;
  name: string;
  slot: 1 | 2 | 3;
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
    slot: 1,
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
    slot: 1,
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
  pistol: {
    id: 'pistol',
    name: 'Pistola P-45',
    slot: 2,
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
  knife: {
    id: 'knife',
    name: 'Cuchillo',
    slot: 3,
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

/** Mejoras de la armería (GAME_DESIGN §5.2). */
export type UpgradeId = 'extMag' | 'suppressor' | 'hollowPoint' | 'compensator' | 'suit1' | 'suit2' | 'suit3' | 'tacticalKnife' | 'shotgun' | 'extraMarker';

/** Aplica las mejoras compradas a una definición (pura: devuelve una copia). */
export function applyUpgrades(base: WeaponDef, owned: ReadonlySet<UpgradeId>): WeaponDef {
  const d: WeaponDef = { ...base, recoil: base.recoil };
  if (d.kind === 'gun') {
    if (owned.has('extMag')) {
      if (d.id === 'carbine') d.mag += 8;
      if (d.id === 'pistol') d.mag += 4;
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

/** Equipo del jugador según las mejoras compradas (la escopeta se suma a la carabina). */
export function loadoutFor(owned: ReadonlySet<UpgradeId>): WeaponId[] {
  return owned.has('shotgun') ? ['carbine', 'shotgun', 'pistol', 'knife'] : ['carbine', 'pistol', 'knife'];
}
