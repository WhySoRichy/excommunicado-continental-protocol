import type { BufferGeometry, MeshStandardMaterial } from 'three';
import type { RimUniforms } from '../../render/materials';
import { createRigMaterial } from '../../render/rigMaterial';
import { characterGeometry, type MeshDetail } from './character';
import type { RigOptions } from './types';

/** Lo que comparten los personajes iguales: las mallas del cuerpo y los materiales. */

/**
 * Mallas de cuerpo por aspecto y detalle. Se quedan para toda la partida: son pocas (un par por aspecto) y rehacerlas al
 * aparecer un enemigo costaría un tirón.
 */
const bodyGeometries = new Map<string, BufferGeometry>();

export function bodyGeometry(look: string, o: RigOptions, detail: MeshDetail): BufferGeometry {
  const key = `${look}|${detail}`;
  let g = bodyGeometries.get(key);
  if (!g) {
    g = characterGeometry(o, detail);
    bodyGeometries.set(key, g);
  }
  return g;
}
/** Todo lo que cambia la geometría del cuerpo (el material y el rim van aparte). */
export function appearanceKey(o: RigOptions): string {
  const c = o.colors;
  return [
    c.jacket,
    c.shirt,
    c.tie,
    c.pants,
    c.shoes,
    c.skin,
    c.hair,
    c.accent,
    o.hair,
    o.bulk ?? 1,
    o.beard ? 1 : 0,
    JSON.stringify(o.outfit ?? {}),
    o.face ?? 'stern',
  ].join('|');
}

const materialCache = new Map<string, { mat: MeshStandardMaterial; rim: RimUniforms }>();

/** Material por tipo de personaje (el rim es uniform por material). `unique` no se cachea. */
export function rigMaterial(key: string, rimColor: number, rimStrength: number, unique: boolean): { mat: MeshStandardMaterial; rim: RimUniforms } {
  const hit = unique ? undefined : materialCache.get(key);
  if (hit) return hit;
  const entry = createRigMaterial(rimColor, rimStrength);
  entry.mat.name = `rig:${key}`;
  if (!unique) materialCache.set(key, entry);
  return entry;
}
