/**
 * Acciones de juego y asignaciones por defecto (GAME_DESIGN §7). Los códigos son
 * `KeyboardEvent.code`, `Mouse0..4`, `WheelUp/WheelDown` y `Pad0..Pad16`
 * (mapeo estándar de la Gamepad API).
 */
export const ACTIONS = [
  'moveForward',
  'moveBack',
  'moveLeft',
  'moveRight',
  'jump',
  'dodge',
  'sprint',
  'crouch',
  'fire',
  'aim',
  'reload',
  'takedown',
  'interact',
  'focus',
  'weapon1',
  'weapon2',
  'weapon3',
  'weaponNext',
  'weaponPrev',
  'shoulder',
  'intel',
  'pause',
  'help',
  'debug',
] as const;

export type Action = (typeof ACTIONS)[number];

export type Bindings = Record<Action, string[]>;

export const DEFAULT_BINDINGS: Bindings = {
  moveForward: ['KeyW', 'ArrowUp'],
  moveBack: ['KeyS', 'ArrowDown'],
  moveLeft: ['KeyA', 'ArrowLeft'],
  moveRight: ['KeyD', 'ArrowRight'],
  jump: ['Space', 'Pad0'],
  // Ctrl NO se asigna por defecto: Ctrl+W cierra la pestaña y la página no puede impedirlo (PLAN.md).
  dodge: ['AltLeft', 'AltRight', 'Pad5'],
  sprint: ['ShiftLeft', 'ShiftRight', 'Pad10'],
  crouch: ['KeyC', 'Pad3'],
  fire: ['Mouse0', 'Pad7'],
  aim: ['Mouse2', 'Pad6'],
  reload: ['KeyR', 'Pad2'],
  takedown: ['KeyF', 'Pad1'],
  interact: ['KeyE', 'Pad0'],
  focus: ['KeyQ', 'Pad4'],
  weapon1: ['Digit1', 'Pad12'],
  weapon2: ['Digit2'],
  weapon3: ['Digit3', 'Pad13'],
  weaponNext: ['WheelDown', 'Pad15'],
  weaponPrev: ['WheelUp', 'Pad14'],
  shoulder: ['KeyV', 'Pad11'],
  intel: ['Tab', 'Pad8'],
  pause: ['Escape', 'Pad9'],
  help: ['KeyH'],
  debug: ['F3'],
};

/** Acciones que el jugador puede reasignar en Ajustes (debug y pausa quedan fijas). */
export const REBINDABLE: readonly Action[] = ACTIONS.filter((a) => a !== 'debug' && a !== 'pause');

export const ACTION_LABELS: Record<Action, string> = {
  moveForward: 'Avanzar',
  moveBack: 'Retroceder',
  moveLeft: 'Izquierda',
  moveRight: 'Derecha',
  jump: 'Saltar / Vault',
  dodge: 'Esquiva (también doble Espacio)',
  sprint: 'Sprint',
  crouch: 'Agacharse / Deslizar / Cubrirse',
  fire: 'Disparar',
  aim: 'Apuntar',
  reload: 'Recargar',
  takedown: 'Takedown / Melee',
  interact: 'Interactuar',
  focus: 'Foco (cámara lenta)',
  weapon1: 'Arma principal',
  weapon2: 'Pistola',
  weapon3: 'Cuchillo',
  weaponNext: 'Siguiente arma',
  weaponPrev: 'Arma anterior',
  shoulder: 'Cambiar de hombro',
  intel: 'Contratos / Intel',
  pause: 'Pausa',
  help: 'Controles',
  debug: 'Debug',
};

const PAD_NAMES: Record<number, string> = {
  0: 'A',
  1: 'B',
  2: 'X',
  3: 'Y',
  4: 'LB',
  5: 'RB',
  6: 'LT',
  7: 'RT',
  8: 'Select',
  9: 'Start',
  10: 'L3',
  11: 'R3',
  12: 'D-pad ↑',
  13: 'D-pad ↓',
  14: 'D-pad ←',
  15: 'D-pad →',
  16: 'Home',
};

/** Etiqueta legible de un código de entrada (para prompts y menús). */
export function codeLabel(code: string): string {
  if (code.startsWith('Pad')) return PAD_NAMES[Number(code.slice(3))] ?? code;
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  switch (code) {
    case 'Mouse0':
      return 'Clic izq.';
    case 'Mouse1':
      return 'Clic central';
    case 'Mouse2':
      return 'Clic der.';
    case 'WheelUp':
      return 'Rueda ↑';
    case 'WheelDown':
      return 'Rueda ↓';
    case 'Space':
      return 'Espacio';
    case 'ShiftLeft':
    case 'ShiftRight':
      return 'Shift';
    case 'AltLeft':
    case 'AltRight':
      return 'Alt';
    case 'ControlLeft':
    case 'ControlRight':
      return 'Ctrl';
    case 'Escape':
      return 'Esc';
    case 'Tab':
      return 'Tab';
    case 'Enter':
      return 'Enter';
    case 'ArrowUp':
      return '↑';
    case 'ArrowDown':
      return '↓';
    case 'ArrowLeft':
      return '←';
    case 'ArrowRight':
      return '→';
    default:
      return code;
  }
}

export function cloneBindings(b: Bindings): Bindings {
  const out = {} as Bindings;
  for (const a of ACTIONS) out[a] = [...(b[a] ?? DEFAULT_BINDINGS[a])];
  return out;
}

/**
 * Asigna `code` como tecla principal de `action` (sustituye la primera tecla de teclado/ratón).
 * Si el código ya estaba en otra acción, se le quita allí (sin conflictos silenciosos).
 * Devuelve la acción a la que se le quitó el código, si había una.
 */
export function rebind(b: Bindings, action: Action, code: string): Action | null {
  let stolenFrom: Action | null = null;
  for (const a of ACTIONS) {
    if (a === action) continue;
    const i = b[a].indexOf(code);
    if (i >= 0) {
      b[a].splice(i, 1);
      stolenFrom = a;
    }
  }
  const list = b[action];
  const kbIndex = list.findIndex((c) => !c.startsWith('Pad'));
  if (kbIndex >= 0) list[kbIndex] = code;
  else list.unshift(code);
  // Quita duplicados dentro de la misma acción.
  b[action] = [...new Set(list)];
  return stolenFrom;
}
