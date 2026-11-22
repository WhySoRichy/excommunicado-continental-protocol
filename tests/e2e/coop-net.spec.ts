import { expect, type Page, test } from '@playwright/test';
import { collectErrors, openGame, shotPath } from './helpers';
import { mockLobby } from './lobbyMock';

/**
 * Fase 3 de docs/ESCALABILIDAD.md en el juego real: dos pestañas del mismo navegador juegan juntas por el transporte
 * entre pestañas (el mismo protocolo y el mismo código que por WebRTC, sin la red de por medio).
 */
const qa = (p: Page) => p.evaluate.bind(p);

test.describe('Fase 3 · cooperativo en red', () => {
  test.setTimeout(180_000);

  test('dos pestañas juegan juntas: el invitado se ve, se mueve y su disparo cuenta', async ({ page: host, context }) => {
    await mockLobby(context);
    const hostErrors = collectErrors(host);
    await openGame(host);
    const guest = await context.newPage();
    const guestErrors = collectErrors(guest);
    await openGame(guest);

    // Sala: el anfitrión la abre y el invitado entra desde la otra pestaña.
    await qa(host)(() => window.__EXCOM__!.coopHost());
    expect(await qa(guest)(() => window.__EXCOM__!.coopJoinLocal()), 'encuentra la sala').toBe(true);
    await expect.poll(() => qa(guest)(() => window.__EXCOM__!.coopState().id), { timeout: 15_000 }).toBe(1);
    await expect.poll(() => qa(host)(() => window.__EXCOM__!.coopState().ids)).toEqual([0, 1]);
    await host.screenshot({ path: shotPath('fase3-sala') });

    // La arena, los dos a la vez.
    await qa(host)(() => window.__EXCOM__!.coopStart('arena'));
    await expect.poll(() => qa(host)(() => window.__EXCOM__!.state()), { timeout: 30_000 }).toBe('playing');
    await expect.poll(() => qa(guest)(() => window.__EXCOM__!.state()), { timeout: 30_000 }).toBe('playing');
    await expect.poll(() => qa(host)(() => window.__EXCOM__!.players().length), { timeout: 20_000 }).toBe(2);
    await expect.poll(() => qa(guest)(() => window.__EXCOM__!.players().length), { timeout: 20_000 }).toBe(2);
    await qa(host)(() => window.__EXCOM__!.setGod(true));
    // Todo por condiciones y no por tiempo: en la CI el juego va a pocos fotogramas por segundo.
    const guestPos = () => qa(guest)(() => window.__EXCOM__!.player()!);
    const walked = async (from: { x: number; z: number }) => {
      const p = await guestPos();
      return Math.hypot(p.x - from.x, p.z - from.z);
    };
    /** Distancia entre donde está el invitado y donde lo tiene el anfitrión. */
    const gap = async () => {
      const own = await guestPos();
      const seen = await qa(host)(() => window.__EXCOM__!.players().find((p) => p.id === 1)!);
      return Math.hypot(seen.x - own.x, seen.z - own.z);
    };

    // El invitado anda (hacia atrás: delante están las cajas de la arena) y el anfitrión lo tiene donde está.
    await expect.poll(gap, { timeout: 15_000, message: 'el anfitrión lo coloca' }).toBeLessThan(0.3);
    const start = await guestPos();
    await qa(guest)(() => window.__EXCOM__!.move(0, -1));
    await expect.poll(() => walked(start), { timeout: 30_000, message: 'el invitado anda' }).toBeGreaterThan(3);
    await qa(guest)(() => window.__EXCOM__!.move(0, 0));
    await expect.poll(gap, { timeout: 15_000, message: 'y el anfitrión lo ve donde está' }).toBeLessThan(0.3);
    const own = await guestPos();

    // Un enemigo delante del invitado: el invitado apunta a lo que ve y dispara; la baja la decide el anfitrión.
    await qa(host)(([x, z]) => window.__EXCOM__!.spawnEnemy('thug', x, 0, z - 6, false), [own.x, own.z] as const);
    await expect.poll(() => qa(guest)(() => window.__EXCOM__!.enemies().filter((e) => e.alive).length), { timeout: 10_000 }).toBeGreaterThan(0);
    await qa(guest)(() => window.__EXCOM__!.hold('aim', true));
    await expect
      .poll(
        async () => {
          await qa(guest)(() => {
            const q = window.__EXCOM__!;
            const e = q.enemies().find((x) => x.alive);
            if (e) q.aimAt(e.x, e.headY - 0.5, e.z);
            q.press('fire');
          });
          return qa(host)(() => window.__EXCOM__!.enemies().filter((e) => e.alive).length);
        },
        { timeout: 60_000, intervals: [250] },
      )
      .toBe(0);
    await expect.poll(() => qa(guest)(() => window.__EXCOM__!.enemies().filter((e) => e.alive).length), { timeout: 5_000 }).toBe(0);
    await qa(guest)(() => window.__EXCOM__!.hold('aim', false));
    await host.screenshot({ path: shotPath('fase3-anfitrion') });
    await guest.screenshot({ path: shotPath('fase3-invitado') });

    // Con la pestaña del anfitrión oculta (el navegador para sus fotogramas) la partida sigue para el invitado.
    const setVisibility = (state: 'hidden' | 'visible') =>
      qa(host)((s) => {
        Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => s });
        document.dispatchEvent(new Event('visibilitychange'));
      }, state);
    await setVisibility('hidden');
    const t0 = Date.now();
    const steps0 = await qa(host)(() => window.__EXCOM__!.info().steps);
    const before = await guestPos();
    await qa(guest)(() => window.__EXCOM__!.move(1, 0));
    await expect.poll(() => walked(before), { timeout: 30_000 }).toBeGreaterThan(1.5);
    await qa(guest)(() => window.__EXCOM__!.move(0, 0));
    await expect.poll(gap, { timeout: 15_000, message: 'el anfitrión oculto sigue viendo al invitado' }).toBeLessThan(0.3);
    const steps = (await qa(host)(() => window.__EXCOM__!.info().steps)) - steps0;
    const elapsed = (Date.now() - t0) / 1000;
    expect(steps, 'el anfitrión sigue simulando').toBeGreaterThan(20);
    // A 60 pasos por segundo como mucho: si también simularan sus fotogramas, irían el doble.
    expect(steps, 'y sin pasos dobles').toBeLessThanOrEqual(Math.ceil(elapsed * 60 * 1.25) + 10);
    await setVisibility('visible');

    // El invitado se va: su personaje desaparece de la partida del anfitrión.
    await qa(guest)(() => window.__EXCOM__!.coopLeave());
    await expect.poll(() => qa(host)(() => window.__EXCOM__!.players().length), { timeout: 15_000 }).toBe(1);
    await expect.poll(() => qa(guest)(() => window.__EXCOM__!.state())).toBe('title');

    expect(hostErrors).toEqual([]);
    expect(guestErrors).toEqual([]);
  });

  test('un contrato en cooperativo: los textos de la misión llegan al invitado y se vuelve a la sala con él', async ({ page: host, context }) => {
    await mockLobby(context);
    const hostErrors = collectErrors(host);
    await openGame(host);
    const guest = await context.newPage();
    const guestErrors = collectErrors(guest);
    await openGame(guest);
    await qa(host)(() => window.__EXCOM__!.coopHost());
    expect(await qa(guest)(() => window.__EXCOM__!.coopJoinLocal())).toBe(true);
    await expect.poll(() => qa(host)(() => window.__EXCOM__!.coopState().ids), { timeout: 15_000 }).toEqual([0, 1]);

    await qa(host)(() => window.__EXCOM__!.coopStart('practice'));
    await expect.poll(() => qa(guest)(() => window.__EXCOM__!.state()), { timeout: 30_000 }).toBe('playing');
    await expect.poll(() => qa(host)(() => window.__EXCOM__!.players().length), { timeout: 20_000 }).toBe(2);
    // Sin briefing ni tutorial: el objetivo de verdad, el mismo en las dos pantallas.
    await expect.poll(() => qa(host)(() => window.__EXCOM__!.hud().objective), { timeout: 10_000 }).not.toBe('');
    const objective = await qa(host)(() => window.__EXCOM__!.hud().objective);
    await expect.poll(() => qa(guest)(() => window.__EXCOM__!.hud().objective), { timeout: 10_000 }).toBe(objective);
    // La baliza del objetivo también (llega con las instantáneas).
    const beaconShown = () => qa(guest)(() => [...document.querySelectorAll<HTMLElement>('#hud .beacon, #hud .beacon-arrow')].some((el) => !el.hidden));
    await expect.poll(beaconShown, { timeout: 10_000 }).toBe(true);
    await expect.poll(() => qa(guest)(() => window.__EXCOM__!.players().length), { timeout: 10_000 }).toBe(2);
    await guest.screenshot({ path: shotPath('fase3-contrato-invitado') });

    // El anfitrión vuelve a la sala y se lleva al invitado; luego empiezan otra cosa juntos.
    await qa(host)(() => window.__EXCOM__!.coopLobby());
    await expect.poll(() => qa(guest)(() => window.__EXCOM__!.state()), { timeout: 10_000 }).toBe('title');
    expect(await qa(guest)(() => window.__EXCOM__!.coopState().inMatch)).toBe(false);
    await qa(host)(() => window.__EXCOM__!.coopStart('arena'));
    await expect.poll(() => qa(guest)(() => window.__EXCOM__!.state()), { timeout: 30_000 }).toBe('playing');
    await expect.poll(() => qa(host)(() => window.__EXCOM__!.players().length), { timeout: 20_000 }).toBe(2);
    await qa(host)(() => window.__EXCOM__!.coopLeave());
    await expect.poll(() => qa(guest)(() => window.__EXCOM__!.coopState().error), { timeout: 15_000 }).not.toBeNull();
    expect(await qa(guest)(() => window.__EXCOM__!.state())).toBe('title');
    expect(hostErrors).toEqual([]);
    expect(guestErrors).toEqual([]);
  });

  test('por WebRTC: invitación y respuesta por código, sin servidor', async ({ page: host, context }) => {
    await mockLobby(context);
    const hostErrors = collectErrors(host);
    await openGame(host);
    const guest = await context.newPage();
    const guestErrors = collectErrors(guest);
    await openGame(guest);
    await qa(host)(() => window.__EXCOM__!.coopHost());
    const invite = await qa(host)(() => window.__EXCOM__!.coopInvite());
    expect(invite, 'el anfitrión genera la invitación').toMatch(/^EXC1./);
    const answer = await qa(guest)((c) => window.__EXCOM__!.coopAnswer(c), invite!);
    expect(answer, 'el invitado genera la respuesta').toMatch(/^EXC1./);
    expect(await qa(host)((a) => window.__EXCOM__!.coopAccept(a), answer!), 'se abre la conexión').toBe(true);
    await expect.poll(() => qa(guest)(() => window.__EXCOM__!.coopState().id), { timeout: 15_000 }).toBe(1);
    await qa(host)(() => window.__EXCOM__!.coopStart('arena'));
    await expect.poll(() => qa(guest)(() => window.__EXCOM__!.state()), { timeout: 30_000 }).toBe('playing');
    await expect.poll(() => qa(host)(() => window.__EXCOM__!.players().length), { timeout: 20_000 }).toBe(2);
    await expect.poll(() => qa(guest)(() => window.__EXCOM__!.coopState().rtt), { timeout: 10_000 }).toBeGreaterThan(0);
    expect(hostErrors).toEqual([]);
    expect(guestErrors).toEqual([]);
  });

  test('por la interfaz: crear la sala, unirse desde otra pestaña, jugar y volver a la sala desde la pausa', async ({ page: host, context }) => {
    await mockLobby(context);
    const hostErrors = collectErrors(host);
    await openGame(host);
    const guest = await context.newPage();
    const guestErrors = collectErrors(guest);
    await openGame(guest);
    const button = (p: Page, name: string) => p.getByRole('button', { name, exact: true });

    await button(host, 'Cooperativo').click();
    await button(host, 'Crear partida').click();
    await expect(host.getByRole('dialog', { name: 'SALA' })).toBeVisible();
    await button(guest, 'Cooperativo').click();
    await button(guest, 'Unirse en este equipo').click();
    // Los dos ven a los dos (y cada uno sabe cuál es).
    await expect(guest.locator('.coop-player.you')).toHaveText(/Invitado 1/, { timeout: 15_000 });
    await expect(host.locator('.coop-player')).toHaveCount(2);
    await expect(guest.getByText('Esperando a que el anfitrión elija la misión…')).toBeVisible();

    await button(host, 'Arena (libre)').click();
    await expect.poll(() => qa(host)(() => window.__EXCOM__!.state()), { timeout: 30_000 }).toBe('playing');
    await expect.poll(() => qa(guest)(() => window.__EXCOM__!.state()), { timeout: 30_000 }).toBe('playing');
    // El panel del equipo, en los dos.
    await expect(guest.locator('#hud .team-row')).toHaveCount(2, { timeout: 15_000 });
    await expect(host.locator('#hud .team-row')).toHaveCount(2, { timeout: 15_000 });

    // La pausa del cooperativo no para el mundo y lleva a la sala.
    await qa(host)(() => window.__EXCOM__!.pause());
    await expect(button(host, 'Volver a la sala')).toBeVisible();
    const paused0 = await qa(host)(() => window.__EXCOM__!.info().steps);
    await expect
      .poll(() => qa(host)(() => window.__EXCOM__!.info().steps), { timeout: 15_000, message: 'la partida sigue con la pausa abierta' })
      .toBeGreaterThan(paused0 + 5);
    await button(host, 'Volver a la sala').click();
    await expect(host.getByRole('dialog', { name: 'SALA' })).toBeVisible();
    await expect(guest.getByRole('dialog', { name: 'SALA' })).toBeVisible({ timeout: 15_000 });

    // El invitado sale de la sala; el anfitrión la cierra.
    await button(guest, 'Salir de la partida').click();
    await expect(host.locator('.coop-player')).toHaveCount(1, { timeout: 15_000 });
    await button(host, 'Cerrar la sala').click();
    await expect(button(host, 'Cooperativo')).toBeVisible();
    expect(hostErrors).toEqual([]);
    expect(guestErrors).toEqual([]);
  });

  test('servicio de salas: la sala tiene código, aparece en la lista y se entra con un clic o escribiendo el código', async ({ page: host, context }) => {
    const lobby = await mockLobby(context);
    const hostErrors = collectErrors(host);
    await openGame(host);
    const guest = await context.newPage();
    const guestErrors = collectErrors(guest);
    await openGame(guest);
    const button = (p: Page, name: string) => p.getByRole('button', { name, exact: true });

    await button(host, 'Cooperativo').click();
    await button(host, 'Crear partida').click();
    const codeEl = host.locator('.coop-roomcode-value');
    await expect(codeEl).toHaveText(/^[A-Z2-9]{5}$/, { timeout: 15_000 });
    const code = (await codeEl.textContent())!;

    // Pública: está en la lista. El invitado entra con un clic.
    await button(guest, 'Cooperativo').click();
    await button(guest, 'Buscar partida').click();
    const row = guest.locator(`.coop-room[data-room="${code}"]`);
    await expect(row).toBeVisible({ timeout: 15_000 });
    await expect(row).toContainText('En la sala');
    await row.getByRole('button', { name: 'Unirse' }).click();
    await expect(guest.locator('.coop-player.you')).toHaveText(/Invitado 1/, { timeout: 20_000 });
    await expect(host.locator('.coop-player')).toHaveCount(2);
    await host.screenshot({ path: shotPath('fase3-sala-codigo') });

    // Privada: ya no aparece; con el código se sigue pudiendo entrar (escrito como lo escribiría alguien).
    await button(guest, 'Salir de la partida').click();
    await expect(host.locator('.coop-player')).toHaveCount(1, { timeout: 15_000 });
    await button(host, 'Sala pública: sí').click();
    await expect(button(host, 'Sala pública: no')).toBeVisible();
    await expect
      .poll(() =>
        lobby.env.sockets('h').map((s) => {
          const i = s.info();
          return i?.role === 'host' && i.open;
        }),
      )
      .toEqual([false]);
    await button(guest, 'Cooperativo').click();
    await button(guest, 'Buscar partida').click();
    await expect(guest.getByText('No hay salas públicas abiertas ahora.', { exact: false })).toBeVisible({ timeout: 15_000 });
    await button(guest, 'Volver').click();
    await button(guest, 'Unirse con un código').click();
    const field = guest.getByRole('textbox', { name: 'Código de sala (cinco letras) o invitación manual' });
    await field.fill('ZZZZZ');
    await button(guest, 'Unirse').click();
    await expect(guest.getByRole('alert')).toHaveText('No hay ninguna sala con ese código (o ya se cerró).', { timeout: 15_000 });
    await field.fill(` ${code.slice(0, 3).toLowerCase()}-${code.slice(3).toLowerCase()} `);
    await button(guest, 'Unirse').click();
    await expect(guest.locator('.coop-player.you')).toHaveText(/Invitado 1/, { timeout: 20_000 });

    // Al empezar, la sala dice qué se juega.
    await button(host, 'Arena (libre)').click();
    await expect.poll(() => guest.evaluate(() => window.__EXCOM__!.state()), { timeout: 30_000 }).toBe('playing');
    await expect.poll(() => lobby.env.sockets('h')[0]?.info()).toMatchObject({ mode: 'arena', players: 2 });
    expect(hostErrors).toEqual([]);
    expect(guestErrors).toEqual([]);
  });

  test('un invitado usa un objeto de la misión: el anfitrión lo comprueba y lo cumple para todos', async ({ page: host, context }) => {
    await mockLobby(context);
    const hostErrors = collectErrors(host);
    await openGame(host);
    const guest = await context.newPage();
    const guestErrors = collectErrors(guest);
    await openGame(guest);
    await qa(host)(() => window.__EXCOM__!.coopHost());
    expect(await qa(guest)(() => window.__EXCOM__!.coopJoinLocal())).toBe(true);
    await expect.poll(() => qa(host)(() => window.__EXCOM__!.coopState().ids), { timeout: 15_000 }).toEqual([0, 1]);
    await qa(host)(() => window.__EXCOM__!.coopStart('nightclub'));
    await expect.poll(() => qa(guest)(() => window.__EXCOM__!.state()), { timeout: 30_000 }).toBe('playing');
    await expect.poll(() => qa(host)(() => window.__EXCOM__!.players().length), { timeout: 20_000 }).toBe(2);
    await qa(host)(() => window.__EXCOM__!.setGod(true));
    expect(await qa(host)(() => window.__EXCOM__!.mission()!.alarmDisabled)).toBe(false);

    // El anfitrión lleva al invitado junto al panel de la alarma; el invitado lo mira y lo usa.
    expect(await qa(host)(() => window.__EXCOM__!.coopPlace(1, 3.6, 0, 16, -Math.PI / 2))).toBe(true);
    await expect
      .poll(async () => {
        const p = await qa(guest)(() => window.__EXCOM__!.player()!);
        return Math.hypot(p.x - 3.6, p.z - 16);
      })
      .toBeLessThan(0.2);
    await qa(guest)(() => window.__EXCOM__!.setLook(-Math.PI / 2, -0.1));
    await expect.poll(() => qa(guest)(() => window.__EXCOM__!.interact()), { timeout: 10_000 }).toBe(true);
    await expect.poll(() => qa(host)(() => window.__EXCOM__!.mission()!.alarmDisabled), { timeout: 10_000 }).toBe(true);
    // Ya usado: a nadie se le vuelve a ofrecer.
    await expect.poll(() => qa(guest)(() => window.__EXCOM__!.interact()), { timeout: 10_000 }).toBe(false);
    expect(hostErrors).toEqual([]);
    expect(guestErrors).toEqual([]);
  });

  test('tras un corte de red, el invitado se reconecta solo y vuelve a su plaza', async ({ page: host, context }) => {
    await mockLobby(context);
    const hostErrors = collectErrors(host);
    await openGame(host);
    const guest = await context.newPage();
    const guestErrors = collectErrors(guest);
    await openGame(guest);
    await qa(host)(() => window.__EXCOM__!.coopHost());
    expect(await qa(guest)(() => window.__EXCOM__!.coopJoinLocal())).toBe(true);
    await expect.poll(() => qa(host)(() => window.__EXCOM__!.coopState().ids), { timeout: 15_000 }).toEqual([0, 1]);
    await qa(host)(() => window.__EXCOM__!.coopStart('arena'));
    await expect.poll(() => qa(host)(() => window.__EXCOM__!.players().length), { timeout: 30_000 }).toBe(2);
    await expect.poll(() => qa(guest)(() => window.__EXCOM__!.state()), { timeout: 30_000 }).toBe('playing');

    await qa(guest)(() => window.__EXCOM__!.coopDrop());
    // El anfitrión lo suelta y le guarda la plaza; el invitado vuelve por sí solo.
    await expect.poll(() => qa(host)(() => window.__EXCOM__!.players().length), { timeout: 15_000 }).toBe(1);
    await expect.poll(() => qa(host)(() => window.__EXCOM__!.players().length), { timeout: 30_000 }).toBe(2);
    await expect.poll(() => qa(guest)(() => window.__EXCOM__!.state()), { timeout: 30_000 }).toBe('playing');
    expect(await qa(guest)(() => window.__EXCOM__!.coopState().id), 'la misma plaza').toBe(1);
    expect(await qa(guest)(() => window.__EXCOM__!.coopState().error)).toBeNull();
    expect(hostErrors).toEqual([]);
    expect(guestErrors).toEqual([]);
  });
});
