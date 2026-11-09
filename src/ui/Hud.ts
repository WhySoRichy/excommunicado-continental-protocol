import { h, keycap, setText, setVisible } from './dom';

export interface PromptSpec {
  key: string;
  text: string;
}

/**
 * HUD de juego (DOM). Solo escribe en el DOM cuando un valor cambia
 * (nada de reflows por frame).
 */
export class Hud {
  readonly root: HTMLDivElement;
  private readonly crosshair: HTMLDivElement;
  private readonly prompt: HTMLDivElement;
  private readonly promptKey: HTMLElement;
  private readonly promptText: HTMLSpanElement;
  private readonly zone: HTMLDivElement;
  private readonly hints: HTMLDivElement;
  private lastPrompt = '';
  private lastSpread = -1;

  constructor(uiRoot: HTMLElement) {
    this.root = h('div', { id: 'hud', ariaLabel: 'HUD' });
    this.crosshair = h('div', { class: 'crosshair', ariaLabel: 'Mira' }, [
      h('i', { class: 'ch ch-t' }),
      h('i', { class: 'ch ch-b' }),
      h('i', { class: 'ch ch-l' }),
      h('i', { class: 'ch ch-r' }),
      h('i', { class: 'ch-dot' }),
    ]);
    this.promptKey = keycap('E');
    this.promptText = h('span', { class: 'prompt-text' });
    this.prompt = h('div', { class: 'prompt', role: 'status' }, [this.promptKey, this.promptText]);
    this.prompt.hidden = true;
    this.zone = h('div', { class: 'zone-label' });
    this.hints = h('div', { class: 'hints' });
    this.root.append(this.crosshair, this.prompt, this.zone, this.hints);
    this.root.hidden = true;
    uiRoot.appendChild(this.root);
  }

  setVisible(v: boolean): void {
    setVisible(this.root, v);
  }

  setZone(text: string): void {
    setText(this.zone, text);
  }

  /** Líneas de ayuda (tecla, texto). */
  setHints(lines: PromptSpec[]): void {
    this.hints.replaceChildren(...lines.map((l) => h('div', { class: 'hint' }, [keycap(l.key), h('span', { text: l.text })])));
  }

  setPrompt(p: PromptSpec | null): void {
    const key = p ? `${p.key}|${p.text}` : '';
    if (key === this.lastPrompt) return;
    this.lastPrompt = key;
    if (!p) {
      this.prompt.hidden = true;
      return;
    }
    setText(this.promptKey, p.key);
    setText(this.promptText, p.text);
    this.prompt.hidden = false;
  }

  /** Separación de la mira en px según el spread actual. */
  setSpread(px: number): void {
    const r = Math.round(px);
    if (r === this.lastSpread) return;
    this.lastSpread = r;
    this.crosshair.style.setProperty('--gap', `${r}px`);
  }

  setCrosshairVisible(v: boolean): void {
    setVisible(this.crosshair, v);
  }
}
