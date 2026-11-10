import { describe, expect, it } from 'vitest';
import { FIXED_DT } from '../../src/core/Loop';
import { EXCOM_WAVES, ExcommunicadoRules, HOLSTER_TIMEOUT, READMIT_TIME, WAVE_GAP } from '../../src/hub/ExcommunicadoRules';

function tick(r: ExcommunicadoRules, seconds: number): string[] {
  const events: string[] = [];
  for (let i = 0; i < Math.round(seconds / FIXED_DT); i++) {
    const e = r.update(FIXED_DT);
    if (e !== 'none') events.push(e);
  }
  return events;
}

describe('reglas del Continental', () => {
  it('desenfundar avisa una vez y el arma vuelve a enfundarse sola', () => {
    const r = new ExcommunicadoRules();
    expect(r.drawWeapon()).toBe('warn');
    expect(r.state).toBe('armed');
    expect(r.drawWeapon()).toBe('none');
    const ev = tick(r, HOLSTER_TIMEOUT + 0.1);
    expect(ev).toEqual(['holstered']);
    expect(r.state).toBe('neutral');
  });

  it('disparar en el hotel activa el Excomunicado con la primera oleada pendiente', () => {
    const r = new ExcommunicadoRules();
    r.drawWeapon();
    expect(r.shotFired()).toBe('excommunicado');
    expect(r.hostile).toBe(true);
    expect(r.takePendingWave()).toBe(1);
    expect(r.takePendingWave()).toBe(0);
    expect(r.wave).toBe(1);
    // Disparar más no reinicia nada.
    expect(r.shotFired()).toBe('none');
  });

  it('tres oleadas, pausa entre ellas y readmisión al final', () => {
    const r = new ExcommunicadoRules();
    r.shotFired();
    const waves: number[] = [r.takePendingWave()];
    for (let w = 1; w <= EXCOM_WAVES; w++) {
      const ev = r.waveCleared();
      if (w < EXCOM_WAVES) {
        expect(ev).toBe('none');
        // Repetir "oleada limpia" durante la pausa no acelera nada.
        expect(r.waveCleared()).toBe('none');
        const evs = tick(r, WAVE_GAP + 0.1);
        expect(evs).toEqual(['waveStart']);
        waves.push(r.takePendingWave());
      } else {
        expect(ev).toBe('readmitted');
      }
    }
    expect(waves).toEqual([1, 2, 3]);
    expect(r.state).toBe('readmitted');
    const evs = tick(r, READMIT_TIME + 0.1);
    expect(evs).toEqual(['neutral']);
    expect(r.state).toBe('neutral');
    expect(r.wave).toBe(0);
  });

  it('morir durante el Excomunicado también readmite (la multa ya se pagó)', () => {
    const r = new ExcommunicadoRules();
    r.shotFired();
    r.takePendingWave();
    expect(r.playerDied()).toBe('readmitted');
    expect(r.state).toBe('readmitted');
    expect(r.playerDied()).toBe('none');
  });

  it('cuenta las activaciones y reset deja todo limpio', () => {
    const r = new ExcommunicadoRules();
    r.shotFired();
    r.reset();
    expect(r.state).toBe('neutral');
    expect(r.takePendingWave()).toBe(0);
    r.shotFired();
    expect(r.triggered).toBe(2);
  });
});
