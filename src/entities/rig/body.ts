import type { BufferGeometry } from 'three';
import { bell01, far, loft, type Ring } from './loft';
import { cloth, leather, plastic, silk, skinOf, steel } from './surfaces';
import { ellipsoid, type Knot, Shell, softBox, tubePath } from './shapes';
import { HEAD_H, HIP_Y } from './skeleton';
import { neck, type SkinFn, skirt, trunk } from './skin';
import { shade, trim } from './geometry';
import type { Outfit, RigOptions } from './types';

/** Una pieza del cuerpo y cómo se reparte entre los huesos. */
export interface BodyPart {
  g: BufferGeometry;
  skin: SkinFn;
}

/** Mezcla lineal. */
const mix = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Faldones de la chaqueta: los empuja la pierna de su lado. */
const tails = skirt(HIP_Y + 0.02, 0.83, 0.72, 0.36);

/** Anillos del tronco con chaqueta. El ancho crece con la corpulencia; el fondo, menos. */
function torsoRings(b: number, jacket: boolean, grow = 0): Ring[] {
  const w = (v: number): number => v * b + grow;
  const d = (v: number): number => v * (0.42 + 0.58 * b) + grow;
  const hem: Ring[] = jacket
    ? [
        { y: 0.828, rx: w(0.2), rz: d(0.142), rb: d(0.146), e: 2.5 },
        { y: 0.885, rx: w(0.19), rz: d(0.132), rb: d(0.138), e: 2.5 },
        { y: 0.955, rx: w(0.174), rz: d(0.118), rb: d(0.125), e: 2.45 },
      ]
    : [{ y: 0.955, rx: w(0.16), rz: d(0.106), rb: d(0.112), e: 2.4 }];
  return [
    ...hem,
    { y: 1.035, rx: w(0.157), rz: d(0.107), rb: d(0.106), e: 2.4 },
    { y: 1.11, rx: w(0.152), rz: d(0.107), rb: d(0.1), e: 2.4 },
    { y: 1.2, rx: w(0.159), rz: d(0.114), rb: d(0.105), e: 2.4 },
    { y: 1.3, rx: w(0.174), rz: d(0.123), rb: d(0.117), e: 2.4 },
    { y: 1.39, rx: w(0.189), rz: d(0.129), rb: d(0.127), e: 2.4 },
    { y: 1.455, rx: w(0.199), rz: d(0.123), rb: d(0.127), e: 2.35 },
    { y: 1.51, rx: w(0.207), rz: d(0.104), rb: d(0.116), e: 2.25 },
    { y: 1.545, rx: w(0.2), rz: d(0.085), rb: d(0.099), e: 2.15 },
    { y: 1.567, rx: w(0.166), rz: d(0.075), rb: d(0.088), e: 2.05 },
    { y: 1.588, rx: w(0.122), rz: 0.068, rb: 0.081 },
    { y: 1.607, rx: 0.084, rz: 0.062, rb: 0.073 },
    { y: 1.625, rx: 0.07, rz: 0.058, rb: 0.068 },
  ];
}

/** Arrugas de tela alrededor de una altura (codo, rodilla, cintura). */
export const wrinkle = (y: number, at: number, span: number, freq: number): number => Math.sin((y - at) * freq) * Math.exp(-(((y - at) / span) ** 2));

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
    coat(o, rings, add);
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
        { y: HEAD_H + 0.02, rx: 0.056, rz: 0.048, rb: 0.064, z: 0.006, k: 0.8 },
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
    add(softBox(0.027, 0.046, 0.007, cloth(c.shirt, 0.6, 0.8), { x: s * 0.033, y: 1.586, z: shell.z(0.033, 1.583) - 0.002 }, 0.003, { z: s * 0.72, x: 0.3 }));
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
      ([-1, -0.6, 0, 0.6, 1] as const).map((t): Knot => ({
        x: t * 0.08,
        y: 1.586 + 0.036 * (1 - t * t),
        z: 0.074 - 0.112 * t * t,
        a: 0.009 - 0.005 * t * t,
        b: 0.024 - 0.015 * t * t,
      })),
      lapel,
      { segs: 8, steps: 3, round: true, up: { x: 0, y: 1, z: -0.35 } },
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
      0.832,
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
      0.832,
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
      mod: (p, _a, y) => {
        // Acolchado: canalones horizontales suaves en el cuerpo y bombeo sobre el elástico.
        const q = 1 + 0.02 * Math.sin((y - 0.98) * 62) * bell01((y - 1.2) / 0.22) + 0.06 * bell01((y - 1.02) / 0.05);
        p.x *= q;
        p.z *= q;
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
      ([-1, -0.7, 0, 0.7, 1] as const).map((t): Knot => ({
        x: t * 0.079,
        y: 1.584 + 0.034 * (1 - t * t),
        z: 0.074 - 0.116 * t * t,
        a: 0.013 - 0.005 * t * t,
        b: 0.032 - 0.016 * t * t,
      })),
      hide,
      { segs: 8, steps: 3, round: true, up: { x: 0, y: 1, z: -0.2 } },
    ),
  );
  // Franjas del color de su tipo en los hombros.
  for (const s of [-1, 1] as const) {
    add(
      shell.patch(
        1.44,
        1.47,
        () => s * 0.05 * b,
        () => s * 0.175 * b,
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
function coat(o: RigOptions, rings: Ring[], add: (g: BufferGeometry, skin?: SkinFn) => void): void {
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
      ([-1, -0.6, 0, 0.6, 1] as const).map((t): Knot => ({
        x: t * 0.086,
        y: 1.588 + 0.05 * (1 - t * t),
        z: 0.084 - 0.126 * t * t,
        a: 0.012 - 0.005 * t * t,
        b: 0.042 - 0.026 * t * t,
      })),
      cloth(shade(c.jacket, 0.94)),
      { segs: 8, steps: 3, round: true, up: { x: 0, y: 1, z: -0.3 } },
    ),
  );
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
