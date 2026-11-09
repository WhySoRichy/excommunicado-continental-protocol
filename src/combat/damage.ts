/**
 * Modelo de daño PURO (sin three ni DOM): integridad del traje (armadura regenerable)
 * + salud, zonas de impacto y armadura de blindados. Testeado en Vitest.
 */

export type HitZone = 'head' | 'body' | 'limb';

export interface Vitals {
  health: number;
  maxHealth: number;
  /** Armadura ("integridad del traje"): absorbe primero. */
  armor: number;
  maxArmor: number;
  /** Segundos sin daño antes de regenerar armadura. */
  regenDelay: number;
  /** Armadura por segundo al regenerar. */
  regenRate: number;
  /** Tiempo desde el último daño (s). */
  sinceDamage: number;
  /** Armadura pesada (blindados): reduce el daño al cuerpo mientras dure. */
  heavyArmor: number;
  maxHeavyArmor: number;
  dead: boolean;
}

export function makeVitals(o: Partial<Vitals> & { maxHealth: number }): Vitals {
  return {
    health: o.health ?? o.maxHealth,
    maxHealth: o.maxHealth,
    armor: o.armor ?? o.maxArmor ?? 0,
    maxArmor: o.maxArmor ?? 0,
    regenDelay: o.regenDelay ?? 4,
    regenRate: o.regenRate ?? 20,
    sinceDamage: o.sinceDamage ?? 99,
    heavyArmor: o.heavyArmor ?? o.maxHeavyArmor ?? 0,
    maxHeavyArmor: o.maxHeavyArmor ?? 0,
    dead: false,
  };
}

export interface DamageOpts {
  zone?: HitZone;
  /** Multiplicador de headshot del arma. */
  headMult?: number;
  /** Ignora armadura (takedown, ejecución). */
  pierce?: boolean;
  /** Daño mínimo garantizado tras armadura pesada (fracción). */
  heavyBodyFactor?: number;
}

export interface DamageResult {
  /** Daño efectivo total aplicado (armadura + salud). */
  dealt: number;
  toArmor: number;
  toHealth: number;
  toHeavyArmor: number;
  killed: boolean;
  zone: HitZone;
}

/** Factor de daño al cuerpo mientras el blindado conserva armadura pesada. */
export const HEAVY_BODY_FACTOR = 0.2;
export const LIMB_FACTOR = 0.75;

/** Daño base escalado por zona. */
export function zoneDamage(base: number, zone: HitZone, headMult: number): number {
  if (zone === 'head') return base * headMult;
  if (zone === 'limb') return base * LIMB_FACTOR;
  return base;
}

/** Atenuación lineal por distancia: 100 % hasta `start`, `minFactor` desde `end`. */
export function falloff(distance: number, start: number, end: number, minFactor = 0.6): number {
  if (distance <= start) return 1;
  if (distance >= end) return minFactor;
  return 1 - (1 - minFactor) * ((distance - start) / (end - start));
}

/** Aplica daño a unas vitales (muta `v`). */
export function applyDamage(v: Vitals, amount: number, o: DamageOpts = {}): DamageResult {
  const zone = o.zone ?? 'body';
  const res: DamageResult = { dealt: 0, toArmor: 0, toHealth: 0, toHeavyArmor: 0, killed: false, zone };
  if (v.dead || !(amount > 0)) return res;
  let dmg = zoneDamage(amount, zone, o.headMult ?? 1);
  v.sinceDamage = 0;

  // Armadura pesada: los disparos al cuerpo apenas dañan; los headshots la ignoran.
  if (!o.pierce && v.heavyArmor > 0 && zone !== 'head') {
    const absorbed = Math.min(v.heavyArmor, dmg * (1 - (o.heavyBodyFactor ?? HEAVY_BODY_FACTOR)));
    v.heavyArmor -= absorbed;
    res.toHeavyArmor = absorbed;
    dmg -= absorbed;
  }
  if (!o.pierce && v.armor > 0) {
    const a = Math.min(v.armor, dmg);
    v.armor -= a;
    res.toArmor = a;
    dmg -= a;
  }
  const hp = Math.min(v.health, dmg);
  v.health -= hp;
  res.toHealth = hp;
  res.dealt = res.toArmor + res.toHealth + res.toHeavyArmor;
  if (v.health <= 0) {
    v.health = 0;
    v.dead = true;
    res.killed = true;
  }
  return res;
}

/** Regeneración de armadura (solo armadura normal; la salud no se regenera). */
export function tickVitals(v: Vitals, dt: number): void {
  if (v.dead) return;
  v.sinceDamage += dt;
  if (v.sinceDamage >= v.regenDelay && v.armor < v.maxArmor) v.armor = Math.min(v.maxArmor, v.armor + v.regenRate * dt);
}

export function heal(v: Vitals, hp: number): void {
  if (v.dead) return;
  v.health = Math.min(v.maxHealth, v.health + hp);
}

export function restoreVitals(v: Vitals): void {
  v.health = v.maxHealth;
  v.armor = v.maxArmor;
  v.heavyArmor = v.maxHeavyArmor;
  v.sinceDamage = 99;
  v.dead = false;
}

/** Zona de impacto según la altura del impacto relativa a los pies y la altura del cuerpo. */
export function zoneFromHeight(hitY: number, feetY: number, bodyHeight: number): HitZone {
  const r = (hitY - feetY) / bodyHeight;
  if (r >= 0.8) return 'head';
  if (r <= 0.42) return 'limb';
  return 'body';
}
