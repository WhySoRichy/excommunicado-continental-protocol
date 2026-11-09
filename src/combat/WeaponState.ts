import { clamp } from '../core/math';
import type { WeaponDef } from './weapons';

export type ReloadPress = 'perfect' | 'jammed' | 'ignored';

/**
 * Estado de un arma en runtime (puro, testeable). Garantías para el checklist:
 * - cambiar de arma o morir cancela la recarga sin transferir munición (nunca queda "recargando" colgado);
 * - la recarga perfecta solo se intenta una vez por recarga;
 * - la munición nunca es negativa ni supera el cargador.
 */
export class WeaponState {
  def: WeaponDef;
  mag: number;
  reserve: number;
  cooldown = 0;
  reloading = false;
  reloadT = 0;
  reloadDur = 0;
  private perfectTried = false;
  /** Resultado de la última recarga (para HUD/estilo). */
  lastReload: 'none' | 'normal' | 'perfect' | 'jammed' = 'none';
  shotIndex = 0;
  sinceShot = 99;
  bloom = 0;

  constructor(def: WeaponDef) {
    this.def = def;
    this.mag = def.mag;
    this.reserve = def.reserve;
  }

  /** Reemplaza la definición (mejoras compradas) manteniendo la munición válida. */
  setDef(def: WeaponDef): void {
    this.def = def;
    this.mag = Math.min(this.mag, def.mag);
  }

  get isGun(): boolean {
    return this.def.kind === 'gun';
  }

  get interval(): number {
    return 60 / this.def.rpm;
  }

  canFire(): boolean {
    if (this.cooldown > 0) return false;
    if (!this.isGun) return true;
    return this.mag > 0 && !this.reloading;
  }

  /** Dispara: consume munición y devuelve el retroceso [subida, lateral] en grados. */
  fire(out: [number, number]): boolean {
    if (this.reloading && this.mag > 0) this.cancelReload(); // recarga cancelable: fluidez gun-fu
    if (!this.canFire()) return false;
    this.cooldown = this.interval;
    this.sinceShot = 0;
    if (this.isGun) {
      this.mag--;
      const pat = this.def.recoil;
      const r = pat[Math.min(this.shotIndex, pat.length - 1)] ?? [0, 0];
      out[0] = r[0];
      out[1] = r[1];
      this.shotIndex++;
      this.bloom = Math.min(this.def.maxBloom, this.bloom + this.def.bloomPerShot);
    } else {
      out[0] = 0;
      out[1] = 0;
    }
    return true;
  }

  get needsReload(): boolean {
    return this.isGun && this.mag < this.def.mag && this.reserve > 0;
  }

  startReload(): boolean {
    if (!this.isGun || this.reloading || !this.needsReload) return false;
    this.reloading = true;
    this.reloadT = 0;
    this.reloadDur = this.def.reloadTime;
    this.perfectTried = false;
    return true;
  }

  /** Pulsar recargar DURANTE la recarga: intento de recarga perfecta (una vez). */
  pressDuringReload(): ReloadPress {
    if (!this.reloading || this.perfectTried) return 'ignored';
    this.perfectTried = true;
    const f = this.reloadT / this.def.reloadTime;
    if (f >= this.def.perfectStart && f <= this.def.perfectEnd) {
      this.completeReload();
      this.lastReload = 'perfect';
      return 'perfect';
    }
    this.reloadDur += this.def.jamPenalty;
    this.lastReload = 'jammed';
    return 'jammed';
  }

  cancelReload(): void {
    this.reloading = false;
    this.reloadT = 0;
  }

  private completeReload(): void {
    const need = this.def.mag - this.mag;
    const take = Math.min(need, this.reserve);
    this.mag += take;
    this.reserve -= take;
    this.reloading = false;
    this.reloadT = 0;
  }

  /** Progreso de recarga 0..1 (−1 si no recarga). */
  get reloadProgress(): number {
    return this.reloading ? clamp(this.reloadT / this.reloadDur, 0, 1) : -1;
  }

  /** Ventana perfecta en fracción del tiempo actual de recarga (para dibujarla). */
  get perfectWindow(): [number, number] {
    const k = this.def.reloadTime / Math.max(1e-6, this.reloadDur);
    return [this.def.perfectStart * k, this.def.perfectEnd * k];
  }

  get perfectAvailable(): boolean {
    return this.reloading && !this.perfectTried;
  }

  update(dt: number): void {
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.sinceShot += dt;
    if (this.sinceShot > this.def.recoilReset) this.shotIndex = 0;
    this.bloom = Math.max(0, this.bloom - this.def.bloomDecay * dt);
    if (this.reloading) {
      this.reloadT += dt;
      if (this.reloadT >= this.reloadDur) {
        this.completeReload();
        if (this.lastReload !== 'jammed') this.lastReload = 'normal';
      }
    }
  }

  /**
   * Spread actual (grados). `move01` = velocidad / trote; agachado reduce un 30 %.
   */
  spread(aiming: boolean, move01: number, crouched: boolean): number {
    const d = this.def;
    let s = (aiming ? d.spreadAim : d.spreadHip) + d.spreadMove * clamp(move01, 0, 1.6) * (aiming ? 0.5 : 1) + this.bloom;
    if (crouched) s *= 0.7;
    return s;
  }

  /** Repone munición (checkpoint/pickup). */
  refill(fullReserve: boolean): void {
    this.cancelReload();
    this.mag = this.def.mag;
    if (fullReserve) this.reserve = this.def.reserve;
  }

  addReserve(n: number): void {
    if (!this.isGun) return;
    this.reserve = Math.min(this.def.reserve === Number.POSITIVE_INFINITY ? Number.POSITIVE_INFINITY : this.def.reserve * 2, this.reserve + n);
  }
}
