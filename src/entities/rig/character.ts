import type { BufferGeometry } from 'three';
import { type BodyPart, trunkParts } from './body';
import { armParts, legParts } from './extremities';
import { merge } from './geometry';
import { headParts } from './head';
import { withDetail } from './loft';
import { BONE } from './skeleton';
import { applySkin, rigid } from './skin';
import type { RigOptions } from './types';

/** Cuánto detalle lleva la malla de cerca y la de lejos. */
const DETAIL = { near: 0.84, far: 0.46 } as const;
export type MeshDetail = keyof typeof DETAIL;

/**
 * La malla entera de un personaje, en reposo y con sus pesos: una sola geometría (y una draw call) por aspecto, que
 * comparten todos los que se ven igual. Hay dos: la de cerca y una ligera para lejos, con la misma silueta.
 */
export function characterGeometry(o: RigOptions, detail: MeshDetail = 'near'): BufferGeometry {
  return withDetail(DETAIL[detail], () => build(o));
}

function build(o: RigOptions): BufferGeometry {
  const head = rigid(BONE.head);
  const parts: BodyPart[] = [
    ...trunkParts(o),
    ...armParts(o, -1),
    ...armParts(o, 1),
    ...legParts(o, -1),
    ...legParts(o, 1),
    ...headParts(o).map((g) => ({ g, skin: head })),
  ];
  return merge(parts.map((p) => applySkin(p.g, p.skin)));
}
