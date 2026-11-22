import { Vector3 } from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { EnemyManager } from '../../src/combat/EnemyManager';
import { Pickups } from '../../src/combat/Pickups';
import { PlayerCombat } from '../../src/combat/PlayerCombat';
import { PlayerRoster, type PlayerSlot, REMOTE_RESPAWN } from '../../src/combat/PlayerRoster';
import { type CombatVfx, NO_VFX, SILENT_AUDIO, STILL_CAMERA } from '../../src/combat/ports';
import { loadoutFor, type UpgradeId } from '../../src/combat/weapons';
import { FIXED_DT } from '../../src/core/Loop';
import { Rng } from '../../src/core/rng';
import type { Enemy } from '../../src/entities/Enemy';
import { PlayerController } from '../../src/entities/PlayerController';
import { arena } from '../../src/levels/data/arena';
import { buildLevelPhysics } from '../../src/levels/levelPhysics';
import { NavGrid } from '../../src/levels/nav/NavGrid';
import type { LevelData } from '../../src/levels/types';
import { FxRecorder } from '../../src/net/fx';
import { TestNetwork, type TestNetworkOptions } from '../../src/net/link';
import { HOST_TIMEOUT, NetGuest } from '../../src/net/NetGuest';
import { type HostWorld, NetHost, PEER_TIMEOUT } from '../../src/net/NetHost';
import { FX, type RejoinTicket } from '../../src/net/protocol';
import { loadRapier, PhysicsWorld, type Rapier } from '../../src/physics/Physics';

/**
 * Cooperativo en red sin pantalla (fase 3 de docs/ESCALABILIDAD.md): un anfitrión y un invitado, cada uno con su
 * propio mundo de física, unidos por una red de pruebas con latencia, variación y pérdida. Es el mismo código que
 * corre en el juego; solo cambian el transporte y que no hay vista.
 */
let R: Rapier;
beforeAll(async () => {
  R = await loadRapier();
});

const MS = 1000 / 60;

interface Tracer {
  from: Vector3;
  to: Vector3;
}

function recordingVfx(tracers: Tracer[]): CombatVfx {
  return { ...NO_VFX, tracer: (from, to) => tracers.push({ from: new Vector3(from.x, from.y, from.z), to: new Vector3(to.x, to.y, to.z) }) };
}

/** El mundo del anfitrión: la partida de verdad, con su jugador local en la plaza 0. */
function hostSide(level: LevelData, net: TestNetwork) {
  const physics = new PhysicsWorld(R);
  buildLevelPhysics(level, physics);
  physics.step();
  const rng = new Rng(11);
  const recorder = new FxRecorder();
  const world = recorder.tee(-1, NO_VFX, SILENT_AUDIO);
  let roster: PlayerRoster | null = null;
  const enemies = new EnemyManager({
    level,
    physics,
    nav: NavGrid.build(level),
    vfx: world.vfx,
    audio: world.audio,
    rng,
    accuracyMult: 1,
    damageMult: 1,
    onShotAtPlayer: (enemy, target, hit, dmg) => roster?.shotAt(enemy, target, hit, dmg),
  });
  const pickups = new Pickups();
  const r = new PlayerRoster({ physics, enemies, civilians: null, vfx: world.vfx, audio: world.audio, rng, pickups });
  roster = r;
  const s = level.spawn.pos;
  const local = r.add(new PlayerController(physics, new Vector3(s[0], s[1] + 0.02, s[2]), level.spawn.yaw), new PlayerCombat(new Set()), {
    local: true,
    ports: recorder.tee(0, NO_VFX, SILENT_AUDIO),
  });
  r.respawn.pos.set(s[0], s[1], s[2]);
  r.respawn.yaw = level.spawn.yaw;
  const hw: HostWorld = {
    physics,
    roster: r,
    enemies,
    civilians: null,
    pickups,
    ports: { vfx: NO_VFX, audio: SILENT_AUDIO },
    createPlayer: (at, yaw, upgrades) => ({
      controller: new PlayerController(physics, new Vector3(at.x, at.y + 0.02, at.z), yaw),
      combat: new PlayerCombat(upgrades, loadoutFor(upgrades)),
    }),
    spawnNear: (base, _yaw, index, out) => out.set(base.x + index * 1.5, base.y, base.z),
  };
  const deaths: number[] = [];
  const left: number[] = [];
  const interactions: Array<{ id: number; object: string }> = [];
  const host = new NetHost({
    now: () => net.now,
    recorder,
    onGuestDied: (sl) => deaths.push(sl.id),
    onGuestLeft: (id) => left.push(id),
    onInteract: (slot, object) => interactions.push({ id: slot.id, object }),
  });
  host.start(hw, level.id, null);
  const step = (): void => {
    r.step(FIXED_DT, true);
    host.step(FIXED_DT);
    r.updateLooks();
    enemies.fixedUpdate(FIXED_DT, r.updateTargets(FIXED_DT));
    physics.step();
    host.endStep();
  };
  return { physics, enemies, roster: r, local, host, recorder, step, deaths, left, interactions };
}

/** El mundo del invitado: su jugador (lo mueve él) y réplicas de todo lo demás. */
function guestSide(
  level: LevelData,
  link: ReturnType<TestNetwork['pair']>[1],
  net: TestNetwork,
  upgrades: ReadonlySet<UpgradeId> = new Set(),
  rejoin?: RejoinTicket,
) {
  const physics = new PhysicsWorld(R);
  buildLevelPhysics(level, physics);
  physics.step();
  const tracers: Tracer[] = [];
  const vfx = recordingVfx(tracers);
  const enemies = new EnemyManager({
    level,
    physics,
    nav: NavGrid.build(level),
    vfx,
    audio: SILENT_AUDIO,
    rng: new Rng(3),
    accuracyMult: 1,
    damageMult: 1,
    onShotAtPlayer: () => {},
  });
  const pickups = new Pickups();
  const shotRng = new Rng();
  const roster = new PlayerRoster({ physics, enemies, civilians: null, vfx, audio: SILENT_AUDIO, rng: new Rng(5), pickups });
  const events = { spawned: 0, died: 0, closed: 0, byHost: false };
  const guest = new NetGuest(link, {
    now: () => net.now,
    upgrades,
    ...(rejoin ? { rejoin } : {}),
    camera: STILL_CAMERA,
    events: {
      spawned: () => events.spawned++,
      died: () => events.died++,
      closed: (byHost) => {
        events.closed++;
        events.byHost = byHost;
      },
    },
  });
  let local: PlayerSlot | null = null;
  /** Crea su jugador con el id que le dio el anfitrión y avisa de que está listo. */
  const enter = (): PlayerSlot => {
    const s = level.spawn.pos;
    local = roster.add(new PlayerController(physics, new Vector3(s[0], s[1] + 0.02, s[2]), level.spawn.yaw), new PlayerCombat(upgrades, loadoutFor(upgrades)), {
      local: true,
      id: guest.id,
      ports: { rng: shotRng },
    });
    guest.attach(
      {
        roster,
        local,
        enemies,
        civilians: null,
        pickups,
        ports: { vfx, audio: SILENT_AUDIO },
        createReplica: (id, at) =>
          roster.add(new PlayerController(physics, new Vector3(at.x, at.y, at.z), at.yaw), new PlayerCombat(new Set()), { drive: 'replica', id }),
      },
      level.id,
    );
    return local;
  };
  const step = (): void => {
    shotRng.reseed(guest.preStep());
    roster.step(FIXED_DT, true);
    if (local) guest.postStep(local.combatIntent);
    physics.step();
  };
  return {
    physics,
    enemies,
    roster,
    guest,
    enter,
    step,
    tracers,
    events,
    get local() {
      return local!;
    },
  };
}

function coop(opts: TestNetworkOptions = { latency: 40, jitter: 8, loss: 0.03 }, upgrades?: ReadonlySet<UpgradeId>) {
  const net = new TestNetwork(new Rng(99), opts);
  const [hostEnd, guestEnd] = net.pair();
  const h = hostSide(arena, net);
  h.host.accept(hostEnd);
  const g = guestSide(arena, guestEnd, net, upgrades);
  // Saludo: hasta que el anfitrión le da plaza.
  for (let i = 0; i < 30 && g.guest.id === 0; i++) net.advance(MS);
  expect(g.guest.id, 'el anfitrión le da plaza').toBe(1);
  g.enter();
  const tick = (n = 1): void => {
    for (let i = 0; i < n; i++) {
      h.step();
      g.step();
      net.advance(MS);
    }
  };
  // Hasta que el anfitrión lo coloca.
  for (let i = 0; i < 60 && g.events.spawned === 0; i++) tick();
  expect(g.events.spawned, 'el anfitrión lo coloca en el nivel').toBe(1);
  return { net, h, g, tick, hostEnd, guestEnd };
}

/** Apunta el rayo de un jugador desde su cabeza hacia un punto. */
function aimAt(s: PlayerSlot, x: number, y: number, z: number): void {
  const f = s.controller.feet;
  s.combatIntent.aimFrom.set(f.x, f.y + 1.6, f.z + 1.2);
  s.combatIntent.aimDir.set(x - f.x, y - (f.y + 1.6), z - (f.z + 1.2)).normalize();
}

describe('cooperativo en red sin pantalla', () => {
  it('el invitado se mueve y el anfitrión lo ve donde está; el invitado ve al anfitrión', () => {
    const { h, g, tick } = coop();
    const remote = h.roster.byId(1)!;
    expect(remote.drive).toBe('remote');
    g.local.intent.moveY = 1;
    tick(90);
    g.local.intent.moveY = 0;
    tick(30);
    const gf = g.local.controller.feet;
    expect(gf.distanceTo(new Vector3(...arena.spawn.pos).add(new Vector3(1.5, 0, 0))), 'el invitado anduvo').toBeGreaterThan(2);
    expect(remote.controller.feet.distanceTo(gf), 'y el anfitrión lo tiene donde está').toBeLessThan(0.05);
    // El anfitrión, en la réplica del invitado (con el retraso de la interpolación, ya quieto).
    const hostReplica = g.roster.byId(0)!;
    expect(hostReplica.drive).toBe('replica');
    expect(hostReplica.controller.feet.distanceTo(h.local.controller.feet)).toBeLessThan(0.05);
  });

  it('un enemigo del anfitrión ataca al invitado: el daño es suyo y lo ve en su pantalla', () => {
    const { h, g, tick } = coop();
    const gf = h.roster.byId(1)!.controller.feet;
    // El anfitrión, lejos; el enemigo, junto al invitado.
    h.local.controller.teleport(new Vector3(0, 0, -16), 0);
    const enemy = h.enemies.spawnAt('thug', new Vector3(gf.x, 0, gf.z - 6), 0, gf.clone());
    h.physics.step();
    const full = g.local.combat.vitals.health + g.local.combat.vitals.armor;
    tick(240);
    expect(enemy.target?.id, 'ataca al invitado').toBe(1);
    const c = g.local.combat;
    expect(c.vitals.health + c.vitals.armor, 'el invitado ve su daño').toBeLessThan(full);
    expect(
      c.damageDirs.some((d) => d.t > 0),
      'y de dónde viene',
    ).toBe(true);
    expect(h.local.combat.vitals.health, 'el anfitrión, ileso').toBe(100);
    // Y lo ve: el enemigo es una réplica con el mismo id de red.
    expect(g.enemies.byNetId(enemy.uid), 'el invitado ve al enemigo').not.toBeNull();
  });

  it('el invitado dispara a lo que ve y el anfitrión confirma la baja (con latencia y pérdida)', () => {
    const { h, g, tick } = coop({ latency: 60, jitter: 12, loss: 0.05 });
    h.roster.god = true;
    const gf = g.local.controller.feet;
    const enemy = h.enemies.spawnAt('thug', new Vector3(gf.x, 0, gf.z - 7), 0, h.local.controller.feet.clone());
    h.physics.step();
    tick(30);
    const replica = (): Enemy | null => g.enemies.byNetId(enemy.uid);
    expect(replica()).not.toBeNull();
    let markers = 0;
    for (let i = 0; i < 900 && enemy.alive; i++) {
      const e = replica();
      if (e) aimAt(g.local, e.feet.x, e.feet.y + e.height * 0.6, e.feet.z);
      g.local.combatIntent.aim = true;
      g.local.combatIntent.firePressed = i % 10 === 0;
      tick();
      if (g.local.combat.hitMarker.t > 0.15) markers++;
    }
    g.local.combatIntent.firePressed = false;
    expect(enemy.alive, 'el anfitrión lo da por abatido').toBe(false);
    tick(40);
    expect(replica()?.alive, 'y el invitado lo ve caer').toBe(false);
    expect(markers, 'con sus marcadores de impacto').toBeGreaterThan(0);
    expect(h.roster.byId(1)!.combat.stats.kills, 'la baja es del invitado').toBe(1);
  });

  it('la dispersión sale igual en los dos equipos: el disparo predicho es el que resuelve el anfitrión', () => {
    const { h, g, tick } = coop({ latency: 30, jitter: 0, loss: 0 });
    const gf = g.local.controller.feet;
    // Disparo de cadera (con dispersión) hacia una pared lejana.
    aimAt(g.local, gf.x + 3, gf.y + 1.2, gf.z - 40);
    g.local.combatIntent.aim = false;
    g.tracers.length = 0;
    h.recorder.take();
    const hostTracers: number[][] = [];
    g.local.combatIntent.firePressed = true;
    tick();
    g.local.combatIntent.firePressed = false;
    for (let i = 0; i < 20; i++) {
      tick();
      for (const f of h.recorder.take()) if (f[0] === FX.tracer && f[1] === 1) hostTracers.push([...f]);
    }
    expect(g.tracers.length, 'el invitado predijo su trazadora').toBe(1);
    expect(hostTracers.length, 'el anfitrión resolvió el mismo disparo').toBe(1);
    const t = hostTracers[0]!;
    const predicted = g.tracers[0]!.to;
    expect(Math.hypot(t[5]! - predicted.x, t[6]! - predicted.y, t[7]! - predicted.z), 'y acaba en el mismo punto').toBeLessThan(0.05);
  });

  it('un movimiento imposible se rechaza y el invitado vuelve a donde lo tenía el anfitrión', () => {
    const { h, g, tick } = coop();
    const remote = h.roster.byId(1)!;
    const before = remote.controller.feet.clone();
    g.local.controller.teleport(new Vector3(before.x + 25, before.y, before.z), 0);
    tick(30);
    expect(remote.controller.feet.distanceTo(before), 'el anfitrión no se lo cree').toBeLessThan(0.1);
    expect(g.local.controller.feet.distanceTo(before), 'y lo devuelve a su sitio').toBeLessThan(0.1);
    expect(g.events.spawned).toBe(2);
    // Después se mueve con normalidad.
    g.local.intent.moveY = 1;
    tick(40);
    g.local.intent.moveY = 0;
    tick(20);
    expect(remote.controller.feet.distanceTo(g.local.controller.feet)).toBeLessThan(0.05);
  });

  it('el invitado cae, el anfitrión lo cuenta y lo hace reaparecer en el punto de control', () => {
    const { h, g, tick } = coop();
    const remote = h.roster.byId(1)!;
    const gf = remote.controller.feet;
    const enemy = h.enemies.spawnAt('heavy', new Vector3(gf.x, 0, gf.z - 5), 0, gf.clone());
    h.physics.step();
    remote.combat.takeHit(enemy, 1000, remote.ctx);
    tick(20);
    expect(h.deaths, 'el anfitrión cuenta la baja').toEqual([1]);
    expect(g.local.combat.dead, 'el invitado se ve caído').toBe(true);
    expect(g.events.died).toBe(1);
    h.enemies.despawnAll();
    h.roster.respawn.pos.set(4, 0, 4);
    tick(Math.round(REMOTE_RESPAWN * 60) + 20);
    expect(g.local.combat.dead, 'reaparece').toBe(false);
    expect(g.local.controller.feet.distanceTo(new Vector3(4 + 1.5, 0, 4)), 'en el punto de control').toBeLessThan(1.6);
    expect(g.local.combat.vitals.health).toBe(100);
  });

  it('si el invitado se va, su personaje desaparece y los enemigos vuelven a por el anfitrión', () => {
    const { h, g, tick, net } = coop();
    h.roster.god = true;
    const gf = h.roster.byId(1)!.controller.feet;
    const enemy = h.enemies.spawnAt('thug', new Vector3(gf.x, 0, gf.z - 4), 0, gf.clone());
    h.physics.step();
    tick(30);
    expect(enemy.target?.id).toBe(1);
    g.guest.leave();
    net.advance(200);
    tick(5);
    expect(h.roster.byId(1), 'su plaza ya no está').toBeNull();
    expect(h.left).toEqual([1]);
    expect(enemy.target?.id, 'el enemigo vuelve a por el anfitrión').toBe(0);
  });

  it('si uno de los dos deja de dar señales, el otro lo da por ido', () => {
    // El anfitrión se cuelga: ni instantáneas ni respuestas a los latidos.
    const a = coop();
    a.hostEnd.onMessage = null;
    for (let t = 0; t < HOST_TIMEOUT + 1500; t += 500) {
      a.g.guest.tick();
      a.net.advance(500);
    }
    expect(a.g.events.closed, 'el invitado da la conexión por perdida').toBe(1);
    expect(a.g.events.byHost, 'no la cerró el anfitrión').toBe(false);

    // Un invitado se cuelga: el anfitrión lo suelta y su personaje deja la partida.
    const b = coop();
    b.guestEnd.onMessage = null;
    for (let t = 0; t < PEER_TIMEOUT + 1500; t += 500) {
      b.h.host.tick();
      b.net.advance(500);
    }
    expect(b.h.left).toEqual([1]);
    expect(b.h.roster.byId(1)).toBeNull();

    // Y si el anfitrión cierra la partida, el invitado lo sabe.
    const c = coop();
    c.h.host.close();
    c.net.advance(200);
    expect(c.g.events.closed).toBe(1);
    expect(c.g.events.byHost).toBe(true);
  });

  it('el invitado pide usar un objeto de la misión: llega al anfitrión con su plaza, sin avalanchas y nunca caído', () => {
    const { h, g, tick, net } = coop();
    g.guest.requestInteract('alarm-panel');
    g.guest.requestInteract('alarm-panel');
    tick(5);
    expect(h.interactions, 'una sola: la segunda llega antes de medio segundo').toEqual([{ id: 1, object: 'alarm-panel' }]);
    net.advance(600);
    g.guest.requestInteract('cargo-1');
    tick(5);
    expect(h.interactions.at(-1)).toEqual({ id: 1, object: 'cargo-1' });
    // Caído, no.
    const remote = h.roster.byId(1)!;
    const enemy = h.enemies.spawnAt('heavy', remote.controller.feet.clone().setZ(remote.controller.feet.z - 4), 0);
    h.physics.step();
    remote.combat.takeHit(enemy, 1000, remote.ctx);
    net.advance(600);
    g.guest.requestInteract('cargo-2');
    tick(5);
    expect(h.interactions).toHaveLength(2);
  });

  it('el anfitrión coloca a un invitado con autoridad y su movimiento sigue valiendo desde allí', () => {
    const { h, g, tick } = coop();
    const before = g.events.spawned;
    expect(h.host.placeGuest(1, new Vector3(5, 0, 2), Math.PI)).toBe(true);
    tick(10);
    expect(g.events.spawned).toBe(before + 1);
    expect(g.local.controller.feet.distanceTo(new Vector3(5, 0, 2))).toBeLessThan(0.1);
    g.local.intent.moveX = 1;
    tick(30);
    g.local.intent.moveX = 0;
    tick(20);
    expect(h.roster.byId(1)!.controller.feet.distanceTo(g.local.controller.feet), 'sin rechazos tras el traslado').toBeLessThan(0.05);
  });

  it('tras un corte, el invitado vuelve a su plaza con su combate; con una contraseña falsa, no', () => {
    const { h, g, tick, net } = coop();
    const remote = h.roster.byId(1)!;
    const before = remote.combat;
    before.style.score = 1234;
    before.vitals.health = 37;
    const ticket = g.guest.ticket!;
    expect(ticket.id).toBe(1);
    // Se corta sin despedirse: el anfitrión suelta su personaje pero le guarda la plaza.
    g.guest.disconnect();
    net.advance(100);
    tick(3);
    expect(h.left).toEqual([1]);
    expect(h.roster.byId(1)).toBeNull();

    // Un intruso con una contraseña inventada no recupera nada: recibe otra plaza.
    const [hostEnd2, intruderEnd] = net.pair();
    h.host.accept(hostEnd2);
    const intruder = guestSide(arena, intruderEnd, net, new Set(), { id: 1, token: 'abcdefghijkm2345' });
    for (let i = 0; i < 30 && intruder.guest.id === 0; i++) net.advance(MS);
    expect(intruder.guest.id, 'el 1 está guardado para su dueño').toBe(2);
    intruder.guest.leave();
    net.advance(100);

    // Vuelve con su contraseña: la misma plaza y el mismo combate (salud y estilo incluidos).
    const [hostEnd3, backEnd] = net.pair();
    h.host.accept(hostEnd3);
    const back = guestSide(arena, backEnd, net, new Set(), ticket);
    for (let i = 0; i < 30 && back.guest.id === 0; i++) net.advance(MS);
    expect(back.guest.id).toBe(1);
    back.enter();
    for (let i = 0; i < 60 && back.events.spawned === 0; i++) {
      h.step();
      back.step();
      net.advance(MS);
    }
    const again = h.roster.byId(1)!;
    expect(again.combat, 'su combate de antes').toBe(before);
    expect(again.combat.style.score).toBe(1234);
    expect(again.combat.vitals.health).toBe(37);
    expect(back.guest.ticket!.token, 'y una contraseña nueva').not.toBe(ticket.token);
  });

  it('una instantánea por cada tres pasos y entradas que caben en un canal modesto', () => {
    const { h, tick, net } = coop({ latency: 20, jitter: 0, loss: 0 });
    h.enemies.spawnInitial();
    const sent = net.sent;
    const bytes = net.bytes;
    tick(600);
    const perSecond = ((net.bytes - bytes) / 10) * 1;
    // 10 s: 200 instantáneas y 600 envíos de entrada, más algún ping.
    expect(net.sent - sent).toBeGreaterThan(780);
    expect(net.sent - sent).toBeLessThan(840);
    expect(perSecond, 'menos de 100 KB/s entre los dos sentidos').toBeLessThan(100_000);
  });
});
