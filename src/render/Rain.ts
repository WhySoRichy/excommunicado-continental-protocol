import {
  BufferGeometry,
  Color,
  DataTexture,
  Float32BufferAttribute,
  FloatType,
  LineSegments,
  NearestFilter,
  Points,
  RedFormat,
  type Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
} from 'three';
import { Rng } from '../core/rng';
import type { LevelData } from '../levels/types';
import { createRayHit, type PhysicsWorld, QueryGroups } from '../physics/Physics';

/** Caja de lluvia alrededor de la cámara (m), cuántas gotas y cuántas salpicaduras, y su velocidad de caída (m/s). */
const BOX = new Vector3(26, 15, 26);
const DROPS = 1500;
const SPLASHES = 260;
const FALL = 15;
/** Largo de cada gota (s de caída) y lo que dura una salpicadura (s). */
const STREAK = 0.035;
const SPLASH_TIME = 0.28;
/** Metros por celda del mapa de techos. */
const CELL = 1;
/** Fuera del mapa, o sin nada debajo, llueve hasta aquí (m). */
const NO_ROOF = -50;

const COMMON = /* glsl */ `
  uniform float uTime;
  uniform vec3 uEye;
  uniform vec3 uBox;
  uniform vec2 uWind;
  uniform sampler2D uRoof;
  uniform vec2 uMin;
  uniform vec2 uSize;
  varying float vAlpha;

  /** Altura de lo primero que encuentra una gota al caer aquí. */
  float roofAt(vec2 p) {
    vec2 uv = (p - uMin) / uSize;
    if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return ${NO_ROOF.toFixed(1)};
    return textureLod(uRoof, uv, 0.0).r;
  }
`;

const DROP_VERTEX = /* glsl */ `
  ${COMMON}
  attribute float tip;

  void main() {
    // Cada gota cae en bucle por una caja que acompaña a la cámara.
    float speed = ${FALL.toFixed(1)} * (0.85 + 0.3 * fract(position.x * 37.0 + position.z * 11.0));
    vec3 p = position * uBox;
    p.y -= uTime * speed;
    p.xz += uWind * uTime;
    vec3 corner = uEye - uBox * vec3(0.5, 0.4, 0.5);
    p = mod(p - corner, uBox) + corner;
    if (p.y < roofAt(p.xz)) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      vAlpha = 0.0;
      return;
    }
    p.y += tip * speed * ${STREAK.toFixed(3)};
    p.xz -= uWind * tip * ${STREAK.toFixed(3)};
    float d = distance(p, uEye);
    vAlpha = smoothstep(0.6, 2.5, d) * (1.0 - smoothstep(6.0, 12.5, d)) * (0.35 + 0.65 * tip);
    gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
  }
`;

const SPLASH_VERTEX = /* glsl */ `
  ${COMMON}
  uniform float uScale;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    // Cada una salta en un sitio distinto del suelo en cada vuelta.
    float k = uTime / ${SPLASH_TIME.toFixed(2)} + position.y;
    float turn = floor(k);
    float life = k - turn;
    vec2 r = vec2(hash(vec2(position.x, turn)), hash(vec2(position.z, turn + 7.0)));
    vec2 p = uEye.xz + (r - 0.5) * uBox.xz;
    float y = roofAt(p);
    float d = distance(vec3(p.x, y, p.y), uEye);
    vAlpha = (1.0 - life) * (1.0 - smoothstep(5.0, 12.0, d)) * step(${(NO_ROOF + 1).toFixed(1)}, y);
    vec4 mv = viewMatrix * vec4(p.x, y + 0.02 + 0.05 * life, p.y, 1.0);
    gl_Position = vAlpha > 0.0 ? projectionMatrix * mv : vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = uScale * (0.02 + 0.05 * life) / max(0.1, -mv.z);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;

  void main() {
    #ifdef ROUND
      vec2 c = gl_PointCoord - 0.5;
      float ring = smoothstep(0.5, 0.36, length(c)) * smoothstep(0.1, 0.3, length(c));
      gl_FragColor = vec4(uColor, uOpacity * vAlpha * ring);
    #else
      gl_FragColor = vec4(uColor, uOpacity * vAlpha);
    #endif
  }
`;

/**
 * Lluvia: rayas que caen alrededor de la cámara y salpicaduras donde dan. No llueve bajo techo: al cargar el nivel se mira
 * desde arriba qué hay en cada metro cuadrado y cada gota se apaga al llegar. Dos draw calls, todo en la GPU.
 */
export class Rain {
  private readonly drops: LineSegments;
  private readonly splashes: Points;
  private readonly roof: DataTexture;
  private readonly uniforms;
  private time = 0;

  constructor(
    private readonly scene: Scene,
    physics: PhysicsWorld,
    data: LevelData,
    amount: number,
  ) {
    const b = data.bounds;
    const w = Math.ceil((b.max[0] - b.min[0]) / CELL);
    const h = Math.ceil((b.max[2] - b.min[2]) / CELL);
    this.roof = roofMap(physics, b.min[0], b.min[2], b.max[1] + 20, w, h);
    this.uniforms = {
      uTime: { value: 0 },
      uEye: { value: new Vector3() },
      uBox: { value: BOX },
      uWind: { value: new Vector2(1.4, 0.8) },
      uRoof: { value: this.roof },
      uMin: { value: new Vector2(b.min[0], b.min[2]) },
      uSize: { value: new Vector2(w * CELL, h * CELL) },
      uColor: { value: new Color(0.62, 0.72, 0.9) },
      uOpacity: { value: 0.34 },
      uScale: { value: 1 },
    };
    this.drops = new LineSegments(dropGeometry(Math.round(DROPS * amount)), this.material(DROP_VERTEX, {}));
    this.splashes = new Points(splashGeometry(Math.round(SPLASHES * amount)), this.material(SPLASH_VERTEX, { ROUND: '' }));
    for (const o of [this.drops, this.splashes]) {
      o.frustumCulled = false;
      o.renderOrder = 5;
      scene.add(o);
    }
  }

  private material(vertexShader: string, defines: Record<string, string>): ShaderMaterial {
    return new ShaderMaterial({
      vertexShader,
      fragmentShader: FRAGMENT,
      uniforms: this.uniforms,
      defines,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    });
  }

  /** Cada fotograma: dónde está la cámara y cuántos píxeles mide un metro a un metro de ella. */
  update(eye: Vector3, pixels: number, dt: number): void {
    this.time += dt;
    const u = this.uniforms;
    u.uTime.value = this.time;
    u.uEye.value.copy(eye);
    u.uScale.value = pixels;
  }

  dispose(): void {
    this.scene.remove(this.drops, this.splashes);
    for (const o of [this.drops, this.splashes]) {
      o.geometry.dispose();
      (o.material as ShaderMaterial).dispose();
    }
    this.roof.dispose();
  }
}

/** A qué altura está lo más alto de cada celda. */
function roofMap(physics: PhysicsWorld, minX: number, minZ: number, top: number, w: number, h: number): DataTexture {
  const px = new Float32Array(w * h).fill(NO_ROOF);
  const hit = createRayHit();
  const from = { x: 0, y: top, z: 0 };
  const down = { x: 0, y: -1, z: 0 };
  for (let z = 0; z < h; z++) {
    for (let x = 0; x < w; x++) {
      from.x = minX + (x + 0.5) * CELL;
      from.z = minZ + (z + 0.5) * CELL;
      if (physics.raycast(from, down, top - NO_ROOF, QueryGroups.STATIC, hit)) px[z * w + x] = hit.point.y;
    }
  }
  const t = new DataTexture(px, w, h, RedFormat, FloatType);
  t.minFilter = t.magFilter = NearestFilter;
  t.needsUpdate = true;
  return t;
}

/** Cada gota, dos vértices en el mismo sitio de la caja (0..1): la punta de abajo y la de arriba. */
function dropGeometry(n: number): BufferGeometry {
  const rng = new Rng(91);
  const pos: number[] = [];
  const tip: number[] = [];
  for (let i = 0; i < n; i++) {
    const p = [rng.next(), rng.next(), rng.next()];
    pos.push(...p, ...p);
    tip.push(0, 1);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('tip', new Float32BufferAttribute(tip, 1));
  return g;
}

/** Salpicaduras: solo números al azar; dónde caen lo decide el sombreador. */
function splashGeometry(n: number): BufferGeometry {
  const rng = new Rng(17);
  const pos: number[] = [];
  for (let i = 0; i < n; i++) pos.push(rng.next(), rng.next(), rng.next());
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  return g;
}
