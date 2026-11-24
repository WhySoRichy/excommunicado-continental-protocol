import type { Camera, Material, Object3D, Scene } from 'three';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';

/** Radio del efecto (m) y cuánto oscurece: rincones, pies de las paredes y bajo los muebles. */
const RADIUS = 1.1;
const INTENSITY = 1;
/** El efecto se calcula a esta fracción de la resolución: casi no se nota y cuesta la cuarta parte. */
const SCALE = 0.5;

/**
 * Oclusión ambiental (GTAO de three) para los presets que la tienen. Dos cambios sobre la de three: se calcula a media
 * resolución y su pase de normales oculta también lo transparente (fogonazos, humo, trazadoras, la marca de cobertura,
 * cristales), que si no dejaba halos oscuros alrededor de cada efecto.
 */
export class AmbientOcclusionPass extends GTAOPass {
  private readonly hidden: Object3D[] = [];

  constructor(scene: Scene, camera: Camera, width: number, height: number) {
    super(scene, camera, Math.max(1, Math.round(width * SCALE)), Math.max(1, Math.round(height * SCALE)));
    this.blendIntensity = INTENSITY;
    this.updateGtaoMaterial({ radius: RADIUS, distanceExponent: 1.4, thickness: 0.6, scale: 1.8, samples: 12, distanceFallOff: 1 });
    this.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
  }

  override setSize(width: number, height: number): void {
    super.setSize(Math.max(1, Math.round(width * SCALE)), Math.max(1, Math.round(height * SCALE)));
  }

  /** Oculta lo transparente, los puntos y las líneas (una sola función: el pase corre en cada fotograma). */
  private readonly hide = (o: Object3D): void => {
    if (!o.visible) return;
    const x = o as Object3D & { material?: Material | Material[]; isPoints?: boolean; isLine?: boolean; isSprite?: boolean };
    const m = x.material;
    const transparent = Array.isArray(m) ? m.some((y) => y.transparent) : !!m?.transparent;
    if (transparent || x.isPoints || x.isLine || x.isSprite) {
      o.visible = false;
      this.hidden.push(o);
    }
  };

  // Sustituyen a los de three (mismo nombre): además de puntos y líneas, ocultan lo transparente.
  _overrideVisibility(): void {
    this.hidden.length = 0;
    this.scene.traverse(this.hide);
  }

  _restoreVisibility(): void {
    for (const o of this.hidden) o.visible = true;
    this.hidden.length = 0;
  }
}
