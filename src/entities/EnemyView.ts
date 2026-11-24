import { AdditiveBlending, BoxGeometry, Color, Mesh, MeshBasicMaterial, type Scene, Sprite, Vector3 } from 'three';
import { FIXED_DT } from '../core/Loop';
import { clamp, damp } from '../core/math';
import { alertIconMaterial } from '../render/vfx';
import { CharacterRig, type DetailView, idlePose, type RigPose } from './CharacterRig';
import { CORPSE_SETTLE, type Enemy, THROW_DELAY } from './Enemy';
import { type BodyYaw, bodyYaw, type LookAngles, lookAngles, updateBodyYaw } from './rigMath';

/** Grosor del rim en reposo: por debajo del umbral del bloom, para que solo brillen el impacto y el telégrafo. */
const RIM_BASE = 0.5;
/**
 * Haz del láser: se afila hacia el extremo del objetivo (+Z tras `lookAt`), que es el que
 * queda junto a la cámara; con grosor constante se veía como una banda.
 */
const laserGeo = new BoxGeometry(1, 1, 1);
{
  const p = laserGeo.getAttribute('position');
  for (let i = 0; i < p.count; i++) if (p.getZ(i) > 0) p.setXY(i, p.getX(i) * 0.3, p.getY(i) * 0.3);
}
const RED = new Color(0xff2233);
const _muzzle = new Vector3();

/**
 * Vista de un enemigo: su personaje animado, el icono de alerta y el láser del tirador. Lee el estado de `Enemy` y
 * nunca lo cambia (la simulación corre igual sin ella; ver docs/ESCALABILIDAD.md).
 */
export class EnemyView {
  readonly rig: CharacterRig;
  /** Marca de la última sincronización (para soltar las vistas de los enemigos retirados). */
  seen = 0;
  private readonly pose: RigPose = idlePose();
  private readonly icon: Sprite;
  private readonly laser: Mesh | null;
  private readonly laserMat: MeshBasicMaterial | null;
  private readonly baseRim: Color;
  /** Segundos de juego desde la muerte (animación de caída); −1 mientras vive. */
  private deadFor = -1;
  /** Reloj de la vigilancia de guardia (mirar a un lado y a otro), desfasado entre enemigos. */
  private glance: number;
  private readonly look: LookAngles = { yaw: 0, pitch: 0 };
  /** Inclinación suavizada hacia lo que mira (rad). */
  private pitchS = 0;
  /** Giro visual del cuerpo (con muelle sobre el de la simulación). */
  private readonly visualYaw: BodyYaw = bodyYaw();

  constructor(
    readonly enemy: Enemy,
    private readonly scene: Scene,
  ) {
    const def = enemy.def;
    this.glance = enemy.index * 2.3;
    // Material propio por enemigo (mismo programa): el destello de impacto es individual.
    this.rig = new CharacterRig(`enemy:${enemy.id}`, {
      colors: def.colors,
      rimColor: def.color,
      rimStrength: RIM_BASE,
      hair: def.hair,
      beard: def.beard,
      bulk: def.bulk,
      outfit: def.outfit,
      weapon: def.weapon.model,
      uniqueMaterial: true,
      lod: true,
    });
    this.baseRim = new Color(def.color);
    scene.add(this.rig.root);
    // El material (textura dibujada en canvas) se le pone al mostrarlo.
    this.icon = new Sprite();
    this.icon.scale.set(0.45, 0.45, 0.45);
    this.icon.visible = false;
    this.icon.renderOrder = 20;
    scene.add(this.icon);
    if (enemy.hasLaser) {
      this.laserMat = new MeshBasicMaterial({ color: RED, blending: AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false });
      this.laser = new Mesh(laserGeo, this.laserMat);
      this.laser.visible = false;
      this.laser.frustumCulled = false;
      scene.add(this.laser);
    } else {
      this.laser = null;
      this.laserMat = null;
    }
  }

  update(alpha: number, dt: number, view: DetailView): void {
    const e = this.enemy;
    this.rig.updateDetail(view);
    if (!e.alive && this.deadFor < 0) {
      // Si lo estaban proyectando, la caída sigue donde iba en vez de empezar de pie.
      this.deadFor = e.deathFallStart;
      this.icon.visible = false;
      if (this.laser) this.laser.visible = false;
    }
    // Un cuerpo ya asentado no se anima más: conserva su última pose.
    if (!e.alive && this.deadFor > CORPSE_SETTLE) return;
    const m = e.mover;
    const root = this.rig.root;
    m.renderFeet(alpha, root.position);
    const yaw = updateBodyYaw(this.visualYaw, m.renderYaw(alpha), e.aiming, dt);
    root.rotation.y = yaw;
    const pose = this.pose;
    pose.speed = m.stepSpeed(FIXED_DT);
    const vx = m.feet.x - m.prevFeet.x;
    const vz = m.feet.z - m.prevFeet.z;
    pose.moveAngle = Math.hypot(vx, vz) > 1e-4 ? Math.atan2(-vx, -vz) - yaw : 0;
    const stunned = e.alive && e.state === 'stunned';
    const thrown = e.alive && e.thrownT >= 0;
    pose.state = e.alive && !thrown ? (stunned ? 'locked' : m.state) : 'dead';
    // De rodillas, quien se queda a merced (el jefe entre fases, el del takedown); con un destello, se tambalea.
    const dazed = stunned && !thrown && e.dazed;
    pose.kneel = stunned && !thrown && !dazed ? 1 : 0;
    pose.daze = dazed ? 1 : 0;
    pose.posture = m.posture;
    pose.grounded = m.grounded;
    pose.aim = e.aiming ? 1 : 0;
    this.updateLook(stunned || thrown, dt);
    if (!e.alive) this.deadFor += dt;
    pose.stateTime = thrown ? Math.max(0, e.thrownT - THROW_DELAY) : e.alive ? m.stateTime : this.deadFor;
    pose.recoil = e.recoilVis;
    pose.melee = 0;
    pose.flinch = e.flinch * e.flinch;
    pose.flinchSide = e.flinchSide;
    pose.death = thrown ? 1 : e.deathStyle;
    this.rig.update(pose, dt);
    // Feedback de impacto y telégrafo del blindado/jefe: el rim se enciende.
    const rim = this.rig.rim;
    const telegraph = e.cmd.telegraph;
    if (e.hitFlash > 0) {
      rim.rimColor.value.setRGB(1, 1, 1);
      rim.rimStrength.value = 2.4;
    } else if (telegraph > 0 && !this.laser && e.alive) {
      rim.rimColor.value.copy(this.baseRim).lerp(RED, telegraph);
      rim.rimStrength.value = RIM_BASE + telegraph * 1.6;
    } else {
      rim.rimColor.value.copy(this.baseRim);
      rim.rimStrength.value = e.alive ? RIM_BASE : 0.25;
    }
    this.updateLaser(telegraph);
    // Icono de alerta (? / !) sobre la cabeza.
    if (dazed || (e.alive && e.cmd.icon !== 'none')) {
      this.icon.visible = true;
      this.icon.material = alertIconMaterial(dazed ? 'stunned' : e.cmd.icon === 'alert' ? 'alert' : 'suspicious');
      this.icon.position.set(root.position.x, root.position.y + (m.posture === 'crouch' ? 1.55 : 2.2), root.position.z);
      const s = dazed ? 0.42 : e.cmd.icon === 'alert' ? 0.5 : 0.32 + e.cmd.detection * 0.16;
      this.icon.scale.set(s, s, s);
    } else {
      this.icon.visible = false;
    }
  }

  /** Láser del tirador mientras telegrafía el disparo: de la boca del arma al pecho del objetivo. */
  private updateLaser(k: number): void {
    const laser = this.laser;
    if (!laser || !this.laserMat) return;
    const e = this.enemy;
    if (k <= 0.01 || !e.alive) {
      laser.visible = false;
      return;
    }
    e.muzzlePos(_muzzle);
    const len = _muzzle.distanceTo(e.telegraphAt);
    laser.position.addVectors(_muzzle, e.telegraphAt).multiplyScalar(0.5);
    laser.lookAt(e.telegraphAt);
    laser.scale.set(0.02 + k * 0.02, 0.02 + k * 0.02, len);
    this.laserMat.color.copy(RED).multiplyScalar(0.6 + k * 1.6);
    laser.visible = true;
  }

  /**
   * Mirada e inclinación al apuntar: la cabeza sigue al objetivo (al pecho, aunque esté más alto o más bajo)
   * y el arma se inclina hacia él. De guardia y sin nada que mirar, vigila a un lado y a otro.
   */
  private updateLook(disabled: boolean, dt: number): void {
    const e = this.enemy;
    const pose = this.pose;
    let pitch = 0;
    pose.look = 0;
    if (e.alive && !disabled) {
      const c = e.cmd;
      const r = this.rig.root;
      if (c.hasLook) {
        const eye = r.position.y + (e.mover.posture === 'crouch' ? 0.95 : 1.45);
        const l = lookAngles(r.position.x, eye, r.position.z, r.rotation.y, c.lookAt.x, c.lookAt.y + e.targetRise, c.lookAt.z, this.look);
        pose.lookYaw = l.yaw;
        pose.look = 1;
        pitch = clamp(l.pitch, -0.9, 0.9);
      } else if (e.state === 'patrol') {
        this.glance += dt;
        // Más amplio parado que caminando.
        pose.lookYaw = 0.75 * Math.sin(this.glance * 0.42) * (1 - clamp(pose.speed / 2.5, 0, 0.6));
        pose.look = 1;
      }
    }
    // La inclinación (cabeza siempre; el arma, al apuntar) se suaviza para que no salte al dejar de mirar.
    this.pitchS = damp(this.pitchS, pitch, 6, dt);
    pose.aimPitch = this.pitchS;
    pose.lookPitch = 0;
  }

  dispose(): void {
    this.rig.dispose();
    this.scene.remove(this.rig.root, this.icon);
    if (this.laser) this.scene.remove(this.laser);
    this.laserMat?.dispose();
  }
}

/**
 * Las vistas de todos los enemigos de un nivel: crea la de cada enemigo nuevo y suelta las de los retirados, así la
 * simulación puede añadir y quitar enemigos sin saber que existe una vista.
 */
export class EnemyViews {
  private readonly views = new Map<Enemy, EnemyView>();
  private tick = 0;

  constructor(private readonly scene: Scene) {}

  /** Crea las vistas que falten y suelta las sobrantes, sin animar (al cargar el nivel, antes de precompilar). */
  sync(enemies: readonly Enemy[]): void {
    const t = ++this.tick;
    for (const e of enemies) this.viewOf(e).seen = t;
    this.sweep(enemies.length, t);
  }

  update(enemies: readonly Enemy[], alpha: number, dt: number, view: DetailView): void {
    const t = ++this.tick;
    for (const e of enemies) {
      const v = this.viewOf(e);
      v.seen = t;
      v.update(alpha, dt, view);
    }
    this.sweep(enemies.length, t);
  }

  dispose(): void {
    for (const v of this.views.values()) v.dispose();
    this.views.clear();
  }

  private viewOf(e: Enemy): EnemyView {
    let v = this.views.get(e);
    if (!v) {
      v = new EnemyView(e, this.scene);
      this.views.set(e, v);
    }
    return v;
  }

  /** Hay más vistas que enemigos solo si se retiró alguno: entonces se sueltan las que no se vieron. */
  private sweep(count: number, t: number): void {
    if (this.views.size <= count) return;
    for (const [e, v] of this.views) {
      if (v.seen === t) continue;
      v.dispose();
      this.views.delete(e);
    }
  }
}
