import type { Rng } from '../core/rng';

/**
 * Canales de un enlace: `ctl` es fiable y en orden (saludos, avisos, eventos); `sim` puede perder y desordenar
 * mensajes a cambio de no esperar a los perdidos (entradas e instantáneas: el siguiente ya trae lo nuevo).
 */
export type Channel = 'ctl' | 'sim';

/**
 * Un enlace con otro equipo, sea cual sea el transporte (WebRTC, otra pestaña o la red de pruebas). La simulación de
 * red (anfitrión e invitado) solo conoce esto.
 */
export interface Link {
  send(ch: Channel, data: string): void;
  onMessage: ((ch: Channel, data: string) => void) | null;
  /** El enlace se cerró (lo cerró el otro, se cortó la conexión o se cerró aquí). Se avisa una sola vez. */
  onClose: (() => void) | null;
  readonly open: boolean;
  close(): void;
}

interface Pending {
  at: number;
  order: number;
  to: TestLink;
  ch: Channel | 'close';
  data: string;
}

class TestLink implements Link {
  onMessage: ((ch: Channel, data: string) => void) | null = null;
  onClose: (() => void) | null = null;
  open = true;
  other!: TestLink;
  /** Último instante de entrega fiable hacia este extremo (lo fiable llega en orden). */
  lastCtl = 0;

  constructor(private readonly net: TestNetwork) {}

  send(ch: Channel, data: string): void {
    if (!this.open) return;
    this.net.sent++;
    this.net.bytes += data.length;
    this.net.deliver(this.other, ch, data);
  }

  close(): void {
    if (!this.open) return;
    this.open = false;
    this.net.deliver(this.other, 'close', '');
    this.onClose?.();
  }

  receive(ch: Channel | 'close', data: string): void {
    if (ch === 'close') {
      if (!this.open) return;
      this.open = false;
      this.onClose?.();
      return;
    }
    if (this.open) this.onMessage?.(ch, data);
  }
}

export interface TestNetworkOptions {
  /** Latencia de ida (ms). */
  latency?: number;
  /** Variación de la latencia (± ms): desordena lo que no es fiable. */
  jitter?: number;
  /** Probabilidad de perder un mensaje no fiable. */
  loss?: number;
}

/**
 * Red de pruebas: extremos unidos en memoria con latencia, variación y pérdida, y un reloj que avanza a mano. Hace
 * deterministas las pruebas de red sin pantalla.
 */
export class TestNetwork {
  now = 0;
  sent = 0;
  bytes = 0;
  private readonly queue: Pending[] = [];
  private order = 0;

  constructor(
    private readonly rng: Rng,
    private readonly opts: TestNetworkOptions = {},
  ) {}

  pair(): [Link, Link] {
    const a = new TestLink(this);
    const b = new TestLink(this);
    a.other = b;
    b.other = a;
    return [a, b];
  }

  /** Deja pasar el tiempo y entrega lo que haya llegado. */
  advance(ms: number): void {
    this.now += ms;
    this.queue.sort((x, y) => x.at - y.at || x.order - y.order);
    while (this.queue.length && this.queue[0]!.at <= this.now) {
      const p = this.queue.shift()!;
      p.to.receive(p.ch, p.data);
    }
  }

  deliver(to: TestLink, ch: Channel | 'close', data: string): void {
    const { latency = 0, jitter = 0, loss = 0 } = this.opts;
    let at = this.now + latency + (jitter > 0 ? this.rng.range(-jitter, jitter) : 0);
    if (ch === 'sim') {
      if (loss > 0 && this.rng.chance(loss)) return;
    } else {
      at = Math.max(at, to.lastCtl);
      to.lastCtl = at;
    }
    this.queue.push({ at: Math.max(this.now, at), order: this.order++, to, ch, data });
  }
}
