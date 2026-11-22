import type { Channel, Link } from '../link';

/**
 * Transporte WebRTC entre dos equipos, sin servidor propio. La señalización son dos códigos que los jugadores se pasan
 * a mano (por un chat, por ejemplo): la invitación del anfitrión y la respuesta del invitado. Cada código es la
 * descripción de la conexión (SDP) ya con sus candidatos de red, comprimida.
 *
 * Para atravesar los routers domésticos se usa un servidor STUN público, que solo le dice a cada equipo cuál es su
 * dirección pública; los datos de la partida van directos de un equipo a otro. Sin servidor de retransmisión (TURN),
 * algunas redes (las de empresas y algunas móviles) no permiten la conexión: el juego lo explica si pasa.
 */
const ICE: RTCConfiguration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
const PREFIX = 'EXC1.';
/** Tope de un código pegado (caracteres): una descripción real comprimida ocupa bastante menos. */
const MAX_CODE = 12_000;
/** Lo que se espera a reunir candidatos de red antes de dar el código. */
const GATHER_MS = 4000;
/** Lo que se espera a que se abra la conexión tras pegar el código. */
const CONNECT_MS = 20_000;
/** Con más datos que esto en la cola de envío, lo que puede perderse se descarta (instantáneas nuevas mejor que viejas). */
const MAX_BUFFERED = 512 * 1024;

export function rtcSupported(): boolean {
  return typeof RTCPeerConnection !== 'undefined' && typeof CompressionStream !== 'undefined';
}

class RtcLink implements Link {
  onMessage: ((ch: Channel, data: string) => void) | null = null;
  onClose: (() => void) | null = null;
  private ended = false;

  constructor(
    private readonly pc: RTCPeerConnection,
    private readonly ctl: RTCDataChannel,
    private readonly sim: RTCDataChannel,
  ) {
    ctl.onmessage = (e: MessageEvent) => {
      if (typeof e.data === 'string') this.onMessage?.('ctl', e.data);
    };
    sim.onmessage = (e: MessageEvent) => {
      if (typeof e.data === 'string') this.onMessage?.('sim', e.data);
    };
    ctl.onclose = () => this.end();
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') this.end();
    };
  }

  get open(): boolean {
    return !this.ended && this.ctl.readyState === 'open';
  }

  send(ch: Channel, data: string): void {
    const c = ch === 'ctl' ? this.ctl : this.sim;
    if (c.readyState !== 'open') return;
    if (ch === 'sim' && c.bufferedAmount > MAX_BUFFERED) return;
    try {
      c.send(data);
    } catch {
      // Un canal que se cierra en ese instante: el cierre llega por su evento.
    }
  }

  close(): void {
    this.ctl.close();
    this.sim.close();
    this.pc.close();
    this.end();
  }

  private end(): void {
    if (this.ended) return;
    this.ended = true;
    this.onClose?.();
  }
}

/** Los dos canales, negociados de antemano con el mismo id en los dos lados (no hace falta anunciarlos). */
function channels(pc: RTCPeerConnection): { ctl: RTCDataChannel; sim: RTCDataChannel } {
  return {
    ctl: pc.createDataChannel('ctl', { negotiated: true, id: 0, ordered: true }),
    sim: pc.createDataChannel('sim', { negotiated: true, id: 1, ordered: false, maxRetransmits: 0 }),
  };
}

function gathered(pc: RTCPeerConnection): Promise<void> {
  if (pc.iceGatheringState === 'complete') return Promise.resolve();
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, GATHER_MS);
    pc.addEventListener('icegatheringstatechange', () => {
      if (pc.iceGatheringState === 'complete') {
        clearTimeout(timer);
        resolve();
      }
    });
  });
}

function opened(link: RtcLink, ctl: RTCDataChannel, pc: RTCPeerConnection): Promise<Link> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pc.close();
      reject(new Error('rtc-timeout'));
    }, CONNECT_MS);
    const ok = (): void => {
      clearTimeout(timer);
      resolve(link);
    };
    if (ctl.readyState === 'open') ok();
    else ctl.addEventListener('open', ok, { once: true });
    pc.addEventListener('connectionstatechange', () => {
      if (pc.connectionState === 'failed') {
        clearTimeout(timer);
        reject(new Error('rtc-failed'));
      }
    });
  });
}

async function pack(kind: 'o' | 'a', sdp: string): Promise<string> {
  const raw = new TextEncoder().encode(JSON.stringify({ k: kind, s: sdp }));
  const zipped = new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());
  let bin = '';
  for (const b of zipped) bin += String.fromCharCode(b);
  return PREFIX + btoa(bin).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

/** Lee un código pegado: el SDP que trae si es del tipo esperado; null si no es un código válido. */
export async function unpack(code: string, kind: 'o' | 'a'): Promise<string | null> {
  const c = code.trim();
  if (!c.startsWith(PREFIX) || c.length > MAX_CODE) return null;
  try {
    const b64 = c.slice(PREFIX.length).replaceAll('-', '+').replaceAll('_', '/');
    const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
    const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
    const text = await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text();
    if (text.length > 32_000) return null;
    const o = JSON.parse(text) as { k?: unknown; s?: unknown };
    if (o.k !== kind || typeof o.s !== 'string' || !o.s.startsWith('v=0')) return null;
    return o.s;
  } catch {
    return null;
  }
}

/** Una invitación del anfitrión para un invitado (una por invitado). */
export class RtcInvite {
  private constructor(
    private readonly pc: RTCPeerConnection,
    private readonly ch: { ctl: RTCDataChannel; sim: RTCDataChannel },
    readonly code: string,
  ) {}

  static async create(): Promise<RtcInvite> {
    const pc = new RTCPeerConnection(ICE);
    const ch = channels(pc);
    await pc.setLocalDescription(await pc.createOffer());
    await gathered(pc);
    return new RtcInvite(pc, ch, await pack('o', pc.localDescription!.sdp));
  }

  /** Pega la respuesta del invitado: el enlace, cuando la conexión se abra. Falla si el código no vale o no conecta. */
  async accept(answer: string): Promise<Link> {
    const sdp = await unpack(answer, 'a');
    if (!sdp) throw new Error('bad-code');
    await this.pc.setRemoteDescription({ type: 'answer', sdp });
    return opened(new RtcLink(this.pc, this.ch.ctl, this.ch.sim), this.ch.ctl, this.pc);
  }

  close(): void {
    this.pc.close();
  }
}

/**
 * El invitado pega la invitación: su respuesta (para el anfitrión) y el enlace, que llega cuando el anfitrión pega la
 * respuesta. Null si la invitación no es un código válido.
 */
export async function answerInvite(code: string): Promise<{ answer: string; link: Promise<Link>; cancel: () => void } | null> {
  const sdp = await unpack(code, 'o');
  if (!sdp) return null;
  const pc = new RTCPeerConnection(ICE);
  const ch = channels(pc);
  await pc.setRemoteDescription({ type: 'offer', sdp });
  await pc.setLocalDescription(await pc.createAnswer());
  await gathered(pc);
  const answer = await pack('a', pc.localDescription!.sdp);
  return { answer, link: opened(new RtcLink(pc, ch.ctl, ch.sim), ch.ctl, pc), cancel: () => pc.close() };
}
