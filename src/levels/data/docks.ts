import { aabb, block, car, ceiling, deck, floor, lampGlow, lampPost, railing, ramp, roomShell, stairs, trim, wallX, wallZ } from '../helpers';
import type { BoxDef, DecorDef, LevelData, MaterialId } from '../types';

/**
 * CONTRATO 2 · MUELLE 9. Norte = −Z.
 * Portón (sur) → patio de contenedores con una ruta alta por el oeste y la aduana de dos plantas al este → bodega con
 * pasarelas (noroeste; se entra por dos portones, por la puerta de la pasarela del callejón oeste o por los lados) →
 * explanada de carga (noreste) → embarcadero.
 */
const CONTAINER_H = 2.6;
const CATWALK = 3.84;
const OFFICE = 3.2;
const ROOF = 10;
const YARD_WALL = 4;

/** Contenedor marítimo (6 × 2,6 × 2,4). `level` 1 = sobre otro; `rotY` de 90° lo pone a lo largo de Z. */
function container(x: number, z: number, mat: MaterialId, rotY = 0, level = 0, tag?: string): BoxDef {
  return { c: [x, CONTAINER_H / 2 + level * CONTAINER_H, z], s: [6, CONTAINER_H, 2.4], rotY, mat, cover: 'high', tag };
}

const NS = Math.PI / 2;

/** Palé con franja de peligro: lo que hay que volar. */
function cargo(x: number, z: number, tag: string, y0 = 0): BoxDef {
  return block(x, z, 1.6, 1.2, 1.6, 'hazard', { y0, cover: 'low', noWalk: true, tag });
}

function crate(x: number, z: number, y0 = 0): BoxDef {
  return block(x, z, 1.2, 1.2, 1.2, 'crate', { y0, cover: 'low' });
}

/** Barrera de hormigón. */
function barrier(x: number, z: number, rotY = 0): BoxDef {
  return { c: [x, 0.6, z], s: [3, 1.2, 0.5], rotY, mat: 'concrete', cover: 'low', noWalk: true };
}

/** Estantería de la bodega a lo largo de Z, con cajas que asoman. */
function rack(x: number, z0: number, z1: number): BoxDef[] {
  const out: BoxDef[] = [aabb(x - 0.6, 0, z0, x + 0.6, 4, z1, 'metalDark', { cover: 'high', noWalk: true, tag: 'rack' })];
  let k = 0;
  for (let z = z0 + 0.5; z + 2.2 < z1; z += 3.1, k++) {
    const mat: MaterialId = k % 3 === 1 ? 'woodDark' : 'crate';
    out.push(aabb(x - 0.68, 0.15, z, x + 0.68, 1.2 + (k % 2) * 0.2, z + 2.2, mat, { collide: false, shadow: false }));
    out.push(aabb(x - 0.68, 1.75, z + 0.3, x + 0.68, 2.7, z + 2.0, k % 2 ? 'crate' : 'steelBlue', { collide: false, shadow: false }));
    out.push(aabb(x - 0.68, 3.05, z, x + 0.68, 3.9, z + 1.6, 'crate', { collide: false, shadow: false }));
  }
  return out;
}

/** Vehículo: carrocería, ruedas y faros. */
const cars: Array<[number, number, number, MaterialId]> = [
  [-9, 29, 0.25, 'metalDark'],
  [12.5, 24.5, Math.PI / 2, 'steelBlue'],
  [20, 30, 0, 'metalDark'],
  [38, -25, Math.PI / 2, 'metalDark'],
];

/** Farolas del patio y de la explanada: [x, z, alto, hacia dónde da el brazo]. */
const lamps: ReadonlyArray<readonly [number, number, number, 1 | -1]> = [
  [-25.4, 13.5, 7.4, 1],
  [-3.4, 25, 7.8, 1],
  [21.2, 6.6, 7.4, -1],
  [-12.4, -10.2, 7, 1],
  [26.6, -27.6, 7, -1],
  [24.6, -50, 6, 1],
];

/** Costillas de chapa de la bodega, cerchas de su cubierta, marcos de los portones y pilares del cierre. */
const ribs: BoxDef[] = [
  ...[-37, -33.4, -20.6, -16.6, -12.6, -9, 0.6, 3.4].map((x) => trim(x - 0.18, 0, -16.25, x + 0.18, ROOF + 0.2, -16.02, 'steelBlue', true)),
  ...[-56, -52, -42, -38, -34, -30, -20].map((z) => trim(4.5, 0, z - 0.18, 4.72, ROOF + 0.2, z + 0.18, 'steelBlue', true)),
  ...[-56, -46, -42, -38, -28, -22].map((z) => trim(-38.72, 0, z - 0.18, -38.5, ROOF + 0.2, z + 0.18, 'steelBlue', true)),
  ...[-54, -46, -38, -30, -22].map((z) => trim(-38, 9.1, z - 0.15, 4, 9.5, z + 0.15, 'steelBlue')),
  ...[-30, -19, -8].map((x) => trim(x - 0.12, 9.5, -60, x + 0.12, 9.75, -16.8, 'steelBlue')),
  ...[-27, -3].flatMap((x) => [
    trim(x - 2.8, 0, -16.2, x - 2.5, 4.3, -15.98, 'hazard'),
    trim(x + 2.5, 0, -16.2, x + 2.8, 4.3, -15.98, 'hazard'),
    trim(x - 2.8, 4, -16.2, x + 2.8, 4.3, -15.98, 'hazard'),
  ]),
  ...[-40, -30, -20, -10, 0, 10, 20, 30, 40].map((x) => trim(x - 0.3, 0, 33.85, x + 0.3, YARD_WALL + 0.25, 34, 'concrete', true)),
  ...[30, 20, 10, 0, -10, -20, -30].flatMap((z) => [
    trim(-44, 0, z - 0.3, -43.85, YARD_WALL + 0.25, z + 0.3, 'concrete', true),
    trim(43.85, 0, z - 0.3, 44, YARD_WALL + 0.25, z + 0.3, 'concrete', true),
  ]),
];

/** Pintura del suelo (avenida, carriles, aparcamiento, pasos de la bodega), tablas y norays del embarcadero. */
const paint: BoxDef[] = [
  trim(-5.1, 0, -15.5, -4.95, 0.02, 6, 'containerYellow'),
  trim(4.95, 0, -15.5, 5.1, 0.02, 24, 'containerYellow'),
  trim(-5.1, 0, 19, -4.95, 0.02, 24, 'containerYellow'),
  ...[-34, -24].map((x) => trim(x - 0.06, 0, -12, x + 0.06, 0.02, 20, 'plaster')),
  ...[16, 19, 22, 25, 28].map((x) => trim(x - 0.06, 0, 27, x + 0.06, 0.02, 32.5, 'plaster')),
  ...[-12, -9, -6].map((x) => trim(x - 0.06, 0, 26, x + 0.06, 0.02, 32.5, 'plaster')),
  ...[-29.6, -24.4, -21.6, -16.4, -13.6, -8.4].map((x) => trim(x - 0.06, 0, -55, x + 0.06, 0.02, -20, 'containerYellow')),
  trim(-38, 0, -36.2, 3, 0.02, -36.05, 'containerYellow'),
  trim(-38, 0, -38.35, -1, 0.02, -38.2, 'containerYellow'),
  trim(6, 0, -38, 6.15, 0.02, -17, 'containerYellow'),
  trim(4.5, 0, -60.2, 44, 0.03, -49.6, 'woodDark'),
  ...[8, 16, 24, 32, 40].map((x) => trim(x - 0.22, 0, -60.1, x + 0.22, 0.6, -59.66, 'metalDark', true)),
];

export const docks: LevelData = {
  id: 'docks',
  name: 'Muelle 9',
  subtitle: 'Contrato 2',
  bounds: { min: [-46, -2, -79], max: [46, 14, 36] },
  killY: -10,
  ambient: {
    sky: 0x8fa8c8,
    ground: 0x2a2a2e,
    hemi: 1.1,
    ambientColor: 0xd0dcf0,
    ambient: 0.3,
    ibl: 0.4,
    background: 0x0d1118,
    fog: { color: 0x0d1118, near: 45, far: 160 },
    exposure: 1.0,
    skyline: { y: 0 },
  },
  key: { color: 0xbcd0ff, intensity: 1.8, dir: [-0.4, 1, 0.3], shadow: true, shadowArea: 40 },
  lights: [
    { pos: [-24.2, 7, 13.5], color: 0xffe0b0, intensity: 95, distance: 34 },
    { pos: [-2.2, 7.4, 25], color: 0xffe0b0, intensity: 90, distance: 32 },
    { pos: [20, 7, 6.6], color: 0xffe0b0, intensity: 90, distance: 32 },
    { pos: [-11.2, 6.6, -10.2], color: 0xffe0b0, intensity: 75, distance: 27 },
    { pos: [34, 5.4, -2], color: 0xfff0d0, intensity: 45, distance: 15 },
    { pos: [-26, 8, -28], color: 0xfff0d0, intensity: 90, distance: 32 },
    { pos: [-10, 8, -48], color: 0xfff0d0, intensity: 90, distance: 32 },
    { pos: [25.4, 6.6, -27.6], color: 0xffd0a0, intensity: 80, distance: 28 },
    { pos: [25.8, 5.6, -50], color: 0x9fd0ff, intensity: 70, distance: 26 },
    { pos: [11, 3.5, -56], color: 0xff3344, intensity: 30, distance: 12 },
  ],
  boxes: [
    // --- Suelos ---
    floor(-44.5, -16.25, 44.5, 34.5, 0, 'asphalt'),
    floor(-44.5, -60.5, 44.5, -16.25, 0, 'concrete'),

    ...paint,
    ...ribs,
    ...lamps.flatMap(([x, z, h, dx]) => lampPost(x, z, h, dx)),

    // --- Cierre del recinto ---
    ...wallX(34.25, -44.5, 44.5, 0, YARD_WALL, 'concreteDark'),
    ...wallZ(-44.25, -60.5, 34, 0, YARD_WALL, 'concreteDark'),
    ...wallZ(44.25, -60.5, 34, 0, YARD_WALL, 'concreteDark'),
    aabb(-44, 0, -60.5, -38.5, YARD_WALL, -60, 'concreteDark', { noWalk: true }),

    // --- Portón y aparcamiento ---
    ...roomShell({
      minX: 4.2,
      minZ: 26,
      maxX: 7.8,
      maxZ: 29.6,
      height: 2.8,
      thickness: 0.3,
      wallMat: 'steelBlue',
      ceilingMat: 'metalDark',
      doors: [
        { side: 'west', at: 27.8, width: 1.4, height: 2.2 },
        { side: 'north', at: 6, width: 1.6, height: 2.2 },
      ],
    }),
    ...cars.flatMap(([x, z, r, mat]) => car(x, z, r, mat)),
    barrier(-4, 22),
    barrier(3.4, 21, 0.2),
    barrier(-18, 25, 0.5),
    container(-40, 28, 'containerYellow', NS),
    container(-40, 28, 'containerRed', NS, 1),
    container(-31, 30.4, 'containerBlue', 0.06),
    container(-21, 30.6, 'containerGreen'),
    crate(-26, 27.4),
    crate(-16.4, 29.4),
    crate(30, 27),
    cargo(40, 25, 'cargo-2'),
    crate(36.5, 28.6),

    // --- Patio oeste: tres hileras; la ruta alta sube por el sur de la segunda y cruza a la primera ---
    container(-38, 15, 'containerBlue', NS),
    container(-38, 8.6, 'containerRed', NS, 0, 'highB'),
    container(-38, -1, 'containerGreen', NS),
    container(-38, -1, 'containerYellow', NS, 1),
    container(-38, -7.2, 'containerBlue', NS),
    container(-29, 16, 'containerGreen', NS, 0, 'rampBox'),
    container(-29, 9.9, 'containerYellow', NS, 0, 'highA'),
    container(-29, 0, 'containerRed', NS),
    container(-29, -6.2, 'containerBlue', NS),
    container(-29, -6.2, 'containerGreen', NS, 1, 'stackA'),
    deck(-30, 2.9, -28, 7, CONTAINER_H, 'metal', 0.18),
    deck(-36.9, 9, -30.1, 10.6, CONTAINER_H, 'metal', 0.18),
    crate(-29, 11.5, CONTAINER_H),
    crate(-38, 10.4, CONTAINER_H),
    container(-20, 18, 'containerRed', 0.12),
    container(-19.5, 9, 'containerBlue', NS),
    container(-19.5, 9, 'containerYellow', NS, 1),
    container(-20, -1, 'containerGreen', NS),
    container(-20, -9, 'containerYellow', 0.2),
    cargo(-35.5, -13.2, 'cargo-1'),
    crate(-33.6, 21),
    crate(-24.4, 4),
    crate(-24.6, -12),
    crate(-33.5, 3.6),

    // --- Avenida central: camión, grúa pórtico y barreras ---
    aabb(-8.6, 0, 6.5, -6, 3.4, 16, 'steelBlue', { cover: 'high', noWalk: true, tag: 'trailer' }),
    aabb(-8.5, 0, 16.3, -6.1, 2.7, 18.6, 'containerRed', { cover: 'high', noWalk: true, tag: 'truck' }),
    block(-13, 3, 1.2, 11, 1.2, 'containerYellow', { noWalk: true, tag: 'gantry' }),
    block(-13, -5, 1.2, 11, 1.2, 'containerYellow', { noWalk: true }),
    block(13, 3, 1.2, 11, 1.2, 'containerYellow', { noWalk: true }),
    block(13, -5, 1.2, 11, 1.2, 'containerYellow', { noWalk: true }),
    aabb(-13.4, 10.2, -5.6, -12.6, 11, 3.6, 'containerYellow', { collide: false }),
    aabb(12.6, 10.2, -5.6, 13.4, 11, 3.6, 'containerYellow', { collide: false }),
    aabb(-17, 11, -1.9, 17, 12.2, -0.1, 'containerYellow', { collide: false }),
    aabb(1.9, 8.7, -1.1, 2.1, 11, -0.9, 'metalDark', { collide: false }),
    { ...container(2, -1, 'containerGreen', 0.35), c: [2, 7.4, -1], noWalk: true, cover: undefined },
    barrier(-2, 9),
    barrier(4.4, 5, 0.4),
    barrier(-6.5, -2.5, 1.2),
    barrier(5.5, -9, 0.1),
    container(0, -12.6, 'containerRed', 0.5),
    crate(8.6, 1),
    crate(-1, -5.6),
    crate(-13.4, 20.4),

    // --- Patio este ---
    container(17, 19, 'containerBlue'),
    container(23.2, 19, 'containerRed'),
    container(33, 19, 'containerYellow'),
    container(33, 19, 'containerGreen', 0, 1, 'stackB'),
    container(17.4, 11.4, 'containerGreen'),
    container(17.4, 11.4, 'containerBlue', 0, 1),
    container(24, 11.6, 'containerYellow', -0.1),
    container(19, -11, 'containerRed', 0.15),
    container(10.5, -12.2, 'containerBlue'),
    crate(28.6, 15),
    crate(11.6, 15.4),
    crate(40, 14),
    crate(21.4, 2),
    crate(17.4, -4.4),

    // --- Aduana: dos plantas, con escalera por dentro y por el muro oeste ---
    floor(25.5, -10.5, 42.5, 8.5, 0.02, 'tilesBlack', 0.1),
    ...wallX(8.25, 25.5, 42.5, 0, OFFICE, 'plaster', [{ at: 33, w: 2, to: 2.5 }]),
    ...wallX(8.25, 25.5, 42.5, OFFICE, 6.6, 'plaster', [
      { at: 31, w: 4, from: 4.3, to: 5.7 },
      { at: 38, w: 3, from: 4.3, to: 5.7 },
    ]),
    ...wallX(-10.25, 25.5, 42.5, 0, OFFICE, 'plaster', [{ at: 31, w: 2, to: 2.5 }]),
    ...wallX(-10.25, 25.5, 42.5, OFFICE, 6.6, 'plaster', [{ at: 35, w: 4, from: 4.3, to: 5.7 }]),
    ...wallZ(25.75, -10, 8, 0, OFFICE - 0.02, 'plaster', [{ at: 4.5, w: 2, to: 2.5 }]),
    ...wallZ(25.75, -10, 8, OFFICE - 0.02, 6.6, 'plaster', [
      { at: -8, w: 1.8, to: 5.6 },
      { at: -2, w: 4, from: 4.3, to: 5.7 },
      { at: 4.5, w: 3, from: 4.3, to: 5.7 },
    ]),
    ...wallZ(42.25, -10, 8, 0, 6.6, 'plaster'),
    ceiling(25.5, -10.5, 42.5, 8.5, 6.6, 'concreteDark'),
    deck(25.51, -10, 38.9, 8, OFFICE, 'woodPanel'),
    deck(38.9, -10, 42, 0.5, OFFICE, 'woodPanel'),
    deck(38.9, 4.6, 42, 8, OFFICE, 'woodPanel'),
    ...stairs({ start: [40.6, 0, 4], dir: 'z-', steps: 10, rise: 0.32, run: 0.35, width: 2.2, mat: 'metal' }),
    railing(38.8, 0.5, 38.95, 4.6, OFFICE, 'metalDark'),
    railing(38.95, 4.6, 42, 4.75, OFFICE, 'metalDark'),
    ...stairs({ start: [24.6, 0, -1.6], dir: 'z-', steps: 10, rise: 0.32, run: 0.35, width: 1.8, mat: 'metal' }),
    deck(23.7, -10, 25.5, -5.1, OFFICE, 'metal', 0.2),
    railing(23.55, -10, 23.7, -1.6, OFFICE, 'metalDark'),
    railing(23.55, -10.15, 25.5, -10, OFFICE, 'metalDark'),
    block(30, 2, 1, 1.2, 5, 'woodDark', { cover: 'low', noWalk: true, tag: 'counter' }),
    block(35, -4.6, 3, 1.2, 0.9, 'woodDark', { cover: 'low', noWalk: true }),
    block(33.5, 3, 0.6, 2.3, 3.4, 'metalDark', { cover: 'high', noWalk: true }),
    block(29.5, -6, 1.2, 1.2, 2.4, 'woodDark', { cover: 'low', noWalk: true }),
    block(35, -9, 3.4, 1.2, 1, 'woodDark', { y0: OFFICE, cover: 'low', noWalk: true, tag: 'radio' }),
    // La radio, sobre la mesa.
    trim(34.5, OFFICE + 1.2, -9.3, 35.5, OFFICE + 1.6, -8.8, 'metalDark', true),
    trim(35.35, OFFICE + 1.6, -9.1, 35.4, OFFICE + 2.5, -9.05, 'metal'),
    block(30, -2.6, 2.4, 1.2, 1, 'woodDark', { y0: OFFICE, cover: 'low', noWalk: true }),
    block(34.5, 3.4, 2.4, 1.2, 1, 'woodDark', { y0: OFFICE, cover: 'low', noWalk: true }),
    block(29, 6, 0.5, 2.2, 2.4, 'metalDark', { y0: OFFICE, cover: 'high', noWalk: true }),

    // Cornisa, zócalo y antepechos de la aduana.
    trim(25.3, 6.45, -10.7, 42.7, 6.95, 8.7, 'concrete', true),
    trim(25.42, 0, 8.4, 32, 0.5, 8.56, 'concreteDark'),
    trim(34, 0, 8.4, 42.5, 0.5, 8.56, 'concreteDark'),
    trim(25.36, 0, -10.5, 25.5, 0.5, 3.4, 'concreteDark'),
    trim(25.36, 0, 5.6, 25.5, 0.5, 8.56, 'concreteDark'),
    trim(25.36, 3.1, -5, 25.5, 3.3, 8.56, 'steelBlue'),
    trim(25.42, 3.1, 8.4, 42.5, 3.3, 8.56, 'steelBlue'),

    // --- Cierre norte del patio: callejón oeste, fachada de la bodega y verja de la explanada ---
    ...wallX(-16.25, 4.5, 44, 0, YARD_WALL, 'concreteDark', [
      { at: 13, w: 5, to: YARD_WALL },
      { at: 34, w: 5, to: YARD_WALL },
    ]),

    // --- Callejón oeste con la escalera a la pasarela ---
    ...stairs({ start: [-41.4, 0, -27], dir: 'z-', steps: 12, rise: 0.32, run: 0.35, width: 2, mat: 'metal' }),
    deck(-42.4, -35, -38.5, -31.2, CATWALK, 'metal', 0.2),
    railing(-42.55, -35, -42.4, -31.2, CATWALK, 'metalDark'),
    railing(-42.55, -35.15, -38.5, -35, CATWALK, 'metalDark'),
    railing(-40.4, -31.2, -38.5, -31.05, CATWALK, 'metalDark'),
    crate(-39.6, -21),
    crate(-43, -42),
    block(-39.7, -46, 1.4, 1.2, 2.4, 'metalDark', { cover: 'low', noWalk: true }),

    // --- Bodega ---
    ...wallX(-16.5, -38.5, 4.5, 0, ROOF, 'concreteDark', [
      { at: -27, w: 5, to: 4 },
      { at: -3, w: 5, to: 4 },
    ]),
    ...wallX(-60.25, -38.5, 4.5, 0, ROOF, 'concreteDark'),
    ...wallZ(-38.25, -60, -16.75, 0, ROOF, 'concreteDark', [
      { at: -33, w: 1.8, from: CATWALK - 0.02, to: 6.2 },
      { at: -50, w: 2, to: 2.8 },
    ]),
    ...wallZ(4.25, -60, -16.75, 0, ROOF, 'concreteDark', [
      { at: -24, w: 3, to: 3 },
      { at: -48, w: 4, to: 3.6 },
    ]),
    ceiling(-38.5, -60.5, 4.5, -16.25, ROOF, 'metalDark'),
    ...rack(-31, -33.5, -21),
    ...rack(-31, -53, -41),
    ...rack(-23, -33.5, -21),
    ...rack(-23, -53, -41),
    ...rack(-15, -33.5, -21),
    ...rack(-15, -53, -41),
    ...rack(-7, -33.5, -24),
    ...rack(-7, -53, -41),
    crate(-27, -30),
    crate(-19, -26),
    crate(-11, -31),
    crate(-27, -44),
    crate(-11, -47),
    crate(-1, -31),
    crate(-2, -43),
    crate(-35, -46),
    block(0.6, -21, 2, 1.2, 3.2, 'containerYellow', { cover: 'low', noWalk: true, tag: 'forklift' }),
    cargo(-19, -50, 'cargo-3'),
    cargo(-36.6, -58.6, 'cargo-4', CATWALK),
    // Pasarelas: norte, oeste y un puente que cruza la nave.
    deck(-38, -60, -1.6, -56.5, CATWALK, 'metal', 0.2),
    deck(-38, -56.5, -34.8, -30, CATWALK, 'metal', 0.2),
    deck(-38.49, -33.9, -38, -32.1, CATWALK, 'metal', 0.2),
    deck(-34.8, -38.4, -1, -36, CATWALK, 'metal', 0.2),
    railing(-34.8, -56.5, -1.6, -56.35, CATWALK, 'metalDark'),
    railing(-34.95, -56.35, -34.8, -38.4, CATWALK, 'metalDark'),
    railing(-34.95, -36, -34.8, -30, CATWALK, 'metalDark'),
    railing(-38, -30, -34.8, -29.85, CATWALK, 'metalDark'),
    railing(-34.8, -38.55, -1, -38.4, CATWALK, 'metalDark'),
    railing(-34.8, -36, -1, -35.85, CATWALK, 'metalDark'),
    ...stairs({ start: [3.2, 0, -37.2], dir: 'x-', steps: 12, rise: 0.32, run: 0.35, width: 2.2, mat: 'metal' }),
    ...stairs({ start: [2.6, 0, -58.2], dir: 'x-', steps: 12, rise: 0.32, run: 0.35, width: 2.4, mat: 'metal' }),
    crate(-20, -58.8, CATWALK),
    crate(-36.8, -46, CATWALK),

    // --- Explanada de carga ---
    ...wallX(-38.25, 4.5, 44, 0, 3, 'concreteDark', [
      { at: 14, w: 5, to: 3 },
      { at: 34, w: 5, to: 3 },
    ]),
    block(40, -33, 4.4, 7, 4.4, 'steelBlue', { noWalk: true, tag: 'silo' }),
    container(14.5, -27, 'containerRed', NS),
    container(22, -33, 'containerYellow', 0.1),
    container(24, -24, 'containerBlue'),
    container(24, -24, 'containerGreen', 0, 1),
    container(33, -29, 'containerGreen', NS),
    barrier(9.5, -21, 0.3),
    barrier(18.8, -20.6),
    barrier(30, -20.5, -0.2),
    crate(9, -33),
    crate(18.6, -30),
    crate(28, -35),

    // --- Embarcadero ---
    railing(4.5, -60.5, 44.5, -60.2, 0, 'metalDark', 1.05),
    container(27, -46, 'containerBlue', 0.1),
    container(33.2, -46.4, 'containerRed', 0),
    container(20, -55, 'containerYellow', NS),
    ...roomShell({
      minX: 36,
      minZ: -58.5,
      maxX: 42.5,
      maxZ: -52.5,
      height: 3,
      thickness: 0.3,
      wallMat: 'woodDark',
      ceilingMat: 'metalDark',
      doors: [
        { side: 'west', at: -55.5, width: 1.8, height: 2.4 },
        { side: 'south', at: 39, width: 1.8, height: 2.4 },
      ],
    }),
    crate(11, -44),
    crate(16.4, -49),
    crate(29.4, -54),
    crate(40, -42),
    barrier(9.4, -51, 1.4),
    barrier(24.4, -51.2, 0.2),
    barrier(32, -57.2),
    // Agua, carguero y lancha.
    aabb(-46, -0.7, -79, 46, -0.15, -60.5, 'water', { collide: false, shadow: false }),
    aabb(17, -1, -76, 45, 4.6, -63.5, 'steelBlue', { noWalk: true, tag: 'ship' }),
    aabb(17.2, 4.6, -63.9, 45, 5.5, -63.6, 'plaster', { collide: false }),
    aabb(37, 4.6, -75, 44, 10, -66, 'plaster', { collide: false }),
    { ...container(22, -69, 'containerRed'), c: [22, 5.9, -69], collide: false },
    { ...container(28.4, -69, 'containerGreen'), c: [28.4, 5.9, -69], collide: false },
    { ...container(22, -72, 'containerYellow'), c: [22, 5.9, -72], collide: false },
    { ...container(28.4, -72, 'containerBlue'), c: [28.4, 8.5, -69], collide: false },
    aabb(8, -0.5, -63.6, 14, 0.75, -61, 'metalDark', { collide: false, tag: 'boat' }),
    aabb(8.8, 0.75, -63.1, 10.8, 1.7, -61.5, 'plaster', { collide: false }),
  ],
  ramps: [ramp([-29, 0, 24.6], [-29, CONTAINER_H, 19], 2.2, 'metal'), ramp([-23.4, 0, 0], [-27.8, CONTAINER_H, 0], 2, 'metal')],
  decor: [
    { kind: 'sign', c: [0, 3.2, 33.95], w: 9, h: 1.1, rotY: Math.PI, text: 'MUELLE 9', sub: 'zona portuaria · acceso restringido', color: 0xff3344, font: 'sans' },
    { kind: 'sign', c: [-15, 6.6, -15.97], w: 8, h: 1.2, rotY: 0, text: 'BODEGA 4', color: 0xffd23f, font: 'sans' },
    { kind: 'sign', c: [34, 5.1, 8.55], w: 1, h: 0.4, rotY: 0, text: 'ADUANA', color: 0x19e3ff, font: 'sans' },
    { kind: 'sign', c: [25.45, 5.2, 1.5], w: 2.6, h: 0.6, rotY: -Math.PI / 2, text: 'ADUANA', color: 0x19e3ff, font: 'sans' },
    { kind: 'sign', c: [24, 2.4, -38], w: 4, h: 0.6, rotY: 0, text: 'EMBARCADERO', color: 0x19e3ff, font: 'sans' },
    { kind: 'sign', c: [-38.5, 6.7, -33], w: 2, h: 0.4, rotY: -Math.PI / 2, text: 'PASARELA', color: 0xffd23f, font: 'sans' },
    { kind: 'sign', c: [31, 2.2, -63.45], w: 8, h: 1, rotY: 0, text: 'MV HALCYON', color: 0xe8ecf4, font: 'sans' },
    ...lamps.map(([x, z, h, dx]) => lampGlow(x, z, h, dx, z < -40 ? 0xbfe0ff : 0xffe8c8)),
    ...[-28, -20, -12, -4].flatMap((x): DecorDef[] => [-28, -48].map((z) => ({ kind: 'neon', c: [x, 9.02, z], s: [2.4, 0.06, 0.2], color: 0xfff0d0, intensity: 1 }))),
    { kind: 'neon', c: [30, OFFICE - 0.38, -1], s: [4, 0.05, 0.18], color: 0xfff0d0, intensity: 1 },
    { kind: 'neon', c: [34, 6.56, -2], s: [6, 0.05, 0.2], color: 0xfff0d0, intensity: 1 },
    { kind: 'neon', c: [0, 3.8, 33.9], s: [86, 0.07, 0.07], color: 0xff3344 },
    { kind: 'neon', c: [-17, 9.6, -16.2], s: [42, 0.07, 0.07], color: 0xffd23f, intensity: 1.2 },
    { kind: 'neon', c: [4.55, 4.2, -48], s: [0.07, 0.07, 4], color: 0xffd23f, intensity: 1.2 },
    { kind: 'neon', c: [31, 4.4, -63.45], s: [27, 0.06, 0.06], color: 0x19e3ff, intensity: 1.2 },
    { kind: 'prop', prop: 'crane', c: [-30, 0, -70], rotY: 0.4 },
    { kind: 'prop', prop: 'crane', c: [43, 0, -62], rotY: 2.6 },
    { kind: 'prop', prop: 'lampDesk', c: [36.2, OFFICE + 1.2, -9] },
    { kind: 'neon', c: [34.8, OFFICE + 1.45, -8.78], s: [0.3, 0.06, 0.03], color: 0x3ddc84 },
    ...cars.map(([x, z, rotY]): DecorDef => ({ kind: 'prop', prop: 'car', c: [x, 0, z], rotY })),
  ],
  spawn: { pos: [0, 0, 31], yaw: 0 },
  checkpoints: [
    { id: 'gate', pos: [0, 0, 31], yaw: 0, radius: 2, label: 'Portón' },
    { id: 'yard', pos: [9, 0, 8], yaw: 0, radius: 2, label: 'Patio' },
    { id: 'customs', pos: [33, 0, 10.5], yaw: 0, radius: 2, label: 'Aduana' },
    { id: 'warehouse', pos: [-3, 0, -19], yaw: 0, radius: 2, label: 'Bodega' },
    { id: 'pier', pos: [14, 0, -41], yaw: 0, radius: 2, label: 'Embarcadero' },
  ],
  enemies: [
    // Patio.
    { id: 'y-gate', type: 'thug', pos: [1, 0, 13], yaw: Math.PI, group: 'yard', patrol: [[1, 0, 13], [-4, 0, 4]] },
    { id: 'y-thug-a', type: 'thug', pos: [-13.5, 0, 13], yaw: Math.PI, group: 'yard', patrol: [[-13.5, 0, 13], [-16, 0, -6]] },
    { id: 'y-thug-b', type: 'thug', pos: [-33.6, 0, 12], yaw: Math.PI, group: 'yard', patrol: [[-33.6, 0, 12], [-33.6, 0, -10]] },
    { id: 'y-hound', type: 'hound', pos: [-42, 0, 6], yaw: 0, group: 'yard', patrol: [[-42, 0, 14], [-42, 0, -12]] },
    { id: 'y-escort', type: 'escort', pos: [14, 0, 15.4], yaw: Math.PI, group: 'yard', patrol: [[13.6, 0, 15.2], [38, 0, 15.2]] },
    { id: 'm-stack', type: 'marksman', pos: [-29, CONTAINER_H * 2, -6], yaw: Math.PI, stationary: true, group: 'yard' },
    { id: 'm-stackB', type: 'marksman', pos: [33, CONTAINER_H * 2, 19], yaw: Math.PI * 0.75, stationary: true, group: 'yard' },
    // Aduana.
    { id: 'c-escort', type: 'escort', pos: [28, 0, 1], yaw: Math.PI / 2, group: 'customs', patrol: [[28, 0, 2], [28, 0, -8]] },
    { id: 'c-shield', type: 'shield', pos: [36, 0, -1], yaw: Math.PI, guard: true, group: 'customs' },
    { id: 'c-thug', type: 'thug', pos: [32, OFFICE, 1], yaw: Math.PI / 2, guard: true, group: 'customs' },
    { id: 'c-radio', type: 'escort', pos: [37, OFFICE, -6], yaw: Math.PI, guard: true, group: 'customs' },
    // Bodega: llegan mientras el jugador está en la aduana.
    { id: 'w-heavy', type: 'heavy', pos: [-19, 0, -38], yaw: Math.PI, group: 'warehouse', spawnOn: 'warehouse' },
    { id: 'w-shield', type: 'shield', pos: [-1, 0, -46], yaw: Math.PI, group: 'warehouse', spawnOn: 'warehouse' },
    { id: 'w-escort-a', type: 'escort', pos: [-27, 0, -50], yaw: Math.PI, group: 'warehouse', patrol: [[-27, 0, -50], [-27, 0, -20]], spawnOn: 'warehouse' },
    { id: 'w-escort-b', type: 'escort', pos: [-2, 0, -28], yaw: Math.PI, group: 'warehouse', patrol: [[-2, 0, -27], [-11, 0, -38]], spawnOn: 'warehouse' },
    { id: 'w-thug', type: 'thug', pos: [-11, 0, -54.5], yaw: Math.PI, group: 'warehouse', patrol: [[-11, 0, -54.5], [-35.5, 0, -54.5]], spawnOn: 'warehouse' },
    { id: 'w-hound', type: 'hound', pos: [-35, 0, -24], yaw: Math.PI, group: 'warehouse', patrol: [[-35, 0, -24], [-35, 0, -38]], spawnOn: 'warehouse' },
    { id: 'm-catwalk', type: 'marksman', pos: [-12, CATWALK, -58], yaw: Math.PI, stationary: true, group: 'warehouse', spawnOn: 'warehouse' },
    // Explanada y embarcadero.
    { id: 'a-thug-a', type: 'thug', pos: [10, 0, -36], yaw: Math.PI / 2, spawnOn: 'apron' },
    { id: 'a-thug-b', type: 'thug', pos: [28, 0, -40.5], yaw: Math.PI / 2, spawnOn: 'apron' },
    { id: 'a-escort', type: 'escort', pos: [20, 0, -40.5], yaw: Math.PI / 2, spawnOn: 'apron' },
    { id: 'a-drone', type: 'drone', pos: [18, 0, -44], yaw: Math.PI / 2, spawnOn: 'apron' },
    { id: 'b-escort-a', type: 'escort', pos: [39, 0, -35.9], yaw: 0, spawnOn: 'boat' },
    { id: 'b-escort-b', type: 'escort', pos: [1, 0, -51], yaw: -Math.PI / 2, spawnOn: 'boat' },
    { id: 'b-shield', type: 'shield', pos: [34, 0, -35], yaw: 0, spawnOn: 'boat' },
    { id: 'b-thug', type: 'thug', pos: [39, 0, -55.5], yaw: Math.PI / 2, spawnOn: 'boat' },
    { id: 'f-heavy', type: 'heavy', pos: [16.5, 0, -33.5], yaw: 0, spawnOn: 'boat-2' },
    { id: 'f-drone', type: 'drone', pos: [34, 0, -34], yaw: 0, spawnOn: 'boat-2' },
    { id: 'f-thug-a', type: 'thug', pos: [0, 0, -47], yaw: -Math.PI / 2, spawnOn: 'boat-2' },
    { id: 'f-hound', type: 'hound', pos: [12, 0, -34], yaw: 0, spawnOn: 'boat-2' },
  ],
  civilians: [],
  pickups: [
    { id: 'p-ammo-1', kind: 'ammo', pos: [-13, 0, 24] },
    { id: 'p-armor-1', kind: 'armor', pos: [-29, CONTAINER_H, 16] },
    { id: 'p-med-1', kind: 'medkit', pos: [-41.6, 0, -13] },
    { id: 'p-ammo-2', kind: 'ammo', pos: [41, 0, 10.6] },
    { id: 'p-med-2', kind: 'medkit', pos: [40.6, OFFICE, 6.6] },
    { id: 'p-ammo-3', kind: 'ammo', pos: [2.4, 0, -33] },
    { id: 'p-armor-2', kind: 'armor', pos: [-32, CATWALK, -37.2] },
    { id: 'p-med-3', kind: 'medkit', pos: [42.6, 0, -18.6] },
    { id: 'p-ammo-4', kind: 'ammo', pos: [7, 0, -42] },
    { id: 'p-med-4', kind: 'medkit', pos: [41, 0, -57] },
  ],
  interactables: [
    { id: 'cargo-1', kind: 'objective', pos: [-35.5, 0, -13.2], radius: 2.2, prompt: 'Colocar carga explosiva', action: 'mission:cargo', hold: 2.5 },
    { id: 'cargo-2', kind: 'objective', pos: [40, 0, 25], radius: 2.2, prompt: 'Colocar carga explosiva', action: 'mission:cargo', hold: 2.5 },
    { id: 'radio', kind: 'terminal', pos: [35, OFFICE, -8.4], radius: 2, prompt: 'Cortar la radio', action: 'mission:radio', hold: 2 },
    { id: 'cargo-3', kind: 'objective', pos: [-19, 0, -50], radius: 2.2, prompt: 'Colocar carga explosiva', action: 'mission:cargo', hold: 2.5 },
    { id: 'cargo-4', kind: 'objective', pos: [-36.6, CATWALK, -58.6], radius: 2.2, prompt: 'Colocar carga explosiva', action: 'mission:cargo', hold: 2.5 },
  ],
  music: 'docks',
  ambience: 'harbor',
  weather: 'rain',
  mission: {
    id: 'docks',
    objectives: [
      { id: 'yard', kind: 'interact', text: 'Destruye los cargamentos del patio', targets: ['cargo-1', 'cargo-2'], checkpoint: 'yard' },
      { id: 'radio', kind: 'interact', text: 'Corta la radio de la aduana', targets: ['radio'], onComplete: 'warehouse', checkpoint: 'customs' },
      { id: 'warehouse', kind: 'interact', text: 'Destruye los cargamentos de la bodega', targets: ['cargo-3', 'cargo-4'], checkpoint: 'warehouse' },
      { id: 'pier', kind: 'reach', text: 'Cruza al embarcadero', at: [14, 0, -42], radius: 4, onStart: 'apron', checkpoint: 'pier' },
      { id: 'hold', kind: 'survive', text: 'Aguanta hasta que llegue el bote', at: [14, 0, -50], seconds: 30, onStart: 'boat' },
      { id: 'hold-2', kind: 'survive', text: 'El bote está cerca: aguanta', at: [14, 0, -50], seconds: 25, onStart: 'boat-2' },
      { id: 'boat', kind: 'reach', text: 'Sube al bote', at: [11, 0, -57.6], radius: 2.5 },
    ],
  },
};
