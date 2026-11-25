import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Float32BufferAttribute,
  Fog,
  Group,
  HemisphereLight,
  type Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  PointLight,
  type Scene,
  SphereGeometry,
  TorusGeometry,
  Uint32BufferAttribute,
  Vector3,
} from 'three';
import type { PhysicsWorld } from '../physics/Physics';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { EMISSIVE_HDR, getLevelMaterial, getNeonMaterial, texScaleOf } from '../render/materials';
import { createSkyline } from '../render/sky';
import { createSignTexture } from '../render/textures';
import { boxToOriented, buildLevelPhysics, type OrientedBox, rampToOriented } from './levelPhysics';
import type { DecorDef, DecorProp, LevelData, MaterialId } from './types';

export type { OrientedBox } from './levelPhysics';

/** Materiales de los muebles y objetos de decorado (`buildProp`), que no salen de las cajas del nivel. */
const PROP_MATERIALS: readonly MaterialId[] = ['brass', 'gold', 'leather', 'metal', 'metalDark'];

/** Todos los materiales que usará un nivel: los de sus cajas y rampas, y los de los muebles. */
export function levelMaterials(data: LevelData): Set<MaterialId> {
  const out = new Set<MaterialId>(PROP_MATERIALS);
  for (const b of data.boxes) out.add(b.mat);
  for (const r of data.ramps) out.add(r.mat);
  return out;
}

const FACES: ReadonlyArray<{ n: readonly [number, number, number]; u: readonly [number, number, number]; v: readonly [number, number, number] }> = [
  { n: [1, 0, 0], u: [0, 1, 0], v: [0, 0, 1] },
  { n: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0] },
  { n: [0, 1, 0], u: [0, 0, 1], v: [1, 0, 0] },
  { n: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] },
  { n: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
  { n: [0, 0, -1], u: [0, 1, 0], v: [1, 0, 0] },
];
const CORNERS: ReadonlyArray<readonly [number, number]> = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
];

/** Chaflán de las aristas de las cajas del nivel (m): atrapa la luz como un canto real. Solo el dibujo; la física no cambia. */
const CHAMFER = 0.03;

const AXES = [0, 1, 2] as const;
const SIGNS = [1, -1] as const;

/** Acumula cajas en una geometría fusionada con UV en metros (mundo). */
export class GeoAccumulator {
  private readonly pos: number[] = [];
  private readonly nor: number[] = [];
  private readonly uv: number[] = [];
  private readonly idx: number[] = [];
  private verts = 0;
  private readonly tmpL = new Vector3();
  private readonly tmpN = new Vector3();
  private readonly loc = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];
  private readonly ln = new Vector3();
  private readonly e1 = new Vector3();
  private readonly e2 = new Vector3();

  appendBox(ob: OrientedBox, texScale: number, chamfer = 0): void {
    const h = ob.half;
    const c = Math.min(chamfer, 0.3 * Math.min(h.x, h.y, h.z));
    if (c < 0.004) {
      this.appendPlainBox(ob, texScale);
      return;
    }
    const hv = [h.x, h.y, h.z];
    const iv = [h.x - c, h.y - c, h.z - c];
    const [p0, p1, p2, p3] = this.loc as [Vector3, Vector3, Vector3, Vector3];
    // Caras, encogidas por el chaflán.
    for (const a of AXES) {
      const b = (a + 1) % 3;
      const k = (a + 2) % 3;
      for (const s of SIGNS) {
        p0.setComponent(a, s * hv[a]!)
          .setComponent(b, -iv[b]!)
          .setComponent(k, -iv[k]!);
        p1.setComponent(a, s * hv[a]!)
          .setComponent(b, iv[b]!)
          .setComponent(k, -iv[k]!);
        p2.setComponent(a, s * hv[a]!)
          .setComponent(b, iv[b]!)
          .setComponent(k, iv[k]!);
        p3.setComponent(a, s * hv[a]!)
          .setComponent(b, -iv[b]!)
          .setComponent(k, iv[k]!);
        this.ln.set(0, 0, 0).setComponent(a, s);
        this.quad(ob, texScale);
      }
    }
    // Aristas: una tira a 45° entre cada par de caras.
    for (const a of AXES) {
      const b = (a + 1) % 3;
      const k = (a + 2) % 3;
      for (const sa of SIGNS) {
        for (const sb of SIGNS) {
          p0.setComponent(a, sa * hv[a]!)
            .setComponent(b, sb * iv[b]!)
            .setComponent(k, -iv[k]!);
          p1.setComponent(a, sa * hv[a]!)
            .setComponent(b, sb * iv[b]!)
            .setComponent(k, iv[k]!);
          p2.setComponent(a, sa * iv[a]!)
            .setComponent(b, sb * hv[b]!)
            .setComponent(k, iv[k]!);
          p3.setComponent(a, sa * iv[a]!)
            .setComponent(b, sb * hv[b]!)
            .setComponent(k, -iv[k]!);
          this.ln.set(0, 0, 0).setComponent(a, sa).setComponent(b, sb).normalize();
          this.quad(ob, texScale);
        }
      }
    }
    // Esquinas: un triángulo que cierra las tres tiras.
    for (const sx of SIGNS) {
      for (const sy of SIGNS) {
        for (const sz of SIGNS) {
          p0.set(sx * hv[0]!, sy * iv[1]!, sz * iv[2]!);
          p1.set(sx * iv[0]!, sy * hv[1]!, sz * iv[2]!);
          p2.set(sx * iv[0]!, sy * iv[1]!, sz * hv[2]!);
          this.ln.set(sx, sy, sz).normalize();
          this.tri(ob, texScale);
        }
      }
    }
  }

  /** Coloca un vértice (local → mundo) con la normal de su pieza y UV en metros según hacia dónde mira. */
  private vertex(local: Vector3, ob: OrientedBox, texScale: number): void {
    const wn = this.tmpN;
    const p = this.tmpL.copy(local).applyQuaternion(ob.quat).add(ob.center);
    this.pos.push(p.x, p.y, p.z);
    this.nor.push(wn.x, wn.y, wn.z);
    if (Math.abs(wn.y) > 0.7) this.uv.push(p.x / texScale, p.z / texScale);
    else {
      const l = Math.hypot(wn.z, wn.x) || 1;
      this.uv.push((p.x * wn.z - p.z * wn.x) / l / texScale, p.y / texScale);
    }
  }

  /** ¿Los vértices locales a, b, c giran al revés respecto a la normal local? */
  private flipped(a: Vector3, b: Vector3, c: Vector3): boolean {
    return this.e1.subVectors(b, a).cross(this.e2.subVectors(c, a)).dot(this.ln) < 0;
  }

  private quad(ob: OrientedBox, texScale: number): void {
    const [p0, p1, p2, p3] = this.loc as [Vector3, Vector3, Vector3, Vector3];
    this.tmpN.copy(this.ln).applyQuaternion(ob.quat);
    const flip = this.flipped(p0, p1, p2);
    for (const p of flip ? [p0, p3, p2, p1] : [p0, p1, p2, p3]) this.vertex(p, ob, texScale);
    const v = this.verts;
    this.idx.push(v, v + 1, v + 2, v, v + 2, v + 3);
    this.verts += 4;
  }

  private tri(ob: OrientedBox, texScale: number): void {
    const [p0, p1, p2] = this.loc as [Vector3, Vector3, Vector3];
    this.tmpN.copy(this.ln).applyQuaternion(ob.quat);
    const flip = this.flipped(p0, p1, p2);
    for (const p of flip ? [p0, p2, p1] : [p0, p1, p2]) this.vertex(p, ob, texScale);
    const v = this.verts;
    this.idx.push(v, v + 1, v + 2);
    this.verts += 3;
  }

  private appendPlainBox(ob: OrientedBox, texScale: number): void {
    const h = ob.half;
    for (const f of FACES) {
      const hn = Math.abs(f.n[0]) * h.x + Math.abs(f.n[1]) * h.y + Math.abs(f.n[2]) * h.z;
      const hu = Math.abs(f.u[0]) * h.x + Math.abs(f.u[1]) * h.y + Math.abs(f.u[2]) * h.z;
      const hv = Math.abs(f.v[0]) * h.x + Math.abs(f.v[1]) * h.y + Math.abs(f.v[2]) * h.z;
      this.tmpN.set(f.n[0], f.n[1], f.n[2]).applyQuaternion(ob.quat);
      const wn = this.tmpN;
      let tx = 0;
      let tz = 0;
      const top = Math.abs(wn.y) > 0.7;
      if (!top) {
        const l = Math.hypot(wn.z, wn.x) || 1;
        tx = wn.z / l;
        tz = -wn.x / l;
      }
      for (const [su, sv] of CORNERS) {
        this.tmpL
          .set(
            f.n[0] * hn + f.u[0] * su * hu + f.v[0] * sv * hv,
            f.n[1] * hn + f.u[1] * su * hu + f.v[1] * sv * hv,
            f.n[2] * hn + f.u[2] * su * hu + f.v[2] * sv * hv,
          )
          .applyQuaternion(ob.quat)
          .add(ob.center);
        const p = this.tmpL;
        this.pos.push(p.x, p.y, p.z);
        this.nor.push(wn.x, wn.y, wn.z);
        if (top) this.uv.push(p.x / texScale, p.z / texScale);
        else this.uv.push((p.x * tx + p.z * tz) / texScale, p.y / texScale);
      }
      const b = this.verts;
      this.idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
      this.verts += 4;
    }
  }

  get empty(): boolean {
    return this.verts === 0;
  }

  build(): BufferGeometry {
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    g.setAttribute('uv', new Float32BufferAttribute(this.uv, 2));
    g.setIndex(new Uint32BufferAttribute(this.idx, 1));
    g.computeBoundingBox();
    g.computeBoundingSphere();
    return g;
  }
}

export interface LevelRuntime {
  data: LevelData;
  root: Group;
  hemi: HemisphereLight;
  ambient: AmbientLight;
  key: DirectionalLight;
  points: PointLight[];
  alarmLights: PointLight[];
  /** En los niveles que no caben en el mapa de sombras, lo centra en lo que se está viendo. */
  followShadow(at: Vector3): void;
  /** Todas las cajas orientadas del nivel (cobertura, vault, QA). */
  solids: OrientedBox[];
  dispose(): void;
}

/**
 * Las sombras se encienden y apagan con el preset (`renderer.shadowMap.enabled`): el nivel marca siempre qué
 * proyecta y recibe sombra, así que cambiar de calidad en caliente no espera a otro nivel.
 */
export interface BuildOptions {
  shadowMapSize: number;
}

/**
 * Tamaño de celda para agrupar la geometría estática. Los niveles miden 50–115 m: con celdas
 * de 40 m hay pocas draw calls por material y aún se descartan zonas fuera de cámara.
 */
const CELL = 40;
/** Hasta cuántas cajas de un material van juntas sin partirse por zonas. */
const SPARSE = 14;
/** A qué distancia de lo que ilumina se pone la luz principal (m). */
const SHADOW_DISTANCE = 60;

export function buildLevel(data: LevelData, scene: Scene, physics: PhysicsWorld, opts: BuildOptions): LevelRuntime {
  const root = new Group();
  root.name = `level:${data.id}`;
  const disposables: Array<{ dispose(): void }> = [];
  // Colliders desde la MISMA fuente que los meshes (R4).
  const solids: OrientedBox[] = buildLevelPhysics(data, physics);

  // --- Geometría estática fusionada + colliders desde la MISMA fuente (R4) ---
  const groups = new Map<string, { mat: MaterialId; cast: boolean; acc: GeoAccumulator }>();
  // Lo que hay poco de un material va en una sola malla: partirlo por zonas solo sumaría draw calls.
  const counts = new Map<string, number>();
  for (const b of data.boxes) {
    if (b.invisible) continue;
    const k = `${b.mat}|${b.shadow ?? true}`;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const accFor = (mat: MaterialId, cast: boolean, cx: number, cz: number): GeoAccumulator => {
    const cell = (counts.get(`${mat}|${cast}`) ?? 0) > SPARSE ? `${Math.round(cx / CELL)},${Math.round(cz / CELL)}` : '';
    const key = `${mat}|${cast}|${cell}`;
    let g = groups.get(key);
    if (!g) {
      g = { mat, cast, acc: new GeoAccumulator() };
      groups.set(key, g);
    }
    return g.acc;
  };

  for (const b of data.boxes) {
    if (b.invisible) continue; // solo collider (NPC, barreras)
    const ob = boxToOriented(b);
    accFor(b.mat, b.shadow ?? true, ob.center.x, ob.center.z).appendBox(ob, texScaleOf(b.mat), CHAMFER);
  }
  for (const r of data.ramps) {
    const ob = rampToOriented(r);
    accFor(r.mat, true, ob.center.x, ob.center.z).appendBox(ob, texScaleOf(r.mat), CHAMFER);
  }
  for (const g of groups.values()) {
    if (g.acc.empty) continue;
    const geo = g.acc.build();
    disposables.push(geo);
    const mesh = new Mesh(geo, getLevelMaterial(g.mat));
    mesh.castShadow = g.cast;
    mesh.receiveShadow = true;
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    mesh.name = `static:${g.mat}`;
    root.add(mesh);
  }

  // --- Luces (R1: piso de luz ambiental obligatorio) ---
  const a = data.ambient;
  const hemi = new HemisphereLight(a.sky, a.ground, a.hemi);
  const ambient = new AmbientLight(a.ambientColor, a.ambient);
  root.add(hemi, ambient);

  const k = data.key;
  const key = new DirectionalLight(k.color, k.intensity);
  const kd = new Vector3(k.dir[0], k.dir[1], k.dir[2]).normalize();
  const cx = (data.bounds.min[0] + data.bounds.max[0]) / 2;
  const cz = (data.bounds.min[2] + data.bounds.max[2]) / 2;
  key.target.position.set(cx, 0, cz);
  key.position.set(cx + kd.x * SHADOW_DISTANCE, kd.y * SHADOW_DISTANCE, cz + kd.z * SHADOW_DISTANCE);
  key.castShadow = k.shadow;
  if (key.castShadow) {
    key.shadow.mapSize.set(opts.shadowMapSize, opts.shadowMapSize);
    const cam = key.shadow.camera;
    cam.left = -k.shadowArea;
    cam.right = k.shadowArea;
    cam.top = k.shadowArea;
    cam.bottom = -k.shadowArea;
    cam.near = 1;
    cam.far = 160;
    key.shadow.bias = -0.0006;
    key.shadow.normalBias = 0.03;
  }
  root.add(key, key.target);
  const followShadow = shadowFollower(key, kd, Math.max(data.bounds.max[0] - data.bounds.min[0], data.bounds.max[2] - data.bounds.min[2]) / 2, k.shadowArea);
  // La luz se libera con el nivel: su mapa de sombras es una textura de la GPU que nadie más suelta.
  disposables.push(key);

  const points: PointLight[] = [];
  const alarmLights: PointLight[] = [];
  for (const l of data.lights) {
    const p = new PointLight(l.color, l.alarm ? 0 : l.intensity, l.distance, 2);
    p.position.set(l.pos[0], l.pos[1], l.pos[2]);
    p.castShadow = false; // R7: nunca sombras de point lights.
    p.userData.baseIntensity = l.intensity;
    (l.alarm ? alarmLights : points).push(p);
    root.add(p);
  }

  // --- Decoración (sin colisión) ---
  const neonAcc = new Map<string, GeoAccumulator>();
  const props: Group[] = [];
  const propCtx: PropContext = { leaves: null, disposables };
  for (const d of data.decor) buildDecor(d, root, neonAcc, props, propCtx);
  mergeProps(props, root, disposables);
  for (const [k2, acc] of neonAcc) {
    const [color, intensity] = k2.split(':').map(Number) as [number, number];
    const geo = acc.build();
    disposables.push(geo);
    const mesh = new Mesh(geo, getNeonMaterial(color, intensity));
    mesh.name = 'neon';
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    root.add(mesh);
  }

  // --- Entorno ---
  if (a.skyline) {
    const sky = createSkyline(cx, cz, a.skyline.y, a.fog?.color ?? a.background);
    disposables.push(sky);
    root.add(sky.mesh);
  }
  scene.background = new Color(a.background);
  scene.fog = a.fog ? new Fog(a.fog.color, a.fog.near, a.fog.far) : null;
  scene.environmentIntensity = a.ibl;
  scene.add(root);
  // Todo el nivel es estático: se calculan sus matrices una vez y el grafo no lo recorre cada frame.
  root.updateMatrixWorld(true);
  root.traverse((o) => {
    o.matrixAutoUpdate = false;
  });
  root.matrixWorldAutoUpdate = false;

  return {
    data,
    root,
    hemi,
    ambient,
    key,
    points,
    alarmLights,
    followShadow,
    solids,
    dispose(): void {
      scene.remove(root);
      for (const d of disposables) d.dispose();
      root.clear();
    },
  };
}

/**
 * Mueve el mapa de sombras con `at`, a saltos de un texel (así los bordes de las sombras no tiemblan al andar). Si el nivel
 * cabe entero, se queda quieto.
 */
function shadowFollower(key: DirectionalLight, dir: Vector3, levelHalf: number, area: number): (at: Vector3) => void {
  if (!key.castShadow || levelHalf <= area) return () => {};
  const right = new Vector3().crossVectors(new Vector3(0, 1, 0), dir).normalize();
  const up = new Vector3().crossVectors(dir, right);
  return (at) => {
    const texel = (2 * area) / key.shadow.mapSize.x;
    const a = Math.round(at.dot(right) / texel) * texel;
    const b = Math.round(at.dot(up) / texel) * texel;
    const t = key.target.position;
    t.copy(dir).multiplyScalar(at.dot(dir)).addScaledVector(right, a).addScaledVector(up, b);
    key.position.copy(t).addScaledVector(dir, SHADOW_DISTANCE);
    // El grafo del nivel es estático: sus matrices no se recalculan solas.
    for (const o of [key, key.target]) {
      o.updateMatrix();
      o.matrixWorld.copy(o.matrix);
    }
  };
}

function buildDecor(d: DecorDef, root: Group, neonAcc: Map<string, GeoAccumulator>, props: Group[], ctx: PropContext): void {
  const disposables = ctx.disposables;
  switch (d.kind) {
    case 'neon': {
      const key = `${d.color}:${d.intensity ?? 1.6}`;
      let acc = neonAcc.get(key);
      if (!acc) {
        acc = new GeoAccumulator();
        neonAcc.set(key, acc);
      }
      acc.appendBox(boxToOriented({ c: d.c, s: d.s, rotY: d.rotY ?? 0, mat: 'metal' }), 1);
      return;
    }
    case 'sign': {
      const tex = createSignTexture(d.w, d.h, { text: d.text, sub: d.sub, color: d.color, bg: d.bg, font: d.font ?? 'sans' });
      const mat = new MeshBasicMaterial({ map: tex, transparent: d.bg === undefined, toneMapped: false });
      // Los carteles luminosos (sin placa de fondo) van en HDR para que el bloom los recoja.
      mat.color.setScalar((d.glow ?? 1) * (d.bg === undefined ? EMISSIVE_HDR * 0.9 : 1));
      const geo = new PlaneGeometry(d.w, d.h);
      const mesh = new Mesh(geo, mat);
      mesh.position.set(d.c[0], d.c[1], d.c[2]);
      mesh.rotation.y = d.rotY;
      mesh.name = `sign:${d.text}`;
      disposables.push(geo, mat, tex);
      root.add(mesh);
      return;
    }
    case 'prop':
      props.push(buildProp(d, ctx));
      return;
  }
}

interface PropContext {
  /** Material de hojas compartido por todas las plantas del nivel. */
  leaves: MeshStandardMaterial | null;
  disposables: Array<{ dispose(): void }>;
}

/**
 * Todos los props del nivel se fusionan en UNA malla por material (eran decenas de mallas
 * sueltas: un taburete doble son 8, una lámpara de araña 12). Son estáticos y sin sombra.
 */
function mergeProps(props: Group[], root: Group, disposables: Array<{ dispose(): void }>): void {
  const byMat = new Map<Material, BufferGeometry[]>();
  for (const g of props) {
    g.updateMatrixWorld(true);
    for (const c of g.children) {
      const m = c as Mesh;
      const mat = m.material as Material;
      const geo = m.geometry.clone().applyMatrix4(m.matrixWorld);
      const list = byMat.get(mat);
      if (list) list.push(geo);
      else byMat.set(mat, [geo]);
      m.geometry.dispose();
    }
  }
  for (const [mat, geos] of byMat) {
    const merged = mergeGeometries(geos, false);
    for (const g of geos) g.dispose();
    if (!merged) throw new Error('LevelBuilder: no se pudieron fusionar los props');
    merged.computeBoundingSphere();
    disposables.push(merged);
    const mesh = new Mesh(merged, mat);
    mesh.name = 'props';
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    root.add(mesh);
  }
}

/** Props decorativos procedurales (sin colisión: si bloquean, se declaran como cajas). */
function buildProp(d: DecorProp, ctx: PropContext): Group {
  const disposables = ctx.disposables;
  const g = new Group();
  g.position.set(d.c[0], d.c[1], d.c[2]);
  g.rotation.y = d.rotY ?? 0;
  g.scale.setScalar(d.scale ?? 1);
  const add = (geo: BufferGeometry, mat: MeshStandardMaterial | MeshBasicMaterial, x: number, y: number, z: number): Mesh => {
    disposables.push(geo);
    const m = new Mesh(geo, mat);
    m.position.set(x, y, z);
    g.add(m);
    return m;
  };
  switch (d.prop) {
    case 'plant': {
      add(new CylinderGeometry(0.28, 0.22, 0.55, 10), getLevelMaterial('brass'), 0, 0.275, 0);
      if (!ctx.leaves) {
        ctx.leaves = new MeshStandardMaterial({ color: 0x2f6b3c, roughness: 0.8 });
        disposables.push(ctx.leaves);
      }
      const leaves = ctx.leaves;
      add(new SphereGeometry(0.45, 8, 6), leaves, 0, 0.95, 0);
      add(new SphereGeometry(0.32, 8, 6), leaves, 0.18, 1.3, 0.05);
      break;
    }
    case 'lampDesk': {
      add(new CylinderGeometry(0.08, 0.1, 0.04, 12), getLevelMaterial('brass'), 0, 0.02, 0);
      add(new CylinderGeometry(0.015, 0.015, 0.35, 6), getLevelMaterial('brass'), 0, 0.2, 0);
      add(new CylinderGeometry(0.06, 0.13, 0.12, 12, 1, true), getNeonMaterial(0x7dffb0, 1.2), 0, 0.4, 0);
      break;
    }
    case 'chandelier': {
      add(new TorusGeometry(1.1, 0.05, 8, 32), getLevelMaterial('gold'), 0, 0, 0).rotation.x = Math.PI / 2;
      for (let i = 0; i < 10; i++) {
        const ang = (i / 10) * Math.PI * 2;
        // Bombillas apenas por encima del umbral del bloom: brillan sin halo.
        add(new SphereGeometry(0.07, 8, 6), getNeonMaterial(0xffe2a8, 0.75), Math.cos(ang) * 1.1, -0.12, Math.sin(ang) * 1.1);
      }
      add(new CylinderGeometry(0.02, 0.02, 1.4, 6), getLevelMaterial('gold'), 0, 0.7, 0);
      break;
    }
    case 'barStools': {
      for (let i = 0; i < 4; i++) {
        add(new CylinderGeometry(0.2, 0.2, 0.08, 12), getLevelMaterial('leather'), i * 0.9, 0.75, 0);
        add(new CylinderGeometry(0.03, 0.05, 0.72, 6), getLevelMaterial('metal'), i * 0.9, 0.36, 0);
      }
      break;
    }
    case 'speaker': {
      add(new BoxGeometry(0.8, 1.6, 0.6), getLevelMaterial('metalDark'), 0, 0.8, 0);
      add(new CylinderGeometry(0.25, 0.25, 0.05, 16), getNeonMaterial(0x19e3ff, 1.2), 0, 0.5, 0.31).rotation.x = Math.PI / 2;
      add(new CylinderGeometry(0.15, 0.15, 0.05, 16), getNeonMaterial(0xff2e88, 1.2), 0, 1.15, 0.31).rotation.x = Math.PI / 2;
      break;
    }
    case 'rotor': {
      add(new BoxGeometry(9, 0.06, 0.35), getLevelMaterial('metalDark'), 0, 0, 0);
      add(new BoxGeometry(0.35, 0.06, 9), getLevelMaterial('metalDark'), 0, 0, 0);
      break;
    }
    case 'waterTower': {
      add(new CylinderGeometry(1.6, 1.6, 2.6, 14), getLevelMaterial('woodDark'), 0, 3.6, 0);
      add(new CylinderGeometry(0.1, 0.1, 2.4, 6), getLevelMaterial('metalDark'), 1, 1.2, 1);
      add(new CylinderGeometry(0.1, 0.1, 2.4, 6), getLevelMaterial('metalDark'), -1, 1.2, 1);
      add(new CylinderGeometry(0.1, 0.1, 2.4, 6), getLevelMaterial('metalDark'), 1, 1.2, -1);
      add(new CylinderGeometry(0.1, 0.1, 2.4, 6), getLevelMaterial('metalDark'), -1, 1.2, -1);
      break;
    }
    case 'antenna': {
      add(new CylinderGeometry(0.06, 0.12, 8, 6), getLevelMaterial('metal'), 0, 4, 0);
      add(new SphereGeometry(0.15, 8, 6), getNeonMaterial(0xff3344, 2.5), 0, 8.1, 0);
      break;
    }
    case 'car': {
      // Ruedas, faros y pilotos: la carrocería son las cajas de `car()`.
      const tire = getLevelMaterial('leather');
      const rim = getLevelMaterial('metal');
      for (const [x, z] of [
        [-1.45, -0.86],
        [1.45, -0.86],
        [-1.45, 0.86],
        [1.45, 0.86],
      ] as const) {
        add(new CylinderGeometry(0.37, 0.37, 0.28, 18), tire, x, 0.37, z).rotation.x = Math.PI / 2;
        add(new CylinderGeometry(0.2, 0.2, 0.3, 12), rim, x, 0.37, z).rotation.x = Math.PI / 2;
      }
      for (const z of [-0.68, 0.68]) {
        add(new BoxGeometry(0.04, 0.14, 0.36), getNeonMaterial(0xfff2d8, 1.1), 2.31, 0.82, z);
        add(new BoxGeometry(0.04, 0.1, 0.4), getNeonMaterial(0xff3344, 1.1), -2.31, 0.9, z);
      }
      add(new BoxGeometry(4.5, 0.05, 1.97), rim, 0, 0.42, 0);
      break;
    }
    case 'helicopter': {
      // Morro hacia +X. La cabina y la cola chocan con cajas invisibles del nivel.
      const body = getLevelMaterial('metalDark');
      const glass = getLevelMaterial('tilesBlack');
      add(new SphereGeometry(1, 24, 14), body, 0, 1.75, 0).scale.set(2.5, 1.15, 1.15);
      add(new SphereGeometry(1, 20, 12), glass, 0.95, 1.85, 0).scale.set(1.62, 0.9, 1.02);
      add(new CylinderGeometry(0.42, 0.16, 5, 14), body, -4.4, 2.05, 0).rotation.z = Math.PI / 2;
      add(new BoxGeometry(0.9, 1.5, 0.12), body, -6.8, 2.6, 0);
      add(new CylinderGeometry(0.75, 0.75, 0.04, 20), getLevelMaterial('metal'), -6.75, 2.5, 0.16).rotation.x = Math.PI / 2;
      add(new CylinderGeometry(0.22, 0.3, 0.7, 10), body, 0, 3.05, 0);
      add(new BoxGeometry(10.4, 0.05, 0.3), glass, 0, 3.42, 0);
      add(new BoxGeometry(0.3, 0.05, 10.4), glass, 0, 3.42, 0);
      for (const z of [-0.95, 0.95]) {
        add(new CylinderGeometry(0.06, 0.06, 4.2, 8), body, 0, 0.12, z).rotation.z = Math.PI / 2;
        add(new CylinderGeometry(0.05, 0.05, 0.9, 6), body, 1, 0.5, z * 0.92);
        add(new CylinderGeometry(0.05, 0.05, 0.9, 6), body, -1, 0.5, z * 0.92);
      }
      add(new SphereGeometry(0.1, 8, 6), getNeonMaterial(0xff3344, 2), -6.8, 3.4, 0);
      add(new SphereGeometry(0.09, 8, 6), getNeonMaterial(0x3ddc84, 2), 0.2, 0.95, 1.1);
      break;
    }
    case 'crane': {
      add(new BoxGeometry(1.2, 18, 1.2), getLevelMaterial('containerYellow'), 0, 9, 0);
      add(new BoxGeometry(22, 1, 1), getLevelMaterial('containerYellow'), 6, 18, 0);
      add(new BoxGeometry(0.1, 10, 0.1), getLevelMaterial('metalDark'), 14, 13, 0);
      break;
    }
  }
  for (const c of g.children) {
    (c as Mesh).castShadow = false;
  }
  return g;
}
