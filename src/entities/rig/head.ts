import { type BufferGeometry, Color } from 'three';
import { face } from './face';
import { shade } from './geometry';
import { hair } from './hair';
import { headwear } from './headwear';
import { bell01, far, loft } from './loft';
import { ellipsoid } from './shapes';
import { frontK, fromFront, gauss, hairline, SKULL, Y0 } from './skull';
import { skinOf } from './surfaces';
import type { Outfit, RigOptions } from './types';

/**
 * Cabeza: cráneo y cara de una pieza con las cuencas, los pómulos y los labios modelados, nariz, orejas y ojos, y
 * encima el pelo o lo que lleve puesto. Todo va al hueso de la cabeza.
 */
const _c = new Color();
const _d = new Color();

export function headParts(o: RigOptions): BufferGeometry[] {
  const c = o.colors;
  const fit: Outfit = o.outfit ?? {};
  const out: BufferGeometry[] = [];
  const masked = fit.mask !== undefined;
  const beard = !!o.beard;
  const skin = skinOf(c.skin);
  const lip = shade(c.skin, 0.72);
  out.push(
    loft(SKULL, skin, 26, {
      segs: 28,
      mod: (p, a) => {
        const f = frontK(a);
        if (f <= 0.02) return;
        const u = p.x;
        const v = p.y - Y0;
        // Cuencas, arco de las cejas, pómulos, labios, mentón y sienes.
        const au = Math.abs(u);
        p.z += 0.0115 * gauss(au - 0.031, 0.0165) * gauss(v - 0.076, 0.0115) * f;
        p.z -= 0.005 * gauss(v - 0.099, 0.0085) * Math.exp(-((u / 0.052) ** 4)) * f;
        p.z -= 0.004 * gauss(au - 0.046, 0.016) * gauss(v - 0.05, 0.014) * f;
        p.z -= 0.005 * gauss(u, 0.021) * (gauss(v - 0.0155, 0.0058) + 1.1 * gauss(v - 0.0025, 0.0062)) * f;
        p.z += 0.004 * gauss(u, 0.026) * gauss(v - 0.009, 0.0026) * f;
        p.z -= 0.006 * gauss(u, 0.02) * gauss(v + 0.026, 0.012) * f;
        // Raíz de la nariz y surcos hasta las comisuras.
        p.z -= 0.006 * gauss(u, 0.009) * gauss(v - 0.07, 0.022) * f;
        p.z += 0.003 * gauss(au - 0.033, 0.006) * gauss(v - 0.022, 0.016) * f;
        if (v > 0.1 && v < 0.15) p.x *= 1 - 0.035 * bell01((v - 0.125) / 0.03) * (1 - f);
      },
      tint: (p, a, _y, k) => {
        const f = fromFront(a);
        const u = Math.abs(p.x);
        const v = p.y - Y0;
        if (f < 1) {
          // Labios, mejillas y la sombra de las cuencas.
          const l = gauss(p.x, 0.022) * (gauss(v - 0.0145, 0.0055) + gauss(v - 0.003, 0.0055));
          k.lerp(_d.set(lip).lerp(_c.set(0x9a4b42), 0.35), Math.min(0.75, l * 0.8));
          k.lerp(_d.set(0x7a3328), 0.5 * gauss(p.x, 0.02) * gauss(v - 0.0088, 0.0022));
          k.lerp(_d.set(0xb0584a), 0.12 * gauss(u - 0.045, 0.02) * gauss(v - 0.04, 0.02));
          k.lerp(_d.set(shade(c.skin, 0.55)), 0.35 * gauss(u - 0.031, 0.018) * gauss(v - 0.078, 0.011));
        }
        if (beard && v < 0.075 && f < 1.85) {
          // Barba corta: de la patilla baja por la mejilla hasta la comisura, cubre la mandíbula y sube al bigote.
          const line = 0.004 + 0.062 * Math.min(1, Math.max(0, (f - 0.42) / 1.05)) ** 1.4;
          const jaw = Math.min(1, Math.max(0, (line + 0.006 - v) / 0.02));
          const mouth = gauss(p.x, 0.019) * gauss(v - 0.0085, 0.0085);
          const must = gauss(p.x, 0.026) * gauss(v - 0.0235, 0.0048);
          k.lerp(_d.set(c.hair), Math.min(0.9, Math.max(jaw * (1 - mouth), must * 0.85) * 0.9));
        } else if (!masked && v < 0.03 && f < 1.6) {
          // Sombra de barba.
          k.lerp(_d.set(c.hair), 0.12 * Math.min(1, (0.03 - v) / 0.02));
        }
        // Debajo de la mandíbula, sombra de contacto; rapado, la sombra del pelo por encima de su nacimiento.
        if (v < -0.03) k.multiplyScalar(0.82);
        if (o.hair === 'bald') k.lerp(_d.set(c.hair), 0.22 * Math.min(1, Math.max(0, (v - hairline(0.146, 0.085, 0.004)(a)) / 0.02)));
      },
    }),
  );
  if (!masked && !far()) out.push(...face(o));
  // Orejas (la melena las tapa).
  if (o.hair !== 'helmet' && o.hair !== 'parted' && o.hair !== 'long' && fit.hood === undefined) {
    for (const s of [-1, 1] as const) {
      out.push(ellipsoid(0.0095, 0.029, 0.018, skin, s * 0.0765, Y0 + 0.066, 0.014, { segs: 8, rows: 7 }));
      out.push(ellipsoid(0.004, 0.018, 0.0105, skinOf(shade(c.skin, 0.7)), s * 0.0835, Y0 + 0.068, 0.01, { segs: 7, rows: 5 }));
    }
  }
  out.push(...hair(o));
  out.push(...headwear(o));
  return out;
}
