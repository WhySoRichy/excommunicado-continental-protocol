import type { CombatIntent } from '../combat/PlayerCombat';
import { Rng } from '../core/rng';
import type { LevelId } from '../levels/types';
import type { MissionHud } from '../missions/ports';
import { MISSION_ORDER, MISSIONS, type MissionId } from '../missions/types';
import { FxRecorder } from '../net/fx';
import type { Link } from '../net/link';
import { NetGuest } from '../net/NetGuest';
import { NetHost } from '../net/NetHost';
import type { MissionNet, RejectReason } from '../net/protocol';
import { findLocalHost, joinLocal, LocalHost } from '../net/transport/broadcast';
import { answerInvite, RtcInvite, rtcSupported } from '../net/transport/rtc';
import { COOP_TEXT, playerName } from '../text/coop';
import type { CoopJoinView, CoopScreenApi } from '../ui/coopScreens';
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
  /** Anfitrión: la invitación por código en curso. */
  invite: { busy: boolean; code: string | null };
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
      onGuestLeft: (id) => game.hud.showToast(COOP_TEXT.left(playerName(id))),
    });
    coop = new Coop(game, host, null, recorder);
    try {
      coop.localHost = new LocalHost((link) => coop.host?.accept(link));
    } catch {
      // Sin BroadcastChannel solo se puede invitar por código.
    }
    return coop;
  }

  /** Se une a una sala por un enlace ya abierto (otra pestaña o WebRTC). */
  static createGuest(game: Game, link: Link): Coop {
    let coop: Coop | null = null;
    const guest = new NetGuest(link, {
      now: () => performance.now(),
      upgrades: new Set(game.profile.upgrades),
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
        closed: (byHost) => coop?.end(byHost ? COOP_TEXT.errors.closed : COOP_TEXT.errors.lost),
      },
    });
    coop = new Coop(game, null, guest, new FxRecorder());
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
  }

  /** Cierra el cooperativo (sale el invitado o cierra la sala el anfitrión). */
  close(): void {
    if (this.closed) return;
    this.closed = true;
    clearInterval(this.beat);
    this.invite?.close();
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
      invite: { busy: this.inviteBusy, code: this.invite?.code ?? null },
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
      this.invite = await RtcInvite.create();
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

  /** Algo cambió en la sala: se vuelve a pintar si está a la vista. */
  private changed(): void {
    // Quien acaba de entrar, en pantalla (los que se van los avisa el anfitrión al soltarlos).
    const ids = this.host ? this.host.lobbyIds : this.lobbyIds;
    for (const id of ids) if (id !== this.me && !this.seen.has(id) && this.seen.size > 0) this.game.hud.showToast(COOP_TEXT.joined(playerName(id)));
    this.seen = new Set(ids);
    this.game.coopChanged();
  }

  private end(message: string): void {
    if (this.closed) return;
    this.close();
    this.game.coopEnded(message);
  }
}

/**
 * Lo que hacen los botones de las pantallas del cooperativo. Lleva también lo de antes de conectarse: buscar una sala
 * en otra pestaña y unirse con un código (generar la respuesta y esperar a que el anfitrión la pegue).
 */
export function coopScreenApi(game: Game): CoopScreenApi {
  const join: CoopJoinView & { cancel: (() => void) | null } = { busy: false, answer: null, error: null, draft: '', cancel: null };
  const resetJoin = (): void => {
    join.cancel?.();
    Object.assign(join, { busy: false, answer: null, error: null, draft: '', cancel: null });
  };
  const enterAsGuest = (link: Link): void => {
    game.coop?.close();
    game.coopError = null;
    game.coop = Coop.createGuest(game, link);
    game.screens.show('coopLobby');
  };
  return {
    view: () => game.coop?.view() ?? null,
    joinView: () => join,
    menuError: () => game.coopError,
    create: () => {
      game.coop?.close();
      game.coopError = null;
      game.coop = Coop.createHost(game);
      game.screens.show('coopLobby');
    },
    joinLocal: () => {
      game.coopError = null;
      void findLocalHost().then((room) => {
        if (room) enterAsGuest(joinLocal(room));
        else {
          game.coopError = COOP_TEXT.errors.noLocalHost;
          if (game.screens.current === 'coop') game.screens.refresh();
        }
      });
    },
    openJoin: () => {
      resetJoin();
      if (!rtcSupported()) game.coopError = COOP_TEXT.errors.unsupported;
      game.screens.show(rtcSupported() ? 'coopJoin' : 'coop');
    },
    joinDraft: (code) => {
      join.draft = code;
    },
    joinCode: (code) => {
      join.draft = code;
      join.busy = true;
      join.error = null;
      game.screens.refresh();
      void answerInvite(code)
        .catch(() => null)
        .then((r) => {
          if (game.screens.current !== 'coopJoin') {
            r?.cancel();
            return;
          }
          if (!r) {
            join.busy = false;
            join.error = COOP_TEXT.errors.badCode;
            game.screens.refresh();
            return;
          }
          join.answer = r.answer;
          join.cancel = r.cancel;
          game.screens.refresh();
          r.link.then(
            (link) => {
              join.cancel = null;
              if (join.answer === r.answer && game.screens.current === 'coopJoin') enterAsGuest(link);
              else link.close();
            },
            () => {
              if (join.answer !== r.answer) return;
              Object.assign(join, { busy: false, answer: null, error: COOP_TEXT.errors.rtc, cancel: null });
              if (game.screens.current === 'coopJoin') game.screens.refresh();
            },
          );
        });
    },
    invite: () => void game.coop?.createInvite(),
    answer: (code) => void game.coop?.acceptAnswer(code),
    answerDraft: (code) => {
      if (game.coop) game.coop.answerDraft = code;
    },
    start: (mode) => game.coopStart(mode),
    backToLobby: () => game.coopBackToLobby(),
    leave: () => game.coopLeave(),
    back: () => {
      const from = game.screens.current;
      resetJoin();
      game.screens.show(from === 'coopJoin' ? 'coop' : 'title');
    },
  };
}
