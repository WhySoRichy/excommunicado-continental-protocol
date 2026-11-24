import type { Vector3 } from 'three';
import { POISE_RECOVERY } from '../combat/hitReaction';
import type { Vec3Like } from '../physics/Physics';
import type { ShieldDef } from './ai/enemyTypes';
import { PLAYER_RADIUS } from './PlayerController';

/** A qué distancia se lleva (m), su ancho a cada lado (algo a la izquierda), entre qué alturas tapa y cuánto baja agachado. */
const PLATE = { fwd: 0.42, half: 0.33, side: -0.1, low: 0.3, high: 1.5, duck: 0.42 } as const;

/** Postura de quien lo lleva: dónde pisa, hacia dónde mira y si está agachado. */
export interface ShieldStance {
  feetY: number;
  yaw: number;
  crouched: boolean;
}

/** Un escudo balístico, solo simulación: lo que aguanta, cuándo se lo bajan y qué disparos para. */
export class Shield {
  health: number;
  /** Daño seguido que lleva encajado: al pasar de su guardia, se lo bajan. */
  private taken = 0;
  /** En una réplica, si el anfitrión lo tiene levantado. */
  private netUp: boolean | null = null;

  constructor(private readonly def: ShieldDef) {
    this.health = def.health;
  }

  get broken(): boolean {
    return this.health <= 0;
  }

  /** ¿Por delante? `holding`: quien lo lleva puede sostenerlo (en una réplica manda el anfitrión). */
  up(holding: boolean): boolean {
    return !this.broken && (this.netUp ?? holding);
  }

  tick(dt: number): void {
    this.taken = Math.max(0, this.taken - dt * POISE_RECOVERY);
  }

  reset(): void {
    this.health = this.def.health;
    this.taken = 0;
  }

  /** Encaja un impacto: aguanta, le tumban la guardia o se rompe. */
  hit(amount: number): 'held' | 'lowered' | 'broken' {
    this.health = Math.max(0, this.health - amount);
    this.taken += amount;
    if (!this.broken && this.taken < this.def.guard) return 'held';
    this.taken = 0;
    return this.broken ? 'broken' : 'lowered';
  }

  /**
   * ¿Cruza la plancha este disparo? `point` y `normal`: dónde da en la cápsula de quien lo lleva; `dir`: hacia dónde va.
   * Deja en `out` el punto de la plancha. Se mide desde el eje de la cápsula alcanzada, así vale también para un disparo
   * rebobinado.
   */
  crosses(point: Vec3Like, normal: Vec3Like, dir: Vec3Like, stance: ShieldStance, out: Vector3): boolean {
    const fx = -Math.sin(stance.yaw);
    const fz = -Math.cos(stance.yaw);
    const into = dir.x * fx + dir.z * fz;
    // Lo que viene por la espalda o de lado no cruza su plano.
    if (into > -1e-3) return false;
    const nl = Math.hypot(normal.x, normal.z) || 1;
    const px = (normal.x / nl) * PLAYER_RADIUS;
    const pz = (normal.z / nl) * PLAYER_RADIUS;
    const s = (PLATE.fwd - (px * fx + pz * fz)) / -into;
    if (s < 0) return false;
    const lateral = (px - dir.x * s) * Math.cos(stance.yaw) - (pz - dir.z * s) * Math.sin(stance.yaw);
    const y = point.y - dir.y * s - stance.feetY + (stance.crouched ? PLATE.duck : 0);
    if (Math.abs(lateral - PLATE.side) > PLATE.half || y < PLATE.low || y > PLATE.high) return false;
    out.set(point.x - dir.x * s, point.y - dir.y * s, point.z - dir.z * s);
    return true;
  }

  applyNet(up: boolean, broken: boolean): void {
    this.netUp = up;
    this.health = broken ? 0 : this.def.health;
  }
}
