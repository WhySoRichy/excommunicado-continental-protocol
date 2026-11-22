import { DurableObject } from 'cloudflare:workers';
import { admitGuest, admitHost, type LobbyEnv, type LobbySocket, listRooms, onClose, onMessage, type SocketInfo } from './core';

/**
 * Servicio de salas del cooperativo (bloque 1 de docs/VISION.md), en el plan gratuito de Cloudflare: un Worker de
 * entrada y un único Durable Object con todas las salas. Las conexiones usan la API de hibernación: mientras nadie
 * escribe, el objeto no está en memoria y no consume tiempo de cómputo.
 *
 * Rutas: `GET /rooms`, WebSocket `/host` y `/join`, `GET /turn` y `GET /health`. Solo responde a los orígenes del juego.
 */

export interface Env {
  LOBBY: DurableObjectNamespace<Lobby>;
  /** Orígenes del juego permitidos, separados por comas. */
  ALLOWED_ORIGINS: string;
  /** Clave del relé TURN de Cloudflare (secretos del Worker; sin ellos solo se da STUN). */
  TURN_KEY_ID?: string;
  TURN_KEY_API_TOKEN?: string;
}

/** STUN de Cloudflare: gratuito y sin límite; basta en la mayoría de las redes domésticas. */
const STUN_ONLY = { iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }] };
/** Duración de las credenciales del relé (s): una sesión de juego larga, con margen. */
const TURN_TTL = 6 * 3600;

function allowedOrigin(req: Request, env: Env): string | null {
  const origin = req.headers.get('Origin');
  if (!origin) return null;
  return env.ALLOWED_ORIGINS.split(',').some((o) => o.trim() === origin) ? origin : null;
}

function cors(origin: string): Record<string, string> {
  return { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'GET', Vary: 'Origin' };
}

function json(body: unknown, origin: string, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...cors(origin) },
  });
}

/** Credenciales temporales del relé, pedidas a Cloudflare con la clave que nunca sale del servidor. */
async function turn(env: Env, origin: string): Promise<Response> {
  if (!env.TURN_KEY_ID || !env.TURN_KEY_API_TOKEN) return json(STUN_ONLY, origin);
  try {
    const r = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${env.TURN_KEY_ID}/credentials/generate-ice-servers`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.TURN_KEY_API_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ttl: TURN_TTL }),
    });
    if (!r.ok) return json(STUN_ONLY, origin);
    return json(await r.json(), origin);
  } catch {
    return json(STUN_ONLY, origin);
  }
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/health') return new Response('ok', { headers: { 'Cache-Control': 'no-store' } });
    const origin = allowedOrigin(req, env);
    if (!origin) return new Response('origen no permitido', { status: 403 });
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
    if (url.pathname === '/turn' && req.method === 'GET') return turn(env, origin);
    const lobby = env.LOBBY.get(env.LOBBY.idFromName('global'));
    if (url.pathname === '/rooms' && req.method === 'GET') {
      const rooms = await lobby.rooms(url.searchParams.get('v'));
      return json(rooms, origin);
    }
    if ((url.pathname === '/host' || url.pathname === '/join') && req.headers.get('Upgrade') === 'websocket') return lobby.fetch(req);
    return new Response('no encontrado', { status: 404 });
  },
} satisfies ExportedHandler<Env>;

/** Todas las salas, en un solo objeto (para unos cientos de salas sobra; si hiciera falta, una por región). */
export class Lobby extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    // Los latidos se contestan sin despertar al objeto.
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('{"t":"ping"}', '{"t":"pong"}'));
  }

  private get lobbyEnv(): LobbyEnv {
    return {
      sockets: (t) => this.ctx.getWebSockets(t).map(wrap),
      random: () => Math.random(),
      now: () => Date.now(),
    };
  }

  async rooms(v: string | null): Promise<ReturnType<typeof listRooms>> {
    return listRooms(this.lobbyEnv, v);
  }

  override async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const ip = req.headers.get('CF-Connecting-IP') ?? '';
    const env = this.lobbyEnv;
    const adm =
      url.pathname === '/host' ? admitHost(env, url.searchParams.get('v'), ip) : admitGuest(env, url.searchParams.get('code'), url.searchParams.get('v'), ip);
    const [client, server] = Object.values(new WebSocketPair()) as [WebSocket, WebSocket];
    if (!adm.ok) {
      // Se acepta solo para explicar por qué no (el navegador no lee el cuerpo de un rechazo del WebSocket).
      server.accept();
      server.send(JSON.stringify({ t: 'error', why: adm.why }));
      server.close(1008, adm.why);
      return new Response(null, { status: 101, webSocket: client });
    }
    this.ctx.acceptWebSocket(server, adm.tags);
    server.serializeAttachment(adm.info);
    if (adm.hello) server.send(JSON.stringify(adm.hello));
    if (adm.notify) for (const s of env.sockets(adm.notify.tag)) s.send(JSON.stringify(adm.notify.msg));
    return new Response(null, { status: 101, webSocket: client });
  }

  override async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    onMessage(this.lobbyEnv, wrap(ws), typeof message === 'string' ? message : null);
  }

  override async webSocketClose(ws: WebSocket): Promise<void> {
    onClose(this.lobbyEnv, wrap(ws));
  }

  override async webSocketError(ws: WebSocket): Promise<void> {
    onClose(this.lobbyEnv, wrap(ws));
  }
}

function wrap(ws: WebSocket): LobbySocket {
  return {
    send: (d) => {
      try {
        ws.send(d);
      } catch {
        // Ya cerrada: su cierre llega por su evento.
      }
    },
    close: (code, reason) => {
      try {
        ws.close(code, reason);
      } catch {
        // Ya cerrada.
      }
    },
    info: () => ws.deserializeAttachment() as SocketInfo | null,
    setInfo: (i) => ws.serializeAttachment(i),
  };
}
