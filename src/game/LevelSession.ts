import { type Scene, Vector3 } from 'three';
import { CharacterRig, PLAYER_COLORS } from '../entities/CharacterRig';
import { PlayerController } from '../entities/PlayerController';
import { buildLevel, type LevelRuntime } from '../levels/LevelBuilder';
import type { LevelData } from '../levels/types';
import { PhysicsWorld, type Rapier } from '../physics/Physics';
import type { QualitySettings } from '../render/Renderer';

/**
 * Todo lo que vive mientras un nivel está cargado. Se crea entero al entrar y se
 * libera entero al salir (mundo Rapier nuevo por nivel: sin fugas ni colliders viejos).
 */
export class LevelSession {
  readonly physics: PhysicsWorld;
  readonly level: LevelRuntime;
  readonly player: PlayerController;
  readonly playerRig: CharacterRig;

  constructor(
    R: Rapier,
    readonly data: LevelData,
    private readonly scene: Scene,
    quality: QualitySettings,
  ) {
    this.physics = new PhysicsWorld(R);
    this.level = buildLevel(data, scene, this.physics, { shadows: quality.shadows, shadowMapSize: quality.shadowMapSize });
    this.physics.step();
    const s = data.spawn.pos;
    this.player = new PlayerController(this.physics, new Vector3(s[0], s[1] + 0.02, s[2]), data.spawn.yaw);
    this.player.killY = data.killY;
    this.playerRig = new CharacterRig('player', {
      colors: PLAYER_COLORS,
      rimColor: 0xe8e2d0,
      rimStrength: 0.35,
      hair: 'long',
      weapon: 'pistol',
    });
    this.playerRig.setShadows(quality.shadows);
    scene.add(this.playerRig.root);
    this.physics.step();
  }

  respawnAt(feet: Vector3, yaw: number): void {
    this.player.revive(feet, yaw);
    this.physics.step();
  }

  dispose(): void {
    this.playerRig.dispose();
    this.player.dispose();
    this.level.dispose();
    this.physics.dispose();
    void this.scene;
  }
}
