import { Vector3 } from 'three';
import type { AudioEngine } from '../audio/AudioEngine';
import type { Action } from '../core/actions';
import { heal } from '../combat/damage';
import { computeRank, type MissionStats, type RankResult } from '../combat/rank';
import { markersPerContract } from '../combat/weapons';
import { addCoins, contractReward, gauntletReward } from '../hub/economy';
import { type GauntletEntry, recordBest, recordGauntlet, type Profile } from '../core/Save';
import type { Enemy } from '../entities/Enemy';
import type { LevelSession } from '../game/LevelSession';
import type { CheckpointDef, EnemyType, MissionBlock, ObjectiveDef, Vec3 } from '../levels/types';
import type { Hud } from '../ui/Hud';
import { evaluateAchievements, type MissionRunSummary, type UnlockedAchievement } from './achievements';
import {
  GAUNTLET_BREAK,
  GAUNTLET_HEAL,
  GAUNTLET_SPAWN_CLEARANCE,
  GAUNTLET_SPAWN_INTERVAL,
  gauntletSpawnPoints,
  gauntletWave,
  waveQueue,
} from './gauntlet';
import { copyCounters, emptyCounters, formatObjective, SKILL_GOAL, type SkillCounters, skillProgress, skillTally } from './tutorial';
import { MISSIONS, type MissionId } from './types';

export interface MissionOutcome {
  mission: MissionId;
  success: boolean;
  failReason: string;
  rank: RankResult;
  stats: MissionStats;
  timeSec: number;
  coinsReward: number;
  firstTime: boolean;
  achievements: UnlockedAchievement[];
  newBest: boolean;
  kills: number;
  markersUsed: number;
  markersTotal: number;
  /** Solo en el Gauntlet: oleadas superadas, puesto en el top 10 (0 = fuera) y el top actual. */
  gauntlet: { waves: number; position: number; top: GauntletEntry[] } | null;
}

export interface MissionDirectorDeps {
  session: LevelSession;
  /** Guion que no vive en los datos del nivel (Gauntlet sobre el hub). */
  block?: MissionBlock;
  /** Etiqueta de la tecla asignada a una acción (textos del tutorial). */
  label?: (a: Action) => string;
  hud: Hud;
  audio: AudioEngine;
  profile: Profile;
  save(): void;
  onFinished(outcome: MissionOutcome): void;
}

/** Fases del jefe: al cruzar estos umbrales de salud se arrodilla (takedown posible) y pide refuerzos. */
const BOSS_PHASES: readonly number[] = [0.5, 0.2];
const BOSS_KNEEL_TIME = 3.5;
/** Gauntlet: no aparecen enemigos a menos de esta distancia del jugador. */
const GAUNTLET_SPAWN_MIN_PLAYER_DIST = 4;
/** Paso de Foco del tutorial: el medidor se llena para poder practicarlo. */
const TUTORIAL_FOCUS = 100;
/** Paso de recarga: si el cargador está lleno, se vacían estas balas para poder recargar. */
const TUTORIAL_RELOAD_SPEND = 3;
const _v = new Vector3();

/**
 * Director de misión: objetivos en orden, checkpoints, marcadores de sangre (vidas),
 * alarma, civiles, jefe por fases y pantalla de resultados con rango D–S y recompensa.
 */
export class MissionDirector {
  readonly id: MissionId;
  readonly objectives: readonly ObjectiveDef[];
  index = 0;
  time = 0;
  finished = false;
  readonly markersTotal: number;
  markersUsed = 0;
  /** Punto de reaparición actual. */
  readonly respawnPos: Vector3;
  respawnYaw: number;
  alarmSounded = false;
  alarmDisabled = false;
  civiliansHurt = 0;
  civiliansKilled = 0;
  minHealth = 100;
  marksmenHeadshots = 0;
  marksmenTotal = 0;
  escapeLeft = 0;
  /** Oleadas superadas (Gauntlet). */
  gauntletWaves = 0;
  readonly doneTargets = new Set<string>();
  private readonly bossPhaseDone = new Set<number>();
  private bossKneel = 0;
  private bossKneeling: Enemy | null = null;
  private objectiveTime = 0;
  private lastKills = 0;
  /** Gauntlet: oleada en curso (0 = respiro antes de la primera), cola de aparición y temporizadores. */
  gauntletWave = 0;
  gauntletBreak = 0;
  private readonly waveQueue: EnemyType[] = [];
  private readonly waveEnemies: Enemy[] = [];
  private spawnT = 0;
  private spawnCursor = 0;
  private spawnPoints: Vec3[] = [];
  /** Tutorial: contadores al empezar el paso y los actuales (reutilizados, sin asignar por paso). */
  private readonly learnBase: SkillCounters = emptyCounters();
  private readonly learnNow: SkillCounters = emptyCounters();
  /** El rango solo cuenta desde que acaba el tutorial (estadísticas base en ese momento). */
  private readonly scoreBase = { shotsFired: 0, shotsHit: 0, takedowns: 0, knifeKills: 0, damageTaken: 0 };
  /** Último número mostrado en el HUD del objetivo (evita reescribir el texto cada paso). */
  private hudNum = Number.NaN;

  constructor(private readonly d: MissionDirectorDeps) {
    const s = d.session;
    const block = d.block ?? s.data.mission;
    if (!block) throw new Error(`El nivel ${s.data.id} no tiene guion de misión`);
    this.id = block.id;
    this.objectives = block.objectives;
    this.markersTotal = block.lives ?? markersPerContract(new Set(d.profile.upgrades));
    const sp = s.data.spawn;
    this.respawnPos = new Vector3(sp.pos[0], sp.pos[1], sp.pos[2]);
    this.respawnYaw = sp.yaw;
    this.marksmenTotal = s.data.enemies.filter((e) => e.type === 'marksman').length;
    this.startObjective(0);
  }

  get current(): ObjectiveDef | null {
    return this.objectives[this.index] ?? null;
  }

  /** Texto del objetivo con la tecla real asignada. */
  text(o: ObjectiveDef): string {
    return this.d.label ? formatObjective(o.text, this.d.label) : o.text;
  }

  get currentText(): string {
    const o = this.current;
    return o ? this.text(o) : '';
  }

  /** Tras reasignar teclas: repinta el objetivo con las nuevas. */
  refreshText(): void {
    this.hudNum = Number.NaN;
    const o = this.current;
    if (o && !this.finished) this.d.hud.setObjective(this.text(o));
  }

  /** Pone `text · n sufijo` en el HUD solo si el número cambió. */
  private hudCount(o: ObjectiveDef, n: number, suffix: (n: number) => string): void {
    if (n === this.hudNum) return;
    this.hudNum = n;
    this.d.hud.setObjective(`${this.text(o)} · ${suffix(n)}`);
  }

  /** "Saltar tutorial": va directo al primer objetivo puntuable. */
  skipLearn(): void {
    if (this.current?.kind !== 'learn') return;
    for (const o of this.objectives) if (o.stunGroup) this.d.session.enemies.despawnGroup(o.stunGroup);
    const i = this.objectives.findIndex((o) => o.kind !== 'learn');
    if (i >= 0) this.startObjective(i, true);
  }

  private fillCounters(out: SkillCounters): SkillCounters {
    const p = this.d.session.player.stats;
    const c = this.d.session.combat.stats;
    out.distance = p.distance;
    out.sprintTime = p.sprintTime;
    out.vaults = p.vaults;
    out.mantles = p.mantles;
    out.slides = p.slides;
    out.rolls = p.rolls;
    out.dives = p.dives;
    out.coverEnters = p.coverEnters;
    out.shotsFired = c.shotsFired;
    out.reloads = c.reloads;
    out.switches = c.switches;
    out.focusUses = c.focusUses;
    out.takedowns = c.takedowns;
    return out;
  }

  /** Gauntlet: enemigos de la oleada en curso que aún esperan para aparecer. */
  get gauntletPending(): number {
    return this.waveQueue.length;
  }

  get markersLeft(): number {
    return this.markersTotal - this.markersUsed;
  }

  /** Posición de la baliza del objetivo actual (null = sin baliza). */
  beacon(out: Vector3): Vector3 | null {
    const o = this.current;
    if (!o) return null;
    const s = this.d.session;
    if (o.kind === 'waves') {
      let best: Enemy | null = null;
      let bd = Number.POSITIVE_INFINITY;
      for (const e of this.waveEnemies) {
        if (!e.alive) continue;
        const dd = e.feet.distanceToSquared(s.player.feet);
        if (dd < bd) {
          bd = dd;
          best = e;
        }
      }
      return best ? out.set(best.feet.x, best.feet.y + 1.9, best.feet.z) : null;
    }
    if (o.kind === 'learn' && o.stunGroup) {
      for (const e of s.enemies.enemies) if (e.alive && e.spawnDef.group === o.stunGroup) return out.set(e.feet.x, e.feet.y + 1.9, e.feet.z);
      return null;
    }
    if (o.kind === 'eliminate' || o.kind === 'boss') {
      // Baliza sobre el enemigo vivo más cercano del grupo.
      let best: Enemy | null = null;
      let bd = Number.POSITIVE_INFINITY;
      for (const e of s.enemies.enemies) {
        if (!e.alive || !this.matchesGroup(e, o)) continue;
        const dd = e.feet.distanceToSquared(s.player.feet);
        if (dd < bd) {
          bd = dd;
          best = e;
        }
      }
      if (best) return out.set(best.feet.x, best.feet.y + 1.9, best.feet.z);
      return o.at ? out.set(o.at[0], o.at[1] + 1.2, o.at[2]) : null;
    }
    if (o.kind === 'interact' && o.targets) {
      let best: Vector3 | null = null;
      let bd = Number.POSITIVE_INFINITY;
      for (const t of o.targets) {
        if (this.doneTargets.has(t)) continue;
        const it = s.data.interactables.find((i) => i.id === t);
        if (!it) continue;
        const dd = (it.pos[0] - s.player.feet.x) ** 2 + (it.pos[2] - s.player.feet.z) ** 2;
        if (dd < bd) {
          bd = dd;
          best = out.set(it.pos[0], it.pos[1] + 1.2, it.pos[2]);
        }
      }
      return best;
    }
    if (o.at) return out.set(o.at[0], o.at[1] + 1.2, o.at[2]);
    return null;
  }

  private matchesGroup(e: Enemy, o: ObjectiveDef): boolean {
    if (o.kind === 'boss') return e.spawnDef.id === o.enemyId || e.id.startsWith(`${o.enemyId}#`);
    const g = o.group ?? 'all';
    return g === 'all' || e.spawnDef.group === g;
  }

  private startObjective(i: number, skipped = false): void {
    const o = this.objectives[i];
    if (!o) return;
    this.index = i;
    this.objectiveTime = 0;
    this.hudNum = Number.NaN;
    const prev = this.objectives[i - 1];
    if (o.kind !== 'learn' && prev?.kind === 'learn') this.startScoring();
    if (o.kind === 'learn') this.startLearn(o);
    if (o.onStart) {
      const n = this.d.session.enemies.spawnEvent(o.onStart);
      if (n > 0) this.d.session.enemies.alertAll(this.d.session.player.feet);
    }
    if (o.kind === 'escape') this.escapeLeft = o.seconds ?? 45;
    this.d.hud.setObjective(this.text(o));
    if (o.kind === 'waves') {
      this.spawnPoints = gauntletSpawnPoints(this.d.session.data);
      if (this.spawnPoints.length === 0) throw new Error(`El nivel ${this.d.session.data.id} no tiene puntos de oleada`);
      this.gauntletBreak = GAUNTLET_BREAK;
      this.d.hud.setZone('GAUNTLET · EXCOMUNICADO');
      this.d.hud.setObjective(this.breakText());
    }
    if (i > 0) {
      // En el tutorial la instrucción ya está en la barra del objetivo: el toast solo confirma.
      const msg = o.kind === 'learn' ? '✓ Hecho' : prev?.kind === 'learn' && !skipped ? `Tutorial completado · ${this.text(o)}` : `Objetivo: ${this.text(o)}`;
      this.d.hud.showToast(msg, o.kind === 'learn' ? 1.2 : 3);
      this.d.audio.ui('confirm');
    }
  }

  /** Fin del tutorial: el reloj y las estadísticas del rango empiezan aquí. */
  private startScoring(): void {
    const c = this.d.session.combat;
    this.time = 0;
    this.minHealth = c.vitals.health;
    this.scoreBase.shotsFired = c.stats.shotsFired;
    this.scoreBase.shotsHit = c.stats.shotsHit;
    this.scoreBase.takedowns = c.stats.takedowns;
    this.scoreBase.knifeKills = c.stats.knifeKills;
    this.scoreBase.damageTaken = c.stats.damageTaken;
  }

  /** Prepara un paso del tutorial para que siempre se pueda cumplir. */
  private startLearn(o: ObjectiveDef): void {
    copyCounters(this.fillCounters(this.learnNow), this.learnBase);
    const c = this.d.session.combat;
    if (o.skill === 'focus') c.focus = Math.max(c.focus, TUTORIAL_FOCUS);
    if (o.skill === 'reload') {
      const w = c.weapon;
      if (w.isGun && w.mag >= w.def.mag) w.mag = Math.max(1, w.mag - TUTORIAL_RELOAD_SPEND);
    }
  }

  private completeObjective(): void {
    const o = this.current;
    if (!o) return;
    if (o.onComplete) this.d.session.enemies.spawnEvent(o.onComplete);
    if (o.checkpoint) this.activateCheckpoint(o.checkpoint);
    if (this.index + 1 >= this.objectives.length) {
      this.finish(true, '');
      return;
    }
    this.startObjective(this.index + 1);
  }

  private activateCheckpoint(id: string): void {
    const cp: CheckpointDef | undefined = this.d.session.data.checkpoints.find((c) => c.id === id);
    if (!cp) return;
    this.respawnPos.set(cp.pos[0], cp.pos[1], cp.pos[2]);
    this.respawnYaw = cp.yaw;
    this.d.hud.showToast(`Punto de control: ${cp.label}`, 2.5);
  }

  /** Un interactable de misión se activó (terminal, cargamento, panel de alarma). */
  onInteract(id: string): void {
    const it = this.d.session.data.interactables.find((i) => i.id === id);
    if (it?.kind === 'alarmPanel') {
      this.alarmDisabled = true;
      this.d.hud.showToast('Alarma desactivada', 2.5);
      this.d.audio.ui('confirm');
    }
    this.doneTargets.add(id);
  }

  /** Un enemigo dio la voz de alarma (primera alerta). */
  onEnemyAlert(e: Enemy): void {
    const block = this.d.session.data.mission;
    if (!block?.alarm || this.alarmSounded || this.alarmDisabled) return;
    this.alarmSounded = true;
    const n = this.d.session.enemies.spawnEvent('alarm');
    this.d.hud.showToast(n > 0 ? '¡Alarma! Llegan refuerzos' : '¡Alarma!', 3);
    this.d.audio.alert(e.feet);
    this.d.session.enemies.alertAll(this.d.session.player.feet);
  }

  onCivilianHurt(killed: boolean): void {
    if (killed) {
      this.civiliansKilled++;
      this.d.hud.showToast('¡Civil abatido! El rango queda limitado a C', 3.5);
      this.d.audio.ui('error');
    } else {
      this.civiliansHurt++;
      this.d.hud.showToast('¡Civil herido! Baja la nota de civiles', 2.5);
      this.d.audio.ui('error');
    }
  }

  /** El jugador murió. Devuelve true si puede reaparecer (quedan marcadores). */
  onPlayerDied(): boolean {
    this.markersUsed++;
    if (this.markersUsed >= this.markersTotal) {
      this.finish(false, 'Sin marcadores de sangre.');
      return false;
    }
    return true;
  }

  fixedUpdate(dt: number): void {
    if (this.finished) return;
    const s = this.d.session;
    const o = this.current;
    if (!o) return;
    // El tutorial no cuenta para el rango: ni reloj ni salud mínima.
    if (o.kind !== 'learn') {
      this.time += dt;
      this.minHealth = Math.min(this.minHealth, s.combat.vitals.health);
    }
    this.objectiveTime += dt;
    this.trackMarksmen();
    this.tickBoss(dt);
    if (o.stunGroup) {
      for (const e of s.enemies.enemies) if (e.alive && e.spawnDef.group === o.stunGroup && e.state !== 'stunned') e.stun();
    }
    switch (o.kind) {
      case 'learn': {
        const skill = o.skill;
        if (!skill) {
          this.completeObjective();
          break;
        }
        this.fillCounters(this.learnNow);
        let groupGone = false;
        if (o.stunGroup) {
          let seen = 0;
          let alive = 0;
          for (const e of s.enemies.enemies) {
            if (e.spawnDef.group !== o.stunGroup) continue;
            seen++;
            if (e.alive) alive++;
          }
          groupGone = seen > 0 && alive === 0;
        }
        if (groupGone || skillProgress(skill, this.learnBase, this.learnNow) >= 1) {
          this.d.audio.ui('confirm');
          this.completeObjective();
          break;
        }
        const tally = skillTally(skill, this.learnBase, this.learnNow);
        if (tally !== null) this.hudCount(o, tally, (n) => `${n}/${SKILL_GOAL[skill]}`);
        break;
      }
      case 'reach':
      case 'escape': {
        if (o.kind === 'escape') {
          this.escapeLeft = Math.max(0, (o.seconds ?? 45) - this.objectiveTime);
          this.hudCount(o, Math.ceil(this.escapeLeft), (n) => `${n} s`);
          if (this.escapeLeft <= 0) {
            this.finish(false, 'Se acabó el tiempo de escape.');
            return;
          }
        }
        if (o.at && this.playerInZone(o.at, o.radius ?? 2.5)) this.completeObjective();
        break;
      }
      case 'eliminate': {
        let alive = 0;
        let seen = 0;
        for (const e of s.enemies.enemies) {
          if (!this.matchesGroup(e, o)) continue;
          seen++;
          if (e.alive) alive++;
        }
        if (seen > 0 && alive === 0) this.completeObjective();
        else if (alive > 0 && this.objectiveTime > 0.5) this.hudCount(o, alive, (n) => `${n} restante${n === 1 ? '' : 's'}`);
        break;
      }
      case 'interact': {
        const targets = o.targets ?? [];
        const left = targets.filter((t) => !this.doneTargets.has(t)).length;
        if (left === 0) this.completeObjective();
        else if (targets.length > 1) this.hudCount(o, targets.length - left, (n) => `${n}/${targets.length}`);
        break;
      }
      case 'survive': {
        const left = Math.max(0, (o.seconds ?? 30) - this.objectiveTime);
        this.hudCount(o, Math.ceil(left), (n) => `${n} s`);
        if (left <= 0) this.completeObjective();
        break;
      }
      case 'waves':
        this.tickWaves(dt);
        break;
      case 'boss': {
        const boss = s.enemies.enemies.find((e) => this.matchesGroup(e, o));
        if (boss && !boss.alive) this.completeObjective();
        else if (boss) this.hudCount(o, Math.ceil((boss.vitals.health / boss.vitals.maxHealth) * 100), (n) => `${n} %`);
        break;
      }
    }
  }

  /** Gauntlet: respiro → oleada (aparición escalonada en puntos libres) → oleada superada → respiro… */
  private tickWaves(dt: number): void {
    const s = this.d.session;
    if (this.gauntletBreak > 0) {
      this.gauntletBreak -= dt;
      this.d.hud.setObjective(this.breakText());
      if (this.gauntletBreak <= 0) this.startWave();
      return;
    }
    this.spawnT -= dt;
    if (this.waveQueue.length > 0 && this.spawnT <= 0) this.spawnNext();
    let alive = 0;
    for (const e of this.waveEnemies) if (e.alive) alive++;
    const left = alive + this.waveQueue.length;
    if (left === 0) {
      this.gauntletWaves = this.gauntletWave;
      this.gauntletBreak = GAUNTLET_BREAK;
      this.waveEnemies.length = 0;
      heal(s.combat.vitals, GAUNTLET_HEAL);
      this.d.hud.showToast(`Oleada ${this.gauntletWave} superada · +${GAUNTLET_HEAL} salud`, 2.5);
      this.d.audio.ui('confirm');
      return;
    }
    this.d.hud.setObjective(`Oleada ${this.gauntletWave} · ${left} restante${left === 1 ? '' : 's'}`);
  }

  private breakText(): string {
    return `Oleada ${this.gauntletWave + 1} en ${Math.max(1, Math.ceil(this.gauntletBreak))} s`;
  }

  private startWave(): void {
    this.gauntletWave++;
    this.waveQueue.length = 0;
    this.waveQueue.push(...waveQueue(gauntletWave(this.gauntletWave)));
    this.spawnT = 0;
    this.d.hud.setZone(`GAUNTLET · OLEADA ${this.gauntletWave}`);
    this.d.hud.showToast(`Oleada ${this.gauntletWave}`, 2);
    this.d.audio.alert(this.d.session.player.feet);
  }

  /** Aparece el siguiente de la cola en un punto libre (sin cápsulas encima ni el jugador al lado). */
  private spawnNext(): void {
    const s = this.d.session;
    const pts = this.spawnPoints;
    const clear2 = GAUNTLET_SPAWN_CLEARANCE * GAUNTLET_SPAWN_CLEARANCE;
    const minPlayer2 = GAUNTLET_SPAWN_MIN_PLAYER_DIST * GAUNTLET_SPAWN_MIN_PLAYER_DIST;
    for (let k = 0; k < pts.length; k++) {
      const p = pts[(this.spawnCursor + k) % pts.length]!;
      _v.set(p[0], p[1], p[2]);
      if (_v.distanceToSquared(s.player.feet) < minPlayer2) continue;
      let blocked = false;
      for (const e of s.enemies.enemies) {
        if (e.alive && e.feet.distanceToSquared(_v) < clear2) {
          blocked = true;
          break;
        }
      }
      if (blocked) continue;
      const type = this.waveQueue.shift()!;
      const yaw = Math.atan2(-(s.player.feet.x - p[0]), -(s.player.feet.z - p[2]));
      const e = s.enemies.spawn({ id: `g${this.gauntletWave}-${type}-${this.waveEnemies.length + 1}`, type, pos: [p[0], p[1], p[2]], yaw });
      e.brain.aggressive = true;
      e.brain.alert(s.player.feet);
      this.waveEnemies.push(e);
      this.spawnCursor = (this.spawnCursor + k + 1) % pts.length;
      this.spawnT = GAUNTLET_SPAWN_INTERVAL;
      return;
    }
    // Todos los puntos ocupados: se reintenta en el siguiente paso fijo.
  }

  private playerInZone(at: readonly [number, number, number], radius: number): boolean {
    const f = this.d.session.player.feet;
    return Math.hypot(at[0] - f.x, at[2] - f.z) <= radius && Math.abs(at[1] - f.y) < 2.5;
  }

  private trackMarksmen(): void {
    const kills = this.d.session.combat.stats.kills;
    if (kills === this.lastKills) return;
    this.lastKills = kills;
    // Recuento de tiradores con headshot (el último impacto fue a la cabeza).
    let n = 0;
    for (const e of this.d.session.enemies.enemies) if (e.def.type === 'marksman' && !e.alive && e.lastHitWasHead) n++;
    this.marksmenHeadshots = n;
  }

  /** Jefe por fases: al cruzar un umbral se arrodilla unos segundos (takedown posible) y llegan escoltas. */
  private tickBoss(dt: number): void {
    const s = this.d.session;
    if (this.bossKneeling) {
      // Con el takedown en marcha no se levanta: el remate termina siempre.
      if (s.combat.takedown?.enemy === this.bossKneeling) return;
      this.bossKneel -= dt;
      if (this.bossKneel <= 0 || !this.bossKneeling.alive) {
        if (this.bossKneeling.alive) {
          this.bossKneeling.brain.unstun();
          this.bossKneeling.mover.setLocked(false);
        }
        this.bossKneeling = null;
      }
      return;
    }
    for (const e of s.enemies.enemies) {
      if (e.def.type !== 'boss' || !e.alive) continue;
      const frac = e.vitals.health / e.vitals.maxHealth;
      for (let i = 0; i < BOSS_PHASES.length; i++) {
        if (this.bossPhaseDone.has(i) || frac > BOSS_PHASES[i]!) continue;
        this.bossPhaseDone.add(i);
        e.stun();
        this.bossKneeling = e;
        this.bossKneel = BOSS_KNEEL_TIME;
        const n = s.enemies.spawnEvent(`boss-phase-${i + 1}`);
        this.d.hud.showToast(n > 0 ? '¡El Juez se arrodilla! Remátalo con un takedown. Llegan escoltas.' : '¡El Juez se arrodilla! Remátalo con un takedown.', 3.5);
        this.d.audio.alert(e.feet);
        return;
      }
    }
  }

  private finish(success: boolean, failReason: string): void {
    if (this.finished) return;
    this.finished = true;
    const s = this.d.session;
    const c = s.combat;
    const def = MISSIONS[this.id];
    const stats: MissionStats = {
      timeSec: this.time,
      parTime: def.parTime,
      shotsFired: c.stats.shotsFired - this.scoreBase.shotsFired,
      shotsHit: c.stats.shotsHit - this.scoreBase.shotsHit,
      takedowns: c.stats.takedowns - this.scoreBase.takedowns,
      knifeKills: c.stats.knifeKills - this.scoreBase.knifeKills,
      damageTaken: c.stats.damageTaken - this.scoreBase.damageTaken,
      healthPool: c.vitals.maxHealth + c.vitals.maxArmor,
      varietyCount: c.style.varietyCount,
      hasCivilians: def.hasCivilians,
      civiliansHurt: this.civiliansHurt,
      civiliansKilled: this.civiliansKilled,
      markersUsed: this.markersUsed,
      styleBest: c.style.bestMultiplier,
    };
    const rank = computeRank(stats);
    if (this.id === 'gauntlet') {
      this.finishGauntlet(stats, rank);
      return;
    }
    const p = this.d.profile;
    const firstTime = !p.completed.includes(this.id);
    let coins = 0;
    let achievements: UnlockedAchievement[] = [];
    let newBest = false;
    if (success) {
      coins = contractReward(this.id, rank.rank, firstTime);
      newBest = recordBest(p, this.id, { rank: rank.rank, score: c.style.score, timeSec: Math.round(this.time) });
      const run: MissionRunSummary = {
        mission: this.id,
        rank: rank.rank,
        stats,
        alarmSounded: this.alarmSounded,
        minHealth: this.minHealth,
        reloads: c.stats.reloads,
        marksmenHeadshots: this.marksmenHeadshots,
        marksmenTotal: this.marksmenTotal,
        escapeSecondsLeft: this.escapeLeft,
        gauntletWaves: this.gauntletWaves,
        styleBest: c.style.bestMultiplier,
      };
      achievements = evaluateAchievements(run, p);
      for (const a of achievements) coins += a.coins;
      addCoins(p, coins);
    }
    this.d.save();
    this.d.hud.setObjective('');
    this.d.onFinished({
      mission: this.id,
      success,
      failReason,
      rank,
      stats,
      timeSec: this.time,
      coinsReward: coins,
      firstTime,
      achievements,
      newBest,
      kills: c.stats.kills,
      markersUsed: this.markersUsed,
      markersTotal: this.markersTotal,
      gauntlet: null,
    });
  }

  /** Fin del Gauntlet (siempre al morir): top 10 local, 1 moneda cada 2 oleadas y logros. */
  private finishGauntlet(stats: MissionStats, rank: RankResult): void {
    const p = this.d.profile;
    const c = this.d.session.combat;
    const waves = this.gauntletWaves;
    const position = waves > 0 ? recordGauntlet(p, { waves, score: c.style.score, date: Date.now() }) : 0;
    const run: MissionRunSummary = {
      mission: this.id,
      rank: rank.rank,
      stats,
      alarmSounded: false,
      minHealth: this.minHealth,
      reloads: c.stats.reloads,
      marksmenHeadshots: this.marksmenHeadshots,
      marksmenTotal: this.marksmenTotal,
      escapeSecondsLeft: 0,
      gauntletWaves: waves,
      styleBest: c.style.bestMultiplier,
    };
    const achievements = evaluateAchievements(run, p);
    let coins = gauntletReward(waves);
    for (const a of achievements) coins += a.coins;
    addCoins(p, coins);
    this.d.save();
    this.d.hud.setObjective('');
    this.d.onFinished({
      mission: this.id,
      success: true,
      failReason: '',
      rank,
      stats,
      timeSec: this.time,
      coinsReward: coins,
      firstTime: false,
      achievements,
      newBest: position === 1,
      kills: c.stats.kills,
      markersUsed: this.markersUsed,
      markersTotal: this.markersTotal,
      gauntlet: { waves, position, top: p.gauntlet.map((g) => ({ ...g })) },
    });
  }
}
