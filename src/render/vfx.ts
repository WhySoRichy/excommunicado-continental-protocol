import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DynamicDrawUsage,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  PointLight,
  Points,
  PointsMaterial,
  Quaternion,
  type Scene,
  SpriteMaterial,
  SRGBColorSpace,
  Vector3,
} from 'three';
import type { Vec3Like } from '../physics/Physics';

/**
 * Efectos visuales con POOLS de tamaño fijo (cero asignaciones por frame, R7):
 * trazadoras (instanced), partículas (Points), decals (instanced), fogonazos.
 * La luz del fogonazo del jugador existe siempre (intensidad 0): el número de luces
 * nunca cambia en runtime, así que no hay recompilación de shaders.
 */
const MAX_TRACERS = 64;
const MAX_DECALS = 128;
const MAX_FLASHES = 10;

const _m = new Matrix4();
const _q = new Quaternion();
const _s = new Vector3();
const _p = new Vector3();
const _d = new Vector3();
const _z = new Vector3(0, 0, 1);
const _c = new Color();
const HIDE = new Matrix4().makeScale(0, 0, 0);

export type ImpactKind = 'spark' | 'blood' | 'dust';

export class Vfx {
  private readonly tracers: InstancedMesh;
  private readonly tracerLife = new Float32Array(MAX_TRACERS);
  private readonly tracerColor: Color[] = [];
  private tracerNext = 0;

  private readonly points: Points;
  private readonly pPos: Float32Array;
  private readonly pCol: Float32Array;
  private readonly pVel: Float32Array;
  private readonly pLife: Float32Array;
  private readonly maxParticles: number;
  private pNext = 0;

  private readonly decals: InstancedMesh;
  private decalNext = 0;

  private readonly flashes: Mesh[] = [];
  private readonly flashLife = new Float32Array(MAX_FLASHES);
  private flashNext = 0;
  readonly playerLight: PointLight;
  private playerLightLife = 0;

  constructor(private readonly scene: Scene, particleScale: number) {
    // Trazadoras: caja unitaria escalada a lo largo de Z.
    const tgeo = new BoxGeometry(1, 1, 1);
    const tmat = new MeshBasicMaterial({ color: 0xffffff, blending: AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false });
    this.tracers = new InstancedMesh(tgeo, tmat, MAX_TRACERS);
    this.tracers.instanceMatrix.setUsage(DynamicDrawUsage);
    this.tracers.frustumCulled = false;
    for (let i = 0; i < MAX_TRACERS; i++) {
      this.tracers.setMatrixAt(i, HIDE);
      this.tracers.setColorAt(i, _c.setRGB(0, 0, 0));
      this.tracerColor.push(new Color());
    }
    this.tracers.renderOrder = 10;
    scene.add(this.tracers);

    // Partículas.
    this.maxParticles = Math.max(64, Math.round(420 * particleScale));
    const n = this.maxParticles;
    this.pPos = new Float32Array(n * 3).fill(-9999);
    this.pCol = new Float32Array(n * 3);
    this.pVel = new Float32Array(n * 3);
    this.pLife = new Float32Array(n);
    const pgeo = new BufferGeometry();
    pgeo.setAttribute('position', new BufferAttribute(this.pPos, 3).setUsage(DynamicDrawUsage));
    pgeo.setAttribute('color', new BufferAttribute(this.pCol, 3).setUsage(DynamicDrawUsage));
    const pmat = new PointsMaterial({ size: 0.07, vertexColors: true, transparent: true, depthWrite: false, sizeAttenuation: true, toneMapped: false });
    this.points = new Points(pgeo, pmat);
    this.points.frustumCulled = false;
    scene.add(this.points);

    // Decals de impacto.
    const dgeo = new PlaneGeometry(0.09, 0.09);
    const dmat = new MeshBasicMaterial({ color: 0x0b0b0c, transparent: true, opacity: 0.85, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    this.decals = new InstancedMesh(dgeo, dmat, MAX_DECALS);
    this.decals.instanceMatrix.setUsage(DynamicDrawUsage);
    this.decals.frustumCulled = false;
    for (let i = 0; i < MAX_DECALS; i++) this.decals.setMatrixAt(i, HIDE);
    scene.add(this.decals);

    // Fogonazos (dos planos cruzados aditivos).
    const fmat = new MeshBasicMaterial({ color: new Color(0xffd08a).multiplyScalar(3), blending: AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false });
    const fgeo = new PlaneGeometry(0.32, 0.32);
    for (let i = 0; i < MAX_FLASHES; i++) {
      const f = new Mesh(fgeo, fmat);
      const g = new Mesh(fgeo, fmat);
      g.rotation.y = Math.PI / 2;
      f.add(g);
      f.visible = false;
      this.flashes.push(f);
      scene.add(f);
    }
    this.playerLight = new PointLight(0xffc477, 0, 9, 2);
    scene.add(this.playerLight);
  }

  /** Trazadora de `from` a `to`. */
  tracer(from: Vec3Like, to: Vec3Like, color: number, width = 0.022): void {
    const i = this.tracerNext;
    this.tracerNext = (this.tracerNext + 1) % MAX_TRACERS;
    _d.set(to.x - from.x, to.y - from.y, to.z - from.z);
    const len = _d.length();
    if (len < 0.05) return;
    _d.multiplyScalar(1 / len);
    _q.setFromUnitVectors(_z, _d);
    _p.set((from.x + to.x) / 2, (from.y + to.y) / 2, (from.z + to.z) / 2);
    _s.set(width, width, len);
    _m.compose(_p, _q, _s);
    this.tracers.setMatrixAt(i, _m);
    this.tracerColor[i]!.set(color);
    this.tracers.setColorAt(i, this.tracerColor[i]!);
    this.tracerLife[i] = 0.07;
    this.tracers.instanceMatrix.needsUpdate = true;
    if (this.tracers.instanceColor) this.tracers.instanceColor.needsUpdate = true;
  }

  impact(point: Vec3Like, normal: Vec3Like, kind: ImpactKind, count = 7): void {
    const base = kind === 'blood' ? 0x9b1c22 : kind === 'spark' ? 0xffcf6b : 0x9a958c;
    _c.set(base);
    const speed = kind === 'spark' ? 4.5 : kind === 'blood' ? 2.2 : 1.6;
    for (let k = 0; k < count; k++) {
      const i = this.pNext;
      this.pNext = (this.pNext + 1) % this.maxParticles;
      const j = i * 3;
      this.pPos[j] = point.x + normal.x * 0.02;
      this.pPos[j + 1] = point.y + normal.y * 0.02;
      this.pPos[j + 2] = point.z + normal.z * 0.02;
      // Dirección: normal + dispersión pseudoaleatoria determinista (barata).
      const a = (k * 2.399 + this.pNext * 0.37) % (Math.PI * 2);
      const r = 0.6 + ((k * 7) % 5) * 0.1;
      this.pVel[j] = (normal.x + Math.cos(a) * r) * speed;
      this.pVel[j + 1] = (normal.y + 0.5 + Math.sin(a) * r * 0.5) * speed;
      this.pVel[j + 2] = (normal.z + Math.sin(a) * r) * speed;
      this.pCol[j] = _c.r;
      this.pCol[j + 1] = _c.g;
      this.pCol[j + 2] = _c.b;
      this.pLife[i] = kind === 'spark' ? 0.25 : 0.45;
    }
  }

  decal(point: Vec3Like, normal: Vec3Like): void {
    const i = this.decalNext;
    this.decalNext = (this.decalNext + 1) % MAX_DECALS;
    _d.set(normal.x, normal.y, normal.z).normalize();
    _q.setFromUnitVectors(_z, _d);
    _p.set(point.x + _d.x * 0.006, point.y + _d.y * 0.006, point.z + _d.z * 0.006);
    _s.set(1, 1, 1);
    _m.compose(_p, _q, _s);
    this.decals.setMatrixAt(i, _m);
    this.decals.instanceMatrix.needsUpdate = true;
  }

  /** Fogonazo en `pos` mirando a `dir`. `player` enciende también la luz compartida. */
  muzzle(pos: Vec3Like, dir: Vec3Like, player: boolean): void {
    const f = this.flashes[this.flashNext]!;
    this.flashLife[this.flashNext] = 0.045;
    this.flashNext = (this.flashNext + 1) % MAX_FLASHES;
    f.position.set(pos.x, pos.y, pos.z);
    _d.set(dir.x, dir.y, dir.z);
    f.quaternion.setFromUnitVectors(_z, _d.normalize());
    f.rotation.z = Math.random() * Math.PI;
    f.visible = true;
    if (player) {
      this.playerLight.position.set(pos.x, pos.y, pos.z);
      this.playerLight.intensity = 6;
      this.playerLightLife = 0.05;
    }
  }

  update(dt: number): void {
    // Trazadoras: se apagan al terminar su vida.
    let tDirty = false;
    for (let i = 0; i < MAX_TRACERS; i++) {
      if (this.tracerLife[i]! <= 0) continue;
      this.tracerLife[i]! -= dt;
      tDirty = true;
      if (this.tracerLife[i]! <= 0) {
        this.tracers.setMatrixAt(i, HIDE);
      } else {
        const k = this.tracerLife[i]! / 0.07;
        _c.copy(this.tracerColor[i]!).multiplyScalar(k * 1.6);
        this.tracers.setColorAt(i, _c);
      }
    }
    if (tDirty) {
      this.tracers.instanceMatrix.needsUpdate = true;
      if (this.tracers.instanceColor) this.tracers.instanceColor.needsUpdate = true;
    }
    // Partículas.
    let pDirty = false;
    for (let i = 0; i < this.maxParticles; i++) {
      if (this.pLife[i]! <= 0) continue;
      pDirty = true;
      const j = i * 3;
      this.pLife[i]! -= dt;
      if (this.pLife[i]! <= 0) {
        this.pPos[j + 1] = -9999;
        continue;
      }
      this.pVel[j + 1]! -= 9.8 * dt;
      this.pPos[j]! += this.pVel[j]! * dt;
      this.pPos[j + 1]! += this.pVel[j + 1]! * dt;
      this.pPos[j + 2]! += this.pVel[j + 2]! * dt;
    }
    if (pDirty) {
      const g = this.points.geometry;
      (g.getAttribute('position') as BufferAttribute).needsUpdate = true;
      (g.getAttribute('color') as BufferAttribute).needsUpdate = true;
    }
    for (let i = 0; i < MAX_FLASHES; i++) {
      if (this.flashLife[i]! <= 0) continue;
      this.flashLife[i]! -= dt;
      if (this.flashLife[i]! <= 0) this.flashes[i]!.visible = false;
    }
    if (this.playerLightLife > 0) {
      this.playerLightLife -= dt;
      if (this.playerLightLife <= 0) this.playerLight.intensity = 0;
    }
  }

  dispose(): void {
    this.scene.remove(this.tracers, this.points, this.decals, this.playerLight, ...this.flashes);
    this.tracers.geometry.dispose();
    this.points.geometry.dispose();
    this.decals.geometry.dispose();
  }
}

/** Texturas de iconos de alerta (compartidas): "?" amarillo y "!" rojo. */
const iconMats = new Map<string, SpriteMaterial>();

export function alertIconMaterial(kind: 'suspicious' | 'alert'): SpriteMaterial {
  const hit = iconMats.get(kind);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D no disponible');
  const color = kind === 'alert' ? '#ff3344' : '#ffd23f';
  ctx.fillStyle = 'rgba(10,10,12,0.75)';
  ctx.beginPath();
  ctx.arc(32, 32, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = 'bold 40px system-ui, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(kind === 'alert' ? '!' : '?', 32, 35);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  const m = new SpriteMaterial({ map: t, depthTest: false, depthWrite: false, transparent: true, toneMapped: false });
  iconMats.set(kind, m);
  return m;
}
