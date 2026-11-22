import type { Channel, Link } from '../link';

/**
 * Transporte WebRTC entre dos equipos: los datos de la partida van directos de uno a otro. Para ponerse de acuerdo
 * (la señalización) cada lado necesita la descripción de la conexión (SDP) del otro, ya con sus candidatos de red. Se
 * intercambia por el servicio de salas (`lobby.ts`) o, si no responde, a mano: dos códigos que los jugadores se pasan
 * por un chat (la invitación del anfitrión y la respuesta del invitado), comprimidos.
 *
 * Para atravesar los routers domésticos basta el STUN de Cloudflare, que solo le dice a cada equipo cuál es su
 * dirección pública. Para las redes que no permiten la conexión directa (algunas de empresa y móviles), el servicio
 * de salas da además credenciales temporales de un relé TURN.
 */
/** Servidores ICE sin el servicio de salas: solo STUN. */
export const DEFAULT_ICE: RTCIceServer[] = [{ urls: 'stun:stun.cloudflare.com:3478' }];
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

/** La oferta del anfitrión para un invitado: su descripción y cómo aceptar la respuesta. */
export interface Offer {
  sdp: string;
  /** La respuesta del invitado: el enlace, cuando la conexión se abra. Falla si no conecta. */
  accept(answerSdp: string): Promise<Link>;
  close(): void;
}

/** Anfitrión: prepara la oferta para un invitado (una por invitado). */
export async function createOffer(ice: RTCIceServer[] = DEFAULT_ICE): Promise<Offer> {
  const pc = new RTCPeerConnection({ iceServers: ice });
  const ch = channels(pc);
  await pc.setLocalDescription(await pc.createOffer());
  await gathered(pc);
  return {
    sdp: pc.localDescription!.sdp,
    accept: async (answerSdp) => {
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
      return opened(new RtcLink(pc, ch.ctl, ch.sim), ch.ctl, pc);
    },
    close: () => pc.close(),
  };
}

/** Invitado: responde a la oferta del anfitrión. El enlace llega cuando el anfitrión acepta la respuesta. */
export async function answerOffer(offerSdp: string, ice: RTCIceServer[] = DEFAULT_ICE): Promise<{ sdp: string; link: Promise<Link>; cancel: () => void }> {
  const pc = new RTCPeerConnection({ iceServers: ice });
  const ch = channels(pc);
  await pc.setRemoteDescription({ type: 'offer', sdp: offerSdp });
  await pc.setLocalDescription(await pc.createAnswer());
  await gathered(pc);
  return { sdp: pc.localDescription!.sdp, link: opened(new RtcLink(pc, ch.ctl, ch.sim), ch.ctl, pc), cancel: () => pc.close() };
}

/** Una invitación a mano (sin servicio de salas): la oferta del anfitrión hecha código. */
export class RtcInvite {
  private constructor(
    private readonly offer: Offer,
    readonly code: string,
  ) {}

  static async create(ice: RTCIceServer[] = DEFAULT_ICE): Promise<RtcInvite> {
    const offer = await createOffer(ice);
    return new RtcInvite(offer, await pack('o', offer.sdp));
  }

  /** Pega la respuesta del invitado: el enlace, cuando la conexión se abra. Falla si el código no vale o no conecta. */
  async accept(answer: string): Promise<Link> {
    const sdp = await unpack(answer, 'a');
    if (!sdp) throw new Error('bad-code');
    return this.offer.accept(sdp);
  }

  close(): void {
    this.offer.close();
  }
}

/**
 * El invitado pega la invitación: su respuesta (para el anfitrión) y el enlace, que llega cuando el anfitrión pega la
 * respuesta. Null si la invitación no es un código válido.
 */
export async function answerInvite(
  code: string,
  ice: RTCIceServer[] = DEFAULT_ICE,
): Promise<{ answer: string; link: Promise<Link>; cancel: () => void } | null> {
  const sdp = await unpack(code, 'o');
  if (!sdp) return null;
  const r = await answerOffer(sdp, ice);
  return { answer: await pack('a', r.sdp), link: r.link, cancel: r.cancel };
}
