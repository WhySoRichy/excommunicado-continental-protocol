import { type BufferGeometry, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { CharacterRig, idlePose, PLAYER_LOOK, type RigOptions } from '../../src/entities/CharacterRig';
import { CIVILIAN_LOOKS } from '../../src/entities/CivilianView';
import { NPC_LOOKS } from '../../src/entities/Npc';
import { ENEMY_TYPES } from '../../src/entities/ai/enemyTypes';
import { characterGeometry } from '../../src/entities/rig/character';
import { loft } from '../../src/entities/rig/loft';
import { ellipsoid, Shell, softBox, tubePath } from '../../src/entities/rig/shapes';
import { BONE } from '../../src/entities/rig/skin';

const base = { rimColor: 0, rimStrength: 0, weapon: 'none' } as const;
const ENEMIES: Record<string, RigOptions> = Object.fromEntries(
  Object.values(ENEMY_TYPES)
    .filter((d) => !d.body)
    .map((d) => [d.type, { ...base, colors: d.colors, hair: d.hair, beard: d.beard, bulk: d.bulk, outfit: d.outfit }]),
);
const LOOKS: Record<string, RigOptions> = {
  huesped: PLAYER_LOOK,
  ...ENEMIES,
  ...Object.fromEntries(Object.entries(NPC_LOOKS).map(([id, l]) => [id, { ...base, ...l }])),
  ...Object.fromEntries(CIVILIAN_LOOKS.map((l, i) => [`civil ${i}`, { ...base, ...l }])),
};

const a = new Vector3();
const b = new Vector3();
const c = new Vector3();
const n = new Vector3();

/** Fracción de triángulos cuya cara mira al lado contrario que sus normales (se verían negros o huecos). */
function inverted(g: BufferGeometry): number {
  const pos = g.getAttribute('position');
  const nor = g.getAttribute('normal');
  const idx = g.getIndex()!;
  let bad = 0;
  let total = 0;
  for (let i = 0; i < idx.count; i += 3) {
    a.fromBufferAttribute(pos, idx.getX(i));
    b.fromBufferAttribute(pos, idx.getX(i + 1));
    c.fromBufferAttribute(pos, idx.getX(i + 2));
    const face = b.sub(a).cross(c.sub(a));
    if (face.length() < 2e-8) continue;
    n.set(0, 0, 0);
    for (let k = 0; k < 3; k++) n.add(c.fromBufferAttribute(nor, idx.getX(i + k)));
    total++;
    if (face.dot(n) < 0) bad++;
  }
  return bad / total;
}

/** Silueta: cuánto sobresale a los lados y hacia delante y detrás, por franjas de altura. */
function silhouette(g: BufferGeometry): number[] {
  const pos = g.getAttribute('position');
  const idx = g.getIndex()!;
  const bands = 16;
  const out = Array.from({ length: bands * 2 }, () => 0);
  // Por las aristas y no solo por los vértices: la malla lejana tiene pocas filas.
  for (let i = 0; i < idx.count; i += 3) {
    for (let k = 0; k < 3; k++) {
      a.fromBufferAttribute(pos, idx.getX(i + k));
      b.fromBufferAttribute(pos, idx.getX(i + ((k + 1) % 3)));
      for (let t = 0; t < 1; t += 0.25) {
        c.lerpVectors(a, b, t);
        const band = Math.min(bands - 1, Math.max(0, Math.floor((c.y / 1.9) * bands)));
        out[band] = Math.max(out[band]!, Math.abs(c.x));
        out[bands + band] = Math.max(out[bands + band]!, Math.abs(c.z));
      }
    }
  }
  return out;
}

describe('piezas de los personajes', () => {
  it('todas las formas tienen las caras hacia fuera y sus cinco atributos', () => {
    const s = { c: 0x808080, r: 0.5, m: 0, w: 1 };
    const rings = [
      { y: 0, rx: 0.2, rz: 0.1 },
      { y: 0.5, rx: 0.25, rz: 0.15, rb: 0.1, e: 3 },
      { y: 1, rx: 0.1, rz: 0.1 },
    ];
    const shell = new Shell(rings);
    const patch = (x0: number, x1: number, back = false): BufferGeometry =>
      shell.patch(
        0.2,
        0.8,
        () => x0,
        () => x1,
        0.01,
        s,
        { back },
      );
    const pieces: Record<string, BufferGeometry> = {
      'tubo que sube': loft(rings, s, 8, { capStart: true, capEnd: true }),
      'tubo que baja': loft(rings.slice().reverse(), s, 8, { capStart: true, capEnd: true }),
      recorrido: tubePath(
        [
          { x: 0, y: 0, z: 0, a: 0.05 },
          { x: 0.2, y: 0.3, z: 0, a: 0.06 },
          { x: 0.1, y: 0.6, z: -0.2, a: 0.03 },
        ],
        s,
        { steps: 3, round: true },
      ),
      elipsoide: ellipsoid(0.1, 0.2, 0.05, s),
      'media cáscara': ellipsoid(0.1, 0.2, 0.05, s, 0, 0, 0, { cut: 0.2 }),
      bloque: softBox(0.1, 0.2, 0.05, s, { x: 1, y: 1, z: 1 }, 0.01, { x: 0.3, y: 0.4, z: 0.5 }),
      'parche delante': patch(-0.1, 0.1),
      'parche detrás': patch(-0.1, 0.1, true),
      'parche del revés': patch(-0.02, -0.12),
    };
    for (const [name, g] of Object.entries(pieces)) {
      for (const at of ['position', 'normal', 'color', 'pbr', 'uv']) expect(g.getAttribute(at), `${name}: ${at}`).toBeDefined();
      expect(inverted(g), `${name}: caras del revés`).toBeLessThan(0.01);
    }
  });

  it('un parche queda pegado a la superficie y por fuera de ella', () => {
    const shell = new Shell([
      { y: 0, rx: 0.2, rz: 0.12 },
      { y: 1, rx: 0.2, rz: 0.12 },
    ]);
    for (const x of [0, 0.08, -0.15]) {
      expect(shell.z(x, 0.5), 'delante, −Z').toBeLessThan(0);
      expect(shell.z(x, 0.5, 0.02)).toBeCloseTo(shell.z(x, 0.5) - 0.02, 6);
      expect(shell.z(x, 0.5, 0.02, true), 'detrás, +Z').toBeGreaterThan(0);
    }
  });
});

describe('malla de los personajes', () => {
  it.each(Object.entries(LOOKS))('%s: medidas, pesos, presupuesto y caras hacia fuera', (_id, o) => {
    const near = characterGeometry(o);
    const low = characterGeometry(o, 'far');
    const tris = near.getIndex()!.count / 3;
    const lowTris = low.getIndex()!.count / 3;
    expect(tris, 'de cerca').toBeLessThan(13_000);
    expect(lowTris, 'de lejos').toBeLessThan(5_000);
    expect(lowTris).toBeLessThan(tris * 0.45);
    for (const m of [near, low]) {
      expect(inverted(m), 'caras del revés').toBeLessThan(0.02);
      const pos = m.getAttribute('position');
      const si = m.getAttribute('skinIndex');
      const sw = m.getAttribute('skinWeight');
      let minY = 9;
      let maxY = -9;
      let wrong = 0;
      for (let i = 0; i < pos.count; i++) {
        minY = Math.min(minY, pos.getY(i));
        maxY = Math.max(maxY, pos.getY(i));
        const sum = sw.getX(i) + sw.getY(i) + sw.getZ(i) + sw.getW(i);
        const finite = Number.isFinite(pos.getX(i) + pos.getY(i) + pos.getZ(i));
        if (!finite || Math.abs(sum - 1) > 1e-5 || Math.max(si.getX(i), si.getY(i)) > BONE.footR) wrong++;
      }
      expect(wrong, 'vértices sin posición o con pesos que no suman 1').toBe(0);
      // Las suelas, donde las espera la animación, y la altura de siempre (la de su cápsula).
      expect(minY).toBeGreaterThan(0);
      expect(minY).toBeLessThan(0.03);
      expect(maxY).toBeGreaterThan(1.83);
      expect(maxY).toBeLessThan(1.92);
    }
  });

  it('cada tipo de enemigo se reconoce por su silueta, de cerca y de lejos', () => {
    for (const detail of ['near', 'far'] as const) {
      // Al antidisturbios lo distingue el escudo, que no forma parte de su malla.
      const shapes = Object.entries(ENEMIES)
        .filter(([id]) => id !== 'shield')
        .map(([id, o]) => ({ id, s: silhouette(characterGeometry(o, detail)) }));
      for (let i = 0; i < shapes.length; i++) {
        for (let j = i + 1; j < shapes.length; j++) {
          const p = shapes[i]!;
          const q = shapes[j]!;
          const diff = Math.max(...p.s.map((v, k) => Math.abs(v - q.s[k]!)));
          expect(diff, `${p.id} y ${q.id}`).toBeGreaterThan(0.03);
        }
      }
    }
  });

  it('la malla lejana conserva la silueta de la cercana', () => {
    for (const [id, o] of Object.entries(LOOKS)) {
      const near = silhouette(characterGeometry(o));
      const low = silhouette(characterGeometry(o, 'far'));
      near.forEach((v, k) => expect(Math.abs(v - low[k]!), `${id}, franja ${k}`).toBeLessThan(0.045));
    }
  });
});

describe('detalle según la distancia', () => {
  it('lejos usa la malla ligera y en la frontera no va y viene', () => {
    const rig = new CharacterRig('prueba:detalle', { ...PLAYER_LOOK, lod: true });
    rig.update(idlePose(), 1 / 60);
    const mesh = rig['skin']!;
    const view = { eye: new Vector3(), limit: 10 };
    const tris = (d: number): number => {
      view.eye.set(0, 0, d);
      rig.updateDetail(view);
      return mesh.geometry.getIndex()!.count / 3;
    };
    const near = tris(5);
    expect(tris(10.5), 'aún no').toBe(near);
    const low = tris(11.5);
    expect(low).toBeLessThan(near / 2);
    expect(tris(9.5), 'todavía lejos').toBe(low);
    expect(tris(8.5)).toBe(near);
    // Sin malla lejana (el jugador, los del hotel) siempre es la de cerca.
    const solo = new CharacterRig('prueba:sin', { ...PLAYER_LOOK });
    view.eye.set(0, 0, 100);
    solo.updateDetail(view);
    expect(solo['skin']!.geometry.getIndex()!.count / 3).toBe(near);
    rig.dispose();
    solo.dispose();
  });
});
