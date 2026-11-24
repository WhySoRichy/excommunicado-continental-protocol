import { type BufferGeometry, Mesh, type Scene, Vector3 } from 'three';
import type { Grenade } from '../combat/Grenades';
import { gearGeometry } from '../entities/rig/weapons';
import { weaponMaterial } from './weaponMaterial';

/** Algo mayor que la real: en tercera persona y en movimiento, si no, no se ve. */
const SCALE = 1.35;
/** Altura del centro del modelo (que está de pie sobre su base) y vueltas que da por metro recorrido. */
const CENTER_Y = 0.045;
const TURNS = 2.6;
const ACCENT = 0xd4af37;

// Geometría compartida por todas las granadas y niveles (no se libera con cada uno).
let shared: BufferGeometry | null = null;

const _move = new Vector3();
const _axis = new Vector3();

interface View {
  mesh: Mesh;
  seen: number;
  readonly last: Vector3;
}

/**
 * Cómo se ven las granadas en vuelo: el mismo modelo de la armería, girando según lo que recorre. Lee la lista de
 * `Grenades` sin cambiarla.
 */
export class GrenadeViews {
  private readonly views = new Map<Grenade, View>();
  private tick = 0;

  constructor(private readonly scene: Scene) {}

  update(items: readonly Grenade[], alpha: number): void {
    const tick = ++this.tick;
    for (const g of items) {
      let v = this.views.get(g);
      if (!v) {
        if (!shared) {
          shared = gearGeometry(g.kind, ACCENT);
          shared.translate(0, -CENTER_Y, 0);
        }
        const mesh = new Mesh(shared, weaponMaterial());
        mesh.scale.setScalar(SCALE);
        mesh.castShadow = true;
        mesh.frustumCulled = false;
        this.scene.add(mesh);
        v = { mesh, seen: 0, last: g.pos.clone() };
        this.views.set(g, v);
      }
      v.seen = tick;
      const m = v.mesh;
      m.position.lerpVectors(g.prev, g.pos, alpha);
      // Gira hacia donde va: el eje es horizontal y perpendicular al recorrido.
      _move.subVectors(m.position, v.last);
      v.last.copy(m.position);
      const d = _move.length();
      if (d > 1e-4) {
        _axis.set(_move.z, 0, -_move.x);
        if (_axis.lengthSq() < 1e-8) _axis.set(1, 0, 0);
        m.rotateOnWorldAxis(_axis.normalize(), d * TURNS * 2);
      }
    }
    if (this.views.size <= items.length) return;
    for (const [g, v] of this.views) {
      if (v.seen === tick) continue;
      this.scene.remove(v.mesh);
      this.views.delete(g);
    }
  }

  dispose(): void {
    for (const v of this.views.values()) this.scene.remove(v.mesh);
    this.views.clear();
  }
}
