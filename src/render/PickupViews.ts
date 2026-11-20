import { BoxGeometry, Color, Group, Mesh, MeshStandardMaterial, type Scene } from 'three';
import type { PickupItem } from '../combat/Pickups';
import type { PickupKind } from '../levels/types';
import { addRim } from './materials';

const COLORS: Record<PickupKind, number> = { ammo: 0xd4af37, medkit: 0xf2f2f2, armor: 0x5aa9ff };

// Geometría y materiales compartidos por todos los objetos y niveles (no se liberan con cada uno).
let sharedGeo: BoxGeometry | null = null;
const sharedMats = new Map<PickupKind, MeshStandardMaterial>();
let crossMat: MeshStandardMaterial | null = null;

function matFor(kind: PickupKind): MeshStandardMaterial {
  const hit = sharedMats.get(kind);
  if (hit) return hit;
  const m = new MeshStandardMaterial({ color: COLORS[kind], roughness: 0.4, metalness: 0.2, emissive: new Color(COLORS[kind]).multiplyScalar(0.25) });
  addRim(m, COLORS[kind], 1.4, 2);
  sharedMats.set(kind, m);
  return m;
}

function makeMesh(kind: PickupKind): Group {
  sharedGeo ??= new BoxGeometry(0.34, 0.24, 0.24);
  const g = new Group();
  g.add(new Mesh(sharedGeo, matFor(kind)));
  if (kind === 'medkit') {
    // Antes cada botiquín creaba su propio material para la cruz y no se liberaba nunca.
    crossMat ??= new MeshStandardMaterial({ color: 0xd12b2b, emissive: 0x400000 });
    const cross = new Mesh(sharedGeo, crossMat);
    cross.scale.set(0.3, 1.05, 1.05);
    g.add(cross);
  }
  return g;
}

/**
 * Cómo se ven los objetos recogibles: una caja del color de su tipo que gira y flota. Lee la lista de `Pickups` sin
 * cambiarla: crea la malla de cada objeto nuevo y retira la de los que ya no están.
 */
export class PickupViews {
  private readonly meshes = new Map<PickupItem, { group: Group; seen: number }>();
  private t = 0;
  private tick = 0;

  constructor(private readonly scene: Scene) {}

  update(items: readonly PickupItem[], dt: number): void {
    this.t += dt;
    const tick = ++this.tick;
    for (const p of items) {
      let v = this.meshes.get(p);
      if (!v) {
        v = { group: makeMesh(p.kind), seen: 0 };
        v.group.position.copy(p.pos);
        this.scene.add(v.group);
        this.meshes.set(p, v);
      }
      v.seen = tick;
      const g = v.group;
      g.visible = !p.taken;
      g.rotation.y += dt * 1.6;
      g.position.y = p.pos.y + 0.35 + Math.sin(this.t * 3 + p.pos.x) * 0.06;
    }
    if (this.meshes.size <= items.length) return;
    for (const [p, v] of this.meshes) {
      if (v.seen === tick) continue;
      this.scene.remove(v.group);
      this.meshes.delete(p);
    }
  }

  dispose(): void {
    for (const v of this.meshes.values()) this.scene.remove(v.group);
    this.meshes.clear();
  }
}
