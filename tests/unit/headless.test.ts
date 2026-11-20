import { Vector3 } from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { EnemyManager } from '../../src/combat/EnemyManager';
import { Pickups } from '../../src/combat/Pickups';
import { type CombatCtx, emptyCombatIntent, PlayerCombat } from '../../src/combat/PlayerCombat';
import { makePlayerTarget, updatePlayerTarget } from '../../src/combat/playerTarget';
import { NO_VFX, SILENT_AUDIO, STILL_CAMERA } from '../../src/combat/ports';
import { FIXED_DT } from '../../src/core/Loop';
import { newProfile } from '../../src/core/Save';
import { Rng } from '../../src/core/rng';
import type { Enemy, PlayerTarget } from '../../src/entities/Enemy';
import { emptyIntent, PlayerController } from '../../src/entities/PlayerController';
import { arena } from '../../src/levels/data/arena';
import { hub } from '../../src/levels/data/hub';
import { buildLevelPhysics } from '../../src/levels/levelPhysics';
import { NavGrid } from '../../src/levels/nav/NavGrid';
import type { LevelData } from '../../src/levels/types';
import { GAUNTLET_BLOCK } from '../../src/missions/gauntlet';
import { MissionDirector, type MissionOutcome } from '../../src/missions/MissionDirector';
import { loadRapier, PhysicsWorld, type Rapier } from '../../src/physics/Physics';

/**
 * Simulación sin pantalla (docs/ESCALABILIDAD.md): física, jugadores, combate, IA y misión en Node, sin audio, sin
 * efectos y sin cámara (el apuntado llega en la intención de cada jugador). Es lo que necesitará un servidor de
 * partidas; si alguien vuelve a hacer que la simulación dependa de la vista, estas pruebas dejan de compilar o fallan.
 */
let R: Rapier;
beforeAll(async () => {
  R = await loadRapier();
});

/** Un jugador simulado: su cuerpo, su combate y el objetivo que ven los enemigos. */
interface SimPlayer {
  controller: PlayerController;
  combat: PlayerCombat;
  target: PlayerTarget;
}

function simPlayer(physics: PhysicsWorld, id: number, x: number, y: number, z: number, yaw = 0): SimPlayer {
  const controller = new PlayerController(physics, new Vector3(x, y + 0.02, z), yaw);
  return { controller, combat: new PlayerCombat(new Set()), target: makePlayerTarget(id, controller) };
}

/** Mundo sin pantalla: física del nivel y enemigos; `onShot` recibe cada disparo enemigo a un jugador. */
function simWorld(level: LevelData, seed: number, onShot: (target: PlayerTarget, hit: boolean, dmg: number) => void) {
  const physics = new PhysicsWorld(R);
  buildLevelPhysics(level, physics);
  physics.step();
  const rng = new Rng(seed);
  const enemies = new EnemyManager({
    level,
    physics,
    nav: NavGrid.build(level),
    vfx: NO_VFX,
    audio: SILENT_AUDIO,
    rng,
    accuracyMult: 1,
    damageMult: 1,
    onShotAtPlayer: (_enemy, target, hit, dmg) => onShot(target, hit, dmg),
  });
  enemies.spawnInitial();
  return { physics, rng, enemies };
}

describe('simulación sin pantalla', () => {
  it('un enemigo ataca al jugador y el jugador lo abate, sin vista ni audio', () => {
    let shotsAtPlayer = 0;
    let p: SimPlayer | null = null;
    const w = simWorld(arena, 7, (_t, hit, dmg) => {
      shotsAtPlayer++;
      if (hit && p) p.combat.takeHit(enemy, dmg, ctx);
    });
    p = simPlayer(w.physics, 0, 0, 0, 9.5);
    const ctx: CombatCtx = {
      physics: w.physics,
      camera: STILL_CAMERA,
      player: p.controller,
      enemies: w.enemies,
      civilians: null,
      vfx: NO_VFX,
      audio: SILENT_AUDIO,
      rng: w.rng,
      pickups: new Pickups(),
    };
    const enemy: Enemy = w.enemies.spawnAt('thug', new Vector3(0, 0, 4), Math.PI, p.controller.feet.clone());
    w.physics.step();

    const move = { ...emptyIntent(), aim: true, camYaw: 0 };
    const fire = emptyCombatIntent();
    const head = new Vector3();
    const chest = new Vector3();
    for (let i = 0; i < 600 && enemy.alive; i++) {
      // Los tres primeros segundos solo apunta: el enemigo tiene tiempo de atacar.
      fire.aim = true;
      fire.firePressed = i > 180 && i % 12 === 0;
      head.set(p.controller.feet.x, p.controller.feet.y + 1.7, p.controller.feet.z + 2.4);
      chest.set(enemy.feet.x, enemy.feet.y + enemy.height * 0.62, enemy.feet.z);
      // El apuntado llega en la intención, como llegará el de un jugador remoto.
      fire.aimFrom.copy(head);
      fire.aimDir.subVectors(chest, head).normalize();
      p.controller.fixedUpdate(FIXED_DT, move);
      p.combat.fixedUpdate(FIXED_DT, fire, ctx);
      updatePlayerTarget(p.target, p.controller, p.combat, FIXED_DT);
      w.enemies.fixedUpdate(FIXED_DT, [p.target]);
      w.physics.step();
    }

    expect(shotsAtPlayer, 'el enemigo detecta al jugador y le dispara').toBeGreaterThan(0);
    expect(p.combat.vitals.health + p.combat.vitals.armor, 'y le hace daño').toBeLessThan(100 + p.combat.vitals.maxArmor);
    expect(p.combat.stats.shotsFired).toBeGreaterThan(0);
    expect(enemy.alive, 'el jugador lo abate').toBe(false);
  });
});

describe('varios jugadores sin pantalla (fase 2)', () => {
  it('cada enemigo ataca al jugador más cercano y se vuelve hacia quien le dispara', () => {
    const shotsAt = [0, 0];
    const w = simWorld(arena, 5, (t) => shotsAt[t.id]!++);
    // Jugador 0 lejos (al doble de distancia, de sobra para que la regla de la distancia lo descarte); jugador 1 cerca
    // del enemigo. Los dos invulnerables: aquí importa a quién ataca.
    const players = [simPlayer(w.physics, 0, 1.5, 0, 16), simPlayer(w.physics, 1, 0, 0, 9.5)];
    const enemy = w.enemies.spawnAt('thug', new Vector3(0, 0, 4), Math.PI, players[1]!.controller.feet.clone());
    w.physics.step();
    const targets = players.map((p) => p.target);
    const idle = emptyIntent();
    const step = (n: number): void => {
      for (let i = 0; i < n; i++) {
        for (const p of players) {
          p.controller.fixedUpdate(FIXED_DT, idle);
          updatePlayerTarget(p.target, p.controller, p.combat, FIXED_DT, true);
        }
        w.enemies.fixedUpdate(FIXED_DT, targets);
        w.physics.step();
      }
    };

    step(1);
    expect(enemy.target?.id, 'elige al más cercano').toBe(1);
    step(180);
    expect(shotsAt[1], 'y le dispara').toBeGreaterThan(0);
    expect(shotsAt[0], 'al lejano, no').toBe(0);

    // El jugador lejano le dispara: se vuelve hacia él y no lo suelta aunque el otro esté más cerca.
    enemy.applyHit(10, 'body', players[0]!.controller.feet, 1);
    step(1);
    expect(enemy.target?.id, 'se vuelve hacia quien le disparó').toBe(0);
    step(120);
    expect(enemy.target?.id, 'y no duda entre los dos').toBe(0);
  });
});

describe('Gauntlet sin pantalla', () => {
  it('el director de misión real lanza oleadas, los enemigos atacan y se superan tres oleadas', () => {
    let shotsAtPlayer = 0;
    // Jugador invulnerable: aquí se prueba que la partida avanza, no que se sobreviva.
    const w = simWorld(hub, 11, () => shotsAtPlayer++);
    const sp = hub.spawn.pos;
    const p = simPlayer(w.physics, 0, sp[0], sp[1], sp[2], hub.spawn.yaw);
    let outcome: MissionOutcome | null = null;
    const mission = new MissionDirector({
      session: { data: hub, player: p.controller, combat: p.combat, enemies: w.enemies },
      block: GAUNTLET_BLOCK,
      hud: { showToast() {}, setObjective() {}, setZone() {}, setCombatVisible() {} },
      audio: { ui() {}, alert() {}, siren() {} },
      profile: newProfile(0),
      save() {},
      onFinished: (o) => (outcome = o),
    });
    const ctx: CombatCtx = {
      physics: w.physics,
      camera: STILL_CAMERA,
      player: p.controller,
      enemies: w.enemies,
      civilians: null,
      vfx: NO_VFX,
      audio: SILENT_AUDIO,
      rng: w.rng,
      pickups: new Pickups(),
    };
    const idle = emptyIntent();
    const noFire = emptyCombatIntent();
    for (let i = 0; i < 60 * 60 && mission.gauntletWaves < 3; i++) {
      // Un jugador perfecto: abate a un enemigo vivo cada segundo y medio (tiempo de sobra para que ataquen).
      if (i % 90 === 89) w.enemies.enemies.find((e) => e.alive)?.applyHit(9999, 'body', p.controller.feet, 1, true);
      p.controller.fixedUpdate(FIXED_DT, idle);
      p.combat.fixedUpdate(FIXED_DT, noFire, ctx);
      updatePlayerTarget(p.target, p.controller, p.combat, FIXED_DT, true);
      w.enemies.fixedUpdate(FIXED_DT, [p.target]);
      mission.fixedUpdate(FIXED_DT);
      w.physics.step();
    }

    expect(mission.gauntletWaves, 'oleadas superadas').toBeGreaterThanOrEqual(3);
    expect(shotsAtPlayer, 'los enemigos de las oleadas atacan').toBeGreaterThan(0);
    expect(outcome, 'la partida sigue en curso').toBeNull();
  });
});
