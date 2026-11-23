import { Box3, type BufferGeometry, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import type { WeaponModel } from '../../src/entities/rig/types';
import { GRIP, STOCK, weaponGeometry } from '../../src/entities/rig/weapons';

const MODELS: ReadonlyArray<Exclude<WeaponModel, 'none'>> = ['pistol', 'revolver', 'rifle', 'dmr', 'smg', 'shotgun', 'shotgunTactical', 'knife'];
/** Triángulos por arma: cada enemigo lleva la suya y en un tiroteo hay una docena a la vista. */
const MAX_TRIANGLES = 6000;

const geos = new Map<string, BufferGeometry>();
function geo(m: Exclude<WeaponModel, 'none'>): BufferGeometry {
  let g = geos.get(m);
  if (!g) {
    g = weaponGeometry(m, 0xff0000);
    geos.set(m, g);
  }
  return g;
}

function bounds(m: Exclude<WeaponModel, 'none'>): Box3 {
  const box = new Box3();
  const pos = geo(m).getAttribute('position');
  const v = new Vector3();
  for (let i = 0; i < pos.count; i++) box.expandByPoint(v.fromBufferAttribute(pos, i));
  return box;
}

describe('Modelos de las armas', () => {
  it.each(MODELS)('%s: geometría válida, con color, rugosidad y metalicidad por vértice y dentro del presupuesto', (m) => {
    const g = geo(m);
    for (const a of ['position', 'normal', 'uv', 'color', 'pbr']) expect(g.getAttribute(a), a).toBeDefined();
    expect(Array.from(g.getAttribute('position').array).every(Number.isFinite)).toBe(true);
    expect(Array.from(g.getAttribute('normal').array).every(Number.isFinite)).toBe(true);
    expect(Array.from(g.getAttribute('pbr').array).every((v) => v >= 0 && v <= 1)).toBe(true);
    const tris = g.getAttribute('position').count / 3;
    expect(tris, `${m}: ${tris} triángulos`).toBeLessThanOrEqual(MAX_TRIANGLES);
  });

  it.each(MODELS)('%s: el cañón apunta a −Z y la empuñadura está en la mano (el origen)', (m) => {
    const box = bounds(m);
    expect(box.min.z).toBeLessThan(-0.18);
    // La mano está dentro del arma (en la empuñadura o justo encima).
    expect(box.containsPoint(new Vector3(0, -0.01, 0))).toBe(true);
  });

  it.each(MODELS.filter((m) => STOCK[m] > 0))('%s: la cantonera está donde la espera el encare', (m) => {
    expect(Math.abs(bounds(m).max.z - STOCK[m])).toBeLessThan(0.012);
  });

  it.each(MODELS.filter((m) => GRIP[m] !== null))('%s: la mano izquierda agarra el arma (hay arma a menos de 6 cm)', (m) => {
    const [x, y, z] = GRIP[m]!;
    const p = new Vector3(x, y, z);
    const pos = geo(m).getAttribute('position');
    const v = new Vector3();
    let best = Infinity;
    for (let i = 0; i < pos.count; i++) best = Math.min(best, v.fromBufferAttribute(pos, i).distanceTo(p));
    expect(best).toBeLessThan(0.06);
  });
});
