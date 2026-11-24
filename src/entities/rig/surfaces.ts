import type { Surface } from './loft';

/** Las telas y materiales con los que se hacen los personajes. */
export const cloth = (c: number, w = 1, r = 0.88): Surface => ({ c, r, m: 0, w });
export const silk = (c: number): Surface => ({ c, r: 0.46, m: 0, w: 0.35 });
export const leather = (c: number, r = 0.46): Surface => ({ c, r, m: 0, w: 0.12 });
export const skinOf = (c: number): Surface => ({ c, r: 0.56, m: 0, w: 0 });
export const hairOf = (c: number): Surface => ({ c, r: 0.6, m: 0, w: 0 });
export const steel = (c: number, r = 0.34): Surface => ({ c, r, m: 0.85, w: 0 });
export const plastic = (c: number, r = 0.55): Surface => ({ c, r, m: 0, w: 0 });
