import { aabb, block, floor, railing, ramp, stairs } from '../helpers';
import type { LevelData } from '../types';

/**
 * CONTRATO 3 · TORRE MERIDIAN. Norte = −Z. Tres azoteas a tres alturas:
 * A (0 m, inicio, sur) → escalera oeste → B (3,84 m, noroeste, nido de tirador) →
 * rampa → C (7,68 m, noreste, helipuerto del Juez). Escape cronometrado de vuelta a la
 * tirolina en la esquina sureste de A.
 */
const B = 3.84;
const C = 7.68;
const PARAPET = 1.1;

export const rooftop: LevelData = {
  id: 'rooftop',
  name: 'Torre Meridian',
  subtitle: 'Contrato 3',
  bounds: { min: [-32, -12, -44], max: [32, 14, 22] },
  killY: -14,
  ambient: {
    sky: 0x9fb4d8,
    ground: 0x1e2026,
    hemi: 1.05,
    ambientColor: 0xd8e4ff,
    ambient: 0.3,
    ibl: 0.4,
    background: 0x0b0e16,
    fog: { color: 0x0b0e16, near: 55, far: 170 },
    exposure: 1.0,
    // La torre domina la ciudad: el horizonte queda muy por debajo de la azotea.
    skyline: { y: -30 },
  },
  key: { color: 0xc8d8ff, intensity: 1.6, dir: [-0.35, 1, 0.25], shadow: true, shadowArea: 44 },
  lights: [
    { pos: [0, 4, 6], color: 0xffd0a0, intensity: 60, distance: 24 },
    { pos: [-16, B + 3.5, -13], color: 0xffd0a0, intensity: 50, distance: 20 },
    { pos: [12, C + 3, -26], color: 0xfff0d0, intensity: 70, distance: 26 },
    { pos: [0, C + 3, -34], color: 0xff2e88, intensity: 50, distance: 20 },
    { pos: [24, 3, 12], color: 0x19e3ff, intensity: 45, distance: 16 },
    { pos: [-24, 4, 12], color: 0xffd0a0, intensity: 35, distance: 14 },
  ],
  boxes: [
    // --- Azotea A (0 m) ---
    floor(-28, -6, 28, 18, 0, 'roofGravel'),
    railing(-28, 18, 28, 18.3, 0, 'concreteDark', PARAPET),
    railing(-28.3, -6, -28, 18.3, 0, 'concreteDark', PARAPET),
    railing(28, -6, 28.3, 18.3, 0, 'concreteDark', PARAPET),
    block(-8, 10, 2, 1.2, 2, 'metalDark', { cover: 'low', noWalk: true, tag: 'ac-1' }),
    block(6, 4, 2, 1.2, 2, 'metalDark', { cover: 'low', noWalk: true, tag: 'ac-2' }),
    block(14, 12, 2, 1.2, 2, 'metalDark', { cover: 'low', noWalk: true, tag: 'ac-3' }),
    block(-2, -2, 3, 1.0, 1, 'concrete', { cover: 'low' }),
    block(20, 2, 1, 2.2, 3, 'brick', { cover: 'high', tag: 'chimney' }),
    block(-16, 6, 1.2, 1.2, 1.2, 'crate', { cover: 'low' }),
    block(24, 14, 1.8, 1.0, 1.2, 'metal', { cover: 'low', noWalk: true, tag: 'zipline' }),
    // --- Bloque B (3,84 m) con escalera desde A ---
    aabb(-28, 0, -22, -4, B, -4, 'concreteDark', { tag: 'roofB' }),
    ...stairs({ start: [-20, 0, 0.2], dir: 'z-', steps: 12, rise: 0.32, run: 0.35, width: 2.4, mat: 'metal' }),
    railing(-28, -4.3, -21.3, -4, B, 'concreteDark'),
    railing(-18.7, -4.3, -4, -4, B, 'concreteDark'),
    railing(-28.3, -22.3, -28, -4, B, 'concreteDark'),
    railing(-28.3, -22.3, -4, -22, B, 'concreteDark'),
    block(-22, -16, 2, 1.2, 2, 'metalDark', { y0: B, cover: 'low', noWalk: true }),
    block(-12, -8, 1.2, 1.2, 1.2, 'crate', { y0: B, cover: 'low' }),
    block(-8, -18, 2.4, 1.0, 1.0, 'concrete', { y0: B, cover: 'low' }),
    // --- Bloque C (7,68 m) con rampa desde B ---
    aabb(-4, 0, -40, 28, C, -6, 'concreteDark', { tag: 'roofC' }),
    railing(-4, -40.3, 28.3, -40, C, 'concreteDark'),
    railing(28, -40.3, 28.3, -6, C, 'concreteDark'),
    railing(-4.3, -40.3, -4, -14.5, C, 'concreteDark'),
    railing(-4.3, -9.5, -4, -6, C, 'concreteDark'),
    railing(-4, -6.3, 28, -6, C, 'concreteDark'),
    aabb(4, C, -30, 20, C + 0.03, -22, 'hazard', { collide: false, shadow: false, tag: 'helipad' }),
    block(0, -12, 2, 1.2, 2, 'metalDark', { y0: C, cover: 'low', noWalk: true }),
    block(22, -14, 2, 1.2, 2, 'metalDark', { y0: C, cover: 'low', noWalk: true }),
    block(2, -32, 2.4, 1.0, 1.0, 'concrete', { y0: C, cover: 'low' }),
    block(22, -34, 2.4, 1.0, 1.0, 'concrete', { y0: C, cover: 'low' }),
    block(12, -36, 1.2, 1.2, 1.2, 'crate', { y0: C, cover: 'low' }),
    block(8, -14, 1.2, 1.2, 1.2, 'crate', { y0: C, cover: 'low' }),
    // Edificios lejanos (decorado sin collider).
    aabb(-31, -12, -43, -29.5, 6, -24, 'plasterDark', { collide: false, shadow: false }),
    aabb(29.5, -12, -43, 31, 10, -30, 'plasterDark', { collide: false, shadow: false }),
    aabb(-31, -12, 18.5, 31, 2, 21, 'plasterDark', { collide: false, shadow: false }),
  ],
  ramps: [ramp([-10, B, -12], [-4, C, -12], 2.4, 'metal')],
  decor: [
    { kind: 'sign', c: [12, 5, -5.95], w: 9, h: 1.3, rotY: 0, text: 'TORRE MERIDIAN', color: 0xd4af37, font: 'serif', glow: 1.2 },
    { kind: 'sign', c: [24, 2.2, 17.95], w: 3.5, h: 0.6, rotY: Math.PI, text: 'TIROLINA', color: 0x19e3ff, font: 'sans' },
    { kind: 'neon', c: [12, 7.6, -5.9], s: [32, 0.07, 0.07], color: 0xff2e88 },
    { kind: 'neon', c: [-16, 3.75, -4.1], s: [24, 0.06, 0.06], color: 0x19e3ff, intensity: 1.2 },
    { kind: 'prop', prop: 'antenna', c: [26, C, -38] },
    { kind: 'prop', prop: 'waterTower', c: [-24, 0, 12] },
    { kind: 'prop', prop: 'rotor', c: [12, C + 2.4, -26] },
  ],
  spawn: { pos: [0, 0, 14], yaw: 0 },
  checkpoints: [
    { id: 'start', pos: [0, 0, 14], yaw: 0, radius: 2, label: 'Azotea' },
    { id: 'roofB', pos: [-16, B, -12], yaw: 0, radius: 2, label: 'Segunda azotea' },
    { id: 'roofC', pos: [4, C, -14], yaw: 0, radius: 2, label: 'Helipuerto' },
  ],
  enemies: [
    { id: 'a-thug-a', type: 'thug', pos: [-6, 0, 2], yaw: Math.PI, group: 'roofA', patrol: [[-6, 0, 2], [10, 0, 8]] },
    { id: 'a-thug-b', type: 'thug', pos: [12, 0, -2], yaw: Math.PI, group: 'roofA' },
    { id: 'a-escort', type: 'escort', pos: [-20, 0, 6], yaw: Math.PI / 2, group: 'roofA', patrol: [[-20, 0, 6], [-10, 0, 14]] },
    { id: 'm-roofB', type: 'marksman', pos: [-10, B, -18], yaw: Math.PI, stationary: true, group: 'marksmen' },
    { id: 'm-roofC', type: 'marksman', pos: [24, C, -36], yaw: Math.PI * 0.75, stationary: true, group: 'marksmen' },
    { id: 'b-escort-a', type: 'escort', pos: [-16, B, -16], yaw: Math.PI, group: 'roofB' },
    { id: 'b-escort-b', type: 'escort', pos: [-24, B, -8], yaw: 0, group: 'roofB' },
    { id: 'judge', type: 'boss', pos: [12, C, -26], yaw: 0, group: 'boss' },
    { id: 'c-escort-a', type: 'escort', pos: [4, C, -22], yaw: 0, group: 'roofC' },
    { id: 'c-escort-b', type: 'escort', pos: [20, C, -30], yaw: 0, group: 'roofC' },
    { id: 'p1-escort-a', type: 'escort', pos: [0, C, -36], yaw: 0, spawnOn: 'boss-phase-1' },
    { id: 'p1-escort-b', type: 'escort', pos: [24, C, -10], yaw: Math.PI, spawnOn: 'boss-phase-1' },
    { id: 'p2-heavy', type: 'heavy', pos: [12, C, -38], yaw: 0, spawnOn: 'boss-phase-2' },
    { id: 'esc-thug-a', type: 'thug', pos: [-14, 0, 4], yaw: Math.PI, spawnOn: 'escape' },
    { id: 'esc-thug-b', type: 'thug', pos: [4, 0, 12], yaw: 0, spawnOn: 'escape' },
    { id: 'esc-escort', type: 'escort', pos: [20, 0, 8], yaw: Math.PI / 2, spawnOn: 'escape' },
  ],
  civilians: [],
  pickups: [
    { id: 'p-ammo-1', kind: 'ammo', pos: [-14, 0, 12] },
    { id: 'p-med-1', kind: 'medkit', pos: [-26, B, -20] },
    { id: 'p-armor-1', kind: 'armor', pos: [-6, B, -20] },
    { id: 'p-ammo-2', kind: 'ammo', pos: [0, C, -8] },
    { id: 'p-med-2', kind: 'medkit', pos: [26, C, -20] },
  ],
  interactables: [],
  triggers: [],
  music: 'tower',
  ambience: 'wind',
  weather: 'rain',
  mission: {
    id: 'rooftop',
    objectives: [
      { id: 'roofB', kind: 'reach', text: 'Sube a la segunda azotea', at: [-16, B, -12], radius: 3, checkpoint: 'roofB' },
      { id: 'marksmen', kind: 'eliminate', text: 'Elimina a los tiradores', group: 'marksmen' },
      { id: 'roofC', kind: 'reach', text: 'Llega al helipuerto', at: [4, C, -14], radius: 3, checkpoint: 'roofC' },
      { id: 'judge', kind: 'boss', text: 'Vence al Juez', enemyId: 'judge' },
      { id: 'escape', kind: 'escape', text: 'Escapa por la tirolina', at: [24, 0, 12.4], radius: 2.5, seconds: 45, onStart: 'escape' },
    ],
  },
};
