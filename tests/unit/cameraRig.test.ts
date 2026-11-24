import { PerspectiveCamera, Vector3 } from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { Rng } from '../../src/core/rng';
import { CameraRig } from '../../src/game/CameraRig';
import { arena } from '../../src/levels/data/arena';
import { buildLevelPhysics } from '../../src/levels/levelPhysics';
import { loadRapier, PhysicsWorld, type Rapier } from '../../src/physics/Physics';

let R: Rapier;
beforeAll(async () => {
  R = await loadRapier();
});

/** La cámara colocada tras `frames` fotogramas a 60 Hz con el jugador quieto en `feet`. */
function settle(physics: PhysicsWorld, feet: Vector3, yaw: number, pitch: number, frames = 90): CameraRig {
  const rig = new CameraRig(new PerspectiveCamera(), new Rng(1));
  rig.setYawPitch(yaw, pitch);
  for (let i = 0; i < frames; i++) rig.update({ feet, posture: 'stand', aiming: false, sprinting: false, dt: 1 / 60 }, physics);
  return rig;
}

describe('Cámara sobre el hombro', () => {
  it('pegado a una columna con el hombro hacia ella, la cámara no se encoge hasta la cabeza', () => {
    const physics = new PhysicsWorld(R);
    buildLevelPhysics(arena, physics);
    physics.step();
    // A cubierto en la cara oeste de la columna de (4,5, −4,5), mirando en diagonal hacia su esquina: el hombro derecho
    // queda junto a ella. Antes el barrido hacia atrás empezaba dentro de la columna y la cámara quedaba a 0,5 m.
    const rig = settle(physics, new Vector3(3.52, 0, -4.49), -0.97, -0.32);
    expect(rig.distanceToHead).toBeGreaterThan(2);
  });

  it('en campo abierto se coloca a su distancia y con el hombro a la derecha', () => {
    const physics = new PhysicsWorld(R);
    buildLevelPhysics(arena, physics);
    physics.step();
    const rig = settle(physics, new Vector3(10, 0, 5), 0, 0);
    expect(rig.distanceToHead).toBeGreaterThan(3);
    // Mirando al norte (−Z), la derecha es +X.
    expect(rig.position.x).toBeGreaterThan(10.5);
  });

  it('rodeando una esquina a cubierto, no se queda del lado de la pared', () => {
    // Mirando de espaldas a la nueva pared, la cámara acababa dentro de ella y el personaje desaparecía.
    const rig = new CameraRig(new PerspectiveCamera(), new Rng(1));
    const wall = Math.PI / 2;
    rig.setYawPitch(wall + 2.6, 0);
    for (let i = 0; i < 60; i++) rig.clearWall(wall, 1 / 60);
    expect(Math.abs(rig.yaw - wall)).toBeLessThan(1.35);
    // Si ya mira hacia su lado, no la toca.
    rig.setYawPitch(wall - 0.9, 0);
    rig.clearWall(wall, 1 / 60);
    expect(rig.yaw).toBeCloseTo(wall - 0.9, 6);
  });
});
