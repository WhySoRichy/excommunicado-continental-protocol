import { simWorld } from './support/world';
import { Vector3 } from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { type PlayerSlot, REMOTE_RESPAWN } from '../../src/combat/PlayerRoster';
import { type CombatAudio, SILENT_AUDIO } from '../../src/combat/ports';
import { FIXED_DT } from '../../src/core/Loop';
import { newProfile } from '../../src/core/Save';
import type { PlayerTarget } from '../../src/entities/Enemy';
import { arena } from '../../src/levels/data/arena';
import { hub } from '../../src/levels/data/hub';
import { practice } from '../../src/levels/data/practice';
import type { LevelData } from '../../src/levels/types';
import { GAUNTLET_BLOCK } from '../../src/missions/gauntlet';
import { MissionDirector, type MissionOutcome } from '../../src/missions/MissionDirector';
import { loadRapier, type Rapier } from '../../src/physics/Physics';

/**
 * Simulación sin pantalla (docs/ESCALABILIDAD.md): física, jugadores, combate, IA y misión en Node, sin audio, sin
 * efectos y sin cámara (el apuntado llega en la intención de cada jugador). Es lo que necesitará un servidor de
 * partidas; si alguien vuelve a hacer que la simulación dependa de la vista, estas pruebas dejan de compilar o fallan.
 */
let R: Rapier;
beforeAll(async () => {
  R = await loadRapier();
});

/** Mundo de las pruebas con los enemigos del nivel; los jugadores entran en (x, y, z). `onShot` ve cada disparo enemigo. */
function headless(level: LevelData, seed: number, onShot?: (target: PlayerTarget, hit: boolean) => void, audio: CombatAudio = SILENT_AUDIO) {
  const w = simWorld(R, { level, seed, audio, enemyAudio: SILENT_AUDIO, initial: true, onShot: (_e, t, hit) => onShot?.(t, hit) });
  return { ...w, join: (x: number, y: number, z: number, yaw = 0, local = false) => w.join(x, z, { y, yaw, local }) };
}

describe('simulación sin pantalla', () => {
  it('un enemigo ataca al jugador y el jugador lo abate, sin vista ni audio', () => {
    let shotsAtPlayer = 0;
    const w = headless(arena, 7, () => shotsAtPlayer++);
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
    const w = headless(arena, 5, (t) => shotsAt[t.id]!++);
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
    const w = headless(arena, 9);
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
    const w = headless(hub, 11, () => shotsAtPlayer++);
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

describe('varios jugadores: sonido, reaparición y objetivos (fase 2)', () => {
  /** Puerto de audio que apunta cada llamada y si llevaba posición. */
  function recordingAudio(calls: Array<{ name: string; positioned: boolean }>): CombatAudio {
    const rec: Record<string, (...a: unknown[]) => void> = {};
    for (const name of Object.keys(SILENT_AUDIO)) rec[name] = (...a) => calls.push({ name, positioned: a.some((x) => typeof x === 'object' && x !== null) });
    return rec as unknown as CombatAudio;
  }

  function aimAhead(p: PlayerSlot): void {
    p.combatIntent.aim = true;
    p.combatIntent.aimFrom.set(p.controller.feet.x, p.controller.feet.y + 1.7, p.controller.feet.z);
    p.combatIntent.aimDir.set(0, 0, -1);
  }

  it('los disparos de otro jugador suenan donde está; sus avisos de primera persona, no', () => {
    const calls: Array<{ name: string; positioned: boolean }> = [];
    const w = headless(arena, 3, undefined, recordingAudio(calls));
    const local = w.join(0, 0, 9.5, 0, true);
    const remote = w.join(3, 0, 9.5);
    aimAhead(local);
    aimAhead(remote);
    // El otro jugador dispara y recarga.
    remote.combatIntent.firePressed = true;
    w.step();
    remote.combatIntent.firePressed = false;
    w.step(20);
    remote.combatIntent.reloadPressed = true;
    w.step();
    remote.combatIntent.reloadPressed = false;
    w.step(150);
    expect(calls, 'solo su disparo, con posición').toEqual([{ name: 'shot', positioned: true }]);

    // El local, en cambio, oye su disparo de cerca y su recarga.
    calls.length = 0;
    local.combatIntent.firePressed = true;
    w.step();
    local.combatIntent.firePressed = false;
    w.step(20);
    local.combatIntent.reloadPressed = true;
    w.step();
    expect(calls.find((c) => c.name === 'shot')?.positioned, 'su disparo, sin posición').toBe(false);
    expect(
      calls.some((c) => c.name === 'reload'),
      'y su recarga',
    ).toBe(true);
  });

  it('un jugador que no es el local reaparece en el último punto de control', () => {
    const w = headless(arena, 4);
    w.join(0, 0, 9.5, 0, true);
    const remote = w.join(3, 0, 9.5);
    const enemy = w.enemies.spawnAt('thug', new Vector3(0, 0, 4), Math.PI);
    w.roster.respawn.pos.set(-4, 0, 8);
    remote.combat.takeHit(enemy, 9999, remote.ctx);
    expect(remote.combat.dead).toBe(true);
    // A partir de aquí nadie recibe daño: se mide la reaparición, no el combate.
    w.roster.god = true;
    w.step(Math.round(REMOTE_RESPAWN * 60) - 30);
    expect(remote.combat.dead, 'antes de tiempo sigue caído').toBe(true);
    w.step(60);
    expect(remote.combat.dead, 'reaparece').toBe(false);
    expect(remote.controller.feet.distanceTo(w.roster.respawn.pos), 'en el punto de control').toBeLessThan(0.5);
  });

  it('un objetivo de alcanzar una zona se cumple llegue quien llegue', () => {
    const w = headless(practice, 2);
    w.roster.god = true;
    const sp = practice.spawn.pos;
    const local = w.join(sp[0], sp[1], sp[2], practice.spawn.yaw, true);
    const mission = new MissionDirector({
      session: { data: practice, player: local.controller, combat: local.combat, enemies: w.enemies, players: w.roster.slots },
      hud: { showToast() {}, setObjective() {}, setZone() {}, setCombatVisible() {} },
      audio: { ui() {}, alert() {}, siren() {} },
      profile: newProfile(0),
      save() {},
      onFinished() {},
    });
    mission.skipLearn();
    expect(mission.current?.id).toBe('yard');
    w.step(5);
    mission.fixedUpdate(FIXED_DT);
    expect(mission.current?.id, 'nadie en el patio todavía').toBe('yard');
    w.join(4, 0, -11);
    w.step(5);
    mission.fixedUpdate(FIXED_DT);
    expect(mission.current?.id, 'llega el otro jugador y basta').toBe('clear');
  });
});
