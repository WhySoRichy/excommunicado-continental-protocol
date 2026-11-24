import type { BufferGeometry } from 'three';
import { merge, shade } from './geometry';
import { type Surface, withDetail } from './loft';
import { ellipsoid, type Knot, softBox, tubePath } from './shapes';
import type { BoneId } from './skeleton';
import { applySkin, rigid } from './skin';

/**
 * Las máquinas: el sabueso (cuadrúpedo) y el dron. Son rígidas por piezas (cada pieza va a un hueso), con los mismos
 * atributos y el mismo material que los personajes: no añaden ningún programa de sombreado.
 */
export interface RobotColors {
  /** Carcasa, piezas oscuras y detalles del color de su tipo. */
  shell: number;
  dark: number;
  accent: number;
}

/** Huesos del sabueso. */
export const HOUND_BONE = {
  body: 0,
  head: 1,
  jaw: 2,
  tail: 3,
  upFL: 4,
  loFL: 5,
  upFR: 6,
  loFR: 7,
  upBL: 8,
  loBL: 9,
  upBR: 10,
  loBR: 11,
} as const;

/** Medidas del sabueso (m): cadera de cada pata, largo del muslo y de la caña, y dónde cuelgan la cabeza y la cola. */
export const HOUND = {
  hipX: 0.19,
  hipY: 0.56,
  frontZ: -0.3,
  backZ: 0.32,
  upper: 0.27,
  lower: 0.275,
  bodyY: 0.58,
  headY: 0.68,
  headZ: -0.42,
  jawY: 0.645,
  jawZ: -0.55,
  tailY: 0.66,
  tailZ: 0.4,
} as const;

/** Huesos del dron. */
export const DRONE_BONE = { body: 0, gimbal: 1, rotor0: 2, rotor1: 3, rotor2: 4, rotor3: 5 } as const;

/** Medidas del dron (m): centro del cuerpo, cardán del arma y los cuatro rotores. */
export const DRONE = {
  bodyY: 0.37,
  gimbalY: 0.29,
  gimbalZ: -0.1,
  rotorX: 0.34,
  rotorZ: 0.3,
  rotorY: 0.44,
} as const;

const metal = (c: number): Surface => ({ c, r: 0.42, m: 0.75, w: 0 });
const paint = (c: number): Surface => ({ c, r: 0.5, m: 0.35, w: 0 });
const rubber: Surface = { c: 0x0d0e10, r: 0.92, m: 0, w: 0 };
const steel: Surface = { c: 0x9aa2ad, r: 0.3, m: 0.95, w: 0 };
const lamp = (c: number): Surface => ({ c, r: 0.18, m: 0, w: 0 });

interface Part {
  g: BufferGeometry;
  bone: BoneId;
}

const UP = { x: 0, y: 1, z: 0 };

const build = (parts: Part[]): BufferGeometry => merge(parts.map((p) => applySkin(p.g, rigid(p.bone))));

/** Detalle de las mallas de cerca y de lejos. */
const DETAIL = { near: 0.9, far: 0.5 } as const;

export function houndGeometry(c: RobotColors, detail: keyof typeof DETAIL): BufferGeometry {
  return withDetail(DETAIL[detail], () => build(hound(c)));
}

export function droneGeometry(c: RobotColors, detail: keyof typeof DETAIL): BufferGeometry {
  return withDetail(DETAIL[detail], () => build(drone(c)));
}

function hound(c: RobotColors): Part[] {
  const B = HOUND_BONE;
  const H = HOUND;
  const shell = paint(c.shell);
  const plate = paint(shade(c.shell, 1.35));
  const dark = metal(c.dark);
  const glow = lamp(c.accent);
  const out: Part[] = [];
  const add = (bone: BoneId, ...gs: BufferGeometry[]): void => {
    for (const g of gs) out.push({ g, bone });
  };
  // Tronco: pecho ancho, cintura estrecha y grupa.
  add(
    B.body,
    tubePath(
      [
        { x: 0, y: 0.6, z: 0.43, a: 0.06, b: 0.06 },
        { x: 0, y: 0.6, z: 0.35, a: 0.13, b: 0.11 },
        { x: 0, y: 0.585, z: 0.14, a: 0.11, b: 0.092 },
        { x: 0, y: 0.59, z: -0.08, a: 0.135, b: 0.115 },
        { x: 0, y: 0.61, z: -0.29, a: 0.16, b: 0.14 },
        { x: 0, y: 0.63, z: -0.41, a: 0.095, b: 0.095 },
      ],
      dark,
      { segs: 14, steps: 3, up: UP, round: true },
    ),
    // Placas del lomo y de los costados.
    softBox(0.21, 0.035, 0.25, shell, { x: 0, y: 0.735, z: -0.25 }, 0.012, { x: 0.1 }),
    softBox(0.16, 0.03, 0.2, plate, { x: 0, y: 0.703, z: -0.02 }, 0.01),
    softBox(0.15, 0.03, 0.17, shell, { x: 0, y: 0.69, z: 0.17 }, 0.01),
    softBox(0.17, 0.03, 0.14, plate, { x: 0, y: 0.705, z: 0.33 }, 0.012, { x: -0.12 }),
    softBox(0.15, 0.075, 0.3, shell, { x: 0, y: 0.487, z: -0.02 }, 0.02),
    softBox(0.05, 0.09, 0.06, steel, { x: 0, y: 0.53, z: -0.39 }, 0.012),
  );
  for (const s of [-1, 1]) {
    add(
      B.body,
      softBox(0.035, 0.15, 0.24, shell, { x: s * 0.155, y: 0.625, z: -0.27 }, 0.012, { z: s * 0.18 }),
      softBox(0.03, 0.12, 0.16, plate, { x: s * 0.125, y: 0.615, z: 0.33 }, 0.012, { z: s * 0.15 }),
      softBox(0.012, 0.016, 0.22, glow, { x: s * 0.176, y: 0.665, z: -0.27 }, 0.004, { z: s * 0.18 }),
      softBox(0.02, 0.07, 0.16, steel, { x: s * 0.118, y: 0.58, z: 0.03 }, 0.006),
    );
  }
  // Cuello y cabeza: una cuña con una ranura luminosa por ojos.
  const neck: Knot[] = [
    { x: 0, y: 0.62, z: -0.36, a: 0.07, b: 0.075 },
    { x: 0, y: 0.66, z: -0.43, a: 0.06, b: 0.065 },
    { x: 0, y: 0.705, z: -0.48, a: 0.058, b: 0.06 },
  ];
  add(
    B.head,
    tubePath(neck, metal(shade(c.dark, 0.8)), { segs: 10, steps: 2, up: UP }),
    tubePath(
      [
        { x: 0, y: 0.715, z: -0.42, a: 0.06, b: 0.05 },
        { x: 0, y: 0.718, z: -0.48, a: 0.083, b: 0.072 },
        { x: 0, y: 0.712, z: -0.57, a: 0.085, b: 0.068 },
        { x: 0, y: 0.697, z: -0.67, a: 0.062, b: 0.046 },
        { x: 0, y: 0.69, z: -0.745, a: 0.046, b: 0.032 },
      ],
      shell,
      { segs: 12, steps: 3, up: UP, round: true },
    ),
    softBox(0.1, 0.02, 0.14, plate, { x: 0, y: 0.782, z: -0.53 }, 0.008, { x: -0.1 }),
    softBox(0.136, 0.02, 0.03, glow, { x: 0, y: 0.733, z: -0.632 }, 0.008, { x: -0.5 }),
  );
  for (const s of [-1, 1]) {
    add(
      B.head,
      softBox(0.018, 0.075, 0.05, dark, { x: s * 0.058, y: 0.805, z: -0.46 }, 0.006, { x: 0.35, z: s * -0.25 }),
      softBox(0.014, 0.05, 0.12, plate, { x: s * 0.083, y: 0.7, z: -0.54 }, 0.005),
    );
  }
  // Mandíbula con dientes de acero.
  add(B.jaw, softBox(0.078, 0.024, 0.19, dark, { x: 0, y: 0.648, z: -0.635 }, 0.008, { x: -0.06 }));
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) add(B.jaw, softBox(0.008, 0.026, 0.014, steel, { x: s * 0.03, y: 0.667, z: -0.62 - i * 0.036 }, 0.003));
  }
  // Antena de la cola.
  add(
    B.tail,
    tubePath(
      [
        { x: 0, y: 0.66, z: 0.4, a: 0.014 },
        { x: 0, y: 0.75, z: 0.47, a: 0.01 },
        { x: 0, y: 0.86, z: 0.5, a: 0.006 },
      ],
      dark,
      { segs: 6, steps: 2 },
    ),
    ellipsoid(0.014, 0.014, 0.014, glow, 0, 0.868, 0.502, { segs: 6, rows: 4 }),
  );
  // Patas.
  const legs: Array<[BoneId, BoneId, number, number]> = [
    [B.upFL, B.loFL, -1, H.frontZ],
    [B.upFR, B.loFR, 1, H.frontZ],
    [B.upBL, B.loBL, -1, H.backZ],
    [B.upBR, B.loBR, 1, H.backZ],
  ];
  const kneeY = H.hipY - H.upper;
  for (const [up, lo, s, z] of legs) {
    const x = s * H.hipX;
    add(
      up,
      ellipsoid(0.062, 0.07, 0.07, dark, x, H.hipY, z, { segs: 10, rows: 7 }),
      tubePath(
        [
          { x, y: H.hipY + 0.02, z, a: 0.05, b: 0.07 },
          { x, y: H.hipY - 0.12, z, a: 0.045, b: 0.058 },
          { x, y: kneeY, z, a: 0.03, b: 0.034 },
        ],
        shell,
        { segs: 9, steps: 2 },
      ),
      softBox(0.018, 0.16, 0.075, plate, { x: x + s * 0.046, y: H.hipY - 0.09, z }, 0.008),
    );
    add(
      lo,
      ellipsoid(0.036, 0.036, 0.036, steel, x, kneeY, z, { segs: 8, rows: 6 }),
      tubePath(
        [
          { x, y: kneeY, z, a: 0.026, b: 0.03 },
          { x, y: kneeY - 0.14, z, a: 0.02, b: 0.024 },
          { x, y: 0.045, z, a: 0.015, b: 0.018 },
        ],
        dark,
        { segs: 8, steps: 2 },
      ),
      // Pistón y zapata.
      tubePath(
        [
          { x, y: kneeY - 0.02, z: z - 0.04, a: 0.009 },
          { x, y: kneeY - 0.17, z: z - 0.022, a: 0.007 },
        ],
        steel,
        { segs: 6 },
      ),
      ellipsoid(0.034, 0.026, 0.046, rubber, x, 0.026, z - 0.008, { segs: 8, rows: 6 }),
    );
  }
  return out;
}

function drone(c: RobotColors): Part[] {
  const B = DRONE_BONE;
  const D = DRONE;
  const shell = paint(c.shell);
  const plate = paint(shade(c.shell, 1.3));
  const dark = metal(c.dark);
  const glow = lamp(c.accent);
  const out: Part[] = [];
  const add = (bone: BoneId, ...gs: BufferGeometry[]): void => {
    for (const g of gs) out.push({ g, bone });
  };
  const y = D.bodyY;
  add(
    B.body,
    ellipsoid(0.17, 0.085, 0.21, shell, 0, y, 0, { segs: 16, rows: 9 }),
    softBox(0.17, 0.03, 0.24, plate, { x: 0, y: y + 0.075, z: 0.01 }, 0.012),
    softBox(0.1, 0.05, 0.16, dark, { x: 0, y: y - 0.075, z: 0.05 }, 0.014),
    softBox(0.13, 0.018, 0.02, glow, { x: 0, y: y + 0.03, z: -0.196 }, 0.006),
    softBox(0.02, 0.014, 0.1, glow, { x: 0, y: y + 0.093, z: 0.05 }, 0.005),
  );
  for (const s of [-1, 1]) add(B.body, softBox(0.03, 0.06, 0.18, dark, { x: s * 0.162, y, z: 0 }, 0.01));
  const rotors: Array<[BoneId, number, number]> = [
    [B.rotor0, -1, -1],
    [B.rotor1, 1, -1],
    [B.rotor2, -1, 1],
    [B.rotor3, 1, 1],
  ];
  for (const [bone, sx, sz] of rotors) {
    const x = sx * D.rotorX;
    const z = sz * D.rotorZ;
    add(
      B.body,
      tubePath(
        [
          { x: sx * 0.11, y: y + 0.01, z: sz * 0.09, a: 0.024, b: 0.018 },
          { x: sx * 0.24, y: y + 0.03, z: sz * 0.2, a: 0.018, b: 0.014 },
          { x, y: y + 0.02, z, a: 0.015, b: 0.013 },
        ],
        dark,
        { segs: 8, steps: 2, up: UP },
      ),
      tubePath(
        [
          { x, y: y + 0.0, z, a: 0.03 },
          { x, y: y + 0.055, z, a: 0.026 },
        ],
        shell,
        { segs: 10 },
      ),
    );
    // Aro de protección.
    const ring: Knot[] = [];
    for (let i = 0; i <= 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      ring.push({ x: x + Math.cos(a) * 0.175, y: y + 0.055, z: z + Math.sin(a) * 0.175, a: 0.009, b: 0.014 });
    }
    add(B.body, tubePath(ring, plate, { segs: 6, up: UP }));
    add(
      bone,
      softBox(0.31, 0.005, 0.026, rubber, { x, y: D.rotorY, z }, 0.002, { y: 0.4 }),
      softBox(0.026, 0.005, 0.31, rubber, { x, y: D.rotorY, z }, 0.002, { y: 0.4 }),
      ellipsoid(0.018, 0.014, 0.018, steel, x, D.rotorY, z, { segs: 8, rows: 4 }),
    );
  }
  // Cardán con el arma y la lente.
  const gy = D.gimbalY;
  const gz = D.gimbalZ;
  add(
    B.gimbal,
    ellipsoid(0.07, 0.066, 0.075, dark, 0, gy, gz, { segs: 12, rows: 8 }),
    tubePath(
      [
        { x: 0, y: gy - 0.018, z: gz - 0.04, a: 0.02 },
        { x: 0, y: gy - 0.018, z: gz - 0.2, a: 0.016 },
        { x: 0, y: gy - 0.018, z: gz - 0.22, a: 0.021 },
        { x: 0, y: gy - 0.018, z: gz - 0.26, a: 0.021 },
      ],
      steel,
      { segs: 9 },
    ),
    softBox(0.05, 0.035, 0.1, shell, { x: 0.06, y: gy - 0.02, z: gz - 0.02 }, 0.008),
    ellipsoid(0.026, 0.026, 0.02, glow, 0, gy + 0.03, gz - 0.066, { segs: 10, rows: 6 }),
  );
  return out;
}
