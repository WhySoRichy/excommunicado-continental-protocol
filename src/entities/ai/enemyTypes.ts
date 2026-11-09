import type { EnemyType } from '../../levels/types';
import type { HairStyle, RigColors, WeaponModel } from '../CharacterRig';

/** Tipos de enemigo (GAME_DESIGN §4.2): color + icono propios para que se distingan siempre. */
export interface EnemyWeaponDef {
  damage: number;
  pellets: number;
  rpm: number;
  /** Disparos por ráfaga. */
  burst: number;
  /** Pausa entre ráfagas (s). */
  burstPause: number;
  /** Alcance efectivo (m). */
  range: number;
  /** Probabilidad base de acierto a 10 m contra un objetivo quieto. */
  accuracy: number;
  /** Telégrafo antes del disparo (s; 0 = sin telégrafo largo). */
  telegraph: number;
  model: WeaponModel;
}

export interface EnemyTypeDef {
  type: EnemyType;
  label: string;
  /** Color de rim light e icono. */
  color: number;
  /** Glifo de la leyenda (accesible: no depende solo del color). */
  glyph: string;
  description: string;
  health: number;
  heavyArmor: number;
  weapon: EnemyWeaponDef;
  /** Tiempo de reacción antes del primer disparo al detectar (s). */
  reaction: number;
  /** Segundos de visión directa a 6 m para detectar del todo. */
  detectTime: number;
  sightRange: number;
  fovDeg: number;
  /** Escala de velocidad al correr (1 = trote del jugador). */
  runScale: number;
  walkScale: number;
  prefersCover: number;
  flanker: boolean;
  /** Distancia de combate preferida [mín, máx]. */
  engage: readonly [number, number];
  colors: RigColors;
  hair: HairStyle;
  vest: boolean;
  bulk: number;
  score: number;
}

const suitDark = { shirt: 0x1d2026, tie: 0x0c0d10, pants: 0x2a2d33, shoes: 0x0b0b0d, skin: 0xbf8f72, hair: 0x1f1a16 };

export const ENEMY_TYPES: Record<EnemyType, EnemyTypeDef> = {
  thug: {
    type: 'thug',
    label: 'Matón',
    color: 0xff8c2a,
    glyph: '●',
    description: 'Pistola. Avanza y dispara en pares.',
    health: 80,
    heavyArmor: 0,
    weapon: { damage: 8, pellets: 1, rpm: 180, burst: 2, burstPause: 1.1, range: 30, accuracy: 0.5, telegraph: 0, model: 'pistol' },
    reaction: 0.7,
    detectTime: 1.0,
    sightRange: 26,
    fovDeg: 110,
    runScale: 0.92,
    walkScale: 0.42,
    prefersCover: 0.45,
    flanker: false,
    engage: [7, 15],
    colors: { jacket: 0x3a3330, accent: 0xff8c2a, ...suitDark },
    hair: 'short',
    vest: false,
    bulk: 1.05,
    score: 100,
  },
  escort: {
    type: 'escort',
    label: 'Escolta',
    color: 0xffd23f,
    glyph: '▲',
    description: 'SMG en ráfagas. Te flanquea.',
    health: 90,
    heavyArmor: 0,
    weapon: { damage: 5, pellets: 1, rpm: 620, burst: 4, burstPause: 1.0, range: 24, accuracy: 0.42, telegraph: 0, model: 'smg' },
    reaction: 0.6,
    detectTime: 0.9,
    sightRange: 24,
    fovDeg: 115,
    runScale: 1.0,
    walkScale: 0.45,
    prefersCover: 0.3,
    flanker: true,
    engage: [6, 12],
    colors: { jacket: 0x2b3038, accent: 0xffd23f, ...suitDark },
    hair: 'cap',
    vest: true,
    bulk: 1,
    score: 120,
  },
  marksman: {
    type: 'marksman',
    label: 'Tirador',
    color: 0xff3b3b,
    glyph: '◆',
    description: 'Rifle. Láser rojo 1,2 s antes de disparar: rompe la línea de visión.',
    health: 70,
    heavyArmor: 0,
    weapon: { damage: 35, pellets: 1, rpm: 26, burst: 1, burstPause: 0.6, range: 60, accuracy: 0.92, telegraph: 1.2, model: 'rifle' },
    reaction: 0.8,
    detectTime: 1.2,
    sightRange: 50,
    fovDeg: 90,
    runScale: 0.85,
    walkScale: 0.4,
    prefersCover: 0.2,
    flanker: false,
    engage: [15, 45],
    colors: { jacket: 0x34302e, accent: 0xff3b3b, ...suitDark },
    hair: 'short',
    vest: false,
    bulk: 1,
    score: 150,
  },
  heavy: {
    type: 'heavy',
    label: 'Blindado',
    color: 0x7fb2ff,
    glyph: '■',
    description: 'Escopeta y armadura: el cuerpo apenas recibe daño. Headshot o takedown.',
    health: 120,
    heavyArmor: 150,
    weapon: { damage: 6, pellets: 4, rpm: 55, burst: 1, burstPause: 1.2, range: 14, accuracy: 0.7, telegraph: 0.6, model: 'shotgun' },
    reaction: 0.8,
    detectTime: 1.1,
    sightRange: 22,
    fovDeg: 100,
    runScale: 0.7,
    walkScale: 0.35,
    prefersCover: 0,
    flanker: false,
    engage: [2, 7],
    colors: { jacket: 0x2e3542, accent: 0x7fb2ff, ...suitDark },
    hair: 'helmet',
    vest: true,
    bulk: 1.28,
    score: 220,
  },
  boss: {
    type: 'boss',
    label: 'Jefe',
    color: 0xff2e88,
    glyph: '★',
    description: 'Patrón propio por fases. Observa su telégrafo.',
    health: 420,
    heavyArmor: 120,
    weapon: { damage: 9, pellets: 1, rpm: 420, burst: 5, burstPause: 1.4, range: 40, accuracy: 0.5, telegraph: 0.5, model: 'smg' },
    reaction: 0.5,
    detectTime: 0.6,
    sightRange: 45,
    fovDeg: 140,
    runScale: 0.85,
    walkScale: 0.4,
    prefersCover: 0.5,
    flanker: false,
    engage: [8, 18],
    colors: { jacket: 0xe7e2d8, shirt: 0x14161a, tie: 0xff2e88, pants: 0xd9d3c7, shoes: 0x1a1a1a, skin: 0xc79a7a, hair: 0x0e0e0e, accent: 0xff2e88 },
    hair: 'short',
    vest: false,
    bulk: 1.12,
    score: 600,
  },
};
