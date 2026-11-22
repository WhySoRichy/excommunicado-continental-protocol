import { BoxGeometry, Group, Mesh, MeshBasicMaterial, type Scene, Vector3 } from 'three';
import { angleDelta, damp } from '../core/math';
import type { CoverSpot } from '../entities/coverSensor';

/** Ancho de la marca a lo largo de la pared y grosor de sus trazos (m). */
const WIDTH = 0.9;
const LINE = 0.035;
/** Altura de los trazos verticales: más altos en la cobertura alta. */
const TICK_LOW = 0.55;
const TICK_HIGH = 1.1;
const OPACITY = 0.55;
/** Más lejos que esto, la marca salta a la nueva pared en vez de deslizarse. */
const SNAP = 2.5;

// Geometría compartida por todas las sesiones (no se libera con cada nivel).
let unitBox: BoxGeometry | null = null;

const _target = new Vector3();

/**
 * La marca de la cobertura a la que iría C: un trazo al pie de la pared y dos verticales que suben por ella (más altas
 * en la alta). Aparece y se desvanece con suavidad y se desliza de una pared a otra. Solo lee el aviso del jugador.
 */
export class CoverMarker {
  private readonly root = new Group();
  private readonly material = new MeshBasicMaterial({ color: 0xf4ead2, transparent: true, depthWrite: false, opacity: 0 });
  private readonly base: Mesh;
  private readonly left: Mesh;
  private readonly right: Mesh;
  private alpha = 0;
  private time = 0;
  private tick = TICK_LOW;
  private yaw = 0;

  constructor(private readonly scene: Scene) {
    unitBox ??= new BoxGeometry(1, 1, 1);
    this.base = new Mesh(unitBox, this.material);
    this.left = new Mesh(unitBox, this.material);
    this.right = new Mesh(unitBox, this.material);
    this.base.scale.set(WIDTH, LINE, LINE);
    this.base.position.set(0, LINE / 2 + 0.01, LINE / 2);
    for (const m of [this.base, this.left, this.right]) {
      m.renderOrder = 5;
      m.frustumCulled = false;
      this.root.add(m);
    }
    this.root.visible = false;
    scene.add(this.root);
    this.layoutTicks();
  }

  private layoutTicks(): void {
    for (const [m, x] of [
      [this.left, -WIDTH / 2],
      [this.right, WIDTH / 2],
    ] as const) {
      m.scale.set(LINE, this.tick, LINE);
      m.position.set(x, this.tick / 2 + 0.01, LINE / 2);
    }
  }

  /** Cada fotograma: la cobertura que marcar (o null para ocultarla). */
  update(spot: CoverSpot | null, dt: number): void {
    this.time += dt;
    if (spot) {
      _target.set(spot.px + spot.nx * 0.01, spot.y, spot.pz + spot.nz * 0.01);
      const yaw = Math.atan2(spot.nx, spot.nz);
      const r = this.root;
      if (this.alpha < 0.05 || r.position.distanceTo(_target) > SNAP) {
        r.position.copy(_target);
        this.yaw = yaw;
      } else {
        r.position.x = damp(r.position.x, _target.x, 16, dt);
        r.position.y = damp(r.position.y, _target.y, 16, dt);
        r.position.z = damp(r.position.z, _target.z, 16, dt);
        this.yaw += angleDelta(this.yaw, yaw) * (1 - Math.exp(-16 * dt));
      }
      r.rotation.y = this.yaw;
      const tick = spot.height === 'high' ? TICK_HIGH : Math.max(0.3, Math.min(TICK_LOW, spot.top - 0.1));
      if (Math.abs(tick - this.tick) > 0.005) {
        this.tick = damp(this.tick, tick, 12, dt);
        this.layoutTicks();
      }
    }
    this.alpha = damp(this.alpha, spot ? 1 : 0, 10, dt);
    this.root.visible = this.alpha > 0.02;
    this.material.opacity = OPACITY * this.alpha * (0.82 + 0.18 * Math.sin(this.time * 5));
  }

  dispose(): void {
    this.scene.remove(this.root);
    this.material.dispose();
  }
}
