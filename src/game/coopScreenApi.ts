import { MISSIONS } from '../missions/types';
import { LOBBY_URL, LOBBY_VERSION } from '../net/config';
import type { Link } from '../net/link';
import { normalizeRoomCode, type RoomMode } from '../net/lobbyProtocol';
import { findLocalHost, joinLocal } from '../net/transport/broadcast';
import { iceServers, type JoinError, joinRoom, listRooms } from '../net/transport/lobby';
import { answerInvite, rtcSupported } from '../net/transport/rtc';
import { COOP_TEXT } from '../text/coop';
import type { CoopBrowseView, CoopJoinView, CoopScreenApi } from '../ui/coopScreens';
import { Coop } from './Coop';
import type { Game } from './Game';

/** Por qué no se pudo entrar en una sala, para el jugador. */
const JOIN_ERROR: Record<JoinError, string> = {
  notfound: COOP_TEXT.errors.notfound,
  full: COOP_TEXT.errors.full,
  version: COOP_TEXT.errors.version,
  busy: COOP_TEXT.errors.busy,
  invalid: COOP_TEXT.errors.badCode,
  unreachable: COOP_TEXT.errors.unreachable,
  rtc: COOP_TEXT.errors.rtc,
};

function joinError(e: unknown): string {
  const why = e instanceof Error ? (e.message as JoinError) : 'rtc';
  return JOIN_ERROR[why] ?? COOP_TEXT.errors.rtc;
}

/** Vuelve a la sala de otra pestaña tras un corte. */
async function reopenLocal(): Promise<Link> {
  const room = await findLocalHost();
  if (!room) throw new Error('notfound');
  return joinLocal(room);
}

/** Qué se juega en una sala, para la lista. */
function modeLabel(mode: RoomMode): string {
  return mode === 'lobby' ? COOP_TEXT.modeLobby : mode === 'arena' ? COOP_TEXT.modeArena : MISSIONS[mode].name;
}

/**
 * Lo que hacen los botones de las pantallas del cooperativo. Lleva también lo de antes de conectarse: buscar salas,
 * entrar con un código de sala, con una invitación manual o desde otra pestaña.
 */
export function coopScreenApi(game: Game): CoopScreenApi {
  const join: CoopJoinView & { cancel: (() => void) | null } = { busy: false, answer: null, error: null, draft: '', cancel: null };
  const browse: CoopBrowseView & { cancel: (() => void) | null } = { loading: false, rooms: null, error: null, joining: null, cancel: null };
  const refresh = (screen: 'coopJoin' | 'coopBrowse' | 'coop'): void => {
    if (game.screens.current === screen) game.screens.refresh();
  };
  const resetJoin = (): void => {
    join.cancel?.();
    Object.assign(join, { busy: false, answer: null, error: null, draft: '', cancel: null });
  };
  /** `reconnect`: cómo volver a abrir el enlace si se corta (sin él, un corte termina la partida). */
  const enterAsGuest = (link: Link, reconnect?: () => Promise<Link>): void => {
    game.coop?.close();
    game.coopError = null;
    game.coop = Coop.createGuest(game, link, reconnect ? { reconnect } : {});
    game.screens.show('coopLobby');
  };
  /** Entra en una sala del servicio con su código (desde la lista o escrito a mano). */
  const enterRoom = (code: string, from: 'coopJoin' | 'coopBrowse'): void => {
    const state = from === 'coopJoin' ? join : browse;
    if (from === 'coopJoin') join.busy = true;
    else browse.joining = code;
    state.error = null;
    refresh(from);
    const r = joinRoom(LOBBY_URL, code, LOBBY_VERSION);
    state.cancel = r.cancel;
    r.link.then(
      (link) => {
        state.cancel = null;
        if (game.screens.current === from) enterAsGuest(link, () => joinRoom(LOBBY_URL, code, LOBBY_VERSION).link);
        else link.close();
      },
      (e: unknown) => {
        state.cancel = null;
        if (from === 'coopJoin') join.busy = false;
        else browse.joining = null;
        state.error = joinError(e);
        refresh(from);
      },
    );
  };
  /** Invitación manual: genera la respuesta y espera a que el anfitrión la pegue. */
  const answerManual = (code: string): void => {
    join.busy = true;
    join.error = null;
    refresh('coopJoin');
    void iceServers(LOBBY_URL)
      .then((ice) => answerInvite(code, ice))
      .catch(() => null)
      .then((r) => {
        if (game.screens.current !== 'coopJoin') {
          r?.cancel();
          return;
        }
        if (!r) {
          join.busy = false;
          join.error = COOP_TEXT.errors.badCode;
          refresh('coopJoin');
          return;
        }
        join.answer = r.answer;
        join.cancel = r.cancel;
        refresh('coopJoin');
        r.link.then(
          (link) => {
            join.cancel = null;
            if (join.answer === r.answer && game.screens.current === 'coopJoin') enterAsGuest(link);
            else link.close();
          },
          () => {
            if (join.answer !== r.answer) return;
            Object.assign(join, { busy: false, answer: null, error: COOP_TEXT.errors.rtc, cancel: null });
            refresh('coopJoin');
          },
        );
      });
  };
  return {
    view: () => game.coop?.view() ?? null,
    joinView: () => join,
    browseView: () => browse,
    menuError: () => game.coopError,
    create: () => {
      game.coop?.close();
      game.coopError = null;
      game.coop = Coop.createHost(game);
      game.screens.show('coopLobby');
    },
    browse: () => {
      game.coopError = null;
      browse.error = null;
      browse.joining = null;
      game.screens.show('coopBrowse');
      void refreshRooms();
    },
    refreshRooms: () => void refreshRooms(),
    joinRoom: (code) => enterRoom(code, 'coopBrowse'),
    joinLocal: () => {
      game.coopError = null;
      void findLocalHost().then((room) => {
        if (room) enterAsGuest(joinLocal(room), reopenLocal);
        else {
          game.coopError = COOP_TEXT.errors.noLocalHost;
          refresh('coop');
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
    joinCode: (input) => {
      join.draft = input;
      const code = normalizeRoomCode(input);
      if (code) enterRoom(code, 'coopJoin');
      else answerManual(input);
    },
    setPublic: (on) => game.coop?.setPublic(on),
    toggleManual: () => {
      const c = game.coop;
      if (!c) return;
      c.showManual = !c.showManual;
      game.screens.refresh();
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
      browse.cancel?.();
      browse.cancel = null;
      browse.joining = null;
      game.screens.show(from === 'coopJoin' || from === 'coopBrowse' ? 'coop' : 'title');
    },
  };

  async function refreshRooms(): Promise<void> {
    browse.loading = true;
    refresh('coopBrowse');
    const rooms = await listRooms(LOBBY_URL, LOBBY_VERSION);
    browse.loading = false;
    browse.rooms = rooms?.map((r) => ({ code: r.code, label: modeLabel(r.mode), seats: COOP_TEXT.seats(r.players, r.max) })) ?? browse.rooms;
    browse.error = rooms ? null : COOP_TEXT.errors.unreachable;
    refresh('coopBrowse');
  }
}
