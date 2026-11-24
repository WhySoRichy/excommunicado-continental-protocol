import { describe, expect, it } from 'vitest';
import { fireTurns, planSquad, type SquadMember, type SquadOrder, TURN_TIME } from '../../src/entities/ai/squad';

function m(o: Partial<SquadMember> = {}): SquadMember {
  return {
    fighting: true,
    canSee: true,
    telegraphs: false,
    canFlank: true,
    flanker: false,
    flanking: false,
    distance: 10,
    angle: 0,
    turnT: 0,
    waitT: 0,
    ...o,
  };
}

function plan(members: SquadMember[], flankReady = false): { orders: SquadOrder[]; ordered: boolean } {
  const orders: SquadOrder[] = [];
  const ordered = planSquad(members, flankReady, orders);
  return { orders, ordered };
}

describe('escuadra', () => {
  it('hasta tres disparan siempre; con más, unos pocos a la vez', () => {
    expect([1, 2, 3, 6, 7, 11, 40].map(fireTurns)).toEqual([3, 3, 3, 4, 5, 6, 6]);
    for (const n of [1, 3]) expect(plan(Array.from({ length: n }, () => m())).orders.every((o) => o.mayFire)).toBe(true);
    const many = plan(Array.from({ length: 9 }, () => m())).orders;
    expect(many.filter((o) => o.mayFire)).toHaveLength(fireTurns(9));
  });

  it('el turno pasa de unos a otros: nadie se queda sin disparar', () => {
    const squad = Array.from({ length: 8 }, (_, i) => m({ distance: 6 + i }));
    const fired = new Set<number>();
    const dt = 0.25;
    for (let t = 0; t < 20; t += dt) {
      const { orders } = plan(squad);
      expect(orders.filter((o) => o.mayFire)).toHaveLength(fireTurns(8));
      orders.forEach((o, i) => {
        const s = squad[i]!;
        if (o.mayFire) {
          fired.add(i);
          s.turnT += dt;
          s.waitT = 0;
        } else {
          s.turnT = 0;
          s.waitT += dt;
        }
      });
    }
    expect(fired.size).toBe(8);
  });

  it('quien tiene el turno lo conserva lo justo, aunque otro vea mejor', () => {
    const squad = [m({ turnT: 0.5 }), m({ turnT: 0.5 }), m({ turnT: 0.5 }), m({ waitT: 9, distance: 3 })];
    expect(plan(squad).orders.map((o) => o.mayFire)).toEqual([true, true, true, false]);
    for (const s of squad.slice(0, 3)) s.turnT = TURN_TIME + 0.1;
    expect(plan(squad).orders[3]!.mayFire).toBe(true);
  });

  it('quien avisa antes de disparar no gasta turno, y quien no pelea puede disparar cuando empiece', () => {
    const squad = [m({ telegraphs: true }), m(), m(), m(), m({ fighting: false })];
    const { orders } = plan(squad);
    expect(orders.every((o) => o.mayFire)).toBe(true);
  });

  it('rodea uno por orden, el que mejor se presta, por el lado en el que ya está, y los demás lo cubren', () => {
    const squad = [m({ angle: -0.4 }), m({ angle: 0 }), m({ angle: 0.5, flanker: true })];
    const { orders, ordered } = plan(squad, true);
    expect(ordered).toBe(true);
    expect(orders.map((o) => o.flank)).toEqual([0, 0, 1]);
    expect(orders.map((o) => o.covering)).toEqual([true, true, false]);
    // Con espera, nadie; y sin nadie rodeando, nadie cubre.
    const wait = plan(squad, false);
    expect(wait.ordered).toBe(false);
    expect(wait.orders.some((o) => o.flank !== 0 || o.covering)).toBe(false);
    // Por la izquierda, hacia la izquierda.
    expect(plan([m({ angle: 0.2 }), m({ angle: 0.3 }), m({ angle: -0.6, flanker: true })], true).orders[2]!.flank).toBe(-1);
  });

  it('no rodea si son pocos, si no puede ninguno o si ya hay dos en ello', () => {
    expect(plan([m({ flanker: true }), m()], true).ordered).toBe(false);
    expect(plan([m({ canFlank: false }), m({ canFlank: false }), m({ canFlank: false })], true).ordered).toBe(false);
    const busy = plan([m({ flanking: true }), m({ flanking: true }), m(), m()], true);
    expect(busy.ordered).toBe(false);
    expect(
      busy.orders.map((o) => o.covering),
      'cubre quien tiene turno',
    ).toEqual([false, false, true, false]);
  });

  it('el ángulo se mide sin saltos al pasar por la espalda', () => {
    // Todos alrededor de 180°: el de −175° está a la izquierda de 180° solo 5°, no 355°.
    const squad = [m({ angle: 3.1 }), m({ angle: 3.0 }), m({ angle: -3.1, flanker: true })];
    expect(plan(squad, true).orders[2]!.flank).toBe(1);
    // Y al elegir: el que de verdad está más a un lado es el de 2,4, no el de −3,1.
    const pick = plan([m({ angle: 3.1 }), m({ angle: 3.1 }), m({ angle: -3.1 }), m({ angle: 2.4 })], true).orders;
    expect(pick.map((o) => o.flank)).toEqual([0, 0, 0, -1]);
  });
});
