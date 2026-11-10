import { describe, expect, it } from 'vitest';
import { type Action, codeLabel, DEFAULT_BINDINGS } from '../../src/core/actions';
import { practice } from '../../src/levels/data/practice';
import type { SkillId } from '../../src/levels/types';
import { emptyCounters, formatObjective, SKILL_GOAL, skillProgress, skillTally } from '../../src/missions/tutorial';

const defaultLabel = (a: Action): string => codeLabel(DEFAULT_BINDINGS[a][0]!);

describe('tutorial', () => {
  it('los textos usan la tecla asignada; {move} da WASD; los tokens desconocidos se dejan', () => {
    expect(formatObjective('Mantén {sprint} para correr', defaultLabel)).toBe('Mantén Shift para correr');
    expect(formatObjective('Camina con {move}', defaultLabel)).toBe('Camina con WASD');
    expect(formatObjective('Pulsa {interact} o {nada}', defaultLabel)).toBe('Pulsa E o {nada}');
    // Con flechas (etiquetas largas) se separan con barras.
    const arrows = (a: Action): string => (a.startsWith('move') ? codeLabel(DEFAULT_BINDINGS[a][1]!) : defaultLabel(a));
    expect(formatObjective('{move}', arrows)).toBe('↑ / ← / ↓ / →');
  });

  it('el progreso se mide desde que empieza el paso y se satura en 1', () => {
    const base = emptyCounters();
    base.shotsFired = 10;
    const now = { ...base, shotsFired: 12 };
    expect(skillProgress('shoot', base, now)).toBeCloseTo(2 / 3);
    expect(skillTally('shoot', base, now)).toBe(2);
    now.shotsFired = 30;
    expect(skillProgress('shoot', base, now)).toBe(1);
    expect(skillTally('shoot', base, now)).toBe(3);
    // Vault o mantle cuentan igual; voltereta o plancha también.
    expect(skillProgress('vault', emptyCounters(), { ...emptyCounters(), mantles: 1 })).toBe(1);
    expect(skillProgress('dodge', emptyCounters(), { ...emptyCounters(), dives: 1 })).toBe(1);
    expect(skillTally('move', emptyCounters(), emptyCounters())).toBeNull();
  });

  it('el campo de práctica enseña cada habilidad una vez y luego pasa al simulacro', () => {
    const objs = practice.mission!.objectives;
    const learn = objs.filter((o) => o.kind === 'learn');
    const skills = learn.map((o) => o.skill);
    expect(new Set(skills).size).toBe(skills.length);
    expect(new Set(skills)).toEqual(new Set(Object.keys(SKILL_GOAL) as SkillId[]));
    // Todos los pasos del tutorial van antes del simulacro, y el simulacro existe.
    const firstScored = objs.findIndex((o) => o.kind !== 'learn');
    expect(firstScored).toBe(learn.length);
    expect(objs.slice(firstScored).map((o) => o.id)).toEqual(['yard', 'clear']);
    // Cada texto menciona al menos una tecla real.
    for (const o of learn) expect(o.text, o.id).toMatch(/\{\w+\}/);
    // El maniquí del takedown existe, aparece con su paso y queda aturdido.
    const td = learn.find((o) => o.skill === 'takedown')!;
    expect(td.stunGroup).toBe('dummy');
    expect(practice.enemies.some((e) => e.group === 'dummy' && e.spawnOn === td.onStart)).toBe(true);
  });
});
