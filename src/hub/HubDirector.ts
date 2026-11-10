import { Color } from 'three';
import type { AudioEngine } from '../audio/AudioEngine';
import type { Profile } from '../core/Save';
import type { LevelSession } from '../game/LevelSession';
import type { Hud } from '../ui/Hud';
import { DIALOGUE, type Dialogue, HUB_TEXT } from './dialogue';
import { applyExcommunicadoFine } from './economy';
import { EXCOM_WAVES, ExcommunicadoRules, type RuleEvent } from './ExcommunicadoRules';

export interface HubDirectorDeps {
  session: LevelSession;
  hud: Hud;
  audio: AudioEngine;
  profile: Profile;
  /** Persiste el perfil (multa, banderas). */
  save(): void;
  /** Abre un diálogo de NPC (readmisión). */
  dialog(d: Dialogue): void;
}

const ALARM_HEMI = new Color(0xffb0a0);
const ALARM_AMBIENT = new Color(0xff9a8a);

/**
 * Director del hub: aplica las reglas del Continental al juego real.
 * Enfunda/desenfunda el arma, detecta disparos, cobra la multa, enciende la alarma
 * (luces rojas + sirena), lanza las 3 oleadas y gestiona la readmisión.
 */
export class HubDirector {
  readonly rules = new ExcommunicadoRules();
  lostCoins = 0;
  private lastShots: number;
  private alarmT = 0;
  private alarmOn = false;
  private readonly baseHemi: Color;
  private readonly baseAmbient: Color;
  private readonly baseHemiIntensity: number;
  private diedDuringExcom = false;

  constructor(private readonly d: HubDirectorDeps) {
    const s = d.session;
    this.lastShots = s.combat.stats.shotsFired;
    this.baseHemi = s.level.hemi.color.clone();
    this.baseAmbient = s.level.ambient.color.clone();
    this.baseHemiIntensity = s.level.hemi.intensity;
    s.combat.holstered = true;
    s.combat.onFireWhileHolstered = () => this.onDrawAttempt();
    d.hud.setCombatVisible(false);
    d.hud.setZone(HUB_TEXT.zoneNeutral);
    d.hud.setObjective(d.profile.flags.charonMet ? HUB_TEXT.objectiveHub : HUB_TEXT.objectiveFirst);
  }

  get hostile(): boolean {
    return this.rules.hostile;
  }

  get state(): string {
    return this.rules.state;
  }

  private onDrawAttempt(): void {
    if (this.rules.drawWeapon() !== 'warn') return;
    this.d.session.combat.holstered = false;
    this.d.hud.setCombatVisible(true);
    this.d.hud.showToast(HUB_TEXT.warnDraw, 4);
    this.d.audio.ui('error');
  }

  private holster(): void {
    const c = this.d.session.combat;
    c.holstered = true;
    c.weapon.cancelReload();
    this.d.hud.setCombatVisible(false);
  }

  fixedUpdate(dt: number): void {
    const s = this.d.session;
    const c = s.combat;
    // Un disparo real dentro del hotel.
    if (c.stats.shotsFired > this.lastShots) {
      this.lastShots = c.stats.shotsFired;
      if (this.rules.shotFired() === 'excommunicado') this.trigger();
    }
    this.handle(this.rules.update(dt));
    if (this.rules.hostile) {
      const pending = this.rules.takePendingWave();
      if (pending > 0) this.spawnWave(pending);
      else if (s.enemies.aliveCount === 0) this.handle(this.rules.waveCleared());
    }
  }

  private handle(e: RuleEvent): void {
    switch (e) {
      case 'holstered':
        this.holster();
        this.d.hud.showToast(HUB_TEXT.holstered, 1.5);
        break;
      case 'waveStart':
        break;
      case 'readmitted':
        this.readmit();
        break;
      case 'neutral':
        this.setAlarm(false);
        this.holster();
        this.d.hud.setZone(HUB_TEXT.zoneNeutral);
        this.d.hud.setObjective(this.d.profile.flags.charonMet ? HUB_TEXT.objectiveHub : HUB_TEXT.objectiveFirst);
        this.d.hud.showToast(HUB_TEXT.readmitted, 3);
        break;
      default:
        break;
    }
  }

  private trigger(): void {
    const p = this.d.profile;
    this.lostCoins = applyExcommunicadoFine(p);
    p.flags.excomSeen = true;
    this.d.save();
    this.setAlarm(true);
    this.d.hud.showToast(HUB_TEXT.excommunicado(this.lostCoins), 5);
    this.d.hud.setCombatVisible(true);
    this.diedDuringExcom = false;
  }

  private spawnWave(n: number): void {
    const s = this.d.session;
    const spawned = s.enemies.spawnEvent(`excom-${n}`, true);
    if (spawned === 0) {
      // Nivel sin oleada definida: no puede quedarse colgado; se da por limpia.
      this.handle(this.rules.waveCleared());
      return;
    }
    s.enemies.alertAll(s.player.feet);
    this.d.hud.setZone(HUB_TEXT.zoneHostile(n, EXCOM_WAVES));
    this.d.hud.setObjective(HUB_TEXT.objectiveSurvive(n, EXCOM_WAVES));
    this.d.hud.showToast(HUB_TEXT.wave(n, EXCOM_WAVES), 2);
    this.d.audio.alert(s.player.feet);
  }

  /** El jugador murió: Winston lo readmite igualmente. */
  onPlayerDied(): void {
    if (this.rules.playerDied() === 'readmitted') {
      this.diedDuringExcom = true;
      this.readmit();
    }
  }

  private readmit(): void {
    const s = this.d.session;
    s.enemies.despawnAll();
    this.d.audio.siren(false);
    this.d.hud.setObjective('');
    this.d.save();
    this.d.dialog(this.diedDuringExcom ? DIALOGUE.winstonReadmitDead : DIALOGUE.winstonReadmit);
  }

  private setAlarm(on: boolean): void {
    if (on === this.alarmOn) return;
    this.alarmOn = on;
    const lvl = this.d.session.level;
    this.d.audio.siren(on);
    if (on) {
      lvl.hemi.color.copy(ALARM_HEMI);
      lvl.ambient.color.copy(ALARM_AMBIENT);
    } else {
      lvl.hemi.color.copy(this.baseHemi);
      lvl.ambient.color.copy(this.baseAmbient);
      lvl.hemi.intensity = this.baseHemiIntensity;
      for (const l of lvl.alarmLights) l.intensity = 0;
    }
  }

  /** Pulso de las luces de alarma (tiempo de render). */
  frameUpdate(dt: number): void {
    if (!this.alarmOn) return;
    this.alarmT += dt;
    const k = 0.55 + 0.45 * Math.sin(this.alarmT * 5);
    for (const l of this.d.session.level.alarmLights) l.intensity = (l.userData.baseIntensity as number) * k;
  }

  dispose(): void {
    this.setAlarm(false);
    const c = this.d.session.combat;
    c.onFireWhileHolstered = null;
    c.holstered = false;
  }
}
