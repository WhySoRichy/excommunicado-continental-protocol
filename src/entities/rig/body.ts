import type { BufferGeometry } from 'three';
import { bell01, far, loft, type Ring, type Surface } from './loft';
import { ellipsoid, type Knot, Shell, softBox, tubePath } from './shapes';
import { BONE, ELBOW_H, HIP_Y, KNEE_H, leg, neck, NECK_H, rigid, SHOULDER_H, type SkinFn, skirt, sleeve, trunk } from './skin';
import { FOOT_DROP, HAND_Y, SHOULDER_X } from './skeleton';
import { shade, trim } from './geometry';
import type { Outfit, RigOptions } from './types';

/** Una pieza del cuerpo y cómo se reparte entre los huesos. */
export interface BodyPart {
  g: BufferGeometry;
  skin: SkinFn;
}

// ------------------------------------------------------------------ superficies
export const cloth = (c: number, w = 1, r = 0.88): Surface => ({ c, r, m: 0, w });
export const silk = (c: number): Surface => ({ c, r: 0.46, m: 0, w: 0.35 });
export const leather = (c: number, r = 0.46): Surface => ({ c, r, m: 0, w: 0.12 });
export const skinOf = (c: number): Surface => ({ c, r: 0.56, m: 0, w: 0 });
export const hairOf = (c: number): Surface => ({ c, r: 0.6, m: 0, w: 0 });
export const steel = (c: number, r = 0.34): Surface => ({ c, r, m: 0.85, w: 0 });
export const plastic = (c: number, r = 0.55): Surface => ({ c, r, m: 0, w: 0 });

const SOLE = 0x0b0b0d;
const PI = Math.PI;

/** Mezcla lineal. */
const mix = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Faldones de la chaqueta: los empuja la pierna de su lado. */
const tails = skirt(HIP_Y + 0.02, 0.8, 0.86);

/** Anillos del tronco con chaqueta. El ancho crece con la corpulencia; el fondo, menos. */
function torsoRings(b: number, jacket: boolean, grow = 0): Ring[] {
  const w = (v: number): number => v * b + grow;
  const d = (v: number): number => v * (0.42 + 0.58 * b) + grow;
  const hem: Ring[] = jacket
    ? [
        { y: 0.795, rx: w(0.2), rz: d(0.142), rb: d(0.144), e: 2.5 },
        { y: 0.87, rx: w(0.193), rz: d(0.132), rb: d(0.138), e: 2.5 },
        { y: 0.95, rx: w(0.18), rz: d(0.119), rb: d(0.126), e: 2.45 },
      ]
    : [{ y: 0.955, rx: w(0.166), rz: d(0.107), rb: d(0.113), e: 2.4 }];
  return [
    ...hem,
    { y: 1.035, rx: w(0.164), rz: d(0.109), rb: d(0.108), e: 2.4 },
    { y: 1.11, rx: w(0.159), rz: d(0.109), rb: d(0.101), e: 2.4 },
    { y: 1.2, rx: w(0.168), rz: d(0.115), rb: d(0.106), e: 2.4 },
    { y: 1.3, rx: w(0.189), rz: d(0.124), rb: d(0.118), e: 2.4 },
    { y: 1.39, rx: w(0.205), rz: d(0.13), rb: d(0.128), e: 2.4 },
    { y: 1.455, rx: w(0.22), rz: d(0.125), rb: d(0.128), e: 2.35 },
    { y: 1.505, rx: w(0.236), rz: d(0.11), rb: d(0.12), e: 2.25 },
    { y: 1.545, rx: w(0.23), rz: d(0.09), rb: d(0.102), e: 2.15 },
    { y: 1.575, rx: w(0.186), rz: d(0.075), rb: d(0.088), e: 2.05 },
    { y: 1.6, rx: w(0.118), rz: 0.067, rb: 0.08 },
    { y: 1.625, rx: 0.076, rz: 0.06, rb: 0.07 },
  ];
}

/** Arrugas de tela alrededor de una altura (codo, rodilla, cintura). */
const wrinkle = (y: number, at: number, span: number, freq: number): number => Math.sin((y - at) * freq) * Math.exp(-(((y - at) / span) ** 2));

// ------------------------------------------------------------------ tronco
export function trunkParts(o: RigOptions): BodyPart[] {
  const c = o.colors;
  const b = o.bulk ?? 1;
  const fit: Outfit = o.outfit ?? {};
  const jacket = fit.jacket !== false;
  const top = fit.top ?? 'suit';
  const out: BodyPart[] = [];
  const add = (g: BufferGeometry, skin: SkinFn = trunk): void => void out.push({ g, skin });

  // Pelvis del pantalón (por dentro de los faldones).
  add(
    loft(
      [
        { y: 0.8, rx: 0.12 * b, rz: 0.088, rb: 0.1, e: 2.2, k: 0.7 },
        { y: 0.86, rx: 0.16 * b, rz: 0.104, rb: 0.116, e: 2.3 },
        { y: 0.94, rx: 0.168 * b, rz: 0.108, rb: 0.116, e: 2.35 },
        { y: 1.02, rx: 0.16 * b, rz: 0.104, rb: 0.104, e: 2.35 },
      ],
      cloth(c.pants),
      8,
      { segs: 14, capStart: true },
    ),
  );

  const rings = torsoRings(b, jacket && top !== 'bomber');
  const shell = new Shell(rings);
  const bodySkin: SkinFn = (x, y, z, w) => (y < HIP_Y + 0.02 ? tails(x, y, z, w) : trunk(x, y, z, w));
  const front = (a: number): number => Math.max(0, -Math.cos(a));

  if (top === 'suit') {
    const main = jacket ? c.jacket : (fit.waistcoat ?? c.shirt);
    add(
      loft(rings, cloth(main), 22, {
        segs: 24,
        mod: (p, a, y) => {
          // Pecho y omóplatos con volumen, cintura entallada y algún pliegue junto al botón y en los riñones.
          const f = front(a);
          p.z -= 0.006 * f * bell01((y - 1.4) / 0.1) * bell01((Math.abs(p.x) - 0.09 * b) / 0.06);
          p.z += 0.006 * (1 - f) * Math.max(0, Math.cos(a)) * bell01((y - 1.42) / 0.09) * bell01((Math.abs(p.x) - 0.1 * b) / 0.06);
          const k = 1 + 0.014 * wrinkle(y, 1.12, 0.07, 95) * (0.4 + 0.6 * Math.abs(Math.sin(a)));
          p.x *= k;
          p.z *= k;
        },
      }),
      jacket ? bodySkin : trunk,
    );
    suitFront(o, shell, add, jacket);
  } else if (top === 'bomber') {
    bomber(o, b, add);
  } else if (top === 'coat') {
    coat(o, rings, shell, add, bodySkin);
  } else {
    fatigues(o, rings, shell, add, bodySkin);
  }
  if (fit.apron !== undefined) apron(fit.apron, b, add);
  if (fit.tastevin) tastevin(shell, add);
  if (fit.vest) vest(o, fit.vest, b, add);
  // Cuello.
  add(
    loft(
      [
        { y: 1.55, rx: 0.058, rz: 0.054, rb: 0.06 },
        { y: 1.6, rx: 0.055, rz: 0.05, rb: 0.062, z: 0.004 },
        { y: NECK_H + 0.02, rx: 0.056, rz: 0.048, rb: 0.064, z: 0.006, k: 0.8 },
      ],
      skinOf(c.skin),
      5,
      { segs: 14 },
    ),
    neck,
  );
  return out;
}

/** Nudo de la corbata: más ancho arriba, aplastado contra el cuello. */
function knot(color: number, z: number): BufferGeometry {
  return tubePath(
    [
      { x: 0, y: 1.562, z: z + 0.002, a: 0.011, b: 0.007 },
      { x: 0, y: 1.575, z, a: 0.0145, b: 0.0085 },
      { x: 0, y: 1.59, z: z + 0.002, a: 0.0165, b: 0.008 },
    ],
    silk(color),
    { segs: 10, steps: 2, up: { x: 0, y: 0, z: 1 } },
  );
}

/** Delante de un traje: camisa en V, solapas, cuello, corbata o pajarita, chaleco, botones y bolsillos. */
function suitFront(o: RigOptions, shell: Shell, add: (g: BufferGeometry, skin?: SkinFn) => void, jacket: boolean): void {
  const c = o.colors;
  const b = o.bulk ?? 1;
  const fit: Outfit = o.outfit ?? {};
  const edge = trim(c.jacket);
  const V0 = jacket ? 1.235 : 1.3;
  const V1 = 1.588;
  const vee = (y: number): number => mix(0.006, 0.058, Math.pow((y - V0) / (V1 - V0), 0.85));
  // Pechera de la camisa.
  add(
    shell.patch(
      V0,
      V1,
      (y) => -vee(y),
      (y) => vee(y),
      0.003,
      cloth(c.shirt, 0.6, 0.8),
      { cols: 6, rows: 10 },
    ),
  );
  // Cuello de la camisa: banda alrededor del cuello y dos picos.
  add(
    loft(
      [
        { y: 1.598, rx: 0.07, rz: 0.062, rb: 0.07, z: 0.002 },
        { y: 1.628, rx: 0.064, rz: 0.056, rb: 0.068, z: 0.004 },
      ],
      cloth(c.shirt, 0.6, 0.8),
      0,
      { segs: 18 },
    ),
  );
  for (const s of [-1, 1])
    add(softBox(0.034, 0.05, 0.008, cloth(c.shirt, 0.6, 0.8), { x: s * 0.03, y: 1.583, z: shell.z(0.03, 1.58) - 0.004 }, 0.003, { z: s * 0.5, x: 0.25 }));
  if (fit.bowTie) {
    for (const s of [-1, 1]) add(ellipsoid(0.026, 0.017, 0.01, silk(c.tie), s * 0.026, 1.585, shell.z(0, 1.58) - 0.014, { segs: 8, rows: 6 }));
    add(ellipsoid(0.01, 0.012, 0.011, silk(shade(c.tie, 0.85)), 0, 1.585, shell.z(0, 1.58) - 0.017, { segs: 8, rows: 6 }));
  } else if (fit.tie !== false) {
    add(
      shell.patch(
        V0 + 0.02,
        1.572,
        (y) => -mix(0.026, 0.014, (y - V0) / (V1 - V0)),
        (y) => mix(0.026, 0.014, (y - V0) / (V1 - V0)),
        0.011,
        silk(c.tie),
        { cols: 2, rows: 8 },
      ),
    );
    add(knot(c.tie, shell.z(0, 1.575) - 0.009));
  }
  if (fit.waistcoat !== undefined && !(far() && jacket)) {
    const wc = fit.waistcoat;
    const V2 = 1.43;
    if (jacket) {
      for (const s of [-1, 1] as const) {
        add(
          shell.patch(
            V0,
            V2,
            (y) => s * mix(0.004, vee(V2), Math.pow((y - V0) / (V2 - V0), 1.4)),
            (y) => s * (vee(y) + 0.006),
            0.008,
            cloth(wc),
            { cols: 2, rows: 6 },
          ),
        );
      }
      for (let i = 0; i < 3; i++)
        add(ellipsoid(0.0065, 0.0065, 0.004, plastic(trim(wc), 0.3), 0, 1.26 + i * 0.045, shell.z(0, 1.26 + i * 0.045) - 0.01, { segs: 6, rows: 4 }));
    } else {
      for (let i = 0; i < 4; i++)
        add(ellipsoid(0.0065, 0.0065, 0.004, plastic(trim(wc), 0.3), 0, 1.06 + i * 0.06, shell.z(0, 1.06 + i * 0.06) - 0.004, { segs: 6, rows: 4 }));
    }
  }
  if (!jacket || fit.vest) return;
  // Solapas: del botón al cuello, con su muesca, algo levantadas.
  const lapel = cloth(c.jacket);
  for (const s of [-1, 1] as const) {
    add(
      shell.patch(
        V0 - 0.005,
        1.5,
        (y) => s * (vee(Math.max(V0, y)) - 0.004),
        (y) => s * mix(0.012, 0.112 * b, Math.pow((y - V0 + 0.005) / (1.5 - V0 + 0.005), 0.75)),
        0.012,
        lapel,
        { cols: 4, rows: 9 },
      ),
    );
    add(
      shell.patch(
        1.508,
        1.592,
        (y) => s * (vee(y) - 0.004),
        (y) => s * mix(0.098 * b, 0.074, (y - 1.508) / 0.084),
        0.013,
        lapel,
        { cols: 3, rows: 4 },
      ),
    );
    // Bolsillos con su tapa (de lejos no se ven).
    if (far()) continue;
    add(
      shell.patch(
        0.985,
        1.02,
        () => s * 0.058 * b,
        () => s * 0.14 * b,
        0.007,
        lapel,
        { cols: 4, rows: 2 },
      ),
      tails,
    );
  }
  // Cuello de la chaqueta por detrás.
  add(
    tubePath(
      ([-1, -0.6, 0, 0.6, 1] as const).map((t): Knot => ({ x: t * 0.092, y: 1.6 + 0.026 * (1 - t * t), z: 0.078 - 0.118 * t * t, a: 0.011, b: 0.026 })),
      lapel,
      { segs: 8, steps: 3, up: { x: 0, y: 1, z: -0.35 } },
    ),
  );
  if (fit.pocketSquare !== false) {
    add(
      shell.patch(
        1.385,
        1.412,
        () => -0.145 * b,
        () => -0.098 * b,
        0.006,
        silk(c.accent),
        { cols: 3, rows: 2 },
      ),
    );
  }
  if (far()) return;
  // Botón y abertura de delante y de detrás.
  add(ellipsoid(0.009, 0.009, 0.005, plastic(edge, 0.3), 0.004, 1.222, shell.z(0, 1.222) - 0.004, { segs: 8, rows: 5 }));
  add(
    shell.patch(
      0.8,
      1.215,
      () => -0.004,
      () => 0.002,
      0.004,
      cloth(shade(c.jacket, 0.55)),
      { cols: 1, rows: 10 },
    ),
    (x, y, z, w) => (y < HIP_Y + 0.02 ? tails(x, y, z, w) : trunk(x, y, z, w)),
  );
  add(
    shell.patch(
      0.8,
      1.0,
      () => -0.003,
      () => 0.003,
      0.004,
      cloth(shade(c.jacket, 0.5)),
      { cols: 1, rows: 6, back: true },
    ),
    tails,
  );
}

/** Cazadora corta y acolchada, con cuello, cremallera y elástico (el matón). */
function bomber(o: RigOptions, b: number, add: (g: BufferGeometry, skin?: SkinFn) => void): void {
  const c = o.colors;
  const rings: Ring[] = torsoRings(b, false, 0.012);
  rings[0] = { ...rings[0]!, y: 0.955, rx: rings[0]!.rx - 0.006 };
  const shell = new Shell(rings);
  const hide = leather(c.jacket, 0.42);
  add(
    loft(rings, hide, 24, {
      segs: 24,
      mod: (p, a, y) => {
        // Acolchado: canalones horizontales suaves en el cuerpo y bombeo sobre el elástico.
        const q = 1 + 0.02 * Math.sin((y - 0.98) * 62) * bell01((y - 1.2) / 0.22) + 0.06 * bell01((y - 1.02) / 0.05);
        p.x *= q;
        p.z *= q;
        void a;
      },
    }),
  );
  // Elástico de la cintura.
  add(
    loft(
      [
        { y: 0.945, rx: 0.17 * b, rz: 0.114, rb: 0.12, e: 2.4 },
        { y: 0.985, rx: 0.172 * b, rz: 0.116, rb: 0.12, e: 2.4 },
      ],
      cloth(shade(c.jacket, 0.7), 1.4),
      3,
      { segs: 24 },
    ),
  );
  // Cremallera, abierta arriba sobre la camiseta.
  add(
    shell.patch(
      1.33,
      1.585,
      (y) => -mix(0.004, 0.056, (y - 1.33) / 0.255),
      (y) => mix(0.004, 0.056, (y - 1.33) / 0.255),
      0.004,
      cloth(c.shirt, 0.8, 0.85),
      { cols: 4, rows: 8 },
    ),
  );
  add(
    shell.patch(
      0.96,
      1.335,
      () => -0.006,
      () => 0.006,
      0.007,
      steel(0x8d8f94, 0.4),
      { cols: 1, rows: 10 },
    ),
  );
  // Cuello de la camiseta.
  add(
    loft(
      [
        { y: 1.588, rx: 0.079, rz: 0.068, rb: 0.078 },
        { y: 1.612, rx: 0.069, rz: 0.06, rb: 0.071, z: 0.003 },
        { y: 1.613, rx: 0.06, rz: 0.052, rb: 0.064, z: 0.004, k: 0.6 },
      ],
      cloth(shade(c.shirt, 0.9), 1.2),
      0,
      { segs: 18 },
    ),
  );
  // Cuello subido.
  add(
    tubePath(
      ([-1, -0.7, 0, 0.7, 1] as const).map((t): Knot => ({ x: t * 0.086, y: 1.588 + 0.03 * (1 - t * t), z: 0.078 - 0.122 * t * t, a: 0.014, b: 0.032 })),
      hide,
      { segs: 8, steps: 3, up: { x: 0, y: 1, z: -0.2 } },
    ),
  );
  // Franjas del color de su tipo en los hombros.
  for (const s of [-1, 1] as const) {
    add(
      shell.patch(
        1.44,
        1.47,
        () => s * 0.05 * b,
        () => s * 0.21 * b,
        0.004,
        cloth(c.accent, 0.4, 0.7),
        { cols: 5, rows: 2 },
      ),
    );
    // Bolsillo en diagonal.
    add(
      softBox(0.012, 0.11, 0.01, leather(shade(c.jacket, 0.55)), { x: s * 0.11 * b, y: 1.09, z: shell.z(s * 0.11 * b, 1.09) - 0.004 }, 0.004, { z: s * 0.5 }),
    );
  }
}

/** Abrigo largo hasta la rodilla, con solapas anchas (el tirador lo lleva con capucha; el Juez, blanco). */
function coat(o: RigOptions, rings: Ring[], shell: Shell, add: (g: BufferGeometry, skin?: SkinFn) => void, _bodySkin: SkinFn): void {
  const c = o.colors;
  const b = o.bulk ?? 1;
  const long: Ring[] = [
    { y: 0.46, rx: 0.242 * b, rz: 0.186, rb: 0.188, e: 2.4, k: 0.9 },
    { y: 0.6, rx: 0.228 * b, rz: 0.176, rb: 0.175, e: 2.4 },
    { y: 0.74, rx: 0.21 * b, rz: 0.158, rb: 0.157, e: 2.45 },
    ...rings.filter((r) => r.y > 0.8).map((r) => ({ ...r, rx: r.rx + 0.008, rz: r.rz + 0.008, rb: (r.rb ?? r.rz) + 0.008 })),
  ];
  const hem = new Shell(long);
  const tail = skirt(HIP_Y + 0.03, 0.55, 0.94);
  const skin: SkinFn = (x, y, z, w) => (y < HIP_Y + 0.03 ? tail(x, y, z, w) : trunk(x, y, z, w));
  add(
    loft(long, cloth(c.jacket, 0.6), 26, {
      segs: 26,
      mod: (p, a, y) => {
        // Vuelo: canalones verticales que se abren hacia abajo, y la abertura de delante.
        const open = Math.max(0, (0.95 - y) / 0.5);
        const q = 1 + 0.035 * open * Math.sin(a * 7 + 0.6);
        p.x *= q;
        p.z *= q;
        const f = Math.max(0, -Math.cos(a));
        p.z += 0.05 * open * Math.pow(f, 14);
      },
    }),
    skin,
  );
  // Cinturón y hebilla.
  const belt = (y: number): Ring => {
    const r = hem.at(y);
    return { ...r, rx: r.rx + 0.007, rz: r.rz + 0.007, rb: (r.rb ?? r.rz) + 0.007 };
  };
  add(loft([belt(1.072), belt(1.094), belt(1.116)], leather(0x1c1a18), 0, { segs: 26 }));
  add(softBox(0.05, 0.048, 0.012, steel(0xb9a25a), { x: 0, y: 1.095, z: hem.z(0, 1.095) - 0.013 }, 0.005));
  // Camisa, corbata y solapas anchas.
  const V0 = 1.2;
  const vee = (y: number): number => mix(0.008, 0.062, Math.pow((y - V0) / 0.385, 0.8));
  add(
    hem.patch(
      V0,
      1.585,
      (y) => -vee(y),
      (y) => vee(y),
      0.003,
      cloth(c.shirt, 0.6, 0.8),
      { cols: 6, rows: 10 },
    ),
  );
  if (o.outfit?.tie !== false) {
    add(
      hem.patch(
        V0 + 0.03,
        1.575,
        (y) => -mix(0.024, 0.013, (y - V0) / 0.385),
        (y) => mix(0.024, 0.013, (y - V0) / 0.385),
        0.01,
        silk(c.tie),
        { cols: 2, rows: 8 },
      ),
    );
    add(knot(c.tie, hem.z(0, 1.575) - 0.009));
  }
  const wing = (y: number): number => (y < 1.47 ? mix(0.02, 0.145 * b, Math.pow((y - V0) / (1.47 - V0), 0.85)) : mix(0.145 * b, 0.084, (y - 1.47) / 0.118));
  for (const s of [-1, 1] as const) {
    add(
      hem.patch(
        V0,
        1.588,
        (y) => s * (vee(Math.min(1.585, y)) - 0.004),
        (y) => s * wing(y),
        0.013,
        cloth(shade(c.jacket, 0.94)),
        { cols: 4, rows: 11 },
      ),
    );
  }
  add(
    tubePath(
      ([-1, -0.6, 0, 0.6, 1] as const).map((t): Knot => ({ x: t * 0.1, y: 1.6 + 0.04 * (1 - t * t), z: 0.088 - 0.13 * t * t, a: 0.012, b: 0.042 })),
      cloth(shade(c.jacket, 0.94)),
      { segs: 8, steps: 3, up: { x: 0, y: 1, z: -0.3 } },
    ),
  );
  void shell;
}

/** Uniforme táctico: chaqueta de faena con bolsillos (escolta y blindado, debajo de sus placas). */
function fatigues(o: RigOptions, rings: Ring[], shell: Shell, add: (g: BufferGeometry, skin?: SkinFn) => void, bodySkin: SkinFn): void {
  const c = o.colors;
  const b = o.bulk ?? 1;
  add(
    loft(rings, cloth(c.jacket, 1.3), 20, {
      segs: 22,
      mod: (p, a, y) => {
        const k = 1 + 0.018 * wrinkle(y, 1.1, 0.09, 80) * (0.5 + 0.5 * Math.abs(Math.sin(a * 2)));
        p.x *= k;
        p.z *= k;
      },
    }),
    bodySkin,
  );
  // Cuello de tirilla y camiseta.
  add(
    loft(
      [
        { y: 1.59, rx: 0.076, rz: 0.066, rb: 0.076 },
        { y: 1.636, rx: 0.068, rz: 0.058, rb: 0.072, z: 0.004 },
      ],
      cloth(c.shirt, 1.2),
      2,
      { segs: 18 },
    ),
  );
  for (const s of [-1, 1] as const) {
    add(
      shell.patch(
        0.97,
        1.06,
        () => s * 0.05 * b,
        () => s * 0.14 * b,
        0.011,
        cloth(shade(c.jacket, 0.9), 1.3),
        { cols: 3, rows: 3 },
      ),
      tails,
    );
  }
}

/** Delantal largo de sumiller. */
function apron(color: number, b: number, add: (g: BufferGeometry, skin?: SkinFn) => void): void {
  const s = cloth(color, 0.8);
  add(
    loft(
      [
        { y: 0.998, rx: 0.172 * b, rz: 0.117, rb: 0.12, e: 2.4 },
        { y: 1.03, rx: 0.17 * b, rz: 0.116, rb: 0.118, e: 2.4 },
      ],
      s,
      0,
      { segs: 22 },
    ),
  );
  const sh = new Shell([
    { y: 0.5, rx: 0.25 * b, rz: 0.15, e: 2.6 },
    { y: 0.75, rx: 0.22 * b, rz: 0.137, e: 2.5 },
    { y: 1.03, rx: 0.18 * b, rz: 0.12, e: 2.4 },
  ]);
  add(
    sh.patch(
      0.52,
      1.01,
      (y) => -mix(0.19, 0.15, (y - 0.52) / 0.49) * b,
      (y) => mix(0.19, 0.15, (y - 0.52) / 0.49) * b,
      0.006,
      s,
      { cols: 10, rows: 10 },
    ),
    skirt(HIP_Y + 0.03, 0.5, 0.7),
  );
}

/** Catavinos de plata colgado de su cadena. */
function tastevin(shell: Shell, add: (g: BufferGeometry, skin?: SkinFn) => void): void {
  const silver = steel(0xd0d4da, 0.22);
  const z = (x: number, y: number): number => shell.z(x, y) - 0.012;
  for (const s of [-1, 1] as const) {
    add(
      tubePath(
        [
          { x: s * 0.06, y: 1.585, z: z(0.06, 1.585), a: 0.003 },
          { x: s * 0.04, y: 1.46, z: z(0.04, 1.46), a: 0.003 },
          { x: s * 0.004, y: 1.335, z: z(0, 1.335), a: 0.003 },
        ],
        silver,
        { segs: 5, steps: 4 },
      ),
    );
  }
  add(ellipsoid(0.03, 0.03, 0.009, silver, 0, 1.31, z(0, 1.31), { segs: 12, rows: 6 }));
}

/** Chaleco: portaplacas (escolta) o blindaje completo con hombreras (blindado). */
function vest(o: RigOptions, kind: 'carrier' | 'heavy', b: number, add: (g: BufferGeometry, skin?: SkinFn) => void): void {
  const c = o.colors;
  const heavy = kind === 'heavy';
  const g = heavy ? 0.034 : 0.02;
  const rings = torsoRings(b, false, g)
    .filter((r) => r.y > 1.03 && r.y < 1.49)
    .map((r) => ({ ...r, e: 2.9 }));
  const sh = new Shell(rings);
  const shrink = (r: Ring, y: number): Ring => ({ ...r, y, rx: r.rx - g * 1.1, rz: r.rz - g * 1.1, rb: (r.rb ?? r.rz) - g * 1.1, k: 0.6 });
  const closed = [shrink(rings[0]!, rings[0]!.y - 0.004), ...rings, shrink(rings[rings.length - 1]!, rings[rings.length - 1]!.y + 0.006)];
  const base = heavy ? plastic(shade(c.jacket, 0.82), 0.62) : cloth(0x24272c, 1.4);
  add(loft(closed, base, 14, { segs: 22 }));
  // Placas de delante y de detrás.
  const plate = heavy ? plastic(shade(c.accent, 0.62), 0.42) : cloth(0x2d3137, 1.4);
  const top = heavy ? 1.465 : 1.45;
  for (const back of [false, true]) {
    add(
      sh.patch(
        1.15,
        top,
        (y) => -mix(0.135, 0.12, (y - 1.15) / 0.33) * b,
        (y) => mix(0.135, 0.12, (y - 1.15) / 0.33) * b,
        heavy ? 0.026 : 0.014,
        plate,
        { cols: 8, rows: 8, back },
      ),
    );
  }
  // Franja de su color, delante y detrás: se le reconoce de lejos.
  for (const back of [false, true]) {
    add(
      sh.patch(
        heavy ? 1.385 : 1.375,
        heavy ? 1.43 : 1.42,
        () => -0.1 * b,
        () => 0.1 * b,
        heavy ? 0.03 : 0.019,
        cloth(c.accent, 0.4, 0.6),
        { cols: 8, rows: 2, back },
      ),
    );
  }
  // Portacargadores (de lejos se quedan en la placa).
  const pouch = cloth(0x1d2024, 1.4);
  const n = far() ? 0 : heavy ? 4 : 3;
  for (let i = 0; i < n; i++) {
    const x = (i - (n - 1) / 2) * 0.072 * b;
    add(softBox(0.06, 0.1, 0.036, pouch, { x, y: 1.1, z: sh.z(x, 1.1) - 0.016 }, 0.01));
    add(softBox(0.062, 0.026, 0.04, cloth(0x15171a, 1.4), { x, y: 1.148, z: sh.z(x, 1.13) - 0.017 }, 0.008));
  }
  // Tirantes.
  for (const s of [-1, 1] as const) {
    add(
      tubePath(
        [
          { x: s * 0.1 * b, y: 1.44, z: sh.z(0.1 * b, 1.44) - 0.006, a: 0.026, b: 0.008 },
          { x: s * 0.11 * b, y: 1.545, z: -0.09, a: 0.027, b: 0.01 },
          { x: s * 0.11 * b, y: 1.59, z: 0.0, a: 0.027, b: 0.012 },
          { x: s * 0.11 * b, y: 1.545, z: 0.098, a: 0.027, b: 0.01 },
          { x: s * 0.1 * b, y: 1.44, z: sh.z(0.1 * b, 1.44, 0, true) + 0.006, a: 0.026, b: 0.008 },
        ],
        base,
        { segs: 8, steps: 4, up: { x: 0, y: 0.2, z: 1 } },
      ),
    );
  }
  if (!heavy) {
    // Radio en el hombro izquierdo y su cable al oído.
    add(softBox(0.04, 0.085, 0.03, plastic(0x15171b), { x: -0.16 * b, y: 1.44, z: sh.z(-0.15 * b, 1.44) - 0.012 }, 0.006, { z: 0.15 }));
    return;
  }
  // Gola del blindado.
  add(
    loft(
      [
        { y: 1.53, rx: 0.15 * b, rz: 0.105, rb: 0.115, e: 2.2 },
        { y: 1.6, rx: 0.118, rz: 0.098, rb: 0.108 },
        { y: 1.635, rx: 0.108, rz: 0.092, rb: 0.102, z: 0.004 },
      ],
      plastic(shade(c.accent, 0.6), 0.55),
      6,
      { segs: 22 },
    ),
  );
}

// ------------------------------------------------------------------ brazos y manos
export function armParts(o: RigOptions, s: -1 | 1): BodyPart[] {
  const c = o.colors;
  const b = o.bulk ?? 1;
  const fit: Outfit = o.outfit ?? {};
  const top = fit.top ?? 'suit';
  const X = s * SHOULDER_X * b;
  const k = 0.45 + 0.55 * b;
  const puff = top === 'bomber' ? 1.16 : top === 'fatigues' ? 1.06 : 1;
  const r = (v: number): number => v * k * puff;
  const sl = sleeve(s);
  const out: BodyPart[] = [];
  const color = fit.jacket === false && top === 'suit' ? c.shirt : c.jacket;
  const fabric = top === 'bomber' ? leather(color, 0.42) : top === 'fatigues' ? cloth(color, 1.3) : cloth(color);
  // El hombro nace dentro del tronco (hacia el centro) y cae hacia fuera: sin bola en la articulación.
  const top0 = SHOULDER_H + 0.042;
  const inner = X - s * 0.028;
  out.push({
    g: loft(
      [
        { y: top0, x: inner, rx: r(0.02), rz: r(0.026) },
        { y: top0 - 0.008, x: inner + s * 0.006, rx: r(0.046), rz: r(0.05) },
        { y: top0 - 0.03, x: X - s * 0.008, rx: r(0.06), rz: r(0.063) },
        { y: SHOULDER_H - 0.03, x: X - s * 0.002, rx: r(0.066), rz: r(0.07) },
        { y: 1.42, x: X, rx: r(0.063), rz: r(0.068) },
        { y: 1.33, x: X, rx: r(0.057), rz: r(0.062) },
        { y: 1.25, x: X, rx: r(0.054), rz: r(0.058) },
        { y: ELBOW_H, x: X, rx: r(0.052), rz: r(0.056), z: 0.002 },
        { y: 1.12, x: X, rx: r(0.0515), rz: r(0.054) },
        { y: 1.03, x: X, rx: r(0.047), rz: r(0.049) },
        { y: 0.95, x: X, rx: r(0.042), rz: r(0.045) },
        { y: 0.915, x: X, rx: r(0.0415), rz: r(0.0445) },
        { y: 0.914, x: X, rx: r(0.036), rz: r(0.039), k: 0.5 },
      ],
      fabric,
      20,
      {
        segs: 13,
        mod: (p, a, y) => {
          // Arrugas del codo (por dentro) y del puño; en la cazadora, anillos acolchados.
          let q = 1 + 0.03 * wrinkle(y, ELBOW_H, 0.055, 120) * (0.35 + 0.65 * Math.max(0, -Math.cos(a))) + 0.016 * wrinkle(y, 0.96, 0.04, 150);
          if (top === 'bomber') q += 0.03 * Math.sin((y - 0.95) * 70) * bell01((y - 1.25) / 0.28);
          p.x = X + (p.x - X) * q;
          p.z *= q;
        },
      },
    ),
    skin: sl,
  });
  const fore = rigid(s < 0 ? BONE.foreL : BONE.foreR);
  // Puño: de camisa, o elástico en la cazadora.
  const cuff = top === 'bomber' ? cloth(shade(c.jacket, 0.7), 1.4) : fit.gloves !== undefined ? leather(shade(fit.gloves, 0.9)) : cloth(c.shirt, 0.6, 0.8);
  out.push({
    g: loft(
      [
        { y: 0.93, x: X, rx: r(0.0355), rz: r(0.0385) },
        { y: 0.898, x: X, rx: r(0.035), rz: r(0.038) },
        { y: 0.897, x: X, rx: 0.027, rz: 0.031, k: 0.5 },
      ],
      cuff,
      0,
      { segs: 14 },
    ),
    skin: fore,
  });
  // Brazalete del color de su tipo.
  if (fit.armband) {
    out.push({
      g: loft(
        [
          { y: 1.335, x: X, rx: r(0.0605), rz: r(0.0655) },
          { y: 1.38, x: X, rx: r(0.063), rz: r(0.068) },
        ],
        cloth(c.accent, 0.5, 0.7),
        2,
        { segs: 16 },
      ),
      skin: rigid(s < 0 ? BONE.armL : BONE.armR),
    });
  }
  // Hombrera y codera del blindado.
  if (fit.vest === 'heavy') {
    const arm = rigid(s < 0 ? BONE.armL : BONE.armR);
    const armor = (y0: number, y1: number, rx: number, grow: number, tone: number): BufferGeometry =>
      loft(
        [
          { y: y0, x: X + s * 0.012, rx: r(rx) + grow * 0.6, rz: r(rx * 1.04) + grow * 0.6, e: 2.6, k: 0.7 },
          { y: y0 + 0.012, x: X + s * 0.012, rx: r(rx) + grow, rz: r(rx * 1.04) + grow, e: 2.6 },
          { y: (y0 + y1) / 2, x: X + s * 0.01, rx: r(rx * 1.04) + grow, rz: r(rx * 1.08) + grow, e: 2.6 },
          { y: y1 - 0.01, x: X + s * 0.004, rx: r(rx * 0.94) + grow * 0.8, rz: r(rx) + grow * 0.8, e: 2.5 },
          { y: y1, x: X, rx: r(rx * 0.7), rz: r(rx * 0.75), e: 2.3 },
        ],
        plastic(shade(c.accent, tone), 0.42),
        9,
        { segs: 18, capStart: true },
      );
    out.push({ g: armor(SHOULDER_H - 0.085, SHOULDER_H + 0.05, 0.068, 0.02, 0.8), skin: arm });
    out.push({ g: armor(1.335, 1.42, 0.062, 0.014, 0.55), skin: arm });
    out.push({ g: armor(0.96, 1.14, 0.05, 0.014, 0.55), skin: fore });
  }
  for (const g of handGeometry(X, s, fit.gloves !== undefined ? leather(fit.gloves, 0.55) : skinOf(c.skin))) out.push({ g, skin: fore });
  return out;
}

/** Mano a medio cerrar alrededor de una empuñadura: palma, cuatro dedos y pulgar. */
function handGeometry(X: number, s: -1 | 1, surf: Surface): BufferGeometry[] {
  const H = ELBOW_H + HAND_Y;
  const y = (v: number): number => H + v;
  const out: BufferGeometry[] = [
    loft(
      [
        { y: y(0.04), x: X, rx: 0.025, rz: 0.03, z: -0.004, e: 2.3 },
        { y: y(0.015), x: X + s * 0.002, rx: 0.0235, rz: 0.036, z: -0.008, e: 2.5 },
        { y: y(-0.015), x: X + s * 0.004, rx: 0.021, rz: 0.043, z: -0.01, e: 2.7 },
        { y: y(-0.04), x: X + s * 0.005, rx: 0.018, rz: 0.044, z: -0.009, e: 2.7 },
        { y: y(-0.056), x: X + s * 0.005, rx: 0.011, rz: 0.038, z: -0.008, e: 2.4 },
      ],
      surf,
      5,
      { segs: 10, capStart: true, capEnd: true },
    ),
  ];
  if (far()) {
    // De lejos, un puño.
    out.push(ellipsoid(0.026, 0.026, 0.046, surf, X - s * 0.012, y(-0.052), -0.008, { segs: 10, rows: 6 }));
    return out;
  }
  for (let f = 0; f < 4; f++) {
    const z = -0.041 + f * 0.0225;
    // El corazón es el más largo; el meñique, el más corto y fino.
    const len = [0.94, 1.04, 1, 0.82][f]!;
    const a = [0.0105, 0.0108, 0.0103, 0.009][f]!;
    out.push(
      tubePath(
        [
          { x: X + s * 0.006, y: y(-0.036), z, a },
          { x: X + s * 0.006, y: y(-0.036 - 0.032 * len), z, a: a * 0.98 },
          { x: X - s * 0.012, y: y(-0.036 - 0.05 * len), z, a: a * 0.94 },
          { x: X - s * 0.031, y: y(-0.036 - 0.04 * len), z, a: a * 0.9 },
          { x: X - s * 0.037, y: y(-0.036 - 0.014 * len), z: z + 0.001, a: a * 0.8 },
        ],
        surf,
        { segs: 6, round: true, up: { x: 0, y: 0, z: 1 } },
      ),
    );
  }
  out.push(
    tubePath(
      [
        { x: X - s * 0.002, y: y(0.018), z: -0.032, a: 0.0135 },
        { x: X - s * 0.01, y: y(-0.004), z: -0.056, a: 0.0125 },
        { x: X - s * 0.024, y: y(-0.024), z: -0.062, a: 0.0115 },
        { x: X - s * 0.034, y: y(-0.038), z: -0.054, a: 0.0095 },
      ],
      surf,
      { segs: 6, round: true, up: { x: 0, y: 1, z: 0 } },
    ),
  );
  return out;
}

// ------------------------------------------------------------------ piernas y zapatos
export function legParts(o: RigOptions, s: -1 | 1): BodyPart[] {
  const c = o.colors;
  const b = o.bulk ?? 1;
  const fit: Outfit = o.outfit ?? {};
  const top = fit.top ?? 'suit';
  const X = s * 0.1 * b;
  const k = 0.5 + 0.5 * b;
  const loose = top === 'suit' || top === 'coat' ? 1 : 1.07;
  const r = (v: number): number => v * k * loose;
  const out: BodyPart[] = [];
  const pants = top === 'suit' || top === 'coat' ? cloth(c.pants) : cloth(c.pants, 1.4);
  const crease = top === 'suit' || top === 'coat';
  const boots = fit.boots === true;
  out.push({
    g: loft(
      [
        { y: HIP_Y + 0.03, x: X, rx: r(0.06), rz: r(0.072), k: 0.8 },
        { y: HIP_Y - 0.02, x: X, rx: r(0.088), rz: r(0.1) },
        { y: 0.86, x: X, rx: r(0.092), rz: r(0.104), rb: r(0.107) },
        { y: 0.76, x: X, rx: r(0.087), rz: r(0.098), rb: r(0.1) },
        { y: 0.66, x: X, rx: r(0.08), rz: r(0.09) },
        { y: 0.57, x: X, rx: r(0.073), rz: r(0.083), rb: r(0.079) },
        { y: KNEE_H, x: X, rx: r(0.068), rz: r(0.079), rb: r(0.072) },
        { y: 0.41, x: X, rx: r(0.066), rz: r(0.073), rb: r(0.077) },
        { y: 0.33, x: X, rx: r(0.065), rz: r(0.069), rb: r(0.081) },
        { y: 0.24, x: X, rx: r(0.061), rz: r(0.066), rb: r(0.073) },
        ...(boots
          ? [{ y: 0.19, x: X, rx: r(0.062), rz: r(0.068), rb: r(0.072) }]
          : [
              { y: 0.15, x: X, rx: r(0.06), rz: r(0.068), rb: r(0.068) },
              { y: 0.1, x: X, rx: r(0.062), rz: r(0.076), rb: r(0.066), z: -0.004 },
              { y: 0.088, x: X, rx: r(0.062), rz: r(0.078), rb: r(0.066), z: -0.004 },
            ]),
      ],
      pants,
      20,
      {
        segs: 13,
        mod: (p, a, y) => {
          const f = Math.max(0, -Math.cos(a));
          // Raya del pantalón delante, pliegues tras la rodilla y sobre el zapato.
          if (crease) p.z -= 0.004 * Math.exp(-(((a - PI) / 0.16) ** 2)) * bell01((y - 0.5) / 0.4);
          const q =
            1 +
            0.03 * wrinkle(y, KNEE_H, 0.06, 110) * (1 - f) +
            (boots ? 0 : 0.03 * wrinkle(y, 0.15, 0.05, 130)) +
            (crease ? 0 : 0.016 * Math.sin(y * 48 + a * 2));
          p.x = X + (p.x - X) * q;
          p.z *= q;
        },
      },
    ),
    skin: leg(s),
  });
  const thigh = rigid(s < 0 ? BONE.thighL : BONE.thighR);
  const shin = rigid(s < 0 ? BONE.shinL : BONE.shinR);
  if (fit.holster && s > 0) {
    // Pistolera de muslo.
    out.push({
      g: loft(
        [
          { y: 0.74, x: X, rx: r(0.091), rz: r(0.103) },
          { y: 0.765, x: X, rx: r(0.092), rz: r(0.104) },
        ],
        leather(0x17181b),
        0,
        { segs: 16 },
      ),
      skin: thigh,
    });
    out.push({ g: softBox(0.03, 0.16, 0.07, leather(0x17181b), { x: X + r(0.1), y: 0.76, z: 0.004 }, 0.01), skin: thigh });
    out.push({ g: softBox(0.022, 0.05, 0.05, plastic(0x0d0e10), { x: X + r(0.1), y: 0.86, z: 0.012 }, 0.01), skin: thigh });
  }
  if (fit.kneepads) {
    out.push({ g: ellipsoid(r(0.066), 0.075, 0.034, plastic(shade(c.accent, 0.55), 0.5), X, KNEE_H - 0.005, -r(0.066), { segs: 12, rows: 8 }), skin: shin });
    out.push({
      g: loft(
        [
          { y: KNEE_H - 0.055, x: X, rx: r(0.07), rz: r(0.076) },
          { y: KNEE_H - 0.035, x: X, rx: r(0.07), rz: r(0.077) },
        ],
        cloth(0x1a1c20, 1.2),
        0,
        { segs: 14 },
      ),
      skin: shin,
    });
  }
  if (fit.vest === 'heavy') {
    const sh = new Shell([
      { y: 0.1, x: X, rx: r(0.064), rz: r(0.072) },
      { y: 0.33, x: X, rx: r(0.068), rz: r(0.074), rb: r(0.081) },
      { y: KNEE_H, x: X, rx: r(0.07), rz: r(0.08), rb: r(0.072) },
      { y: 0.66, x: X, rx: r(0.083), rz: r(0.093) },
      { y: 0.86, x: X, rx: r(0.095), rz: r(0.106), rb: r(0.107) },
    ]);
    const tone = plastic(shade(c.accent, 0.62), 0.42);
    const w = (y: number): number => sh.at(y).rx * 0.82;
    out.push({
      g: sh.patch(
        0.57,
        0.765,
        (y) => X - w(y),
        (y) => X + w(y),
        0.016,
        tone,
        { cols: 7, rows: 7 },
      ),
      skin: thigh,
    });
    out.push({
      g: sh.patch(
        0.17,
        0.41,
        (y) => X - w(y),
        (y) => X + w(y),
        0.016,
        tone,
        { cols: 7, rows: 7 },
      ),
      skin: shin,
    });
  }
  out.push(...shoeParts(o, s, X, boots));
  return out;
}

/** Zapato de cordones o bota: empeine, puntera y suela, en el hueso del tobillo. */
function shoeParts(o: RigOptions, s: -1 | 1, X: number, boots: boolean): BodyPart[] {
  const c = o.colors;
  const b = 0.6 + 0.4 * (o.bulk ?? 1);
  const foot = rigid(s < 0 ? BONE.footL : BONE.footR);
  const shin = rigid(s < 0 ? BONE.shinL : BONE.shinR);
  // Suelo del zapato en reposo.
  const y0 = HIP_Y - 0.46 - 0.405 - FOOT_DROP;
  const hide = leather(c.shoes, boots ? 0.66 : 0.52);
  const out: BodyPart[] = [];
  const w = (v: number): number => v * b * (boots ? 1.12 : 1);
  out.push({
    g: tubePath(
      [
        { x: X, y: y0 + 0.042, z: 0.052, a: w(0.03), b: 0.032 },
        { x: X, y: y0 + 0.05, z: 0.03, a: w(0.037), b: 0.042 },
        { x: X, y: y0 + 0.052, z: -0.015, a: w(0.039), b: 0.044 },
        { x: X, y: y0 + 0.046, z: -0.075, a: w(0.042), b: 0.037 },
        { x: X, y: y0 + 0.038, z: -0.135, a: w(0.046), b: 0.029 },
        { x: X, y: y0 + 0.034, z: -0.19, a: w(0.043), b: boots ? 0.029 : 0.023 },
        { x: X, y: y0 + 0.03, z: -0.228, a: w(0.03), b: boots ? 0.024 : 0.017 },
        { x: X, y: y0 + 0.028, z: -0.243, a: w(0.012), b: 0.01 },
      ],
      hide,
      { segs: 11, up: { x: 0, y: 1, z: 0 }, round: true },
    ),
    skin: foot,
  });
  // Suela y tacón.
  if (!far())
    out.push({
      g: tubePath(
        [
          { x: X, y: y0 + 0.011, z: 0.06, a: w(0.028), b: 0.011 },
          { x: X, y: y0 + 0.011, z: 0.02, a: w(0.039), b: 0.011 },
          { x: X, y: y0 + 0.011, z: -0.06, a: w(0.041), b: 0.011 },
          { x: X, y: y0 + 0.011, z: -0.15, a: w(0.049), b: 0.011 },
          { x: X, y: y0 + 0.011, z: -0.215, a: w(0.04), b: 0.011 },
          { x: X, y: y0 + 0.011, z: -0.25, a: w(0.012), b: 0.009 },
        ],
        plastic(SOLE, 0.8),
        { segs: 8, up: { x: 0, y: 1, z: 0 } },
      ),
      skin: foot,
    });
  if (boots) {
    out.push({
      g: loft(
        [
          { y: 0.1, x: X, rx: w(0.045), rz: 0.056, rb: 0.052, z: -0.008 },
          { y: 0.15, x: X, rx: w(0.05), rz: 0.058, rb: 0.056 },
          { y: 0.215, x: X, rx: w(0.056), rz: 0.064, rb: 0.068 },
          { y: 0.222, x: X, rx: w(0.05), rz: 0.058, rb: 0.062, k: 0.5 },
        ],
        hide,
        8,
        { segs: 14 },
      ),
      skin: shin,
    });
  } else if (!far()) {
    // Cordones: tres pasadas sobre el empeine.
    for (let i = 0; i < 3; i++) {
      const z = -0.045 - i * 0.026;
      out.push({ g: softBox(0.034, 0.005, 0.008, plastic(shade(c.shoes, 0.6)), { x: X, y: y0 + 0.087 - i * 0.008, z }, 0.002, { x: -0.25 }), skin: foot });
    }
  }
  return out;
}
