import type { BlindMode } from '../combat/PlayerCombat';
import type { PlayerLook } from '../combat/playerLook';
import type { HitMarkerKind } from '../combat/PlayerCombat';
import type { DeathStyle, HitPart } from '../combat/hitReaction';
import type { GrenadeSound, ImpactKind, ShotSound } from '../combat/ports';
import type { StyleAction } from '../combat/StyleMeter';
import type { GearId, Loadout, UpgradeId, WeaponId, WeaponSlot } from '../combat/weapons';
import type { AiState } from '../entities/ai/EnemyBrain';
import type { CivilianNet, CivState } from '../entities/Civilian';
import { emptyEnemyNet, type EnemyNet } from '../entities/Enemy';
import { type CoverHeight, emptyCoverNet, emptyMoveNet, type MoveNet, type MoveState, type Posture } from '../entities/PlayerController';
import type { EnemyType, LevelId, ObjectiveKind, PickupKind } from '../levels/types';
import type { MissionId } from '../missions/types';

/**
 * Protocolo del cooperativo en red (fase 3 de docs/ESCALABILIDAD.md). El anfitrión simula la partida; cada invitado le
 * envía en cada paso su movimiento y lo que pide su combate, y recibe 20 veces por segundo el estado de todo lo que se
 * ve. Los mensajes son JSON con tuplas de números redondeados (pocos bytes) y todo lo que llega se valida antes de
 * usarlo: un mensaje malformado se descarta entero, nunca a medias.
 */

/** Versión del protocolo: cambia con cualquier mensaje. Con versiones distintas no se juega juntos. */
export const PROTOCOL = 6;
/** Jugadores por partida (anfitrión incluido). */
export const MAX_PLAYERS = 4;
/** Pasos de simulación entre instantáneas: 3 a 60 Hz son 20 por segundo. */
export const SNAPSHOT_TICKS = 3;
/** Tamaño máximo de un mensaje (caracteres): lo que lo supere se descarta sin leerlo. */
export const MAX_MESSAGE_CHARS = 200_000;
/** Efectos por instantánea: un tope para que una ráfaga de escopetas no dispare el tamaño. */
export const MAX_FX = 400;
/** Fotogramas de entrada repetidos en cada envío: si se pierde un paquete, el siguiente los trae. */
export const INPUT_REDUNDANCY = 3;

/**
 * Semilla de la dispersión de los disparos de un jugador en uno de sus pasos. El invitado la usa al predecir su disparo
 * y el anfitrión al resolverlo: los perdigones salen igual en los dos equipos.
 */
export function shotSeed(playerId: number, seq: number): number {
  return (Math.imul(playerId + 1, 0x9e3779b1) ^ Math.imul(seq + 1, 0x85ebca6b)) >>> 0;
}

// ============================================================ tablas
/**
 * Tabla de valores de un tipo unión, en un orden fijo (lo que viaja es la posición). El compilador exige que estén
 * todos: si se añade un estado nuevo al juego y no se añade aquí, el proyecto no compila.
 */
function table<T extends string>() {
  return <const A extends readonly T[]>(a: A & ([Exclude<T, A[number]>] extends [never] ? unknown : 'falta un valor en la tabla')): A => a;
}

const MOVE_STATES = table<MoveState>()(['ground', 'air', 'roll', 'slide', 'vault', 'toCover', 'cover', 'locked', 'dead', 'fly']);
const POSTURES = table<Posture>()(['stand', 'crouch']);
const COVER_HEIGHTS = table<CoverHeight>()(['low', 'high']);
const AI_STATES = table<AiState>()(['patrol', 'suspicious', 'combat', 'cover', 'flank', 'search', 'stunned', 'dead']);
const ICONS = table<EnemyNet['icon']>()(['none', 'suspicious', 'alert', 'flank']);
const HIT_PARTS = table<HitPart>()(['torso', 'head', 'armL', 'armR', 'legL', 'legR']);
const CIV_STATES = table<CivState>()(['calm', 'flee', 'hide', 'dead']);
const PICKUP_KINDS = table<PickupKind>()(['ammo', 'medkit', 'armor']);
const WEAPON_IDS = table<WeaponId>()(['carbine', 'shotgun', 'dmr', 'pistol', 'revolver', 'knife']);
const ENEMY_TYPES = table<EnemyType>()(['thug', 'escort', 'marksman', 'heavy', 'boss', 'shield', 'hound', 'drone']);
const SHOT_SOUNDS = table<ShotSound>()([
  'carbine',
  'pistol',
  'pistolSilenced',
  'revolver',
  'dmr',
  'shotgun',
  'enemyPistol',
  'enemySmg',
  'enemyRifle',
  'enemyShotgun',
]);
const GRENADE_SOUNDS = table<GrenadeSound>()(['pin', 'throw', 'bounce', 'burst']);
const IMPACT_KINDS = table<ImpactKind>()(['spark', 'blood', 'dust']);
const HIT_MARKERS = table<HitMarkerKind>()(['body', 'head', 'kill', 'armor']);
const STYLE_ACTIONS = table<StyleAction>()([
  'kill',
  'headshot',
  'takedown',
  'perfectReload',
  'dodgeKill',
  'doubleTap',
  'coverKill',
  'noDamageKill',
  'knifeKill',
  'focusKill',
  'multiKill',
  'longShot',
  'stunned',
  'stunKill',
]);
const LEVELS = table<LevelId>()(['arena', 'practice', 'hub', 'nightclub', 'docks', 'rooftop']);
const MISSIONS = table<MissionId>()(['practice', 'nightclub', 'docks', 'rooftop', 'gauntlet']);
const OBJECTIVE_KINDS = table<ObjectiveKind>()(['reach', 'eliminate', 'interact', 'survive', 'escape', 'boss', 'waves', 'learn']);
const UPGRADES = table<UpgradeId>()([
  'extMag',
  'suppressor',
  'hollowPoint',
  'compensator',
  'suit1',
  'suit2',
  'suit3',
  'tacticalKnife',
  'shotgun',
  'revolver',
  'dmr',
  'extraMarker',
  'stunGrenade',
]);
/** Huecos del equipo que se empuñan (lo que pide cada tecla de arma). */
const WEAPON_SLOT_IDS = table<WeaponSlot>()(['primary', 'secondary', 'melee']);
const GEARS = table<GearId>()(['stun']);

/**
 * Huella de las tablas: dos versiones del juego con tablas distintas no se entenderían aunque el protocolo fuera el
 * mismo (la posición 3 significaría otra cosa). El saludo la compara.
 */
export const TABLES_HASH = hashText(
  [
    MOVE_STATES,
    POSTURES,
    COVER_HEIGHTS,
    AI_STATES,
    ICONS,
    HIT_PARTS,
    CIV_STATES,
    PICKUP_KINDS,
    WEAPON_IDS,
    WEAPON_SLOT_IDS,
    GEARS,
    ENEMY_TYPES,
    SHOT_SOUNDS,
    GRENADE_SOUNDS,
    IMPACT_KINDS,
    HIT_MARKERS,
    STYLE_ACTIONS,
    LEVELS,
    MISSIONS,
    OBJECTIVE_KINDS,
    UPGRADES,
  ]
    .map((t) => t.join(','))
    .join('|'),
);

function hashText(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
  return (h >>> 0).toString(36);
}

// ============================================================ lectura y escritura
/** Un mensaje que no cumple el formato. Se lanza al leer y lo recoge `decode*`, que descarta el mensaje entero. */
class Malformed extends Error {}
const MALFORMED = new Malformed('mensaje malformado');

/** Lee una tupla validando cada valor (tipo, rango, entero, tabla). */
class Reader {
  private i = 0;
  constructor(private readonly a: readonly unknown[]) {}

  num(min = -1e6, max = 1e6): number {
    const v = this.a[this.i++];
    if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max) throw MALFORMED;
    return v;
  }

  int(min: number, max: number): number {
    const v = this.num(min, max);
    if (!Number.isInteger(v)) throw MALFORMED;
    return v;
  }

  bool(): boolean {
    return this.int(0, 1) === 1;
  }

  pick<T>(tab: readonly T[]): T {
    return tab[this.int(0, tab.length - 1)]!;
  }

  /** Un valor de tabla o null (−1). */
  pickOrNull<T>(tab: readonly T[]): T | null {
    const i = this.int(-1, tab.length - 1);
    return i < 0 ? null : tab[i]!;
  }

  get left(): number {
    return this.a.length - this.i;
  }

  end(): void {
    if (this.i !== this.a.length) throw MALFORMED;
  }
}

function tuple(v: unknown, len?: number): Reader {
  if (!Array.isArray(v) || (len !== undefined && v.length !== len)) throw MALFORMED;
  return new Reader(v);
}

/** Un número suelto validado (entero en `intOf`). */
function numOf(v: unknown, min: number, max: number): number {
  return new Reader([v]).num(min, max);
}

function intOf(v: unknown, min: number, max: number): number {
  return new Reader([v]).int(min, max);
}

function list(v: unknown, max: number): unknown[] {
  if (!Array.isArray(v) || v.length > max) throw MALFORMED;
  return v;
}

function str(v: unknown, max: number): string {
  if (typeof v !== 'string' || v.length > max) throw MALFORMED;
  return v;
}

function obj(v: unknown): Record<string, unknown> {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) throw MALFORMED;
  return v as Record<string, unknown>;
}

/** Redondeo para el envío: milímetros en posiciones y milésimas en ángulos y fracciones. */
const q = (v: number, k = 1000): number => Math.round(v * k) / k;
/** Índice en su tabla (los valores siempre son de la tabla: lo garantiza el tipo). */
const ix = <T>(tab: readonly T[], v: T): number => tab.indexOf(v);
const POS = 1e4;

// ============================================================ movimiento
const MOVE_LEN = 18;

function writeMove(m: MoveNet, out: number[]): void {
  const c = m.cover;
  out.push(
    q(m.x),
    q(m.y),
    q(m.z),
    q(m.yaw),
    ix(MOVE_STATES, m.state),
    ix(POSTURES, m.posture),
    (m.grounded ? 1 : 0) | (m.aiming ? 2 : 0) | (m.sprinting ? 4 : 0) | (m.invulnerable ? 8 : 0),
    q(m.stateTime, 100),
    q(m.vault),
    m.dodges,
    c ? ix(COVER_HEIGHTS, c.height) : -1,
    c ? q(c.nx) : 0,
    c ? q(c.nz) : 0,
    c ? c.peekSide : 0,
    c ? q(c.peekOffset) : 0,
    c ? c.edgeNear : 0,
    c ? q(c.top) : 0,
    c ? q(c.impact) : 0,
  );
}

function readMove(r: Reader, out: MoveNet): MoveNet {
  out.x = r.num(-POS, POS);
  out.y = r.num(-POS, POS);
  out.z = r.num(-POS, POS);
  out.yaw = r.num(-1000, 1000);
  out.state = r.pick(MOVE_STATES);
  out.posture = r.pick(POSTURES);
  const f = r.int(0, 15);
  out.grounded = (f & 1) !== 0;
  out.aiming = (f & 2) !== 0;
  out.sprinting = (f & 4) !== 0;
  out.invulnerable = (f & 8) !== 0;
  out.stateTime = r.num(0, 1e7);
  out.vault = r.num(-1, 1);
  out.dodges = r.int(0, 1e7);
  const height = r.pickOrNull(COVER_HEIGHTS);
  const nx = r.num(-1.01, 1.01);
  const nz = r.num(-1.01, 1.01);
  const peekSide = r.int(-1, 1);
  const peekOffset = r.num(-2, 2);
  const edgeNear = r.int(-1, 1);
  const top = r.num(0, 3);
  const impact = r.num(0, 1);
  if (height) {
    const c = (out.cover ??= emptyCoverNet());
    c.nx = nx;
    c.nz = nz;
    c.height = height;
    c.peekSide = peekSide;
    c.peekOffset = peekOffset;
    c.edgeNear = edgeNear;
    c.top = top;
    c.impact = impact;
  } else out.cover = null;
  return out;
}

// ============================================================ entrada del invitado
/** Un paso del invitado: dónde está (lo decide él; el anfitrión lo comprueba) y lo que pide su combate. */
export interface InputFrame {
  /** Número de paso del invitado: el anfitrión aplica cada uno una sola vez y en orden. */
  seq: number;
  /** Instante de la partida (pasos del anfitrión, con decimales) que tenía en pantalla: con él se rebobina su disparo. */
  view: number;
  /** Vida en la que va: los pasos de antes de reaparecer ya no valen. */
  epoch: number;
  move: MoveNet;
  fireHeld: boolean;
  firePressed: boolean;
  aim: boolean;
  reloadPressed: boolean;
  takedownPressed: boolean;
  focusPressed: boolean;
  gearPressed: boolean;
  gearHeld: boolean;
  select: WeaponSlot | null;
  cycle: number;
  aimFrom: { x: number; y: number; z: number };
  aimDir: { x: number; y: number; z: number };
}

export function emptyInputFrame(): InputFrame {
  return {
    seq: 0,
    view: 0,
    epoch: 0,
    move: emptyMoveNet(),
    fireHeld: false,
    firePressed: false,
    aim: false,
    reloadPressed: false,
    takedownPressed: false,
    focusPressed: false,
    gearPressed: false,
    gearHeld: false,
    select: null,
    cycle: 0,
    aimFrom: { x: 0, y: 0, z: 0 },
    aimDir: { x: 0, y: 0, z: -1 },
  };
}

function writeFrame(f: InputFrame, out: number[]): void {
  out.push(f.seq, q(f.view, 100), f.epoch);
  writeMove(f.move, out);
  out.push(
    (f.fireHeld ? 1 : 0) |
      (f.firePressed ? 2 : 0) |
      (f.aim ? 4 : 0) |
      (f.reloadPressed ? 8 : 0) |
      (f.takedownPressed ? 16 : 0) |
      (f.focusPressed ? 32 : 0) |
      (f.gearPressed ? 64 : 0) |
      (f.gearHeld ? 128 : 0),
    f.select ? ix(WEAPON_SLOT_IDS, f.select) : -1,
    f.cycle,
    q(f.aimFrom.x),
    q(f.aimFrom.y),
    q(f.aimFrom.z),
    q(f.aimDir.x, 10000),
    q(f.aimDir.y, 10000),
    q(f.aimDir.z, 10000),
  );
}

function readFrame(v: unknown): InputFrame {
  const r = tuple(v, 3 + MOVE_LEN + 9);
  const f = emptyInputFrame();
  f.seq = r.int(0, 2 ** 31);
  f.view = r.num(0, 2 ** 31);
  f.epoch = r.int(0, 1e6);
  readMove(r, f.move);
  const b = r.int(0, 255);
  f.fireHeld = (b & 1) !== 0;
  f.firePressed = (b & 2) !== 0;
  f.aim = (b & 4) !== 0;
  f.reloadPressed = (b & 8) !== 0;
  f.takedownPressed = (b & 16) !== 0;
  f.focusPressed = (b & 32) !== 0;
  f.gearPressed = (b & 64) !== 0;
  f.gearHeld = (b & 128) !== 0;
  f.select = r.pickOrNull(WEAPON_SLOT_IDS);
  f.cycle = r.int(-1, 1);
  f.aimFrom.x = r.num(-POS, POS);
  f.aimFrom.y = r.num(-POS, POS);
  f.aimFrom.z = r.num(-POS, POS);
  f.aimDir.x = r.num(-1.01, 1.01);
  f.aimDir.y = r.num(-1.01, 1.01);
  f.aimDir.z = r.num(-1.01, 1.01);
  r.end();
  const len = Math.hypot(f.aimDir.x, f.aimDir.y, f.aimDir.z);
  if (len < 0.5) throw MALFORMED;
  f.aimDir.x /= len;
  f.aimDir.y /= len;
  f.aimDir.z /= len;
  return f;
}

// ============================================================ instantánea
export interface PlayerNet {
  id: number;
  move: MoveNet;
  look: PlayerLook;
}

export interface PickupNet {
  id: number;
  kind: PickupKind;
  x: number;
  y: number;
  z: number;
}

/** Una granada en vuelo (de quién es: cada invitado dibuja las suyas sin esperar al anfitrión). */
export interface GrenadeNet {
  id: number;
  kind: GearId;
  owner: number;
  x: number;
  y: number;
  z: number;
}

/** Lo que el invitado necesita de la misión para su pantalla (los textos llegan aparte, cuando cambian). */
export interface MissionNet {
  beacon: { x: number; y: number; z: number } | null;
  markersUsed: number;
  markersTotal: number;
  /** Tipo del objetivo en curso (la música cambia en el jefe y en la huida). */
  objective: ObjectiveKind | null;
  /** El Continental es zona hostil (música de tensión). */
  hostile: boolean;
  alarm: boolean;
  /** Objetos de la misión ya usados (por cualquiera): ya no se pueden volver a usar. */
  used: string[];
}

export function emptyMissionNet(): MissionNet {
  return { beacon: null, markersUsed: 0, markersTotal: 0, objective: null, hostile: false, alarm: false, used: [] };
}

/** Lo que solo le importa a un invitado de sí mismo: su salud, su estilo y su munición tal como la ve el anfitrión. */
export interface OwnerNet {
  /** Último paso suyo que el anfitrión aplicó (la munición es la de ese paso). */
  ack: number;
  epoch: number;
  health: number;
  armor: number;
  maxHealth: number;
  maxArmor: number;
  dead: boolean;
  score: number;
  multiplier: number;
  gauge: number;
  /** Cuánto equipo le queda por lanzar. */
  gear: number;
  /** Cargador y reserva de cada arma (−1 = reserva infinita). */
  ammo: Array<{ weapon: WeaponId; mag: number; reserve: number }>;
}

/** Efecto visual o sonido de algo que pasó en la partida; `owner` es el jugador que lo causó (−1: el mundo). */
export type FxTuple = readonly number[];

export interface Snapshot {
  tick: number;
  players: PlayerNet[];
  enemies: EnemyNet[];
  civilians: CivilianNet[];
  pickups: PickupNet[];
  grenades: GrenadeNet[];
  fx: FxTuple[];
  mission: MissionNet;
  owner: OwnerNet | null;
}

function writePlayer(p: PlayerNet): number[] {
  const out = [p.id];
  writeMove(p.move, out);
  const l = p.look;
  out.push(
    l.weapon === 'none' ? -1 : ix(WEAPON_IDS, l.weapon),
    (l.aim ? 1 : 0) | (l.dead ? 2 : 0) | (l.blind << 2),
    q(l.aimPitch),
    q(l.reload),
    q(l.recoil, 100),
    q(l.melee, 100),
    q(l.slash),
    q(l.takedown),
    q(l.throw),
    q(l.health, 100),
  );
  return out;
}

function readPlayer(v: unknown): PlayerNet {
  const r = tuple(v, 1 + MOVE_LEN + 10);
  const id = r.int(0, MAX_PLAYERS - 1);
  const move = readMove(r, emptyMoveNet());
  const weapon = r.pickOrNull(WEAPON_IDS) ?? 'none';
  // Bits: apuntando, caído y el disparo a ciegas (0..2) a partir del tercero.
  const f = r.int(0, 11);
  const look: PlayerLook = {
    weapon,
    aim: (f & 1) !== 0,
    dead: (f & 2) !== 0,
    blind: (f >> 2) as BlindMode,
    aimPitch: r.num(-2, 2),
    reload: r.num(-1, 1),
    recoil: r.num(0, 1),
    melee: r.num(0, 1),
    slash: r.num(-1, 1),
    takedown: r.num(-1, 10),
    throw: r.num(-1, 1),
    health: r.num(0, 1),
  };
  r.end();
  return { id, move, look };
}

const ENEMY_LEN = 2 + MOVE_LEN + 25;

function writeEnemy(e: EnemyNet): number[] {
  const out = [e.uid, ix(ENEMY_TYPES, e.type)];
  writeMove(e.move, out);
  out.push(
    ix(AI_STATES, e.ai),
    (e.aim ? 1 : 0) |
      (e.alive ? 2 : 0) |
      (e.hasLook ? 4 : 0) |
      (e.dazed ? 8 : 0) |
      (e.flinchFront ? 16 : 0) |
      (e.hidden ? 32 : 0) |
      (e.shieldUp ? 64 : 0) |
      (e.shieldBroken ? 128 : 0),
    q(e.health, 10),
    q(e.hitFlash),
    q(e.recoilVis, 100),
    q(e.flinch, 100),
    e.flinchSide,
    ix(HIT_PARTS, e.hitPart),
    q(e.stagger, 100),
    e.limp,
    q(e.reload, 100),
    q(e.lunge, 100),
    e.deathStyle,
    q(e.deathFallStart),
    q(e.thrownT),
    q(e.targetRise, 100),
    ix(ICONS, e.icon),
    q(e.detection, 100),
    q(e.telegraph, 100),
    q(e.lookX, 100),
    q(e.lookY, 100),
    q(e.lookZ, 100),
    q(e.telegraphX, 100),
    q(e.telegraphY, 100),
    q(e.telegraphZ, 100),
  );
  return out;
}

function readEnemy(v: unknown): EnemyNet {
  const r = tuple(v, ENEMY_LEN);
  const e = emptyEnemyNet();
  e.uid = r.int(1, 2 ** 31);
  e.type = r.pick(ENEMY_TYPES);
  readMove(r, e.move);
  e.ai = r.pick(AI_STATES);
  const f = r.int(0, 255);
  e.aim = (f & 1) !== 0;
  e.alive = (f & 2) !== 0;
  e.hasLook = (f & 4) !== 0;
  e.dazed = (f & 8) !== 0;
  e.flinchFront = (f & 16) !== 0;
  e.hidden = (f & 32) !== 0;
  e.shieldUp = (f & 64) !== 0;
  e.shieldBroken = (f & 128) !== 0;
  e.health = r.num(-1e4, 1e5);
  e.hitFlash = r.num(0, 10);
  e.recoilVis = r.num(0, 1);
  e.flinch = r.num(0, 1);
  e.flinchSide = r.int(-1, 1);
  e.hitPart = r.pick(HIT_PARTS);
  e.stagger = r.num(0, 1);
  e.limp = r.int(-1, 1);
  e.reload = r.num(-1, 1);
  e.lunge = r.num(-1, 1);
  e.deathStyle = r.int(0, 5) as DeathStyle;
  e.deathFallStart = r.num(0, 100);
  e.thrownT = r.num(-1, 100);
  e.targetRise = r.num(0, 3);
  e.icon = r.pick(ICONS);
  e.detection = r.num(0, 1);
  e.telegraph = r.num(0, 1);
  e.lookX = r.num(-POS, POS);
  e.lookY = r.num(-POS, POS);
  e.lookZ = r.num(-POS, POS);
  e.telegraphX = r.num(-POS, POS);
  e.telegraphY = r.num(-POS, POS);
  e.telegraphZ = r.num(-POS, POS);
  r.end();
  return e;
}

function writeCivilian(c: CivilianNet): number[] {
  const out: number[] = [];
  writeMove(c.move, out);
  out.push(ix(CIV_STATES, c.state), c.alive ? 1 : 0);
  return out;
}

function readCivilian(v: unknown): CivilianNet {
  const r = tuple(v, MOVE_LEN + 2);
  const move = readMove(r, emptyMoveNet());
  const c: CivilianNet = { move, state: r.pick(CIV_STATES), alive: r.bool() };
  r.end();
  return c;
}

function writeMission(m: MissionNet): number[] {
  const b = m.beacon;
  return [
    b ? 1 : 0,
    b ? q(b.x, 100) : 0,
    b ? q(b.y, 100) : 0,
    b ? q(b.z, 100) : 0,
    m.markersUsed,
    m.markersTotal,
    m.objective ? ix(OBJECTIVE_KINDS, m.objective) : -1,
    m.hostile ? 1 : 0,
    m.alarm ? 1 : 0,
  ];
}

function readMission(v: unknown): Omit<MissionNet, 'used'> {
  const r = tuple(v, 9);
  const has = r.bool();
  const x = r.num(-POS, POS);
  const y = r.num(-POS, POS);
  const z = r.num(-POS, POS);
  const m: Omit<MissionNet, 'used'> = {
    beacon: has ? { x, y, z } : null,
    markersUsed: r.int(0, 99),
    markersTotal: r.int(0, 99),
    objective: r.pickOrNull(OBJECTIVE_KINDS),
    hostile: r.bool(),
    alarm: r.bool(),
  };
  r.end();
  return m;
}

function writeOwner(o: OwnerNet): number[] {
  const out = [
    o.ack,
    o.epoch,
    q(o.health, 10),
    q(o.armor, 10),
    q(o.maxHealth, 10),
    q(o.maxArmor, 10),
    o.dead ? 1 : 0,
    Math.round(o.score),
    o.multiplier,
    q(o.gauge),
    o.gear,
    o.ammo.length,
  ];
  for (const a of o.ammo) out.push(ix(WEAPON_IDS, a.weapon), a.mag, Number.isFinite(a.reserve) ? a.reserve : -1);
  return out;
}

function readOwner(v: unknown): OwnerNet {
  const r = tuple(v);
  const o: OwnerNet = {
    ack: r.int(0, 2 ** 31),
    epoch: r.int(0, 1e6),
    health: r.num(0, 1e4),
    armor: r.num(0, 1e4),
    maxHealth: r.num(0, 1e4),
    maxArmor: r.num(0, 1e4),
    dead: r.bool(),
    score: r.int(0, 1e9),
    multiplier: r.int(1, 99),
    gauge: r.num(0, 2),
    gear: r.int(0, 99),
    ammo: [],
  };
  const n = r.int(0, WEAPON_IDS.length);
  for (let i = 0; i < n; i++) {
    const weapon = r.pick(WEAPON_IDS);
    const mag = r.int(0, 1e4);
    const reserve = r.int(-1, 1e6);
    o.ammo.push({ weapon, mag, reserve: reserve < 0 ? Number.POSITIVE_INFINITY : reserve });
  }
  r.end();
  return o;
}

// ============================================================ efectos
/** Códigos de efecto y la longitud de su tupla (código y autor incluidos). */
export const FX = {
  impact: 0,
  tracer: 1,
  muzzle: 2,
  decal: 3,
  casing: 4,
  shot: 5,
  alert: 6,
  beep: 7,
  grenade: 8,
  burst: 9,
} as const;
const FX_LEN = [10, 10, 9, 8, 9, 6, 5, 6, 6, 5] as const;

export const fxTables = { impact: IMPACT_KINDS, shot: SHOT_SOUNDS, grenade: GRENADE_SOUNDS } as const;

function readFx(v: unknown): FxTuple {
  const r = tuple(v);
  const code = r.int(0, FX_LEN.length - 1);
  const a = v as number[];
  if (a.length !== FX_LEN[code]) throw MALFORMED;
  r.int(-1, MAX_PLAYERS - 1);
  while (r.left > 0) r.num(-POS, 0xffffff);
  // Los valores de tabla, dentro de su tabla.
  if (code === FX.impact && !(Number.isInteger(a[8]) && a[8]! >= 0 && a[8]! < IMPACT_KINDS.length)) throw MALFORMED;
  if (code === FX.shot && !(Number.isInteger(a[2]) && a[2]! >= 0 && a[2]! < SHOT_SOUNDS.length)) throw MALFORMED;
  if (code === FX.grenade && !(Number.isInteger(a[2]) && a[2]! >= 0 && a[2]! < GRENADE_SOUNDS.length)) throw MALFORMED;
  return a;
}

// ============================================================ mensajes
export interface CoopResults {
  mission: MissionId;
  success: boolean;
  failReason: string;
  rank: string;
  total: number;
  timeSec: number;
  kills: number;
  coins: number;
}

/** Lo que le pasa a un invitado y solo le importa a él: llega de forma fiable y en orden. */
export type OwnerEvent =
  | { e: 'marker'; kind: HitMarkerKind }
  | { e: 'award'; action: StyleAction; points: number }
  | { e: 'pickup'; kind: PickupKind }
  | { e: 'hurt'; x: number; y: number; z: number; damage: number; enemy: EnemyType; distance: number }
  | { e: 'died' }
  /** Aparece (al entrar en el nivel) o reaparece: el anfitrión decide dónde. */
  | { e: 'spawn'; x: number; y: number; z: number; yaw: number; epoch: number };

export type RejectReason = 'version' | 'full' | 'closed';

/** Mensajes fiables del invitado al anfitrión. */
export type GuestCtl =
  /** `rejoin`: vuelve tras un corte con la plaza que tenía (su id y la contraseña que le dio el anfitrión). */
  | { t: 'hello'; v: number; tables: string; upgrades: UpgradeId[]; loadout: Loadout; rejoin?: RejoinTicket }
  /** Cambió su equipo en la sala: lo llevará en la siguiente partida (el anfitrión lo sanea con sus mejoras). */
  | { t: 'loadout'; loadout: Loadout }
  | { t: 'ready'; level: LevelId }
  /** Usar un objeto de la misión (terminal, panel): el anfitrión comprueba que esté a su alcance. */
  | { t: 'interact'; id: string }
  | { t: 'ping'; n: number }
  | { t: 'bye' };

/** Mensajes fiables del anfitrión a un invitado. */
export type HostCtl =
  /** Su plaza y la contraseña para recuperarla si se corta la conexión. */
  | { t: 'welcome'; id: number; token: string }
  | { t: 'reject'; why: RejectReason }
  /** La sala: quién está (los ids de los jugadores) y el nivel en juego (null: en la sala, sin partida). */
  | { t: 'lobby'; ids: number[]; level: LevelId | null }
  | { t: 'start'; level: LevelId; mission: MissionId | null }
  | { t: 'hud'; k: 'toast'; text: string; seconds: number }
  | { t: 'hud'; k: 'objective' | 'zone'; text: string }
  | { t: 'hud'; k: 'combat'; on: boolean }
  | { t: 'me'; ev: OwnerEvent }
  | { t: 'end'; r: CoopResults }
  | { t: 'pong'; n: number }
  | { t: 'bye' };

const TEXT_MAX = 240;

export function encodeGuestCtl(m: GuestCtl): string {
  return JSON.stringify(m);
}

export function decodeGuestCtl(s: string): GuestCtl | null {
  return guard(s, (v) => {
    const o = obj(v);
    switch (o.t) {
      case 'hello': {
        const ups = list(o.upgrades, UPGRADES.length).map((u) => {
          const id = str(u, 32) as UpgradeId;
          if (!UPGRADES.includes(id)) throw MALFORMED;
          return id;
        });
        const hello: GuestCtl = { t: 'hello', v: intOf(o.v, 0, 1e6), tables: str(o.tables, 32), upgrades: ups, loadout: loadoutOf(o.loadout) };
        if (o.rejoin !== undefined) {
          const r = obj(o.rejoin);
          hello.rejoin = { id: intOf(r.id, 1, MAX_PLAYERS - 1), token: token(r.token) };
        }
        return hello;
      }
      case 'ready': {
        const level = str(o.level, 16) as LevelId;
        if (!LEVELS.includes(level)) throw MALFORMED;
        return { t: 'ready', level };
      }
      case 'loadout':
        return { t: 'loadout', loadout: loadoutOf(o.loadout) };
      case 'ping':
        return { t: 'ping', n: intOf(o.n, 0, 2 ** 31) };
      case 'interact':
        return { t: 'interact', id: objectId(o.id) };
      case 'bye':
        return { t: 'bye' };
      default:
        throw MALFORMED;
    }
  });
}

/**
 * Un equipo recibido: cada hueco con un arma conocida y el equipo conocido o ninguno. Que el arma sea de su hueco y que
 * el invitado la tenga lo comprueba el anfitrión con sus mejoras (`normalizeLoadout`).
 */
function loadoutOf(v: unknown): Loadout {
  const o = obj(v);
  const weapon = (x: unknown): WeaponId => {
    const id = str(x, 16) as WeaponId;
    if (!WEAPON_IDS.includes(id)) throw MALFORMED;
    return id;
  };
  let gear: GearId | null = null;
  if (o.gear !== null && o.gear !== undefined) {
    gear = str(o.gear, 16) as GearId;
    if (!GEARS.includes(gear)) throw MALFORMED;
  }
  return { primary: weapon(o.primary), secondary: weapon(o.secondary), melee: weapon(o.melee), gear };
}

/** Contraseña para recuperar una plaza: la da el anfitrión y solo él la comprueba. */
export interface RejoinTicket {
  id: number;
  token: string;
}

function token(v: unknown): string {
  const s = str(v, 32);
  if (!/^[a-z0-9]{12,32}$/.test(s)) throw MALFORMED;
  return s;
}

/** Id de un objeto del nivel: corto y con los caracteres que usan los datos de los niveles. */
function objectId(v: unknown): string {
  const id = str(v, 40);
  if (!/^[a-zA-Z0-9_:#-]+$/.test(id)) throw MALFORMED;
  return id;
}

export function encodeHostCtl(m: HostCtl): string {
  if (m.t === 'me' && m.ev.e === 'hurt') {
    const ev = m.ev;
    return JSON.stringify({
      t: 'me',
      ev: { ...ev, x: q(ev.x, 100), y: q(ev.y, 100), z: q(ev.z, 100), damage: q(ev.damage, 10), distance: q(ev.distance, 10) },
    });
  }
  return JSON.stringify(m);
}

export function decodeHostCtl(s: string): HostCtl | null {
  return guard(s, (v): HostCtl => {
    const o = obj(v);
    switch (o.t) {
      case 'welcome':
        return { t: 'welcome', id: intOf(o.id, 1, MAX_PLAYERS - 1), token: token(o.token) };
      case 'reject': {
        const why = str(o.why, 16) as RejectReason;
        if (why !== 'version' && why !== 'full' && why !== 'closed') throw MALFORMED;
        return { t: 'reject', why };
      }
      case 'lobby': {
        const level = o.level === null ? null : (str(o.level, 16) as LevelId);
        if (level !== null && !LEVELS.includes(level)) throw MALFORMED;
        return { t: 'lobby', ids: list(o.ids, MAX_PLAYERS).map((id) => intOf(id, 0, MAX_PLAYERS - 1)), level };
      }
      case 'start': {
        const level = str(o.level, 16) as LevelId;
        if (!LEVELS.includes(level)) throw MALFORMED;
        const mission = o.mission === null ? null : (str(o.mission, 16) as MissionId);
        if (mission !== null && !MISSIONS.includes(mission)) throw MALFORMED;
        return { t: 'start', level, mission };
      }
      case 'hud':
        if (o.k === 'toast') return { t: 'hud', k: 'toast', text: str(o.text, TEXT_MAX), seconds: numOf(o.seconds, 0, 30) };
        if (o.k === 'objective' || o.k === 'zone') return { t: 'hud', k: o.k, text: str(o.text, TEXT_MAX) };
        if (o.k === 'combat' && typeof o.on === 'boolean') return { t: 'hud', k: 'combat', on: o.on };
        throw MALFORMED;
      case 'me':
        return { t: 'me', ev: readEvent(obj(o.ev)) };
      case 'end':
        return { t: 'end', r: readResults(obj(o.r)) };
      case 'pong':
        return { t: 'pong', n: intOf(o.n, 0, 2 ** 31) };
      case 'bye':
        return { t: 'bye' };
      default:
        throw MALFORMED;
    }
  });
}

function readEvent(o: Record<string, unknown>): OwnerEvent {
  const n = (v: unknown, min = -POS, max = POS): number => numOf(v, min, max);
  switch (o.e) {
    case 'marker': {
      const kind = str(o.kind, 8) as HitMarkerKind;
      if (!HIT_MARKERS.includes(kind)) throw MALFORMED;
      return { e: 'marker', kind };
    }
    case 'award': {
      const action = str(o.action, 16) as StyleAction;
      if (!STYLE_ACTIONS.includes(action)) throw MALFORMED;
      return { e: 'award', action, points: intOf(o.points, 0, 1e7) };
    }
    case 'pickup': {
      const kind = str(o.kind, 8) as PickupKind;
      if (!PICKUP_KINDS.includes(kind)) throw MALFORMED;
      return { e: 'pickup', kind };
    }
    case 'hurt': {
      const enemy = str(o.enemy, 12) as EnemyType;
      if (!ENEMY_TYPES.includes(enemy)) throw MALFORMED;
      return { e: 'hurt', x: n(o.x), y: n(o.y), z: n(o.z), damage: n(o.damage, 0, 1e4), enemy, distance: n(o.distance, 0, POS) };
    }
    case 'died':
      return { e: 'died' };
    case 'spawn':
      return { e: 'spawn', x: n(o.x), y: n(o.y), z: n(o.z), yaw: n(o.yaw, -1000, 1000), epoch: intOf(o.epoch, 0, 1e6) };
    default:
      throw MALFORMED;
  }
}

function readResults(o: Record<string, unknown>): CoopResults {
  const mission = str(o.mission, 16) as MissionId;
  if (!MISSIONS.includes(mission) || typeof o.success !== 'boolean') throw MALFORMED;
  return {
    mission,
    success: o.success,
    failReason: str(o.failReason, TEXT_MAX),
    rank: str(o.rank, 8),
    total: numOf(o.total, 0, 1e4),
    timeSec: numOf(o.timeSec, 0, 1e7),
    kills: intOf(o.kills, 0, 1e5),
    coins: intOf(o.coins, 0, 1e5),
  };
}

/** Entrada del invitado: los últimos pasos (repetidos para resistir la pérdida de paquetes). */
export function encodeInput(frames: readonly InputFrame[]): string {
  return JSON.stringify({
    t: 'i',
    f: frames.map((f) => {
      const out: number[] = [];
      writeFrame(f, out);
      return out;
    }),
  });
}

export function decodeInput(s: string): InputFrame[] | null {
  return guard(s, (v) => {
    const o = obj(v);
    if (o.t !== 'i') throw MALFORMED;
    return list(o.f, 16).map(readFrame);
  });
}

/**
 * La parte común de una instantánea, ya en texto: se escribe una vez y se completa para cada invitado con lo suyo
 * (`withOwner`), en vez de serializar todo por cada uno.
 */
export function encodeSnapshotBody(s: Omit<Snapshot, 'owner'>): string {
  return JSON.stringify({
    t: 's',
    k: s.tick,
    p: s.players.map(writePlayer),
    e: s.enemies.map(writeEnemy),
    c: s.civilians.map(writeCivilian),
    u: s.pickups.map((p) => [p.id, ix(PICKUP_KINDS, p.kind), q(p.x, 100), q(p.y, 100), q(p.z, 100)]),
    g: s.grenades.map((g) => [g.id, ix(GEARS, g.kind), g.owner, q(g.x, 100), q(g.y, 100), q(g.z, 100)]),
    f: s.fx.slice(0, MAX_FX),
    m: writeMission(s.mission),
    n: s.mission.used,
  });
}

/** Completa el cuerpo de una instantánea con lo que solo le importa a un invitado. */
export function withOwner(body: string, owner: OwnerNet | null): string {
  return owner ? `${body.slice(0, -1)},"o":${JSON.stringify(writeOwner(owner))}}` : body;
}

export function decodeSnapshot(s: string): Snapshot | null {
  return guard(s, (v) => {
    const o = obj(v);
    if (o.t !== 's') throw MALFORMED;
    return {
      tick: intOf(o.k, 0, 2 ** 31),
      players: list(o.p, MAX_PLAYERS).map(readPlayer),
      enemies: list(o.e, 512).map(readEnemy),
      civilians: list(o.c, 256).map(readCivilian),
      pickups: list(o.u, 512).map((u) => {
        const r = tuple(u, 5);
        const p: PickupNet = { id: r.int(1, 2 ** 31), kind: r.pick(PICKUP_KINDS), x: r.num(-POS, POS), y: r.num(-POS, POS), z: r.num(-POS, POS) };
        r.end();
        return p;
      }),
      grenades: list(o.g, 64).map((x) => {
        const r = tuple(x, 6);
        const g: GrenadeNet = {
          id: r.int(1, 2 ** 31),
          kind: r.pick(GEARS),
          owner: r.int(0, MAX_PLAYERS - 1),
          x: r.num(-POS, POS),
          y: r.num(-POS, POS),
          z: r.num(-POS, POS),
        };
        r.end();
        return g;
      }),
      fx: list(o.f, MAX_FX).map(readFx),
      mission: { ...readMission(o.m), used: o.n === undefined ? [] : list(o.n, 64).map(objectId) },
      owner: o.o === undefined ? null : readOwner(o.o),
    };
  });
}

/** Tipo de un mensaje del canal de simulación sin leerlo entero (para repartirlo). */
export function simKind(s: string): 'i' | 's' | null {
  return s.startsWith('{"t":"i"') ? 'i' : s.startsWith('{"t":"s"') ? 's' : null;
}

/** Lee un mensaje: si no es JSON, es demasiado largo o no cumple el formato, null (y nada a medias). */
function guard<T>(s: string, read: (v: unknown) => T): T | null {
  if (typeof s !== 'string' || s.length > MAX_MESSAGE_CHARS) return null;
  let v: unknown;
  try {
    v = JSON.parse(s);
  } catch {
    return null;
  }
  try {
    return read(v);
  } catch (e) {
    if (e instanceof Malformed) return null;
    throw e;
  }
}
