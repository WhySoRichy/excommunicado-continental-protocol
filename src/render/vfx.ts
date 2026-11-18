import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  DynamicDrawUsage,
  Euler,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  PointLight,
  Points,
  PointsMaterial,
  Quaternion,
  type Scene,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Vector3,
} from 'three';
import type { Vec3Like } from '../physics/Physics';
import { type TracerSpan, tracerSpan } from './tracerPath';

/**
 * Efectos visuales con POOLS de tamaño fijo (cero asignaciones por frame, R7):
 * trazadoras (instanced), partículas (Points), decals (instanced), fogonazos.
 * La luz del fogonazo del jugador existe siempre (intensidad 0): el número de luces
 * nunca cambia en runtime, así que no hay recompilación de shaders.
 */
const MAX_TRACERS = 64;
const MAX_DECALS = 128;
const MAX_FLASHES = 10;
const MAX_SMOKE = 8;
/** Vida de una voluta de humo (s). */
const SMOKE_LIFE = 0.7;
/** Trazadoras: velocidad visual (m/s) y largo del destello (m). El disparo es instantáneo; esto solo se ve. */
const TRACER_SPEED = 420;
const TRACER_LEN = 1.6;
/** Casquillos de latón: cuántos a la vez y cuánto duran (caen, rebotan y se quedan un momento en el suelo). */
const MAX_CASINGS = 24;
const CASING_LIFE = 1.6;

const _m = new Matrix4();
const _q = new Quaternion();
const _s = new Vector3();
const _p = new Vector3();
const _d = new Vector3();
const _z = new Vector3(0, 0, 1);
const _c = new Color();
const _e = new Euler();
const _span: TracerSpan = { head: 0, tail: 0, done: false };
const HIDE = new Matrix4().makeScale(0, 0, 0);

export type ImpactKind = 'spark' | 'blood' | 'dust';

export class Vfx {
  private readonly tracers: InstancedMesh;
  private readonly tracerLife = new Float32Array(MAX_TRACERS);
  private readonly tracerColor: Color[] = [];
  private tracerNext = 0;
  private readonly tracerFrom = new Float32Array(MAX_TRACERS * 3);
  private readonly tracerDir = new Float32Array(MAX_TRACERS * 3);
  private readonly tracerDist = new Float32Array(MAX_TRACERS);
  private readonly tracerAge = new Float32Array(MAX_TRACERS);
  private readonly tracerWidth = new Float32Array(MAX_TRACERS);

  private readonly casings: InstancedMesh;
  private readonly cPos = new Float32Array(MAX_CASINGS * 3);
  private readonly cVel = new Float32Array(MAX_CASINGS * 3);
  private readonly cRot = new Float32Array(MAX_CASINGS * 3);
  private readonly cSpin = new Float32Array(MAX_CASINGS * 3);
  private readonly cLife = new Float32Array(MAX_CASINGS);
  private readonly cFloor = new Float32Array(MAX_CASINGS);
  private casingNext = 0;
  private readonly flashTex: CanvasTexture[];

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

  private readonly smoke: Sprite[] = [];
  private readonly smokeLife = new Float32Array(MAX_SMOKE);
  private readonly smokeVel: Vector3[] = [];
  private readonly smokeTex: CanvasTexture;
  private smokeNext = 0;

  constructor(
    private readonly scene: Scene,
    particleScale: number,
  ) {
    // Trazadoras: caja unitaria escalada a lo largo de Z y afilada hacia la cola (la cabeza va delante, en +Z).
    const tgeo = new BoxGeometry(1, 1, 1);
    const tp = tgeo.getAttribute('position');
    for (let i = 0; i < tp.count; i++) if (tp.getZ(i) < 0) tp.setXY(i, tp.getX(i) * 0.2, tp.getY(i) * 0.2);
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

    // Fogonazos: estrella de frente y llamarada que se abre hacia delante vista de lado.
    this.flashTex = [flashTexture('star'), flashTexture('flame')];
    const flashColor = new Color(0xffd08a).multiplyScalar(3);
    const fmat = new MeshBasicMaterial({
      map: this.flashTex[0],
      color: flashColor,
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      side: DoubleSide,
    });
    const smat = new MeshBasicMaterial({
      map: this.flashTex[1],
      color: flashColor,
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      side: DoubleSide,
    });
    const fgeo = new PlaneGeometry(0.3, 0.3);
    const sgeo = new PlaneGeometry(0.42, 0.2);
    for (let i = 0; i < MAX_FLASHES; i++) {
      const f = new Mesh(fgeo, fmat);
      const g = new Mesh(sgeo, smat);
      g.rotation.y = -Math.PI / 2;
      g.position.z = 0.17;
      f.add(g);
      f.visible = false;
      this.flashes.push(f);
      scene.add(f);
    }
    this.playerLight = new PointLight(0xffc477, 0, 9, 2);
    scene.add(this.playerLight);

    // Casquillos de latón (instanciados): giran, rebotan en el suelo y desaparecen encogiéndose.
    this.casings = new InstancedMesh(
      new BoxGeometry(0.011, 0.011, 0.026),
      new MeshStandardMaterial({ color: 0xc9a14a, metalness: 0.5, roughness: 0.35 }),
      MAX_CASINGS,
    );
    this.casings.instanceMatrix.setUsage(DynamicDrawUsage);
    this.casings.frustumCulled = false;
    for (let i = 0; i < MAX_CASINGS; i++) this.casings.setMatrixAt(i, HIDE);
    scene.add(this.casings);

    // Humo de la boca del arma: sprites suaves que crecen, suben y se desvanecen.
    this.smokeTex = smokeTexture();
    for (let i = 0; i < MAX_SMOKE; i++) {
      const sp = new Sprite(new SpriteMaterial({ map: this.smokeTex, color: 0xcfcac2, transparent: true, opacity: 0, depthWrite: false }));
      sp.visible = false;
      sp.renderOrder = 9;
      this.smoke.push(sp);
      this.smokeVel.push(new Vector3());
      scene.add(sp);
    }
  }

  /** Trazadora de `from` a `to`: un destello que viaja como una bala hasta el impacto. */
  tracer(from: Vec3Like, to: Vec3Like, color: number, width = 0.022): void {
    _d.set(to.x - from.x, to.y - from.y, to.z - from.z);
    const len = _d.length();
    if (len < 0.05) return;
    _d.multiplyScalar(1 / len);
    const i = this.tracerNext;
    this.tracerNext = (this.tracerNext + 1) % MAX_TRACERS;
    const j = i * 3;
    this.tracerFrom[j] = from.x;
    this.tracerFrom[j + 1] = from.y;
    this.tracerFrom[j + 2] = from.z;
    this.tracerDir[j] = _d.x;
    this.tracerDir[j + 1] = _d.y;
    this.tracerDir[j + 2] = _d.z;
    this.tracerDist[i] = len;
    this.tracerAge[i] = 0;
    this.tracerWidth[i] = width;
    this.tracerLife[i] = 1;
    this.tracerColor[i]!.set(color);
    this.placeTracer(i);
    this.tracers.instanceMatrix.needsUpdate = true;
    if (this.tracers.instanceColor) this.tracers.instanceColor.needsUpdate = true;
  }

  /** Coloca la trazadora `i` según su edad: el tramo entre la cola y la cabeza avanza por el recorrido. */
  private placeTracer(i: number): boolean {
    const j = i * 3;
    const dist = this.tracerDist[i]!;
    const { head, tail, done } = tracerSpan(this.tracerAge[i]!, dist, TRACER_SPEED, TRACER_LEN, _span);
    if (done) {
      this.tracers.setMatrixAt(i, HIDE);
      return false;
    }
    _d.fromArray(this.tracerDir, j);
    _q.setFromUnitVectors(_z, _d);
    const mid = (head + tail) / 2;
    _p.set(this.tracerFrom[j]! + _d.x * mid, this.tracerFrom[j + 1]! + _d.y * mid, this.tracerFrom[j + 2]! + _d.z * mid);
    const w = this.tracerWidth[i]!;
    _s.set(w, w, Math.max(0.05, head - tail));
    _m.compose(_p, _q, _s);
    this.tracers.setMatrixAt(i, _m);
    // Brillo en HDR (lo recoge el bloom): intenso al salir del cañón y algo más tenue al llegar.
    _c.copy(this.tracerColor[i]!).multiplyScalar(2.2 - 1.0 * (head / dist));
    this.tracers.setColorAt(i, _c);
    return true;
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

  /** Casquillo de latón: sale despedido hacia la derecha del arma girando, rebota en el suelo (`floorY`) y se queda. */
  casing(pos: Vec3Like, dir: Vec3Like, floorY = pos.y - 1.4): void {
    const i = this.casingNext;
    this.casingNext = (this.casingNext + 1) % MAX_CASINGS;
    const j = i * 3;
    // Derecha = dir × arriba (en el plano horizontal).
    const l = Math.hypot(dir.x, dir.z) || 1;
    const rx = -dir.z / l;
    const rz = dir.x / l;
    const jitter = 0.8 + ((this.casingNext * 7) % 5) * 0.1;
    this.cPos[j] = pos.x - dir.x * 0.12;
    this.cPos[j + 1] = pos.y + 0.02;
    this.cPos[j + 2] = pos.z - dir.z * 0.12;
    this.cVel[j] = rx * 2.2 * jitter - dir.x * 0.4;
    this.cVel[j + 1] = 2.6 * jitter;
    this.cVel[j + 2] = rz * 2.2 * jitter - dir.z * 0.4;
    this.cRot[j] = 0;
    this.cRot[j + 1] = Math.atan2(dir.x, dir.z);
    this.cRot[j + 2] = 0;
    this.cSpin[j] = 14 * jitter;
    this.cSpin[j + 1] = 3;
    this.cSpin[j + 2] = 9;
    this.cFloor[i] = floorY;
    this.cLife[i] = CASING_LIFE;
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
    // Voluta de humo que sale hacia delante y se frena.
    const n = this.smokeNext;
    this.smokeNext = (n + 1) % MAX_SMOKE;
    const sp = this.smoke[n]!;
    sp.position.set(pos.x + dir.x * 0.08, pos.y + dir.y * 0.08, pos.z + dir.z * 0.08);
    sp.scale.setScalar(0.12);
    sp.material.opacity = 0.5;
    sp.material.rotation = n * 1.7;
    sp.visible = true;
    this.smokeVel[n]!.set(dir.x, dir.y, dir.z).multiplyScalar(2.2);
    this.smokeLife[n] = SMOKE_LIFE;
  }

  update(dt: number): void {
    // Trazadoras: avanzan hasta el impacto y se apagan al llegar.
    let tDirty = false;
    for (let i = 0; i < MAX_TRACERS; i++) {
      if (this.tracerLife[i]! <= 0) continue;
      tDirty = true;
      this.tracerAge[i]! += dt;
      if (!this.placeTracer(i)) this.tracerLife[i] = 0;
    }
    // Casquillos: caen girando, rebotan una vez y se quedan tumbados hasta desaparecer.
    let cDirty = false;
    for (let i = 0; i < MAX_CASINGS; i++) {
      if (this.cLife[i]! <= 0) continue;
      cDirty = true;
      this.cLife[i]! -= dt;
      if (this.cLife[i]! <= 0) {
        this.casings.setMatrixAt(i, HIDE);
        continue;
      }
      const j = i * 3;
      const floor = this.cFloor[i]! + 0.006;
      this.cVel[j + 1]! -= 9.8 * dt;
      for (let k = 0; k < 3; k++) {
        this.cPos[j + k]! += this.cVel[j + k]! * dt;
        this.cRot[j + k]! += this.cSpin[j + k]! * dt;
      }
      if (this.cPos[j + 1]! < floor) {
        this.cPos[j + 1] = floor;
        const vy = this.cVel[j + 1]!;
        const bounce = vy < -0.8;
        const keep = bounce ? 0.45 : 0;
        this.cVel[j + 1] = bounce ? -vy * 0.3 : 0;
        this.cVel[j]! *= keep;
        this.cVel[j + 2]! *= keep;
        for (let k = 0; k < 3; k++) this.cSpin[j + k]! *= bounce ? 0.4 : 0;
        if (!bounce) {
          this.cRot[j] = 0;
          this.cRot[j + 2] = 0;
        }
      }
      _e.set(this.cRot[j]!, this.cRot[j + 1]!, this.cRot[j + 2]!);
      _q.setFromEuler(_e);
      _s.setScalar(Math.min(1, this.cLife[i]! / 0.25));
      _p.fromArray(this.cPos, j);
      _m.compose(_p, _q, _s);
      this.casings.setMatrixAt(i, _m);
    }
    if (cDirty) this.casings.instanceMatrix.needsUpdate = true;
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
    for (let i = 0; i < MAX_SMOKE; i++) {
      if (this.smokeLife[i]! <= 0) continue;
      this.smokeLife[i]! -= dt;
      const sp = this.smoke[i]!;
      if (this.smokeLife[i]! <= 0) {
        sp.visible = false;
        continue;
      }
      const k = 1 - this.smokeLife[i]! / SMOKE_LIFE;
      const v = this.smokeVel[i]!;
      v.multiplyScalar(Math.exp(-5 * dt));
      sp.position.addScaledVector(v, dt);
      sp.position.y += 0.45 * dt;
      sp.scale.setScalar(0.12 + 0.5 * Math.sqrt(k));
      sp.material.opacity = 0.5 * (1 - k);
    }
    if (this.playerLightLife > 0) {
      this.playerLightLife -= dt;
      if (this.playerLightLife <= 0) this.playerLight.intensity = 0;
    }
  }

  /** Trazadoras y casquillos activos (QA: vuelven a cero poco después de dejar de disparar). */
  get activeEffects(): { tracers: number; casings: number } {
    let tracers = 0;
    for (let i = 0; i < MAX_TRACERS; i++) if (this.tracerLife[i]! > 0) tracers++;
    let casings = 0;
    for (let i = 0; i < MAX_CASINGS; i++) if (this.cLife[i]! > 0) casings++;
    return { tracers, casings };
  }

  dispose(): void {
    for (const sp of this.smoke) {
      this.scene.remove(sp);
      sp.material.dispose();
    }
    this.smokeTex.dispose();
    this.scene.remove(this.tracers, this.points, this.decals, this.playerLight, ...this.flashes);
    this.tracers.geometry.dispose();
    this.points.geometry.dispose();
    this.decals.geometry.dispose();
    this.scene.remove(this.casings);
    this.casings.geometry.dispose();
    (this.casings.material as MeshStandardMaterial).dispose();
    for (const t of this.flashTex) t.dispose();
  }
}

/** Texturas de iconos de alerta (compartidas): "?" amarillo y "!" rojo. */
/** Mancha radial suave para el humo. */
function smokeTexture(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D no disponible');
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 31);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.45)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new CanvasTexture(c);
}

/** Fogonazo: estrella de cinco puntas (de frente) o llamarada que se abre hacia delante (de lado), con núcleo brillante. */
function flashTexture(kind: 'star' | 'flame'): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D no disponible');
  ctx.translate(32, 32);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  if (kind === 'star') {
    for (let k = 0; k < 10; k++) {
      const r = k % 2 === 0 ? 31 : 8;
      const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
  } else {
    // Nace en la boca del arma (borde izquierdo) y se abre hacia delante en dos lenguas.
    ctx.moveTo(-31, 0);
    ctx.quadraticCurveTo(0, -18, 31, -5);
    ctx.lineTo(22, 0);
    ctx.lineTo(31, 5);
    ctx.quadraticCurveTo(0, 18, -31, 0);
  }
  ctx.closePath();
  ctx.fill();
  const cx = kind === 'star' ? 0 : -14;
  const g = ctx.createRadialGradient(cx, 0, 0, cx, 0, 16);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(-32, -32, 64, 64);
  return new CanvasTexture(c);
}

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
