import { Vector3 } from 'three';
import { type PhysicsWorld, QueryGroups } from '../physics/Physics';

/** A menos de esto (m) no se comprueba: siempre se dibuja. */
const NEAR = 6;
/** Se mira también a los lados del cuerpo (m): así aparece antes de asomar por una esquina. */
const MARGIN = 1.1;
/** Cada cuántos fotogramas se vuelve a mirar a quien se ve y a quien no. */
const CHECK_SEEN = 10;
const CHECK_HIDDEN = 3;
/** Comprobaciones seguidas sin verlo antes de dejar de dibujarlo. */
const PATIENCE = 2;
/** A los tapados se los anima uno de cada tantos fotogramas, para que al aparecer no salten. */
const IDLE_PERIOD = 5;
const IDLE_MAX_DT = 0.1;

const _p = new Vector3();

/** Lo que se recuerda de cada personaje. */
export interface Sight {
  visible: boolean;
  /** Fotogramas hasta volver a mirar. */
  wait: number;
  misses: number;
  /** Tiempo sin animar (s) y fotogramas que lleva tapado. */
  idle: number;
  frames: number;
}

/** `seed` reparte las comprobaciones entre fotogramas. */
export function newSight(seed: number): Sight {
  return { visible: true, wait: seed % CHECK_SEEN, misses: 0, idle: 0, frames: seed % IDLE_PERIOD };
}

/** Los personajes que las paredes tapan del todo ni se dibujan ni se animan a cada fotograma: en un club lleno son casi todos. */
export class Occlusion {
  constructor(private readonly physics: PhysicsWorld) {}

  /** ¿Se ve desde `eye` a quien está en `feet` y mide `height`? Actualiza `s.visible` y lo devuelve. */
  look(s: Sight, eye: Vector3, feet: Vector3, height: number): boolean {
    if (s.wait-- > 0) return s.visible;
    if (this.sees(eye, feet, height)) {
      s.visible = true;
      s.misses = 0;
    } else if (++s.misses >= PATIENCE) s.visible = false;
    s.wait = s.visible && s.misses === 0 ? CHECK_SEEN : CHECK_HIDDEN;
    return s.visible;
  }

  private sees(eye: Vector3, feet: Vector3, height: number): boolean {
    const dx = feet.x - eye.x;
    const dz = feet.z - eye.z;
    const d = Math.hypot(dx, dz);
    if (d < NEAR) return true;
    const sx = (-dz / d) * MARGIN;
    const sz = (dx / d) * MARGIN;
    return (
      this.clear(eye, feet.x, feet.y + height * 0.95, feet.z) ||
      this.clear(eye, feet.x + sx, feet.y + height * 0.6, feet.z + sz) ||
      this.clear(eye, feet.x - sx, feet.y + height * 0.6, feet.z - sz) ||
      this.clear(eye, feet.x, feet.y + 0.15, feet.z) ||
      this.clear(eye, feet.x, feet.y + height + 0.5, feet.z)
    );
  }

  private clear(eye: Vector3, x: number, y: number, z: number): boolean {
    return this.physics.lineOfSight(eye, _p.set(x, y, z), QueryGroups.STATIC);
  }
}

/** Cuánto hay que animar a este personaje en este fotograma: todo, si se ve; a ratos, si está tapado (0 = nada). */
export function animationStep(s: Sight, dt: number): number {
  if (s.visible) {
    const step = dt + s.idle;
    s.idle = 0;
    return Math.min(step, dt + IDLE_MAX_DT);
  }
  s.idle = Math.min(s.idle + dt, IDLE_MAX_DT);
  if (++s.frames % IDLE_PERIOD !== 0) return 0;
  const step = s.idle;
  s.idle = 0;
  return step;
}
