import { expect, test } from '@playwright/test';
import { collectErrors, openGame, shotPath } from './helpers';

/** Fase 2 de docs/ESCALABILIDAD.md en el juego real: un segundo jugador en la misma partida (todavía sin red). */
test.describe('Fase 2 · varios jugadores', () => {
  test('un segundo jugador se ve, los enemigos lo atacan a él y el daño es suyo', async ({ page }) => {
    const errors = collectErrors(page);
    await openGame(page);
    await page.evaluate(() => window.__EXCOM__!.playArena());
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('playing');
    const objectsBefore = await page.evaluate(() => window.__EXCOM__!.sceneStats().objects);
    const r = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setManual(true);
      q.runDebug('killAll');
      q.step(2, {});
      // El local, lejos; el otro jugador, cerca del enemigo.
      q.teleport(0, 0, 14, 0);
      const id = q.addPlayer(0, 0, 9.5, 0);
      q.spawnEnemy('thug', 0, 0, 4, true);
      const before = q.players();
      q.step(240, {});
      const enemy = q.enemies().find((e) => e.alive)!;
      return { id, targetId: enemy.targetId, before, after: q.players() };
    });
    const hp = (p: { health: number; armor: number }): number => p.health + p.armor;
    expect(r.id).toBe(1);
    expect(r.after).toHaveLength(2);
    expect(r.targetId, 'el enemigo ataca al jugador cercano').toBe(1);
    expect(hp(r.after[1]!), 'que recibe el daño').toBeLessThan(hp(r.before[1]!));
    expect(hp(r.after[0]!), 'y el local, ninguno').toBe(hp(r.before[0]!));
    await page.evaluate(() => window.__EXCOM__!.measureFps(0.3));
    expect(await page.evaluate(() => window.__EXCOM__!.sceneStats().objects), 'su personaje está en la escena').toBeGreaterThan(objectsBefore);
    await page.screenshot({ path: shotPath('fase2-dos-jugadores') });
    expect(errors).toEqual([]);
  });
});
