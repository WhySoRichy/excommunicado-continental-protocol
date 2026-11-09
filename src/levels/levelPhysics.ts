import { Matrix4, Quaternion, Vector3 } from 'three';
import type { PhysicsWorld } from '../physics/Physics';
import type { BoxDef, LevelData, RampDef } from './types';

/** Caja orientada en mundo (forma común de cajas y rampas). */
export interface OrientedBox {
  center: Vector3;
  half: Vector3;
  quat: Quaternion;
}

const UP = new Vector3(0, 1, 0);

export function boxToOriented(b: BoxDef): OrientedBox {
  const quat = new Quaternion();
  if (b.rotY) quat.setFromAxisAngle(UP, b.rotY);
  return {
    center: new Vector3(b.c[0], b.c[1], b.c[2]),
    half: new Vector3(b.s[0] / 2, b.s[1] / 2, b.s[2] / 2),
    quat,
  };
}

/** Losa inclinada cuya cara superior pasa exactamente por from → to. */
export function rampToOriented(r: RampDef): OrientedBox {
  const t = r.thickness ?? 0.3;
  const from = new Vector3(r.from[0], r.from[1], r.from[2]);
  const to = new Vector3(r.to[0], r.to[1], r.to[2]);
  const run = new Vector3().subVectors(to, from);
  const length = run.length();
  const dir = run.clone().normalize();
  // Base ortonormal: x = lateral, y = normal de la rampa, z = dirección de subida.
  const lateral = new Vector3().crossVectors(UP, dir).normalize();
  const normal = new Vector3().crossVectors(dir, lateral).normalize();
  const quat = new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(lateral, normal, dir));
  const center = new Vector3().addVectors(from, to).multiplyScalar(0.5).addScaledVector(normal, -t / 2);
  return { center, half: new Vector3(r.w / 2, t / 2, length / 2), quat };
}

/**
 * Crea TODOS los colliders estáticos del nivel a partir de sus datos (R4: misma fuente
 * que los meshes). Devuelve las cajas orientadas sólidas (cobertura, QA).
 */
export function buildLevelPhysics(data: LevelData, physics: PhysicsWorld): OrientedBox[] {
  const solids: OrientedBox[] = [];
  for (const b of data.boxes) {
    if (b.collide === false) continue;
    const ob = boxToOriented(b);
    physics.addStaticBox(ob.center, ob.half, ob.quat);
    solids.push(ob);
  }
  for (const r of data.ramps) {
    const ob = rampToOriented(r);
    physics.addStaticBox(ob.center, ob.half, ob.quat);
    solids.push(ob);
  }
  return solids;
}
