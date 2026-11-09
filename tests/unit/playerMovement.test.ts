import { Vector3 } from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { FIXED_DT } from '../../src/core/Loop';
import { Rng } from '../../src/core/rng';
import { emptyIntent, MOVE, PlayerController, type PlayerIntent } from '../../src/entities/PlayerController';
import { arena } from '../../src/levels/data/arena';
import { buildLevelPhysics } from '../../src/levels/levelPhysics';
import { loadRapier, PhysicsWorld, type Rapier } from '../../src/physics/Physics';

/**
 * Checklist anti-bugs de movimiento sobre el mundo Rapier REAL de la arena de pruebas.
 * Cada paso verifica invariantes: sin penetración, sin NaN, velocidad acotada.
 */

let R: Rapier;
beforeAll(async () => {
  R = await loadRapier();
});

const NORTH = 0;
const SOUTH = Math.PI;
const EAST = -Math.PI / 2;
const WEST = Math.PI / 2;

interface Ctx {
  physics: PhysicsWorld;
  p: PlayerController;
  violations: string[];
  steps: number;
  /** Altura máxima de los pies durante la prueba. */
  maxY: number;
}

function setup(x: number, y: number, z: number, yaw = NORTH): Ctx {
  const physics = new PhysicsWorld(R);
  buildLevelPhysics(arena, physics);
  physics.step();
  const p = new PlayerController(physics, new Vector3(x, y + 0.02, z), yaw);
  p.killY = arena.killY;
  physics.step();
  return { physics, p, violations: [], steps: 0, maxY: p.feet.y };
}

function run(ctx: Ctx, seconds: number, intent: (t: number) => Partial<PlayerIntent>): void {
  const n = Math.round(seconds / FIXED_DT);
  for (let i = 0; i < n; i++) {
    const it: PlayerIntent = { ...emptyIntent(), ...intent(i * FIXED_DT) };
    ctx.p.fixedUpdate(FIXED_DT, it);
    ctx.physics.step();
    ctx.steps++;
    const f = ctx.p.feet;
    ctx.maxY = Math.max(ctx.maxY, f.y);
    if (!Number.isFinite(f.x + f.y + f.z)) ctx.violations.push(`NaN en paso ${ctx.steps}`);
    if (ctx.p.penetration()) ctx.violations.push(`penetración en (${f.x.toFixed(2)}, ${f.y.toFixed(2)}, ${f.z.toFixed(2)}) estado=${ctx.p.state}`);
  }
}

function expectClean(ctx: Ctx): void {
  expect(ctx.violations.slice(0, 5)).toEqual([]);
  expect(ctx.p.nanResets).toBe(0);
  expect(ctx.p.killPlaneResets).toBe(0);
  expect(ctx.p.maxHorizontalSpeed).toBeLessThanOrEqual(MOVE.maxHorizontal);
}

const sprint = (yaw: number) => () => ({ moveY: 1, sprint: true, camYaw: yaw });
const walk = (yaw: number) => () => ({ moveY: 1, camYaw: yaw });

describe('Movimiento · paredes y túnel', () => {
  it('sprint contra las cuatro paredes exteriores: se detiene en la pared, sin penetrar', () => {
    const cases: Array<[number, number, number, (p: PlayerController) => void]> = [
      [10, 4, EAST, (p) => expect(p.feet.x).toBeGreaterThan(23.4)],
      [-10, 4, WEST, (p) => expect(p.feet.x).toBeLessThan(-23.4)],
      [0, -8, NORTH, (p) => expect(p.feet.z).toBeLessThan(-23.4)],
      [8, 8, SOUTH, (p) => expect(p.feet.z).toBeGreaterThan(23.4)],
    ];
    for (const [x, z, yaw, check] of cases) {
      const ctx = setup(x, 0, z, yaw);
      run(ctx, 4, sprint(yaw));
      check(ctx.p);
      // Dentro del recinto (interior ±24 menos el radio).
      expect(Math.abs(ctx.p.feet.x)).toBeLessThan(24 - 0.3);
      expect(Math.abs(ctx.p.feet.z)).toBeLessThan(24 - 0.3);
      expectClean(ctx);
    }
  });

  it('pared de 0,1 m a velocidad ×6 (42 m/s): no hay túnel', () => {
    const ctx = setup(9.5, 0, 12, EAST);
    ctx.p.speedMultiplier = 6;
    run(ctx, 2, sprint(EAST));
    expect(ctx.p.feet.x).toBeLessThan(11.95 - 0.3);
    expect(ctx.violations).toEqual([]);
  });

  it('roll y slide contra una pared tampoco atraviesan', () => {
    const ctx = setup(10, 0, 4, EAST);
    run(ctx, 1.2, sprint(EAST));
    run(ctx, 0.05, () => ({ moveY: 1, sprint: true, camYaw: EAST, crouchPressed: true }));
    run(ctx, 1, sprint(EAST));
    run(ctx, 0.05, () => ({ moveY: 1, camYaw: EAST, dodgePressed: true }));
    run(ctx, 1, sprint(EAST));
    expect(ctx.p.feet.x).toBeLessThan(24 - 0.3);
    expectClean(ctx);
  });
});

describe('Movimiento · atascos', () => {
  it('esquina en V aguda: empujar y luego salir', () => {
    const ctx = setup(-15, 0, 15.5, SOUTH);
    run(ctx, 2.5, walk(SOUTH));
    const wedged = ctx.p.feet.clone();
    run(ctx, 1.5, () => ({ moveY: -1, camYaw: SOUTH }));
    expect(ctx.p.feet.distanceTo(wedged)).toBeGreaterThan(1.0);
    expectClean(ctx);
  });

  it('esquina en L: empujar en diagonal y luego salir', () => {
    const yaw = Math.atan2(2.2, -2.7);
    const ctx = setup(-8, 0, 17, yaw);
    run(ctx, 2.5, sprint(yaw));
    const wedged = ctx.p.feet.clone();
    run(ctx, 1.5, () => ({ moveY: -1, camYaw: yaw }));
    expect(ctx.p.feet.distanceTo(wedged)).toBeGreaterThan(1.0);
    expectClean(ctx);
  });

  it('hueco de 0,5 m no deja pasar y no atasca; el de 0,8 m sí deja pasar', () => {
    const narrow = setup(-20.25, 0, 10, SOUTH);
    run(narrow, 2, walk(SOUTH));
    expect(narrow.p.feet.z).toBeLessThan(11.3);
    const stuckAt = narrow.p.feet.z;
    run(narrow, 1, () => ({ moveY: -1, camYaw: SOUTH }));
    expect(stuckAt - narrow.p.feet.z).toBeGreaterThan(0.8);
    expectClean(narrow);

    const wide = setup(-18.6, 0, 10, SOUTH);
    run(wide, 3, walk(SOUTH));
    expect(wide.p.feet.z).toBeGreaterThan(13.5);
    expectClean(wide);
  });

  it('escaleras de 0,20 y 0,32 m se suben solas (autostep) y se bajan sin flotar', () => {
    const a = setup(-20, 0, -8.5, NORTH);
    run(a, 2.0, walk(NORTH));
    expect(a.maxY).toBeGreaterThan(1.55);
    expect(a.p.feet.y).toBeGreaterThan(1.55); // arriba, sobre la plataforma
    expectClean(a);
    const b = setup(-15, 0, -9.5, NORTH);
    run(b, 1.6, walk(NORTH));
    expect(b.p.feet.y).toBeGreaterThan(1.55);
    expectClean(b);
    // Bajar: termina en el suelo, en estado "ground" (snap a cada peldaño).
    run(b, 3, () => ({ moveY: 1, camYaw: SOUTH }));
    expect(b.p.feet.y).toBeLessThan(0.05);
    expect(b.p.state).toBe('ground');
    expectClean(b);
  });

  it('escalón de 0,5 m bloquea al caminar (no es autostep) sin atascar', () => {
    const ctx = setup(-9.5, 0, -11, NORTH);
    run(ctx, 2, walk(NORTH));
    expect(ctx.p.feet.y).toBeLessThan(0.1);
    expect(ctx.p.feet.z).toBeGreaterThan(-12.8 - 0.05);
    run(ctx, 1, () => ({ moveY: -1, camYaw: NORTH }));
    expect(ctx.p.feet.z).toBeGreaterThan(-12);
    expectClean(ctx);
  });

  it('rampas de 15°, 30° y 45° se suben; la de 55° no', () => {
    for (const [x, z] of [
      [10, -7],
      [13.4, -10.5],
      [16.8, -11.5],
    ] as const) {
      const ctx = setup(x, 0, z, NORTH);
      run(ctx, 4, walk(NORTH));
      expect(ctx.maxY, `rampa en x=${x}`).toBeGreaterThan(1.55);
      expectClean(ctx);
    }
    const steep = setup(20.3, 0, -11.8, NORTH);
    run(steep, 4, sprint(NORTH));
    expect(steep.maxY).toBeLessThan(1.2);
    expectClean(steep);
  });

  it('túnel bajo: de pie no entra; agachado pasa; dentro no se puede levantar', () => {
    const standing = setup(14.5, 0, 11, EAST);
    run(standing, 2, walk(EAST));
    expect(standing.p.feet.x).toBeLessThan(16 - 0.25);
    expectClean(standing);

    const ctx = setup(14.5, 0, 11, EAST);
    run(ctx, 1 / 60, () => ({ crouchPressed: true, camYaw: EAST }));
    expect(ctx.p.posture).toBe('crouch');
    run(ctx, 2.2, walk(EAST));
    expect(ctx.p.feet.x).toBeGreaterThan(17);
    expect(ctx.p.feet.x).toBeLessThan(21);
    // Intenta levantarse dentro: debe seguir agachado (sin quedar trabado en el techo).
    run(ctx, 1 / 60, () => ({ crouchPressed: true, camYaw: EAST }));
    expect(ctx.p.posture).toBe('crouch');
    run(ctx, 3, walk(EAST));
    expect(ctx.p.feet.x).toBeGreaterThan(22.3);
    // Fuera del túnel, mirando a campo abierto (mirando a la pared, C sería "cubrirse").
    run(ctx, 1 / 60, () => ({ crouchPressed: true, camYaw: NORTH }));
    expect(ctx.p.posture).toBe('stand');
    expectClean(ctx);
  });

  it('borde de plataforma: caer y aterrizar limpio', () => {
    const ctx = setup(0, 1.0, 15, WEST);
    run(ctx, 2.5, walk(WEST));
    expect(ctx.p.feet.y).toBeLessThan(0.05);
    expect(ctx.p.state).toBe('ground');
    expectClean(ctx);
  });
});

describe('Movimiento · vault, mantle y cobertura', () => {
  for (const [label, x, h] of [
    ['0,5 m', -4, 0.5],
    ['0,9 m', 0, 0.9],
    ['1,2 m', 4, 1.2],
  ] as const) {
    it(`vault sobre caja de ${label}`, () => {
      const ctx = setup(x, 0, 1.4, NORTH);
      run(ctx, 0.25, walk(NORTH));
      run(ctx, 1 / 60, () => ({ moveY: 1, camYaw: NORTH, jumpPressed: true }));
      expect(ctx.p.state).toBe('vault');
      run(ctx, 1.5, walk(NORTH));
      expect(ctx.p.feet.z, `pasó al otro lado (h=${h})`).toBeLessThan(-0.75);
      expect(ctx.p.stats.vaults).toBe(1);
      expect(ctx.p.state).toBe('ground');
      expectClean(ctx);
    });
  }

  it('mantle sobre la caja profunda (1 m alto, 2,5 m de fondo)', () => {
    const ctx = setup(-4.5, 0, -2.4, NORTH);
    run(ctx, 0.3, walk(NORTH));
    run(ctx, 1 / 60, () => ({ moveY: 1, camYaw: NORTH, jumpPressed: true }));
    run(ctx, 1.0, () => ({ camYaw: NORTH }));
    expect(ctx.p.stats.mantles).toBe(1);
    expect(ctx.p.feet.y).toBeGreaterThan(0.95);
    expectClean(ctx);
  });

  it('muro de 2,2 m: Espacio hace un salto normal (no vault) y no atraviesa', () => {
    const ctx = setup(0, 0, -3.3, NORTH);
    run(ctx, 1 / 60, () => ({ moveY: 1, camYaw: NORTH, jumpPressed: true }));
    expect(ctx.p.state).toBe('air');
    run(ctx, 1.5, walk(NORTH));
    expect(ctx.p.feet.z).toBeGreaterThan(-4.2);
    expect(ctx.p.stats.vaults + ctx.p.stats.mantles).toBe(0);
    expectClean(ctx);
  });

  it('cobertura alta: entra con C, se desliza y se detiene en el borde', () => {
    const ctx = setup(0, 0, -3.4, NORTH);
    run(ctx, 1 / 60, () => ({ camYaw: NORTH, crouchPressed: true }));
    expect(ctx.p.state).toBe('cover');
    expect(ctx.p.cover?.height).toBe('high');
    run(ctx, 3, () => ({ moveX: 1, camYaw: NORTH }));
    expect(ctx.p.state).toBe('cover');
    expect(ctx.p.cover?.edge).toBe(1);
    // No pasa más allá del final del muro (x = 1,5) más el radio.
    expect(ctx.p.feet.x).toBeLessThan(1.5 + 0.35);
    expect(ctx.p.feet.x).toBeGreaterThan(1.0);
    run(ctx, 1 / 60, () => ({ camYaw: NORTH, crouchPressed: true }));
    expect(ctx.p.state).toBe('ground');
    expectClean(ctx);
  });

  it('cobertura baja: agachado; al apuntar asoma de pie; Espacio salta por encima', () => {
    const ctx = setup(0, 0, 1.15, NORTH);
    run(ctx, 1 / 60, () => ({ camYaw: NORTH, crouchPressed: true }));
    expect(ctx.p.state).toBe('cover');
    expect(ctx.p.cover?.height).toBe('low');
    run(ctx, 0.2, () => ({ camYaw: NORTH }));
    expect(ctx.p.posture).toBe('crouch');
    run(ctx, 0.2, () => ({ camYaw: NORTH, aim: true }));
    expect(ctx.p.posture).toBe('stand');
    run(ctx, 1 / 60, () => ({ camYaw: NORTH, jumpPressed: true }));
    expect(ctx.p.state).toBe('vault');
    run(ctx, 1.5, () => ({ camYaw: NORTH }));
    expect(ctx.p.feet.z).toBeLessThan(-0.75);
    expectClean(ctx);
  });
});

describe('Movimiento · acciones encadenadas (fuzz)', () => {
  it('60 s de sprint/slide/roll/salto/doble salto/vault/cobertura aleatorios: física intacta', () => {
    const rng = new Rng(4242);
    const ctx = setup(0, 0, 3, NORTH);
    let intent: Partial<PlayerIntent> = {};
    let next = 0;
    const maxStateTime: Record<string, number> = {};
    let lastState = ctx.p.state;
    let stateTimer = 0;
    run(ctx, 60, (t) => {
      if (t >= next) {
        next = t + rng.range(0.05, 0.35);
        intent = {
          moveX: rng.range(-1, 1),
          moveY: rng.range(-0.4, 1),
          camYaw: rng.range(-Math.PI, Math.PI),
          sprint: rng.chance(0.5),
          aim: rng.chance(0.2),
          crouchPressed: rng.chance(0.15),
          jumpPressed: rng.chance(0.2),
          dodgePressed: rng.chance(0.1),
        };
      } else {
        intent = { ...intent, crouchPressed: false, jumpPressed: false, dodgePressed: false };
      }
      const s = ctx.p.state;
      if (s === lastState) stateTimer += FIXED_DT;
      else {
        stateTimer = 0;
        lastState = s;
      }
      maxStateTime[s] = Math.max(maxStateTime[s] ?? 0, stateTimer);
      return intent;
    });
    expectClean(ctx);
    // Ninguna acción "temporal" se queda colgada.
    expect(maxStateTime.roll ?? 0).toBeLessThanOrEqual(MOVE.rollTime + 0.05);
    expect(maxStateTime.slide ?? 0).toBeLessThanOrEqual(MOVE.slideTime + 0.05);
    expect(maxStateTime.vault ?? 0).toBeLessThan(1.5);
    // Siguió dentro del recinto.
    expect(Math.abs(ctx.p.feet.x)).toBeLessThan(24);
    expect(Math.abs(ctx.p.feet.z)).toBeLessThan(24);
  });
});
