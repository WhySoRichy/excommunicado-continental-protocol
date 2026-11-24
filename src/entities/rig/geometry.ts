import { type BufferGeometry, Color, Float32BufferAttribute } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const tmpColor = new Color();

/** Pinta toda la geometría de un color (atributo por vértice). */
export function paint(g: BufferGeometry, color: number): BufferGeometry {
  tmpColor.set(color);
  const n = g.getAttribute('position').count;
  const cols = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    cols[i * 3] = tmpColor.r;
    cols[i * 3 + 1] = tmpColor.g;
    cols[i * 3 + 2] = tmpColor.b;
  }
  g.setAttribute('color', new Float32BufferAttribute(cols, 3));
  return g;
}

/** Color de contraste para ribetes: aclara los tonos muy oscuros y oscurece el resto. */
export function trim(color: number): number {
  tmpColor.set(color);
  const lum = 0.2126 * tmpColor.r + 0.7152 * tmpColor.g + 0.0722 * tmpColor.b;
  return lum < 0.05 ? tmpColor.multiplyScalar(1.9).addScalar(0.012).getHex() : tmpColor.multiplyScalar(0.68).getHex();
}

/** Mismo color, más oscuro o más claro. */
export function shade(color: number, k: number): number {
  return tmpColor.set(color).multiplyScalar(k).getHex();
}

export function merge(parts: BufferGeometry[]): BufferGeometry {
  const g = mergeGeometries(parts, false);
  if (!g) throw new Error('CharacterRig: no se pudo fusionar la geometría');
  for (const p of parts) p.dispose();
  g.computeBoundingSphere();
  return g;
}

/** Geometría compartida entre personajes de igual aspecto, con recuento de usos: se libera con el último. */
export interface SharedGeometry {
  geo: BufferGeometry;
  users: number;
}

export function acquire(cache: Map<string, SharedGeometry>, key: string, build: () => BufferGeometry): BufferGeometry {
  let e = cache.get(key);
  if (!e) {
    e = { geo: build(), users: 0 };
    cache.set(key, e);
  }
  e.users++;
  return e.geo;
}

export function release(cache: Map<string, SharedGeometry>, key: string): void {
  const e = cache.get(key);
  if (!e || --e.users > 0) return;
  e.geo.dispose();
  cache.delete(key);
}
