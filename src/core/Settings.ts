import { ACTIONS, type Action, type Bindings, DEFAULT_BINDINGS, REBINDABLE } from './actions';
import { type KeyValueStore, SETTINGS_KEY } from './Save';

/**
 * Ajustes del jugador (lógica pura): valores por defecto, validación con límites y
 * reasignación de teclas con intercambio cuando hay conflicto. Viven aparte del perfil:
 * "Nueva partida" borra el progreso, no los ajustes.
 */
export const SETTINGS_VERSION = 1;

export type QualityPresetId = 'low' | 'medium' | 'high';
export const QUALITY_PRESETS: readonly QualityPresetId[] = ['low', 'medium', 'high'];

export interface Settings {
  version: number;
  /** Multiplicadores sobre la sensibilidad base de la cámara. */
  mouseSens: number;
  padSens: number;
  invertY: boolean;
  /** Apuntar: false = mantener el botón; true = pulsar para alternar. */
  aimToggle: boolean;
  fov: number;
  brightness: number;
  preset: QualityPresetId;
  dynamicResolution: boolean;
  master: number;
  music: number;
  sfx: number;
  ui: number;
  /** 0..1: intensidad de la sacudida de cámara. */
  shake: number;
  /** Escala de toda la interfaz. */
  uiScale: number;
  /** Muestra la columna de pistas de teclas. */
  hints: boolean;
  bindings: Bindings;
}

/** Límites de cada ajuste numérico [mín, máx]. */
export const SETTING_RANGES = {
  mouseSens: [0.25, 3],
  padSens: [0.25, 3],
  fov: [55, 95],
  brightness: [0.7, 1.5],
  master: [0, 1],
  music: [0, 1],
  sfx: [0, 1],
  ui: [0, 1],
  shake: [0, 1],
  uiScale: [0.85, 1.4],
} as const satisfies Record<string, readonly [number, number]>;

export type NumericSetting = keyof typeof SETTING_RANGES;

/** Teclas reservadas: no se pueden asignar a otra acción (pausa y debug son fijas). */
export const RESERVED_CODES: ReadonlySet<string> = new Set(['Escape', 'F3']);

export function defaultSettings(): Settings {
  return {
    version: SETTINGS_VERSION,
    mouseSens: 1,
    padSens: 1,
    invertY: false,
    aimToggle: false,
    fov: 68,
    brightness: 1,
    preset: 'medium',
    dynamicResolution: true,
    master: 0.8,
    music: 0.55,
    sfx: 0.9,
    ui: 0.7,
    shake: 1,
    uiScale: 1,
    hints: true,
    bindings: cloneBindings(DEFAULT_BINDINGS),
  };
}

export function cloneBindings(b: Bindings): Bindings {
  const out = {} as Bindings;
  for (const a of ACTIONS) out[a] = [...b[a]];
  return out;
}

const CODE_RE = /^(Key[A-Z]|Digit\d|Numpad\w+|Arrow(Up|Down|Left|Right)|F\d{1,2}|Mouse[0-4]|Wheel(Up|Down)|Pad\d{1,2}|[A-Z][A-Za-z]+)$/;

function num(x: unknown, k: NumericSetting, fallback: number): number {
  const [lo, hi] = SETTING_RANGES[k];
  return typeof x === 'number' && Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : fallback;
}

function bool(x: unknown, fallback: boolean): boolean {
  return typeof x === 'boolean' ? x : fallback;
}

/** Valida unos ajustes guardados: lo que falte o sea inválido vuelve a su valor por defecto. */
export function validateSettings(x: unknown): Settings {
  const d = defaultSettings();
  if (!x || typeof x !== 'object') return d;
  const o = x as Record<string, unknown>;
  const s: Settings = {
    version: SETTINGS_VERSION,
    mouseSens: num(o.mouseSens, 'mouseSens', d.mouseSens),
    padSens: num(o.padSens, 'padSens', d.padSens),
    invertY: bool(o.invertY, d.invertY),
    aimToggle: bool(o.aimToggle, d.aimToggle),
    fov: num(o.fov, 'fov', d.fov),
    brightness: num(o.brightness, 'brightness', d.brightness),
    preset: QUALITY_PRESETS.includes(o.preset as QualityPresetId) ? (o.preset as QualityPresetId) : d.preset,
    dynamicResolution: bool(o.dynamicResolution, d.dynamicResolution),
    master: num(o.master, 'master', d.master),
    music: num(o.music, 'music', d.music),
    sfx: num(o.sfx, 'sfx', d.sfx),
    ui: num(o.ui, 'ui', d.ui),
    shake: num(o.shake, 'shake', d.shake),
    uiScale: num(o.uiScale, 'uiScale', d.uiScale),
    hints: bool(o.hints, d.hints),
    bindings: d.bindings,
  };
  const b = o.bindings;
  if (b && typeof b === 'object') {
    const raw = b as Record<string, unknown>;
    for (const a of REBINDABLE) {
      const list = raw[a];
      if (!Array.isArray(list)) continue;
      const codes = list.filter((c): c is string => typeof c === 'string' && CODE_RE.test(c) && !RESERVED_CODES.has(c));
      // Una acción nunca se queda sin ninguna tecla de teclado/ratón: si pasa, vuelve la de fábrica.
      if (codes.some((c) => !c.startsWith('Pad'))) s.bindings[a] = [...new Set(codes)];
    }
  }
  return s;
}

export function loadSettings(kv: KeyValueStore): Settings {
  const raw = kv.get(SETTINGS_KEY);
  if (raw === null) return defaultSettings();
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.warn('[settings] ajustes ilegibles, se usan los de fábrica:', err instanceof Error ? err.message : err);
    return defaultSettings();
  }
  return validateSettings(parsed);
}

export function saveSettings(kv: KeyValueStore, s: Settings): void {
  kv.set(SETTINGS_KEY, JSON.stringify(s));
}

export type RebindResult =
  | { ok: true; bindings: Bindings; displaced: Action | null }
  | { ok: false; reason: 'reserved' | 'not-rebindable' | 'pad' };

const isKbm = (c: string): boolean => !c.startsWith('Pad');

/**
 * Asigna `code` como tecla principal (teclado/ratón) de `action`. Si otra acción la usaba,
 * se intercambian: esa acción recibe la tecla principal anterior de `action`.
 * Los botones de gamepad no se tocan.
 */
export function rebind(b: Bindings, action: Action, code: string): RebindResult {
  if (!REBINDABLE.includes(action)) return { ok: false, reason: 'not-rebindable' };
  if (RESERVED_CODES.has(code)) return { ok: false, reason: 'reserved' };
  if (!isKbm(code)) return { ok: false, reason: 'pad' };
  const out = cloneBindings(b);
  const list = out[action];
  const primaryIdx = list.findIndex(isKbm);
  const oldPrimary = primaryIdx >= 0 ? list[primaryIdx]! : null;
  if (oldPrimary === code) return { ok: true, bindings: out, displaced: null };
  let displaced: Action | null = null;
  for (const other of REBINDABLE) {
    if (other === action) continue;
    const ol = out[other];
    const i = ol.indexOf(code);
    if (i < 0) continue;
    displaced = other;
    if (oldPrimary && !ol.includes(oldPrimary)) ol[i] = oldPrimary;
    else ol.splice(i, 1);
    // Si la acción desplazada se quedó sin teclado/ratón, recupera su tecla de fábrica libre.
    if (!ol.some(isKbm)) {
      const factory = DEFAULT_BINDINGS[other].find((c) => isKbm(c) && c !== code);
      if (factory) ol.unshift(factory);
    }
  }
  // La tecla nueva sustituye a la principal; las alternativas iguales se eliminan.
  const rest = list.filter((c, i) => i !== primaryIdx && c !== code);
  out[action] = primaryIdx >= 0 ? [...rest.slice(0, primaryIdx), code, ...rest.slice(primaryIdx)] : [code, ...rest];
  return { ok: true, bindings: out, displaced };
}

/** Acciones de teclado/ratón que comparten una tecla (debería ser siempre vacío). */
export function bindingConflicts(b: Bindings): Array<{ code: string; actions: Action[] }> {
  const byCode = new Map<string, Action[]>();
  for (const a of REBINDABLE) for (const c of b[a]) if (isKbm(c)) byCode.set(c, [...(byCode.get(c) ?? []), a]);
  return [...byCode.entries()].filter(([, a]) => a.length > 1).map(([code, actions]) => ({ code, actions }));
}
