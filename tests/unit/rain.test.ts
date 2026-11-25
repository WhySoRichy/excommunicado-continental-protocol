import { Scene, Vector3 } from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { docks } from '../../src/levels/data/docks';
import { buildLevelPhysics } from '../../src/levels/levelPhysics';
import { loadRapier, PhysicsWorld, type Rapier } from '../../src/physics/Physics';
import { Rain } from '../../src/render/Rain';

let R: Rapier;
beforeAll(async () => {
  R = await loadRapier();
});

describe('lluvia', () => {
  it('cae hasta el suelo a cielo abierto y se para en los techos: dentro no llueve', () => {
    const physics = new PhysicsWorld(R);
    buildLevelPhysics(docks, physics);
    physics.step();
    const scene = new Scene();
    const rain = new Rain(scene, physics, docks, 1);
    const roof = rain['roof'];
    const { width, data } = roof.image as unknown as { width: number; data: Float32Array };
    const at = (x: number, z: number): number => data[Math.floor(z - docks.bounds.min[2]) * width + Math.floor(x - docks.bounds.min[0])]!;
    const s = docks.spawn.pos;
    expect(at(s[0], s[2]), 'en la entrada, hasta el suelo').toBeCloseTo(0, 1);
    const roofed = docks.boxes.some((b) => b.c[1] > 6 && b.s[0] > 10 && b.s[2] > 10 && at(b.c[0], b.c[2]) > 5);
    expect(roofed, 'sobre la bodega, en el tejado').toBe(true);

    expect(scene.children.length).toBe(2);
    rain.update(new Vector3(1, 2, 3), 800, 0.1);
    expect(rain['uniforms'].uEye.value.toArray()).toEqual([1, 2, 3]);
    rain.dispose();
    expect(scene.children.length).toBe(0);
  });
});
