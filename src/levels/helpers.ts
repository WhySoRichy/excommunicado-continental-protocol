import type { BoxDef, CoverKind, MaterialId, RampDef, Vec3 } from './types';

/**
 * Helpers PUROS para escribir niveles como datos. Cada función devuelve cajas;
 * no tocan three ni Rapier (se testean en Vitest).
 */

export interface BoxOpts {
  collide?: boolean;
  cover?: CoverKind;
  shadow?: boolean;
  noWalk?: boolean;
  tag?: string;
  rotY?: number;
}

function withOpts(b: BoxDef, o?: BoxOpts): BoxDef {
  if (!o) return b;
  const out: BoxDef = { ...b };
  if (o.collide !== undefined) out.collide = o.collide;
  if (o.cover !== undefined) out.cover = o.cover;
  if (o.shadow !== undefined) out.shadow = o.shadow;
  if (o.noWalk !== undefined) out.noWalk = o.noWalk;
  if (o.tag !== undefined) out.tag = o.tag;
  if (o.rotY !== undefined) out.rotY = o.rotY;
  return out;
}

/** Caja alineada a ejes a partir de esquinas mínima y máxima. */
export function aabb(
  minX: number,
  minY: number,
  minZ: number,
  maxX: number,
  maxY: number,
  maxZ: number,
  mat: MaterialId,
  o?: BoxOpts,
): BoxDef {
  if (maxX <= minX || maxY <= minY || maxZ <= minZ) {
    throw new Error(`aabb inválida: [${minX},${minY},${minZ}] → [${maxX},${maxY},${maxZ}]`);
  }
  return withOpts(
    {
      c: [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2],
      s: [maxX - minX, maxY - minY, maxZ - minZ],
      mat,
    },
    o,
  );
}

/** Caja apoyada en el suelo `y0` con centro XZ y tamaño. */
export function block(x: number, z: number, sx: number, sy: number, sz: number, mat: MaterialId, o?: BoxOpts & { y0?: number }): BoxDef {
  const y0 = o?.y0 ?? 0;
  return withOpts({ c: [x, y0 + sy / 2, z], s: [sx, sy, sz], mat }, o);
}

/** Losa de suelo (no proyecta sombra). Superficie superior en `top`. */
export function floor(minX: number, minZ: number, maxX: number, maxZ: number, top: number, mat: MaterialId, thickness = 0.5): BoxDef {
  return aabb(minX, top - thickness, minZ, maxX, top, maxZ, mat, { shadow: false });
}

export type Side = 'north' | 'south' | 'east' | 'west';

export interface DoorDef {
  side: Side;
  /** Coordenada del centro de la puerta a lo largo de la pared (x para N/S, z para E/W). */
  at: number;
  width: number;
  height: number;
}

export interface RoomShellDef {
  minX: number;
  minZ: number;
  maxX: number;
  maxZ: number;
  /** Altura del suelo. */
  y0?: number;
  height: number;
  thickness?: number;
  wallMat: MaterialId;
  floorMat?: MaterialId;
  ceilingMat?: MaterialId;
  doors?: DoorDef[];
  /** Lados sin pared. */
  open?: Side[];
}

/**
 * Habitación: suelo opcional, cuatro paredes por FUERA del rectángulo interior
 * (el interior queda libre exactamente en [min, max]) y huecos de puerta con dintel.
 */
export function roomShell(d: RoomShellDef): BoxDef[] {
  const t = d.thickness ?? 0.4;
  const y0 = d.y0 ?? 0;
  const out: BoxDef[] = [];
  if (d.floorMat) out.push(floor(d.minX - t, d.minZ - t, d.maxX + t, d.maxZ + t, y0, d.floorMat));
  if (d.ceilingMat) {
    out.push(aabb(d.minX - t, y0 + d.height, d.minZ - t, d.maxX + t, y0 + d.height + 0.3, d.maxZ + t, d.ceilingMat, { shadow: false, noWalk: true }));
  }
  const sides: Side[] = ['north', 'south', 'east', 'west'];
  for (const side of sides) {
    if (d.open?.includes(side)) continue;
    const doors = (d.doors ?? []).filter((dr) => dr.side === side).sort((a, b) => a.at - b.at);
    // Eje a lo largo de la pared: N/S → x, E/W → z (incluye las esquinas en N/S).
    const along = side === 'north' || side === 'south';
    const a0 = along ? d.minX - t : d.minZ;
    const a1 = along ? d.maxX + t : d.maxZ;
    let cursor = a0;
    const segs: Array<[number, number]> = [];
    for (const dr of doors) {
      const s0 = dr.at - dr.width / 2;
      const s1 = dr.at + dr.width / 2;
      if (s0 < a0 || s1 > a1) throw new Error(`Puerta fuera de la pared ${side} en ${dr.at}`);
      if (s0 > cursor) segs.push([cursor, s0]);
      // Dintel sobre la puerta.
      if (dr.height < d.height) out.push(wallSeg(d, side, s0, s1, y0 + dr.height, y0 + d.height, t));
      cursor = s1;
    }
    if (cursor < a1) segs.push([cursor, a1]);
    for (const [s0, s1] of segs) out.push(wallSeg(d, side, s0, s1, y0, y0 + d.height, t));
  }
  return out;
}

function wallSeg(d: RoomShellDef, side: Side, s0: number, s1: number, yA: number, yB: number, t: number): BoxDef {
  switch (side) {
    case 'north':
      return aabb(s0, yA, d.minZ - t, s1, yB, d.minZ, d.wallMat, { noWalk: true });
    case 'south':
      return aabb(s0, yA, d.maxZ, s1, yB, d.maxZ + t, d.wallMat, { noWalk: true });
    case 'west':
      return aabb(d.minX - t, yA, s0, d.minX, yB, s1, d.wallMat, { noWalk: true });
    case 'east':
      return aabb(d.maxX, yA, s0, d.maxX + t, yB, s1, d.wallMat, { noWalk: true });
  }
}

export type Dir4 = 'x+' | 'x-' | 'z+' | 'z-';

export interface StairsDef {
  /** Centro del borde frontal del primer escalón, a la altura de la base. */
  start: Vec3;
  dir: Dir4;
  steps: number;
  rise: number;
  run: number;
  width: number;
  mat: MaterialId;
}

/** Escalera maciza: cada peldaño es una caja desde la base hasta su huella (sin huecos debajo). */
export function stairs(d: StairsDef): BoxDef[] {
  const out: BoxDef[] = [];
  const [sx, sy, sz] = d.start;
  for (let i = 0; i < d.steps; i++) {
    const top = sy + d.rise * (i + 1);
    const a = d.run * i;
    const b = d.run * (i + 1);
    const h = d.width / 2;
    switch (d.dir) {
      case 'x+':
        out.push(aabb(sx + a, sy, sz - h, sx + b, top, sz + h, d.mat));
        break;
      case 'x-':
        out.push(aabb(sx - b, sy, sz - h, sx - a, top, sz + h, d.mat));
        break;
      case 'z+':
        out.push(aabb(sx - h, sy, sz + a, sx + h, top, sz + b, d.mat));
        break;
      case 'z-':
        out.push(aabb(sx - h, sy, sz - b, sx + h, top, sz - a, d.mat));
        break;
    }
  }
  return out;
}

/** Rampa recta entre dos alturas. */
export function ramp(from: Vec3, to: Vec3, w: number, mat: MaterialId, thickness = 0.3): RampDef {
  return { from, to, w, mat, thickness };
}

/** Barandilla baja (bloquea caídas; no sirve de cobertura útil). */
export function railing(minX: number, minZ: number, maxX: number, maxZ: number, y0: number, mat: MaterialId, height = 1.05): BoxDef {
  return aabb(minX, y0, minZ, maxX, y0 + height, maxZ, mat, { noWalk: true });
}

/** Columna cuadrada. */
export function pillar(x: number, z: number, size: number, height: number, mat: MaterialId, y0 = 0): BoxDef {
  return block(x, z, size, height, size, mat, { y0, noWalk: true });
}

/** Pendiente en grados de una rampa (para validación y tests). */
export function rampSlopeDeg(r: RampDef): number {
  const dx = r.to[0] - r.from[0];
  const dz = r.to[2] - r.from[2];
  const dy = r.to[1] - r.from[1];
  return (Math.atan2(Math.abs(dy), Math.hypot(dx, dz)) * 180) / Math.PI;
}
