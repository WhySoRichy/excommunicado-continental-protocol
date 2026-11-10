import { aabb, block, ramp, roomShell, stairs } from '../helpers';
import type { BoxDef, LevelData, MaterialId } from '../types';

/**
 * CONTRATO 2 · MUELLE 9. Norte = −Z.
 * Patio de contenedores a cielo abierto (sur) → bodega con estanterías y pasarela (noroeste) →
 * muelle con el bote (noreste). Tres cargamentos que destruir (dos en el patio, uno en la bodega).
 */
const CONTAINER_H = 2.6;
const CATWALK = 3.84;
const WALL = 3.5;

/** Contenedor marítimo (6 × 2,6 × 2,4). `level` 1 = sobre otro. */
function container(x: number, z: number, mat: MaterialId, rotY = 0, level = 0, tag?: string): BoxDef {
  return { c: [x, CONTAINER_H / 2 + level * CONTAINER_H, z], s: [6, CONTAINER_H, 2.4], rotY, mat, cover: 'high', tag };
}

export const docks: LevelData = {
  id: 'docks',
  name: 'Muelle 9',
  subtitle: 'Contrato 2',
  bounds: { min: [-30, -2, -62], max: [30, 11, 30] },
  killY: -10,
  ambient: {
    sky: 0x8fa8c8,
    ground: 0x2a2a2e,
    hemi: 1.1,
    ambientColor: 0xd0dcf0,
    ambient: 0.3,
    ibl: 0.4,
    background: 0x0d1118,
    fog: { color: 0x0d1118, near: 45, far: 150 },
    exposure: 1.0,
  },
  key: { color: 0xbcd0ff, intensity: 1.8, dir: [-0.4, 1, 0.3], shadow: true, shadowArea: 40 },
  lights: [
    { pos: [-12, 6, 18], color: 0xffe0b0, intensity: 70, distance: 26 },
    { pos: [12, 6, 18], color: 0xffe0b0, intensity: 70, distance: 26 },
    { pos: [0, 6, 0], color: 0xffe0b0, intensity: 70, distance: 26 },
    { pos: [-14, 8, -24], color: 0xfff0d0, intensity: 80, distance: 28 },
    { pos: [0, 8, -30], color: 0xfff0d0, intensity: 80, distance: 28 },
    { pos: [20, 4, -30], color: 0x9fd0ff, intensity: 40, distance: 16 },
    { pos: [20, 3.5, -20], color: 0xff3344, intensity: 30, distance: 12 },
  ],
  boxes: [
    // --- Patio (cielo abierto) ---
    ...roomShell({
      minX: -28,
      minZ: -10,
      maxX: 28,
      maxZ: 28,
      height: WALL,
      thickness: 0.5,
      wallMat: 'concreteDark',
      floorMat: 'asphalt',
      doors: [
        { side: 'north', at: -8, width: 4, height: 3.5 },
        { side: 'north', at: 20, width: 3, height: 3.5 },
      ],
    }),
    container(-18, 10, 'containerBlue', 0, 0),
    container(-18, 10, 'containerRed', 0, 1, 'stackA'),
    container(-6, 14, 'containerGreen', 0, 0, 'rampBox'),
    container(6, 19, 'containerYellow', 0.2, 0),
    container(16, 8, 'containerRed', 0, 0),
    container(16, 8, 'containerBlue', 0, 1, 'stackB'),
    container(-10, 2, 'containerYellow', 0.3, 0),
    container(10, -3, 'containerGreen', -0.15, 0),
    container(-22, -4, 'containerBlue', 1.3, 0),
    block(-2, 6, 1.2, 1.2, 1.2, 'crate', { cover: 'low' }),
    block(3, 10, 1.2, 1.2, 1.2, 'crate', { cover: 'low' }),
    block(-14, 20, 1.2, 1.2, 1.2, 'crate', { cover: 'low' }),
    block(12, 22, 1.2, 1.2, 1.2, 'crate', { cover: 'low' }),
    block(0, -5, 1.2, 1.2, 1.2, 'crate', { cover: 'low' }),
    block(-24, 24, 1.2, 1.2, 1.2, 'crate', { cover: 'low' }),
    // Cargamentos del patio (palés con franja de peligro).
    block(-22, 20, 1.6, 1.0, 1.6, 'hazard', { cover: 'low', noWalk: true, tag: 'cargo-1' }),
    block(14, -4, 1.6, 1.0, 1.6, 'hazard', { cover: 'low', noWalk: true, tag: 'cargo-2' }),

    // --- Bodega ---
    ...roomShell({
      minX: -28,
      minZ: -38,
      maxX: 10,
      maxZ: -10.5,
      height: 9,
      thickness: 0.5,
      wallMat: 'concreteDark',
      floorMat: 'concrete',
      ceilingMat: 'metalDark',
      doors: [{ side: 'east', at: -30, width: 3, height: 3 }],
      open: ['south'],
    }),
    aabb(-24.5, 0, -30, -23.5, 4, -14, 'metalDark', { cover: 'high', noWalk: true, tag: 'shelf-a' }),
    aabb(-16.5, 0, -30, -15.5, 4, -14, 'metalDark', { cover: 'high', noWalk: true, tag: 'shelf-b' }),
    aabb(-0.5, 0, -30, 0.5, 4, -14, 'metalDark', { cover: 'high', noWalk: true, tag: 'shelf-c' }),
    block(-8, -18, 1.2, 1.2, 1.2, 'crate', { cover: 'low' }),
    block(-8, -26, 1.2, 1.2, 1.2, 'crate', { cover: 'low' }),
    block(4, -22, 1.2, 1.2, 1.2, 'crate', { cover: 'low' }),
    block(-20, -24, 1.6, 1.0, 1.6, 'hazard', { cover: 'low', noWalk: true, tag: 'cargo-3' }),
    // Pasarela norte con escalera al este.
    aabb(-28, CATWALK - 0.2, -38, 10, CATWALK, -34, 'metal', { tag: 'catwalk' }),
    aabb(-28, CATWALK, -34.1, 6.2, CATWALK + 1.05, -33.9, 'metalDark', { noWalk: true }),
    ...stairs({ start: [8, 0, -29.8], dir: 'z-', steps: 12, rise: 0.32, run: 0.35, width: 1.6, mat: 'metal' }),

    // --- Muelle ---
    ...roomShell({ minX: 10.5, minZ: -38, maxX: 28, maxZ: -10.5, height: WALL, thickness: 0.5, wallMat: 'concreteDark', floorMat: 'concrete', open: ['south', 'west', 'north'] }),
    aabb(10.5, 0, -38.5, 28, 1.05, -38, 'metalDark', { noWalk: true, tag: 'pierRail' }),
    block(14, -16, 1.2, 1.2, 1.2, 'crate', { cover: 'low' }),
    block(24, -24, 1.2, 1.2, 1.2, 'crate', { cover: 'low' }),
    block(18, -30, 2.4, 1.0, 1.2, 'crate', { cover: 'low' }),
    // Agua y bote (decorativos, sin collider).
    aabb(10.5, -0.6, -60, 28, -0.1, -38.5, 'water', { collide: false, shadow: false }),
    aabb(17, -0.2, -42.5, 23, 1.0, -39.5, 'metalDark', { collide: false, tag: 'boat' }),
  ],
  ramps: [ramp([-6, 0, 18.5], [-6, CONTAINER_H, 15.2], 2.4, 'metal')],
  decor: [
    { kind: 'sign', c: [0, 3.0, 27.95], w: 8, h: 1.0, rotY: Math.PI, text: 'MUELLE 9', sub: 'zona portuaria · acceso restringido', color: 0xff3344, font: 'sans' },
    { kind: 'sign', c: [-9, 6.5, -10.55], w: 6, h: 0.9, rotY: Math.PI, text: 'BODEGA 4', color: 0xffd23f, font: 'sans' },
    { kind: 'sign', c: [20, 2.6, -37.9], w: 3, h: 0.5, rotY: 0, text: 'EMBARCADERO', color: 0x19e3ff, font: 'sans' },
    { kind: 'neon', c: [0, 3.3, 27.9], s: [55, 0.07, 0.07], color: 0xff3344 },
    { kind: 'neon', c: [-9, 8.7, -10.6], s: [36, 0.07, 0.07], color: 0xffd23f, intensity: 1.2 },
    { kind: 'prop', prop: 'crane', c: [-26, 0, -44], rotY: 0.4 },
    { kind: 'prop', prop: 'plant', c: [26, 0, 26] },
  ],
  spawn: { pos: [0, 0, 25], yaw: 0 },
  checkpoints: [
    { id: 'gate', pos: [0, 0, 25], yaw: 0, radius: 2, label: 'Portón' },
    { id: 'yard', pos: [0, 0, 4], yaw: 0, radius: 2, label: 'Patio' },
    { id: 'warehouse', pos: [-8, 0, -14], yaw: 0, radius: 2, label: 'Bodega' },
    { id: 'pier', pos: [18, 0, -20], yaw: 0, radius: 2, label: 'Muelle' },
  ],
  enemies: [
    { id: 'y-thug-a', type: 'thug', pos: [-4, 0, 20], yaw: Math.PI, group: 'yard', patrol: [[-4, 0, 20], [-16, 0, 16]] },
    { id: 'y-thug-b', type: 'thug', pos: [10, 0, 12], yaw: Math.PI, group: 'yard', patrol: [[10, 0, 12], [2, 0, 2]] },
    { id: 'y-thug-c', type: 'thug', pos: [-24, 0, 6], yaw: 0, group: 'yard' },
    { id: 'y-escort', type: 'escort', pos: [20, 0, -6], yaw: Math.PI, group: 'yard', patrol: [[20, 0, -6], [6, 0, -7]] },
    { id: 'm-stack', type: 'marksman', pos: [-18, CONTAINER_H * 2, 10], yaw: Math.PI, stationary: true, group: 'yard' },
    { id: 'm-stackB', type: 'marksman', pos: [16, CONTAINER_H * 2, 8], yaw: Math.PI, stationary: true, group: 'yard' },
    { id: 'w-heavy-a', type: 'heavy', pos: [-12, 0, -20], yaw: Math.PI, group: 'warehouse' },
    { id: 'w-heavy-b', type: 'heavy', pos: [-4, 0, -32], yaw: Math.PI, group: 'warehouse' },
    { id: 'w-escort-a', type: 'escort', pos: [-20, 0, -32], yaw: Math.PI, group: 'warehouse', patrol: [[-20, 0, -32], [-20, 0, -14]] },
    { id: 'w-escort-b', type: 'escort', pos: [5, 0, -16], yaw: Math.PI, group: 'warehouse', patrol: [[5, 0, -16], [5, 0, -28]] },
    { id: 'm-catwalk', type: 'marksman', pos: [-10, CATWALK, -36], yaw: Math.PI, stationary: true, group: 'warehouse' },
    { id: 'b-escort-a', type: 'escort', pos: [24, 0, -34], yaw: Math.PI, spawnOn: 'boat' },
    { id: 'b-escort-b', type: 'escort', pos: [14, 0, -36], yaw: Math.PI, spawnOn: 'boat' },
    { id: 'b-heavy', type: 'heavy', pos: [12.5, 0, -30], yaw: -Math.PI / 2, spawnOn: 'boat' },
  ],
  civilians: [],
  pickups: [
    { id: 'p-ammo-1', kind: 'ammo', pos: [-2, 0, 20] },
    { id: 'p-armor-1', kind: 'armor', pos: [-6, CONTAINER_H, 14] },
    { id: 'p-med-1', kind: 'medkit', pos: [-26, 0, -12] },
    { id: 'p-ammo-2', kind: 'ammo', pos: [4, 0, -34] },
    { id: 'p-med-2', kind: 'medkit', pos: [26, 0, -14] },
  ],
  interactables: [
    { id: 'cargo-1', kind: 'objective', pos: [-22, 0, 20], radius: 2.2, prompt: 'Colocar carga explosiva', action: 'mission:cargo', hold: 2.5 },
    { id: 'cargo-2', kind: 'objective', pos: [14, 0, -4], radius: 2.2, prompt: 'Colocar carga explosiva', action: 'mission:cargo', hold: 2.5 },
    { id: 'cargo-3', kind: 'objective', pos: [-20, 0, -24], radius: 2.2, prompt: 'Colocar carga explosiva', action: 'mission:cargo', hold: 2.5 },
  ],
  triggers: [],
  music: 'docks',
  ambience: 'harbor',
  weather: 'rain',
  mission: {
    id: 'docks',
    objectives: [
      { id: 'yard', kind: 'interact', text: 'Destruye los cargamentos del patio', targets: ['cargo-1', 'cargo-2'], checkpoint: 'yard' },
      { id: 'warehouse', kind: 'interact', text: 'Destruye el cargamento de la bodega', targets: ['cargo-3'], checkpoint: 'warehouse' },
      { id: 'boat', kind: 'reach', text: 'Llega al bote', at: [20, 0, -36], radius: 2.5, onStart: 'boat' },
    ],
  },
};
