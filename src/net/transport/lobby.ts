import type { Link } from '../link';
import { decodeLobbyMsg, decodeRooms, type LobbyError, type RoomInfo, type RoomMode } from '../lobbyProtocol';
import { answerOffer, createOffer, DEFAULT_ICE, type Offer } from './rtc';

/**
 * El juego frente al servicio de salas (`server/salas`, bloque 1 de docs/VISION.md): abrir una sala y recibir su
 * código, entrar en una con el código, ver la lista de salas públicas y pedir credenciales del relé. El servicio solo
 * pasa las descripciones de la conexión; la partida va directa entre los equipos por WebRTC.
 */

/** Por qué no se pudo entrar en una sala: lo que dice el servicio, que no responde o que la conexión no se abrió. */
export type JoinError = LobbyError | 'unreachable' | 'rtc';

/** Latido de la conexión con el servicio (los proxies cierran las conexiones calladas). */
const PING_MS = 30_000;
/** Lo que se espera a entrar en una sala, del código a la conexión abierta. */
const JOIN_TIMEOUT_MS = 30_000;
/** Lo que se espera a la lista de salas o a las credenciales del relé. */
const FETCH_TIMEOUT_MS = 6000;
/** Credenciales del relé guardadas como mucho este tiempo (duran seis horas). */
const ICE_CACHE_MS = 3600_000;
/** Reintentos al perder la conexión con el servicio (la sala sigue: solo cambia su código). */
const HOST_RETRIES = 3;

function socketUrl(base: string, path: string, params: Record<string, string>): string {
  const u = new URL(path, base);
  u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return u.toString();
}

/** Lo que llega del servicio como servidores ICE, solo si tiene la forma esperada (no se usa nada a ciegas). */
function validIce(v: unknown): RTCIceServer[] | null {
  const list = (v as { iceServers?: unknown } | null)?.iceServers;
  if (!Array.isArray(list) || list.length === 0 || list.length > 6) return null;
  const out: RTCIceServer[] = [];
  for (const s of list) {
    if (typeof s !== 'object' || s === null) return null;
    const o = s as Record<string, unknown>;
    const urls = Array.isArray(o.urls) ? o.urls : [o.urls];
    if (urls.length === 0 || urls.length > 8) return null;
    if (!urls.every((u) => typeof u === 'string' && u.length <= 200 && /^(stun|turn|turns):/.test(u))) return null;
    const server: RTCIceServer = { urls: urls as string[] };
    if (o.username !== undefined || o.credential !== undefined) {
      if (typeof o.username !== 'string' || typeof o.credential !== 'string' || o.username.length > 512 || o.credential.length > 512) return null;
      server.username = o.username;
      server.credential = o.credential;
    }
    out.push(server);
  }
  return out;
}

let iceCache: { at: number; base: string; ice: RTCIceServer[] } | null = null;

/** Servidores ICE con el relé del servicio; si no responde, solo STUN (casi siempre basta). */
export async function iceServers(base: string): Promise<RTCIceServer[]> {
  if (iceCache && iceCache.base === base && Date.now() - iceCache.at < ICE_CACHE_MS) return iceCache.ice;
  try {
    const r = await fetch(new URL('/turn', base), { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    const ice = r.ok ? validIce(await r.json()) : null;
    if (ice) {
      iceCache = { at: Date.now(), base, ice };
      return ice;
    }
  } catch {
    // Sin servicio: solo STUN.
  }
  return DEFAULT_ICE;
}

/** Las salas públicas con esta versión del juego (null si el servicio no responde). */
export async function listRooms(base: string, version: string): Promise<RoomInfo[] | null> {
  try {
    const u = new URL('/rooms', base);
    u.searchParams.set('v', version);
    const r = await fetch(u, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    return r.ok ? decodeRooms(await r.json()) : null;
  } catch {
    return null;
  }
}

export interface RoomHostEvents {
  /** La sala tiene código (también si cambia al reconectarse con el servicio). */
  code(code: string): void;
  /** Un invitado conectado: el enlace para la partida. */
  link(link: Link): void;
  /** El servicio no responde o rechazó la sala: queda la invitación a mano. */
  down(): void;
}

/**
 * Anfitrión: su sala en el servicio. Recibe a quien llega con el código, le manda la oferta de la conexión y, con su
 * respuesta, entrega el enlace. Mantiene la sala al día (qué se juega, cuántos son y si aparece en la lista).
 */
export class RoomHost {
  code: string | null = null;
  private ws: WebSocket | null = null;
  private readonly pending = new Map<string, Offer>();
  private ping: ReturnType<typeof setInterval> | null = null;
  private state: { mode: RoomMode; players: number; open: boolean } = { mode: 'lobby', players: 1, open: true };
  private retries = 0;
  private closed = false;

  constructor(
    private readonly base: string,
    private readonly version: string,
    private readonly ev: RoomHostEvents,
  ) {
    this.connect();
  }

  /** Cómo está la sala (se envía solo si cambia). */
  update(mode: RoomMode, players: number, open: boolean): void {
    const s = this.state;
    if (s.mode === mode && s.players === players && s.open === open) return;
    this.state = { mode, players, open };
    this.sendState();
  }

  close(): void {
    this.closed = true;
    if (this.ping) clearInterval(this.ping);
    for (const o of this.pending.values()) o.close();
    this.pending.clear();
    this.ws?.close(1000, 'sala cerrada');
  }

  private connect(): void {
    let ws: WebSocket;
    try {
      ws = new WebSocket(socketUrl(this.base, '/host', { v: this.version }));
    } catch {
      this.ev.down();
      return;
    }
    this.ws = ws;
    ws.onmessage = (e: MessageEvent) => void this.onMessage(e.data);
    ws.onclose = () => {
      if (this.ping) clearInterval(this.ping);
      this.ping = null;
      this.code = null;
      if (this.closed) return;
      // La partida sigue; se intenta volver a abrir la sala (con otro código).
      if (this.retries++ < HOST_RETRIES) setTimeout(() => !this.closed && this.connect(), 4000 * this.retries);
      else this.ev.down();
    };
  }

  private async onMessage(data: unknown): Promise<void> {
    const m = decodeLobbyMsg(data);
    if (!m) return;
    switch (m.t) {
      case 'hosted':
        this.code = m.code;
        this.retries = 0;
        this.sendState();
        if (!this.ping) this.ping = setInterval(() => this.send('{"t":"ping"}'), PING_MS);
        this.ev.code(m.code);
        return;
      case 'peer': {
        const offer = await createOffer(await iceServers(this.base));
        if (this.closed) {
          offer.close();
          return;
        }
        this.pending.set(m.peer, offer);
        this.send(JSON.stringify({ t: 'signal', to: m.peer, kind: 'offer', sdp: offer.sdp }));
        return;
      }
      case 'signal': {
        const offer = this.pending.get(m.from);
        if (!offer || m.kind !== 'answer') return;
        this.pending.delete(m.from);
        offer.accept(m.sdp).then(
          (link) => this.ev.link(link),
          () => offer.close(),
        );
        return;
      }
      case 'left':
        this.pending.get(m.peer)?.close();
        this.pending.delete(m.peer);
        return;
      case 'error':
        if (m.why === 'busy' || m.why === 'version') {
          this.closed = true;
          this.ws?.close();
          this.ev.down();
        }
        return;
      case 'gone':
        return;
    }
  }

  private sendState(): void {
    if (this.code) this.send(JSON.stringify({ t: 'update', ...this.state }));
  }

  private send(data: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(data);
  }
}

/**
 * Invitado: entra en una sala con su código. El enlace llega cuando la conexión con el anfitrión se abre; si no, el
 * error dice por qué (sala inexistente o llena, otra versión, servicio caído, red que no conecta).
 */
export function joinRoom(base: string, code: string, version: string): { link: Promise<Link>; cancel: () => void } {
  let ws: WebSocket | null = null;
  let cancelRtc: (() => void) | null = null;
  let settled = false;
  const cancel = (): void => {
    settled = true;
    cancelRtc?.();
    ws?.close(1000);
  };
  const link = new Promise<Link>((resolve, reject) => {
    const fail = (why: JoinError): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cancelRtc?.();
      ws?.close(1000);
      reject(new Error(why));
    };
    const timer = setTimeout(() => fail('rtc'), JOIN_TIMEOUT_MS);
    try {
      ws = new WebSocket(socketUrl(base, '/join', { code, v: version }));
    } catch {
      fail('unreachable');
      return;
    }
    let heard = false;
    ws.onmessage = async (e: MessageEvent) => {
      heard = true;
      const m = decodeLobbyMsg(e.data);
      if (!m || settled) return;
      if (m.t === 'error') fail(m.why);
      else if (m.t === 'gone') fail('notfound');
      else if (m.t === 'signal' && m.kind === 'offer') {
        try {
          const r = await answerOffer(m.sdp, await iceServers(base));
          cancelRtc = r.cancel;
          ws?.send(JSON.stringify({ t: 'signal', kind: 'answer', sdp: r.sdp }));
          const l = await r.link;
          if (settled) {
            l.close();
            return;
          }
          settled = true;
          clearTimeout(timer);
          ws?.close(1000);
          resolve(l);
        } catch {
          fail('rtc');
        }
      }
    };
    ws.onclose = () => fail(heard ? 'rtc' : 'unreachable');
  });
  return { link, cancel };
}
