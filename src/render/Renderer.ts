import {
  NeutralToneMapping,
  PCFShadowMap,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { clamp } from '../core/math';
import { setMaxAnisotropy } from './textures';

export type QualityPreset = 'low' | 'medium' | 'high';

export interface QualitySettings {
  /** Tope del devicePixelRatio. */
  pixelRatioCap: number;
  /** Escala base de resolución (antes de la dinámica). */
  baseScale: number;
  shadows: boolean;
  shadowMapSize: number;
  bloom: boolean;
  antialias: boolean;
  /** Multiplicador de partículas de VFX. */
  particles: number;
}

export const QUALITY: Record<QualityPreset, QualitySettings> = {
  low: { pixelRatioCap: 1, baseScale: 0.75, shadows: false, shadowMapSize: 512, bloom: false, antialias: false, particles: 0.5 },
  medium: { pixelRatioCap: 1.25, baseScale: 1, shadows: true, shadowMapSize: 1024, bloom: false, antialias: true, particles: 1 },
  high: { pixelRatioCap: 1.75, baseScale: 1, shadows: true, shadowMapSize: 2048, bloom: true, antialias: true, particles: 1 },
};

/** Límites de la resolución dinámica. */
const DYN_MIN = 0.6;
const DYN_MAX = 1;
const DYN_TARGET_MS = 1000 / 58;

export class GameRenderer {
  readonly renderer: WebGLRenderer;
  readonly scene = new Scene();
  readonly camera = new PerspectiveCamera(68, 1, 0.05, 400);
  readonly canvas: HTMLCanvasElement;
  preset: QualityPreset;
  dynamicResolution = true;
  dynamicScale = 1;
  private composer: EffectComposer | null = null;
  private bloomPass: UnrealBloomPass | null = null;
  private bloomEnabled = false;
  private readonly container: HTMLElement;
  private slowTime = 0;
  private fastTime = 0;
  private brightness = 1;

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

    this.canvas = r.domElement;
    this.canvas.id = 'game-canvas';
    this.canvas.setAttribute('aria-label', 'Vista del juego');
    container.appendChild(this.canvas);

    // IBL tenue (R1): ningún metal ni superficie queda negra por falta de entorno.
    const pmrem = new PMREMGenerator(r);
    const env = new RoomEnvironment();
    this.scene.environment = pmrem.fromScene(env, 0.04).texture;
    env.dispose();
    pmrem.dispose();

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
    this.setBloom(q.bloom);
    this.dynamicScale = 1;
    this.resize();
  }

  setBloom(on: boolean): void {
    this.bloomEnabled = on;
    if (on && !this.composer) {
      const size = this.renderer.getSize(new Vector2());
      this.composer = new EffectComposer(this.renderer);
      this.composer.addPass(new RenderPass(this.scene, this.camera));
      // Bloom moderado: umbral alto para que solo brillen neones y fogonazos (nunca lava la imagen).
      this.bloomPass = new UnrealBloomPass(size, 0.45, 0.35, 0.85);
      this.composer.addPass(this.bloomPass);
      this.composer.addPass(new OutputPass());
      this.resize();
    }
  }

  get bloomActive(): boolean {
    return this.bloomEnabled;
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
    return Math.min(window.devicePixelRatio || 1, q.pixelRatioCap) * q.baseScale * (this.dynamicResolution ? this.dynamicScale : 1);
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
    if (avgFrameMs > DYN_TARGET_MS * 1.08) {
      this.slowTime += dt;
      this.fastTime = 0;
      if (this.slowTime > 2 && this.dynamicScale > DYN_MIN) {
        this.dynamicScale = clamp(this.dynamicScale - 0.1, DYN_MIN, DYN_MAX);
        this.slowTime = 0;
        this.resize();
      }
    } else if (avgFrameMs < DYN_TARGET_MS * 0.8) {
      this.fastTime += dt;
      this.slowTime = 0;
      if (this.fastTime > 4 && this.dynamicScale < DYN_MAX) {
        this.dynamicScale = clamp(this.dynamicScale + 0.1, DYN_MIN, DYN_MAX);
        this.fastTime = 0;
        this.resize();
      }
    } else {
      this.slowTime = 0;
      this.fastTime = 0;
    }
  }

  render(): void {
    this.renderer.info.reset();
    if (this.bloomEnabled && this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }

  /** Precompila los shaders del nivel para evitar tirones al ver un material por primera vez. */
  prewarm(): void {
    this.renderer.compile(this.scene, this.camera);
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
    this.composer?.dispose();
    this.renderer.dispose();
  }
}
