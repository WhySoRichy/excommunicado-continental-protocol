import { Vector3 } from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { EnemyManager } from '../../src/combat/EnemyManager';
import { NO_VFX, SILENT_AUDIO } from '../../src/combat/ports';
import { Rng } from '../../src/core/rng';
import { PLAYER_RADIUS, PlayerController } from '../../src/entities/PlayerController';
import { arena } from '../../src/levels/data/arena';
import { buildLevelPhysics } from '../../src/levels/levelPhysics';
import { NavGrid } from '../../src/levels/nav/NavGrid';
import { MAX_REWIND, rayCapsule, ShotHistory } from '../../src/net/lagComp';
import { createRayHit, loadRapier, PhysicsWorld, type Rapier } from '../../src/physics/Physics';

let R: Rapier;
beforeAll(async () => {
  R = await loadRapier();
});

const o = (x: number, y: number, z: number) => ({ x, y, z });

describe('rayo contra cápsula', () => {
  it('entra por el cuerpo, por las tapas, desde dentro y falla lo que no toca', () => {
    // Cápsula con la base del segmento en el origen, 1 m de segmento y 0,3 de radio.
    expect(rayCapsule(o(-5, 0.5, 0), o(1, 0, 0), 0, 0, 0, 1, 0.3)).toBeCloseTo(4.7, 6);
    expect(rayCapsule(o(-5, 0.5, 0.31), o(1, 0, 0), 0, 0, 0, 1, 0.3), 'pasa rozando').toBe(-1);
    expect(rayCapsule(o(0, 5, 0), o(0, -1, 0), 0, 0, 0, 1, 0.3), 'desde arriba, la tapa de arriba').toBeCloseTo(3.7, 6);
    expect(rayCapsule(o(0, -5, 0), o(0, 1, 0), 0, 0, 0, 1, 0.3), 'desde abajo, la de abajo').toBeCloseTo(4.7, 6);
    expect(rayCapsule(o(-5, 1.2, 0), o(1, 0, 0), 0, 0, 0, 1, 0.3), 'a la altura de la tapa').toBeCloseTo(5 - Math.sqrt(0.09 - 0.04), 6);
    expect(rayCapsule(o(0, 0.5, 0.1), o(1, 0, 0), 0, 0, 0, 1, 0.3), 'desde dentro').toBe(0);
    expect(rayCapsule(o(-5, 0.5, 0), o(-1, 0, 0), 0, 0, 0, 1, 0.3), 'mirando a otro lado').toBe(-1);
  });
});

describe('compensación de latencia', () => {
  function world() {
    const physics = new PhysicsWorld(R);
    buildLevelPhysics(arena, physics);
    physics.step();
    const enemies = new EnemyManager({
      level: arena,
      physics,
      nav: NavGrid.build(arena),
      vfx: NO_VFX,
      audio: SILENT_AUDIO,
      rng: new Rng(1),
      accuracyMult: 1,
      damageMult: 1,
      onShotAtPlayer: () => {},
    });
    const shooter = new PlayerController(physics, new Vector3(0, 0, 12), 0);
    return { physics, enemies, shooter };
  }

  it('el disparo se resuelve contra donde estaba el enemigo en la pantalla de quien disparó', () => {
    const { physics, enemies, shooter } = world();
    const e = enemies.spawnAt('thug', new Vector3(0, 0, 4), 0);
    const h = new ShotHistory();
    // El enemigo se desplaza 3 m a la derecha en 20 pasos.
    for (let t = 1; t <= 20; t++) {
      e.mover.teleport(new Vector3((3 * t) / 20, 0, 4), 0);
      h.record(t, enemies.enemies, null);
    }
    const out = createRayHit();
    const from = o(0, 1.3, 12);
    const dir = o(0, 0, -1);
    expect(h.cast(physics, 1, from, dir, 50, out, shooter), 'donde estaba hace 19 pasos').toBe(true);
    expect(enemies.enemyFromCollider(out.collider)).toBe(e);
    expect(out.distance).toBeCloseTo(8 - PLAYER_RADIUS, 1);
    expect(h.cast(physics, 20, from, dir, 50, out, shooter), 'ahí ya no está').toBe(true);
    expect(enemies.enemyFromCollider(out.collider), 'el rayo sigue hasta la pared').toBeNull();
    // Entre dos pasos guardados, la posición intermedia: en 10,5 está a 1,575 m.
    expect(h.cast(physics, 10.5, o(1.575, 1.3, 12), dir, 50, out, shooter)).toBe(true);
    expect(enemies.enemyFromCollider(out.collider)).toBe(e);
  });

  it('no se rebobina más de medio segundo y no se mata dos veces', () => {
    const { physics, enemies, shooter } = world();
    const e = enemies.spawnAt('thug', new Vector3(0, 0, 4), 0);
    const h = new ShotHistory();
    for (let t = 1; t <= 60; t++) {
      e.mover.teleport(new Vector3(t < 10 ? 0 : 3, 0, 4), 0);
      h.record(t, enemies.enemies, null);
    }
    const out = createRayHit();
    const at0 = o(0, 1.3, 12);
    const dir = o(0, 0, -1);
    expect(MAX_REWIND).toBe(30);
    expect(h.cast(physics, 5, at0, dir, 50, out, shooter), 'pide el paso 5: se queda en el 30').toBe(true);
    expect(enemies.enemyFromCollider(out.collider), 'y en el 30 ya estaba en x = 3').toBeNull();
    expect(h.cast(physics, 40, o(3, 1.3, 12), dir, 50, out, shooter)).toBe(true);
    expect(enemies.enemyFromCollider(out.collider)).toBe(e);
    // Lo abate otro: su cuerpo deja de recibir disparos, también en el pasado.
    e.applyHit(999, 'body', at0 as Vector3, 1);
    expect(h.cast(physics, 40, o(3, 1.3, 12), dir, 50, out, shooter)).toBe(true);
    expect(enemies.enemyFromCollider(out.collider), 'no se mata dos veces').toBeNull();
  });
});
