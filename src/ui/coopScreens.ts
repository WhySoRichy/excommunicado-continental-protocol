import type { CoopMode, CoopView } from '../game/Coop';
import { COOP_TEXT } from '../text/coop';
import { button, h } from './dom';

/** Lo que muestra la pantalla de unirse con un código. */
export interface CoopJoinView {
  /** Entrando en la sala, generando la respuesta o esperando a que el anfitrión la pegue. */
  busy: boolean;
  /** Invitación manual: la respuesta para el anfitrión, cuando está lista. */
  answer: string | null;
  error: string | null;
  /** Lo que lleva escrito o pegado (se conserva al repintar). */
  draft: string;
}

/** Lo que muestra la lista de salas públicas. */
export interface CoopBrowseView {
  loading: boolean;
  /** Las salas (null: aún no se ha podido preguntar). */
  rooms: Array<{ code: string; label: string; seats: string }> | null;
  error: string | null;
  /** Código de la sala en la que se está entrando. */
  joining: string | null;
}

/** Lo que las pantallas del cooperativo piden y hacen (lo implementa el juego). */
export interface CoopScreenApi {
  view(): CoopView | null;
  joinView(): CoopJoinView;
  browseView(): CoopBrowseView;
  /** Error al intentar unirse o al perder la conexión (se muestra en el menú). */
  menuError(): string | null;
  create(): void;
  browse(): void;
  refreshRooms(): void;
  joinRoom(code: string): void;
  joinLocal(): void;
  openJoin(): void;
  /** Un código de sala o una invitación manual: lo que sea, se entra. */
  joinCode(code: string): void;
  joinDraft(code: string): void;
  /** Anfitrión: sala pública o no; mostrar la invitación manual o no. */
  setPublic(on: boolean): void;
  toggleManual(): void;
  invite(): void;
  answer(code: string): void;
  answerDraft(code: string): void;
  start(mode: CoopMode): void;
  /** Anfitrión: vuelve a la sala con todos. */
  backToLobby(): void;
  leave(): void;
  back(): void;
}

/** Campo de texto multilínea (los códigos manuales son largos): sin corrector ni autocompletado. */
function codeArea(value: string, opts: { readonly?: boolean; label: string; onInput?: (v: string) => void; rows?: number }): HTMLTextAreaElement {
  const t = h('textarea', { class: 'coop-code', ariaLabel: opts.label });
  t.value = value;
  t.rows = opts.rows ?? 3;
  t.spellcheck = false;
  t.autocomplete = 'off';
  t.readOnly = !!opts.readonly;
  if (opts.readonly) t.addEventListener('focus', () => t.select());
  const onInput = opts.onInput;
  if (onInput) t.addEventListener('input', () => onInput(t.value));
  // Las teclas del juego no deben reaccionar mientras se escribe aquí.
  t.addEventListener('keydown', (e) => e.stopPropagation());
  return t;
}

/** Botón que copia un texto y lo confirma en su etiqueta. */
function copyButton(text: string): HTMLButtonElement {
  const b = button(
    COOP_TEXT.copy,
    () => {
      const done = (): void => {
        b.textContent = COOP_TEXT.copied;
        setTimeout(() => (b.textContent = COOP_TEXT.copy), 1500);
      };
      if (navigator.clipboard) void navigator.clipboard.writeText(text).then(done, () => undefined);
    },
    'btn btn-small',
  );
  return b;
}

function errorLine(text: string | null): HTMLElement | null {
  return text ? h('p', { class: 'coop-error', role: 'alert', text }) : null;
}

export function buildCoopMenu(api: CoopScreenApi): HTMLElement {
  return h('section', { class: 'screen screen-coop', role: 'dialog', ariaLabel: COOP_TEXT.menu }, [
    h('h2', { class: 'screen-heading', text: COOP_TEXT.heading }),
    h('p', { class: 'screen-hint', text: COOP_TEXT.intro }),
    h('div', { class: 'menu' }, [
      button(COOP_TEXT.create, () => api.create(), 'btn btn-primary'),
      button(COOP_TEXT.browse, () => api.browse()),
      button(COOP_TEXT.joinCode, () => api.openJoin()),
      button(COOP_TEXT.joinLocal, () => api.joinLocal()),
      button(COOP_TEXT.back, () => api.back()),
    ]),
    errorLine(api.menuError()),
  ]);
}

export function buildCoopBrowse(api: CoopScreenApi): HTMLElement {
  const b = api.browseView();
  const children: Array<HTMLElement | null> = [h('h2', { class: 'screen-heading', text: COOP_TEXT.browseHeading })];
  if (b.loading && !b.rooms) children.push(h('p', { class: 'screen-hint', text: COOP_TEXT.browseLoading }));
  else if (b.rooms && b.rooms.length === 0) children.push(h('p', { class: 'screen-hint', text: COOP_TEXT.browseEmpty }));
  else if (b.rooms)
    children.push(
      h(
        'ul',
        { class: 'coop-rooms', ariaLabel: COOP_TEXT.browseHeading },
        b.rooms.map((r) =>
          h('li', { class: 'coop-room', dataset: { room: r.code } }, [
            h('span', { class: 'coop-room-code', text: r.code }),
            h('span', { class: 'coop-room-mode', text: r.label }),
            h('span', { class: 'coop-room-seats', text: r.seats }),
            button(b.joining === r.code ? COOP_TEXT.connecting : COOP_TEXT.browseJoin, () => !b.joining && api.joinRoom(r.code), 'btn btn-small btn-primary'),
          ]),
        ),
      ),
    );
  children.push(
    errorLine(b.error),
    h('div', { class: 'menu menu-row' }, [
      button(b.loading ? COOP_TEXT.browseLoading : COOP_TEXT.browseRefresh, () => !b.loading && api.refreshRooms()),
      button(COOP_TEXT.back, () => api.back()),
    ]),
  );
  return h('section', { class: 'screen screen-coop', role: 'dialog', ariaLabel: COOP_TEXT.browseHeading }, children);
}

export function buildCoopJoin(api: CoopScreenApi): HTMLElement {
  const j = api.joinView();
  const children: Array<HTMLElement | null> = [h('h2', { class: 'screen-heading', text: COOP_TEXT.joinHeading })];
  if (!j.answer) {
    const area = codeArea(j.draft, { label: COOP_TEXT.joinPaste, onInput: (v) => api.joinDraft(v), rows: 2 });
    children.push(
      h('label', { class: 'coop-label', text: COOP_TEXT.joinPaste }),
      area,
      h('div', { class: 'menu menu-row' }, [
        button(j.busy ? COOP_TEXT.connecting : COOP_TEXT.joinGo, () => !j.busy && api.joinCode(area.value), 'btn btn-primary'),
        button(COOP_TEXT.back, () => api.back()),
      ]),
    );
  } else {
    // Invitación manual: la respuesta vuelve al anfitrión por el mismo chat.
    children.push(
      h('p', { class: 'screen-hint', text: COOP_TEXT.joinAnswerHint }),
      codeArea(j.answer, { readonly: true, label: COOP_TEXT.joinAnswerHint }),
      h('div', { class: 'menu menu-row' }, [copyButton(j.answer), button(COOP_TEXT.back, () => api.back())]),
      h('p', { class: 'coop-status', text: COOP_TEXT.connecting }),
    );
  }
  children.push(h('p', { class: 'coop-note', text: COOP_TEXT.privacy }), errorLine(j.error));
  return h('section', { class: 'screen screen-coop', role: 'dialog', ariaLabel: COOP_TEXT.joinHeading }, children);
}

/** La invitación manual del anfitrión (para cuando el servicio de salas no responde o el código no funciona). */
function manualInvite(api: CoopScreenApi, v: CoopView): HTMLElement[] {
  if (!v.invite.code)
    return [
      h('div', { class: 'menu menu-row' }, [
        button(v.invite.busy ? COOP_TEXT.inviteWorking : COOP_TEXT.inviteCreate, () => !v.invite.busy && api.invite(), 'btn'),
      ]),
    ];
  const answer = codeArea(v.answerDraft, { label: COOP_TEXT.answerLabel, onInput: (x) => api.answerDraft(x) });
  return [
    h('p', { class: 'screen-hint', text: COOP_TEXT.inviteHint }),
    codeArea(v.invite.code, { readonly: true, label: COOP_TEXT.inviteHeading }),
    h('div', { class: 'menu menu-row' }, [copyButton(v.invite.code)]),
    h('label', { class: 'coop-label', text: COOP_TEXT.answerLabel }),
    answer,
    h('div', { class: 'menu menu-row' }, [
      button(v.invite.busy ? COOP_TEXT.connecting : COOP_TEXT.answerConnect, () => !v.invite.busy && api.answer(answer.value), 'btn'),
    ]),
  ];
}

/** `loadout`: el selector de equipo del jugador (lo construye `loadoutScreens.ts`). */
export function buildCoopLobby(api: CoopScreenApi, loadout: HTMLElement | null = null): HTMLElement {
  const v = api.view();
  if (!v) return h('section', { class: 'screen' });
  const players = h(
    'ul',
    { class: 'coop-players', ariaLabel: 'Jugadores' },
    v.players.map((p) =>
      h('li', { class: `coop-player${p.you ? ' you' : ''}`, dataset: { player: String(p.id) } }, [
        h('span', { class: 'coop-name', text: p.name }),
        p.you ? h('span', { class: 'coop-you', text: COOP_TEXT.you }) : null,
        p.status ? h('span', { class: 'coop-status', text: p.status }) : null,
      ]),
    ),
  );
  // A la izquierda, quién está y cómo invitar; a la derecha, con qué se juega (el equipo de cada uno) y a qué.
  const who: Array<HTMLElement | null> = [players];
  const play: Array<HTMLElement | null> = [loadout];
  if (v.role === 'host') {
    const room = v.room;
    // El código de la sala: lo que se comparte para invitar.
    if (room.code)
      who.push(
        h('div', { class: 'coop-roomcode', ariaLabel: COOP_TEXT.roomCode }, [
          h('span', { class: 'coop-label', text: COOP_TEXT.roomCode }),
          h('strong', { class: 'coop-roomcode-value', text: room.code }),
          copyButton(room.code),
        ]),
        h('p', { class: 'coop-note', text: COOP_TEXT.roomCodeHint }),
        h('div', { class: 'menu menu-row' }, [
          button(
            room.public ? COOP_TEXT.publicOn : COOP_TEXT.publicOff,
            () => api.setPublic(!room.public),
            room.public ? 'btn btn-small btn-primary' : 'btn btn-small',
          ),
        ]),
        h('p', { class: 'coop-note', text: COOP_TEXT.publicHint }),
      );
    else who.push(h('p', { class: 'screen-hint', text: room.state === 'down' ? COOP_TEXT.roomDown : COOP_TEXT.roomConnecting }));
    play.push(
      h('div', { class: 'achv-title', text: COOP_TEXT.chooseMode }),
      h(
        'div',
        { class: 'menu coop-modes' },
        v.modes.map((m, i) => button(m.name, () => api.start(m.id), i === 0 ? 'btn btn-primary' : 'btn')),
      ),
    );
    // La invitación manual: a la vista si el servicio no responde; si no, plegada.
    if (room.state === 'down' || v.showManual) {
      who.push(h('div', { class: 'achv-title', text: COOP_TEXT.inviteHeading }), ...manualInvite(api, v));
      if (room.state !== 'down') who.push(h('div', { class: 'menu menu-row' }, [button(COOP_TEXT.manualHide, () => api.toggleManual(), 'btn btn-small')]));
    } else who.push(h('div', { class: 'menu menu-row' }, [button(COOP_TEXT.manualShow, () => api.toggleManual(), 'btn btn-small')]));
    who.push(h('p', { class: 'coop-note', text: COOP_TEXT.localHint }), h('p', { class: 'coop-note', text: COOP_TEXT.privacy }));
  } else {
    who.push(h('p', { class: 'screen-hint', text: v.me === 0 ? COOP_TEXT.connecting : COOP_TEXT.waitingHost }));
  }
  return h('section', { class: 'screen screen-coop screen-lobby', role: 'dialog', ariaLabel: COOP_TEXT.lobby }, [
    h('h2', { class: 'screen-heading', text: COOP_TEXT.lobby }),
    h('div', { class: 'lobby-cols' }, [h('div', { class: 'lobby-col' }, who), h('div', { class: 'lobby-col' }, play)]),
    errorLine(v.error),
    h('div', { class: 'menu' }, [button(v.role === 'host' ? COOP_TEXT.leaveLobby : COOP_TEXT.leaveGame, () => api.leave(), 'btn btn-danger')]),
  ]);
}
