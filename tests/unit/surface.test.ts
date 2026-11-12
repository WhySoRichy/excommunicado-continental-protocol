import { describe, expect, it } from 'vitest';
import { surfaceAt, surfaceOf } from '../../src/levels/surface';
import type { BoxDef } from '../../src/levels/types';

const floor: BoxDef = { c: [0, -0.25, 0], s: [20, 0.5, 20], mat: 'concrete' };
const rug: BoxDef = { c: [3, 0.01, 0], s: [4, 0.02, 2], mat: 'carpetRed' };
const container: BoxDef = { c: [-5, 1.3, 0], s: [2.4, 2.6, 6], mat: 'containerBlue' };
const plank: BoxDef = { c: [0, 0.05, 8], s: [6, 0.1, 1], mat: 'woodDark', rotY: Math.PI / 2 };
const boxes = [floor, rug, container, plank];

describe('superficie bajo los pies', () => {
  it('clasifica los materiales', () => {
    expect(surfaceOf('marbleChecker')).toBe('hard');
    expect(surfaceOf('metalDark')).toBe('metal');
    expect(surfaceOf('asphalt')).toBe('gravel');
  });

  it('elige la caja más alta a la altura de los pies', () => {
    expect(surfaceAt(boxes, 0, 0, 0)).toBe('hard');
    expect(surfaceAt(boxes, 3, 0.02, 0)).toBe('carpet');
    expect(surfaceAt(boxes, 6, 0, 0)).toBe('hard');
  });

  it('distingue estar encima de un contenedor de estar a su lado', () => {
    expect(surfaceAt(boxes, -5, 2.6, 0)).toBe('metal');
    expect(surfaceAt(boxes, -5, 0, 5)).toBe('hard');
  });

  it('respeta la rotación de la caja', () => {
    expect(surfaceAt(boxes, 0, 0.1, 10.5)).toBe('wood');
    expect(surfaceAt(boxes, 2.5, 0.1, 8)).toBe('hard');
  });

  it('sin nada debajo devuelve suelo duro', () => {
    expect(surfaceAt(boxes, 50, 0, 50)).toBe('hard');
  });
});
