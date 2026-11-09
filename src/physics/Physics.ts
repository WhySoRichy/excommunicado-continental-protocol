import type * as RapierNS from '@dimforge/rapier3d-compat';
import type { Collider, KinematicCharacterController, RigidBody, World } from '@dimforge/rapier3d-compat';

export type Rapier = typeof RapierNS;

export interface Vec3Like {
  x: number;
  y: number;
  z: number;
}

export interface QuatLike {
  x: number;
  y: number;
  z: number;
  w: number;
}

let rapier: Rapier | null = null;

/** Carga e inicializa Rapier una sola vez (chunk propio, ~4 MB con el wasm inline). */
export async function loadRapier(): Promise<Rapier> {
  if (rapier) return rapier;
  const mod = await import('@dimforge/rapier3d-compat');
  await mod.init();
  rapier = mod;
  return mod;
}

export function getRapier(): Rapier {
  if (!rapier) throw new Error('Rapier no está inicializado: llama a loadRapier() primero');
  return rapier;
}

/** Capas de colisión (bits de membresía). QUERY lo usan las consultas de escena. */
export const Layer = {
  STATIC: 0x0001,
  PLAYER: 0x0002,
  ENEMY: 0x0004,
  CIVILIAN: 0x0008,
  QUERY: 0x8000,
} as const;

/** Empaqueta membresía (16 bits altos) y filtro (16 bits bajos) como u32. */
export function interactionGroups(membership: number, filter: number): number {
  return (((membership & 0xffff) << 16) | (filter & 0xffff)) >>> 0;
}

/** Grupos de cada tipo de collider. */
export const Groups = {
  STATIC: interactionGroups(Layer.STATIC, 0xffff),
  PLAYER: interactionGroups(Layer.PLAYER, Layer.STATIC | Layer.ENEMY | Layer.QUERY),
  ENEMY: interactionGroups(Layer.ENEMY, Layer.STATIC | Layer.PLAYER | Layer.ENEMY | Layer.QUERY),
  // Los civiles no bloquean al jugador ni a los enemigos (nunca atascan una puerta).
  CIVILIAN: interactionGroups(Layer.CIVILIAN, Layer.STATIC | Layer.CIVILIAN | Layer.QUERY),
} as const;

/** Filtros para consultas (membresía QUERY). */
export const QueryGroups = {
  STATIC: interactionGroups(Layer.QUERY, Layer.STATIC),
  PLAYER_SHOT: interactionGroups(Layer.QUERY, Layer.STATIC | Layer.ENEMY | Layer.CIVILIAN),
  ENEMY_SHOT: interactionGroups(Layer.QUERY, Layer.STATIC | Layer.PLAYER),
  CHARACTERS: interactionGroups(Layer.QUERY, Layer.PLAYER | Layer.ENEMY | Layer.CIVILIAN),
  ENEMIES: interactionGroups(Layer.QUERY, Layer.ENEMY),
  STATIC_AND_ENEMIES: interactionGroups(Layer.QUERY, Layer.STATIC | Layer.ENEMY),
} as const;

/** Resultado reutilizable de un raycast (evita asignaciones en el bucle caliente). */
export interface RayHit {
  hit: boolean;
  distance: number;
  point: Vec3Like;
  normal: Vec3Like;
  collider: Collider | null;
}

export function createRayHit(): RayHit {
  return { hit: false, distance: 0, point: { x: 0, y: 0, z: 0 }, normal: { x: 0, y: 1, z: 0 }, collider: null };
}

export interface CharacterBody {
  body: RigidBody;
  collider: Collider;
  controller: KinematicCharacterController;
}

export interface CharacterControllerConfig {
  offset: number;
  autostepHeight: number;
  autostepMinWidth: number;
  snapToGround: number;
  maxSlopeClimbDeg: number;
  minSlopeSlideDeg: number;
}

export const DEFAULT_KCC: CharacterControllerConfig = {
  offset: 0.02,
  autostepHeight: 0.36,
  autostepMinWidth: 0.12,
  snapToGround: 0.3,
  maxSlopeClimbDeg: 46,
  minSlopeSlideDeg: 50,
};

const IDENTITY_ROT: QuatLike = { x: 0, y: 0, z: 0, w: 1 };

/**
 * Envoltorio del mundo Rapier de un nivel. Se crea uno nuevo por nivel y se
 * libera completo al salir (sin fugas de colliders entre niveles).
 */
export class PhysicsWorld {
  readonly R: Rapier;
  readonly world: World;
  private readonly ray: RapierNS.Ray;
  private readonly ball: RapierNS.Ball;
  private staticCount = 0;

  constructor(R: Rapier) {
    this.R = R;
    // La gravedad de los personajes la integra su propio controlador; el mundo no tiene cuerpos dinámicos.
    this.world = new R.World({ x: 0, y: 0, z: 0 });
    this.world.timestep = 1 / 60;
    this.ray = new R.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
    this.ball = new R.Ball(0.2);
  }

  get staticColliderCount(): number {
    return this.staticCount;
  }

  get colliderCount(): number {
    return this.world.colliders.len();
  }

  /** Collider estático de caja (centro, semiextensiones, rotación opcional). */
  addStaticBox(center: Vec3Like, half: Vec3Like, rot: QuatLike = IDENTITY_ROT): Collider {
    const desc = this.R.ColliderDesc.cuboid(half.x, half.y, half.z)
      .setTranslation(center.x, center.y, center.z)
      .setRotation(rot)
      .setCollisionGroups(Groups.STATIC)
      .setSolverGroups(Groups.STATIC);
    this.staticCount++;
    return this.world.createCollider(desc);
  }

  /** Cuerpo cinemático con cápsula para un personaje. `pos` es el centro de la cápsula. */
  createCharacter(pos: Vec3Like, radius: number, halfHeight: number, groups: number, cfg: CharacterControllerConfig = DEFAULT_KCC): CharacterBody {
    const body = this.world.createRigidBody(this.R.RigidBodyDesc.kinematicPositionBased().setTranslation(pos.x, pos.y, pos.z));
    const collider = this.world.createCollider(
      this.R.ColliderDesc.capsule(halfHeight, radius).setCollisionGroups(groups).setSolverGroups(groups),
      body,
    );
    const controller = this.world.createCharacterController(cfg.offset);
    controller.setUp({ x: 0, y: 1, z: 0 });
    controller.setSlideEnabled(true);
    controller.enableAutostep(cfg.autostepHeight, cfg.autostepMinWidth, false);
    controller.enableSnapToGround(cfg.snapToGround);
    controller.setMaxSlopeClimbAngle((cfg.maxSlopeClimbDeg * Math.PI) / 180);
    controller.setMinSlopeSlideAngle((cfg.minSlopeSlideDeg * Math.PI) / 180);
    controller.setApplyImpulsesToDynamicBodies(false);
    return { body, collider, controller };
  }

  removeCharacter(c: CharacterBody): void {
    this.world.removeCharacterController(c.controller);
    this.world.removeRigidBody(c.body);
  }

  /** Avanza el mundo (refresca la BVH de consultas con las posiciones cinemáticas). */
  step(): void {
    this.world.step();
  }

  /**
   * Raycast con normal. `dir` debe estar normalizado. Rellena `out` y devuelve `out.hit`.
   */
  raycast(origin: Vec3Like, dir: Vec3Like, maxDist: number, groups: number, out: RayHit, exclude?: Collider): boolean {
    const r = this.ray;
    r.origin.x = origin.x;
    r.origin.y = origin.y;
    r.origin.z = origin.z;
    r.dir.x = dir.x;
    r.dir.y = dir.y;
    r.dir.z = dir.z;
    const hit = this.world.castRayAndGetNormal(r, maxDist, true, undefined, groups, exclude);
    if (!hit) {
      out.hit = false;
      out.distance = maxDist;
      out.collider = null;
      return false;
    }
    out.hit = true;
    out.distance = hit.timeOfImpact;
    out.point.x = origin.x + dir.x * hit.timeOfImpact;
    out.point.y = origin.y + dir.y * hit.timeOfImpact;
    out.point.z = origin.z + dir.z * hit.timeOfImpact;
    out.normal.x = hit.normal.x;
    out.normal.y = hit.normal.y;
    out.normal.z = hit.normal.z;
    out.collider = hit.collider;
    return true;
  }

  /** ¿Hay línea de visión libre entre a y b para el filtro dado? */
  lineOfSight(a: Vec3Like, b: Vec3Like, groups: number, exclude?: Collider): boolean {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dz = b.z - a.z;
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (d < 1e-4) return true;
    const r = this.ray;
    r.origin.x = a.x;
    r.origin.y = a.y;
    r.origin.z = a.z;
    r.dir.x = dx / d;
    r.dir.y = dy / d;
    r.dir.z = dz / d;
    return this.world.castRay(r, d, true, undefined, groups, exclude) === null;
  }

  /**
   * Barrido de esfera desde `origin` en `dir` (normalizado) hasta `maxDist`.
   * Devuelve la distancia libre (maxDist si no choca; 0 si empieza penetrando).
   */
  sphereCast(origin: Vec3Like, dir: Vec3Like, maxDist: number, radius: number, groups: number, exclude?: Collider): number {
    this.ball.radius = radius;
    const hit = this.world.castShape(origin, IDENTITY_ROT, dir, this.ball, 0, maxDist, true, undefined, groups, exclude);
    return hit ? hit.time_of_impact : maxDist;
  }

  /** ¿La forma dada en esa posición solapa algún collider del filtro? */
  overlapsCapsule(center: Vec3Like, radius: number, halfHeight: number, groups: number, exclude?: Collider): Collider | null {
    const shape = new this.R.Capsule(halfHeight, radius);
    return this.world.intersectionWithShape(center, IDENTITY_ROT, shape, undefined, groups, exclude);
  }

  overlapsBall(center: Vec3Like, radius: number, groups: number, exclude?: Collider): Collider | null {
    this.ball.radius = radius;
    return this.world.intersectionWithShape(center, IDENTITY_ROT, this.ball, undefined, groups, exclude);
  }

  /** Líneas de depuración de todos los colliders (solo para el overlay F3). */
  debugLines(): { vertices: Float32Array; colors: Float32Array } {
    const buffers = this.world.debugRender();
    return { vertices: buffers.vertices, colors: buffers.colors };
  }

  dispose(): void {
    this.world.free();
  }
}
