import { NoColorSpace, RepeatWrapping, SRGBColorSpace, type Texture, TextureLoader } from 'three';
import { getMaxAnisotropy } from './textures';

/**
 * Texturas fotoescaneadas de los escenarios (Poly Haven, CC0; ver docs/CREDITOS.md). Cada juego tiene color, relieve
 * (normal, convención OpenGL) y «arm»: oclusión, rugosidad y metal en los canales rojo, verde y azul, como los lee
 * three.js. Las genera `npm run textures` en `public/textures/<id>/`.
 */
export const PBR_SETS = [
  'concrete_floor_worn_001',
  'plastered_wall',
  'marble_01',
  'rosewood_veneer1',
  'dark_wood',
  'velour_velvet',
  'brown_leather',
  'metal_plate',
  'metal_plate_02',
  'blue_metal_plate',
  'container_side',
  'asphalt_02',
  'granite_tile',
  'red_brick_03',
  'tarred_gravel',
  'plywood',
] as const;

export type PbrSetId = (typeof PBR_SETS)[number];

export interface PbrMaps {
  color: Texture;
  normal: Texture;
  arm: Texture;
}

const loaded = new Map<PbrSetId, PbrMaps>();
const pending = new Map<PbrSetId, Promise<void>>();
const listeners: Array<(id: PbrSetId) => void> = [];
const loader = new TextureLoader();

function url(id: PbrSetId, map: string): string {
  // El juego se sirve en un subdirectorio en GitHub Pages: la base la pone Vite.
  return `${import.meta.env.BASE_URL}textures/${id}/${map}.webp`;
}

async function loadMap(id: PbrSetId, map: 'color' | 'normal' | 'arm'): Promise<Texture> {
  const t = await loader.loadAsync(url(id, map));
  t.wrapS = RepeatWrapping;
  t.wrapT = RepeatWrapping;
  t.anisotropy = getMaxAnisotropy();
  // Solo el color va en sRGB: el relieve y la rugosidad son datos.
  t.colorSpace = map === 'color' ? SRGBColorSpace : NoColorSpace;
  t.name = `pbr:${id}:${map}`;
  return t;
}

/** Los mapas de un juego si ya se descargaron (si no, el material usa su textura procedural). */
export function pbrMaps(id: PbrSetId): PbrMaps | null {
  return loaded.get(id) ?? null;
}

/** Avisa cada vez que termina de descargarse un juego (los materiales ya creados lo aplican entonces). */
export function onPbrLoaded(fn: (id: PbrSetId) => void): void {
  listeners.push(fn);
}

/**
 * Descarga los juegos que falten. Nunca falla: si una textura no llega (sin conexión), el material se queda con la
 * procedural y el nivel se juega igual.
 */
export function preloadPbr(ids: Iterable<PbrSetId>): Promise<void> {
  const jobs: Array<Promise<void>> = [];
  for (const id of new Set(ids)) {
    if (loaded.has(id)) continue;
    let job = pending.get(id);
    if (!job) {
      job = Promise.all([loadMap(id, 'color'), loadMap(id, 'normal'), loadMap(id, 'arm')])
        .then(([color, normal, arm]) => {
          loaded.set(id, { color, normal, arm });
          for (const fn of listeners) fn(id);
        })
        .catch((err: unknown) => {
          console.warn(`[texturas] ${id}: se usa la procedural`, err);
        })
        .finally(() => pending.delete(id));
      pending.set(id, job);
    }
    jobs.push(job);
  }
  return Promise.all(jobs).then(() => undefined);
}
