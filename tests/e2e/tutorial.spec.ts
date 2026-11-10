import { expect, type Page, test } from '@playwright/test';
import { collectErrors, openGame, shotPath } from './helpers';

/**
 * Fase 5 · Tutorial jugable del campo de práctica: once pasos validados con entradas
 * reales (virtuales de QA, por el mismo camino que el teclado), con la tecla asignada
 * en el texto. Después, el simulacro puntúa solo lo suyo.
 */
async function startPractice(page: Page): Promise<void> {
  await openGame(page);
  await page.getByRole('button', { name: /Nueva partida|Continuar/ }).first().click();
  await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('hub');
  await page.evaluate(() => window.__EXCOM__!.startContract('practice'));
  await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('briefing');
}

test.describe('Fase 5 · tutorial', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?qa=1');
    await page.evaluate(() => window.localStorage.clear());
  });

  test('once pasos con entradas reales y teclas reales; el rango solo cuenta el simulacro', async ({ page }) => {
    const errors = collectErrors(page);
    await startPractice(page);
    await expect(page.getByRole('button', { name: 'Saltar tutorial' })).toBeVisible();
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.beginContract();
      q.setManual(true);
      q.setGod(true);
      q.resetInvariants();
    });
    const at = (): Promise<{ index: number; objective: string; kind: string }> => page.evaluate(() => window.__EXCOM__!.mission()!);
    const seen: string[] = [];

    // 1 · Caminar.
    let m = await at();
    expect(m.kind).toBe('learn');
    expect(m.objective).toContain('WASD');
    seen.push(m.objective);
    await page.evaluate(() => window.__EXCOM__!.step(70, { moveY: 1 }));
    // 2 · Correr: el texto sigue a la tecla asignada (Shift → B al reasignar).
    m = await at();
    expect(m.index).toBe(1);
    expect(m.objective).toContain('Shift');
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setSettings({ bindings: { ...q.settings().settings.bindings, sprint: ['KeyB', 'Pad10'] } });
    });
    expect((await at()).objective).toContain('Mantén B');
    seen.push((await at()).objective);
    await expect(page.locator('#hud .objective')).toContainText('Mantén B');
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.teleport(0, 0, 11, 0);
      q.step(80, { moveY: 1, sprint: true });
    });
    // 3 · Vault sobre la caja.
    m = await at();
    expect(m.index).toBe(2);
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      // A 0,9 m del frente de la caja (alcance del vault: 1,0 m) aparece el aviso con la tecla.
      q.teleport(0, 0, 1.4, 0);
      q.step(20, { moveY: 1 });
    });
    await page.evaluate(() => window.__EXCOM__!.measureFps(0.3));
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.prompt())).toContain('Saltar');
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.step(1, { moveY: 1, jump: true });
      q.step(90, { moveY: 1 });
    });
    seen.push(m.objective);
    // 4 · Deslizarse.
    m = await at();
    expect(m.index).toBe(3);
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.teleport(0, 0, 11, 0);
      q.step(30, { moveY: 1, sprint: true });
      q.step(1, { moveY: 1, sprint: true, crouch: true });
      q.step(50, { moveY: 1, sprint: true });
    });
    seen.push(m.objective);
    // 5 · Esquivar.
    m = await at();
    expect(m.index).toBe(4);
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.teleport(0, 0, 11, 0);
      q.step(5, { moveY: 1 });
      q.step(1, { moveY: 1, dodge: true });
      q.step(50, {});
    });
    seen.push(m.objective);
    // 6 · Cobertura en el muro alto (la baliza lo señala).
    m = await at();
    expect(m.index).toBe(5);
    const beaconCover = await page.evaluate(() => window.__EXCOM__!.mission()!.beacon);
    expect(beaconCover?.x).toBeCloseTo(4, 0);
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.teleport(4, 0, -4.3, 0);
      q.step(5, {});
      q.step(1, { crouch: true });
      q.step(10, {});
    });
    seen.push(m.objective);
    // 7 · Apuntar y disparar 3 veces en los carriles (salir de la cobertura antes).
    m = await at();
    expect(m.index).toBe(6);
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.step(1, { crouch: true });
      q.step(10, {});
      q.teleport(-14, 0, -6.5, 0);
      q.step(20, { aim: true });
      for (let i = 0; i < 3; i++) {
        q.press('fire');
        q.step(20, { aim: true });
      }
    });
    await page.screenshot({ path: shotPath('fase5-tutorial-carriles') });
    seen.push(m.objective);
    // 8 · Recargar · 9 · Cambiar de arma · 10 · Foco.
    m = await at();
    expect(m.index).toBe(7);
    expect(m.objective).toContain('R');
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.press('reload');
      q.step(20, {});
    });
    seen.push(m.objective);
    m = await at();
    expect(m.index).toBe(8);
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.step(150, {});
      q.press('weapon1');
      q.step(40, {});
    });
    seen.push(m.objective);
    m = await at();
    expect(m.index).toBe(9);
    expect(m.objective).toContain('Q');
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.press('focus');
      q.step(10, {});
      q.press('focus');
      q.step(5, {});
    });
    seen.push(m.objective);
    // 11 · Takedown al maniquí aturdido (aparece con su paso y tiene baliza).
    m = await at();
    expect(m.index).toBe(10);
    const dummy = await page.evaluate(() => window.__EXCOM__!.enemies().find((e) => e.id.startsWith('tut-dummy'))!);
    expect(dummy.alive).toBe(true);
    expect(dummy.state).toBe('stunned');
    await page.evaluate(
      ([x, z]) => {
        const q = window.__EXCOM__!;
        q.teleport(x!, 0, z! + 1.1, 0);
        q.setLook(0, -0.2);
        q.step(5, {});
        q.press('takedown');
        q.step(90, {});
      },
      [dummy.x, dummy.z],
    );
    seen.push(m.objective);
    m = await at();
    expect(m.index).toBe(11);
    expect(m.objective).toContain('patio');
    // El reloj del rango empieza aquí (como mucho, lo que quedaba de los 90 pasos del takedown).
    const scored = await page.evaluate(() => window.__EXCOM__!.mission()!.time);
    expect(scored).toBeLessThan(1.6);
    console.log(`[tutorial] pasos: ${seen.join(' | ')}`);

    // Simulacro: patio → 6 maniquíes → resultados.
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.teleport(4, 0, -11, 0);
      q.step(10, {});
      q.runDebug('killAll');
      q.step(5, {});
    });
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('results');
    const out = await page.evaluate(() => window.__EXCOM__!.outcome()!);
    expect(out.success).toBe(true);
    // Los 3 disparos a las dianas y el takedown al maniquí no cuentan para la precisión del simulacro.
    expect(out.timeSec).toBeLessThan(2.5);
    expect(out.shotsFired).toBe(0);
    const inv = await page.evaluate(() => window.__EXCOM__!.invariants());
    expect(inv.penetrations).toBe(0);
    expect(inv.cameraInside).toBe(0);
    expect(errors).toEqual([]);
  });

  test('"Saltar tutorial" va directo al simulacro', async ({ page }) => {
    await startPractice(page);
    await page.getByRole('button', { name: 'Saltar tutorial' }).click();
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('playing');
    const m = await page.evaluate(() => window.__EXCOM__!.mission()!);
    expect(m.index).toBe(11);
    expect(m.objective).toContain('patio');
    expect(m.beacon).not.toBeNull();
    expect(await page.evaluate(() => window.__EXCOM__!.enemies().length)).toBe(0);
  });
});
