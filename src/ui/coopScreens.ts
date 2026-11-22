import type { CoopMode, CoopView } from '../game/Coop';
import { COOP_TEXT } from '../text/coop';
import { button, h } from './dom';

/** Lo que muestra la pantalla de unirse con un código. */
export interface CoopJoinView {
  /** Generando la respuesta o esperando a que el anfitrión la pegue. */
  busy: boolean;
  /** La respuesta para el anfitrión, cuando está lista. */
  answer: string | null;
  error: string | null;
  /** Lo que lleva pegado (se conserva al repintar). */
  draft: string;
}

/** Lo que las pantallas del cooperativo piden y hacen (lo implementa el juego). */
export interface CoopScreenApi {
  view(): CoopView | null;
  joinView(): CoopJoinView;
  /** Error al intentar unirse o al perder la conexión (se muestra en el menú). */
  menuError(): string | null;
  create(): void;
  joinLocal(): void;
  openJoin(): void;
  joinCode(code: string): void;
  joinDraft(code: string): void;
  invite(): void;
  answer(code: string): void;
  answerDraft(code: string): void;
  start(mode: CoopMode): void;
  /** Anfitrión: vuelve a la sala con todos. */
  backToLobby(): void;
  leave(): void;
  back(): void;
}

/** Campo de texto multilínea (los códigos son largos): sin corrector ni autocompletado. */
function codeArea(value: string, opts: { readonly?: boolean; label: string; onInput?: (v: string) => void }): HTMLTextAreaElement {
  const t = h('textarea', { class: 'coop-code', ariaLabel: opts.label });
  t.value = value;
  t.rows = 3;
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
      button(COOP_TEXT.joinLocal, () => api.joinLocal()),
      button(COOP_TEXT.joinCode, () => api.openJoin()),
      button(COOP_TEXT.back, () => api.back()),
    ]),
    errorLine(api.menuError()),
  ]);
}

export function buildCoopJoin(api: CoopScreenApi): HTMLElement {
  const j = api.joinView();
  const children: Array<HTMLElement | null> = [h('h2', { class: 'screen-heading', text: COOP_TEXT.joinHeading })];
  if (!j.answer) {
    const area = codeArea(j.draft, { label: COOP_TEXT.joinPaste, onInput: (v) => api.joinDraft(v) });
    children.push(
      h('label', { class: 'coop-label', text: COOP_TEXT.joinPaste }),
      area,
      h('div', { class: 'menu menu-row' }, [
        button(j.busy ? COOP_TEXT.connecting : COOP_TEXT.joinAnswer, () => !j.busy && api.joinCode(area.value), 'btn btn-primary'),
        button(COOP_TEXT.back, () => api.back()),
      ]),
    );
  } else {
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

export function buildCoopLobby(api: CoopScreenApi): HTMLElement {
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
  const children: Array<HTMLElement | null> = [h('h2', { class: 'screen-heading', text: COOP_TEXT.lobby }), players];
  if (v.role === 'host') {
    children.push(
      h('div', { class: 'achv-title', text: COOP_TEXT.chooseMode }),
      h(
        'div',
        { class: 'menu coop-modes' },
        v.modes.map((m, i) => button(m.name, () => api.start(m.id), i === 0 ? 'btn btn-primary' : 'btn')),
      ),
      h('div', { class: 'achv-title', text: COOP_TEXT.inviteHeading }),
    );
    if (v.invite.code) {
      const answer = codeArea(v.answerDraft, { label: COOP_TEXT.answerLabel, onInput: (x) => api.answerDraft(x) });
      children.push(
        h('p', { class: 'screen-hint', text: COOP_TEXT.inviteHint }),
        codeArea(v.invite.code, { readonly: true, label: COOP_TEXT.inviteHeading }),
        h('div', { class: 'menu menu-row' }, [copyButton(v.invite.code)]),
        h('label', { class: 'coop-label', text: COOP_TEXT.answerLabel }),
        answer,
        h('div', { class: 'menu menu-row' }, [
          button(v.invite.busy ? COOP_TEXT.connecting : COOP_TEXT.answerConnect, () => !v.invite.busy && api.answer(answer.value), 'btn'),
        ]),
      );
    } else {
      children.push(
        h('div', { class: 'menu menu-row' }, [
          button(v.invite.busy ? COOP_TEXT.inviteWorking : COOP_TEXT.inviteCreate, () => !v.invite.busy && api.invite(), 'btn'),
        ]),
      );
    }
    children.push(h('p', { class: 'coop-note', text: COOP_TEXT.localHint }), h('p', { class: 'coop-note', text: COOP_TEXT.privacy }));
  } else {
    children.push(h('p', { class: 'screen-hint', text: v.me === 0 ? COOP_TEXT.connecting : COOP_TEXT.waitingHost }));
  }
  children.push(
    errorLine(v.error),
    h('div', { class: 'menu' }, [button(v.role === 'host' ? COOP_TEXT.leaveLobby : COOP_TEXT.leaveGame, () => api.leave(), 'btn btn-danger')]),
  );
  return h('section', { class: 'screen screen-coop screen-lobby', role: 'dialog', ariaLabel: COOP_TEXT.lobby }, children);
}
