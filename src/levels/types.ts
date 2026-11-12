import type { MissionId } from '../missions/types';

/**
 * Esquema de datos de nivel. Es la ÚNICA fuente de verdad: de estos datos se
 * generan los meshes, los colliders de Rapier, la grilla de navegación y la
 * lógica de misión. Nada de geometría "a mano" fuera de aquí.
 */

export type Vec3 = readonly [number, number, number];

export type LevelId = 'arena' | 'practice' | 'hub' | 'nightclub' | 'docks' | 'rooftop';

export type MaterialId =
  | 'qaGrid'
  | 'qaGridDark'
  | 'qaOrange'
  | 'concrete'
  | 'concreteDark'
  | 'plaster'
  | 'plasterDark'
  | 'marble'
  | 'marbleDark'
  | 'marbleChecker'
  | 'woodPanel'
  | 'woodDark'
  | 'carpetRed'
  | 'carpetGreen'
  | 'gold'
  | 'brass'
  | 'metal'
  | 'metalDark'
  | 'steelBlue'
  | 'crate'
  | 'containerRed'
  | 'containerBlue'
  | 'containerGreen'
  | 'containerYellow'
  | 'asphalt'
  | 'tilesBlack'
  | 'danceFloor'
  | 'glass'
  | 'leather'
  | 'velvet'
  | 'brick'
  | 'wallpaper'
  | 'water'
  | 'roofGravel'
  | 'hazard'
  | 'targetBoard';

export type CoverKind = 'low' | 'high';

export interface BoxDef {
  /** Centro (m). */
  c: Vec3;
  /** Tamaño completo (m). */
  s: Vec3;
  /** Rotación alrededor de Y (rad). */
  rotY?: number;
  mat: MaterialId;
  /** Genera collider (por defecto sí). */
  collide?: boolean;
  /** Sugerencia de cobertura para la IA (la detección del jugador es geométrica). */
  cover?: CoverKind;
  /** Proyecta sombra (por defecto: sí salvo suelos/techos). */
  shadow?: boolean;
  /** Excluir de la grilla de navegación como superficie caminable. */
  noWalk?: boolean;
  /** Solo collider (sin mesh): cuerpos de NPC, barreras invisibles. */
  invisible?: boolean;
  /** Peldaño de escalera (la navegación lo trata como pendiente, no como escalón aislado). */
  stair?: boolean;
  tag?: string;
}

export interface RampDef {
  /** Centro del borde inferior. */
  from: Vec3;
  /** Centro del borde superior. */
  to: Vec3;
  /** Ancho (m). */
  w: number;
  mat: MaterialId;
  thickness?: number;
}

export interface AmbientDef {
  /** Color de cielo y suelo de la HemisphereLight. */
  sky: number;
  ground: number;
  hemi: number;
  /** AmbientLight mínima (piso de luz, R1). */
  ambientColor: number;
  ambient: number;
  /** Intensidad del entorno IBL (RoomEnvironment). */
  ibl: number;
  background: number;
  fog: { color: number; near: number; far: number } | null;
  exposure: number;
  /** Cielo nocturno con silueta de ciudad (niveles a cielo abierto). `y` desplaza el horizonte (m). */
  skyline?: { y: number };
}

export interface KeyLightDef {
  color: number;
  intensity: number;
  /** Dirección HACIA la luz (se normaliza). */
  dir: Vec3;
  shadow: boolean;
  /** Semilado del frustum ortográfico de sombra (m). */
  shadowArea: number;
}

export interface PointLightDef {
  pos: Vec3;
  color: number;
  intensity: number;
  distance: number;
  /** Variante de alarma: se usa en modo hostil/Excomunicado. */
  alarm?: boolean;
}

export interface DecorNeon {
  kind: 'neon';
  c: Vec3;
  s: Vec3;
  rotY?: number;
  color: number;
  intensity?: number;
}

export interface DecorSign {
  kind: 'sign';
  c: Vec3;
  w: number;
  h: number;
  rotY: number;
  text: string;
  sub?: string;
  color: number;
  bg?: number;
  font?: 'serif' | 'sans';
  glow?: number;
}

export type PropKind = 'plant' | 'lampDesk' | 'chandelier' | 'barStools' | 'speaker' | 'rotor' | 'waterTower' | 'antenna' | 'crane';

export interface DecorProp {
  kind: 'prop';
  prop: PropKind;
  c: Vec3;
  rotY?: number;
  scale?: number;
}

export type DecorDef = DecorNeon | DecorSign | DecorProp;

export interface SpawnPoint {
  pos: Vec3;
  yaw: number;
}

export interface CheckpointDef {
  id: string;
  pos: Vec3;
  yaw: number;
  /** Radio de activación (m). */
  radius: number;
  label: string;
}

export type EnemyType = 'thug' | 'escort' | 'marksman' | 'heavy' | 'boss';

export interface EnemySpawnDef {
  id: string;
  type: EnemyType;
  pos: Vec3;
  yaw: number;
  patrol?: Vec3[];
  /** No se desplaza (tiradores en altura). */
  stationary?: boolean;
  /** Grupo de alerta compartida. */
  group?: string;
  /** Solo aparece al activarse este evento (refuerzos/oleadas). */
  spawnOn?: string;
}

export interface CivilianDef {
  id: string;
  pos: Vec3;
  yaw: number;
  behavior: 'dance' | 'idle' | 'bar';
}

export type PickupKind = 'ammo' | 'medkit' | 'armor';

export interface PickupDef {
  id: string;
  kind: PickupKind;
  pos: Vec3;
}

export type InteractableKind = 'npc' | 'door' | 'lore' | 'objective' | 'alarmPanel' | 'terminal';

export interface InteractableDef {
  id: string;
  kind: InteractableKind;
  pos: Vec3;
  radius: number;
  /** Texto del aviso contextual, p. ej. "Hablar con Charon". */
  prompt: string;
  /** Acción que interpreta el director del nivel. */
  action: string;
  /** Segundos que hay que mantener E (0 = instantáneo). */
  hold?: number;
}

export interface TriggerDef {
  id: string;
  c: Vec3;
  s: Vec3;
  event: string;
  once?: boolean;
}

/** `waves`: oleadas infinitas del Gauntlet (termina al morir). `learn`: paso del tutorial. */
export type ObjectiveKind = 'reach' | 'eliminate' | 'interact' | 'survive' | 'escape' | 'boss' | 'waves' | 'learn';

/** Habilidades que enseña el tutorial (objetivos `learn`). */
export type SkillId = 'move' | 'sprint' | 'vault' | 'slide' | 'dodge' | 'cover' | 'shoot' | 'reload' | 'switch' | 'focus' | 'takedown';

/** Objetivo de misión (se cumplen en orden). */
export interface ObjectiveDef {
  id: string;
  kind: ObjectiveKind;
  /** Texto del HUD ("Sube al VIP"). */
  text: string;
  /** reach/escape: zona objetivo (centro, radio). Para los demás, posición de la baliza. */
  at?: Vec3;
  radius?: number;
  /** eliminate: grupo de enemigos (`EnemySpawnDef.group`); 'all' = todos los que haya vivos. */
  group?: string;
  /** interact: ids de interactables que hay que usar (todos). */
  targets?: string[];
  /** survive/escape: segundos. */
  seconds?: number;
  /** boss: id del enemigo jefe. */
  enemyId?: string;
  /** learn: habilidad que hay que demostrar. */
  skill?: SkillId;
  /** Mientras dure el objetivo, los enemigos de este grupo quedan aturdidos (maniquí del tutorial). */
  stunGroup?: string;
  /** Eventos de aparición (`spawnOn`) al empezar / completar el objetivo. */
  onStart?: string;
  onComplete?: string;
  /** Checkpoint que se activa al completar. */
  checkpoint?: string;
}

export interface MissionBlock {
  id: MissionId;
  objectives: ObjectiveDef[];
  /** Hay un panel de alarma: el primer enemigo en dar la voz de alarma trae refuerzos (`spawnOn: 'alarm'`). */
  alarm?: boolean;
  /** Vidas fijas (sustituye a los marcadores de sangre del jugador). */
  lives?: number;
}

export type MusicMood = 'hub' | 'tension' | 'club' | 'docks' | 'tower' | 'gauntlet' | 'practice';
export type AmbienceKind = 'lobby' | 'club' | 'harbor' | 'wind' | 'range' | 'none';

export interface LevelData {
  id: LevelId;
  name: string;
  subtitle?: string;
  /** Cámara de la pantalla de título: travelling de `from` a `to` (ida y vuelta) mirando a `look`. */
  attract?: { from: Vec3; to: Vec3; look: Vec3; period: number };
  bounds: { min: Vec3; max: Vec3 };
  /** Por debajo de esta altura el jugador vuelve al último suelo seguro (red de seguridad). */
  killY: number;
  ambient: AmbientDef;
  key: KeyLightDef;
  lights: PointLightDef[];
  boxes: BoxDef[];
  ramps: RampDef[];
  decor: DecorDef[];
  spawn: SpawnPoint;
  checkpoints: CheckpointDef[];
  enemies: EnemySpawnDef[];
  civilians: CivilianDef[];
  pickups: PickupDef[];
  interactables: InteractableDef[];
  triggers: TriggerDef[];
  music: MusicMood;
  ambience: AmbienceKind;
  weather?: 'rain' | null;
  /** Guion de misión (solo niveles de contrato). */
  mission?: MissionBlock;
}
