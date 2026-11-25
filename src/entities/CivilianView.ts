import type { Scene } from 'three';
import { FIXED_DT } from '../core/Loop';
import { CharacterRig, type DetailView, type Features, type HairStyle, idlePose, type Outfit, type RigColors, type RigPose } from './CharacterRig';
import { animationStep, newSight, type Sight } from './occlusion';
import type { Civilian } from './Civilian';
import type { Gesture } from './rig/layers';

/** Rim verde azulado: los civiles se distinguen de los enemigos a simple vista. */
export const CIVILIAN_COLOR = 0x5ee6c8;

/** Golpes por segundo de la música de la pista (unos 124 por minuto). */
const BEATS = 2.07;
const DANCES: readonly Gesture[] = ['dance0', 'dance1', 'dance2'];

/** Cómo van vestidos los civiles. */
export const CIVILIAN_LOOKS: ReadonlyArray<{ colors: RigColors; hair: HairStyle; outfit: Outfit; features: Partial<Features> }> = [
  {
    colors: { jacket: 0xb33a5a, shirt: 0xf0e6e0, tie: 0xb33a5a, pants: 0x2b2b30, shoes: 0x111, skin: 0xd9b08c, hair: 0x3b2a1e, accent: 0xff2e88 },
    hair: 'long',
    outfit: { tie: false, pocketSquare: false },
    features: { soft: true, jaw: 0.9, chin: 0.8, nose: 0.86, nostrils: 0.85, brow: 0.4, lips: 1.35, eyes: 1.14, iris: 0x4f6b3a },
  },
  {
    colors: { jacket: 0x2d6cb5, shirt: 0xf5f5f5, tie: 0x2d6cb5, pants: 0x1f2a3a, shoes: 0x111, skin: 0x8c5a3c, hair: 0x1a1512, accent: 0x19e3ff },
    hair: 'short',
    outfit: { top: 'bomber' },
    features: { jaw: 1.02, nose: 0.94, nostrils: 1.25, lips: 1.25, cheeks: 1.1, iris: 0x2a1a10 },
  },
  {
    colors: { jacket: 0xe8c04a, shirt: 0x141414, tie: 0xe8c04a, pants: 0x3a3a3a, shoes: 0x111, skin: 0xf0c8a8, hair: 0xc9a46a, accent: 0xffd23f },
    hair: 'long',
    outfit: { top: 'bomber' },
    features: { soft: true, jaw: 0.92, chin: 0.85, nose: 0.9, nostrils: 0.9, brow: 0.45, lips: 1.2, eyes: 1.1, iris: 0x6f8ea8 },
  },
  {
    colors: { jacket: 0x6a3cff, shirt: 0xe9e9f2, tie: 0x6a3cff, pants: 0x202030, shoes: 0x111, skin: 0xb98a6a, hair: 0x2a1e18, accent: 0x7a3cff },
    hair: 'cap',
    outfit: { tie: false, pocketSquare: false },
    features: { jaw: 0.96, nose: 1.06, lips: 1.05, eyes: 1.05 },
  },
];

/** Vista de un civil: su personaje animado (también el baile). Lee el estado de `Civilian` y nunca lo cambia. */
class CivilianView {
  private readonly rig: CharacterRig;
  private readonly pose: RigPose = idlePose();
  /** Por qué golpe de la música va (avanza 1 por golpe). */
  private beat: number;
  private readonly sight: Sight;
  /** Segundos de juego desde la muerte (animación de caída). */
  private deadFor = 0;

  constructor(
    private readonly civ: Civilian,
    private readonly scene: Scene,
  ) {
    const outfit = CIVILIAN_LOOKS[civ.index % CIVILIAN_LOOKS.length]!;
    // Material compartido por todos los civiles (los colores van por vértice; el rim no cambia).
    this.rig = new CharacterRig('civ', {
      colors: outfit.colors,
      rimColor: CIVILIAN_COLOR,
      rimStrength: 0.7,
      hair: outfit.hair,
      outfit: outfit.outfit,
      features: outfit.features,
      face: 'calm',
      weapon: 'none',
      lod: true,
    });
    scene.add(this.rig.root);
    this.beat = civ.dancePhase0;
    this.sight = newSight(civ.index);
  }

  update(alpha: number, dt: number, view: DetailView): void {
    const c = this.civ;
    this.rig.updateDetail(view, CROWD_DETAIL);
    const m = c.mover;
    const root = this.rig.root;
    m.renderFeet(alpha, root.position);
    root.visible = view.occlusion?.look(this.sight, view.eye, root.position, m.height) ?? true;
    root.rotation.y = m.renderYaw(alpha);
    const pose = this.pose;
    pose.speed = m.stepSpeed(FIXED_DT);
    const vx = m.feet.x - m.prevFeet.x;
    const vz = m.feet.z - m.prevFeet.z;
    pose.moveAngle = Math.hypot(vx, vz) > 1e-4 ? Math.atan2(-vx, -vz) - root.rotation.y : 0;
    pose.state = c.alive ? m.state : 'dead';
    pose.posture = m.posture;
    pose.grounded = m.grounded;
    pose.aim = 0;
    if (!c.alive) this.deadFor += dt;
    pose.stateTime = c.alive ? m.stateTime : this.deadFor;
    pose.death = 2;
    pose.ready = 0;
    pose.gesture = this.gesture(pose.speed);
    this.beat += dt * BEATS;
    pose.beat = this.beat;
    // Quien no baila mira a su alrededor; escondido, más deprisa y por todas partes.
    const hiding = c.state === 'hide';
    pose.look = c.alive && (hiding || c.state === 'calm') && c.behavior !== 'dance' ? 1 : 0;
    pose.lookYaw = (hiding ? 0.9 : 0.5) * Math.sin(this.beat * (hiding ? 0.8 : 0.22) + c.index);
    const step = animationStep(this.sight, dt);
    if (step > 0) this.rig.update(pose, step);
  }

  /** Cada uno a lo suyo: en la pista baila (hay tres maneras), en la barra se apoya y, con los tiros, huye o se encoge. */
  private gesture(speed: number): Gesture {
    const c = this.civ;
    if (!c.alive) return 'none';
    if (c.state === 'flee') return 'panic';
    if (c.state === 'hide') return 'cower';
    if (speed > 0.3) return 'none';
    if (c.behavior === 'dance') return DANCES[c.index % DANCES.length]!;
    return c.behavior === 'bar' ? 'counter' : 'pocket';
  }

  dispose(): void {
    // El material es compartido (caché de CharacterRig): no se libera con cada civil.
    this.rig.dispose();
    this.scene.remove(this.rig.root);
  }
}

/** Los civiles son muchos y van juntos: pasan a la malla lejana antes que los enemigos. */
const CROWD_DETAIL = 0.6;

/** Las vistas de los civiles de un nivel (son siempre los mismos: no aparecen ni se retiran a mitad de partida). */
export class CivilianViews {
  private readonly views: CivilianView[];

  constructor(civilians: readonly Civilian[], scene: Scene) {
    this.views = civilians.map((c) => new CivilianView(c, scene));
  }

  update(alpha: number, dt: number, view: DetailView): void {
    for (const v of this.views) v.update(alpha, dt, view);
  }

  dispose(): void {
    for (const v of this.views) v.dispose();
    this.views.length = 0;
  }
}
