import type { Scene } from 'three';
import type { PlayerSlot } from '../combat/PlayerRoster';
import type { WeaponId } from '../combat/weapons';
import { FIXED_DT } from '../core/Loop';
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

/**
 * Vista de un jugador que no es el local: su personaje animado con el arma que lleva. Lee su movimiento y lo que se ve
 * de él (`look`) sin cambiar nada: le da igual que se simule aquí o llegue por la red.
 */
class PlayerView {
  private readonly rig: CharacterRig;
  private readonly pose: RigPose = idlePose();
  private readonly visualYaw: BodyYaw = bodyYaw();
  private model: WeaponModel = 'none';
  /** Marca de la última actualización (para soltar las vistas de quien se fue). */
  seen = 0;

  constructor(
    private readonly slot: PlayerSlot,
    private readonly scene: Scene,
  ) {
    this.rig = new CharacterRig('ally', ALLY_LOOK);
    scene.add(this.rig.root);
  }

  update(alpha: number, dt: number): void {
    const p = this.slot.controller;
    const look = this.slot.look;
    const model: WeaponModel = look.weapon === 'none' ? 'none' : WEAPON_MODEL[look.weapon];
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
    pose.state = look.dead ? 'dead' : p.state;
    pose.posture = p.posture;
    pose.grounded = p.grounded;
    pose.aim = look.aim ? 1 : 0;
    // Inclina el arma hacia donde apunta.
    pose.aimPitch = look.aimPitch;
    pose.stateTime = p.stateTime;
    pose.reload = look.reload;
    pose.recoil = look.recoil;
    pose.melee = look.melee;
    pose.slash = look.slash;
    pose.takedown = look.takedown;
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
  private tick = 0;

  constructor(private readonly scene: Scene) {}

  update(slots: readonly PlayerSlot[], alpha: number, dt: number): void {
    const t = ++this.tick;
    for (const s of slots) {
      if (s.local) continue;
      let v = this.views.get(s);
      if (!v) {
        v = new PlayerView(s, this.scene);
        this.views.set(s, v);
      }
      v.seen = t;
      v.update(alpha, dt);
    }
    // Quien se fue de la partida ya no está en la lista: su personaje se retira.
    for (const [s, v] of this.views) {
      if (v.seen === t) continue;
      v.dispose();
      this.views.delete(s);
    }
  }

  dispose(): void {
    for (const v of this.views.values()) v.dispose();
    this.views.clear();
  }
}
