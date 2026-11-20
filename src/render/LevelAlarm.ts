import { Color } from 'three';
import type { LevelRuntime } from '../levels/LevelBuilder';
import type { AlarmPort } from '../missions/ports';

const ALARM_HEMI = new Color(0xffb0a0);
const ALARM_AMBIENT = new Color(0xff9a8a);

/**
 * Cómo se ve la alarma del Continental: tiñe de rojo la luz del nivel y hace latir sus luces de alarma. El director
 * solo decide cuándo suena (`AlarmPort`); el latido corre aquí, en tiempo de render.
 */
export class LevelAlarm implements AlarmPort {
  private on = false;
  private t = 0;
  private readonly baseHemi: Color;
  private readonly baseAmbient: Color;
  private readonly baseHemiIntensity: number;

  constructor(private readonly level: LevelRuntime) {
    this.baseHemi = level.hemi.color.clone();
    this.baseAmbient = level.ambient.color.clone();
    this.baseHemiIntensity = level.hemi.intensity;
  }

  set(on: boolean): void {
    if (on === this.on) return;
    this.on = on;
    const lvl = this.level;
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

  /** Latido de las luces de alarma mientras suena. */
  update(dt: number): void {
    if (!this.on) return;
    this.t += dt;
    const k = 0.55 + 0.45 * Math.sin(this.t * 5);
    for (const l of this.level.alarmLights) l.intensity = (l.userData.baseIntensity as number) * k;
  }
}
