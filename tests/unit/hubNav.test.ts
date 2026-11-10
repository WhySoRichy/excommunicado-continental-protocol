import { describe, expect, it } from 'vitest';
import { hub } from '../../src/levels/data/hub';
import { practice } from '../../src/levels/data/practice';
import { NavGrid } from '../../src/levels/nav/NavGrid';
import type { LevelData } from '../../src/levels/types';

/**
 * Conectividad de los niveles del hub: todo lo que importa (interactivos, checkpoints
 * y puntos de aparición de las oleadas) está en la misma componente navegable que el spawn.
 * Si un diseñador cierra una puerta sin querer, este test lo detecta antes del navegador.
 */
function checkLevel(level: LevelData): void {
  const g = NavGrid.build(level);
  const s = level.spawn.pos;
  const spawn = g.nearestNode(s[0], s[1], s[2], 2);
  expect(spawn, 'spawn navegable').toBeGreaterThanOrEqual(0);
  const main = g.comp[spawn]!;
  for (const cp of level.checkpoints) {
    const n = g.nearestNode(cp.pos[0], cp.pos[1], cp.pos[2], 2);
    expect(n, `checkpoint ${cp.id}`).toBeGreaterThanOrEqual(0);
    expect(g.comp[n], `checkpoint ${cp.id} conectado`).toBe(main);
  }
  for (const it of level.interactables) {
    // El punto del interactivo puede estar dentro de un mostrador: basta con que haya un nodo
    // de la componente principal dentro de su radio (donde el jugador se para a interactuar).
    const n = g.nearestNode(it.pos[0], it.pos[1], it.pos[2], it.radius, main);
    expect(n, `interactivo ${it.id} alcanzable`).toBeGreaterThanOrEqual(0);
    const d = Math.hypot(g.nodeX[n]! - it.pos[0], g.nodeZ[n]! - it.pos[2]);
    expect(d, `interactivo ${it.id} dentro de su radio`).toBeLessThanOrEqual(it.radius);
  }
  for (const e of level.enemies) {
    const n = g.nearestNode(e.pos[0], e.pos[1], e.pos[2], 1.5);
    expect(n, `enemigo ${e.id}`).toBeGreaterThanOrEqual(0);
    expect(g.comp[n], `enemigo ${e.id} puede llegar al jugador`).toBe(main);
    const path = g.findPath(n, spawn);
    expect(path, `ruta de ${e.id} al vestíbulo`).not.toBeNull();
  }
}

describe('navegación del hub y del campo de práctica', () => {
  it('El Continental: NPCs, placa, ascensor y vestíbulos de las oleadas conectados', () => {
    checkLevel(hub);
  });

  it('Campo de práctica: ascensor de vuelta y enemigos del simulacro conectados', () => {
    checkLevel(practice);
  });

  it('los NPC tienen cuerpo invisible y los interactivos de tipo npc apuntan a él', () => {
    for (const it of hub.interactables.filter((i) => i.kind === 'npc')) {
      const body = hub.boxes.find((b) => b.tag === `npc:${it.id}`);
      expect(body, `cuerpo de ${it.id}`).toBeDefined();
      expect(body?.invisible).toBe(true);
      expect(Math.hypot(body!.c[0] - it.pos[0], body!.c[2] - it.pos[2])).toBeLessThan(0.3);
    }
  });
});
