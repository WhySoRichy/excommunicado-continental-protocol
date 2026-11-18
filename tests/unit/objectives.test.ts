import { describe, expect, it } from 'vitest';
import type { ObjectiveDef } from '../../src/levels/types';
import { emptyFacts, emptyVerdict, evaluateObjective, type ObjectiveFacts, objectiveTimeLeft } from '../../src/missions/objectives';

const obj = (o: Partial<ObjectiveDef> & Pick<ObjectiveDef, 'kind'>): ObjectiveDef => ({ id: 'o', text: 'Objetivo', ...o });
const facts = (f: Partial<ObjectiveFacts>): ObjectiveFacts => ({ ...emptyFacts(), ...f });
const evaluate = (o: ObjectiveDef, f: Partial<ObjectiveFacts>) => evaluateObjective(o, facts(f), emptyVerdict());

describe('reglas de los objetivos', () => {
  it('alcanzar: se completa al entrar en la zona', () => {
    const o = obj({ kind: 'reach', at: [0, 0, 0] });
    expect(evaluate(o, { inZone: false }).status).toBe('pending');
    expect(evaluate(o, { inZone: true }).status).toBe('complete');
  });

  it('escapar: cuenta atrás en el HUD; el reloj agotado gana a llegar en el mismo paso', () => {
    const o = obj({ kind: 'escape', at: [0, 0, 0], seconds: 10 });
    expect(evaluate(o, { elapsed: 3.2 })).toMatchObject({ status: 'pending', counter: 'seconds', count: 7 });
    expect(evaluate(o, { elapsed: 9, inZone: true }).status).toBe('complete');
    expect(evaluate(o, { elapsed: 10, inZone: true }).status).toBe('failed');
    expect(objectiveTimeLeft(obj({ kind: 'escape' }), 0)).toBe(45);
  });

  it('eliminar: completo cuando no queda nadie del grupo; sin enemigos vistos aún no cuenta', () => {
    const o = obj({ kind: 'eliminate', group: 'patio' });
    expect(evaluate(o, { seen: 0, alive: 0 }).status).toBe('pending');
    expect(evaluate(o, { seen: 3, alive: 2, elapsed: 0.2 })).toMatchObject({ status: 'pending', counter: null });
    expect(evaluate(o, { seen: 3, alive: 2, elapsed: 1 })).toMatchObject({ counter: 'remaining', count: 2 });
    expect(evaluate(o, { seen: 3, alive: 0 }).status).toBe('complete');
  });

  it('interactuar: cuenta los usados y se completa con todos; uno solo no muestra contador', () => {
    const o = obj({ kind: 'interact', targets: ['a', 'b', 'c'] });
    expect(evaluate(o, { targetsDone: 1 })).toMatchObject({ status: 'pending', counter: 'fraction', count: 1, total: 3 });
    expect(evaluate(o, { targetsDone: 3 }).status).toBe('complete');
    expect(evaluate(obj({ kind: 'interact', targets: ['a'] }), { targetsDone: 0 }).counter).toBeNull();
  });

  it('sobrevivir: se completa al acabar el reloj (30 s por defecto)', () => {
    const o = obj({ kind: 'survive' });
    expect(evaluate(o, { elapsed: 29.5 })).toMatchObject({ status: 'pending', count: 1 });
    expect(evaluate(o, { elapsed: 30 }).status).toBe('complete');
  });

  it('jefe: muestra su vida en tanto por ciento y se completa al caer', () => {
    const o = obj({ kind: 'boss', enemyId: 'juez' });
    expect(evaluate(o, { seen: 1, alive: 1, bossHealth: 0.414 })).toMatchObject({ counter: 'percent', count: 42 });
    expect(evaluate(o, { seen: 1, alive: 0 }).status).toBe('complete');
    expect(evaluate(o, { seen: 0, alive: 0 }).status).toBe('pending');
  });

  it('el veredicto se reutiliza sin arrastrar el contador anterior', () => {
    const out = emptyVerdict();
    evaluateObjective(obj({ kind: 'survive' }), facts({ elapsed: 5 }), out);
    evaluateObjective(obj({ kind: 'reach', at: [0, 0, 0] }), facts({}), out);
    expect(out).toEqual({ status: 'pending', counter: null, count: 0, total: 0 });
  });
});
