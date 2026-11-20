import { Vector3 } from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { EnemyManager } from '../../src/combat/EnemyManager';
import { Pickups } from '../../src/combat/Pickups';
import { PlayerCombat } from '../../src/combat/PlayerCombat';
import { PlayerRoster, type PlayerSlot } from '../../src/combat/PlayerRoster';
import { NO_VFX, SILENT_AUDIO } from '../../src/combat/ports';
import { FIXED_DT } from '../../src/core/Loop';
import { newProfile } from '../../src/core/Save';
import { Rng } from '../../src/core/rng';
import type { PlayerTarget } from '../../src/entities/Enemy';
import { PlayerController } from '../../src/entities/PlayerController';
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

/** Mundo sin pantalla con el mismo registro de jugadores que la sesión. `onShot` ve cada disparo enemigo a un jugador. */
function simWorld(level: LevelData, seed: number, onShot?: (target: PlayerTarget, hit: boolean) => void) {
  const physics = new PhysicsWorld(R);
  buildLevelPhysics(level, physics);
  physics.step();
  const rng = new Rng(seed);
  let roster: PlayerRoster | null = null;
  const enemies = new EnemyManager({
    level,
    physics,
    nav: NavGrid.build(level),
    vfx: NO_VFX,
    audio: SILENT_AUDIO,
    rng,
    accuracyMult: 1,
    damageMult: 1,
    onShotAtPlayer: (enemy, target, hit, dmg) => {
      onShot?.(target, hit);
      roster?.shotAt(enemy, target, hit, dmg);
    },
  });
  enemies.spawnInitial();
  const r = new PlayerRoster({ physics, enemies, civilians: null, vfx: NO_VFX, audio: SILENT_AUDIO, rng, pickups: new Pickups() });
  roster = r;
  const join = (x: number, y: number, z: number, yaw = 0): PlayerSlot =>
    r.add(new PlayerController(physics, new Vector3(x, y + 0.02, z), yaw), new PlayerCombat(new Set()));
  /** Un paso de todo: jugadores (con su intención), enemigos y física. */
  const step = (n = 1): void => {
    for (let i = 0; i < n; i++) {
      r.step(FIXED_DT, 0);
      enemies.fixedUpdate(FIXED_DT, r.updateTargets(FIXED_DT));
      physics.step();
    }
  };
  return { physics, enemies, roster: r, join, step };
}

describe('simulación sin pantalla', () => {
  it('un enemigo ataca al jugador y el jugador lo abate, sin vista ni audio', () => {
    let shotsAtPlayer = 0;
    const w = simWorld(arena, 7, () => shotsAtPlayer++);
    const p = w.join(0, 0, 9.5);
    const enemy = w.enemies.spawnAt('thug', new Vector3(0, 0, 4), Math.PI, p.controller.feet.clone());
    w.physics.step();

    p.intent.aim = true;
    p.combatIntent.aim = true;
    const head = new Vector3();
    const chest = new Vector3();
    for (let i = 0; i < 600 && enemy.alive; i++) {
      // Los tres primeros segundos solo apunta: el enemigo tiene tiempo de atacar.
      p.combatIntent.firePressed = i > 180 && i % 12 === 0;
      // El apuntado llega en la intención, como llegará el de un jugador remoto.
      head.set(p.controller.feet.x, p.controller.feet.y + 1.7, p.controller.feet.z + 2.4);
      chest.set(enemy.feet.x, enemy.feet.y + enemy.height * 0.62, enemy.feet.z);
      p.combatIntent.aimFrom.copy(head);
      p.combatIntent.aimDir.subVectors(chest, head).normalize();
      w.step();
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
    // Los dos invulnerables: aquí importa a quién ataca, no el daño.
    w.roster.god = true;
    // Jugador 0 lejos (al doble de distancia, de sobra para que la regla de la distancia lo descarte); jugador 1 cerca.
    const far = w.join(1.5, 0, 16);
    const near = w.join(0, 0, 9.5);
    const enemy = w.enemies.spawnAt('thug', new Vector3(0, 0, 4), Math.PI, near.controller.feet.clone());
    w.physics.step();

    w.step();
    expect(enemy.target?.id, 'elige al más cercano').toBe(near.id);
    w.step(180);
    expect(shotsAt[near.id], 'y le dispara').toBeGreaterThan(0);
    expect(shotsAt[far.id], 'al lejano, no').toBe(0);

    // El jugador lejano le dispara: se vuelve hacia él y no lo suelta aunque el otro esté más cerca.
    enemy.applyHit(10, 'body', far.controller.feet, 1);
    w.step();
    expect(enemy.target?.id, 'se vuelve hacia quien le disparó').toBe(far.id);
    w.step(120);
    expect(enemy.target?.id, 'y no duda entre los dos').toBe(far.id);
  });

  it('el daño de cada disparo enemigo va al jugador al que apuntaba', () => {
    const w = simWorld(arena, 9);
    const far = w.join(1.5, 0, 16);
    const near = w.join(0, 0, 9.5);
    w.enemies.spawnAt('thug', new Vector3(0, 0, 4), Math.PI, near.controller.feet.clone());
    w.physics.step();
    w.step(360);
    expect(near.combat.vitals.health + near.combat.vitals.armor, 'el atacado recibe el daño').toBeLessThan(100 + near.combat.vitals.maxArmor);
    expect(far.combat.vitals.health + far.combat.vitals.armor, 'el otro, ninguno').toBe(100 + far.combat.vitals.maxArmor);
  });
});

describe('Gauntlet sin pantalla', () => {
  it('el director de misión real lanza oleadas, los enemigos atacan y se superan tres oleadas', () => {
    let shotsAtPlayer = 0;
    const w = simWorld(hub, 11, () => shotsAtPlayer++);
    // Jugador invulnerable: aquí se prueba que la partida avanza, no que se sobreviva.
    w.roster.god = true;
    const sp = hub.spawn.pos;
    const p = w.join(sp[0], sp[1], sp[2], hub.spawn.yaw);
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
    for (let i = 0; i < 60 * 60 && mission.gauntletWaves < 3; i++) {
      // Un jugador perfecto: abate a un enemigo vivo cada segundo y medio (tiempo de sobra para que ataquen).
      if (i % 90 === 89) w.enemies.enemies.find((e) => e.alive)?.applyHit(9999, 'body', p.controller.feet, 1, true);
      w.step();
      mission.fixedUpdate(FIXED_DT);
    }

    expect(mission.gauntletWaves, 'oleadas superadas').toBeGreaterThanOrEqual(3);
    expect(shotsAtPlayer, 'los enemigos de las oleadas atacan').toBeGreaterThan(0);
    expect(outcome, 'la partida sigue en curso').toBeNull();
  });
});
