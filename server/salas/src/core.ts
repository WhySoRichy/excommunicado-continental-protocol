import {
  decodeClientMsg,
  isRoomCode,
  isVersion,
  type LobbyError,
  type LobbyMsg,
  MAX_ROOMS,
  ROOM_ALPHABET,
  ROOM_CODE_LEN,
  ROOM_SEATS,
  type RoomInfo,
  type RoomMode,
} from '../../../src/net/lobbyProtocol';

/**
 * Núcleo del servicio de salas: solo lógica, sin nada de Cloudflare, para probarlo en Node y usarlo igual en las e2e.
 * `worker.ts` lo envuelve en un Durable Object con WebSockets que hibernan.
 *
 * El estado vive en cada conexión (su `info`), no en memoria: así el objeto puede hibernar entre mensajes sin perder
 * nada, que es lo que hace gratis tener salas abiertas durante horas.
 */

/** Etiquetas de las conexiones: todas las de anfitrión, la de una sala, la de un invitado y los invitados de una sala. */
export const tag = {
  hosts: 'h',
  host: (code: string) => `h:${code}`,
  guest: (peer: string) => `g:${peer}`,
  roomGuests: (code: string) => `r:${code}`,
} as const;

/** El nombre del anfitrión en los mensajes de señalización (los invitados tienen su id). */
export const HOST_PEER = 'anfitrion';

/** Anfitriones a la vez por dirección IP, invitados en espera por dirección IP. */
const HOSTS_PER_IP = 3;
const GUESTS_PER_IP = 8;
/** Mensajes por conexión en cada ventana (contra quien inunde el servicio). */
const RATE_WINDOW_MS = 10_000;
const RATE_MAX = 40;

interface Common {
  ip: string;
  /** Mensajes en la ventana actual y cuándo empezó. */
  msgs: number;
  since: number;
}

export interface HostInfo extends Common {
  role: 'host';
  code: string;
  v: string;
  mode: RoomMode;
  players: number;
  open: boolean;
}

export interface GuestInfo extends Common {
  role: 'guest';
  code: string;
  peer: string;
}

export type SocketInfo = HostInfo | GuestInfo;

/** Una conexión aceptada (en Cloudflare, un WebSocket con hibernación y su adjunto). */
export interface LobbySocket {
  send(data: string): void;
  close(code: number, reason: string): void;
  info(): SocketInfo | null;
  setInfo(info: SocketInfo): void;
}

/** Lo que el núcleo necesita de donde corre. */
export interface LobbyEnv {
  /** Las conexiones abiertas con una etiqueta. */
  sockets(tag: string): LobbySocket[];
  random(): number;
  now(): number;
}

/** Si se acepta una conexión: con qué etiquetas, con qué estado, qué se le dice y a quién más se avisa. */
export type Admission =
  { ok: true; tags: string[]; info: SocketInfo; hello: LobbyMsg | null; notify: { tag: string; msg: LobbyMsg } | null } | { ok: false; why: LobbyError };

const send = (s: LobbySocket, m: LobbyMsg): void => s.send(JSON.stringify(m));

function randomString(env: LobbyEnv, alphabet: string, len: number): string {
  let out = '';
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(env.random() * alphabet.length)] ?? alphabet[0];
  return out;
}

function countByIp(env: LobbyEnv, t: string, ip: string): number {
  let n = 0;
  for (const s of env.sockets(t)) if (s.info()?.ip === ip) n++;
  return n;
}

/** Abrir una sala: un código libre y la sala aún cerrada a la lista (el anfitrión dice cuándo abrirla). */
export function admitHost(env: LobbyEnv, v: unknown, ip: string): Admission {
  if (!isVersion(v)) return { ok: false, why: 'invalid' };
  const hosts = env.sockets(tag.hosts);
  if (hosts.length >= MAX_ROOMS) return { ok: false, why: 'busy' };
  if (ip && countByIp(env, tag.hosts, ip) >= HOSTS_PER_IP) return { ok: false, why: 'busy' };
  let code = '';
  for (let i = 0; i < 20 && !code; i++) {
    const c = randomString(env, ROOM_ALPHABET, ROOM_CODE_LEN);
    if (env.sockets(tag.host(c)).length === 0) code = c;
  }
  if (!code) return { ok: false, why: 'busy' };
  const info: HostInfo = { role: 'host', code, v, mode: 'lobby', players: 1, open: false, ip, msgs: 0, since: env.now() };
  return { ok: true, tags: [tag.hosts, tag.host(code)], info, hello: { t: 'hosted', code }, notify: null };
}

/** Entrar en una sala: que exista, que sea la misma versión del juego y que quepa. */
export function admitGuest(env: LobbyEnv, code: unknown, v: unknown, ip: string): Admission {
  if (!isRoomCode(code) || !isVersion(v)) return { ok: false, why: 'invalid' };
  const host = env.sockets(tag.host(code))[0]?.info();
  if (!host || host.role !== 'host') return { ok: false, why: 'notfound' };
  if (host.v !== v) return { ok: false, why: 'version' };
  if (host.players + env.sockets(tag.roomGuests(code)).length >= ROOM_SEATS) return { ok: false, why: 'full' };
  if (ip && countGuestsByIp(env, ip) >= GUESTS_PER_IP) return { ok: false, why: 'busy' };
  const peer = randomString(env, 'abcdefghijkmnpqrstuvwxyz23456789', 10);
  const info: GuestInfo = { role: 'guest', code, peer, ip, msgs: 0, since: env.now() };
  return {
    ok: true,
    tags: [tag.guest(peer), tag.roomGuests(code)],
    info,
    hello: null,
    notify: { tag: tag.host(code), msg: { t: 'peer', peer } },
  };
}

/** Invitados en espera desde una IP en todas las salas. */
function countGuestsByIp(env: LobbyEnv, ip: string): number {
  let n = 0;
  for (const h of env.sockets(tag.hosts)) {
    const code = h.info()?.code;
    if (code) n += countByIp(env, tag.roomGuests(code), ip);
  }
  return n;
}

/** Un mensaje de una conexión: actualizar la sala o pasar la descripción de la conexión al otro lado. */
export function onMessage(env: LobbyEnv, ws: LobbySocket, raw: unknown): void {
  const info = ws.info();
  if (!info) return;
  const now = env.now();
  if (now - info.since > RATE_WINDOW_MS) {
    info.since = now;
    info.msgs = 0;
  }
  info.msgs++;
  if (info.msgs > RATE_MAX) {
    ws.close(1008, 'demasiados mensajes');
    return;
  }
  const m = decodeClientMsg(raw);
  if (!m) {
    ws.setInfo(info);
    send(ws, { t: 'error', why: 'invalid' });
    return;
  }
  if (info.role === 'host') {
    if (m.t === 'update') {
      info.mode = m.mode;
      info.players = m.players;
      info.open = m.open;
    } else if (m.to) {
      // Solo a un invitado de su propia sala.
      const g = env.sockets(tag.guest(m.to))[0];
      const gi = g?.info();
      if (g && gi?.role === 'guest' && gi.code === info.code) send(g, { t: 'signal', from: HOST_PEER, kind: m.kind, sdp: m.sdp });
    }
  } else if (m.t === 'signal' && !m.to) {
    const h = env.sockets(tag.host(info.code))[0];
    if (h) send(h, { t: 'signal', from: info.peer, kind: m.kind, sdp: m.sdp });
  }
  ws.setInfo(info);
}

/** Se cerró una conexión: si era un anfitrión, su sala se cierra; si era un invitado, su anfitrión lo sabe. */
export function onClose(env: LobbyEnv, ws: LobbySocket): void {
  const info = ws.info();
  if (!info) return;
  if (info.role === 'host') {
    for (const g of env.sockets(tag.roomGuests(info.code))) {
      send(g, { t: 'gone' });
      g.close(1000, 'sala cerrada');
    }
  } else {
    const h = env.sockets(tag.host(info.code))[0];
    if (h) send(h, { t: 'left', peer: info.peer });
  }
}

/** Las salas abiertas con esa versión del juego que tienen sitio (las más llenas primero). */
export function listRooms(env: LobbyEnv, v: unknown): RoomInfo[] {
  if (!isVersion(v)) return [];
  const out: RoomInfo[] = [];
  for (const s of env.sockets(tag.hosts)) {
    const i = s.info();
    if (!i || i.role !== 'host' || !i.open || i.v !== v) continue;
    if (i.players >= ROOM_SEATS) continue;
    out.push({ code: i.code, mode: i.mode, players: i.players, max: ROOM_SEATS });
  }
  return out.sort((a, b) => b.players - a.players).slice(0, 50);
}
