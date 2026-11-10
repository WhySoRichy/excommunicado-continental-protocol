import type { UpgradeId } from '../combat/weapons';
import { MISSION_ORDER, type MissionId, type Rank, RANKS } from '../missions/types';

/**
 * Guardado versionado y VALIDADO (lógica pura: el almacenamiento se inyecta).
 * Una partida corrupta nunca rompe el juego: se respalda y se empieza de cero.
 */
export const SAVE_VERSION = 1;
export const PROFILE_KEY = 'excom.profile';
export const SETTINGS_KEY = 'excom.settings';

export interface KeyValueStore {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

export interface BestResult {
  rank: Rank;
  score: number;
  timeSec: number;
}

export interface GauntletEntry {
  waves: number;
  score: number;
  date: number;
}

export interface Profile {
  version: number;
  createdAt: number;
  updatedAt: number;
  coins: number;
  upgrades: UpgradeId[];
  completed: MissionId[];
  best: Partial<Record<MissionId, BestResult>>;
  achievements: string[];
  flags: Record<string, boolean>;
  excommunicados: number;
  gauntlet: GauntletEntry[];
  playtimeSec: number;
}

export type LoadStatus = 'new' | 'loaded' | 'migrated' | 'reset-corrupt';

export const ALL_UPGRADES: readonly UpgradeId[] = ['extMag', 'suppressor', 'hollowPoint', 'compensator', 'suit1', 'suit2', 'suit3', 'tacticalKnife', 'shotgun', 'extraMarker'];
export const GAUNTLET_TOP = 10;
/** Fondos iniciales: la "cortesía del Continental" (GAME_DESIGN §5.2). */
export const STARTING_COINS = 8;
const MAX_COINS = 9999;

export function newProfile(now = Date.now()): Profile {
  return {
    version: SAVE_VERSION,
    createdAt: now,
    updatedAt: now,
    coins: STARTING_COINS,
    upgrades: [],
    completed: [],
    best: {},
    achievements: [],
    flags: {},
    excommunicados: 0,
    gauntlet: [],
    playtimeSec: 0,
  };
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function num(x: unknown, fallback: number, min: number, max: number): number {
  if (typeof x !== 'number' || !Number.isFinite(x)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(x)));
}

function stringList<T extends string>(x: unknown, allowed: readonly T[]): T[] {
  if (!Array.isArray(x)) return [];
  const out: T[] = [];
  for (const v of x) if (typeof v === 'string' && (allowed as readonly string[]).includes(v) && !out.includes(v as T)) out.push(v as T);
  return out;
}

/**
 * Valida un objeto desconocido y devuelve un perfil saneado, o null si no es un perfil.
 * Campos faltantes toman valores por defecto; valores fuera de rango se recortan.
 */
export function validateProfile(x: unknown, now = Date.now()): Profile | null {
  if (!isRecord(x)) return null;
  if (typeof x.version !== 'number' || x.version < 1 || x.version > SAVE_VERSION) return null;
  const p = newProfile(now);
  p.createdAt = num(x.createdAt, now, 0, 8.64e15);
  p.updatedAt = num(x.updatedAt, now, 0, 8.64e15);
  p.coins = num(x.coins, STARTING_COINS, 0, MAX_COINS);
  p.upgrades = stringList(x.upgrades, ALL_UPGRADES);
  p.completed = stringList(x.completed, MISSION_ORDER);
  p.excommunicados = num(x.excommunicados, 0, 0, 1e6);
  p.playtimeSec = num(x.playtimeSec, 0, 0, 1e9);
  if (Array.isArray(x.achievements)) p.achievements = [...new Set(x.achievements.filter((a): a is string => typeof a === 'string' && a.length < 64))];
  if (isRecord(x.flags)) for (const [k, v] of Object.entries(x.flags)) if (typeof v === 'boolean' && k.length < 64) p.flags[k] = v;
  if (isRecord(x.best)) {
    for (const id of MISSION_ORDER) {
      const b = x.best[id];
      if (!isRecord(b)) continue;
      if (typeof b.rank !== 'string' || !(RANKS as readonly string[]).includes(b.rank)) continue;
      p.best[id] = { rank: b.rank as Rank, score: num(b.score, 0, 0, 1e9), timeSec: num(b.timeSec, 0, 0, 1e7) };
    }
  }
  if (Array.isArray(x.gauntlet)) {
    p.gauntlet = x.gauntlet
      .filter(isRecord)
      .map((g) => ({ waves: num(g.waves, 0, 0, 1e6), score: num(g.score, 0, 0, 1e9), date: num(g.date, now, 0, 8.64e15) }))
      .filter((g) => g.waves > 0);
    sortGauntlet(p.gauntlet);
    p.gauntlet.length = Math.min(p.gauntlet.length, GAUNTLET_TOP);
  }
  return p;
}

export function sortGauntlet(list: GauntletEntry[]): void {
  list.sort((a, b) => b.waves - a.waves || b.score - a.score || a.date - b.date);
}

/** Inserta un resultado del Gauntlet en el top 10 local. Devuelve la posición (1..10) o 0 si no entra. */
export function recordGauntlet(p: Profile, entry: GauntletEntry): number {
  p.gauntlet.push(entry);
  sortGauntlet(p.gauntlet);
  const pos = p.gauntlet.indexOf(entry) + 1;
  p.gauntlet.length = Math.min(p.gauntlet.length, GAUNTLET_TOP);
  return pos <= GAUNTLET_TOP ? pos : 0;
}

/** Actualiza el mejor resultado de una misión si mejora el rango o, a igual rango, el puntaje. */
export function recordBest(p: Profile, id: MissionId, r: BestResult): boolean {
  const prev = p.best[id];
  const better = !prev || RANKS.indexOf(r.rank) > RANKS.indexOf(prev.rank) || (r.rank === prev.rank && r.score > prev.score);
  if (better) p.best[id] = { ...r };
  if (!p.completed.includes(id)) p.completed.push(id);
  return better;
}

export interface LoadResult {
  profile: Profile;
  status: LoadStatus;
}

/** Carga el perfil. Si el JSON está corrupto se respalda en "<clave>.corrupt" y se crea uno nuevo. */
export function loadProfile(kv: KeyValueStore, now = Date.now()): LoadResult {
  const raw = kv.get(PROFILE_KEY);
  if (raw === null) return { profile: newProfile(now), status: 'new' };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch (err) {
    console.warn('[save] perfil ilegible, se respalda y se reinicia:', err instanceof Error ? err.message : err);
    kv.set(`${PROFILE_KEY}.corrupt`, raw);
    return { profile: newProfile(now), status: 'reset-corrupt' };
  }
  const migrated = migrate(parsed);
  const profile = validateProfile(migrated, now);
  if (!profile) {
    console.warn('[save] perfil inválido, se respalda y se reinicia');
    kv.set(`${PROFILE_KEY}.corrupt`, raw);
    return { profile: newProfile(now), status: 'reset-corrupt' };
  }
  const wasOld = isRecord(parsed) && parsed.version !== SAVE_VERSION;
  return { profile, status: wasOld ? 'migrated' : 'loaded' };
}

/** Migraciones entre versiones (hoy solo existe la v1; la cadena queda lista). */
function migrate(x: unknown): unknown {
  if (!isRecord(x)) return x;
  const v = typeof x.version === 'number' ? x.version : 0;
  if (v === 0) return { ...x, version: 1 };
  return x;
}

export function saveProfile(kv: KeyValueStore, p: Profile, now = Date.now()): void {
  p.updatedAt = now;
  p.version = SAVE_VERSION;
  kv.set(PROFILE_KEY, JSON.stringify(p));
}

export function deleteProfile(kv: KeyValueStore): void {
  kv.remove(PROFILE_KEY);
}

/** Almacén en memoria (tests y navegadores sin localStorage). */
export class MemoryStore implements KeyValueStore {
  readonly map = new Map<string, string>();
  get(k: string): string | null {
    return this.map.get(k) ?? null;
  }
  set(k: string, v: string): void {
    this.map.set(k, v);
  }
  remove(k: string): void {
    this.map.delete(k);
  }
}

/**
 * localStorage con degradación: si el navegador lo bloquea (modo privado, permisos),
 * se avisa UNA vez y se sigue en memoria (la partida dura la sesión).
 */
export class BrowserStore implements KeyValueStore {
  private fallback: MemoryStore | null = null;
  private warned = false;

  private fail(err: unknown): MemoryStore {
    if (!this.warned) {
      this.warned = true;
      console.warn('[save] localStorage no disponible; la partida solo durará esta sesión:', err instanceof Error ? err.message : err);
    }
    this.fallback ??= new MemoryStore();
    return this.fallback;
  }

  get(k: string): string | null {
    if (this.fallback) return this.fallback.get(k);
    try {
      return window.localStorage.getItem(k);
    } catch (err) {
      return this.fail(err).get(k);
    }
  }

  set(k: string, v: string): void {
    if (this.fallback) {
      this.fallback.set(k, v);
      return;
    }
    try {
      window.localStorage.setItem(k, v);
    } catch (err) {
      this.fail(err).set(k, v);
    }
  }

  remove(k: string): void {
    if (this.fallback) {
      this.fallback.remove(k);
      return;
    }
    try {
      window.localStorage.removeItem(k);
    } catch (err) {
      this.fail(err).remove(k);
    }
  }
}
