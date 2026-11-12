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

/** Acumula cajas en una geometría fusionada con UV en metros (mundo). */
class GeoAccumulator {
  private readonly pos: number[] = [];
  private readonly nor: number[] = [];
  private readonly uv: number[] = [];
  private readonly idx: number[] = [];
  private verts = 0;
  private readonly tmpL = new Vector3();
  private readonly tmpN = new Vector3();

  appendBox(ob: OrientedBox, texScale: number): void {
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
  /** Todas las cajas orientadas del nivel (cobertura, vault, QA). */
  solids: OrientedBox[];
  dispose(): void;
}

export interface BuildOptions {
  shadows: boolean;
  shadowMapSize: number;
}

/**
 * Tamaño de celda para agrupar la geometría estática. Los niveles miden 50–90 m: con celdas
 * de 40 m hay pocas draw calls por material y aún se descartan zonas fuera de cámara.
 */
const CELL = 40;

export function buildLevel(data: LevelData, scene: Scene, physics: PhysicsWorld, opts: BuildOptions): LevelRuntime {
  const root = new Group();
  root.name = `level:${data.id}`;
  const disposables: Array<{ dispose(): void }> = [];
  // Colliders desde la MISMA fuente que los meshes (R4).
  const solids: OrientedBox[] = buildLevelPhysics(data, physics);

  // --- Geometría estática fusionada + colliders desde la MISMA fuente (R4) ---
  const groups = new Map<string, { mat: MaterialId; cast: boolean; acc: GeoAccumulator }>();
  const accFor = (mat: MaterialId, cast: boolean, cx: number, cz: number): GeoAccumulator => {
    const key = `${mat}|${cast ? 1 : 0}|${Math.floor(cx / CELL)},${Math.floor(cz / CELL)}`;
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
    accFor(b.mat, b.shadow ?? true, ob.center.x, ob.center.z).appendBox(ob, texScaleOf(b.mat));
  }
  for (const r of data.ramps) {
    const ob = rampToOriented(r);
    accFor(r.mat, true, ob.center.x, ob.center.z).appendBox(ob, texScaleOf(r.mat));
  }
  for (const g of groups.values()) {
    if (g.acc.empty) continue;
    const geo = g.acc.build();
    disposables.push(geo);
    const mesh = new Mesh(geo, getLevelMaterial(g.mat));
    mesh.castShadow = opts.shadows && g.cast;
    mesh.receiveShadow = opts.shadows;
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
  key.position.set(cx + kd.x * 60, kd.y * 60, cz + kd.z * 60);
  key.castShadow = opts.shadows && k.shadow;
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
  mergeProps(props, root, opts.shadows, disposables);
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
    solids,
    dispose(): void {
      scene.remove(root);
      for (const d of disposables) d.dispose();
      root.clear();
    },
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
function mergeProps(props: Group[], root: Group, shadows: boolean, disposables: Array<{ dispose(): void }>): void {
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
    mesh.receiveShadow = shadows;
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
        add(new SphereGeometry(0.07, 8, 6), getNeonMaterial(0xffe2a8, 2), Math.cos(ang) * 1.1, -0.12, Math.sin(ang) * 1.1);
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
