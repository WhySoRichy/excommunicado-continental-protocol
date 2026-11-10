/**
 * Reglas del Continental (lógica PURA, testeable):
 *   neutral → (desenfundar) → armed → (disparar) → excommunicado (3 oleadas) → readmitted → neutral
 * Romper la regla es una consecuencia dramática y tutorializada, nunca un bug.
 */
export type HubRuleState = 'neutral' | 'armed' | 'excommunicado' | 'readmitted';

export const EXCOM_WAVES = 3;
/** Segundos con el arma desenfundada sin disparar antes de volver a enfundar sola. */
export const HOLSTER_TIMEOUT = 8;
/** Duración del mensaje de readmisión antes de volver a la normalidad. */
export const READMIT_TIME = 4;
/** Pausa entre que cae el último enemigo de una oleada y entra la siguiente. */
export const WAVE_GAP = 2.5;

export type RuleEvent = 'warn' | 'holstered' | 'excommunicado' | 'waveStart' | 'readmitted' | 'neutral' | 'none';

export class ExcommunicadoRules {
  state: HubRuleState = 'neutral';
  wave = 0;
  /** Cuántas veces se activó en esta sesión (el perfil guarda el total). */
  triggered = 0;
  private armedTimer = 0;
  private readmitTimer = 0;
  private gapTimer = -1;
  /** Oleada lista para aparecer (el director la consume). */
  private pendingWave = 0;

  get armed(): boolean {
    return this.state === 'armed' || this.state === 'excommunicado';
  }

  get hostile(): boolean {
    return this.state === 'excommunicado';
  }

  /** El jugador pulsa disparar con el arma enfundada. */
  drawWeapon(): RuleEvent {
    if (this.state !== 'neutral') return 'none';
    this.state = 'armed';
    this.armedTimer = 0;
    return 'warn';
  }

  /** El jugador enfunda voluntariamente (o la cuenta llega a cero). */
  holster(): RuleEvent {
    if (this.state !== 'armed') return 'none';
    this.state = 'neutral';
    return 'holstered';
  }

  /** Se disparó un arma dentro del hotel. */
  shotFired(): RuleEvent {
    if (this.state !== 'neutral' && this.state !== 'armed') return 'none';
    this.state = 'excommunicado';
    this.triggered++;
    this.wave = 0;
    this.pendingWave = 1;
    this.gapTimer = -1;
    return 'excommunicado';
  }

  /** ¿Hay una oleada pendiente de aparecer? La consume. */
  takePendingWave(): number {
    const w = this.pendingWave;
    if (w > 0) {
      this.pendingWave = 0;
      this.wave = w;
    }
    return w;
  }

  /** Todos los enemigos de la oleada actual cayeron. */
  waveCleared(): RuleEvent {
    if (this.state !== 'excommunicado' || this.gapTimer >= 0 || this.pendingWave > 0) return 'none';
    if (this.wave >= EXCOM_WAVES) {
      this.readmit();
      return 'readmitted';
    }
    this.gapTimer = WAVE_GAP;
    return 'none';
  }

  /** El jugador murió: Winston lo readmite igualmente (la multa ya se pagó). */
  playerDied(): RuleEvent {
    if (this.state !== 'excommunicado') return 'none';
    this.readmit();
    return 'readmitted';
  }

  private readmit(): void {
    this.state = 'readmitted';
    this.readmitTimer = READMIT_TIME;
    this.pendingWave = 0;
    this.gapTimer = -1;
  }

  update(dt: number): RuleEvent {
    switch (this.state) {
      case 'armed':
        this.armedTimer += dt;
        if (this.armedTimer >= HOLSTER_TIMEOUT) {
          this.state = 'neutral';
          return 'holstered';
        }
        return 'none';
      case 'excommunicado':
        if (this.gapTimer >= 0) {
          this.gapTimer -= dt;
          if (this.gapTimer < 0) {
            this.pendingWave = this.wave + 1;
            return 'waveStart';
          }
        }
        return 'none';
      case 'readmitted':
        this.readmitTimer -= dt;
        if (this.readmitTimer <= 0) {
          this.state = 'neutral';
          this.wave = 0;
          return 'neutral';
        }
        return 'none';
      default:
        return 'none';
    }
  }

  reset(): void {
    this.state = 'neutral';
    this.wave = 0;
    this.pendingWave = 0;
    this.gapTimer = -1;
    this.armedTimer = 0;
    this.readmitTimer = 0;
  }
}
