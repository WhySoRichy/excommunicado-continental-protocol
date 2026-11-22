import { describe, expect, it } from 'vitest';
import { decodeLobbyMsg, decodeRooms, type LobbyMsg, normalizeRoomCode, ROOM_SEATS } from '../../src/net/lobbyProtocol';
import { admitGuest, admitHost, HOST_PEER, type LobbyEnv, type LobbySocket, listRooms, onClose, onMessage, type SocketInfo } from '../../server/salas/src/core';

/**
 * Servicio de salas (bloque 1 de docs/VISION.md): el núcleo, el mismo que corre en Cloudflare, sobre un entorno en
 * memoria que imita sus WebSockets con etiquetas y adjuntos.
 */
interface FakeSocket extends LobbySocket {
  tags: string[];
  data: SocketInfo | null;
  inbox: LobbyMsg[];
  closed: boolean;
}

function world(seed = 1) {
  const all: FakeSocket[] = [];
  let s = seed;
  let now = 0;
  const env: LobbyEnv = {
    sockets: (t) => all.filter((x) => !x.closed && x.tags.includes(t)),
    random: () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    },
    now: () => now,
  };
  /** Conecta como anfitrión o invitado: como el Durable Object, acepta con las etiquetas y entrega el saludo. */
  const connect = (path: 'host' | 'join', o: { v?: string; code?: string; ip?: string } = {}): FakeSocket => {
    const sock: FakeSocket = {
      tags: [],
      data: null,
      inbox: [],
      closed: false,
      send: (d) => sock.inbox.push(decodeLobbyMsg(d)!),
      close: () => {
        sock.closed = true;
      },
      info: () => (sock.data ? { ...sock.data } : null),
      setInfo: (i) => {
        sock.data = { ...i };
      },
    };
    const adm = path === 'host' ? admitHost(env, o.v ?? '1.abc', o.ip ?? '') : admitGuest(env, o.code, o.v ?? '1.abc', o.ip ?? '');
    if (!adm.ok) {
      sock.inbox.push({ t: 'error', why: adm.why });
      sock.closed = true;
      return sock;
    }
    sock.tags = adm.tags;
    sock.data = adm.info;
    all.push(sock);
    if (adm.hello) sock.send(JSON.stringify(adm.hello));
    if (adm.notify) for (const x of env.sockets(adm.notify.tag)) x.send(JSON.stringify(adm.notify.msg));
    return sock;
  };
  const say = (sock: FakeSocket, m: unknown): void => onMessage(env, sock, JSON.stringify(m));
  const drop = (sock: FakeSocket): void => {
    onClose(env, sock);
    sock.closed = true;
  };
  return { env, connect, say, drop, tick: (ms: number) => (now += ms) };
}

const codeOf = (h: { inbox: LobbyMsg[] }): string => (h.inbox[0] as Extract<LobbyMsg, { t: 'hosted' }>).code;

describe('servicio de salas', () => {
  it('una sala abierta aparece en la lista con su modo y sus plazas; una cerrada, no', () => {
    const w = world();
    const h = w.connect('host');
    const code = codeOf(h);
    expect(code).toMatch(/^[A-Z2-9]{5}$/);
    expect(listRooms(w.env, '1.abc'), 'aún privada').toEqual([]);
    w.say(h, { t: 'update', mode: 'nightclub', players: 2, open: true });
    expect(listRooms(w.env, '1.abc')).toEqual([{ code, mode: 'nightclub', players: 2, max: ROOM_SEATS }]);
    expect(listRooms(w.env, '2.xyz'), 'otra versión del juego no la ve').toEqual([]);
    w.say(h, { t: 'update', mode: 'nightclub', players: 4, open: true });
    expect(listRooms(w.env, '1.abc'), 'llena: fuera de la lista').toEqual([]);
  });

  it('un invitado entra con el código y la descripción de la conexión va y vuelve solo entre los dos', () => {
    const w = world();
    const h = w.connect('host');
    const code = codeOf(h);
    const g = w.connect('join', { code });
    const peer = (h.inbox[1] as Extract<LobbyMsg, { t: 'peer' }>).peer;
    expect(h.inbox[1]).toEqual({ t: 'peer', peer });
    w.say(h, { t: 'signal', to: peer, kind: 'offer', sdp: 'v=0 oferta' });
    expect(g.inbox).toEqual([{ t: 'signal', from: HOST_PEER, kind: 'offer', sdp: 'v=0 oferta' }]);
    w.say(g, { t: 'signal', kind: 'answer', sdp: 'v=0 respuesta' });
    expect(h.inbox[2]).toEqual({ t: 'signal', from: peer, kind: 'answer', sdp: 'v=0 respuesta' });

    // Otro anfitrión no puede hablar con un invitado ajeno.
    const intruder = w.connect('host');
    w.say(intruder, { t: 'signal', to: peer, kind: 'offer', sdp: 'v=0 trampa' });
    expect(g.inbox).toHaveLength(1);
  });

  it('se rechaza con motivo: código inexistente, otra versión y sala llena', () => {
    const w = world();
    expect(w.connect('join', { code: 'ZZZZZ' }).inbox).toEqual([{ t: 'error', why: 'notfound' }]);
    expect(w.connect('join', { code: 'no vale' }).inbox).toEqual([{ t: 'error', why: 'invalid' }]);
    const h = w.connect('host');
    const code = codeOf(h);
    expect(w.connect('join', { code, v: '9.zzz' }).inbox).toEqual([{ t: 'error', why: 'version' }]);
    w.say(h, { t: 'update', mode: 'arena', players: 2, open: true });
    w.connect('join', { code });
    w.connect('join', { code });
    expect(w.connect('join', { code }).inbox, 'dos en la partida y dos entrando: llena').toEqual([{ t: 'error', why: 'full' }]);
  });

  it('si el anfitrión se va, sus invitados en espera lo saben; si se va un invitado, el anfitrión también', () => {
    const w = world();
    const h = w.connect('host');
    const code = codeOf(h);
    const g1 = w.connect('join', { code });
    const g2 = w.connect('join', { code });
    w.drop(g1);
    expect(h.inbox.at(-1)).toMatchObject({ t: 'left' });
    w.drop(h);
    expect(g2.inbox.at(-1)).toEqual({ t: 'gone' });
    expect(g2.closed).toBe(true);
    expect(w.connect('join', { code }).inbox).toEqual([{ t: 'error', why: 'notfound' }]);
  });

  it('pone límites: mensajes malformados, inundación y salas por dirección', () => {
    const w = world();
    const h = w.connect('host', { ip: '1.2.3.4' });
    onMessage(w.env, h, '{"t":"update","mode":"hackeo","players":2,"open":true}');
    expect(h.inbox.at(-1)).toEqual({ t: 'error', why: 'invalid' });
    for (let i = 0; i < 60; i++) w.say(h, { t: 'update', mode: 'arena', players: 1, open: false });
    expect(h.closed, 'demasiados mensajes en 10 s').toBe(true);
    w.connect('host', { ip: '5.5.5.5' });
    w.connect('host', { ip: '5.5.5.5' });
    w.connect('host', { ip: '5.5.5.5' });
    expect(w.connect('host', { ip: '5.5.5.5' }).inbox, 'tres salas por dirección').toEqual([{ t: 'error', why: 'busy' }]);
  });

  it('el juego solo acepta lo que tiene forma de lista de salas y de código', () => {
    expect(decodeRooms([{ code: 'K7Q2M', mode: 'arena', players: 2, max: 4 }])).toEqual([{ code: 'K7Q2M', mode: 'arena', players: 2, max: 4 }]);
    expect(decodeRooms([{ code: 'K7Q2M', mode: 'arena', players: 9, max: 4 }])).toBeNull();
    expect(decodeRooms('nada')).toBeNull();
    expect(normalizeRoomCode(' k7q-2m ')).toBe('K7Q2M');
    expect(normalizeRoomCode('K7Q2O'), 'la O no existe en los códigos').toBeNull();
    expect(decodeLobbyMsg('{"t":"signal","from":"x","kind":"offer","sdp":"v=0"}'), 'id de invitado inválido').toBeNull();
  });
});
