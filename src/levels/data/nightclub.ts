import { aabb, block, pillar, railing, ramp, roomShell, stairs } from '../helpers';
import type { LevelData } from '../types';

/**
 * CONTRATO 1 · CLUB KAIROS. Norte = −Z.
 * Callejón (sur) → vestíbulo con el panel de alarma → pista principal con civiles →
 * mezzanine VIP (escalera este, rampa de servicio oeste) donde está Vance →
 * pasillo de servicio (noreste) hacia la salida trasera.
 */
const H = 7;
const MEZ = 3.2;
const MAGENTA = 0xff2e88;
const CYAN = 0x19e3ff;

export const nightclub: LevelData = {
  id: 'nightclub',
  name: 'Club Kairos',
  subtitle: 'Contrato 1',
  bounds: { min: [-16, -2, -20], max: [16, H + 1, 29] },
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
  key: { color: 0xd8c8ff, intensity: 1.3, dir: [0.25, 1, 0.35], shadow: true, shadowArea: 26 },
  lights: [
    { pos: [-8, 5, 2], color: MAGENTA, intensity: 55, distance: 18 },
    { pos: [8, 5, 2], color: CYAN, intensity: 55, distance: 18 },
    { pos: [0, 4.5, 3], color: 0xffb0ff, intensity: 40, distance: 14 },
    { pos: [-12, 3.5, 8.5], color: 0xffc47a, intensity: 30, distance: 10 },
    { pos: [0, 5.5, -7], color: 0xd4af37, intensity: 50, distance: 16 },
    { pos: [0, 3.2, 17], color: 0xffd0a0, intensity: 30, distance: 10 },
    { pos: [0, 4, 24], color: 0x90b0ff, intensity: 30, distance: 12 },
    { pos: [10, 2.8, -14], color: 0xffe0b0, intensity: 25, distance: 8 },
  ],
  boxes: [
    // --- Pista principal ---
    ...roomShell({
      minX: -14,
      minZ: -10,
      maxX: 14,
      maxZ: 14,
      height: H,
      thickness: 0.5,
      wallMat: 'brick',
      floorMat: 'tilesBlack',
      ceilingMat: 'plasterDark',
      doors: [
        { side: 'south', at: 0, width: 2.4, height: 3 },
        { side: 'north', at: 10, width: 1.6, height: 2.6 },
      ],
    }),
    aabb(-6, 0, -2, 6, 0.03, 8, 'danceFloor', { collide: false, shadow: false }),
    // Barra (oeste, al sur de la rampa de servicio) con estantería.
    block(-12.6, 8.5, 1.2, 1.1, 9, 'woodDark', { cover: 'low', noWalk: true, tag: 'bar' }),
    aabb(-13.3, 1.1, 3.9, -11.9, 1.18, 13.1, 'marbleDark', { collide: false }),
    aabb(-14, 1.0, 3.5, -13.6, 3.2, 13.5, 'woodDark', { collide: false }),
    // Cabina del DJ (bajo el VIP).
    block(0, -7, 4, 1.0, 1.5, 'metalDark', { cover: 'low', noWalk: true, tag: 'dj' }),
    // Reservados (este).
    block(12.5, 4, 1.0, 0.75, 2.2, 'leather', { cover: 'low', noWalk: true }),
    block(12.5, 9, 1.0, 0.75, 2.2, 'leather', { cover: 'low', noWalk: true }),
    block(11.2, 4, 0.7, 0.5, 0.7, 'woodDark', { noWalk: true }),
    block(11.2, 9, 0.7, 0.5, 0.7, 'woodDark', { noWalk: true }),
    // Columnas.
    pillar(-7, -3, 0.8, H, 'concreteDark'),
    pillar(7, -3, 0.8, H, 'concreteDark'),
    pillar(-7, 9, 0.8, H, 'concreteDark'),
    pillar(7, 9, 0.8, H, 'concreteDark'),
    // --- Mezzanine VIP (norte) ---
    aabb(-14, MEZ - 0.2, -10, 14, MEZ, -4, 'carpetRed', { tag: 'mezzanine' }),
    railing(-12, -4.1, 12, -3.9, MEZ, 'metalDark'),
    ...stairs({ start: [13, 0, -0.5], dir: 'z-', steps: 10, rise: 0.32, run: 0.35, width: 2, mat: 'metal' }),
    railing(11.9, -4, 12.1, -0.5, 0, 'metalDark', MEZ + 1.0),
    block(-8, -8, 2.4, 0.75, 1.0, 'leather', { y0: MEZ, cover: 'low', noWalk: true }),
    block(8, -8, 2.4, 0.75, 1.0, 'leather', { y0: MEZ, cover: 'low', noWalk: true }),
    block(0, -6, 1.6, 0.5, 0.8, 'woodDark', { y0: MEZ, noWalk: true }),
    // --- Vestíbulo de entrada ---
    ...roomShell({ minX: -5, minZ: 14.5, maxX: 5, maxZ: 20, height: 4, thickness: 0.5, wallMat: 'plasterDark', floorMat: 'tilesBlack', ceilingMat: 'plasterDark', doors: [{ side: 'south', at: 0, width: 2, height: 2.8 }], open: ['north'] }),
    block(-3.6, 17.5, 1.4, 1.1, 2.4, 'woodDark', { cover: 'low', noWalk: true, tag: 'coatCheck' }),
    aabb(4.9, 1.1, 15.6, 4.98, 1.7, 16.4, 'metalDark', { collide: false, tag: 'alarmBox' }),
    // --- Callejón trasero (inicio) ---
    ...roomShell({ minX: -5, minZ: 20.5, maxX: 5, maxZ: 28, height: 4.5, thickness: 0.5, wallMat: 'brick', floorMat: 'asphalt', open: ['north'] }),
    block(-3.5, 24, 1.4, 1.2, 1.4, 'crate', { cover: 'low' }),
    block(3.6, 26, 1.0, 1.0, 1.0, 'metalDark', { cover: 'low' }),
    // --- Pasillo de servicio y salida trasera ---
    ...roomShell({ minX: 8, minZ: -18, maxX: 12, maxZ: -10.5, height: 3.2, thickness: 0.5, wallMat: 'plasterDark', floorMat: 'concrete', ceilingMat: 'plasterDark', open: ['south'] }),
    block(8.6, -13, 0.9, 1.0, 0.9, 'crate', { cover: 'low' }),
  ],
  ramps: [ramp([-13, 0, 2], [-13, MEZ, -4], 2, 'metal')],
  decor: [
    { kind: 'sign', c: [0, 3.6, 20.56], w: 5, h: 1.1, rotY: 0, text: 'KAIROS', color: MAGENTA, font: 'sans', glow: 1.3 },
    { kind: 'sign', c: [0, 4.5, -3.85], w: 3, h: 0.7, rotY: 0, text: 'VIP', color: 0xd4af37, font: 'serif' },
    { kind: 'sign', c: [10, 2.6, -17.9], w: 2.6, h: 0.5, rotY: 0, text: 'SALIDA', color: 0x3ddc84, font: 'sans' },
    { kind: 'sign', c: [4.85, 2.0, 16], w: 1.6, h: 0.3, rotY: -Math.PI / 2, text: 'ALARMA', color: 0xff3344, font: 'sans', bg: 0x1a1a1f },
    { kind: 'sign', c: [-13.9, 4.2, 8.5], w: 5, h: 0.8, rotY: Math.PI / 2, text: 'BAR', color: CYAN, font: 'sans' },
    { kind: 'neon', c: [0, 5.6, -9.9], s: [27, 0.07, 0.07], color: MAGENTA },
    { kind: 'neon', c: [0, 5.6, 13.9], s: [27, 0.07, 0.07], color: CYAN },
    { kind: 'neon', c: [-13.9, 5.6, 2], s: [0.07, 0.07, 23], color: CYAN },
    { kind: 'neon', c: [13.9, 5.6, 2], s: [0.07, 0.07, 23], color: MAGENTA },
    { kind: 'neon', c: [0, MEZ + 0.02, -4.0], s: [24, 0.05, 0.08], color: 0xd4af37, intensity: 1.2 },
    { kind: 'prop', prop: 'speaker', c: [-2.6, 0, -8.6], rotY: Math.PI },
    { kind: 'prop', prop: 'speaker', c: [2.6, 0, -8.6], rotY: Math.PI },
    { kind: 'prop', prop: 'barStools', c: [-11.3, 0, 5] },
    { kind: 'prop', prop: 'barStools', c: [-11.3, 0, 9.8] },
    { kind: 'prop', prop: 'plant', c: [-4, 0, 19] },
    { kind: 'prop', prop: 'plant', c: [4, 0, 19] },
  ],
  spawn: { pos: [0, 0, 25], yaw: 0 },
  checkpoints: [
    { id: 'alley', pos: [0, 0, 25], yaw: 0, radius: 2, label: 'Callejón' },
    { id: 'floor', pos: [0, 0, 12], yaw: 0, radius: 2, label: 'Pista' },
    { id: 'vip', pos: [12.5, MEZ, -6], yaw: Math.PI / 2, radius: 2, label: 'VIP' },
  ],
  enemies: [
    { id: 'e-door', type: 'thug', pos: [0, 0, 17], yaw: Math.PI, group: 'floor', patrol: [[-3, 0, 17], [3, 0, 17]] },
    { id: 'e-floor-a', type: 'thug', pos: [-8, 0, 10], yaw: 0, group: 'floor', patrol: [[-8, 0, 10], [8, 0, 10]] },
    { id: 'e-floor-b', type: 'thug', pos: [8, 0, -1], yaw: 0, group: 'floor', patrol: [[8, 0, -1], [8, 0, 7]] },
    { id: 'e-bar', type: 'escort', pos: [-10, 0, -6], yaw: Math.PI, group: 'floor', patrol: [[-10, 0, -6], [-10, 0, 8]] },
    { id: 'e-stairs', type: 'escort', pos: [12, 0, 2], yaw: Math.PI, group: 'floor' },
    { id: 'vance', type: 'heavy', pos: [0, MEZ, -8.5], yaw: Math.PI, group: 'vance' },
    { id: 'vip-a', type: 'escort', pos: [-5, MEZ, -7], yaw: Math.PI, group: 'vip' },
    { id: 'vip-b', type: 'escort', pos: [5, MEZ, -7], yaw: Math.PI, group: 'vip' },
    { id: 'alarm-a', type: 'escort', pos: [-2, 0, 17], yaw: 0, spawnOn: 'alarm' },
    { id: 'alarm-b', type: 'escort', pos: [2, 0, 17], yaw: 0, spawnOn: 'alarm' },
    { id: 'alarm-c', type: 'thug', pos: [0, 0, 19], yaw: 0, spawnOn: 'alarm' },
    { id: 'r-a', type: 'thug', pos: [10, 0, -13], yaw: Math.PI, spawnOn: 'reinforce' },
    { id: 'r-b', type: 'thug', pos: [10, 0, -15.5], yaw: Math.PI, spawnOn: 'reinforce' },
    { id: 'r-c', type: 'escort', pos: [0, 0, 10], yaw: 0, spawnOn: 'reinforce' },
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
    { id: 'c9', pos: [-11, 0, 6.5], yaw: Math.PI / 2, behavior: 'bar' },
    { id: 'c10', pos: [-11, 0, 11], yaw: Math.PI / 2, behavior: 'bar' },
    { id: 'c11', pos: [10.6, 0, 6.5], yaw: -Math.PI / 2, behavior: 'idle' },
    { id: 'c12', pos: [-2, 0, 11], yaw: Math.PI, behavior: 'idle' },
  ],
  pickups: [
    { id: 'p-ammo', kind: 'ammo', pos: [-9.5, 0, -2] },
    { id: 'p-med', kind: 'medkit', pos: [10, 0, -12] },
    { id: 'p-armor', kind: 'armor', pos: [-10, MEZ, -9] },
  ],
  interactables: [{ id: 'alarm-panel', kind: 'alarmPanel', pos: [4.5, 0, 16], radius: 1.6, prompt: 'Desactivar la alarma', action: 'mission:alarm', hold: 2 }],
  triggers: [],
  music: 'club',
  ambience: 'club',
  weather: 'rain',
  mission: {
    id: 'nightclub',
    alarm: true,
    objectives: [
      { id: 'enter', kind: 'reach', text: 'Entra en el club', at: [0, 0, 12], radius: 2.5, checkpoint: 'floor' },
      { id: 'vip', kind: 'reach', text: 'Sube al VIP', at: [12.5, MEZ, -6], radius: 2.5, checkpoint: 'vip' },
      { id: 'vance', kind: 'eliminate', text: 'Elimina a Vance', group: 'vance' },
      { id: 'exit', kind: 'reach', text: 'Sal por la puerta trasera', at: [10, 0, -16.5], radius: 2, onStart: 'reinforce' },
    ],
  },
};
