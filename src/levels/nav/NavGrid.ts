import { Quaternion, Vector3 } from 'three';
import { boxToOriented, type OrientedBox, rampToOriented } from '../levelPhysics';
import type { LevelData, RampDef } from '../types';

/**
 * Grilla de navegación 2,5D generada AUTOMÁTICAMENTE de los datos del nivel
 * ("grilla A* generada del nivel"). Cada columna (celda XZ) puede tener varios
 * nodos a distintas alturas (suelo, plataformas, rampas). Se conectan los vecinos
 * caminables (escalón ≤ step o pendiente de rampa) sin cortar esquinas.
 */
export interface NavOptions {
  cell: number;
  agentRadius: number;
  agentHeight: number;
  /** Escalón máximo entre superficies planas (autostep del KCC). */
  step: number;
  maxSlopeDeg: number;
}

export const DEFAULT_NAV: NavOptions = { cell: 0.5, agentRadius: 0.36, agentHeight: 1.75, step: 0.34, maxSlopeDeg: 45 };

/** Desnivel admisible entre celdas vecinas cuando alguna está sobre una escalera (la celda puede abarcar 2 peldaños). */
const STAIR_STEP = 0.7;
/** Separación vertical entre muestras de espacio libre (menor que el grosor mínimo de losa). */
const CLEARANCE_STEP = 0.28;

const KIND_FLAT = 0;
const KIND_RAMP = 1;
const KIND_STAIR = 2;

interface Solid {
  ob: OrientedBox;
  inv: Quaternion;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

interface RampSurf {
  r: RampDef;
  fx: number;
  fz: number;
  fy: number;
  dy: number;
  dirX: number;
  dirZ: number;
  len: number;
  half: number;
}

const _p = new Vector3();
const DIRS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

export class NavGrid {
  readonly opts: NavOptions;
  readonly minX: number;
  readonly minZ: number;
  readonly nx: number;
  readonly nz: number;
  nodeCount = 0;
  nodeX: Float32Array = new Float32Array(0);
  nodeY: Float32Array = new Float32Array(0);
  nodeZ: Float32Array = new Float32Array(0);
  nodeRamp: Uint8Array = new Uint8Array(0);
  /** Columna de cada nodo. */
  nodeCol: Int32Array = new Int32Array(0);
  /** Para cada columna, rango [colStart[c], colStart[c+1]) en colNodes. */
  colStart: Int32Array;
  colNodes: Int32Array = new Int32Array(0);
  /** 8 vecinos por nodo (−1 = sin conexión). */
  adj: Int32Array = new Int32Array(0);
  /** Componente conexa de cada nodo. */
  comp: Int32Array = new Int32Array(0);

  // Búsqueda A* sin asignaciones por llamada.
  private gScore: Float32Array = new Float32Array(0);
  private fScore: Float32Array = new Float32Array(0);
  private parent: Int32Array = new Int32Array(0);
  private visited: Uint32Array = new Uint32Array(0);
  private closed: Uint32Array = new Uint32Array(0);
  private heap: Int32Array = new Int32Array(0);
  private heapSize = 0;
  private gen = 1;

  private constructor(opts: NavOptions, minX: number, minZ: number, nx: number, nz: number) {
    this.opts = opts;
    this.minX = minX;
    this.minZ = minZ;
    this.nx = nx;
    this.nz = nz;
    this.colStart = new Int32Array(nx * nz + 1);
  }

  static build(level: LevelData, opts: NavOptions = DEFAULT_NAV): NavGrid {
    const b = level.bounds;
    const cell = opts.cell;
    const nx = Math.max(1, Math.ceil((b.max[0] - b.min[0]) / cell));
    const nz = Math.max(1, Math.ceil((b.max[2] - b.min[2]) / cell));
    const g = new NavGrid(opts, b.min[0], b.min[2], nx, nz);

    // Sólidos (cajas con collider + rampas) con su AABB en XZ para filtrar rápido.
    const solids: Solid[] = [];
    const walkTops: Array<{ s: Solid; top: number; stair: boolean }> = [];
    for (const bx of level.boxes) {
      if (bx.collide === false) continue;
      const ob = boxToOriented(bx);
      const s = makeSolid(ob);
      solids.push(s);
      if (!bx.noWalk) walkTops.push({ s, top: ob.center.y + ob.half.y, stair: !!bx.stair });
    }
    const ramps: RampSurf[] = [];
    for (const r of level.ramps) {
      solids.push(makeSolid(rampToOriented(r)));
      const dx = r.to[0] - r.from[0];
      const dz = r.to[2] - r.from[2];
      const len = Math.hypot(dx, dz);
      // Una rampa que el KCC no puede subir no es superficie de navegación (evita atascos de IA).
      const slopeDeg = (Math.atan2(Math.abs(r.to[1] - r.from[1]), len) * 180) / Math.PI;
      if (slopeDeg > opts.maxSlopeDeg + 0.5) continue;
      ramps.push({ r, fx: r.from[0], fz: r.from[2], fy: r.from[1], dy: r.to[1] - r.from[1], dirX: dx / len, dirZ: dz / len, len, half: r.w / 2 });
    }
    // Cubos espaciales de 4 m para las pruebas de espacio libre.
    const bucket = 4;
    const bnx = Math.ceil((b.max[0] - b.min[0]) / bucket) + 1;
    const bnz = Math.ceil((b.max[2] - b.min[2]) / bucket) + 1;
    const buckets: Solid[][] = Array.from({ length: bnx * bnz }, () => []);
    const R = opts.agentRadius;
    for (const s of solids) {
      const x0 = Math.max(0, Math.floor((s.minX - R - b.min[0]) / bucket));
      const x1 = Math.min(bnx - 1, Math.floor((s.maxX + R - b.min[0]) / bucket));
      const z0 = Math.max(0, Math.floor((s.minZ - R - b.min[2]) / bucket));
      const z1 = Math.min(bnz - 1, Math.floor((s.maxZ + R - b.min[2]) / bucket));
      for (let i = x0; i <= x1; i++) for (let j = z0; j <= z1; j++) buckets[i + j * bnx]!.push(s);
    }
    const blocked = (x: number, y: number, z: number): boolean => {
      const bi = Math.floor((x - b.min[0]) / bucket);
      const bj = Math.floor((z - b.min[2]) / bucket);
      const list = buckets[bi + bj * bnx];
      if (!list) return true;
      const top = y + opts.agentHeight - 0.05;
      for (const s of list) {
        if (x < s.minX - R || x > s.maxX + R || z < s.minZ - R || z > s.maxZ + R) continue;
        // Toda la altura del agente, muestreada más fino que la losa más delgada.
        for (let sy = y + 0.3; sy <= top; sy += CLEARANCE_STEP) if (insideInflated(s, x, sy, z, R)) return true;
        if (insideInflated(s, x, top, z, R)) return true;
      }
      return false;
    };

    const xs: number[] = [];
    const ys: number[] = [];
    const zs: number[] = [];
    const rampFlag: number[] = [];
    const cols: number[] = [];
    const perCol: number[][] = Array.from({ length: nx * nz }, () => []);
    const cand: Array<{ y: number; kind: number }> = [];
    for (let iz = 0; iz < nz; iz++) {
      for (let ix = 0; ix < nx; ix++) {
        const x = b.min[0] + (ix + 0.5) * cell;
        const z = b.min[2] + (iz + 0.5) * cell;
        cand.length = 0;
        for (const wt of walkTops) {
          const s = wt.s;
          if (x < s.minX || x > s.maxX || z < s.minZ || z > s.maxZ) continue;
          if (footprintContains(s, x, z)) cand.push({ y: wt.top, kind: wt.stair ? KIND_STAIR : KIND_FLAT });
        }
        for (const rs of ramps) {
          const px = x - rs.fx;
          const pz = z - rs.fz;
          const t = (px * rs.dirX + pz * rs.dirZ) / rs.len;
          const lat = -px * rs.dirZ + pz * rs.dirX;
          if (t < 0 || t > 1 || Math.abs(lat) > rs.half - 0.05) continue;
          cand.push({ y: rs.fy + rs.dy * t, kind: KIND_RAMP });
        }
        if (cand.length === 0) continue;
        cand.sort((a, c) => c.y - a.y);
        const col = ix + iz * nx;
        let lastY = Number.POSITIVE_INFINITY;
        for (const c of cand) {
          // Superficies casi coincidentes (caja sobre caja): se queda la más alta.
          if (lastY - c.y < 0.15) continue;
          lastY = c.y;
          if (c.y > b.max[1]) continue;
          if (blocked(x, c.y, z)) continue;
          const id = xs.length;
          xs.push(x);
          ys.push(c.y);
          zs.push(z);
          rampFlag.push(c.kind);
          cols.push(col);
          perCol[col]!.push(id);
        }
      }
    }
    g.nodeCount = xs.length;
    g.nodeX = Float32Array.from(xs);
    g.nodeY = Float32Array.from(ys);
    g.nodeZ = Float32Array.from(zs);
    g.nodeRamp = Uint8Array.from(rampFlag);
    g.nodeCol = Int32Array.from(cols);
    const flat: number[] = [];
    for (let c = 0; c < nx * nz; c++) {
      g.colStart[c] = flat.length;
      for (const id of perCol[c]!) flat.push(id);
    }
    g.colStart[nx * nz] = flat.length;
    g.colNodes = Int32Array.from(flat);
    g.buildAdjacency();
    g.buildComponents();
    const n = g.nodeCount;
    g.gScore = new Float32Array(n);
    g.fScore = new Float32Array(n);
    g.parent = new Int32Array(n);
    g.visited = new Uint32Array(n);
    g.closed = new Uint32Array(n);
    g.heap = new Int32Array(n + 8);
    return g;
  }

  /** Diferencia de altura admisible entre dos nodos vecinos. */
  private stepOk(a: number, b: number, diag: boolean): boolean {
    const dy = Math.abs(this.nodeY[a]! - this.nodeY[b]!);
    const ka = this.nodeRamp[a]!;
    const kb = this.nodeRamp[b]!;
    if (ka === KIND_RAMP || kb === KIND_RAMP) {
      const run = this.opts.cell * (diag ? Math.SQRT2 : 1);
      return dy <= run * Math.tan((this.opts.maxSlopeDeg * Math.PI) / 180) + 0.12;
    }
    if (ka === KIND_STAIR || kb === KIND_STAIR) return dy <= STAIR_STEP;
    return dy <= this.opts.step;
  }

  /** Mejor nodo de la columna `col` conectable con `a` (−1 si ninguno). */
  private linkInColumn(a: number, col: number, diag: boolean): number {
    let best = -1;
    let bestDy = Number.POSITIVE_INFINITY;
    for (let k = this.colStart[col]!; k < this.colStart[col + 1]!; k++) {
      const b = this.colNodes[k]!;
      if (!this.stepOk(a, b, diag)) continue;
      const dy = Math.abs(this.nodeY[a]! - this.nodeY[b]!);
      if (dy < bestDy) {
        bestDy = dy;
        best = b;
      }
    }
    return best;
  }

  private buildAdjacency(): void {
    const n = this.nodeCount;
    this.adj = new Int32Array(n * 8).fill(-1);
    for (let a = 0; a < n; a++) {
      const col = this.nodeCol[a]!;
      const ix = col % this.nx;
      const iz = (col / this.nx) | 0;
      for (let d = 0; d < 8; d++) {
        const [dx, dz] = DIRS[d]!;
        const jx = ix + dx;
        const jz = iz + dz;
        if (jx < 0 || jz < 0 || jx >= this.nx || jz >= this.nz) continue;
        const diag = dx !== 0 && dz !== 0;
        const b = this.linkInColumn(a, jx + jz * this.nx, diag);
        if (b < 0) continue;
        if (diag) {
          // Sin cortar esquinas: ambos ortogonales deben ser caminables.
          if (this.linkInColumn(a, jx + iz * this.nx, false) < 0 || this.linkInColumn(a, ix + jz * this.nx, false) < 0) continue;
        }
        this.adj[a * 8 + d] = b;
      }
    }
  }

  private buildComponents(): void {
    const n = this.nodeCount;
    this.comp = new Int32Array(n).fill(-1);
    let c = 0;
    const stack: number[] = [];
    for (let s = 0; s < n; s++) {
      if (this.comp[s] !== -1) continue;
      this.comp[s] = c;
      stack.push(s);
      while (stack.length) {
        const a = stack.pop()!;
        for (let d = 0; d < 8; d++) {
          const b = this.adj[a * 8 + d]!;
          if (b >= 0 && this.comp[b] === -1) {
            this.comp[b] = c;
            stack.push(b);
          }
        }
      }
      c++;
    }
  }

  columnOf(x: number, z: number): number {
    const ix = Math.floor((x - this.minX) / this.opts.cell);
    const iz = Math.floor((z - this.minZ) / this.opts.cell);
    if (ix < 0 || iz < 0 || ix >= this.nx || iz >= this.nz) return -1;
    return ix + iz * this.nx;
  }

  /** Nodo más cercano a un punto (busca en anillos hasta `maxRadius` m). Prefiere alturas cercanas. */
  nearestNode(x: number, y: number, z: number, maxRadius = 2.5): number {
    const cell = this.opts.cell;
    const ix = Math.floor((x - this.minX) / cell);
    const iz = Math.floor((z - this.minZ) / cell);
    const rings = Math.ceil(maxRadius / cell);
    let best = -1;
    let bestD = Number.POSITIVE_INFINITY;
    for (let r = 0; r <= rings; r++) {
      for (let dz = -r; dz <= r; dz++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
          const jx = ix + dx;
          const jz = iz + dz;
          if (jx < 0 || jz < 0 || jx >= this.nx || jz >= this.nz) continue;
          const col = jx + jz * this.nx;
          for (let k = this.colStart[col]!; k < this.colStart[col + 1]!; k++) {
            const n = this.colNodes[k]!;
            const ddx = this.nodeX[n]! - x;
            const ddz = this.nodeZ[n]! - z;
            const ddy = (this.nodeY[n]! - y) * 2.5;
            const d = ddx * ddx + ddz * ddz + ddy * ddy;
            if (d < bestD) {
              bestD = d;
              best = n;
            }
          }
        }
      }
      // Encontrado en este anillo: los siguientes ya están más lejos en XZ.
      if (best >= 0 && r >= 1) break;
    }
    return best;
  }

  /** ¿Se puede ir en línea recta de a a b por la grilla (muestreo cada media celda)? */
  lineWalkable(a: number, b: number): boolean {
    const ax = this.nodeX[a]!;
    const az = this.nodeZ[a]!;
    const ay = this.nodeY[a]!;
    const bx = this.nodeX[b]!;
    const bz = this.nodeZ[b]!;
    const by = this.nodeY[b]!;
    const dist = Math.hypot(bx - ax, bz - az);
    const n = Math.ceil(dist / (this.opts.cell * 0.5));
    let prev = a;
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      const x = ax + (bx - ax) * t;
      const z = az + (bz - az) * t;
      const col = this.columnOf(x, z);
      if (col < 0) return false;
      const yExp = ay + (by - ay) * t;
      let found = -1;
      for (let k = this.colStart[col]!; k < this.colStart[col + 1]!; k++) {
        const nn = this.colNodes[k]!;
        if (Math.abs(this.nodeY[nn]! - yExp) <= 0.45 && (nn === prev || this.isNeighbor(prev, nn) || this.nodeCol[nn] === this.nodeCol[prev])) {
          found = nn;
          break;
        }
      }
      if (found < 0) return false;
      prev = found;
    }
    return true;
  }

  private isNeighbor(a: number, b: number): boolean {
    for (let d = 0; d < 8; d++) if (this.adj[a * 8 + d] === b) return true;
    return false;
  }

  /**
   * A* desde `start` hasta `goal`. Devuelve la ruta (índices de nodo) o null.
   * Coste: distancia 3D; heurística octil admisible.
   */
  findPath(start: number, goal: number, maxExpand = 30000): number[] | null {
    if (start < 0 || goal < 0) return null;
    if (this.comp[start] !== this.comp[goal]) return null;
    if (start === goal) return [start];
    this.gen++;
    if (this.gen > 0xfffffff0) {
      this.visited.fill(0);
      this.closed.fill(0);
      this.gen = 1;
    }
    const gen = this.gen;
    const gx = this.nodeX[goal]!;
    const gz = this.nodeZ[goal]!;
    const gy = this.nodeY[goal]!;
    const h = (n: number): number => {
      const dx = Math.abs(this.nodeX[n]! - gx);
      const dz = Math.abs(this.nodeZ[n]! - gz);
      return Math.max(dx, dz) + (Math.SQRT2 - 1) * Math.min(dx, dz) + Math.abs(this.nodeY[n]! - gy);
    };
    this.heapSize = 0;
    this.visited[start] = gen;
    this.gScore[start] = 0;
    this.fScore[start] = h(start);
    this.parent[start] = -1;
    this.push(start);
    let expanded = 0;
    while (this.heapSize > 0) {
      const a = this.pop();
      if (a === goal) return this.reconstruct(goal);
      if (this.closed[a] === gen) continue;
      this.closed[a] = gen;
      if (++expanded > maxExpand) return null;
      const ga = this.gScore[a]!;
      for (let d = 0; d < 8; d++) {
        const b = this.adj[a * 8 + d]!;
        if (b < 0 || this.closed[b] === gen) continue;
        const dx = this.nodeX[b]! - this.nodeX[a]!;
        const dz = this.nodeZ[b]! - this.nodeZ[a]!;
        const dy = this.nodeY[b]! - this.nodeY[a]!;
        const tentative = ga + Math.sqrt(dx * dx + dz * dz + dy * dy);
        if (this.visited[b] !== gen || tentative < this.gScore[b]!) {
          this.visited[b] = gen;
          this.gScore[b] = tentative;
          this.fScore[b] = tentative + h(b);
          this.parent[b] = a;
          this.push(b);
        }
      }
    }
    return null;
  }

  private reconstruct(goal: number): number[] {
    const out: number[] = [];
    for (let n = goal; n >= 0; n = this.parent[n]!) out.push(n);
    out.reverse();
    return out;
  }

  /** Suavizado por "tirar de la cuerda": se queda con los nodos donde cambia la línea recta. */
  smooth(path: number[]): number[] {
    if (path.length <= 2) return path.slice();
    const out = [path[0]!];
    let anchor = 0;
    while (anchor < path.length - 1) {
      let far = anchor + 1;
      for (let k = path.length - 1; k > anchor + 1; k--) {
        if (this.lineWalkable(path[anchor]!, path[k]!)) {
          far = k;
          break;
        }
      }
      out.push(path[far]!);
      anchor = far;
    }
    return out;
  }

  // --- heap binario mínimo por fScore ---
  private push(n: number): void {
    let i = this.heapSize++;
    this.heap[i] = n;
    const f = this.fScore[n]!;
    while (i > 0) {
      const p = (i - 1) >> 1;
      const pn = this.heap[p]!;
      if (this.fScore[pn]! <= f) break;
      this.heap[i] = pn;
      i = p;
    }
    this.heap[i] = n;
  }

  private pop(): number {
    const top = this.heap[0]!;
    const last = this.heap[--this.heapSize]!;
    if (this.heapSize > 0) {
      let i = 0;
      const f = this.fScore[last]!;
      for (;;) {
        const l = i * 2 + 1;
        const r = l + 1;
        if (l >= this.heapSize) break;
        let c = l;
        if (r < this.heapSize && this.fScore[this.heap[r]!]! < this.fScore[this.heap[l]!]!) c = r;
        if (this.fScore[this.heap[c]!]! >= f) break;
        this.heap[i] = this.heap[c]!;
        i = c;
      }
      this.heap[i] = last;
    }
    return top;
  }

  /** Posición de un nodo. */
  pos(n: number, out: Vector3): Vector3 {
    return out.set(this.nodeX[n]!, this.nodeY[n]!, this.nodeZ[n]!);
  }

  /** Tamaño de cada componente conexa (diagnóstico). */
  componentSizes(): Map<number, number> {
    const m = new Map<number, number>();
    for (let i = 0; i < this.nodeCount; i++) m.set(this.comp[i]!, (m.get(this.comp[i]!) ?? 0) + 1);
    return m;
  }
}

function makeSolid(ob: OrientedBox): Solid {
  // AABB en XZ de la caja orientada.
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      for (const sz of [-1, 1]) {
        _p.set(ob.half.x * sx, ob.half.y * sy, ob.half.z * sz).applyQuaternion(ob.quat).add(ob.center);
        minX = Math.min(minX, _p.x);
        maxX = Math.max(maxX, _p.x);
        minZ = Math.min(minZ, _p.z);
        maxZ = Math.max(maxZ, _p.z);
      }
    }
  }
  return { ob, inv: ob.quat.clone().invert(), minX, maxX, minZ, maxZ };
}

/** ¿(x, z) está sobre la huella de la caja? (para superficies caminables). */
function footprintContains(s: Solid, x: number, z: number): boolean {
  _p.set(x - s.ob.center.x, 0, z - s.ob.center.z).applyQuaternion(s.inv);
  return Math.abs(_p.x) <= s.ob.half.x && Math.abs(_p.z) <= s.ob.half.z;
}

/** ¿El punto está dentro de la caja inflada `r` en su plano local XZ? */
function insideInflated(s: Solid, x: number, y: number, z: number, r: number): boolean {
  _p.set(x - s.ob.center.x, y - s.ob.center.y, z - s.ob.center.z).applyQuaternion(s.inv);
  return Math.abs(_p.x) <= s.ob.half.x + r && Math.abs(_p.y) <= s.ob.half.y && Math.abs(_p.z) <= s.ob.half.z + r;
}
