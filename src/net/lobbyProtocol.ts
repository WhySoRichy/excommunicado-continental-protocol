import type { MissionId } from '../missions/types';

/**
 * Protocolo del servicio de salas (bloque 1 de docs/VISION.md). El servicio solo junta a los jugadores: lista las salas
 * abiertas, da a cada sala un código corto y pasa entre anfitrión e invitado las descripciones de la conexión WebRTC.
 * La partida no pasa por él: va directa de un equipo a otro, como siempre.
 *
 * Lo comparten el juego y el servidor (`server/salas`), así que no importa nada del juego en tiempo de ejecución.
 *
 * - `GET /rooms?v=...`: salas abiertas con esa versión del juego.
 * - WebSocket `/host?v=...`: abre una sala; el servicio responde con su código.
 * - WebSocket `/join?code=...&v=...`: pide entrar en una sala.
 * - `GET /turn`: credenciales del relé para las redes que no permiten la conexión directa.
 */

/** Alfabeto de los códigos de sala: sin letras ni números que se confundan (0/O, 1/I/L). */
export const ROOM_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const ROOM_CODE_LEN = 5;
/** Salas abiertas a la vez como mucho (un tope contra el abuso del servicio gratuito). */
export const MAX_ROOMS = 300;
/** Plazas por sala (las del cooperativo). */
export const ROOM_SEATS = 4;
/** Una descripción de conexión ocupa unos pocos KB; lo que pase de esto no es una. */
export const MAX_SDP = 24_000;
/** Tamaño máximo de un mensaje al servicio. */
export const MAX_LOBBY_MESSAGE = 32_000;

/** Lo que se está jugando en una sala: nada aún (en la sala), la arena o un contrato. */
export type RoomMode = 'lobby' | 'arena' | MissionId;
export const ROOM_MODES: readonly RoomMode[] = ['lobby', 'arena', 'practice', 'nightclub', 'docks', 'rooftop', 'gauntlet'];

/** Una sala en la lista pública. */
export interface RoomInfo {
  code: string;
  mode: RoomMode;
  players: number;
  max: number;
}

export type LobbyError = 'notfound' | 'full' | 'version' | 'busy' | 'invalid';

/** Del servicio al jugador. */
export type LobbyMsg =
  | { t: 'hosted'; code: string }
  /** Anfitrión: alguien quiere entrar (su id en el servicio). */
  | { t: 'peer'; peer: string }
  /** Anfitrión: se fue antes de conectarse. */
  | { t: 'left'; peer: string }
  | { t: 'signal'; from: string; kind: 'offer' | 'answer'; sdp: string }
  | { t: 'error'; why: LobbyError }
  /** Invitado: la sala se cerró. */
  | { t: 'gone' };

/** Del jugador al servicio. */
export type ClientMsg =
  /** Anfitrión: cómo está su sala (y si aparece en la lista pública). */
  | { t: 'update'; mode: RoomMode; players: number; open: boolean }
  /** La descripción de la conexión: el anfitrión se la manda a un invitado (`to`); el invitado, a su anfitrión. */
  | { t: 'signal'; to?: string; kind: 'offer' | 'answer'; sdp: string };

const isStr = (v: unknown, max: number): v is string => typeof v === 'string' && v.length > 0 && v.length <= max;
const isInt = (v: unknown, min: number, max: number): v is number => typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;

export function isRoomCode(s: unknown): s is string {
  if (typeof s !== 'string' || s.length !== ROOM_CODE_LEN) return false;
  for (const ch of s) if (!ROOM_ALPHABET.includes(ch)) return false;
  return true;
}

/** Lo que escribe alguien («k7q-2m», con espacios) llevado a un código; null si no puede serlo. */
export function normalizeRoomCode(input: string): string | null {
  const s = input.toUpperCase().replace(/[\s-]/g, '');
  return isRoomCode(s) ? s : null;
}

function isMode(v: unknown): v is RoomMode {
  return typeof v === 'string' && (ROOM_MODES as readonly string[]).includes(v);
}

function isKind(v: unknown): v is 'offer' | 'answer' {
  return v === 'offer' || v === 'answer';
}

function isPeer(v: unknown): v is string {
  return typeof v === 'string' && /^[a-z0-9]{6,16}$/.test(v);
}

function parse(s: unknown): Record<string, unknown> | null {
  if (typeof s !== 'string' || s.length > MAX_LOBBY_MESSAGE) return null;
  try {
    const v: unknown = JSON.parse(s);
    return typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Mensaje de un jugador al servicio, validado (null si no lo es). */
export function decodeClientMsg(s: unknown): ClientMsg | null {
  const o = parse(s);
  if (!o) return null;
  if (o.t === 'update' && isMode(o.mode) && isInt(o.players, 1, ROOM_SEATS) && typeof o.open === 'boolean')
    return { t: 'update', mode: o.mode, players: o.players, open: o.open };
  if (o.t === 'signal' && isKind(o.kind) && isStr(o.sdp, MAX_SDP) && (o.to === undefined || isPeer(o.to)))
    return o.to === undefined ? { t: 'signal', kind: o.kind, sdp: o.sdp } : { t: 'signal', to: o.to, kind: o.kind, sdp: o.sdp };
  return null;
}

/** Mensaje del servicio, validado (el juego tampoco se fía de lo que llega por la red). */
export function decodeLobbyMsg(s: unknown): LobbyMsg | null {
  const o = parse(s);
  if (!o) return null;
  switch (o.t) {
    case 'hosted':
      return isRoomCode(o.code) ? { t: 'hosted', code: o.code } : null;
    case 'peer':
    case 'left':
      return isPeer(o.peer) ? { t: o.t, peer: o.peer } : null;
    case 'signal':
      return isPeer(o.from) && isKind(o.kind) && isStr(o.sdp, MAX_SDP) ? { t: 'signal', from: o.from, kind: o.kind, sdp: o.sdp } : null;
    case 'error':
      return o.why === 'notfound' || o.why === 'full' || o.why === 'version' || o.why === 'busy' || o.why === 'invalid' ? { t: 'error', why: o.why } : null;
    case 'gone':
      return { t: 'gone' };
    default:
      return null;
  }
}

/** La lista de salas, validada. */
export function decodeRooms(v: unknown): RoomInfo[] | null {
  if (!Array.isArray(v) || v.length > MAX_ROOMS) return null;
  const out: RoomInfo[] = [];
  for (const r of v) {
    if (typeof r !== 'object' || r === null) return null;
    const o = r as Record<string, unknown>;
    if (!isRoomCode(o.code) || !isMode(o.mode) || !isInt(o.players, 1, ROOM_SEATS) || !isInt(o.max, 1, ROOM_SEATS)) return null;
    out.push({ code: o.code, mode: o.mode, players: o.players, max: o.max });
  }
  return out;
}

/** Una versión del juego (protocolo y tablas): solo se juntan jugadores con la misma. */
export function isVersion(v: unknown): v is string {
  return typeof v === 'string' && /^[0-9a-z.]{1,32}$/.test(v);
}
