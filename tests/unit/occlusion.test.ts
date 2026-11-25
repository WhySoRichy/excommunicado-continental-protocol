import { Vector3 } from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { arena } from '../../src/levels/data/arena';
import { block } from '../../src/levels/helpers';
import { buildLevelPhysics } from '../../src/levels/levelPhysics';
import { animationStep, newSight, Occlusion } from '../../src/entities/occlusion';
import { loadRapier, PhysicsWorld, type Rapier } from '../../src/physics/Physics';

let R: Rapier;
beforeAll(async () => {
  R = await loadRapier();
});

/** Un muro de 6 m de ancho y 4 de alto, en z = 0. */
function world(): Occlusion {
  const physics = new PhysicsWorld(R);
  buildLevelPhysics({ ...arena, boxes: [block(0, 0, 6, 4, 0.5, 'concrete')], ramps: [] }, physics);
  physics.step();
  return new Occlusion(physics);
}

describe('personajes tapados por las paredes', () => {
  const eye = new Vector3(0, 1.7, 10);
  const settle = (o: Occlusion, feet: Vector3): boolean => {
    const s = newSight(0);
    for (let i = 0; i < 60; i++) o.look(s, eye, feet, 1.8);
    return s.visible;
  };

  it('tras un muro no se dibuja; a campo abierto, encima, o a punto de asomar por la esquina, sí', () => {
    const o = world();
    expect(settle(o, new Vector3(0, 0, -5)), 'justo detrás').toBe(false);
    expect(settle(o, new Vector3(0, 0, 4)), 'delante').toBe(true);
    expect(settle(o, new Vector3(9, 0, -5)), 'a un lado').toBe(true);
    expect(settle(o, new Vector3(0, 4, -1)), 'en lo alto').toBe(true);
    // El borde del muro tapa hasta x = 4,5 a esa distancia: medio metro antes ya se dibuja.
    expect(settle(o, new Vector3(4, 0, -5)), 'aún no asoma, pero está a punto').toBe(true);
  });

  it('espera a estar seguro antes de ocultarlo y lo enseña en cuanto vuelve a verse', () => {
    const o = world();
    const s = newSight(0);
    const hidden = new Vector3(0, 0, -5);
    o.look(s, eye, hidden, 1.8);
    expect(s.visible, 'a la primera no').toBe(true);
    for (let i = 0; i < 10; i++) o.look(s, eye, hidden, 1.8);
    expect(s.visible).toBe(false);
    for (let i = 0; i < 4; i++) o.look(s, eye, new Vector3(9, 0, -5), 1.8);
    expect(s.visible, 'en cuatro fotogramas').toBe(true);
  });

  it('a los tapados se los anima a ratos y sin que se pierda el tiempo de golpe', () => {
    const s = newSight(0);
    expect(animationStep(s, 1 / 60)).toBeCloseTo(1 / 60, 6);
    s.visible = false;
    let steps = 0;
    for (let i = 0; i < 60; i++) if (animationStep(s, 1 / 60) > 0) steps++;
    expect(steps).toBe(12);
    s.visible = true;
    expect(animationStep(s, 1 / 60)).toBeLessThan(0.12);
  });
});
