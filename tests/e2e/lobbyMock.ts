import type { BrowserContext, WebSocketRoute } from '@playwright/test';
import { admitGuest, admitHost, type LobbyEnv, type LobbySocket, listRooms, onClose, onMessage, type SocketInfo } from '../../server/salas/src/core';
import { DEFAULT_LOBBY_URL } from '../../src/net/lobbyUrl';

/**
 * El servicio de salas en las pruebas: el mismo núcleo que corre en Cloudflare (`server/salas/src/core.ts`), servido
 * desde el proceso de pruebas a todas las pestañas del contexto. Así las e2e no dependen de la red ni de la cuenta de
 * Cloudflare, y prueban el protocolo de verdad.
 */
export async function mockLobby(context: BrowserContext): Promise<{ env: LobbyEnv }> {
  const host = new URL(DEFAULT_LOBBY_URL).host.replaceAll('.', '\\.');
  const conns: Array<{ tags: string[]; info: SocketInfo | null; closed: boolean; sock: LobbySocket }> = [];
  const env: LobbyEnv = {
    sockets: (t) => conns.filter((c) => !c.closed && c.tags.includes(t)).map((c) => c.sock),
    random: () => Math.random(),
    now: () => Date.now(),
  };
  const headers = { 'Access-Control-Allow-Origin': '*' };
  await context.route(new RegExp(`//${host}/rooms`), (route) =>
    route.fulfill({ json: listRooms(env, new URL(route.request().url()).searchParams.get('v')), headers }),
  );
  // Sin relé en las pruebas: solo STUN (las dos pestañas están en el mismo equipo).
  await context.route(new RegExp(`//${host}/turn`), (route) => route.fulfill({ json: { iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }] }, headers }));
  await context.routeWebSocket(new RegExp(`//${host}/(host|join)`), (ws: WebSocketRoute) => {
    const url = new URL(ws.url());
    const p = url.searchParams;
    const adm = url.pathname === '/host' ? admitHost(env, p.get('v'), '') : admitGuest(env, p.get('code'), p.get('v'), '');
    if (!adm.ok) {
      ws.send(JSON.stringify({ t: 'error', why: adm.why }));
      void ws.close({ code: 1008, reason: adm.why });
      return;
    }
    const c = {
      tags: adm.tags,
      info: adm.info as SocketInfo | null,
      closed: false,
      sock: null as unknown as LobbySocket,
    };
    c.sock = {
      send: (d) => !c.closed && ws.send(d),
      close: (code, reason) => {
        c.closed = true;
        void ws.close({ code, reason });
      },
      info: () => (c.info ? { ...c.info } : null),
      setInfo: (i) => {
        c.info = { ...i };
      },
    };
    conns.push(c);
    if (adm.hello) ws.send(JSON.stringify(adm.hello));
    if (adm.notify) for (const s of env.sockets(adm.notify.tag)) s.send(JSON.stringify(adm.notify.msg));
    ws.onMessage((m) => {
      // En Cloudflare los latidos los contesta el propio runtime, sin llegar al objeto.
      if (m === '{"t":"ping"}') ws.send('{"t":"pong"}');
      else onMessage(env, c.sock, typeof m === 'string' ? m : null);
    });
    ws.onClose(() => {
      if (c.closed) return;
      onClose(env, c.sock);
      c.closed = true;
    });
  });
  return { env };
}
