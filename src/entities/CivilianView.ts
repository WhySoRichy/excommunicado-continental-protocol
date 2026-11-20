import type { Scene } from 'three';
import { FIXED_DT } from '../core/Loop';
import { CharacterRig, type HairStyle, idlePose, type RigColors, type RigPose } from './CharacterRig';
import type { Civilian } from './Civilian';

/** Rim verde azulado: los civiles se distinguen de los enemigos a simple vista. */
export const CIVILIAN_COLOR = 0x5ee6c8;

const OUTFITS: ReadonlyArray<{ colors: RigColors; hair: HairStyle }> = [
  {
    colors: { jacket: 0xb33a5a, shirt: 0xf0e6e0, tie: 0xb33a5a, pants: 0x2b2b30, shoes: 0x111, skin: 0xd9b08c, hair: 0x3b2a1e, accent: 0xff2e88 },
    hair: 'long',
  },
  {
    colors: { jacket: 0x2d6cb5, shirt: 0xf5f5f5, tie: 0x2d6cb5, pants: 0x1f2a3a, shoes: 0x111, skin: 0x8c5a3c, hair: 0x1a1512, accent: 0x19e3ff },
    hair: 'short',
  },
  {
    colors: { jacket: 0xe8c04a, shirt: 0x141414, tie: 0xe8c04a, pants: 0x3a3a3a, shoes: 0x111, skin: 0xf0c8a8, hair: 0xc9a46a, accent: 0xffd23f },
    hair: 'long',
  },
  {
    colors: { jacket: 0x6a3cff, shirt: 0xe9e9f2, tie: 0x6a3cff, pants: 0x202030, shoes: 0x111, skin: 0xb98a6a, hair: 0x2a1e18, accent: 0x7a3cff },
    hair: 'cap',
  },
];

/** Vista de un civil: su personaje animado (también el baile). Lee el estado de `Civilian` y nunca lo cambia. */
class CivilianView {
  private readonly rig: CharacterRig;
  private readonly pose: RigPose = idlePose();
  private dancePhase: number;
  /** Segundos de juego desde la muerte (animación de caída). */
  private deadFor = 0;

  constructor(
    private readonly civ: Civilian,
    private readonly scene: Scene,
  ) {
    const outfit = OUTFITS[civ.index % OUTFITS.length]!;
    // Material compartido por todos los civiles (los colores van por vértice; el rim no cambia).
    this.rig = new CharacterRig('civ', { colors: outfit.colors, rimColor: CIVILIAN_COLOR, rimStrength: 0.7, hair: outfit.hair, weapon: 'none' });
    scene.add(this.rig.root);
    this.dancePhase = civ.dancePhase0;
  }

  update(alpha: number, dt: number): void {
    const c = this.civ;
    const m = c.mover;
    const root = this.rig.root;
    m.renderFeet(alpha, root.position);
    root.rotation.y = m.renderYaw(alpha);
    const pose = this.pose;
    pose.speed = m.stepSpeed(FIXED_DT);
    pose.state = c.alive ? m.state : 'dead';
    pose.posture = m.posture;
    pose.grounded = m.grounded;
    pose.aim = 0;
    if (!c.alive) this.deadFor += dt;
    pose.stateTime = c.alive ? m.stateTime : this.deadFor;
    pose.death = 2;
    this.rig.update(pose, dt);
    if (c.alive && c.state === 'calm' && c.behavior === 'dance') {
      this.dancePhase += dt * 6.5;
      root.position.y += Math.abs(Math.sin(this.dancePhase)) * 0.08;
      root.rotation.y += Math.sin(this.dancePhase * 0.5) * 0.35;
    }
  }

  dispose(): void {
    // El material es compartido (caché de CharacterRig): no se libera con cada civil.
    this.rig.dispose();
    this.scene.remove(this.rig.root);
  }
}

/** Las vistas de los civiles de un nivel (son siempre los mismos: no aparecen ni se retiran a mitad de partida). */
export class CivilianViews {
  private readonly views: CivilianView[];

  constructor(civilians: readonly Civilian[], scene: Scene) {
    this.views = civilians.map((c) => new CivilianView(c, scene));
  }

  update(alpha: number, dt: number): void {
    for (const v of this.views) v.update(alpha, dt);
  }

  dispose(): void {
    for (const v of this.views) v.dispose();
    this.views.length = 0;
  }
}
