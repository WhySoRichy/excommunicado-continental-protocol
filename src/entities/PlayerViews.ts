import type { Scene } from 'three';
import type { PlayerSlot } from '../combat/PlayerRoster';
import type { WeaponId } from '../combat/weapons';
import { FIXED_DT } from '../core/Loop';
import { clamp } from '../core/math';
import { CharacterRig, idlePose, PLAYER_LOOK, type RigOptions, type RigPose, type WeaponModel } from './CharacterRig';
import { type BodyYaw, bodyYaw, updateBodyYaw } from './rigMath';

/** Modelo que se dibuja para cada arma del jugador. */
export const WEAPON_MODEL: Record<WeaponId, WeaponModel> = {
  carbine: 'rifle',
  shotgun: 'shotgun',
  dmr: 'dmr',
  pistol: 'pistol',
  revolver: 'revolver',
  knife: 'knife',
};

/** Los demás jugadores: el Huésped con traje gris marengo y contorno azul, para distinguirlos a simple vista. */
const ALLY_LOOK: RigOptions = {
  ...PLAYER_LOOK,
  colors: { ...PLAYER_LOOK.colors, jacket: 0x3a3f4a, pants: 0x30343c },
  rimColor: 0x5aa9ff,
  rimStrength: 0.35,
  weapon: 'none',
};

/** Vista de un jugador que no es el local: su personaje animado con el arma que lleva. Lee su plaza sin cambiarla. */
class PlayerView {
  private readonly rig: CharacterRig;
  private readonly pose: RigPose = idlePose();
  private readonly visualYaw: BodyYaw = bodyYaw();
  private model: WeaponModel = 'none';

  constructor(
    private readonly slot: PlayerSlot,
    private readonly scene: Scene,
  ) {
    this.rig = new CharacterRig('ally', ALLY_LOOK);
    scene.add(this.rig.root);
  }

  update(alpha: number, dt: number): void {
    const p = this.slot.controller;
    const c = this.slot.combat;
    const model: WeaponModel = c.holstered ? 'none' : WEAPON_MODEL[c.current];
    if (model !== this.model) {
      this.model = model;
      this.rig.setWeapon(model);
    }
    const root = this.rig.root;
    p.renderFeet(alpha, root.position);
    const yaw = updateBodyYaw(this.visualYaw, p.renderYaw(alpha), p.aiming, dt);
    root.rotation.y = yaw;
    const pose = this.pose;
    pose.speed = p.stepSpeed(FIXED_DT);
    const vx = p.feet.x - p.prevFeet.x;
    const vz = p.feet.z - p.prevFeet.z;
    pose.moveAngle = Math.hypot(vx, vz) > 1e-4 ? Math.atan2(-vx, -vz) - yaw : 0;
    pose.state = c.dead ? 'dead' : p.state;
    pose.posture = p.posture;
    pose.grounded = p.grounded;
    pose.aim = !c.holstered && p.aiming ? 1 : 0;
    // Inclina el arma hacia donde apunta (su rayo de apuntado llega en la intención).
    pose.aimPitch = Math.asin(clamp(this.slot.combatIntent.aimDir.y, -1, 1));
    pose.stateTime = p.stateTime;
    pose.reload = c.weapon.reloadProgress;
    pose.recoil = c.recoilVis;
    pose.melee = c.grab;
    pose.slash = c.slashPhase;
    pose.takedown = c.takedown ? c.takedown.t : -1;
    pose.vault = p.vaultProgress;
    pose.cover = p.state === 'cover' && p.cover ? p.cover.height : 'none';
    pose.peek = p.peekAmount;
    pose.death = 1;
    this.rig.update(pose, dt);
  }

  dispose(): void {
    this.rig.dispose();
    this.scene.remove(this.rig.root);
  }
}

/** Las vistas de los jugadores que no son el local (el local lo dibuja el juego, con su cámara). */
export class PlayerViews {
  private readonly views = new Map<PlayerSlot, PlayerView>();

  constructor(private readonly scene: Scene) {}

  update(slots: readonly PlayerSlot[], alpha: number, dt: number): void {
    for (const s of slots) {
      if (s.local) continue;
      let v = this.views.get(s);
      if (!v) {
        v = new PlayerView(s, this.scene);
        this.views.set(s, v);
      }
      v.update(alpha, dt);
    }
  }

  dispose(): void {
    for (const v of this.views.values()) v.dispose();
    this.views.clear();
  }
}
