/**
 * Style Meter (gamificación central, GAME_DESIGN §5). Lógica PURA.
 * - Cada acción suma puntos al medidor; al llenarse sube el multiplicador (×1..×8).
 * - Variedad: repetir una acción de las 3 últimas rinde ×0,5 (o ×0,25 si aparece 2+ veces).
 * - Decae tras 2,5 s sin acciones; recibir daño resta medidor y puede bajar un nivel.
 */
export type StyleAction =
  | 'kill'
  | 'headshot'
  | 'takedown'
  | 'perfectReload'
  | 'dodgeKill'
  | 'doubleTap'
  | 'coverKill'
  | 'noDamageKill'
  | 'knifeKill'
  | 'focusKill'
  | 'multiKill'
  | 'longShot';

export const STYLE_BASE: Record<StyleAction, number> = {
  kill: 100,
  headshot: 150,
  takedown: 250,
  perfectReload: 80,
  dodgeKill: 200,
  doubleTap: 120,
  coverKill: 120,
  noDamageKill: 100,
  knifeKill: 200,
  focusKill: 80,
  multiKill: 150,
  longShot: 100,
};

export const STYLE_LABELS: Record<StyleAction, string> = {
  kill: 'Baja',
  headshot: 'Headshot',
  takedown: 'Takedown',
  perfectReload: 'Recarga perfecta',
  dodgeKill: 'Esquiva letal',
  doubleTap: 'Doble tap',
  coverKill: 'Desde cobertura',
  noDamageKill: 'Intocable',
  knifeKill: 'Filo',
  focusKill: 'Foco',
  multiKill: 'Multi-baja',
  longShot: 'Tiro largo',
};

export const STYLE_RANKS = ['Discreto', 'Preciso', 'Letal', 'Implacable', 'Despiadado', 'Mítico', 'Baba Yaga', 'Leyenda'] as const;

export const STYLE_ACTIONS = Object.keys(STYLE_BASE) as StyleAction[];

export const MAX_MULTIPLIER = 8;
const DECAY_DELAY = 2.5;
const DECAY_RATE = 0.22;
const DAMAGE_PENALTY = 0.35;
const RECENT = 3;

export interface StyleAward {
  action: StyleAction;
  points: number;
  variety: number;
  multiplier: number;
  leveledUp: boolean;
}

/**
 * Orden de prioridad para elegir la acción "principal" de una baja (la más vistosa).
 * Los bonus (multiKill, noDamageKill, doubleTap) se registran aparte.
 */
export const KILL_PRIORITY: readonly StyleAction[] = ['takedown', 'knifeKill', 'dodgeKill', 'headshot', 'coverKill', 'focusKill', 'longShot', 'kill'];

export class StyleMeter {
  multiplier = 1;
  gauge = 0;
  score = 0;
  bestMultiplier = 1;
  sinceAction = 99;
  readonly used = new Set<StyleAction>();
  readonly counts: Record<StyleAction, number> = Object.fromEntries(STYLE_ACTIONS.map((a) => [a, 0])) as Record<StyleAction, number>;
  private readonly recent: StyleAction[] = [];

  static threshold(mult: number): number {
    return 250 + 120 * (mult - 1);
  }

  get rankName(): string {
    return STYLE_RANKS[Math.max(0, Math.min(STYLE_RANKS.length - 1, this.multiplier - 1))] ?? STYLE_RANKS[0];
  }

  /** Factor de variedad para una acción según las últimas registradas. */
  varietyFor(action: StyleAction): number {
    let n = 0;
    for (const a of this.recent) if (a === action) n++;
    return n === 0 ? 1 : n === 1 ? 0.5 : 0.25;
  }

  register(action: StyleAction): StyleAward {
    const variety = this.varietyFor(action);
    const base = STYLE_BASE[action];
    const multAtAward = this.multiplier;
    const points = Math.round(base * variety * multAtAward);
    this.score += points;
    this.gauge += (base * variety) / StyleMeter.threshold(this.multiplier);
    let leveledUp = false;
    while (this.gauge >= 1 && this.multiplier < MAX_MULTIPLIER) {
      this.gauge -= 1;
      this.multiplier++;
      leveledUp = true;
    }
    if (this.multiplier >= MAX_MULTIPLIER) this.gauge = Math.min(this.gauge, 1);
    this.bestMultiplier = Math.max(this.bestMultiplier, this.multiplier);
    this.recent.push(action);
    if (this.recent.length > RECENT) this.recent.shift();
    this.used.add(action);
    this.counts[action]++;
    this.sinceAction = 0;
    return { action, points, variety, multiplier: multAtAward, leveledUp };
  }

  update(dt: number): void {
    this.sinceAction += dt;
    if (this.sinceAction <= DECAY_DELAY) return;
    this.gauge -= DECAY_RATE * dt;
    if (this.gauge < 0) {
      if (this.multiplier > 1) {
        this.multiplier--;
        this.gauge = 0.6;
      } else {
        this.gauge = 0;
      }
    }
  }

  /** Recibir daño resta medidor (proporcional) y puede bajar un nivel. */
  onDamage(amount: number): void {
    if (!(amount > 0)) return;
    this.gauge -= DAMAGE_PENALTY * Math.min(1, amount / 25);
    if (this.gauge < 0) {
      if (this.multiplier > 1) {
        this.multiplier--;
        this.gauge = 0.5;
      } else {
        this.gauge = 0;
      }
    }
  }

  /** Nº de tipos distintos de acciones de estilo usados (para la nota de variedad). */
  get varietyCount(): number {
    return this.used.size;
  }

  reset(): void {
    this.multiplier = 1;
    this.gauge = 0;
    this.score = 0;
    this.bestMultiplier = 1;
    this.sinceAction = 99;
    this.used.clear();
    this.recent.length = 0;
    for (const a of STYLE_ACTIONS) this.counts[a] = 0;
  }
}
