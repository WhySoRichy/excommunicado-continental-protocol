import type { EnemyType } from '../../levels/types';
import type { RobotColors } from '../rig/robots';
import type { Features, HairStyle, Outfit, RigColors, WeaponModel } from '../rig/types';

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
  /** Avisa una vez por ráfaga (si no, antes de cada disparo). */
  burstTelegraph?: boolean;
}

/** Embestida: salta sobre su presa tras agazaparse. */
export interface LungeDef {
  /** A qué distancia se agazapa y a cuál muerde (m). */
  range: number;
  reach: number;
  /** Duración (s), velocidad (m/s) y lo que tarda en poder volver a atacar (s). */
  time: number;
  speed: number;
  recover: number;
}

/** Escudo balístico: cuánto daño aguanta y cuánto, seguido, hasta que se lo bajan a tiros. */
export interface ShieldDef {
  health: number;
  guard: number;
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
  /** Cuándo admite un takedown (por defecto, siempre): nunca (las máquinas) o solo aturdido (el jefe, por fase). */
  takedown?: 'never' | 'stunned';
  /** Cuerpo (por defecto, una persona) y sus colores si es una máquina. */
  body?: 'hound' | 'drone';
  robot?: RobotColors;
  /** Media altura de su cápsula (m): las máquinas son más bajas. */
  half?: number;
  /** Velocidad máxima respecto al trote del jugador. */
  speed?: number;
  /** Vuela a esta altura sobre el suelo (m). */
  fly?: number;
  lunge?: LungeDef;
  shield?: ShieldDef;
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
  features?: Partial<Features>;
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
    features: { jaw: 1.1, chin: 1.2, nose: 1.08, nostrils: 1.2, brow: 1.5, cheeks: 1.2, eyes: 0.88, lips: 0.85 },
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
    features: { jaw: 1.06, chin: 1.1, nose: 0.96, brow: 1.1, lips: 0.85 },
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
    takedown: 'stunned',
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
    features: { jaw: 1.04, chin: 1.25, nose: 1.12, nostrils: 0.95, brow: 1.4, cheeks: 1.45, eyes: 0.84, lips: 0.75, iris: 0x7d8a96 },
    beard: true,
    bulk: 1.12,
    score: 600,
  },
  shield: {
    type: 'shield',
    label: 'Antidisturbios',
    color: 0xa6ff3d,
    glyph: '◧',
    description: 'Escudo balístico. De frente no entra nada: rodéalo, dispara a los pies, túmbale la guardia o atúrdelo.',
    health: 100,
    heavyArmor: 0,
    weapon: { damage: 9, pellets: 1, rpm: 170, burst: 2, burstPause: 1.3, range: 24, accuracy: 0.5, telegraph: 0, mag: 12, reload: 2.2, model: 'pistol' },
    reaction: 0.8,
    poise: 70,
    detectTime: 1.6,
    sightRange: 24,
    fovDeg: 100,
    runScale: 0.62,
    walkScale: 0.4,
    prefersCover: 0,
    flanker: false,
    canFlank: false,
    engage: [3, 8],
    shield: { health: 520, guard: 170 },
    colors: { jacket: 0x2f3d31, shirt: 0x1c2420, tie: 0x1c2420, pants: 0x28322c, shoes: 0x101310, skin: 0xb98d72, hair: 0x2b352d, accent: 0xa6ff3d },
    hair: 'helmet',
    outfit: { top: 'fatigues', vest: 'carrier', gloves: 0x14171a, boots: true, kneepads: true, mask: 'balaclava', helmet: 0x29332b },
    bulk: 1.08,
    score: 150,
  },
  hound: {
    type: 'hound',
    label: 'Sabueso',
    color: 0x9b6bff,
    glyph: '◆',
    description: 'Máquina rápida. Se agazapa antes de saltar: esquiva y dispárale mientras se recoloca.',
    health: 75,
    heavyArmor: 0,
    weapon: { damage: 22, pellets: 1, rpm: 60, burst: 1, burstPause: 1, range: 4, accuracy: 1, telegraph: 0.5, mag: 1, reload: 0, model: 'none' },
    reaction: 0.35,
    poise: 42,
    takedown: 'never',
    detectTime: 0.9,
    sightRange: 24,
    fovDeg: 150,
    runScale: 1,
    walkScale: 0.4,
    prefersCover: 0,
    flanker: false,
    canFlank: false,
    engage: [0, 2],
    body: 'hound',
    robot: { shell: 0x3b3549, dark: 0x1a1b21, accent: 0x9b6bff },
    half: 0.1,
    speed: 1.4,
    lunge: { range: 4.2, reach: 1.2, time: 0.36, speed: 11.5, recover: 0.95 },
    colors: { jacket: 0x3b3549, shirt: 0x1a1b21, tie: 0x1a1b21, pants: 0x1a1b21, shoes: 0x0d0e10, skin: 0x1a1b21, hair: 0x1a1b21, accent: 0x9b6bff },
    hair: 'bald',
    outfit: {},
    bulk: 1,
    score: 130,
  },
  drone: {
    type: 'drone',
    label: 'Dron',
    color: 0xdff1ff,
    glyph: '✛',
    description: 'Vuela y dispara ráfagas tras avisar con un pitido. Frágil: una aturdidora lo tira al suelo.',
    health: 55,
    heavyArmor: 0,
    weapon: {
      damage: 4,
      pellets: 1,
      rpm: 540,
      burst: 6,
      burstPause: 2,
      range: 24,
      accuracy: 0.44,
      telegraph: 0.8,
      mag: 36,
      reload: 2.6,
      model: 'none',
      burstTelegraph: true,
    },
    reaction: 0.6,
    poise: 30,
    stun: 1.2,
    takedown: 'never',
    detectTime: 1.1,
    sightRange: 30,
    fovDeg: 140,
    runScale: 1,
    walkScale: 0.45,
    prefersCover: 0,
    flanker: false,
    canFlank: false,
    engage: [5, 12],
    body: 'drone',
    robot: { shell: 0x454b55, dark: 0x1b1e24, accent: 0xdff1ff },
    half: 0.06,
    speed: 1.1,
    fly: 2.7,
    colors: { jacket: 0x454b55, shirt: 0x1b1e24, tie: 0x1b1e24, pants: 0x1b1e24, shoes: 0x0d0e10, skin: 0x1b1e24, hair: 0x1b1e24, accent: 0xdff1ff },
    hair: 'bald',
    outfit: {},
    bulk: 1,
    score: 140,
  },
};
