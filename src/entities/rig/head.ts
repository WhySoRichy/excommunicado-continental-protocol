import { type BufferGeometry, Color } from 'three';
import { ears, face, headMesh } from './face';
import { hair } from './hair';
import { headwear } from './headwear';
import { far, loft } from './loft';
import { fromFront, hairline, SKULL, Y0 } from './skull';
import { skinOf } from './surfaces';
import type { Outfit, RigOptions } from './types';

/** La cabeza entera: cráneo y cara, orejas, el pelo y lo que lleve puesto. Todo va al hueso de la cabeza. */
const _d = new Color();

export function headParts(o: RigOptions): BufferGeometry[] {
  const fit: Outfit = o.outfit ?? {};
  const out: BufferGeometry[] = [];
  const masked = fit.mask !== undefined;
  // De lejos, o con la cara tapada, basta un cráneo liso.
  const plain = far() || masked || (o.hair === 'helmet' && fit.visor === true);
  if (plain) out.push(plainHead(o));
  else out.push(headMesh(o), ...face(o));
  // La melena, el casco y la capucha tapan las orejas.
  if (o.hair !== 'helmet' && o.hair !== 'parted' && o.hair !== 'long' && fit.hood === undefined) out.push(...ears(o));
  out.push(...hair(o));
  out.push(...headwear(o));
  return out;
}

/** Cabeza sin rasgos, con la barba y el rapado pintados. */
function plainHead(o: RigOptions): BufferGeometry {
  const c = o.colors;
  return loft(SKULL, skinOf(c.skin), 24, {
    segs: 26,
    tint: (p, a, _y, k) => {
      const f = fromFront(a);
      const v = p.y - Y0;
      if (o.beard && v < 0.075 && f < 1.85) {
        const line = 0.004 + 0.062 * Math.min(1, Math.max(0, (f - 0.42) / 1.05)) ** 1.4;
        k.lerp(_d.set(c.hair), 0.85 * Math.min(1, Math.max(0, (line + 0.006 - v) / 0.02)));
      }
      if (v < -0.03) k.multiplyScalar(0.82);
      if (o.hair === 'bald') k.lerp(_d.set(c.hair), 0.22 * Math.min(1, Math.max(0, (v - hairline(0.146, 0.085, 0.004)(a)) / 0.02)));
    },
  });
}
