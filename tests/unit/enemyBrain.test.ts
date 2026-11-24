import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { FIXED_DT } from '../../src/core/Loop';
import { Rng } from '../../src/core/rng';
import { EnemyBrain, emptyCommand, emptyPerception, type Perception, type Tactics } from '../../src/entities/ai/EnemyBrain';
import { ENEMY_TYPES } from '../../src/entities/ai/enemyTypes';

const tactics: Tactics = {
  findCover: (self, threat, out) => {
    out.set(self.x + (self.x - threat.x > 0 ? 2 : -2), self.y, self.z);
    return true;
  },
  findFlank: (self, threat, side, out) => {
    out.set(threat.x + side * 8, self.y, threat.z);
    return true;
  },
  randomNear: (pos, r, out) => {
    out.set(pos.x + r, pos.y, pos.z);
    return true;
  },
};

function brain(type: keyof typeof ENEMY_TYPES = 'thug', patrol: Vector3[] = [], stationary = false): EnemyBrain {
  return new EnemyBrain(ENEMY_TYPES[type], patrol, new Vector3(0, 0, 0), stationary, new Rng(5));
}

function seeing(p: Perception, dist = 10): Perception {
  p.canSee = true;
  p.canShoot = true;
  p.seeFactor = 1;
  p.distance = dist;
  p.playerPos.set(0, 0, -dist);
  return p;
}

function run(b: EnemyBrain, p: Perception, seconds: number, onStep?: (fired: boolean, i: number) => void): ReturnType<typeof emptyCommand> {
  const cmd = emptyCommand();
  const n = Math.round(seconds / FIXED_DT);
  for (let i = 0; i < n; i++) {
    b.update(FIXED_DT, p, tactics, cmd);
    onStep?.(cmd.fire, i);
  }
  return cmd;
}

describe('EnemyBrain', () => {
  it('patrulla → ve al jugador → el medidor sube → combate (con grito a los aliados)', () => {
    const b = brain('thug', [new Vector3(5, 0, 0), new Vector3(-5, 0, 0)]);
    const p = emptyPerception();
    const cmd = run(b, p, 1);
    expect(b.state).toBe('patrol');
    expect(cmd.hasMove).toBe(true);
    seeing(p, 6);
    let shouted = false;
    const c2 = emptyCommand();
    for (let i = 0; i < 120 && b.state !== 'combat'; i++) {
      b.update(FIXED_DT, p, tactics, c2);
      shouted ||= c2.shout;
    }
    expect(b.state).toBe('combat');
    expect(shouted).toBe(true);
    expect(c2.icon).toBe('alert');
  });

  it('un disparo lejano lo vuelve sospechoso y va a investigar', () => {
    const b = brain();
    const p = emptyPerception();
    p.heard = true;
    p.heardPos.set(20, 0, 0);
    const cmd = emptyCommand();
    b.update(FIXED_DT, p, tactics, cmd);
    expect(b.state).toBe('suspicious');
    p.heard = false;
    b.update(FIXED_DT, p, tactics, cmd);
    expect(cmd.hasMove).toBe(true);
    expect(cmd.moveTo.x).toBeCloseTo(20);
    expect(cmd.icon).toBe('suspicious');
  });

  it('respeta el tiempo de reacción antes del primer disparo y dispara en ráfagas', () => {
    const b = brain('escort');
    const p = seeing(emptyPerception(), 8);
    b.alert(p.playerPos);
    const shots: number[] = [];
    run(b, p, 5, (f, i) => {
      if (f) shots.push(i * FIXED_DT);
    });
    expect(shots[0]!).toBeGreaterThanOrEqual(ENEMY_TYPES.escort.reaction - 1e-6);
    // Ráfagas de 4 con pausas: en 5 s, más de 8 y menos de 25 disparos.
    expect(shots.length).toBeGreaterThan(8);
    expect(shots.length).toBeLessThan(25);
  });

  it('tirador: láser 1,2 s antes de disparar; romper la línea de visión lo cancela', () => {
    const b = brain('marksman', [], true);
    const p = seeing(emptyPerception(), 25);
    b.alert(p.playerPos);
    let firstShot = -1;
    let maxTele = 0;
    run(b, p, 3, (f, i) => {
      if (f && firstShot < 0) firstShot = i * FIXED_DT;
    });
    expect(firstShot).toBeGreaterThanOrEqual(ENEMY_TYPES.marksman.reaction + ENEMY_TYPES.marksman.weapon.telegraph - 0.05);

    const b2 = brain('marksman', [], true);
    const p2 = seeing(emptyPerception(), 25);
    b2.alert(p2.playerPos);
    let fired = false;
    const cmd = emptyCommand();
    for (let i = 0; i < Math.round((0.8 + 1.0) / FIXED_DT); i++) {
      b2.update(FIXED_DT, p2, tactics, cmd);
      maxTele = Math.max(maxTele, cmd.telegraph);
      fired ||= cmd.fire;
    }
    expect(maxTele).toBeGreaterThan(0.5);
    expect(fired).toBe(false);
    // El jugador se cubre: la línea de visión se rompe y el telégrafo baja sin disparo.
    p2.canSee = false;
    p2.canShoot = false;
    for (let i = 0; i < 60; i++) {
      b2.update(FIXED_DT, p2, tactics, cmd);
      fired ||= cmd.fire;
    }
    expect(fired).toBe(false);
    expect(cmd.telegraph).toBeLessThan(0.1);
  });

  it('pierde de vista al jugador → búsqueda → vuelve a patrullar', () => {
    const b = brain('thug', [new Vector3(3, 0, 0)]);
    const p = seeing(emptyPerception(), 10);
    b.alert(p.playerPos);
    run(b, p, 0.5);
    p.canSee = false;
    p.canShoot = false;
    run(b, p, 2);
    expect(b.state).toBe('search');
    p.selfPos.copy(b.lastKnown);
    run(b, p, 6);
    expect(b.state).toBe('patrol');
  });

  it('recibir daño en patrulla lo pone en combate al instante', () => {
    const b = brain();
    const p = emptyPerception();
    p.damaged = true;
    p.damageFrom.set(4, 0, 4);
    const cmd = emptyCommand();
    b.update(FIXED_DT, p, tactics, cmd);
    expect(b.state).toBe('combat');
    expect(b.lastKnown.x).toBe(4);
  });

  it('atasco: replanifica hacia otra meta en vez de seguir empujando', () => {
    const b = brain('thug', [new Vector3(10, 0, 0), new Vector3(-10, 0, 0)]);
    const p = emptyPerception();
    const cmd = emptyCommand();
    b.update(FIXED_DT, p, tactics, cmd);
    const before = cmd.moveTo.clone();
    p.path = 'stuck';
    b.update(FIXED_DT, p, tactics, cmd);
    p.path = 'moving';
    b.update(FIXED_DT, p, tactics, cmd);
    expect(cmd.moveTo.distanceTo(before)).toBeGreaterThan(0.5);
  });

  it('aturdido y muerto no disparan ni se mueven', () => {
    const b = brain();
    const p = seeing(emptyPerception(), 5);
    b.alert(p.playerPos);
    b.stun();
    const cmd = run(b, p, 2);
    expect(cmd.fire).toBe(false);
    expect(cmd.hasMove).toBe(false);
    b.kill();
    const c2 = run(b, p, 1);
    expect(c2.fire).toBe(false);
    expect(b.state).toBe('dead');
  });

  it('un destello se le pasa solo: si peleaba sigue peleando, si no sabía de nadie registra la zona', () => {
    const fighting = brain();
    const p = seeing(emptyPerception(), 8);
    fighting.alert(p.playerPos);
    run(fighting, p, 0.2);
    fighting.daze(2, new Vector3(1, 0, 1));
    expect(fighting.dazed).toBe(true);
    const during = run(fighting, p, 1.5);
    expect(during.fire || during.hasMove).toBe(false);
    expect(fighting.state).toBe('stunned');
    run(fighting, p, 0.6);
    expect(fighting.state).toBe('combat');

    const calm = brain();
    const blind = emptyPerception();
    const at = new Vector3(4, 0, 2);
    run(calm, blind, 0.2);
    calm.daze(1, at);
    run(calm, blind, 1.1);
    expect(calm.state).toBe('search');
    expect(calm.lastKnown.distanceTo(at), 'va a donde estalló').toBeLessThan(0.01);
  });

  it('otro destello lo alarga, pero no despierta a quien está a merced (takedown, jefe arrodillado)', () => {
    const b = brain();
    b.daze(1, new Vector3());
    b.daze(3, new Vector3());
    expect(b.stunLeft).toBe(3);
    b.daze(0.5, new Vector3());
    expect(b.stunLeft, 'uno más flojo no lo acorta').toBe(3);
    // Agarrado para un takedown: ya no se le pasa solo.
    b.stun();
    b.daze(2, new Vector3());
    expect(b.dazed).toBe(false);
    run(b, emptyPerception(), 6);
    expect(b.state).toBe('stunned');
  });

  it('deslumbrar al jefe le corta el disparo sin aturdirlo', () => {
    const b = brain('boss');
    const p = seeing(emptyPerception(), 10);
    b.alert(p.playerPos);
    const shots = (seconds: number): number => {
      let n = 0;
      run(b, p, seconds, (fired) => (n += fired ? 1 : 0));
      return n;
    };
    expect(shots(2.5)).toBeGreaterThan(0);
    b.dazzle(1.2);
    expect(shots(1.1), 'no dispara mientras está deslumbrado').toBe(0);
    expect(b.state).not.toBe('stunned');
    expect(shots(3), 'después, sí').toBeGreaterThan(0);
  });

  it('alerta de un aliado lo une al combate', () => {
    const b = brain();
    const p = emptyPerception();
    p.allyAlert = true;
    p.allyAlertPos.set(-6, 0, 2);
    const cmd = emptyCommand();
    b.update(FIXED_DT, p, tactics, cmd);
    expect(b.state).toBe('combat');
  });
});
