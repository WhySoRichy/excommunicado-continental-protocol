import { type BufferGeometry, Shape } from 'three';
import type { WeaponModel } from './types';
import type { GearId } from '../../combat/weapons';
import { along, assemble, block, cube, knob, lathe, type P, post, repeat, ring, side, type Surf, tube } from './weaponParts';

/** Distancia (m) de la empuñadura a la cantonera de las armas que se encaran al hombro; 0 si no tienen culata. */
export const STOCK: Record<WeaponModel, number> = {
  rifle: 0.27,
  dmr: 0.29,
  smg: 0.18,
  shotgun: 0.31,
  shotgunTactical: 0.27,
  pistol: 0,
  revolver: 0,
  knife: 0,
  none: 0,
};

/** Dónde agarra la mano izquierda cada arma, en el espacio del arma (cañón a −Z, arriba +Y). */
export const GRIP: Record<WeaponModel, readonly [number, number, number] | null> = {
  pistol: [-0.045, -0.035, -0.005],
  rifle: [0, -0.04, -0.4],
  smg: [0, -0.045, -0.26],
  shotgun: [0, -0.02, -0.44],
  shotgunTactical: [0, -0.02, -0.32],
  dmr: [0, -0.04, -0.4],
  revolver: [-0.045, -0.035, 0],
  knife: null,
  none: null,
};

/**
 * Acabado de un arma: el color y el brillo de cada parte. Es lo que cambiará una skin (un cromado, un oro, una madera
 * clara); la forma del arma no cambia.
 */
export interface WeaponFinish {
  /** Acero pavonado o aluminio anodizado (corredera, cajón, cañón) y cuánto brilla y cuánto es metal. */
  metal: number;
  metalRough: number;
  metalness: number;
  /** Acero visto y pulido: gatillo, cañón en la ventana de expulsión, la hoja del cuchillo. */
  steel: number;
  /** Polímero (armazones, empuñaduras, culatas sintéticas), goma de agarre, madera y latón. */
  polymer: number;
  grip: number;
  wood: number;
  brass: number;
}

/** Pavonado clásico: metal negro azulado satinado, polímero negro, nogal y latón. */
export const DEFAULT_FINISH: WeaponFinish = {
  metal: 0x2b2e34,
  metalRough: 0.36,
  metalness: 0.8,
  steel: 0xa3a9b1,
  polymer: 0x1e1f23,
  grip: 0x141518,
  wood: 0x5e3a21,
  brass: 0xc9a14a,
};

/** Lo que cada arma tiene de propio con el acabado de serie: el revólver lleva palisandro y la escopeta del Sommelier, nogal. */
const MODEL_FINISH: Partial<Record<WeaponModel, Partial<WeaponFinish>>> = {
  revolver: { wood: 0x4e2817, metal: 0x30333a, metalRough: 0.3 },
  shotgun: { wood: 0x5b3820, metal: 0x24272c },
};

/** Las superficies de un arma: el acabado, el color de acento del portador y lo que no cambia (huecos, cristal). */
interface Kit {
  metal: Surf;
  steel: Surf;
  polymer: Surf;
  grip: Surf;
  wood: Surf;
  brass: Surf;
  slot: Surf;
  accent: Surf;
  lens: Surf;
  shell: Surf;
  pad: Surf;
}

function kit(f: WeaponFinish, accent: number): Kit {
  return {
    metal: { c: f.metal, r: f.metalRough, m: f.metalness },
    steel: { c: f.steel, r: 0.26, m: 0.9 },
    polymer: { c: f.polymer, r: 0.62, m: 0 },
    grip: { c: f.grip, r: 0.9, m: 0 },
    wood: { c: f.wood, r: 0.42, m: 0 },
    brass: { c: f.brass, r: 0.3, m: 1 },
    slot: { c: 0x0a0b0d, r: 0.9, m: 0 },
    accent: { c: accent, r: 0.45, m: 0 },
    lens: { c: 0x1d4a66, r: 0.06, m: 0.2 },
    shell: { c: 0x9a2026, r: 0.5, m: 0 },
    pad: { c: 0x2a1512, r: 0.88, m: 0 },
  };
}

// ------------------------------------------------------------------ piezas comunes

/** Raíl Picatinny entre zBack y zFront, con su base a la altura y: base y dientes transversales. Tapa a y + 0,007. */
function rail(k: Kit, zBack: number, zFront: number, y: number, w = 0.021): BufferGeometry[] {
  const len = zBack - zFront;
  const n = Math.max(1, Math.floor(len / 0.01));
  return [
    block(w * 0.8, 0.004, len, k.metal, 0, y + 0.002, (zBack + zFront) / 2, 0.0008),
    ...repeat(n, zBack - 0.005, -0.01, (z) => cube(w, 0.0035, 0.0052, k.metal, 0, y + 0.0055, z)),
  ];
}

/** Gatillo curvo con su borde delantero en z, colgando desde la altura y. */
function trigger(k: Kit, z: number, y: number): BufferGeometry {
  return side(
    [
      [z + 0.002, y],
      [z - 0.002, y - 0.011, 0.004],
      [z + 0.004, y - 0.017, 0.002],
      [z + 0.007, y - 0.009],
      [z + 0.007, y],
    ],
    0.005,
    k.steel,
    { bevel: 0.001 },
  );
}

/** Boca del cañón: un disco oscuro en z. */
function bore(k: Kit, z: number, y: number, r: number): BufferGeometry {
  return tube(r, z + 0.0004, z - 0.0004, k.slot, 0, y, 10);
}

/** Freno de boca con puertos laterales, de z0 hacia delante. */
function brake(k: Kit, z0: number, y: number, r = 0.0115, len = 0.055): BufferGeometry[] {
  const z1 = z0 - len;
  return [
    lathe(
      [
        [0, z0],
        [r - 0.0015, z0],
        [r, z0 - 0.002],
        [r, z1 + 0.003],
        [r - 0.002, z1],
        [0.0055, z1],
        [0, z1 + 0.0005],
      ],
      k.metal,
      0,
      y,
      14,
    ),
    ...repeat(3, z0 - 0.013, -0.013, (z) => cube(2 * r + 0.0012, 0.0045, 0.0065, k.slot, 0, y, z)),
    ...repeat(2, z0 - 0.019, -0.013, (z) => cube(0.006, 0.0012, 0.0055, k.slot, 0, y + r, z)),
    bore(k, z1 + 0.0002, y, 0.0052),
  ];
}

/** Empuñadura de pistola de los fusiles: angulosa, con la cresta del dedo y la cola de castor. */
const AR_GRIP: readonly P[] = [
  [0.004, -0.018],
  [0.015, -0.048, 0.004],
  [0.011, -0.058, 0.006],
  [0.038, -0.104, 0.008],
  [0.076, -0.097, 0.008],
  [0.05, -0.03, 0.012],
  [0.058, -0.018, 0.003],
];

/** Tubo y culata telescópica de los fusiles, con cantonera de goma. Cantonera a 0,276 de la mano. */
function arStock(k: Kit, z0 = 0.066): BufferGeometry[] {
  return [
    tube(0.0145, z0, 0.2, k.metal, 0, 0.03, 12),
    side(
      [
        [0.1, 0.05, 0.004],
        [0.17, 0.058, 0.012],
        [0.262, 0.058, 0.004],
        [0.262, -0.036, 0.004],
        [0.24, -0.04, 0.008],
        [0.16, -0.004, 0.02],
        [0.108, 0.008, 0.004],
      ],
      0.042,
      k.polymer,
      { bevel: 0.003 },
    ),
    side(
      [
        [0.262, 0.058, 0.003],
        [0.276, 0.058, 0.004],
        [0.276, -0.036, 0.004],
        [0.262, -0.036, 0.003],
      ],
      0.044,
      k.grip,
      { bevel: 0.003 },
    ),
    block(0.012, 0.008, 0.03, k.metal, 0, 0.008, 0.13, 0.002),
  ];
}

/** Cajón superior de un fusil (con raíl, asistente de cierre, deflector y palanca de carga) hasta z = front. */
function arUpper(k: Kit, front: number): BufferGeometry[] {
  return [
    side(
      [
        [0.066, 0.014],
        [0.066, 0.056, 0.004],
        [front, 0.056, 0.002],
        [front, 0.014],
      ],
      0.032,
      k.metal,
      { bevel: 0.002 },
    ),
    tube(0.0055, 0.046, 0.022, k.metal, 0.0185, 0.043, 10),
    block(0.005, 0.012, 0.012, k.metal, 0.0175, 0.048, 0.01, 0.002),
    cube(0.0012, 0.012, 0.046, k.slot, 0.0163, 0.034, -0.03),
    block(0.034, 0.006, 0.014, k.metal, 0, 0.0525, 0.072, 0.0015),
    ...rail(k, 0.064, front + 0.002, 0.056),
  ];
}

const AR_LOWER: readonly P[] = [
  [0.066, 0.015],
  [0.072, 0.008, 0.004],
  [0.072, -0.008, 0.006],
  [0.056, -0.02, 0.006],
  [0.006, -0.022],
  [-0.004, -0.03, 0.004],
  [-0.058, -0.03, 0.005],
  [-0.066, -0.022, 0.003],
  [-0.068, -0.05, 0.003],
  [-0.114, -0.05, 0.003],
  [-0.114, 0.015],
];
const AR_GUARD: readonly P[] = [
  [-0.008, -0.006],
  [-0.008, -0.024, 0.003],
  [-0.054, -0.024, 0.003],
  [-0.054, -0.006],
];

/** Cajón inferior con brocal y guardamonte, empuñadura, gatillo y selector. */
function arLower(k: Kit): BufferGeometry[] {
  return [
    side(AR_LOWER, 0.031, k.metal, { bevel: 0.002, holes: [AR_GUARD] }),
    side(AR_GRIP, 0.03, k.polymer, { bevel: 0.003 }),
    trigger(k, -0.024, -0.006),
    block(0.004, 0.008, 0.012, k.metal, -0.0165, 0, 0.03, 0.0015),
  ];
}

/** Guardamanos octogonal (caras planas arriba y a los lados) con ranuras laterales e inferiores y raíl arriba. */
function handguard(k: Kit, z0: number, z1: number, y: number, slots: readonly number[]): BufferGeometry[] {
  const r = 0.0227;
  const flat = r * Math.cos(Math.PI / 8);
  return [
    tube(r, z0, z1, k.metal, 0, y, 8, Math.PI / 8),
    ...rail(k, z0 - 0.002, z1 + 0.002, y + flat),
    ...slots.flatMap((z) => [
      cube(0.0012, 0.008, 0.026, k.slot, flat + 0.0003, y, z),
      cube(0.0012, 0.008, 0.026, k.slot, -flat - 0.0003, y, z),
      cube(0.008, 0.0012, 0.026, k.slot, 0, y - flat - 0.0003, z),
    ]),
  ];
}

/** Visor de punto rojo sobre el raíl (cuya tapa está en railTop), centrado en z. */
function redDot(k: Kit, z: number, railTop: number): BufferGeometry[] {
  const y = railTop + 0.03;
  return [
    block(0.024, 0.016, 0.034, k.metal, 0, railTop + 0.008, z, 0.002),
    lathe(
      [
        [0, z + 0.034],
        [0.012, z + 0.034],
        [0.0165, z + 0.03],
        [0.0165, z - 0.018],
        [0.019, z - 0.024],
        [0.019, z - 0.034],
        [0.0165, z - 0.034],
        [0.0165, z - 0.03],
      ],
      k.metal,
      0,
      y,
      14,
    ),
    tube(0.0158, z - 0.0255, z - 0.0265, k.lens, 0, y, 14),
    knob(0.0065, 0.012, k.metal, 0.018, y, z + 0.004, 10),
  ];
}

/** Mira telescópica: anillas, tubo con ocular y objetivo, torretas, lentes y un anillo del color del portador. */
function scope(k: Kit, railTop: number): BufferGeometry[] {
  const y = railTop + 0.034;
  const tr = 0.0135;
  return [
    block(0.03, 0.03, 0.022, k.metal, 0, railTop + 0.015, -0.12, 0.003),
    block(0.03, 0.03, 0.022, k.metal, 0, railTop + 0.015, 0, 0.003),
    lathe(
      [
        [0, 0.11],
        [0.0175, 0.11],
        [0.02, 0.106],
        [0.02, 0.075],
        [0.0145, 0.06],
        [tr, 0.055],
        [tr, -0.14],
        [0.016, -0.155],
        [0.024, -0.19],
        [0.025, -0.232],
        [0.0232, -0.236],
        [0.0215, -0.236],
        [0.0215, -0.232],
      ],
      k.metal,
      0,
      y,
      16,
    ),
    tube(0.0212, -0.2318, -0.2324, k.lens, 0, y, 16),
    tube(0.017, 0.1092, 0.1098, k.lens, 0, y, 14),
    post(0.0095, 0.022, k.metal, 0, y + tr + 0.009, -0.045, 12),
    knob(0.0095, 0.022, k.metal, tr + 0.009, y, -0.045, 12),
    knob(0.0075, 0.016, k.metal, -(tr + 0.007), y, -0.045, 12),
    tube(0.0255, -0.196, -0.204, k.accent, 0, y, 16),
  ];
}

/** Portacartuchos al costado (x) del cajón: cuatro cartuchos de pie con su culote de latón. */
function saddle(k: Kit, x: number, y: number, z0: number): BufferGeometry[] {
  const out = [block(0.004, 0.05, 0.1, k.polymer, x, y, z0 - 0.045, 0.003)];
  for (let i = 0; i < 4; i++) {
    const z = z0 - 0.012 - i * 0.022;
    out.push(post(0.0095, 0.04, k.shell, x + 0.0115, y + 0.004, z, 10), post(0.0099, 0.01, k.brass, x + 0.0115, y - 0.021, z, 10));
  }
  return out;
}

// ------------------------------------------------------------------ armas

const PISTOL_FRAME: readonly P[] = [
  [0.014, 0.029],
  [-0.165, 0.029],
  [-0.165, 0.008, 0.004],
  [-0.104, 0.008],
  [-0.104, -0.018, 0.012],
  [-0.062, -0.027, 0.01],
  [-0.034, -0.014, 0.006],
  [-0.024, -0.03, 0.004],
  [-0.021, -0.042, 0.004],
  [0, -0.106, 0.008],
  [0.046, -0.1, 0.008],
  [0.026, -0.02, 0.012],
  [0.04, 0.008, 0.008],
  [0.03, 0.022, 0.006],
];
const PISTOL_GUARD: readonly P[] = [
  [-0.097, 0.002],
  [-0.097, -0.014, 0.008],
  [-0.064, -0.02, 0.006],
  [-0.04, -0.008, 0.004],
  [-0.038, 0.002],
];
const PISTOL_PANEL: readonly P[] = [
  [-0.017, -0.03, 0.004],
  [0.003, -0.095, 0.006],
  [0.04, -0.09, 0.006],
  [0.024, -0.026, 0.006],
];

/** Pistola de competición: corredera con estrías y rebaje superior, compensador con puertos, armazón de polímero. */
function pistol(k: Kit): BufferGeometry[] {
  const y = 0.046;
  return [
    side(
      [
        [0.014, 0.028],
        [0.014, 0.064, 0.004],
        [-0.168, 0.064, 0.004],
        [-0.188, 0.058, 0.004],
        [-0.188, 0.028],
      ],
      0.03,
      k.metal,
      { bevel: 0.002 },
    ),
    ...repeat(6, 0.009, -0.0055, (z) => cube(0.0314, 0.022, 0.0022, k.slot, 0, 0.047, z)),
    ...repeat(5, -0.13, -0.0055, (z) => cube(0.0314, 0.022, 0.0022, k.slot, 0, 0.047, z)),
    cube(0.012, 0.0008, 0.06, k.slot, 0, 0.0642, -0.1),
    cube(0.0012, 0.012, 0.042, k.slot, 0.0152, 0.054, -0.048),
    cube(0.0012, 0.005, 0.03, k.steel, 0.0157, 0.0565, -0.05),
    side(
      [
        [-0.188, 0.028],
        [-0.188, 0.063],
        [-0.224, 0.063, 0.006],
        [-0.232, 0.05, 0.006],
        [-0.232, 0.028, 0.004],
      ],
      0.031,
      k.metal,
      { bevel: 0.0018 },
    ),
    ...repeat(2, -0.2, -0.012, (z) => cube(0.012, 0.0012, 0.006, k.slot, 0, 0.0632, z)),
    bore(k, -0.2322, y, 0.0052),
    side(PISTOL_FRAME, 0.027, k.polymer, { bevel: 0.0025, holes: [PISTOL_GUARD] }),
    side(PISTOL_PANEL, 0.032, k.grip, { bevel: 0.002 }),
    block(0.032, 0.008, 0.05, k.metal, 0, -0.107, 0.024, 0.002, -0.13),
    trigger(k, -0.06, 0.004),
    side(
      [
        [0.012, 0.036],
        [0.026, 0.036, 0.003],
        [0.031, 0.05, 0.004],
        [0.022, 0.055, 0.003],
        [0.012, 0.047],
      ],
      0.008,
      k.metal,
      { bevel: 0.001 },
    ),
    block(0.004, 0.006, 0.014, k.metal, 0.0155, 0.033, 0.002, 0.0015),
    block(0.004, 0.006, 0.014, k.metal, -0.0155, 0.033, 0.002, 0.0015),
    block(0.003, 0.0045, 0.022, k.metal, -0.0148, 0.026, -0.066, 0.0012),
    block(0.028, 0.009, 0.012, k.metal, 0, 0.068, 0.006, 0.0015),
    block(0.006, 0.0062, 0.0128, k.slot, 0, 0.0706, 0.006, 0.0006),
    block(0.006, 0.009, 0.01, k.metal, 0, 0.068, -0.177, 0.0015),
    tube(0.0017, -0.1715, -0.1755, k.accent, 0, 0.0695, 8),
  ];
}

const REV_FRAME: readonly P[] = [
  [0.03, 0.03, 0.01],
  [0.018, 0.054, 0.008],
  [-0.072, 0.054, 0.004],
  [-0.072, 0.008, 0.004],
  [-0.044, 0.006, 0.004],
  [-0.046, -0.018, 0.012],
  [-0.016, -0.026, 0.01],
  [0, -0.012, 0.004],
  [0.006, -0.016],
  [0.03, -0.012],
];
const REV_GUARD: readonly P[] = [
  [-0.039, 0],
  [-0.04, -0.012, 0.008],
  [-0.018, -0.019, 0.006],
  [-0.006, -0.008, 0.004],
  [-0.006, 0],
];
const REV_GRIP: readonly P[] = [
  [0, -0.01],
  [0.004, -0.04, 0.008],
  [0.012, -0.092, 0.012],
  [0.05, -0.096, 0.012],
  [0.05, -0.06, 0.01],
  [0.034, -0.008, 0.01],
];

/** Sección del tambor: círculo de radio R con seis estrías de profundidad `depth` entre las recámaras. */
function fluted(R: number, depth: number): Shape {
  const s = new Shape();
  const n = 48;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const f = Math.max(0, Math.cos(6 * (a - Math.PI / 6))) ** 6;
    const r = R - depth * f;
    if (i === 0) s.moveTo(Math.sin(a) * r, Math.cos(a) * r);
    else s.lineTo(Math.sin(a) * r, Math.cos(a) * r);
  }
  return s;
}

/** Revólver de seis tiros: armazón de acero, tambor estriado, cañón con costilla y protector, cachas de palisandro. */
function revolver(k: Kit): BufferGeometry[] {
  const y = 0.042;
  const cy = 0.027;
  const mouths = Array.from({ length: 6 }, (_, i) => {
    const a = (i * Math.PI) / 3;
    return tube(0.0042, -0.0581, -0.0587, k.slot, Math.sin(a) * 0.013, cy + Math.cos(a) * 0.013, 8);
  });
  return [
    side(REV_FRAME, 0.03, k.metal, { bevel: 0.002, holes: [REV_GUARD] }),
    along(fluted(0.021, 0.0034), -0.058, -0.012, k.metal, 0, cy, 0.0015, 2),
    ...mouths,
    tube(0.0095, -0.072, -0.235, k.metal, 0, y, 14),
    block(0.009, 0.006, 0.163, k.metal, 0, 0.0535, -0.1535, 0.0015),
    side(
      [
        [-0.072, 0.036],
        [-0.235, 0.036, 0.003],
        [-0.235, 0.022, 0.006],
        [-0.072, 0.02],
      ],
      0.017,
      k.metal,
      { bevel: 0.0015 },
    ),
    side(
      [
        [-0.219, 0.056],
        [-0.235, 0.056, 0.002],
        [-0.235, 0.067, 0.002],
        [-0.225, 0.067],
      ],
      0.006,
      k.metal,
      { bevel: 0.001 },
    ),
    block(0.0064, 0.0045, 0.006, k.accent, 0, 0.0625, -0.2305, 0.0008),
    bore(k, -0.2355, y, 0.0046),
    side(
      [
        [0.02, 0.044],
        [0.03, 0.05, 0.003],
        [0.042, 0.066, 0.004],
        [0.034, 0.07, 0.003],
        [0.022, 0.058],
        [0.016, 0.05],
      ],
      0.008,
      k.metal,
      { bevel: 0.001 },
    ),
    trigger(k, -0.026, 0),
    side(REV_GRIP, 0.035, k.wood, { bevel: 0.004, curve: 5 }),
    knob(0.0045, 0.0362, k.accent, 0, -0.05, 0.027, 10),
    block(0.004, 0.006, 0.012, k.metal, -0.016, 0.03, -0.004, 0.0015),
  ];
}

const AR_MAG: readonly P[] = [
  [-0.07, -0.028],
  [-0.112, -0.028],
  [-0.117, -0.095, 0.05],
  [-0.136, -0.168, 0.006],
  [-0.094, -0.176, 0.006],
  [-0.075, -0.1, 0.05],
];

/** Carabina: cajones, guardamanos octogonal con empuñadura delantera inclinada, freno de boca, punto rojo y culata telescópica. */
function rifle(k: Kit): BufferGeometry[] {
  const y = 0.035;
  return [
    ...arUpper(k, -0.112),
    ...arLower(k),
    side(AR_MAG, 0.026, k.polymer, { bevel: 0.002, curve: 6 }),
    block(0.029, 0.01, 0.046, k.accent, 0, -0.176, -0.115, 0.002, 0.19),
    ...handguard(k, -0.112, -0.42, y, [-0.17, -0.23, -0.29]),
    side(
      [
        [-0.372, 0.014],
        [-0.43, 0.014, 0.004],
        [-0.422, -0.002, 0.006],
        [-0.39, -0.022, 0.01],
        [-0.374, -0.017, 0.006],
      ],
      0.024,
      k.polymer,
      { bevel: 0.003 },
    ),
    tube(0.0085, -0.42, -0.58, k.metal, 0, y, 12),
    ...brake(k, -0.58, y),
    block(0.016, 0.02, 0.012, k.metal, 0, 0.073, -0.405, 0.002),
    block(0.022, 0.014, 0.014, k.metal, 0, 0.07, 0.052, 0.002),
    ...redDot(k, -0.035, 0.0633),
    ...arStock(k),
    block(0.004, 0.012, 0.012, k.metal, 0.024, 0.004, 0.15, 0.002),
  ];
}

/** Rifle de tirador: como la carabina, con guardamanos largo, bípode plegado, cañón pesado, mira y culata de precisión. */
function dmr(k: Kit): BufferGeometry[] {
  const y = 0.035;
  return [
    ...arUpper(k, -0.112),
    ...arLower(k),
    side(
      [
        [-0.07, -0.028],
        [-0.112, -0.028],
        [-0.115, -0.11, 0.004],
        [-0.073, -0.112, 0.004],
      ],
      0.028,
      k.polymer,
      { bevel: 0.002 },
    ),
    block(0.031, 0.009, 0.046, k.metal, 0, -0.112, -0.094, 0.002),
    ...handguard(k, -0.112, -0.48, y, [-0.17, -0.23, -0.29, -0.35, -0.41]),
    tube(0.0045, -0.31, -0.47, k.metal, -0.009, 0.006, 8),
    tube(0.0045, -0.31, -0.47, k.metal, 0.009, 0.006, 8),
    block(0.03, 0.012, 0.02, k.metal, 0, 0.008, -0.465, 0.002),
    tube(0.0095, -0.48, -0.765, k.metal, 0, y, 12),
    ...brake(k, -0.765, y, 0.0135, 0.07),
    ...scope(k, 0.0633),
    tube(0.0145, 0.066, 0.13, k.metal, 0, 0.03, 12),
    side(
      [
        [0.105, 0.056, 0.004],
        [0.282, 0.056, 0.006],
        [0.29, -0.046, 0.006],
        [0.268, -0.05, 0.006],
        [0.2, -0.02, 0.03],
        [0.14, -0.008, 0.02],
        [0.108, 0.008, 0.004],
      ],
      0.042,
      k.polymer,
      { bevel: 0.003 },
    ),
    block(0.034, 0.016, 0.12, k.polymer, 0, 0.066, 0.2, 0.005),
    post(0.003, 0.014, k.metal, 0, 0.056, 0.16, 6),
    post(0.003, 0.014, k.metal, 0, 0.056, 0.24, 6),
    side(
      [
        [0.282, 0.058, 0.003],
        [0.294, 0.058, 0.004],
        [0.298, -0.048, 0.004],
        [0.286, -0.048, 0.003],
      ],
      0.044,
      k.grip,
      { bevel: 0.003 },
    ),
  ];
}

const SMG_LOWER: readonly P[] = [
  [-0.05, 0.016],
  [-0.05, -0.012, 0.008],
  [-0.01, -0.02, 0.006],
  [0.008, -0.03, 0.004],
  [0.02, -0.1, 0.008],
  [0.058, -0.094, 0.008],
  [0.044, -0.02, 0.012],
  [0.05, 0.016, 0.004],
];
const SMG_GUARD: readonly P[] = [
  [-0.044, 0.008],
  [-0.044, -0.007, 0.006],
  [-0.014, -0.012, 0.004],
  [-0.004, 0.008],
];
const SMG_MAG: readonly P[] = [
  [-0.092, -0.002],
  [-0.114, -0.002],
  [-0.12, -0.08, 0.05],
  [-0.142, -0.15, 0.005],
  [-0.116, -0.157, 0.005],
  [-0.096, -0.085, 0.05],
];

/** Subfusil compacto: cajón con raíl, guardamanos profundo, cargador curvo, miras de túnel y tambor, culata de varillas. */
function smg(k: Kit): BufferGeometry[] {
  const y = 0.04;
  return [
    side(
      [
        [0.056, 0.064, 0.006],
        [-0.15, 0.064, 0.004],
        [-0.15, 0.016, 0.004],
        [-0.116, 0.012],
        [-0.116, -0.004],
        [-0.09, -0.004],
        [-0.09, 0.012],
        [0.056, 0.014, 0.006],
      ],
      0.036,
      k.metal,
      { bevel: 0.002 },
    ),
    ...rail(k, 0.04, -0.13, 0.064, 0.02),
    tube(0.006, -0.12, -0.165, k.metal, -0.021, 0.056, 8),
    block(0.014, 0.006, 0.008, k.metal, -0.026, 0.056, -0.16, 0.002),
    cube(0.0012, 0.012, 0.04, k.slot, 0.0182, 0.042, -0.04),
    side(
      [
        [-0.15, 0.06, 0.004],
        [-0.258, 0.06, 0.008],
        [-0.264, 0.04, 0.008],
        [-0.256, -0.002, 0.01],
        [-0.15, -0.002, 0.004],
      ],
      0.046,
      k.polymer,
      { bevel: 0.004 },
    ),
    block(0.0475, 0.008, 0.05, k.slot, 0, 0.03, -0.205, 0.003),
    tube(0.0085, -0.264, -0.336, k.metal, 0, y, 12),
    tube(0.0112, -0.33, -0.355, k.metal, 0, y, 10),
    bore(k, -0.3552, y, 0.0055),
    block(0.012, 0.018, 0.012, k.metal, 0, 0.074, -0.236, 0.002),
    tube(0.0095, -0.232, -0.244, k.metal, 0, 0.088, 12),
    knob(0.011, 0.016, k.metal, 0, 0.078, 0.038, 12),
    side(SMG_LOWER, 0.032, k.polymer, { bevel: 0.0025, holes: [SMG_GUARD] }),
    trigger(k, -0.03, 0.004),
    side(SMG_MAG, 0.022, k.metal, { bevel: 0.0015, curve: 6 }),
    block(0.025, 0.008, 0.03, k.accent, 0, -0.157, -0.13, 0.002, 0.3),
    tube(0.0045, 0.056, 0.172, k.metal, 0.017, 0.042, 8),
    tube(0.0045, 0.056, 0.172, k.metal, -0.017, 0.042, 8),
    side(
      [
        [0.166, 0.066, 0.004],
        [0.184, 0.066, 0.004],
        [0.19, -0.03, 0.006],
        [0.172, -0.03, 0.004],
      ],
      0.044,
      k.polymer,
      { bevel: 0.003 },
    ),
  ];
}

const SG_RECEIVER: readonly P[] = [
  [0.022, 0.018],
  [0.022, 0.058, 0.012],
  [0.005, 0.072, 0.01],
  [-0.17, 0.072, 0.004],
  [-0.17, 0.012, 0.004],
  [-0.06, 0.012],
  [-0.052, -0.012, 0.01],
  [-0.012, -0.022, 0.008],
  [0.004, -0.006, 0.004],
  [0.014, 0.006],
];
const SG_GUARD: readonly P[] = [
  [-0.044, 0.004],
  [-0.046, -0.008, 0.006],
  [-0.016, -0.014, 0.004],
  [-0.008, -0.002],
  [-0.008, 0.004],
];
const SG_STOCK: readonly P[] = [
  [0.018, 0.064, 0.006],
  [0.12, 0.05, 0.03],
  [0.298, 0.048, 0.01],
  [0.302, -0.07, 0.008],
  [0.27, -0.068, 0.02],
  [0.12, -0.035, 0.04],
  [0.07, -0.055, 0.015],
  [0.04, -0.045, 0.01],
  [0.018, -0.018, 0.008],
];

/** Bombeo de madera con estrías, alrededor del depósito tubular (perfil de atrás adelante). */
const FOREND: ReadonlyArray<readonly [number, number]> = (() => {
  const out: Array<[number, number]> = [
    [0, -0.36],
    [0.016, -0.36],
    [0.021, -0.367],
  ];
  for (let z = -0.375; z > -0.505; z -= 0.012) out.push([0.021, z], [0.0188, z - 0.002], [0.0188, z - 0.004], [0.021, z - 0.006]);
  out.push([0.021, -0.512], [0.016, -0.52], [0, -0.52]);
  return out;
})();

/** Escopeta de corredera del Sommelier: cajón con grabado de latón, costilla ventilada, bombeo y culata de nogal. */
function shotgun(k: Kit): BufferGeometry[] {
  const y = 0.05;
  const ty = 0.022;
  return [
    side(SG_RECEIVER, 0.046, k.metal, { bevel: 0.003, holes: [SG_GUARD] }),
    side(
      [
        [-0.15, 0.06, 0.004],
        [-0.03, 0.06, 0.004],
        [-0.03, 0.026, 0.004],
        [-0.15, 0.026, 0.004],
      ],
      0.0475,
      k.brass,
      { bevel: 0.0008 },
    ),
    cube(0.048, 0.0012, 0.104, k.slot, 0, 0.055, -0.09),
    cube(0.048, 0.0012, 0.104, k.slot, 0, 0.031, -0.09),
    tube(0.0115, -0.17, -0.68, k.metal, 0, y, 14),
    block(0.008, 0.003, 0.5, k.metal, 0, 0.0655, -0.43, 0.001),
    ...repeat(10, -0.2, -0.05, (z) => cube(0.004, 0.0045, 0.004, k.metal, 0, 0.0625, z)),
    post(0.0024, 0.006, k.brass, 0, 0.0695, -0.672, 8),
    bore(k, -0.6805, y, 0.0085),
    tube(0.0105, -0.17, -0.6, k.metal, 0, ty, 12),
    lathe(
      [
        [0, -0.598],
        [0.0112, -0.598],
        [0.0112, -0.616],
        [0.008, -0.623],
        [0, -0.624],
      ],
      k.metal,
      0,
      ty,
      12,
    ),
    block(0.026, 0.05, 0.012, k.metal, 0, 0.036, -0.585, 0.004),
    lathe(FOREND, k.wood, 0, ty, 14),
    block(0.003, 0.006, 0.19, k.metal, 0.012, ty, -0.265, 0.001),
    block(0.003, 0.006, 0.19, k.metal, -0.012, ty, -0.265, 0.001),
    side(SG_STOCK, 0.042, k.wood, { bevel: 0.005, curve: 6 }),
    side(
      [
        [0.298, 0.05, 0.004],
        [0.314, 0.05, 0.004],
        [0.318, -0.07, 0.004],
        [0.302, -0.07, 0.004],
      ],
      0.044,
      k.pad,
      { bevel: 0.003 },
    ),
    trigger(k, -0.03, 0),
    block(0.008, 0.004, 0.012, k.metal, 0, 0.073, 0.004, 0.0015),
    ...saddle(k, 0.024, 0.042, -0.025),
  ];
}

const TSG_RECEIVER: readonly P[] = [
  [0.024, 0.018],
  [0.024, 0.07, 0.006],
  [-0.18, 0.07, 0.004],
  [-0.18, 0.012, 0.004],
  [-0.06, 0.012],
  [-0.052, -0.012, 0.01],
  [-0.012, -0.022, 0.008],
  [0.004, -0.018],
  [0.03, -0.018, 0.004],
  [0.034, 0.006, 0.004],
];

/** Escopeta táctica semiautomática: negra, con raíl y miras de anillo, guardamanos con ranuras, culata de fusil. */
function shotgunTactical(k: Kit): BufferGeometry[] {
  const y = 0.052;
  const ty = 0.022;
  return [
    side(TSG_RECEIVER, 0.05, k.metal, { bevel: 0.0025, holes: [SG_GUARD] }),
    ...rail(k, 0.02, -0.17, 0.07, 0.022),
    cube(0.0012, 0.018, 0.06, k.slot, 0.0256, 0.052, -0.06),
    tube(0.012, -0.18, -0.64, k.metal, 0, y, 14),
    bore(k, -0.6405, y, 0.0088),
    tube(0.0105, -0.18, -0.56, k.metal, 0, ty, 12),
    lathe(
      [
        [0, -0.558],
        [0.0112, -0.558],
        [0.0112, -0.574],
        [0.007, -0.58],
        [0, -0.581],
      ],
      k.metal,
      0,
      ty,
      12,
    ),
    block(0.028, 0.052, 0.014, k.metal, 0, 0.037, -0.5, 0.004),
    side(
      [
        [-0.24, 0.044, 0.008],
        [-0.4, 0.044, 0.008],
        [-0.4, 0, 0.01],
        [-0.24, 0, 0.01],
      ],
      0.05,
      k.polymer,
      { bevel: 0.004 },
    ),
    ...repeat(3, -0.27, -0.045, (z) => block(0.0512, 0.008, 0.028, k.slot, 0, 0.022, z, 0.003)),
    block(0.004, 0.016, 0.006, k.metal, 0, 0.071, -0.615, 0.001),
    block(0.022, 0.014, 0.014, k.metal, 0, 0.0845, 0, 0.002),
    knob(0.0055, 0.004, k.metal, 0, 0.094, 0, 12),
    side(AR_GRIP, 0.03, k.polymer, { bevel: 0.003 }),
    trigger(k, -0.03, 0),
    ...arStock(k, 0.03),
    ...saddle(k, 0.026, 0.044, -0.025),
    block(0.01, 0.014, 0.02, k.accent, 0.026, 0.03, -0.155, 0.003),
  ];
}

const KNIFE_HANDLE: readonly P[] = [
  [-0.036, 0.015],
  [0.052, 0.014, 0.006],
  [0.056, -0.004, 0.006],
  [0.05, -0.02, 0.006],
  [0.03, -0.017, 0.008],
  [0.02, -0.022, 0.006],
  [0.004, -0.017, 0.008],
  [-0.008, -0.022, 0.006],
  [-0.022, -0.017, 0.006],
  [-0.036, -0.02],
];

/** Cuchillo táctico: hoja de punta recortada con vaceo, guarda, mango con huecos para los dedos y pomo. */
function knife(k: Kit): BufferGeometry[] {
  return [
    side(
      [
        [-0.04, 0.013],
        [-0.155, 0.013],
        [-0.185, 0.008, 0.01],
        [-0.212, -0.001],
        [-0.18, -0.016, 0.03],
        [-0.06, -0.017],
        [-0.045, -0.012, 0.004],
        [-0.04, -0.012],
      ],
      0.0045,
      k.steel,
      { bevel: 0.0019, curve: 6 },
    ),
    block(0.0049, 0.0026, 0.075, k.metal, 0, 0.0045, -0.1, 0.001),
    block(0.014, 0.05, 0.008, k.metal, 0, 0, -0.04, 0.002),
    side(KNIFE_HANDLE, 0.024, k.grip, { bevel: 0.004 }),
    block(0.022, 0.03, 0.012, k.metal, 0, -0.002, 0.058, 0.004),
  ];
}

const BUILD: Record<Exclude<WeaponModel, 'none'>, (k: Kit) => BufferGeometry[]> = {
  pistol,
  revolver,
  rifle,
  dmr,
  smg,
  shotgun,
  shotgunTactical,
  knife,
};

/**
 * Geometría de cada arma: el cañón apunta a −Z del soporte y la empuñadura queda en la mano (el origen). El color de
 * acento marca un detalle (la fibra del punto de mira, la base del cargador, el medallón de las cachas); en los
 * enemigos es el color de su tipo. Cada vértice lleva su color, rugosidad y metalicidad: un solo material para todas.
 */
export function weaponGeometry(model: Exclude<WeaponModel, 'none'>, accent: number, finish: WeaponFinish = DEFAULT_FINISH): BufferGeometry {
  const f = finish === DEFAULT_FINISH ? { ...finish, ...MODEL_FINISH[model] } : finish;
  return assemble(BUILD[model](kit(f, accent)));
}

/**
 * Granada aturdidora de pie (eje +Y, base en el origen): cuerpo perforado verde oliva con sus bandas, espoleta,
 * cuchara y anilla. La misma en la armería, en la mano y en vuelo.
 */
function stun(k: Kit): BufferGeometry[] {
  const body: Surf = { c: 0x3c4434, r: 0.7, m: 0 };
  const holes: BufferGeometry[] = [];
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + row * 0.5;
      // Cada agujero mira hacia fuera: el disco (eje X) se gira hacia su dirección radial.
      const hole = knob(0.0042, 0.003, k.slot, 0, 0, 0, 8);
      hole.rotateY(a - Math.PI / 2);
      hole.translate(Math.sin(a) * 0.0188, 0.026 + row * 0.018, Math.cos(a) * 0.0188);
      holes.push(hole);
    }
  }
  return [
    post(0.019, 0.08, body, 0, 0.04, 0, 14),
    post(0.0196, 0.006, k.accent, 0, 0.012, 0, 14),
    post(0.0196, 0.006, k.accent, 0, 0.074, 0, 14),
    ...holes,
    post(0.012, 0.016, k.metal, 0, 0.088, 0, 12),
    block(0.008, 0.06, 0.003, k.metal, 0, 0.066, 0.021, 0.0015),
    ring(0.009, 0.0013, k.steel, 0, 0.094, -0.012),
  ];
}

/**
 * Escudo balístico: cinco paneles en curva (mira a −Z, centrado en el asa), con su visor, sus nervios, los cantos
 * reforzados y una franja del color de su portador.
 */
export function shieldGeometry(accent: number): BufferGeometry {
  const k = kit(DEFAULT_FINISH, accent);
  const plate: Surf = { c: 0x30363a, r: 0.55, m: 0.35 };
  const dark: Surf = { c: 0x191c1f, r: 0.6, m: 0.3 };
  const H = 1.14;
  const parts: BufferGeometry[] = [];
  const panel = (w: number, h: number, d: number, s: Surf, x: number, y: number, z: number, ry: number): void => {
    const g = block(w, h, d, s, 0, 0, 0, 0.006);
    g.rotateY(ry);
    g.translate(x, y, z);
    parts.push(g);
  };
  for (let i = -2; i <= 2; i++) {
    const a = i * 0.16;
    const x = Math.sin(a) * 0.8;
    const z = 0.8 - Math.cos(a) * 0.8;
    if (Math.abs(i) < 2) {
      // Los paneles del centro dejan el hueco del visor.
      panel(0.136, 0.2, 0.022, plate, x, 0.455, z, -a);
      panel(0.136, 0.1, 0.014, k.lens, x, 0.31, z, -a);
      panel(0.136, 0.82, 0.022, plate, x, -0.15, z, -a);
    } else panel(0.136, H, 0.022, plate, x, 0, z, -a);
    panel(0.136, 0.03, 0.034, dark, x, 0.55, z, -a);
    panel(0.136, 0.03, 0.034, dark, x, -0.555, z, -a);
    panel(0.136, 0.05, 0.026, k.accent, x, -0.36, z, -a);
  }
  for (const s of [-1, 1]) {
    const a = s * 0.4;
    panel(0.022, H, 0.036, dark, Math.sin(a) * 0.8, 0, 0.8 - Math.cos(a) * 0.8, -a);
    panel(0.02, 0.12, 0.03, dark, s * 0.2, 0.31, 0.032, 0);
  }
  panel(0.16, 0.05, 0.04, dark, 0, 0.0, 0.05, 0);
  panel(0.025, 0.2, 0.05, k.grip, 0.02, 0.0, 0.085, 0);
  return assemble(parts);
}

/** Geometría del equipo que se lanza (por ahora, la aturdidora). */
export function gearGeometry(_id: GearId, accent: number): BufferGeometry {
  return assemble(stun(kit(DEFAULT_FINISH, accent)));
}
