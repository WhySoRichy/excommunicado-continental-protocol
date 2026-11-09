import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { arena } from '../../src/levels/data/arena';
import { NavGrid } from '../../src/levels/nav/NavGrid';

const nav = (() => {
  const t0 = performance.now();
  const g = NavGrid.build(arena);
  const ms = performance.now() - t0;
  return { g, ms };
})();

function node(x: number, y: number, z: number): number {
  return nav.g.nearestNode(x, y, z, 1.5);
}

describe('NavGrid (arena de pruebas)', () => {
  it('se genera rápido y con suficientes nodos', () => {
    expect(nav.ms).toBeLessThan(1500);
    expect(nav.g.nodeCount).toBeGreaterThan(5000);
  });

  it('todos los checkpoints accesibles de la arena están en la componente principal del spawn', () => {
    const g = nav.g;
    const spawn = node(0, 0, 7);
    expect(spawn).toBeGreaterThanOrEqual(0);
    for (const cp of arena.checkpoints) {
      const n = node(cp.pos[0], cp.pos[1], cp.pos[2]);
      expect(n, cp.id).toBeGreaterThanOrEqual(0);
      expect(g.comp[n], `checkpoint ${cp.id} conectado`).toBe(g.comp[spawn]);
    }
  });

  it('A*: sube la escalera hasta la plataforma de 1,6 m', () => {
    const g = nav.g;
    const path = g.findPath(node(0, 0, 7), node(-17.5, 1.6, -16));
    expect(path).not.toBeNull();
    const maxY = Math.max(...path!.map((n) => g.nodeY[n]!));
    expect(maxY).toBeCloseTo(1.6, 1);
    // Cada salto entre nodos consecutivos es una arista real.
    for (let i = 1; i < path!.length; i++) {
      const a = path![i - 1]!;
      const b = path![i]!;
      expect(Math.hypot(g.nodeX[a]! - g.nodeX[b]!, g.nodeZ[a]! - g.nodeZ[b]!)).toBeLessThan(0.75);
    }
  });

  it('A*: llega a la plataforma de las rampas (por 15°/30°/45°), nunca por la de 55°', () => {
    const g = nav.g;
    const path = g.findPath(node(15, 0, -6), node(15, 1.6, -17.5));
    expect(path).not.toBeNull();
    // Ningún nodo de la ruta sobre la rampa de 55° (x ≈ 19,1..21,5, z −13,9..−15).
    const onSteep = path!.some((n) => g.nodeRamp[n] && g.nodeX[n]! > 19 && g.nodeZ[n]! < -13.8 && g.nodeZ[n]! > -15);
    expect(onSteep).toBe(false);
  });

  it('el túnel bajo (1,3 m) no es navegable de pie: la ruta lo rodea', () => {
    const g = nav.g;
    const path = g.findPath(node(14.5, 0, 11), node(23, 0, 11));
    expect(path).not.toBeNull();
    const throughTunnel = path!.some((n) => g.nodeX[n]! > 16.3 && g.nodeX[n]! < 21.7 && g.nodeZ[n]! > 9.8 && g.nodeZ[n]! < 12.2);
    expect(throughTunnel).toBe(false);
  });

  it('el hueco de 0,5 m entre columnas no es navegable; el de 2 m sí', () => {
    const g = nav.g;
    // Celdas en el centro de cada hueco (z = 12).
    const narrow = g.columnOf(-20.25, 12);
    const wide = g.columnOf(-14.0, 12);
    expect(g.colStart[narrow + 1]! - g.colStart[narrow]!).toBe(0);
    expect(g.colStart[wide + 1]! - g.colStart[wide]!).toBeGreaterThan(0);
  });

  it('las cimas aisladas (caja apilada de 2,4 m) no tienen ruta', () => {
    const g = nav.g;
    const top = node(4.5, 2.4, -4.5);
    if (top >= 0 && Math.abs(g.nodeY[top]! - 2.4) < 0.05) {
      expect(g.findPath(node(0, 0, 7), top)).toBeNull();
    }
  });

  it('suavizado: menos nodos y cada tramo recto es caminable', () => {
    const g = nav.g;
    const path = g.findPath(node(-20, 0, 20), node(20, 0, -6))!;
    expect(path).not.toBeNull();
    const s = g.smooth(path);
    expect(s.length).toBeLessThan(path.length);
    for (let i = 1; i < s.length; i++) expect(g.lineWalkable(s[i - 1]!, s[i]!)).toBe(true);
    const v = new Vector3();
    expect(g.pos(s[s.length - 1]!, v).distanceTo(new Vector3(20, 0, -6))).toBeLessThan(1);
  });

  it('A* es rápido (100 búsquedas largas)', () => {
    const g = nav.g;
    const a = node(-20, 0, 20);
    const b = node(20, 0, -6);
    const t0 = performance.now();
    for (let i = 0; i < 100; i++) g.findPath(a, b);
    const per = (performance.now() - t0) / 100;
    expect(per).toBeLessThan(8);
  });
});
