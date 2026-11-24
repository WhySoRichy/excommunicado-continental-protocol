import { describe, expect, it } from 'vitest';
import type { Loadout } from '../../src/combat/weapons';
import { emptyPlayerLook } from '../../src/combat/playerLook';
import { emptyEnemyNet } from '../../src/entities/Enemy';
import { emptyMoveNet } from '../../src/entities/PlayerController';
import {
  decodeGuestCtl,
  decodeHostCtl,
  decodeInput,
  decodeSnapshot,
  emptyInputFrame,
  emptyMissionNet,
  encodeGuestCtl,
  encodeHostCtl,
  encodeInput,
  encodeSnapshotBody,
  FX,
  type HostCtl,
  MAX_MESSAGE_CHARS,
  type OwnerNet,
  PROTOCOL,
  simKind,
  type Snapshot,
  TABLES_HASH,
  withOwner,
} from '../../src/net/protocol';

/** Protocolo del cooperativo (fase 3): lo que se envía se recupera igual y lo malformado se descarta entero. */
describe('protocolo de red', () => {
  it('la entrada del invitado va y vuelve con sus valores (redondeados al milímetro)', () => {
    const f = emptyInputFrame();
    f.seq = 1234;
    f.view = 1200.37;
    f.epoch = 2;
    Object.assign(f.move, { x: 1.23456, y: 0.5, z: -7.0001, yaw: 3.14159, state: 'cover', posture: 'crouch', aiming: true, dodges: 3 });
    f.move.cover = { nx: 0, nz: -1, height: 'high', peekSide: 1, peekOffset: 0.42, edgeNear: -1, top: 2.4, impact: 0.75 };
    f.fireHeld = true;
    f.firePressed = true;
    f.gearHeld = true;
    f.select = 'melee';
    f.cycle = -1;
    f.aimFrom = { x: 1, y: 1.6, z: 2 };
    f.aimDir = { x: 0, y: 0.6, z: -0.8 };
    const back = decodeInput(encodeInput([f]));
    expect(back).toHaveLength(1);
    const g = back![0]!;
    expect(g.seq).toBe(1234);
    expect(g.view).toBeCloseTo(1200.37, 2);
    expect(g.move.x).toBeCloseTo(1.235, 3);
    expect(g.move.state).toBe('cover');
    expect(g.move.posture).toBe('crouch');
    expect(g.move.aiming).toBe(true);
    expect(g.move.cover).toEqual({ nx: 0, nz: -1, height: 'high', peekSide: 1, peekOffset: 0.42, edgeNear: -1, top: 2.4, impact: 0.75 });
    expect(g.fireHeld && g.firePressed && !g.reloadPressed).toBe(true);
    expect(g.gearHeld && !g.gearPressed).toBe(true);
    expect(g.select).toBe('melee');
    expect(g.cycle).toBe(-1);
    expect(Math.hypot(g.aimDir.x, g.aimDir.y, g.aimDir.z)).toBeCloseTo(1, 6);
  });

  it('la instantánea va y vuelve, y cada invitado recibe solo lo suyo', () => {
    const enemy = emptyEnemyNet();
    Object.assign(enemy, {
      uid: 7,
      type: 'marksman',
      ai: 'combat',
      aim: true,
      health: 55.5,
      telegraph: 0.4,
      icon: 'alert',
      hasLook: true,
      lookX: 3,
      dazed: true,
    });
    Object.assign(enemy.move, { x: 4, y: 0, z: -2, yaw: 1, state: 'ground' });
    const move = emptyMoveNet();
    move.x = 2;
    const look = emptyPlayerLook();
    look.weapon = 'carbine';
    look.reload = 0.5;
    look.throw = 0.4;
    const body = encodeSnapshotBody({
      tick: 300,
      players: [{ id: 0, move, look }],
      enemies: [enemy],
      civilians: [{ move: emptyMoveNet(), state: 'flee', alive: true }],
      pickups: [{ id: 3, kind: 'medkit', x: 1, y: 0, z: 1 }],
      grenades: [{ id: 5, kind: 'stun', owner: 1, x: 2, y: 0.5, z: -3 }],
      fx: [
        [FX.tracer, 0, 0, 1, 0, 5, 1, 0, 0xffe2a0, 0.02],
        [FX.grenade, -1, 2, 1, 0, 1],
        [FX.burst, -1, 1, 0.2, 1],
      ],
      mission: { ...emptyMissionNet(), beacon: { x: 10, y: 0, z: 5 }, markersTotal: 3, objective: 'reach' },
    });
    const owner: OwnerNet = {
      ack: 99,
      epoch: 1,
      health: 80,
      armor: 20,
      maxHealth: 100,
      maxArmor: 60,
      dead: false,
      score: 1500,
      multiplier: 3,
      gauge: 0.4,
      gear: 1,
      ammo: [
        { weapon: 'carbine', mag: 20, reserve: 90 },
        { weapon: 'pistol', mag: 12, reserve: Number.POSITIVE_INFINITY },
      ],
    };
    const s = decodeSnapshot(withOwner(body, owner)) as Snapshot;
    expect(s.tick).toBe(300);
    expect(s.players[0]!.look.weapon).toBe('carbine');
    expect(s.enemies[0]).toMatchObject({ uid: 7, type: 'marksman', ai: 'combat', aim: true, icon: 'alert', hasLook: true, dazed: true });
    expect(s.players[0]!.look.throw).toBeCloseTo(0.4, 3);
    expect(s.grenades).toEqual([{ id: 5, kind: 'stun', owner: 1, x: 2, y: 0.5, z: -3 }]);
    expect(s.enemies[0]!.health).toBeCloseTo(55.5, 1);
    expect(s.civilians[0]!.state).toBe('flee');
    expect(s.pickups[0]).toEqual({ id: 3, kind: 'medkit', x: 1, y: 0, z: 1 });
    expect(s.fx.map((f) => f[0])).toEqual([FX.tracer, FX.grenade, FX.burst]);
    expect(s.owner?.gear).toBe(1);
    expect(s.mission.beacon).toEqual({ x: 10, y: 0, z: 5 });
    expect(s.owner?.ammo[1]!.reserve).toBe(Number.POSITIVE_INFINITY);
    expect(decodeSnapshot(body)!.owner, 'sin la parte de nadie').toBeNull();
    expect(simKind(body)).toBe('s');
    expect(simKind(encodeInput([emptyInputFrame()]))).toBe('i');
  });

  it('los mensajes fiables van y vuelven', () => {
    const loadout: Loadout = { primary: 'shotgun', secondary: 'revolver', melee: 'knife', gear: 'stun' };
    const hello = decodeGuestCtl(encodeGuestCtl({ t: 'hello', v: PROTOCOL, tables: TABLES_HASH, upgrades: ['extMag', 'suit2'], loadout }));
    expect(hello).toEqual({ t: 'hello', v: PROTOCOL, tables: TABLES_HASH, upgrades: ['extMag', 'suit2'], loadout });
    expect(decodeGuestCtl(encodeGuestCtl({ t: 'loadout', loadout: { ...loadout, gear: null } }))).toEqual({
      t: 'loadout',
      loadout: { ...loadout, gear: null },
    });
    // Un arma o un equipo inventados descartan el mensaje entero.
    expect(decodeGuestCtl(JSON.stringify({ t: 'loadout', loadout: { ...loadout, primary: 'lanzallamas' } }))).toBeNull();
    expect(decodeGuestCtl(JSON.stringify({ t: 'loadout', loadout: { ...loadout, gear: 'nuclear' } }))).toBeNull();
    const back = { t: 'hello' as const, v: PROTOCOL, tables: TABLES_HASH, upgrades: [], loadout, rejoin: { id: 2, token: 'abcdefghijkm2345' } };
    expect(decodeGuestCtl(encodeGuestCtl(back)), 'con la plaza que tenía').toEqual(back);
    expect(decodeGuestCtl(encodeGuestCtl({ ...back, rejoin: { id: 2, token: 'corta' } })), 'contraseña malformada').toBeNull();
    const msgs: HostCtl[] = [
      { t: 'welcome', id: 2, token: 'abcdefghijkm2345' },
      { t: 'lobby', ids: [0, 2], level: null },
      { t: 'lobby', ids: [0, 1, 2], level: 'nightclub' },
      { t: 'start', level: 'docks', mission: 'docks' },
      { t: 'start', level: 'arena', mission: null },
      { t: 'hud', k: 'toast', text: '¡Refuerzos!', seconds: 2.5 },
      { t: 'hud', k: 'combat', on: false },
      { t: 'me', ev: { e: 'award', action: 'headshot', points: 300 } },
      { t: 'me', ev: { e: 'spawn', x: 1, y: 0, z: 2, yaw: 0.5, epoch: 3 } },
      { t: 'end', r: { mission: 'nightclub', success: true, failReason: '', rank: 'A', total: 82, timeSec: 300, kills: 14, coins: 450 } },
    ];
    for (const m of msgs) expect(decodeHostCtl(encodeHostCtl(m))).toEqual(m);
  });

  it('lo malformado se descarta entero, sin lanzar', () => {
    const good = encodeInput([emptyInputFrame()]);
    const bad = [
      '',
      'no es json',
      '{"t":"i","f":[[1,2]]}',
      good.replace('[0,0,0,', '[-5,0,0,'),
      good.replace('[0,0,0,', '[1.5,0,0,'),
      '{"t":"i","f":[' +
        Array(20)
          .fill(JSON.parse(good).f[0] ? JSON.stringify(JSON.parse(good).f[0]) : '[]')
          .join(',') +
        ']}',
      'x'.repeat(MAX_MESSAGE_CHARS + 1),
    ];
    for (const s of bad) expect(decodeInput(s), s.slice(0, 40)).toBeNull();
    expect(decodeInput(good.replace(/,-1,0,0,0,0,0,0,-1\]/, ',-1,0,0,0,0,0,0,0]')), 'un apuntado nulo no es un apuntado').toBeNull();
    expect(decodeGuestCtl('{"t":"hello","v":1,"tables":"x","upgrades":["hackeo"]}'), 'mejoras que no existen').toBeNull();
    expect(decodeGuestCtl('{"t":"ready","level":"../../etc"}')).toBeNull();
    expect(decodeHostCtl('{"t":"welcome","id":0}'), 'el 0 es el anfitrión').toBeNull();
    expect(decodeHostCtl(`{"t":"hud","k":"toast","text":"${'a'.repeat(500)}","seconds":1}`), 'textos largos').toBeNull();
    expect(decodeHostCtl('{"t":"me","ev":{"e":"marker","kind":"nuke"}}')).toBeNull();
    // Una instantánea vacía vale; con un solo dato malo, se descarta entera.
    const snap = (over: Record<string, unknown>): string =>
      JSON.stringify({ t: 's', k: 1, p: [], e: [], c: [], u: [], g: [], f: [], m: [0, 0, 0, 0, 0, 0, -1, 0, 0], ...over });
    expect(decodeSnapshot(snap({}))).not.toBeNull();
    expect(decodeSnapshot(snap({ f: [[99, 0]] })), 'efecto desconocido').toBeNull();
    expect(decodeSnapshot(snap({ f: [[0, 0, 1, 1, 1, 0, 1, 0, 7, 3]] })), 'impacto fuera de tabla').toBeNull();
    expect(decodeSnapshot(snap({ f: [[FX.grenade, -1, 9, 0, 0, 0]] })), 'sonido de granada fuera de tabla').toBeNull();
    expect(decodeSnapshot(snap({ g: [[1, 0, 0, 0, 0, 0]] }))).not.toBeNull();
    expect(decodeSnapshot(snap({ g: [[1, 7, 0, 0, 0, 0]] })), 'granada de un tipo que no existe').toBeNull();
    expect(decodeSnapshot(snap({ g: [[1, 0, 9, 0, 0, 0]] })), 'granada de un jugador que no existe').toBeNull();
    expect(decodeSnapshot(snap({ g: undefined })), 'sin la lista de granadas').toBeNull();
  });

  it('una instantánea con veinte enemigos cabe de sobra a 20 por segundo', () => {
    const enemies = Array.from({ length: 20 }, (_, i) => {
      const e = emptyEnemyNet();
      Object.assign(e, { uid: i + 1, health: 87.3, detection: 0.37, telegraph: 0.12, lookX: 12.345, lookY: 1.6, lookZ: -33.21 });
      Object.assign(e.move, { x: 10.123 + i, y: 0.25, z: -20.456, yaw: 2.3456, stateTime: 12.34 });
      return e;
    });
    const body = encodeSnapshotBody({ tick: 123456, players: [], enemies, civilians: [], pickups: [], grenades: [], fx: [], mission: emptyMissionNet() });
    // Unos 3 KB: 60 KB/s por invitado, nada para un canal de datos.
    expect(body.length).toBeLessThan(4000);
  });
});
