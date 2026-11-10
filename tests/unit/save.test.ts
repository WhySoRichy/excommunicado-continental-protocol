import { describe, expect, it } from 'vitest';
import { loadProfile, MemoryStore, newProfile, PROFILE_KEY, recordBest, recordGauntlet, saveProfile, STARTING_COINS, validateProfile } from '../../src/core/Save';

describe('guardado', () => {
  it('sin partida devuelve un perfil nuevo con los fondos iniciales', () => {
    const kv = new MemoryStore();
    const r = loadProfile(kv);
    expect(r.status).toBe('new');
    expect(r.profile.coins).toBe(STARTING_COINS);
    expect(r.profile.upgrades).toEqual([]);
  });

  it('guardar y cargar conserva monedas, mejoras, mejores rangos y banderas', () => {
    const kv = new MemoryStore();
    const p = newProfile(1000);
    p.coins = 42;
    p.upgrades.push('compensator', 'suit1');
    p.flags.tutorialDone = true;
    recordBest(p, 'practice', { rank: 'A', score: 3200, timeSec: 75 });
    saveProfile(kv, p, 2000);
    const r = loadProfile(kv, 3000);
    expect(r.status).toBe('loaded');
    expect(r.profile.coins).toBe(42);
    expect(r.profile.upgrades).toEqual(['compensator', 'suit1']);
    expect(r.profile.flags.tutorialDone).toBe(true);
    expect(r.profile.best.practice).toEqual({ rank: 'A', score: 3200, timeSec: 75 });
    expect(r.profile.completed).toEqual(['practice']);
    expect(r.profile.updatedAt).toBe(2000);
  });

  it('JSON corrupto: se respalda y se reinicia sin lanzar', () => {
    const kv = new MemoryStore();
    kv.set(PROFILE_KEY, '{"coins": 5, ');
    const r = loadProfile(kv);
    expect(r.status).toBe('reset-corrupt');
    expect(r.profile.coins).toBe(STARTING_COINS);
    expect(kv.get(`${PROFILE_KEY}.corrupt`)).toBe('{"coins": 5, ');
  });

  it('perfil manipulado: valores imposibles se sanean y las mejoras desconocidas se descartan', () => {
    const kv = new MemoryStore();
    kv.set(PROFILE_KEY, JSON.stringify({ version: 1, coins: -50, upgrades: ['compensator', 'laserGun', 7], best: { practice: { rank: 'Z' } }, flags: { x: 'no' }, gauntlet: [{ waves: 3 }, { waves: 0 }, 'basura'] }));
    const r = loadProfile(kv);
    expect(r.status).toBe('loaded');
    expect(r.profile.coins).toBe(0);
    expect(r.profile.upgrades).toEqual(['compensator']);
    expect(r.profile.best.practice).toBeUndefined();
    expect(r.profile.flags).toEqual({});
    expect(r.profile.gauntlet).toEqual([{ waves: 3, score: 0, date: expect.any(Number) }]);
  });

  it('tipos no-objeto o versiones futuras no son un perfil', () => {
    expect(validateProfile('hola')).toBeNull();
    expect(validateProfile([1, 2])).toBeNull();
    expect(validateProfile({ version: 99 })).toBeNull();
    const kv = new MemoryStore();
    kv.set(PROFILE_KEY, '"texto"');
    expect(loadProfile(kv).status).toBe('reset-corrupt');
  });

  it('un guardado sin versión se migra a la v1', () => {
    const kv = new MemoryStore();
    kv.set(PROFILE_KEY, JSON.stringify({ coins: 12 }));
    const r = loadProfile(kv);
    expect(r.status).toBe('migrated');
    expect(r.profile.coins).toBe(12);
    expect(r.profile.version).toBe(1);
  });

  it('recordBest solo mejora; recordGauntlet mantiene un top 10 ordenado', () => {
    const p = newProfile();
    expect(recordBest(p, 'practice', { rank: 'B', score: 100, timeSec: 90 })).toBe(true);
    expect(recordBest(p, 'practice', { rank: 'C', score: 999, timeSec: 10 })).toBe(false);
    expect(recordBest(p, 'practice', { rank: 'B', score: 150, timeSec: 10 })).toBe(true);
    expect(p.best.practice?.score).toBe(150);
    for (let i = 1; i <= 12; i++) recordGauntlet(p, { waves: i, score: i * 10, date: i });
    expect(p.gauntlet).toHaveLength(10);
    expect(p.gauntlet[0]?.waves).toBe(12);
    expect(recordGauntlet(p, { waves: 1, score: 1, date: 99 })).toBe(0);
    expect(recordGauntlet(p, { waves: 20, score: 1, date: 99 })).toBe(1);
  });
});
