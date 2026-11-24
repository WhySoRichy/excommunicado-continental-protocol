import {
  DirectionalLight,
  HalfFloatType,
  NeutralToneMapping,
  PCFShadowMap,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  type SkinnedMesh,
  SRGBColorSpace,
  Texture,
  Vector2,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { DynamicResolution } from './dynamicResolution';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { clamp } from '../core/math';
import { AmbientOcclusionPass } from './ambientOcclusion';
import { setMaterialDetail } from './materials';
import { setMaxAnisotropy } from './textures';
import { setWeaponEnvironment } from './weaponMaterial';

/** Las texturas que puede llevar un material. */
const MAPS = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap', 'alphaMap', 'bumpMap', 'lightMap'] as const;

export type QualityPreset = 'low' | 'medium' | 'high';

export interface QualitySettings {
  /** Tope del devicePixelRatio. */
  pixelRatioCap: number;
  /** Escala base de resolución (antes de la dinámica). */
  baseScale: number;
  shadows: boolean;
  shadowMapSize: number;
  /** Posprocesado: bloom de neones y fogonazos más viñeta. */
  bloom: boolean;
  antialias: boolean;
  /** Multiplicador de partículas de VFX. */
  particles: number;
  /** Cada cuántos frames se regenera el mapa de sombras (2 = a 30 Hz con 60 FPS). */
  shadowInterval: number;
  /** Oclusión ambiental (necesita el posprocesado del bloom). */
  ao: boolean;
  /** Relieve y rugosidad de las texturas fotoescaneadas (sin él, solo su color). */
  materialDetail: boolean;
  /** Hasta qué distancia (m) los personajes se dibujan con su malla detallada. */
  characterDetail: number;
}

export const QUALITY: Record<QualityPreset, QualitySettings> = {
  low: {
    pixelRatioCap: 1,
    baseScale: 0.75,
    shadows: false,
    shadowMapSize: 512,
    bloom: false,
    antialias: false,
    particles: 0.5,
    shadowInterval: 1,
    ao: false,
    materialDetail: false,
    characterDetail: 5,
  },
  // Medio: la sombra (el mayor coste de CPU tras las draw calls) se regenera en frames alternos.
  medium: {
    pixelRatioCap: 1.25,
    baseScale: 1,
    shadows: true,
    shadowMapSize: 1024,
    bloom: true,
    antialias: true,
    particles: 1,
    shadowInterval: 2,
    ao: false,
    materialDetail: true,
    characterDetail: 8,
  },
  high: {
    pixelRatioCap: 1.75,
    baseScale: 1,
    shadows: true,
    shadowMapSize: 2048,
    bloom: true,
    antialias: true,
    particles: 1,
    shadowInterval: 1,
    ao: true,
    materialDetail: true,
    characterDetail: 12,
  },
};

/** Oscurecimiento máximo de las esquinas (0 = sin viñeta). */
const VIGNETTE = 0.42;

/** Añade la viñeta al shader de salida, antes del mapeo de tonos. Devuelve null si el shader cambió. */
function withVignette(fragment: string): string | null {
  const decl = 'uniform sampler2D tDiffuse;';
  const read = 'gl_FragColor = texture2D( tDiffuse, vUv );';
  if (!fragment.includes(decl) || !fragment.includes(read)) return null;
  return fragment
    .replace(decl, `${decl}\nuniform float vignette;`)
    .replace(
      read,
      `${read}\n\t\t\tvec2 vd = ( vUv - 0.5 ) * vec2( 1.0, 0.8 );\n\t\t\tgl_FragColor.rgb *= 1.0 - vignette * smoothstep( 0.32, 0.82, length( vd ) );`,
    );
}

/** Umbral del bloom sobre el canal más alto (lineal, antes del mapeo de tonos). */
const BLOOM_THRESHOLD = 1.4;

/**
 * El filtro de paso alto original mide la luminancia: un neón magenta o rojo puro apenas la supera
 * y un suelo pulido con brillo especular la revienta. Aquí se mide el canal más alto y se acota la
 * entrada, de modo que brillan los emisores y nunca se lava una superficie entera.
 */
function tuneHighPass(fragment: string): string | null {
  const read = 'vec4 texel = texture2D( tDiffuse, vUv );';
  const lum = 'float v = luminance( texel.xyz );';
  if (!fragment.includes(read) || !fragment.includes(lum)) return null;
  return fragment.replace(read, `${read}\n\t\t\ttexel.rgb = min( texel.rgb, vec3( 4.0 ) );`).replace(lum, 'float v = max( texel.r, max( texel.g, texel.b ) );');
}

export class GameRenderer {
  readonly renderer: WebGLRenderer;
  readonly scene = new Scene();
  readonly camera = new PerspectiveCamera(68, 1, 0.05, 400);
  readonly canvas: HTMLCanvasElement;
  preset: QualityPreset;
  dynamicResolution = true;
  /** Controlador de la resolución dinámica (lógica pura en `dynamicResolution.ts`). */
  readonly dyn = new DynamicResolution();
  private composer: EffectComposer | null = null;

  private bloomEnabled = false;
  private readonly container: HTMLElement;
  private brightness = 1;
  private envTarget: WebGLRenderTarget | null = null;
  /** Avisos de pérdida y recuperación del contexto WebGL (Game pausa y muestra un aviso). */
  onContextLost: (() => void) | null = null;
  onContextRestored: (() => void) | null = null;
  private frameNo = 0;

  constructor(container: HTMLElement, preset: QualityPreset) {
    this.container = container;
    this.preset = preset;
    const q = QUALITY[preset];
    this.renderer = new WebGLRenderer({
      antialias: q.antialias,
      powerPreference: 'high-performance',
      stencil: false,
      alpha: false,
    });
    const r = this.renderer;
    r.outputColorSpace = SRGBColorSpace;
    r.toneMapping = NeutralToneMapping;
    r.toneMappingExposure = 1;
    r.shadowMap.enabled = q.shadows;
    r.shadowMap.type = PCFShadowMap;
    r.info.autoReset = false;
    setMaxAnisotropy(r.capabilities.getMaxAnisotropy());
    setMaterialDetail(q.materialDetail);

    this.canvas = r.domElement;
    this.canvas.id = 'game-canvas';
    this.canvas.setAttribute('aria-label', 'Vista del juego');
    container.appendChild(this.canvas);

    this.buildEnvironment();
    // three recupera su propio estado tras perder el contexto (controlador reiniciado, cambio de GPU...),
    // pero lo que solo existía en la GPU, como el entorno PMREM, hay que volver a generarlo.
    this.canvas.addEventListener('webglcontextlost', () => this.onContextLost?.());
    this.canvas.addEventListener('webglcontextrestored', () => {
      this.buildEnvironment();
      this.onContextRestored?.();
    });

    this.setBloom(q.bloom);
    this.resize();
    window.addEventListener('resize', this.resize);
    this.watchDevicePixelRatio();
  }

  get quality(): QualitySettings {
    return QUALITY[this.preset];
  }

  /** Cambia preset en caliente. El antialias MSAA solo cambia al recargar la página. */
  applyPreset(preset: QualityPreset): void {
    this.preset = preset;
    const q = QUALITY[preset];
    this.renderer.shadowMap.enabled = q.shadows;
    this.updateShadowMaps(q);
    setMaterialDetail(q.materialDetail);
    // El compositor se rehace: la oclusión ambiental depende del preset.
    this.disposeComposer();
    this.setBloom(q.bloom);
    this.dyn.reset();
    this.resize();
  }

  /**
   * El nivel marca siempre qué luz proyecta sombra; el preset decide si hay pase de sombras y de qué tamaño.
   * El mapa se libera al cambiar de tamaño o al apagar las sombras, y three lo vuelve a crear en el siguiente render.
   */
  private updateShadowMaps(q: QualitySettings): void {
    this.scene.traverse((o) => {
      if (!(o instanceof DirectionalLight) || !o.castShadow) return;
      if (q.shadows && o.shadow.mapSize.x === q.shadowMapSize) return;
      o.shadow.mapSize.set(q.shadowMapSize, q.shadowMapSize);
      o.shadow.map?.dispose();
      o.shadow.map = null;
    });
  }

  setBloom(on: boolean): void {
    this.bloomEnabled = on;
    // Sin bloom, el compositor y sus destinos (varios del tamaño de la pantalla) no se quedan en la GPU.
    if (!on) this.disposeComposer();
    if (on && !this.composer) {
      const size = this.renderer.getSize(new Vector2());
      // Destino multimuestreado: sin él, el compositor pierde el antialias del canvas.
      const target = new WebGLRenderTarget(Math.max(1, size.x), Math.max(1, size.y), { type: HalfFloatType, samples: this.quality.antialias ? 4 : 0 });
      this.composer = new EffectComposer(this.renderer, target);
      this.composer.addPass(new RenderPass(this.scene, this.camera));
      if (this.quality.ao) this.composer.addPass(new AmbientOcclusionPass(this.scene, this.camera, Math.max(1, size.x), Math.max(1, size.y)));
      // Bloom moderado: el umbral queda por encima de cualquier superficie iluminada, así que solo
      // brillan los emisores en HDR (neones, carteles, fogonazos).
      const bloomPass = new UnrealBloomPass(size, 0.36, 0.45, BLOOM_THRESHOLD);
      const highPass = tuneHighPass(bloomPass.materialHighPassFilter.fragmentShader);
      if (highPass) bloomPass.materialHighPassFilter.fragmentShader = highPass;
      this.composer.addPass(bloomPass);
      const out = new OutputPass();
      const fragment = withVignette(out.material.fragmentShader);
      if (fragment) {
        out.material.fragmentShader = fragment;
        out.uniforms.vignette = { value: VIGNETTE };
      }
      this.composer.addPass(out);
      this.resize();
    }
  }

  /** QA: qué muestra la oclusión ambiental (0 la escena con ella, 4 solo la oclusión, 5 filtrada); false si no hay. */
  setAoOutput(mode: number): boolean {
    const ao = this.composer?.passes.find((p) => p instanceof AmbientOcclusionPass);
    if (!ao) return false;
    ao.output = mode;
    return true;
  }

  private disposeComposer(): void {
    if (!this.composer) return;
    for (const pass of this.composer.passes) pass.dispose();
    this.composer.dispose();
    this.composer = null;
  }

  /** IBL tenue (R1): ningún metal ni superficie queda negra por falta de entorno. */
  private buildEnvironment(): void {
    const pmrem = new PMREMGenerator(this.renderer);
    const env = new RoomEnvironment();
    this.envTarget?.dispose();
    this.envTarget = pmrem.fromScene(env, 0.04);
    this.scene.environment = this.envTarget.texture;
    setWeaponEnvironment(this.envTarget.texture);
    env.dispose();
    pmrem.dispose();
  }

  setExposure(v: number): void {
    this.renderer.toneMappingExposure = clamp(v, 0.4, 2.5);
  }

  /** Brillo/gamma percibido: filtro CSS barato sobre el canvas (no afecta a la lógica). */
  setBrightness(v: number): void {
    this.brightness = clamp(v, 0.6, 1.8);
    this.canvas.style.filter = this.brightness === 1 ? '' : `brightness(${this.brightness})`;
  }

  get pixelRatio(): number {
    const q = this.quality;
    return Math.min(window.devicePixelRatio || 1, q.pixelRatioCap) * q.baseScale * (this.dynamicResolution ? this.dyn.scale : 1);
  }

  private appliedW = 0;
  private appliedH = 0;
  private appliedDpr = 0;

  /**
   * Comprobación barata por frame: si cambió el tamaño del contenedor o el devicePixelRatio
   * (ventana movida a otro monitor, zoom, emulación) se redimensiona aunque no llegue evento.
   */
  checkResize(): void {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    if (w !== this.appliedW || h !== this.appliedH || window.devicePixelRatio !== this.appliedDpr) this.resize();
  }

  readonly resize = (): void => {
    const w = Math.max(1, this.container.clientWidth || window.innerWidth);
    const h = Math.max(1, this.container.clientHeight || window.innerHeight);
    this.appliedW = w;
    this.appliedH = h;
    this.appliedDpr = window.devicePixelRatio;
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(w, h, false);
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.composer) {
      this.composer.setPixelRatio(this.pixelRatio);
      this.composer.setSize(w, h);
    }
  };

  private watchDevicePixelRatio(): void {
    // El cambio de DPI (mover la ventana a otro monitor, zoom) dispara este media query una vez.
    const mq = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    const onChange = (): void => {
      this.resize();
      this.watchDevicePixelRatio();
    };
    mq.addEventListener('change', onChange, { once: true });
  }

  /**
   * Resolución dinámica: si el frame medio supera el objetivo durante 2 s, baja un 10 %;
   * si sobra margen durante 4 s, sube. Cambios escalonados para no oscilar.
   */
  updateDynamicResolution(avgFrameMs: number, dt: number): void {
    if (!this.dynamicResolution) return;
    if (this.dyn.update(avgFrameMs, dt)) this.resize();
  }

  /** Escala de render actual (1 = completa). */
  get dynamicScale(): number {
    return this.dyn.scale;
  }

  render(): void {
    this.renderer.info.reset();
    const sm = this.renderer.shadowMap;
    if (sm.enabled) {
      this.frameNo++;
      sm.autoUpdate = false;
      if (this.frameNo % this.quality.shadowInterval === 0) sm.needsUpdate = true;
    }
    if (this.bloomEnabled && this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }

  /** Precompila los shaders del nivel y sube sus texturas para evitar tirones al ver algo por primera vez. */
  prewarm(): void {
    this.uploadTextures();
    // Con posprocesado la escena se dibuja en el destino del compositor, cuyos programas difieren de
    // los de pantalla (sin mapeo de tonos): se compila contra ese destino para no duplicarlos.
    const target = this.bloomEnabled && this.composer ? this.composer.readBuffer : null;
    this.renderer.setRenderTarget(target);
    this.renderer.compile(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
    // Nivel nuevo: la sombra se regenera en el primer frame aunque toque saltarlo.
    this.renderer.shadowMap.needsUpdate = true;
  }

  /** Sube a la GPU las texturas de todo lo que hay en la escena (también lo que aún no está en cuadro) y los esqueletos. */
  private uploadTextures(): void {
    const seen = new Set<Texture>();
    const upload = (t: unknown): void => {
      if (!(t instanceof Texture) || t.isRenderTargetTexture || seen.has(t)) return;
      seen.add(t);
      this.renderer.initTexture(t);
    };
    this.scene.traverse((o) => {
      const { material, skeleton } = o as Partial<SkinnedMesh>;
      for (const m of Array.isArray(material) ? material : material ? [material] : []) {
        for (const key of MAPS) upload((m as unknown as Record<string, unknown>)[key]);
      }
      if (skeleton) {
        if (!skeleton.boneTexture) skeleton.computeBoneTexture();
        upload(skeleton.boneTexture);
      }
    });
  }

  /**
   * Luminancia media percibida (0..1) del frame actual, calculada en el mismo tick del render
   * (el drawing buffer aún es válido). Solo para QA y el test de visibilidad.
   */
  sampleLuminance(): number {
    this.render();
    const gl = this.renderer.getContext();
    const w = gl.drawingBufferWidth;
    const h = gl.drawingBufferHeight;
    const px = new Uint8Array(w * h * 4);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
    let sum = 0;
    let n = 0;
    // Muestreo en rejilla (cada 4 px) para que sea rápido.
    for (let y = 0; y < h; y += 4) {
      for (let x = 0; x < w; x += 4) {
        const i = (y * w + x) * 4;
        sum += (0.2126 * (px[i] ?? 0) + 0.7152 * (px[i + 1] ?? 0) + 0.0722 * (px[i + 2] ?? 0)) / 255;
        n++;
      }
    }
    return n > 0 ? sum / n : 0;
  }

  gpuInfo(): string {
    const gl = this.renderer.getContext();
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER));
  }

  dispose(): void {
    window.removeEventListener('resize', this.resize);
    this.disposeComposer();
    this.renderer.dispose();
  }
}
