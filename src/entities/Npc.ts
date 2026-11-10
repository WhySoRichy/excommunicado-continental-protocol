import { type Scene, type Sprite, Vector3 } from 'three';
import { dampAngle, wrapAngle } from '../core/math';
import { disposeSprite, makeTextSprite } from '../render/labels';
import { CharacterRig, type HairStyle, idlePose, type RigColors, type RigPose } from './CharacterRig';
import { yawFromDir } from './PlayerController';

export interface NpcDef {
  id: string;
  name: string;
  pos: Vector3;
  yaw: number;
  colors: RigColors;
  hair: HairStyle;
  vest?: boolean;
  bulk?: number;
}

/** Distancia a la que el NPC se gira hacia el jugador. */
const ATTENTION_RADIUS = 7;
/** Giro máximo respecto a su orientación base (no da la espalda al mostrador). */
const MAX_TURN = 1.1;

/**
 * Personaje no jugable del hub (Charon, Sommelier, Winston): rig low-poly con
 * etiqueta de nombre, que se gira hacia el jugador cuando se acerca.
 * Su cuerpo físico es una caja `invisible` declarada en los datos del nivel.
 */
export class Npc {
  readonly rig: CharacterRig;
  readonly label: Sprite;
  readonly pos: Vector3;
  private readonly baseYaw: number;
  private yaw: number;
  private readonly pose: RigPose = idlePose();

  constructor(
    readonly def: NpcDef,
    private readonly scene: Scene,
  ) {
    this.pos = def.pos.clone();
    this.baseYaw = this.yaw = def.yaw;
    this.rig = new CharacterRig(`npc:${def.id}`, {
      colors: def.colors,
      rimColor: 0xd4af37,
      rimStrength: 0.55,
      hair: def.hair,
      vest: def.vest,
      bulk: def.bulk,
      weapon: 'none',
    });
    this.rig.root.position.copy(this.pos);
    this.rig.root.rotation.y = this.yaw;
    scene.add(this.rig.root);
    this.label = makeTextSprite(def.name);
    this.label.position.set(this.pos.x, this.pos.y + 2.25, this.pos.z);
    scene.add(this.label);
  }

  update(dt: number, playerFeet: Vector3): void {
    const dx = playerFeet.x - this.pos.x;
    const dz = playerFeet.z - this.pos.z;
    let target = this.baseYaw;
    if (dx * dx + dz * dz < ATTENTION_RADIUS * ATTENTION_RADIUS) {
      const toPlayer = yawFromDir(dx, dz);
      const off = Math.max(-MAX_TURN, Math.min(MAX_TURN, wrapAngle(toPlayer - this.baseYaw)));
      target = this.baseYaw + off;
    }
    this.yaw = dampAngle(this.yaw, target, 4, dt);
    this.rig.root.rotation.y = this.yaw;
    this.pose.speed = 0;
    this.pose.state = 'ground';
    this.pose.grounded = true;
    this.rig.update(this.pose, dt);
  }

  dispose(): void {
    this.rig.dispose();
    this.rig.material.dispose();
    disposeSprite(this.label);
    void this.scene;
  }
}

/** Paletas de los NPC del Continental (personajes propios, sin parecido con actores). */
export const NPC_LOOKS: Record<'charon' | 'sommelier' | 'winston', Pick<NpcDef, 'name' | 'colors' | 'hair' | 'vest' | 'bulk'>> = {
  charon: {
    name: 'Charon · Conserje',
    colors: { jacket: 0x1b1d22, shirt: 0xf1ece0, tie: 0x7a1020, pants: 0x1b1d22, shoes: 0x0b0b0d, skin: 0x5a3b2a, hair: 0x1a1512, accent: 0xd4af37 },
    hair: 'bald',
  },
  sommelier: {
    name: 'Sommelier · Armería',
    colors: { jacket: 0x5a1f2a, shirt: 0xf1ece0, tie: 0x1b1d22, pants: 0x2a2228, shoes: 0x0b0b0d, skin: 0xd9b08c, hair: 0x6b4a2b, accent: 0xd4af37 },
    hair: 'short',
    vest: true,
  },
  winston: {
    name: 'Winston · Gerente',
    colors: { jacket: 0x3b3f4a, shirt: 0xe9e4d8, tie: 0x9a7b2e, pants: 0x34373f, shoes: 0x0b0b0d, skin: 0xd8b398, hair: 0x9a9a9a, accent: 0xd4af37 },
    hair: 'short',
  },
};
