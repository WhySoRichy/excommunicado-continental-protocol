/**
 * Máquina de estados ÚNICA del juego. Las transiciones son explícitas: cualquier
 * transición no declarada lanza un error (los tests la recorren entera).
 */
export type GameStateId =
  | 'boot'
  | 'title'
  | 'loading'
  | 'hub'
  | 'hubMenu'
  | 'briefing'
  | 'playing'
  | 'paused'
  | 'dead'
  | 'results';

export const TRANSITIONS: Readonly<Record<GameStateId, readonly GameStateId[]>> = {
  boot: ['title', 'loading'],
  title: ['loading'],
  loading: ['hub', 'playing', 'briefing', 'title'],
  hub: ['hubMenu', 'paused', 'loading', 'playing', 'briefing', 'dead'],
  hubMenu: ['hub', 'briefing', 'loading'],
  briefing: ['loading', 'hub', 'playing'],
  playing: ['paused', 'dead', 'results', 'loading', 'hub'],
  paused: ['hub', 'playing', 'loading', 'title'],
  dead: ['playing', 'hub', 'results', 'loading'],
  results: ['loading', 'title'],
};

/** Estados en los que avanza la simulación. */
export const SIMULATING: ReadonlySet<GameStateId> = new Set(['hub', 'playing', 'dead']);
/** Estados en los que el jugador controla al personaje. */
export const CONTROLLING: ReadonlySet<GameStateId> = new Set(['hub', 'playing']);

export type StateListener = (to: GameStateId, from: GameStateId) => void;

export class GameStateMachine {
  private current: GameStateId = 'boot';
  private previous: GameStateId = 'boot';
  private readonly listeners = new Set<StateListener>();
  /** Estado al que vuelve la pausa. */
  resumeTo: 'hub' | 'playing' = 'playing';

  get state(): GameStateId {
    return this.current;
  }

  get prev(): GameStateId {
    return this.previous;
  }

  can(to: GameStateId): boolean {
    return TRANSITIONS[this.current].includes(to);
  }

  go(to: GameStateId): void {
    if (to === this.current) return;
    if (!this.can(to)) throw new Error(`Transición inválida: ${this.current} → ${to}`);
    if (to === 'paused' && (this.current === 'hub' || this.current === 'playing')) this.resumeTo = this.current;
    this.previous = this.current;
    this.current = to;
    for (const fn of this.listeners) fn(to, this.previous);
  }

  on(fn: StateListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  get simulating(): boolean {
    return SIMULATING.has(this.current);
  }

  get controlling(): boolean {
    return CONTROLLING.has(this.current);
  }
}
