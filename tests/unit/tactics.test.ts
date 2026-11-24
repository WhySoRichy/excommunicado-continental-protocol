import { Vector3 } from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { EnemyManager } from '../../src/combat/EnemyManager';
import { Grenades } from '../../src/combat/Grenades';
import { NO_VFX, SILENT_AUDIO } from '../../src/combat/ports';
import { zoneFromHeight } from '../../src/combat/damage';
import { FIXED_DT } from '../../src/core/Loop';
import { Rng } from '../../src/core/rng';
import type { CoverChoice } from '../../src/entities/ai/EnemyBrain';
import { fireTurns } from '../../src/entities/ai/squad';
import type { PlayerTarget } from '../../src/entities/Enemy';
import { arena } from '../../src/levels/data/arena';
import { docks } from '../../src/levels/data/docks';
import { nightclub } from '../../src/levels/data/nightclub';
import { rooftop } from '../../src/levels/data/rooftop';
import { buildLevelPhysics } from '../../src/levels/levelPhysics';
import { NavGrid } from '../../src/levels/nav/NavGrid';
import type { LevelData } from '../../src/levels/types';
import { loadRapier, PhysicsWorld, QueryGroups, type Rapier } from '../../src/physics/Physics';

/** Decisiones tácticas con la física y la navegación reales: coberturas, granadas, cuerpos y reacciones a los impactos. */
let R: Rapier;
beforeAll(async () => {
  R = await loadRapier();
});

function world(level: LevelData, seed = 3) {
  const physics = new PhysicsWorld(R);
  buildLevelPhysics(level, physics);
  physics.step();
  const rng = new Rng(seed);
  const shots: boolean[] = [];
  const enemies = new EnemyManager({
    level,
    physics,
    nav: NavGrid.build(level),
    vfx: NO_VFX,
    audio: SILENT_AUDIO,
    rng,
    accuracyMult: 1,
    damageMult: 1,
    onShotAtPlayer: (_e, _t, hit) => shots.push(hit),
  });
  const dummy = enemies.spawnAt('thug', new Vector3(0, -50, 0), 0);
  enemies.remove(dummy);
  const target = (x: number, y: number, z: number, alive = true): PlayerTarget => ({
    id: 0,
    feet: new Vector3(x, y, z),
    head: new Vector3(x, y + 1.6, z),
    chest: new Vector3(x, y + 1.25, z),
    crouched: false,
    speed: 0,
    invulnerable: false,
    alive,
    collider: dummy.collider,
  });
  const step = (t: PlayerTarget, n = 1): void => {
    for (let i = 0; i < n; i++) {
      enemies.fixedUpdate(FIXED_DT, [t]);
      physics.step();
    }
  };
  return { physics, enemies, rng, shots, target, step };
}

const choice = (): CoverChoice => ({ pos: new Vector3(), peek: new Vector3(), high: false });

describe('coberturas de los enemigos', () => {
  it.each([
    ['muelles', docks],
    ['discoteca', nightclub],
    ['azotea', rooftop],
    ['arena', arena],
  ] as const)('%s: la que elige tapa de verdad y deja disparar al asomarse', (_name, level) => {
    const w = world(level);
    const nav = NavGrid.build(level);
    const s = level.spawn.pos;
    const comp = nav.comp[nav.nearestNode(s[0], s[1], s[2], 3)]!;
    const rng = new Rng(11);
    const a = new Vector3();
    const b = new Vector3();
    const self = new Vector3();
    const threat = new Vector3();
    let found = 0;
    let high = 0;
    const node = (out: Vector3): void => {
      for (;;) {
        const n = Math.floor(rng.next() * nav.comp.length);
        if (nav.comp[n] !== comp) continue;
        nav.pos(n, out);
        return;
      }
    };
    for (let i = 0; i < 400; i++) {
      node(self);
      node(threat);
      const d = self.distanceTo(threat);
      if (d < 6 || d > 25 || Math.abs(self.y - threat.y) > 1) continue;
      const c = choice();
      if (!w.enemies.findCover(self, threat, c)) continue;
      found++;
      if (c.high) high++;
      b.set(threat.x, threat.y + 1.3, threat.z);
      a.set(c.pos.x, c.pos.y + (c.high ? 1.3 : 0.85), c.pos.z);
      expect(w.physics.lineOfSight(a, b, QueryGroups.STATIC), 'escondido no se le ve').toBe(false);
      a.set(c.peek.x, c.peek.y + 1.5, c.peek.z);
      expect(w.physics.lineOfSight(a, b, QueryGroups.STATIC), 'asomado, sí').toBe(true);
      expect(c.pos.distanceTo(threat), 'no se pega al jugador').toBeGreaterThan(3.9);
      if (c.high) expect(c.peek.distanceTo(c.pos), 'se asoma de un paso').toBeLessThan(2.2);
      else expect(c.peek.distanceTo(c.pos)).toBe(0);
    }
    expect(found).toBeGreaterThan(5);
    if (level === docks) expect(high, 'los contenedores tapan de pie').toBeGreaterThan(3);
  });

  it('dos enemigos no eligen la misma', () => {
    const w = world(arena);
    const p = w.target(0, 0, 10);
    const list = [-1, 0, 1].map((x) => w.enemies.spawnAt('thug', new Vector3(x, 0, 2), Math.PI, p.feet));
    for (const e of list) for (let i = 0; i < 6; i++) e.brain.suppress(0.28);
    w.step(p, 3);
    const goals = list.filter((e) => e.state === 'cover').map((e) => e.cmd.moveTo.toArray().join());
    expect(goals.length).toBeGreaterThan(1);
    expect(new Set(goals).size).toBe(goals.length);
  });
});

describe('fuego cercano, granadas y cuerpos', () => {
  it('un disparo que pasa cerca pone nervioso; el que pasa lejos, al que ya dio o a su espalda, no', () => {
    const w = world(arena);
    const near = w.enemies.spawnAt('thug', new Vector3(0.8, 0, 2), Math.PI);
    const far = w.enemies.spawnAt('thug', new Vector3(5, 0, 2), Math.PI);
    const behind = w.enemies.spawnAt('thug', new Vector3(0, 0, 14), Math.PI);
    const struck = w.enemies.spawnAt('thug', new Vector3(0, 0, 4), Math.PI);
    const heavy = w.enemies.spawnAt('heavy', new Vector3(-0.8, 0, 2), Math.PI);
    w.enemies.nearShot(new Vector3(0, 1.4, 10), new Vector3(0, 0, -1), 20, struck);
    expect(near.brain.suppression).toBeGreaterThan(0.2);
    expect(far.brain.suppression).toBe(0);
    expect(behind.brain.suppression).toBe(0);
    expect(struck.brain.suppression).toBe(0);
    expect(heavy.brain.suppression, 'el blindado se altera menos').toBeLessThan(near.brain.suppression);
  });

  it('quien ve caer una granada a sus pies se aparta muchas veces, pero no siempre ni al instante', () => {
    let ran = 0;
    const n = 24;
    for (let k = 0; k < n; k++) {
      const w = world(arena, 100 + k);
      const p = w.target(0, 0, 14);
      const e = w.enemies.spawnAt('thug', new Vector3(0, 0, 4), Math.PI, p.feet);
      w.step(p, 5);
      const g = new Grenades({ physics: w.physics, enemies: w.enemies, civilians: null, vfx: NO_VFX, audio: SILENT_AUDIO });
      g.throw('stun', 0, new Vector3(0.6, 0.1, 5.2), new Vector3(0, 0, 0));
      const from = e.feet.clone();
      for (let i = 0; i < 15; i++) {
        g.fixedUpdate(FIXED_DT);
        w.step(p);
      }
      const early = e.feet.distanceTo(from);
      for (let i = 0; i < 60; i++) {
        g.fixedUpdate(FIXED_DT);
        w.step(p);
      }
      expect(early, 'tarda en verla').toBeLessThan(1.2);
      const d = Math.hypot(e.feet.x - 0.6, e.feet.z - 5.2);
      if (d > 3) ran++;
    }
    expect(ran).toBeGreaterThan(n * 0.3);
    expect(ran).toBeLessThan(n);
  });

  it('una patrulla encuentra un cuerpo si lo ve; de espaldas o con algo por medio, no', () => {
    const w = world(arena);
    const p = w.target(0, 0, 60, false);
    const dead = w.enemies.spawnAt('thug', new Vector3(0, 0, 3), 0);
    const away = w.enemies.spawnAt('thug', new Vector3(2, 0, 9), Math.PI);
    dead.applyHit(999, 'body', dead.feet, 1, true);
    w.step(p, 45);
    expect(away.state, 'de espaldas no lo ve').toBe('patrol');
    const seer = w.enemies.spawnAt('thug', new Vector3(0, 0, 9), 0);
    w.step(p, 45);
    expect(seer.state).toBe('search');
    expect(seer.brain.lastKnown.distanceTo(dead.feet)).toBeLessThan(1);
    expect(away.state).toBe('patrol');
  });

  it('con muchos a la vez, solo unos pocos disparan a la vez y alguno rodea', () => {
    const w = world(arena, 8);
    const p = w.target(0, 0, 12);
    const list = [-4, -3, -2, -1, 1, 2, 3, 4].map((x) => w.enemies.spawnAt('escort', new Vector3(x, 0, 2), Math.PI, p.feet));
    let flanked = 0;
    let covered = 0;
    let maxTurns = 0;
    for (let i = 0; i < 900; i++) {
      w.step(p);
      for (const e of list) e.perception.damaged = false;
      flanked = Math.max(flanked, list.filter((e) => e.state === 'flank').length);
      covered = Math.max(covered, list.filter((e) => e.brain.covering).length);
      if (i > 30) maxTurns = Math.max(maxTurns, list.filter((e) => e.brain.mayFire && e.state !== 'search').length);
    }
    expect(flanked).toBeGreaterThan(0);
    expect(flanked).toBeLessThanOrEqual(2);
    expect(covered).toBeGreaterThan(0);
    // Entre un reparto y el siguiente puede colarse quien acaba de sumarse a la pelea.
    expect(maxTurns).toBeLessThanOrEqual(fireTurns(list.length) + 1);
    expect(w.shots.length).toBeGreaterThan(5);
  });
});

describe('reacciones a los impactos en un enemigo', () => {
  const hit = (amount: number, at: [number, number, number], type: 'thug' | 'heavy' = 'thug') => {
    const w = world(arena);
    const p = w.target(0, 0, 10);
    // Mira a +Z (hacia el jugador): su derecha es −X.
    const e = w.enemies.spawnAt(type, new Vector3(0, 0, 2), Math.PI, p.feet);
    w.step(p, 2);
    const f = e.feet;
    const point = new Vector3(f.x + at[0], f.y + at[1] * e.height, f.z + at[2]);
    const r = e.applyHit(amount, zoneFromHeight(point.y, f.y, e.height), p.feet, 2, false, { point, blast: false });
    return { w, p, e, r };
  };

  it('en el brazo baja el arma; en la pierna cojea y va más despacio; en la cabeza se descoloca', () => {
    const arm = hit(10, [-0.28, 0.6, 0.1]);
    expect(arm.e.hitPart).toBe('armR');
    expect(arm.e.brain.disarmed).toBe(true);
    expect(arm.e.aiming).toBe(false);

    const leg = hit(10, [0.1, 0.2, 0.1]);
    expect(leg.e.hitPart).toBe('legL');
    expect(leg.e.limping).toBe(-1);
    expect(leg.e.brain.staggered).toBe(false);
    leg.w.step(leg.p, 60 * 4);
    expect(leg.e.limping, 'se le pasa').toBe(0);

    const head = hit(10, [0, 0.9, 0.1]);
    expect(head.e.hitPart).toBe('head');
    expect(head.e.brain.staggered).toBe(true);
    const z = head.e.feet.z;
    head.w.step(head.p, 25);
    expect(head.e.feet.z, 'da unos pasos atrás').toBeLessThan(z - 0.1);
    expect(head.e.feet.z).toBeGreaterThan(z - 1.5);
  });

  it('cojeando avanza a la mitad', () => {
    const run = (wounded: boolean): number => {
      const w = world(arena);
      const p = w.target(0, 0, 24);
      const e = w.enemies.spawnAt('thug', new Vector3(9, 0, -2), Math.PI, p.feet);
      w.step(p, 2);
      const from = e.feet.clone();
      if (wounded) e.applyHit(5, 'limb', p.feet, 1, false, { point: new Vector3(e.feet.x + 0.1, 0.3, e.feet.z), blast: false });
      w.step(p, 75);
      return e.feet.distanceTo(from);
    };
    const free = run(false);
    const hurt = run(true);
    expect(free).toBeGreaterThan(2);
    expect(hurt).toBeLessThan(free * 0.75);
  });

  it('un escopetazo a quemarropa lo despide hacia atrás; un disparo suelto, no', () => {
    const { w, p, e } = hit(30, [0, 0.6, 0.2]);
    const z = e.feet.z;
    e.applyHit(60, 'body', p.feet, 1, false, { point: new Vector3(e.feet.x, 1.1, e.feet.z + 0.2), blast: true });
    expect(e.alive).toBe(false);
    expect(e.deathStyle).toBe(4);
    w.step(p, 30);
    expect(e.feet.z, 'sale hacia atrás').toBeLessThan(z - 0.35);
    const single = hit(30, [0, 0.6, 0.2]);
    const z2 = single.e.feet.z;
    single.e.applyHit(60, 'body', single.p.feet, 1, false, { point: new Vector3(0, 1.1, 2.2), blast: false });
    expect(single.e.alive).toBe(false);
    expect(single.e.deathStyle).not.toBe(4);
    single.w.step(single.p, 30);
    expect(Math.abs(single.e.feet.z - z2)).toBeLessThan(0.2);
  });

  it('el blindado encaja un disparo sin descolocarse', () => {
    const { e } = hit(30, [0, 0.6, 0.2], 'heavy');
    expect(e.brain.staggered).toBe(false);
    const light = hit(50, [0, 0.6, 0.2]);
    expect(light.e.brain.staggered).toBe(true);
  });
});
