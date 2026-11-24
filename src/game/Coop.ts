import type { CombatIntent } from '../combat/PlayerCombat';
import { Rng } from '../core/rng';
import type { LevelId } from '../levels/types';
import type { MissionHud } from '../missions/ports';
import { MISSION_ORDER, MISSIONS, type MissionId } from '../missions/types';
import { FxRecorder } from '../net/fx';
import type { Link } from '../net/link';
import { NetGuest } from '../net/NetGuest';
import { NetHost } from '../net/NetHost';
import type { MissionNet, RejectReason, RejoinTicket } from '../net/protocol';
import { LOBBY_URL, LOBBY_VERSION } from '../net/config';
import type { RoomMode } from '../net/lobbyProtocol';
import { LocalHost } from '../net/transport/broadcast';
import { iceServers, RoomHost } from '../net/transport/lobby';
import { RtcInvite } from '../net/transport/rtc';
import { COOP_TEXT, playerName } from '../text/coop';
import type { Game } from './Game';
import type { LevelSession, SessionDeps } from './LevelSession';

/** Lo que se puede jugar en cooperativo: la arena libre o un contrato. */
export type CoopMode = 'arena' | MissionId;

/** Lo que las pantallas muestran de la sala. */
export interface CoopView {
  role: 'host' | 'guest';
  /** Id de este jugador (0 el anfitrión; el invitado, 0 hasta que tiene plaza). */
  me: number;
  players: Array<{ id: number; name: string; status: string; you: boolean }>;
  inMatch: boolean;
  /** Anfitrión: su sala en el servicio (código, si está abriéndose, lista o caído, y si es pública). */
  room: { code: string | null; state: 'connecting' | 'ready' | 'down'; public: boolean };
  /** Anfitrión: la invitación manual en curso y si está a la vista. */
  invite: { busy: boolean; code: string | null };
  showManual: boolean;
  answerDraft: string;
  /** Anfitrión: lo que puede elegir. */
  modes: Array<{ id: CoopMode; name: string }>;
  error: string | null;
}

/** Nombres de los motivos por los que un anfitrión rechaza a un invitado. */
const REJECT_TEXT: Record<RejectReason, string> = {
  version: COOP_TEXT.errors.version,
  full: COOP_TEXT.errors.full,
  closed: COOP_TEXT.errors.closed,
};

/**
 * El cooperativo en el juego (fase 3 de docs/ESCALABILIDAD.md): une la partida con la red. Abre la sala del anfitrión
 * (en otras pestañas y por códigos), lleva a los invitados al nivel que elige el anfitrión, pasa lo que dice la red a
 * la pantalla y vuelve a la sala al terminar. `Game` solo le avisa en sus puntos de enganche (carga de nivel, paso de
 * simulación, misión) y le pide lo que necesita.
 */
export class Coop {
  /** Semilla de la dispersión del jugador local (en el invitado: la misma que usará el anfitrión). */
  readonly shotRng = new Rng();
  /** Hay un nivel en juego (no se está en la sala). */
  inMatch = false;
  /** Contrato en juego (null en la arena o en la sala). */
  mission: MissionId | null = null;
  error: string | null = null;
  answerDraft = '';
  /** Anfitrión: la invitación manual a la vista. */
  showManual = false;
  /** Anfitrión: la sala aparece en la lista pública. */
  isPublic = true;
  private room: RoomHost | null = null;
  private roomState: 'connecting' | 'ready' | 'down' = 'connecting';
  private lobbyIds: number[] = [0];
  private localHost: LocalHost | null = null;
  /** Latido de la red, aparte de los fotogramas: sigue con la pestaña oculta (a ritmo reducido) y en la sala. */
  private readonly beat: ReturnType<typeof setInterval>;
  private invite: RtcInvite | null = null;
  private inviteBusy = false;
  private closed = false;
  /** Ids ya vistos en la sala (para avisar de quien entra). */
  private seen = new Set<number>();

  private constructor(
    private readonly game: Game,
    readonly host: NetHost | null,
    readonly guest: NetGuest | null,
    /** Los efectos del mundo y de cada jugador que viajan en la instantánea (en el anfitrión). */
    readonly recorder: FxRecorder,
  ) {
    this.beat = setInterval(() => {
      this.host?.tick();
      this.guest?.tick();
    }, 500);
  }

  /** Abre una sala: este equipo es el anfitrión. */
  static createHost(game: Game): Coop {
    const recorder = new FxRecorder();
    let coop: Coop | null = null;
    const host = new NetHost({
      now: () => performance.now(),
      recorder,
      onPlayersChanged: () => coop?.changed(),
      onGuestDied: () => game.coopGuestDied(),
      onGuestLeft: (id, dropped) => game.hud.showToast(dropped ? COOP_TEXT.dropped(playerName(id)) : COOP_TEXT.left(playerName(id))),
      onInteract: (slot, id) => game.coopGuestInteract(slot, id),
    });
    const c = new Coop(game, host, null, recorder);
    coop = c;
    // La sala en el servicio: su código para invitar y, si es pública, en la lista.
    c.room = new RoomHost(LOBBY_URL, LOBBY_VERSION, {
      code: () => {
        c.roomState = 'ready';
        c.changed();
      },
      link: (link) => c.host?.accept(link),
      down: () => {
        c.roomState = 'down';
        c.changed();
      },
    });
    try {
      c.localHost = new LocalHost((link) => c.host?.accept(link));
    } catch {
      // Sin BroadcastChannel solo se puede invitar por código.
    }
    return coop;
  }

  /** Se une a una sala por un enlace ya abierto (otra pestaña o WebRTC). */
  /**
   * Se une a una sala por un enlace ya abierto (otra pestaña o WebRTC). `reconnect` abre otro enlace por el mismo
   * camino (código de sala u otra pestaña): con él, un corte no echa al invitado, que vuelve a su plaza. `rejoin` es
   * la plaza a recuperar cuando se vuelve tras un corte.
   */
  static createGuest(game: Game, link: Link, opts: { reconnect?: () => Promise<Link>; rejoin?: RejoinTicket } = {}): Coop {
    let coop: Coop | null = null;
    const guest = new NetGuest(link, {
      now: () => performance.now(),
      upgrades: new Set(game.profile.upgrades),
      loadout: game.profile.loadout,
      ...(opts.rejoin ? { rejoin: opts.rejoin } : {}),
      camera: game.camera,
      events: {
        welcome: () => coop?.changed(),
        reject: (why) => coop?.end(REJECT_TEXT[why]),
        lobby: (ids, level) => {
          if (!coop) return;
          coop.lobbyIds = ids;
          if (level === null && coop.inMatch) {
            coop.inMatch = false;
            coop.mission = null;
            guest.detach();
            game.coopToLobby();
          }
          coop.changed();
        },
        start: (level, mission) => {
          if (!coop) return;
          coop.inMatch = true;
          coop.mission = mission;
          void game.coopGuestStart(level, mission);
        },
        hud: (m) => {
          if (m.k === 'toast') game.hud.showToast(m.text, m.seconds);
          else if (m.k === 'combat') game.hud.setCombatVisible(m.on);
          else if (m.k === 'objective') game.hud.setObjective(m.text);
          else game.hud.setZone(m.text);
        },
        spawned: (revived) => game.coopSpawned(revived),
        results: (r) => game.coopResults(r),
        closed: (byHost) => {
          if (!coop) return;
          if (byHost || !opts.reconnect) coop.end(byHost ? COOP_TEXT.errors.closed : COOP_TEXT.errors.lost);
          else void coop.reconnect(opts.reconnect);
        },
      },
    });
    coop = new Coop(game, null, guest, new FxRecorder());
    if (opts.rejoin) game.hud.showToast(COOP_TEXT.reconnected, 2.5);
    return coop;
  }

  get role(): 'host' | 'guest' {
    return this.host ? 'host' : 'guest';
  }

  get isHost(): boolean {
    return this.host !== null;
  }

  get isGuest(): boolean {
    return this.guest !== null;
  }

  /** Mi id en la partida. */
  get me(): number {
    return this.guest ? this.guest.id : 0;
  }

  /** Lo último que dijo el anfitrión de la misión (en el invitado). */
  get missionNet(): MissionNet | null {
    return this.guest?.mission ?? null;
  }

  /** Ida y vuelta con el anfitrión (ms; 0 en el anfitrión). */
  get rtt(): number {
    return this.guest?.rtt ?? 0;
  }

  // ================================================================ enganches con el juego
  /** Cómo se crea la sesión del nivel en esta partida. */
  sessionNet(): SessionDeps['net'] {
    return this.guest ? { role: 'guest', localId: this.guest.id, shotRng: this.shotRng } : { role: 'host', recorder: this.recorder };
  }

  /** El nivel ya está cargado en este equipo. */
  levelStarted(s: LevelSession, level: LevelId, mission: MissionId | null): void {
    // En cooperativo no hay Foco ni pausas de impacto: el tiempo del mundo es de todos.
    s.combat.allowFocus = false;
    this.inMatch = true;
    this.mission = mission;
    if (this.host) this.host.start(s, level, mission);
    else this.guest?.attach(s, level);
    this.game.updateHiddenTicker();
    this.changed();
  }

  /** El HUD de la misión: en el anfitrión, además envía sus textos a los invitados. */
  hud(base: MissionHud): MissionHud {
    return this.host ? this.host.hud(base) : base;
  }

  /** Invitado: antes de su paso (réplicas al día y semilla del disparo). */
  guestPreStep(): void {
    if (this.guest) this.shotRng.reseed(this.guest.preStep());
  }

  /** Invitado: tras su paso (envía su paso al anfitrión). */
  guestPostStep(ci: CombatIntent): void {
    this.guest?.postStep(ci);
  }

  /** Vuelve a la sala: el anfitrión se lleva a todos. */
  backToLobby(): void {
    this.inMatch = false;
    this.mission = null;
    this.host?.stop();
    this.guest?.detach();
    this.game.updateHiddenTicker();
    this.changed();
  }

  /** Cierra el cooperativo (sale el invitado o cierra la sala el anfitrión). */
  close(): void {
    if (this.closed) return;
    this.closed = true;
    clearInterval(this.beat);
    this.invite?.close();
    this.room?.close();
    this.localHost?.close();
    this.host?.close();
    this.guest?.leave();
  }

  // ================================================================ sala
  view(): CoopView {
    const me = this.me;
    const ids = this.host ? this.host.lobbyIds : this.lobbyIds;
    const states = new Map(this.host?.guests.map((g) => [g.id, g.state]) ?? []);
    const status = (id: number): string => {
      const s = states.get(id);
      return s === 'loading' ? COOP_TEXT.loading : s === 'playing' ? COOP_TEXT.playing : '';
    };
    return {
      role: this.role,
      me,
      players: ids.map((id) => ({ id, name: playerName(id), status: status(id), you: id === me && (this.isHost || me > 0) })),
      inMatch: this.inMatch,
      room: { code: this.room?.code ?? null, state: this.roomState, public: this.isPublic },
      invite: { busy: this.inviteBusy, code: this.invite?.code ?? null },
      showManual: this.showManual,
      answerDraft: this.answerDraft,
      modes: this.isHost ? this.modes() : [],
      error: this.error,
    };
  }

  private modes(): Array<{ id: CoopMode; name: string }> {
    const p = this.game.profile;
    const out: Array<{ id: CoopMode; name: string }> = [{ id: 'arena', name: COOP_TEXT.arena }];
    for (const id of MISSION_ORDER) {
      const m = MISSIONS[id];
      if (m.available && (!m.requires || p.completed.includes(m.requires))) out.push({ id, name: m.name });
    }
    return out;
  }

  /** Anfitrión: prepara una invitación por código (la anterior, si no se usó, se descarta). */
  async createInvite(): Promise<string | null> {
    if (!this.host || this.inviteBusy) return null;
    this.invite?.close();
    this.invite = null;
    this.inviteBusy = true;
    this.error = null;
    this.changed();
    try {
      // Con el relé del servicio si responde: así conecta también en redes cerradas.
      this.invite = await RtcInvite.create(await iceServers(LOBBY_URL));
      return this.invite.code;
    } catch {
      this.error = COOP_TEXT.errors.unsupported;
      return null;
    } finally {
      this.inviteBusy = false;
      this.changed();
    }
  }

  /** Anfitrión: pega la respuesta del invitado. */
  async acceptAnswer(code: string): Promise<boolean> {
    const inv = this.invite;
    if (!this.host || !inv) return false;
    this.inviteBusy = true;
    this.error = null;
    this.changed();
    try {
      const link = await inv.accept(code);
      this.host.accept(link);
      this.invite = null;
      this.answerDraft = '';
      return true;
    } catch (e) {
      this.error = e instanceof Error && e.message === 'bad-code' ? COOP_TEXT.errors.badCode : COOP_TEXT.errors.rtc;
      return false;
    } finally {
      this.inviteBusy = false;
      this.changed();
    }
  }

  /** Anfitrión: la sala aparece o no en la lista pública. */
  setPublic(on: boolean): void {
    this.isPublic = on;
    this.changed();
  }

  /** Algo cambió en la sala: se cuenta al servicio y se vuelve a pintar si está a la vista. */
  changed(): void {
    if (this.room && this.host) {
      const mode: RoomMode = this.inMatch ? (this.mission ?? 'arena') : 'lobby';
      this.room.update(mode, this.host.lobbyIds.length, this.isPublic);
    }
    // Quien acaba de entrar, en pantalla (los que se van los avisa el anfitrión al soltarlos).
    const ids = this.host ? this.host.lobbyIds : this.lobbyIds;
    for (const id of ids) if (id !== this.me && !this.seen.has(id) && this.seen.size > 0) this.game.hud.showToast(COOP_TEXT.joined(playerName(id)));
    this.seen = new Set(ids);
    this.game.coopChanged();
  }

  /** Tras un corte: tres intentos de volver por el mismo camino, con la plaza que tenía. Si no, se da por perdida. */
  private async reconnect(open: () => Promise<Link>): Promise<void> {
    const ticket = this.guest?.ticket ?? undefined;
    this.game.hud.showToast(COOP_TEXT.reconnecting, 8);
    for (let attempt = 1; attempt <= 3; attempt++) {
      await new Promise((r) => setTimeout(r, 1200 * attempt));
      // Se fue mientras tanto (salió al título o cerró): no se insiste.
      if (this.game.coop !== this) return;
      try {
        const link = await open();
        if (this.game.coop !== this) {
          link.close();
          return;
        }
        this.close();
        this.game.coop = Coop.createGuest(this.game, link, { reconnect: open, ...(ticket ? { rejoin: ticket } : {}) });
        return;
      } catch {
        // Otro intento.
      }
    }
    this.end(COOP_TEXT.errors.lost);
  }

  private end(message: string): void {
    if (this.closed) return;
    this.close();
    this.game.coopEnded(message);
  }
}
