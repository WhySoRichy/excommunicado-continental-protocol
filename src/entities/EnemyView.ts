import { AdditiveBlending, BoxGeometry, Color, Mesh, MeshBasicMaterial, type Scene, Sprite, Vector3 } from 'three';
import { FIXED_DT } from '../core/Loop';
import { clamp, damp } from '../core/math';
import { alertIconMaterial } from '../render/vfx';
import { weaponMaterial } from '../render/weaponMaterial';
import { CharacterRig, type DetailView, idlePose, type RigPose } from './CharacterRig';
import { CORPSE_SETTLE, type Enemy, THROW_DELAY } from './Enemy';
import { acquire, release, type SharedGeometry } from './rig/geometry';
import { shieldGeometry } from './rig/weapons';
import { animationStep, newSight, type Sight } from './occlusion';
import { type BodyYaw, bodyYaw, type LookAngles, lookAngles, smooth, updateBodyYaw } from './rigMath';
import { DroneRig, type EnemyBody, HoundRig } from './RobotRigs';

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
/** Hasta dónde busca a la víctima de un remate (m). */
const VICTIM_RADIUS = 1.8;
/** Rapidez con la que el cuerpo sigue al giro de la simulación. */
const TURN_OMEGA = 22;
const RED = new Color(0xff2233);
const _muzzle = new Vector3();
/** Altura del icono sobre los pies según el cuerpo (m); de pie y agachado, en una persona. */
const ICON_Y = { hound: 1.35, drone: 1.05, stand: 2.2, crouch: 1.55 } as const;
/** El escudo: dónde va levantado (m), bajado y, en el suelo, caído. */
const SHIELD_UP = { x: -0.12, y: 0.92, z: -0.45, rx: 0, ry: 0 } as const;
const SHIELD_DOWN = { x: -0.36, y: 0.66, z: -0.18, rx: 0.12, ry: 0.9 } as const;
const SHIELD_FLOOR = { x: -0.55, y: 0.04, z: -0.75, rx: -Math.PI / 2, ry: 0.35 } as const;
const shieldGeometries = new Map<string, SharedGeometry>();

/**
 * Vista de un enemigo: su personaje animado, el icono de alerta y el láser del tirador. Lee el estado de `Enemy` y
 * nunca lo cambia (la simulación corre igual sin ella; ver docs/ESCALABILIDAD.md).
 */
export class EnemyView {
  readonly rig: EnemyBody;
  /** Marca de la última sincronización (para soltar las vistas de los enemigos retirados). */
  seen = 0;
  private readonly pose: RigPose = idlePose();
  private readonly icon: Sprite;
  private readonly laser: Mesh | null;
  private readonly laserMat: MeshBasicMaterial | null;
  private readonly baseRim: Color;
  private shield: Mesh | null = null;
  /** 1 levantado, 0 bajado (con su suavizado), y caída al suelo. */
  private shieldK = 0;
  private shieldFall = 0;
  /** Segundos de juego desde la muerte (animación de caída); −1 mientras vive. */
  private deadFor = -1;
  /** Reloj de la vigilancia de guardia (mirar a un lado y a otro), desfasado entre enemigos. */
  private glance: number;
  private readonly look: LookAngles = { yaw: 0, pitch: 0 };
  /** Inclinación suavizada hacia lo que mira (rad). */
  private pitchS = 0;
  /** Giro visual del cuerpo (con muelle sobre el de la simulación). */
  private readonly visualYaw: BodyYaw = bodyYaw();
  private readonly sight: Sight;

  constructor(
    readonly enemy: Enemy,
    private readonly scene: Scene,
  ) {
    const def = enemy.def;
    this.glance = enemy.index * 2.3;
    this.sight = newSight(enemy.index);
    // Material propio por enemigo (mismo programa): el destello de impacto es individual.
    const key = `enemy:${enemy.id}`;
    if (def.body && def.robot) {
      const look = { colors: def.robot, rimColor: def.color, rimStrength: RIM_BASE };
      this.rig = def.body === 'hound' ? new HoundRig(key, look) : new DroneRig(key, look);
    } else
      this.rig = new CharacterRig(key, {
        colors: def.colors,
        rimColor: def.color,
        rimStrength: RIM_BASE,
        hair: def.hair,
        beard: def.beard,
        bulk: def.bulk,
        outfit: def.outfit,
        features: def.features,
        weapon: def.weapon.model,
        uniqueMaterial: true,
        lod: true,
      });
    if (def.shield) {
      const accent = def.color;
      this.shield = new Mesh(
        acquire(shieldGeometries, String(accent), () => shieldGeometry(accent)),
        weaponMaterial(),
      );
      this.shield.castShadow = true;
      this.shield.receiveShadow = true;
      this.rig.root.add(this.shield);
    }
    this.baseRim = new Color(def.color);
    scene.add(this.rig.root);
    // Con un icono ya puesto, su programa se compila al cargar el nivel; el que toca se elige al mostrarlo.
    this.icon = new Sprite(alertIconMaterial('suspicious'));
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
    const m = e.mover;
    const root = this.rig.root;
    root.visible = view.occlusion?.look(this.sight, view.eye, root.position, e.height) ?? true;
    // Un cuerpo ya asentado no se anima más: conserva su última pose.
    if (!e.alive && this.deadFor > CORPSE_SETTLE) return;
    m.renderFeet(alpha, root.position);
    // Siempre con el muelle, también apuntando: a un enemigo no le hace falta el giro exacto y sus cambios de sentido se notaban.
    const yaw = updateBodyYaw(this.visualYaw, m.renderYaw(alpha), false, dt, TURN_OMEGA);
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
    // De guardia, relajado; en cuanto sospecha algo, con el arma lista.
    pose.ready = e.state === 'patrol' ? 0 : 1;
    pose.reload = e.alive ? e.cmd.reload : -1;
    // Escondido: de espaldas a la cobertura con el arma recogida; al asomarse, se gira.
    pose.cover = e.alive && e.cmd.hidden ? (m.posture === 'crouch' ? 'low' : 'high') : 'none';
    pose.coverBack = pose.cover !== 'none' && !this.shield;
    this.updateLook(stunned || thrown, dt);
    if (!e.alive) this.deadFor += dt;
    pose.stateTime = thrown ? Math.max(0, e.thrownT - THROW_DELAY) : e.alive ? m.stateTime : this.deadFor;
    pose.recoil = e.recoilVis;
    // El sabueso se agazapa mientras avisa y salta; a una persona no le toca.
    pose.melee = e.def.lunge && e.alive ? e.cmd.telegraph : 0;
    pose.slash = e.alive ? e.cmd.lunge : -1;
    pose.shield = this.updateShield(dt);
    pose.flinch = e.flinch * e.flinch;
    pose.flinchSide = e.flinchSide;
    pose.flinchFront = e.flinchFront;
    pose.hitPart = e.hitPart;
    pose.stagger = e.alive ? e.stagger : 0;
    pose.limp = e.limping;
    pose.death = e.deathStyle;
    // Proyectado en un remate: la caída sigue su curso aunque muera a mitad.
    pose.thrown = thrown ? e.thrownT : !e.alive && e.deathFallStart > 0 ? this.deadFor + THROW_DELAY : -1;
    const step = animationStep(this.sight, dt);
    if (step > 0) this.rig.update(pose, step);
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
      const kind = e.cmd.icon;
      this.icon.material = alertIconMaterial(dazed ? 'stunned' : kind === 'alert' || kind === 'flank' ? kind : 'suspicious');
      this.icon.position.set(root.position.x, root.position.y + ICON_Y[e.def.body ?? (m.posture === 'crouch' ? 'crouch' : 'stand')], root.position.z);
      const s = dazed ? 0.42 : kind === 'alert' || kind === 'flank' ? 0.5 : 0.32 + e.cmd.detection * 0.16;
      this.icon.scale.set(s, s, s);
    } else {
      this.icon.visible = false;
    }
  }

  /**
   * El escudo va por delante; si se lo bajan (o va de guardia), cae a un lado; si se rompe o muere, al suelo. Devuelve
   * cuánto lo sostiene el brazo.
   */
  private updateShield(dt: number): number {
    const s = this.shield;
    if (!s) return 0;
    const e = this.enemy;
    const lost = !e.alive || e.shieldBroken;
    this.shieldK = damp(this.shieldK, !lost && e.shieldUp ? 1 : 0, 12, dt);
    this.shieldFall = lost ? Math.min(1, this.shieldFall + dt * 2.4) : 0;
    const k = smooth(0, 1, this.shieldK);
    const f = this.shieldFall * this.shieldFall;
    const duck = e.mover.posture === 'crouch' ? 0.42 : 0;
    const mix = (key: 'x' | 'y' | 'z' | 'rx' | 'ry'): number => {
      const held = SHIELD_DOWN[key] + (SHIELD_UP[key] - SHIELD_DOWN[key]) * k;
      return held + (SHIELD_FLOOR[key] - held) * f;
    };
    s.position.set(mix('x'), mix('y') - duck * (1 - f), mix('z'));
    s.rotation.set(mix('rx') + (e.flinch * 0.12 + e.stagger * 0.2) * (1 - f), mix('ry'), 0);
    return lost ? 0 : 0.45 + 0.55 * k;
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
        const eye = r.position.y + (e.def.body ? e.eyeHeight : e.mover.posture === 'crouch' ? 0.95 : 1.45);
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
    if (this.shield) {
      release(shieldGeometries, String(this.enemy.def.color));
      this.shield = null;
    }
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

  /** El personaje de un enemigo (para medir su animación en las pruebas). */
  rigOf(e: Enemy): EnemyBody | null {
    return this.views.get(e)?.rig ?? null;
  }

  /** El personaje de un enemigo, si es una persona (a las máquinas no se las agarra). */
  personOf(e: Enemy): CharacterRig | null {
    const rig = this.rigOf(e);
    return rig instanceof CharacterRig ? rig : null;
  }

  /** A quién está proyectando el que hay en ese punto (en red no llega quién es: el más cercano que cae así). */
  victimNear(x: number, z: number): CharacterRig | null {
    let best: CharacterRig | null = null;
    let bestD = VICTIM_RADIUS * VICTIM_RADIUS;
    for (const [e, v] of this.views) {
      if (e.thrownT < 0 && e.deathFallStart <= 0) continue;
      const d = (e.feet.x - x) ** 2 + (e.feet.z - z) ** 2;
      if (d >= bestD || !(v.rig instanceof CharacterRig)) continue;
      bestD = d;
      best = v.rig;
    }
    return best;
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
