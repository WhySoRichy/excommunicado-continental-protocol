import type { Channel, Link } from '../link';

/**
 * Transporte entre pestañas del mismo navegador (`BroadcastChannel`): para jugar dos en un mismo equipo, probar el
 * cooperativo sin red y para las pruebas e2e. El anfitrión anuncia su sala; quien se une le pide entrar y a partir de
 * ahí cada mensaje va dirigido a uno de los dos.
 */
const NAME = 'excommunicado-coop-v1';
const ANNOUNCE_MS = 1000;

type Envelope =
  | { k: 'host'; room: string }
  | { k: 'who' }
  | { k: 'join'; room: string; from: string }
  | { k: 'msg'; room: string; from: string; to: string; ch: Channel; d: string }
  | { k: 'close'; room: string; from: string; to: string };

/** Solo se aceptan mensajes con la forma esperada: cualquier otra cosa en el canal se ignora. */
function envelope(v: unknown): Envelope | null {
  if (typeof v !== 'object' || v === null) return null;
  const o = v as Record<string, unknown>;
  const s = (x: unknown): x is string => typeof x === 'string' && x.length <= 64;
  switch (o.k) {
    case 'host':
      return s(o.room) ? { k: 'host', room: o.room } : null;
    case 'who':
      return { k: 'who' };
    case 'join':
      return s(o.room) && s(o.from) ? { k: 'join', room: o.room, from: o.from } : null;
    case 'msg':
      return s(o.room) && s(o.from) && s(o.to) && (o.ch === 'ctl' || o.ch === 'sim') && typeof o.d === 'string'
        ? { k: 'msg', room: o.room, from: o.from, to: o.to, ch: o.ch, d: o.d }
        : null;
    case 'close':
      return s(o.room) && s(o.from) && s(o.to) ? { k: 'close', room: o.room, from: o.from, to: o.to } : null;
    default:
      return null;
  }
}

function randomId(): string {
  const b = new Uint8Array(8);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
}

export function broadcastSupported(): boolean {
  return typeof BroadcastChannel !== 'undefined';
}

class BroadcastLink implements Link {
  onMessage: ((ch: Channel, data: string) => void) | null = null;
  onClose: (() => void) | null = null;
  open = true;

  constructor(
    private readonly bc: BroadcastChannel,
    private readonly room: string,
    private readonly me: string,
    private readonly peer: string,
    private readonly onEnd?: () => void,
  ) {}

  send(ch: Channel, d: string): void {
    if (this.open) this.bc.postMessage({ k: 'msg', room: this.room, from: this.me, to: this.peer, ch, d });
  }

  close(): void {
    if (!this.open) return;
    this.bc.postMessage({ k: 'close', room: this.room, from: this.me, to: this.peer });
    this.end();
  }

  deliver(ch: Channel, d: string): void {
    if (this.open) this.onMessage?.(ch, d);
  }

  end(): void {
    if (!this.open) return;
    this.open = false;
    this.onClose?.();
    this.onEnd?.();
  }
}

/** La sala abierta en este navegador: anuncia la partida y crea un enlace por cada pestaña que se une. */
export class LocalHost {
  readonly room = randomId();
  private readonly bc = new BroadcastChannel(NAME);
  private readonly links = new Map<string, BroadcastLink>();
  private readonly timer: ReturnType<typeof setInterval>;

  constructor(onLink: (link: Link) => void) {
    this.bc.onmessage = (ev: MessageEvent) => {
      const m = envelope(ev.data);
      if (!m) return;
      if (m.k === 'who') {
        this.announce();
        return;
      }
      if (m.k === 'host' || m.room !== this.room) return;
      if (m.k === 'join') {
        if (this.links.has(m.from)) return;
        const link = new BroadcastLink(this.bc, this.room, 'host', m.from, () => this.links.delete(m.from));
        this.links.set(m.from, link);
        onLink(link);
      } else if (m.to === 'host') {
        const link = this.links.get(m.from);
        if (m.k === 'msg') link?.deliver(m.ch, m.d);
        else link?.end();
      }
    };
    this.announce();
    this.timer = setInterval(() => this.announce(), ANNOUNCE_MS);
  }

  private announce(): void {
    this.bc.postMessage({ k: 'host', room: this.room });
  }

  close(): void {
    clearInterval(this.timer);
    for (const l of Array.from(this.links.values())) l.close();
    this.bc.close();
  }
}

/** Busca una sala abierta en otra pestaña de este navegador. */
export function findLocalHost(timeoutMs = 1500): Promise<string | null> {
  if (!broadcastSupported()) return Promise.resolve(null);
  return new Promise((resolve) => {
    const bc = new BroadcastChannel(NAME);
    const done = (room: string | null): void => {
      clearTimeout(timer);
      bc.close();
      resolve(room);
    };
    bc.onmessage = (ev: MessageEvent) => {
      const m = envelope(ev.data);
      if (m?.k === 'host') done(m.room);
    };
    const timer = setTimeout(() => done(null), timeoutMs);
    bc.postMessage({ k: 'who' });
  });
}

/** Se une a la sala de otra pestaña: el enlace con su anfitrión. */
export function joinLocal(room: string): Link {
  const bc = new BroadcastChannel(NAME);
  const me = randomId();
  const link = new BroadcastLink(bc, room, me, 'host', () => bc.close());
  bc.onmessage = (ev: MessageEvent) => {
    const m = envelope(ev.data);
    if (!m || m.k === 'host' || m.k === 'who' || m.k === 'join' || m.room !== room || m.to !== me) return;
    if (m.k === 'msg') link.deliver(m.ch, m.d);
    else link.end();
  };
  bc.postMessage({ k: 'join', room, from: me });
  // Al cerrar la pestaña, el anfitrión se entera enseguida (si no, por el tiempo de espera).
  addEventListener('pagehide', () => link.close(), { once: true });
  return link;
}
