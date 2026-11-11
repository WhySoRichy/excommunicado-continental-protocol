import { Vector3 } from 'three';
import type { AudioEngine } from '../audio/AudioEngine';
import { DEG2RAD } from '../core/math';
import type { Rng } from '../core/rng';
import type { CivilianManager } from '../entities/Civilian';
import type { Enemy } from '../entities/Enemy';
import type { PlayerController } from '../entities/PlayerController';
import type { CameraRig } from '../game/CameraRig';
import type { PickupKind } from '../levels/types';
import { createRayHit, type PhysicsWorld, QueryGroups } from '../physics/Physics';
import type { Vfx } from '../render/vfx';
import { applyDamage, falloff, heal, makeVitals, restoreVitals, tickVitals, type Vitals, zoneFromHeight } from './damage';
import type { EnemyManager } from './EnemyManager';
import type { Pickups } from './Pickups';
import { STYLE_LABELS, type StyleAction, StyleMeter } from './StyleMeter';
import { WeaponState } from './WeaponState';
import { applyUpgrades, loadoutFor, suitArmor, type UpgradeId, type WeaponId, WEAPONS } from './weapons';

export interface CombatIntent {
  fireHeld: boolean;
  firePressed: boolean;
  aim: boolean;
  reloadPressed: boolean;
  takedownPressed: boolean;
  focusPressed: boolean;
  select: WeaponId | null;
  cycle: number;
}

export function emptyCombatIntent(): CombatIntent {
  return { fireHeld: false, firePressed: false, aim: false, reloadPressed: false, takedownPressed: false, focusPressed: false, select: null, cycle: 0 };
}

export interface CombatCtx {
  physics: PhysicsWorld;
  camera: CameraRig;
  player: PlayerController;
  enemies: EnemyManager;
  civilians: CivilianManager | null;
  vfx: Vfx;
  audio: AudioEngine;
  rng: Rng;
  pickups: Pickups;
}

export interface FeedItem {
  text: string;
  points: number;
  t: number;
}

export interface DamageInfo {
  label: string;
  type: string;
  from: Vector3;
  distance: number;
}

interface TakedownState {
  enemy: Enemy;
  t: number;
  shots: number;
}

/** Duraciones del takedown (s): agarre, proyección y doble tap. */
const TD_TOTAL = 0.95;
const TD_SHOT1 = 0.55;
const TD_SHOT2 = 0.75;
const TD_RANGE = 1.9;
const TD_ARC = 0.55; // cos(~57°)
export const SWITCH_TIME = 0.28;
const FOCUS_MIN = 30;
const FOCUS_DRAIN = 22;
const FOCUS_SCALE = 0.35;

const _cam = new Vector3();
const _fwd = new Vector3();
const _origin = new Vector3();
const _aim = new Vector3();
const _muzzle = new Vector3();
const _dir = new Vector3();
const _right = new Vector3();
const _up = new Vector3();
const _end = new Vector3();
const _tmp = new Vector3();
const _base = new Vector3();
const rec: [number, number] = [0, 0];

export class PlayerCombat {
  readonly vitals: Vitals;
  readonly style = new StyleMeter();
  readonly weapons = new Map<WeaponId, WeaponState>();
  loadout: WeaponId[];
  current: WeaponId;
  owned: ReadonlySet<UpgradeId>;
  switchT = 0;
  holstered = false;
  /** Se llama al pulsar disparar con el arma enfundada (zona neutral). */
  onFireWhileHolstered: (() => void) | null = null;
  focus = 40;
  focusActive = false;
  takedown: TakedownState | null = null;
  meleeT = 0;
  dead = false;
  time = 0;
  readonly stats = { shotsFired: 0, shotsHit: 0, kills: 0, headshots: 0, takedowns: 0, damageTaken: 0, healthLost: 0, reloads: 0, perfectReloads: 0, deaths: 0, switches: 0, focusUses: 0, knifeKills: 0 };
  sinceDamage = 99;
  sinceDodge = 99;
  sinceCover = 99;
  lastKillTime = -99;
  lastDamage: DamageInfo | null = null;
  readonly hitMarker = { kind: 'none' as 'none' | 'body' | 'head' | 'kill' | 'armor', t: 0 };
  /** Indicadores de daño: posición del atacante y tiempo restante. */
  readonly damageDirs: Array<{ from: Vector3; t: number }> = Array.from({ length: 6 }, () => ({ from: new Vector3(), t: 0 }));
  private damageDirNext = 0;
  readonly feed: FeedItem[] = [];
  /** La línea boca-del-arma → punto apuntado está tapada (mira gris). */
  blocked = false;
  /** Qué hay bajo la mira. */
  aimOver: 'none' | 'enemy' | 'civilian' = 'none';
  spreadDeg = 0;
  /** Recoil visual para la pose (decae). */
  recoilVis = 0;
  private lastHitEnemy: Enemy | null = null;
  private lastHitTime = -99;
  private lastRolls = 0;
  private readonly hit = createRayHit();
  private probeTimer = 0;

  constructor(owned: ReadonlySet<UpgradeId>, loadout: WeaponId[] = ['carbine', 'pistol', 'knife']) {
    this.owned = owned;
    this.loadout = loadout;
    for (const id of loadout) this.weapons.set(id, new WeaponState(applyUpgrades(WEAPONS[id], owned)));
    this.current = loadout.includes('pistol') ? 'pistol' : (loadout[0] ?? 'pistol');
    this.vitals = makeVitals({ maxHealth: 100, maxArmor: suitArmor(owned), regenDelay: 4, regenRate: 20 });
  }

  get weapon(): WeaponState {
    const w = this.weapons.get(this.current);
    if (!w) throw new Error(`Arma no disponible: ${this.current}`);
    return w;
  }

  /** Aplica en caliente las mejoras compradas (tienda del hub): armas, equipo y traje. */
  applyOwned(owned: ReadonlySet<UpgradeId>): void {
    this.owned = owned;
    this.loadout = loadoutFor(owned);
    for (const id of this.loadout) {
      const def = applyUpgrades(WEAPONS[id], owned);
      const w = this.weapons.get(id);
      if (w) w.setDef(def);
      else this.weapons.set(id, new WeaponState(def));
    }
    const maxArmor = suitArmor(owned);
    if (maxArmor !== this.vitals.maxArmor) {
      this.vitals.maxArmor = maxArmor;
      this.vitals.armor = maxArmor;
    }
  }

  /** Escala de tiempo deseada (Foco). */
  get timeScale(): number {
    return this.focusActive ? FOCUS_SCALE : 1;
  }

  /** Reaparición: vitales, munición y estados transitorios limpios (sin estados colgados). */
  respawnReset(): void {
    restoreVitals(this.vitals);
    this.dead = false;
    this.takedown = null;
    this.switchT = 0;
    this.meleeT = 0;
    this.focusActive = false;
    this.sinceDamage = 99;
    for (const w of this.weapons.values()) w.refill(false);
    for (const d of this.damageDirs) d.t = 0;
  }

  private award(action: StyleAction): void {
    const r = this.style.register(action);
    this.focus = Math.min(100, this.focus + r.points * 0.04);
    this.feed.unshift({ text: STYLE_LABELS[action], points: r.points, t: 2.2 });
    if (this.feed.length > 5) this.feed.pop();
  }

  private pushFeed(text: string): void {
    this.feed.unshift({ text, points: 0, t: 2 });
    if (this.feed.length > 5) this.feed.pop();
  }

  /** Tiempo real (no escalado): drenaje del Foco y decaimiento de feedback. */
  frameUpdate(realDt: number, audio: AudioEngine): void {
    if (this.focusActive) {
      this.focus -= FOCUS_DRAIN * realDt;
      if (this.focus <= 0) {
        this.focus = 0;
        this.focusActive = false;
        audio.focus(false);
      }
    }
    this.hitMarker.t = Math.max(0, this.hitMarker.t - realDt);
    for (const d of this.damageDirs) d.t = Math.max(0, d.t - realDt);
    for (const f of this.feed) f.t -= realDt;
    while (this.feed.length && this.feed[this.feed.length - 1]!.t <= 0) this.feed.pop();
    this.recoilVis = Math.max(0, this.recoilVis - realDt * 8);
  }

  // =============================================================== paso fijo
  fixedUpdate(dt: number, it: CombatIntent, ctx: CombatCtx): void {
    this.time += dt;
    this.sinceDamage += dt;
    this.sinceDodge += dt;
    this.sinceCover += dt;
    this.meleeT = Math.max(0, this.meleeT - dt);
    if (this.dead) return;
    tickVitals(this.vitals, dt);
    this.style.update(dt);
    const p = ctx.player;
    const rolls = p.stats.rolls + p.stats.dives;
    if (rolls !== this.lastRolls) {
      this.lastRolls = rolls;
      this.sinceDodge = 0;
    }
    if (p.state === 'cover') this.sinceCover = 0;
    for (const w of this.weapons.values()) w.update(dt);
    this.collectPickups(ctx);

    if (this.takedown) {
      this.tickTakedown(dt, ctx);
      return;
    }
    if (it.focusPressed) {
      if (this.focusActive) {
        this.focusActive = false;
        ctx.audio.focus(false);
      } else if (this.focus >= FOCUS_MIN) {
        this.focusActive = true;
        this.stats.focusUses++;
        ctx.audio.focus(true);
      }
    }
    this.handleSwitch(it);
    if (this.switchT > 0) {
      this.switchT -= dt;
      return;
    }
    if (it.takedownPressed) {
      const e = this.takedownCandidate(ctx);
      if (e) {
        this.startTakedown(e, ctx);
        return;
      }
    }
    const w = this.weapon;
    if (it.reloadPressed && w.isGun) {
      if (w.reloading) {
        const r = w.pressDuringReload();
        if (r === 'perfect') {
          this.stats.perfectReloads++;
          ctx.audio.perfectReload();
          this.award('perfectReload');
        } else if (r === 'jammed') ctx.audio.jam();
      } else if (w.startReload()) {
        this.stats.reloads++;
        ctx.audio.reload('start');
      }
    }
    if (w.isGun && w.reloading && w.reloadProgress >= 0 && w.reloadT + dt >= w.reloadDur) ctx.audio.reload('end');

    const canAct = p.state !== 'roll' && p.state !== 'vault' && p.state !== 'locked' && p.state !== 'dead';
    const wants = w.def.auto ? it.fireHeld : it.firePressed;
    if (wants && canAct) {
      if (this.holstered) {
        // Zona neutral: el director del hub decide (desenfundar con aviso).
        if (it.firePressed) this.onFireWhileHolstered?.();
      } else if (w.isGun) {
        if (w.mag === 0 && !w.reloading) {
          if (it.firePressed) ctx.audio.empty();
          if (w.startReload()) {
            this.stats.reloads++;
            ctx.audio.reload('start');
          }
        } else if (w.fire(rec)) {
          this.shoot(w, ctx, it.aim);
        }
      } else if (w.fire(rec)) {
        this.melee(ctx);
      }
    }
    // Sondas de la mira a 20 Hz (mira bloqueada / qué hay debajo).
    this.probeTimer -= dt;
    if (this.probeTimer <= 0) {
      this.probeTimer = 0.05;
      this.probeAim(ctx);
    }
    const move01 = p.stepSpeed(dt) / 4.6;
    this.spreadDeg = w.isGun ? w.spread(it.aim, move01, p.posture === 'crouch') : 0;
  }

  private handleSwitch(it: CombatIntent): void {
    let target: WeaponId | null = it.select;
    if (!target && it.cycle !== 0) {
      const i = this.loadout.indexOf(this.current);
      target = this.loadout[(i + it.cycle + this.loadout.length) % this.loadout.length] ?? null;
    }
    // La tecla 1 alterna entre las primarias (carabina ⇄ escopeta) si se compró la escopeta.
    if (target === 'carbine' && this.weapons.has('shotgun') && (this.current === 'carbine' || !this.weapons.has('carbine'))) target = 'shotgun';
    if (!target || target === this.current || !this.weapons.has(target)) return;
    this.weapon.cancelReload();
    this.current = target;
    this.switchT = SWITCH_TIME;
    this.stats.switches++;
  }

  /** Posición aproximada de la boca del arma (coherente con el modelo). */
  muzzleOf(p: PlayerController, aiming: boolean, out: Vector3): Vector3 {
    const y = p.yaw;
    const fx = -Math.sin(y);
    const fz = -Math.cos(y);
    const rx = Math.cos(y);
    const rz = -Math.sin(y);
    const h = p.posture === 'crouch' ? 0.98 : 1.42;
    const fwd = aiming ? 0.55 : 0.4;
    return out.set(p.feet.x + fx * fwd + rx * 0.22, p.feet.y + h, p.feet.z + fz * fwd + rz * 0.22);
  }

  /** Punto apuntado: rayo desde la cámara que empieza a la profundidad del jugador (nunca dispara hacia atrás). */
  private aimPoint(ctx: CombatCtx, range: number, out: Vector3): Vector3 {
    const cam = ctx.camera;
    _cam.copy(cam.position);
    _fwd.copy(cam.forward);
    this.muzzleOf(ctx.player, true, _muzzle);
    const depth = Math.max(0, _tmp.subVectors(_muzzle, _cam).dot(_fwd));
    _origin.copy(_cam).addScaledVector(_fwd, depth);
    if (ctx.physics.raycast(_origin, _fwd, range, QueryGroups.PLAYER_SHOT, this.hit, ctx.player.collider)) out.copy(this.hit.point as Vector3);
    else out.copy(_origin).addScaledVector(_fwd, range);
    return out;
  }

  private probeAim(ctx: CombatCtx): void {
    const w = this.weapon;
    const range = w.isGun ? w.def.range : 4;
    this.aimPoint(ctx, range, _aim);
    const overEnemy = this.hit.hit ? ctx.enemies.enemyFromCollider(this.hit.collider) : null;
    const overCiv = this.hit.hit && !overEnemy ? ctx.civilians?.fromCollider(this.hit.collider) : null;
    this.aimOver = overEnemy && overEnemy.alive ? 'enemy' : overCiv && overCiv.alive ? 'civilian' : 'none';
    this.muzzleOf(ctx.player, true, _muzzle);
    _dir.subVectors(_aim, _muzzle);
    const len = _dir.length();
    this.blocked = false;
    if (len > 0.5) {
      _dir.multiplyScalar(1 / len);
      if (ctx.physics.raycast(_muzzle, _dir, len - 0.2, QueryGroups.STATIC, this.hit, ctx.player.collider)) this.blocked = this.hit.distance < len * 0.85;
    }
  }

  private shoot(w: WeaponState, ctx: CombatCtx, aiming: boolean): void {
    const d = w.def;
    const p = ctx.player;
    const ph = ctx.physics;
    this.aimPoint(ctx, d.range, _aim);
    this.muzzleOf(p, aiming, _muzzle);
    const base = _base.subVectors(_aim, _muzzle).normalize();
    // Base perpendicular para el cono de spread.
    _right.crossVectors(base, Math.abs(base.y) < 0.95 ? _tmp.set(0, 1, 0) : _tmp.set(1, 0, 0)).normalize();
    _up.crossVectors(_right, base).normalize();
    const spread = w.spread(aiming, p.stepSpeed(1 / 60) / 4.6, p.posture === 'crouch') * DEG2RAD;
    let anyEnemyHit = false;
    for (let i = 0; i < Math.max(1, d.pellets); i++) {
      // Distribución uniforme en disco (más densa al centro de forma controlada).
      const a = ctx.rng.range(0, Math.PI * 2);
      const r = Math.sqrt(ctx.rng.next()) * Math.tan(spread);
      _dir.copy(base).addScaledVector(_right, Math.cos(a) * r).addScaledVector(_up, Math.sin(a) * r).normalize();
      const hit = ph.raycast(_muzzle, _dir, d.range, QueryGroups.PLAYER_SHOT, this.hit, p.collider);
      if (hit) {
        _end.copy(this.hit.point as Vector3);
        const enemy = ctx.enemies.enemyFromCollider(this.hit.collider);
        const civ = enemy ? null : ctx.civilians?.fromCollider(this.hit.collider);
        if (enemy && enemy.alive) {
          anyEnemyHit = true;
          const zone = zoneFromHeight(_end.y, enemy.feet.y, enemy.height);
          const dmg = d.damage * falloff(this.hit.distance, d.falloffStart, d.falloffEnd);
          const res = enemy.applyHit(dmg, zone, p.feet, d.headMult);
          ctx.vfx.impact(_end, this.hit.normal, 'blood', 5);
          this.onHit(enemy, zone, res.killed, res.toHeavyArmor > res.toHealth, this.hit.distance, 'gun', ctx);
        } else if (civ && civ.alive && ctx.civilians) {
          // Civil alcanzado: sin estilo ni marcador; la penalización la aplica el director de misión.
          ctx.vfx.impact(_end, this.hit.normal, 'blood', 4);
          ctx.civilians.hit(civ, d.damage * falloff(this.hit.distance, d.falloffStart, d.falloffEnd));
        } else {
          ctx.vfx.impact(_end, this.hit.normal, 'spark', 6);
          ctx.vfx.decal(_end, this.hit.normal);
        }
      } else {
        _end.copy(_muzzle).addScaledVector(_dir, d.range);
      }
      ctx.vfx.tracer(_muzzle, _end, 0xffe2a0);
    }
    this.stats.shotsFired++;
    if (anyEnemyHit) this.stats.shotsHit++;
    ctx.vfx.muzzle(_muzzle, base, true);
    ctx.audio.shot(d.id === 'carbine' ? 'carbine' : d.id === 'shotgun' ? 'shotgun' : d.noise < 12 ? 'pistolSilenced' : 'pistol');
    const k = aiming ? 0.75 : 1;
    ctx.camera.kick(rec[0] * DEG2RAD * k, -rec[1] * DEG2RAD * k);
    ctx.camera.addTrauma(d.id === 'shotgun' ? 0.22 : 0.07);
    this.recoilVis = 1;
    ctx.enemies.noise(p.feet, d.noise);
    ctx.civilians?.noise(p.feet, Math.max(d.noise, 12));
  }

  private onHit(enemy: Enemy, zone: string, killed: boolean, armored: boolean, dist: number, method: 'gun' | 'knife' | 'takedown', ctx: CombatCtx): void {
    if (killed) {
      this.hitMarker.kind = 'kill';
      this.hitMarker.t = 0.32;
      ctx.audio.hit('kill');
    } else {
      this.hitMarker.kind = zone === 'head' ? 'head' : armored ? 'armor' : 'body';
      this.hitMarker.t = 0.16;
      ctx.audio.hit(this.hitMarker.kind === 'head' ? 'head' : armored ? 'armor' : 'body');
    }
    const doubleTap = this.lastHitEnemy === enemy && this.time - this.lastHitTime < 0.35;
    this.lastHitEnemy = enemy;
    this.lastHitTime = this.time;
    if (!killed) return;
    // Atribución de estilo: acción principal (la más vistosa) + bonus.
    let primary: StyleAction = 'kill';
    if (method === 'takedown') primary = 'takedown';
    else if (method === 'knife') primary = 'knifeKill';
    else if (this.sinceDodge < 1.0) primary = 'dodgeKill';
    else if (zone === 'head') primary = 'headshot';
    else if (this.sinceCover < 0.6) primary = 'coverKill';
    else if (this.focusActive) primary = 'focusKill';
    else if (dist > 30) primary = 'longShot';
    this.award(primary);
    if (this.time - this.lastKillTime < 1.5) this.award('multiKill');
    if (this.sinceDamage > 10) this.award('noDamageKill');
    if (doubleTap || method === 'takedown') this.award('doubleTap');
    this.lastKillTime = this.time;
    this.stats.kills++;
    if (zone === 'head') this.stats.headshots++;
    if (method === 'knife') this.stats.knifeKills++;
    // Botín: munición casi siempre (nunca te quedas sin balas).
    const carb = this.weapons.get('carbine') ?? this.weapons.get('shotgun');
    const lowAmmo = !carb || carb.reserve < carb.def.mag;
    if (lowAmmo || ctx.rng.chance(0.65)) ctx.pickups.add('ammo', enemy.feet, 40);
    else if (this.vitals.health < 60 && ctx.rng.chance(0.5)) ctx.pickups.add('medkit', enemy.feet, 40);
  }

  // =============================================================== melee / takedown
  private melee(ctx: CombatCtx): void {
    const w = this.weapon;
    const p = ctx.player;
    this.meleeT = 0.3;
    ctx.audio.knife();
    const range = w.def.meleeRange ?? 1.7;
    const arc = Math.cos(((w.def.meleeArcDeg ?? 70) / 2) * DEG2RAD);
    const fx = -Math.sin(p.yaw);
    const fz = -Math.cos(p.yaw);
    let best: Enemy | null = null;
    let bestD = range;
    for (const e of ctx.enemies.enemies) {
      if (!e.alive) continue;
      const dx = e.feet.x - p.feet.x;
      const dz = e.feet.z - p.feet.z;
      const d = Math.hypot(dx, dz);
      if (d > bestD || Math.abs(e.feet.y - p.feet.y) > 1.2) continue;
      if ((dx * fx + dz * fz) / Math.max(1e-4, d) < arc) continue;
      best = e;
      bestD = d;
    }
    if (!best) return;
    // Por la espalda o sin alertar: letal siempre.
    const efx = -Math.sin(best.mover.yaw);
    const efz = -Math.cos(best.mover.yaw);
    const dx = best.feet.x - p.feet.x;
    const dz = best.feet.z - p.feet.z;
    const behind = (dx * efx + dz * efz) / Math.max(1e-4, Math.hypot(dx, dz)) > 0.3;
    const unaware = best.state === 'patrol' || best.state === 'suspicious';
    const res = best.applyHit(behind || unaware ? 999 : w.def.damage, 'body', p.feet, 1, behind || unaware);
    _tmp.set(best.feet.x, best.feet.y + 1.2, best.feet.z);
    ctx.vfx.impact(_tmp, _fwd.set(-dx, 0, -dz).normalize(), 'blood', 8);
    this.stats.shotsFired++;
    this.stats.shotsHit++;
    this.onHit(best, 'body', res.killed, false, bestD, 'knife', ctx);
  }

  /** Enemigo al alcance del takedown (para el aviso contextual y la acción). */
  takedownCandidate(ctx: CombatCtx): Enemy | null {
    const p = ctx.player;
    if (p.state !== 'ground' && p.state !== 'cover') return null;
    const fx = -Math.sin(ctx.camera.yaw);
    const fz = -Math.cos(ctx.camera.yaw);
    let best: Enemy | null = null;
    let bestD = TD_RANGE;
    for (const e of ctx.enemies.enemies) {
      if (!e.alive) continue;
      // El jefe solo cae de un takedown arrodillado; el resto, siempre (también aturdidos).
      if (e.def.takedownWhenStunned && e.state !== 'stunned') continue;
      const dx = e.feet.x - p.feet.x;
      const dz = e.feet.z - p.feet.z;
      const d = Math.hypot(dx, dz);
      if (d > bestD || Math.abs(e.feet.y - p.feet.y) > 0.8) continue;
      if ((dx * fx + dz * fz) / Math.max(1e-4, d) < TD_ARC) continue;
      best = e;
      bestD = d;
    }
    return best;
  }

  private startTakedown(e: Enemy, ctx: CombatCtx): void {
    this.weapon.cancelReload();
    this.takedown = { enemy: e, t: 0, shots: 0 };
    e.stun();
    ctx.player.setLocked(true);
    // El jugador encara al objetivo.
    ctx.player.yaw = Math.atan2(-(e.feet.x - ctx.player.feet.x), -(e.feet.z - ctx.player.feet.z));
    this.meleeT = 0.45;
    ctx.audio.takedown();
    ctx.camera.addTrauma(0.25);
  }

  private tickTakedown(dt: number, ctx: CombatCtx): void {
    const td = this.takedown!;
    td.t += dt;
    const e = td.enemy;
    const fire = (): void => {
      this.muzzleOf(ctx.player, true, _muzzle);
      _tmp.set(e.feet.x, e.feet.y + 0.35, e.feet.z);
      _dir.subVectors(_tmp, _muzzle).normalize();
      ctx.vfx.tracer(_muzzle, _tmp, 0xffe2a0);
      ctx.vfx.muzzle(_muzzle, _dir, true);
      ctx.vfx.impact(_tmp, _fwd.set(0, 1, 0), 'blood', 6);
      ctx.audio.shot('pistol');
      ctx.camera.addTrauma(0.12);
    };
    if (td.shots === 0 && td.t >= TD_SHOT1) {
      td.shots = 1;
      fire();
      if (e.alive) {
        const res = e.applyHit(999, 'body', ctx.player.feet, 1, true);
        this.stats.takedowns++;
        this.onHit(e, 'body', res.killed, false, 1, 'takedown', ctx);
      }
    }
    if (td.shots === 1 && td.t >= TD_SHOT2) {
      td.shots = 2;
      fire();
    }
    if (td.t >= TD_TOTAL || this.dead) {
      this.takedown = null;
      ctx.player.setLocked(false);
    }
  }

  // =============================================================== daño recibido
  /** Un disparo enemigo alcanzó al jugador. */
  takeHit(enemy: Enemy, amount: number, ctx: CombatCtx): void {
    if (this.dead || !(amount > 0)) return;
    const p = ctx.player;
    if (p.invulnerable) return; // i-frames de la voltereta
    let dmg = amount;
    if (this.takedown) dmg *= 0.25;
    // Cobertura: los disparos que vienen del frente de la cobertura hacen la mitad.
    if (p.state === 'cover' && p.cover) {
      const dx = enemy.feet.x - p.feet.x;
      const dz = enemy.feet.z - p.feet.z;
      const l = Math.hypot(dx, dz) || 1;
      if ((dx / l) * -p.cover.normal.x + (dz / l) * -p.cover.normal.z > 0.3) dmg *= 0.5;
    }
    const r = applyDamage(this.vitals, dmg);
    this.stats.damageTaken += r.dealt;
    this.stats.healthLost += r.toHealth;
    this.sinceDamage = 0;
    this.style.onDamage(r.dealt);
    const slot = this.damageDirs[this.damageDirNext]!;
    this.damageDirNext = (this.damageDirNext + 1) % this.damageDirs.length;
    slot.from.copy(enemy.feet);
    slot.t = 1.1;
    this.lastDamage = { label: enemy.def.label, type: enemy.def.type, from: enemy.feet.clone(), distance: enemy.feet.distanceTo(p.feet) };
    ctx.audio.hurt(dmg > 20);
    ctx.camera.addTrauma(Math.min(0.6, 0.15 + dmg / 50));
    if (r.killed) this.die(ctx);
  }

  private die(ctx: CombatCtx): void {
    this.dead = true;
    this.stats.deaths++;
    this.lastPlayerPos.copy(ctx.player.feet);
    this.focusActive = false;
    this.weapon.cancelReload();
    if (this.takedown) {
      this.takedown.enemy.brain.unstun();
      this.takedown.enemy.mover.setLocked(false);
      this.takedown = null;
    }
    ctx.player.setLocked(false);
    ctx.player.kill();
  }

  /** Texto de causa de muerte ("Te disparó un Tirador a 24 m. Venía de tu derecha."). */
  deathCause(camYaw: number): string {
    const d = this.lastDamage;
    if (!d) return 'Caíste en combate.';
    return `Te disparó un ${d.label} a ${Math.round(d.distance)} m. ${relativeSide(camYaw, d.from, this.lastPlayerPos)}`;
  }

  /** Posición del jugador en el momento de morir (para la dirección relativa). */
  lastPlayerPos = new Vector3();

  // =============================================================== pickups
  private collectPickups(ctx: CombatCtx): void {
    const carb = this.weapons.get('carbine') ?? this.weapons.get('shotgun');
    const kind = ctx.pickups.collect(ctx.player.feet, (k: PickupKind) => {
      if (k === 'ammo') return !!carb && carb.reserve < carb.def.reserve;
      if (k === 'medkit') return this.vitals.health < this.vitals.maxHealth;
      return this.vitals.armor < this.vitals.maxArmor;
    });
    if (!kind) return;
    ctx.audio.ui('confirm');
    if (kind === 'ammo' && carb) {
      carb.addReserve(carb.def.mag * 1.5);
      this.pushFeed(`+ Munición (${carb.def.name})`);
    } else if (kind === 'medkit') {
      heal(this.vitals, 50);
      this.pushFeed('+ Botiquín');
    } else {
      this.vitals.armor = this.vitals.maxArmor;
      this.pushFeed('+ Integridad del traje');
    }
  }
}

/** "desde tu derecha/izquierda/espalda/frente" respecto a la cámara. */
export function relativeSide(camYaw: number, from: Vector3, me: Vector3): string {
  const ang = Math.atan2(-(from.x - me.x), -(from.z - me.z));
  let d = ang - camYaw;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  const a = Math.abs(d);
  if (a < Math.PI / 4) return 'Venía de delante.';
  if (a > (Math.PI * 3) / 4) return 'Venía de tu espalda.';
  return d > 0 ? 'Venía de tu izquierda.' : 'Venía de tu derecha.';
}
