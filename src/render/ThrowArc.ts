import { DynamicDrawUsage, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, RingGeometry, type Scene, SphereGeometry, Vector3 } from 'three';
import { damp } from '../core/math';

/** Puntos del arco como mucho y cada cuántos pasos de vuelo va uno. */
export const ARC_POINTS = 34;
export const ARC_EVERY = 3;
const DOT = 0.03;
/** Los puntos crecen con la distancia a la cámara para leerse igual de lejos. */
const GROW = 0.1;
const RING_IN = 0.3;
const RING_OUT = 0.4;
const COLOR = 0xffc84a;

const _m = new Matrix4();
const HIDE = new Matrix4().makeScale(0, 0, 0);

/**
 * El arco de lo que se lanzaría ahora mismo: una hilera de puntos hasta donde estalla y un anillo ahí. Aparece mientras
 * se mantiene la tecla y se desvanece al soltarla.
 */
export class ThrowArc {
  /** Puntos del recorrido, que rellena quien lo simula. */
  readonly points: Vector3[] = Array.from({ length: ARC_POINTS }, () => new Vector3());
  private readonly dots: InstancedMesh;
  private readonly ring: Mesh;
  private readonly dotMat = new MeshBasicMaterial({ color: COLOR, transparent: true, depthWrite: false, opacity: 0 });
  private readonly ringMat = new MeshBasicMaterial({ color: COLOR, transparent: true, depthWrite: false, depthTest: false, opacity: 0 });
  private alpha = 0;
  private time = 0;

  constructor(private readonly scene: Scene) {
    this.dots = new InstancedMesh(new SphereGeometry(1, 8, 6), this.dotMat, ARC_POINTS);
    this.dots.instanceMatrix.setUsage(DynamicDrawUsage);
    this.dots.frustumCulled = false;
    this.dots.renderOrder = 6;
    for (let i = 0; i < ARC_POINTS; i++) this.dots.setMatrixAt(i, HIDE);
    const g = new RingGeometry(RING_IN, RING_OUT, 28);
    g.rotateX(-Math.PI / 2);
    this.ring = new Mesh(g, this.ringMat);
    this.ring.frustumCulled = false;
    this.ring.renderOrder = 6;
    this.dots.visible = this.ring.visible = false;
    scene.add(this.dots, this.ring);
  }

  /** Cada fotograma: cuántos puntos del recorrido hay (0 para ocultarlo) y dónde está la cámara. */
  update(count: number, eye: Vector3, dt: number): void {
    this.time += dt;
    if (count > 0) {
      for (let i = 0; i < ARC_POINTS; i++) {
        if (i >= count - 1) {
          this.dots.setMatrixAt(i, HIDE);
          continue;
        }
        const p = this.points[i]!;
        const s = DOT * (0.75 + GROW * p.distanceTo(eye));
        this.dots.setMatrixAt(i, _m.makeScale(s, s, s).setPosition(p));
      }
      this.dots.instanceMatrix.needsUpdate = true;
      const end = this.points[count - 1]!;
      this.ring.position.set(end.x, end.y - 0.035, end.z);
      const s = 1 + 0.05 * end.distanceTo(eye) + 0.06 * Math.sin(this.time * 6);
      this.ring.scale.setScalar(s);
    }
    this.alpha = damp(this.alpha, count > 0 ? 1 : 0, 18, dt);
    const on = this.alpha > 0.02;
    this.dots.visible = this.ring.visible = on;
    this.dotMat.opacity = 0.95 * this.alpha;
    this.ringMat.opacity = 0.95 * this.alpha;
  }

  dispose(): void {
    this.scene.remove(this.dots, this.ring);
    this.dots.geometry.dispose();
    this.dots.dispose();
    this.ring.geometry.dispose();
    this.dotMat.dispose();
    this.ringMat.dispose();
  }
}
