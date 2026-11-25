import { simWorld } from './support/world';
import { Vector3 } from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { FLIGHT, type GrenadeBody, simulateThrow, stepGrenade, STUN, stunSeconds, throwVelocity } from '../../src/combat/Grenades';
import { type PlayerSlot } from '../../src/combat/PlayerRoster';
import { type CombatAudio, type CombatVfx, NO_VFX, SILENT_AUDIO } from '../../src/combat/ports';
import { GEAR, type GearId } from '../../src/combat/weapons';
import { FIXED_DT } from '../../src/core/Loop';
import { arena } from '../../src/levels/data/arena';
import { buildLevelPhysics } from '../../src/levels/levelPhysics';
import { loadRapier, PhysicsWorld, type Rapier } from '../../src/physics/Physics';

/** Granadas aturdidoras sin pantalla: vuelo, estallido y a quién aturde, y el gesto de lanzarlas. */
let R: Rapier;
beforeAll(async () => {
  R = await loadRapier();
});

function arenaPhysics(): PhysicsWorld {
  const physics = new PhysicsWorld(R);
  buildLevelPhysics(arena, physics);
  physics.step();
  return physics;
}

function body(x: number, y: number, z: number, vx: number, vy: number, vz: number): GrenadeBody {
  return { pos: new Vector3(x, y, z), vel: new Vector3(vx, vy, vz), resting: false };
}

/** Mundo con enemigos y jugadores en la arena. */
function world() {
  const bursts: Vector3[] = [];
  const sounds: string[] = [];
  const shots = { n: 0 };
  const vfx: CombatVfx = { ...NO_VFX, burst: (p) => bursts.push(new Vector3(p.x, p.y, p.z)) };
  const audio: CombatAudio = { ...SILENT_AUDIO, grenade: (k) => sounds.push(k), empty: () => sounds.push('empty') };
  const w = simWorld(R, { seed: 21, audio, vfx, onShot: () => shots.n++ });
  const join = (x: number, z: number, gear: GearId | null = 'stun'): PlayerSlot => {
    const s = w.join(x, z, { gear, loadout: ['carbine', 'pistol', 'knife'], ports: true });
    s.combatIntent.aimFrom.set(x, 1.7, z + 2);
    s.combatIntent.aimDir.set(0, 0, -1);
    return s;
  };
  /** Un toque de la tecla: se pulsa un paso. */
  const tap = (s: PlayerSlot): void => {
    s.combatIntent.gearPressed = true;
    w.step();
    s.combatIntent.gearPressed = false;
  };
  return { ...w, join, tap, bursts, sounds, shots };
}

describe('vuelo de una granada', () => {
  it('sale hacia donde se mira, por encima de la mira, y siempre a la misma velocidad', () => {
    const from = { x: 0.2, y: 1.7, z: 0 };
    const eye = { x: 0.6, y: 1.9, z: 2.4 };
    for (const pitch of [-0.8, -0.2, 0, 0.4, 1.2]) {
      const dir = { x: 0, y: Math.sin(pitch), z: -Math.cos(pitch) };
      const v = throwVelocity(from, eye, dir, new Vector3());
      expect(v.length()).toBeCloseTo(FLIGHT.speed, 3);
      expect(v.z, 'hacia delante').toBeLessThan(0);
      expect(Math.asin(v.y / FLIGHT.speed), `inclinación con la mirada a ${pitch}`).toBeCloseTo(Math.min(pitch + FLIGHT.lift, 1.35), 2);
    }
    // Más arriba, más lejos (hasta 45°): se apunta con la inclinación.
    const physics = arenaPhysics();
    const reach = (pitch: number): number => {
      const g = body(0, 1.7, 22, 0, 0, 0);
      throwVelocity(g.pos, { x: 0, y: 1.7, z: 24 }, { x: 0, y: Math.sin(pitch), z: -Math.cos(pitch) }, g.vel);
      g.pos.x = 9;
      for (let i = 0; i < 240 && !g.resting; i++) if (stepGrenade(g, FIXED_DT, physics) > 0) break;
      return 22 - g.pos.z;
    };
    expect(reach(0)).toBeGreaterThan(reach(-0.3) + 3);
    expect(reach(0.3)).toBeGreaterThan(reach(0) + 2);
    physics.dispose();
  });

  it('rebota, rueda y se para sobre el suelo, sin hundirse', () => {
    const physics = arenaPhysics();
    const g = body(9, 1.7, 20, 0, 3, -9);
    let minY = 9;
    let bounces = 0;
    for (let i = 0; i < 600 && !g.resting; i++) {
      if (stepGrenade(g, FIXED_DT, physics) > 1) bounces++;
      minY = Math.min(minY, g.pos.y);
    }
    expect(g.resting, 'se para').toBe(true);
    expect(bounces).toBeGreaterThanOrEqual(1);
    expect(minY).toBeGreaterThan(FLIGHT.radius - 0.02);
    expect(g.pos.y).toBeCloseTo(FLIGHT.radius, 2);
    physics.dispose();
  });

  it('no atraviesa una pared de 10 cm ni a toda velocidad, y vuelve del rebote', () => {
    const physics = arenaPhysics();
    // La pared delgada de la arena: x de 11,95 a 12,05, z de 9 a 15.
    for (const speed of [8, 16, 40]) {
      const g = body(9.5, 1.5, 12, speed, 0.5, 0);
      let maxX = 0;
      for (let i = 0; i < 120; i++) {
        stepGrenade(g, FIXED_DT, physics);
        maxX = Math.max(maxX, g.pos.x);
      }
      expect(maxX, `a ${speed} m/s`).toBeLessThan(11.95);
      expect(g.pos.x, 'rebota').toBeLessThan(maxX);
    }
    physics.dispose();
  });

  it('se cae por el borde de una plataforma al rodar', () => {
    const physics = arenaPhysics();
    // Plataforma de 1 m de alto: x de −4 a 4, z de 12 a 18.
    const g = body(2.6, 1.0 + FLIGHT.radius, 15, 6, 0, 0);
    for (let i = 0; i < 300 && !g.resting; i++) stepGrenade(g, FIXED_DT, physics);
    expect(g.pos.x).toBeGreaterThan(4);
    expect(g.pos.y).toBeCloseTo(FLIGHT.radius, 2);
    physics.dispose();
  });

  it('el arco que se enseña acaba donde estalla de verdad', () => {
    const w = world();
    const from = new Vector3(0, 1.75, 9);
    for (const vel of [new Vector3(3, 4, -14), new Vector3(-6, 9, -10), new Vector3(9, 2, -12)]) {
      const points = Array.from({ length: 40 }, () => new Vector3());
      const n = simulateThrow(w.physics, from, vel, GEAR.stun.fuse, FIXED_DT, 3, points);
      const g = w.grenades.throw('stun', 0, from, vel);
      const before = w.bursts.length;
      for (let i = 0; i < 200 && w.bursts.length === before; i++) w.grenades.fixedUpdate(FIXED_DT);
      expect(w.bursts.length).toBe(before + 1);
      expect(g.pos.distanceTo(points[n - 1]!)).toBeLessThan(0.02);
    }
  });
});

describe('aturdir', () => {
  it('aturde más cerca que lejos, menos de espaldas y nada fuera del radio', () => {
    expect(stunSeconds(0, 1)).toBeCloseTo(STUN.near, 3);
    expect(stunSeconds(STUN.radius, 1)).toBeCloseTo(STUN.far, 3);
    expect(stunSeconds(2, 1)).toBeGreaterThan(stunSeconds(7, 1));
    expect(stunSeconds(4, -1)).toBeLessThan(stunSeconds(4, 1));
    expect(stunSeconds(STUN.radius + 0.1, 1)).toBe(0);
  });

  it('a los que ven el destello; detrás de una pared, no; el blindado aguanta más y el jefe no se aturde', () => {
    const w = world();
    const at = new Vector3(-12, 0.2, 5);
    const mk = (type: 'thug' | 'heavy' | 'boss', x: number, z: number) => w.enemies.spawnAt(type, new Vector3(x, 0, z), Math.PI / 2);
    // El matón y el blindado, a la misma distancia: lo que cambia es cuánto aguanta cada uno.
    const near = mk('thug', -14, 4);
    const heavy = mk('heavy', -14, 6);
    const boss = mk('boss', -14, 5);
    const far = mk('thug', -23, 5);
    w.physics.step();
    expect(w.enemies.stunBlast(at), 'el matón y el blindado').toBe(2);
    expect(near.dazed).toBe(true);
    expect(heavy.dazed).toBe(true);
    expect(near.brain.stunLeft).toBeGreaterThan(heavy.brain.stunLeft * 1.3);
    expect(boss.state, 'el jefe no se aturde').not.toBe('stunned');
    expect(far.state, 'fuera del radio').not.toBe('stunned');

    // Al otro lado del muro de 2,2 m (z de −4,8 a −4,2): no la ve.
    const hidden = w.enemies.spawnAt('thug', new Vector3(0, 0, -5.6), 0);
    const seen = w.enemies.spawnAt('thug', new Vector3(0, 0, -2), 0);
    w.physics.step();
    w.enemies.stunBlast(new Vector3(0, 0.2, -3.4));
    expect(hidden.dazed, 'tras la pared').toBe(false);
    expect(seen.dazed).toBe(true);
  });

  it('se tambalea sin moverse ni disparar y se le pasa: vuelve a disparar', () => {
    const w = world();
    const p = w.join(0, 18);
    const e = w.enemies.spawnAt('thug', new Vector3(0, 0, 8), Math.PI, p.controller.feet.clone());
    w.physics.step();
    w.step(30);
    expect(w.enemies.stunBlast(new Vector3(0, 0.2, 7))).toBe(1);
    const at = e.feet.clone();
    const seconds = e.brain.stunLeft;
    const before = w.shots.n;
    w.step(Math.floor((seconds - 0.3) * 60));
    expect(e.dazed).toBe(true);
    expect(w.shots.n, 'no dispara').toBe(before);
    expect(e.mover.state).toBe('locked');
    expect(e.feet.distanceTo(at), 'quieto').toBeLessThan(0.1);
    w.step(60);
    expect(e.dazed).toBe(false);
    expect(e.state).not.toBe('stunned');
    expect(e.mover.state, 'ya no está bloqueado').not.toBe('locked');
    w.step(240);
    expect(w.shots.n, 'vuelve a la pelea').toBeGreaterThan(before);
  });

  it('el takedown da un paso hasta agarrarlo y, si hay un muro de por medio, no lo atraviesa', () => {
    const w = world();
    const p = w.join(0, 8);
    const a = w.enemies.spawnAt('thug', new Vector3(0, 0, 6.3), 0);
    w.physics.step();
    p.combatIntent.aimDir.set(0, 0, -1);
    p.combatIntent.takedownPressed = true;
    w.step();
    p.combatIntent.takedownPressed = false;
    expect(p.controller.state).toBe('locked');
    w.step(14);
    const gap = Math.hypot(a.feet.x - p.controller.feet.x, a.feet.z - p.controller.feet.z);
    expect(gap, 'a la distancia de un brazo').toBeLessThan(0.95);
    expect(gap, 'sin meterse en él').toBeGreaterThan(0.6);
    expect(a.thrownT, 'ya lo está proyectando').toBeGreaterThan(0);
    expect(p.controller.penetration()).toBeNull();
    w.step(60);
    expect(a.alive).toBe(false);
    expect(p.controller.state).toBe('ground');
  });

  it('un takedown a un aturdido lo remata sin que se recupere a mitad, y sus bajas puntúan', () => {
    const w = world();
    const p = w.join(0, 8);
    const a = w.enemies.spawnAt('thug', new Vector3(0, 0, 6.6), 0);
    const b = w.enemies.spawnAt('thug', new Vector3(3, 0, 5), 0);
    w.physics.step();
    w.enemies.stunBlast(new Vector3(1.5, 0.2, 5.5));
    expect(a.dazed && b.dazed).toBe(true);
    a.brain.stunLeft = 0.2;
    p.combatIntent.takedownPressed = true;
    w.step();
    p.combatIntent.takedownPressed = false;
    w.step(60);
    expect(a.alive, 'rematado aunque el aturdimiento se le acabara').toBe(false);
    // Al otro, de un disparo al cuerpo estando aturdido.
    b.applyHit(500, 'body', p.controller.feet, 1);
    expect(b.diedDazed).toBe(true);
    expect(a.diedDazed, 'el del takedown cuenta como takedown').toBe(false);
  });

  it('quien la oye sin verla se entera; quien la lanza puntúa una vez por granada', () => {
    const w = world();
    const p = w.join(0, 18);
    const deaf = w.enemies.spawnAt('thug', new Vector3(0, 0, -5.6), 0);
    w.enemies.spawnAt('thug', new Vector3(1, 0, -2), Math.PI);
    w.enemies.spawnAt('thug', new Vector3(-1, 0, -2), Math.PI);
    w.physics.step();
    w.grenades.throw('stun', p.id, new Vector3(0, 0.06, -3.2), new Vector3(0, 0, 0));
    w.step(Math.ceil(GEAR.stun.fuse * 60) + 2);
    expect(w.bursts).toHaveLength(1);
    expect(deaf.dazed).toBe(false);
    expect(deaf.state, 'la ha oído').not.toBe('patrol');
    expect(p.combat.stats.stunned).toBe(2);
    expect(p.combat.style.counts.stunned).toBe(1);
  });
});

describe('lanzar el equipo', () => {
  it('un toque lanza una; manteniendo, espera hasta soltar; sin equipo o sin granadas, nada', () => {
    const w = world();
    const p = w.join(9, 20);
    const c = p.combat;
    expect(c.gearLeft).toBe(GEAR.stun.count);
    w.tap(p);
    expect(c.throwing).toBe(true);
    w.step(30);
    expect(c.gearLeft).toBe(GEAR.stun.count - 1);
    expect(w.grenades.items).toHaveLength(1);
    expect(w.grenades.items[0]!.owner).toBe(p.id);
    expect(w.sounds.slice(0, 2)).toEqual(['pin', 'throw']);
    w.step(30);
    expect(c.throwing, 'el gesto termina').toBe(false);

    // Manteniendo: el arco a la vista y nada sale de la mano.
    p.combatIntent.gearPressed = true;
    p.combatIntent.gearHeld = true;
    w.step();
    p.combatIntent.gearPressed = false;
    w.step(120);
    expect(c.throwReady).toBe(true);
    expect(c.gearLeft).toBe(GEAR.stun.count - 1);
    p.combatIntent.gearHeld = false;
    w.step(12);
    expect(c.gearLeft).toBe(GEAR.stun.count - 2);
    w.step(60);

    // Sin granadas: suena a vacío y no hay gesto.
    w.tap(p);
    expect(c.throwing).toBe(false);
    expect(w.sounds).toContain('empty');
    c.respawnReset();
    expect(c.gearLeft, 'al reaparecer se repone').toBe(GEAR.stun.count);
    const none = w.join(4, 20, null);
    w.tap(none);
    expect(none.combat.throwing).toBe(false);
  });

  it('antes de lanzar se puede guardar: recargando (sin recargar) o cambiando de arma', () => {
    const w = world();
    const p = w.join(9, 20);
    const c = p.combat;
    const hold = (): void => {
      p.combatIntent.gearPressed = true;
      p.combatIntent.gearHeld = true;
      w.step();
      p.combatIntent.gearPressed = false;
      w.step(20);
      expect(c.throwReady).toBe(true);
    };
    c.weapon.mag = 3;
    hold();
    p.combatIntent.reloadPressed = true;
    w.step();
    p.combatIntent.reloadPressed = false;
    expect(c.throwing).toBe(false);
    expect(c.weapon.reloading, 'guardarla no recarga').toBe(false);
    p.combatIntent.gearHeld = false;
    // El brazo baja por donde subió (sin saltos en la pose) y ya se puede disparar mientras baja.
    let phase = c.throwPhase;
    expect(phase).toBeGreaterThan(0.3);
    p.combatIntent.firePressed = true;
    w.step();
    p.combatIntent.firePressed = false;
    expect(c.stats.shotsFired).toBe(1);
    while (c.throwPhase >= 0) {
      expect(c.throwPhase).toBeLessThanOrEqual(phase);
      expect(phase - c.throwPhase, 'poco a poco').toBeLessThan(0.06);
      phase = c.throwPhase;
      w.step();
    }
    expect(phase).toBeLessThan(0.06);
    w.step(60);
    expect(w.grenades.items).toHaveLength(0);

    hold();
    p.combatIntent.select = 'primary';
    w.step();
    p.combatIntent.select = null;
    p.combatIntent.gearHeld = false;
    expect(c.throwing).toBe(false);
    expect(c.current, 'cambia de arma').toBe('carbine');
    w.step(60);
    expect(c.gearLeft).toBe(GEAR.stun.count);
    expect(w.grenades.items).toHaveLength(0);
  });

  it('con la granada en la mano no se dispara; al caer, se guarda', () => {
    const w = world();
    const p = w.join(9, 20);
    const c = p.combat;
    p.combatIntent.gearPressed = true;
    p.combatIntent.gearHeld = true;
    w.step();
    p.combatIntent.gearPressed = false;
    p.combatIntent.firePressed = true;
    p.combatIntent.fireHeld = true;
    w.step(30);
    expect(c.stats.shotsFired).toBe(0);
    const e = w.enemies.spawnAt('thug', new Vector3(9, 0, 10), 0);
    c.takeHit(e, 1000, p.ctx);
    expect(c.dead).toBe(true);
    expect(c.throwing).toBe(false);
  });

  it('desde una cobertura baja pasa por encima de ella', () => {
    const w = world();
    // Frente a la caja de 1,2 m (z de −0,4 a 0,4, x de 3,2 a 4,8), pegado a ella y agachado.
    const p = w.join(4, 1.6);
    p.intent.camYaw = 0;
    p.intent.crouchPressed = true;
    w.step();
    p.intent.crouchPressed = false;
    w.step(40);
    expect(p.controller.state).toBe('cover');
    expect(p.controller.posture).toBe('crouch');
    p.combatIntent.aimFrom.set(4.5, 1.6, 3.4);
    w.tap(p);
    w.step(20);
    const g = w.grenades.items[0]!;
    expect(g.pos.y, 'por encima').toBeGreaterThan(1.2);
    w.step(30);
    expect(g.pos.z, 'al otro lado').toBeLessThan(-1);
  });

  it('pegado a una pared o bajo un techo bajo, la granada no nace al otro lado', () => {
    const w = world();
    // Pared delgada: x de 11,95 a 12,05. El jugador, pegado a ella y mirándola.
    const p = w.join(11.57, 12);
    p.combatIntent.aimFrom.set(9.5, 1.7, 12);
    p.combatIntent.aimDir.set(1, 0, 0);
    w.tap(p);
    let maxX = 0;
    for (let i = 0; i < 90; i++) {
      w.step();
      for (const g of w.grenades.items) maxX = Math.max(maxX, g.pos.x);
    }
    expect(maxX).toBeGreaterThan(11);
    expect(maxX).toBeLessThan(11.95);

    // Un dintel justo sobre la cabeza: la mano en alto quedaría dentro.
    w.physics.addStaticBox({ x: 9, y: 2, z: 20 }, { x: 1, y: 0.17, z: 1 });
    w.physics.step();
    const q = w.join(9, 20);
    w.tap(q);
    let maxY = 0;
    let seen = 0;
    for (let i = 0; i < 40; i++) {
      w.step();
      for (const g of w.grenades.items) {
        if (g.owner !== q.id || g.pos.z < 19) continue;
        seen++;
        maxY = Math.max(maxY, g.pos.y);
      }
    }
    expect(seen, 'sale').toBeGreaterThan(0);
    expect(maxY, 'por debajo del dintel').toBeLessThan(1.83);
  });
});
