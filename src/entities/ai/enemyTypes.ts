import type { EnemyType } from '../../levels/types';
import type { HairStyle, Outfit, RigColors, WeaponModel } from '../rig/types';

/** Tipos de enemigo (DISENO §4.2): color + icono propios para que se distingan siempre. */
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
  /** Disparos por cargador y lo que tarda en recargar (s): su momento de debilidad. */
  mag: number;
  reload: number;
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
  /** Solo admite takedown cuando está aturdido (el jefe, al arrodillarse por fase). */
  takedownWhenStunned?: boolean;
  /** Aguante: daño seguido que encaja antes de descolocarse. */
  poise: number;
  /** Cuánto le dura un aturdimiento (por defecto 1). Con 0 no se aturde: el destello solo le corta el disparo. */
  stun?: number;
  walkScale: number;
  prefersCover: number;
  /** Le va lo de rodear (el primero en hacerlo) y si puede hacerlo cuando se lo manda la escuadra. */
  flanker: boolean;
  canFlank: boolean;
  /** Distancia de combate preferida [mín, máx]. */
  engage: readonly [number, number];
  colors: RigColors;
  hair: HairStyle;
  /** Prendas y equipo: la silueta con la que se le reconoce de lejos. */
  outfit: Outfit;
  beard?: boolean;
  bulk: number;
  score: number;
}

export const ENEMY_TYPES: Record<EnemyType, EnemyTypeDef> = {
  thug: {
    type: 'thug',
    label: 'Matón',
    color: 0xff8c2a,
    glyph: '●',
    description: 'Pistola. Avanza y dispara en pares.',
    health: 80,
    heavyArmor: 0,
    weapon: { damage: 8, pellets: 1, rpm: 180, burst: 2, burstPause: 1.1, range: 30, accuracy: 0.56, telegraph: 0, mag: 12, reload: 1.8, model: 'pistol' },
    reaction: 0.7,
    poise: 45,
    detectTime: 1.0,
    sightRange: 26,
    fovDeg: 110,
    runScale: 0.92,
    walkScale: 0.42,
    prefersCover: 0.45,
    flanker: false,
    canFlank: true,
    engage: [7, 15],
    // Cazadora acolchada de cuero, vaqueros y la cabeza rapada: ancho de hombros y corto de abajo.
    colors: { jacket: 0x3b2b22, shirt: 0x6a6d73, tie: 0x0c0d10, pants: 0x2b3340, shoes: 0x1c1612, skin: 0xbf8f72, hair: 0x2a211b, accent: 0xff8c2a },
    hair: 'bald',
    outfit: { top: 'bomber', armband: true },
    beard: true,
    bulk: 1.08,
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
    weapon: { damage: 5, pellets: 1, rpm: 620, burst: 4, burstPause: 1.0, range: 24, accuracy: 0.48, telegraph: 0, mag: 28, reload: 2, model: 'smg' },
    reaction: 0.6,
    poise: 48,
    detectTime: 0.9,
    sightRange: 24,
    fovDeg: 115,
    runScale: 1.0,
    walkScale: 0.45,
    prefersCover: 0.3,
    flanker: true,
    canFlank: true,
    engage: [6, 12],
    // Guardaespaldas: traje oscuro con portaplacas, gafas de sol, auricular y pistolera.
    colors: { jacket: 0x23262d, shirt: 0xd9d5cb, tie: 0xffd23f, pants: 0x23262d, shoes: 0x0b0b0d, skin: 0xb98766, hair: 0x1f1a16, accent: 0xffd23f },
    hair: 'short',
    outfit: { vest: 'carrier', glasses: true, earpiece: true, holster: true, armband: true, pocketSquare: false },
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
    weapon: { damage: 35, pellets: 1, rpm: 26, burst: 1, burstPause: 0.6, range: 60, accuracy: 0.92, telegraph: 1.2, mag: 5, reload: 2.4, model: 'dmr' },
    reaction: 0.8,
    poise: 40,
    detectTime: 1.2,
    sightRange: 50,
    fovDeg: 90,
    runScale: 0.85,
    walkScale: 0.4,
    prefersCover: 0.2,
    flanker: false,
    canFlank: false,
    engage: [15, 45],
    // Tirador: abrigo largo con capucha, cuello tapado y visor de dos lentes rojas.
    colors: { jacket: 0x33372f, shirt: 0x1d2026, tie: 0x0c0d10, pants: 0x24272b, shoes: 0x16140f, skin: 0xbf8f72, hair: 0x1f1a16, accent: 0xff3b3b },
    hair: 'short',
    outfit: { top: 'coat', tie: false, hood: 0x2f332b, goggles: 0xff2a2a, gloves: 0x15161a, boots: true, armband: true },
    bulk: 0.97,
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
    weapon: {
      damage: 6,
      pellets: 4,
      rpm: 55,
      burst: 1,
      burstPause: 1.2,
      range: 14,
      accuracy: 0.7,
      telegraph: 0.6,
      mag: 6,
      reload: 2.6,
      model: 'shotgunTactical',
    },
    reaction: 0.8,
    poise: 150,
    detectTime: 1.1,
    sightRange: 22,
    fovDeg: 100,
    runScale: 0.7,
    stun: 0.6,
    walkScale: 0.35,
    prefersCover: 0,
    flanker: false,
    canFlank: false,
    engage: [2, 7],
    // Blindado: uniforme, placas de los hombros a las espinillas, gola y casco con pantalla.
    colors: { jacket: 0x2a303b, shirt: 0x1b1e24, tie: 0x0c0d10, pants: 0x262b34, shoes: 0x111216, skin: 0xbf8f72, hair: 0x1f1a16, accent: 0x7fb2ff },
    hair: 'helmet',
    outfit: { top: 'fatigues', vest: 'heavy', visor: true, mask: 'balaclava', gloves: 0x15171c, boots: true, kneepads: true },
    bulk: 1.24,
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
    weapon: { damage: 9, pellets: 1, rpm: 420, burst: 5, burstPause: 1.4, range: 40, accuracy: 0.5, telegraph: 0.5, mag: 15, reload: 2.2, model: 'revolver' },
    reaction: 0.5,
    poise: 240,
    detectTime: 0.6,
    sightRange: 45,
    fovDeg: 140,
    runScale: 0.85,
    takedownWhenStunned: true,
    stun: 0,
    walkScale: 0.4,
    prefersCover: 0.5,
    flanker: false,
    canFlank: false,
    engage: [8, 18],
    colors: { jacket: 0xe7e2d8, shirt: 0x14161a, tie: 0xff2e88, pants: 0xd9d3c7, shoes: 0x1a1a1a, skin: 0xc79a7a, hair: 0x0e0e0e, accent: 0xff2e88 },
    // El Juez: abrigo blanco hasta la rodilla, guantes negros y el pelo engominado.
    hair: 'slick',
    outfit: { top: 'coat', gloves: 0x101114, boots: true },
    beard: true,
    bulk: 1.12,
    score: 600,
  },
};
