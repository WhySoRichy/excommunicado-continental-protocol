/** Mini helper para construir DOM sin frameworks (UI accesible y barata). */

type Child = Node | string | number | null | undefined | false;

export interface Attrs {
  class?: string;
  id?: string;
  text?: string;
  html?: never;
  role?: string;
  ariaLabel?: string;
  title?: string;
  type?: string;
  hidden?: boolean;
  tabIndex?: number;
  dataset?: Record<string, string>;
  style?: Partial<CSSStyleDeclaration>;
  onClick?: (e: MouseEvent) => void;
}

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, children: Child[] = []): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (attrs.class) el.className = attrs.class;
  if (attrs.id) el.id = attrs.id;
  if (attrs.text !== undefined) el.textContent = attrs.text;
  if (attrs.role) el.setAttribute('role', attrs.role);
  if (attrs.ariaLabel) el.setAttribute('aria-label', attrs.ariaLabel);
  if (attrs.title) el.title = attrs.title;
  if (attrs.type && el instanceof HTMLButtonElement) el.type = attrs.type as 'button' | 'submit' | 'reset';
  if (attrs.hidden) el.hidden = true;
  if (attrs.tabIndex !== undefined) el.tabIndex = attrs.tabIndex;
  if (attrs.dataset) for (const [k, v] of Object.entries(attrs.dataset)) el.dataset[k] = v;
  if (attrs.style) Object.assign(el.style, attrs.style);
  const onClick = attrs.onClick;
  if (onClick) (el as HTMLElement).addEventListener('click', (e: MouseEvent) => onClick(e));
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    el.append(typeof c === 'string' || typeof c === 'number' ? String(c) : c);
  }
  return el;
}

export function button(label: string, onClick: () => void, cls = 'btn'): HTMLButtonElement {
  const b = h('button', { class: cls, type: 'button', text: label });
  b.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  });
  return b;
}

/** Tecla en formato "chip" ([E]). */
export function keycap(label: string): HTMLElement {
  return h('kbd', { class: 'keycap', text: label });
}

/** Asigna texto solo si cambió (evita tocar el DOM cada frame). */
export function setText(el: HTMLElement, text: string): void {
  if (el.textContent !== text) el.textContent = text;
}

export function setVisible(el: HTMLElement, v: boolean): void {
  if (el.hidden === v) el.hidden = !v;
}
