import { expect, type Page, test } from '@playwright/test';
import { collectErrors, openGame, shotPath } from './helpers';

/**
 * Fase 1 · Checklist anti-bugs de movimiento en el navegador real (build de producción).
 * Los invariantes (penetración, cámara dentro de geometría, jugador tapado, fuera de
 * límites, NaN) los verifica el propio juego en CADA paso con ?qa=1.
 */

async function enterArena(page: Page, query = ''): Promise<void> {
  await openGame(page, query);
  await page.evaluate(() => window.__EXCOM__!.playArena());
  await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('playing');
}

async function frames(page: Page, seconds: number): Promise<void> {
  await page.evaluate((s) => window.__EXCOM__!.measureFps(s), seconds);
}

function expectNoViolations(inv: { penetrations: number; cameraInside: number; cameraOccluded: number; outOfBounds: number; nanResets: number; killPlaneResets: number; maxHorizontalSpeed: number; lastViolation: string }): void {
  expect(inv.penetrations, inv.lastViolation).toBe(0);
  expect(inv.cameraInside, inv.lastViolation).toBe(0);
  expect(inv.cameraOccluded, inv.lastViolation).toBe(0);
  expect(inv.outOfBounds, inv.lastViolation).toBe(0);
  expect(inv.nanResets).toBe(0);
  expect(inv.killPlaneResets).toBe(0);
  expect(inv.maxHorizontalSpeed).toBeLessThanOrEqual(9.5);
}

test.describe('Fase 1 · movimiento', () => {
  test('recorrido scripteado por todas las zonas: sin atravesar nada y con la cámara siempre libre', async ({ page }) => {
    const errors = collectErrors(page);
    await enterArena(page);
    const r = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setManual(true);
      q.resetInvariants();
      const N = 0;
      const S = Math.PI;
      const E = -Math.PI / 2;
      const W = Math.PI / 2;
      const go = (yaw: number, seconds: number, intent: Record<string, unknown> = {}): void => {
        q.setLook(yaw, -0.15);
        q.step(Math.round(seconds * 60), intent);
      };
      const spin = (pitches: number[]): void => {
        for (let i = 0; i < 72; i++) {
          q.setLook(i * ((Math.PI * 2) / 72), pitches[i % pitches.length] ?? 0);
          q.step(1, {});
        }
      };
      const out: Record<string, unknown> = {};
      // Paredes exteriores a sprint.
      q.teleport(10, 0, 4, E);
      go(E, 4, { moveY: 1, sprint: true });
      out.eastX = q.player()!.x;
      q.teleport(-10, 0, 4, W);
      go(W, 4, { moveY: 1, sprint: true });
      q.teleport(0, 0, -8, N);
      go(N, 4, { moveY: 1, sprint: true });
      spin([-1.2, 0.9, 0]);
      q.teleport(8, 0, 8, S);
      go(S, 4, { moveY: 1, sprint: true });
      spin([-1.2, 0.9, 0]);
      // Pared delgada.
      q.teleport(9.5, 0, 12, E);
      go(E, 2, { moveY: 1, sprint: true });
      out.thinX = q.player()!.x;
      // Esquina en V + giro completo de cámara pegado a las paredes.
      q.teleport(-15, 0, 15.5, S);
      go(S, 2.5, { moveY: 1 });
      spin([-1.2, 1.0, -0.5, 0.6]);
      go(S, 1.5, { moveY: -1 });
      // Esquina en L.
      q.teleport(-8, 0, 17, Math.atan2(2.2, -2.7));
      go(Math.atan2(2.2, -2.7), 2.5, { moveY: 1, sprint: true });
      spin([-1.2, 1.0]);
      // Huecos entre columnas.
      q.teleport(-20.25, 0, 10, S);
      go(S, 2, { moveY: 1 });
      out.narrowZ = q.player()!.z;
      q.teleport(-18.6, 0, 10, S);
      go(S, 3, { moveY: 1 });
      out.wideZ = q.player()!.z;
      // Escaleras arriba y abajo.
      q.teleport(-20, 0, -8.5, N);
      go(N, 2, { moveY: 1 });
      out.stairsY = q.player()!.y;
      spin([-1.2, 1.0]);
      go(S, 3, { moveY: 1 });
      // Rampas.
      q.teleport(16.8, 0, -11.5, N);
      go(N, 1.0, { moveY: 1 });
      out.ramp45Y = q.player()!.y;
      // Túnel bajo agachado + giro de cámara dentro.
      q.teleport(14.5, 0, 11, E);
      go(E, 0.05, { crouch: true });
      go(E, 2.2, { moveY: 1 });
      spin([-1.2, 1.0, 0.3]);
      out.tunnelPosture = q.player()!.posture;
      go(E, 3, { moveY: 1 });
      // Vault, mantle y cobertura.
      q.teleport(0, 0, 1.4, N);
      go(N, 0.25, { moveY: 1 });
      go(N, 0.02, { moveY: 1, jump: true });
      go(N, 1.5, { moveY: 1 });
      out.vaultZ = q.player()!.z;
      q.teleport(0, 0, -3.4, N);
      go(N, 0.02, { crouch: true });
      go(N, 2.5, { moveX: 1 });
      out.coverEdge = q.player()!.edge;
      spin([-1.2, 1.0]);
      go(N, 0.02, { crouch: true });
      // Plataforma: caer por el borde.
      q.teleport(0, 1.0, 15, W);
      go(W, 2.5, { moveY: 1 });
      out.ledgeY = q.player()!.y;
      q.releaseAll();
      return { inv: q.invariants(), out };
    });
    expectNoViolations(r.inv);
    expect(r.inv.steps).toBeGreaterThan(2000);
    const o = r.out as Record<string, number | string>;
    expect(o.eastX as number).toBeGreaterThan(23.4);
    expect(o.thinX as number).toBeLessThan(11.7);
    expect(o.narrowZ as number).toBeLessThan(11.3);
    expect(o.wideZ as number).toBeGreaterThan(13.5);
    expect(o.stairsY as number).toBeGreaterThan(1.55);
    expect(o.ramp45Y as number).toBeGreaterThan(0.4);
    expect(o.tunnelPosture).toBe('crouch');
    expect(o.vaultZ as number).toBeLessThan(-0.75);
    expect(o.coverEdge).toBe(1);
    expect(o.ledgeY as number).toBeLessThan(0.05);
    expect(errors).toEqual([]);
  });

  test('picos de lag reales (frames de 300 ms) corriendo contra la pared delgada', async ({ page }) => {
    const errors = collectErrors(page);
    await enterArena(page);
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setManual(false);
      q.teleport(8.5, 0, 12, -Math.PI / 2);
      q.setLook(-Math.PI / 2, -0.1);
      q.resetInvariants();
      q.hold('sprint', true);
      q.move(0, 1);
    });
    for (let i = 0; i < 6; i++) {
      await page.evaluate(() => window.__EXCOM__!.lagSpike(300));
      await frames(page, 0.25);
    }
    const r = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.releaseAll();
      return { inv: q.invariants(), p: q.player()! };
    });
    expect(r.p.x).toBeLessThan(11.7);
    expect(r.p.x).toBeGreaterThan(10.5);
    expectNoViolations(r.inv);
    expect(errors).toEqual([]);
  });

  test('blur con W pulsada: pausa y al volver ninguna tecla queda pegada', async ({ page }) => {
    await enterArena(page);
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setManual(false);
      q.teleport(0, 0, 8, 0);
      q.setLook(0, -0.1);
    });
    await page.keyboard.down('KeyW');
    await frames(page, 0.4);
    const moving = await page.evaluate(() => window.__EXCOM__!.player()!.z);
    expect(moving).toBeLessThan(7.5);
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    expect(await page.evaluate(() => window.__EXCOM__!.state())).toBe('paused');
    expect(await page.evaluate(() => window.__EXCOM__!.input().held)).toBe(0);
    await page.evaluate(() => window.__EXCOM__!.resume());
    const a = await page.evaluate(() => window.__EXCOM__!.player()!);
    await frames(page, 0.6);
    const b = await page.evaluate(() => window.__EXCOM__!.player()!);
    // El keyup de W nunca llegó (se perdió con el blur) y aun así el personaje NO camina solo.
    expect(Math.hypot(b.x - a.x, b.z - a.z)).toBeLessThan(0.05);
    await page.keyboard.up('KeyW');
  });

  test('pestaña oculta y visible: pausa y reanuda sin teclas pegadas', async ({ page }) => {
    await enterArena(page);
    await page.keyboard.down('ShiftLeft');
    await page.keyboard.down('KeyD');
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(await page.evaluate(() => window.__EXCOM__!.state())).toBe('paused');
    expect(await page.evaluate(() => window.__EXCOM__!.input().held)).toBe(0);
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
      document.dispatchEvent(new Event('visibilitychange'));
      window.__EXCOM__!.resume();
    });
    expect(await page.evaluate(() => window.__EXCOM__!.state())).toBe('playing');
    const a = await page.evaluate(() => window.__EXCOM__!.player()!);
    await frames(page, 0.5);
    const b = await page.evaluate(() => window.__EXCOM__!.player()!);
    expect(Math.hypot(b.x - a.x, b.z - a.z)).toBeLessThan(0.05);
    await page.keyboard.up('KeyD');
    await page.keyboard.up('ShiftLeft');
  });

  test('resize de ventana y cambio de DPI: el canvas se adapta y el juego sigue', async ({ page }) => {
    const errors = collectErrors(page);
    await enterArena(page);
    await page.setViewportSize({ width: 900, height: 600 });
    await frames(page, 0.3);
    const c1 = await page.evaluate(() => window.__EXCOM__!.canvas());
    expect(c1.cssW).toBe(900);
    expect(c1.cssH).toBe(600);
    expect(Math.abs(c1.bufW - 900 * c1.pixelRatio)).toBeLessThanOrEqual(2);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 900, height: 600, deviceScaleFactor: 2, mobile: false });
    await frames(page, 0.4);
    const c2 = await page.evaluate(() => window.__EXCOM__!.canvas());
    expect(c2.pixelRatio).toBeGreaterThan(c1.pixelRatio);
    expect(Math.abs(c2.bufW - 900 * c2.pixelRatio)).toBeLessThanOrEqual(2);
    await cdp.send('Emulation.clearDeviceMetricsOverride');
    expect(await page.evaluate(() => window.__EXCOM__!.state())).toBe('playing');
    expect(errors).toEqual([]);
  });

  test('pointer lock real: sin lock se ve "Haz clic para jugar"; perder el lock pausa', async ({ page }) => {
    await enterArena(page, 'lock=1');
    await frames(page, 0.3);
    const locked = await page.evaluate(() => window.__EXCOM__!.input().locked);
    if (locked) {
      // El navegador concedió el lock: el aviso no debe tapar el juego.
      await expect(page.locator('.capture-overlay')).toBeHidden();
      await page.evaluate(() => document.exitPointerLock());
    } else {
      // Sin lock durante el juego: el aviso de captura es visible y explica qué hacer.
      await expect(page.locator('.capture-overlay')).toBeVisible();
      await expect(page.locator('.capture-overlay')).toContainText('Haz clic para jugar');
      // Pérdida de lock con el evento real del DOM.
      await page.evaluate(() => document.dispatchEvent(new Event('pointerlockchange')));
    }
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('paused');
    expect(await page.evaluate(() => window.__EXCOM__!.input().held)).toBe(0);
    await expect(page.getByRole('button', { name: 'Reanudar' })).toBeVisible();
    // Reanudar con un clic real (gesto del usuario) vuelve al juego.
    await page.getByRole('button', { name: 'Reanudar' }).click();
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.state())).toBe('playing');
  });

  test('30 s de acciones encadenadas al azar (sprint/slide/roll/salto/doble salto/vault/cobertura)', async ({ page }) => {
    await enterArena(page);
    const r = await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setManual(true);
      q.resetInvariants();
      q.teleport(0, 0, 3, 0);
      let seed = 99;
      const rnd = (): number => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      };
      const maxState: Record<string, number> = {};
      let last = '';
      let run = 0;
      for (let t = 0; t < 30 * 60; ) {
        const n = 3 + Math.floor(rnd() * 15);
        q.setLook(rnd() * Math.PI * 2, -0.6 + rnd() * 1.2);
        q.step(1, {
          moveX: rnd() * 2 - 1,
          moveY: rnd() * 1.4 - 0.4,
          sprint: rnd() < 0.5,
          aim: rnd() < 0.2,
          crouch: rnd() < 0.15,
          jump: rnd() < 0.25,
          dodge: rnd() < 0.1,
        });
        for (let i = 1; i < n; i++) {
          const st = q.player()!.state;
          if (st === last) run++;
          else {
            last = st;
            run = 0;
          }
          maxState[st] = Math.max(maxState[st] ?? 0, run / 60);
          q.step(1, { moveX: rnd() * 2 - 1, moveY: rnd() * 1.4 - 0.4, sprint: rnd() < 0.5 });
        }
        t += n;
      }
      q.releaseAll();
      return { inv: q.invariants(), maxState, p: q.player()! };
    });
    expectNoViolations(r.inv);
    expect(r.maxState.roll ?? 0).toBeLessThanOrEqual(0.55);
    expect(r.maxState.slide ?? 0).toBeLessThanOrEqual(0.75);
    expect(r.maxState.vault ?? 0).toBeLessThan(1.5);
  });

  test('prompts contextuales con la tecla real y capturas de QA', async ({ page }) => {
    await enterArena(page);
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.setManual(true);
      // A 0,8 m de la caja de 0,9 m (alcance de vault: 1,0 m).
      q.teleport(0, 0, 1.2, 0);
      q.setLook(0, -0.2);
      q.step(10, {});
    });
    await frames(page, 0.3);
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.prompt())).toContain('Saltar por encima');
    await page.screenshot({ path: shotPath('fase1-prompt-vault') });
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.teleport(0, 0, -3.4, 0);
      q.setLook(0, -0.1);
      q.step(10, {});
    });
    await frames(page, 0.3);
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.prompt())).toContain('Cubrirse');
    await page.screenshot({ path: shotPath('fase1-prompt-cover') });
    // En cobertura alta, el prompt explica cómo asomarse/salir.
    await page.evaluate(() => window.__EXCOM__!.step(2, { crouch: true }));
    await frames(page, 0.3);
    await expect.poll(() => page.evaluate(() => window.__EXCOM__!.prompt())).toContain('Asomarse');
    await page.screenshot({ path: shotPath('fase1-en-cobertura') });
    // Vista general del personaje y la cámara.
    await page.evaluate(() => {
      const q = window.__EXCOM__!;
      q.step(2, { crouch: true });
      q.teleport(-17.5, 0, -6.5, 0.3);
      q.setLook(0.3, -0.25);
      q.step(5, {});
    });
    await frames(page, 0.3);
    await page.screenshot({ path: shotPath('fase1-personaje-escaleras') });
  });
});
