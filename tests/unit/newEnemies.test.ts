import { simWorld } from './support/world';
import { Vector3 } from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { zoneFromHeight } from '../../src/combat/damage';
import { PlayerCombat } from '../../src/combat/PlayerCombat';
import { FIXED_DT } from '../../src/core/Loop';
import { Rng } from '../../src/core/rng';
import { EnemyBrain, emptyCommand, emptyPerception, type Tactics } from '../../src/entities/ai/EnemyBrain';
import { ENEMY_TYPES } from '../../src/entities/ai/enemyTypes';
import type { Enemy } from '../../src/entities/Enemy';
import { droneGeometry, DRONE_BONE, houndGeometry, HOUND_BONE } from '../../src/entities/rig/robots';
import { shieldGeometry } from '../../src/entities/rig/weapons';
import { arena } from '../../src/levels/data/arena';
import { docks } from '../../src/levels/data/docks';
import type { LevelData } from '../../src/levels/types';
import { loadRapier, QueryGroups, type Rapier } from '../../src/physics/Physics';

/** El antidisturbios, el sabueso y el dron: reglas, física y mallas. */
let R: Rapier;
beforeAll(async () => {
  R = await loadRapier();
});

function world(level: LevelData = arena) {
  const shots: Array<{ type: string; hit: boolean; damage: number }> = [];
  return { ...simWorld(R, { level, onShot: (e, _t, hit, damage) => shots.push({ type: e.def.type, hit, damage }) }), shots };
}

const still: Tactics = { findCover: () => false, findFlank: () => false, randomNear: (p, r, out) => (out.set(p.x + r * 0.6, p.y, p.z), true) };

/** Hacia dónde apunta un jugador (lo fija su intención en cada paso; aquí, a mano). */
const aimDir = (c: PlayerCombat): Vector3 => (c as unknown as { aimDir: Vector3 }).aimDir;

/** Dispara en línea recta de un punto a otro y devuelve qué pasa en el cuerpo de `e`. */
function shootAt(w: ReturnType<typeof world>, e: Enemy, from: Vector3, to: Vector3) {
  const dir = new Vector3().subVectors(to, from).normalize();
  const hit = { hit: false, distance: 0, point: { x: 0, y: 0, z: 0 }, normal: { x: 0, y: 0, z: 0 }, collider: null };
  const ok = w.physics.raycast(from, dir, 60, QueryGroups.PLAYER_SHOT, hit);
  expect(ok && w.enemies.enemyFromCollider(hit.collider)?.uid, 'el rayo llega al enemigo').toBe(e.uid);
  const at = new Vector3();
  return { blocked: e.blocks(hit.point, hit.normal, dir, at), at, zone: zoneFromHeight(hit.point.y, e.feet.y, e.height) };
}

describe('antidisturbios', () => {
  const setup = () => {
    const w = world();
    w.roster.god = true;
    const p = w.join(1.4, 12);
    const e = w.enemies.spawnAt('shield', new Vector3(0, 0, 4), Math.PI, new Vector3(0, 0, 12));
    w.physics.step();
    w.step(2);
    e.mover.yaw = Math.PI;
    return { w, p, e };
  };

  it('de frente el escudo para lo que va al cuerpo; los pies, la cabeza, los lados y la espalda quedan al aire', () => {
    const { w, e } = setup();
    expect(e.shieldUp).toBe(true);
    const f = e.feet;
    const front = new Vector3(0, 1.4, 12);
    // Mira a +Z: su izquierda (donde lleva el escudo algo desplazado) es +X.
    const chest = shootAt(w, e, front, new Vector3(f.x, 1.1, f.z));
    expect(chest.blocked).toBe(true);
    expect(chest.at.z, 'en el plano del escudo').toBeCloseTo(f.z + 0.42, 1);
    expect(shootAt(w, e, front, new Vector3(f.x, 0.75, f.z)).blocked).toBe(true);
    expect(shootAt(w, e, new Vector3(0, 1.7, 12), new Vector3(f.x, 1.7, f.z)).blocked, 'la cabeza asoma').toBe(false);
    expect(shootAt(w, e, new Vector3(0, 0.45, 6.5), new Vector3(f.x, 0.12, f.z)).blocked, 'los pies').toBe(false);
    expect(shootAt(w, e, new Vector3(f.x + 8, 1.2, f.z), new Vector3(f.x, 1.1, f.z)).blocked, 'de lado').toBe(false);
    expect(shootAt(w, e, new Vector3(f.x, 1.2, f.z - 6), new Vector3(f.x, 1.1, f.z)).blocked, 'por la espalda').toBe(false);
  });

  it('de guardia lo lleva bajo; aturdido, descolocado o sin él, tampoco para nada', () => {
    const w = world();
    const calm = w.enemies.spawnAt('shield', new Vector3(0, 0, 4), Math.PI);
    expect(calm.shieldUp).toBe(false);
    const { e } = setup();
    e.daze(2, new Vector3(0, 0, 8));
    expect(e.shieldUp).toBe(false);
    const other = setup().e;
    other.brain.stagger(0.5);
    expect(other.shieldUp).toBe(false);
    const broken = setup().e;
    while (!broken.shieldBroken) broken.shieldHit(50, new Vector3(0, 0, 12));
    expect(broken.shieldUp).toBe(false);
  });

  it('muchos impactos seguidos le bajan la guardia un momento; sueltos, no', () => {
    const { w, e } = setup();
    const from = new Vector3(0, 0, 12);
    const guard = ENEMY_TYPES.shield.shield!.guard;
    e.shieldHit(guard * 0.6, from);
    expect(e.shieldUp).toBe(true);
    w.step(180);
    e.shieldHit(guard * 0.6, from);
    expect(e.shieldUp, 'con tiempo entre medias se rehace').toBe(true);
    e.shieldHit(guard * 0.6, from);
    expect(e.shieldUp).toBe(false);
    expect(e.vitals.health, 'el escudo lo ha parado todo').toBe(ENEMY_TYPES.shield.health);
    w.step(80);
    expect(e.shieldUp, 'y lo vuelve a levantar').toBe(true);
  });

  it('disparándole de frente aguanta; por la espalda cae', () => {
    const run = (behind: boolean): { alive: boolean; shield: number } => {
      const w = world();
      w.roster.god = true;
      const p = w.join(0, behind ? -3 : 12);
      const e = w.enemies.spawnAt('shield', new Vector3(0, 0, 4), Math.PI, new Vector3(0, 0, 12));
      w.physics.step();
      p.controller.yaw = behind ? Math.PI : 0;
      for (let i = 0; i < 60; i++) {
        e.mover.yaw = Math.PI;
        e.brain.state = 'combat';
        p.combatIntent.aim = p.intent.aim = true;
        p.combatIntent.aimFrom.set(0, 1.7, behind ? -5 : 14);
        p.combatIntent.aimDir.set(0, -0.06, behind ? 1 : -1).normalize();
        p.combatIntent.firePressed = i % 12 === 0;
        w.step();
      }
      return { alive: e.alive, shield: e.shieldHealth };
    };
    const front = run(false);
    expect(front.alive).toBe(true);
    expect(front.shield).toBeLessThan(ENEMY_TYPES.shield.shield!.health);
    const back = run(true);
    expect(back.alive).toBe(false);
    expect(back.shield).toBe(ENEMY_TYPES.shield.shield!.health);
  });

  it('con el escudo por delante solo se le proyecta por la espalda', () => {
    const { w, p, e } = setup();
    const c = p.combat;
    p.controller.teleport(new Vector3(e.feet.x, 0.02, e.feet.z + 1.2), 0);
    aimDir(c).set(0, 0, -1);
    expect(c.takedownCandidate(p.ctx)).toBeNull();
    e.brain.stagger(1);
    expect(c.takedownCandidate(p.ctx)?.uid).toBe(e.uid);
    w.step(90);
    p.controller.teleport(new Vector3(e.feet.x, 0.02, e.feet.z - 1.2), Math.PI);
    e.mover.yaw = Math.PI;
    aimDir(c).set(0, 0, 1);
    expect(c.takedownCandidate(p.ctx)?.uid).toBe(e.uid);
  });
});

describe('sabueso', () => {
  it('persigue, se agazapa, salta y tarda en recolocarse', () => {
    const b = new EnemyBrain(ENEMY_TYPES.hound, [], new Vector3(), false, new Rng(2));
    const p = emptyPerception();
    const cmd = emptyCommand();
    p.canSee = p.canShoot = true;
    p.seeFactor = 1;
    p.distance = 12;
    p.playerPos.set(0, 0, -12);
    b.alert(p.playerPos);
    for (let i = 0; i < 40; i++) b.update(FIXED_DT, p, still, cmd);
    expect(cmd.hasMove && cmd.run).toBe(true);
    expect(cmd.telegraph).toBe(0);
    p.distance = 3;
    p.playerPos.set(0, 0, -3);
    let wind = 0;
    let lunge = 0;
    let pounces = 0;
    let rest = 0;
    let fired = false;
    for (let i = 0; i < 120; i++) {
      b.update(FIXED_DT, p, still, cmd);
      fired ||= cmd.fire;
      if (cmd.pounce) pounces++;
      if (cmd.lunge >= 0) lunge++;
      else if (cmd.telegraph > 0) {
        wind++;
        expect(cmd.hasMove, 'agazapado no se mueve').toBe(false);
      } else if (lunge > 0) rest++;
      if (rest > 0 && cmd.telegraph > 0) break;
    }
    const L = ENEMY_TYPES.hound.lunge!;
    expect(wind * FIXED_DT).toBeGreaterThan(0.45);
    expect(pounces).toBe(1);
    expect(lunge * FIXED_DT).toBeCloseTo(L.time, 1);
    expect(rest * FIXED_DT, 'un respiro antes del siguiente').toBeGreaterThan(L.recover - 0.1);
    expect(fired).toBe(false);
  });

  it('si la presa se aparta mientras se agazapa, la persigue otra vez; un golpe le corta el salto', () => {
    const b = new EnemyBrain(ENEMY_TYPES.hound, [], new Vector3(), false, new Rng(2));
    const p = emptyPerception();
    const cmd = emptyCommand();
    p.canSee = true;
    p.seeFactor = 1;
    p.distance = 3;
    p.playerPos.set(0, 0, -3);
    b.alert(p.playerPos);
    for (let i = 0; i < 90 && cmd.telegraph < 0.4; i++) b.update(FIXED_DT, p, still, cmd);
    expect(cmd.telegraph).toBeGreaterThan(0.3);
    p.distance = 9;
    p.playerPos.set(0, 0, -9);
    b.update(FIXED_DT, p, still, cmd);
    expect(cmd.telegraph).toBe(0);
    expect(cmd.hasMove).toBe(true);
    p.distance = 3;
    for (let i = 0; i < 90 && cmd.telegraph < 0.6; i++) b.update(FIXED_DT, p, still, cmd);
    b.stagger(0.5);
    let pounced = false;
    for (let i = 0; i < 40; i++) {
      b.update(FIXED_DT, p, still, cmd);
      pounced ||= cmd.pounce;
    }
    expect(pounced).toBe(false);
  });

  it('alcanza al jugador y le muerde una vez por salto; si rueda a tiempo, no', () => {
    const w = world();
    const p = w.join(0, 12);
    w.enemies.spawnAt('hound', new Vector3(0, 0, 2), Math.PI, p.controller.feet.clone());
    w.physics.step();
    for (let i = 0; i < 360 && w.shots.length === 0; i++) w.step();
    expect(w.shots).toHaveLength(1);
    expect(w.shots[0]).toMatchObject({ type: 'hound', hit: true });
    expect(w.shots[0]!.damage).toBeGreaterThan(10);
    const armor = p.combat.vitals.health + p.combat.vitals.armor;
    expect(armor).toBeLessThan(100 + p.combat.vitals.maxArmor);
    w.step(20);
    expect(w.shots, 'una sola vez aunque siga encima').toHaveLength(1);
    // Invulnerable (en plena voltereta): el salto no cuenta.
    const w2 = world();
    const q = w2.join(0, 12);
    Object.defineProperty(q.controller, 'invulnerable', { get: () => true, set: () => {} });
    w2.enemies.spawnAt('hound', new Vector3(0, 0, 5), Math.PI, q.controller.feet.clone());
    w2.physics.step();
    for (let i = 0; i < 360 && w2.shots.length === 0; i++) w2.step();
    expect(w2.shots[0]).toMatchObject({ type: 'hound', hit: false });
  });

  it('es bajo: un disparo por encima de su lomo no le da, y no hay takedown ni disparo a la cabeza', () => {
    const w = world();
    const p = w.join(0, 12);
    const e = w.enemies.spawnAt('hound', new Vector3(0, 0, 6), Math.PI, p.controller.feet.clone());
    w.physics.step();
    expect(e.height).toBeLessThan(0.95);
    expect(e.height).toBeGreaterThan(0.7);
    p.controller.teleport(new Vector3(e.feet.x, 0.02, e.feet.z + 1.2), 0);
    aimDir(p.combat).set(0, 0, -1);
    expect(p.combat.takedownCandidate(p.ctx)).toBeNull();
    const r = e.applyHit(10, 'head', p.controller.feet, 3);
    expect(r.dealt).toBe(10);
    expect(e.limping).toBe(0);
  });
});

describe('dron', () => {
  it('vuela a su altura sin atravesar el techo, se mueve y dispara ráfagas tras avisar', () => {
    const w = world();
    const p = w.join(0, 12);
    w.roster.god = true;
    const e = w.enemies.spawnAt('drone', new Vector3(0, 0, 2), Math.PI, p.controller.feet.clone());
    w.physics.step();
    let minY = 99;
    let maxY = 0;
    let warned = 0;
    const times: number[] = [];
    let travelled = 0;
    const last = e.feet.clone();
    for (let i = 0; i < 600; i++) {
      const n = w.shots.length;
      w.step();
      if (i > 60) {
        minY = Math.min(minY, e.feet.y);
        maxY = Math.max(maxY, e.feet.y);
      }
      travelled += Math.hypot(e.feet.x - last.x, e.feet.z - last.z);
      last.copy(e.feet);
      if (e.cmd.telegraph > 0) warned++;
      if (w.shots.length > n) times.push(i * FIXED_DT);
    }
    expect(minY).toBeGreaterThan(2);
    expect(maxY).toBeLessThan(3.2);
    expect(travelled, 'no se queda quieto').toBeGreaterThan(4);
    expect(warned * FIXED_DT).toBeGreaterThan(0.7);
    expect(times.length).toBeGreaterThan(6);
    // Dentro de la ráfaga va seguido; entre ráfagas, pausa y otro aviso.
    const gaps = times.slice(1).map((t, i) => t - times[i]!);
    expect(gaps.filter((g) => g < 0.15).length).toBeGreaterThan(4);
    expect(Math.max(...gaps)).toBeGreaterThan(2);
  });

  it('una aturdidora lo tira al suelo y después vuelve a subir; muerto, cae y se queda', () => {
    const w = world();
    const p = w.join(0, 14);
    w.roster.god = true;
    const e = w.enemies.spawnAt('drone', new Vector3(0, 0, 4), Math.PI, p.controller.feet.clone());
    w.physics.step();
    w.step(60);
    expect(e.feet.y).toBeGreaterThan(2);
    expect(w.enemies.stunBlast(new Vector3(e.feet.x, 1.5, e.feet.z + 1))).toBe(1);
    w.step(60);
    expect(e.feet.y, 'en el suelo').toBeLessThan(0.2);
    expect(e.dazed).toBe(true);
    w.step(60 * 8);
    expect(e.dazed).toBe(false);
    expect(e.feet.y, 'otra vez arriba').toBeGreaterThan(2);
    e.applyHit(999, 'body', p.controller.feet, 1);
    w.step(90);
    expect(e.alive).toBe(false);
    expect(e.feet.y).toBeLessThan(0.2);
  });

  it('bajo techo vuela más bajo', () => {
    const w = world(docks);
    const p = w.join(-8, -24);
    const e = w.enemies.spawnAt('drone', new Vector3(-8, 0, -20), Math.PI, p.controller.feet.clone());
    w.physics.step();
    const up = { hit: false, distance: 0, point: { x: 0, y: 0, z: 0 }, normal: { x: 0, y: 0, z: 0 }, collider: null };
    for (let i = 0; i < 300; i++) {
      w.step();
      const f = e.feet;
      if (w.physics.raycast(new Vector3(f.x, f.y + 0.1, f.z), new Vector3(0, 1, 0), 30, QueryGroups.STATIC, up))
        expect(up.distance, 'no toca el techo').toBeGreaterThan(0.5);
    }
    expect(e.alive).toBe(true);
  });
});

describe('mallas de las máquinas y del escudo', () => {
  const colors = { shell: 0x3b3549, dark: 0x1a1b21, accent: 0x9b6bff };
  it.each([
    ['sabueso', houndGeometry, Object.keys(HOUND_BONE).length, 8000],
    ['dron', droneGeometry, Object.keys(DRONE_BONE).length, 8000],
  ] as const)('%s: completa, dentro de su presupuesto y con una malla lejana más ligera', (_n, build, bones, budget) => {
    const near = build(colors, 'near');
    const far = build(colors, 'far');
    const tris = (g: typeof near): number => g.index!.count / 3;
    expect(tris(near)).toBeLessThan(budget);
    expect(tris(far)).toBeLessThan(tris(near) * 0.8);
    for (const g of [near, far]) {
      const pos = g.getAttribute('position');
      const nor = g.getAttribute('normal');
      const used = new Set<number>();
      for (let i = 0; i < pos.count; i++) {
        expect(Number.isFinite(pos.getX(i) + pos.getY(i) + pos.getZ(i))).toBe(true);
        expect(Math.hypot(nor.getX(i), nor.getY(i), nor.getZ(i))).toBeGreaterThan(0.9);
        used.add(g.getAttribute('skinIndex').getX(i));
      }
      expect(used.size, 'cada hueso mueve algo').toBe(bones);
      g.computeBoundingBox();
      expect(g.boundingBox!.min.y).toBeGreaterThan(-0.02);
    }
  });

  it('el escudo tapa del cuello a las espinillas', () => {
    const g = shieldGeometry(0xa6ff3d);
    g.computeBoundingBox();
    const b = g.boundingBox!;
    expect(b.max.x - b.min.x).toBeGreaterThan(0.6);
    expect(b.max.x - b.min.x).toBeLessThan(0.75);
    expect(b.max.y - b.min.y).toBeGreaterThan(1.1);
    expect(b.max.y - b.min.y).toBeLessThan(1.25);
    expect(g.getAttribute('position').count / 3).toBeLessThan(4500);
  });
});

describe('en red', () => {
  it('una réplica muestra el escudo, la embestida y la altura del anfitrión', async () => {
    const { emptyEnemyNet } = await import('../../src/entities/Enemy');
    const w = world();
    const p = w.join(0, 12);
    const host = w.enemies.spawnAt('shield', new Vector3(0, 0, 4), Math.PI, p.controller.feet.clone());
    const drone = w.enemies.spawnAt('drone', new Vector3(4, 0, 4), Math.PI, p.controller.feet.clone());
    w.physics.step();
    w.step(90);
    const w2 = world();
    for (const e of [host, drone]) {
      const net = e.writeNet(emptyEnemyNet());
      const r = w2.enemies.spawnReplica(net.uid, net.type, net.move);
      r.applyNet(net, true);
      expect(r.shieldUp).toBe(e.shieldUp);
      expect(r.feet.distanceTo(e.feet)).toBeLessThan(0.01);
      expect(r.mover.state).toBe(e.mover.state);
    }
    // Con la guardia baja, lo dice el anfitrión: la réplica no sabe que lo han descolocado.
    const r = w2.enemies.byNetId(host.uid)!;
    host.brain.stagger(1);
    r.applyNet(host.writeNet(emptyEnemyNet()));
    expect(r.shieldUp).toBe(false);
    expect(r.shieldBroken).toBe(false);
    while (!host.shieldBroken) host.shieldHit(60, p.controller.feet);
    const net = host.writeNet(emptyEnemyNet());
    r.applyNet(net);
    expect(r.shieldUp).toBe(false);
    expect(r.shieldBroken).toBe(true);
  });
});
