import type { BoxDef, MaterialId } from './types';

/** Tipo de suelo a efectos de sonido (pisadas). */
export type Surface = 'hard' | 'metal' | 'wood' | 'carpet' | 'gravel';

const SURFACES: Partial<Record<MaterialId, Surface>> = {
  metal: 'metal',
  metalDark: 'metal',
  steelBlue: 'metal',
  gold: 'metal',
  brass: 'metal',
  containerRed: 'metal',
  containerBlue: 'metal',
  containerGreen: 'metal',
  containerYellow: 'metal',
  woodPanel: 'wood',
  woodDark: 'wood',
  crate: 'wood',
  carpetRed: 'carpet',
  carpetGreen: 'carpet',
  velvet: 'carpet',
  leather: 'carpet',
  asphalt: 'gravel',
  roofGravel: 'gravel',
};

/** Superficie sonora de un material; lo que no está en la tabla suena a suelo duro. */
export function surfaceOf(mat: MaterialId): Surface {
  return SURFACES[mat] ?? 'hard';
}

/** Margen por encima y por debajo de los pies para considerar que se pisa una caja (m). */
const ABOVE = 0.12;
const BELOW = 0.45;

/**
 * Superficie bajo los pies: la caja sólida más alta cuya cara superior queda a la altura
 * de los pies y que contiene el punto en planta. Sin candidata (rampas, bordes), suelo duro.
 */
export function surfaceAt(boxes: readonly BoxDef[], x: number, y: number, z: number): Surface {
  let best: BoxDef | null = null;
  let bestTop = -Infinity;
  for (const b of boxes) {
    if (b.collide === false || b.invisible) continue;
    const top = b.c[1] + b.s[1] / 2;
    if (top > y + ABOVE || top < y - BELOW || top <= bestTop) continue;
    let dx = x - b.c[0];
    let dz = z - b.c[2];
    if (b.rotY) {
      const c = Math.cos(b.rotY);
      const s = Math.sin(b.rotY);
      const lx = dx * c - dz * s;
      dz = dx * s + dz * c;
      dx = lx;
    }
    if (Math.abs(dx) > b.s[0] / 2 || Math.abs(dz) > b.s[2] / 2) continue;
    best = b;
    bestTop = top;
  }
  return best ? surfaceOf(best.mat) : 'hard';
}
