import { describe, expect, it } from 'vitest';
import { degreeMidi, LAYER_FROM, MOODS, musicIntensity, type NoteEvent, stepEvents, stepSeconds, STEPS_PER_BAR } from '../../src/audio/music';
import type { MusicMood } from '../../src/levels/types';

const moods = Object.keys(MOODS) as MusicMood[];

function bar(mood: MusicMood, intensity: number, barIndex = 0): NoteEvent[] {
  const out: NoteEvent[] = [];
  const all: NoteEvent[] = [];
  for (let s = 0; s < STEPS_PER_BAR; s++) {
    const n = stepEvents(mood, barIndex * STEPS_PER_BAR + s, intensity, out);
    for (let i = 0; i < n; i++) all.push({ ...out[i]! });
  }
  return all;
}

describe('música adaptativa', () => {
  it('todos los ambientes tienen patrones de 16 pasos y tempo razonable', () => {
    for (const m of moods) {
      const d = MOODS[m];
      expect(d.bass, m).toHaveLength(16);
      expect(d.hat, m).toHaveLength(16);
      expect(d.kick, m).toHaveLength(16);
      expect(d.bpm).toBeGreaterThanOrEqual(70);
      expect(d.bpm).toBeLessThanOrEqual(140);
      expect(stepSeconds(m)).toBeCloseTo(60 / d.bpm / 4, 9);
    }
  });

  it('la intensidad abre capas en orden y nunca quita notas', () => {
    for (const m of moods) {
      let prev = 0;
      for (const k of [0, LAYER_FROM.bass, LAYER_FROM.hat, LAYER_FROM.kick, LAYER_FROM.lead, 1]) {
        const n = bar(m, k).length;
        expect(n, `${m} @ ${k}`).toBeGreaterThanOrEqual(prev);
        prev = n;
      }
      const calm = new Set(bar(m, 0).map((e) => e.voice));
      expect(calm).toEqual(new Set(['pad']));
      const full = new Set(bar(m, 1).map((e) => e.voice));
      expect(full.has('kick') && full.has('lead') && full.has('bass'), m).toBe(true);
    }
  });

  it('todas las notas están en la escala del ambiente y en rango audible', () => {
    for (const m of moods) {
      const d = MOODS[m];
      const pcs = new Set(d.scale.map((i) => (d.root + i) % 12));
      for (let b = 0; b < 8; b++) {
        for (const e of bar(m, 1, b)) {
          if (e.voice === 'kick' || e.voice === 'hat') continue;
          expect(pcs.has(e.midi % 12), `${m} ${e.voice} ${e.midi}`).toBe(true);
          expect(e.midi).toBeGreaterThanOrEqual(24);
          expect(e.midi).toBeLessThanOrEqual(96);
          expect(e.vel).toBeGreaterThan(0);
          expect(e.vel).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it('degreeMidi sube de octava al pasar de grado 7', () => {
    const d = MOODS.club;
    expect(degreeMidi(d, 7)).toBe(degreeMidi(d, 0) + 12);
    expect(degreeMidi(d, -7)).toBe(degreeMidi(d, 0) - 12);
  });

  it('la intensidad sigue a la acción: calma < búsqueda < combate < jefe < escape', () => {
    const base = { fighting: 0, searching: 0, boss: false, escape: false, hostile: false, onMission: true };
    const calm = musicIntensity(base);
    const search = musicIntensity({ ...base, searching: 2 });
    const fight = musicIntensity({ ...base, fighting: 1 });
    const fight5 = musicIntensity({ ...base, fighting: 5 });
    const boss = musicIntensity({ ...base, fighting: 1, boss: true });
    const esc = musicIntensity({ ...base, escape: true });
    expect(calm).toBeLessThan(search);
    expect(search).toBeLessThan(fight);
    expect(fight).toBeLessThan(fight5);
    expect(fight5).toBeLessThanOrEqual(boss);
    expect(esc).toBe(1);
    // El hub neutral es lo más tranquilo.
    expect(musicIntensity({ ...base, onMission: false })).toBeLessThan(calm);
    // Combate: al menos bajo, charles y bombo.
    expect(fight).toBeGreaterThanOrEqual(LAYER_FROM.kick);
  });
});
