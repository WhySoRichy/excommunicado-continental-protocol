import { describe, expect, it } from 'vitest';
import { docks } from '../../src/levels/data/docks';
import { nightclub } from '../../src/levels/data/nightclub';
import { rooftop } from '../../src/levels/data/rooftop';
import { NavGrid } from '../../src/levels/nav/NavGrid';
import type { LevelData, Vec3 } from '../../src/levels/types';

/** Los contratos: tamaño, varios caminos a cada sitio, alturas conectadas, enemigos por etapas y sitio para cuatro. */
interface Case {
  level: LevelData;
  /** Superficie que se podía pisar antes de rehacerlos (m²): la nueva, al menos el doble. */
  before: number;
  /** Alturas a las que se llega andando. */
  heights: number[];
  /** Tramos con otra ruta aunque se corte la entrada principal: de, a, por dónde se corta y su radio. */
  flanks: Array<{ what: string; from: Vec3; to: Vec3; cut: Vec3; r: number }>;
}

const cases: Case[] = [
  {
    level: nightclub,
    before: 786,
    heights: [0, 3.2],
    flanks: [
      { what: 'la pista sin pasar por la puerta', from: [0, 0, 38], to: [0, 0, 10], cut: [0, 0, 26.4], r: 2 },
      { what: 'el despacho sin pasar por el vestíbulo', from: [0, 0, 10], to: [-23, 0, 22], cut: [-7.25, 0, 20.6], r: 1.6 },
      { what: 'el VIP sin la escalera oeste', from: [0, 0, 10], to: [0, 3.2, -8], cut: [-16, 0, 13], r: 2 },
      { what: 'el VIP sin la escalera este', from: [0, 0, 10], to: [0, 3.2, -8], cut: [16, 0, 13], r: 2 },
      { what: 'el muelle de carga sin la sala de Vance', from: [0, 3.2, -8], to: [24, 0, -18], cut: [0, 3.2, -12.2], r: 2 },
    ],
  },
  {
    level: docks,
    before: 3278,
    heights: [0, 2.6, 3.2, 3.84],
    flanks: [
      { what: 'la aduana sin la puerta', from: [0, 0, 31], to: [35, 3.2, -7], cut: [25.75, 0, 4.5], r: 2 },
      { what: 'la planta alta sin la escalera de dentro', from: [33, 0, 10], to: [35, 3.2, -7], cut: [40.6, 0, 4], r: 2 },
      { what: 'la bodega sin el portón este', from: [0, 0, 5], to: [-19, 0, -46], cut: [-3, 0, -16.5], r: 3 },
      { what: 'la bodega sin ningún portón', from: [0, 0, 5], to: [-19, 0, -46], cut: [-15, 0, -16.5], r: 14.6 },
      { what: 'la pasarela sin la escalera del puente', from: [-3, 0, -19], to: [-36, 3.84, -56], cut: [3, 0, -37], r: 2 },
      { what: 'el embarcadero sin el portón de la explanada', from: [-3, 0, -19], to: [14, 0, -42], cut: [14, 0, -38.2], r: 3 },
    ],
  },
  {
    level: rooftop,
    before: 2527,
    heights: [0, 3.84, 7.68],
    flanks: [
      { what: 'las oficinas sin la puerta oeste', from: [0, 0, 22], to: [23, 0, -7], cut: [13, 0, -0.2], r: 2 },
      { what: 'la azotea sin la escalera oeste', from: [0, 0, 22], to: [-13, 3.84, -12], cut: [-30, 0, 3.6], r: 2 },
      { what: 'la azotea sin la escalera de las oficinas', from: [0, 0, 22], to: [-13, 3.84, -12], cut: [36.4, 0, -13.6], r: 2 },
      { what: 'el helipuerto sin la rampa', from: [-13, 3.84, -12], to: [10, 7.68, -28], cut: [-30, 3.84, -44], r: 2 },
      { what: 'el helipuerto sin la escalera', from: [-13, 3.84, -12], to: [10, 7.68, -28], cut: [16, 3.84, -19.6], r: 2 },
    ],
  },
];

function reach(g: NavGrid, from: number, to: number, banned: (n: number) => boolean): boolean {
  const seen = new Uint8Array(g.comp.length);
  const stack = [from];
  seen[from] = 1;
  while (stack.length) {
    const a = stack.pop()!;
    if (a === to) return true;
    for (let d = 0; d < 8; d++) {
      const b = g.adj[a * 8 + d]!;
      if (b < 0 || seen[b] || banned(b)) continue;
      seen[b] = 1;
      stack.push(b);
    }
  }
  return false;
}

describe.each(cases.map((c) => [c.level.id, c] as const))('contrato %s', (_id, c) => {
  const g = NavGrid.build(c.level);
  const s = c.level.spawn.pos;
  const main = g.comp[g.nearestNode(s[0], s[1], s[2], 3)]!;

  it('tiene al menos el doble de sitio que antes, en varias alturas a las que se llega andando', () => {
    let nodes = 0;
    const at = new Map(c.heights.map((h) => [h, 0]));
    for (let i = 0; i < g.comp.length; i++) {
      if (g.comp[i] !== main) continue;
      nodes++;
      for (const h of c.heights) if (Math.abs(g.nodeY[i]! - h) < 0.05) at.set(h, at.get(h)! + 1);
    }
    expect(nodes * g.opts.cell ** 2).toBeGreaterThan(2 * c.before);
    for (const [h, n] of at) expect(n, `a ${h} m`).toBeGreaterThan(60);
  });

  it.each(c.flanks.map((f) => [f.what, f] as const))('se llega por otro lado: %s', (_what, f) => {
    const node = (p: Vec3): number => g.nearestNode(p[0], p[1], p[2], 2, main);
    const near = (n: number): boolean => Math.hypot(g.nodeX[n]! - f.cut[0], g.nodeZ[n]! - f.cut[2]) < f.r && Math.abs(g.nodeY[n]! - f.cut[1]) < 1;
    let cut = 0;
    for (let i = 0; i < g.comp.length; i++) if (g.comp[i] === main && near(i)) cut++;
    expect(cut, 'el corte existe').toBeGreaterThan(4);
    expect(reach(g, node(f.from), node(f.to), near)).toBe(true);
  });

  it('caben cuatro en la salida y en cada punto de control', () => {
    for (const p of [c.level.spawn, ...c.level.checkpoints]) {
      let room = 0;
      for (let i = 0; i < g.comp.length; i++) {
        if (g.comp[i] !== main || Math.abs(g.nodeY[i]! - p.pos[1]) > 0.4) continue;
        if (Math.hypot(g.nodeX[i]! - p.pos[0], g.nodeZ[i]! - p.pos[2]) < 2.5) room++;
      }
      expect(room * g.opts.cell ** 2, `junto a ${p.pos.join(', ')}`).toBeGreaterThan(8);
    }
  });

  it('los enemigos llegan por etapas: ni todos de golpe ni un paseo', () => {
    const { enemies, mission } = c.level;
    const initial = enemies.filter((e) => !e.spawnOn).length;
    expect(initial).toBeGreaterThanOrEqual(8);
    expect(initial).toBeLessThanOrEqual(14);
    expect(enemies.length).toBeGreaterThanOrEqual(26);
    const groups = new Map<string, number>();
    for (const e of enemies) if (e.spawnOn) groups.set(e.spawnOn, (groups.get(e.spawnOn) ?? 0) + 1);
    const events = new Set(['alarm', 'boss-phase-1', 'boss-phase-2']);
    for (const o of mission!.objectives) for (const e of [o.onStart, o.onComplete]) if (e) events.add(e);
    for (const [event, n] of groups) {
      expect(events.has(event), `nadie dispara la etapa ${event}`).toBe(true);
      expect(n, event).toBeLessThanOrEqual(7);
    }
    expect(mission!.objectives.length).toBeGreaterThanOrEqual(6);
  });

  it('nadie aparece a la vista de quien empieza ni pegado a un punto de control', () => {
    for (const e of c.level.enemies) {
      if (e.spawnOn) continue;
      expect(Math.hypot(e.pos[0] - s[0], e.pos[2] - s[2]), `${e.id} junto a la salida`).toBeGreaterThan(9);
    }
  });
});
