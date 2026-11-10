import { aabb, block, pillar, railing, ramp, roomShell } from '../helpers';
import type { LevelData } from '../types';

/**
 * CAMPO DE PRÁCTICA (sótano del Continental). Tutorial + tiro libre + simulacro de combate.
 * Norte = −Z. Recibidor al sur, circuito del tutorial al centro, carriles al oeste,
 * patio de combate al noreste con plataforma de tirador.
 */
const H = 6;

export const practice: LevelData = {
  id: 'practice',
  name: 'Campo de práctica',
  subtitle: 'Sótano del Continental',
  bounds: { min: [-19, -2, -37], max: [19, H + 1, 15] },
  killY: -10,
  ambient: {
    sky: 0xd2dcf0,
    ground: 0x564a3e,
    hemi: 1.35,
    ambientColor: 0xfff3e0,
    ambient: 0.3,
    ibl: 0.45,
    background: 0x15181f,
    fog: { color: 0x15181f, near: 40, far: 120 },
    exposure: 1.05,
  },
  key: { color: 0xffeedd, intensity: 2.4, dir: [0.35, 1, 0.45], shadow: true, shadowArea: 32 },
  lights: [
    { pos: [0, 4.5, 9], color: 0xffd9a0, intensity: 45, distance: 16 },
    { pos: [0, 4.5, -3], color: 0xffe4b8, intensity: 40, distance: 16 },
    { pos: [-14, 4.5, -18], color: 0x19e3ff, intensity: 50, distance: 20 },
    { pos: [6, 4.5, -18], color: 0xffe0b0, intensity: 55, distance: 20 },
    { pos: [6, 4.5, -30], color: 0xff2e88, intensity: 50, distance: 20 },
    { pos: [15, 4.5, -33], color: 0xffd0a0, intensity: 35, distance: 12 },
  ],
  boxes: [
    ...roomShell({ minX: -18, minZ: -36, maxX: 18, maxZ: 14, height: H, thickness: 0.5, wallMat: 'plaster', floorMat: 'concrete', ceilingMat: 'concreteDark' }),

    // --- Recibidor ---
    block(5.5, 10, 3, 1.0, 1.2, 'woodDark', { cover: 'low', tag: 'weaponTable' }),
    block(-6, 12.6, 4, 2.4, 1.4, 'brick', { tag: 'lockers' }),

    // --- Circuito del tutorial ---
    block(0, -1, 1.6, 0.9, 0.8, 'crate', { cover: 'low', tag: 'vaultBox' }),
    block(-4, -5, 3, 1.1, 0.5, 'concrete', { cover: 'low', tag: 'barricade' }),
    block(4, -5, 3, 2.2, 0.5, 'plaster', { cover: 'high', tag: 'tallWall' }),

    // --- Carriles de tiro (oeste) ---
    aabb(-18, 0, -8.3, -10, 1.0, -7.7, 'woodDark', { cover: 'low', tag: 'shootingBench' }),
    aabb(-15.45, 0, -36, -15.15, 1.0, -8.3, 'concreteDark', { noWalk: true }),
    aabb(-12.75, 0, -36, -12.45, 1.0, -8.3, 'concreteDark', { noWalk: true }),
    aabb(-10.15, 0, -36, -9.85, 1.4, -8.3, 'concreteDark', { noWalk: true }),
    ...[-16, -24, -32].flatMap((z, i) => [
      block(-16.6, z, 0.9, 1.3, 0.08, 'targetBoard', { y0: 0.35 + i * 0.1, tag: `target:${i}:0` }),
      block(-13.95, z, 0.9, 1.3, 0.08, 'targetBoard', { y0: 0.35 + i * 0.1, tag: `target:${i}:1` }),
      block(-11.3, z, 0.9, 1.3, 0.08, 'targetBoard', { y0: 0.35 + i * 0.1, tag: `target:${i}:2` }),
    ]),

    // --- Patio de combate (noreste) ---
    block(-2, -14, 1.4, 1.2, 1.4, 'crate', { cover: 'low' }),
    block(6, -15, 1.4, 1.2, 1.4, 'crate', { cover: 'low' }),
    block(12, -13, 1.4, 1.2, 1.4, 'crate', { cover: 'low' }),
    block(2, -21, 2.4, 1.1, 0.6, 'concrete', { cover: 'low' }),
    block(10, -22, 0.6, 1.1, 2.4, 'concrete', { cover: 'low' }),
    block(-4, -24, 1.4, 1.2, 1.4, 'crate', { cover: 'low' }),
    block(15, -26, 1.4, 1.2, 1.4, 'crate', { cover: 'low' }),
    pillar(4, -18, 1, H, 'concreteDark'),
    pillar(14, -19, 1, H, 'concreteDark'),
    pillar(-2, -30, 1, H, 'concreteDark'),
    pillar(8, -30, 1, H, 'concreteDark'),
    block(3, -27, 6, 2.6, 2.4, 'containerRed', { cover: 'high', tag: 'container' }),
    // Plataforma del tirador (1,8 m) con rampa y barandillas.
    aabb(10, 0, -36, 18, 1.8, -31, 'metalDark', { tag: 'perch' }),
    railing(10, -31.3, 12.8, -31, 1.8, 'metal'),
    railing(15.2, -31.3, 18, -31, 1.8, 'metal'),
  ],
  ramps: [ramp([14, 0, -26], [14, 1.8, -31], 2.4, 'metal')],
  decor: [
    { kind: 'sign', c: [0, 4.4, 13.7], w: 7, h: 1.2, rotY: Math.PI, text: 'CAMPO DE PRÁCTICA', sub: 'aquí sí se dispara', color: 0xd4af37, font: 'serif' },
    { kind: 'sign', c: [-14, 3.4, -7.9], w: 7.5, h: 0.9, rotY: 0, text: 'LÍNEA DE TIRO', color: 0x19e3ff, font: 'sans', bg: 0x101318 },
    { kind: 'sign', c: [4, 4.6, -35.7], w: 9, h: 1.1, rotY: 0, text: 'SIMULACRO DE COMBATE', color: 0xff2e88, font: 'sans' },
    { kind: 'neon', c: [0, 5.6, 13.7], s: [30, 0.07, 0.07], color: 0xd4af37 },
    { kind: 'neon', c: [-17.7, 3.2, -22], s: [0.07, 0.07, 28], color: 0x19e3ff },
    { kind: 'neon', c: [17.7, 3.2, -22], s: [0.07, 0.07, 28], color: 0xff2e88 },
  ],
  spawn: { pos: [0, 0, 11], yaw: 0 },
  checkpoints: [
    { id: 'start', pos: [0, 0, 11], yaw: 0, radius: 2, label: 'Recibidor' },
    { id: 'course', pos: [0, 0, 4], yaw: 0, radius: 2, label: 'Circuito' },
    { id: 'lanes', pos: [-14, 0, -6], yaw: 0, radius: 2, label: 'Carriles' },
    { id: 'yard', pos: [4, 0, -11], yaw: 0, radius: 2, label: 'Patio' },
    { id: 'perch', pos: [14, 1.8, -33.5], yaw: Math.PI, radius: 2, label: 'Plataforma' },
  ],
  enemies: [
    { id: 'd-thug-a', type: 'thug', pos: [-4, 0, -33], yaw: Math.PI, spawnOn: 'drill', group: 'drill', patrol: [[-4, 0, -33], [-6, 0, -27]] },
    { id: 'd-thug-b', type: 'thug', pos: [6, 0, -33], yaw: Math.PI, spawnOn: 'drill', group: 'drill' },
    { id: 'd-escort-a', type: 'escort', pos: [12, 0, -17], yaw: Math.PI, spawnOn: 'drill', group: 'drill' },
    { id: 'd-escort-b', type: 'escort', pos: [-6, 0, -18], yaw: Math.PI, spawnOn: 'drill', group: 'drill' },
    { id: 'd-heavy', type: 'heavy', pos: [1, 0, -34], yaw: Math.PI, spawnOn: 'drill', group: 'drill' },
    { id: 'd-marksman', type: 'marksman', pos: [16, 1.8, -34.2], yaw: Math.PI * 0.85, stationary: true, spawnOn: 'drill', group: 'drill' },
  ],
  civilians: [],
  pickups: [
    { id: 'p-ammo-1', kind: 'ammo', pos: [5.5, 1.0, 10] },
    { id: 'p-med-1', kind: 'medkit', pos: [-8, 0, -12] },
    { id: 'p-arm-1', kind: 'armor', pos: [16, 0, -12] },
  ],
  interactables: [{ id: 'elevator-up', kind: 'door', pos: [0, 0, 12.6], radius: 1.8, prompt: 'Subir al Continental', action: 'goto:hub' }],
  triggers: [],
  music: 'practice',
  ambience: 'range',
  weather: null,
  mission: {
    id: 'practice',
    objectives: [
      { id: 'yard', kind: 'reach', text: 'Baja al patio del simulacro', at: [4, 0, -11], radius: 3, checkpoint: 'yard' },
      { id: 'clear', kind: 'eliminate', text: 'Elimina a los 6 maniquíes armados', group: 'drill', onStart: 'drill' },
    ],
  },
};
