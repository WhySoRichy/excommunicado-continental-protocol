import { aabb, block, pillar, ramp, roomShell, stairs } from '../helpers';
import type { LevelData } from '../types';

/**
 * ARENA DE PRUEBAS (QA de movimiento). Cada zona aísla un caso clásico de bug:
 * NO: escaleras (0,20 y 0,32 de contrahuella) + escalón de 0,5 (no autostep).
 * NE: rampas de 15°, 30°, 45° (subibles) y 55° (desliza).
 * Centro: cajas de 0,5 / 0,9 / 1,2 (vault), muro de 2,2 (cobertura alta), caja profunda (subirse).
 * SO: huecos de 0,5 (no pasa) / 0,8 / 1,2 / 2,0, esquina en V aguda y esquina en L.
 * SE: pared de 0,1 m (anti-túnel), túnel de 1,3 m (solo agachado), peine de postes.
 * Sur: plataforma elevada de 1 m sin baranda (bordes y caídas).
 */
const H = 6;

const vWallLen = 5;
const vTheta = 0.349; // 20°
const vApexX = -15;
const vApexZ = 21.4;

export const arena: LevelData = {
  id: 'arena',
  name: 'Arena de pruebas',
  subtitle: 'QA de movimiento y colisiones',
  bounds: { min: [-25, -2, -25], max: [25, H + 1, 25] },
  killY: -10,
  ambient: {
    sky: 0xc4d4f0,
    ground: 0x5b4f43,
    hemi: 1.5,
    ambientColor: 0xffffff,
    ambient: 0.35,
    ibl: 0.45,
    background: 0x1b2130,
    fog: { color: 0x1b2130, near: 45, far: 140 },
    exposure: 1.0,
  },
  key: { color: 0xfff1dc, intensity: 2.6, dir: [0.45, 1, 0.3], shadow: true, shadowArea: 30 },
  lights: [
    { pos: [-20, 4.5, -20], color: 0xff2e88, intensity: 40, distance: 18 },
    { pos: [20, 4.5, 20], color: 0x19e3ff, intensity: 40, distance: 18 },
  ],
  boxes: [
    ...roomShell({ minX: -24, minZ: -24, maxX: 24, maxZ: 24, height: H, thickness: 0.6, wallMat: 'qaGridDark', floorMat: 'qaGrid' }),

    // --- NO: escaleras ---
    ...stairs({ start: [-20, 0, -10], dir: 'z-', steps: 8, rise: 0.2, run: 0.4, width: 2.4, mat: 'qaOrange' }),
    ...stairs({ start: [-15, 0, -11.45], dir: 'z-', steps: 5, rise: 0.32, run: 0.35, width: 2.4, mat: 'qaOrange' }),
    aabb(-21.2, 0, -19, -13.8, 1.6, -13.2, 'qaGrid', { tag: 'stairsTop' }),
    block(-9.5, -14, 2.4, 0.5, 2.4, 'qaOrange', { tag: 'highStep' }),

    // --- NE: rampas a una plataforma común de 1,6 m ---
    aabb(8.8, 0, -20, 21.7, 1.6, -15, 'qaGrid', { tag: 'rampTop' }),

    // --- Centro: vault y cobertura ---
    block(-4, 0, 1.6, 0.5, 0.8, 'qaOrange', { cover: 'low', tag: 'box050' }),
    block(0, 0, 1.6, 0.9, 0.8, 'qaOrange', { cover: 'low', tag: 'box090' }),
    block(4, 0, 1.6, 1.2, 0.8, 'qaOrange', { cover: 'low', tag: 'box120' }),
    block(0, -4.5, 3, 2.2, 0.6, 'qaGridDark', { cover: 'high', tag: 'wall220' }),
    block(-4.5, -4.5, 2, 1.0, 2.5, 'qaOrange', { tag: 'deepBox' }),
    block(4.5, -4.5, 1.2, 1.2, 1.2, 'qaOrange', { cover: 'low', tag: 'crateA' }),
    block(4.5, -4.5, 1.2, 1.2, 1.2, 'qaOrange', { y0: 1.2, tag: 'crateB' }),

    // --- SO: huecos entre columnas (z = 12) ---
    pillar(-21.0, 12, 1, 3, 'qaGridDark'),
    pillar(-19.5, 12, 1, 3, 'qaGridDark'), // hueco 0,5
    pillar(-17.7, 12, 1, 3, 'qaGridDark'), // hueco 0,8
    pillar(-15.5, 12, 1, 3, 'qaGridDark'), // hueco 1,2
    pillar(-12.5, 12, 1, 3, 'qaGridDark'), // hueco 2,0
    // Esquina en V aguda (40° de apertura).
    {
      c: [vApexX - (vWallLen / 2) * Math.sin(vTheta), 1.25, vApexZ - (vWallLen / 2) * Math.cos(vTheta)],
      s: [0.3, 2.5, vWallLen],
      rotY: vTheta,
      mat: 'qaOrange',
      noWalk: true,
      tag: 'vWallA',
    },
    {
      c: [vApexX + (vWallLen / 2) * Math.sin(vTheta), 1.25, vApexZ - (vWallLen / 2) * Math.cos(vTheta)],
      s: [0.3, 2.5, vWallLen],
      rotY: -vTheta,
      mat: 'qaOrange',
      noWalk: true,
      tag: 'vWallB',
    },
    // Esquina en L.
    aabb(-10.5, 0, 16, -10.2, 2.5, 20, 'qaOrange', { noWalk: true }),
    aabb(-10.5, 0, 19.7, -6.5, 2.5, 20, 'qaOrange', { noWalk: true }),

    // --- SE: pared delgada, túnel bajo y peine ---
    aabb(11.95, 0, 9, 12.05, 3, 15, 'qaOrange', { noWalk: true, tag: 'thinWall' }),
    aabb(16, 0, 9.6, 22, 2.5, 9.8, 'qaGridDark', { noWalk: true }),
    aabb(16, 0, 12.2, 22, 2.5, 12.4, 'qaGridDark', { noWalk: true }),
    aabb(16, 1.3, 9.6, 22, 1.6, 12.4, 'qaGridDark', { noWalk: true, tag: 'lowCeiling' }),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => aabb(15 + i * 0.55, 0, 18, 15.15 + i * 0.55, 2, 18.15, 'qaOrange', { noWalk: true })),

    // --- Sur: plataforma elevada sin baranda ---
    aabb(-4, 0, 12, 4, 1.0, 18, 'qaGrid', { tag: 'ledge' }),
  ],
  ramps: [
    ramp([10, 0, -9.03], [10, 1.6, -15], 2.4, 'qaOrange'), // 15°
    ramp([13.4, 0, -12.23], [13.4, 1.6, -15], 2.4, 'qaOrange'), // 30°
    ramp([16.8, 0, -13.4], [16.8, 1.6, -15], 2.4, 'qaOrange'), // 45°
    ramp([20.3, 0, -13.88], [20.3, 1.6, -15], 2.4, 'qaOrange'), // 55° (desliza)
    ramp([0, 0, 22.0], [0, 1.0, 18.0], 2.4, 'qaOrange'), // 14°
  ],
  decor: [
    { kind: 'sign', c: [0, 4.2, -23.35], w: 9, h: 1.4, rotY: 0, text: 'ARENA DE PRUEBAS', sub: 'colisiones · cámara · movimiento', color: 0xd4af37, font: 'serif' },
    { kind: 'neon', c: [0, 5.4, -23.35], s: [40, 0.08, 0.08], color: 0xff2e88 },
    { kind: 'neon', c: [0, 5.4, 23.35], s: [40, 0.08, 0.08], color: 0x19e3ff },
  ],
  spawn: { pos: [0, 0, 7], yaw: 0 },
  checkpoints: [
    { id: 'spawn', pos: [0, 0, 7], yaw: 0, radius: 2, label: 'Inicio' },
    { id: 'stairs', pos: [-17.5, 0, -7.5], yaw: 0, radius: 2, label: 'Escaleras' },
    { id: 'ramps', pos: [15, 0, -6.5], yaw: 0, radius: 2, label: 'Rampas' },
    { id: 'boxes', pos: [0, 0, 2.5], yaw: 0, radius: 2, label: 'Cajas' },
    { id: 'gaps', pos: [-17, 0, 8.5], yaw: 0, radius: 2, label: 'Huecos' },
    { id: 'corners', pos: [-15, 0, 15.5], yaw: Math.PI, radius: 2, label: 'Esquina en V' },
    { id: 'thin', pos: [9.5, 0, 12], yaw: -Math.PI / 2, radius: 2, label: 'Pared delgada' },
    { id: 'tunnel', pos: [14.5, 0, 11], yaw: -Math.PI / 2, radius: 2, label: 'Túnel bajo' },
    { id: 'ledge', pos: [0, 1.0, 15], yaw: 0, radius: 2, label: 'Plataforma' },
  ],
  enemies: [],
  civilians: [],
  pickups: [],
  interactables: [],
  triggers: [],
  music: 'practice',
  ambience: 'range',
  weather: null,
};
