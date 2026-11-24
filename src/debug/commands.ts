import { Vector3 } from 'three';
import type { Game } from '../game/Game';
import type { LevelSession } from '../game/LevelSession';
import { addCoins } from '../hub/economy';
import type { EnemyType } from '../levels/types';

/**
 * Comandos del overlay F3: colisiones, modo dios, munición infinita, enemigos, monedas,
 * checkpoints, velocidad y cámara lenta. Solo los registra `installQa`, así que existen en
 * desarrollo y en el build de pruebas; el build público no incluye este módulo.
 */
export function registerDebugCommands(game: Game): void {
  const d = game.debug;
  d.addCommand(
    'collisions',
    'Colisiones',
    () => {
      game.collisionView.setEnabled(!game.collisionView.enabled);
      if (game.session) game.collisionView.refresh(game.session.physics);
    },
    { hotkey: 'KeyU', isOn: () => game.collisionView.enabled },
  );
  d.addCommand(
    'god',
    'God mode',
    () => {
      if (game.session) game.session.god = !game.session.god;
    },
    { hotkey: 'KeyG', isOn: () => !!game.session?.god },
  );
  d.addCommand(
    'ammo',
    'Munición infinita',
    () => {
      if (game.session) game.session.infiniteAmmo = !game.session.infiniteAmmo;
    },
    { hotkey: 'KeyM', isOn: () => !!game.session?.infiniteAmmo },
  );
  d.addCommand('spawn', 'Spawn enemigo', () => spawnEnemyAhead(game, game.rng.pick(['thug', 'escort', 'heavy', 'shield', 'hound', 'drone'] as const)), {
    hotkey: 'KeyJ',
  });
  d.addCommand(
    'killAll',
    'Matar enemigos',
    () => {
      const s = game.session;
      if (!s) return;
      for (const e of s.enemies.enemies) if (e.alive) e.applyHit(9999, 'body', s.player.feet, 1, true);
    },
    { hotkey: 'KeyK' },
  );
  d.addCommand(
    'coins',
    '+10 monedas',
    () => {
      addCoins(game.profile, 10);
      game.saveNow();
      game.screens.refresh();
    },
    { hotkey: 'KeyI' },
  );
  // Último checkpoint visitado por cada nivel cargado; un nivel nuevo empieza por el primero.
  const cpIndex = new WeakMap<LevelSession, number>();
  d.addCommand(
    'nextCheckpoint',
    'Siguiente checkpoint',
    () => {
      const s = game.session;
      if (!s || s.data.checkpoints.length === 0) return;
      const i = ((cpIndex.get(s) ?? 0) + 1) % s.data.checkpoints.length;
      cpIndex.set(s, i);
      const cp = s.data.checkpoints[i];
      if (!cp) return;
      s.respawnAt(new Vector3(cp.pos[0], cp.pos[1] + 0.02, cp.pos[2]), cp.yaw);
      game.camera.setYawPitch(cp.yaw, -0.12);
      game.camera.snap();
    },
    { hotkey: 'KeyN' },
  );
  d.addCommand(
    'speed',
    'Velocidad ×3 (estrés)',
    () => {
      const p = game.session?.player;
      if (p) p.speedMultiplier = p.speedMultiplier === 1 ? 3 : 1;
    },
    { hotkey: 'KeyP', isOn: () => (game.session?.player.speedMultiplier ?? 1) !== 1 },
  );
  d.addCommand(
    'slowmo',
    'Cámara lenta',
    () => {
      const c = game.session?.combat;
      if (c) {
        c.focus = 100;
        c.focusActive = !c.focusActive;
      }
    },
    { hotkey: 'KeyO', isOn: () => !!game.session?.combat.focusActive },
  );
}

/** Aparece un enemigo alertado delante del jugador, en el nodo de navegación más cercano. */
function spawnEnemyAhead(game: Game, type: EnemyType, dist = 10): void {
  const s = game.session;
  if (!s) return;
  const f = s.player.feet;
  const yaw = game.camera.yaw;
  const x = f.x - Math.sin(yaw) * dist;
  const z = f.z - Math.cos(yaw) * dist;
  const n = s.nav.nearestNode(x, f.y, z, 4);
  if (n < 0) return;
  const pos = s.nav.pos(n, new Vector3());
  s.enemies.spawnAt(type, pos, yaw + Math.PI, f.clone());
}
