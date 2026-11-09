import { describe, expect, it } from 'vitest';
import { WeaponState } from '../../src/combat/WeaponState';
import { applyUpgrades, markersPerContract, suitArmor, WEAPONS } from '../../src/combat/weapons';

const rec: [number, number] = [0, 0];

describe('armas', () => {
  it('dispara respetando la cadencia y consume munición', () => {
    const w = new WeaponState(WEAPONS.carbine);
    expect(w.fire(rec)).toBe(true);
    expect(w.mag).toBe(23);
    expect(w.fire(rec)).toBe(false); // cooldown
    w.update(w.interval);
    expect(w.fire(rec)).toBe(true);
  });

  it('el patrón de retroceso es fijo y se reinicia al dejar de disparar', () => {
    const w = new WeaponState(WEAPONS.carbine);
    const seq: number[] = [];
    for (let i = 0; i < 5; i++) {
      w.fire(rec);
      seq.push(rec[0]);
      w.update(w.interval);
    }
    expect(seq).toEqual(WEAPONS.carbine.recoil.slice(0, 5).map((r) => r[0]));
    w.update(1);
    w.fire(rec);
    expect(rec[0]).toBe(WEAPONS.carbine.recoil[0]![0]);
  });

  it('recarga normal transfiere munición desde la reserva', () => {
    const w = new WeaponState(WEAPONS.carbine);
    for (let i = 0; i < 10; i++) {
      w.fire(rec);
      w.update(w.interval);
    }
    expect(w.startReload()).toBe(true);
    w.update(WEAPONS.carbine.reloadTime + 0.01);
    expect(w.reloading).toBe(false);
    expect(w.mag).toBe(24);
    expect(w.reserve).toBe(96 - 10);
    expect(w.lastReload).toBe('normal');
  });

  it('recarga perfecta: dentro de la ventana termina al instante; fuera atasca (+penalización)', () => {
    const w = new WeaponState(WEAPONS.pistol);
    w.fire(rec);
    w.startReload();
    w.update(WEAPONS.pistol.reloadTime * 0.5);
    expect(w.pressDuringReload()).toBe('perfect');
    expect(w.reloading).toBe(false);
    expect(w.mag).toBe(12);

    const j = new WeaponState(WEAPONS.pistol);
    j.fire(rec);
    j.startReload();
    j.update(WEAPONS.pistol.reloadTime * 0.1);
    expect(j.pressDuringReload()).toBe('jammed');
    expect(j.pressDuringReload()).toBe('ignored'); // solo un intento
    j.update(WEAPONS.pistol.reloadTime);
    expect(j.reloading).toBe(true); // la penalización alarga la recarga
    j.update(WEAPONS.pistol.jamPenalty + 0.01);
    expect(j.reloading).toBe(false);
    expect(j.mag).toBe(12);
  });

  it('cancelar la recarga (cambio de arma) no transfiere munición ni deja estado colgado', () => {
    const w = new WeaponState(WEAPONS.carbine);
    for (let i = 0; i < 5; i++) {
      w.fire(rec);
      w.update(w.interval);
    }
    w.startReload();
    w.update(1);
    w.cancelReload();
    expect(w.reloading).toBe(false);
    expect(w.mag).toBe(19);
    expect(w.reserve).toBe(96);
    expect(w.reloadProgress).toBe(-1);
  });

  it('disparar con balas en el cargador cancela la recarga (fluidez); con cargador vacío no dispara', () => {
    const w = new WeaponState(WEAPONS.carbine);
    w.fire(rec);
    w.update(w.interval);
    w.startReload();
    w.update(0.3);
    expect(w.fire(rec)).toBe(true);
    expect(w.reloading).toBe(false);
    const e = new WeaponState(WEAPONS.pistol);
    e.mag = 0;
    e.startReload();
    expect(e.fire(rec)).toBe(false);
    expect(e.reloading).toBe(true);
  });

  it('la pistola tiene reserva infinita: nunca te quedas sin poder disparar', () => {
    const w = new WeaponState(WEAPONS.pistol);
    for (let r = 0; r < 50; r++) {
      while (w.mag > 0) {
        w.fire(rec);
        w.update(w.interval);
      }
      w.startReload();
      w.update(5);
      expect(w.mag).toBe(12);
    }
    expect(w.reserve).toBe(Number.POSITIVE_INFINITY);
  });

  it('spread: apuntar y agacharse lo reducen; moverse y el bloom lo aumentan', () => {
    const w = new WeaponState(WEAPONS.carbine);
    const hip = w.spread(false, 0, false);
    expect(w.spread(true, 0, false)).toBeLessThan(hip);
    expect(w.spread(false, 1, false)).toBeGreaterThan(hip);
    expect(w.spread(false, 0, true)).toBeLessThan(hip);
    w.fire(rec);
    expect(w.spread(false, 0, false)).toBeGreaterThan(hip);
  });

  it('mejoras: cargador extendido, compensador, punta hueca, silenciador, traje y marcador', () => {
    const owned = new Set(['extMag', 'compensator', 'hollowPoint', 'suppressor', 'suit1', 'suit2', 'extraMarker'] as const);
    const c = applyUpgrades(WEAPONS.carbine, owned);
    expect(c.mag).toBe(32);
    expect(c.recoil[0]![0]).toBeCloseTo(0.9 * 0.65);
    expect(c.damage).toBeCloseTo(34.5);
    const p = applyUpgrades(WEAPONS.pistol, owned);
    expect(p.mag).toBe(16);
    expect(p.noise).toBe(8);
    expect(suitArmor(owned)).toBe(100);
    expect(markersPerContract(owned)).toBe(4);
    // No muta la base.
    expect(WEAPONS.carbine.mag).toBe(24);
  });
});
