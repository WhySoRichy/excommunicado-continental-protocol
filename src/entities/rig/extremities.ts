import type { BufferGeometry } from 'three';
import { type BodyPart, wrinkle } from './body';
import { shade } from './geometry';
import { bell01, far, loft, type Surface } from './loft';
import { ellipsoid, Shell, softBox, tubePath } from './shapes';
import { BONE, ELBOW_H, HIP_X, HIP_Y, KNEE_H, SHOULDER_H, SHOULDER_X, WRIST_H } from './skeleton';
import { hand, leg, rigid, shoe, sleeve } from './skin';
import { cloth, leather, plastic, skinOf } from './surfaces';
import type { Outfit, RigOptions } from './types';

/** Brazos, manos, piernas y calzado. */
const PI = Math.PI;
const SOLE = 0x0b0b0d;

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
  // El hombro nace dentro del tronco (hacia el centro) y cae hacia fuera: deltoides, bíceps, codo y antebrazo.
  out.push({
    g: loft(
      [
        { y: SHOULDER_H + 0.05, x: X - s * 0.034, rx: r(0.024), rz: r(0.032) },
        { y: SHOULDER_H + 0.044, x: X - s * 0.022, rx: r(0.045), rz: r(0.05) },
        { y: SHOULDER_H + 0.022, x: X - s * 0.009, rx: r(0.057), rz: r(0.06) },
        { y: SHOULDER_H - 0.014, x: X - s * 0.002, rx: r(0.06), rz: r(0.066) },
        { y: SHOULDER_H - 0.06, x: X + s * 0.001, rx: r(0.06), rz: r(0.067) },
        { y: 1.375, x: X, rx: r(0.054), rz: r(0.062) },
        { y: 1.3, x: X, rx: r(0.0505), rz: r(0.0575), z: -0.001 },
        { y: ELBOW_H, x: X, rx: r(0.0465), rz: r(0.051), z: 0.003 },
        { y: 1.14, x: X, rx: r(0.0475), rz: r(0.051) },
        { y: 1.06, x: X, rx: r(0.0445), rz: r(0.048) },
        { y: 0.985, x: X, rx: r(0.04), rz: r(0.043) },
        { y: 0.95, x: X, rx: r(0.0388), rz: r(0.0418) },
        { y: 0.934, x: X, rx: r(0.0385), rz: r(0.0415) },
        { y: 0.933, x: X, rx: r(0.033), rz: r(0.036), k: 0.5 },
      ],
      fabric,
      20,
      {
        segs: 13,
        mod: (p, a, y) => {
          // Arrugas del codo (por dentro) y del puño; en la cazadora, anillos acolchados.
          let q = 1 + 0.03 * wrinkle(y, ELBOW_H, 0.055, 120) * (0.35 + 0.65 * Math.max(0, -Math.cos(a))) + 0.016 * wrinkle(y, 0.975, 0.04, 150);
          if (top === 'bomber') q += 0.03 * Math.sin((y - 0.96) * 70) * bell01((y - 1.25) / 0.28);
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
        { y: 0.95, x: X, rx: r(0.034), rz: r(0.037) },
        { y: 0.919, x: X, rx: r(0.0335), rz: r(0.0365) },
        { y: 0.918, x: X, rx: 0.026, rz: 0.03, k: 0.5 },
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
          { y: 1.335, x: X, rx: r(0.0555), rz: r(0.0635) },
          { y: 1.38, x: X, rx: r(0.0575), rz: r(0.0655) },
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
  out.push(...handParts(X, s, fit.gloves !== undefined ? leather(fit.gloves, 0.55) : skinOf(c.skin)));
  return out;
}

/** Mano a medio cerrar, con la palma hacia dentro: palma y pulgar, y los cuatro dedos, que se abren y cierran aparte. */
function handParts(X: number, s: -1 | 1, surf: Surface): BodyPart[] {
  const y = (v: number): number => WRIST_H + v;
  const palm = hand(s);
  const fingers = rigid(s < 0 ? BONE.fingL : BONE.fingR);
  const out: BodyPart[] = [
    {
      g: loft(
        [
          { y: y(0.018), x: X, rx: 0.0225, rz: 0.028, z: -0.002, e: 2.2 },
          { y: y(-0.006), x: X + s * 0.002, rx: 0.0215, rz: 0.029, z: -0.004, e: 2.3 },
          { y: y(-0.034), x: X + s * 0.007, rx: 0.0215, rz: 0.039, z: -0.008, e: 2.6 },
          { y: y(-0.062), x: X + s * 0.009, rx: 0.018, rz: 0.0435, z: -0.009, e: 2.8 },
          { y: y(-0.086), x: X + s * 0.009, rx: 0.0145, rz: 0.043, z: -0.008, e: 2.8 },
          { y: y(-0.094), x: X + s * 0.008, rx: 0.009, rz: 0.038, z: -0.008, e: 2.4 },
        ],
        surf,
        5,
        { segs: 10, capStart: true, capEnd: true },
      ),
      skin: palm,
    },
  ];
  if (far()) {
    // De lejos, un puño.
    out.push({ g: ellipsoid(0.026, 0.034, 0.044, surf, X - s * 0.008, y(-0.108), -0.008, { segs: 10, rows: 6 }), skin: fingers });
    return out;
  }
  for (let f = 0; f < 4; f++) {
    const z = -0.0405 + f * 0.0222;
    // El corazón es el más largo; el meñique, el más corto y fino.
    const len = [0.93, 1.05, 1, 0.8][f]!;
    const a = [0.0105, 0.0107, 0.0102, 0.009][f]!;
    out.push({
      g: tubePath(
        [
          { x: X + s * 0.009, y: y(-0.076), z, a: a * 1.02 },
          { x: X + s * 0.008, y: y(-0.084 - 0.026 * len), z, a },
          { x: X - s * 0.003, y: y(-0.084 - 0.05 * len), z, a: a * 0.95 },
          { x: X - s * 0.021, y: y(-0.084 - 0.063 * len), z, a: a * 0.9 },
          { x: X - s * 0.034, y: y(-0.084 - 0.064 * len), z: z + 0.001, a: a * 0.78 },
        ],
        surf,
        { segs: 6, round: true, up: { x: 0, y: 0, z: 1 } },
      ),
      skin: fingers,
    });
  }
  out.push({
    g: tubePath(
      [
        { x: X + s * 0.002, y: y(-0.03), z: -0.03, a: 0.0145 },
        { x: X - s * 0.004, y: y(-0.052), z: -0.051, a: 0.0135 },
        { x: X - s * 0.015, y: y(-0.075), z: -0.06, a: 0.012 },
        { x: X - s * 0.025, y: y(-0.092), z: -0.056, a: 0.0095 },
      ],
      surf,
      { segs: 6, round: true, up: { x: 0, y: 1, z: 0 } },
    ),
    skin: palm,
  });
  return out;
}

// ------------------------------------------------------------------ piernas y zapatos
export function legParts(o: RigOptions, s: -1 | 1): BodyPart[] {
  const c = o.colors;
  const b = o.bulk ?? 1;
  const fit: Outfit = o.outfit ?? {};
  const top = fit.top ?? 'suit';
  const X = s * HIP_X * b;
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
        { y: HIP_Y + 0.03, x: X, rx: r(0.058), rz: r(0.07), k: 0.8 },
        { y: HIP_Y - 0.02, x: X, rx: r(0.083), rz: r(0.094) },
        { y: 0.86, x: X, rx: r(0.086), rz: r(0.098), rb: r(0.103) },
        { y: 0.76, x: X, rx: r(0.081), rz: r(0.093), rb: r(0.095) },
        { y: 0.66, x: X, rx: r(0.073), rz: r(0.084) },
        { y: 0.57, x: X, rx: r(0.0665), rz: r(0.077), rb: r(0.073) },
        { y: KNEE_H, x: X, rx: r(0.0615), rz: r(0.073), rb: r(0.065) },
        { y: 0.41, x: X, rx: r(0.059), rz: r(0.066), rb: r(0.069) },
        { y: 0.33, x: X, rx: r(0.0575), rz: r(0.062), rb: r(0.073) },
        { y: 0.24, x: X, rx: r(0.054), rz: r(0.059), rb: r(0.065) },
        ...(boots
          ? [{ y: 0.19, x: X, rx: r(0.056), rz: r(0.062), rb: r(0.066) }]
          : [
              { y: 0.15, x: X, rx: r(0.0545), rz: r(0.062), rb: r(0.061) },
              { y: 0.1, x: X, rx: r(0.057), rz: r(0.071), rb: r(0.061), z: -0.004 },
              { y: 0.084, x: X, rx: r(0.0575), rz: r(0.074), rb: r(0.061), z: -0.004 },
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
            0.018 * wrinkle(y, KNEE_H, 0.06, 110) * (1 - f) +
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
  const bend = shoe(s);
  const shin = rigid(s < 0 ? BONE.shinL : BONE.shinR);
  // Suelo del zapato en reposo.
  const y0 = 0;
  const hide = leather(c.shoes, boots ? 0.66 : 0.52);
  const out: BodyPart[] = [];
  const w = (v: number): number => v * b * (boots ? 1.12 : 1);
  out.push({
    g: tubePath(
      [
        { x: X, y: y0 + 0.044, z: 0.056, a: w(0.028), b: 0.033 },
        { x: X, y: y0 + 0.054, z: 0.034, a: w(0.035), b: 0.045 },
        { x: X, y: y0 + 0.058, z: -0.012, a: w(0.037), b: 0.048 },
        { x: X, y: y0 + 0.05, z: -0.07, a: w(0.039), b: 0.04 },
        { x: X, y: y0 + 0.039, z: -0.13, a: w(0.044), b: 0.029 },
        { x: X, y: y0 + 0.034, z: -0.182, a: w(0.041), b: boots ? 0.029 : 0.023 },
        { x: X, y: y0 + 0.03, z: -0.22, a: w(0.029), b: boots ? 0.024 : 0.017 },
        { x: X, y: y0 + 0.028, z: -0.236, a: w(0.012), b: 0.01 },
      ],
      hide,
      { segs: 11, up: { x: 0, y: 1, z: 0 }, round: true },
    ),
    skin: bend,
  });
  // Suela y tacón.
  if (!far())
    out.push({
      g: tubePath(
        [
          { x: X, y: y0 + 0.011, z: 0.064, a: w(0.027), b: 0.011 },
          { x: X, y: y0 + 0.011, z: 0.024, a: w(0.037), b: 0.011 },
          { x: X, y: y0 + 0.011, z: -0.056, a: w(0.038), b: 0.011 },
          { x: X, y: y0 + 0.011, z: -0.142, a: w(0.047), b: 0.011 },
          { x: X, y: y0 + 0.011, z: -0.207, a: w(0.038), b: 0.011 },
          { x: X, y: y0 + 0.011, z: -0.242, a: w(0.012), b: 0.009 },
        ],
        plastic(SOLE, 0.8),
        { segs: 8, up: { x: 0, y: 1, z: 0 } },
      ),
      skin: bend,
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
