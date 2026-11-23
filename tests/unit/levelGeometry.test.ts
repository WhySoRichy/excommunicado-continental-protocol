import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { GeoAccumulator } from '../../src/levels/LevelBuilder';
import { boxToOriented } from '../../src/levels/levelPhysics';

/** Geometría de una caja del nivel: posiciones, normales e índices. */
function build(s: [number, number, number], rotY: number, chamfer: number): { pos: Float32Array; nor: Float32Array; idx: ArrayLike<number> } {
  const acc = new GeoAccumulator();
  acc.appendBox(boxToOriented({ c: [1, 2, 3], s, rotY, mat: 'concrete' }), 2, chamfer);
  const g = acc.build();
  return { pos: g.getAttribute('position').array as Float32Array, nor: g.getAttribute('normal').array as Float32Array, idx: g.index!.array };
}

const v = (a: Float32Array, i: number): Vector3 => new Vector3(a[i * 3], a[i * 3 + 1], a[i * 3 + 2]);

describe('Geometría de las cajas del nivel', () => {
  it.each([
    ['sin chaflán', 0],
    ['con chaflán', 0.03],
  ])('%s: cerrada, con las caras hacia fuera y del tamaño de la caja', (_n, chamfer) => {
    const { pos, nor, idx } = build([2, 1.2, 0.8], 0.4, chamfer);
    const center = new Vector3(1, 2, 3);
    // Cada arista la comparten exactamente dos triángulos (por posición: cada pieza tiene sus propios vértices).
    const key = (i: number): string => {
      const p = v(pos, i);
      return `${p.x.toFixed(4)},${p.y.toFixed(4)},${p.z.toFixed(4)}`;
    };
    const edges = new Map<string, number>();
    let outward = 0;
    let tris = 0;
    for (let t = 0; t < idx.length; t += 3) {
      const [a, b, c] = [idx[t]!, idx[t + 1]!, idx[t + 2]!];
      for (const [x, y] of [
        [a, b],
        [b, c],
        [c, a],
      ] as const) {
        const e = [key(x), key(y)].sort().join('|');
        edges.set(e, (edges.get(e) ?? 0) + 1);
      }
      // El giro del triángulo coincide con su normal y la normal apunta lejos del centro.
      const pa = v(pos, a);
      const n = new Vector3().subVectors(v(pos, b), pa).cross(new Vector3().subVectors(v(pos, c), pa));
      if (n.dot(v(nor, a)) > 0 && v(nor, a).dot(pa.clone().sub(center)) > 0) outward++;
      tris++;
    }
    expect([...edges.values()].every((k) => k === 2)).toBe(true);
    expect(outward).toBe(tris);
    // Mide lo mismo que la caja de colisión.
    const half = [1, 0.6, 0.4];
    let maxLocal = 0;
    for (let i = 0; i < pos.length / 3; i++) maxLocal = Math.max(maxLocal, Math.abs(v(pos, i).y - 2));
    expect(maxLocal).toBeCloseTo(half[1]!, 5);
  });

  it('el chaflán no pasa del 30 % de la cara más estrecha (una barandilla fina no se deforma)', () => {
    const { pos } = build([3, 0.07, 0.07], 0, 0.03);
    // Con 0,07 m de grosor, el chaflán queda en 0,0105: el canto superior plano sigue midiendo 0,049.
    const ys = new Set<string>();
    for (let i = 0; i < pos.length / 3; i++) ys.add(v(pos, i).y.toFixed(4));
    expect([...ys].map(Number).sort((a, b) => a - b)).toEqual([2 - 0.035, 2 - 0.0245, 2 + 0.0245, 2 + 0.035].map((x) => Number(x.toFixed(4))));
  });
});
