import { Vector3 } from 'three';
import type { PickupKind } from '../levels/types';

/** Objeto recogible al pasar por encima (munición, botiquín, armadura). */
export interface PickupItem {
  /** Id de red: único en la partida. */
  readonly id: number;
  readonly kind: PickupKind;
  readonly pos: Vector3;
  taken: boolean;
  /** Los soltados por enemigos desaparecen pasado un tiempo (s). */
  ttl: number;
}

const PICK_RADIUS = 1.15;

/** Los objetos recogibles de un nivel, solo simulación. Lo que se ve es `PickupViews` (render), que lee esta lista. */
export class Pickups {
  private readonly list: PickupItem[] = [];
  private nextId = 1;

  /** Los objetos en juego (la vista los dibuja; no se modifican desde fuera). */
  get items(): readonly PickupItem[] {
    return this.list;
  }

  add(kind: PickupKind, pos: Vector3, ttl = Number.POSITIVE_INFINITY, id = this.nextId++): void {
    this.list.push({ id, kind, pos: pos.clone(), taken: false, ttl });
  }

  /**
   * Réplica (fase 3): deja la lista igual que la del anfitrión. Conserva los objetos que ya estaban (su vista sigue
   * siendo la misma), añade los nuevos y quita los que el anfitrión ya no tiene.
   */
  applyNet(items: ReadonlyArray<{ id: number; kind: PickupKind; x: number; y: number; z: number }>): void {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const id = this.list[i]!.id;
      if (!items.some((it) => it.id === id)) this.list.splice(i, 1);
    }
    for (const it of items) {
      if (this.list.some((p) => p.id === it.id)) continue;
      this.list.push({ id: it.id, kind: it.kind, pos: new Vector3(it.x, it.y, it.z), taken: false, ttl: Number.POSITIVE_INFINITY });
    }
  }

  /** Devuelve el tipo recogido este paso (o null). */
  collect(playerFeet: Vector3, canTake: (k: PickupKind) => boolean): PickupKind | null {
    for (const p of this.list) {
      if (p.taken) continue;
      if (Math.abs(p.pos.y - playerFeet.y) > 1.4) continue;
      if (Math.hypot(p.pos.x - playerFeet.x, p.pos.z - playerFeet.z) > PICK_RADIUS) continue;
      if (!canTake(p.kind)) continue;
      p.taken = true;
      return p.kind;
    }
    return null;
  }

  update(dt: number): void {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i]!;
      // Recogido o caducado: fuera de la lista (en el Gauntlet se acumulaban sin fin).
      if (p.taken) {
        this.list.splice(i, 1);
        continue;
      }
      p.ttl -= dt;
      if (p.ttl <= 0) p.taken = true;
    }
  }

  /** Posiciones activas (QA). */
  active(): Array<{ kind: PickupKind; x: number; y: number; z: number }> {
    return this.list.filter((p) => !p.taken).map((p) => ({ kind: p.kind, x: p.pos.x, y: p.pos.y, z: p.pos.z }));
  }

  dispose(): void {
    this.list.length = 0;
  }
}
