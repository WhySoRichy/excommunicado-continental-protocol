import { Vector3 } from 'three';
import { QueryGroups } from '../physics/Physics';
import type { CameraRig } from './CameraRig';
import type { LevelSession } from './LevelSession';

/**
 * Contadores de lo que nunca debería pasar. El juego los comprueba en cada paso con `?qa=1` y las
 * e2e exigen que queden a cero.
 */
export interface QaInvariants {
  steps: number;
  penetrations: number;
  cameraInside: number;
  cameraOccluded: number;
  outOfBounds: number;
  lastViolation: string;
}

const _head = new Vector3();

/** Movimiento: el jugador nunca atraviesa la geometría ni sale de los límites del nivel. */
export function checkPlayerInvariants(s: LevelSession, inv: QaInvariants): void {
  inv.steps++;
  const p = s.player;
  if (p.penetration()) {
    inv.penetrations++;
    inv.lastViolation = `penetración en ${p.feet.x.toFixed(2)},${p.feet.y.toFixed(2)},${p.feet.z.toFixed(2)} (${p.state})`;
  }
  const b = s.data.bounds;
  const f = p.feet;
  if (f.x < b.min[0] - 0.5 || f.x > b.max[0] + 0.5 || f.z < b.min[2] - 0.5 || f.z > b.max[2] + 0.5 || f.y > b.max[1] + 2) {
    inv.outOfBounds++;
    inv.lastViolation = `fuera de límites en ${f.x.toFixed(2)},${f.y.toFixed(2)},${f.z.toFixed(2)}`;
  }
}

/** Checklist ítem 7: ningún estado de combate inconsistente tras cualquier secuencia de acciones. Devuelve cuántos encontró. */
export function checkCombatInvariants(s: LevelSession, inv: QaInvariants): number {
  const c = s.combat;
  const p = s.player;
  let found = 0;
  for (const w of c.weapons.values()) {
    const bad =
      w.mag < 0 ||
      w.mag > w.def.mag ||
      w.reserve < 0 ||
      Number.isNaN(w.reserve) ||
      (w.reloading && !w.isGun) ||
      (w.reloading && w.reloadT > w.reloadDur + 0.05);
    if (bad) {
      found++;
      inv.lastViolation = `arma ${w.def.id} inconsistente: mag=${w.mag} reserva=${w.reserve} recargando=${w.reloading}`;
    }
  }
  if (c.takedown && p.state !== 'locked' && !c.dead) {
    found++;
    inv.lastViolation = 'takedown activo sin jugador bloqueado';
  }
  if (!c.takedown && p.state === 'locked') {
    found++;
    inv.lastViolation = 'jugador bloqueado sin takedown';
  }
  if (c.dead !== (p.state === 'dead')) {
    found++;
    inv.lastViolation = `muerte desincronizada: combate=${c.dead} jugador=${p.state}`;
  }
  if (c.vitals.health < 0 || c.vitals.armor < 0 || c.vitals.health > c.vitals.maxHealth) {
    found++;
    inv.lastViolation = 'vitales fuera de rango';
  }
  return found;
}

/** Cámara: nunca dentro de la geometría ni con el jugador tapado. */
export function checkCameraInvariants(s: LevelSession, camera: CameraRig, inv: QaInvariants): void {
  const cam = camera.position;
  if (s.physics.overlapsBall(cam, 0.1, QueryGroups.STATIC)) {
    inv.cameraInside++;
    inv.lastViolation = `cámara dentro de geometría en ${cam.x.toFixed(2)},${cam.y.toFixed(2)},${cam.z.toFixed(2)}`;
  }
  _head.copy(camera.pivot);
  if (!s.physics.lineOfSight(cam, _head, QueryGroups.STATIC)) {
    inv.cameraOccluded++;
    inv.lastViolation = `jugador tapado desde la cámara en ${cam.x.toFixed(2)},${cam.y.toFixed(2)},${cam.z.toFixed(2)}`;
  }
}
