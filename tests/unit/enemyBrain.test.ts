import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { FIXED_DT } from '../../src/core/Loop';
import { Rng } from '../../src/core/rng';
import { EnemyBrain, emptyCommand, emptyPerception, type Perception, type Tactics } from '../../src/entities/ai/EnemyBrain';
import { ENEMY_TYPES } from '../../src/entities/ai/enemyTypes';

const tactics: Tactics = {
  findCover: (self, threat, out) => {
    out.pos.set(self.x + (self.x - threat.x > 0 ? 2 : -2), self.y, self.z);
    out.peek.copy(out.pos);
    out.high = false;
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
    // Llega donde lo perdió y registra varios sitios alrededor antes de dejarlo.
    p.selfPos.copy(b.lastKnown);
    const lost = b.lastKnown.clone();
    const visited = new Set<string>();
    const cmd = emptyCommand();
    let t = 0;
    for (; t < 40 && b.state === 'search'; t += FIXED_DT) {
      b.update(FIXED_DT, p, tactics, cmd);
      if (cmd.hasMove) p.selfPos.copy(cmd.moveTo);
      if (p.selfPos.distanceTo(lost) > 1) visited.add(p.selfPos.toArray().join());
      expect(p.selfPos.distanceTo(lost), 'sin alejarse de ahí').toBeLessThan(8);
    }
    expect(visited.size).toBeGreaterThan(0);
    expect(b.state).toBe('patrol');
    expect(t, 'no busca para siempre').toBeLessThan(25);
  });

  it('gasta el cargador, recarga sin disparar y busca dónde meterse; sin pelea, lo repone', () => {
    const b = brain('thug');
    const w = ENEMY_TYPES.thug.weapon;
    const p = seeing(emptyPerception(), 10);
    b.alert(p.playerPos);
    const none: Tactics = { ...tactics, findCover: () => false };
    const cmd = emptyCommand();
    let shots = 0;
    let t = 0;
    for (; t < 20 && !b.reloading; t += FIXED_DT) {
      b.update(FIXED_DT, p, none, cmd);
      if (cmd.fire) shots++;
    }
    expect(shots, 'un cargador').toBe(w.mag);
    // Sin cobertura a mano, al menos se agacha; no dispara hasta terminar.
    let during = 0;
    let crouched = true;
    let left = 0;
    for (; left < 5 && b.reloading; left += FIXED_DT) {
      b.update(FIXED_DT, p, none, cmd);
      if (!b.reloading) break;
      if (cmd.fire) during++;
      crouched &&= cmd.crouch;
      expect(cmd.reload).toBeGreaterThanOrEqual(0);
      expect(cmd.reload).toBeLessThanOrEqual(1);
    }
    expect(during).toBe(0);
    expect(crouched).toBe(true);
    expect(left).toBeGreaterThan(w.reload - 0.1);
    expect(left).toBeLessThan(w.reload + 0.1);
    b.update(FIXED_DT, p, none, cmd);
    expect(cmd.reload).toBe(-1);
    run(b, p, 3, (f) => (shots += f ? 1 : 0));
    expect(shots).toBeGreaterThan(w.mag);

    // Con cobertura, recargando se va a ella.
    const c = brain('thug');
    c.alert(p.playerPos);
    let hid = false;
    for (let i = 0; i < 1200 && !hid; i++) {
      c.update(FIXED_DT, p, tactics, cmd);
      hid = c.reloading && (c.state as string) === 'cover';
    }
    expect(hid).toBe(true);
  });

  it('sin turno no empieza otra ráfaga; con él, sí', () => {
    const b = brain('thug');
    const p = seeing(emptyPerception(), 10);
    b.alert(p.playerPos);
    b.mayFire = false;
    const still: Tactics = { ...tactics, findCover: () => false };
    const cmd = emptyCommand();
    let shots = 0;
    const go = (s: number): number => {
      shots = 0;
      for (let t = 0; t < s; t += FIXED_DT) {
        b.update(FIXED_DT, p, still, cmd);
        if (cmd.fire) shots++;
      }
      return shots;
    };
    expect(go(4)).toBe(0);
    b.mayFire = true;
    expect(go(2)).toBeGreaterThan(0);
  });

  it('el fuego encima lo mantiene escondido y le estropea la puntería; al rato se asoma', () => {
    const b = brain('thug');
    const p = seeing(emptyPerception(), 10);
    b.alert(p.playerPos);
    const cover = new Vector3(2, 0, 0);
    const t: Tactics = {
      ...tactics,
      findCover: (_s, _t, out) => {
        out.pos.copy(cover);
        out.peek.copy(cover);
        out.high = false;
        return true;
      },
    };
    const cmd = emptyCommand();
    const step = (): void => b.update(FIXED_DT, p, t, cmd);
    // En campo abierto, con fuego encima va a cubrirse.
    for (let i = 0; i < 5; i++) b.suppress(0.28);
    expect(b.shaken).toBeGreaterThan(0.3);
    step();
    expect(b.state).toBe('cover');
    p.selfPos.copy(cover);
    p.canSee = false;
    p.canShoot = false;
    for (let i = 0; i < 240; i++) {
      b.suppress(0.02);
      step();
      if (i > 5) {
        expect(cmd.crouch, `escondido en el paso ${i}`).toBe(true);
        expect(cmd.hidden).toBe(true);
      }
    }
    // Deja de caerle fuego encima: se asoma.
    let up = false;
    for (let i = 0; i < 240 && !up; i++) {
      step();
      up = !cmd.crouch && !cmd.hidden;
    }
    expect(up).toBe(true);
    expect(b.shaken).toBeLessThan(0.35);
  });

  it('cobertura alta: se esconde, sale por el lado a disparar y vuelve', () => {
    const b = brain('escort');
    const p = seeing(emptyPerception(), 10);
    b.alert(p.playerPos);
    const pos = new Vector3(2, 0, 0);
    const peek = new Vector3(2.9, 0, 0);
    const t: Tactics = {
      ...tactics,
      findCover: (_s, _t, out) => {
        out.pos.copy(pos);
        out.peek.copy(peek);
        out.high = true;
        return true;
      },
    };
    for (let i = 0; i < 5; i++) b.suppress(0.3);
    const cmd = emptyCommand();
    let shotsOut = 0;
    let shotsIn = 0;
    let trips = 0;
    let out = false;
    for (let i = 0; i < 600; i++) {
      // Solo se le ve (y ve) fuera.
      out = p.selfPos.distanceTo(peek) < 0.5;
      p.canSee = out;
      p.canShoot = out;
      const was = out;
      b.update(FIXED_DT, p, t, cmd);
      if (b.state !== 'cover') break;
      if (cmd.hasMove) p.selfPos.lerp(cmd.moveTo, 0.2);
      expect(cmd.crouch, 'de pie: tapa entero').toBe(false);
      if (cmd.fire) {
        if (was) shotsOut++;
        else shotsIn++;
      }
      if (!was && p.selfPos.distanceTo(peek) < 0.5) trips++;
    }
    expect(trips).toBeGreaterThan(1);
    expect(shotsOut).toBeGreaterThan(1);
    expect(shotsIn).toBe(0);
  });

  it('si lo ven estando escondido, cambia de cobertura', () => {
    const b = brain('thug');
    const p = seeing(emptyPerception(), 10);
    b.alert(p.playerPos);
    const spots = [new Vector3(2, 0, 0), new Vector3(-6, 0, 3)];
    let n = 0;
    const t: Tactics = {
      ...tactics,
      findCover: (_s, _t, out) => {
        out.pos.copy(spots[Math.min(n++, 1)]!);
        out.peek.copy(out.pos);
        out.high = false;
        return true;
      },
    };
    for (let i = 0; i < 5; i++) b.suppress(0.3);
    const cmd = emptyCommand();
    b.update(FIXED_DT, p, t, cmd);
    p.selfPos.copy(spots[0]!);
    let moved = false;
    for (let i = 0; i < 180 && !moved; i++) {
      b.suppress(0.02);
      b.update(FIXED_DT, p, t, cmd);
      expect(b.state, 'directo de una a otra, sin salir a campo abierto').toBe('cover');
      moved = cmd.hasMove && cmd.moveTo.distanceTo(spots[1]!) < 0.1;
    }
    expect(moved).toBe(true);
  });

  it('se aparta de una granada y luego sigue con lo suyo', () => {
    const b = brain('thug');
    const p = seeing(emptyPerception(), 10);
    b.alert(p.playerPos);
    run(b, p, 0.5);
    const at = new Vector3(1, 0, 0);
    b.evade(at, p.selfPos, { ...tactics, randomNear: (pos, _r, out) => (out.copy(pos), true) });
    const cmd = emptyCommand();
    b.update(FIXED_DT, p, tactics, cmd);
    expect(cmd.hasMove && cmd.run).toBe(true);
    expect(cmd.moveTo.distanceTo(at), 'lejos de ella').toBeGreaterThan(4);
    expect(cmd.fire).toBe(false);
    run(b, p, 1.5);
    expect(b.state).toBe('combat');
    // Quien no se mueve de su sitio no corre a ninguna parte.
    const fixed = brain('marksman', [], true);
    fixed.alert(p.playerPos);
    fixed.evade(at, p.selfPos, tactics);
    fixed.update(FIXED_DT, p, tactics, cmd);
    expect(cmd.run).toBe(false);
  });

  it('descolocado no dispara ni se mueve por su cuenta; con el brazo herido no dispara', () => {
    const b = brain('escort');
    const p = seeing(emptyPerception(), 8);
    b.alert(p.playerPos);
    run(b, p, 1.5);
    b.stagger(0.55);
    let shots = 0;
    const cmd = run(b, p, 0.5, (f) => (shots += f ? 1 : 0));
    expect(b.staggered).toBe(true);
    expect(shots).toBe(0);
    expect(cmd.hasMove).toBe(false);
    run(b, p, 0.3);
    expect(b.staggered).toBe(false);
    b.disarm(0.9);
    shots = 0;
    run(b, p, 0.85, (f) => (shots += f ? 1 : 0));
    expect(shots).toBe(0);
    run(b, p, 3, (f) => (shots += f ? 1 : 0));
    expect(shots).toBeGreaterThan(0);
  });

  it('rodea cuando se lo manda la escuadra, lo avisa, y al llegar vuelve a combatir', () => {
    const b = brain('escort');
    const p = seeing(emptyPerception(), 10);
    b.alert(p.playerPos);
    run(b, p, 0.1);
    b.flankOrder = 1;
    const cmd = emptyCommand();
    b.update(FIXED_DT, p, tactics, cmd);
    expect(b.state).toBe('flank');
    expect(b.callout).toBe(true);
    expect(cmd.icon).toBe('flank');
    b.update(FIXED_DT, p, tactics, cmd);
    expect(cmd.moveTo.x, 'por el lado que le tocó').toBeGreaterThan(5);
    p.selfPos.copy(cmd.moveTo);
    b.update(FIXED_DT, p, tactics, cmd);
    expect(b.state).toBe('combat');
    // Por su cuenta, sin orden, no rodea.
    const alone = brain('escort');
    alone.alert(p.playerPos);
    let flanked = false;
    run(alone, p, 15, () => (flanked ||= alone.state === 'flank'));
    expect(flanked).toBe(false);
  });

  it('cubriendo a un compañero, dispara un rato hacia donde vio al jugador sin avanzar', () => {
    const b = brain('escort');
    const p = seeing(emptyPerception(), 10);
    b.alert(p.playerPos);
    const still: Tactics = { ...tactics, findCover: () => false };
    const cmd = emptyCommand();
    for (let i = 0; i < 60; i++) b.update(FIXED_DT, p, still, cmd);
    b.covering = true;
    p.canSee = false;
    p.canShoot = false;
    let covering = 0;
    let aimed = 0;
    let moved = false;
    for (let t = 0; t < 2.3; t += FIXED_DT) {
      b.update(FIXED_DT, p, still, cmd);
      if (cmd.suppress) covering++;
      if (cmd.fire) aimed++;
      moved ||= cmd.hasMove;
    }
    expect(covering).toBeGreaterThan(2);
    expect(aimed, 'sin verlo no hay disparo dirigido').toBe(0);
    expect(moved).toBe(false);
    for (let t = 0; t < 2; t += FIXED_DT) b.update(FIXED_DT, p, still, cmd);
    expect(b.state, 'y después lo busca').toBe('search');
  });

  it('encuentra un cuerpo: registra la zona, sin saber dónde está el jugador', () => {
    const b = brain('thug', [new Vector3(3, 0, 0)]);
    const p = emptyPerception();
    run(b, p, 0.2);
    b.findBody(new Vector3(4, 0, 4));
    const cmd = run(b, p, 0.2);
    expect(b.state).toBe('search');
    expect(cmd.icon).toBe('suspicious');
    expect(cmd.moveTo.distanceTo(new Vector3(4, 0, 4))).toBeLessThan(0.1);
    // En plena pelea ya sabe de sobra lo que pasa.
    const c = brain();
    c.alert(new Vector3(5, 0, 5));
    c.findBody(new Vector3(-9, 0, 0));
    expect(c.state).toBe('combat');
    expect(c.lastKnown.x).toBe(5);
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
