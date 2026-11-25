import { aabb, block, deck, floor, lampGlow, lampPost, pillar, railing, ramp, stairs, trim, wallX, wallZ } from '../helpers';
import type { BoxDef, DecorDef, LevelData } from '../types';

/**
 * CONTRATO 3 · TORRE MERIDIAN. Norte = −Z. Tres alturas:
 * A (0 m, sur): terraza jardín, atrio abierto y planta de oficinas bajo la azotea este. B (3,84 m): azotea oeste y azotea
 * este, unidas por una pasarela sobre el atrio; se sube por la escalera oeste o por dentro de las oficinas. C (7,68 m,
 * norte): helipuerto del Juez; se llega por la rampa de la terraza oeste o por la escalera de la azotea este. La huida es
 * de vuelta a la tirolina, en la esquina sureste de A.
 */
const B = 3.84;
const C = 7.68;
const PARAPET = 1.1;

function crate(x: number, z: number, y0 = 0): BoxDef {
  return block(x, z, 1.2, 1.2, 1.2, 'crate', { y0, cover: 'low' });
}

/** Máquina de climatización. */
function hvac(x: number, z: number, y0 = 0, sx = 2, sz = 2): BoxDef {
  return block(x, z, sx, 1.25, sz, 'metalDark', { y0, cover: 'low', noWalk: true, tag: 'ac' });
}

/** Jardinera (a lo largo de X salvo que se gire). */
function planter(x: number, z: number, sx: number, sz: number, y0 = 0): BoxDef {
  return block(x, z, sx, 1.2, sz, 'concrete', { y0, cover: 'low', noWalk: true, tag: 'planter' });
}

/** Mampara de oficina con su mesa. */
function cubicle(x: number, z: number): BoxDef[] {
  return [
    block(x, z, 4.4, 1.25, 0.14, 'steelBlue', { cover: 'low', noWalk: true, tag: 'cubicle' }),
    block(x - 1.1, z + 0.55, 1.8, 0.75, 0.8, 'woodPanel', { noWalk: true }),
    block(x + 1.1, z - 0.55, 1.8, 0.75, 0.8, 'woodPanel', { noWalk: true }),
  ];
}

/** Fila de placas solares. */
function solar(x: number, z: number): BoxDef {
  return block(x, z, 4.6, 1.2, 1, 'steelBlue', { cover: 'low', noWalk: true, tag: 'solar' });
}

/** Claraboya: marco y cristal. */
function skylight(x: number, z: number, y0: number, sx = 3.4, sz = 2.2): BoxDef[] {
  return [
    block(x, z, sx, 0.42, sz, 'concrete', { y0, noWalk: true, tag: 'skylight' }),
    trim(x - sx / 2 + 0.15, y0 + 0.42, z - sz / 2 + 0.15, x + sx / 2 - 0.15, y0 + 0.5, z + sz / 2 - 0.15, 'tilesBlack'),
  ];
}

/** Conducto de ventilación apoyado en dalas (no se salta: se rodea). */
function duct(x0: number, z0: number, x1: number, z1: number, y0: number): BoxDef {
  return aabb(x0, y0, z0, x1, y0 + 1.22, z1, 'steelBlue', { cover: 'low', noWalk: true, tag: 'duct' });
}

/** Farolas de la terraza y balizas de las azoteas: [x, z, alto, hacia dónde da el brazo, altura del suelo]. */
const lamps: ReadonlyArray<readonly [number, number, number, 1 | -1, number]> = [
  [-19.2, 14, 4.6, 1, 0],
  [34.4, 22.6, 3.8, 1, 0],
  [-27.2, -12.6, 3.8, 1, B],
  [24.8, -10.4, 3.8, 1, B],
  [-13.2, -52, 3.6, 1, C],
];

/** Pérgola sobre la tarima, con bombillas. */
const pergola: BoxDef[] = [
  ...[-5.6, 3.6].flatMap((x) => [6.6, 13, 19.4].map((z) => block(x, z, 0.22, 3, 0.22, 'woodDark', { noWalk: true }))),
  ...[-5.6, 3.6].map((x) => trim(x - 0.1, 3, 6.2, x + 0.1, 3.22, 19.8, 'woodDark', true)),
  ...[6.6, 8.4, 10.2, 12, 13.8, 15.6, 17.4, 19.2].map((z) => trim(-6.3, 3.22, z - 0.08, 4.3, 3.4, z + 0.08, 'woodDark', true)),
];

/** Pilastras, cornisas y pintura: lo que da escala a los muros y a los suelos. */
const dressing: BoxDef[] = [
  ...[-38, -34, -25, -20, -15, -11].map((x) => trim(x - 0.3, 0, 0, x + 0.3, B - 0.1, 0.18, 'concrete', true)),
  trim(-40, B - 0.45, 0, -10, B - 0.15, 0.14, 'concrete'),
  ...[9.4, 16.6, 24.2, 32, 38.6].map((x) => trim(x - 0.25, 0, 0, x + 0.25, B, 0.16, 'steelBlue', true)),
  ...[-18, -12, -6, 0, 6, 12, 20, 26, 32, 38].map((x) => trim(x - 0.3, 0, -24, x + 0.3, C - 0.2, -23.8, 'concrete', true)),
  trim(-10, C - 0.7, -24, 40, C - 0.4, -23.84, 'concrete'),
  ...[-21, -15, -9, -3].map((z) => trim(-10, 0, z - 0.3, -9.82, B - 0.1, z + 0.3, 'concrete', true)),
  ...[-57, -51, -39, -33, -27].map((z) => trim(-22.2, B, z - 0.3, -22, C - 0.2, z + 0.3, 'concrete', true)),
  // Paseos pintados de las azoteas.
  trim(-38, B, -13, -10, B + 0.02, -12.86, 'containerYellow'),
  trim(-38, B, -11.14, -10, B + 0.02, -11, 'containerYellow'),
  trim(8, B, -13, 34, B + 0.02, -12.86, 'containerYellow'),
  trim(8, B, -11.14, 34, B + 0.02, -11, 'containerYellow'),
  trim(14.6, B, -19.8, 14.74, B + 0.02, -13, 'containerYellow'),
  trim(17.26, B, -19.8, 17.4, B + 0.02, -13, 'containerYellow'),
  // Helipuerto: pista, borde y la H.
  aabb(2, C, -50, 18, C + 0.02, -34, 'asphalt', { collide: false, shadow: false, tag: 'helipad' }),
  trim(2, C, -50, 18, C + 0.04, -49.7, 'containerYellow'),
  trim(2, C, -34.3, 18, C + 0.04, -34, 'containerYellow'),
  trim(2, C, -49.7, 2.3, C + 0.04, -34.3, 'containerYellow'),
  trim(17.7, C, -49.7, 18, C + 0.04, -34.3, 'containerYellow'),
  trim(6.6, C, -46, 7.6, C + 0.05, -38, 'plaster'),
  trim(12.4, C, -46, 13.4, C + 0.05, -38, 'plaster'),
  trim(7.6, C, -42.5, 12.4, C + 0.05, -41.5, 'plaster'),
  // Falso techo de las oficinas (con el hueco de la escalera).
  trim(8.5, B - 0.44, -24, 34.9, B - 0.35, -0.5, 'plaster'),
  trim(34.9, B - 0.44, -24, 39.5, B - 0.35, -17.7, 'plaster'),
  trim(34.9, B - 0.44, -12.2, 39.5, B - 0.35, -0.5, 'plaster'),
  // Moqueta con senda y tiradores del ascensor.
  trim(9.4, 0, -22, 10.4, 0.02, -2, 'woodPanel'),
  trim(17.6, 0, -8.6, 34, 0.02, -7.4, 'woodPanel'),
];

/** Paneles de luz del falso techo. */
const panels: DecorDef[] = [13, 19, 25, 31].flatMap((x): DecorDef[] =>
  [-4, -10, -16, -21].filter((z) => !(x === 25 && z === -10)).map((z) => ({ kind: 'neon', c: [x, B - 0.46, z], s: [2, 0.04, 0.5], color: 0xfff2dc, intensity: 0.9 })),
);

const PLANTS: ReadonlyArray<readonly [number, number, number]> = [
  [-14, 1.2, 12],
  [-11.4, 1.2, 12],
  [-4, 1.2, 8],
  [4, 1.2, 8],
  [-1, 1.2, 18.4],
  [-6, 0, -22.6],
  [4, 0, -22.6],
  [-8.6, 0, -2],
  [6.6, 0, -2],
  [9.4, 0, -22.6],
  [38.6, 0, -22.6],
  [17, 0, -22.8],
  [9.4, 0, -1.6],
  [-22, 1.2, 16.4],
  [-22, 1.2, 19.4],
  [-30, B, -22.8],
];

export const rooftop: LevelData = {
  id: 'rooftop',
  name: 'Torre Meridian',
  subtitle: 'Contrato 3',
  bounds: { min: [-50, -6, -71], max: [50, 18, 37] },
  killY: -8,
  ambient: {
    sky: 0x9fb4d8,
    ground: 0x1e2026,
    hemi: 1.05,
    ambientColor: 0xd8e4ff,
    ambient: 0.3,
    ibl: 0.4,
    background: 0x0b0e16,
    fog: { color: 0x0b0e16, near: 55, far: 180 },
    exposure: 1.0,
    // La torre domina la ciudad: el horizonte queda muy por debajo de la azotea.
    skyline: { y: -30 },
  },
  // Luna fuerte: el hormigón fotoescaneado de las azoteas es oscuro y sin ella quedaban por debajo de la claridad mínima.
  key: { color: 0xc8d8ff, intensity: 2.3, dir: [-0.35, 1, 0.25], shadow: true, shadowArea: 42 },
  lights: [
    { pos: [-18, 4.2, 14], color: 0xffd0a0, intensity: 75, distance: 28 },
    { pos: [-1, 2.9, 12], color: 0xffd0a0, intensity: 55, distance: 22 },
    { pos: [-1, 3, -12], color: 0x9fe0ff, intensity: 45, distance: 18 },
    { pos: [18, 2.9, -12], color: 0xfff0d8, intensity: 40, distance: 16 },
    { pos: [32, 2.9, -10], color: 0xfff0d8, intensity: 40, distance: 16 },
    { pos: [-26, B + 3.4, -12.6], color: 0xffd0a0, intensity: 65, distance: 25 },
    { pos: [26, B + 3.4, -10.4], color: 0xffd0a0, intensity: 50, distance: 22 },
    { pos: [10, C + 4, -42], color: 0xfff0d0, intensity: 90, distance: 30 },
    { pos: [-12, C + 3.2, -52], color: 0xff2e88, intensity: 60, distance: 24 },
    { pos: [35.6, 3.4, 22.6], color: 0x19e3ff, intensity: 50, distance: 18 },
  ],
  boxes: [
    // --- A (0 m): terraza jardín ---
    floor(-40, 0, 40, 26, 0, 'roofGravel'),
    floor(-10, -24, 8, 0, 0, 'marbleDark'),
    floor(8, -24, 40, 0, 0, 'carpetGreen'),
    trim(-6, 0, 6, 4, 0.03, 20, 'woodPanel'),
    ...pergola,
    ...dressing,
    ...lamps.flatMap(([x, z, h, dx, y0]) => lampPost(x, z, h, dx, y0)),
    railing(-40, 26, 40, 26.3, 0, 'concreteDark', PARAPET),
    railing(-40.3, 0, -40, 26.3, 0, 'concreteDark', PARAPET),
    railing(40, 0, 40.3, 26.3, 0, 'concreteDark', PARAPET),
    planter(-12.6, 12, 5, 1.2),
    planter(-4, 8, 3, 1.2),
    planter(4, 8, 3, 1.2),
    planter(-1, 18.4, 4, 1),
    planter(-22, 18, 1.2, 5),
    hvac(-30, 10),
    hvac(-26.4, 6.6),
    hvac(-35, 18, 0, 2.4, 3),
    block(-18.5, 8, 1, 2.3, 3, 'brick', { cover: 'high', tag: 'chimney' }),
    block(12, 4.4, 1, 2.3, 3, 'brick', { cover: 'high', tag: 'chimney' }),
    ...skylight(-34, 4, 0, 3, 3),
    ...skylight(16, 22, 0),
    duct(-39, 22.6, -24, 23.8, 0),
    duct(33.8, 12, 38.6, 13.2, 0),
    block(8.6, 8, 2.4, 0.75, 0.9, 'leather', { noWalk: true }),
    block(8.6, 10.2, 1.1, 0.5, 1.1, 'woodDark', { noWalk: true }),
    block(-9.6, 16.4, 0.9, 0.75, 2.4, 'leather', { noWalk: true }),
    crate(-8, 20),
    crate(8.4, 12.6),
    crate(11, 20.6),
    crate(-32.4, 21.6),
    // Bar de la terraza.
    block(-14.5, 21.8, 5, 1.2, 0.8, 'woodDark', { cover: 'low', noWalk: true, tag: 'bar' }),
    aabb(-17.2, 1.15, 21.3, -11.8, 1.22, 22.3, 'marbleDark', { collide: false }),
    // Placas solares (sureste).
    solar(20, 9),
    solar(27, 9),
    solar(20, 13.4),
    solar(27, 13.4),
    solar(20, 17.8),
    solar(34, 6.4),
    block(30, 20.4, 2, 2.3, 2, 'concreteDark', { cover: 'high', noWalk: true, tag: 'vent' }),
    block(37.6, 24.2, 1.8, 1.2, 1.2, 'metal', { cover: 'low', noWalk: true, tag: 'zipline' }),

    // --- Atrio (0 m, a cielo abierto, bajo la pasarela) ---
    block(-1, -17.6, 3.4, 1.25, 3.4, 'marble', { cover: 'low', noWalk: true, tag: 'fountain' }),
    aabb(-2.4, 1.25, -19, 0.4, 1.28, -16.2, 'water', { collide: false }),
    planter(-6.4, -8, 1, 4),
    planter(4.4, -8, 1, 4),
    pillar(-5, -12, 0.8, B - 0.3, 'concreteDark'),
    pillar(3, -12, 0.8, B - 0.3, 'concreteDark'),

    // --- B oeste: macizo, con la escalera desde A ---
    aabb(-40, 0, -24, -10, B, 0, 'concreteDark', { tag: 'roofB' }),
    ...stairs({ start: [-30, 0, 4.2], dir: 'z-', steps: 12, rise: 0.32, run: 0.35, width: 2.6, mat: 'metal' }),
    railing(-40, -0.3, -31.4, 0, B, 'concreteDark'),
    railing(-28.6, -0.3, -10, 0, B, 'concreteDark'),
    railing(-40.3, -60, -40, 0, B, 'concreteDark'),
    railing(-10.3, -9.8, -10, 0, B, 'concreteDark'),
    railing(-10.3, -24, -10, -14.2, B, 'concreteDark'),
    ...skylight(-30, -18.6, B, 3, 3),
    ...skylight(-15, -4.4, B, 3, 2),
    duct(-39, -14.6, -30, -13.4, B),
    duct(-25.4, -21.6, -24.2, -15, B),
    hvac(-22, -5, B, 3, 1.6),
    hvac(-16, -17, B),
    crate(-13.4, -8, B),
    crate(-25.6, -12.6, B),
    block(-34, -17, 4, 2.4, 4, 'concrete', { y0: B, cover: 'high', tag: 'nestB' }),
    block(-19, -22, 3, 1.2, 0.8, 'concrete', { y0: B, cover: 'low', noWalk: true }),
    block(-36, -7, 2.4, 1.2, 1, 'metalDark', { y0: B, cover: 'low', noWalk: true }),

    // --- Oficinas (0 m) bajo la azotea este ---
    ...wallX(-0.25, 8, 40, 0, B - 0.34, 'plaster', [
      { at: 13, w: 2.4, to: 2.6 },
      { at: 20.5, w: 5, from: 1.2, to: 2.6 },
      { at: 28, w: 5, from: 1.2, to: 2.6 },
      { at: 35, w: 2.4, to: 2.6 },
    ]),
    ...wallZ(8.25, -24, -0.5, 0, B - 0.34, 'plaster', [
      { at: -5, w: 2.4, to: 2.6 },
      { at: -19, w: 2.4, to: 2.6 },
    ]),
    ...wallZ(39.75, -24, -0.5, 0, B - 0.34, 'plaster'),
    aabb(18.3, 1.3, -0.3, 22.7, 2.5, -0.2, 'glass', { collide: false, shadow: false }),
    aabb(25.8, 1.3, -0.3, 30.2, 2.5, -0.2, 'glass', { collide: false, shadow: false }),
    ...cubicle(14, -5.4),
    ...cubicle(14, -10),
    ...cubicle(14, -14.6),
    ...cubicle(29.6, -4.6),
    block(23, -12, 5, B - 0.34, 4, 'marbleDark', { cover: 'high', noWalk: true, tag: 'core' }),
    aabb(21.2, 0.1, -9.98, 22.6, 2.5, -9.9, 'metal', { collide: false, shadow: false }),
    aabb(23.4, 0.1, -9.98, 24.8, 2.5, -9.9, 'metal', { collide: false, shadow: false }),
    block(19, -19.6, 4.4, 1.2, 1.6, 'woodDark', { cover: 'low', noWalk: true, tag: 'meeting' }),
    ...wallZ(27, -23.8, -17, 0, B - 0.34, 'plaster', [{ at: -20, w: 2, to: 2.5 }], 0.3),
    block(31.4, -20.6, 1, 2.2, 3, 'metalDark', { cover: 'high', noWalk: true }),
    block(31.6, -11.4, 1.2, 1.2, 3, 'woodDark', { cover: 'low', noWalk: true, tag: 'reception' }),
    // Escalera interior a la azotea, con su hueco en el forjado.
    ...stairs({ start: [36.4, 0, -13.4], dir: 'z-', steps: 12, rise: 0.32, run: 0.35, width: 2.4, mat: 'metal' }),
    deck(8, -24, 35, 0, B, 'roofGravel'),
    deck(35, -24, 40, -17.6, B, 'roofGravel'),
    deck(35, -12.4, 40, 0, B, 'roofGravel'),
    deck(37.8, -17.6, 40, -12.4, B, 'roofGravel'),
    aabb(34.75, B, -17.6, 35, B + 2.6, -12.15, 'plasterDark', { noWalk: true }),
    aabb(37.8, B, -17.6, 38.05, B + 2.6, -12.15, 'plasterDark', { noWalk: true }),
    aabb(35, B, -12.4, 37.8, B + 2.6, -12.15, 'plasterDark', { noWalk: true }),
    aabb(34.55, B + 2.6, -17.8, 38.25, B + 2.82, -11.95, 'concreteDark', { noWalk: true }),

    // --- B este: azotea de las oficinas ---
    railing(8, -0.3, 40, 0, B, 'concreteDark'),
    railing(40, -24, 40.3, 0, B, 'concreteDark'),
    railing(8, -9.8, 8.3, -0.3, B, 'concreteDark'),
    railing(8, -24, 8.3, -14.2, B, 'concreteDark'),
    ...skylight(20, -5, B, 3.4, 2.4),
    ...skylight(30, -14.6, B, 3, 3),
    duct(9.4, -8.4, 10.6, -2.4, B),
    duct(22, -20.6, 31, -19.4, B),
    hvac(14, -6, B, 3, 1.6),
    hvac(29, -5, B),
    hvac(27.5, -18, B, 2.4, 1.6),
    crate(20, -12.4, B),
    crate(33, -10.6, B),
    block(12, -18.6, 1, 1.2, 3, 'concrete', { y0: B, cover: 'low', noWalk: true }),
    // Pasarela sobre el atrio.
    deck(-10, -14, 8, -10, B, 'metal', 0.3),
    railing(-10, -14.15, 8, -14, B, 'metalDark'),
    railing(-10, -10, 8, -9.85, B, 'metalDark'),

    // --- Terraza oeste (B) y rampa a C ---
    aabb(-40, 0, -60, -22, B, -24, 'concreteDark', { tag: 'roofBWest' }),
    railing(-40, -60.3, -22, -60, B, 'concreteDark'),
    ...skylight(-32, -38.6, B, 3, 3),
    duct(-39, -55, -33, -53.8, B),
    duct(-25, -40, -23.8, -33, B),
    hvac(-35, -34, B, 2, 3),
    crate(-28, -31, B),
    crate(-36.6, -46, B),
    block(-28.6, -52, 3, 1.2, 0.8, 'concrete', { y0: B, cover: 'low', noWalk: true }),

    // --- C (7,68 m): helipuerto ---
    aabb(-22, 0, -60, 40, C, -24, 'concreteDark', { tag: 'roofC' }),
    ...stairs({ start: [16, B, -19.8], dir: 'z-', steps: 12, rise: 0.32, run: 0.35, width: 2.6, mat: 'metal' }),
    railing(-22, -60.3, 40.3, -60, C, 'concreteDark'),
    railing(40, -60.3, 40.3, -24, C, 'concreteDark'),
    railing(-22.3, -60.3, -22, -45.6, C, 'concreteDark'),
    railing(-22.3, -42.4, -22, -24, C, 'concreteDark'),
    railing(-22, -24.3, 14.6, -24, C, 'concreteDark'),
    railing(17.4, -24.3, 40, -24, C, 'concreteDark'),
    ...skylight(-8, -56, C, 3, 2.4),
    ...skylight(34, -29, C, 3, 3),
    duct(-20, -40, -14, -38.8, C),
    duct(26, -57.6, 27.2, -50, C),
    // Helicóptero: cabina y cola chocan con cajas invisibles.
    aabb(30.4, C, -43.2, 34.8, C + 2.9, -40.8, 'metalDark', { invisible: true, cover: 'high', noWalk: true, tag: 'helicopter' }),
    aabb(34.8, C + 1.6, -42.4, 39.2, C + 2.6, -41.6, 'metalDark', { invisible: true, noWalk: true }),
    hvac(-1.6, -30, C, 3, 1.6),
    hvac(24, -36, C),
    hvac(24, -46, C, 2, 3),
    block(-4, -50, 2.4, 1.2, 1, 'concrete', { y0: C, cover: 'low' }),
    block(10, -55.4, 4, 1.2, 1, 'concrete', { y0: C, cover: 'low' }),
    block(-3.4, -40, 1, 1.2, 3, 'concrete', { y0: C, cover: 'low' }),
    crate(10, -29, C),
    crate(20.6, -29.6, C),
    crate(21, -53, C),
    crate(-12, -36, C),
    block(-14, -46, 5, 3, 4, 'plasterDark', { y0: C, cover: 'high', noWalk: true, tag: 'machineRoom' }),
    block(-14, -29, 3, 1.2, 1, 'metalDark', { y0: C, cover: 'low', noWalk: true }),
    block(32, -52, 8, 3.2, 6, 'plasterDark', { y0: C, cover: 'high', tag: 'tower' }),
    block(32, -35, 4, 2.3, 1.2, 'steelBlue', { y0: C, cover: 'high', noWalk: true }),

    // Cartel sobre la azotea y edificios lejanos (decorado sin collider).
    aabb(-10, C, -59.6, -9.7, C + 4.4, -59.3, 'metalDark', { collide: false }),
    aabb(27.7, C, -59.6, 28, C + 4.4, -59.3, 'metalDark', { collide: false }),
    aabb(-45.5, -12, -62, -43.5, 7, -34, 'plasterDark', { collide: false, shadow: false }),
    aabb(43.5, -12, -62, 45.5, 11, -44, 'plasterDark', { collide: false, shadow: false }),
    aabb(-45.5, -12, 28, 20, 1, 31, 'plasterDark', { collide: false, shadow: false }),
  ],
  ramps: [ramp([-31, B, -44], [-22, C, -44], 3, 'metal')],
  decor: [
    { kind: 'sign', c: [9, C + 3, -59.2], w: 34, h: 2.6, rotY: 0, text: 'MERIDIAN', color: 0xd4af37, font: 'serif', glow: 1.2 },
    { kind: 'sign', c: [24, 3.2, 0.06], w: 8, h: 0.6, rotY: 0, text: 'MERIDIAN CAPITAL', color: 0xd4af37, font: 'serif' },
    { kind: 'neon', c: [23, 1.35, -9.96], s: [0.34, 0.46, 0.04], color: 0x9fe0ff, intensity: 1 },
    { kind: 'sign', c: [23, 3, -9.94], w: 2.6, h: 0.35, rotY: 0, text: 'ASCENSORES', color: 0x9fe0ff, font: 'sans' },
    { kind: 'sign', c: [35, 2.3, 25.95], w: 4.2, h: 0.7, rotY: Math.PI, text: 'TIROLINA', color: 0x19e3ff, font: 'sans' },
    { kind: 'sign', c: [36.4, 3.1, -13.1], w: 2, h: 0.35, rotY: 0, text: 'AZOTEA', color: 0x3ddc84, font: 'sans' },
    { kind: 'neon', c: [24, 3.7, 0.08], s: [32, 0.07, 0.07], color: 0xff2e88 },
    { kind: 'neon', c: [-25, 3.7, 0.08], s: [30, 0.06, 0.06], color: 0x19e3ff, intensity: 1.2 },
    { kind: 'neon', c: [9, 7.5, -23.94], s: [62, 0.07, 0.07], color: 0xff2e88, intensity: 1.2 },
    { kind: 'neon', c: [-1, B - 0.36, -9.82], s: [18, 0.06, 0.06], color: 0x9fe0ff, intensity: 1.2 },
    { kind: 'neon', c: [10, C + 0.05, -34], s: [16, 0.05, 0.1], color: 0x19e3ff },
    { kind: 'neon', c: [10, C + 0.05, -50], s: [16, 0.05, 0.1], color: 0x19e3ff },
    ...panels,
    ...lamps.map(([x, z, h, dx, y0]) => lampGlow(x, z, h, dx, 0xffe0b0, y0)),
    ...[7.5, 9.3, 11.1, 12.9, 14.7, 16.5, 18.3].map((z): DecorDef => ({ kind: 'neon', c: [-1, 3.14, z], s: [9, 0.03, 0.03], color: 0xffd9a0, intensity: 1.1 })),
    { kind: 'prop', prop: 'helicopter', c: [32.6, C, -42], rotY: Math.PI },
    { kind: 'prop', prop: 'antenna', c: [32, C + 3.2, -54] },
    { kind: 'prop', prop: 'antenna', c: [-38, B, -58] },
    { kind: 'prop', prop: 'waterTower', c: [-35, 0, 13.4] },
    { kind: 'prop', prop: 'rotor', c: [-14, C + 3.2, -46], scale: 0.4 },
    { kind: 'prop', prop: 'barStools', c: [-16, 0, 20.4] },
    { kind: 'prop', prop: 'lampDesk', c: [31.6, 1.2, -12] },
    ...PLANTS.map((p) => ({ kind: 'prop' as const, prop: 'plant' as const, c: p })),
  ],
  spawn: { pos: [0, 0, 22], yaw: 0 },
  checkpoints: [
    { id: 'start', pos: [0, 0, 22], yaw: 0, radius: 2, label: 'Terraza' },
    { id: 'offices', pos: [23, 0, -7], yaw: Math.PI, radius: 2, label: 'Oficinas' },
    { id: 'roofB', pos: [-13, B, -12], yaw: Math.PI / 2, radius: 2, label: 'Segunda azotea' },
    { id: 'roofC', pos: [10, C, -27], yaw: 0, radius: 2, label: 'Helipuerto' },
  ],
  enemies: [
    // A: terraza y atrio.
    { id: 'a-thug-a', type: 'thug', pos: [-8, 0, 5], yaw: Math.PI, group: 'roofA', patrol: [[-8, 0, 5], [7, 0, 5]] },
    { id: 'a-thug-b', type: 'thug', pos: [24, 0, 11.2], yaw: Math.PI / 2, group: 'roofA', patrol: [[32, 0, 11.2], [16.6, 0, 11.2]] },
    { id: 'a-escort', type: 'escort', pos: [-24, 0, 12], yaw: Math.PI, group: 'roofA', patrol: [[-24, 0, 12], [-33, 0, 7]] },
    { id: 'a-drone', type: 'drone', pos: [-1, 0, 3], yaw: Math.PI, group: 'roofA', patrol: [[-14, 0, 4], [14, 0, 8]] },
    { id: 'a-hound', type: 'hound', pos: [-3, 0, -5], yaw: Math.PI, group: 'roofA', patrol: [[-3, 0, -4], [-3, 0, -21.5]] },
    // Oficinas.
    { id: 'o-thug', type: 'thug', pos: [11, 0, -12], yaw: Math.PI, group: 'offices', patrol: [[10.4, 0, -4], [10.4, 0, -20]] },
    { id: 'o-escort', type: 'escort', pos: [28, 0, -8], yaw: Math.PI, group: 'offices', patrol: [[28, 0, -7], [18.6, 0, -7]] },
    { id: 'o-shield', type: 'shield', pos: [34, 0, -18], yaw: Math.PI, guard: true, group: 'offices' },
    // Tiradores: azotea oeste, borde de C y torre del helipuerto.
    { id: 'm-roofB', type: 'marksman', pos: [-34, B + 2.4, -17], yaw: Math.PI, stationary: true, group: 'marksmen' },
    { id: 'm-roofC', type: 'marksman', pos: [28, C, -26], yaw: Math.PI, stationary: true, group: 'marksmen' },
    { id: 'm-tower', type: 'marksman', pos: [32, C + 3.2, -50.6], yaw: Math.PI * 0.8, stationary: true, group: 'marksmen' },
    { id: 'judge', type: 'boss', pos: [10, C, -42], yaw: Math.PI, group: 'boss' },
    // B: al bloquear los ascensores.
    { id: 'b-escort-a', type: 'escort', pos: [-16, B, -12], yaw: -Math.PI / 2, group: 'roofB', patrol: [[-16, B, -12], [-30, B, -12]], spawnOn: 'roofB' },
    { id: 'b-escort-b', type: 'escort', pos: [24, B, -8], yaw: Math.PI, group: 'roofB', patrol: [[24, B, -8], [11, B, -12]], spawnOn: 'roofB' },
    { id: 'b-shield', type: 'shield', pos: [-26, B, -7], yaw: -Math.PI / 2, group: 'roofB', spawnOn: 'roofB' },
    { id: 'b-thug', type: 'thug', pos: [-30, B, -28], yaw: Math.PI, group: 'roofB', spawnOn: 'roofB' },
    { id: 'b-drone', type: 'drone', pos: [-18, B, -19], yaw: Math.PI, group: 'roofB', spawnOn: 'roofB' },
    // C: la guardia del Juez.
    { id: 'c-escort-a', type: 'escort', pos: [-6, C, -34], yaw: Math.PI, guard: true, group: 'roofC', spawnOn: 'roofC' },
    { id: 'c-escort-b', type: 'escort', pos: [22, C, -40], yaw: Math.PI, guard: true, group: 'roofC', spawnOn: 'roofC' },
    { id: 'c-heavy', type: 'heavy', pos: [10, C, -34.6], yaw: Math.PI, guard: true, group: 'roofC', spawnOn: 'roofC' },
    { id: 'p1-escort-a', type: 'escort', pos: [-8, C, -54], yaw: Math.PI, spawnOn: 'boss-phase-1' },
    { id: 'p1-escort-b', type: 'escort', pos: [37, C, -46.4], yaw: Math.PI / 2, spawnOn: 'boss-phase-1' },
    { id: 'p1-drone', type: 'drone', pos: [4, C, -56], yaw: Math.PI, spawnOn: 'boss-phase-1' },
    { id: 'p2-heavy', type: 'heavy', pos: [16, C, -57], yaw: Math.PI, spawnOn: 'boss-phase-2' },
    { id: 'p2-hound', type: 'hound', pos: [-8, C, -58], yaw: Math.PI, spawnOn: 'boss-phase-2' },
    { id: 'p2-shield', type: 'shield', pos: [37, C, -38], yaw: Math.PI / 2, spawnOn: 'boss-phase-2' },
    // Huida.
    { id: 'esc-escort', type: 'escort', pos: [26, B, -14], yaw: 0, spawnOn: 'escape' },
    { id: 'esc-shield', type: 'shield', pos: [35, 0, 4], yaw: 0, spawnOn: 'escape' },
    { id: 'esc-thug-a', type: 'thug', pos: [4, 0, 4], yaw: 0, spawnOn: 'escape' },
    { id: 'esc-thug-b', type: 'thug', pos: [24, 0, 15.6], yaw: 0, spawnOn: 'escape' },
    { id: 'esc-hound', type: 'hound', pos: [14, 0, 14], yaw: 0, spawnOn: 'escape' },
  ],
  civilians: [],
  pickups: [
    { id: 'p-ammo-1', kind: 'ammo', pos: [-16, 0, 23.6] },
    { id: 'p-med-1', kind: 'medkit', pos: [33, 0, -22.4] },
    { id: 'p-armor-1', kind: 'armor', pos: [-38, B, -22] },
    { id: 'p-ammo-2', kind: 'ammo', pos: [38, B, -2] },
    { id: 'p-med-2', kind: 'medkit', pos: [-26, B, -57] },
    { id: 'p-ammo-3', kind: 'ammo', pos: [-19, C, -27] },
    { id: 'p-armor-2', kind: 'armor', pos: [38, C, -27] },
    { id: 'p-med-3', kind: 'medkit', pos: [-19, C, -57] },
    { id: 'p-ammo-4', kind: 'ammo', pos: [38, C, -57.6] },
  ],
  interactables: [{ id: 'lifts', kind: 'terminal', pos: [23, 0, -9.6], radius: 1.8, prompt: 'Bloquear los ascensores', action: 'mission:lifts', hold: 2 }],
  music: 'tower',
  ambience: 'wind',
  weather: 'rain',
  mission: {
    id: 'rooftop',
    objectives: [
      { id: 'lifts', kind: 'interact', text: 'Bloquea los ascensores en las oficinas', targets: ['lifts'], onComplete: 'roofB', checkpoint: 'offices' },
      { id: 'roofB', kind: 'reach', text: 'Sube y cruza a la segunda azotea', at: [-13, B, -12], radius: 3.5, checkpoint: 'roofB' },
      { id: 'marksmen', kind: 'eliminate', text: 'Elimina a los tiradores', group: 'marksmen', onComplete: 'roofC' },
      { id: 'roofC', kind: 'reach', text: 'Llega al helipuerto', at: [10, C, -28], radius: 4.5, checkpoint: 'roofC' },
      { id: 'judge', kind: 'boss', text: 'Vence al Juez', enemyId: 'judge' },
      { id: 'escape', kind: 'escape', text: 'Escapa por la tirolina', at: [37, 0, 22.4], radius: 2.5, seconds: 60, onStart: 'escape' },
    ],
  },
};
