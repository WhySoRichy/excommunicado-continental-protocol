import { aabb, block, car, ceiling, deck, floor, lampGlow, lampPost, pillar, railing, stairs, trim, wallX, wallZ } from '../helpers';
import type { BoxDef, DecorDef, LevelData, MaterialId } from '../types';

/**
 * CONTRATO 1 · CLUB KAIROS. Norte = −Z.
 * Calle (sur) → vestíbulo con el panel de alarma → pista con galerías a 3,2 m → ala oeste (cocina, almacén y despacho) y
 * ala este (salón Índigo), que rodean la pista → VIP (galería norte) → sala de Vance, sobre los camerinos → muelle de carga
 * y calle trasera. Por fuera, el callejón oeste lleva a la cocina y a la escalera de incendios del VIP.
 */
const H = 8;
const MEZ = 3.2;
const LOW = 4.4;
/** Los muros se parten un dedo por debajo del forjado, que pasa por el hueco de las puertas de arriba. */
const SPLIT = MEZ - 0.02;
const MAGENTA = 0xff2e88;
const CYAN = 0x19e3ff;
const GOLD = 0xd4af37;

/** Reservado: respaldo que cubre, banco y mesa. `dir` 1 = el banco mira al este. */
function booth(x: number, z: number, dir: 1 | -1, y0 = 0): BoxDef[] {
  return [
    block(x, z, 0.35, 1.25, 3, 'velvet', { y0, cover: 'low', noWalk: true, tag: 'booth' }),
    block(x + dir * 0.55, z, 0.75, 0.5, 2.8, 'leather', { y0, noWalk: true }),
    block(x + dir * 1.6, z, 0.7, 0.6, 1.1, 'woodDark', { y0, noWalk: true }),
  ];
}

/** Encimera de cocina. */
function counter(x: number, z: number, sx: number, sz: number): BoxDef[] {
  return [
    block(x, z, sx, 1.2, sz, 'steelBlue', { cover: 'low', noWalk: true, tag: 'counter' }),
    trim(x - sx / 2 - 0.05, 1.16, z - sz / 2 - 0.05, x + sx / 2 + 0.05, 1.23, z + sz / 2 + 0.05, 'marble'),
  ];
}

function crate(x: number, z: number): BoxDef {
  return block(x, z, 1.2, 1.2, 1.2, 'crate', { cover: 'low' });
}

const cars: Array<[number, number, number, MaterialId]> = [
  [-13, 33.4, 0, 'metalDark'],
  [10.5, 33.3, Math.PI, 'steelBlue'],
  [23, 37.6, 0.06, 'metalDark'],
  [-22, 38, Math.PI, 'containerRed'],
  [29, -31.4, Math.PI / 2, 'metalDark'],
];

/** Farolas de la calle, del callejón y del patio: [x, z, alto, hacia dónde da el brazo]. */
const lamps: ReadonlyArray<readonly [number, number, number, 1 | -1]> = [
  [-18, 31.6, 5.2, 1],
  [18, 31.6, 5.2, -1],
  [-35.2, 4, 4.6, 1],
  [-13, -28, 5, -1],
  [19.6, -34, 4.6, 1],
];

/** Fachada del club: acera, marquesina, columnas, escaparates y la pintura de la calzada. */
const facade: BoxDef[] = [
  aabb(-35.5, 0, 26.5, 35.5, 0.14, 31, 'concrete', { shadow: false, tag: 'sidewalk' }),
  ...wallX(26.75, -18.25, 18.25, 0, LOW, 'brick', [{ at: 0, w: 3.2, to: 3.2 }]),
  trim(-5, 3.5, 27, 5, 3.8, 30.2, 'metalDark', true),
  block(-4.6, 29.8, 0.25, 3.4, 0.25, 'gold', { noWalk: true }),
  block(4.6, 29.8, 0.25, 3.4, 0.25, 'gold', { noWalk: true }),
  trim(-1.8, 0.14, 27, 1.8, 0.17, 31, 'carpetRed'),
  ...[-16.5, -12, -7.5, 7.5, 12, 16.5].map((x) => trim(x - 0.3, 0.14, 27, x + 0.3, 6.2, 27.16, 'concreteDark', true)),
  ...[-14.25, -9.75, 9.75, 14.25].flatMap((x) => [trim(x - 1.5, 1.1, 27, x + 1.5, 3.3, 27.06, 'tilesBlack'), trim(x - 1.6, 1, 27, x + 1.6, 1.1, 27.14, 'gold')]),
  trim(-35.5, 5.9, 26.9, 35.5, 6.25, 27.14, 'concreteDark', true),
  ...[-30, -24, -18, -12, -6, 0, 6, 12, 18, 24, 30].map((x) => trim(x - 1.2, 0, 35.2, x + 1.2, 0.02, 35.34, 'plaster')),
  trim(-35.5, 0, 31, 35.5, 0.03, 31.2, 'concreteDark'),
];

/** Pantalla de tubos tras el DJ, con los colores del club. */
const djWall: DecorDef[] = [-4.5, -3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5, 4.5].map((x, i) => {
  const h = 1.1 + 1.1 * Math.abs(Math.sin(i * 1.7));
  return { kind: 'neon', c: [x, 0.4 + h / 2, -8.9], s: [0.16, h, 0.06], color: i % 2 ? MAGENTA : CYAN, intensity: 1.2 };
});

/** Fluorescentes: [x, y, z, largo en x, largo en z]. */
const tubes: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [-24, 4.36, -4, 4, 0.16],
  [-24, 4.36, 1, 4, 0.16],
  [-26.6, 4.36, 13, 0.16, 3],
  [-25, 4.36, 20, 2.4, 0.16],
  [-13, 4.36, 22, 3, 0.16],
  [13, 4.36, 22, 3, 0.16],
  [24, 5.56, -18, 5, 0.18],
  [29, 5.56, -14, 5, 0.18],
  [27, 5.56, 21.4, 5, 0.18],
  [3, 2.86, -20, 2, 0.14],
  [-7, 2.86, -20, 2, 0.14],
  [14.4, 7.9, -16, 2.4, 0.16],
];

export const nightclub: LevelData = {
  id: 'nightclub',
  name: 'Club Kairos',
  subtitle: 'Contrato 1',
  bounds: { min: [-36, -2, -38], max: [36, H + 1, 42] },
  killY: -10,
  ambient: {
    sky: 0xb8a8d8,
    ground: 0x2a2030,
    hemi: 0.95,
    ambientColor: 0xe0c8ff,
    ambient: 0.3,
    ibl: 0.4,
    background: 0x120c18,
    fog: { color: 0x120c18, near: 40, far: 120 },
    exposure: 1.05,
    skyline: { y: 0 },
  },
  key: { color: 0xd8c8ff, intensity: 1.3, dir: [0.25, 1, 0.35], shadow: true, shadowArea: 30 },
  lights: [
    { pos: [-9, 5.6, 2], color: MAGENTA, intensity: 70, distance: 21 },
    { pos: [9, 5.6, 2], color: CYAN, intensity: 70, distance: 21 },
    { pos: [0, 5.2, 12], color: 0xffb0ff, intensity: 50, distance: 18 },
    { pos: [0, 6, -9], color: GOLD, intensity: 55, distance: 18 },
    { pos: [0, 3.4, 22.5], color: 0xffd0a0, intensity: 35, distance: 13 },
    { pos: [0, 5, 33], color: 0xa8c0ff, intensity: 75, distance: 30 },
    { pos: [-24, 3.4, -1], color: 0xfff0d8, intensity: 45, distance: 17 },
    { pos: [-25, 3.2, 20], color: 0xffd0a0, intensity: 30, distance: 12 },
    { pos: [26, 3.6, 6], color: 0x5a6bff, intensity: 60, distance: 20 },
    { pos: [24, 4.6, -18], color: 0xffe0b0, intensity: 50, distance: 20 },
  ],
  boxes: [
    // --- Suelos ---
    floor(-36, 26.5, 36, 41, 0, 'asphalt'),
    floor(-36, -36.5, -30, 26.5, 0, 'asphalt'),
    floor(-30, -36.5, -12.5, -12.25, 0, 'asphalt'),
    floor(18.5, -36.5, 36, -26.5, 0, 'asphalt'),
    floor(-30, -12.25, -18.25, 26.5, 0, 'concrete'),
    floor(-18.25, -12.25, 18.25, 18.25, 0, 'tilesBlack'),
    floor(-18.25, 18.25, 18.25, 26.5, 0, 'tilesBlack'),
    floor(-12.5, -26.5, 18.5, -12.25, 0, 'concrete'),
    floor(18.5, -26.5, 35, -8.25, 0, 'concrete'),
    floor(18.25, -8.25, 35, 26.5, 0, 'tilesBlack'),

    // --- Calle: fachadas y cierre ---
    ...wallX(41.25, -36, 36, 0, 6, 'brick'),
    ...wallZ(-35.75, -36.5, 41, 0, 6, 'brick'),
    ...wallZ(35.75, -36.5, 41, 0, 6, 'brick'),
    ...wallX(26.75, 18.25, 35.5, 0, 6, 'brick'),
    ...wallX(26.75, -30, -18.25, 0, 6, 'brick'),
    ...facade,
    ...lamps.flatMap(([x, z, h, dx]) => lampPost(x, z, h, dx)),
    ...cars.flatMap(([x, z, r, mat]) => car(x, z, r, mat)),
    block(-6.6, 30, 3, 1.24, 0.6, 'concreteDark', { y0: 0.14, cover: 'low', noWalk: true, tag: 'planter' }),
    block(6.6, 30, 3, 1.24, 0.6, 'concreteDark', { y0: 0.14, cover: 'low', noWalk: true, tag: 'planter' }),
    block(-22, 29.4, 1.6, 1.3, 1.4, 'metalDark', { y0: 0.14, cover: 'low', noWalk: true }),
    block(15.6, 28.6, 1.2, 1.2, 1.2, 'crate', { y0: 0.14, cover: 'low' }),
    block(-28, 34, 1.6, 2.4, 1.6, 'metalDark', { cover: 'high', noWalk: true, tag: 'kiosk' }),
    block(31, 31, 2.4, 2.4, 1.6, 'woodDark', { cover: 'high', noWalk: true, tag: 'kiosk' }),

    // --- Callejón oeste ---
    block(-34.4, 18, 1.6, 1.3, 2.6, 'metalDark', { cover: 'low', noWalk: true, tag: 'dumpster' }),
    block(-31.2, 6, 1.4, 1.3, 2.2, 'metalDark', { cover: 'low', noWalk: true, tag: 'dumpster' }),
    crate(-34.6, -4),
    crate(-31, -12),
    block(-34.4, -20, 1.6, 1.3, 2.6, 'metalDark', { cover: 'low', noWalk: true, tag: 'dumpster' }),

    // --- Vestíbulo ---
    ...wallX(26.25, -7.5, 7.5, 0, LOW, 'plasterDark', [{ at: 0, w: 2.6, to: 3 }]),
    ...wallX(26.75, -18.25, 18.25, LOW, 6, 'brick'),
    ...wallZ(-7.25, 18.5, 26, 0, LOW, 'plasterDark', [{ at: 20.6, w: 1.8, to: 2.6 }]),
    ...wallZ(7.25, 18.5, 26, 0, LOW, 'plasterDark', [{ at: 24, w: 1.8, to: 2.6 }]),
    ceiling(-7.5, 18, 7.5, 26.5, LOW, 'plasterDark'),
    block(-5, 23.6, 1.2, 1.2, 3.4, 'woodDark', { cover: 'low', noWalk: true, tag: 'coatCheck' }),
    block(3.6, 23.4, 0.3, 1.2, 2.4, 'velvet', { cover: 'low', noWalk: true }),
    aabb(6.88, 1.1, 20.2, 6.98, 1.7, 21, 'metalDark', { collide: false, tag: 'alarmBox' }),

    // --- Aseos y guardarropa (este): otra entrada al salón Índigo ---
    ...wallX(26.25, 7.5, 18.25, 0, LOW, 'plasterDark'),
    ceiling(7.5, 18, 18.25, 26.5, LOW, 'plasterDark'),
    ...wallZ(18.25, 18.5, 26, 0, LOW, 'plasterDark', [{ at: 21, w: 2, to: 2.6 }]),
    block(11, 19.4, 2, 2.4, 0.3, 'plaster', { noWalk: true }),
    block(14.6, 19.4, 2, 2.4, 0.3, 'plaster', { noWalk: true }),
    block(13, 24.4, 4, 1.2, 0.8, 'marbleDark', { cover: 'low', noWalk: true }),

    // --- Control y despacho del encargado (oeste) ---
    ...wallX(26.25, -18.25, -7.5, 0, LOW, 'plasterDark'),
    ceiling(-18.25, 18, -7.5, 26.5, LOW, 'plasterDark'),
    ...wallZ(-18.25, 18.5, 26, 0, LOW, 'plasterDark', [{ at: 23.4, w: 2, to: 2.6 }]),
    block(-12.6, 24.8, 4, 1.2, 0.9, 'metalDark', { cover: 'low', noWalk: true, tag: 'screens' }),
    aabb(-14.8, 1.5, 25.8, -10.4, 2.9, 25.98, 'glass', { collide: false, shadow: false }),
    block(-15.6, 20.4, 0.6, 2.2, 2.6, 'metalDark', { cover: 'high', noWalk: true }),
    block(-10, 20.2, 1.4, 1.2, 1.4, 'crate', { cover: 'low' }),
    ...wallX(26.25, -30, -18.25, 0, LOW, 'woodPanel'),
    block(-26, 22.4, 1.1, 1.2, 3, 'woodDark', { cover: 'low', noWalk: true, tag: 'desk' }),
    block(-28.9, 22.4, 0.6, 2.4, 4.4, 'woodDark', { noWalk: true }),
    // La lista de invitados, en su carpeta.
    trim(-26.25, 1.2, 22.15, -25.75, 1.23, 22.75, 'leather'),
    trim(-26.2, 1.23, 22.2, -25.8, 1.24, 22.7, 'plaster'),
    block(-21, 25, 2.6, 0.75, 0.9, 'leather', { noWalk: true }),

    // --- Ala oeste: cocina y almacén ---
    ...wallZ(-29.75, -12, 26, 0, LOW, 'brick', [{ at: -7, w: 1.8, to: 2.5 }]),
    ...[-9.6, -4, 2, 8, 14, 20].map((z) => trim(-30.12, 0, z - 0.25, -30, LOW + 0.3, z + 0.25, 'concreteDark')),
    trim(-30.14, LOW + 0.1, -12.4, -29.9, LOW + 0.45, 26.4, 'concreteDark'),
    ...wallX(-12.25, -29.5, -18.5, 0, LOW, 'plaster'),
    ...wallX(8.25, -29.5, -18.5, 0, LOW, 'plaster', [{ at: -21.5, w: 2, to: 2.6 }]),
    ...wallX(18.25, -29.5, -18.5, 0, LOW, 'plaster', [{ at: -27, w: 2, to: 2.6 }]),
    ceiling(-30, -12.5, -18.25, 26.5, LOW, 'plasterDark'),
    ...counter(-24, -4, 4.6, 1.1),
    ...counter(-24, 0.6, 4.6, 1.1),
    ...counter(-28.8, -0.6, 1, 6),
    ...counter(-20, -9.4, 2, 1),
    block(-28.6, 5.6, 1.6, 2.4, 2, 'plaster', { cover: 'high', noWalk: true, tag: 'fridge' }),
    ...counter(-23, 5.4, 2.6, 1.1),
    block(-27, -10.6, 2.4, 2.3, 1, 'plaster', { cover: 'high', noWalk: true }),
    block(-28.8, 12, 1, 2.6, 4, 'woodDark', { cover: 'high', noWalk: true, tag: 'shelf' }),
    block(-24.6, 13, 1, 2.6, 5, 'woodDark', { cover: 'high', noWalk: true, tag: 'shelf' }),
    crate(-20.4, 12.6),
    crate(-21.6, 10.4),
    block(-22, 16.4, 1.2, 1.2, 1.2, 'crate', { cover: 'low' }),

    // --- Pista ---
    ...wallZ(-18.25, -12, 18, 0, H, 'brick', [
      { at: -2, w: 2, to: 2.6 },
      { at: 15.8, w: 2, to: 2.6 },
    ]),
    ...wallZ(18.25, -12, 18, 0, H, 'brick', [
      { at: -2, w: 2.6, to: 2.6 },
      { at: 15.8, w: 2.2, to: 2.6 },
    ]),
    ...wallX(18.25, -18.5, 18.5, 0, H, 'brick', [{ at: 0, w: 4, to: 3.2 }]),
    ...wallX(-12.25, -18.5, 18.5, 0, SPLIT, 'brick', [
      { at: -9.5, w: 2, to: 2.6 },
      { at: 14, w: 2, to: 2.6 },
    ]),
    ...wallX(-12.25, -18.5, 18.5, SPLIT, H, 'brick', [
      { at: -15.6, w: 1.8, to: MEZ + 2.4 },
      { at: -5, w: 4, from: MEZ + 1, to: MEZ + 2.6 },
      { at: 0, w: 2.6, to: MEZ + 2.6 },
      { at: 6, w: 4, from: MEZ + 1, to: MEZ + 2.6 },
    ]),
    ceiling(-18.5, -12.5, 18.5, 18.5, H, 'plasterDark'),
    aabb(-6, 0, -2, 6, 0.03, 9, 'danceFloor', { collide: false, shadow: false }),
    // Escenario del DJ, bajo el VIP, y truss de luces sobre la pista.
    trim(-9, 7.2, -3, 9, 7.4, -2.8, 'metalDark'),
    trim(-9, 7.2, 9, 9, 7.4, 9.2, 'metalDark'),
    trim(-9, 7.2, -3, -8.8, 7.4, 9.2, 'metalDark'),
    trim(8.8, 7.2, -3, 9, 7.4, 9.2, 'metalDark'),
    aabb(-5.5, 0, -8.4, 5.5, 0.32, -4.4, 'woodDark', { tag: 'stage' }),
    block(0, -6, 4, 1.2, 1.2, 'metalDark', { y0: 0.32, cover: 'low', noWalk: true, tag: 'dj' }),
    // Barra en isla (este) con estantería que cubre de pie.
    block(8.6, 4, 0.9, 1.2, 8, 'woodDark', { cover: 'low', noWalk: true, tag: 'bar' }),
    aabb(8.05, 1.15, -0.1, 9.15, 1.22, 8.1, 'marbleDark', { collide: false }),
    block(11.6, 4, 0.6, 2.4, 8, 'woodDark', { cover: 'high', noWalk: true, tag: 'backbar' }),
    // Reservados (oeste) y columnas.
    ...booth(-12, -1.5, 1),
    ...booth(-12, 3.4, 1),
    ...booth(-12, 8.3, 1),
    ...booth(12.6, 12.6, -1),
    pillar(-8.4, -2.6, 0.8, H, 'concreteDark'),
    pillar(8.4, -2.6, 0.8, H, 'concreteDark'),
    pillar(-8.4, 12, 0.8, H, 'concreteDark'),
    pillar(8.4, 12, 0.8, H, 'concreteDark'),
    block(0, 13.2, 2.4, 1.2, 0.8, 'marbleDark', { cover: 'low', noWalk: true, tag: 'host' }),
    // --- Galerías (3,2 m): VIP al norte, oeste y este, con una escalera en cada punta sur ---
    deck(-18, -12.49, 18, -6, MEZ, 'carpetRed', 0.3),
    deck(-18, -6, -14, 9.6, MEZ, 'carpetRed', 0.3),
    deck(14, -6, 18, 9.6, MEZ, 'carpetRed', 0.3),
    railing(-14, -6.1, 14, -5.95, MEZ, 'metalDark'),
    railing(-14.1, -5.95, -13.95, 9.6, MEZ, 'metalDark'),
    railing(13.95, -5.95, 14.1, 9.6, MEZ, 'metalDark'),
    railing(-18, 9.5, -17.2, 9.65, MEZ, 'metalDark'),
    railing(-14.8, 9.5, -13.95, 9.65, MEZ, 'metalDark'),
    railing(17.2, 9.5, 18, 9.65, MEZ, 'metalDark'),
    railing(13.95, 9.5, 14.8, 9.65, MEZ, 'metalDark'),
    ...stairs({ start: [-16, 0, 13.1], dir: 'z-', steps: 10, rise: 0.32, run: 0.35, width: 2.4, mat: 'metal' }),
    ...stairs({ start: [16, 0, 13.1], dir: 'z-', steps: 10, rise: 0.32, run: 0.35, width: 2.4, mat: 'metal' }),
    pillar(-14, -5.8, 0.4, MEZ - 0.3, 'metalDark'),
    pillar(-14, 2, 0.4, MEZ - 0.3, 'metalDark'),
    pillar(-14, 9.4, 0.4, MEZ - 0.3, 'metalDark'),
    pillar(14, -5.8, 0.4, MEZ - 0.3, 'metalDark'),
    pillar(14, 2, 0.4, MEZ - 0.3, 'metalDark'),
    pillar(14, 9.4, 0.4, MEZ - 0.3, 'metalDark'),
    ...booth(-9.6, -9.4, 1, MEZ),
    ...booth(9.6, -9.4, -1, MEZ),
    block(4.4, -8, 2.4, 1.2, 0.8, 'marbleDark', { y0: MEZ, cover: 'low', noWalk: true }),
    block(-16.6, -2, 1.6, 1.2, 0.7, 'woodDark', { y0: MEZ, cover: 'low', noWalk: true }),
    block(16.6, 2, 1.6, 1.2, 0.7, 'woodDark', { y0: MEZ, cover: 'low', noWalk: true }),

    // --- Salón Índigo (este) ---
    ...wallZ(35.25, -26, 26.5, 0, LOW + 1.2, 'wallpaper'),
    ...wallX(-8.25, 18.5, 35, 0, LOW + 1.2, 'plasterDark', [{ at: 24, w: 2.4, to: 2.8 }]),
    ...wallX(26.25, 18.25, 35, 0, LOW + 1.2, 'plasterDark'),
    ...wallX(16.5, 18.5, 35, 0, LOW + 1.2, 'wallpaper', [{ at: 22, w: 2.4, to: 2.8 }]),
    ceiling(18.25, -8.5, 35.5, 26.5, LOW + 1.2, 'plasterDark'),
    block(32.6, 3, 1, 1.2, 7, 'woodDark', { cover: 'low', noWalk: true, tag: 'barIndigo' }),
    block(34.6, 3, 0.4, 2.4, 7, 'woodDark', { noWalk: true }),
    ...booth(21, 8, 1),
    ...booth(21, 2.8, 1),
    ...booth(28.8, 11, -1),
    ...booth(28.8, -3.6, -1),
    pillar(25.6, 5.6, 0.7, LOW + 1.2, 'marbleDark'),
    pillar(25.6, -1.6, 0.7, LOW + 1.2, 'marbleDark'),
    block(24.6, 13.4, 2.6, 1.2, 1.3, 'woodDark', { cover: 'low', noWalk: true, tag: 'pool' }),
    // Pasillo del sur, entre los aseos y el salón.
    block(28, 21, 2.4, 1.2, 0.9, 'woodDark', { cover: 'low', noWalk: true }),
    crate(33.4, 24),

    // --- Camerinos (bajo la sala de Vance) y bastidores ---
    ...wallZ(-12.25, -26, -12.5, 0, H, 'plasterDark', [{ at: -20, w: 2, to: 2.6 }]),
    ...wallX(-26.25, -12.5, 18.5, 0, H, 'plasterDark'),
    ...wallZ(18.25, -26, -12.5, 0, H, 'plasterDark', [{ at: -18.4, w: 2.6, to: 2.8 }]),
    ceiling(-12.5, -26.5, 18.5, -12.5, H, 'plasterDark'),
    ...wallZ(-2, -26, -17, 0, MEZ - 0.3, 'plaster', [{ at: -22, w: 1.8, to: 2.4 }], 0.3),
    ...wallX(-17, -8, 7, 0, MEZ - 0.3, 'plaster', [
      { at: -5, w: 1.8, to: 2.4 },
      { at: 3, w: 1.8, to: 2.4 },
    ], 0.3),
    block(-8.6, -24.6, 2.6, 1.2, 0.9, 'woodDark', { cover: 'low', noWalk: true }),
    block(3, -23.6, 3, 1.2, 0.9, 'woodDark', { cover: 'low', noWalk: true }),
    crate(12.6, -14.2),
    ...[11.6, 13.2, 14.8].map((x) => trim(x - 0.5, 0, -25.9, x + 0.5, 2.2, -25.4, 'velvet', true)),
    crate(15.8, -24.6),
    block(-10.4, -15, 1.2, 1.2, 2, 'metalDark', { cover: 'low', noWalk: true }),
    // --- Sala de Vance (3,2 m) ---
    deck(-8, -26, 10, -12.5, MEZ, 'carpetGreen', 0.3),
    ...wallZ(-8.1, -26, -12.5, MEZ, H, 'woodPanel', [], 0.3),
    ...wallZ(10.1, -26, -12.5, MEZ, H, 'woodPanel', [{ at: -22, w: 2.4, to: MEZ + 2.6 }], 0.3),
    block(1, -23.6, 3.4, 1.2, 1.3, 'woodDark', { y0: MEZ, cover: 'low', noWalk: true, tag: 'vanceDesk' }),
    ...booth(-6.6, -18.6, 1, MEZ),
    ...booth(8.4, -16.4, -1, MEZ),
    pillar(-3.4, -18.6, 0.7, H - MEZ, 'marbleDark', MEZ),
    pillar(5.4, -18.6, 0.7, H - MEZ, 'marbleDark', MEZ),
    // Bajada al muelle de carga.
    deck(10, -23.4, 11.6, -20.6, MEZ, 'metal', 0.3),
    ...stairs({ start: [15.1, 0, -22], dir: 'x-', steps: 10, rise: 0.32, run: 0.35, width: 2.4, mat: 'metal' }),
    railing(10.2, -23.55, 11.6, -23.4, MEZ, 'metalDark'),
    railing(10.2, -20.6, 11.6, -20.45, MEZ, 'metalDark'),

    // --- Patio trasero y escalera de incendios del VIP ---
    ...wallX(-36.25, -36, -12.5, 0, 6, 'brick'),
    ...wallZ(-12.25, -36, -26.5, 0, 6, 'brick'),
    deck(-18.4, -15.4, -13, -12.5, MEZ, 'metal', 0.2),
    ...stairs({ start: [-21.9, 0, -14], dir: 'x+', steps: 10, rise: 0.32, run: 0.35, width: 2.4, mat: 'metal' }),
    railing(-18.4, -15.55, -13, -15.4, MEZ, 'metalDark'),
    railing(-13.15, -15.4, -13, -12.5, MEZ, 'metalDark'),
    block(-24, -22, 2.6, 1.3, 1.6, 'metalDark', { cover: 'low', noWalk: true, tag: 'dumpster' }),
    crate(-18, -20),
    crate(-28, -28),
    crate(-23, -31),
    block(-33, -30, 2.6, 1.3, 1.6, 'metalDark', { cover: 'low', noWalk: true, tag: 'dumpster' }),
    block(-18, -31, 4.8, 2.3, 2.1, 'plaster', { cover: 'high', noWalk: true, tag: 'van' }),

    // --- Muelle de carga y calle trasera ---
    ...wallX(-26.25, 18.5, 35.5, 0, LOW + 1.2, 'concreteDark', [{ at: 29, w: 4.4, to: 3.8 }]),
    ceiling(18.25, -26.5, 35.5, -8.25, LOW + 1.2, 'concreteDark'),
    block(22, -13, 1.6, 1.2, 1.6, 'crate', { cover: 'low' }),
    block(23.8, -13, 1.4, 2.4, 1.6, 'crate', { cover: 'high', noWalk: true }),
    block(31.5, -14, 1.2, 2.4, 4, 'metalDark', { cover: 'high', noWalk: true, tag: 'rack' }),
    crate(27, -19),
    crate(21.4, -22.6),
    block(33.4, -22, 1.4, 1.2, 2.6, 'crate', { cover: 'low' }),
    ...wallZ(18.25, -36, -26.5, 0, 6, 'brick'),
    ...wallX(-36.25, 18, 36, 0, 6, 'brick'),
    crate(23, -30),
    block(33.6, -34, 2.2, 1.3, 1.4, 'metalDark', { cover: 'low', noWalk: true, tag: 'dumpster' }),
  ],
  ramps: [],
  decor: [
    { kind: 'sign', c: [0, 4.75, 27.2], w: 7, h: 1.4, rotY: 0, text: 'KAIROS', color: MAGENTA, font: 'sans', glow: 1.3 },
    { kind: 'sign', c: [0, 5.2, -5.85], w: 3, h: 0.7, rotY: 0, text: 'VIP', color: GOLD, font: 'serif' },
    { kind: 'sign', c: [17.95, 3.6, -2], w: 2.6, h: 0.6, rotY: -Math.PI / 2, text: 'ÍNDIGO', color: 0x7d8bff, font: 'sans' },
    { kind: 'sign', c: [6.9, 2.0, 20.6], w: 1.6, h: 0.3, rotY: -Math.PI / 2, text: 'ALARMA', color: 0xff3344, font: 'sans', bg: 0x1a1a1f },
    { kind: 'sign', c: [11.25, 3.1, 4], w: 5, h: 0.8, rotY: -Math.PI / 2, text: 'BAR', color: CYAN, font: 'sans' },
    { kind: 'sign', c: [29, 4.4, -25.95], w: 3, h: 0.5, rotY: 0, text: 'SALIDA', color: 0x3ddc84, font: 'sans' },
    { kind: 'sign', c: [15.9, 3.1, -12.0], w: 2.2, h: 0.4, rotY: 0, text: 'PERSONAL', color: 0xd8c8ff, font: 'sans' },
    { kind: 'sign', c: [-30.05, 3, -7], w: 2, h: 0.4, rotY: -Math.PI / 2, text: 'COCINA', color: 0xffd0a0, font: 'sans' },
    { kind: 'sign', c: [26.6, 4.2, 16.2], w: 5, h: 0.9, rotY: Math.PI, text: 'SALÓN ÍNDIGO', color: 0x7d8bff, font: 'serif' },
    { kind: 'neon', c: [0, 6.6, -11.9], s: [35, 0.07, 0.07], color: MAGENTA },
    { kind: 'neon', c: [0, 6.6, 17.9], s: [35, 0.07, 0.07], color: CYAN },
    { kind: 'neon', c: [-17.9, 6.6, 3], s: [0.07, 0.07, 29], color: CYAN },
    { kind: 'neon', c: [17.9, 6.6, 3], s: [0.07, 0.07, 29], color: MAGENTA },
    { kind: 'neon', c: [0, MEZ - 0.1, -5.92], s: [28, 0.06, 0.06], color: GOLD, intensity: 1.2 },
    { kind: 'neon', c: [-13.92, MEZ - 0.1, 1.8], s: [0.06, 0.06, 15.4], color: MAGENTA, intensity: 1.2 },
    { kind: 'neon', c: [13.92, MEZ - 0.1, 1.8], s: [0.06, 0.06, 15.4], color: CYAN, intensity: 1.2 },
    { kind: 'neon', c: [26.7, 5.2, 16.2], s: [16, 0.07, 0.07], color: 0x5a6bff },
    { kind: 'neon', c: [26.7, 5.2, -7.95], s: [16, 0.07, 0.07], color: 0x5a6bff },
    { kind: 'neon', c: [35, 5.2, 4], s: [0.07, 0.07, 24], color: 0x5a6bff },
    { kind: 'neon', c: [0, 5.75, 27.2], s: [34, 0.08, 0.08], color: CYAN },
    { kind: 'neon', c: [-35.4, 5.4, 4], s: [0.07, 0.07, 40], color: MAGENTA, intensity: 1 },
    ...djWall,
    ...tubes.map(([x, y, z, lx, lz]): DecorDef => ({ kind: 'neon', c: [x, y, z], s: [lx, 0.06, lz], color: 0xfff0dc, intensity: 1 })),
    ...lamps.map(([x, z, h, dx]) => lampGlow(x, z, h, dx, 0xffe0b0)),
    ...[-14.25, -9.75, 9.75, 14.25].map((x, i): DecorDef => ({ kind: 'neon', c: [x, 2.2, 27.08], s: [2.2, 0.07, 0.05], color: i % 2 ? CYAN : MAGENTA, intensity: 1.2 })),
    { kind: 'neon', c: [0, 3.48, 30.22], s: [10, 0.08, 0.06], color: MAGENTA },
    { kind: 'prop', prop: 'speaker', c: [-4.4, 0.32, -7.6], rotY: Math.PI },
    { kind: 'prop', prop: 'speaker', c: [4.4, 0.32, -7.6], rotY: Math.PI },
    { kind: 'prop', prop: 'barStools', c: [7.5, 0, 0.6], rotY: -Math.PI / 2 },
    { kind: 'prop', prop: 'barStools', c: [7.5, 0, 4.6], rotY: -Math.PI / 2 },
    { kind: 'prop', prop: 'barStools', c: [31.6, 0, 0.6], rotY: -Math.PI / 2 },
    { kind: 'prop', prop: 'plant', c: [-6.6, 1.38, 30], scale: 0.8 },
    { kind: 'prop', prop: 'plant', c: [6.6, 1.38, 30], scale: 0.8 },
    { kind: 'prop', prop: 'plant', c: [-6.4, 0, 19.2] },
    { kind: 'prop', prop: 'plant', c: [6.4, 0, 25.2] },
    { kind: 'prop', prop: 'plant', c: [19.2, 0, 15.6] },
    { kind: 'prop', prop: 'plant', c: [34.2, 0, -7.2] },
    { kind: 'prop', prop: 'plant', c: [-7, MEZ, -25] },
    { kind: 'prop', prop: 'lampDesk', c: [0, MEZ + 1.2, -23.6] },
    { kind: 'prop', prop: 'lampDesk', c: [-26, 1.2, 23.4] },
    ...cars.map(([x, z, rotY]): DecorDef => ({ kind: 'prop', prop: 'car', c: [x, 0, z], rotY })),
  ],
  spawn: { pos: [0, 0, 38], yaw: 0 },
  checkpoints: [
    { id: 'street', pos: [0, 0, 38], yaw: 0, radius: 2, label: 'Calle' },
    { id: 'floor', pos: [0, 0, 16], yaw: 0, radius: 2, label: 'Pista' },
    { id: 'office', pos: [-23, 0, 22], yaw: -Math.PI / 2, radius: 2, label: 'Despacho' },
    { id: 'vip', pos: [0, MEZ, -7.6], yaw: 0, radius: 2, label: 'VIP' },
    { id: 'dock', pos: [24, 0, -18], yaw: 0, radius: 2, label: 'Muelle de carga' },
  ],
  enemies: [
    // Calle, vestíbulo y callejón.
    { id: 'e-door', type: 'thug', pos: [0, 0.14, 28.4], yaw: Math.PI, group: 'door', patrol: [[-3, 0.14, 28.4], [3, 0.14, 28.4]] },
    { id: 'e-lobby', type: 'escort', pos: [-2.4, 0, 21], yaw: Math.PI, group: 'door' },
    { id: 'e-alley', type: 'thug', pos: [-32.6, 0, 14], yaw: Math.PI, group: 'alley', patrol: [[-32.6, 0, 14], [-32.6, 0, -8]] },
    // Alas.
    { id: 'e-cook', type: 'thug', pos: [-26, 0, -2], yaw: -Math.PI / 2, group: 'west', patrol: [[-26.6, 0, -2], [-20.4, 0, -2]] },
    { id: 'e-office', type: 'escort', pos: [-22.4, 0, 20], yaw: -Math.PI / 2, group: 'west' },
    { id: 'e-indigo', type: 'escort', pos: [26.6, 0, 8], yaw: Math.PI, group: 'east', patrol: [[26.4, 0, 9], [26.8, 0, -5]] },
    // Pista.
    { id: 'e-floor-a', type: 'thug', pos: [-9.4, 0, 14], yaw: 0, group: 'floor', patrol: [[-9.4, 0, 14.6], [9.4, 0, 14.6]] },
    { id: 'e-floor-b', type: 'thug', pos: [7.2, 0, -4], yaw: Math.PI / 2, group: 'floor', patrol: [[7, 0, -3.8], [13, 0, 6]] },
    { id: 'e-stage', type: 'escort', pos: [-11, 0, -8], yaw: Math.PI, group: 'floor', patrol: [[-11, 0, -8], [-15.6, 0, 6]] },
    { id: 'vip-a', type: 'escort', pos: [-6, MEZ, -8.4], yaw: Math.PI, guard: true, group: 'vip' },
    { id: 'vip-b', type: 'escort', pos: [7, MEZ, -7.4], yaw: Math.PI, guard: true, group: 'vip' },
    // Sala de Vance.
    { id: 'vance', type: 'heavy', pos: [1, MEZ, -21.4], yaw: Math.PI, guard: true, group: 'vance' },
    { id: 'v-guard', type: 'shield', pos: [3.4, MEZ, -15.4], yaw: Math.PI, guard: true, group: 'vip' },
    // Alarma: salen de los camerinos.
    { id: 'alarm-a', type: 'escort', pos: [-9.5, 0, -14.6], yaw: Math.PI, spawnOn: 'alarm' },
    { id: 'alarm-b', type: 'escort', pos: [14, 0, -16.4], yaw: Math.PI, spawnOn: 'alarm' },
    { id: 'alarm-c', type: 'thug', pos: [15.6, 0, -14.4], yaw: Math.PI, spawnOn: 'alarm' },
    // Con la lista en la mano: gente en las galerías.
    { id: 'g-west', type: 'escort', pos: [-16, MEZ, 4], yaw: Math.PI, group: 'vip', patrol: [[-15.4, MEZ, 6], [-15.4, MEZ, -4]], spawnOn: 'list' },
    { id: 'g-east', type: 'thug', pos: [16, MEZ, 4], yaw: Math.PI, group: 'vip', patrol: [[15.4, MEZ, 6], [15.4, MEZ, -4]], spawnOn: 'list' },
    { id: 'g-drone', type: 'drone', pos: [0, 0, 4], yaw: Math.PI, group: 'vip', patrol: [[-4, 0, 11], [5, 0, -2]], spawnOn: 'list' },
    // Huida: bastidores y muelle de carga.
    { id: 'r-a', type: 'thug', pos: [14, 0, -18.4], yaw: Math.PI / 2, spawnOn: 'reinforce' },
    { id: 'r-b', type: 'shield', pos: [22.4, 0, -18.4], yaw: Math.PI / 2, spawnOn: 'reinforce' },
    { id: 'r-c', type: 'escort', pos: [0, 0, 11], yaw: 0, spawnOn: 'reinforce' },
    { id: 'r-d', type: 'hound', pos: [28, 0, -12], yaw: Math.PI / 2, spawnOn: 'reinforce' },
    { id: 'k-a', type: 'escort', pos: [22, 0, -33], yaw: Math.PI, spawnOn: 'car' },
    { id: 'k-b', type: 'thug', pos: [24, 0, -5], yaw: 0, spawnOn: 'car' },
    { id: 'k-c', type: 'thug', pos: [34, 0, -29], yaw: Math.PI, spawnOn: 'car' },
    { id: 'k-d', type: 'heavy', pos: [13.6, 0, -18.4], yaw: -Math.PI / 2, spawnOn: 'car' },
  ],
  civilians: [
    { id: 'c1', pos: [-3, 0, 1], yaw: 0, behavior: 'dance' },
    { id: 'c2', pos: [0, 0, 3], yaw: 1, behavior: 'dance' },
    { id: 'c3', pos: [3, 0, 0], yaw: 2, behavior: 'dance' },
    { id: 'c4', pos: [-1, 0, 6], yaw: 3, behavior: 'dance' },
    { id: 'c5', pos: [2, 0, 5], yaw: 4, behavior: 'dance' },
    { id: 'c6', pos: [-4, 0, 4], yaw: 5, behavior: 'dance' },
    { id: 'c7', pos: [4, 0, 3], yaw: 0.5, behavior: 'dance' },
    { id: 'c8', pos: [1, 0, -1], yaw: 2.5, behavior: 'dance' },
    { id: 'c9', pos: [6.9, 0, 2], yaw: -Math.PI / 2, behavior: 'bar' },
    { id: 'c10', pos: [6.9, 0, 6.4], yaw: -Math.PI / 2, behavior: 'bar' },
    { id: 'c11', pos: [-9.6, 0, 6], yaw: Math.PI / 2, behavior: 'idle' },
    { id: 'c12', pos: [-3, 0, 11.4], yaw: Math.PI, behavior: 'idle' },
    { id: 'c13', pos: [31.2, 0, 1.4], yaw: -Math.PI / 2, behavior: 'bar' },
    { id: 'c14', pos: [23.6, 0, 10.4], yaw: Math.PI / 2, behavior: 'idle' },
  ],
  pickups: [
    { id: 'p-ammo-1', kind: 'ammo', pos: [13.2, 0, 23] },
    { id: 'p-med-1', kind: 'medkit', pos: [-20, 0, -11] },
    { id: 'p-armor-1', kind: 'armor', pos: [-28, 0, 16.6] },
    { id: 'p-ammo-2', kind: 'ammo', pos: [-13, MEZ, -11] },
    { id: 'p-med-2', kind: 'medkit', pos: [33.6, 0, 14.6] },
    { id: 'p-armor-2', kind: 'armor', pos: [8.6, MEZ, -24.6] },
    { id: 'p-ammo-3', kind: 'ammo', pos: [-5, 0, -20] },
    { id: 'p-med-3', kind: 'medkit', pos: [33.4, 0, -10] },
    { id: 'p-ammo-4', kind: 'ammo', pos: [-15, 0, -33.5] },
  ],
  interactables: [
    { id: 'alarm-panel', kind: 'alarmPanel', pos: [6.5, 0, 20.6], radius: 1.6, prompt: 'Desactivar la alarma', action: 'mission:alarm', hold: 2 },
    { id: 'guest-list', kind: 'objective', pos: [-26, 0, 22.4], radius: 2, prompt: 'Coger la lista de invitados', action: 'mission:list', hold: 1.5 },
  ],
  music: 'club',
  ambience: 'club',
  weather: 'rain',
  mission: {
    id: 'nightclub',
    alarm: true,
    objectives: [
      { id: 'enter', kind: 'reach', text: 'Entra en el club', at: [0, 0, 15.6], radius: 3, checkpoint: 'floor' },
      { id: 'list', kind: 'interact', text: 'Busca la lista de invitados en el despacho', targets: ['guest-list'], onComplete: 'list', checkpoint: 'office' },
      { id: 'vip', kind: 'reach', text: 'Vance está arriba: sube al VIP', at: [0, MEZ, -8.6], radius: 5, checkpoint: 'vip' },
      { id: 'vance', kind: 'eliminate', text: 'Elimina a Vance', group: 'vance' },
      { id: 'dock', kind: 'reach', text: 'Baja al muelle de carga', at: [24, 0, -18.4], radius: 4, onStart: 'reinforce', checkpoint: 'dock' },
      { id: 'car', kind: 'survive', text: 'Aguanta hasta que arranque el coche', at: [29, 0, -22], seconds: 30, onStart: 'car' },
      { id: 'exit', kind: 'reach', text: 'Sube al coche', at: [27, 0, -31.4], radius: 2.2 },
    ],
  },
};
