import { aabb, block, pillar, roomShell } from '../helpers';
import type { LevelData } from '../types';

/**
 * EL CONTINENTAL · vestíbulo (hub, zona neutral). Norte = −Z.
 * Recepción de Charon al norte, Sommelier/Armería al oeste, despacho de Winston al este,
 * ascensor al campo de práctica al sureste, entrada principal al sur (vestíbulo exterior)
 * y puerta de servicio al este. Las oleadas del Excomunicado entran por esas dos puertas.
 */
const H = 7;
const GOLD = 0xd4af37;

export const hub: LevelData = {
  id: 'hub',
  name: 'El Continental',
  subtitle: 'Zona neutral',
  bounds: { min: [-17, -2, -15], max: [22, H + 1, 19] },
  killY: -10,
  ambient: {
    sky: 0xe8d2b0,
    ground: 0x3b2f26,
    hemi: 0.6,
    ambientColor: 0xffe9d0,
    ambient: 0.3,
    ibl: 0.3,
    background: 0x0f1118,
    fog: { color: 0x0f1118, near: 50, far: 140 },
    exposure: 1.05,
  },
  key: { color: 0xffe2bc, intensity: 0.8, dir: [0.3, 1, 0.2], shadow: true, shadowArea: 24 },
  lights: [
    { pos: [0, 6.0, -6], color: 0xffd9a0, intensity: 65, distance: 22 },
    { pos: [0, 6.0, 4], color: 0xffd9a0, intensity: 65, distance: 22 },
    { pos: [-2.5, 1.6, -11], color: 0x7dffb0, intensity: 10, distance: 5 },
    { pos: [-14, 4, -2], color: 0x19e3ff, intensity: 30, distance: 12 },
    { pos: [14, 4, -2], color: 0xffc47a, intensity: 35, distance: 12 },
    { pos: [0, 3, 15], color: 0xffe0b0, intensity: 25, distance: 10 },
    { pos: [-10, 5.5, -8], color: 0xff2030, intensity: 60, distance: 18, alarm: true },
    { pos: [10, 5.5, -8], color: 0xff2030, intensity: 60, distance: 18, alarm: true },
    { pos: [-10, 5.5, 6], color: 0xff2030, intensity: 60, distance: 18, alarm: true },
    { pos: [10, 5.5, 6], color: 0xff2030, intensity: 60, distance: 18, alarm: true },
  ],
  boxes: [
    // --- Vestíbulo principal ---
    ...roomShell({
      minX: -16,
      minZ: -14,
      maxX: 16,
      maxZ: 12,
      height: H,
      thickness: 0.5,
      wallMat: 'wallpaper',
      floorMat: 'marbleChecker',
      ceilingMat: 'plasterDark',
      doors: [
        { side: 'south', at: 0, width: 3.2, height: 3.2 },
        { side: 'east', at: 6, width: 2.0, height: 2.6 },
      ],
    }),
    // Zócalos de madera (decorativos, sin collider).
    aabb(-16, 0, -14, -15.94, 1.3, 12, 'woodPanel', { collide: false }),
    aabb(15.94, 0, -14, 16, 1.3, 12, 'woodPanel', { collide: false }),
    aabb(-16, 0, -14, 16, 1.3, -13.94, 'woodPanel', { collide: false }),
    aabb(-16, 0, 11.94, 16, 1.3, 12, 'woodPanel', { collide: false }),
    // Alfombra roja desde la entrada hasta recepción.
    aabb(-2.2, 0, -9.6, 2.2, 0.02, 12, 'carpetRed', { collide: false, shadow: false }),
    // Columnas de mármol.
    pillar(-9, -6, 1.0, H, 'marbleDark'),
    pillar(9, -6, 1.0, H, 'marbleDark'),
    pillar(-9, 4, 1.0, H, 'marbleDark'),
    pillar(9, 4, 1.0, H, 'marbleDark'),

    // --- Recepción de Charon (norte) ---
    block(0, -11, 8, 1.1, 1.4, 'woodDark', { cover: 'low', noWalk: true, tag: 'desk' }),
    aabb(-4.1, 1.1, -11.75, 4.1, 1.18, -10.25, 'marbleDark', { collide: false }),
    block(0, -12.6, 0.6, 1.8, 0.6, 'metal', { invisible: true, noWalk: true, tag: 'npc:charon' }),
    // Casillero de llaves tras el mostrador.
    aabb(-3, 1.4, -14, 3, 3.4, -13.6, 'woodDark', { collide: false }),
    // Placa de las Reglas (bronce) a la derecha del mostrador.
    aabb(5.2, 1.3, -13.98, 6.8, 2.7, -13.9, 'brass', { collide: false }),

    // --- Sommelier / Armería (oeste) ---
    block(-13.6, -2, 1.2, 1.1, 8, 'woodDark', { cover: 'low', noWalk: true, tag: 'bar' }),
    aabb(-14.3, 1.1, -6.1, -12.9, 1.18, 2.1, 'marbleDark', { collide: false }),
    block(-15, -2, 0.6, 1.8, 0.6, 'metal', { invisible: true, noWalk: true, tag: 'npc:sommelier' }),
    aabb(-16, 1.0, -6, -15.6, 3.4, 2, 'woodDark', { collide: false }),
    aabb(-15.6, 1.9, -5.2, -15.5, 2.0, -3.6, 'metalDark', { collide: false }),
    aabb(-15.6, 2.5, -2.6, -15.5, 2.6, -0.8, 'metalDark', { collide: false }),
    aabb(-15.6, 1.9, 0.2, -15.5, 2.0, 1.6, 'metalDark', { collide: false }),

    // --- Despacho de Winston (este) ---
    block(13.6, -2, 1.6, 0.8, 2.6, 'woodDark', { cover: 'low', noWalk: true, tag: 'office' }),
    block(15, -2, 0.6, 1.8, 0.6, 'metal', { invisible: true, noWalk: true, tag: 'npc:winston' }),
    aabb(15.6, 0, -6, 16, 3.6, 2, 'woodDark', { tag: 'bookshelf' }),
    block(13, 3, 2.2, 0.8, 1.0, 'leather', { cover: 'low', noWalk: true }),
    block(13, -7, 2.2, 0.8, 1.0, 'leather', { cover: 'low', noWalk: true }),

    // --- Salón (sofás a los lados de la alfombra) ---
    block(-6, 6, 2.4, 0.75, 1.0, 'leather', { cover: 'low', noWalk: true }),
    block(6, 6, 2.4, 0.75, 1.0, 'leather', { cover: 'low', noWalk: true }),
    block(-4, 6, 0.8, 0.5, 0.8, 'woodDark', { noWalk: true }),
    block(4, 6, 0.8, 0.5, 0.8, 'woodDark', { noWalk: true }),

    // --- Ascensor al campo de práctica (sureste) ---
    aabb(10.8, 0, 11.4, 13.2, 3.2, 11.94, 'metalDark', { tag: 'elevatorBack' }),
    block(10.65, 10.9, 0.3, 3.2, 1.0, 'metal'),
    block(13.35, 10.9, 0.3, 3.2, 1.0, 'metal'),
    aabb(10.5, 2.6, 10.4, 13.5, 3.2, 11.94, 'metal'),

    // --- Vestíbulo exterior sur (entrada principal) ---
    ...roomShell({ minX: -3, minZ: 12.5, maxX: 3, maxZ: 18, height: 4, thickness: 0.5, wallMat: 'plasterDark', floorMat: 'tilesBlack', ceilingMat: 'plasterDark', open: ['north'] }),
    // --- Pasillo de servicio este ---
    ...roomShell({ minX: 16.5, minZ: 4, maxX: 21, maxZ: 8, height: 3.5, thickness: 0.5, wallMat: 'plasterDark', floorMat: 'tilesBlack', ceilingMat: 'plasterDark', open: ['west'] }),
  ],
  ramps: [],
  decor: [
    { kind: 'sign', c: [0, 5.6, -13.9], w: 10, h: 1.3, rotY: 0, text: 'EL CONTINENTAL', sub: 'zona neutral · no se hace negocio aquí', color: GOLD, font: 'serif' },
    { kind: 'sign', c: [0, 3.9, -13.9], w: 4.5, h: 0.7, rotY: 0, text: 'RECEPCIÓN', color: GOLD, font: 'sans' },
    { kind: 'sign', c: [6, 2.95, -13.88], w: 1.5, h: 0.32, rotY: 0, text: 'REGLAS DE LA CASA', color: 0x2b1f07, bg: 0xb88c3e, font: 'serif' },
    { kind: 'sign', c: [-15.9, 4.2, -2], w: 6, h: 0.8, rotY: Math.PI / 2, text: 'SOMMELIER · ARMERÍA', color: 0x19e3ff, font: 'sans' },
    { kind: 'sign', c: [15.9, 4.2, -2], w: 5, h: 0.8, rotY: -Math.PI / 2, text: 'GERENCIA', color: GOLD, font: 'serif' },
    { kind: 'sign', c: [0, 4.0, 11.9], w: 3, h: 0.6, rotY: Math.PI, text: 'SALIDA', color: 0xff3344, font: 'sans' },
    { kind: 'sign', c: [12, 3.7, 11.9], w: 4, h: 0.6, rotY: Math.PI, text: 'CAMPO DE PRÁCTICA ▼', color: GOLD, font: 'sans' },
    { kind: 'neon', c: [0, 6.7, -13.9], s: [31, 0.06, 0.06], color: GOLD, intensity: 1.3 },
    { kind: 'neon', c: [0, 6.7, 11.9], s: [31, 0.06, 0.06], color: GOLD, intensity: 1.3 },
    { kind: 'neon', c: [-15.9, 6.7, -1], s: [0.06, 0.06, 25.8], color: GOLD, intensity: 1.3 },
    { kind: 'neon', c: [15.9, 6.7, -1], s: [0.06, 0.06, 25.8], color: GOLD, intensity: 1.3 },
    { kind: 'prop', prop: 'chandelier', c: [0, 6.0, -6] },
    { kind: 'prop', prop: 'chandelier', c: [0, 6.0, 4] },
    { kind: 'prop', prop: 'lampDesk', c: [-2.5, 1.18, -11] },
    { kind: 'prop', prop: 'lampDesk', c: [2.5, 1.18, -11] },
    { kind: 'prop', prop: 'plant', c: [-14.5, 0, 10.5] },
    { kind: 'prop', prop: 'plant', c: [-14.5, 0, -12.5] },
    { kind: 'prop', prop: 'plant', c: [14.5, 0, -12.5] },
    { kind: 'prop', prop: 'plant', c: [7, 0, 10.8] },
    { kind: 'prop', prop: 'barStools', c: [-11.9, 0, -5.2] },
  ],
  spawn: { pos: [0, 0, 8], yaw: 0 },
  // Título: travelling lento por el vestíbulo hacia la recepción (entre las columnas, sin tocar nada).
  attract: { from: [-6.5, 3.4, 6.2], to: [6.5, 2.6, 6.2], look: [0, 2.8, -12], period: 40 },
  checkpoints: [
    { id: 'lobby', pos: [0, 0, 8], yaw: 0, radius: 2, label: 'Vestíbulo' },
    { id: 'desk', pos: [0, 0, -9.3], yaw: 0, radius: 2, label: 'Recepción' },
    { id: 'bar', pos: [-12, 0, -2], yaw: Math.PI / 2, radius: 2, label: 'Armería' },
    { id: 'office', pos: [12.2, 0, -2], yaw: -Math.PI / 2, radius: 2, label: 'Gerencia' },
    { id: 'elevator', pos: [12, 0, 9.2], yaw: Math.PI, radius: 2, label: 'Ascensor' },
  ],
  enemies: [
    { id: 'x1-thug-a', type: 'thug', pos: [-1.5, 0, 16], yaw: 0, spawnOn: 'excom-1' },
    { id: 'x1-thug-b', type: 'thug', pos: [1.5, 0, 16.5], yaw: 0, spawnOn: 'excom-1' },
    { id: 'x1-thug-c', type: 'thug', pos: [0, 0, 17.3], yaw: 0, spawnOn: 'excom-1' },
    { id: 'x2-escort-a', type: 'escort', pos: [19, 0, 5.3], yaw: Math.PI / 2, spawnOn: 'excom-2' },
    { id: 'x2-escort-b', type: 'escort', pos: [19.8, 0, 6.8], yaw: Math.PI / 2, spawnOn: 'excom-2' },
    { id: 'x2-thug-a', type: 'thug', pos: [0, 0, 16.5], yaw: 0, spawnOn: 'excom-2' },
    { id: 'x3-heavy', type: 'heavy', pos: [0, 0, 16.5], yaw: 0, spawnOn: 'excom-3' },
    { id: 'x3-escort-a', type: 'escort', pos: [19, 0, 5.3], yaw: Math.PI / 2, spawnOn: 'excom-3' },
    { id: 'x3-escort-b', type: 'escort', pos: [19.8, 0, 6.8], yaw: Math.PI / 2, spawnOn: 'excom-3' },
    { id: 'x3-thug-a', type: 'thug', pos: [-1.8, 0, 17.3], yaw: 0, spawnOn: 'excom-3' },
  ],
  civilians: [],
  pickups: [],
  interactables: [
    { id: 'charon', kind: 'npc', pos: [0, 0, -12.6], radius: 3.4, prompt: 'Hablar con Charon', action: 'talk:charon' },
    { id: 'sommelier', kind: 'npc', pos: [-15, 0, -2], radius: 3.2, prompt: 'Hablar con el Sommelier', action: 'talk:sommelier' },
    { id: 'winston', kind: 'npc', pos: [15, 0, -2], radius: 3.4, prompt: 'Hablar con Winston', action: 'talk:winston' },
    { id: 'plaque', kind: 'lore', pos: [6, 0, -13.3], radius: 2.0, prompt: 'Leer las reglas', action: 'read:rules' },
    { id: 'elevator', kind: 'door', pos: [12, 0, 10.6], radius: 1.7, prompt: 'Bajar al campo de práctica', action: 'goto:practice' },
  ],
  triggers: [],
  music: 'hub',
  ambience: 'lobby',
  weather: null,
};
