import { describe, expect, it } from 'vitest';
import { GameStateMachine, TRANSITIONS, type GameStateId } from '../../src/core/GameStateMachine';

describe('GameStateMachine', () => {
  it('recorre el flujo principal título → juego → pausa → juego → resultados', () => {
    const m = new GameStateMachine();
    const seen: string[] = [];
    m.on((to, from) => seen.push(`${from}>${to}`));
    m.go('title');
    m.go('loading');
    m.go('hub');
    m.go('paused');
    expect(m.resumeTo).toBe('hub');
    m.go('hub');
    m.go('briefing');
    m.go('loading');
    m.go('playing');
    m.go('paused');
    expect(m.resumeTo).toBe('playing');
    m.go('playing');
    m.go('dead');
    m.go('playing');
    m.go('results');
    expect(seen).toHaveLength(13);
  });

  it('rechaza transiciones no declaradas (sin estados rotos)', () => {
    const m = new GameStateMachine();
    expect(() => m.go('playing')).toThrow(/Transición inválida/);
    m.go('title');
    expect(() => m.go('paused')).toThrow();
    expect(() => m.go('results')).toThrow();
    expect(m.state).toBe('title');
  });

  it('cada estado tiene salida y todo estado es alcanzable desde boot', () => {
    const reach = new Set<GameStateId>(['boot']);
    const queue: GameStateId[] = ['boot'];
    while (queue.length) {
      const s = queue.shift()!;
      expect(TRANSITIONS[s].length, `${s} sin salidas`).toBeGreaterThan(0);
      for (const t of TRANSITIONS[s]) {
        if (!reach.has(t)) {
          reach.add(t);
          queue.push(t);
        }
      }
    }
    expect(reach.size).toBe(Object.keys(TRANSITIONS).length);
  });

  it('simulating/controlling reflejan el estado', () => {
    const m = new GameStateMachine();
    m.go('title');
    expect(m.simulating).toBe(false);
    m.go('loading');
    m.go('playing');
    expect(m.simulating).toBe(true);
    expect(m.controlling).toBe(true);
    m.go('paused');
    expect(m.simulating).toBe(false);
    expect(m.controlling).toBe(false);
  });
});
