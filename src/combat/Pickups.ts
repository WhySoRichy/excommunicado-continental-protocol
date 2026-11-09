import { BoxGeometry, Color, Group, Mesh, MeshStandardMaterial, type Scene, Vector3 } from 'three';
import type { PickupKind } from '../levels/types';
import { addRim } from '../render/materials';

/** Objetos recogibles al pasar por encima (munición, botiquín, armadura). */
interface Pickup {
  kind: PickupKind;
  pos: Vector3;
  mesh: Group;
  taken: boolean;
  /** Los soltados por enemigos desaparecen pasado un tiempo. */
  ttl: number;
}

const COLORS: Record<PickupKind, number> = { ammo: 0xd4af37, medkit: 0xf2f2f2, armor: 0x5aa9ff };
const PICK_RADIUS = 1.15;

let sharedGeo: BoxGeometry | null = null;
const sharedMats = new Map<PickupKind, MeshStandardMaterial>();

function matFor(kind: PickupKind): MeshStandardMaterial {
  const hit = sharedMats.get(kind);
  if (hit) return hit;
  const m = new MeshStandardMaterial({ color: COLORS[kind], roughness: 0.4, metalness: 0.2, emissive: new Color(COLORS[kind]).multiplyScalar(0.25) });
  addRim(m, COLORS[kind], 1.4, 2);
  sharedMats.set(kind, m);
  return m;
}

export class Pickups {
  private readonly list: Pickup[] = [];
  private t = 0;

  constructor(private readonly scene: Scene) {}

  add(kind: PickupKind, pos: Vector3, ttl = Number.POSITIVE_INFINITY): void {
    sharedGeo ??= new BoxGeometry(0.34, 0.24, 0.24);
    const g = new Group();
    const body = new Mesh(sharedGeo, matFor(kind));
    g.add(body);
    if (kind === 'medkit') {
      const cross = new Mesh(sharedGeo, new MeshStandardMaterial({ color: 0xd12b2b, emissive: 0x400000 }));
      cross.scale.set(0.3, 1.05, 1.05);
      g.add(cross);
    }
    g.position.copy(pos);
    g.position.y += 0.35;
    this.scene.add(g);
    this.list.push({ kind, pos: pos.clone(), mesh: g, taken: false, ttl });
  }

  /** Devuelve el tipo recogido este paso (o null). */
  collect(playerFeet: Vector3, canTake: (k: PickupKind) => boolean): PickupKind | null {
    for (const p of this.list) {
      if (p.taken) continue;
      if (Math.abs(p.pos.y - playerFeet.y) > 1.4) continue;
      if (Math.hypot(p.pos.x - playerFeet.x, p.pos.z - playerFeet.z) > PICK_RADIUS) continue;
      if (!canTake(p.kind)) continue;
      p.taken = true;
      p.mesh.visible = false;
      return p.kind;
    }
    return null;
  }

  update(dt: number): void {
    this.t += dt;
    for (const p of this.list) {
      if (p.taken) continue;
      p.ttl -= dt;
      if (p.ttl <= 0) {
        p.taken = true;
        p.mesh.visible = false;
        continue;
      }
      p.mesh.rotation.y += dt * 1.6;
      p.mesh.position.y = p.pos.y + 0.35 + Math.sin(this.t * 3 + p.pos.x) * 0.06;
    }
  }

  get activeCount(): number {
    return this.list.filter((p) => !p.taken).length;
  }

  /** Posiciones activas (QA). */
  active(): Array<{ kind: PickupKind; x: number; y: number; z: number }> {
    return this.list.filter((p) => !p.taken).map((p) => ({ kind: p.kind, x: p.pos.x, y: p.pos.y, z: p.pos.z }));
  }

  dispose(): void {
    for (const p of this.list) this.scene.remove(p.mesh);
    this.list.length = 0;
  }
}
