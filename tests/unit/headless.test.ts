import { Scene, Vector3 } from 'three';
import { beforeAll, describe, expect, it } from 'vitest';
import { EnemyManager } from '../../src/combat/EnemyManager';
import { Pickups } from '../../src/combat/Pickups';
import { type CombatCtx, emptyCombatIntent, PlayerCombat } from '../../src/combat/PlayerCombat';
import { NO_VFX, SILENT_AUDIO, STILL_CAMERA } from '../../src/combat/ports';
import { FIXED_DT } from '../../src/core/Loop';
import { Rng } from '../../src/core/rng';
import type { PlayerTarget } from '../../src/entities/Enemy';
import { emptyIntent, PlayerController } from '../../src/entities/PlayerController';
import { arena } from '../../src/levels/data/arena';
import { buildLevelPhysics } from '../../src/levels/levelPhysics';
import { NavGrid } from '../../src/levels/nav/NavGrid';
import { loadRapier, PhysicsWorld, type Rapier } from '../../src/physics/Physics';

/**
 * Simulación sin pantalla (fase 1 de docs/ESCALABILIDAD.md): física, jugador, combate e IA en Node, sin audio, sin
 * efectos y sin cámara: el apuntado llega en la intención del jugador. Es lo que necesitará un servidor de partidas; si alguien vuelve a hacer que el combate
 * dependa de la vista, esta prueba deja de compilar o de funcionar.
 */
let R: Rapier;
beforeAll(async () => {
  R = await loadRapier();
});

describe('simulación sin pantalla', () => {
  it('un enemigo ataca al jugador y el jugador lo abate, sin vista ni audio', () => {
    const physics = new PhysicsWorld(R);
    buildLevelPhysics(arena, physics);
    physics.step();
    const rng = new Rng(7);
    const player = new PlayerController(physics, new Vector3(0, 0.02, 9.5), 0);
    const combat = new PlayerCombat(new Set());
    let shotsAtPlayer = 0;
    const enemies = new EnemyManager({
      level: arena,
      physics,
      nav: NavGrid.build(arena),
      vfx: NO_VFX,
      audio: SILENT_AUDIO,
      rng,
      accuracyMult: 1,
      damageMult: 1,
      onShotAtPlayer: (enemy, hit, dmg) => {
        shotsAtPlayer++;
        if (hit) combat.takeHit(enemy, dmg, ctx);
      },
    });
    const ctx: CombatCtx = {
      physics,
      camera: STILL_CAMERA,
      player,
      enemies,
      civilians: null,
      vfx: NO_VFX,
      audio: SILENT_AUDIO,
      rng,
      pickups: new Pickups(new Scene()),
    };
    const target: PlayerTarget = {
      feet: player.feet,
      head: new Vector3(),
      chest: new Vector3(),
      crouched: false,
      speed: 0,
      invulnerable: false,
      alive: true,
      collider: player.collider,
    };
    enemies.spawnInitial();
    const enemy = enemies.spawnAt('thug', new Vector3(0, 0, 4), Math.PI, player.feet.clone());
    physics.step();

    const move = { ...emptyIntent(), aim: true, camYaw: 0 };
    const fire = emptyCombatIntent();
    const head = new Vector3();
    const chest = new Vector3();
    for (let i = 0; i < 600 && enemy.alive; i++) {
      // Los tres primeros segundos solo apunta: el enemigo tiene tiempo de atacar.
      fire.aim = true;
      fire.firePressed = i > 180 && i % 12 === 0;
      head.set(player.feet.x, player.feet.y + 1.7, player.feet.z + 2.4);
      chest.set(enemy.feet.x, enemy.feet.y + enemy.height * 0.62, enemy.feet.z);
      // El apuntado llega en la intención, como llegará el de un jugador remoto.
      fire.aimFrom.copy(head);
      fire.aimDir.subVectors(chest, head).normalize();
      player.fixedUpdate(FIXED_DT, move);
      combat.fixedUpdate(FIXED_DT, fire, ctx);
      target.head.set(player.feet.x, player.feet.y + 1.6, player.feet.z);
      target.chest.set(player.feet.x, player.feet.y + 1.15, player.feet.z);
      target.alive = !combat.dead;
      enemies.fixedUpdate(FIXED_DT, target);
      physics.step();
    }

    expect(shotsAtPlayer, 'el enemigo detecta al jugador y le dispara').toBeGreaterThan(0);
    expect(combat.vitals.health + combat.vitals.armor, 'y le hace daño').toBeLessThan(100 + combat.vitals.maxArmor);
    expect(combat.stats.shotsFired).toBeGreaterThan(0);
    expect(enemy.alive, 'el jugador lo abate').toBe(false);
  });
});
